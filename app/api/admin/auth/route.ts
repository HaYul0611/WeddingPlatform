import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { buildSessionToken, getSessionData, COOKIE_NAME, COOKIE_MAX_AGE } from '@/lib/auth';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

// ── 로그인 ──────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: '이메일과 비밀번호를 모두 입력해주세요.' },
        { status: 400 },
      );
    }

    const supabase = getSupabase();

    // 1) DB에서 사용자 조회
    const { data: admin, error } = await supabase
      .from('admins')
      .select('email, password, company_id')
      .eq('email', email)
      .eq('password', password)
      .single();

    if (error || !admin) {
      return NextResponse.json(
        { success: false, error: '아이디 또는 비밀번호가 일치하지 않습니다.' },
        { status: 401 },
      );
    }

    // 2) 세션 생성 (해시|업체ID|이메일)
    const token = buildSessionToken(admin.company_id, admin.email);
    const res = NextResponse.json({ success: true });

    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    });

    return res;
  } catch (err) {
    console.error('[Auth API Error]', err);
    return NextResponse.json(
      { success: false, error: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}

// ── 내 정보 조회 ────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const session = req.cookies.get(COOKIE_NAME)?.value;
    const { isValid, companyId, email } = getSessionData(session);

    if (!isValid || !email) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const supabase = getSupabase();
    const { data: admin, error } = await supabase
      .from('admins')
      .select('id, email, name, company_id')
      .eq('email', email)
      .single();

    if (error || !admin) {
      console.error('[Auth GET Error] Admin not found:', email);
      return NextResponse.json({ success: false }, { status: 401 });
    }

    return NextResponse.json({ success: true, admin });
  } catch (err) {
    console.error('[Auth GET Unexpected Error]', err);
    return NextResponse.json({ success: false }, { status: 401 });
  }
}

// ── 로그아웃 ────────────────────────────────────
export async function DELETE() {
  const res = NextResponse.json({ success: true });
  res.cookies.delete(COOKIE_NAME);
  return res;
}
