/**
 * Contributor list component for displaying repository contributors.
 * @module components/features/repository/ContributorList
 */

import React from 'react';
import { Contributor } from '../../../types';

/**
 * ContributorList component props.
 */
interface ContributorListProps {
  /** Array of contributors to display */
  contributors: Contributor[];
  /** Total number of commits in the repository */
  totalCommits: number;
}

/**
 * Displays a list of contributors with their contribution stats.
 * Shows avatar, username, commit count, and percentage bar.
 * 
 * @param props.contributors - Array of Contributor objects
 * @param props.totalCommits - Total commits for percentage calculation
 * 
 * @example
 * <ContributorList contributors={repoContributors} totalCommits={100} />
 */
export const ContributorList: React.FC<ContributorListProps> = ({ contributors, totalCommits }) => {
  return (
    <div className="space-y-3">
      {contributors.map(c => {
        const percent = ((c.contributions / totalCommits) * 100).toFixed(1);
        return (
          <a 
            key={c.id} 
            href={c.html_url} 
            target="_blank" 
            rel="noreferrer" 
            className="flex items-center justify-between p-3 rounded-lg bg-[hsl(var(--bg))] border border-[hsl(var(--surface-2))] hover:border-[hsl(var(--primary))] transition-colors group"
          >
            <div className="flex items-center gap-3">
              <img src={c.avatar_url} alt={c.login} className="w-10 h-10 rounded-full border border-[hsl(var(--surface-2))]" />
              <div>
                <div className="font-bold text-[hsl(var(--text-main))]">{c.login}</div>
                <div className="text-xs text-[hsl(var(--text-dim))]">{c.contributions} commits</div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="font-mono text-[hsl(var(--primary))] font-bold">{percent}%</span>
              <div className="w-24 h-1.5 bg-[hsl(var(--surface-2))] rounded-full mt-1 overflow-hidden">
                <div className="h-full bg-[hsl(var(--primary))]" style={{ width: `${percent}%` }}></div>
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
};
