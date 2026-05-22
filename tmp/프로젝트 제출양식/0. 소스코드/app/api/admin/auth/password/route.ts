import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSessionData } from '@/lib/auth';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

// ── 비밀번호 변경 ──────────────────────────────────
export async function PATCH(req: NextRequest) {
  try {
    // 1) 세션 확인
    const session = req.cookies.get('admin_session')?.value;
    const { isValid, companyId } = getSessionData(session);

    if (!isValid || !companyId) {
      return NextResponse.json({ success: false, error: '인증이 필요합니다.' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ success: false, error: '필수 정보를 모두 입력해주세요.' }, { status: 400 });
    }

    if (companyId === 'mock-company') {
      return NextResponse.json({ success: true, message: '비밀번호가 성공적으로 변경되었습니다. (데모 환경)' });
    }

    const supabase = getSupabase();

    // 2) 현재 비밀번호가 맞는지 다시 확인 (보안 강화)
    const { data: admin, error: fetchError } = await supabase
      .from('admins')
      .select('id, email')
      .eq('company_id', companyId)
      .eq('password', currentPassword) // 실무에서는 해시 비교
      .single();

    if (fetchError || !admin) {
      return NextResponse.json({ success: false, error: '현재 비밀번호가 일치하지 않습니다.' }, { status: 403 });
    }

    // 3) 새 비밀번호로 업데이트
    const { error: updateError } = await supabase
      .from('admins')
      .update({ password: newPassword })
      .eq('id', admin.id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true, message: '비밀번호가 성공적으로 변경되었습니다.' });
  } catch (err) {
    console.error('[Password Change API Error]', err);
    return NextResponse.json({ success: false, error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
