/**
 * GitHub API response types.
 * @module api/github/types
 */

/**
 * GitHub API tree node response.
 */
export interface GitHubTreeNode {
  path: string;
  mode: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  url: string;
}

/**
 * GitHub API tree response.
 */
export interface GitHubTreeResponse {
  sha: string;
  url: string;
  tree: GitHubTreeNode[];
  truncated: boolean;
}

/**
 * GitHub API file content response.
 */
export interface GitHubFileContentResponse {
  content?: string;
  encoding?: string;
  sha: string;
  size: number;
  url: string;
}

/**
 * GitHub API commit detail response.
 */
export interface GitHubCommitDetailResponse {
  sha: string;
  stats?: {
    additions: number;
    deletions: number;
    total: number;
  };
  files?: {
    filename: string;
    status: string;
    patch?: string;
  }[];
}
