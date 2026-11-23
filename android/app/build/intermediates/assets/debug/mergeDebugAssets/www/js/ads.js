/**
 * Flip Card Hero - Google AdMob Advertising Bridge
 * Quản lý quảng cáo Banner và Interstitial AdMob
 * 
 * Thông tin cấu hình:
 * - Banner ID: ca-app-pub-1345063149639557/1736099863
 * - Interstitial ID: ca-app-pub-1345063149639557/9583508131
 * - Publisher ID: pub-1345063149639557
 */

(function () {
    class AdsManager {
        constructor() {
            this.lastInterstitialTime = 0;
            this.cooldownMs = 6000; // Giãn cách tối thiểu 6s giữa các lần gọi Interstitial
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
