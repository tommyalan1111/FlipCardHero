/**
 * Flip Card Hero - i18n (Tiếng Việt / English)
 * - Tự chọn ngôn ngữ theo máy khi mở lần đầu, fallback Tiếng Việt.
 * - Lưu lựa chọn vào localStorage.
 * - Đổi ngôn ngữ trong Cài đặt, áp dụng ngay không cần reload.
 */
(function () {
    const TRANSLATIONS = {
        vi: {
            'app.title': 'Flip Card Hero - Vua Đập Bài',
            'splash.subtitle': '⚡ VUA ĐẬP BÀI TUỔI THƠ ⚡',
            'splash.tip': 'Đang sẵn sàng vào sàn đấu...',

            'pick.badge': '⭐ HERO MỚI ⭐',
            'pick.title': 'ĐẶT TÊN HERO',
            'pick.subtitle': 'Hãy chọn cho bạn một biệt danh thật ngầu!',
            'pick.label': 'Tên Hero (3 - 9 ký tự):',
            'pick.placeholder': 'Nhập tên...',
            'pick.hint': 'ℹ️ Chỉ gồm chữ cái và số, không chứa dấu cách.',
            'pick.confirm': 'VÀO GAME!',

            'menu.badge': '⭐ HERO',
            'menu.heartTitle': 'Mỗi trận tốn 1 tim. Tim tự hồi 1 viên mỗi 30 phút.',
            'menu.settingsTitle': 'Cài đặt',
            'menu.editName': 'Đổi tên',
            'menu.hint': '⚔️ CHỌN<br>BOSS ĐỂ ĐẤU',
            'menu.battle': 'ĐẤU {boss}',
            'menu.bossAria': 'Chọn boss',
            'menu.rules': 'LUẬT CHƠI',
            'menu.freeHeart': 'NHẬN 1 ❤️ MIỄN PHÍ',
            'menu.freeHeartFull': '❤️ TIM ĐÃ ĐẦY',
            'menu.leaderboard': 'BẢNG XẾP HẠNG',
            'menu.footer': '© 2026 Flip Card Hero • Đập Bài Đối Kháng',

            'boss.easy': 'ROBO TẬP SỰ',
            'boss.medium': 'ROBO TITAN',
            'boss.hard': 'ROBO HỦY DIỆT',

            'game.menu': 'MENU',
            'game.backTitle': 'Back to menu',
            'game.backTitle': 'Quay về menu',
            'game.round': 'HIỆP {round} / {max}',
            'game.cards': '{count} Lá',
            'game.you': 'BẠN',
            'game.turnPlayer': '👉 LƯỢT CỦA BẠN',
            'game.turnBot': '👉 LƯỢT CỦA ROBO',
            'game.pot': '{count} lá trên sàn',
            'game.arenaHint': 'Canh con trỏ đúng vạch VÀNG rồi bấm ĐẬP!',
            'game.smashTitle': '⚡ LỰC ĐẬP (SMASH STRENGTH)',
            'game.smashButton': '💥 ĐẬP NGAY! 💥',
            'game.botWaiting': '🤖 ROBO ĐANG CANH ĐẬP...',
            'game.botAiming': '{boss} đang canh nhịp con trỏ...',
            'game.soundTitle': 'Âm thanh',
            'game.heartsTitle': 'Tim còn lại',
            'game.focus': 'Tập trung! Canh đúng vạch VÀNG rồi bấm ĐẬP!',
            'game.flipWin': '🔥 BẠN ĐÃ LẬT BÀI THÀNH CÔNG!',
            'game.flipWinBot': '🤖 {boss} ĐÃ LẬT BÀI THÀNH CÔNG!',
            'game.missPlayer': '💨 ĐẬP HỤT! Chuyển lượt sang {boss}!',
            'game.missBot': '💨 {boss} ĐẬP HỤT! Chuyển lượt sang BẠN!',
            'game.nextRound': 'Chuẩn bị bắt đầu Hiệp {round}...',

            'rps.badge': 'Hiệp 1',
            'rps.title': 'OẰN TÙ TÌ MỞ MÀN!',
            'rps.desc': 'Chọn ra cái gì để quyết định bên nào được đập trước ở Hiệp 1!',
            'rps.you': 'Bạn',
            'rps.robot': 'Robo',
            'rps.rockHtml': '<span>✊</span>Búa',
            'rps.scissorsHtml': '<span>✌️</span>Kéo',
            'rps.paperHtml': '<span>✋</span>Bao',
            'rps.pick': 'Oẳn tù tì... ra cái gì ra cái này!',
            'rps.draw': 'HÒA NHAU! Oẳn tù tì lại nào!',
            'rps.win': 'BẠN THẮNG! BẠN ĐƯỢC ĐẬP TRƯỚC! 🔥',
            'rps.lose': 'ROBO THẮNG! ROBO ĐƯỢC ĐẬP TRƯỚC! 🤖',

            'stake.badge': 'Chọn Cược',
            'stake.title': 'CHỌN MỨC CƯỢC',
            'stake.desc': 'Người thắng hiệp trước được quyền chọn số bài cược:',
            'stake.winPrompt': '🌟 <b>BẠN THẮNG HIỆP TRƯỚC!</b><br>Bạn được quyền ĐẬP TRƯỚC và chọn số lá cược (tối đa {max} lá):',
            'stake.botPrompt': '🤖 <b>{boss} THẮNG HIỆP TRƯỚC!</b><br>{boss} sẽ được đập trước và đang chọn số lá cược...',
            'stake.botChosen': '🤖 <b>{boss} ĐÃ CHỌN CƯỢC {stake} LÁ!</b>',
            'stake.thinking': '{boss} đang suy nghĩ mức cược...',
            'stake.cardUnit': 'LÁ',

            'result.badge': 'Kết Quả',
            'result.win': 'YOU WON!',
            'result.lose': 'YOU LOST! 💀',
            'result.draw': 'DRAW! 🤝',
            'result.knockoutWin': 'BẠN ĐÃ HỐT SẠCH BÀI CỦA {boss} (KNOCKOUT)!',
            'result.knockoutLose': 'Bạn đã hết sạch bài trước khi qua 5 hiệp!',
            'result.maxWin': 'Sau 5 hiệp đấu, bạn nắm giữ nhiều bài hơn!',
            'result.maxLose': '{boss} đã sở hữu nhiều bài hơn sau 5 hiệp!',
            'result.drawText': 'Cả hai bên đều sở hữu đúng 10 lá bài!',
            'result.spinEarned': 'Bạn nhận được 1 lượt quay may mắn! 🎡',
            'result.wheelCta': '🎡 VÒNG QUAY MAY MẮN',
            'result.replay': '🔄 CHƠI LẠI',
            'result.home': '🏠 VỀ MENU',
            'result.cards': '{count} LÁ',
            'result.youLabel': '👤 {name}',
            'result.botLabel': '🤖 {boss}',

            'how.badge': 'Hướng Dẫn',
            'how.title': 'CÁCH CHƠI VUA ĐẬP BÀI',
            'how.rule1': '<strong>Tối đa 10 Tim:</strong> Mỗi trận tốn <strong>1 ❤️</strong>. Tim tự hồi <strong>1 ❤️ mỗi 30 phút</strong>, kể cả khi tắt game (tối đa 10 tim).',
            'how.rule2': '<strong>3 Boss: Easy / Medium / Hard:</strong> Boss càng khó, vùng vàng càng hẹp và Robo càng tinh ranh.',
            'how.rule3': '<strong>Khởi đầu 10 lá bài:</strong> Mỗi bên cầm 10 lá. Trận đấu diễn ra trong tối đa 5 hiệp.',
            'how.rule4': '<strong>Hiệp 1:</strong> Bắt buộc cược 1 lá mỗi bên. Oẳn tù tì để biết bên nào được đập trước!',
            'how.rule5': '<strong>Hiệp 2 đến 5:</strong> KHÔNG cần oẳn tù tì! Người thắng hiệp trước được quyền chọn cược (2-5 lá) VÀ được quyền đập trước!',
            'how.rule6': '<strong>Canh đúng vạch Vàng & Đập hụt:</strong> Đập trúng vạch vàng để ăn hết bài cược; đập hụt sẽ đổi lượt. Hết bài trước là thua ngay!',
            'how.rule7': '<strong>Thắng → Vòng quay may mắn:</strong> Thắng trận để nhận 1 lượt quay may mắn!',
            'how.close': '◀ ĐÃ HIỂU, QUAY LẠI',

            'settings.badge': 'Cài Đặt',
            'settings.title': 'CÀI ĐẶT GAME',
            'settings.sound': 'Hiệu ứng âm thanh',
            'settings.vibrate': 'Rung điện thoại (Haptic)',
            'settings.language': 'Ngôn ngữ',
            'settings.version': 'Phiên bản 1.4.0 • Hero Edition',
            'settings.close': '◀ LƯU & QUAY LẠI',

            'wheel.badge': 'Phần Thưởng',
            'wheel.title': 'VÒNG QUAY MAY MẮN',
            'wheel.later': 'Để sau',
            'wheel.default': '🍀 Chạm QUAY để thử vận may!',
            'wheel.spinning': '🎡 Đang quay...',
            'wheel.win': '🎉 TRÚNG THƯỞNG! +1 ❤️',
            'wheel.winFull': '🎉 TRÚNG Ô TIM! Nhưng tim đã đầy rồi.',
            'wheel.lose': '😢 Ô trống! Chúc bạn may mắn lần sau!',
            'wheel.continue': 'TIẾP TỤC ▶',
            'wheel.hearts': 'Tim hiện có:',
            'wheel.spin': '🎡 QUAY NGAY!',
            'wheel.cellHidden': 'Ô chưa mở',
            'wheel.cellHeart': 'Ô tim',
            'wheel.cellEmpty': 'Ô trống',

            'noHearts.badge': 'Hết Tim',
            'noHearts.title': 'BẠN ĐÃ HẾT TIM!',
            'noHearts.desc': 'Mỗi trận đấu tốn <strong>1 ❤️</strong>.<br>Tim tự hồi <strong>1 ❤️ mỗi 30 phút</strong> (kể cả khi tắt game).',
            'noHearts.next': '❤️ Tim tiếp theo sau',
            'noHearts.close': 'OK, CHỜ THÊM',
            'noHearts.closeBtn': 'Đóng',

            'leaderboard.badge': 'Xếp Hạng',
            'leaderboard.title': 'BẢNG XẾP HẠNG',
            'leaderboard.loading': 'Đang tải bảng xếp hạng...',
            'leaderboard.unavailable': 'Bảng xếp hạng chỉ khả dụng trên app Android đã cấu hình Firebase.',
            'leaderboard.timeout': 'Kết nối quá lâu. Kiểm tra mạng rồi thử lại nhé!',
            'leaderboard.error': 'Không thể tải bảng xếp hạng. Kiểm tra mạng và cấu hình Firebase.',
            'leaderboard.empty': 'Chưa có ai trên bảng. Thắng 1 trận để ghi tên nhé!',
            'leaderboard.wins': '{count} trận thắng',
            'leaderboard.points': '{count} điểm',
            'leaderboard.pointsUnit': 'điểm',
            'leaderboard.rank': 'Hạng #{rank}',
            'leaderboard.rankOutside': 'Hạng #{rank} • Ngoài top 50',
            'leaderboard.unranked': 'Chưa có hạng trên bảng',
            'leaderboard.loadingRank': 'Đang tải hạng...',
            'leaderboard.refresh': '🔄 LÀM MỚI',
            'leaderboard.youLine': '👤 {name} • {wins} thắng',

            'freeHeart.loading': '⏳ ĐANG TẢI QUẢNG CÁO...',
            'freeHeart.full': '❤️ Tim đã đầy rồi!',
            'freeHeart.adOnly': '📱 Quảng cáo chỉ khả dụng trên ứng dụng Android.',
            'freeHeart.success': '🎉 +1 ❤️! Tim đã được cộng.',
            'freeHeart.watched': '⏹️ Bạn cần xem hết quảng cáo để nhận tim.',
            'freeHeart.timeout': '⏳ Quảng cáo mất quá lâu. Thử lại sau nhé!',
            'freeHeart.noAd': '😢 Chưa có quảng cáo phù hợp. Thử lại sau nhé!',

            'name.info': 'ℹ️ Từ 3 đến 9 ký tự, chỉ gồm chữ cái và số.',
            'name.tooShort': '❌ Tên quá ngắn! Phải từ 3 ký tự trở lên (> 2).',
            'name.tooLong': '❌ Tên quá dài! Tối đa 9 ký tự (< 10).',
            'name.valid': '✅ Tên hợp lệ! Sẵn sàng vào đấu trường!',

            'common.back': 'Quay Lại',
            'common.menu': 'Menu',
            'common.close': 'Đóng',
            'common.later': 'Để sau',
            'common.result': 'Kết Quả',
            'common.stake': 'Chọn Cược',
            'common.guide': 'Hướng Dẫn',
            'common.settings': 'Cài Đặt',
            'common.reward': 'Phần Thưởng',
            'common.ranking': 'Xếp Hạng',
            'common.full': 'ĐẦY',
            'common.cards': 'Lá',
            'common.gamesWon': '{count} thắng'
        },
        en: {
            'app.title': 'Flip Card Hero - Card Smash',
            'splash.subtitle': '⚡ CHILDHOOD CARD SMASH ⚡',
            'splash.tip': 'Getting the arena ready...',

            'pick.badge': '⭐ NEW HERO ⭐',
            'pick.title': 'NAME YOUR HERO',
            'pick.subtitle': 'Pick a cool nickname for yourself!',
            'pick.label': 'Hero name (3 - 9 characters):',
            'pick.placeholder': 'Enter name...',
            'pick.hint': 'ℹ️ Letters and numbers only, no spaces.',
            'pick.confirm': 'START!',

            'menu.badge': '⭐ HERO',
            'menu.heartTitle': 'Each match costs 1 heart. Refills 1 heart every 30 minutes.',
            'menu.settingsTitle': 'Settings',
            'menu.editName': 'Change name',
            'menu.hint': '⚔️ CHOOSE<br>A BOSS TO FIGHT',
            'menu.battle': 'FIGHT {boss}',
            'menu.bossAria': 'Choose a boss',
            'menu.rules': 'HOW TO PLAY',
            'menu.freeHeart': 'GET 1 FREE ❤️',
            'menu.freeHeartFull': '❤️ HEARTS FULL',
            'menu.leaderboard': 'LEADERBOARD',
            'menu.footer': '© 2026 Flip Card Hero • Card Smash Battle',

            'boss.easy': 'ROOKIE ROBO',
            'boss.medium': 'ROBO TITAN',
            'boss.hard': 'ROBO DESTROYER',

            'game.menu': 'MENU',
            'game.backTitle': 'Back to menu',
            'game.backTitle': 'Quay về menu',
            'game.round': 'ROUND {round} / {max}',
            'game.cards': '{count} Cards',
            'game.you': 'YOU',
            'game.turnPlayer': '👉 YOUR TURN',
            'game.turnBot': '👉 ROBO\'S TURN',
            'game.pot': '{count} cards on table',
            'game.arenaHint': 'Stop the pointer on the GOLD zone and smash!',
            'game.smashTitle': '⚡ SMASH STRENGTH',
            'game.smashButton': '💥 SMASH NOW! 💥',
            'game.botWaiting': '🤖 ROBO IS AIMING...',
            'game.botAiming': '{boss} is timing the pointer...',
            'game.soundTitle': 'Sound',
            'game.heartsTitle': 'Hearts remaining',
            'game.focus': 'Focus! Hit the GOLD zone and smash!',
            'game.flipWin': '🔥 YOU FLIPPED THE CARDS!',
            'game.flipWinBot': '🤖 {boss} FLIPPED THE CARDS!',
            'game.missPlayer': '💨 MISSED! Turn passes to {boss}!',
            'game.missBot': '💨 {boss} MISSED! Your turn!',
            'game.nextRound': 'Getting ready for Round {round}...',

            'rps.badge': 'Round 1',
            'rps.title': 'ROCK PAPER SCISSORS!',
            'rps.desc': 'Make your choice to decide who smashes first in Round 1!',
            'rps.you': 'You',
            'rps.robot': 'Robo',
            'rps.rockHtml': '<span>✊</span>Rock',
            'rps.scissorsHtml': '<span>✌️</span>Scissors',
            'rps.paperHtml': '<span>✋</span>Paper',
            'rps.pick': 'Rock... paper... scissors... shoot!',
            'rps.draw': 'DRAW! Play again!',
            'rps.win': 'YOU WIN! YOU SMASH FIRST! 🔥',
            'rps.lose': 'ROBO WINS! ROBO SMASHES FIRST! 🤖',

            'stake.badge': 'Stake',
            'stake.title': 'CHOOSE YOUR STAKE',
            'stake.desc': 'The winner of the previous round chooses the stake:',
            'stake.winPrompt': '🌟 <b>YOU WON THE LAST ROUND!</b><br>You smash first and choose the stake (up to {max} cards):',
            'stake.botPrompt': '🤖 <b>{boss} WON THE LAST ROUND!</b><br>{boss} smashes first and is choosing the stake...',
            'stake.botChosen': '🤖 <b>{boss} STAKED {stake} CARDS!</b>',
            'stake.thinking': '{boss} is choosing a stake...',
            'stake.cardUnit': 'CARDS',

            'result.badge': 'Result',
            'result.win': 'YOU WON!',
            'result.lose': 'YOU LOST! 💀',
            'result.draw': 'DRAW! 🤝',
            'result.knockoutWin': 'YOU TOOK ALL OF {boss}\'S CARDS (KNOCKOUT)!',
            'result.knockoutLose': 'You ran out of cards before 5 rounds!',
            'result.maxWin': 'After 5 rounds, you hold more cards!',
            'result.maxLose': '{boss} holds more cards after 5 rounds!',
            'result.drawText': 'Both sides hold exactly 10 cards!',
            'result.spinEarned': 'You earned 1 lucky spin! 🎡',
            'result.wheelCta': '🎡 LUCKY SPIN',
            'result.replay': '🔄 PLAY AGAIN',
            'result.home': '🏠 HOME',
            'result.cards': '{count} CARDS',
            'result.youLabel': '👤 {name}',
            'result.botLabel': '🤖 {boss}',

            'how.badge': 'Guide',
            'how.title': 'HOW TO PLAY',
            'how.rule1': '<strong>Up to 10 Hearts:</strong> Each match costs <strong>1 ❤️</strong>. Hearts refill <strong>1 ❤️ every 30 minutes</strong>, even while the game is closed (max 10).',
            'how.rule2': '<strong>3 Bosses: Easy / Medium / Hard:</strong> The harder the boss, the narrower the gold zone and the smarter Robo becomes.',
            'how.rule3': '<strong>Start with 10 cards:</strong> Each side holds 10 cards. A match lasts up to 5 rounds.',
            'how.rule4': '<strong>Round 1:</strong> Both sides must stake 1 card. Rock-paper-scissors decides who smashes first!',
            'how.rule5': '<strong>Rounds 2 to 5:</strong> No rock-paper-scissors! The previous round winner chooses the stake (2-5 cards) AND smashes first!',
            'how.rule6': '<strong>Hit the gold zone & misses:</strong> Hit the gold zone to take all staked cards; a miss passes the turn. Run out of cards and you lose!',
            'how.rule7': '<strong>Win → Lucky Spin:</strong> Win a match to earn 1 lucky spin!',
            'how.close': '◀ GOT IT, GO BACK',

            'settings.badge': 'Settings',
            'settings.title': 'GAME SETTINGS',
            'settings.sound': 'Sound effects',
            'settings.vibrate': 'Vibration (Haptic)',
            'settings.language': 'Language',
            'settings.version': 'Version 1.4.0 • Hero Edition',
            'settings.close': '◀ SAVE & BACK',

            'wheel.badge': 'Reward',
            'wheel.title': 'LUCKY SPIN',
            'wheel.later': 'Later',
            'wheel.default': '🍀 Tap SPIN to test your luck!',
            'wheel.spinning': '🎡 Spinning...',
            'wheel.win': '🎉 JACKPOT! +1 ❤️',
            'wheel.winFull': '🎉 HEART HIT! But your hearts are full.',
            'wheel.lose': '😢 Empty slot! Better luck next time!',
            'wheel.continue': 'CONTINUE ▶',
            'wheel.hearts': 'Hearts:',
            'wheel.spin': '🎡 SPIN NOW!',
            'wheel.cellHidden': 'Hidden cell',
            'wheel.cellHeart': 'Heart cell',
            'wheel.cellEmpty': 'Empty cell',

            'noHearts.badge': 'Out of Hearts',
            'noHearts.title': 'YOU\'RE OUT OF HEARTS!',
            'noHearts.desc': 'Each match costs <strong>1 ❤️</strong>.<br>Hearts refill <strong>1 ❤️ every 30 minutes</strong> (even while the game is closed).',
            'noHearts.next': '❤️ Next heart in',
            'noHearts.close': 'OK, I\'LL WAIT',
            'noHearts.closeBtn': 'Close',

            'leaderboard.badge': 'Ranking',
            'leaderboard.title': 'LEADERBOARD',
            'leaderboard.loading': 'Loading leaderboard...',
            'leaderboard.unavailable': 'Leaderboard is only available in the Android app with Firebase configured.',
            'leaderboard.timeout': 'Connection timed out. Check your network and try again!',
            'leaderboard.error': 'Could not load the leaderboard. Check your network and Firebase configuration.',
            'leaderboard.empty': 'No one is on the leaderboard yet. Win a match to claim your spot!',
            'leaderboard.wins': '{count} wins',
            'leaderboard.points': '{count} pts',
            'leaderboard.pointsUnit': 'pts',
            'leaderboard.rank': 'Rank #{rank}',
            'leaderboard.rankOutside': 'Rank #{rank} • Outside top 50',
            'leaderboard.unranked': 'Not ranked yet',
            'leaderboard.loadingRank': 'Loading rank...',
            'leaderboard.refresh': '🔄 REFRESH',
            'leaderboard.youLine': '👤 {name} • {wins} wins',

            'freeHeart.loading': '⏳ LOADING AD...',
            'freeHeart.full': '❤️ Your hearts are full!',
            'freeHeart.adOnly': '📱 Ads are only available in the Android app.',
            'freeHeart.success': '🎉 +1 ❤️! Heart added.',
            'freeHeart.watched': '⏹️ Watch the full ad to earn a heart.',
            'freeHeart.timeout': '⏳ The ad is taking too long. Try again later!',
            'freeHeart.noAd': '😢 No ad available right now. Try again later!',

            'name.info': 'ℹ️ 3 to 9 characters, letters and numbers only.',
            'name.tooShort': '❌ Name too short! Use at least 3 characters (> 2).',
            'name.tooLong': '❌ Name too long! Maximum 9 characters (< 10).',
            'name.valid': '✅ Valid name! Ready for the arena!',

            'common.back': 'Back',
            'common.menu': 'Menu',
            'common.close': 'Close',
            'common.later': 'Later',
            'common.result': 'Result',
            'common.stake': 'Stake',
            'common.guide': 'Guide',
            'common.settings': 'Settings',
            'common.reward': 'Reward',
            'common.ranking': 'Ranking',
            'common.full': 'FULL',
            'common.cards': 'Cards',
            'common.gamesWon': '{count} wins'
        }
    };

    class I18nManager {
        constructor() {
            this.lang = this.detectLanguage();
            this.bindLanguageButtons();
            this.apply();
            document.documentElement.lang = this.lang;
        }

        detectLanguage() {
            try {
                const saved = localStorage.getItem('flipCardHero_language');
                if (saved === 'vi' || saved === 'en') {
                    return saved;
                }
            } catch (e) {
                // localStorage có thể bị chặn
            }

            const nav = (navigator.language || navigator.userLanguage || 'vi').toLowerCase();
            return nav.startsWith('en') ? 'en' : 'vi';
        }

        t(key, params) {
            const dict = TRANSLATIONS[this.lang] || TRANSLATIONS.vi;
            let text = dict[key];
            if (text === undefined) {
                text = TRANSLATIONS.vi[key];
            }
            if (text === undefined) {
                return key;
            }
            if (params) {
                Object.keys(params).forEach((name) => {
                    text = text.split(`{${name}}`).join(String(params[name]));
                });
            }
            return text;
        }

        setLanguage(lang) {
            if (!TRANSLATIONS[lang] || lang === this.lang) {
                return;
            }

            this.lang = lang;
            try {
                localStorage.setItem('flipCardHero_language', lang);
            } catch (e) {
                // Bỏ qua nếu localStorage bị chặn
            }

            document.documentElement.lang = lang;
            this.apply();

            document.dispatchEvent(new CustomEvent('languagechange', {
                detail: { lang }
            }));
        }

        apply() {
            document.querySelectorAll('[data-i18n]').forEach((el) => {
                el.textContent = this.t(el.dataset.i18n);
            });

            document.querySelectorAll('[data-i18n-html]').forEach((el) => {
                el.innerHTML = this.t(el.dataset.i18nHtml);
            });

            document.querySelectorAll('[data-i18n-title]').forEach((el) => {
                el.title = this.t(el.dataset.i18nTitle);
            });

            document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
                el.placeholder = this.t(el.dataset.i18nPlaceholder);
            });

            document.querySelectorAll('[data-i18n-aria]').forEach((el) => {
                el.setAttribute('aria-label', this.t(el.dataset.i18nAria));
            });

            document.querySelectorAll('.lang-btn').forEach((btn) => {
                btn.classList.toggle('active', btn.dataset.lang === this.lang);
            });
        }

        bindLanguageButtons() {
            document.querySelectorAll('.lang-btn').forEach((btn) => {
                btn.addEventListener('click', () => {
                    this.setLanguage(btn.dataset.lang);
                });
            });
        }
    }

    window.i18n = new I18nManager();
})();
