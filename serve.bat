@echo off
REM solar-results 갤러리 로컬 미리보기 시작 스크립트
REM 더블클릭만으로 갤러리를 브라우저에서 열어줍니다.

cd /d "%~dp0"

echo.
echo === solar-results 갤러리 미리보기 ===
echo.
echo 브라우저에서 자동으로 열립니다. 안 열리면 직접 접속:
echo   http://localhost:8888
echo.
echo 종료하려면 이 창에서 Ctrl+C 누르세요.
echo.

REM 3초 후 자동으로 브라우저 열기 (백그라운드)
start /min cmd /c "timeout /t 2 >nul && start http://localhost:8888"

REM 웹서버 시작 (이 창은 닫지 마세요)
python -m http.server 8888

pause
