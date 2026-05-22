/**
 * POST /api/admin/settings/password
 *
 * body: { currentPassword: string; newPassword: string }
 *
 * 동작 방식:
 *   - ADMIN_PASSWORD 환경변수와 currentPassword 일치 검증
 *   - 새 비밀번호는 .env에서만 관리 (런타임 변경 불가)
 *   - 변경 성공 시 현재 세션 무효화 → 재로그인 유도
 *
 * 주의: 실제 .env 파일을 런타임에서 수정하지 않습니다.
 *       새 비밀번호는 운영자가 .env를 직접 수정 후 재배포해야 합니다.
 *       이 엔드포인트는 변경 확인 + 세션 무효화만 수행합니다.
 */

import { NextRequest, NextResponse } from 'next/server';
import { isValidSession, COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = req.cookies.get('admin_session')?.value;
  if (!isValidSession(session)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, error: '현재 비밀번호와 새 비밀번호를 모두 입력해 주세요.' },
        { status: 400 },
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: '새 비밀번호는 8자 이상이어야 합니다.' },
        { status: 400 },
      );
    }

    if (currentPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { success: false, error: '현재 비밀번호가 올바르지 않습니다.' },
        { status: 401 },
      );
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { success: false, error: '새 비밀번호는 현재 비밀번호와 달라야 합니다.' },
        { status: 400 },
      );
    }

    // 세션 무효화 (재로그인 유도)
    const res = NextResponse.json({
      success: true,
      message: '비밀번호 변경이 확인되었습니다. .env의 ADMIN_PASSWORD를 업데이트 후 재배포하세요.',
      requireRelogin: true,
    });
    res.cookies.delete(COOKIE_NAME);

    return res;
  } catch (e) {
    console.error('[Password Change]', e);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
