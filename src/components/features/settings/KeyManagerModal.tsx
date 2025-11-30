/**
 * Key manager modal component for API key management.
 * @module components/features/settings/KeyManagerModal
 */

import React, { useState, useEffect } from 'react';
import { Settings, X, Plus, Github, BrainCircuit, Lock, Trash2, ShieldCheck } from 'lucide-react';
import { Button } from '../../ui/Button';
import { ManagedKey } from '../../../types';
import { KeyManager } from '../../../lib/keyVault';

/**
 * KeyManagerModal component props.
 */
interface KeyManagerModalProps {
  /** Whether the modal is visible */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
}

/**
 * Modal for managing API keys (GitHub tokens and Gemini API keys).
 * Allows adding, viewing (obfuscated), and deleting keys.
 * Shows rate limit status for each key.
 * 
 * @param props.isOpen - Controls modal visibility
 * @param props.onClose - Called when modal should close
 * 
 * @example
 * <KeyManagerModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
 */
export const KeyManagerModal: React.FC<KeyManagerModalProps> = ({ isOpen, onClose }) => {
  const [managedKeys, setManagedKeys] = useState<ManagedKey[]>([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyType, setNewKeyType] = useState<'github' | 'gemini'>('github');
  const [newKeyToken, setNewKeyToken] = useState('');

  // Load keys when modal opens
  useEffect(() => {
    if (isOpen) {
      setManagedKeys(KeyManager.getKeys());
    }
  }, [isOpen]);

  /**
   * Handles adding a new key.
   */
  const handleAddKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (newKeyName && newKeyToken) {
      KeyManager.addKey(newKeyName, newKeyType, newKeyToken);
      setManagedKeys(KeyManager.getKeys());
      setNewKeyName('');
      setNewKeyToken('');
    }
  };

  /**
   * Handles deleting a key.
   */
  const handleDeleteKey = (id: string) => {
    KeyManager.removeKey(id);
    setManagedKeys(KeyManager.getKeys());
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[hsl(var(--surface-1))] border border-[hsl(var(--surface-2))] p-6 rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh]">
        <div className="flex justify-between items-center mb-6 border-b border-[hsl(var(--surface-2))] pb-4">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Settings size={20} className="text-[hsl(var(--primary))]" /> Secure Key Manager
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-[hsl(var(--surface-2))] rounded">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 custom-scrollbar pr-2">
          {/* Add Key Form */}
          <div className="bg-[hsl(var(--bg))] border border-[hsl(var(--surface-2))] rounded-lg p-4 mb-6">
            <h4 className="text-sm font-bold text-[hsl(var(--text-main))] mb-3 flex items-center gap-2">
              <Plus size={16} /> Add New Key
            </h4>
            <form onSubmit={handleAddKey} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div className="space-y-1 md:col-span-1">
                <label className="text-xs text-[hsl(var(--text-dim))]">Key Name</label>
                <input 
                  type="text" 
                  placeholder="My Personal Key" 
                  value={newKeyName}
                  onChange={e => setNewKeyName(e.target.value)}
                  className="w-full bg-[hsl(var(--surface-1))] border border-[hsl(var(--surface-2))] rounded px-3 py-2 text-sm focus:border-[hsl(var(--primary))] outline-none"
                />
              </div>
              <div className="space-y-1 md:col-span-1">
                <label className="text-xs text-[hsl(var(--text-dim))]">Type</label>
                <select 
                  value={newKeyType}
                  onChange={e => setNewKeyType(e.target.value as 'github' | 'gemini')}
                  className="w-full bg-[hsl(var(--surface-1))] border border-[hsl(var(--surface-2))] rounded px-3 py-2 text-sm focus:border-[hsl(var(--primary))] outline-none"
                >
                  <option value="github">GitHub Token</option>
                  <option value="gemini">Gemini API Key</option>
                </select>
              </div>
              <div className="space-y-1 md:col-span-2 relative group">
                <label className="text-xs text-[hsl(var(--text-dim))]">Token (Encrypted Storage)</label>
                <input 
                  type="password" 
                  placeholder="ghp_... or AIza..." 
                  value={newKeyToken}
                  onChange={e => setNewKeyToken(e.target.value)}
                  className="w-full bg-[hsl(var(--surface-1))] border border-[hsl(var(--surface-2))] rounded px-3 py-2 text-sm focus:border-[hsl(var(--primary))] outline-none"
                />
              </div>
              <div className="md:col-span-4 flex justify-end mt-2">
                <Button type="submit" className="py-1.5 px-4 text-xs h-9">Save Key Securely</Button>
              </div>
            </form>
          </div>

          {/* Managed Keys List */}
          <h4 className="text-sm font-bold text-[hsl(var(--text-dim))] mb-2 uppercase tracking-wider">Managed Keys</h4>
          <div className="space-y-2">
            {managedKeys.length === 0 && (
              <div className="text-center py-8 text-[hsl(var(--text-dim))] border border-dashed border-[hsl(var(--surface-2))] rounded-lg">
                No custom keys added. Using system defaults if available.
              </div>
            )}
            {managedKeys.map(key => (
              <div key={key.id} className="flex items-center justify-between p-3 bg-[hsl(var(--bg))] border border-[hsl(var(--surface-2))] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded bg-[hsl(var(--surface-2))] ${key.type === 'github' ? 'text-white' : 'text-blue-400'}`}>
                    {key.type === 'github' ? <Github size={16} /> : <BrainCircuit size={16} />}
                  </div>
                  <div>
                    <div className="font-medium text-sm text-[hsl(var(--text-main))]">{key.name}</div>
                    <div className="text-xs font-mono text-[hsl(var(--text-dim))] flex items-center gap-1">
                      <Lock size={10} />
                      {key.token.substring(0, 4)}••••••••••••••••••••{key.token.slice(-4)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {key.isRateLimitedUntil && key.isRateLimitedUntil > Date.now() && (
                    <span className="text-[10px] text-yellow-500 bg-yellow-900/20 px-2 py-0.5 rounded border border-yellow-900/30">
                      Rate Limited
                    </span>
                  )}
                  <button 
                    onClick={() => handleDeleteKey(key.id)} 
                    className="p-2 text-red-400 hover:bg-red-900/20 rounded transition-colors" 
                    title="Delete Key"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-[hsl(var(--surface-2))] text-xs text-[hsl(var(--text-dim))] flex items-start gap-2">
          <ShieldCheck size={14} className="text-green-500 shrink-0 mt-0.5" />
          <p>
            Keys are obfuscated and stored in your browser's Local Storage. They are never sent to our servers, 
            only directly to GitHub/Google APIs. If a key hits a rate limit, the system automatically rotates 
            to the next available key of the same type.
          </p>
        </div>
      </div>
    </div>
  );
};
