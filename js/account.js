/**
 * Flip Card Hero - Account bridge (Firebase native Android)
 * - checkAccount(): kiểm tra đã đăng nhập chưa.
 * - signUp(username, password): tạo tài khoản, kiểm tra trùng username phía Firestore.
 */
(function () {
    class AccountManager {
        constructor() {
            this.pending = null;

            window.onAccountState = (json) => this.handleState(json);
            window.onAccountError = (code) => this.handleError(code);
        }

        getBridge() {
            return window.AndroidAccount || null;
        }

        hasBridge() {
            const bridge = this.getBridge();
            return !!bridge
                && typeof bridge.checkAccount === 'function'
                && typeof bridge.signUp === 'function';
        }

        isAvailable() {
            const bridge = this.getBridge();
            if (!bridge || typeof bridge.isAccountAvailable !== 'function') {
                return false;
            }
            try {
                return !!bridge.isAccountAvailable();
            } catch (e) {
                return false;
            }
        }

        checkAccount() {
            return this.request('checkAccount', [], 12000);
        }

        signUp(username, password) {
            return this.request('signUp', [username, password], 20000);
        }

        login(username, password) {
            return this.request('login', [username, password], 20000);
        }

        request(method, args, timeoutMs) {
            if (!this.hasBridge()) {
                return Promise.reject(new Error('UNAVAILABLE'));
            }
            if (this.pending) {
                return Promise.reject(new Error('BUSY'));
            }

            return new Promise((resolve, reject) => {
                const timer = setTimeout(() => {
                    this.finish(null, 'TIMEOUT');
                }, timeoutMs);

                this.pending = { resolve, reject, timer };

                try {
                    this.getBridge()[method].apply(this.getBridge(), args);
                } catch (e) {
                    this.finish(null, 'UNAVAILABLE');
                }
            });
        }

        handleState(json) {
            try {
                this.finish(JSON.parse(json), null);
            } catch (e) {
                this.finish(null, 'INVALID_STATE');
            }
        }

        handleError(code) {
            this.finish(null, code || 'SIGNUP_FAILED');
        }

        finish(data, error) {
            if (!this.pending) return;

            const pending = this.pending;
            this.pending = null;
            clearTimeout(pending.timer);

            if (error) {
                pending.reject(new Error(error));
            } else {
                pending.resolve(data);
            }
        }
    }

    window.accountManager = new AccountManager();
})();
