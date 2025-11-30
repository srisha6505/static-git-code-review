/**
 * GitHub API types for repository information and related entities.
 * @module types/github
 */

/**
 * Repository information returned from GitHub API.
 * Contains basic metadata about a repository including owner details.
 */
export interface RepoInfo {
  /** Repository name (without owner) */
  name: string;
  /** Full repository name including owner (e.g., "owner/repo") */
  full_name: string;
  /** Repository description */
  description: string;
  /** URL to repository on GitHub */
  html_url: string;
  /** Number of stars */
  stargazers_count: number;
  /** Number of forks */
  forks_count: number;
  /** Number of open issues */
  open_issues_count: number;
  /** Default branch name (e.g., "main" or "master") */
  default_branch: string;
  /** Repository owner information */
  owner: {
    /** Owner's avatar URL */
    avatar_url: string;
    /** Owner's username */
    login: string;
  };
}

/**
 * Commit information from GitHub API.
 * Includes commit metadata and optional stats/file changes.
 */
export interface Commit {
  /** Commit SHA hash */
  sha: string;
  /** Commit details */
  commit: {
    /** Commit message */
    message: string;
    /** Author information */
    author: {
      /** Author name */
      name: string;
      /** Commit date as ISO string */
      date: string;
    };
  };
  /** URL to commit on GitHub */
  html_url: string;
  /** API URL for fetching commit details */
  url: string;
  /** Optional commit statistics (additions/deletions) */
  stats?: {
    /** Lines added */
    additions: number;
    /** Lines deleted */
    deletions: number;
    /** Total lines changed */
    total: number;
  };
  /** Optional list of files modified in this commit */
  filesModified?: {
    /** File path */
    filename: string;
    /** Change status (added, modified, deleted) */
    status: string;
    /** The diff patch */
    patch?: string;
  }[];
}

/**
 * Pull request information from GitHub API.
 */
export interface PullRequest {
  /** Pull request ID */
  id: number;
  /** Pull request number */
  number: number;
  /** Pull request title */
  title: string;
  /** User who created the PR */
  user: {
    /** Username */
    login: string;
    /** Avatar URL */
    avatar_url: string;
  };
  /** URL to PR on GitHub */
  html_url: string;
  /** PR state (open, closed, merged) */
  state: string;
  /** Creation date as ISO string */
  created_at: string;
  /** PR description body */
  body: string | null;
}

/**
 * File node in repository tree structure.
 */
export interface FileNode {
  /** File path relative to repository root */
  path: string;
  /** Git mode string */
  mode: string;
  /** Node type: 'blob' for files, 'tree' for directories */
  type: 'blob' | 'tree';
  /** File SHA hash */
  sha: string;
  /** File size in bytes (only for blobs) */
  size?: number;
  /** API URL for file contents */
  url: string;
  /** URL to file on GitHub */
  html_url?: string;
  /** File content (populated for selected files during analysis) */
  content?: string;
}

/**
 * Branch information from GitHub API.
 */
export interface Branch {
  /** Branch name */
  name: string;
  /** Latest commit on this branch */
  commit: {
    /** Commit SHA */
    sha: string;
    /** API URL */
    url: string;
  };
  /** URL to branch on GitHub */
  html_url?: string;
}

/**
 * Contributor information from GitHub API.
 */
export interface Contributor {
  /** Username */
  login: string;
  /** User ID */
  id: number;
  /** Avatar URL */
  avatar_url: string;
  /** Profile URL */
  html_url: string;
  /** Number of contributions (commits) */
  contributions: number;
}
