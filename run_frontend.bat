@echo off
echo =========================================================================
echo    RetainIQ - Understand Customers. Predict Retention. Drive Growth.     
echo =========================================================================
echo Starting modern dark-themed SaaS analytics dashboard on http://localhost:3000...
cd /d "%~dp0frontend"
node node_modules/vite/bin/vite.js --port 3000
pause
