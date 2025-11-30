/**
 * Commit list component for displaying repository commits.
 * @module components/features/repository/CommitList
 */

import React from 'react';
import { Bot } from 'lucide-react';
import { Commit, AIAnalysisResult } from '../../../types';

/**
 * CommitList component props.
 */
interface CommitListProps {
  /** Array of commits to display */
  commits: Commit[];
  /** Optional AI analysis result with commit summaries */
  aiAnalysis?: AIAnalysisResult | null;
}

/**
 * Displays a list of commits with stats and optional AI-generated summaries.
 * Shows commit message, author, date, additions/deletions, and AI summary if available.
 * 
 * @param props.commits - Array of Commit objects
 * @param props.aiAnalysis - Optional analysis result containing commit summaries
 * 
 * @example
 * <CommitList commits={repoCommits} aiAnalysis={analysisResult} />
 */
export const CommitList: React.FC<CommitListProps> = ({ commits, aiAnalysis }) => {
  return (
    <div className="space-y-4">
      {commits.map(commit => (
        <div key={commit.sha} className="p-4 bg-[hsl(var(--bg))] border border-[hsl(var(--surface-2))] rounded-lg">
          <div className="flex justify-between items-start mb-2">
            <div className="font-medium text-[hsl(var(--text-main))] text-sm">{commit.commit.message}</div>
            <a 
              href={commit.html_url} 
              target="_blank" 
              rel="noreferrer"
              className="text-[10px] font-mono bg-[hsl(var(--surface-2))] px-1.5 py-0.5 rounded text-[hsl(var(--text-dim))] hover:text-[hsl(var(--primary))]"
            >
              {commit.sha.substring(0, 7)}
            </a>
          </div>
          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center gap-2 text-xs text-[hsl(var(--text-dim))]">
              <span>{commit.commit.author.name}</span>
              <span>•</span>
              <span>{new Date(commit.commit.author.date).toLocaleDateString()}</span>
            </div>
            <div className="flex gap-2 text-xs font-mono">
              <span className="text-green-500 bg-green-900/10 px-1 rounded">+{commit.stats?.additions || 0}</span>
              <span className="text-red-500 bg-red-900/10 px-1 rounded">-{commit.stats?.deletions || 0}</span>
            </div>
          </div>
          {aiAnalysis?.commitSummaries?.[commit.sha] && (
            <div className="mt-3 text-sm text-[hsl(var(--text-main))] bg-[hsl(var(--surface-2))]/30 p-3 rounded border-l-2 border-[hsl(var(--primary))] leading-relaxed">
              <Bot size={14} className="inline mr-2 text-[hsl(var(--primary))]" /> 
              {aiAnalysis.commitSummaries[commit.sha]}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
