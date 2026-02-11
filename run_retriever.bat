@echo off
title Project Retriever
color 0A
cd /d "c:\project-retriever"

echo ================================================
echo        Project Retriever - Manual Run
echo ================================================
echo.
echo  Started at: %date% %time%
echo.
echo  Scraping government tender websites...
echo  This may take a few minutes, please wait.
echo.
echo ================================================
echo.

"C:\Program Files\nodejs\node.exe" index.js --once

echo.
echo ================================================
echo  Finished at: %date% %time%
echo ================================================
echo.
echo  Press any key to close this window...
pause >nul
