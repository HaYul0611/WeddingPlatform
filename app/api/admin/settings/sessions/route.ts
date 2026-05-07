/**
 * DELETE /api/admin/settings/sessions
 * 현재 관리자 세션을 모두 무효화 (쿠키 삭제 + 재로그인 유도)
 */

import { NextRequest, NextResponse } from 'next/server';
import { isValidSession, COOKIE_NAME } from '@/lib/auth';

export async function DELETE(req: NextRequest) {
  const session = req.cookies.get('admin_session')?.value;
  if (!isValidSession(session)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const res = NextResponse.json({ success: true });
  res.cookies.delete(COOKIE_NAME);
  return res;
}
