@echo off
chcp 65001 >nul
title [백엔드] 프리미엄 소싱 대시보드
echo Starting Premium Sourcing Dashboard Backend...

:loop
echo.
echo =========================================
echo 서버를 시작합니다. (안정화 24시간 가동 모드)
echo =========================================
".\.venv\Scripts\python.exe" app.py
echo.
echo =========================================
echo [!] 앱이 예기치 않게 종료되었습니다.
echo 안정성을 위해 자동으로 다시 시작합니다...
echo =========================================
timeout /t 3 /nobreak >nul
goto loop
