/**
 * POST /api/admin/auth  → 로그인 (쿠키 발급)
 * DELETE /api/admin/auth → 로그아웃 (쿠키 삭제)
 *
 * 필요 환경변수:
 *   ADMIN_PASSWORD=         ← 관리자 비밀번호
 *   ADMIN_SESSION_SECRET=   ← 쿠키 서명용 랜덤 문자열 (32자 이상 권장)
 */

import { NextRequest, NextResponse } from 'next/server';
import { buildSessionToken, COOKIE_NAME, COOKIE_MAX_AGE } from '@/lib/auth';

// ── 로그인 ──────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    if (!password || password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, error: '비밀번호가 올바르지 않습니다.' },
        { status: 401 },
      );
    }

    const token = buildSessionToken();
    const res = NextResponse.json({ success: true });

    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    });

    return res;
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}

// ── 로그아웃 ────────────────────────────────────
export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete(COOKIE_NAME);
  return res;
}
