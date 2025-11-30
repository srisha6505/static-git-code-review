# Test Ollama WSL Connection
# Run this to verify your setup is working

Write-Host "=== Testing Ollama Connection ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Basic connectivity
Write-Host "Test 1: Checking if Ollama is accessible..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:11434" -Method Get -TimeoutSec 5
    Write-Host "✓ SUCCESS: Ollama is running" -ForegroundColor Green
    Write-Host "  Response: $response" -ForegroundColor Gray
} catch {
    Write-Host "✗ FAILED: Cannot connect to Ollama" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Trying to get WSL IP..." -ForegroundColor Yellow
    $wslIp = (wsl hostname -I).Trim()
    Write-Host "  WSL IP: $wslIp" -ForegroundColor Cyan
    Write-Host "  Try: http://$wslIp:11434 in ollamaService.ts" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# Test 2: List models
Write-Host "Test 2: Checking installed models..." -ForegroundColor Yellow
try {
    $tags = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -Method Get -TimeoutSec 5
    if ($tags.models.Count -gt 0) {
        Write-Host "✓ Found $($tags.models.Count) model(s):" -ForegroundColor Green
        foreach ($model in $tags.models) {
            Write-Host "  - $($model.name)" -ForegroundColor Cyan
        }
    } else {
        Write-Host "⚠ WARNING: No models installed" -ForegroundColor Yellow
        Write-Host "  Install one with: wsl -e ollama pull llama3.2" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ FAILED: Cannot list models" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
}
Write-Host ""

# Test 3: Test generation (if model exists)
Write-Host "Test 3: Testing text generation..." -ForegroundColor Yellow
try {
    $testPrompt = @{
        model = "llama3.2"
        prompt = "Say 'Hello from Ollama!' in exactly 5 words"
        stream = $false
    } | ConvertTo-Json

    Write-Host "  Sending test prompt to llama3.2..." -ForegroundColor Gray
    $result = Invoke-RestMethod -Uri "http://localhost:11434/api/generate" -Method Post -Body $testPrompt -ContentType "application/json" -TimeoutSec 30
    
    Write-Host "✓ SUCCESS: Generation working!" -ForegroundColor Green
    Write-Host "  Response: $($result.response)" -ForegroundColor Cyan
} catch {
    if ($_.Exception.Message -match "404") {
        Write-Host "⚠ Model 'llama3.2' not found" -ForegroundColor Yellow
        Write-Host "  Install with: wsl -e ollama pull llama3.2" -ForegroundColor Gray
    } else {
        Write-Host "✗ FAILED: Generation test failed" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
    }
}
Write-Host ""

# Summary
Write-Host "=== Test Complete ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "If all tests passed, you're ready to use Ollama in the app!" -ForegroundColor Green
Write-Host "1. Open the React app" -ForegroundColor White
Write-Host "2. Go to Settings → Select 'Ollama (Local)'" -ForegroundColor White
Write-Host "3. Generate AI Review" -ForegroundColor White
