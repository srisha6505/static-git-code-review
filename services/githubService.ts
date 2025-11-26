
import { RepoInfo, Commit, FileNode, Branch, Contributor, PullRequest } from '../types';
import { KeyManager } from './keyManager';

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
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname !== 'github.com') return null;
    const parts = urlObj.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;
    return { owner: parts[0], repo: parts[1] };
  } catch (e) {
    return null;
  }
};

// Helper to fetch architecturally significant file content
const fetchFileContents = async (files: FileNode[]): Promise<FileNode[]> => {
  const interestingExtensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rs', '.java', '.c', '.cpp', '.h', '.css', '.html', '.json', '.md'];
  
  // Score files based on architectural significance
  const scoreFile = (file: FileNode): number => {
    let score = 0;
    const path = file.path.toLowerCase();
    
    // High priority: Entry points, configs, main architecture files
    if (path.includes('main.') || path.includes('index.') || path.includes('app.')) score += 10;
    if (path.includes('config') || path.includes('settings')) score += 8;
    if (path.includes('router') || path.includes('routes')) score += 8;
    if (path.includes('api') || path.includes('service') || path.includes('controller')) score += 7;
    if (path.includes('model') || path.includes('schema') || path.includes('entity')) score += 7;
    if (path.includes('middleware') || path.includes('interceptor')) score += 6;
    if (path.includes('utils') || path.includes('helpers') || path.includes('lib')) score += 5;
    if (path.includes('component') && (path.endsWith('.tsx') || path.endsWith('.jsx'))) score += 5;
    
    // Root level files are often important
    if (file.path.split('/').length === 1) score += 6;
    
    // Source directory files
    if (path.startsWith('src/') || path.startsWith('app/') || path.startsWith('lib/')) score += 4;
    
    // Deduct for test/config files
    if (path.includes('test') || path.includes('spec') || path.includes('.test.') || path.includes('.spec.')) score -= 5;
    if (path.includes('mock') || path.includes('fixture')) score -= 3;
    if (path.includes('dist/') || path.includes('build/') || path.includes('.min.')) score -= 10;
    
    return score;
  };
  
  const sortedFiles = [...files]
    .filter(f => interestingExtensions.some(ext => f.path.endsWith(ext)))
    .filter(f => !f.path.includes('package-lock') && !f.path.includes('yarn.lock') && !f.path.includes('node_modules'))
    .map(f => ({ file: f, score: scoreFile(f) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 20) // Get top 20 most significant files
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

  // Helper for parallel fetching
  const [commitsRes, pullsRes, branchesRes, contributorsRes, treeRes, readmeRes, langsRes] = await Promise.all([
    fetchWithRetry(`${GITHUB_API_BASE}/repos/${owner}/${repo}/commits?per_page=30`), 
    fetchWithRetry(`${GITHUB_API_BASE}/repos/${owner}/${repo}/pulls?state=all&per_page=10`),
    fetchWithRetry(`${GITHUB_API_BASE}/repos/${owner}/${repo}/branches?per_page=50`),
    fetchWithRetry(`${GITHUB_API_BASE}/repos/${owner}/${repo}/contributors?per_page=50`),
    fetchWithRetry(`${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees/${info.default_branch}?recursive=1`),
    fetchWithRetry(`${GITHUB_API_BASE}/repos/${owner}/${repo}/readme`),
    fetchWithRetry(`${GITHUB_API_BASE}/repos/${owner}/${repo}/languages`)
  ]);

  const rawCommits: Commit[] = commitsRes.ok ? await commitsRes.json() : [];
  const pullRequests: PullRequest[] = pullsRes.ok ? await pullsRes.json() : [];
  const branchesData = branchesRes.ok ? await branchesRes.json() : [];
  const contributors: Contributor[] = contributorsRes.ok ? await contributorsRes.json() : [];
  const treeData = treeRes.ok ? await treeRes.json() : {};
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