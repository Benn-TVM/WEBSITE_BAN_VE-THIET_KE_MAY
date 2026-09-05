@echo off
cd /d "%~dp0"
chcp 65001 > nul
title KTP CAD - KHO BAN VE THIET KE MAY
color 0B

echo.
echo ======================================================================
echo       KHO BAN VE THIET KE MAY KTP - TU DONG CAI DAT VA CHAY WEB
echo ======================================================================
echo.

REM 1. KIEM TRA NODE.JS
echo [1/4] Dang kiem tra moi truong Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo [LOI] May tinh chua cai dat Node.js!
    echo Vui long tai va cai dat Node.js LTS tu: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node -v') do set NODE_VERSION=%%v
echo [OK] Node.js da san sang: %NODE_VERSION%

REM 2. KIEM TRA FILE CAU HINH .ENV
echo.
echo [2/4] Dang kiem tra file cau hinh (.env)...
if not exist ".env" (
    echo [THONG BAO] Dang tao file .env tu .env.example...
    if exist ".env.example" (
        copy /y ".env.example" ".env" >nul
    ) else (
        echo DATABASE_URL="file:./dev.db" > .env
        echo JWT_SECRET="ktp_cad_library_jwt_secret_key_2026_super_secure" >> .env
    )
    echo [OK] Da tao file .env thanh cong!
) else (
    echo [OK] File .env da co san.
)

REM 3. KIEM TRA THU VIEN NODE_MODULES
echo.
echo [3/4] Dang kiem tra thu vien (node_modules)...
if not exist "node_modules" (
    echo [THONG BAO] Dang cai dat thu vien npm install... Vui long cho trong giay lat...
    call npm install
    if %errorlevel% neq 0 (
        color 0C
        echo [LOI] Cai dat thu vien that bai! Vui long kiem tra ket noi mang.
        pause
        exit /b 1
    )
    echo [OK] Cai dat thu vien thanh cong!
) else (
    echo [OK] Thu vien node_modules da san sang.
)

REM 4. KIEM TRA CO SO DU LIEU SQLITE
echo.
echo [4/4] Dang kiem tra co so du lieu SQLite...
call npx prisma generate >nul 2>nul

if not exist "prisma\dev.db" (
    echo [THONG BAO] Dang khoi tao Database va nap 71 ban ve mau...
    call npx prisma db push --skip-generate
    call npm run db:seed
    echo [OK] Khoi tao Database thanh cong!
) else (
    echo [OK] Co so du lieu dev.db da san sang.
)

echo.
echo ======================================================================
echo                HE THONG DA SAN SANG KHOI CHAY!
echo ======================================================================
echo.
echo   Trinh duyet web se tu dong mo tai: http://localhost:3000
echo   Tai khoan Admin: admin@ktp.vn  ^|  Mat khau: 123456
echo   (Nhan Ctrl + C de dung may chu bat cu luc nao)
echo ======================================================================
echo.

start "" http://localhost:3000
call npm run dev

pause
