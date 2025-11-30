/**
 * Application header/navbar component.
 * @module components/layout/Header
 */

import React from 'react';
import { BrainCircuit, Settings, Sun, Moon, LogOut } from 'lucide-react';
import { APP_NAME } from '../../constants';

/**
 * Header component props.
 */
interface HeaderProps {
  /** Current theme ('dark' | 'light') */
  theme: 'dark' | 'light';
  /** Callback to toggle theme */
  onToggleTheme: () => void;
  /** Callback to open settings */
  onOpenSettings: () => void;
  /** Callback to logout */
  onLogout: () => void;
}

/**
 * Application header with branding, theme toggle, settings, and logout.
 * Fixed at top of the page with consistent styling.
 * 
 * @param props.theme - Current theme mode
 * @param props.onToggleTheme - Called when theme toggle is clicked
 * @param props.onOpenSettings - Called when settings button is clicked
 * @param props.onLogout - Called when logout button is clicked
 * 
 * @example
 * <Header
 *   theme="dark"
 *   onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
 *   onOpenSettings={() => setShowSettings(true)}
 *   onLogout={handleLogout}
 * />
 */
export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  onOpenSettings,
  onLogout,
}) => {
  return (
    <header className="h-16 border-b border-[hsl(var(--surface-2))] bg-[hsl(var(--bg))] flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[hsl(var(--primary))] to-indigo-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(124,58,237,0.3)]">
          <BrainCircuit size={20} />
        </div>
        <span className="font-bold tracking-tight text-lg">{APP_NAME}</span>
      </div>
      
      <div className="flex items-center gap-4">
        <button 
          onClick={onOpenSettings} 
          className="p-2 rounded-lg text-[hsl(var(--text-dim))] hover:bg-[hsl(var(--surface-1))] transition-colors"
          title="Settings"
        >
          <Settings size={18} />
        </button>
        <button 
          onClick={onToggleTheme} 
          className="p-2 rounded-lg text-[hsl(var(--text-dim))] hover:bg-[hsl(var(--surface-1))] transition-colors"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <div className="h-4 w-px bg-[hsl(var(--surface-2))]" />
        <button 
          onClick={onLogout} 
          className="text-xs text-[hsl(var(--text-dim))] hover:text-red-400 flex items-center gap-1 transition-colors font-medium"
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </header>
  );
};
