@echo off
chcp 65001 > nul
setlocal enabledelayedexpansion
title KTP CAD - KHO BẢN VẼ THIẾT KẾ MÁY
color 0B

echo.
echo ======================================================================
echo       KHO BẢN VẼ THIẾT KẾ MÁY KTP - TỰ ĐỘNG CÀI ĐẶT VÀ CHẠY WEB
echo ======================================================================
echo.

:: 1. KIỂM TRA NODE.JS
echo [1/5] Đang kiểm tra môi trường Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo [LỖI] Máy tính của bạn chưa cài đặt Node.js!
    echo Vui lòng tải và cài đặt Node.js (phiên bản LTS khuyến nghị 20.x hoặc mới hơn):
    echo 👉 https://nodejs.org/
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node -v') do set NODE_VERSION=%%v
echo [OK] Đã tìm thấy Node.js: %NODE_VERSION%

:: 2. KIỂM TRA FILE CẤU HÌNH .ENV
echo.
echo [2/5] Đang kiểm tra file cấu hình môi trường (.env)...
if not exist ".env" (
    echo [THÔNG BÁO] Chưa có file .env, đang tự động tạo từ .env.example...
    if exist ".env.example" (
        copy /y ".env.example" ".env" >nul
    ) else (
        echo DATABASE_URL="file:./dev.db" > .env
        echo JWT_SECRET="ktp_cad_library_jwt_secret_key_2026_super_secure" >> .env
    )
    echo [OK] Đã tạo file .env thành công!
) else (
    echo [OK] File .env đã sẵn sàng.
)

:: 3. KIỂM TRA VÀ CÀI ĐẶT THƯ VIỆN NODE_MODULES
echo.
echo [3/5] Đang kiểm tra thư viện dự án (node_modules)...
if not exist "node_modules\" (
    echo [THÔNG BÁO] Lần đầu chạy, đang tiến hành cài đặt thư viện (npm install)...
    echo Quá trình này có thể mất 1 - 2 phút, vui lòng đợi...
    call npm install
    if %errorlevel% neq 0 (
        color 0C
        echo.
        echo [LỖI] Cài đặt thư viện thất bại! Vui lòng kiểm tra kết nối mạng.
        pause
        exit /b 1
    )
    echo [OK] Cài đặt thư viện hoàn tất!
) else (
    echo [OK] Thư viện dự án đã tồn tại.
)

:: 4. KIỂM TRA PRISMA & DATABASE SQLITE
echo.
echo [4/5] Đang kiểm tra cơ sở dữ liệu SQLite và Prisma Client...
call npx prisma generate >nul 2>nul

if not exist "prisma\dev.db" (
    echo [THÔNG BÁO] Chưa có cơ sở dữ liệu. Đang tạo bảng và nạp 71 bản vẽ mẫu...
    call npx prisma db push --skip-generate
    call npm run db:seed
    echo [OK] Khởi tạo cơ sở dữ liệu thành công!
) else (
    echo [OK] Cơ sở dữ liệu SQLite đã sẵn sàng.
)

:: 5. LỰA CHỌN CHẾ ĐỘ CHẠY
echo.
echo ======================================================================
echo               HỆ THỐNG ĐÃ CÀI ĐẶT HOÀN TẤT & SẴN SÀNG!
echo ======================================================================
echo.
echo  [1] Chạy chế độ Phát triển (Dev Mode - Khuyên dùng)
echo  [2] Chạy chế độ Production (Build tối ưu tốc độ)
echo  [3] Cài đặt lại thư viện & Nạp lại Database
echo  [0] Thoát
echo.

set /p CHOICE="Nhập lựa chọn của bạn (Mặc định ấn Enter để chọn 1): "
if "%CHOICE%"=="" set CHOICE=1

if "%CHOICE%"=="1" goto RUN_DEV
if "%CHOICE%"=="2" goto RUN_PROD
if "%CHOICE%"=="3" goto RESET_DB
if "%CHOICE%"=="0" exit /b 0

:RUN_DEV
echo.
echo ======================================================================
echo  Đang khởi động Server tại: http://localhost:3000
echo  Trình duyệt web sẽ tự động mở sau vài giây...
echo  (Nhấn Ctrl + C để dừng máy chủ bất cứ lúc nào)
echo ======================================================================
echo.

start "" cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:3000"
call npm run dev
goto END

:RUN_PROD
echo.
echo Đang biên dịch ứng dụng Production (npm run build)...
call npm run build
if %errorlevel% neq 0 (
    echo [LỖI] Biên dịch thất bại!
    pause
    exit /b 1
)
echo.
echo Đang khởi chạy máy chủ Production tại: http://localhost:3000 ...
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:3000"
call npm run start
goto END

:RESET_DB
echo.
echo Đang nạp lại dữ liệu gốc...
call npx prisma db push --force-reset
call npm run db:seed
echo.
echo [OK] Đã làm mới Database thành công!
pause
goto RUN_DEV

:END
pause
