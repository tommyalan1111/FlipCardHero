#!/bin/bash
echo "Đang đồng bộ giao diện và mã nguồn sang Android assets..."
mkdir -p android/app/src/main/assets/www
cp index.html manifest.json android/app/src/main/assets/www/
cp -r css js icons android/app/src/main/assets/www/
echo "✅ Đồng bộ hoàn tất! Bạn có thể mở Android Studio và chạy ngay."
