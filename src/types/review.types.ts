/**
 * Types for AI review functionality and analysis results.
 * @module types/review
 */

import { RepoInfo, Commit, PullRequest, FileNode, Contributor } from './github.types';

/**
 * Data structure sent to the AI for code review analysis.
 * Contains all repository information needed for analysis.
 */
export interface ReviewRequestData {
  /** Repository metadata */
  repo: RepoInfo;
  /** Recent commits */
  commits: Commit[];
  /** Pull requests */
  pullRequests: PullRequest[];
  /** Repository files */
  files: FileNode[];
  /** Repository contributors */
  contributors: Contributor[];
  /** Language breakdown (language name -> bytes) */
  languages: Record<string, number>;
  /** README content */
  readme: string | null;
}

/**
 * Result structure from AI analysis.
 * Contains scores and summaries for commits and PRs.
 */
export interface AIAnalysisResult {
  /** Token usage information from the AI model */
  tokenUsage?: {
    /** Input tokens consumed */
    input: number;
    /** Output tokens generated */
    output: number;
    /** Total tokens used */
    total: number;
  };
  /** Quality and analysis scores (0-100) */
  scores: {
    /** Overall code quality score */
    quality: number;
    /** Security assessment score */
    security: number;
    /** Reliability/stability score */
    reliability: number;
    /** How well tech stack matches project goals */
    techStackSuitability: number;
    /** Work distribution among contributors */
    teamBalance: number;
    /** Quality of commit messages and practices */
    commitQuality: number;
    /** Quality of pull request descriptions */
    prQuality: number;
    /** Code organization and structure quality */
    structureQuality: number;
  };
  /** AI-generated summaries for each commit (SHA -> description) */
  commitSummaries: Record<string, string>;
  /** AI-generated summaries for each PR (PR number -> description) */
  prSummaries: Record<string, string>;
}
