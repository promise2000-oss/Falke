/**
 * API configuration for the Aurikrex Academy frontend.
 *
 * The app now targets the hosted Django backend by default.
 * If you want to use a local backend during development, set:
 *   VITE_API_URL=http://localhost:3000/api
 */

/** Hosted backend URL */
export const HOSTED_API_URL = 'https://aurikrex-ed-tech.vercel.app/api';

/** Optional local backend URL for development overrides */
export const LOCAL_API_URL = 'http://localhost:3000/api';

const normalizeApiUrl = (url: string): string => {
  const trimmedUrl = url.trim().replace(/\/+$/, '');
  const withoutAuthPath = trimmedUrl
    .replace(/\/api\/auth(?:\/.*)?$/i, '/api')
    .replace(/\/auth(?:\/.*)?$/i, '');

  return withoutAuthPath.endsWith('/api') ? withoutAuthPath : `${withoutAuthPath}/api`;
};

/**
 * Resolved API base URL.
 * Prefers the explicit environment variable and otherwise uses the hosted backend.
 * Automatically appends `/api` if it was omitted from the environment value.
 */
const envApiUrl = import.meta.env.VITE_API_URL?.trim();
export const API_BASE_URL: string = envApiUrl ? normalizeApiUrl(envApiUrl) : HOSTED_API_URL;
