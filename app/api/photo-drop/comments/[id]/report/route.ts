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

    // 1. 현재 신고 수 가져오기
    const { data: comment, error: fetchError } = await supabase
      .from('photo_drop_comments')
      .select('report_count, client_id')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const newReportCount = (comment.report_count || 0) + 1;
    const isHidden = newReportCount >= 3;

    // 2. 신고 수 및 숨김 여부 업데이트
    const { error: updateError } = await supabase
      .from('photo_drop_comments')
      .update({ report_count: newReportCount, is_hidden: isHidden })
      .eq('id', id);

    if (updateError) throw updateError;

    // 3. 만약 3회 이상 누적되었다면 작성자를 영구 차단 등록
    if (isHidden && comment.client_id) {
      // client_id가 있는 경우만 차단 가능
      await supabase
        .from('photo_drop_banned_clients')
        .upsert({ client_id: comment.client_id, reason: '신고 누적 3회 이상으로 자동 차단' })
        .select();
    }

    return NextResponse.json({ success: true, isHidden });
  } catch (error: any) {
    console.error('Error reporting comment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
