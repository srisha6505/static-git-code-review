# IIC Static Code Reviewer 🚀

A powerful AI-powered code review tool that analyzes GitHub repositories and generates comprehensive code reviews using Google's Gemini AI.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/react-19.2.0-61dafb.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.8.2-blue.svg)

## ✨ Features

- 🔍 **GitHub Repository Analysis** - Analyze any public GitHub repository
- 🤖 **AI-Powered Reviews** - Generate comprehensive code reviews using Gemini AI
- 📊 **Repository Insights** - View commits, contributors, languages, and file structure
- 🔑 **API Key Management** - Securely manage multiple GitHub and Gemini API keys
- 🎨 **Modern UI** - Beautiful dark-themed interface with real-time updates
- ⚡ **Fast & Responsive** - Built with Vite and React for optimal performance
- 🔒 **Authentication** - Protected access with JWT-based authentication

## 🎯 Live Demo

**Repository:** [https://github.com/srisha6505/static-git-code-review](https://github.com/srisha6505/static-git-code-review)

## 📸 Screenshots

### Login Screen
Clean authentication interface with JWT security.

### Dashboard
Analyze repositories, view commits, files, and generate AI reviews.

### Code Review
Stream real-time AI-generated code reviews with detailed insights.

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ installed
- GitHub account
- Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)

### Local Development

```bash
# Clone the repository
git clone https://github.com/srisha6505/static-git-code-review.git
cd static-git-code-review

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Add your GitHub token to .env.local
# VITE_GITHUB_TOKEN=ghp_your_token_here

# Start development server
npm run dev

# Visit http://localhost:3000
```

### Login Credentials

```
Username: iic_admin
Password: iicbicepadminpassword
```

## 🔧 Environment Variables

Create a `.env.local` file in the project root:

```env
# GitHub API Token (read-only access to public repositories)
VITE_GITHUB_TOKEN=ghp_your_github_personal_access_token

# Note: Gemini API keys are added via the UI after login
# This keeps them more secure and allows multiple keys
```

### Getting API Keys

**GitHub Personal Access Token:**
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scope: `public_repo` (read-only)
4. Copy the token (starts with `ghp_`)

**Gemini API Key:**
1. Visit https://aistudio.google.com/apikey
2. Create or select a project
3. Click "Create API Key"
4. Copy the key (starts with `AIza`)

## 🏗️ Tech Stack

- **Frontend Framework:** React 19.2.0
- **Build Tool:** Vite 6.2.0
- **Language:** TypeScript 5.8.2
- **AI Model:** Google Gemini API
- **Styling:** Tailwind CSS (via CDN)
- **Icons:** Lucide React
- **Charts:** Recharts
- **Markdown:** React Markdown

## 📁 Project Structure

```
static_code_reviewer/
├── components/          # React components
│   ├── Button.tsx      # Reusable button component
│   ├── Dashboard.tsx   # Main dashboard interface
│   ├── LoginForm.tsx   # Authentication form
│   └── Sidebar.tsx     # Navigation sidebar
├── services/           # API services
│   ├── geminiService.ts    # Gemini AI integration
│   ├── githubService.ts    # GitHub API integration
│   └── keyManager.ts       # API key management
├── App.tsx             # Main app component
├── index.tsx           # App entry point
├── constants.ts        # App constants
├── types.ts            # TypeScript type definitions
├── vite.config.ts      # Vite configuration
├── package.json        # Dependencies
├── SECURITY.md         # Security documentation
└── DEPLOYMENT.md       # Deployment guide
```

## 🎨 Features Deep Dive

### Repository Analysis
- Fetch repository metadata (stars, forks, language breakdown)
- Display recent commits with additions/deletions
- Show file tree structure
- Render README.md preview
- List contributors with avatar images
- Visualize language distribution

### AI Code Review
- Stream real-time review generation
- Analyze code quality, patterns, and best practices
- Identify potential issues and security concerns
- Provide actionable recommendations
- Support for multiple programming languages

### Key Management
- Add/remove GitHub and Gemini API keys
- Automatic key rotation on rate limits
- Obfuscated storage in LocalStorage
- Support for multiple keys per service

## 🔒 Security

⚠️ **Important Security Notice**

This application has known security limitations:

1. **Client-Side Authentication** - Credentials are hardcoded in the frontend
2. **API Key Storage** - Keys stored in browser LocalStorage (obfuscated)
3. **No Backend** - All logic runs in the browser

**Current Status:** Suitable for **internal use** or **demonstrations only**

For production deployment, see **[SECURITY.md](SECURITY.md)** for:
- Detailed security warnings
- Recommended architecture improvements
- Best practices for API key management
- Production deployment guidelines

## 📦 Build & Deploy

### Build for Production

```bash
# Build the app
npm run build

# Preview production build locally
npm run preview
```

### Deploy to Vercel

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for complete deployment instructions.

**Quick Deploy:**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/srisha6505/static-git-code-review)

**Manual Deploy:**
1. Push code to GitHub
2. Import project in Vercel
3. Add `VITE_GITHUB_TOKEN` environment variable
4. Deploy

## 🧪 Testing

```bash
# Run linter
npm run lint

# Type check
npx tsc --noEmit

# Build test
npm run build
```

## 🐛 Troubleshooting

### GitHub Rate Limit Errors
**Solution:** Add a GitHub Personal Access Token with `public_repo` scope.

### Gemini API Errors
**Solution:** Add valid Gemini API key via the UI (click key icon in sidebar).

### Build Failures
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Login Issues
- Ensure credentials: `iic_admin` / `iicbicepadminpassword`
- Clear browser cache and cookies
- Try incognito/private browsing

## 📊 API Rate Limits

| Service | Unauthenticated | Authenticated |
|---------|----------------|---------------|
| GitHub API | 60 req/hour | 5,000 req/hour |
| Gemini API | N/A | Based on your quota |

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- [Google Gemini](https://ai.google.dev/) - AI model for code review
- [GitHub API](https://docs.github.com/en/rest) - Repository data
- [Vercel](https://vercel.com) - Hosting and deployment
- [Vite](https://vitejs.dev/) - Build tool
- [React](https://react.dev/) - UI framework

## 📞 Support

- **Issues:** [GitHub Issues](https://github.com/srisha6505/static-git-code-review/issues)
- **Documentation:** See [SECURITY.md](SECURITY.md) and [DEPLOYMENT.md](DEPLOYMENT.md)

## 🗺️ Roadmap

- [ ] Backend API proxy for secure key management
- [ ] Real server-side authentication
- [ ] Support for private repositories
- [ ] Multiple AI model providers
- [ ] Code quality metrics and trends
- [ ] Export reviews as PDF/Markdown
- [ ] Team collaboration features
- [ ] Webhook integration for automated reviews

## 📈 Version History

- **v1.0.0** (2024) - Initial release
  - GitHub repository analysis
  - AI-powered code reviews
  - Key management system
  - Dark-themed UI
  - Authentication system

---

**Built with ❤️ for better code reviews**

⭐ Star this repo if you find it helpful!