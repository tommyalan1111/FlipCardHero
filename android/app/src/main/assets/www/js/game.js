/**
 * Flip Card Hero - Core Game Engine (Hero Edition)
 * Tối ưu hóa UI Fancy, Chibi Hero, Mobile Portrait & Android
 */

// ========================================================
// CẤU HÌNH HỆ THỐNG TIM
// - Tối đa 6 tim
// - Tự hồi 1 tim mỗi 30 phút (kể cả offline nhờ localStorage)
// ========================================================
const HEART_CONFIG = {
    max: 6,
    refillMs: 30 * 60 * 1000,
    storageKey: 'flipCardHero_hearts',
    lastRefillKey: 'flipCardHero_heartsLastRefill'
};

const BASE_SWEET_SPOT_WIDTH = 5;

// Leaderboard chỉ lấy dữ liệu mới mỗi 1 giờ
const LEADERBOARD_CACHE_KEY = 'flipCardHero_leaderboardCache';
const LEADERBOARD_CACHE_TTL_MS = 60 * 60 * 1000;

// ========================================================
// CẤU HÌNH 3 BOSS
// - Easy là mốc gốc hiện tại
// - Medium khó hơn Easy 30% (×1.3)
// - Hard khó hơn Medium 30% (×1.3) => ×1.69 so với Easy
// Độ khó tác động: Robo canh chính xác hơn, cược thông minh hơn
// và vùng vàng của người chơi hẹp lại tương ứng.
// ========================================================
const BOSS_LEVELS = {
    easy: {
        key: 'easy',
        nameKey: 'boss.easy',
        get name() { return window.i18n ? window.i18n.t(this.nameKey) : this.nameKey; },
        tier: 'EASY',
        multiplier: 1,
        heartSlots: 1,
        botAimChance: 0.10,
        botStakeAggression: 0.15,
        sweetSpotWidth: BASE_SWEET_SPOT_WIDTH
    },
    medium: {
        key: 'medium',
        nameKey: 'boss.medium',
        get name() { return window.i18n ? window.i18n.t(this.nameKey) : this.nameKey; },
        tier: 'MEDIUM',
        multiplier: 1.3,
        heartSlots: 2,
        botAimChance: 0.13,
        botStakeAggression: 0.45,
        sweetSpotWidth: BASE_SWEET_SPOT_WIDTH / 1.3
    },
    hard: {
        key: 'hard',
        nameKey: 'boss.hard',
        get name() { return window.i18n ? window.i18n.t(this.nameKey) : this.nameKey; },
        tier: 'HARD',
        multiplier: 1.69,
        heartSlots: 3,
        botAimChance: 0.169,
        botStakeAggression: 0.80,
        sweetSpotWidth: BASE_SWEET_SPOT_WIDTH / 1.69
    }
};

/**
 * Quản lý tim: lưu localStorage, hồi theo thời gian thực, hỗ trợ offline.
 */
class HeartManager {
    constructor(options = {}) {
        this.max = options.max || HEART_CONFIG.max;
        this.refillMs = options.refillMs || HEART_CONFIG.refillMs;
        this.onUpdate = options.onUpdate || null;

        this.hearts = this.max;
        this.lastRefillAt = Date.now();

        this._load();
        this._tickHandle = setInterval(() => this._tick(), 1000);

        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) this.refresh();
        });
        window.addEventListener('focus', () => this.refresh());
    }

    _read(key) {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            return null;
        }
    }

    _write(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            // Bỏ qua nếu trình duyệt chặn localStorage
        }
    }

    _load() {
        const now = Date.now();
        const savedHearts = parseInt(this._read(HEART_CONFIG.storageKey), 10);

        this.hearts = Number.isFinite(savedHearts)
            ? Math.max(0, Math.min(this.max, savedHearts))
            : this.max;

        let savedLast = parseInt(this._read(HEART_CONFIG.lastRefillKey), 10);
        if (!Number.isFinite(savedLast) || savedLast <= 0) {
            savedLast = now;
        }
        // Chống lỗi đổi giờ máy / dữ liệu tương lai
        if (savedLast > now) savedLast = now;
        this.lastRefillAt = savedLast;

        this._applyRegen(now);
        if (this.hearts >= this.max) {
            this.lastRefillAt = now;
        }

        this._save();
        this._emit();
    }

    _save() {
        this._write(HEART_CONFIG.storageKey, String(this.hearts));
        this._write(HEART_CONFIG.lastRefillKey, String(this.lastRefillAt));
    }

    _applyRegen(now) {
        if (this.hearts >= this.max) {
            this.lastRefillAt = now;
            return 0;
        }

        const elapsed = Math.max(0, now - this.lastRefillAt);
        const gained = Math.floor(elapsed / this.refillMs);
        if (gained <= 0) return 0;

        const before = this.hearts;
        this.hearts = Math.min(this.max, this.hearts + gained);
        this.lastRefillAt += gained * this.refillMs;
        if (this.hearts >= this.max) {
            this.lastRefillAt = now;
        }
        return this.hearts - before;
    }

    _emit() {
        if (typeof this.onUpdate === 'function') {
            this.onUpdate(this);
        }
    }

    _tick() {
        const before = this.hearts;
        this._applyRegen(Date.now());
        // Chỉ ghi localStorage khi tim thực sự thay đổi, tránh ghi mỗi giây
        if (this.hearts !== before) {
            this._save();
        }
        this._emit();
    }

    refresh() {
        this._applyRegen(Date.now());
        this._save();
        this._emit();
    }

    getSecondsToNextHeart() {
        if (this.hearts >= this.max) return 0;
        const elapsed = Math.max(0, Date.now() - this.lastRefillAt);
        return Math.max(0, Math.ceil((this.refillMs - elapsed) / 1000));
    }

    formatCountdown(seconds) {
        const safe = Math.max(0, Math.floor(seconds));
        const minutes = Math.floor(safe / 60);
        const secs = safe % 60;
        return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    canAfford(amount = 1) {
        this.refresh();
        return this.hearts >= amount;
    }

    consume(amount = 1) {
        this.refresh();
        if (this.hearts < amount) return false;

        const wasFull = this.hearts >= this.max;
        this.hearts -= amount;
        // Nếu đang đầy mà tiêu tim, bắt đầu tính giờ hồi từ lúc này
        if (wasFull) this.lastRefillAt = Date.now();

        this._save();
        this._emit();
        return true;
    }

    grant(amount = 1) {
        this.refresh();
        const before = this.hearts;
        this.hearts = Math.min(this.max, this.hearts + amount);
        if (this.hearts >= this.max) {
            this.lastRefillAt = Date.now();
        }
        this._save();
        this._emit();
        return this.hearts - before;
    }
}

class FlipCardGame {
    constructor() {
        // Boss được chọn ở menu (mặc định Easy)
        this.selectedBossKey = this.loadSelectedBossKey();
        this.currentBoss = BOSS_LEVELS[this.selectedBossKey];

        // Player & Opponent state
        this.playerName = (localStorage.getItem('flipCardHero_playerName') || 'LEO').toUpperCase();
        this.playerStats = this.loadPlayerStats();
        this.leaderboardData = null;
        this.accountSignedIn = false;
        this.signupBusy = false;
        this.loginBusy = false;
        this.playerCards = 10;
        this.botCards = 10;
        this.currentRound = 1;
        this.maxRounds = 5;

        // Pot & Round state
        this.potCards = 2; // Số bài hiện tại trên sàn cược
        this.currentStakePerSide = 1; // Số lá mỗi bên bỏ ra ở hiệp hiện tại
        this.lastRoundWinner = null; // 'player' | 'bot'

        // Active turn inside a round
        this.activeSmasher = 'player'; // 'player' | 'bot'
        this.isRoundInProgress = false;
        this.isGameEnded = false;

        // Smash Bar & Sweet Spot (5% ở Easy, hẹp dần theo boss)
        this.pointerPos = 0; // 0 to 100%
        this.pointerDirection = 1; // 1: phải, -1: trái
        this.sweetSpotWidth = BASE_SWEET_SPOT_WIDTH;
        this.sweetSpotStart = 50; // Vị trí ngẫu nhiên mỗi lượt
        this.isPointerMoving = false;
        this.animFrameId = null;
        this.lastFrameTime = 0;

        // Tốc độ canh lực (cân chỉnh chuẩn phản xạ người)
        this.baseSpeed = 55; // % per second ở 2 lá
        this.currentSpeed = 55;

        // Bot simulation
        this.botSmashTimeout = null;
        this.botAimCheckId = null;

        // Hệ thống tim
        this.heartManager = null;
        this.freeHeartBusy = false;
        this.menuToastTimer = null;
        this.menuToastHideTimer = null;

        // Vòng quay may mắn
        this.wheelAvailable = false;
        this.wheelUsed = false;
        this.wheelSpinning = false;
        this.wheelSlots = [];
        this.wheelCellEls = [];
        this.wheelSpinTimeout = null;

        // Quảng cáo interstitial
        this.interstitialShown = false;

        // Mỗi ván có một session id để bỏ qua các timeout cũ khi thoát/chơi lại
        this.gameSessionId = 0;

        // Screen states
        this.currentScreen = 'splash';

        this.initDom();
        this.heartManager = new HeartManager({
            onUpdate: (manager) => this.onHeartsChanged(manager)
        });
        this.updateFreeHeartButton();
        this.bindEvents();
        document.addEventListener('languagechange', () => this.onLanguageChanged());
        this.renderBossCards();
        this.updateBossSelectionUI();
        this.updatePlayerNameDisplays();
        this.startSplashScreen();
    }

    loadSelectedBossKey() {
        try {
            const saved = localStorage.getItem('flipCardHero_selectedBoss');
            if (saved && BOSS_LEVELS[saved]) return saved;
        } catch (e) {
            // localStorage có thể bị chặn
        }
        return 'easy';
    }

    t(key, params) {
        return window.i18n ? window.i18n.t(key, params) : key;
    }

    onLanguageChanged() {
        // i18n đã cập nhật các nhãn tĩnh; refresh các phần do game render
        this.updatePlayerNameDisplays();
        this.renderBossCards();
        this.updateBossSelectionUI();
        this.updateScoreboard();
        this.updateHeartUi();
        this.updateFreeHeartButton();
        this.updateTurnIndicator();
        this.dom.arenaMessage.textContent = this.t('game.arenaHint');
    }

    updateHeartUi() {
        if (!this.heartManager) return;
        this.onHeartsChanged(this.heartManager);
    }

    initDom() {
        this.dom = {
            // Screens
            screenSplash: document.getElementById('screen-splash'),
            screenPickName: document.getElementById('screen-pick-name'),
            screenSignup: document.getElementById('screen-signup'),
            screenLogin: document.getElementById('screen-login'),
            screenMainMenu: document.getElementById('screen-main-menu'),
            screenGame: document.getElementById('screen-game'),

            // Pick Name Elements
            inputHeroName: document.getElementById('input-hero-name'),
            charCounter: document.getElementById('char-counter'),
            nameValidationMsg: document.getElementById('name-validation-msg'),
            btnConfirmName: document.getElementById('btn-confirm-name'),
            signupUsername: document.getElementById('signup-username'),
            signupPassword: document.getElementById('signup-password'),
            signupRetype: document.getElementById('signup-retype'),
            signupError: document.getElementById('signup-error'),
            btnSignup: document.getElementById('btn-signup'),
            btnSignupText: document.getElementById('btn-signup-text'),
            loginUsername: document.getElementById('login-username'),
            loginPassword: document.getElementById('login-password'),
            loginError: document.getElementById('login-error'),
            btnLogin: document.getElementById('btn-login'),
            btnLoginText: document.getElementById('btn-login-text'),
            btnGoLogin: document.getElementById('btn-go-login'),
            btnGoSignup: document.getElementById('btn-go-signup'),
            menuPlayerNameTag: document.getElementById('menu-player-name-tag'),
            btnEditName: document.getElementById('btn-edit-name'),
            gamePlayerHudName: document.getElementById('game-player-hud-name'),
            rpsPlayerLabel: document.getElementById('rps-player-label'),

            // Main Menu Elements
            bossSelectRow: document.getElementById('boss-select-row'),
            btnBattle: document.getElementById('btn-battle'),
            btnBattleText: document.getElementById('btn-battle-text'),
            btnHowToPlay: document.getElementById('btn-how-to-play'),
            btnFreeHeart: document.getElementById('btn-free-heart'),
            btnFreeHeartText: document.getElementById('btn-free-heart-text'),
            btnLeaderboard: document.getElementById('btn-leaderboard'),
            menuToast: document.getElementById('menu-toast'),
            btnMenuSettings: document.getElementById('btn-menu-settings'),

            // Hearts
            menuHeartHud: document.getElementById('menu-heart-hud'),
            heartCount: document.getElementById('heart-count'),
            heartTimer: document.getElementById('heart-timer'),
            gameHeartHud: document.getElementById('game-heart-hud'),
            gameHeartCount: document.getElementById('game-heart-count'),
            wheelHeartCount: document.getElementById('wheel-heart-count'),
            noHeartsCountdown: document.getElementById('no-hearts-countdown'),

            // In-Game Header & Scoreboard
            btnExitToMenu: document.getElementById('btn-exit-to-menu'),
            roundBadge: document.getElementById('round-badge'),
            gameBossTier: document.getElementById('game-boss-tier'),
            gameBotHudName: document.getElementById('game-bot-hud-name'),
            rpsBotLabel: document.getElementById('rps-bot-label'),
            btnSoundToggle: document.getElementById('btn-sound-toggle'),
            playerCardCount: document.getElementById('player-card-count'),
            botCardCount: document.getElementById('bot-card-count'),
            playerDeckStack: document.getElementById('player-deck-stack'),
            botDeckStack: document.getElementById('bot-deck-stack'),

            // Arena
            tableArena: document.getElementById('table-arena'),
            turnIndicator: document.getElementById('turn-indicator'),
            potCountBadge: document.getElementById('pot-count-badge'),
            potCardStack: document.getElementById('pot-card-stack'),
            arenaMessage: document.getElementById('arena-message'),

            // Smash Bar Elements
            smashBarContainer: document.getElementById('smash-bar-container'),
            smashBarTrack: document.getElementById('smash-bar-track'),
            sweetSpot: document.getElementById('sweet-spot'),
            pointer: document.getElementById('smash-pointer'),
            btnSmash: document.getElementById('btn-smash'),

            // Modals & Overlays
            modalOverlay: document.getElementById('modal-overlay'),
            modalRps: document.getElementById('modal-rps'),
            modalStake: document.getElementById('modal-stake'),
            modalResult: document.getElementById('modal-result'),
            modalHowToPlay: document.getElementById('modal-how-to-play'),
            modalSettings: document.getElementById('modal-settings'),
            modalWheel: document.getElementById('modal-wheel'),
            modalNoHearts: document.getElementById('modal-no-hearts'),
            modalLeaderboard: document.getElementById('modal-leaderboard'),
            leaderboardMyScore: document.getElementById('leaderboard-my-score'),
            leaderboardList: document.getElementById('leaderboard-list'),
            leaderboardUpdated: document.getElementById('leaderboard-updated'),
            btnCloseLeaderboard: document.getElementById('btn-close-leaderboard'),
            btnRefreshLeaderboard: document.getElementById('btn-refresh-leaderboard'),

            // RPS elements
            rpsPlayerChoice: document.getElementById('rps-player-choice'),
            rpsBotChoice: document.getElementById('rps-bot-choice'),
            rpsStatus: document.getElementById('rps-status'),
            rpsButtons: document.querySelectorAll('.btn-rps'),

            // Stake elements
            stakePromptText: document.getElementById('stake-prompt-text'),
            stakeButtonsContainer: document.getElementById('stake-buttons-container'),
            stakeBotNotice: document.getElementById('stake-bot-notice'),

            // Result elements (You Won / You Lost)
            resultHeroImg: document.getElementById('result-hero-img'),
            resultTitle: document.getElementById('result-title'),
            resultSubtitle: document.getElementById('result-subtitle'),
            resultScoreDetail: document.getElementById('result-score-detail'),
            btnPlayAgain: document.getElementById('btn-play-again'),
            btnResultHome: document.getElementById('btn-result-home'),
            btnOpenWheel: document.getElementById('btn-open-wheel'),
            wheelCtaReward: document.getElementById('wheel-cta-reward'),

            // Lucky Wheel
            wheelGrid: document.getElementById('wheel-grid'),
            wheelResult: document.getElementById('wheel-result'),
            btnSpinWheel: document.getElementById('btn-spin-wheel'),
            btnWheelContinue: document.getElementById('btn-wheel-continue'),
            btnWheelBack: document.getElementById('btn-wheel-back'),

            // No hearts modal
            btnCloseNoHearts: document.getElementById('btn-close-no-hearts'),
            btnNoHeartsClose: document.getElementById('btn-no-hearts-close'),

            // How to Play & Settings modal buttons
            btnCloseHow: document.getElementById('btn-close-how'),
            btnCloseSettings: document.getElementById('btn-close-settings'),
            settingSoundToggle: document.getElementById('setting-sound-toggle'),
            settingVibrateToggle: document.getElementById('setting-vibrate-toggle')
        };
    }

    bindEvents() {
        // Xử lý màn hình chọn tên (Pick a Name)
        const handleNameInput = () => {
            let val = this.dom.inputHeroName.value;
            // Loại bỏ hoàn toàn ký tự lạ và khoảng trắng ngay lập tức
            const sanitized = val.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
            if (val !== sanitized) {
                this.dom.inputHeroName.value = sanitized;
                val = sanitized;
            }

            this.dom.charCounter.textContent = `${val.length}/9`;

            if (val.length === 0) {
                this.dom.nameValidationMsg.textContent = this.t('name.info');
                this.dom.nameValidationMsg.className = 'validation-msg';
                this.dom.inputHeroName.className = 'custom-name-input';
                this.dom.btnConfirmName.disabled = true;
                return;
            }

            if (val.length < 3) {
                this.dom.nameValidationMsg.textContent = this.t('name.tooShort');
                this.dom.nameValidationMsg.className = 'validation-msg error';
                this.dom.inputHeroName.className = 'custom-name-input is-invalid';
                this.dom.btnConfirmName.disabled = true;
                return;
            }

            if (val.length > 9) {
                this.dom.nameValidationMsg.textContent = this.t('name.tooLong');
                this.dom.nameValidationMsg.className = 'validation-msg error';
                this.dom.inputHeroName.className = 'custom-name-input is-invalid';
                this.dom.btnConfirmName.disabled = true;
                return;
            }

            // Hợp lệ
            this.dom.nameValidationMsg.textContent = this.t('name.valid');
            this.dom.nameValidationMsg.className = 'validation-msg valid';
            this.dom.inputHeroName.className = 'custom-name-input is-valid';
            this.dom.btnConfirmName.disabled = false;
        };

        this.dom.inputHeroName.addEventListener('input', handleNameInput);
        this.dom.inputHeroName.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !this.dom.btnConfirmName.disabled) {
                this.confirmPlayerName();
            }
        });

        this.dom.btnConfirmName.addEventListener('click', () => {
            window.soundManager.playClick();
            this.confirmPlayerName();
        });


        // Sign up
        const handleSignupUsername = () => {
            const input = this.dom.signupUsername;
            const sanitized = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 9);
            if (input.value !== sanitized) {
                input.value = sanitized;
            }
            this.setSignupError('');
        };

        this.dom.signupUsername.addEventListener('input', handleSignupUsername);
        this.dom.signupPassword.addEventListener('input', () => this.setSignupError(''));
        this.dom.signupRetype.addEventListener('input', () => this.setSignupError(''));

        const submitSignupFromKeyboard = (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.submitSignup();
            }
        };
        this.dom.signupPassword.addEventListener('keydown', submitSignupFromKeyboard);
        this.dom.signupRetype.addEventListener('keydown', submitSignupFromKeyboard);

        this.dom.btnSignup.addEventListener('click', () => {
            window.soundManager.playClick();
            this.submitSignup();
        });

        // Log in
        const handleLoginUsername = () => {
            const input = this.dom.loginUsername;
            const sanitized = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 9);
            if (input.value !== sanitized) {
                input.value = sanitized;
            }
            this.setLoginError('');
        };

        this.dom.loginUsername.addEventListener('input', handleLoginUsername);
        this.dom.loginPassword.addEventListener('input', () => this.setLoginError(''));

        this.dom.loginPassword.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.submitLogin();
            }
        });

        this.dom.btnLogin.addEventListener('click', () => {
            window.soundManager.playClick();
            this.submitLogin();
        });

        this.dom.btnGoLogin.addEventListener('click', () => {
            window.soundManager.playClick();
            const suggested = this.dom.signupUsername.value
                || localStorage.getItem('flipCardHero_playerName')
                || '';
            this.dom.loginUsername.value = String(suggested).toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 9);
            this.setLoginError('');
            this.switchScreen('login');
        });

        this.dom.btnGoSignup.addEventListener('click', () => {
            window.soundManager.playClick();
            this.dom.signupUsername.value = this.dom.loginUsername.value || this.dom.signupUsername.value;
            this.setSignupError('');
            this.switchScreen('signup');
        });

        // Nút đổi tên ở Main Menu
        this.dom.btnEditName.addEventListener('click', () => {
            window.soundManager.playClick();
            this.dom.inputHeroName.value = this.playerName;
            handleNameInput();
            this.switchScreen('pick-name');
        });

        // Vào trận với boss đang chọn (tốn 1 tim)
        this.dom.btnBattle.addEventListener('click', () => {
            window.soundManager.playClick();
            this.tryStartBattle();
        });

        // Vòng quay may mắn
        this.dom.btnOpenWheel.addEventListener('click', () => {
            window.soundManager.playClick();
            this.openWheel();
        });

        this.dom.btnSpinWheel.addEventListener('click', () => {
            this.spinWheel();
        });

        this.dom.btnWheelContinue.addEventListener('click', () => {
            window.soundManager.playClick();
            this.closeWheelToResult();
        });

        this.dom.btnWheelBack.addEventListener('click', () => {
            if (this.wheelSpinning) return;
            window.soundManager.playClick();
            this.closeWheelToResult();
        });

        // Modal hết tim
        this.dom.btnCloseNoHearts.addEventListener('click', () => {
            window.soundManager.playClick();
            this.hideModals();
        });

        this.dom.btnNoHeartsClose.addEventListener('click', () => {
            window.soundManager.playClick();
            this.hideModals();
        });

        this.dom.btnHowToPlay.addEventListener('click', () => {
            window.soundManager.playClick();
            this.showModal(this.dom.modalHowToPlay);
        });

        this.dom.btnFreeHeart.addEventListener('click', () => {
            window.soundManager.playClick();
            this.watchRewardedAdForHeart();
        });

        this.dom.btnLeaderboard.addEventListener('click', () => {
            window.soundManager.playClick();
            this.openLeaderboard();
        });

        this.dom.btnCloseLeaderboard.addEventListener('click', () => {
            window.soundManager.playClick();
            this.hideModals();
        });

        this.dom.btnRefreshLeaderboard.addEventListener('click', () => {
            window.soundManager.playClick();
            this.refreshLeaderboard();
        });

        this.dom.btnMenuSettings.addEventListener('click', () => {
            window.soundManager.playClick();
            this.showModal(this.dom.modalSettings);
        });

        // Nút Back trên các modal để về Menu
        document.querySelectorAll('.btn-back-to-menu-action').forEach(btn => {
            btn.addEventListener('click', () => {
                window.soundManager.playClick();
                this.stopPointerMovement();
                if (this.botSmashTimeout) clearTimeout(this.botSmashTimeout);
                this.hideModals();
                this.switchScreen('main-menu');
            });
        });

        const btnBackHow = document.getElementById('btn-back-how');
        if (btnBackHow) {
            btnBackHow.addEventListener('click', () => {
                window.soundManager.playClick();
                this.hideModals();
            });
        }

        const btnBackSettings = document.getElementById('btn-back-settings');
        if (btnBackSettings) {
            btnBackSettings.addEventListener('click', () => {
                window.soundManager.playClick();
                this.hideModals();
            });
        }

        this.dom.btnCloseHow.addEventListener('click', () => {
            window.soundManager.playClick();
            this.hideModals();
        });

        this.dom.btnCloseSettings.addEventListener('click', () => {
            window.soundManager.playClick();
            this.hideModals();
        });

        // Nút về menu chính khi đang trong game
        this.dom.btnExitToMenu.addEventListener('click', () => {
            window.soundManager.playClick();
            this.stopPointerMovement();
            if (this.botSmashTimeout) clearTimeout(this.botSmashTimeout);
            if (this.botAimCheckId) cancelAnimationFrame(this.botAimCheckId);
            this.isGameEnded = true;
            this.hideModals();
            this.switchScreen('main-menu');
            this.heartManager.refresh();
        });

        // Nút về menu từ màn hình kết quả
        this.dom.btnResultHome.addEventListener('click', () => {
            window.soundManager.playClick();
            this.hideModals();
            this.switchScreen('main-menu');
            this.heartManager.refresh();
        });

        // Nút chơi lại từ màn hình kết quả (tốn thêm 1 tim)
        this.dom.btnPlayAgain.addEventListener('click', () => {
            window.soundManager.playClick();
            this.hideModals();
            if (!this.heartManager.consume(1)) {
                this.switchScreen('main-menu');
                this.showNoHeartsModal();
                return;
            }

            this.startNewGame();
        });

        // Settings toggles
        this.dom.settingSoundToggle.addEventListener('change', (e) => {
            window.soundManager.enabled = e.target.checked;
            this.dom.btnSoundToggle.textContent = window.soundManager.enabled ? '🔊' : '🔇';
        });

        this.dom.settingVibrateToggle.addEventListener('change', (e) => {
            window.soundManager.vibrationEnabled = e.target.checked;
        });

        this.dom.btnSoundToggle.addEventListener('click', () => {
            window.soundManager.enabled = !window.soundManager.enabled;
            this.dom.btnSoundToggle.textContent = window.soundManager.enabled ? '🔊' : '🔇';
            this.dom.settingSoundToggle.checked = window.soundManager.enabled;
            window.soundManager.playClick();
        });

        // Nút ĐẬP (SMASH) - Hỗ trợ cả Touch cảm ứng và Click
        const handleSmash = (e) => {
            if (e) e.preventDefault();
            if (this.activeSmasher === 'player' && this.isPointerMoving) {
                this.executeSmash('player');
            }
        };

        this.dom.btnSmash.addEventListener('pointerdown', handleSmash);

        // Hỗ trợ phím Space trên máy tính
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && this.activeSmasher === 'player' && this.isPointerMoving) {
                e.preventDefault();
                this.executeSmash('player');
            }
        });

        // Oẳn tù tì (Kéo - Búa - Bao)
        this.dom.rpsButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const choice = btn.dataset.choice;
                this.handlePlayerRpsChoice(choice);
            });
        });
    }

    // ========================================================
    // HỆ THỐNG TIM & CHỌN BOSS
    // ========================================================

    onHeartsChanged(manager) {
        const hearts = manager.hearts;
        const max = manager.max;
        const countdown = manager.formatCountdown(manager.getSecondsToNextHeart());
        const timerText = hearts >= max ? this.t('common.full') : countdown;

        if (this.dom.heartCount) this.dom.heartCount.textContent = hearts;
        if (this.dom.heartTimer) this.dom.heartTimer.textContent = timerText;
        if (this.dom.gameHeartCount) this.dom.gameHeartCount.textContent = hearts;
        if (this.dom.wheelHeartCount) this.dom.wheelHeartCount.textContent = hearts;
        if (this.dom.noHeartsCountdown) this.dom.noHeartsCountdown.textContent = countdown;

        [this.dom.menuHeartHud, this.dom.gameHeartHud].forEach((hud) => {
            if (!hud) return;
            hud.classList.toggle('is-empty', hearts <= 0);
        });

        if (this.dom.btnBattle) {
            this.dom.btnBattle.classList.toggle('is-out-of-hearts', hearts <= 0);
        }

        this.updateFreeHeartButton();
    }

    renderBossCards() {
        if (!this.dom.bossSelectRow) return;
        this.dom.bossSelectRow.innerHTML = '';

        Object.values(BOSS_LEVELS).forEach((boss) => {
            const card = document.createElement('button');
            card.type = 'button';
            card.className = 'boss-card';
            card.dataset.boss = boss.key;
            card.setAttribute('aria-label', `Boss ${boss.tier} - ${boss.name}`);
            card.innerHTML = `
                <span class="boss-check">✓</span>
                <span class="boss-tier ${boss.key}">${boss.tier}</span>
                <span class="boss-avatar-ring">
                    <img src="icons/hero-bot.svg" class="boss-avatar ${boss.key}" alt="${boss.name}">
                </span>
                <span class="boss-name">${boss.name}</span>
            `;

            card.addEventListener('click', () => {
                window.soundManager.playClick();
                this.selectBoss(boss.key);
            });

            this.dom.bossSelectRow.appendChild(card);
        });
    }

    selectBoss(key) {
        if (!BOSS_LEVELS[key]) return;
        this.selectedBossKey = key;
        this.currentBoss = BOSS_LEVELS[key];
        try {
            localStorage.setItem('flipCardHero_selectedBoss', key);
        } catch (e) {
            // Bỏ qua nếu localStorage bị chặn
        }
        this.updateBossSelectionUI();
    }

    updateBossSelectionUI() {
        const boss = BOSS_LEVELS[this.selectedBossKey] || BOSS_LEVELS.easy;

        document.querySelectorAll('.boss-card').forEach((card) => {
            card.classList.toggle('selected', card.dataset.boss === boss.key);
        });

        if (this.dom.btnBattleText) {
            this.dom.btnBattleText.textContent = this.t('menu.battle', { boss: boss.name });
        }

        this.applyBossToHud();
    }

    applyBossToHud() {
        const boss = this.currentBoss || BOSS_LEVELS[this.selectedBossKey] || BOSS_LEVELS.easy;

        if (this.dom.gameBotHudName) {
            this.dom.gameBotHudName.textContent = boss.name;
        }
        if (this.dom.gameBossTier) {
            this.dom.gameBossTier.textContent = boss.tier;
            this.dom.gameBossTier.className = `boss-tier-chip ${boss.key}`;
        }
        if (this.dom.rpsBotLabel) {
            this.dom.rpsBotLabel.textContent = boss.tier === 'EASY' ? this.t('rps.robot') : boss.name;
        }
    }

    tryStartBattle() {
        if (this.currentScreen !== 'main-menu') return;

        const boss = BOSS_LEVELS[this.selectedBossKey] || BOSS_LEVELS.easy;
        this.currentBoss = boss;

        if (!this.heartManager || !this.heartManager.consume(1)) {
            this.showNoHeartsModal();
            return;
        }

        this.wheelAvailable = false;
        this.wheelUsed = false;
        this.applyBossToHud();
        this.switchScreen('game');
        this.startNewGame();
    }

    showNoHeartsModal() {
        if (this.currentScreen === 'game') {
            this.stopPointerMovement();
            if (this.botSmashTimeout) clearTimeout(this.botSmashTimeout);
            if (this.botAimCheckId) cancelAnimationFrame(this.botAimCheckId);
            this.isGameEnded = true;
            this.hideModals();
            this.switchScreen('main-menu');
        }
        this.heartManager.refresh();
        this.showModal(this.dom.modalNoHearts);
    }

    showResultInterstitial() {
        if (!window.adsManager || this.interstitialShown) return;

        this.interstitialShown = true;
        window.adsManager.showInterstitial();
    }

    updateFreeHeartButton() {
        if (!this.dom.btnFreeHeart || !this.heartManager) return;
        if (this.freeHeartBusy) return;

        const isFull = this.heartManager.hearts >= this.heartManager.max;
        this.dom.btnFreeHeart.disabled = isFull;
        this.dom.btnFreeHeart.classList.toggle('is-full', isFull);

        if (this.dom.btnFreeHeartText) {
            this.dom.btnFreeHeartText.textContent = isFull
                ? this.t('menu.freeHeartFull')
                : this.t('menu.freeHeart');
        }
    }

    setFreeHeartButtonLoading() {
        if (!this.dom.btnFreeHeart) return;
        this.dom.btnFreeHeart.disabled = true;
        this.dom.btnFreeHeart.classList.remove('is-full');
        if (this.dom.btnFreeHeartText) {
            this.dom.btnFreeHeartText.textContent = this.t('freeHeart.loading');
        }
    }

    async watchRewardedAdForHeart() {
        if (this.freeHeartBusy) return;

        if (!this.heartManager) return;

        if (this.heartManager.hearts >= this.heartManager.max) {
            this.showMenuToast(this.t('freeHeart.full'), 'info');
            return;
        }

        if (!window.adsManager || typeof window.adsManager.showRewardedAd !== 'function') {
            this.showMenuToast(this.t('freeHeart.adOnly'), 'error');
            return;
        }

        this.freeHeartBusy = true;
        this.setFreeHeartButtonLoading();

        let status = 'failed';
        try {
            status = await window.adsManager.showRewardedAd();
        } catch (e) {
            console.error('[FreeHeart] Lỗi khi xem quảng cáo:', e);
            status = 'failed';
        }

        this.freeHeartBusy = false;

        if (status === 'rewarded') {
            const added = this.heartManager.grant(1);
            this.showMenuToast(
                added > 0
                    ? this.t('freeHeart.success')
                    : this.t('freeHeart.full'),
                added > 0 ? 'success' : 'info'
            );
        } else if (status === 'unavailable') {
            this.showMenuToast(this.t('freeHeart.adOnly'), 'error');
        } else if (status === 'closed') {
            this.showMenuToast(this.t('freeHeart.watched'), 'info');
        } else if (status === 'timeout') {
            this.showMenuToast(this.t('freeHeart.timeout'), 'error');
        } else {
            this.showMenuToast(this.t('freeHeart.noAd'), 'error');
        }

        this.updateFreeHeartButton();
    }

    showMenuToast(message, type = 'info') {
        if (!this.dom.menuToast) return;

        if (this.menuToastTimer) clearTimeout(this.menuToastTimer);
        if (this.menuToastHideTimer) clearTimeout(this.menuToastHideTimer);

        const toast = this.dom.menuToast;
        toast.textContent = message;
        toast.className = `menu-toast ${type}`;
        toast.classList.remove('hidden');
        void toast.offsetWidth;
        toast.classList.add('show');

        this.menuToastTimer = setTimeout(() => {
            toast.classList.remove('show');
            this.menuToastHideTimer = setTimeout(() => {
                toast.classList.add('hidden');
            }, 220);
        }, 2800);
    }

    // ========================================================
    // BẢNG XẾP HẠNG (FIREBASE - NATIVE ANDROID)
    // ========================================================

    loadPlayerStats() {
        const defaults = { easyWins: 0, mediumWins: 0, hardWins: 0 };

        try {
            const raw = localStorage.getItem('flipCardHero_stats');
            if (!raw) return defaults;

            const data = JSON.parse(raw);
            return {
                easyWins: Math.max(0, parseInt(data.easyWins, 10) || 0),
                mediumWins: Math.max(0, parseInt(data.mediumWins, 10) || 0),
                hardWins: Math.max(0, parseInt(data.hardWins, 10) || 0)
            };
        } catch (e) {
            return defaults;
        }
    }

    savePlayerStats() {
        try {
            localStorage.setItem('flipCardHero_stats', JSON.stringify(this.playerStats));
        } catch (e) {
            // Bỏ qua nếu localStorage bị chặn
        }
    }

    getTotalWins() {
        return (this.playerStats.easyWins || 0)
            + (this.playerStats.mediumWins || 0)
            + (this.playerStats.hardWins || 0);
    }

    getBestBoss() {
        if (this.playerStats.hardWins > 0) return 3;
        if (this.playerStats.mediumWins > 0) return 2;
        if (this.playerStats.easyWins > 0) return 1;
        return 0;
    }

    getLeaderboardScore() {
        return (this.playerStats.easyWins || 0) * 1
            + (this.playerStats.mediumWins || 0) * 2
            + (this.playerStats.hardWins || 0) * 3;
    }

    submitCurrentScore() {
        if (!window.leaderboardManager || typeof window.leaderboardManager.submitScore !== 'function') {
            return false;
        }

        return window.leaderboardManager.submitScore({
            name: this.playerName,
            score: this.getLeaderboardScore(),
            easyWins: this.playerStats.easyWins || 0,
            mediumWins: this.playerStats.mediumWins || 0,
            hardWins: this.playerStats.hardWins || 0,
            bestBoss: this.getBestBoss()
        });
    }

    recordWinForLeaderboard() {
        if (!this.currentBoss) return;

        const key = this.currentBoss.key;
        if (key !== 'easy' && key !== 'medium' && key !== 'hard') return;

        const field = `${key}Wins`;
        this.playerStats[field] = (this.playerStats[field] || 0) + 1;
        this.savePlayerStats();
        this.submitCurrentScore();
    }

    openLeaderboard() {
        this.updateLeaderboardPreview(null);
        this.showModal(this.dom.modalLeaderboard);

        // Cập nhật tên / điểm mới nhất trước khi tải bảng
        if (this.getTotalWins() > 0) {
            this.submitCurrentScore();
        }

        const cache = this.loadLeaderboardCache();
        if (cache && (Date.now() - cache.fetchedAt) < LEADERBOARD_CACHE_TTL_MS) {
            this.leaderboardData = cache.data;
            this.renderLeaderboard(cache.data);
            this.showLeaderboardUpdatedAt(cache.fetchedAt);
            return;
        }

        this.fetchLeaderboard();
    }

    refreshLeaderboard() {
        const cache = this.loadLeaderboardCache();
        if (cache && (Date.now() - cache.fetchedAt) < LEADERBOARD_CACHE_TTL_MS) {
            const remaining = LEADERBOARD_CACHE_TTL_MS - (Date.now() - cache.fetchedAt);
            this.setLeaderboardNote(this.t('leaderboard.cooldown', {
                time: this.formatLeaderboardRemaining(remaining)
            }));
            return;
        }

        this.fetchLeaderboard();
    }

    fetchLeaderboard() {
        this.renderLeaderboardState(this.t('leaderboard.loading'), false);
        this.setLeaderboardNote('');

        const cached = this.loadLeaderboardCache();

        if (!window.leaderboardManager || !window.leaderboardManager.isAvailable()) {
            if (cached) {
                this.leaderboardData = cached.data;
                this.renderLeaderboard(cached.data);
                this.setLeaderboardNote(this.t('leaderboard.cachedError'));
            } else {
                this.renderLeaderboardState(this.t('leaderboard.unavailable'), true);
            }
            return;
        }

        window.leaderboardManager.setHandlers({
            onData: (data) => {
                this.leaderboardData = data;
                this.saveLeaderboardCache(data);
                this.renderLeaderboard(data);
                this.showLeaderboardUpdatedAt(Date.now());
            },
            onError: (message) => {
                if (cached) {
                    this.leaderboardData = cached.data;
                    this.renderLeaderboard(cached.data);
                    this.setLeaderboardNote(this.t('leaderboard.cachedError'));
                } else {
                    let text = this.t('leaderboard.error');
                    if (message === 'unavailable') text = this.t('leaderboard.unavailable');
                    else if (message === 'timeout') text = this.t('leaderboard.timeout');
                    else if (message === 'PERMISSION_DENIED') text = this.t('leaderboard.errorPermission');
                    else if (message === 'NETWORK') text = this.t('leaderboard.errorNetwork');
                    else if (message === 'AUTH_FAILED') text = this.t('leaderboard.errorAuth');
                    else if (message === 'INDEX_MISSING') text = this.t('leaderboard.errorIndex');
                    this.renderLeaderboardState(text, true);
                    this.setLeaderboardNote('');
                }
                this.updateLeaderboardPreview(0);
            }
        });

        window.leaderboardManager.fetchTop();
    }

    loadLeaderboardCache() {
        try {
            const raw = localStorage.getItem(LEADERBOARD_CACHE_KEY);
            if (!raw) return null;

            const cache = JSON.parse(raw);
            if (!cache || !cache.data || typeof cache.fetchedAt !== 'number') {
                return null;
            }
            return cache;
        } catch (e) {
            return null;
        }
    }

    saveLeaderboardCache(data) {
        try {
            localStorage.setItem(LEADERBOARD_CACHE_KEY, JSON.stringify({
                fetchedAt: Date.now(),
                data
            }));
        } catch (e) {
            // Bỏ qua nếu localStorage bị chặn
        }
    }

    showLeaderboardUpdatedAt(timestamp) {
        const locale = window.i18n && window.i18n.lang === 'en' ? 'en-US' : 'vi-VN';
        const time = new Date(timestamp).toLocaleTimeString(locale, {
            hour: '2-digit',
            minute: '2-digit'
        });
        this.setLeaderboardNote(this.t('leaderboard.updatedAt', { time }));
    }

    setLeaderboardNote(text) {
        if (this.dom.leaderboardUpdated) {
            this.dom.leaderboardUpdated.textContent = text;
        }
    }

    formatLeaderboardRemaining(ms) {
        const total = Math.max(0, Math.ceil(ms / 1000));
        const minutes = Math.floor(total / 60);
        const seconds = total % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }

    updateLeaderboardPreview(rank) {
        if (!this.dom.leaderboardMyScore) return;

        const box = this.dom.leaderboardMyScore;
        box.innerHTML = '';

        const info = document.createElement('div');
        info.className = 'leaderboard-me-info';

        const nameLine = document.createElement('span');
        nameLine.textContent = this.t('leaderboard.youLine', { name: this.playerName.toUpperCase(), wins: this.getTotalWins() });

        const rankLine = document.createElement('span');
        rankLine.className = 'leaderboard-my-rank';
        if (typeof rank === 'number' && rank > 0) {
            rankLine.textContent = rank > 50
                ? this.t('leaderboard.rankOutside', { rank })
                : this.t('leaderboard.rank', { rank });
            if (rank > 50) rankLine.classList.add('outside');
        } else if (rank === 0) {
            rankLine.textContent = this.t('leaderboard.unranked');
        } else {
            rankLine.textContent = this.t('leaderboard.loadingRank');
        }

        info.appendChild(nameLine);
        info.appendChild(rankLine);

        const right = document.createElement('strong');
        right.textContent = this.t('leaderboard.points', { count: this.getLeaderboardScore() });

        box.appendChild(info);
        box.appendChild(right);
    }

    renderLeaderboardState(message, isError) {
        if (!this.dom.leaderboardList) return;

        const list = this.dom.leaderboardList;
        list.innerHTML = '';

        const state = document.createElement('div');
        state.className = `leaderboard-state${isError ? ' error' : ''}`;
        state.textContent = message;
        list.appendChild(state);
    }

    renderLeaderboard(data) {
        if (!this.dom.leaderboardList) return;

        const list = this.dom.leaderboardList;
        const entries = data && Array.isArray(data.entries) ? data.entries : [];
        const myUid = data && data.myUid ? data.myUid : '';
        const myRank = data && typeof data.myRank === 'number' ? data.myRank : 0;

        this.updateLeaderboardPreview(myRank);
        list.innerHTML = '';

        if (entries.length === 0) {
            this.renderLeaderboardState(this.t('leaderboard.empty'), false);
            return;
        }

        entries.forEach((entry, index) => {
            const row = document.createElement('div');
            row.className = 'leaderboard-row';
            if (index < 3) row.classList.add(`top-${index + 1}`);
            if (myUid && entry.uid === myUid) row.classList.add('is-me');

            const rank = document.createElement('span');
            rank.className = 'leaderboard-rank';
            rank.textContent = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : String(index + 1);

            const info = document.createElement('div');
            info.style.minWidth = '0';

            const name = document.createElement('div');
            name.className = 'leaderboard-name';
            name.textContent = String(entry.name || 'PLAYER').toUpperCase();

            const meta = document.createElement('div');
            meta.className = 'leaderboard-meta';
            const totalWins = (entry.easyWins || 0) + (entry.mediumWins || 0) + (entry.hardWins || 0);
            meta.textContent = this.t('leaderboard.wins', { count: totalWins });

            info.appendChild(name);
            info.appendChild(meta);

            const score = document.createElement('span');
            score.className = 'leaderboard-score';
            score.textContent = String(entry.score || 0);
            const unit = document.createElement('small');
            unit.textContent = this.t('leaderboard.pointsUnit');
            score.appendChild(unit);

            row.appendChild(rank);
            row.appendChild(info);
            row.appendChild(score);
            list.appendChild(row);
        });
    }

    confirmPlayerName() {
        const val = this.dom.inputHeroName.value.trim();
        if (val.length >= 3 && val.length <= 9 && /^[a-zA-Z0-9]+$/.test(val)) {
            this.playerName = val.toUpperCase();
            localStorage.setItem('flipCardHero_playerName', this.playerName);
            this.updatePlayerNameDisplays();
            if (this.getTotalWins() > 0) {
                this.submitCurrentScore();
            }
            this.switchScreen('main-menu');
        }
    }

    updatePlayerNameDisplays() {
        const upper = this.playerName.toUpperCase();
        if (this.dom.menuPlayerNameTag) {
            this.dom.menuPlayerNameTag.textContent = `${upper} (${this.t('game.you')})`;
        }
        if (this.dom.gamePlayerHudName) {
            this.dom.gamePlayerHudName.textContent = upper;
        }
        if (this.dom.rpsPlayerLabel) {
            this.dom.rpsPlayerLabel.textContent = upper;
        }
    }

    // ========================================================
    // SCREEN MANAGEMENT (CHUYỂN MÀN HÌNH)
    // ========================================================

    startSplashScreen() {
        this.switchScreen('splash');

        setTimeout(() => {
            if (this.currentScreen === 'splash') {
                this.finishSplash();
            }
        }, 1700);

        this.dom.screenSplash.addEventListener('click', () => {
            if (this.currentScreen === 'splash') {
                this.finishSplash();
            }
        }, { once: true });
    }

    async finishSplash() {
        if (this.currentScreen !== 'splash') return;

        if (window.accountManager && window.accountManager.hasBridge() && window.accountManager.isAvailable()) {
            try {
                const state = await window.accountManager.checkAccount();
                if (this.currentScreen !== 'splash') return;

                if (state && state.status === 'signed_in' && state.username) {
                    this.applySignedInAccount(state.username);
                    return;
                }

                if (state && state.status === 'signup_required') {
                    const saved = localStorage.getItem('flipCardHero_playerName') || '';
                    const username = saved.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 9);
                    if (username.length >= 3) {
                        this.dom.signupUsername.value = username;
                    }
                    this.switchScreen('signup');
                    return;
                }
            } catch (e) {
                // Firebase chưa sẵn sàng -> dùng luồng local cũ
            }
        }

        this.startLocalFlow();
    }

    startLocalFlow() {
        this.accountSignedIn = false;
        this.signupBusy = false;
        this.loginBusy = false;
        if (this.dom.btnEditName) {
            this.dom.btnEditName.classList.remove('hidden');
        }

        const saved = localStorage.getItem('flipCardHero_playerName');
        if (saved && saved.length >= 3 && saved.length <= 9) {
            this.playerName = saved.toUpperCase();
            this.updatePlayerNameDisplays();
            this.switchScreen('main-menu');
        } else {
            this.switchScreen('pick-name');
        }
    }

    applySignedInAccount(username) {
        this.accountSignedIn = true;
        const normalized = String(username || '')
            .toUpperCase()
            .replace(/[^A-Z0-9]/g, '')
            .slice(0, 9);

        if (normalized.length >= 3) {
            this.playerName = normalized;
            try {
                localStorage.setItem('flipCardHero_playerName', this.playerName);
            } catch (e) {
                // Bỏ qua nếu localStorage bị chặn
            }
        }

        this.updatePlayerNameDisplays();
        if (this.dom.btnEditName) {
            this.dom.btnEditName.classList.add('hidden');
        }
        this.switchScreen('main-menu');
    }

    setSignupError(message) {
        if (!this.dom.signupError) return;
        this.dom.signupError.textContent = message || '';
        this.dom.signupError.className = message ? 'validation-msg error' : 'validation-msg';
    }

    setSignupLoading(loading) {
        if (!this.dom.btnSignup) return;
        this.dom.btnSignup.disabled = loading;
        if (this.dom.btnSignupText) {
            this.dom.btnSignupText.textContent = loading
                ? this.t('signup.creating')
                : this.t('signup.submit');
        }
    }

    mapSignupError(code) {
        switch (code) {
            case 'USERNAME_TAKEN':
                return this.t('signup.errorTaken');
            case 'INVALID_USERNAME':
                return this.t('signup.errorUsername');
            case 'WEAK_PASSWORD':
                return this.t('signup.errorPassword');
            case 'NETWORK':
                return this.t('signup.errorNetwork');
            case 'PERMISSION_DENIED':
                return this.t('signup.errorPermission');
            case 'AUTH_DISABLED':
                return this.t('signup.errorAuthDisabled');
            case 'UNAVAILABLE':
                return this.t('signup.errorUnavailable');
            case 'AUTH_NOT_READY':
            case 'TIMEOUT':
                return this.t('signup.errorAuth');
            default:
                return this.t('signup.errorGeneric');
        }
    }

    async submitSignup() {
        if (this.signupBusy) return;

        const username = this.dom.signupUsername.value.trim().toUpperCase();
        const password = this.dom.signupPassword.value;
        const retype = this.dom.signupRetype.value;

        if (!/^[A-Z0-9]{3,9}$/.test(username)) {
            this.setSignupError(this.t('signup.errorUsername'));
            return;
        }
        if (password.length < 6) {
            this.setSignupError(this.t('signup.errorPassword'));
            return;
        }
        if (password !== retype) {
            this.setSignupError(this.t('signup.errorRetype'));
            return;
        }
        if (!window.accountManager || !window.accountManager.hasBridge()) {
            this.setSignupError(this.t('signup.errorUnavailable'));
            return;
        }

        this.signupBusy = true;
        this.setSignupError('');
        this.setSignupLoading(true);

        try {
            const result = await window.accountManager.signUp(username, password);
            if (result && result.status === 'signed_in') {
                this.applySignedInAccount(result.username || username);
            } else {
                this.setSignupError(this.t('signup.errorGeneric'));
            }
        } catch (e) {
            this.setSignupError(this.mapSignupError(e && e.message ? e.message : ''));
        }

        this.signupBusy = false;
        this.setSignupLoading(false);
    }


    setLoginError(message) {
        if (!this.dom.loginError) return;
        this.dom.loginError.textContent = message || '';
        this.dom.loginError.className = message ? 'validation-msg error' : 'validation-msg';
    }

    setLoginLoading(loading) {
        if (!this.dom.btnLogin) return;
        this.dom.btnLogin.disabled = loading;
        if (this.dom.btnLoginText) {
            this.dom.btnLoginText.textContent = loading
                ? this.t('login.loading')
                : this.t('login.submit');
        }
    }

    mapLoginError(code) {
        switch (code) {
            case 'INVALID_LOGIN':
                return this.t('login.errorInvalid');
            case 'INVALID_USERNAME':
                return this.t('login.errorUsername');
            case 'INVALID_CREDENTIALS':
                return this.t('login.errorInvalid');
            case 'NETWORK':
                return this.t('login.errorNetwork');
            case 'AUTH_DISABLED':
                return this.t('login.errorAuthDisabled');
            case 'UNAVAILABLE':
                return this.t('login.errorUnavailable');
            case 'AUTH_NOT_READY':
            case 'TIMEOUT':
                return this.t('login.errorAuth');
            default:
                return this.t('login.errorGeneric');
        }
    }

    async submitLogin() {
        if (this.loginBusy) return;

        const username = this.dom.loginUsername.value.trim().toUpperCase();
        const password = this.dom.loginPassword.value;

        if (!/^[A-Z0-9]{3,9}$/.test(username)) {
            this.setLoginError(this.t('login.errorUsername'));
            return;
        }
        if (!password) {
            this.setLoginError(this.t('login.errorPassword'));
            return;
        }
        if (!window.accountManager || typeof window.accountManager.login !== 'function') {
            this.setLoginError(this.t('login.errorUnavailable'));
            return;
        }

        this.loginBusy = true;
        this.setLoginError('');
        this.setLoginLoading(true);

        try {
            const result = await window.accountManager.login(username, password);
            if (result && result.status === 'signed_in') {
                this.applySignedInAccount(result.username || username);
            } else {
                this.setLoginError(this.t('login.errorGeneric'));
            }
        } catch (e) {
            this.setLoginError(this.mapLoginError(e && e.message ? e.message : ''));
        }

        this.loginBusy = false;
        this.setLoginLoading(false);
    }

    switchScreen(screenName) {
        this.currentScreen = screenName;
        const screens = [
            this.dom.screenSplash,
            this.dom.screenSignup,
            this.dom.screenLogin,
            this.dom.screenPickName,
            this.dom.screenMainMenu,
            this.dom.screenGame
        ];
        screens.forEach(s => {
            if (s) {
                s.classList.remove('active');
                s.classList.add('hidden');
            }
        });

        let target = null;
        if (screenName === 'splash') target = this.dom.screenSplash;
        else if (screenName === 'signup') target = this.dom.screenSignup;
        else if (screenName === 'login') target = this.dom.screenLogin;
        else if (screenName === 'pick-name') target = this.dom.screenPickName;
        else if (screenName === 'main-menu') target = this.dom.screenMainMenu;
        else if (screenName === 'game') target = this.dom.screenGame;

        if (target) {
            target.classList.remove('hidden');
            void target.offsetWidth;
            target.classList.add('active');
        }
    }

    // ========================================================
    // GAME LIFECYCLE
    // ========================================================

    startNewGame() {
        this.updatePlayerNameDisplays();

        // Vô hiệu hoá mọi timeout của ván cũ
        this.gameSessionId += 1;

        this.currentBoss = BOSS_LEVELS[this.selectedBossKey] || BOSS_LEVELS.easy;
        this.sweetSpotWidth = this.currentBoss.sweetSpotWidth;

        this.playerCards = 10;
        this.botCards = 10;
        this.currentRound = 1;
        this.lastRoundWinner = null;
        this.isGameEnded = false;
        this.wheelAvailable = false;
        this.wheelUsed = false;
        this.wheelSpinning = false;
        this.interstitialShown = false;

        if (this.wheelSpinTimeout) {
            clearTimeout(this.wheelSpinTimeout);
            this.wheelSpinTimeout = null;
        }
        if (this.botAimCheckId) {
            cancelAnimationFrame(this.botAimCheckId);
            this.botAimCheckId = null;
        }
        if (this.botSmashTimeout) {
            clearTimeout(this.botSmashTimeout);
            this.botSmashTimeout = null;
        }

        this.applyBossToHud();
        this.updateScoreboard();
        this.renderDecks();
        this.startRound(1);
    }

    updateScoreboard() {
        // Tuyệt đối không để bài âm (bảo vệ giá trị >= 0)
        this.playerCards = Math.max(0, this.playerCards);
        this.botCards = Math.max(0, this.botCards);

        this.dom.playerCardCount.textContent = this.playerCards;
        this.dom.botCardCount.textContent = this.botCards;
        this.dom.roundBadge.textContent = this.t('game.round', { round: this.currentRound, max: this.maxRounds });
    }

    renderDecks() {
        this.dom.playerDeckStack.style.height = `${Math.min(32, Math.max(4, this.playerCards * 3))}px`;
        this.dom.botDeckStack.style.height = `${Math.min(32, Math.max(4, this.botCards * 3))}px`;
    }

    // ========================================================
    // ROUND FLOW
    // ========================================================

    startRound(roundNumber) {
        if (this.currentScreen !== 'game' || this.isGameEnded) return;

        this.currentRound = roundNumber;
        this.updateScoreboard();
        this.isRoundInProgress = true;

        // KIỂM TRA ĐIỀU KIỆN KẾT THÚC SỚM (KNOCKOUT)
        if (this.playerCards <= 0) {
            this.endGame('bot_knockout');
            return;
        }
        if (this.botCards <= 0) {
            this.endGame('player_knockout');
            return;
        }

        if (roundNumber === 1) {
            // HIỆP 1: Bắt buộc cược 1 lá -> Oẳn tù tì để biết bên nào đi trước!
            this.currentStakePerSide = 1;
            this.preparePot(1);
            this.openRpsModal();
        } else {
            // TỪ HIỆP 2 ĐẾN 5:
            // Theo yêu cầu: KHÔNG CẦN OẲN TÙ TÌ NỮA!
            // Người thắng hiệp trước ĐƯỢC CHỌN CƯỢC và ĐƯỢC ĐẬP TRƯỚC!
            this.openStakeModal();
        }
    }

    preparePot(stakePerSide) {
        // Chặn mức cược không vượt quá số bài hiện có của bên ít bài hơn
        const maxAllowed = Math.min(this.playerCards, this.botCards);
        stakePerSide = Math.max(1, Math.min(stakePerSide, maxAllowed));

        this.currentStakePerSide = stakePerSide;
        this.potCards = stakePerSide * 2;

        // Trừ bài trong tay đưa vào mâm cược (luôn đảm bảo không bao giờ âm)
        this.playerCards = Math.max(0, this.playerCards - stakePerSide);
        this.botCards = Math.max(0, this.botCards - stakePerSide);

        this.updateScoreboard();
        this.renderDecks();
        this.renderPotCards(false);

        // Tốc độ con trỏ tăng dần theo số bài cược (quy ước nội bộ)
        this.currentSpeed = this.baseSpeed + (this.potCards - 2) * 10;

        window.soundManager.playCardDeal();
    }

    renderPotCards(isFaceUp = false) {
        this.dom.potCardStack.innerHTML = '';
        this.dom.potCountBadge.textContent = this.t('game.pot', { count: this.potCards });

        const displayCount = Math.min(this.potCards, 10);
        for (let i = 0; i < displayCount; i++) {
            const cardEl = document.createElement('div');
            cardEl.className = `game-card ${isFaceUp ? 'face-up' : 'face-down'}`;
            const offsetX = (i - displayCount / 2) * 2;
            const offsetY = -i * 3;
            const rot = (i % 2 === 0 ? 1 : -1) * (i * 1.5);
            cardEl.style.transform = `translate(${offsetX}px, ${offsetY}px) rotate(${rot}deg)`;
            cardEl.style.zIndex = i + 1;
            this.dom.potCardStack.appendChild(cardEl);
        }
    }

    // ========================================================
    // PHASE: OẰN TÙ TÌ (CHỈ ÁP DỤNG Ở HIỆP 1)
    // ========================================================

    openRpsModal() {
        this.showModal(this.dom.modalRps);
        this.dom.rpsPlayerChoice.textContent = '❓';
        this.dom.rpsBotChoice.textContent = '❓';
        this.dom.rpsStatus.textContent = this.t('rps.desc');
        this.dom.rpsButtons.forEach(b => b.disabled = false);
    }

    handlePlayerRpsChoice(playerChoice) {
        this.dom.rpsButtons.forEach(b => b.disabled = true);
        window.soundManager.playClick();

        const sessionId = this.gameSessionId;
        const isSessionValid = () => sessionId === this.gameSessionId && this.currentScreen === 'game';

        const choices = ['rock', 'paper', 'scissors'];
        const emojiMap = { rock: '✊', paper: '✋', scissors: '✌️' };

        this.dom.rpsPlayerChoice.textContent = emojiMap[playerChoice];
        this.dom.rpsStatus.textContent = this.t('rps.pick');
        window.soundManager.playRpsCountdown(400);

        setTimeout(() => {
            window.soundManager.playRpsCountdown(520);
        }, 300);

        setTimeout(() => {
            if (!isSessionValid()) return;

            window.soundManager.playRpsCountdown(660);
            const botChoice = choices[Math.floor(Math.random() * choices.length)];
            this.dom.rpsBotChoice.textContent = emojiMap[botChoice];

            let rpsResult = '';
            if (playerChoice === botChoice) {
                rpsResult = 'draw';
            } else if (
                (playerChoice === 'rock' && botChoice === 'scissors') ||
                (playerChoice === 'scissors' && botChoice === 'paper') ||
                (playerChoice === 'paper' && botChoice === 'rock')
            ) {
                rpsResult = 'win';
            } else {
                rpsResult = 'lose';
            }

            if (rpsResult === 'draw') {
                this.dom.rpsStatus.innerHTML = `<span style="color:#d97706">${this.t('rps.draw')}</span>`;
                setTimeout(() => {
                    if (!isSessionValid()) return;
                    this.dom.rpsPlayerChoice.textContent = '❓';
                    this.dom.rpsBotChoice.textContent = '❓';
                    this.dom.rpsButtons.forEach(b => b.disabled = false);
                }, 900);
            } else if (rpsResult === 'win') {
                this.dom.rpsStatus.innerHTML = `<span style="color:#16a34a">${this.t('rps.win')}</span>`;
                this.activeSmasher = 'player';
                setTimeout(() => {
                    if (!isSessionValid()) return;
                    this.hideModals();
                    this.startSmashPhase();
                }, 1300);
            } else {
                this.dom.rpsStatus.innerHTML = `<span style="color:#dc2626">${this.t('rps.lose')}</span>`;
                this.activeSmasher = 'bot';
                setTimeout(() => {
                    if (!isSessionValid()) return;
                    this.hideModals();
                    this.startSmashPhase();
                }, 1300);
            }
        }, 750);
    }

    // ========================================================
    // PHASE: CHỌN MỨC CƯỢC (TỪ HIỆP 2 ĐẾN 5)
    // ========================================================

    openStakeModal() {
        this.showModal(this.dom.modalStake);
        this.dom.stakeButtonsContainer.innerHTML = '';

        // Tối đa 5 lá, và không bao giờ vượt quá số bài hiện có của bên ít bài hơn
        const maxStake = Math.max(1, Math.min(5, this.playerCards, this.botCards));
        const minStake = Math.min(2, maxStake);

        // Người thắng hiệp trước sẽ:
        // 1. Chọn mức cược
        // 2. Tự động được quyền ĐẬP TRƯỚC!
        if (this.lastRoundWinner === 'player' || this.lastRoundWinner === null) {
            this.activeSmasher = 'player';
            this.dom.stakePromptText.innerHTML = this.t('stake.winPrompt', { max: maxStake });
            this.dom.stakeBotNotice.classList.add('hidden');

            for (let s = minStake; s <= maxStake; s++) {
                const btn = document.createElement('button');
                btn.className = 'btn-stake-choice';
                btn.innerHTML = `<span class="stake-num">${s}</span><span class="stake-lbl">${this.t('stake.cardUnit')}</span>`;
                btn.addEventListener('click', () => {
                    window.soundManager.playClick();
                    this.confirmStake(s);
                });
                this.dom.stakeButtonsContainer.appendChild(btn);
            }
        } else {
            // Máy thắng hiệp trước
            const bossName = this.currentBoss ? this.currentBoss.name : 'ROBO';
            this.activeSmasher = 'bot';
            this.dom.stakePromptText.innerHTML = this.t('stake.botPrompt', { boss: bossName });
            this.dom.stakeBotNotice.classList.remove('hidden');
            const noticeText = document.getElementById('stake-bot-notice-text');
            if (noticeText) noticeText.textContent = this.t('stake.thinking', { boss: bossName });

            const sessionId = this.gameSessionId;
            const isSessionValid = () => sessionId === this.gameSessionId && this.currentScreen === 'game';

            setTimeout(() => {
                if (!isSessionValid()) return;

                const botStake = this.chooseBotStake(minStake, maxStake);
                this.dom.stakePromptText.innerHTML = this.t('stake.botChosen', { boss: bossName, stake: botStake });
                window.soundManager.playRpsCountdown(500);

                setTimeout(() => {
                    if (!isSessionValid()) return;
                    this.confirmStake(botStake);
                }, 900);
            }, 1200);
        }
    }

    /**
     * Boss càng khó càng có xu hướng cược lớn (vì Robo canh chính xác hơn).
     */
    chooseBotStake(minStake, maxStake) {
        const boss = this.currentBoss || BOSS_LEVELS.easy;
        const aggression = boss.botStakeAggression || 0;

        if (Math.random() < aggression) {
            return Math.random() < 0.75
                ? maxStake
                : Math.max(minStake, maxStake - 1);
        }

        return Math.floor(Math.random() * (maxStake - minStake + 1)) + minStake;
    }

    confirmStake(stakeAmount) {
        this.hideModals();
        this.preparePot(stakeAmount);
        // Từ round 2 trở đi, KHÔNG CẦN RPS! Vào thẳng lượt đập của người thắng!
        this.startSmashPhase();
    }

    // ========================================================
    // PHASE: SMASH PHASE (CANH THANH LỰC)
    // ========================================================

    startSmashPhase() {
        if (this.currentScreen !== 'game' || this.isGameEnded) return;

        this.dom.smashBarContainer.classList.remove('disabled');
        this.renderPotCards(false);

        // Vùng vàng hẹp dần theo độ khó boss (Easy 5%, Medium ~3.85%, Hard ~2.96%)
        const startRange = Math.max(1, Math.floor(85 - this.sweetSpotWidth - 15));
        this.sweetSpotStart = Math.floor(Math.random() * (startRange + 1)) + 15;
        this.dom.sweetSpot.style.left = `${this.sweetSpotStart}%`;
        this.dom.sweetSpot.style.width = `${this.sweetSpotWidth}%`;

        this.pointerPos = 0;
        this.pointerDirection = 1;
        this.updatePointerDom();

        this.updateTurnIndicator();
        this.startPointerMovement();

        if (this.activeSmasher === 'player') {
            this.dom.btnSmash.disabled = false;
            this.dom.btnSmash.classList.remove('bot-turn');
            this.dom.btnSmash.textContent = this.t('game.smashButton');
            this.dom.arenaMessage.textContent = this.t('game.focus');
        } else {
            this.dom.btnSmash.disabled = true;
            this.dom.btnSmash.classList.add('bot-turn');
            this.dom.btnSmash.textContent = this.t('game.botWaiting');
            this.dom.arenaMessage.textContent = this.t('game.botAiming', { boss: this.currentBoss.name });

            this.scheduleBotSmash();
        }
    }

    updateTurnIndicator() {
        if (this.activeSmasher === 'player') {
            this.dom.turnIndicator.innerHTML = `<span class="badge player">${this.t('game.turnPlayer')}</span>`;
            this.dom.turnIndicator.className = 'turn-box player-turn';
        } else {
            this.dom.turnIndicator.innerHTML = `<span class="badge bot">${this.t('game.turnBot')}</span>`;
            this.dom.turnIndicator.className = 'turn-box bot-turn';
        }
    }

    startPointerMovement() {
        if (this.isPointerMoving) return;
        this.isPointerMoving = true;
        this.lastFrameTime = performance.now();
        this.loopPointer();
    }

    stopPointerMovement() {
        this.isPointerMoving = false;
        if (this.animFrameId) {
            cancelAnimationFrame(this.animFrameId);
            this.animFrameId = null;
        }
        if (this.botAimCheckId) {
            cancelAnimationFrame(this.botAimCheckId);
            this.botAimCheckId = null;
        }
    }

    loopPointer() {
        if (!this.isPointerMoving) return;

        const now = performance.now();
        const dt = (now - this.lastFrameTime) / 1000;
        this.lastFrameTime = now;

        this.pointerPos += this.pointerDirection * this.currentSpeed * dt;

        if (this.pointerPos >= 100) {
            this.pointerPos = 100;
            this.pointerDirection = -1;
        } else if (this.pointerPos <= 0) {
            this.pointerPos = 0;
            this.pointerDirection = 1;
        }

        this.updatePointerDom();
        this.animFrameId = requestAnimationFrame(() => this.loopPointer());
    }

    updatePointerDom() {
        this.dom.pointer.style.left = `${this.pointerPos}%`;
    }

    scheduleBotSmash() {
        if (this.botSmashTimeout) clearTimeout(this.botSmashTimeout);

        const boss = this.currentBoss || BOSS_LEVELS.easy;
        const shouldAim = Math.random() < (boss.botAimChance || 0);

        // Boss khó có tỉ lệ "canh trúng" vùng vàng cao hơn.
        // Khi trượt canh, Robo đập ngẫu nhiên như cũ.
        const delay = shouldAim
            ? Math.floor(Math.random() * 350) + 750
            : Math.floor(Math.random() * 1200) + 850;

        this.botSmashTimeout = setTimeout(() => {
            if (this.activeSmasher !== 'bot' || !this.isPointerMoving) return;

            if (shouldAim) {
                this.botAimForSweetSpot();
            } else {
                this.executeSmash('bot');
            }
        }, delay);
    }

    botAimForSweetSpot() {
        if (this.botAimCheckId) cancelAnimationFrame(this.botAimCheckId);

        const check = () => {
            if (this.activeSmasher !== 'bot' || !this.isPointerMoving) {
                this.botAimCheckId = null;
                return;
            }

            if (
                this.pointerPos >= this.sweetSpotStart &&
                this.pointerPos <= (this.sweetSpotStart + this.sweetSpotWidth)
            ) {
                this.botAimCheckId = null;
                this.executeSmash('bot');
                return;
            }

            this.botAimCheckId = requestAnimationFrame(check);
        };

        this.botAimCheckId = requestAnimationFrame(check);
    }

    // ========================================================
    // THỰC HIỆN CÚ ĐẬP (SMASH EXECUTION)
    // ========================================================

    executeSmash(smasher) {
        this.stopPointerMovement();
        if (this.botSmashTimeout) clearTimeout(this.botSmashTimeout);

        // Kiểm tra rơi đúng vùng 5% Sweet Spot không
        const isHit = (
            this.pointerPos >= this.sweetSpotStart &&
            this.pointerPos <= (this.sweetSpotStart + this.sweetSpotWidth)
        );

        this.triggerHandSlapAnimation(smasher);

        if (isHit) {
            this.handleSmashSuccess(smasher);
        } else {
            this.handleSmashMiss(smasher);
        }
    }

    triggerHandSlapAnimation(smasher) {
        const handEl = document.createElement('div');
        handEl.className = `slap-hand ${smasher === 'player' ? 'from-bottom' : 'from-top'}`;
        handEl.textContent = '🖐️';
        this.dom.tableArena.appendChild(handEl);

        setTimeout(() => {
            if (handEl.parentNode) handEl.remove();
        }, 500);
    }

    handleSmashSuccess(smasher) {
        // TRÚNG: Lật bài thành công!
        window.soundManager.playCriticalFlip();
        this.triggerScreenShake(true);

        this.renderPotCards(true); // Lật ngửa mặt trước
        this.dom.potCardStack.classList.add('flipping-success');

        const bossName = this.currentBoss ? this.currentBoss.name : 'ROBO';
        this.showToast(
            smasher === 'player' ? this.t('game.flipWin') : this.t('game.flipWinBot', { boss: bossName }),
            'success'
        );

        const wonCards = this.potCards;
        const sessionId = this.gameSessionId;
        this.lastRoundWinner = smasher;

        setTimeout(() => {
            if (sessionId !== this.gameSessionId || this.currentScreen !== 'game') return;

            if (smasher === 'player') {
                this.playerCards += wonCards;
            } else {
                this.botCards += wonCards;
            }

            this.potCards = 0;
            this.dom.potCardStack.classList.remove('flipping-success');
            this.renderPotCards(false);
            this.updateScoreboard();
            this.renderDecks();

            // Kiểm tra kết thúc ván hoặc chuyển hiệp
            this.checkGameProgress();
        }, 1500);
    }

    handleSmashMiss(smasher) {
        // HỤT: Đổi lượt cho đối thủ
        window.soundManager.playMissWhoosh();
        this.triggerScreenShake(false);

        this.dom.potCardStack.classList.add('shivering-miss');
        setTimeout(() => {
            this.dom.potCardStack.classList.remove('shivering-miss');
        }, 400);

        const bossName = this.currentBoss ? this.currentBoss.name : 'ROBO';
        this.showToast(
            smasher === 'player' ? this.t('game.missPlayer', { boss: bossName }) : this.t('game.missBot', { boss: bossName }),
            'miss'
        );

        const sessionId = this.gameSessionId;

        // Chuyển lượt
        setTimeout(() => {
            if (sessionId !== this.gameSessionId || this.currentScreen !== 'game' || this.isGameEnded) return;
            this.activeSmasher = (smasher === 'player') ? 'bot' : 'player';
            this.startSmashPhase();
        }, 1200);
    }

    triggerScreenShake(isHeavy = false) {
        this.dom.tableArena.classList.remove('screen-shake-heavy', 'screen-shake-light');
        void this.dom.tableArena.offsetWidth;
        this.dom.tableArena.classList.add(isHeavy ? 'screen-shake-heavy' : 'screen-shake-light');
        setTimeout(() => {
            this.dom.tableArena.classList.remove('screen-shake-heavy', 'screen-shake-light');
        }, 500);
    }

    showToast(msg, type = 'info') {
        this.dom.arenaMessage.textContent = msg;
        this.dom.arenaMessage.className = `arena-msg ${type}`;
    }

    // ========================================================
    // GAME PROGRESSION & RESULT SCREEN (YOU WON / YOU LOST)
    // ========================================================

    checkGameProgress() {
        // Đảm bảo không âm bài
        this.playerCards = Math.max(0, this.playerCards);
        this.botCards = Math.max(0, this.botCards);

        // 1. Kiểm tra kết thúc sớm nếu 1 bên hết bài (Knockout)
        if (this.botCards <= 0) {
            this.endGame('player_knockout');
            return;
        }
        if (this.playerCards <= 0) {
            this.endGame('bot_knockout');
            return;
        }

        // 2. Đã xong đủ 5 hiệp
        if (this.currentRound >= this.maxRounds) {
            this.endGame('max_rounds');
            return;
        }

        // 3. Nếu chưa kết thúc, chuyển sang hiệp tiếp theo
        const nextRound = this.currentRound + 1;
        const sessionId = this.gameSessionId;
        this.showToast(this.t('game.nextRound', { round: nextRound }), 'info');
        setTimeout(() => {
            if (sessionId !== this.gameSessionId || this.currentScreen !== 'game' || this.isGameEnded) return;
            this.startRound(nextRound);
        }, 1500);
    }

    endGame(reason) {
        if (this.isGameEnded) return;
        this.isGameEnded = true;
        this.stopPointerMovement();
        if (this.botSmashTimeout) clearTimeout(this.botSmashTimeout);
        if (this.botAimCheckId) cancelAnimationFrame(this.botAimCheckId);

        this.showModal(this.dom.modalResult);

        let isPlayerWin = false;
        let isDraw = false;

        this.dom.resultTitle.className = 'modal-title result-headline';

        const bossName = this.currentBoss ? this.currentBoss.name : 'ROBO';

        if (reason === 'player_knockout') {
            isPlayerWin = true;
            this.dom.resultTitle.textContent = this.t('result.win');
            this.dom.resultTitle.classList.add('win-text');
            this.dom.resultSubtitle.textContent = this.t('result.knockoutWin', { boss: bossName });
            this.dom.resultHeroImg.src = 'icons/trophy-win.svg';
        } else if (reason === 'bot_knockout') {
            isPlayerWin = false;
            this.dom.resultTitle.textContent = this.t('result.lose');
            this.dom.resultTitle.classList.add('lose-text');
            this.dom.resultSubtitle.textContent = this.t('result.knockoutLose');
            this.dom.resultHeroImg.src = 'icons/lose-cry.svg';
        } else {
            // Hết 5 hiệp, so sánh số bài
            if (this.playerCards > this.botCards) {
                isPlayerWin = true;
                this.dom.resultTitle.textContent = this.t('result.win');
                this.dom.resultTitle.classList.add('win-text');
                this.dom.resultSubtitle.textContent = this.t('result.maxWin');
                this.dom.resultHeroImg.src = 'icons/trophy-win.svg';
            } else if (this.playerCards < this.botCards) {
                isPlayerWin = false;
                this.dom.resultTitle.textContent = this.t('result.lose');
                this.dom.resultTitle.classList.add('lose-text');
                this.dom.resultSubtitle.textContent = this.t('result.maxLose', { boss: bossName });
                this.dom.resultHeroImg.src = 'icons/lose-cry.svg';
            } else {
                isDraw = true;
                this.dom.resultTitle.textContent = this.t('result.draw');
                this.dom.resultSubtitle.textContent = this.t('result.drawText');
                this.dom.resultHeroImg.src = 'icons/trophy-win.svg';
            }
        }

        // Chỉ khi THẮNG mới được 1 lượt quay may mắn
        this.wheelAvailable = isPlayerWin;
        this.wheelUsed = false;
        if (this.dom.btnOpenWheel) {
            this.dom.btnOpenWheel.classList.toggle('hidden', !isPlayerWin);
            this.dom.btnOpenWheel.disabled = false;
        }
        if (isPlayerWin) {
            this.dom.resultSubtitle.textContent += ' ' + this.t('result.spinEarned');
            if (this.dom.wheelCtaReward) {
                this.dom.wheelCtaReward.textContent = `×${this.currentBoss.heartSlots} ❤️`;
            }
        }

        this.dom.resultScoreDetail.innerHTML = `
            <div class="final-score-box">
                <div class="side-score player">
                    <span>${this.t('result.youLabel', { name: this.playerName.toUpperCase() })}</span>
                    <strong>${this.t('result.cards', { count: this.playerCards })}</strong>
                </div>
                <div class="hud-center-vs" style="font-size: 20px; color: #ef4444;">VS</div>
                <div class="side-score bot">
                    <span>${this.t('result.botLabel', { boss: bossName })}</span>
                    <strong>${this.t('result.cards', { count: this.botCards })}</strong>
                </div>
            </div>
        `;

        if (isPlayerWin) {
            this.recordWinForLeaderboard();
            window.soundManager.playVictory();
            this.launchConfetti();
        } else if (!isDraw) {
            window.soundManager.playDefeat();
        }

        // ========================================================
        // GOOGLE ADMOB: Hiển thị Interstitial ngay sau kết quả
        // cho cả trường hợp thắng và thua.
        // ========================================================
        this.showResultInterstitial();
    }

    // ========================================================
    // VÒNG QUAY MAY MẮN 9 Ô (CHỈ SAU KHI THẮNG)
    // ========================================================

    buildWheel() {
        if (!this.dom.wheelGrid) return;

        const boss = this.currentBoss || BOSS_LEVELS.easy;
        const heartCount = Math.max(0, Math.min(9, boss.heartSlots));

        this.dom.wheelGrid.innerHTML = '';

        // Chọn ngẫu nhiên vị trí các ô tim
        const indices = Array.from({ length: 9 }, (_, i) => i);
        for (let i = indices.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        const heartSet = new Set(indices.slice(0, heartCount));

        this.wheelSlots = [];
        this.wheelCellEls = [];

        for (let i = 0; i < 9; i++) {
            const isHeart = heartSet.has(i);
            this.wheelSlots.push(isHeart ? 'heart' : 'empty');

            const cell = document.createElement('div');
            // Úp mặt mọi ô để người chơi không biết tim nằm ở đâu
            cell.className = 'wheel-cell mystery';
            cell.dataset.index = i;
            cell.innerHTML = '<span class="wheel-cell-icon">?</span>';
            cell.setAttribute('aria-label', this.t('wheel.cellHidden'));

            this.dom.wheelGrid.appendChild(cell);
            this.wheelCellEls.push(cell);
        }

        if (this.dom.wheelResult) {
            this.dom.wheelResult.textContent = this.t('wheel.default');
            this.dom.wheelResult.className = 'wheel-result';
        }
        if (this.dom.btnSpinWheel) {
            this.dom.btnSpinWheel.disabled = false;
            this.dom.btnSpinWheel.classList.remove('hidden');
        }
        if (this.dom.btnWheelContinue) {
            this.dom.btnWheelContinue.classList.add('hidden');
        }
        if (this.dom.btnWheelBack) {
            this.dom.btnWheelBack.disabled = false;
        }

        this.wheelUsed = false;
        this.wheelSpinning = false;
    }

    openWheel() {
        if (!this.wheelAvailable || this.wheelUsed || this.wheelSpinning) return;

        this.buildWheel();

        if (this.dom.wheelHeartCount && this.heartManager) {
            this.dom.wheelHeartCount.textContent = this.heartManager.hearts;
        }

        this.showModal(this.dom.modalWheel);
    }

    spinWheel() {
        if (!this.wheelAvailable || this.wheelUsed || this.wheelSpinning) return;
        if (!this.wheelSlots.length || !this.wheelCellEls.length) return;

        this.wheelSpinning = true;

        if (this.dom.btnSpinWheel) this.dom.btnSpinWheel.disabled = true;
        if (this.dom.btnWheelContinue) this.dom.btnWheelContinue.classList.add('hidden');
        if (this.dom.btnWheelBack) this.dom.btnWheelBack.disabled = true;
        if (this.dom.wheelResult) {
            this.dom.wheelResult.textContent = this.t('wheel.spinning');
            this.dom.wheelResult.className = 'wheel-result';
        }

        this.wheelCellEls.forEach((cell) => {
            cell.classList.remove('is-active', 'is-picked');
        });

        // Kết quả ngẫu nhiên đều cho 9 ô (tỉ lệ trúng tim = số ô tim / 9)
        const targetIndex = Math.floor(Math.random() * 9);
        const totalSteps = 26 + targetIndex;
        const startIndex = ((targetIndex - (totalSteps - 1)) % 9 + 9) % 9;

        let step = 0;

        const tick = () => {
            if (step >= totalSteps) {
                this.finalizeWheel(targetIndex);
                return;
            }

            const activeIndex = (startIndex + step) % 9;
            this.wheelCellEls.forEach((cell, i) => {
                cell.classList.toggle('is-active', i === activeIndex);
            });

            if (step % 2 === 0 || step > totalSteps - 6) {
                window.soundManager.playRpsCountdown(520 + Math.min(step * 12, 320));
            }

            step++;
            const progress = step / totalSteps;
            const delay = 55 + Math.pow(progress, 2.4) * 260;
            this.wheelSpinTimeout = setTimeout(tick, delay);
        };

        tick();
    }

    revealWheelCell(index, cells = this.wheelCellEls, slots = this.wheelSlots) {
        const cell = cells[index];
        if (!cell) return;

        const isHeart = slots[index] === 'heart';
        cell.classList.remove('mystery');
        cell.classList.add('revealed');
        cell.classList.add(isHeart ? 'heart' : 'empty');
        cell.innerHTML = isHeart
            ? '<span class="wheel-cell-icon">❤️</span>'
            : '<span class="wheel-cell-icon">✖</span>';
        cell.setAttribute('aria-label', isHeart ? this.t('wheel.cellHeart') : this.t('wheel.cellEmpty'));
    }

    finalizeWheel(targetIndex) {
        this.wheelSpinning = false;
        this.wheelUsed = true;

        if (this.wheelSpinTimeout) {
            clearTimeout(this.wheelSpinTimeout);
            this.wheelSpinTimeout = null;
        }
        if (this.dom.btnWheelBack) this.dom.btnWheelBack.disabled = false;

        // Chụp lại danh sách ô của lượt quay này để timeout không ảnh hưởng lượt sau
        const cells = this.wheelCellEls.slice();
        const slots = this.wheelSlots.slice();

        const cell = cells[targetIndex];
        if (cell) {
            cell.classList.remove('is-active');
            cell.classList.add('is-picked');
        }

        // Lật ô trúng trước, sau đó lật các ô còn lại để lộ vị trí tim
        this.revealWheelCell(targetIndex, cells, slots);
        cells.forEach((_, idx) => {
            if (idx === targetIndex) return;
            setTimeout(() => this.revealWheelCell(idx, cells, slots), 260 + idx * 55);
        });

        const isHeart = slots[targetIndex] === 'heart';

        if (isHeart) {
            const added = this.heartManager.grant(1);

            if (this.dom.wheelResult) {
                this.dom.wheelResult.className = 'wheel-result win';
                this.dom.wheelResult.innerHTML = added > 0
                    ? this.t('wheel.win')
                    : this.t('wheel.winFull');
            }

            if (cell) cell.classList.add('is-heart-win');
            window.soundManager.playVictory();
            this.launchConfetti();
        } else {
            if (this.dom.wheelResult) {
                this.dom.wheelResult.className = 'wheel-result miss';
                this.dom.wheelResult.textContent = this.t('wheel.lose');
            }
            window.soundManager.playMissWhoosh();
        }

        if (this.dom.wheelHeartCount && this.heartManager) {
            this.dom.wheelHeartCount.textContent = this.heartManager.hearts;
        }

        if (this.dom.btnSpinWheel) this.dom.btnSpinWheel.classList.add('hidden');
        if (this.dom.btnWheelContinue) this.dom.btnWheelContinue.classList.remove('hidden');
        if (this.dom.btnOpenWheel) this.dom.btnOpenWheel.classList.add('hidden');
    }

    closeWheelToResult() {
        if (this.wheelSpinning) return;

        this.hideModals();
        if (this.dom.modalResult) {
            this.showModal(this.dom.modalResult);
        }
    }

    launchConfetti() {
        const container = document.getElementById('confetti-container');
        if (!container) return;
        container.innerHTML = '';

        const colors = ['#facc15', '#22c55e', '#38bdf8', '#ec4899', '#f97316'];
        for (let i = 0; i < 45; i++) {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            piece.style.left = `${Math.random() * 100}%`;
            piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            piece.style.animationDelay = `${Math.random() * 1.5}s`;
            piece.style.animationDuration = `${Math.random() * 2 + 1.5}s`;
            container.appendChild(piece);
        }

        setTimeout(() => {
            container.innerHTML = '';
        }, 4000);
    }

    // Modal Helpers
    showModal(modalElement) {
        this.dom.modalOverlay.classList.remove('hidden');
        [
            this.dom.modalRps,
            this.dom.modalStake,
            this.dom.modalResult,
            this.dom.modalHowToPlay,
            this.dom.modalSettings,
            this.dom.modalWheel,
            this.dom.modalNoHearts,
            this.dom.modalLeaderboard
        ].forEach(m => m.classList.add('hidden'));
        modalElement.classList.remove('hidden');
    }

    hideModals() {
        this.dom.modalOverlay.classList.add('hidden');
        [
            this.dom.modalRps,
            this.dom.modalStake,
            this.dom.modalResult,
            this.dom.modalHowToPlay,
            this.dom.modalSettings,
            this.dom.modalWheel,
            this.dom.modalNoHearts,
            this.dom.modalLeaderboard
        ].forEach(m => m.classList.add('hidden'));
    }
}

// Khởi tạo Game
window.addEventListener('DOMContentLoaded', () => {
    window.game = new FlipCardGame();
});
