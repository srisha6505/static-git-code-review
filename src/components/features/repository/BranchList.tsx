/**
 * Branch list component for displaying repository branches.
 * @module components/features/repository/BranchList
 */

import React from 'react';
import { GitBranch } from 'lucide-react';
import { Branch } from '../../../types';

/**
 * BranchList component props.
 */
interface BranchListProps {
  /** Array of branches to display */
  branches: Branch[];
}

/**
 * Displays a grid of repository branches as clickable links.
 * 
 * @param props.branches - Array of Branch objects
 * 
 * @example
 * <BranchList branches={repositoryBranches} />
 */
export const BranchList: React.FC<BranchListProps> = ({ branches }) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      {branches.map(b => (
        <a 
          key={b.name} 
          href={b.html_url} 
          target="_blank" 
          rel="noreferrer" 
          className="flex items-center gap-2 p-3 rounded-lg bg-[hsl(var(--bg))] border border-[hsl(var(--surface-2))] hover:border-[hsl(var(--primary))] transition-colors group"
        >
          <GitBranch size={16} className="text-[hsl(var(--text-dim))] group-hover:text-[hsl(var(--primary))]" />
          <span className="text-sm font-mono truncate">{b.name}</span>
        </a>
      ))}
    </div>
  );
};
