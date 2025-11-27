/**
 * Normalizes GitHub URLs and .git URLs to standard format
 * Handles:
 * - https://github.com/owner/repo
 * - https://github.com/owner/repo.git
 * - git@github.com:owner/repo.git
 * - github.com/owner/repo
 */
export const normalizeGitHubUrl = (input: string): string | null => {
  if (!input || !input.trim()) return null;

  let url = input.trim();

  try {
    // Handle git@github.com:owner/repo.git format
    if (url.startsWith('git@github.com:')) {
      url = url.replace('git@github.com:', 'https://github.com/');
    }

    // Handle github.com/owner/repo (missing protocol)
    if (url.startsWith('github.com/')) {
      url = 'https://' + url;
    }

    // Remove .git suffix if present
    if (url.endsWith('.git')) {
      url = url.slice(0, -4);
    }

    // Remove trailing slashes
    url = url.replace(/\/+$/, '');

    // Validate it's a proper GitHub URL
    const urlObj = new URL(url);
    if (urlObj.hostname !== 'github.com') {
      throw new Error('Not a GitHub URL');
    }

    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    if (pathParts.length < 2) {
      throw new Error('Invalid GitHub repository URL format');
    }

    // Return normalized URL
    return `https://github.com/${pathParts[0]}/${pathParts[1]}`;
  } catch (e) {
    console.error('Failed to normalize GitHub URL:', input, e);
    return null;
  }
};

/**
 * Extracts owner and repo name from GitHub URL
 */
export const parseGitHubUrl = (url: string): { owner: string; repo: string } | null => {
  const normalized = normalizeGitHubUrl(url);
  if (!normalized) return null;

  try {
    const urlObj = new URL(normalized);
    const [owner, repo] = urlObj.pathname.split('/').filter(Boolean);
    return { owner, repo };
  } catch (e) {
    return null;
  }
};
