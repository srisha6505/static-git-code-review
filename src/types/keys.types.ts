/**
 * Types for API key management.
 * @module types/keys
 */

/**
 * Managed API key structure.
 * Represents a stored API key for GitHub or Gemini services.
 */
export interface ManagedKey {
  /** Unique identifier for the key */
  id: string;
  /** User-friendly name for the key */
  name: string;
  /** Key type: 'github' for GitHub tokens, 'gemini' for Gemini API keys */
  type: 'github' | 'gemini';
  /** The actual API token/key value */
  token: string;
  /** Timestamp when rate limit expires (if rate limited) */
  isRateLimitedUntil?: number;
}
