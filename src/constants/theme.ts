/**
 * Theme and color constants.
 * @module constants/theme
 */

/**
 * HSL color values for inline styles where Tailwind classes aren't sufficient.
 * These mirror the CSS variables defined in index.html.
 */
export const COLORS = {
  /** Main background color */
  bg: "hsl(220, 10%, 10%)",
  /** First surface level (cards, containers) */
  surface1: "hsl(220, 10%, 14%)",
  /** Second surface level (hover states, borders) */
  surface2: "hsl(220, 10%, 18%)",
  /** Third surface level (elevated elements) */
  surface3: "hsl(220, 10%, 22%)",
  /** Primary accent color */
  primary: "hsl(260, 70%, 60%)",
};

/**
 * Language color mapping for displaying language statistics.
 * Maps programming language names to their associated brand colors.
 * 
 * @param lang - The programming language name
 * @returns The hex color code for the language
 * 
 * @example
 * getLangColor('TypeScript') // Returns '#3178c6'
 */
export const getLangColor = (lang: string): string => {
  const map: Record<string, string> = {
    TypeScript: '#3178c6',
    JavaScript: '#f1e05a',
    Python: '#3572A5',
    HTML: '#e34c26',
    CSS: '#563d7c',
    Rust: '#dea584',
    Go: '#00ADD8',
    Java: '#b07219',
    'C++': '#f34b7d',
    Ruby: '#701516',
    Shell: '#89e051',
  };
  return map[lang] || '#8b949e';
};
