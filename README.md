# FLIP CARD HERO (VUA ĐẬP BÀI) 💥🃏

Game đập bài tuổi thơ đối kháng với Máy (AI Bot), được thiết kế tối ưu hóa cho màn hình cảm ứng di động và hỗ trợ đóng gói xuất bản thành ứng dụng Android APK.

---

## 🎮 CƠ CHẾ GAMEPLAY (THEO YÊU CẦU)

1. **Khởi đầu trận đấu:**
   - Người chơi và Máy mỗi bên cầm **10 lá bài**.
   - Trận đấu diễn ra tối đa trong **5 hiệp**.

2. **Cược bài vào mâm (Pot):**
   - **Hiệp 1:** Bắt buộc mỗi bên bỏ ra **1 lá** (tổng 2 lá trên mâm).
   - **Hiệp 2 đến 5:** Người thắng hiệp trước có quyền chọn mức cược từ **2 đến 5 lá** (không vượt quá số bài hiện có của bên ít bài hơn). Nếu Máy thắng hiệp trước, máy sẽ tự động chọn mức cược.

3. **Oẳn Tù Tì (Kéo - Búa - Bao):**
   - Mỗi hiệp mở màn bằng một ván oẳn tù tì kịch tính để phân định bên nào được **ĐẬP TRƯỚC**.
   - Nếu hòa, oẳn tù tì lại ngay lập tức.

4. **Thanh Canh Lực (Smash Bar Strength) & Điểm Vàng 5%:**
   - Các lá bài cược được úp mặt xuống sàn đấu.
   - Thanh Smash Bar có con trỏ chạy qua chạy lại liên tục.
   - Vùng đập trúng (**Sweet Spot**) chỉ chiếm đúng **5%** chiều rộng thanh (95% còn lại là đập hụt).
   - **Tốc độ con trỏ:** Tỉ lệ thuận với số bài cược trên mâm — cược càng nhiều bài (4, 6, 8, 10 lá), con trỏ lướt càng nhanh, thử thách phản xạ càng cao!

5. **Cơ chế Đập (Smash):**
   - **Nếu ĐẬP TRÚNG (Canh đúng vùng 5%):** Đập lật bài thành công! Bài lật ngửa 3D xoay 180 độ, hiệu ứng rung màn hình và âm thanh giòn tan. Người đập ăn trọn toàn bộ số bài trong mâm.
   - **Nếu ĐẬP HỤT (Rơi vào 95% còn lại):** Bài chỉ rung nhẹ do gió đập, quyền đập lập tức **chuyển sang cho đối thủ** (Phương án A kinh điển). Hai bên thay nhau đập cho đến khi có người lật thành công!
   - **Lượt của Máy:** Máy canh nhịp ngẫu nhiên theo thời gian thực và tự bấm đập, tạo sự công bằng và hồi hộp cho người chơi.

6. **Điều kiện Thắng / Thua:**
   - **Kết thúc sớm (Knockout):** Nếu một trong hai bên hết sạch bài trước hiệp 5 -> Bên hết bài lập tức THUA CUỘC.
   - **Sau 5 hiệp:** Bên nào giữ nhiều bài hơn sẽ giành **CHIẾN THẮNG CHUNG CUỘC**.

---

## ❤️ HỆ THỐNG TIM, 3 BOSS & VÒNG QUAY MAY MẮN

### 1. Tim (Hearts)
- Mỗi người chơi có tối đa **6 ❤️**.
- Mỗi trận đấu tốn **1 ❤️** (áp dụng cho cả trận mới và "Chơi lại").
- Tim tự hồi **1 ❤️ mỗi 30 phút**, kể cả khi tắt game (tính theo thời gian thực và lưu bằng `localStorage`).
- Khi hết tim, bấm vào trận đấu sẽ hiện bảng "Hết Tim" kèm đồng hồ đếm ngược tới tim tiếp theo.
- **Nhận tim miễn phí:** Ở main menu có nút **“NHẬN 1 ❤️ MIỄN PHÍ”**. Xem xong Rewarded Ad sẽ được **+1 ❤️**, nhưng không bao giờ vượt quá 10. Khi tim đã đầy, nút tự chuyển thành “TIM ĐÃ ĐẦY” và bị vô hiệu hoá.

### 2. Ba Boss: Easy / Medium / Hard
- Chọn boss ngay trên màn hình chính trước khi vào trận.
- **Easy – Robo Tập Sự:** mốc gốc.
- **Medium – Robo Titan:** khó hơn Easy.
- **Hard – Robo Hủy Diệt:** khó hơn Medium.
- Độ khó tăng dần qua từng cấp: vùng vàng hẹp hơn, Robo canh chính xác hơn và cược thông minh hơn.
- *Ghi chú kỹ thuật cho dev:* mức tăng nội bộ là 30% mỗi cấp (Medium ×1.3, Hard ×1.69 so với Easy). Toàn bộ thông số nằm trong `BOSS_LEVELS` ở đầu file `js/game.js` để dễ cân chỉnh.

### 3. Vòng quay may mắn 9 ô (chỉ khi thắng)
- Chỉ khi **giành chiến thắng** (không áp dụng khi thua hoặc hòa), người chơi nhận **1 lượt quay**.
- Vòng quay có **9 ô**, mỗi ô trúng tim thưởng **+1 ❤️**:
  - **Easy:** 1 ô ❤️ + 8 ô trống.
  - **Medium:** 2 ô ❤️ + 7 ô trống.
  - **Hard:** 3 ô ❤️ + 6 ô trống.
- Trước khi quay, toàn bộ 9 ô đều được **úp mặt** để không lộ vị trí tim. Sau khi quay, ô trúng được lật trước, các ô còn lại lật sau để lộ kết quả.
- Kết quả quay ngẫu nhiên đều trên 9 ô; tim thưởng được cộng ngay vào hệ thống tim (tối đa 6).

---

## 🌐 ĐA NGÔN NGỮ (TIẾNG VIỆT / ENGLISH)

- Game hỗ trợ **Tiếng Việt** và **English**.
- Lần đầu mở game sẽ tự chọn theo ngôn ngữ máy:
  - Máy tiếng Anh → English
  - Các ngôn ngữ khác → Tiếng Việt (fallback)
- Người chơi có thể đổi ngôn ngữ trong **Cài đặt → Ngôn ngữ (VI / EN)**.
- Lựa chọn được lưu vào `localStorage` và áp dụng ngay, không cần reload.
- Tất cả nội dung hiển thị đều được dịch: menu, luật chơi, popup, kết quả, vòng quay, leaderboard, thông báo lỗi, tên boss...
- Tên người chơi được giữ nguyên, không dịch.

Code i18n nằm ở:

```text
js/i18n.js
```

---

## 🚀 CÁCH CHƠI THỬ NGAY TRÊN MÁY TÍNH / TRÌNH DUYỆT

### Cách 1: Mở trực tiếp
- Bạn chỉ cần **click đúp vào file `index.html`** để mở ngay trên trình duyệt Chrome, Safari hoặc Edge. Không cần cài đặt gì thêm!
- Phím tắt trên máy tính: Nhấn phím **Space (Cách)** hoặc click chuột vào nút **[💥 ĐẬP NGAY! 💥]**.

### Cách 2: Chạy Local Web Server
Mở Terminal trong thư mục dự án và chạy:
```bash
python3 -m http.server 8080
```
Sau đó truy cập: `http://localhost:8080` (hoặc mở trình duyệt trên điện thoại cùng mạng Wi-Fi và nhập `http://<IP-máy-tính>:8080`).

---

## 📱 XUẤT BẢN THÀNH ỨNG DỤNG ANDROID (APK)

### ⚠️ Quan trọng: luồng build của project này

Project này là **static web game (HTML/CSS/JS thuần) + Android Native WebView**, không phải frontend có bundler và cũng **không dùng Capacitor** cho bản Android hiện tại.

- **Không có `npm run build`** và không cần build web. Game chạy trực tiếp từ `index.html`.
- **Không chạy `npx cap sync android`** cho project này. Android project là WebView tự viết trong `android/app/src/main/java/com/flipcardhero/game/MainActivity.java`, tự load `file:///android_asset/www/index.html` và tự đăng ký cầu nối AdMob native.
- `capacitor.config.json` và các script `android:*` trong `package.json` chỉ là **phương án dự phòng/legacy**, không nằm trong luồng build hiện tại. Nếu chuyển hẳn sang Capacitor sẽ cần làm lại Android shell và có thể xung đột với phần AdMob native đang có.
- `webDir: "."` trong `capacitor.config.json` cũng không phù hợp để `cap sync` thật, vì sẽ copy cả thư mục gốc.

**Luồng đúng:**

```bash
# 1. Đồng bộ web vào Android assets
./sync_assets.sh

# 2. Build bằng Gradle
cd android
./gradlew assembleDebug       # APK debug
# hoặc
./gradlew bundleRelease       # AAB release
```

Hoặc mở thư mục `android/` bằng Android Studio rồi bấm **Run ▶️** / **Build APK(s)**.

> `./gradlew bundleRelease` tạo AAB **chưa được ký** (unsigned). Để upload lên Google Play, dùng **Build → Generate Signed Bundle / APK** trong Android Studio (chọn AAB + keystore), hoặc cấu hình `signingConfig` cho build type `release`.

`sync_assets.sh` chỉ copy các file/thư mục sau:

```text
index.html
manifest.json
css/
js/
icons/
        ↓
android/app/src/main/assets/www/
```

Trên Windows có thể dùng `sync_assets.bat` hoặc `sync_assets.ps1` thay cho `sync_assets.sh`.

#### Cấu hình theo từng máy (Windows / macOS / Linux)

Hai file sau là cấu hình **riêng của từng máy**, đã được đưa vào `.gitignore` và **không commit lên Git**:

- `android/local.properties` — đường dẫn Android SDK.
- `android/.gradle/config.properties` — đường dẫn JDK mà Android Studio dùng cho Gradle.

Mỗi máy sẽ tự tạo/sửa hai file này, nên project dùng được trên cả Windows và macOS.

**Nếu thiếu `android/local.properties`:**

```bash
# macOS / Linux
cp android/local.properties.example android/local.properties
# Windows (PowerShell)
Copy-Item android\local.properties.example android\local.properties
```

Rồi mở file vừa copy và bỏ comment dòng đúng với máy:

```properties
# macOS
sdk.dir=/Users/<username>/Library/Android/sdk

# Windows
sdk.dir=C\:\\Users\\<username>\\AppData\\Local\\Android\\Sdk

# Linux
sdk.dir=/home/<username>/Android/Sdk
```

Hoặc đơn giản là mở project bằng Android Studio, IDE sẽ tự tạo lại `local.properties`.

**Nếu gặp `Supplied javaHome is not a valid folder`:**

- Vào Android Studio → **Settings → Build, Execution, Deployment → Build Tools → Gradle → Gradle JDK**.
- Chọn **Embedded JDK (jbr)** hoặc JDK cài trên máy.
- Android Studio sẽ tự ghi lại `android/.gradle/config.properties` theo đúng máy.
- Nếu build bằng dòng lệnh, có thể set `JAVA_HOME` tạm thời:
  ```bash
  # macOS
  export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"
  # Windows (PowerShell)
  $env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"
  ```

Lưu ý: không copy `local.properties` hoặc `.gradle/config.properties` từ máy Windows sang Mac (hoặc ngược lại), vì đường dẫn sẽ sai.

### Phương án 1: Mở trực tiếp dự án Android Studio có sẵn (Khuyên dùng)
Dự án đã có sẵn thư mục mã nguồn Android Native WebView tại thư mục `android/`:
1. Mở **Android Studio**.
2. Chọn **Open** -> Trỏ đến thư mục `/Users/Amuro/Desktop/Work/Flip Card Hero/android`.
3. Đợi Android Studio đồng bộ Gradle và bấm nút **Run ▶️** (chạy trên máy ảo Android hoặc điện thoại thật cắm cáp USB).
4. Để xuất file APK cài đặt: Vào menu **Build** -> **Build Bundle(s) / APK(s)** -> **Build APK(s)**.

> **Mẹo:** Mỗi khi bạn chỉnh sửa code HTML/CSS/JS ở thư mục gốc, chỉ cần chạy lệnh sau để cập nhật ngay vào Android app:
> - Trên Windows: Click đúp vào `sync_assets.bat` hoặc chạy `.\sync_assets.ps1`
> - Trên Linux / macOS: Chạy `./sync_assets.sh`

### 📢 CẤU HÌNH QUẢNG CÁO GOOGLE ADMOB
Dự án đã tích hợp hoàn chỉnh Google Mobile Ads SDK (AdMob) trên Android và cầu nối JavaScript Bridge:
- **Banner Ad:** Hiển thị tự động ở mép dưới của tất cả màn hình game (không che lấp nút bấm).
  - Ad Unit ID: `ca-app-pub-1345063149639557/1736099863`
- **Interstitial Ad:** Hiển thị ngay khi có kết quả ván đấu (cả Thắng và Thua). Nếu quảng cáo chưa tải xong, app sẽ chờ và hiển thị ngay khi sẵn sàng.
  - Ad Unit ID: `ca-app-pub-1345063149639557/9583508131`
- **Rewarded Ad:** Kích hoạt khi người chơi bấm nút **“NHẬN 1 ❤️ MIỄN PHÍ”** ở main menu. Xem xong được cộng 1 tim (tối đa 6); đóng quảng cáo sớm sẽ không được thưởng.
  - Ad Unit ID: `ca-app-pub-1345063149639557/1159021967`
- **Publisher ID:** `pub-1345063149639557`

> Trên trình duyệt web không có AdMob native, nút Free Heart sẽ báo “Quảng cáo chỉ khả dụng trên ứng dụng Android” và không cộng tim. Trên app Android, quảng cáo được tải sẵn từ đầu và có thể xem để nhận thưởng.

> **Lưu ý về AdMob App ID:**
> Để ứng dụng hoạt động chính thức trên tài khoản AdMob của bạn:
> 1. Mở file `android/app/src/main/res/values/strings.xml`.
> 2. Thay `admob_app_id` bằng **App ID** từ AdMob Console (dạng `ca-app-pub-1345063149639557~XXXXXXXXXX`, có dấu ngã `~`).
> 3. Trong quá trình phát triển & test thử nghiệm, bạn có thể chuyển `<bool name="use_test_ads">true</bool>` để dùng ID test an toàn của Google, tránh bị AdMob khoá tài khoản vì nhấp quảng cáo thật của mình. Khi chuẩn bị phát hành lên Google Play, đổi lại thành `false`.
> 4. Bộ ID test tương ứng nằm trong `android/app/src/main/res/values/strings.xml`: Banner `admob_test_banner_id`, Interstitial `admob_test_interstitial_id`, Rewarded `admob_test_rewarded_id`.


### 🔐 ĐĂNG KÝ TÀI KHOẢN (USERNAME / PASSWORD)

- Lần đầu mở app Android (chưa có tài khoản) sẽ hiện màn hình:
  - Username
  - Password
  - Nhập lại password
- Username: **3–9 ký tự**, chỉ chữ và số, hiển thị IN HOA.
- Username được kiểm tra trùng **case-insensitive** qua collection `usernames` trên Firestore.
- Password tối thiểu **6 ký tự**, do Firebase Auth quản lý.
- Tài khoản anonymous đang dùng cho leaderboard sẽ được **link** sang tài khoản mới, giữ nguyên UID và điểm.
- Sau khi đăng ký, Firebase Auth giữ phiên đăng nhập; mở lại app sẽ vào thẳng menu.
- Có màn **Đăng nhập** bằng username/password, link qua lại giữa Signup và Login.
- Nếu xoá dữ liệu app hoặc đổi máy, người chơi có thể đăng nhập lại bằng username/password.
- **Chưa có chức năng quên mật khẩu / đổi mật khẩu** (sẽ cần email thật hoặc cơ chế reset riêng).

Để username không trùng và lưu profile, cần thêm rules `usernames` + `users` bên dưới.

### 🏆 BẢNG XẾP HẠNG FIREBASE (TÙY CHỌN)

Game có sẵn leaderboard dùng **Firebase Anonymous Auth + Cloud Firestore** (native Android, không cần backend riêng).

- Điểm = **Easy 1 + Medium 2 + Hard 3** cho mỗi trận thắng.
- Điểm và số trận thắng theo từng boss được lưu local (`localStorage`), đồng thời gửi lên Firestore.
- Tên người chơi được chuẩn hoá **IN HOA** cả trên giao diện lẫn document Firestore.
- Top 50 hiển thị trong nút **🏆 BẢNG XẾP HẠNG**. Danh sách được **cache 1 giờ**, mỗi giờ chỉ lấy dữ liệu mới một lần để tiết kiệm lượt đọc Firestore (không dùng realtime listener).
- Nếu người chơi ngoài top 50, bảng vẫn hiển thị hạng thực tế của họ (ví dụ “Hạng #52 • Ngoài top 50”).
- Bấm **LÀM MỚI** trong vòng 1 giờ sẽ hiện thời gian chờ, không phát sinh thêm lượt đọc Firestore.
- Nếu chưa cấu hình Firebase, game vẫn chạy bình thường; riêng bảng xếp hạng sẽ báo chưa khả dụng.

#### Các bước bật leaderboard

1. Tạo project tại [console.firebase.google.com](https://console.firebase.google.com/).
2. Thêm ứng dụng Android với package name:
   ```text
   com.flipcardhero.game
   ```
3. Tải file `google-services.json` và đặt vào:
   ```text
   android/app/google-services.json
   ```
4. Vào **Authentication → Sign-in method**, bật **Anonymous** và **Email/Password** (signup dùng email nội bộ sinh từ username, không gửi mail thật).
5. Vào **Firestore Database**, tạo database (khuyến nghị Production mode).
6. Dán Security Rules sau:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /leaderboard/{uid} {
      allow read: if true;

      allow create: if request.auth != null
        && request.auth.uid == uid
        && request.resource.data.name is string
        && request.resource.data.name.size() >= 1
        && request.resource.data.name.size() <= 9
        && request.resource.data.score is int
        && request.resource.data.score >= 0;

      allow update: if request.auth != null
        && request.auth.uid == uid
        && request.resource.data.name is string
        && request.resource.data.name.size() >= 1
        && request.resource.data.name.size() <= 9
        && request.resource.data.score is int
        && request.resource.data.score >= resource.data.score;
    }

    match /usernames/{usernameKey} {
      allow read: if request.auth != null;

      allow create: if request.auth != null
        && request.resource.data.uid == request.auth.uid
        && request.resource.data.username is string
        && request.resource.data.username.size() >= 3
        && request.resource.data.username.size() <= 9;

      allow update, delete: if false;
    }

    match /users/{uid} {
      allow read, write: if request.auth != null
        && request.auth.uid == uid;
    }
  }
}
```

7. Build lại app. Gradle sẽ tự áp dụng Google Services plugin khi thấy `google-services.json`.

> Rules đầy đủ cũng có trong file [`firestore.rules`](firestore.rules). Có thể deploy bằng Firebase CLI:
> ```bash
> firebase deploy --only firestore:rules
> ```

> **Nếu signup báo lỗi kết nối/network:** kiểm tra theo thứ tự:
> 1. Đã Publish rules có `usernames` + `users` chưa.
> 2. Đã bật **Email/Password** trong Authentication chưa.
> 3. Đã bật **Anonymous** chưa.
> 4. Máy có mạng không. Xem Logcat tag `FCH_Account` để biết lỗi thật.

> **Lưu ý:** điểm được gửi từ client nên chỉ phù hợp leaderboard casual. Nếu cần chống gian lận hoặc phần thưởng có giá trị, cần thêm Cloud Functions/backend để xác thực (Cloud Functions yêu cầu gói Blaze). Với lượng người chơi nhỏ, Firestore free tier (Spark) thường đủ dùng.

### Phương án 2: Cài đặt dạng PWA (Không cần build APK)
1. Đưa web lên bất kỳ hosting miễn phí nào (như Vercel, Netlify, GitHub Pages).
2. Mở link web trên trình duyệt Google Chrome trên điện thoại Android.
3. Nhấn menu 3 chấm ở góc phải Chrome -> Chọn **"Thêm vào Màn hình chính" (Add to Home Screen)** hoặc **"Cài đặt ứng dụng"**.
4. Game sẽ có icon ngoài màn hình chính, mở lên toàn màn hình (fullscreen không viền) y hệt một game Android độc lập!

### Phương án 3: Sử dụng Capacitor (tùy chọn, KHÔNG phải luồng hiện tại)
Dự án có sẵn file `capacitor.config.json` và một số script tên `android:*` trong `package.json`, nhưng **Android project hiện tại không dùng Capacitor**.

Nếu muốn chuyển hẳn sang Capacitor, bạn sẽ phải:
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init
npx cap add android
npx cap sync android
npx cap open android
```

Lưu ý:
- Cần sửa lại cấu hình `webDir` cho đúng thư mục web (không dùng `.`), nếu không `cap sync` sẽ copy cả thư mục gốc.
- Capacitor sẽ tạo Android shell mới, có thể **ghi đè/xung đột** với `MainActivity` native WebView + AdMob bridge hiện tại.
- Vì vậy với project này, khuyến nghị giữ luồng `sync_assets.sh` + Gradle như mục quan trọng phía trên.

---

## 🎨 CẤU TRÚC MÃ NGUỒN

```text
Flip Card Hero/
├── index.html              # Giao diện chính tối ưu Mobile Portrait
├── manifest.json           # Cấu hình PWA cài đặt trên Android
├── package.json            # Scripts tiện ích (không có build web)
├── capacitor.config.json   # Cấu hình Capacitor (tùy chọn, không dùng cho Android hiện tại)
├── sync_assets.sh          # Copy web vào Android assets (không build web)
├── css/
│   └── style.css           # Hiệu ứng 3D lật bài, rung màn hình, giao diện bàn chơi
├── js/
│   ├── audio.js            # Hệ thống âm thanh vỗ đập Web Audio API & Rung Haptic
│   ├── ads.js              # Bridge Banner / Interstitial / Rewarded Ad
│   ├── account.js          # Bridge signup / kiểm tra tài khoản
│   ├── i18n.js             # Đa ngôn ngữ VI/EN
│   ├── leaderboard.js      # Bridge gọi leaderboard native Android
│   └── game.js             # Logic Gameplay Core, State Machine, AI Máy
├── icons/                  # Bộ icon chuẩn HD (192x192, 512x512)
└── android/                # Android native WebView + AdMob + Firebase Leaderboard
```
# FlipCardHero
