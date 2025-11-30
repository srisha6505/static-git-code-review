# IIC Reviews

AI-powered GitHub repository code review tool that provides comprehensive analysis of code quality, security, structure, and team collaboration patterns.

## Features

- **Repository Analysis**: Fetches and displays repository metadata, commits, pull requests, contributors, and file structure
- **AI Code Review**: Uses Google Gemini AI to generate detailed code reviews with scoring
- **Score Gauges**: Visual representation of code quality, security, reliability, and other metrics
- **Dark/Light Theme**: Toggle between dark and light modes
- **Key Management**: Secure local storage of API keys with automatic key rotation on rate limits

## Project Structure

```
src/
├── api/                      # API layer
│   ├── github/              # GitHub API client and endpoints
│   │   ├── client.ts        # HTTP client with retry logic
│   │   ├── endpoints.ts     # API endpoint functions
│   │   ├── types.ts         # GitHub API response types
│   │   └── index.ts
│   ├── gemini/              # Gemini AI client
│   │   ├── client.ts        # Streaming review generator
│   │   ├── prompts.ts       # Prompt templates
│   │   └── index.ts
│   └── index.ts
│
├── components/               # React components
│   ├── ui/                  # Reusable UI primitives
│   │   ├── Button.tsx       # Button with variants
│   │   ├── Modal.tsx        # Modal dialog
│   │   ├── SpeedGauge.tsx   # Circular progress gauge
│   │   └── index.ts
│   ├── layout/              # Layout components
│   │   ├── Header.tsx       # App header/navbar
│   │   ├── Sidebar.tsx      # Review sidebar
│   │   └── index.ts
│   └── features/            # Feature-specific components
│       ├── auth/            # Authentication
│       │   └── LoginForm.tsx
│       ├── repository/      # Repository display
│       │   ├── BranchList.tsx
│       │   ├── CommitList.tsx
│       │   ├── ContributorList.tsx
│       │   ├── FileTree.tsx
│       │   ├── LanguageBar.tsx
│       │   ├── PullRequestList.tsx
│       │   ├── RepoHeader.tsx
│       │   └── index.ts
│       ├── review/          # Review components
│       │   └── index.ts
│       └── settings/        # Settings
│           ├── KeyManagerModal.tsx
│           └── index.ts
│
├── hooks/                    # Custom React hooks
│   ├── useAuth.ts           # Authentication state
│   ├── useKeyManager.ts     # API key management
│   ├── useRepository.ts     # Repository data fetching
│   ├── useReview.ts         # AI review state
│   ├── useTheme.ts          # Theme toggle
│   └── index.ts
│
├── lib/                      # Utility libraries
│   ├── colors.ts            # Color utilities
│   ├── fileTree.ts          # File tree builder
│   ├── keyVault.ts          # Secure key storage
│   └── urlParser.ts         # GitHub URL parser
│
├── types/                    # TypeScript types
│   ├── github.types.ts      # GitHub API types
│   ├── keys.types.ts        # Key management types
│   ├── review.types.ts      # Review types
│   ├── ui.types.ts          # UI state types
│   └── index.ts
│
├── constants/                # Application constants
│   ├── config.ts            # App configuration
│   ├── theme.ts             # Theme colors
│   └── index.ts
│
├── pages/                    # Page components
│   └── Dashboard.tsx        # Main dashboard
│
├── App.tsx                   # Root component
└── main.tsx                  # Entry point
```

## Setup Instructions

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/static-git-code-review.git
cd static-git-code-review
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file (optional):
```bash
# Create .env file in project root
touch .env
```

4. Start development server:
```bash
npm run dev
```

5. Open http://localhost:3000 in your browser

## Environment Variables

All environment variables use the `VITE_` prefix for Vite compatibility:

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_ADMIN_USER` | Admin username for login | Yes |
| `VITE_ADMIN_PASS` | Admin password for login | Yes |
| `VITE_GITHUB_TOKEN` | GitHub personal access token | No* |
| `VITE_GEMINI_API_KEY` | Google Gemini API key | No* |

*API keys can also be added through the in-app Settings → Key Manager.

### Example .env file:
```env
VITE_ADMIN_USER=admin
VITE_ADMIN_PASS=your-secure-password
VITE_GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
VITE_GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxx
```

## API Key Configuration

API keys can be configured in two ways:

### 1. Environment Variables
Add keys to your `.env` file (they will be loaded automatically):
- `VITE_GITHUB_TOKEN`: For GitHub API access
- `VITE_GEMINI_API_KEY`: For AI code review

### 2. In-App Key Manager
1. Click the Settings icon in the header
2. Add keys with a name and the actual token
3. Keys are stored securely in your browser's local storage
4. Multiple keys can be added for automatic rotation on rate limits

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## Architecture

### API Layer
The `api/` directory contains all external API interactions:
- **GitHub Client**: Handles API requests with retry logic and key rotation
- **Gemini Client**: Streaming AI response generation

### Hooks
Custom hooks encapsulate state management logic:
- **useAuth**: Authentication state and handlers
- **useRepository**: Repository data fetching and state
- **useReview**: AI review generation state
- **useTheme**: Theme toggling
- **useKeyManager**: API key management

### Components
Components are organized by type:
- **UI Components**: Reusable primitives (Button, Modal, SpeedGauge)
- **Layout Components**: Page structure (Header, Sidebar)
- **Feature Components**: Domain-specific components grouped by feature

## Technology Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling (via CDN)
- **Lucide React** - Icons
- **React Markdown** - Markdown rendering
- **Google GenAI** - AI code review

## License

MIT
