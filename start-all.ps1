# Rural LMS - Complete Startup Script
# This script starts both backend and frontend servers

Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║      Rural LMS - Startup Script        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Check if ports are already in use
Write-Host "🔍 Checking for existing processes..." -ForegroundColor Yellow

$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
$port5173 = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue

if ($port3000 -or $port5173) {
    Write-Host "⚠️  Ports 3000 or 5173 are already in use." -ForegroundColor Red
    Write-Host "   Stopping existing Node.js processes..." -ForegroundColor Yellow
    
    Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    
    Write-Host "✅ Ports cleared!" -ForegroundColor Green
}

# Start Backend
Write-Host "`n🚀 Starting Backend Server (Port 3000)..." -ForegroundColor Cyan
$backendPath = Join-Path $PSScriptRoot "backend"

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$backendPath'; npm start"
) -WindowStyle Normal

Write-Host "   Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "`n🎨 Starting Frontend Server (Port 5173)..." -ForegroundColor Cyan
$frontendPath = Join-Path $PSScriptRoot "frontend"

Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$frontendPath'; npm run dev"
) -WindowStyle Normal

Write-Host "   Waiting for frontend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Success message
Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║          ✅ ALL SERVERS RUNNING!        ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════╝" -ForegroundColor Green

Write-Host "`n📍 Access your application at:" -ForegroundColor White
Write-Host "   Frontend:  http://localhost:5173" -ForegroundColor Cyan
Write-Host "   Backend:   http://localhost:3000" -ForegroundColor Cyan
Write-Host "   API Docs:  http://localhost:3000/health" -ForegroundColor Cyan

Write-Host "`n🔐 Test Credentials:" -ForegroundColor White
Write-Host "   Student:   student@test.com / password123" -ForegroundColor Yellow
Write-Host "   Educator:  educator@test.com / password123" -ForegroundColor Yellow

Write-Host "`n💡 Tip: Two new PowerShell windows have opened." -ForegroundColor Magenta
Write-Host "   Close them to stop the servers.`n" -ForegroundColor Magenta

Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
