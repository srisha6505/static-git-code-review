
export interface RepoInfo {
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  default_branch: string;
  owner: {
    avatar_url: string;
    login: string;
  };
}

export interface Commit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  html_url: string;
  url: string; // API URL for fetching details
  stats?: {
    additions: number;
    deletions: number;
    total: number;
  };
  filesModified?: {
    filename: string;
    status: string;
    patch?: string; // The diff
  }[];
}

export interface PullRequest {
  id: number;
  number: number;
  title: string;
  user: {
    login: string;
    avatar_url: string;
  };
  html_url: string;
  state: string;
  created_at: string;
  body: string | null;
}

export interface FileNode {
  path: string;
  mode: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  url: string;
  html_url?: string;
  content?: string; // Content of the file for analysis
}

export interface Branch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  html_url?: string;
}

export interface Contributor {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  contributions: number;
}

export interface ReviewRequestData {
  repo: RepoInfo;
  commits: Commit[];
  pullRequests: PullRequest[];
  files: FileNode[];
  contributors: Contributor[];
  languages: Record<string, number>;
  readme: string | null;
}

export interface AIAnalysisResult {
  tokenUsage?: {
    input: number;
    output: number;
    total: number;
  };
  scores: {
    // Top cards
    quality: number;
    security: number;
    reliability: number;
    
    // Section specific gauges
    techStackSuitability: number;
    teamBalance: number;
    commitQuality: number;
    prQuality: number;
    structureQuality: number;
  };
  commitSummaries: Record<string, string>; // Map SHA -> Description
  prSummaries: Record<string, string>; // Map PR Number -> Description
}

export interface ManagedKey {
  id: string;
  name: string;
  type: 'github' | 'gemini';
  token: string;
  isRateLimitedUntil?: number;
}

export enum ViewState {
  IDLE = 'IDLE',
  LOADING_REPO = 'LOADING_REPO',
  REPO_LOADED = 'REPO_LOADED',
  ANALYZING = 'ANALYZING',
}

export enum DetailView {
  NONE = 'NONE',
  README = 'README'
}

export interface RepoEntry {
  team_name: string;
  repo_link: string;
}