Write-Host "=========================================================================" -ForegroundColor Cyan
Write-Host "   RetainIQ - Understand Customers. Predict Retention. Drive Growth.    " -ForegroundColor Cyan
Write-Host "=========================================================================" -ForegroundColor Cyan
Write-Host "Starting modern dark-themed SaaS analytics dashboard on http://localhost:3000..." -ForegroundColor Green
Set-Location -Path "$PSScriptRoot\frontend"
node node_modules/vite/bin/vite.js --port 3000
