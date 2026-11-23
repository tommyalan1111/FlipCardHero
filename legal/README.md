# Hướng dẫn dùng bộ tài liệu pháp lý — Flip Card Hero

Thư mục này chứa 4 tài liệu đã soạn sẵn, dựa trên **đúng** cách game đang được triển khai (kiểm tra ngày [23/11/2026]):

| File | Nội dung |
|---|---|
| `privacy-policy.vi.md` | Chính sách quyền riêng tư (tiếng Việt) |
| `privacy-policy.en.md` | Privacy Policy (English) |
| `terms-and-conditions.vi.md` | Điều khoản & Điều kiện sử dụng (tiếng Việt) |
| `terms-and-conditions.en.md` | Terms & Conditions (English) |

Cơ sở thực tế đã đối chiếu trong code:

- Game HTML5 chạy trong WebView, **không có backend**, không có tài khoản/đăng nhập.
- `js/game.js` chỉ dùng `localStorage` để lưu biệt danh → dữ liệu nằm trên máy.
- Quảng cáo: **Google AdMob** (banner `ca-app-pub-.../1736099863`, interstitial `ca-app-pub-.../9583508131`), khởi tạo trong `MainActivity.java`.
- Quyền: `INTERNET`, `ACCESS_NETWORK_STATE`, `VIBRATE` (`AndroidManifest.xml`).
- `android:allowBackup="true"` → đã ghi chú trong policy.
- Không có analytics, không có Firebase, không có IAP, không có chat/nội dung người dùng.

> ⚠️ Đây là tài liệu mẫu, **không phải tư vấn pháp lý**. Nếu sau này thêm IAP, leaderboard online, tài khoản, push notification hay analytics thì phải cập nhật lại cả 4 file.

---

## 1. Việc cần làm trước khi publish (bắt buộc)

### 1.1. Điền placeholder

Tìm và thay các placeholder sau trong **cả 4 file**:

| Placeholder | Thay bằng |
|---|---|
| `[Tên nhà phát triển / Công ty]` / `[Developer Name / Company]` | Tên cá nhân hoặc tên công ty đứng tên trên Play Console |
| `[email@example.com]` | Email hỗ trợ thật (nên dùng email riêng cho app, ví dụ `support@...`) |
| `[Địa chỉ liên hệ, Quốc gia]` / `[Contact address, Country]` | Địa chỉ + quốc gia (có thể ghi "Việt Nam" nếu không muốn công khai địa chỉ nhà) |
| `[Ngày/Tháng/Năm]`, `[DD Month YYYY]` | Ngày hiệu lực và ngày cập nhật (dùng cùng một ngày cho cả 4 file) |
| `[Tỉnh/Thành phố]`, `[Province/City]` | Nơi có toà án có thẩm quyền (thường là nơi bạn đăng ký hộ khẩu/trụ sở) |
| `[Vietnam]` | Giữ nguyên nếu bạn muốn áp dụng luật Việt Nam |

Gợi ý: dùng Find & Replace của VS Code cho nhanh (`Ctrl+H`), thay trên toàn thư mục `legal/`.

### 1.2. Chọn quốc gia áp dụng luật

Mặc định tài liệu đang chọn **luật Việt Nam**. Nếu bạn đăng ký phát hành với tư cách cá nhân/công ty ở nước khác, sửa Mục 13 trong Terms cho phù hợp.

### 1.3. Quyết định "độ tuổi mục tiêu" — quan trọng nhất

Play Console bắt bạn chọn **Target audience**. Lựa chọn này quyết định:

- **Nếu chọn có trẻ em dưới 13 tuổi** (hoặc "tất cả độ tuổi" theo nghĩa bao gồm trẻ em):
  - Phải tuân thủ **Families Policy** của Google.
  - Phải khai trong AdMob: bật **"Tag for child-directed treatment"** (COPPA) và/hoặc **"Tag for users under the age of consent in Europe"** (GDPR-K) → **không được chạy quảng cáo cá nhân hoá**.
  - Phải chọn nhà cung cấp quảng cáo trong danh sách được phép cho trẻ em (AdMob có bộ lọc "Families self-certified" ad networks).
  - Nội dung game (đập bài, không bạo lực, không máu me) về bản chất **có thể** phù hợp trẻ em, nhưng UI/nhạc/hiệu ứng cần rà lại.
- **Nếu chọn chỉ 13+** (khuyến nghị cho bản phát hành đầu):
  - Đơn giản hơn về mặt tuân thủ, giữ nguyên 4 tài liệu hiện tại (đang ghi mức 13+).
  - Trong Play Console chọn target audience **13-15, 16-17, 18+** (không tick nhóm dưới 13).

### 1.4. Bổ sung consent cho người dùng EEA/UK (nếu muốn chạy quảng cáo tối ưu ở châu Âu)

Hiện code **chưa có** consent management platform (CMP). Nếu phát hành toàn cầu:

- Google yêu cầu dùng **Google User Messaging Platform (UMP) SDK** hoặc CMP được Google chứng nhận để lấy consent trước khi serve quảng cáo cá nhân hoá cho người dùng EEA/UK.
- Nếu không có consent, AdMob sẽ chỉ serve quảng cáo giới hạn (doanh thu giảm mạnh) và có thể bị cảnh báo chính sách.
- Đây là thay đổi **code** — bạn nói chưa cần đụng code nên mình chưa làm; chỉ ghi nhận ở đây để xử lý trước khi publish bản quốc tế.

Nếu chỉ phát hành cho Việt Nam, có thể tạm bỏ qua bước này, nhưng nên chuẩn bị vì Play Console thường hỏi.

---

## 2. Host privacy policy lên URL công khai

Google Play **bắt buộc** có privacy policy URL:

- Phải là **trang HTML công khai**, **không** yêu cầu đăng nhập, **không** phải file PDF/Google Doc (Play không chấp nhận link tải file).
- Nên dùng **HTTPS**.
- URL phải **ổn định** (không đổi sau khi publish), vì Play cache link này.

Cách nhanh nhất — **GitHub Pages** (miễn phí):

1. Tạo repo public, ví dụ `flipcardhero-legal`.
2. Convert `privacy-policy.vi.md` → HTML. Có thể dùng `pandoc`, hoặc GitHub hiển thị markdown trực tiếp nhưng **link dạng `/blob/` sẽ không đẹp**; nên build HTML.
3. Bật Pages: Settings → Pages → Branch `main` → `/root`.
4. URL dạng: `https://<username>.github.io/flipcardhero-legal/privacy-policy.vi.html`.
5. Đặt link tới Terms ở cuối trang policy và ngược lại.

Các lựa chọn khác: **Google Sites** (dán nội dung, publish public — nhanh, không cần code), **Netlify/Vercel** (kéo thả file HTML), **Firebase Hosting**.

> Mẹo: nên giữ **một URL duy nhất** cho policy (ví dụ `/privacy`) và làm trang đó song ngữ hoặc có nút chuyển VI/EN, thay vì 2 link riêng trong Play Console. Play Console chỉ nhận **1 URL**.

### Gợi ý cấu trúc trang host

```
/index.html          → trang landing nhỏ, 2 nút: Privacy Policy | Terms
/privacy.html        → VI + EN (hoặc 2 tab)
/terms.html
```

---

## 3. Khai báo trong Play Console

### 3.1. Store listing → Privacy policy

Dán URL ở mục **"Chính sách quyền riêng tư"** (App content → Privacy policy).

### 3.2. App content → Data safety (khai báo dữ liệu)

Đây là form **bắt buộc**, hay bị reject nhất. Với game hiện tại, khai như sau:

| Câu hỏi | Trả lời |
|---|---|
| Does your app collect or share any of the required user data types? | **Yes** (vì AdMob thu thập) |
| Data type: **Approximate location** | Collected, **not** shared? → Thực tế AdMob chia sẻ với ad partners ⇒ chọn **Collected + Shared**, mục đích: **Advertising or marketing** |
| Data type: **Device or other IDs** (Advertising ID) | **Collected + Shared**, mục đích: **Advertising or marketing**, **Fraud prevention / security** |
| Data type: **App activity → Other actions** (ad interactions) | Collected + Shared, mục đích: Advertising or marketing |
| Data type: **App info and performance → Crash logs / Diagnostics** | Collected, mục đích: **Analytics** (nếu AdMob diagnostics bật) — nếu không chắc, khai theo mô tả của Google Mobile Ads SDK |
| Personal info (name, email...)? | **No** — biệt danh chỉ lưu trên máy, không gửi đi đâu |
| Financial info, Health, Messages, Photos, Contacts, Calendar, Files, Web browsing | **No** |
| Is all data encrypted in transit? | **Yes** (HTTPS/TLS) |
| Do you provide a way for users to request data deletion? | **No** — vì không có tài khoản/server-side data; ghi rõ "Users can delete all local data by clearing app data or uninstalling" |
| Is data collection optional? | **No** (quảng cáo là mặc định) |

Sau khi khai, đối chiếu lại: form Data safety **phải khớp** với Privacy Policy. Nếu policy nói "không thu thập gì" mà form khai có Advertising ID → dễ bị reject.

### 3.3. App content → Ads

Chọn **"Yes, my app contains ads"** (có AdMob).

### 3.4. App content → Content rating (IARC)

Khai theo nội dung thực tế: game đập bài, không máu me, không ngôn từ xấu. Có quảng cáo → khai "Contains ads". Không có tương tác người dùng, không chia sẻ vị trí, không mua hàng trong app.

### 3.5. App content → Target audience

Xem mục 1.3 ở trên. Nếu chọn 13+, phải trả lời thêm câu "Is your app designed for children?" → **No**.

### 3.6. App content → News app / COVID / Financial features

Tất cả **No**.

### 3.7. App content → Data deletion

Vì không có tài khoản, chọn **No** ở mục "Does your app allow users to create an account?" → không cần khai data deletion request URL.

---

## 4. Chỗ nên gắn link trong app (khuyến nghị, chưa cần làm ngay)

Google Play khuyến khích (và nhiều thị trường yêu cầu) link tới policy **ngay trong app**. Với game này có thể thêm:

- Một nút nhỏ "⚙️ / ℹ️" ở màn hình chính → mở popup có 2 link: *Chính sách quyền riêng tư* và *Điều khoản sử dụng*.
- Link mở bằng `window.open(url, '_blank')` hoặc WebView `shouldOverrideUrlLoading` để mở trình duyệt ngoài.
- Nếu chưa muốn sửa code, có thể tạm để ở phần mô tả app trên Play (không bắt buộc nhưng nên có).

Đây là thay đổi UI nhỏ, không ảnh hưởng logic game — bạn quyết định khi nào làm.

---

## 5. Checklist trước khi bấm "Publish"

- [ ] Đã thay hết placeholder trong 4 file (grep `[` để kiểm tra).
- [ ] Đã host policy + terms, mở thử bằng **tab ẩn danh** (không login) → truy cập được.
- [ ] URL policy đã dán vào Play Console.
- [ ] Data safety form khớp với Privacy Policy.
- [ ] Đã khai "App contains ads".
- [ ] Target audience đã chọn đúng (13+ hoặc có trẻ em → đã cấu hình Families).
- [ ] AdMob: `use_test_ads` = `false` khi build release (nhớ đổi lại, tránh bị khoá tài khoản AdMob).
- [ ] AdMob App ID thật đã điền vào `strings.xml`.
- [ ] Đã kiểm tra app không crash khi mất mạng (quảng cáo fail → game vẫn chạy).
- [ ] Nếu phát hành EEA/UK: đã tích hợp UMP consent (mục 1.4).
- [ ] Đã lưu bản backup 4 file này kèm ngày hiệu lực để đối chiếu sau này (Play lưu lịch sử policy bạn từng công bố).

---

## 6. Khi nào phải cập nhật lại tài liệu

| Thay đổi | Cần cập nhật |
|---|---|
| Thêm IAP / remove ads | Terms (Mục 5), Privacy (thêm payment data) |
| Thêm tài khoản, leaderboard online, cloud save | Privacy (personal info, retention, deletion), Terms |
| Thêm Firebase Analytics / Crashlytics | Privacy (Mục 2.2), Data safety |
| Thêm push notification | Privacy (device ID), Terms |
| Đổi nhà cung cấp quảng cáo | Privacy (Mục 4.1), Data safety |
| Thêm mạng xã hội/chia sẻ điểm | Privacy (user content), Terms (conduct) |
| Đổi tên nhà phát triển / email | Cả 4 file |

Mỗi lần cập nhật: tăng `Phiên bản` (1.0 → 1.1), đổi "Cập nhật lần cuối", và **giữ lại bản cũ** trong git để chứng minh lịch sử.
