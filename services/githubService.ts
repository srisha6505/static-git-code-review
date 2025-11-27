
import { RepoInfo, Commit, FileNode, Branch, Contributor, PullRequest } from '../types';
import { KeyManager } from './keyManager';
import { normalizeGitHubUrl, parseGitHubUrl as parseGitHubUrlHelper } from '../utils/urlHelpers';

const GITHUB_API_BASE = 'https://api.github.com';

// Wrapper for fetch that handles Key Rotation
const fetchWithRetry = async (url: string, options: RequestInit = {}, attempt = 0): Promise<Response> => {
  const token = KeyManager.getValidKey('github');
  
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  try {
    const response = await fetch(url, { ...options, headers });

    // Handle Rate Limits (403 or 429)
    if (response.status === 403 || response.status === 429) {
      if (token) {
        KeyManager.markRateLimited(token);
        // Retry with new key if available
        if (attempt < 5) { // Max 5 retries
          console.log(`Rate limit hit. Rotating key and retrying (Attempt ${attempt + 1})...`);
          return fetchWithRetry(url, options, attempt + 1);
        }
      }
    }

    return response;
  } catch (error) {
    throw error;
  }
};

export const parseGithubUrl = (url: string): { owner: string; repo: string } | null => {
  return parseGitHubUrlHelper(url);
};

// Helper to fetch architecturally significant file content
const fetchFileContents = async (files: FileNode[]): Promise<FileNode[]> => {
  const interestingExtensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rs', '.java', '.kt', '.swift', '.c', '.cpp', '.h', '.hpp', '.cs', '.rb', '.php', '.vue', '.svelte', '.css', '.scss', '.html', '.json', '.yaml', '.yml', '.md', '.sql', '.graphql'];
  
  // Score files based on architectural significance with flexible pattern matching
  const scoreFile = (file: FileNode): number => {
    let score = 0;
    const path = file.path.toLowerCase();
    const fileName = file.path.split('/').pop()?.toLowerCase() || '';
    const pathParts = path.split('/');
    const depth = pathParts.length;
    
    // === HIGH PRIORITY: Entry points and bootstrapping ===
    // Main application entry points (various naming conventions)
    if (/^(main|index|app|server|start|boot|init|program|entry)\./.test(fileName)) score += 10;
    if (/^__main__|__init__|bootstrap/.test(fileName)) score += 10;
    
    // === CONFIGURATION & SETUP ===
    // Config files at any level
    if (/config|settings|environment|constants|\.config\.|\.env/.test(path)) score += 8;
    if (fileName === 'package.json' || fileName === 'tsconfig.json' || fileName === 'webpack.config.js' || fileName === 'vite.config.ts') score += 9;
    if (fileName.endsWith('.config.js') || fileName.endsWith('.config.ts') || fileName.endsWith('rc.js')) score += 8;
    
    // === ROUTING & API LAYERS ===
    // Flexible routing patterns
    if (/route|router|routing|endpoint/.test(path)) score += 8;
    if (/api|rest|graphql|rpc|grpc/.test(path)) score += 7;
    if (/controller|handler|resolver/.test(path)) score += 7;
    
    // === DATA & BUSINESS LOGIC ===
    // Models, schemas, database related
    if (/model|schema|entity|domain|dto|dao|repository|orm/.test(path)) score += 7;
    if (/database|db|migration|seed/.test(path)) score += 6;
    
    // Services and core business logic
    if (/service|business|logic|manager|provider|use-?case|interactor/.test(path)) score += 7;
    
    // === MIDDLEWARE & CROSS-CUTTING ===
    if (/middleware|interceptor|filter|guard|decorator|plugin/.test(path)) score += 6;
    if (/auth|security|permission|role|access/.test(path)) score += 6;
    
    // === UTILITIES & SHARED CODE ===
    if (/util|helper|common|shared|lib|core|tool/.test(path)) score += 5;
    if (/hook|composable/.test(path)) score += 5; // React/Vue patterns
    
    // === UI COMPONENTS ===
    // Framework-specific component patterns
    if ((path.endsWith('.tsx') || path.endsWith('.jsx') || path.endsWith('.vue') || path.endsWith('.svelte')) && 
        /component|widget|view|page|screen|layout|template/.test(path)) score += 5;
    
    // === ROOT LEVEL BONUS ===
    // Files in root or immediate subdirectories are often important
    if (depth === 1) score += 7; // Root level
    if (depth === 2) score += 4; // One level deep
    
    // === SOURCE DIRECTORY DETECTION ===
    // Common source directories (flexible patterns)
    if (/^(src|app|lib|core|source|packages|modules)\//.test(path)) score += 4;
    
    // Special directories
    if (path.startsWith('backend/') || path.startsWith('frontend/') || path.startsWith('server/') || path.startsWith('client/')) score += 3;
    
    // === DOCUMENTATION (README files are valuable) ===
    if (fileName === 'readme.md' || fileName === 'readme') score += 6;
    if (path.includes('docs/') && fileName.endsWith('.md')) score += 3;
    
    // === NEGATIVE SCORING: Things to avoid ===
    // Test files (but don't completely exclude - they show code patterns)
    if (/test|spec|__tests__|\.test\.|\.spec\.|testing/.test(path)) score -= 5;
    if (/mock|fixture|stub|fake/.test(path)) score -= 4;
    
    // Build artifacts and generated code
    if (/dist\/|build\/|out\/|target\/|\.min\.|\.bundle\.|compiled|generated/.test(path)) score -= 10;
    if (/node_modules|vendor|third[_-]?party|external/.test(path)) score -= 15;
    
    // Lock files and caches
    if (/lock\.json|lock\.yaml|-lock\.|\.lock$|cache|\.cache/.test(path)) score -= 10;
    
    // Very large files are often generated
    if (file.size && file.size > 100000) score -= 3; // Penalize files > 100KB
    
    // === LANGUAGE-SPECIFIC PATTERNS ===
    // Python
    if (path.endsWith('.py') && /__init__|__main__|manage\.py|wsgi|asgi/.test(fileName)) score += 5;
    
    // Java/Kotlin
    if (/\.java$|\.kt$/.test(path) && /Application|Main|Config|Controller|Service|Repository/.test(fileName)) score += 4;
    
    // Go
    if (fileName === 'main.go' || /handler|router|middleware/.test(path) && path.endsWith('.go')) score += 4;
    
    // Rust
    if (fileName === 'main.rs' || fileName === 'lib.rs' || fileName === 'mod.rs') score += 5;
    
    return score;
  };
  
  const sortedFiles = [...files]
    .filter(f => interestingExtensions.some(ext => f.path.endsWith(ext)))
    .map(f => ({ file: f, score: scoreFile(f) }))
    .sort((a, b) => {
      // Sort by score first, then by path depth (shallower first), then alphabetically
      if (b.score !== a.score) return b.score - a.score;
      const depthA = a.file.path.split('/').length;
      const depthB = b.file.path.split('/').length;
      if (depthA !== depthB) return depthA - depthB;
      return a.file.path.localeCompare(b.file.path);
    })
    .slice(0, 20) // Get top 20 most significant files (reduced from 25)
    .map(item => item.file);

  const candidates = sortedFiles;
  const updatedFiles = [...files];

  await Promise.all(candidates.map(async (file) => {
    try {
      const res = await fetchWithRetry(file.url);
      if (res.ok) {
        const data = await res.json();
        if (data.content && data.encoding === 'base64') {
           const content =  decodeURIComponent(escape(atob(data.content.replace(/\s/g, ''))));
           const index = updatedFiles.findIndex(f => f.sha === file.sha);
           if (index !== -1) {
             updatedFiles[index] = { ...updatedFiles[index], content: content.substring(0, 8000) }; 
           }
        }
      }
    } catch (e) {
      console.warn(`Failed to fetch content for ${file.path}`, e);
    }
  }));

  return updatedFiles;
};

// Helper to fetch detailed stats for top commits
const enrichCommitsWithStats = async (commits: Commit[]): Promise<Commit[]> => {
  const topCommits = commits.slice(0, 15);
  const remaining = commits.slice(15);

  const enriched = await Promise.all(topCommits.map(async (c) => {
    try {
      const res = await fetchWithRetry(c.url);
      if (res.ok) {
        const data = await res.json();
        return {
          ...c,
          stats: data.stats,
          filesModified: data.files?.map((f: any) => ({
            filename: f.filename,
            status: f.status,
            patch: f.patch
          }))
        };
      }
      return c;
    } catch (e) {
      return c;
    }
  }));

  return [...enriched, ...remaining];
};

export const fetchRepoDetails = async (owner: string, repo: string): Promise<{
  info: RepoInfo;
  commits: Commit[];
  pullRequests: PullRequest[];
  files: FileNode[];
  branches: Branch[];
  contributors: Contributor[];
  readme: string | null;
  languages: Record<string, number>;
}> => {

  // 1. Fetch Repo Info
  const infoRes = await fetchWithRetry(`${GITHUB_API_BASE}/repos/${owner}/${repo}`);
  
  if (infoRes.status === 403 || infoRes.status === 429) {
    throw new Error('GitHub API rate limit exceeded. Please add more tokens in Settings.');
  }
  
  if (!infoRes.ok) throw new Error('Repository not found or private');
  const info: RepoInfo = await infoRes.json();

  // Check if repository is empty (no default branch)
  const isEmpty = !info.default_branch;
  
  // Helper for parallel fetching - skip tree/commits if repo is empty
  const [commitsRes, pullsRes, branchesRes, contributorsRes, treeRes, readmeRes, langsRes] = await Promise.all([
    isEmpty ? Promise.resolve(null) : fetchWithRetry(`${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?per_page=30`), 
    fetchWithRetry(`${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls?state=all&per_page=10`),
    fetchWithRetry(`${GITHUB_API_BASE}/repos/${owner}/${repo}/branches?per_page=50`),
    isEmpty ? Promise.resolve(null) : fetchWithRetry(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contributors?per_page=50`),
    isEmpty ? Promise.resolve(null) : fetchWithRetry(`${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${info.default_branch}?recursive=1`),
    fetchWithRetry(`${GITHUB_API_BASE}/repos/${owner}/${repo}/readme`),
    fetchWithRetry(`${GITHUB_API_BASE}/repos/${owner}/${repo}/languages`)
  ]);

  const rawCommits: Commit[] = commitsRes?.ok ? await commitsRes.json() : [];
  const pullRequests: PullRequest[] = pullsRes.ok ? await pullsRes.json() : [];
  const branchesData = branchesRes.ok ? await branchesRes.json() : [];
  const contributors: Contributor[] = contributorsRes?.ok ? await contributorsRes.json() : [];
  const treeData = treeRes?.ok ? await treeRes.json() : {};
  const languages = langsRes.ok ? await langsRes.json() : {};
  
  const commits = await enrichCommitsWithStats(rawCommits);

  const branches: Branch[] = Array.isArray(branchesData) ? branchesData.map((b: any) => ({
    ...b,
    html_url: `https://github.com/${owner}/${repo}/tree/${b.name}`
  })) : [];

  let files: FileNode[] = (treeData.tree || [])
    .filter((node: FileNode) => node.type === 'blob')
    .slice(0, 300)
    .map((node: FileNode) => ({
      ...node,
      html_url: `https://github.com/${owner}/${repo}/blob/${info.default_branch}/${node.path}`
    }));
  
  files = await fetchFileContents(files);

  let readme = null;
  if (readmeRes.ok) {
    const readmeData = await readmeRes.json();
    if (readmeData.content && readmeData.encoding === 'base64') {
      try {
        readme = decodeURIComponent(escape(atob(readmeData.content.replace(/\s/g, ''))));
      } catch (e) {
        console.error("Failed to decode readme", e);
      }
    }
  }

  return { info, commits, pullRequests, files, branches, contributors, readme, languages };
};