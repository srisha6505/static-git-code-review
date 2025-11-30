/**
 * Custom hook for repository data management.
 * @module hooks/useRepository
 */

import { useState, useCallback } from 'react';
import { 
  RepoInfo, 
  Commit, 
  PullRequest, 
  FileNode, 
  Branch, 
  Contributor, 
  ViewState 
} from '../types';
import { parseGithubUrl, fetchRepoDetails } from '../api';

/**
 * Repository state and handlers.
 */
interface UseRepositoryReturn {
  /** GitHub URL input value */
  url: string;
  /** Set URL input value */
  setUrl: (url: string) => void;
  /** Current view state */
  viewState: ViewState;
  /** Set view state */
  setViewState: (state: ViewState) => void;
  /** Error message if any */
  error: string | null;
  /** Repository info */
  repoInfo: RepoInfo | null;
  /** Repository commits */
  commits: Commit[];
  /** Repository pull requests */
  pullRequests: PullRequest[];
  /** Repository files */
  files: FileNode[];
  /** Repository branches */
  branches: Branch[];
  /** Repository contributors */
  contributors: Contributor[];
  /** README content */
  readme: string | null;
  /** Language breakdown */
  languages: Record<string, number>;
  /** Total commits count from contributors */
  totalCommits: number;
  /** Fetch repository data */
  handleFetch: (e: React.FormEvent) => Promise<void>;
  /** Reset repository state */
  resetRepo: () => void;
}

/**
 * Hook for managing repository data fetching and state.
 * Handles URL parsing, API calls, and data storage.
 * 
 * @returns Repository state and handler functions
 * 
 * @example
 * const { 
 *   url, setUrl, handleFetch, repoInfo, viewState 
 * } = useRepository();
 * 
 * <form onSubmit={handleFetch}>
 *   <input value={url} onChange={e => setUrl(e.target.value)} />
 *   <button type="submit">Fetch</button>
 * </form>
 */
export const useRepository = (): UseRepositoryReturn => {
  const [url, setUrl] = useState('');
  const [viewState, setViewState] = useState<ViewState>(ViewState.IDLE);
  const [error, setError] = useState<string | null>(null);
  
  // Data States
  const [repoInfo, setRepoInfo] = useState<RepoInfo | null>(null);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [pullRequests, setPullRequests] = useState<PullRequest[]>([]);
  const [files, setFiles] = useState<FileNode[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [readme, setReadme] = useState<string | null>(null);
  const [languages, setLanguages] = useState<Record<string, number>>({});

  const totalCommits = contributors.reduce((acc, curr) => acc + curr.contributions, 0);

  /**
   * Fetches repository data from GitHub API.
   */
  const handleFetch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseGithubUrl(url);
    if (!parsed) {
      setError('Invalid GitHub URL. Must be https://github.com/owner/repo');
      return;
    }

    setViewState(ViewState.LOADING_REPO);
    setError(null);
    setRepoInfo(null);

    try {
      const data = await fetchRepoDetails(parsed.owner, parsed.repo);
      setRepoInfo(data.info);
      setCommits(data.commits);
      setPullRequests(data.pullRequests);
      setFiles(data.files);
      setBranches(data.branches);
      setContributors(data.contributors);
      setReadme(data.readme);
      setLanguages(data.languages);
      setViewState(ViewState.REPO_LOADED);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch repository data');
      setViewState(ViewState.IDLE);
    }
  }, [url]);

  /**
   * Resets all repository state.
   */
  const resetRepo = useCallback(() => {
    setRepoInfo(null);
    setUrl('');
    setViewState(ViewState.IDLE);
  }, []);

  return {
    url,
    setUrl,
    viewState,
    setViewState,
    error,
    repoInfo,
    commits,
    pullRequests,
    files,
    branches,
    contributors,
    readme,
    languages,
    totalCommits,
    handleFetch,
    resetRepo,
  };
};
