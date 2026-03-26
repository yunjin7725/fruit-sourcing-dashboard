@echo off
chcp 65001 >nul
title [프리미엄 소싱 대시보드] 구동기

echo ==================================================
echo 프리미엄 과일 소싱 밎 마진 대시보드를 구동 중입니다.
echo ==================================================
echo.
echo [안내] 백엔드 서버를 준비하고 있습니다...
echo 잠시 후 화면이 자동으로 켜집니다!
echo (이 검은색 창을 닫으면 프로그램이 종료됩니다.)
echo.

:loop
".\.venv\Scripts\python.exe" app.py
echo.
echo [!] 앱이 예기치 않게 종료되었습니다. 다시 시작합니다...
timeout /t 3 /nobreak >nul
goto loop
