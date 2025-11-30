/**
 * GitHub API endpoints and data fetching functions.
 * @module api/github/endpoints
 */

import { RepoInfo, Commit, FileNode, Branch, Contributor, PullRequest } from '../../types';
import { fetchWithRetry } from './client';
import { GITHUB_API_BASE } from '../../constants';

// Re-export parseGithubUrl for convenience
export { parseGithubUrl } from '../../lib/urlParser';

/**
 * Result of fetching repository details.
 */
export interface RepoDetailsResult {
  /** Repository metadata */
  info: RepoInfo;
  /** Recent commits with stats */
  commits: Commit[];
  /** Pull requests */
  pullRequests: PullRequest[];
  /** Repository files */
  files: FileNode[];
  /** Branches */
  branches: Branch[];
  /** Contributors */
  contributors: Contributor[];
  /** README content */
  readme: string | null;
  /** Language breakdown */
  languages: Record<string, number>;
}

/** File extensions to fetch content for during analysis */
const INTERESTING_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rs', '.java', '.c', '.cpp', '.h', '.css', '.html', '.json', '.md'];

/** Patterns to exclude from file content fetching */
const EXCLUDED_FILE_PATTERNS = ['package-lock', 'yarn.lock', 'node_modules'];

/**
 * Fetches file contents for selected important files.
 * Prioritizes src/ directory and root-level config files.
 * 
 * @param files - Array of file nodes to potentially fetch
 * @returns Updated files array with content populated
 * @internal
 */
const fetchFileContents = async (files: FileNode[]): Promise<FileNode[]> => {
  const sortedFiles = [...files].sort((a, b) => {
    const aScore = (a.path.startsWith('src/') ? 2 : 0) + (a.path.split('/').length === 1 ? 1 : 0);
    const bScore = (b.path.startsWith('src/') ? 2 : 0) + (b.path.split('/').length === 1 ? 1 : 0);
    return bScore - aScore;
  });

  const candidates = sortedFiles
    .filter(f => INTERESTING_EXTENSIONS.some(ext => f.path.endsWith(ext)))
    .filter(f => !EXCLUDED_FILE_PATTERNS.some(pattern => f.path.includes(pattern)))
    .slice(0, 15);

  const updatedFiles = [...files];

  await Promise.all(candidates.map(async (file) => {
    try {
      const res = await fetchWithRetry(file.url);
      if (res.ok) {
        const data = await res.json();
        if (data.content && data.encoding === 'base64') {
          const content = decodeURIComponent(escape(atob(data.content.replace(/\s/g, ''))));
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

/**
 * Enriches commits with detailed stats (additions, deletions, files changed).
 * Only fetches details for the top 15 commits to limit API calls.
 * 
 * @param commits - Array of commits to enrich
 * @returns Commits with stats populated
 * @internal
 */
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
          filesModified: data.files?.map((f: { filename: string; status: string; patch?: string }) => ({
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

/**
 * Fetches comprehensive repository details from GitHub API.
 * Includes repo info, commits, PRs, files, branches, contributors, readme, and languages.
 * 
 * @param owner - Repository owner (username or organization)
 * @param repo - Repository name
 * @returns Complete repository details
 * 
 * @throws Error if repository not found or rate limit exceeded
 * 
 * @example
 * const details = await fetchRepoDetails('facebook', 'react');
 * console.log(details.info.stargazers_count);
 */
export const fetchRepoDetails = async (owner: string, repo: string): Promise<RepoDetailsResult> => {
  // 1. Fetch Repo Info
  const infoRes = await fetchWithRetry(`${GITHUB_API_BASE}/repos/${owner}/${repo}`);
  
  if (infoRes.status === 403 || infoRes.status === 429) {
    throw new Error('GitHub API rate limit exceeded. Please add more tokens in Settings.');
  }
  
  if (!infoRes.ok) throw new Error('Repository not found or private');
  const info: RepoInfo = await infoRes.json();

  // Parallel fetching for efficiency
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

  const branches: Branch[] = Array.isArray(branchesData) ? branchesData.map((b: Branch) => ({
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
