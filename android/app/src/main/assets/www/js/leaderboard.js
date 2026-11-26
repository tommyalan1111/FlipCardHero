/**
 * Flip Card Hero - Leaderboard Bridge (Firebase native Android)
 * - Chỉ lấy top 50 MỘT LẦN khi được yêu cầu (không realtime).
 * - Game tự cache kết quả 1 giờ trước khi gọi lại.
 */
(function () {
    class LeaderboardManager {
        constructor() {
            this.dataHandler = null;
            this.errorHandler = null;
            this.loadTimer = null;
            this.loading = false;

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
         * Gọi native lấy top 50 một lần.
         */
        fetchTop() {
            if (this.loading) {
                return false;
            }
            if (!this.hasBridge()) {
                this.emitError('unavailable');
                return false;
            }
            if (!this.isAvailable()) {
                this.emitError('unavailable');
                return false;
            }

            this.loading = true;
            this.clearLoadTimer();
            this.loadTimer = setTimeout(() => {
                this.loading = false;
                this.emitError('timeout');
            }, 15000);

            try {
                this.getBridge().getLeaderboard();
                return true;
            } catch (e) {
                this.loading = false;
                this.clearLoadTimer();
                this.emitError(e && e.message ? e.message : 'error');
                return false;
            }
        }

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
            this.loading = false;
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
            this.loading = false;
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
