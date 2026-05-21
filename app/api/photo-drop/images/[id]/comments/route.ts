import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { containsBadWords } from '../../../utils';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const supabase = getSupabase();

    const { data: comments, error: fetchError } = await supabase
      .from('photo_drop_comments')
      .select(`
        id,
        parent_id,
        author_name,
        content,
        client_id,
        is_hidden,
        created_at
      `)
      .eq('image_id', id)
      .eq('is_hidden', false) // 숨겨진 댓글은 내려주지 않음
      .order('created_at', { ascending: true });

    if (fetchError) throw fetchError;

    // Get likes for these comments
    const { data: likes, error: likesError } = await supabase
      .from('photo_drop_comment_likes')
      .select('comment_id, client_id')
      .in('comment_id', comments.map((c: any) => c.id));

    if (likesError) throw likesError;

    const aggregatedComments = comments.map((c: any) => {
      const cLikes = likes.filter((l: any) => l.comment_id === c.id);
      return {
        ...c,
        likesCount: cLikes.length,
        likedByClients: cLikes.map((l: any) => l.client_id)
      };
    });

    return NextResponse.json({ comments: aggregatedComments });
  } catch (error: any) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { parentId, authorName, content, clientId, password } = await request.json();

    if (!content) {
      return NextResponse.json({ error: 'content is required' }, { status: 400 });
    }

    // 1. 금칙어 검사
    if (containsBadWords(content) || containsBadWords(authorName)) {
      return NextResponse.json({ 
        error: '금칙어가 포함되어 있습니다. 축복하는 자리에 어울리는 따뜻한 단어로 변경해 주시겠어요?' 
      }, { status: 400 });
    }

    const supabase = getSupabase();

    // 2. 차단된 사용자 검사
    if (clientId) {
      const { data: banned, error: banError } = await supabase
        .from('photo_drop_banned_clients')
        .select('client_id')
        .eq('client_id', clientId)
        .maybeSingle();
        
      if (banned) {
        return NextResponse.json({ error: '신고 누적으로 인해 글 작성이 제한되었습니다.' }, { status: 403 });
      }
    }

    const { data, error } = await supabase
      .from('photo_drop_comments')
      .insert({
        image_id: id,
        parent_id: parentId || null,
        author_name: authorName || '하객',
        content,
        client_id: clientId || null,
        password: password || null
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ comment: data });
  } catch (error: any) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
