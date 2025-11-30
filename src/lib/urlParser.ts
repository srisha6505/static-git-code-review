/**
 * GitHub URL parsing utility.
 * @module lib/urlParser
 */

/**
 * Parsed GitHub URL result containing owner and repo name.
 */
export interface ParsedGithubUrl {
  /** Repository owner (username or organization) */
  owner: string;
  /** Repository name */
  repo: string;
}

/**
 * Parses a GitHub repository URL and extracts owner and repo name.
 * 
 * @param url - The GitHub URL to parse (e.g., "https://github.com/owner/repo")
 * @returns ParsedGithubUrl object if valid, null if invalid
 * 
 * @example
 * parseGithubUrl('https://github.com/facebook/react')
 * // Returns: { owner: 'facebook', repo: 'react' }
 * 
 * @example
 * parseGithubUrl('https://invalid.com/test')
 * // Returns: null
 */
export const parseGithubUrl = (url: string): ParsedGithubUrl | null => {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname !== 'github.com') return null;
    const parts = urlObj.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;
    return { owner: parts[0], repo: parts[1] };
  } catch (e) {
    return null;
  }
};
