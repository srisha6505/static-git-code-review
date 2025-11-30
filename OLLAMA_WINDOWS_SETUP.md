# Ollama Setup for Windows

## Quick Start (3 Steps)

### 1. Install Ollama
Download and install Ollama for Windows:
- 🔗 **[Download Ollama for Windows](https://ollama.com/download/windows)**
- Run the installer (OllamaSetup.exe)
- Ollama will automatically start and run in the background

### 2. Verify Installation
Open **PowerShell** and run:
```powershell
ollama list
```

Expected output:
```
NAME                    ID              SIZE    MODIFIED
```
(List may be empty if no models installed yet)

### 3. Install AI Model
Pull the code review model:
```powershell
ollama pull qwen2.5-coder:7b
```

This downloads the model (about 4.7GB). Progress will be shown in the terminal.

---

## Using Ollama in Your App

### Step 1: Start Your React App
```powershell
cd C:\Users\swata\code-rev\static-git-code-review
npm run dev
```

### Step 2: Open App in Browser
Navigate to `http://localhost:5173` (or the port shown in terminal)

### Step 3: Select Ollama Provider
1. Click the **Settings** icon (⚙️) in the top right
2. Under **LLM Provider**, select **"Ollama (Local)"**
3. Close the settings modal

### Step 4: Generate AI Review
1. Enter a GitHub repository URL (e.g., `https://github.com/username/repo`)
2. Click **"Generate AI Review"**
3. Watch the AI analysis stream in real-time!

---

## Model Options

Choose based on your system specs:

| Model | Size | RAM Required | Best For |
|-------|------|--------------|----------|
| `qwen2.5-coder:1.5b` | 1.0 GB | 4 GB | Quick tests, low-end systems |
| `qwen2.5-coder:7b` | 4.7 GB | 8 GB | **Recommended** - Best balance |
| `qwen2.5-coder:14b` | 9.0 GB | 16 GB | Highest quality |
| `deepseek-coder-v2:16b` | 9.0 GB | 16 GB | Alternative, great code understanding |
| `llama3.2:3b` | 2.0 GB | 6 GB | General purpose, faster |

### Install Different Models
```powershell
# Smaller, faster model
ollama pull qwen2.5-coder:1.5b

# Larger, more accurate model
ollama pull qwen2.5-coder:14b
```

### Change Model in Code
Edit `services/ollamaService.ts` line 5:
```typescript
const modelId = "qwen2.5-coder:7b"; // Change to your preferred model
```

---

## Troubleshooting

### ❌ "Failed to fetch" Error

**Check if Ollama is running:**
```powershell
# Test connection
curl http://localhost:11434
```

**Expected response:** `Ollama is running`

**If not running:**
- Check system tray for Ollama icon (right-click → Start)
- Or run manually: `ollama serve` in PowerShell

### ❌ "Model 'qwen2.5-coder:7b' not found"

**Pull the model:**
```powershell
ollama pull qwen2.5-coder:7b
```

**Verify it's installed:**
```powershell
ollama list
```

### ❌ Slow Performance

**Try a smaller model:**
```powershell
ollama pull qwen2.5-coder:1.5b
```
Then update `modelId` in `services/ollamaService.ts`

### ❌ Connection Timeout

**Check Windows Firewall:**
- Search "Windows Firewall" → Allow an app through firewall
- Ensure "Ollama" is allowed for Private networks

**Check port availability:**
```powershell
netstat -an | findstr :11434
```
Should show: `TCP  127.0.0.1:11434  0.0.0.0:0  LISTENING`

---

## Advanced Configuration

### Background Service
Ollama runs automatically on Windows startup. To manage:

**Stop Ollama:**
```powershell
Stop-Process -Name "ollama" -Force
```

**Start Ollama:**
```powershell
Start-Process "ollama" -ArgumentList "serve"
```

### Change Port
Edit Ollama environment variable:
1. Search "Environment Variables" in Windows
2. Add system variable: `OLLAMA_HOST=0.0.0.0:11435`
3. Restart Ollama
4. Update `ollamaUrl` in `services/ollamaService.ts`

### GPU Acceleration
Ollama automatically uses GPU if available (NVIDIA/AMD). Check usage:
```powershell
ollama ps
```

---

## Test Your Setup

Run this quick test in PowerShell:

```powershell
# Test 1: Check Ollama is running
curl http://localhost:11434

# Test 2: List installed models
ollama list

# Test 3: Test generation
ollama run qwen2.5-coder:7b "Write a hello world in Python"
```

All tests passed? You're ready to use Ollama in your app! 🎉

---

## Resources

- 📚 [Ollama Documentation](https://github.com/ollama/ollama/blob/main/README.md)
- 🤖 [Available Models](https://ollama.com/library)
- 💬 [Ollama Discord](https://discord.gg/ollama)

---

**Need Help?** Check the [GitHub Issues](https://github.com/ollama/ollama/issues) or ask in the Ollama Discord community.
