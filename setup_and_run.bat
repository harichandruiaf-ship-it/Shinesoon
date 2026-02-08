@echo off
TITLE Shinesoon Setup
echo ==========================================
echo      Shinesoon Automated Setup
echo ==========================================

WHERE npm >nul 2>nul
IF %ERRORLEVEL% NEQ 0 (
    echo Error: npm is not found in your PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit
)

echo.
echo [1/4] Installing Server Dependencies...
cd server
call npm install
IF %ERRORLEVEL% NEQ 0 (
    echo Failed to install server dependencies.
    pause
    exit
)

echo.
echo [2/4] Starting Backend Server...
start "Shinesoon Backend" cmd /k "npm run dev"

echo.
echo [3/4] Installing Client Dependencies...
cd ..\client
call npm install
IF %ERRORLEVEL% NEQ 0 (
    echo Failed to install client dependencies.
    pause
    exit
)

echo.
echo [4/4] Starting Frontend Client...
start "Shinesoon Frontend" cmd /k "npm run dev"

echo.
echo ==========================================
echo        Setup Complete!
echo ==========================================
echo The application should be accessible at http://localhost:5173
pause
