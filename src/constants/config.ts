/**
 * Application configuration constants.
 * @module constants/config
 */

/** Application display name */
export const APP_NAME = "IIC reviews";

/** GitHub API base URL */
export const GITHUB_API_BASE = 'https://api.github.com';

/** 
 * Authentication credentials from environment variables.
 * Used for admin login functionality.
 */
export const ADMIN_USER = import.meta.env.VITE_ADMIN_USER || "";
export const ADMIN_PASS = import.meta.env.VITE_ADMIN_PASS || "";
