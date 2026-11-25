/**
 * Flip Card Hero - Google AdMob Advertising Bridge
 * Quản lý quảng cáo Banner, Interstitial và Rewarded AdMob
 * 
 * Thông tin cấu hình:
 * - Banner ID: ca-app-pub-1345063149639557/1736099863
 * - Interstitial ID: ca-app-pub-1345063149639557/9583508131
 * - Rewarded ID: ca-app-pub-1345063149639557/1159021967
 * - Publisher ID: pub-1345063149639557
 */

(function () {
    class AdsManager {
        constructor() {
            this.lastInterstitialTime = 0;
            this.cooldownMs = 6000; // Giãn cách tối thiểu 6s giữa các lần gọi Interstitial

            // Trạng thái Rewarded Ad (quảng cáo xem để nhận tim)
            this.rewardedPromise = null;
            this.rewardedResolve = null;
            this.rewardedEarned = false;
            this.rewardedShown = false;
            this.rewardedLoadTimer = null;
            this.rewardedWatchTimer = null;

            // Android native gọi lại hàm này sau mỗi mốc của quảng cáo
            window.onRewardedAdEvent = (type) => this.handleRewardedAdEvent(type);

            this.init();
        }

        init() {
            const hasBridge = this.hasNativeBridge();
            if (hasBridge) {
                console.log('[AdMob] Đã kết nối với Android Native AdMob Bridge.');
            } else {
                console.log('[AdMob] Chạy trên Web/Browser (Chế độ mô phỏng AdMob).');
            }
        }

        hasNativeBridge() {
            return (
                (typeof window.AndroidAds !== 'undefined' && typeof window.AndroidAds.showInterstitial === 'function') ||
                (typeof window.AdMobBridge !== 'undefined' && typeof window.AdMobBridge.showInterstitial === 'function')
            );
        }

        getBridge() {
            return window.AndroidAds || window.AdMobBridge || null;
        }

        /**
         * Hiển thị quảng cáo Interstitial (quảng cáo toàn màn hình)
         * Được gọi sau khi có kết quả ván đấu (Thắng hoặc Thua)
         */
        showInterstitial() {
            const now = Date.now();
            if (now - this.lastInterstitialTime < this.cooldownMs) {
                console.log('[AdMob] Bỏ qua Interstitial: Đang trong thời gian cooldown.');
                return;
            }

            this.lastInterstitialTime = now;
            const bridge = this.getBridge();

            if (bridge && typeof bridge.showInterstitial === 'function') {
                console.log('[AdMob] Đang kích hoạt native showInterstitial()...');
                try {
                    bridge.showInterstitial();
                } catch (e) {
                    console.error('[AdMob] Lỗi khi gọi bridge.showInterstitial:', e);
                }
            } else {
                console.log('[AdMob] [Web Simulator] Interstitial Ad kích hoạt thành công sau ván đấu.');
            }
        }

        /**
         * Kiểm tra quảng cáo Interstitial đã sẵn sàng chưa
         */
        isInterstitialReady() {
            const bridge = this.getBridge();
            if (bridge && typeof bridge.isInterstitialReady === 'function') {
                return bridge.isInterstitialReady();
            }
            return false;
        }

        /**
         * Hiển thị Rewarded Ad (quảng cáo thưởng) và chờ kết quả.
         * Trả về Promise<string> với status:
         * - 'rewarded': đã xem đủ và được thưởng
         * - 'closed': người dùng đóng quảng cáo trước khi nhận thưởng
         * - 'failed' / 'timeout': không tải hoặc không hiển thị được
         * - 'unavailable': chạy trên web, không có native AdMob
         */
        showRewardedAd() {
            if (this.rewardedPromise) {
                return this.rewardedPromise;
            }

            const bridge = this.getBridge();
            if (!bridge || typeof bridge.showRewardedAd !== 'function') {
                return Promise.resolve('unavailable');
            }

            this.rewardedEarned = false;
            this.rewardedShown = false;

            this.rewardedPromise = new Promise((resolve) => {
                this.rewardedResolve = resolve;

                // Nếu quảng cáo không bắt đầu trong 30s thì coi như thất bại
                this.rewardedLoadTimer = setTimeout(() => {
                    if (!this.rewardedShown) {
                        this.finishRewarded('timeout');
                    }
                }, 30000);

                try {
                    bridge.showRewardedAd();
                } catch (e) {
                    console.error('[AdMob] Lỗi khi gọi bridge.showRewardedAd:', e);
                    // Để promise được gán xong rồi mới kết thúc
                    setTimeout(() => this.finishRewarded('failed'), 0);
                }
            });

            return this.rewardedPromise;
        }

        /**
         * Nhận sự kiện từ Android native: loading / shown / rewarded / closed / failed
         */
        handleRewardedAdEvent(type) {
            if (!this.rewardedResolve) return;

            if (type === 'loading') {
                return;
            }

            if (type === 'shown') {
                this.rewardedShown = true;
                if (this.rewardedLoadTimer) {
                    clearTimeout(this.rewardedLoadTimer);
                    this.rewardedLoadTimer = null;
                }
                // Chốt an toàn nếu native không gửi sự kiện đóng
                this.rewardedWatchTimer = setTimeout(() => {
                    this.finishRewarded(this.rewardedEarned ? 'rewarded' : 'timeout');
                }, 180000);
                return;
            }

            if (type === 'rewarded') {
                this.rewardedEarned = true;
                return;
            }

            if (type === 'closed') {
                this.finishRewarded(this.rewardedEarned ? 'rewarded' : 'closed');
                return;
            }

            if (type === 'failed') {
                this.finishRewarded('failed');
            }
        }

        finishRewarded(status) {
            if (!this.rewardedResolve) return;

            const resolve = this.rewardedResolve;
            this.rewardedResolve = null;
            this.rewardedPromise = null;

            if (this.rewardedLoadTimer) {
                clearTimeout(this.rewardedLoadTimer);
                this.rewardedLoadTimer = null;
            }
            if (this.rewardedWatchTimer) {
                clearTimeout(this.rewardedWatchTimer);
                this.rewardedWatchTimer = null;
            }

            this.rewardedEarned = false;
            this.rewardedShown = false;

            resolve(status || 'failed');
        }

        isRewardedAdReady() {
            const bridge = this.getBridge();
            if (bridge && typeof bridge.isRewardedAdReady === 'function') {
                return bridge.isRewardedAdReady();
            }
            return false;
        }

        /**
         * Hiển thị Banner ở mép dưới
         */
        showBanner() {
            const bridge = this.getBridge();
            if (bridge && typeof bridge.showBanner === 'function') {
                bridge.showBanner();
            }
        }

        /**
         * Ẩn Banner ở mép dưới
         */
        hideBanner() {
            const bridge = this.getBridge();
            if (bridge && typeof bridge.hideBanner === 'function') {
                bridge.hideBanner();
            }
        }
    }

    // Gắn vào window toàn cục để game.js dễ dàng truy cập
    window.adsManager = new AdsManager();
})();
