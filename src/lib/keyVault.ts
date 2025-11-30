/**
 * Secure key vault service for managing API keys.
 * Provides obfuscated storage in localStorage and key rotation support.
 * @module lib/keyVault
 */

import { ManagedKey } from '../types';

const STORAGE_KEY = "secure_key_vault_v1";

/**
 * Basic obfuscation to prevent plain text reading in LocalStorage.
 * Note: Client-side storage is never 100% secure against XSS, but this prevents casual snooping.
 * 
 * @param text - Plain text to obfuscate
 * @returns Obfuscated string
 */
const obfuscate = (text: string): string => {
  try {
    return btoa(text.split("").reverse().join(""));
  } catch (e) {
    return text;
  }
};

/**
 * Reverses the obfuscation process.
 * 
 * @param text - Obfuscated string
 * @returns Plain text
 */
const deobfuscate = (text: string): string => {
  try {
    return atob(text).split("").reverse().join("");
  } catch (e) {
    return text;
  }
};

/**
 * Service class for managing API keys with obfuscated storage and automatic rotation.
 * Keys are stored in localStorage with basic obfuscation and support rate limit tracking.
 * 
 * @example
 * // Get a valid GitHub key
 * const token = KeyManager.getValidKey('github');
 * 
 * // Add a new key
 * KeyManager.addKey('My Key', 'github', 'ghp_xxxxx');
 * 
 * // Mark key as rate limited
 * KeyManager.markRateLimited(token);
 */
class KeyManagerService {
  private keys: ManagedKey[] = [];
  private envLoaded = false;

  constructor() {
    this.loadKeys();
  }

  /**
   * Loads keys from localStorage.
   * @private
   */
  private loadKeys(): void {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        this.keys = parsed.map((k: ManagedKey) => ({
          ...k,
          token: deobfuscate(k.token),
        }));
      } catch (e) {
        console.error("Failed to load keys", e);
        this.keys = [];
      }
    }
  }

  /**
   * Saves keys to localStorage with obfuscation.
   * @private
   */
  private saveKeys(): void {
    const toStore = this.keys.map((k) => ({
      ...k,
      token: obfuscate(k.token),
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  }

  /**
   * Injects environment variables as temporary keys (only done once per session).
   * Uses Vite's import.meta.env for accessing environment variables.
   * @private
   */
  private loadEnvKeys(): void {
    if (this.envLoaded) return;

    const envGh = import.meta.env.VITE_GITHUB_TOKEN;
    const envGemini = import.meta.env.VITE_GEMINI_API_KEY;

    /**
     * Helper to add environment keys if they don't already exist.
     * @param token - The token string (may be comma-separated for multiple)
     * @param type - Key type
     */
    const addEnvKey = (token: string, type: "github" | "gemini"): void => {
      const tokens = token
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      tokens.forEach((t, i) => {
        if (!this.keys.some((k) => k.token === t)) {
          this.keys.push({
            id: `env-${type}-${i}`,
            name: `Environment ${type === "github" ? "GitHub" : "Gemini"} Key ${i + 1}`,
            type,
            token: t,
          });
        }
      });
    };

    if (envGh) addEnvKey(envGh, "github");
    if (envGemini) addEnvKey(envGemini, "gemini");

    this.envLoaded = true;
  }

  /**
   * Gets all stored keys including environment-loaded ones.
   * 
   * @returns Array of all managed keys
   */
  public getKeys(): ManagedKey[] {
    this.loadEnvKeys();
    return this.keys;
  }

  /**
   * Adds a new API key to storage.
   * 
   * @param name - User-friendly name for the key
   * @param type - Key type ('github' or 'gemini')
   * @param token - The actual API token value
   */
  public addKey(name: string, type: "github" | "gemini", token: string): void {
    this.keys.push({
      id: Date.now().toString(),
      name,
      type,
      token,
    });
    this.saveKeys();
  }

  /**
   * Removes a key by its ID.
   * 
   * @param id - The key ID to remove
   */
  public removeKey(id: string): void {
    this.keys = this.keys.filter((k) => k.id !== id);
    this.saveKeys();
  }

  /**
   * Marks a key as rate limited for 1 minute.
   * The system will skip this key until the rate limit expires.
   * 
   * @param token - The token value to mark as rate limited
   */
  public markRateLimited(token: string): void {
    const keyIndex = this.keys.findIndex((k) => k.token === token);
    if (keyIndex !== -1) {
      this.keys[keyIndex].isRateLimitedUntil = Date.now() + 60000;
      console.warn(`Key ${this.keys[keyIndex].name} marked as rate limited.`);
    }
  }

  /**
   * Gets a valid (non-rate-limited) key of the specified type.
   * Automatically filters out currently rate-limited keys.
   * 
   * @param type - Key type to retrieve ('github' or 'gemini')
   * @returns The token string, or null if no valid key is available
   */
  public getValidKey(type: "github" | "gemini"): string | null {
    this.loadEnvKeys();

    const now = Date.now();
    const validKeys = this.keys
      .filter((k) => k.type === type)
      .filter((k) => !k.isRateLimitedUntil || k.isRateLimitedUntil < now);

    if (validKeys.length === 0) return null;

    return validKeys[0].token;
  }
}

/** Singleton instance of the KeyManager service */
export const KeyManager = new KeyManagerService();
