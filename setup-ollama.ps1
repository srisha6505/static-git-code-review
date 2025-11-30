# Ollama WSL Quick Start Script for Windows
# Run this from Windows PowerShell

Write-Host "=== Ollama WSL Setup for Windows ===" -ForegroundColor Cyan
Write-Host ""

# Check WSL installation
Write-Host "1. Checking WSL installation..." -ForegroundColor Yellow
$wslCheck = wsl --list --verbose 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: WSL is not installed or not configured properly" -ForegroundColor Red
    Write-Host "Install WSL with: wsl --install" -ForegroundColor Yellow
    exit 1
}

Write-Host $wslCheck
Write-Host ""

# Check if using WSL2
if ($wslCheck -notmatch "VERSION 2") {
    Write-Host "WARNING: WSL1 detected. WSL2 is recommended for better networking." -ForegroundColor Yellow
    Write-Host "Upgrade with: wsl --set-version Ubuntu 2" -ForegroundColor Yellow
    Write-Host ""
}

# Check if Ollama is installed in WSL
Write-Host "2. Checking if Ollama is installed in WSL..." -ForegroundColor Yellow
$ollamaInstalled = wsl -e which ollama 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Ollama not found. Installing..." -ForegroundColor Yellow
    wsl -e bash -c "curl -fsSL https://ollama.com/install.sh | sh"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Ollama installed successfully" -ForegroundColor Green
    } else {
        Write-Host "ERROR: Failed to install Ollama" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✓ Ollama is already installed: $ollamaInstalled" -ForegroundColor Green
}
Write-Host ""

# Start Ollama service
Write-Host "3. Starting Ollama service in WSL..." -ForegroundColor Yellow
Write-Host "   (This will keep running in the background)" -ForegroundColor Gray

Start-Process wsl -ArgumentList "-d", "Ubuntu", "-e", "ollama", "serve" -WindowStyle Hidden

Start-Sleep -Seconds 3

# Test connection
Write-Host "4. Testing connection to Ollama..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:11434" -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ Ollama is running and accessible at http://localhost:11434" -ForegroundColor Green
    }
} catch {
    Write-Host "WARNING: Cannot connect to Ollama at localhost:11434" -ForegroundColor Yellow
    Write-Host "Getting WSL IP address..." -ForegroundColor Yellow
    $wslIp = (wsl hostname -I).Trim()
    Write-Host "WSL IP: $wslIp" -ForegroundColor Cyan
    Write-Host "Try updating ollamaService.ts with: http://$wslIp:11434" -ForegroundColor Yellow
}
Write-Host ""

# Check for installed models
Write-Host "5. Checking installed models..." -ForegroundColor Yellow
$models = wsl -e ollama list 2>&1
Write-Host $models
Write-Host ""

# Prompt to install llama3.2 if not present
if ($models -notmatch "llama3.2") {
    Write-Host "Recommended: Install llama3.2 model (this will take a few minutes)" -ForegroundColor Yellow
    $install = Read-Host "Install llama3.2 now? (y/n)"
    if ($install -eq "y" -or $install -eq "Y") {
        Write-Host "Downloading llama3.2... (this may take 5-10 minutes)" -ForegroundColor Cyan
        wsl -e ollama pull llama3.2
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ llama3.2 installed successfully" -ForegroundColor Green
        }
    }
}
Write-Host ""

Write-Host "=== Setup Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Keep this PowerShell window open (or Ollama will stop)" -ForegroundColor White
Write-Host "2. In your React app, go to Settings → Select 'Ollama (Local)'" -ForegroundColor White
Write-Host "3. Click 'Generate AI Review' to test" -ForegroundColor White
Write-Host ""
Write-Host "Ollama is running at: http://localhost:11434" -ForegroundColor Green
Write-Host "Press Ctrl+C to stop Ollama" -ForegroundColor Gray
