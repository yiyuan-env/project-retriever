@echo off
title Project Retriever - Setup
color 0A
cd /d "%~dp0"

echo ================================================
echo     Project Retriever - One-Click Setup
echo ================================================
echo.

:: Step 1: Check if Node.js is installed
echo [1/4] Checking Node.js installation...
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo.
    echo  ERROR: Node.js is not installed!
    echo.
    echo  Please download and install Node.js LTS from:
    echo  https://nodejs.org/
    echo.
    echo  After installing, please run this setup again.
    echo.
    pause
    exit /b 1
)
for /f "tokens=*" %%v in ('node -v') do echo       Found Node.js %%v

:: Step 2: Install dependencies
echo.
echo [2/4] Installing dependencies (npm install)...
echo       This may take a minute on first run...
echo.
call npm install
if %ERRORLEVEL% neq 0 (
    echo.
    echo  ERROR: npm install failed!
    echo  Please check the error messages above.
    echo.
    pause
    exit /b 1
)
echo.
echo       Dependencies installed successfully!

:: Step 3: Create .env file if it doesn't exist
echo.
echo [3/4] Checking environment configuration...
if not exist ".env" (
    copy ".env.example" ".env" >nul
    echo       Created .env file from .env.example
    echo       (Optional: edit .env to configure email notifications)
) else (
    echo       .env file already exists, skipping.
)

:: Step 4: Create desktop shortcut
echo.
echo [4/4] Creating desktop shortcut...
set SCRIPT_DIR=%~dp0
set SHORTCUT_NAME=Project Retriever.lnk

:: Use PowerShell to create a proper .lnk shortcut on the desktop
powershell -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut([System.IO.Path]::Combine($ws.SpecialFolders('Desktop'), '%SHORTCUT_NAME%')); $s.TargetPath = '%SCRIPT_DIR%run_retriever.bat'; $s.WorkingDirectory = '%SCRIPT_DIR%'; $s.Description = 'Run Project Retriever'; $s.Save()" 2>nul

if exist "%USERPROFILE%\Desktop\%SHORTCUT_NAME%" (
    echo       Desktop shortcut created!
) else (
    echo       Could not create shortcut automatically.
    echo       You can manually create a shortcut to:
    echo       %SCRIPT_DIR%run_retriever.bat
)

echo.
echo ================================================
echo.
echo  Setup complete! You can now:
echo.
echo  1. Double-click "Project Retriever" on your
echo     desktop to run the program.
echo.
echo  2. Or double-click "run_retriever.bat" in
echo     this folder.
echo.
echo ================================================
echo.
echo  Press any key to close...
pause >nul
