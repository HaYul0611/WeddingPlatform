import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSessionData } from '@/lib/auth';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

// ── 관리자 계정 목록 조회 및 생성 ──────────────────────
export async function GET(req: NextRequest) {
  try {
    const session = req.cookies.get('admin_session')?.value;
    const { isValid, companyId } = getSessionData(session);

    if (!isValid || companyId !== 'main') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const supabase = getSupabase();
    const { data: admins, error } = await supabase
      .from('admins')
      .select('id, email, name, company_id, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ success: true, data: admins });
  } catch (err) {
    console.error('[Admin List API Error]', err);
    return NextResponse.json({ success: false, error: '목록을 불러오지 못했습니다.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = req.cookies.get('admin_session')?.value;
    const { isValid, companyId } = getSessionData(session);

    if (!isValid || companyId !== 'main') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const { email, password, name, targetCompanyId } = await req.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: '필수 정보를 입력해주세요.' }, { status: 400 });
    }

    const supabase = getSupabase();
    const { error } = await supabase
      .from('admins')
      .insert([{
        email,
        password,
        name,
        company_id: targetCompanyId || 'main'
      }]);

    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: '이미 등록된 이메일입니다.' }, { status: 400 });
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Admin Create API Error]', err);
    return NextResponse.json({ success: false, error: '계정 생성 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// ── 계정 수정 ────────────────────────────────────
export async function PATCH(req: NextRequest) {
  try {
    const session = req.cookies.get('admin_session')?.value;
    const { isValid, companyId } = getSessionData(session);

    if (!isValid || companyId !== 'main') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const { id, name, email, company_id, status } = await req.json();

    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (company_id) updateData.company_id = company_id;
    if (status) updateData.status = status;

    const supabase = getSupabase();
    const { error } = await supabase
      .from('admins')
      .update(updateData)
      .eq('id', id);

    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: '이미 등록된 이메일입니다.' }, { status: 400 });
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Admin Update API Error]', err);
    return NextResponse.json({ success: false, error: '정보 수정 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// ── 계정 삭제 ────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const session = req.cookies.get('admin_session')?.value;
    const { isValid, companyId } = getSessionData(session);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!isValid || companyId !== 'main') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const supabase = getSupabase();
    const { error } = await supabase
      .from('admins')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: '삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
