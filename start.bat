@echo off
echo Starting AETHER Local Server...
echo This will fix the CORS error by serving files over HTTP.
echo.
echo If asked to install 'serve', please type 'y' and press Enter.
echo.
call npx serve .
pause
