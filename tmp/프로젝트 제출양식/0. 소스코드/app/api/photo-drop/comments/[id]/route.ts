import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { containsBadWords } from '../../utils';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// 수정
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { content, clientId, password } = await request.json();

    if (!content) return NextResponse.json({ error: '내용이 없습니다.' }, { status: 400 });

    if (containsBadWords(content)) {
      return NextResponse.json({ 
        error: '금칙어가 포함되어 있습니다. 축복하는 자리에 어울리는 따뜻한 단어로 변경해 주시겠어요?' 
      }, { status: 400 });
    }

    const supabase = getSupabase();
    
    // 권한 검증
    const { data: comment, error: fetchError } = await supabase
      .from('photo_drop_comments')
      .select('client_id, password')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const isOwner = (clientId && comment.client_id === clientId) || (password && comment.password === password);
    if (!isOwner) {
      return NextResponse.json({ error: '권한이 없습니다. (비밀번호 불일치)' }, { status: 403 });
    }

    const { error: updateError } = await supabase
      .from('photo_drop_comments')
      .update({ content })
      .eq('id', id);

    if (updateError) throw updateError;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 삭제
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');
    const password = searchParams.get('password');

    const supabase = getSupabase();
    
    // 권한 검증
    const { data: comment, error: fetchError } = await supabase
      .from('photo_drop_comments')
      .select('client_id, password')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const isOwner = (clientId && comment.client_id === clientId) || (password && comment.password === password);
    if (!isOwner) {
      return NextResponse.json({ error: '권한이 없습니다. (비밀번호 불일치)' }, { status: 403 });
    }

    const { error: deleteError } = await supabase
      .from('photo_drop_comments')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('DELETE comment error:', error);
    const errorMessage = error?.message || '알 수 없는 서버 오류가 발생했습니다.';
    // If it's an internal fetch error from Supabase, make it friendly
    if (errorMessage.includes('fetch failed')) {
      return NextResponse.json({ error: '서버와의 통신이 원활하지 않습니다. 잠시 후 다시 시도해주세요.' }, { status: 500 });
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
