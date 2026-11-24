# ==============================================================================
# AI-Powered Recruitment & Interview Management Platform - Launch Script
# ==============================================================================

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host " Starting AI-Powered Recruitment & Interview Management Platform " -ForegroundColor White
Write-Host "==================================================================" -ForegroundColor Cyan

$WorkspaceRoot = $PSScriptRoot
$BackendDir = Join-Path $WorkspaceRoot "backend"
$FrontendDir = Join-Path $WorkspaceRoot "frontend"
$PythonExe = Join-Path $BackendDir "venv\Scripts\python.exe"

# 1. Check Python Virtual Environment
if (-not (Test-Path $PythonExe)) {
    Write-Host "[1/4] Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv "$BackendDir\venv"
    & "$BackendDir\venv\Scripts\pip.exe" install -r "$BackendDir\requirements.txt"
} else {
    Write-Host "[1/4] Python virtual environment verified." -ForegroundColor Green
}

# 2. Seed Database
Write-Host "[2/4] Verifying and seeding demo recruitment database..." -ForegroundColor Yellow
$env:PYTHONPATH = "backend"
& $PythonExe "$BackendDir\seed_demo_data.py"

# 3. Start Backend Server in a new window
Write-Host "[3/4] Launching FastAPI Backend Server on http://127.0.0.1:8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$BackendDir'; `$env:PYTHONPATH='.'; .\venv\Scripts\Activate.ps1; python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

# 4. Start Frontend Server in a new window
Write-Host "[4/4] Launching React Vite Frontend on http://localhost:5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$FrontendDir'; npm.cmd run dev"

Write-Host ""
Write-Host "==================================================================" -ForegroundColor Green
Write-Host " PLATFORM SUCCESSFULLY LAUNCHED" -ForegroundColor Green
Write-Host "==================================================================" -ForegroundColor Green
Write-Host " Frontend Application:  http://localhost:5173" -ForegroundColor Cyan
Write-Host " Backend API Docs:      http://127.0.0.1:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host " PRE-SEEDED DEMO CREDENTIALS:" -ForegroundColor Yellow
Write-Host " - Admin:       admin@recruitment.ai / AdminPass123!" -ForegroundColor White
Write-Host " - Interviewer: interviewer@recruitment.ai / InterviewerPass123!" -ForegroundColor White
Write-Host " - Candidate:   candidate@recruitment.ai / CandidatePass123!" -ForegroundColor White
Write-Host "==================================================================" -ForegroundColor Green
