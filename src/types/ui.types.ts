/**
 * UI state types and enums.
 * @module types/ui
 */

/**
 * Application view state enum.
 * Represents the current state of the main dashboard view.
 */
export enum ViewState {
  /** Initial state, waiting for user input */
  IDLE = 'IDLE',
  /** Loading repository data from GitHub */
  LOADING_REPO = 'LOADING_REPO',
  /** Repository data loaded and displayed */
  REPO_LOADED = 'REPO_LOADED',
  /** AI analysis in progress */
  ANALYZING = 'ANALYZING',
}

/**
 * Detail view state enum.
 * Controls which detail panel is currently displayed.
 */
export enum DetailView {
  /** No detail view open */
  NONE = 'NONE',
  /** README detail view */
  README = 'README',
}
