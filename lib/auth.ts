import { createHmac } from 'crypto';

const COOKIE_NAME = 'admin_session';

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
