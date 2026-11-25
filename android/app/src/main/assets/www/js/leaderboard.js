/**
 * Flip Card Hero - Leaderboard Bridge (Firebase native Android)
 * - Nhận top 50 realtime từ Android LeaderboardManager.
 * - Android gọi lại qua window.onLeaderboardData / window.onLeaderboardError.
 */
(function () {
    class LeaderboardManager {
        constructor() {
            this.dataHandler = null;
            this.errorHandler = null;
            this.loadTimer = null;

            window.onLeaderboardData = (json) => this.handleData(json);
            window.onLeaderboardError = (message) => this.handleError(message);
        }

        getBridge() {
            return window.AndroidLeaderboard || null;
        }

        hasBridge() {
            const bridge = this.getBridge();
            return !!bridge && typeof bridge.getLeaderboard === 'function';
        }

        isAvailable() {
            const bridge = this.getBridge();
            if (!bridge || typeof bridge.isLeaderboardAvailable !== 'function') {
                return false;
            }
            try {
                return !!bridge.isLeaderboardAvailable();
            } catch (e) {
                return false;
            }
        }

        setHandlers(handlers) {
            this.dataHandler = handlers && typeof handlers.onData === 'function'
                ? handlers.onData
                : null;
            this.errorHandler = handlers && typeof handlers.onError === 'function'
                ? handlers.onError
                : null;
        }

        /**
         * Mở listener realtime top 50.
         */
        startUpdates() {
            this.clearLoadTimer();

            if (!this.hasBridge()) {
                this.emitError('unavailable');
                return false;
            }
            if (!this.isAvailable()) {
                this.emitError('unavailable');
                return false;
            }

            // Chỉ dùng timeout cho lần tải đầu tiên
            this.loadTimer = setTimeout(() => {
                this.emitError('timeout');
            }, 15000);

            try {
                this.getBridge().getLeaderboard();
                return true;
            } catch (e) {
                this.emitError(e && e.message ? e.message : 'error');
                return false;
            }
        }

        stopUpdates() {
            this.clearLoadTimer();

            const bridge = this.getBridge();
            if (bridge && typeof bridge.stopLeaderboardUpdates === 'function') {
                try {
                    bridge.stopLeaderboardUpdates();
                } catch (e) {
                    // Bỏ qua
                }
            }
        }

        /**
         * Gửi điểm lên Firestore. Không cần chờ kết quả.
         */
        submitScore(payload) {
            if (!this.hasBridge() || !this.isAvailable()) {
                return false;
            }
            try {
                this.getBridge().submitLeaderboardScore(JSON.stringify(payload));
                return true;
            } catch (e) {
                console.warn('[Leaderboard] Gửi điểm thất bại:', e);
                return false;
            }
        }

        handleData(json) {
            this.clearLoadTimer();

            try {
                const data = JSON.parse(json);
                if (this.dataHandler) {
                    this.dataHandler(data);
                }
            } catch (e) {
                this.emitError('invalid-data');
            }
        }

        handleError(message) {
            this.clearLoadTimer();
            this.emitError(message || 'error');
        }

        emitError(message) {
            if (this.errorHandler) {
                this.errorHandler(message);
            }
        }

        clearLoadTimer() {
            if (this.loadTimer) {
                clearTimeout(this.loadTimer);
                this.loadTimer = null;
            }
        }
    }

    window.leaderboardManager = new LeaderboardManager();
})();
