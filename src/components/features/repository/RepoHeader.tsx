/**
 * Repository header component for displaying repo info and actions.
 * @module components/features/repository/RepoHeader
 */

import React from 'react';
import { Github, Activity, Book, Zap, RefreshCw, Layout, Bot } from 'lucide-react';
import { Button } from '../../ui/Button';
import { SpeedGauge } from '../../ui/SpeedGauge';
import { RepoInfo, AIAnalysisResult } from '../../../types';

/**
 * RepoHeader component props.
 */
interface RepoHeaderProps {
  /** Repository information */
  repoInfo: RepoInfo;
  /** Optional AI analysis result with scores */
  aiAnalysis: AIAnalysisResult | null;
  /** Token usage metadata */
  usageMetadata: { input: number; output: number; total: number } | null;
  /** Whether AI review is in progress */
  isReviewing: boolean;
  /** Whether review markdown is available */
  hasReviewMarkdown: boolean;
  /** Callback to start/restart AI review */
  onReview: () => void;
  /** Callback to open review sidebar */
  onOpenSidebar: () => void;
  /** Callback to reset/change repository */
  onReset: () => void;
  /** Callback to show README modal */
  onShowReadme: () => void;
}

/**
 * Header section for loaded repository with info, actions, and score gauges.
 * Shows repository details, action buttons, and AI scores when available.
 * 
 * @param props - Component props
 * 
 * @example
 * <RepoHeader
 *   repoInfo={repoData}
 *   aiAnalysis={analysis}
 *   usageMetadata={usage}
 *   isReviewing={false}
 *   hasReviewMarkdown={true}
 *   onReview={handleReview}
 *   onOpenSidebar={() => setSidebarOpen(true)}
 *   onReset={handleReset}
 *   onShowReadme={() => setShowReadme(true)}
 * />
 */
export const RepoHeader: React.FC<RepoHeaderProps> = ({
  repoInfo,
  aiAnalysis,
  usageMetadata,
  isReviewing,
  hasReviewMarkdown,
  onReview,
  onOpenSidebar,
  onReset,
  onShowReadme,
}) => {
  return (
    <div className="bg-[hsl(var(--surface-1))] border border-[hsl(var(--surface-2))] rounded-xl p-4 shadow-lg relative overflow-hidden flex flex-col gap-4">
      
      {/* Top: Repo Info + Actions */}
      <div className="flex flex-col md:flex-row justify-between gap-4 relative z-10 border-b border-[hsl(var(--surface-2))] pb-4">
        <div className="flex gap-4 items-center">
          <img 
            src={repoInfo.owner.avatar_url} 
            alt={repoInfo.owner.login} 
            className="w-16 h-16 rounded-xl border border-[hsl(var(--surface-2))] shadow-sm" 
          />
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-[hsl(var(--text-main))]">{repoInfo.full_name}</h1>
              <Button variant="secondary" onClick={onShowReadme} className="h-7 px-2 text-xs">
                <Book size={14} className="mr-1" /> Readme
              </Button>
            </div>
            <p className="text-[hsl(var(--text-dim))] text-sm max-w-xl truncate">{repoInfo.description}</p>
            <div className="flex gap-4 mt-2">
              <a 
                href={repoInfo.html_url} 
                target="_blank" 
                rel="noreferrer" 
                className="text-xs flex items-center gap-1 text-[hsl(var(--primary))] hover:underline"
              >
                <Github size={12} /> GitHub
              </a>
              <div className="text-xs flex items-center gap-1 text-[hsl(var(--text-dim))]">
                <Activity size={12} /> {repoInfo.open_issues_count} issues
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-2 justify-center min-w-[180px]">
          <Button onClick={onReview} isLoading={isReviewing} className="shadow-lg w-full text-sm py-2">
            <Zap size={14} className="mr-2" />
            {aiAnalysis ? 'Re-Analyze Repo' : 'Start AI Review'}
          </Button>
          <div className="flex gap-2">
            {hasReviewMarkdown && (
              <Button variant="secondary" onClick={onOpenSidebar} className="flex-1 text-sm py-2 h-9 px-2">
                <Layout size={14} className="mr-1" /> Report
              </Button>
            )}
            <Button variant="secondary" onClick={onReset} className="flex-1 text-sm py-2 h-9 px-2">
              <RefreshCw size={14} className="mr-1" /> Change
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom: Gauges & Token Info */}
      {aiAnalysis && (
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 animate-in fade-in zoom-in duration-500">
          <div className="flex gap-8 justify-center flex-1">
            <SpeedGauge label="Quality" score={aiAnalysis.scores.quality} size="md" />
            <SpeedGauge label="Security" score={aiAnalysis.scores.security} size="md" />
            <SpeedGauge label="Reliability" score={aiAnalysis.scores.reliability} size="md" />
          </div>
          
          <div className="bg-[hsl(var(--bg))] p-3 rounded-lg border border-[hsl(var(--surface-2))] min-w-[220px] shadow-inner">
            <div className="text-[10px] text-[hsl(var(--text-dim))] uppercase font-bold tracking-wider mb-1 border-b border-[hsl(var(--surface-2))] pb-1">
              Token Usage
            </div>
            <div className="grid grid-cols-2 gap-y-0.5 gap-x-2 text-xs font-mono">
              <span className="text-[hsl(var(--text-dim))]">Input:</span> 
              <span className="text-right text-[hsl(var(--primary))]">{usageMetadata?.input || 0}</span>
              <span className="text-[hsl(var(--text-dim))]">Output:</span>
              <span className="text-right text-[hsl(var(--primary))]">{usageMetadata?.output || 0}</span>
              <span className="font-bold text-[hsl(var(--text-main))] pt-1 border-t border-[hsl(var(--surface-2))]">Total:</span>
              <span className="font-bold text-right pt-1 border-t border-[hsl(var(--surface-2))]">{usageMetadata?.total || 0}</span>
            </div>
          </div>
        </div>
      )}
      
      {!aiAnalysis && (
        <div className="flex items-center justify-center p-4 text-[hsl(var(--text-dim))] text-sm border-2 border-dashed border-[hsl(var(--surface-2))] rounded-lg bg-[hsl(var(--bg))]/30">
          <Bot size={18} className="mr-2 opacity-50" /> 
          <span>Run AI Review to generate scoring gauges.</span>
        </div>
      )}
    </div>
  );
};
