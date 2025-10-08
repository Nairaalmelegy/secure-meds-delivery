import { STORAGE_KEYS } from '@/constants';

/**
 * CSRF Protection utilities
 * Implements double-submit cookie pattern for CSRF protection
 */

const CSRF_HEADER_NAME = 'X-CSRF-Token';

/**
 * Generate a random CSRF token
 */
function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Get or create CSRF token
 */
export function getCsrfToken(): string {
  let token = sessionStorage.getItem(STORAGE_KEYS.CSRF_TOKEN);
  
  if (!token) {
    token = generateToken();
    sessionStorage.setItem(STORAGE_KEYS.CSRF_TOKEN, token);
  }
  
  return token;
}

/**
 * Add CSRF token to request headers
 */
export function addCsrfHeader(headers: HeadersInit = {}): HeadersInit {
  return {
    ...headers,
    [CSRF_HEADER_NAME]: getCsrfToken(),
  };
}

/**
 * Refresh CSRF token (call after login/logout)
 */
export function refreshCsrfToken(): void {
  sessionStorage.removeItem(STORAGE_KEYS.CSRF_TOKEN);
  getCsrfToken(); // Generate new token
}

/**
 * Clear CSRF token (call on logout)
 */
export function clearCsrfToken(): void {
  sessionStorage.removeItem(STORAGE_KEYS.CSRF_TOKEN);
}
