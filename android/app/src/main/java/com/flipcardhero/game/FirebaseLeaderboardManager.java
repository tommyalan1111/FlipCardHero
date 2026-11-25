package com.flipcardhero.game;

import android.content.Context;
import android.util.Log;

import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.firestore.AggregateSource;
import com.google.firebase.firestore.DocumentSnapshot;
import com.google.firebase.firestore.FieldValue;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.ListenerRegistration;
import com.google.firebase.firestore.Query;
import com.google.firebase.firestore.QuerySnapshot;
import com.google.firebase.firestore.SetOptions;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

/**
 * Leaderboard đơn giản trên Firebase:
 * - Anonymous Auth (mỗi thiết bị một UID)
 * - Firestore collection "leaderboard"
 * - Điểm = Easy thắng ×1 + Medium thắng ×2 + Hard thắng ×3
 *
 * Danh sách top 50 dùng snapshot listener để tự cập nhật realtime.
 * Nếu người chơi ngoài top 50, manager đếm số người có điểm cao hơn
 * để trả về hạng chính xác.
 *
 * Nếu chưa có google-services.json, manager sẽ ở trạng thái unavailable
 * và không làm crash app.
 */
public class FirebaseLeaderboardManager {
    private static final String TAG = "FCH_Leaderboard";
    private static final String COLLECTION = "leaderboard";
    private static final int TOP_LIMIT = 50;

    public interface Listener {
        void onLeaderboardData(String json);

        void onLeaderboardError(String message);
    }

    private final Listener listener;
    private final FirebaseAuth auth;
    private final FirebaseFirestore firestore;
    private final boolean available;

    private boolean authReady = false;
    private boolean authFailed = false;
    private boolean authInProgress = false;
    private boolean pendingLiveUpdates = false;
    private String pendingScoreJson = null;

    private ListenerRegistration leaderboardRegistration;
    private long snapshotVersion = 0;

    public FirebaseLeaderboardManager(Context context, Listener listener) {
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
            Log.e(TAG, "Không thể khởi tạo Firebase", t);
        }

        this.auth = localAuth;
        this.firestore = localFirestore;
        this.available = initialized;

        if (this.available) {
            ensureSignedIn();
        }
    }

    public boolean isAvailable() {
        return available;
    }

    private void ensureSignedIn() {
        if (!available || authReady || authFailed || authInProgress) {
            return;
        }

        try {
            FirebaseUser currentUser = auth.getCurrentUser();
            if (currentUser != null) {
                authReady = true;
                flushPending();
                return;
            }

            authInProgress = true;
            auth.signInAnonymously().addOnCompleteListener(task -> {
                authInProgress = false;

                if (task.isSuccessful()) {
                    authReady = true;
                    Log.i(TAG, "Đã đăng nhập Anonymous");
                    flushPending();
                } else {
                    authFailed = true;
                    String message = task.getException() != null
                            ? task.getException().getMessage()
                            : "Không thể đăng nhập ẩn danh";
                    Log.e(TAG, "Đăng nhập Anonymous thất bại: " + message);

                    if (pendingLiveUpdates) {
                        pendingLiveUpdates = false;
                        listener.onLeaderboardError("Không thể kết nối bảng xếp hạng: " + message);
                    }
                }
            });
        } catch (Throwable t) {
            authInProgress = false;
            authFailed = true;
            Log.e(TAG, "Lỗi đăng nhập Anonymous", t);
            if (pendingLiveUpdates) {
                pendingLiveUpdates = false;
                listener.onLeaderboardError("Không thể kết nối bảng xếp hạng.");
            }
        }
    }

    /**
     * Bắt đầu lắng nghe top 50 realtime.
     */
    public void startUpdates() {
        if (!available) {
            listener.onLeaderboardError("Bảng xếp hạng chưa sẵn sàng. Hãy thêm google-services.json và build lại app.");
            return;
        }
        if (authFailed) {
            listener.onLeaderboardError("Không thể đăng nhập bảng xếp hạng. Kiểm tra Anonymous Auth trong Firebase.");
            return;
        }
        if (!authReady) {
            pendingLiveUpdates = true;
            ensureSignedIn();
            return;
        }

        stopUpdates();

        FirebaseFirestore db = firestore;
        if (db == null) {
            listener.onLeaderboardError("Firestore chưa sẵn sàng.");
            return;
        }

        try {
            Query query = db.collection(COLLECTION)
                    .orderBy("score", Query.Direction.DESCENDING)
                    .limit(TOP_LIMIT);

            leaderboardRegistration = query.addSnapshotListener((snapshot, error) -> {
                if (error != null) {
                    Log.e(TAG, "Lỗi listener leaderboard", error);
                    listener.onLeaderboardError("Không thể tải bảng xếp hạng: " + error.getMessage());
                    return;
                }
                if (snapshot == null) {
                    return;
                }
                sendSnapshot(snapshot);
            });
        } catch (Throwable t) {
            Log.e(TAG, "Lỗi gọi startUpdates", t);
            listener.onLeaderboardError("Không thể tải bảng xếp hạng.");
        }
    }

    public void stopUpdates() {
        pendingLiveUpdates = false;
        if (leaderboardRegistration != null) {
            leaderboardRegistration.remove();
            leaderboardRegistration = null;
        }
    }

    /**
     * Lưu điểm của người chơi hiện tại. Nếu chưa đăng nhập xong thì đợi.
     */
    public void submitScore(String scoreJson) {
        if (!available || authFailed) {
            return;
        }
        if (scoreJson == null || scoreJson.isEmpty()) {
            return;
        }
        if (!authReady) {
            pendingScoreJson = scoreJson;
            ensureSignedIn();
            return;
        }

        writeScore(scoreJson);
    }

    private void writeScore(String scoreJson) {
        try {
            FirebaseUser user = auth.getCurrentUser();
            FirebaseFirestore db = firestore;
            if (user == null || db == null) {
                return;
            }

            JSONObject payload = new JSONObject(scoreJson);
            String name = safeString(payload.optString("name"), "PLAYER")
                    .trim()
                    .toUpperCase(Locale.ROOT);
            if (name.length() > 9) {
                name = name.substring(0, 9);
            }
            if (name.isEmpty()) {
                name = "PLAYER";
            }

            long score = Math.max(0L, payload.optLong("score", 0L));
            long easyWins = Math.max(0L, payload.optLong("easyWins", 0L));
            long mediumWins = Math.max(0L, payload.optLong("mediumWins", 0L));
            long hardWins = Math.max(0L, payload.optLong("hardWins", 0L));
            long bestBoss = Math.max(0L, Math.min(3L, payload.optLong("bestBoss", 0L)));

            Map<String, Object> data = new HashMap<>();
            data.put("name", name);
            data.put("score", score);
            data.put("easyWins", easyWins);
            data.put("mediumWins", mediumWins);
            data.put("hardWins", hardWins);
            data.put("bestBoss", bestBoss);
            data.put("updatedAt", FieldValue.serverTimestamp());

            db.collection(COLLECTION)
                    .document(user.getUid())
                    .set(data, SetOptions.merge())
                    .addOnSuccessListener(unused -> Log.i(TAG, "Đã lưu điểm: " + score))
                    .addOnFailureListener(e -> {
                        Log.e(TAG, "Lưu điểm thất bại", e);
                        listener.onLeaderboardError("Không thể lưu điểm: " + e.getMessage());
                    });
        } catch (Throwable t) {
            Log.e(TAG, "Lỗi submitScore", t);
        }
    }

    private void sendSnapshot(QuerySnapshot snapshot) {
        final long version = ++snapshotVersion;
        final FirebaseUser user = auth.getCurrentUser();
        final String myUid = user != null ? user.getUid() : "";
        final JSONArray entries = buildEntries(snapshot);

        int myIndex = -1;
        for (int i = 0; i < entries.length(); i++) {
            JSONObject item = entries.optJSONObject(i);
            if (item != null && myUid.equals(item.optString("uid"))) {
                myIndex = i;
                break;
            }
        }

        if (myIndex >= 0) {
            emitLeaderboard(myUid, myIndex + 1, entries, version);
            return;
        }

        computeRankOutsideTop(myUid, entries, version);
    }

    private JSONArray buildEntries(QuerySnapshot snapshot) {
        JSONArray entries = new JSONArray();

        for (DocumentSnapshot doc : snapshot.getDocuments()) {
            try {
                JSONObject item = new JSONObject();
                item.put("uid", doc.getId());
                item.put("name", safeString(doc.getString("name"), "PLAYER")
                        .toUpperCase(Locale.ROOT));
                item.put("score", safeLong(doc.getLong("score")));
                item.put("easyWins", safeLong(doc.getLong("easyWins")));
                item.put("mediumWins", safeLong(doc.getLong("mediumWins")));
                item.put("hardWins", safeLong(doc.getLong("hardWins")));
                item.put("bestBoss", safeLong(doc.getLong("bestBoss")));
                entries.put(item);
            } catch (Throwable t) {
                Log.w(TAG, "Bỏ qua document lỗi: " + doc.getId(), t);
            }
        }

        return entries;
    }

    private void computeRankOutsideTop(String myUid, JSONArray entries, long version) {
        FirebaseFirestore db = firestore;
        if (db == null || myUid.isEmpty()) {
            emitLeaderboard(myUid, 0, entries, version);
            return;
        }

        db.collection(COLLECTION)
                .document(myUid)
                .get()
                .addOnSuccessListener(doc -> {
                    if (version != snapshotVersion) return;

                    if (!doc.exists()) {
                        emitLeaderboard(myUid, 0, entries, version);
                        return;
                    }

                    long myScore = safeLong(doc.getLong("score"));
                    db.collection(COLLECTION)
                            .whereGreaterThan("score", myScore)
                            .count()
                            .get(AggregateSource.SERVER)
                            .addOnSuccessListener(countSnapshot -> {
                                if (version != snapshotVersion) return;
                                emitLeaderboard(myUid, countSnapshot.getCount() + 1, entries, version);
                            })
                            .addOnFailureListener(e -> {
                                Log.w(TAG, "Không đếm được hạng của mình", e);
                                if (version == snapshotVersion) {
                                    emitLeaderboard(myUid, 0, entries, version);
                                }
                            });
                })
                .addOnFailureListener(e -> {
                    Log.w(TAG, "Không đọc được điểm của mình", e);
                    if (version == snapshotVersion) {
                        emitLeaderboard(myUid, 0, entries, version);
                    }
                });
    }

    private void emitLeaderboard(String myUid, long myRank, JSONArray entries, long version) {
        if (version != snapshotVersion) {
            return;
        }

        try {
            JSONObject result = new JSONObject();
            result.put("available", true);
            result.put("myUid", myUid);
            result.put("myRank", myRank);
            result.put("entries", entries);
            listener.onLeaderboardData(result.toString());
        } catch (Throwable t) {
            Log.e(TAG, "Lỗi tạo JSON leaderboard", t);
            listener.onLeaderboardError("Không thể đọc bảng xếp hạng.");
        }
    }

    private void flushPending() {
        if (pendingLiveUpdates) {
            pendingLiveUpdates = false;
            startUpdates();
        }
        if (pendingScoreJson != null) {
            String json = pendingScoreJson;
            pendingScoreJson = null;
            writeScore(json);
        }
    }

    private String safeString(String value, String fallback) {
        return value == null || value.isEmpty() ? fallback : value;
    }

    private long safeLong(Long value) {
        return value == null ? 0L : value;
    }
}
