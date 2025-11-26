# Deployment Guide

## 🚀 Deploy to GitHub & Vercel

This guide walks you through deploying the IIC Static Code Reviewer to GitHub and Vercel.

---

## Prerequisites

- [x] Node.js installed (v16 or higher)
- [x] Git installed
- [x] GitHub account
- [x] Vercel account (free tier works)
- [x] GitHub Personal Access Token (for API access)

---

## Part 1: Prepare for Deployment

### Step 1: Test Local Build

Before deploying, ensure everything builds correctly:

```bash
cd static_code_reviewer

# Install dependencies (if not already done)
npm install

# Build the production bundle
npm run build

# Test the production build locally
npm run preview
```

Visit `http://localhost:4173` and verify:
- ✅ App loads without errors
- ✅ Login works (username: `iic_admin`, password: `iicbicepadminpassword`)
- ✅ UI renders correctly

### Step 2: Review Security Settings

**⚠️ IMPORTANT:** Read `SECURITY.md` before deploying!

**Quick Security Checklist:**
- [ ] Understand that credentials are client-side (not secure for public use)
- [ ] Have GitHub token ready (with `public_repo` scope only)
- [ ] Know that this is suitable for internal/demo use, not public production

### Step 3: Clean Up Sensitive Files

Ensure `.env.local` is NOT committed:

```bash
# Check what will be committed
git status

# If .env.local appears, ensure it's in .gitignore
cat .gitignore | grep "\.local"
```

---

## Part 2: Push to GitHub

### Option A: New Repository

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: IIC Static Code Reviewer"

# Create a new repository on GitHub (via web interface)
# Then connect and push:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### Option B: Existing Repository

```bash
# Add and commit changes
git add .
git commit -m "Update: Security improvements and deployment config"
git push
```

### Verify GitHub Push

1. Go to `https://github.com/YOUR_USERNAME/YOUR_REPO_NAME`
2. Check that files are there
3. **CRITICAL:** Verify `.env.local` is NOT visible (should be gitignored)

---

## Part 3: Deploy to Vercel

### Method 1: Vercel Dashboard (Recommended for First Deploy)

1. **Go to Vercel**
   - Visit: