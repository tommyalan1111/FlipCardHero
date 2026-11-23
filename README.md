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

Dự án đã được tích hợp sẵn 3 phương án để đưa lên điện thoại Android:

### Phương án 1: Mở trực tiếp dự án Android Studio có sẵn (Khuyên dùng)
Dự án đã có sẵn thư mục mã nguồn Android Native WebView tại thư mục `android/`:
1. Mở **Android Studio**.
2. Chọn **Open** -> Trỏ đến thư mục `/Users/Amuro/Desktop/Work/Flip Card Hero/android`.
3. Đợi Android Studio đồng bộ Gradle và bấm nút **Run ▶️** (chạy trên máy ảo Android hoặc điện thoại thật cắm cáp USB).
4. Để xuất file APK cài đặt: Vào menu **Build** -> **Build Bundle(s) / APK(s)** -> **Build APK(s)**.

> **Mẹo:** Mỗi khi bạn chỉnh sửa code HTML/CSS/JS ở thư mục gốc, chỉ cần chạy lệnh sau để cập nhật ngay vào Android app:
> ```bash
> ./sync_assets.sh
> ```

### Phương án 2: Cài đặt dạng PWA (Không cần build APK)
1. Đưa web lên bất kỳ hosting miễn phí nào (như Vercel, Netlify, GitHub Pages).
2. Mở link web trên trình duyệt Google Chrome trên điện thoại Android.
3. Nhấn menu 3 chấm ở góc phải Chrome -> Chọn **"Thêm vào Màn hình chính" (Add to Home Screen)** hoặc **"Cài đặt ứng dụng"**.
4. Game sẽ có icon ngoài màn hình chính, mở lên toàn màn hình (fullscreen không viền) y hệt một game Android độc lập!

### Phương án 3: Sử dụng Capacitor
Dự án đã có file `capacitor.config.json` và `package.json`. Bạn có thể dùng Capacitor:
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap add android
npx cap sync
npx cap open android
```

---

## 🎨 CẤU TRÚC MÃ NGUỒN

```text
Flip Card Hero/
├── index.html              # Giao diện chính tối ưu Mobile Portrait
├── manifest.json           # Cấu hình PWA cài đặt trên Android
├── package.json            # Scripts quản lý
├── capacitor.config.json   # Cấu hình đóng gói Capacitor
├── sync_assets.sh          # Script đồng bộ web vào Android app
├── css/
│   └── style.css           # Hiệu ứng 3D lật bài, rung màn hình, giao diện bàn chơi
├── js/
│   ├── audio.js            # Hệ thống âm thanh vỗ đập Web Audio API & Rung Haptic
│   └── game.js             # Logic Gameplay Core, State Machine, AI Máy
├── icons/                  # Bộ icon chuẩn HD (192x192, 512x512)
└── android/                # Dự án Android Studio hoàn chỉnh sẵn sàng build APK
```
# FlipCardHero
