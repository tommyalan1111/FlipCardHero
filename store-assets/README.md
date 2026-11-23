# Bộ asset Google Play — Flip Card Hero

Tất cả ảnh được render từ **chính game đang chạy** (không phải mockup vẽ lại): game HTML5 được load ở `localhost:8099`, đặt viewport 432×768 CSS với device scale 2.5 → ảnh ra đúng **1080×1920**.

## Danh sách file

| File | Kích thước | Dùng để upload ở đâu |
|---|---|---|
| `icon-512.png` | 512×512, PNG 24-bit, không alpha | Play Console → **Store listing → App icon** |
| `feature-graphic-1024x500.png` | 1024×500, PNG 24-bit | Play Console → **Store listing → Feature graphic** |
| `screenshots/phone-01-menu.png` | 1080×1920 | Store listing → **Phone screenshots** |
| `screenshots/phone-02-rps.png` | 1080×1920 | Phone screenshots |
| `screenshots/phone-03-stake.png` | 1080×1920 | Phone screenshots |
| `screenshots/phone-04-arena.png` | 1080×1920 | Phone screenshots |
| `screenshots/phone-05-hit.png` | 1080×1920 | Phone screenshots |
| `screenshots/phone-06-win.png` | 1080×1920 | Phone screenshots |
| `preview/overview.png` | ảnh tổng hợp | Chỉ để xem nhanh, **không upload** |
| `flip-card-hero-play-assets.zip` | zip | Gói gọn 8 file trên để lưu trữ |

Play yêu cầu **2–8 ảnh phone screenshot**, mỗi ảnh 16:9 hoặc 9:16, cạnh từ 320 đến 3840 px → bộ 1080×1920 này hợp lệ.

## Upload theo thứ tự này (thứ tự ảnh = thứ tự hiển thị trên store)

1. `phone-01-menu` — mặt tiền thương hiệu
2. `phone-02-rps` — oẳn tù tì mở màn
3. `phone-03-stake` — chọn mức cược
4. `phone-04-arena` — sàn đấu + thanh lực (cơ chế chính)
5. `phone-05-hit` — khoảnh khắc lật bài thành công
6. `phone-06-win` — màn hình chiến thắng

Bộ ảnh kể đúng một ván đấu từ đầu đến cuối. Ảnh 1–2 là quan trọng nhất vì hiện ngay khi người dùng mở store. Nếu muốn nhấn cảm xúc, có thể đưa `phone-06-win` (confetti + cúp) lên vị trí 2.

## Lưu ý khi upload

- Play **không nhận** ảnh có alpha cho icon; file hiện tại đã là RGB 24-bit, không kênh trong suốt.
- Icon 512×512 phải là **hình vuông đầy đủ**, không tự bo góc, không có viền trắng — Play tự bo góc khi hiển thị.
- Feature graphic sẽ bị **cắt** ở một số vị trí (banner, tablet). Chữ và logo đang nằm trong vùng an toàn ~60 px tính từ mép, nên không bị mất.
- Không thêm rating sao, badge "Editor's Choice", hay số lượt tải giả vào ảnh — Play coi đó là misleading.
- Ảnh chụp có chứa **quảng cáo** cũng được, nhưng bộ này chụp bản web nên không có banner AdMob, trông sạch hơn.
- Nếu sau này đổi UI, phải chụp lại: ảnh store phải khớp với app thực tế, nếu không có thể bị reject.

## Cách render lại

```powershell
# 1. Serve game (port 8099)
python -m http.server 8099 --bind 127.0.0.1

# 2. Render (cần Chrome chạy ngoài sandbox vì nó cần tạo kênh tiến trình)
node store-assets/capture.mjs all       # cả ảnh game + icon + feature + adaptive
node store-assets/capture.mjs game      # chỉ 6 screenshot
node store-assets/capture.mjs static    # chỉ icon + feature
node store-assets/capture.mjs adaptive  # chỉ 2 lớp adaptive icon

# 3. Sinh mipmap Android + icon PWA từ asset đã render
python store-assets/build_icons.py
```

Cấu trúc:

- `capture.mjs` — điều khiển Chrome qua DevTools Protocol (không cần npm install). Các "kịch bản" trạng thái game nằm trong mảng `GAME_SHOTS`; sửa text/trạng thái ở đó.
- `src/icon.html` — thiết kế icon 512×512 (2 lá bài + burst + vignette) cho store và legacy launcher.
- `src/adaptive-foreground.html` — lớp trước của adaptive icon (nền trong suốt, art thu 70% để nằm trong vùng an toàn).
- `src/adaptive-background.html` — lớp nền full-bleed (gradient xanh + tia sáng).
- `src/feature.html` — thiết kế feature graphic, nhúng `screenshots/phone-06-win.png` vào khung điện thoại.
- `build_icons.py` — sinh `mipmap-*/ic_launcher.png` (48–192), `ic_launcher_foreground/background.png` (108–432), icon PWA `icons/icon-*` và `icons/icon-maskable-*`.
- `check_assets.py` — kiểm tra kích thước/mode màu và tạo preview icon 48/72/96 px.
- `preview/` — ảnh xem nhanh, không upload.

## Icon trên thiết bị (đã xong)

Icon launcher đã được thay bằng thiết kế mới:

- `mipmap-anydpi-v26/ic_launcher.xml` → adaptive icon (Android 8+), mask tròn/squircle không cắt lá bài.
- `mipmap-{m,h,xh,xxh,xxxh}dpi/ic_launcher.png` → icon legacy cho Android 7 trở xuống.
- `icons/icon-192/512.png` + `icon-maskable-192/512.png` → icon PWA, `manifest.json` khai báo tách `any` và `maskable`.

## Việc còn lại (không nằm trong bộ asset này)

1. Nếu muốn thêm **7-inch / 10-inch tablet screenshots**, cần chụp thêm ở tỉ lệ 16:10 (ví dụ 1920×1200) — hiện chỉ có bộ phone.
2. Có thể thêm ảnh **promo video** (YouTube link) nếu muốn, không bắt buộc.
3. Icon store (`icon-512.png`) và icon launcher giờ cùng một thiết kế; nếu đổi icon lần nữa, phải chạy lại cả `capture.mjs static` và `build_icons.py`.
