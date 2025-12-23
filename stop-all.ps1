# Rural LMS - Stop All Servers Script
# This script stops all Node.js processes

Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Red
Write-Host "║      Rural LMS - Stop All Servers      ║" -ForegroundColor Red
Write-Host "╚════════════════════════════════════════╝`n" -ForegroundColor Red

Write-Host "🛑 Stopping all Node.js processes..." -ForegroundColor Yellow

$processes = Get-Process -Name node -ErrorAction SilentlyContinue

if ($processes) {
    $processCount = $processes.Count
    Stop-Process -Name node -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Stopped $processCount Node.js process(es)" -ForegroundColor Green
} else {
    Write-Host "ℹ️  No Node.js processes found running" -ForegroundColor Cyan
}

Write-Host "`n✅ All servers stopped!`n" -ForegroundColor Green

Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
