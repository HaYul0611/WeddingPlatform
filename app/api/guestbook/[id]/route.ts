import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { password, clientId } = body;

    const supabase = getSupabase();

    // 메시지 확인
    const { data: msg, error: fetchError } = await supabase
      .from('guestbook_messages')
      .select('password, client_id')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // 권한 확인 (비밀번호 일치 또는 본인 작성 기기)
    if (msg.password !== password && msg.client_id !== clientId) {
      return NextResponse.json({ error: '권한이 없습니다. (비밀번호 불일치)' }, { status: 403 });
    }

    // 삭제 실행
    const { error: deleteError } = await supabase
      .from('guestbook_messages')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting guestbook entry:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
