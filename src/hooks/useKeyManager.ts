/**
 * Custom hook for key management state.
 * @module hooks/useKeyManager
 */

import { useState, useEffect, useCallback } from 'react';
import { ManagedKey } from '../types';
import { KeyManager } from '../lib/keyVault';

/**
 * Key manager state and handlers.
 */
interface UseKeyManagerReturn {
  /** List of managed keys */
  managedKeys: ManagedKey[];
  /** Refresh keys from storage */
  refreshKeys: () => void;
  /** Add a new key */
  addKey: (name: string, type: 'github' | 'gemini', token: string) => void;
  /** Delete a key */
  deleteKey: (id: string) => void;
}

/**
 * Hook for managing API keys.
 * Provides CRUD operations for stored keys.
 * 
 * @returns Key manager state and handler functions
 * 
 * @example
 * const { managedKeys, addKey, deleteKey } = useKeyManager();
 * 
 * addKey('My GitHub Token', 'github', 'ghp_xxxxx');
 */
export const useKeyManager = (): UseKeyManagerReturn => {
  const [managedKeys, setManagedKeys] = useState<ManagedKey[]>([]);

  /**
   * Refreshes keys from storage.
   */
  const refreshKeys = useCallback(() => {
    setManagedKeys(KeyManager.getKeys());
  }, []);

  // Load keys on mount
  useEffect(() => {
    refreshKeys();
  }, [refreshKeys]);

  /**
   * Adds a new key to storage.
   */
  const addKey = useCallback((name: string, type: 'github' | 'gemini', token: string) => {
    KeyManager.addKey(name, type, token);
    refreshKeys();
  }, [refreshKeys]);

  /**
   * Deletes a key from storage.
   */
  const deleteKey = useCallback((id: string) => {
    KeyManager.removeKey(id);
    refreshKeys();
  }, [refreshKeys]);

  return {
    managedKeys,
    refreshKeys,
    addKey,
    deleteKey,
  };
};
