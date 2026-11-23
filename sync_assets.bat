@echo off
chcp 65001 >nul
echo Đang đồng bộ giao diện và mã nguồn sang Android assets...
if not exist "android\app\src\main\assets\www" mkdir "android\app\src\main\assets\www"
copy /y index.html android\app\src\main\assets\www\ >nul
copy /y manifest.json android\app\src\main\assets\www\ >nul
xcopy /e /y /i css android\app\src\main\assets\www\css >nul
xcopy /e /y /i js android\app\src\main\assets\www\js >nul
xcopy /e /y /i icons android\app\src\main\assets\www\icons >nul
echo [OK] Đồng bộ hoàn tất! Bạn có thể mở Android Studio và chạy ngay.
pause
