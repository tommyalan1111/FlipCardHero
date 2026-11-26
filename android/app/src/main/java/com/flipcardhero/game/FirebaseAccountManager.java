package com.flipcardhero.game;

import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.EmailAuthProvider;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseAuthInvalidCredentialsException;
import com.google.firebase.auth.FirebaseAuthInvalidUserException;
import com.google.firebase.auth.FirebaseAuthUserCollisionException;
import com.google.firebase.auth.FirebaseAuthWeakPasswordException;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.firestore.DocumentReference;
import com.google.firebase.firestore.DocumentSnapshot;
import com.google.firebase.firestore.FieldValue;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.FirebaseFirestoreException;
import com.google.firebase.firestore.SetOptions;

import org.json.JSONObject;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

/**
 * Signup đơn giản:
 * - Username + password (password do Firebase Auth quản lý).
 * - Username được chuẩn hoá uppercase, kiểm tra trùng case-insensitive
 *   qua collection "usernames" trong Firestore.
 * - Tài khoản đang anonymous (leaderboard) sẽ được link sang tài khoản
 *   username/password để giữ nguyên UID và điểm leaderboard.
 */
public class FirebaseAccountManager {
    private static final String TAG = "FCH_Account";
    private static final String USERS = "users";
    private static final String USERNAMES = "usernames";
    private static final String EMAIL_DOMAIN = "@flipcardhero.app";

    public interface Listener {
        void onAccountState(String json);

        void onAccountError(String code);
    }

    private final Listener listener;
    private final FirebaseAuth auth;
    private final FirebaseFirestore firestore;
    private final boolean available;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());

    public FirebaseAccountManager(Context context, Listener listener) {
        this.listener = listener;

        FirebaseAuth localAuth = null;
        FirebaseFirestore localFirestore = null;
        boolean initialized = false;

        try {
            Context appContext = context.getApplicationContext();
            FirebaseApp.initializeApp(appContext);

            if (!FirebaseApp.getApps(appContext).isEmpty()) {
                localAuth = FirebaseAuth.getInstance();
                localFirestore = FirebaseFirestore.getInstance();
                initialized = true;
            } else {
                Log.w(TAG, "Firebase chưa được cấu hình (thiếu google-services.json)");
            }
        } catch (Throwable t) {
            Log.e(TAG, "Không thể khởi tạo Firebase Account", t);
        }

        this.auth = localAuth;
        this.firestore = localFirestore;
        this.available = initialized;
    }

    public boolean isAvailable() {
        return available;
    }

    /**
     * Kiểm tra trạng thái tài khoản khi mở game.
     * Chờ leaderboard manager đăng nhập Anonymous trước (nếu cần).
     */
    public void checkAccount() {
        if (!available) {
            notifyError("UNAVAILABLE");
            return;
        }

        FirebaseUser current = auth.getCurrentUser();
        if (current != null) {
            handleUser(current);
            return;
        }

        final boolean[] handled = { false };
        final FirebaseAuth.AuthStateListener[] authListener = new FirebaseAuth.AuthStateListener[1];

        authListener[0] = firebaseAuth -> {
            FirebaseUser user = firebaseAuth.getCurrentUser();
            if (user != null && !handled[0]) {
                handled[0] = true;
                auth.removeAuthStateListener(authListener[0]);
                handleUser(user);
            }
        };

        auth.addAuthStateListener(authListener[0]);

        mainHandler.postDelayed(() -> {
            if (!handled[0]) {
                handled[0] = true;
                auth.removeAuthStateListener(authListener[0]);
                notifyError("AUTH_NOT_READY");
            }
        }, 8000);
    }

    public void signUp(String usernameRaw, String password) {
        if (!available) {
            notifyError("UNAVAILABLE");
            return;
        }

        final String username = normalizeUsername(usernameRaw);
        if (username.isEmpty()) {
            notifyError("INVALID_USERNAME");
            return;
        }
        if (password == null || password.length() < 6) {
            notifyError("WEAK_PASSWORD");
            return;
        }

        final FirebaseUser user = auth.getCurrentUser();
        if (user == null) {
            notifyError("AUTH_NOT_READY");
            return;
        }

        final String usernameKey = username.toLowerCase(Locale.ROOT);

        // Kiểm tra trùng trước để tránh tạo auth account với username đã có.
        firestore.collection(USERNAMES)
                .document(usernameKey)
                .get()
                .addOnSuccessListener(document -> {
                    if (document.exists()) {
                        notifyError("USERNAME_TAKEN");
                        return;
                    }

                    if (!user.isAnonymous()) {
                        reserveUsername(user, username);
                        return;
                    }

                    String email = usernameKey + EMAIL_DOMAIN;
                    user.linkWithCredential(EmailAuthProvider.getCredential(email, password))
                            .addOnCompleteListener(task -> {
                                if (!task.isSuccessful()) {
                                    Log.e(TAG, "Link tài khoản thất bại", task.getException());
                                    notifyError(mapAuthError(task.getException()));
                                    return;
                                }

                                FirebaseUser linked = task.getResult() != null
                                        ? task.getResult().getUser()
                                        : auth.getCurrentUser();

                                if (linked == null) {
                                    notifyError("SIGNUP_FAILED");
                                    return;
                                }

                                reserveUsername(linked, username);
                            });
                })
                .addOnFailureListener(error -> {
                    Log.e(TAG, "Không kiểm tra được username", error);
                    notifyError(mapFirestoreError(error));
                });
    }


    /**
     * Đăng nhập bằng username/password.
     * Email nội bộ được sinh giống lúc signup.
     */
    public void login(String usernameRaw, String password) {
        if (!available) {
            notifyError("UNAVAILABLE");
            return;
        }

        final String username = normalizeUsername(usernameRaw);
        if (username.isEmpty()) {
            notifyError("INVALID_USERNAME");
            return;
        }
        if (password == null || password.isEmpty()) {
            notifyError("INVALID_LOGIN");
            return;
        }

        final String email = username.toLowerCase(Locale.ROOT) + EMAIL_DOMAIN;

        auth.signInWithEmailAndPassword(email, password)
                .addOnCompleteListener(task -> {
                    if (!task.isSuccessful()) {
                        Log.w(TAG, "Đăng nhập thất bại", task.getException());
                        notifyError(mapLoginError(task.getException()));
                        return;
                    }

                    FirebaseUser user = task.getResult() != null
                            ? task.getResult().getUser()
                            : auth.getCurrentUser();

                    if (user == null) {
                        notifyError("LOGIN_FAILED");
                        return;
                    }

                    firestore.collection(USERS)
                            .document(user.getUid())
                            .get()
                            .addOnSuccessListener(document -> {
                                String profileName = document.getString("username");
                                if (profileName == null || profileName.isEmpty()) {
                                    profileName = username;
                                }
                                notifyState("signed_in", profileName.toUpperCase(Locale.ROOT));
                            })
                            .addOnFailureListener(error -> {
                                // Đăng nhập thành công nhưng không đọc được profile:
                                // vẫn cho vào game với username vừa nhập.
                                notifyState("signed_in", username);
                            });
                });
    }

    private void reserveUsername(FirebaseUser user, String username) {
        final String usernameKey = username.toLowerCase(Locale.ROOT);
        final DocumentReference usernameRef = firestore.collection(USERNAMES).document(usernameKey);
        final DocumentReference profileRef = firestore.collection(USERS).document(user.getUid());

        try {
            firestore.runTransaction(transaction -> {
                DocumentSnapshot existing = transaction.get(usernameRef);
                if (existing.exists()) {
                    throw new IllegalStateException("USERNAME_TAKEN");
                }

                Map<String, Object> usernameData = new HashMap<>();
                usernameData.put("uid", user.getUid());
                usernameData.put("username", username);
                usernameData.put("createdAt", FieldValue.serverTimestamp());
                transaction.set(usernameRef, usernameData);

                Map<String, Object> profileData = new HashMap<>();
                profileData.put("username", username);
                profileData.put("displayName", username);
                profileData.put("updatedAt", FieldValue.serverTimestamp());
                transaction.set(profileRef, profileData, SetOptions.merge());

                return null;
            }).addOnSuccessListener(unused -> notifyState("signed_in", username))
                    .addOnFailureListener(error -> {
                        Log.e(TAG, "Không lưu được username", error);
                        if ("USERNAME_TAKEN".equals(error.getMessage())) {
                            notifyError("USERNAME_TAKEN");
                        } else {
                            notifyError(mapFirestoreError(error));
                        }
                    });
        } catch (Throwable t) {
            Log.e(TAG, "Lỗi reserveUsername", t);
            notifyError("SIGNUP_FAILED");
        }
    }

    private void handleUser(FirebaseUser user) {
        if (user.isAnonymous()) {
            notifyState("signup_required", null);
            return;
        }

        firestore.collection(USERS)
                .document(user.getUid())
                .get()
                .addOnSuccessListener(document -> {
                    String username = document.getString("username");
                    if (username == null || username.isEmpty()) {
                        // Auth đã tạo nhưng profile chưa có (trường hợp hiếm),
                        // để màn signup cho phép đặt username.
                        notifyState("signup_required", null);
                    } else {
                        notifyState("signed_in", username.toUpperCase(Locale.ROOT));
                    }
                })
                .addOnFailureListener(error -> {
                    Log.e(TAG, "Không tải được profile", error);
                    notifyError("PROFILE_LOAD_FAILED");
                });
    }

    private String normalizeUsername(String raw) {
        if (raw == null) return "";
        String value = raw.trim().toUpperCase(Locale.ROOT).replaceAll("[^A-Z0-9]", "");
        if (value.length() < 3 || value.length() > 9) {
            return "";
        }
        return value;
    }

    private String mapLoginError(Exception exception) {
        if (exception instanceof FirebaseAuthInvalidUserException
                || exception instanceof FirebaseAuthInvalidCredentialsException) {
            return "INVALID_LOGIN";
        }
        if (exception instanceof com.google.firebase.FirebaseNetworkException) {
            return "NETWORK";
        }
        if (exception instanceof FirebaseAuthException
                && "ERROR_OPERATION_NOT_ALLOWED".equals(((FirebaseAuthException) exception).getErrorCode())) {
            return "AUTH_DISABLED";
        }
        return "LOGIN_FAILED";
    }

    private String mapAuthError(Exception exception) {
        if (exception instanceof FirebaseAuthWeakPasswordException) {
            return "WEAK_PASSWORD";
        }
        if (exception instanceof FirebaseAuthUserCollisionException) {
            return "USERNAME_TAKEN";
        }
        if (exception instanceof FirebaseAuthInvalidCredentialsException) {
            return "INVALID_CREDENTIALS";
        }
        if (exception instanceof com.google.firebase.FirebaseNetworkException) {
            return "NETWORK";
        }
        if (exception instanceof FirebaseAuthException
                && "ERROR_OPERATION_NOT_ALLOWED".equals(((FirebaseAuthException) exception).getErrorCode())) {
            return "AUTH_DISABLED";
        }
        return "SIGNUP_FAILED";
    }

    private String mapFirestoreError(Exception exception) {
        if (exception instanceof FirebaseFirestoreException) {
            FirebaseFirestoreException firestoreError = (FirebaseFirestoreException) exception;
            if (firestoreError.getCode() == FirebaseFirestoreException.Code.PERMISSION_DENIED) {
                return "PERMISSION_DENIED";
            }
            if (firestoreError.getCode() == FirebaseFirestoreException.Code.UNAVAILABLE) {
                return "NETWORK";
            }
        }
        return "SIGNUP_FAILED";
    }

    private void notifyState(String status, String username) {
        try {
            JSONObject data = new JSONObject();
            data.put("status", status);
            if (username != null) {
                data.put("username", username);
            }
            listener.onAccountState(data.toString());
        } catch (Throwable t) {
            Log.e(TAG, "Lỗi tạo account JSON", t);
            listener.onAccountError("SIGNUP_FAILED");
        }
    }

    private void notifyError(String code) {
        listener.onAccountError(code);
    }
}
