import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const supabase = getSupabase();

    // 1. 현재 메시지 가져오기
    const { data: msg, error: fetchError } = await supabase
      .from('guestbook_messages')
      .select('report_count, client_id, ip_address, invitation_id')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const newReportCount = (msg.report_count || 0) + 1;
    const isHidden = newReportCount >= 3;

    // 2. 신고 수 업데이트
    const { error: updateError } = await supabase
      .from('guestbook_messages')
      .update({ report_count: newReportCount, is_hidden: isHidden })
      .eq('id', id);

    if (updateError) throw updateError;

    // 3. 3회 누적 시 차단 로직 실행
    if (isHidden) {
      // (1) 해당 청첩장 링크의 방명록 작성 폼 전체 차단
      await supabase
        .from('invitation_guestbook_settings')
        .upsert({ invitation_id: msg.invitation_id, is_blocked: true });

      // (2) 해당 글을 작성한 악의적 이용자의 기기(client_id) 및 IP 차단
      if (msg.client_id || msg.ip_address) {
        await supabase
          .from('guestbook_banned_clients')
          .insert({
            client_id: msg.client_id,
            ip_address: msg.ip_address,
            reason: '방명록 신고 3회 누적으로 인한 차단'
          });
      }
    }

    return NextResponse.json({ success: true, isHidden });
  } catch (error: any) {
    console.error('Error reporting guestbook entry:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
