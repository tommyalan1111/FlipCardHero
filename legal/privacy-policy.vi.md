# CHÍNH SÁCH QUYỀN RIÊNG TƯ — FLIP CARD HERO (VUA ĐẬP BÀI)

**Ngày hiệu lực:** [Ngày/Tháng/Năm]
**Cập nhật lần cuối:** [Ngày/Tháng/Năm]
**Phiên bản:** 1.0

Chính sách quyền riêng tư này ("Chính sách") giải thích cách **[Tên nhà phát triển / Cá nhân]** ("chúng tôi", "của chúng tôi") thu thập, sử dụng, chia sẻ và bảo vệ thông tin khi bạn tải, cài đặt và chơi trò chơi **Flip Card Hero** (tên tiếng Việt: **Vua Đập Bài**) — sau đây gọi là "Ứng dụng" — trên thiết bị Android, cũng như khi bạn truy cập phiên bản web/PWA của Ứng dụng.

Ứng dụng được phát hành trên **Google Play** với mã ứng dụng `com.flipcardhero.game`.

Bằng việc cài đặt và sử dụng Ứng dụng, bạn xác nhận rằng bạn đã đọc và hiểu Chính sách này.

---

## 1. TÓM TẮT NGẮN GỌN

- Ứng dụng là **game giải trí một người chơi, chơi ngoại tuyến (offline)**. Không có tài khoản, không có đăng nhập, không có máy chủ trò chơi của chúng tôi.
- Chúng tôi **không** thu thập tên thật, email, số điện thoại, danh bạ, ảnh, vị trí GPS, tin nhắn hay bất kỳ dữ liệu cá nhân nhạy cảm nào của bạn.
- Biệt danh bạn nhập trong game được **lưu ngay trên thiết bị của bạn** và không bao giờ được gửi lên máy chủ của chúng tôi.
- Ứng dụng hiển thị quảng cáo thông qua **Google AdMob**. Thông qua SDK quảng cáo này, Google và các đối tác quảng cáo của Google có thể thu thập một số dữ liệu kỹ thuật và định danh thiết bị để phân phối và đo lường quảng cáo. Chi tiết tại Mục 4.

---

## 2. THÔNG TIN CHÚNG TÔI THU THẬP

### 2.1. Thông tin bạn tự nhập (chỉ lưu trên thiết bị)

Ứng dụng cho phép bạn nhập một **biệt danh/tên hiển thị** (mặc định là "LEO") để hiển thị trong trận đấu.

- Biệt danh này được lưu trong bộ nhớ cục bộ của Ứng dụng (`localStorage` của WebView) trên chính thiết bị của bạn.
- Biệt danh **không được truyền lên máy chủ nào của chúng tôi**, không được dùng để nhận dạng bạn ngoài phạm vi trò chơi và không được chia sẻ với bên thứ ba.
- Bạn có thể thay đổi hoặc xoá biệt danh bất cứ lúc nào trong phần cài đặt của game, hoặc xoá toàn bộ dữ liệu cục bộ bằng cách vào **Cài đặt Android → Ứng dụng → Flip Card Hero → Bộ nhớ → Xoá dữ liệu**, hoặc gỡ cài đặt Ứng dụng.

### 2.2. Thông tin được thu thập tự động bởi SDK quảng cáo (Google AdMob)

Ứng dụng tích hợp **Google Mobile Ads SDK (AdMob)** để hiển thị quảng cáo dạng banner và quảng cáo toàn màn hình (interstitial). SDK này có thể tự động thu thập và xử lý các loại dữ liệu sau:

| Loại dữ liệu | Ví dụ | Mục đích |
|---|---|---|
| Định danh thiết bị/quảng cáo | Android Advertising ID (AAID), App Set ID | Phân phối quảng cáo, chống gian lận, tần suất hiển thị, đo lường |
| Địa chỉ IP | IP dùng để kết nối tới máy chủ quảng cáo | Phân phối quảng cáo, ước lượng vị trí gần đúng theo khu vực (không phải GPS) |
| Thông tin thiết bị & hệ điều hành | Model thiết bị, phiên bản Android, ngôn ngữ, kích thước màn hình, múi giờ, nhà mạng | Phân phối quảng cáo phù hợp thiết bị |
| Tương tác với quảng cáo | Số lần hiển thị, lượt nhấp, thời gian xem | Đo lường hiệu quả quảng cáo, tính doanh thu |
| Thông tin chẩn đoán & hiệu năng | Nhật ký lỗi, thời gian khởi động, hiệu năng SDK | Khắc phục lỗi, cải thiện độ ổn định |

Các dữ liệu này được xử lý bởi **Google LLC** và/hoặc các đối tác quảng cáo của Google với tư cách là các bên kiểm soát dữ liệu độc lập. Chúng tôi không có quyền truy cập vào dữ liệu thô đó và không lưu trữ chúng trên hệ thống của mình.

### 2.3. Quyền truy cập trên thiết bị

Ứng dụng yêu cầu các quyền sau, chỉ nhằm mục đích vận hành tính năng game và quảng cáo:

- `android.permission.INTERNET` — tải quảng cáo.
- `android.permission.ACCESS_NETWORK_STATE` — kiểm tra trạng thái kết nối mạng để tải quảng cáo hợp lý.
- `android.permission.VIBRATE` — rung phản hồi khi bạn đập bài (tính năng game).

Ứng dụng **không** yêu cầu quyền truy cập vị trí, danh bạ, camera, micro, ảnh, tin nhắn, hay quyền truy cập tệp cá nhân.

### 2.4. Những gì chúng tôi KHÔNG thu thập

Chúng tôi không thu thập: họ tên, địa chỉ email, số điện thoại, địa chỉ nhà, vị trí GPS chính xác, danh bạ, lịch, ảnh, tệp âm thanh, tin nhắn, mật khẩu, thông tin thanh toán (Ứng dụng không có giao dịch mua trong ứng dụng), dữ liệu sức khoẻ, dữ liệu sinh trắc học, hay nội dung do người dùng tạo và chia sẻ công khai.

Chúng tôi cũng **không** sử dụng bất kỳ dịch vụ phân tích hành vi (analytics), crash reporting, hay theo dõi nào khác ngoài SDK quảng cáo nêu tại Mục 2.2.

---

## 3. MỤC ĐÍCH SỬ DỤNG THÔNG TIN

Chúng tôi (và SDK quảng cáo) sử dụng thông tin nêu trên cho các mục đích:

1. Cung cấp và vận hành trò chơi, ghi nhớ biệt danh và tiến trình cục bộ của bạn.
2. Hiển thị quảng cáo tài trợ cho toàn bộ người dùng (Ứng dụng được cung cấp miễn phí và duy trì bằng doanh thu quảng cáo).
3. Đo lường hiệu quả quảng cáo và ngăn chặn gian lận quảng cáo.
4. Đảm bảo Ứng dụng hoạt động ổn định, khắc phục lỗi kỹ thuật.
5. Tuân thủ các nghĩa vụ pháp lý hiện hành.

Chúng tôi **không bán** thông tin cá nhân của bạn và **không** sử dụng thông tin của bạn cho mục đích tiếp thị trực tiếp ngoài phạm vi quảng cáo trong Ứng dụng.

---

## 4. CHIA SẺ THÔNG TIN VỚI BÊN THỨ BA

### 4.1. Google AdMob / Google Mobile Ads SDK

Nhà cung cấp quảng cáo duy nhất của Ứng dụng là **Google AdMob**, một dịch vụ của Google LLC (1600 Amphitheatre Parkway, Mountain View, CA 94043, Hoa Kỳ).

- Chính sách quyền riêng tư của Google: https://policies.google.com/privacy
- Cách Google sử dụng dữ liệu từ các ứng dụng/sản phẩm đối tác: https://policies.google.com/technologies/partner-sites
- Thông tin về quảng cáo cá nhân hoá và cách tắt: https://adssettings.google.com

Tuỳ khu vực và cài đặt thiết bị của bạn, quảng cáo có thể là **quảng cáo được cá nhân hoá** (dựa trên Advertising ID và lịch sử) hoặc **quảng cáo không cá nhân hoá** (chỉ dựa trên ngữ cảnh và vị trí gần đúng). Bạn có thể kiểm soát điều này như mô tả tại Mục 7.

### 4.2. Các trường hợp khác

Chúng tôi chỉ tiết lộ thông tin nếu:

- Được bạn đồng ý rõ ràng;
- Có nghĩa vụ pháp lý, quyết định của cơ quan có thẩm quyền hoặc yêu cầu hợp pháp từ cơ quan nhà nước;
- Cần bảo vệ quyền, tài sản hoặc an toàn của chúng tôi, người dùng hoặc công chúng;
- Trong khuôn khổ chuyển giao toàn bộ hoặc một phần hoạt động kinh doanh (khi đó thông báo sẽ được gửi tới người dùng và Chính sách này sẽ được cập nhật).

### 4.3. Chuyển dữ liệu ra nước ngoài

Do máy chủ của Google đặt tại nhiều quốc gia, dữ liệu quảng cáo nêu tại Mục 2.2 có thể được xử lý ngoài Việt Nam, bao gồm tại Hoa Kỳ và Liên minh Châu Âu. Google áp dụng các biện pháp bảo vệ theo quy định của họ (ví dụ: Điều khoản hợp đồng tiêu chuẩn của EU).

---

## 5. LƯU TRỮ VÀ BẢO MẬT

- **Biệt danh trong game:** lưu trên thiết bị cho đến khi bạn xoá dữ liệu ứng dụng hoặc gỡ cài đặt. Chúng tôi không có bản sao trên máy chủ.
- **Dữ liệu quảng cáo:** do Google nắm giữ và xoá theo chính sách lưu trữ của Google. Chúng tôi không kiểm soát thời hạn này.
- **Bảo mật:** Chúng tôi không vận hành máy chủ lưu dữ liệu người dùng. Việc truyền dữ liệu quảng cáo được thực hiện qua kết nối được mã hoá (HTTPS/TLS) do SDK của Google thực hiện. Tuy nhiên, không có phương thức truyền tải hoặc lưu trữ điện tử nào an toàn tuyệt đối.

> **Lưu ý:** Ứng dụng bật tính năng sao lưu tự động của Android (`allowBackup`). Nếu bạn bật sao lưu trên thiết bị, dữ liệu cục bộ (bao gồm biệt danh) có thể được sao lưu vào tài khoản Google của bạn. Việc này do hệ điều hành Android và Google thực hiện, không phải chúng tôi. Bạn có thể tắt trong **Cài đặt → Hệ thống → Sao lưu**.

---

## 6. QUYỀN CỦA BẠN

### 6.1. Quyền chung

Bạn có thể:

- **Truy cập và sửa** biệt danh của mình ngay trong game (phần cài đặt tên người chơi).
- **Xoá** dữ liệu cục bộ bằng cách xoá dữ liệu ứng dụng hoặc gỡ cài đặt.
- **Từ chối nhận quảng cáo cá nhân hoá** (xem Mục 7).
- **Liên hệ** với chúng tôi để hỏi về dữ liệu (Mục 11).

Do chúng tôi không lưu dữ liệu cá nhân trên máy chủ, các yêu cầu truy cập/xoá dữ liệu từ phía chúng tôi thường không có dữ liệu để thực hiện; bạn có thể thực hiện trực tiếp trên thiết bị.

### 6.2. Nếu bạn ở Khu vực Kinh tế Châu Âu (EEA), Vương quốc Anh hoặc Thuỵ Sĩ (GDPR)

Bạn có quyền: truy cập, chỉnh sửa, xoá, hạn chế xử lý, phản đối xử lý, rút lại sự đồng ý và quyền khiếu nại tới cơ quan bảo vệ dữ liệu tại quốc gia của bạn. Cơ sở pháp lý cho việc xử lý: (i) sự đồng ý của bạn đối với quảng cáo cá nhân hoá; (ii) lợi ích hợp pháp của chúng tôi trong việc vận hành game miễn phí có quảng cáo.

Bạn có thể rút lại sự đồng ý bất cứ lúc nào thông qua màn hình tuỳ chọn quyền riêng tư/quảng cáo (nếu được hiển thị trong Ứng dụng) hoặc qua cài đặt quảng cáo của Google.

### 6.3. Nếu bạn ở California hoặc các bang khác của Hoa Kỳ (CCPA/CPRA)

Bạn có quyền biết, xoá, sửa và từ chối việc "bán/chia sẻ" thông tin cá nhân. Chúng tôi không bán thông tin cá nhân. Bạn có thể từ chối việc chia sẻ cho quảng cáo cá nhân hoá bằng cách tắt tuỳ chọn "Quảng cáo được cá nhân hoá" trong cài đặt Google Ads hoặc chọn "Xoá/Đặt lại Advertising ID" trên Android.

### 6.4. Nếu bạn ở Việt Nam (Nghị định 13/2023/NĐ-CP)

Bạn có các quyền được quy định tại Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân, bao gồm quyền được biết, đồng ý, truy cập, rút lại sự đồng ý, xoá dữ liệu, hạn chế xử lý, phản đối xử lý, khiếu nại và khởi kiện. Để thực hiện các quyền này, vui lòng liên hệ theo Mục 11.

---

## 7. QUẢNG CÁO VÀ LỰA CHỌN CỦA BẠN

Ứng dụng hiển thị **quảng cáo banner** ở mép dưới màn hình và **quảng cáo toàn màn hình (interstitial)** sau khi kết thúc một ván đấu.

Bạn có thể kiểm soát quảng cáo cá nhân hoá bằng các cách sau:

1. **Trên Android:** Cài đặt → Google → Quản lý tài khoản Google → Quyền riêng tư & cá nhân hoá → **Quảng cáo** → bật/tắt "Cá nhân hoá quảng cáo", hoặc đặt lại/xoá Advertising ID.
2. **Trình duyệt (phiên bản web/PWA):** Cài đặt quảng cáo của Google tại https://adssettings.google.com.
3. **Công cụ của Google:** https://myadcenter.google.com để tùy chỉnh quảng cáo bạn thấy.

Việc tắt quảng cáo cá nhân hoá **không** loại bỏ hoàn toàn quảng cáo; bạn vẫn có thể thấy quảng cáo không cá nhân hoá.

---

## 8. TRẺ EM

Ứng dụng là trò chơi giải trí nhẹ nhàng phù hợp với nhiều độ tuổi, **không được thiết kế riêng cho trẻ em dưới 13 tuổi** (hoặc độ tuổi tối thiểu theo luật địa phương) và chúng tôi không cố ý thu thập dữ liệu cá nhân của trẻ em.

Nếu bạn là cha mẹ/người giám hộ và cho rằng con bạn đã cung cấp thông tin cá nhân cho chúng tôi, vui lòng liên hệ qua Mục 11; chúng tôi sẽ xoá thông tin đó nếu có.

Nếu bạn ở Hoa Kỳ và Ứng dụng hướng tới trẻ em dưới 13 tuổi theo định nghĩa của COPPA, hoặc nếu bạn ở EU và áp dụng GDPR-K, vui lòng xem "Lưu ý dành cho nhà phát triển" trong tài liệu hướng dẫn kèm theo để biết các bước cấu hình AdMob tương ứng (đánh dấu "nội dung dành cho trẻ em", tắt quảng cáo cá nhân hoá và chọn nhà cung cấp quảng cáo phù hợp).

---

## 9. LIÊN KẾT TỚI BÊN THỨ BA

Ứng dụng có thể chứa quảng cáo dẫn tới trang web hoặc ứng dụng của bên thứ ba. Chúng tôi không kiểm soát và không chịu trách nhiệm về nội dung, chính sách quyền riêng tư hay hoạt động của các bên thứ ba đó. Vui lòng đọc chính sách của họ trước khi cung cấp thông tin.

---

## 10. THAY ĐỔI CHÍNH SÁCH NÀY

Chúng tôi có thể cập nhật Chính sách này theo thời gian, ví dụ khi bổ sung tính năng, thay đổi nhà cung cấp quảng cáo hoặc do yêu cầu pháp lý.

- Khi có thay đổi quan trọng, chúng tôi sẽ cập nhật "Ngày hiệu lực"/"Cập nhật lần cuối" ở đầu tài liệu và (nếu cần) thông báo trong Ứng dụng hoặc trên trang Google Play.
- Việc bạn tiếp tục sử dụng Ứng dụng sau ngày hiệu lực mới đồng nghĩa bạn chấp nhận Chính sách đã cập nhật.

---

## 11. LIÊN HỆ

Mọi câu hỏi, yêu cầu hoặc khiếu nại liên quan đến Chính sách quyền riêng tư này, vui lòng liên hệ:

- **Nhà phát triển:** [Tên nhà phát triển / Công ty]
- **Email:** [email@example.com]
- **Địa chỉ:** [Địa chỉ liên hệ, Quốc gia]
- **Thời gian phản hồi dự kiến:** trong vòng 30 ngày làm việc.

Chúng tôi sẽ cố gắng giải quyết mọi khiếu nại một cách thiện chí. Nếu bạn không hài lòng với phản hồi, bạn có quyền khiếu nại tới cơ quan quản lý bảo vệ dữ liệu cá nhân có thẩm quyền tại quốc gia của bạn.

---

*Tài liệu này được soạn cho Ứng dụng Flip Card Hero và không cấu thành tư vấn pháp lý. Vui lòng tham khảo ý kiến luật sư nếu bạn có tình huống đặc thù (ví dụ: bán hàng trong ứng dụng, thu thập dữ liệu trẻ em, hoạt động tại nhiều quốc gia).*
