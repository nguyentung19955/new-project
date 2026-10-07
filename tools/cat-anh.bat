@echo off
rem Cat anh game: bam dup file nay (doc "D:\anh game" co dau, xem cat_anh.py) hoac keo tha thu muc anh vao file nay.
rem Ket qua: <thu muc anh>\da-cat\ (assets/ + bao-cao.html) va da-cat.zip. Huong dan: docs/HUONG-DAN-CAT-ANH.md
chcp 65001 >nul
set PYTHONUTF8=1
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
  py -3 cat_anh.py %*
) else (
  where python >nul 2>nul
  if errorlevel 1 (
    echo Chua co Python. Cai tu https://www.python.org/downloads/ ^(tick "Add python.exe to PATH"^) roi chay lai.
    echo Hoac dung ban khong can cai: mo file cat-anh.html bang Chrome / Edge.
    pause
    exit /b 1
  )
  python cat_anh.py %*
)
echo.
pause
