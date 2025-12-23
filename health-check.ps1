# Rural LMS - System Health Check Script
# Verifies that everything is working correctly

Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Rural LMS - System Health Check     ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝`n" -ForegroundColor Cyan

$allChecks = @()
$passedChecks = 0
$totalChecks = 0

function Test-Check {
    param(
        [string]$Name,
        [scriptblock]$Test,
        [string]$SuccessMessage,
        [string]$FailMessage
    )
    
    $script:totalChecks++
    Write-Host "🔍 Checking: $Name..." -ForegroundColor Yellow -NoNewline
    
    try {
        $result = & $Test
        if ($result) {
            Write-Host " ✅" -ForegroundColor Green
            Write-Host "   $SuccessMessage" -ForegroundColor Gray
            $script:passedChecks++
            return $true
        } else {
            Write-Host " ❌" -ForegroundColor Red
            Write-Host "   $FailMessage" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host " ❌" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Check 1: Node.js Installation
Test-Check -Name "Node.js Installation" -Test {
    $version = node --version 2>$null
    return $version -ne $null
} -SuccessMessage "Node.js is installed: $(node --version)" `
  -FailMessage "Node.js is NOT installed. Download from nodejs.org"

# Check 2: npm Installation
Test-Check -Name "npm Installation" -Test {
    $version = npm --version 2>$null
    return $version -ne $null
} -SuccessMessage "npm is installed: v$(npm --version)" `
  -FailMessage "npm is NOT installed"

# Check 3: Backend Directory
Test-Check -Name "Backend Directory" -Test {
    return Test-Path "D:\cloud_el_2\rural-lms\backend"
} -SuccessMessage "Backend directory exists" `
  -FailMessage "Backend directory NOT found"

# Check 4: Frontend Directory
Test-Check -Name "Frontend Directory" -Test {
    return Test-Path "D:\cloud_el_2\rural-lms\frontend"
} -SuccessMessage "Frontend directory exists" `
  -FailMessage "Frontend directory NOT found"

# Check 5: Backend package.json
Test-Check -Name "Backend package.json" -Test {
    return Test-Path "D:\cloud_el_2\rural-lms\backend\package.json"
} -SuccessMessage "Backend package.json exists" `
  -FailMessage "Backend package.json NOT found"

# Check 6: Frontend package.json
Test-Check -Name "Frontend package.json" -Test {
    return Test-Path "D:\cloud_el_2\rural-lms\frontend\package.json"
} -SuccessMessage "Frontend package.json exists" `
  -FailMessage "Frontend package.json NOT found"

# Check 7: Backend node_modules
Test-Check -Name "Backend Dependencies" -Test {
    return Test-Path "D:\cloud_el_2\rural-lms\backend\node_modules"
} -SuccessMessage "Backend dependencies installed" `
  -FailMessage "Run: cd backend && npm install"

# Check 8: Frontend node_modules
Test-Check -Name "Frontend Dependencies" -Test {
    return Test-Path "D:\cloud_el_2\rural-lms\frontend\node_modules"
} -SuccessMessage "Frontend dependencies installed" `
  -FailMessage "Run: cd frontend && npm install"

# Check 9: Database File
$dbExists = Test-Check -Name "Database File" -Test {
    return Test-Path "D:\cloud_el_2\rural-lms\backend\rural-lms.db"
} -SuccessMessage "Database file exists" `
  -FailMessage "Database will be created on first run"

# Check 10: Port 3000 Availability
Test-Check -Name "Port 3000 (Backend)" -Test {
    $port = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    if ($port) {
        Write-Host " ⚠️ " -ForegroundColor Yellow -NoNewline
        return $false
    }
    return $true
} -SuccessMessage "Port 3000 is available" `
  -FailMessage "Port 3000 is IN USE (backend may already be running)"

# Check 11: Port 5173 Availability
Test-Check -Name "Port 5173 (Frontend)" -Test {
    $port = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue
    if ($port) {
        Write-Host " ⚠️ " -ForegroundColor Yellow -NoNewline
        return $false
    }
    return $true
} -SuccessMessage "Port 5173 is available" `
  -FailMessage "Port 5173 is IN USE (frontend may already be running)"

# Check 12: Backend Server Files
Test-Check -Name "Backend Server File" -Test {
    return Test-Path "D:\cloud_el_2\rural-lms\backend\src\server.js"
} -SuccessMessage "Backend server.js exists" `
  -FailMessage "Backend server.js NOT found"

# Check 13: Frontend App File
Test-Check -Name "Frontend App File" -Test {
    return Test-Path "D:\cloud_el_2\rural-lms\frontend\src\App.jsx"
} -SuccessMessage "Frontend App.jsx exists" `
  -FailMessage "Frontend App.jsx NOT found"

# Check 14: Controllers
Test-Check -Name "Backend Controllers" -Test {
    $controllers = @(
        "D:\cloud_el_2\rural-lms\backend\src\controllers\authController.js",
        "D:\cloud_el_2\rural-lms\backend\src\controllers\courseController.js",
        "D:\cloud_el_2\rural-lms\backend\src\controllers\lessonController.js",
        "D:\cloud_el_2\rural-lms\backend\src\controllers\achievementsController.js",
        "D:\cloud_el_2\rural-lms\backend\src\controllers\contentController.js"
    )
    foreach ($controller in $controllers) {
        if (-not (Test-Path $controller)) {
            return $false
        }
    }
    return $true
} -SuccessMessage "All 5 controllers exist" `
  -FailMessage "Some controllers are missing"

# Check 15: Routes
Test-Check -Name "Backend Routes" -Test {
    $routes = @(
        "D:\cloud_el_2\rural-lms\backend\src\routes\auth.js",
        "D:\cloud_el_2\rural-lms\backend\src\routes\courses.js",
        "D:\cloud_el_2\rural-lms\backend\src\routes\lessons.js",
        "D:\cloud_el_2\rural-lms\backend\src\routes\dashboard.js",
        "D:\cloud_el_2\rural-lms\backend\src\routes\achievements.js"
    )
    foreach ($route in $routes) {
        if (-not (Test-Path $route)) {
            return $false
        }
    }
    return $true
} -SuccessMessage "All 5 routes exist" `
  -FailMessage "Some routes are missing"

# Summary
Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           Health Check Summary          ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝`n" -ForegroundColor Cyan

$percentage = [math]::Round(($passedChecks / $totalChecks) * 100, 1)

Write-Host "Passed: $passedChecks / $totalChecks ($percentage%)" -ForegroundColor $(if ($passedChecks -eq $totalChecks) { "Green" } else { "Yellow" })

if ($passedChecks -eq $totalChecks) {
    Write-Host "`n✅ System is 100% READY!" -ForegroundColor Green
    Write-Host "   You can start the servers using start-all.ps1`n" -ForegroundColor Green
} elseif ($percentage -ge 80) {
    Write-Host "`n⚠️  System is mostly ready with minor issues" -ForegroundColor Yellow
    Write-Host "   Review failed checks above`n" -ForegroundColor Yellow
} else {
    Write-Host "`n❌ System has critical issues" -ForegroundColor Red
    Write-Host "   Please fix the errors above before starting`n" -ForegroundColor Red
}

# Additional Info
Write-Host "╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║          System Information             ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "Node.js Version:  $(node --version 2>$null)" -ForegroundColor White
Write-Host "npm Version:      v$(npm --version 2>$null)" -ForegroundColor White
Write-Host "PowerShell:       $($PSVersionTable.PSVersion)" -ForegroundColor White
Write-Host "Project Path:     D:\cloud_el_2\rural-lms" -ForegroundColor White

if (Test-Path "D:\cloud_el_2\rural-lms\backend\rural-lms.db") {
    $dbSize = (Get-Item "D:\cloud_el_2\rural-lms\backend\rural-lms.db").Length / 1KB
    Write-Host "Database Size:    $([math]::Round($dbSize, 2)) KB" -ForegroundColor White
}

Write-Host "`nPress any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
