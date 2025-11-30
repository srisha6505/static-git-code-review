/**
 * Custom hook for AI review management.
 * @module hooks/useReview
 */

import { useState, useCallback } from 'react';
import { RepoInfo, Commit, PullRequest, FileNode, Contributor, AIAnalysisResult, ViewState } from '../types';
import { generateReviewStream } from '../api';

/**
 * Review state and handlers.
 */
interface UseReviewReturn {
  /** Generated markdown content */
  reviewMarkdown: string;
  /** Whether review is in progress */
  isReviewing: boolean;
  /** AI analysis result with scores */
  aiAnalysis: AIAnalysisResult | null;
  /** Token usage metadata */
  usageMetadata: { input: number; output: number; total: number } | null;
  /** Start AI review */
  handleReview: (data: ReviewData) => Promise<void>;
  /** Reset review state */
  resetReview: () => void;
  /** Handle analysis completion */
  handleAnalysisComplete: (result: AIAnalysisResult) => void;
}

/**
 * Data required for review.
 */
interface ReviewData {
  repo: RepoInfo;
  commits: Commit[];
  pullRequests: PullRequest[];
  files: FileNode[];
  contributors: Contributor[];
  languages: Record<string, number>;
  readme: string | null;
}

/**
 * Hook for managing AI code review process.
 * Handles streaming review generation and result parsing.
 * 
 * @param setViewState - Function to update parent view state
 * @param setIsSidebarOpen - Function to control sidebar visibility
 * @returns Review state and handler functions
 * 
 * @example
 * const { reviewMarkdown, isReviewing, handleReview } = useReview(setViewState, setSidebarOpen);
 * 
 * const startReview = () => {
 *   handleReview({ repo: repoInfo, commits, ... });
 * };
 */
export const useReview = (
  setViewState: (state: ViewState) => void,
  setIsSidebarOpen: (open: boolean) => void
): UseReviewReturn => {
  const [reviewMarkdown, setReviewMarkdown] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [usageMetadata, setUsageMetadata] = useState<{ input: number; output: number; total: number } | null>(null);

  /**
   * Starts AI review process.
   */
  const handleReview = useCallback(async (data: ReviewData) => {
    setIsSidebarOpen(true);
    setReviewMarkdown('');
    setIsReviewing(true);
    setViewState(ViewState.ANALYZING);
    setUsageMetadata(null);

    try {
      const stream = generateReviewStream(data);

      for await (const chunk of stream) {
        if (chunk.type === 'text' && chunk.content) {
          setReviewMarkdown(prev => prev + chunk.content);
        } else if (chunk.type === 'usage' && chunk.data) {
          setUsageMetadata(chunk.data);
        }
      }
    } catch {
      setReviewMarkdown(prev => prev + '\n\n**Error encountered during generation.**');
    } finally {
      setIsReviewing(false);
      setViewState(ViewState.REPO_LOADED);
    }
  }, [setViewState, setIsSidebarOpen]);

  /**
   * Resets review state.
   */
  const resetReview = useCallback(() => {
    setAiAnalysis(null);
    setReviewMarkdown('');
    setUsageMetadata(null);
  }, []);

  /**
   * Handles completion of AI analysis parsing.
   */
  const handleAnalysisComplete = useCallback((result: AIAnalysisResult) => {
    setAiAnalysis(prev => ({
      ...result,
      tokenUsage: usageMetadata || undefined
    }));
  }, [usageMetadata]);

  return {
    reviewMarkdown,
    isReviewing,
    aiAnalysis,
    usageMetadata,
    handleReview,
    resetReview,
    handleAnalysisComplete,
  };
};
