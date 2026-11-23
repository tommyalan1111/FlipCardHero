Write-Host "Đang đồng bộ giao diện và mã nguồn sang Android assets..." -ForegroundColor Cyan
$dest = "android/app/src/main/assets/www"
if (-not (Test-Path $dest)) {
    New-Item -ItemType Directory -Path $dest -Force | Out-Null
}
Copy-Item "index.html", "manifest.json" -Destination $dest -Force
Copy-Item "css", "js", "icons" -Destination $dest -Recurse -Force
Write-Host "[OK] Đồng bộ hoàn tất! Bạn có thể mở Android Studio và chạy ngay." -ForegroundColor Green
