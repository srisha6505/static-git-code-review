# Test Ollama Windows Setup
# Run this to verify your Ollama installation is working correctly

Write-Host "`n=== Ollama Windows Setup Test ===" -ForegroundColor Cyan
Write-Host ""

# Test 1: Check if Ollama is installed
Write-Host "Test 1: Checking if Ollama is installed..." -ForegroundColor Yellow
try {
    $ollamaVersion = ollama --version 2>&1
    Write-Host "✓ SUCCESS: Ollama is installed" -ForegroundColor Green
    Write-Host "  Version: $ollamaVersion" -ForegroundColor Gray
} catch {
    Write-Host "✗ FAILED: Ollama is not installed" -ForegroundColor Red
    Write-Host "  Download from: https://ollama.com/download/windows" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}
Write-Host ""

# Test 2: Check if Ollama service is running
Write-Host "Test 2: Checking if Ollama is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:11434" -UseBasicParsing -TimeoutSec 5
    Write-Host "✓ SUCCESS: Ollama service is running" -ForegroundColor Green
    Write-Host "  Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "✗ FAILED: Ollama service is not responding" -ForegroundColor Red
    Write-Host "  Try running: ollama serve" -ForegroundColor Yellow
    Write-Host "  Or check system tray for Ollama icon" -ForegroundColor Gray
    Write-Host ""
    exit 1
}
Write-Host ""

# Test 3: List installed models
Write-Host "Test 3: Checking installed models..." -ForegroundColor Yellow
$modelList = ollama list 2>&1 | Out-String
if ($modelList -match "qwen2.5-coder") {
    Write-Host "✓ SUCCESS: Found qwen2.5-coder model" -ForegroundColor Green
    Write-Host $modelList -ForegroundColor Gray
} elseif ($modelList -match "NAME") {
    Write-Host "⚠ WARNING: Ollama is working but no qwen2.5-coder model found" -ForegroundColor Yellow
    Write-Host $modelList -ForegroundColor Gray
    Write-Host ""
    Write-Host "Install the model with: ollama pull qwen2.5-coder:7b" -ForegroundColor Yellow
} else {
    Write-Host "✗ FAILED: Cannot list models" -ForegroundColor Red
    Write-Host $modelList -ForegroundColor Gray
}
Write-Host ""

# Test 4: Test API endpoint
Write-Host "Test 4: Testing Ollama API..." -ForegroundColor Yellow
try {
    $tagsResponse = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -Method Get -TimeoutSec 5
    Write-Host "✓ SUCCESS: API is responding" -ForegroundColor Green
    Write-Host "  Found $($tagsResponse.models.Count) model(s)" -ForegroundColor Gray
    foreach ($model in $tagsResponse.models) {
        Write-Host "    - $($model.name)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "✗ FAILED: API test failed" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
}
Write-Host ""

# Test 5: Quick generation test (if model exists)
Write-Host "Test 5: Testing text generation..." -ForegroundColor Yellow
if ($modelList -match "qwen2.5-coder") {
    try {
        $testBody = @{
            model = "qwen2.5-coder:7b"
            prompt = "Say 'Ollama is working!' in exactly 5 words"
            stream = $false
        } | ConvertTo-Json

        Write-Host "  Sending test prompt..." -ForegroundColor Gray
        $result = Invoke-RestMethod -Uri "http://localhost:11434/api/generate" -Method Post -Body $testBody -ContentType "application/json" -TimeoutSec 30
        
        Write-Host "✓ SUCCESS: Generation working!" -ForegroundColor Green
        Write-Host "  Model response: $($result.response)" -ForegroundColor Cyan
    } catch {
        Write-Host "✗ FAILED: Generation test failed" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
    }
} else {
    Write-Host "⊘ SKIPPED: No model installed for testing" -ForegroundColor Yellow
    Write-Host "  Install with: ollama pull qwen2.5-coder:7b" -ForegroundColor Gray
}
Write-Host ""

# Summary
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host ""

if ($response -and $tagsResponse) {
    Write-Host "✓ Your Ollama setup is working!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor White
    Write-Host "1. Start your React app: npm run dev" -ForegroundColor Gray
    Write-Host "2. Open in browser: http://localhost:5173" -ForegroundColor Gray
    Write-Host "3. Go to Settings → Select 'Ollama (Local)'" -ForegroundColor Gray
    Write-Host "4. Enter a GitHub URL and click 'Generate AI Review'" -ForegroundColor Gray
    Write-Host ""
    
    if ($modelList -notmatch "qwen2.5-coder") {
        Write-Host "⚠ Don't forget to install the model:" -ForegroundColor Yellow
        Write-Host "  ollama pull qwen2.5-coder:7b" -ForegroundColor Cyan
        Write-Host ""
    }
} else {
    Write-Host "✗ Setup incomplete - please fix the errors above" -ForegroundColor Red
    Write-Host ""
}
