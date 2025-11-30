/**
 * Pull request list component for displaying repository PRs.
 * @module components/features/repository/PullRequestList
 */

import React from 'react';
import { Bot, GitPullRequest } from 'lucide-react';
import { PullRequest, AIAnalysisResult } from '../../../types';

/**
 * PullRequestList component props.
 */
interface PullRequestListProps {
  /** Array of pull requests to display */
  pullRequests: PullRequest[];
  /** Optional AI analysis result with PR summaries */
  aiAnalysis?: AIAnalysisResult | null;
}

/**
 * Displays a list of pull requests with status and optional AI summaries.
 * Shows PR number, title, author, state, and AI-generated summary if available.
 * 
 * @param props.pullRequests - Array of PullRequest objects
 * @param props.aiAnalysis - Optional analysis result containing PR summaries
 * 
 * @example
 * <PullRequestList pullRequests={repoPRs} aiAnalysis={analysisResult} />
 */
export const PullRequestList: React.FC<PullRequestListProps> = ({ pullRequests, aiAnalysis }) => {
  if (pullRequests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[hsl(var(--text-dim))]">
        <GitPullRequest size={32} className="mb-2 opacity-20" />
        <p>No recent pull requests found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pullRequests.map(pr => {
        const summary = aiAnalysis?.prSummaries?.[pr.number];
        return (
          <div key={pr.id} className="p-4 bg-[hsl(var(--bg))] border border-[hsl(var(--surface-2))] rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <div className="font-medium text-[hsl(var(--text-main))] text-sm">#{pr.number} {pr.title}</div>
              <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold ${
                pr.state === 'open' ? 'bg-green-900 text-green-200' : 'bg-purple-900 text-purple-200'
              }`}>
                {pr.state}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[hsl(var(--text-dim))]">
              <img src={pr.user.avatar_url} alt={pr.user.login} className="w-4 h-4 rounded-full" />
              <span>{pr.user.login}</span>
            </div>
            {summary && (
              <div className="mt-3 text-sm text-[hsl(var(--text-main))] bg-[hsl(var(--surface-2))]/30 p-3 rounded border-l-2 border-[hsl(var(--primary))] leading-relaxed">
                <Bot size={14} className="inline mr-2 text-[hsl(var(--primary))]" /> 
                {summary}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
