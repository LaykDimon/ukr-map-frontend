/**
 * Decode a JWT token payload without any library.
 * Returns null if the token is malformed.
 */
function decodePayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

/**
 * Returns true if the given JWT token is expired (or malformed / missing).
 * Adds a 30-second grace buffer so we don't use a token that's about to die.
 */
export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  const payload = decodePayload(token);
  if (!payload || typeof payload.exp !== "number") return true;
  const nowSec = Math.floor(Date.now() / 1000);
  return payload.exp - 30 < nowSec; // 30-second grace
}

/**
 * Returns the number of milliseconds until the token expires.
 * Returns 0 if the token is already expired or invalid.
 */
export function msUntilExpiry(token: string | null): number {
  if (!token) return 0;
  const payload = decodePayload(token);
  if (!payload || typeof payload.exp !== "number") return 0;
  const ms = payload.exp * 1000 - Date.now();
  return ms > 0 ? ms : 0;
}
