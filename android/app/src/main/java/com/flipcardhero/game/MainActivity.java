package com.flipcardhero.game;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.util.DisplayMetrics;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.RelativeLayout;

import androidx.annotation.NonNull;

import com.google.android.gms.ads.AdError;
import com.google.android.gms.ads.AdListener;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdSize;
import com.google.android.gms.ads.AdView;
import com.google.android.gms.ads.FullScreenContentCallback;
import com.google.android.gms.ads.LoadAdError;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.OnUserEarnedRewardListener;
import com.google.android.gms.ads.initialization.InitializationStatus;
import com.google.android.gms.ads.initialization.OnInitializationCompleteListener;
import com.google.android.gms.ads.interstitial.InterstitialAd;
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback;
import com.google.android.gms.ads.rewarded.RewardItem;
import com.google.android.gms.ads.rewarded.RewardedAd;
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback;

public class MainActivity extends Activity {
    private static final String TAG = "FlipCardHero_AdMob";

    private WebView webView;
    private AdView adView;
    private InterstitialAd mInterstitialAd;
    private boolean isInterstitialLoading = false;

    private RewardedAd mRewardedAd;
    private boolean isRewardedLoading = false;
    private boolean isRewardedShowing = false;
    private boolean pendingRewardedShow = false;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        try {
            // Giữ màn hình luôn sáng trong suốt trận đấu
            getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

            // Tạo layout chứa WebView và Banner AdMob ở mép dưới
            RelativeLayout rootLayout = new RelativeLayout(this);
            rootLayout.setLayoutParams(new ViewGroup.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            ));
            rootLayout.setBackgroundColor(Color.parseColor("#0f172a"));

            // 1. Khởi tạo Banner AdView
            adView = new AdView(this);
            adView.setId(View.generateViewId());
            adView.setBackgroundColor(Color.parseColor("#0f172a"));
            adView.setAdUnitId(getBannerAdUnitId());
            adView.setAdSize(getAdaptiveBannerSize());

            RelativeLayout.LayoutParams adParams = new RelativeLayout.LayoutParams(
                RelativeLayout.LayoutParams.MATCH_PARENT,
                RelativeLayout.LayoutParams.WRAP_CONTENT
            );
            adParams.addRule(RelativeLayout.ALIGN_PARENT_BOTTOM);
            adParams.addRule(RelativeLayout.CENTER_HORIZONTAL);
            adView.setLayoutParams(adParams);

            // 2. Khởi tạo WebView chứa game HTML5
            webView = new WebView(this);
            RelativeLayout.LayoutParams webParams = new RelativeLayout.LayoutParams(
                RelativeLayout.LayoutParams.MATCH_PARENT,
                RelativeLayout.LayoutParams.MATCH_PARENT
            );
            webParams.addRule(RelativeLayout.ALIGN_PARENT_TOP);
            webParams.addRule(RelativeLayout.ABOVE, adView.getId());
            webView.setLayoutParams(webParams);

            // Cấu hình WebView
            WebSettings settings = webView.getSettings();
            settings.setJavaScriptEnabled(true);
            settings.setDomStorageEnabled(true);
            settings.setAllowFileAccess(true);
            settings.setAllowContentAccess(true);
            settings.setAllowFileAccessFromFileURLs(true);
            settings.setAllowUniversalAccessFromFileURLs(true);
            settings.setMediaPlaybackRequiresUserGesture(false);
            settings.setCacheMode(WebSettings.LOAD_DEFAULT);

            // Bật tăng tốc phần cứng cho đồ họa & chuyển động 3D lật bài
            webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
            webView.setWebViewClient(new WebViewClient());
            webView.setWebChromeClient(new WebChromeClient());

            // Đăng ký Javascript Bridge để mã Web tương tác với AdMob
            WebAppInterface bridge = new WebAppInterface();
            webView.addJavascriptInterface(bridge, "AndroidAds");
            webView.addJavascriptInterface(bridge, "AdMobBridge");

            // Tải giao diện game từ assets
            webView.loadUrl("file:///android_asset/www/index.html");

            // Gắn view vào màn hình
            rootLayout.addView(webView);
            rootLayout.addView(adView);
            setContentView(rootLayout);

            // 3. Khởi tạo Google Mobile Ads SDK
            initAdMob();

            // Ẩn thanh điều hướng và trạng thái (Full Immersive Fullscreen)
            getWindow().getDecorView().post(new Runnable() {
                @Override
                public void run() {
                    safeHideSystemUI();
                }
            });

        } catch (Throwable t) {
            Log.e(TAG, "Lỗi trong onCreate MainActivity", t);
        }
    }

    /**
     * Khởi tạo AdMob SDK, tải Banner, Interstitial và Rewarded Ad
     */
    private void initAdMob() {
        try {
            MobileAds.initialize(this, new OnInitializationCompleteListener() {
                @Override
                public void onInitializationComplete(@NonNull InitializationStatus initializationStatus) {
                    Log.i(TAG, "AdMob SDK đã khởi tạo thành công");
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            loadBannerAd();
                            loadInterstitialAd();
                            loadRewardedAd();
                        }
                    });
                }
            });
        } catch (Throwable t) {
            Log.e(TAG, "Không thể khởi tạo AdMob SDK", t);
        }
    }

    /**
     * Tải Banner Ad
     */
    private void loadBannerAd() {
        try {
            if (adView == null) return;

            adView.setAdListener(new AdListener() {
                @Override
                public void onAdLoaded() {
                    Log.i(TAG, "Banner AdMob đã tải thành công");
                }

                @Override
                public void onAdFailedToLoad(@NonNull LoadAdError loadAdError) {
                    Log.w(TAG, "Banner AdMob tải thất bại: " + loadAdError.getMessage() + " (Code: " + loadAdError.getCode() + ")");
                }
            });

            AdRequest adRequest = new AdRequest.Builder().build();
            adView.loadAd(adRequest);
        } catch (Throwable t) {
            Log.e(TAG, "Lỗi khi gọi loadBannerAd", t);
        }
    }

    /**
     * Tải trước Interstitial Ad (Quảng cáo toàn màn hình)
     */
    private void loadInterstitialAd() {
        if (mInterstitialAd != null || isInterstitialLoading) {
            return;
        }

        try {
            isInterstitialLoading = true;
            AdRequest adRequest = new AdRequest.Builder().build();
            String adUnitId = getInterstitialAdUnitId();

            InterstitialAd.load(this, adUnitId, adRequest, new InterstitialAdLoadCallback() {
                @Override
                public void onAdLoaded(@NonNull InterstitialAd interstitialAd) {
                    mInterstitialAd = interstitialAd;
                    isInterstitialLoading = false;
                    Log.i(TAG, "Interstitial AdMob đã tải xong và sẵn sàng hiển thị");

                    mInterstitialAd.setFullScreenContentCallback(new FullScreenContentCallback() {
                        @Override
                        public void onAdDismissedFullScreenContent() {
                            Log.i(TAG, "Người dùng đã đóng quảng cáo Interstitial");
                            mInterstitialAd = null;
                            safeHideSystemUI();
                            // Tải trước lượt quảng cáo tiếp theo cho ván sau
                            loadInterstitialAd();
                        }

                        @Override
                        public void onAdFailedToShowFullScreenContent(@NonNull AdError adError) {
                            Log.e(TAG, "Không thể hiển thị Interstitial: " + adError.getMessage());
                            mInterstitialAd = null;
                            safeHideSystemUI();
                            loadInterstitialAd();
                        }

                        @Override
                        public void onAdShowedFullScreenContent() {
                            Log.i(TAG, "Interstitial AdMob đang hiển thị toàn màn hình");
                        }
                    });
                }

                @Override
                public void onAdFailedToLoad(@NonNull LoadAdError loadAdError) {
                    Log.w(TAG, "Interstitial tải thất bại: " + loadAdError.getMessage() + " (Code: " + loadAdError.getCode() + ")");
                    mInterstitialAd = null;
                    isInterstitialLoading = false;
                }
            });
        } catch (Throwable t) {
            Log.e(TAG, "Lỗi khi gọi loadInterstitialAd", t);
            isInterstitialLoading = false;
        }
    }

    /**
     * Hiển thị Interstitial Ad nếu đã sẵn sàng
     */
    public void showInterstitialAd() {
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                if (mInterstitialAd != null) {
                    Log.i(TAG, "Bắt đầu hiển thị Interstitial AdMob...");
                    mInterstitialAd.show(MainActivity.this);
                } else {
                    Log.w(TAG, "Interstitial chưa sẵn sàng. Đang tải lại...");
                    loadInterstitialAd();
                }
            }
        });
    }

    /**
     * Tải trước Rewarded Ad (quảng cáo xem để nhận tim)
     */
    private void loadRewardedAd() {
        if (mRewardedAd != null || isRewardedLoading) {
            return;
        }

        try {
            isRewardedLoading = true;
            AdRequest adRequest = new AdRequest.Builder().build();

            RewardedAd.load(this, getRewardedAdUnitId(), adRequest, new RewardedAdLoadCallback() {
                @Override
                public void onAdLoaded(@NonNull RewardedAd rewardedAd) {
                    mRewardedAd = rewardedAd;
                    isRewardedLoading = false;
                    Log.i(TAG, "Rewarded AdMob đã tải xong và sẵn sàng hiển thị");

                    mRewardedAd.setFullScreenContentCallback(new FullScreenContentCallback() {
                        @Override
                        public void onAdDismissedFullScreenContent() {
                            Log.i(TAG, "Người dùng đã đóng Rewarded Ad");
                            mRewardedAd = null;
                            isRewardedShowing = false;
                            safeHideSystemUI();
                            notifyRewardedAdEvent("closed");
                            loadRewardedAd();
                        }

                        @Override
                        public void onAdFailedToShowFullScreenContent(@NonNull AdError adError) {
                            Log.e(TAG, "Không thể hiển thị Rewarded Ad: " + adError.getMessage());
                            mRewardedAd = null;
                            isRewardedShowing = false;
                            safeHideSystemUI();
                            notifyRewardedAdEvent("failed");
                            loadRewardedAd();
                        }

                        @Override
                        public void onAdShowedFullScreenContent() {
                            Log.i(TAG, "Rewarded AdMob đang hiển thị toàn màn hình");
                            notifyRewardedAdEvent("shown");
                        }
                    });

                    if (pendingRewardedShow) {
                        pendingRewardedShow = false;
                        showRewardedAdInternal();
                    }
                }

                @Override
                public void onAdFailedToLoad(@NonNull LoadAdError loadAdError) {
                    Log.w(TAG, "Rewarded tải thất bại: " + loadAdError.getMessage() + " (Code: " + loadAdError.getCode() + ")");
                    mRewardedAd = null;
                    isRewardedLoading = false;
                    pendingRewardedShow = false;
                    notifyRewardedAdEvent("failed");
                }
            });
        } catch (Throwable t) {
            Log.e(TAG, "Lỗi khi gọi loadRewardedAd", t);
            isRewardedLoading = false;
            pendingRewardedShow = false;
            notifyRewardedAdEvent("failed");
        }
    }

    /**
     * Hiển thị Rewarded Ad. Nếu chưa tải xong, chờ tải xong rồi tự hiển thị.
     */
    public void showRewardedAd() {
        runOnUiThread(new Runnable() {
            @Override
            public void run() {
                if (isRewardedShowing) {
                    Log.w(TAG, "Rewarded Ad đang hiển thị, bỏ qua yêu cầu mới");
                    return;
                }

                if (mRewardedAd == null) {
                    pendingRewardedShow = true;
                    notifyRewardedAdEvent("loading");
                    if (!isRewardedLoading) {
                        loadRewardedAd();
                    }
                    return;
                }

                showRewardedAdInternal();
            }
        });
    }

    private void showRewardedAdInternal() {
        if (mRewardedAd == null || isRewardedShowing) {
            return;
        }

        try {
            isRewardedShowing = true;
            mRewardedAd.show(this, new OnUserEarnedRewardListener() {
                @Override
                public void onUserEarnedReward(@NonNull RewardItem rewardItem) {
                    Log.i(TAG, "Người dùng đã xem xong Rewarded Ad: " + rewardItem.getAmount() + " " + rewardItem.getType());
                    notifyRewardedAdEvent("rewarded");
                }
            });
        } catch (Throwable t) {
            Log.e(TAG, "Lỗi khi hiển thị Rewarded Ad", t);
            mRewardedAd = null;
            isRewardedShowing = false;
            pendingRewardedShow = false;
            safeHideSystemUI();
            notifyRewardedAdEvent("failed");
            loadRewardedAd();
        }
    }

    private void notifyRewardedAdEvent(final String event) {
        if (webView == null) return;
        webView.post(new Runnable() {
            @Override
            public void run() {
                webView.evaluateJavascript(
                    "window.onRewardedAdEvent && window.onRewardedAdEvent('" + event + "');",
                    null
                );
            }
        });
    }

    /**
     * Tính toán kích thước Adaptive Banner phù hợp với độ rộng màn hình
     */
    private AdSize getAdaptiveBannerSize() {
        try {
            DisplayMetrics displayMetrics = getResources().getDisplayMetrics();
            int adWidthPixels = displayMetrics.widthPixels;
            int adWidth = (int) (adWidthPixels / displayMetrics.density);
            return AdSize.getCurrentOrientationAnchoredAdaptiveBannerAdSize(this, adWidth);
        } catch (Throwable t) {
            return AdSize.BANNER;
        }
    }

    private String getBannerAdUnitId() {
        boolean useTest = getResources().getBoolean(R.bool.use_test_ads);
        return useTest ? getString(R.string.admob_test_banner_id) : getString(R.string.admob_banner_id);
    }

    private String getInterstitialAdUnitId() {
        boolean useTest = getResources().getBoolean(R.bool.use_test_ads);
        return useTest ? getString(R.string.admob_test_interstitial_id) : getString(R.string.admob_interstitial_id);
    }

    private String getRewardedAdUnitId() {
        boolean useTest = getResources().getBoolean(R.bool.use_test_ads);
        return useTest ? getString(R.string.admob_test_rewarded_id) : getString(R.string.admob_rewarded_id);
    }

    /**
     * Cầu nối JavaScript Interface để gọi từ frontend
     */
    public class WebAppInterface {
        @JavascriptInterface
        public void showInterstitial() {
            Log.d(TAG, "Gọi showInterstitial() từ mã JavaScript");
            showInterstitialAd();
        }

        @JavascriptInterface
        public boolean isInterstitialReady() {
            return mInterstitialAd != null;
        }

        @JavascriptInterface
        public void showRewardedAd() {
            Log.d(TAG, "Gọi showRewardedAd() từ mã JavaScript");
            MainActivity.this.showRewardedAd();
        }

        @JavascriptInterface
        public boolean isRewardedAdReady() {
            return mRewardedAd != null;
        }

        @JavascriptInterface
        public void showBanner() {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    if (adView != null) {
                        adView.setVisibility(View.VISIBLE);
                    }
                }
            });
        }

        @JavascriptInterface
        public void hideBanner() {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    if (adView != null) {
                        adView.setVisibility(View.GONE);
                    }
                }
            });
        }
    }

    private void safeHideSystemUI() {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                final WindowInsetsController insetsController = getWindow().getInsetsController();
                if (insetsController != null) {
                    insetsController.hide(WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars());
                    insetsController.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
                }
            } else {
                getWindow().getDecorView().setSystemUiVisibility(
                    View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                    | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                    | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                    | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                    | View.SYSTEM_UI_FLAG_FULLSCREEN
                );
            }
        } catch (Throwable t) {
            Log.w(TAG, "Lỗi ẩn System UI", t);
        }
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            safeHideSystemUI();
        }
    }

    @Override
    public void onBackPressed() {
        try {
            if (webView != null && webView.canGoBack()) {
                webView.goBack();
            } else {
                super.onBackPressed();
            }
        } catch (Throwable t) {
            super.onBackPressed();
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) {
            webView.onResume();
        }
        if (adView != null) {
            adView.resume();
        }
        safeHideSystemUI();
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (webView != null) {
            webView.onPause();
        }
        if (adView != null) {
            adView.pause();
        }
    }

    @Override
    protected void onDestroy() {
        if (adView != null) {
            adView.destroy();
        }
        if (webView != null) {
            webView.destroy();
        }
        super.onDestroy();
    }
}
