import { createHmac } from 'crypto';

export const COOKIE_NAME = 'admin_session';
export const COOKIE_MAX_AGE = 60 * 60 * 8; // 8시간

export function signToken(password: string): string {
  const secret = process.env.ADMIN_SESSION_SECRET ?? 'fallback-secret';
  return createHmac('sha256', secret).update(password).digest('hex');
}

export function buildSessionToken(): string {
  const password = process.env.ADMIN_PASSWORD ?? '';
  return signToken(password);
}

export function isValidSession(cookieValue: string | undefined): boolean {
  if (!cookieValue) return false;
  return cookieValue === buildSessionToken();
}
