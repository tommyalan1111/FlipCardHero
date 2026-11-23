/**
 * Flip Card Hero - Core Game Engine (Hero Edition)
 * Tối ưu hóa UI Fancy, Chibi Hero, Mobile Portrait & Android
 */

class FlipCardGame {
    constructor() {
        // Player & Opponent state
        this.playerName = localStorage.getItem('flipCardHero_playerName') || 'LEO';
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

        // Smash Bar & Sweet Spot (5%)
        this.pointerPos = 0; // 0 to 100%
        this.pointerDirection = 1; // 1: phải, -1: trái
        this.sweetSpotWidth = 5; // Đúng 5% theo yêu cầu
        this.sweetSpotStart = 50; // Vị trí ngẫu nhiên mỗi lượt
        this.isPointerMoving = false;
        this.animFrameId = null;
        this.lastFrameTime = 0;

        // Tốc độ canh lực (cân chỉnh chuẩn phản xạ người)
        this.baseSpeed = 55; // % per second ở 2 lá
        this.currentSpeed = 55;

        // Bot simulation
        this.botSmashTimeout = null;

        // Screen states
        this.currentScreen = 'splash';

        this.initDom();
        this.bindEvents();
        this.startSplashScreen();
    }

    initDom() {
        this.dom = {
            // Screens
            screenSplash: document.getElementById('screen-splash'),
            screenPickName: document.getElementById('screen-pick-name'),
            screenMainMenu: document.getElementById('screen-main-menu'),
            screenGame: document.getElementById('screen-game'),

            // Pick Name Elements
            inputHeroName: document.getElementById('input-hero-name'),
            charCounter: document.getElementById('char-counter'),
            nameValidationMsg: document.getElementById('name-validation-msg'),
            btnConfirmName: document.getElementById('btn-confirm-name'),
            menuPlayerNameTag: document.getElementById('menu-player-name-tag'),
            btnEditName: document.getElementById('btn-edit-name'),
            gamePlayerHudName: document.getElementById('game-player-hud-name'),
            rpsPlayerLabel: document.getElementById('rps-player-label'),

            // Main Menu Elements
            btnPlayNow: document.getElementById('btn-play-now'),
            btnHowToPlay: document.getElementById('btn-how-to-play'),
            btnMenuSettings: document.getElementById('btn-menu-settings'),

            // In-Game Header & Scoreboard
            btnExitToMenu: document.getElementById('btn-exit-to-menu'),
            roundBadge: document.getElementById('round-badge'),
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
            const sanitized = val.replace(/[^a-zA-Z0-9]/g, '');
            if (val !== sanitized) {
                this.dom.inputHeroName.value = sanitized;
                val = sanitized;
            }

            this.dom.charCounter.textContent = `${val.length}/9`;

            if (val.length === 0) {
                this.dom.nameValidationMsg.textContent = 'ℹ️ Từ 3 đến 9 ký tự, chỉ gồm chữ cái và số.';
                this.dom.nameValidationMsg.className = 'validation-msg';
                this.dom.inputHeroName.className = 'custom-name-input';
                this.dom.btnConfirmName.disabled = true;
                return;
            }

            if (val.length < 3) {
                this.dom.nameValidationMsg.textContent = '❌ Tên quá ngắn! Phải từ 3 ký tự trở lên (> 2).';
                this.dom.nameValidationMsg.className = 'validation-msg error';
                this.dom.inputHeroName.className = 'custom-name-input is-invalid';
                this.dom.btnConfirmName.disabled = true;
                return;
            }

            if (val.length > 9) {
                this.dom.nameValidationMsg.textContent = '❌ Tên quá dài! Tối đa 9 ký tự (< 10).';
                this.dom.nameValidationMsg.className = 'validation-msg error';
                this.dom.inputHeroName.className = 'custom-name-input is-invalid';
                this.dom.btnConfirmName.disabled = true;
                return;
            }

            // Hợp lệ
            this.dom.nameValidationMsg.textContent = '✅ Tên hợp lệ! Sẵn sàng vào đấu trường!';
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

        // Nút đổi tên ở Main Menu
        this.dom.btnEditName.addEventListener('click', () => {
            window.soundManager.playClick();
            this.dom.inputHeroName.value = this.playerName;
            handleNameInput();
            this.switchScreen('pick-name');
        });

        // Chuyển màn hình từ Main Menu
        this.dom.btnPlayNow.addEventListener('click', () => {
            window.soundManager.playClick();
            this.switchScreen('game');
            this.startNewGame();
        });

        this.dom.btnHowToPlay.addEventListener('click', () => {
            window.soundManager.playClick();
            this.showModal(this.dom.modalHowToPlay);
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
            this.hideModals();
            this.switchScreen('main-menu');
        });

        // Nút về menu từ màn hình kết quả
        this.dom.btnResultHome.addEventListener('click', () => {
            window.soundManager.playClick();
            this.hideModals();
            this.switchScreen('main-menu');
        });

        // Nút chơi lại từ màn hình kết quả
        this.dom.btnPlayAgain.addEventListener('click', () => {
            window.soundManager.playClick();
            this.hideModals();
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

    confirmPlayerName() {
        const val = this.dom.inputHeroName.value.trim();
        if (val.length >= 3 && val.length <= 9 && /^[a-zA-Z0-9]+$/.test(val)) {
            this.playerName = val;
            localStorage.setItem('flipCardHero_playerName', this.playerName);
            this.updatePlayerNameDisplays();
            this.switchScreen('main-menu');
        }
    }

    updatePlayerNameDisplays() {
        const upper = this.playerName.toUpperCase();
        if (this.dom.menuPlayerNameTag) {
            this.dom.menuPlayerNameTag.textContent = `${upper} (BẠN)`;
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

        // Chuyển sang màn hình chọn tên hoặc menu chính sau 1.6 giây
        setTimeout(() => {
            if (this.currentScreen === 'splash') {
                const saved = localStorage.getItem('flipCardHero_playerName');
                if (saved && saved.length >= 3 && saved.length <= 9) {
                    this.playerName = saved;
                    this.updatePlayerNameDisplays();
                    this.switchScreen('main-menu');
                } else {
                    this.switchScreen('pick-name');
                }
            }
        }, 1700);

        this.dom.screenSplash.addEventListener('click', () => {
            if (this.currentScreen === 'splash') {
                const saved = localStorage.getItem('flipCardHero_playerName');
                if (saved && saved.length >= 3 && saved.length <= 9) {
                    this.playerName = saved;
                    this.updatePlayerNameDisplays();
                    this.switchScreen('main-menu');
                } else {
                    this.switchScreen('pick-name');
                }
            }
        }, { once: true });
    }

    switchScreen(screenName) {
        this.currentScreen = screenName;
        const screens = [
            this.dom.screenSplash,
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
        this.playerCards = 10;
        this.botCards = 10;
        this.currentRound = 1;
        this.lastRoundWinner = null;
        this.isGameEnded = false;

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
        this.dom.roundBadge.textContent = `HIỆP ${this.currentRound} / ${this.maxRounds}`;
    }

    renderDecks() {
        this.dom.playerDeckStack.style.height = `${Math.min(32, Math.max(4, this.playerCards * 3))}px`;
        this.dom.botDeckStack.style.height = `${Math.min(32, Math.max(4, this.botCards * 3))}px`;
    }

    // ========================================================
    // ROUND FLOW
    // ========================================================

    startRound(roundNumber) {
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
        this.dom.potCountBadge.textContent = `${this.potCards} lá trên sàn`;

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
        this.dom.rpsStatus.textContent = 'Oẳn tù tì để quyết định bên nào được đập trước ở Hiệp 1!';
        this.dom.rpsButtons.forEach(b => b.disabled = false);
    }

    handlePlayerRpsChoice(playerChoice) {
        this.dom.rpsButtons.forEach(b => b.disabled = true);
        window.soundManager.playClick();

        const choices = ['rock', 'paper', 'scissors'];
        const emojiMap = { rock: '✊', paper: '✋', scissors: '✌️' };

        this.dom.rpsPlayerChoice.textContent = emojiMap[playerChoice];
        this.dom.rpsStatus.textContent = 'Oẳn tù tì... ra cái gì ra cái này!';
        window.soundManager.playRpsCountdown(400);

        setTimeout(() => {
            window.soundManager.playRpsCountdown(520);
        }, 300);

        setTimeout(() => {
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
                this.dom.rpsStatus.innerHTML = '<span style="color:#d97706">HÒA NHAU! Oẳn tù tì lại nào!</span>';
                setTimeout(() => {
                    this.dom.rpsPlayerChoice.textContent = '❓';
                    this.dom.rpsBotChoice.textContent = '❓';
                    this.dom.rpsButtons.forEach(b => b.disabled = false);
                }, 900);
            } else if (rpsResult === 'win') {
                this.dom.rpsStatus.innerHTML = '<span style="color:#16a34a">BẠN THẮNG! BẠN ĐƯỢC ĐẬP TRƯỚC! 🔥</span>';
                this.activeSmasher = 'player';
                setTimeout(() => {
                    this.hideModals();
                    this.startSmashPhase();
                }, 1300);
            } else {
                this.dom.rpsStatus.innerHTML = '<span style="color:#dc2626">ROBO THẮNG! ROBO ĐƯỢC ĐẬP TRƯỚC! 🤖</span>';
                this.activeSmasher = 'bot';
                setTimeout(() => {
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
            this.dom.stakePromptText.innerHTML = `🌟 <b>BẠN THẮNG HIỆP TRƯỚC!</b><br>Bạn được quyền ĐẬP TRƯỚC và chọn số lá cược (tối đa ${maxStake} lá):`;
            this.dom.stakeBotNotice.classList.add('hidden');

            for (let s = minStake; s <= maxStake; s++) {
                const btn = document.createElement('button');
                btn.className = 'btn-stake-choice';
                btn.innerHTML = `<span class="stake-num">${s}</span><span class="stake-lbl">LÁ</span>`;
                btn.addEventListener('click', () => {
                    window.soundManager.playClick();
                    this.confirmStake(s);
                });
                this.dom.stakeButtonsContainer.appendChild(btn);
            }
        } else {
            // Máy thắng hiệp trước
            this.activeSmasher = 'bot';
            this.dom.stakePromptText.innerHTML = `🤖 <b>ROBO THẮNG HIỆP TRƯỚC!</b><br>Robo sẽ được đập trước và đang chọn số lá cược...`;
            this.dom.stakeBotNotice.classList.remove('hidden');

            setTimeout(() => {
                const botStake = Math.floor(Math.random() * (maxStake - minStake + 1)) + minStake;
                this.dom.stakePromptText.innerHTML = `🤖 <b>ROBO ĐÃ CHỌN CƯỢC ${botStake} LÁ!</b>`;
                window.soundManager.playRpsCountdown(500);

                setTimeout(() => {
                    this.confirmStake(botStake);
                }, 900);
            }, 1200);
        }
    }

    confirmStake(stakeAmount) {
        this.hideModals();
        this.preparePot(stakeAmount);
        // Từ round 2 trở đi, KHÔNG CẦN RPS! Vào thẳng lượt đập của người thắng!
        this.startSmashPhase();
    }

    // ========================================================
    // PHASE: SMASH PHASE (CANH THANH LỰC 5%)
    // ========================================================

    startSmashPhase() {
        this.dom.smashBarContainer.classList.remove('disabled');
        this.renderPotCards(false);

        // Đặt vùng 5% ngẫu nhiên trên thanh (từ 15% đến 80%)
        this.sweetSpotStart = Math.floor(Math.random() * 66) + 15;
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
            this.dom.btnSmash.textContent = '💥 ĐẬP NGAY! 💥';
            this.dom.arenaMessage.textContent = 'Tập trung! Canh đúng vạch VÀNG rồi bấm ĐẬP!';
        } else {
            this.dom.btnSmash.disabled = true;
            this.dom.btnSmash.classList.add('bot-turn');
            this.dom.btnSmash.textContent = '🤖 ROBO ĐANG CANH ĐẬP...';
            this.dom.arenaMessage.textContent = 'Robo Titan đang canh nhịp con trỏ...';

            this.scheduleBotSmash();
        }
    }

    updateTurnIndicator() {
        if (this.activeSmasher === 'player') {
            this.dom.turnIndicator.innerHTML = '<span class="badge player">👉 LƯỢT CỦA BẠN</span>';
            this.dom.turnIndicator.className = 'turn-box player-turn';
        } else {
            this.dom.turnIndicator.innerHTML = '<span class="badge bot">👉 LƯỢT CỦA ROBO</span>';
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

        // Robo bấm ngẫu nhiên theo thời gian
        const randomDelay = Math.floor(Math.random() * 1200) + 850;

        this.botSmashTimeout = setTimeout(() => {
            if (this.activeSmasher === 'bot' && this.isPointerMoving) {
                this.executeSmash('bot');
            }
        }, randomDelay);
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

        this.showToast(
            smasher === 'player' ? '🔥 BẠN ĐÃ LẬT BÀI THÀNH CÔNG!' : '🤖 ROBO ĐÃ LẬT BÀI THÀNH CÔNG!',
            'success'
        );

        const wonCards = this.potCards;
        this.lastRoundWinner = smasher;

        setTimeout(() => {
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

        this.showToast(
            smasher === 'player' ? '💨 ĐẬP HỤT! Chuyển lượt sang ROBO!' : '💨 ROBO ĐẬP HỤT! Chuyển lượt sang BẠN!',
            'miss'
        );

        // Chuyển lượt
        setTimeout(() => {
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
        this.showToast(`Chuẩn bị bắt đầu Hiệp ${nextRound}...`, 'info');
        setTimeout(() => {
            this.startRound(nextRound);
        }, 1500);
    }

    endGame(reason) {
        this.isGameEnded = true;
        this.stopPointerMovement();
        if (this.botSmashTimeout) clearTimeout(this.botSmashTimeout);

        this.showModal(this.dom.modalResult);

        let isPlayerWin = false;
        let isDraw = false;

        this.dom.resultTitle.className = 'modal-title result-headline';

        if (reason === 'player_knockout') {
            isPlayerWin = true;
            this.dom.resultTitle.textContent = 'YOU WON! 🏆';
            this.dom.resultTitle.classList.add('win-text');
            this.dom.resultSubtitle.textContent = 'BẠN ĐÃ HỐT SẠCH BÀI CỦA ROBO (KNOCKOUT)!';
            this.dom.resultHeroImg.src = 'icons/trophy-win.svg';
        } else if (reason === 'bot_knockout') {
            isPlayerWin = false;
            this.dom.resultTitle.textContent = 'YOU LOST! 💀';
            this.dom.resultTitle.classList.add('lose-text');
            this.dom.resultSubtitle.textContent = 'Bạn đã hết sạch bài trước khi qua 5 hiệp!';
            this.dom.resultHeroImg.src = 'icons/lose-cry.svg';
        } else {
            // Hết 5 hiệp, so sánh số bài
            if (this.playerCards > this.botCards) {
                isPlayerWin = true;
                this.dom.resultTitle.textContent = 'YOU WON! 🏆';
                this.dom.resultTitle.classList.add('win-text');
                this.dom.resultSubtitle.textContent = `Sau 5 hiệp đấu, bạn nắm giữ nhiều bài hơn!`;
                this.dom.resultHeroImg.src = 'icons/trophy-win.svg';
            } else if (this.playerCards < this.botCards) {
                isPlayerWin = false;
                this.dom.resultTitle.textContent = 'YOU LOST! 💀';
                this.dom.resultTitle.classList.add('lose-text');
                this.dom.resultSubtitle.textContent = `Robo Titan đã sở hữu nhiều bài hơn sau 5 hiệp!`;
                this.dom.resultHeroImg.src = 'icons/lose-cry.svg';
            } else {
                isDraw = true;
                this.dom.resultTitle.textContent = 'DRAW! 🤝';
                this.dom.resultSubtitle.textContent = `Cả hai bên đều sở hữu đúng 10 lá bài!`;
                this.dom.resultHeroImg.src = 'icons/trophy-win.svg';
            }
        }

        this.dom.resultScoreDetail.innerHTML = `
            <div class="final-score-box">
                <div class="side-score player">
                    <span>👤 ${this.playerName.toUpperCase()}</span>
                    <strong>${this.playerCards} LÁ</strong>
                </div>
                <div class="hud-center-vs" style="font-size: 20px; color: #ef4444;">VS</div>
                <div class="side-score bot">
                    <span>🤖 ROBO</span>
                    <strong>${this.botCards} LÁ</strong>
                </div>
            </div>
        `;

        if (isPlayerWin) {
            window.soundManager.playVictory();
            this.launchConfetti();
        } else if (!isDraw) {
            window.soundManager.playDefeat();
        }

        // ========================================================
        // GOOGLE ADMOB: Hiển thị Interstitial sau khi có kết quả ván đấu (Thắng hoặc Thua)
        // Độ trễ 1.2s giúp người chơi kịp nhìn thấy kết quả và lắng nghe âm thanh chiến thắng / thất bại
        // ========================================================
        if (window.adsManager) {
            setTimeout(() => {
                window.adsManager.showInterstitial();
            }, 1200);
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
            this.dom.modalSettings
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
            this.dom.modalSettings
        ].forEach(m => m.classList.add('hidden'));
    }
}

// Khởi tạo Game
window.addEventListener('DOMContentLoaded', () => {
    window.game = new FlipCardGame();
});
