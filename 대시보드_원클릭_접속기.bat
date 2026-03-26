@echo off
chcp 65001 >nul
title [프리미엄 소싱 대시보드] 원클릭 실행기
echo ==================================================
echo 프리미엄 과일 소싱 밎 마진 대시보드를 시작합니다.
echo ==================================================
echo.
echo 1. 서버 구동을 준비합니다...
echo 2. 준비가 완료되면 스스로 브라우저를 찾아 띄웁니다!
echo (이 창을 닫으면 대시보드도 꺼집니다)
echo.

:loop
".\.venv\Scripts\python.exe" app.py
echo.
echo [!] 서버 구동이 종료되었습니다. 다시 시작합니다...
timeout /t 3 /nobreak >nul
goto loop
