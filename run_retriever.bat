@echo off
title Project Retriever
color 0A
cd /d "%~dp0"

echo ================================================
echo        Project Retriever - Manual Run
echo ================================================
echo.
echo  Started at: %date% %time%
echo.

:: --- Pre-checks ---
echo [Check] Verifying Node.js...
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo.
    echo ERROR: Node.js is not installed!
    echo Please install it from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

if not exist "node_modules\" (
    echo [Check] Dependencies missing. Installing...
    echo This may take a moment...
    call npm install
    if %ERRORLEVEL% neq 0 (
        echo.
        echo ERROR: Install failed! Please check your internet connection.
        echo.
        pause
        exit /b 1
    )
    echo [Check] Done.
    echo.
)
:: --- End Pre-checks ---

echo  Scraping government tender websites...
echo  This may take a few minutes, please wait.
echo.
echo ================================================
echo.

node index.js --once

echo.
echo ================================================
echo  Finished at: %date% %time%
echo ================================================
echo.
echo  Press any key to close this window...
pause >nul
