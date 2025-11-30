/**
 * Repository section cards component.
 * Displays the summary cards for branches, contributors, and languages.
 * @module components/features/repository/RepoSectionCards
 */

import React from 'react';
import { GitBranch, Users, Layers } from 'lucide-react';
import { Button } from '../../ui/Button';
import { SpeedGauge } from '../../ui/SpeedGauge';
import { LanguageBar } from './LanguageBar';
import { Branch, Contributor, AIAnalysisResult } from '../../../types';

/**
 * RepoSectionCards component props.
 */
interface RepoSectionCardsProps {
  /** Repository branches */
  branches: Branch[];
  /** Repository contributors */
  contributors: Contributor[];
  /** Language breakdown */
  languages: Record<string, number>;
  /** AI analysis result with scores */
  aiAnalysis: AIAnalysisResult | null;
  /** Callback to show branches modal */
  onShowBranches: () => void;
  /** Callback to show contributors modal */
  onShowContributors: () => void;
}

/**
 * Renders the summary card section for branches, contributors, and languages.
 * 
 * @param props - Component props
 */
export const RepoSectionCards: React.FC<RepoSectionCardsProps> = ({
  branches,
  contributors,
  languages,
  aiAnalysis,
  onShowBranches,
  onShowContributors,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Branches Card */}
      <div className="bg-[hsl(var(--surface-1))] border border-[hsl(var(--surface-2))] rounded-xl p-4 shadow-sm flex flex-col h-[200px]">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <GitBranch size={16} className="text-[hsl(var(--primary))]"/> Branches
          </h3>
          <span className="text-[10px] font-mono bg-[hsl(var(--surface-2))] px-1.5 py-0.5 rounded">{branches.length}</span>
        </div>
        <div className="flex-1 overflow-hidden space-y-1">
          {branches.slice(0, 3).map(b => (
            <a key={b.name} href={b.html_url} target="_blank" rel="noreferrer" className="block p-1.5 bg-[hsl(var(--bg))] border border-[hsl(var(--surface-2))] rounded text-xs font-mono truncate text-[hsl(var(--text-dim))] hover:text-[hsl(var(--primary))] hover:border-[hsl(var(--primary))] transition-colors">
              {b.name}
            </a>
          ))}
        </div>
        <Button variant="secondary" className="w-full mt-2 h-8 text-xs" onClick={onShowBranches}>View All</Button>
      </div>

      {/* Contributors Card */}
      <div className="bg-[hsl(var(--surface-1))] border border-[hsl(var(--surface-2))] rounded-xl p-4 shadow-sm flex flex-col h-[200px]">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <Users size={16} className="text-[hsl(var(--primary))]"/> Contributors
          </h3>
          {aiAnalysis?.scores.teamBalance !== undefined && (
            <div className="scale-75 origin-right">
              <SpeedGauge label="Balance" score={aiAnalysis.scores.teamBalance} size="sm" />
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-wrap content-start gap-2 overflow-hidden">
          {contributors.slice(0, 8).map(c => (
            <img key={c.id} src={c.avatar_url} title={c.login} alt={c.login} className="w-8 h-8 rounded-full border border-[hsl(var(--surface-2))]" />
          ))}
          {contributors.length > 8 && (
            <div className="w-8 h-8 rounded-full bg-[hsl(var(--surface-2))] flex items-center justify-center text-[10px] text-[hsl(var(--text-dim))]">
              +{contributors.length - 8}
            </div>
          )}
        </div>
        <Button variant="secondary" className="w-full mt-2 h-8 text-xs" onClick={onShowContributors}>View All</Button>
      </div>

      {/* Languages Card */}
      <div className="bg-[hsl(var(--surface-1))] border border-[hsl(var(--surface-2))] rounded-xl p-4 shadow-sm flex flex-col h-[200px]">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-bold text-sm flex items-center gap-2">
            <Layers size={16} className="text-[hsl(var(--primary))]"/> Languages
          </h3>
          {aiAnalysis?.scores.techStackSuitability !== undefined && (
            <div className="scale-75 origin-right">
              <SpeedGauge label="Tech Fit" score={aiAnalysis.scores.techStackSuitability} size="sm" />
            </div>
          )}
        </div>
        <div className="flex-1 overflow-hidden">
          <LanguageBar languages={languages} />
        </div>
      </div>
    </div>
  );
};
