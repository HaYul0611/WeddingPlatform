import { createHmac } from 'crypto';

export const COOKIE_NAME = 'admin_session';
export const COOKIE_MAX_AGE = 60 * 60 * 8; // 8시간

// 비밀번호 기반 서명 생성
export function signToken(password: string): string {
  const secret = process.env.ADMIN_SESSION_SECRET ?? 'fallback-secret';
  return createHmac('sha256', secret).update(password).digest('hex');
}

// 세션 토큰 생성 (해시|업체ID|이메일)
export function buildSessionToken(companyId: string, email: string): string {
  const password = process.env.ADMIN_PASSWORD ?? '';
  const hash = signToken(password);
  return `${hash}|${companyId}|${email}`;
}

// 세션 유효성 검사 및 데이터 추출
export function getSessionData(cookieValue: string | undefined): { isValid: boolean; companyId: string | null; email: string | null } {
  if (!cookieValue) return { isValid: false, companyId: null, email: null };

  const [hash, companyId, email] = cookieValue.split('|');
  const expectedHash = signToken(process.env.ADMIN_PASSWORD ?? '');

  if (hash === expectedHash && companyId && email) {
    return { isValid: true, companyId, email };
  }

  return { isValid: false, companyId: null, email: null };
}

// 하위 호환성을 위한 함수
export function isValidSession(cookieValue: string | undefined): boolean {
  return getSessionData(cookieValue).isValid;
}
