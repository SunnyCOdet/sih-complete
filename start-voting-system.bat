@echo off
echo Starting Secure Voting System...
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd /d %~dp0 && npm start"

echo Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo Starting Frontend...
start "Frontend" cmd /k "cd /d %~dp0\frontend && npm start"

echo.
echo Secure Voting System is starting...
echo Backend: http://localhost:3000
echo Frontend: http://localhost:3001
echo.
echo Press any key to exit...
pause > nul
