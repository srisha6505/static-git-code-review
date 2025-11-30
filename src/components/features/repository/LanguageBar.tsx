/**
 * Language bar component for displaying repository language breakdown.
 * @module components/features/repository/LanguageBar
 */

import React from 'react';
import { getLangColor } from '../../../constants';

/**
 * LanguageBar component props.
 */
interface LanguageBarProps {
  /** Language breakdown (language name -> bytes) */
  languages: Record<string, number>;
}

/**
 * Displays a visual breakdown of repository languages.
 * Shows a color-coded bar and legend with language names.
 * 
 * @param props.languages - Object mapping language names to byte counts
 * 
 * @example
 * <LanguageBar languages={{ TypeScript: 5000, JavaScript: 3000 }} />
 */
export const LanguageBar: React.FC<LanguageBarProps> = ({ languages }) => {
  const total = (Object.values(languages) as number[]).reduce((a, b) => a + b, 0);

  return (
    <div>
      <div className="flex h-3 w-full rounded-full overflow-hidden mb-3 bg-[hsl(var(--surface-2))]">
        {Object.keys(languages).map(lang => {
          const percent = (languages[lang] / total) * 100;
          return (
            <div 
              key={lang} 
              style={{ width: `${percent}%`, backgroundColor: getLangColor(lang) }} 
            />
          );
        })}
      </div>
      <div className="flex flex-wrap gap-1.5 overflow-y-auto max-h-[80px] custom-scrollbar content-start">
        {Object.keys(languages).slice(0, 8).map(lang => (
          <span 
            key={lang} 
            className="text-[10px] px-1.5 py-0.5 rounded bg-[hsl(var(--bg))] border border-[hsl(var(--surface-2))] text-[hsl(var(--text-dim))] flex items-center gap-1"
          >
            <span 
              className="w-1.5 h-1.5 rounded-full" 
              style={{ backgroundColor: getLangColor(lang) }}
            />
            {lang}
          </span>
        ))}
      </div>
    </div>
  );
};
