import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSessionData } from '@/lib/auth';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

// ── 업체 목록 조회 ──────────────────────
export async function GET(req: NextRequest) {
  try {
    const session = req.cookies.get('admin_session')?.value;
    const { isValid, companyId, email } = getSessionData(session);

    if (!isValid || (companyId !== 'main' && email !== 'ohayul.me@gmail.com')) {
      return NextResponse.json({ success: false, error: '권한이 없습니다.' }, { status: 403 });
    }

    const supabase = getSupabase();
    const { data: companies, error } = await supabase
      .from('companies')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      // 테이블이 없을 경우 빈 배열 반환 (자동 생성 전까지 안전하게 처리)
      if (error.code === 'PGRST116' || error.code === '42P01') return NextResponse.json({ success: true, data: [] });
      throw error;
    }
    return NextResponse.json({ success: true, data: companies });
  } catch (err) {
    console.error('[Company List API Error]', err);
    return NextResponse.json({ success: false, error: '목록을 불러오지 못했습니다.' }, { status: 500 });
  }
}

// ── 업체 추가 ──────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = req.cookies.get('admin_session')?.value;
    const { isValid, companyId, email } = getSessionData(session);

    if (!isValid || (companyId !== 'main' && email !== 'ohayul.me@gmail.com')) {
      return NextResponse.json({ success: false, error: '권한이 없습니다.' }, { status: 403 });
    }

    const { name } = await req.json();
    if (!name) return NextResponse.json({ error: '업체명을 입력해주세요.' }, { status: 400 });

    const supabase = getSupabase();
    const { error } = await supabase
      .from('companies')
      .insert([{ name }]);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Company Create API Error]', err);
    return NextResponse.json({ success: false, error: '업체 등록 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// ── 업체 삭제 ──────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const session = req.cookies.get('admin_session')?.value;
    const { isValid, companyId, email } = getSessionData(session);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!isValid || (companyId !== 'main' && email !== 'ohayul.me@gmail.com')) {
      return NextResponse.json({ success: false, error: '권한이 없습니다.' }, { status: 403 });
    }

    const supabase = getSupabase();
    const { error } = await supabase
      .from('admins')
      .select('id')
      .eq('company_id', id)
      .limit(1);

    if (error) throw error;

    // 해당 업체를 사용하는 관리자가 있으면 삭제 불가
    // (이 부분은 나중에 더 정교하게 처리 가능)

    const { error: delError } = await supabase
      .from('companies')
      .delete()
      .eq('id', id);

    if (delError) throw delError;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Company Delete API Error]', err);
    return NextResponse.json({ success: false, error: '삭제 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

// ── 업체 수정 ──────────────────────
export async function PATCH(req: NextRequest) {
  try {
    const session = req.cookies.get('admin_session')?.value;
    const { isValid, companyId, email } = getSessionData(session);

    if (!isValid || (companyId !== 'main' && email !== 'ohayul.me@gmail.com')) {
      return NextResponse.json({ success: false, error: '권한이 없습니다.' }, { status: 403 });
    }

    const { id, name } = await req.json();
    if (!id || !name) return NextResponse.json({ error: '필수 정보가 누락되었습니다.' }, { status: 400 });

    const supabase = getSupabase();
    const { error } = await supabase
      .from('companies')
      .update({ name })
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Company Update API Error]', err);
    return NextResponse.json({ success: false, error: '업체 수정 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
