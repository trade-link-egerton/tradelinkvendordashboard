const ACCESS_TOKEN_KEY = 'vendor_access_token';
const REFRESH_TOKEN_KEY = 'vendor_refresh_token';

/**
 * Access Token
 */
export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

/**
 * Refresh Token
 */
export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function clearRefreshToken(): void {
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * Clear all auth tokens
 */
export function clearAuthTokens(): void {
  clearAccessToken();
  clearRefreshToken();
}

/**
 * Authentication status
 */
export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}