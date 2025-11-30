/**
 * GitHub API HTTP client with retry and key rotation support.
 * @module api/github/client
 */

import { KeyManager } from '../../lib/keyVault';

/**
 * Wrapper for fetch that handles key rotation on rate limits.
 * Automatically retries with different API keys when rate limited.
 * 
 * @param url - The URL to fetch
 * @param options - Standard fetch options
 * @param attempt - Current retry attempt number (internal use)
 * @returns Promise resolving to the Response
 * 
 * @throws Error if all retries are exhausted
 * 
 * @example
 * const response = await fetchWithRetry('https://api.github.com/repos/owner/repo');
 * if (response.ok) {
 *   const data = await response.json();
 * }
 */
export const fetchWithRetry = async (
  url: string, 
  options: RequestInit = {}, 
  attempt = 0
): Promise<Response> => {
  const token = KeyManager.getValidKey('github');
  
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `token ${token}`;
  }

  try {
    const response = await fetch(url, { ...options, headers });

    // Handle Rate Limits (403 or 429)
    if (response.status === 403 || response.status === 429) {
      if (token) {
        KeyManager.markRateLimited(token);
        // Retry with new key if available
        if (attempt < 5) {
          console.log(`Rate limit hit. Rotating key and retrying (Attempt ${attempt + 1})...`);
          return fetchWithRetry(url, options, attempt + 1);
        }
      }
    }

    return response;
  } catch (error) {
    throw error;
  }
};
