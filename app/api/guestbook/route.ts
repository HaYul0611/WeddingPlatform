import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// rate limiting in-memory store
const rateLimitStore = new Map<string, { count: number, resetTime: number }>();

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const invitationId = searchParams.get('invitationId');

    if (!invitationId) {
      return NextResponse.json({ error: 'Missing invitationId' }, { status: 400 });
    }

    const supabase = getSupabase();

    // 차단 상태 확인
    const { data: settings } = await supabase
      .from('invitation_guestbook_settings')
      .select('is_blocked')
      .eq('invitation_id', invitationId)
      .single();

    const isBlocked = settings?.is_blocked || false;

    // 숨김 처리되지 않은 메시지만 최신순으로 가져오기
    const { data: messages, error } = await supabase
      .from('guestbook_messages')
      .select('id, name, content, date:created_at, is_private, client_id, password')
      .eq('invitation_id', invitationId)
      .eq('is_hidden', false)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // 날짜 포맷 변환 (YYYY.MM.DD)
    const formattedMessages = messages.map(msg => ({
      ...msg,
      date: new Date(msg.date).toLocaleDateString('ko-KR').replace(/. /g, '.').replace(/.$/, '')
    }));

    return NextResponse.json({ messages: formattedMessages, isBlocked });
  } catch (error: any) {
    console.error('Error fetching guestbook:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { invitationId, name, content, password, isPrivate, clientId } = body;
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    const supabase = getSupabase();

    // 1. 링크 차단 상태 확인
    const { data: settings } = await supabase
      .from('invitation_guestbook_settings')
      .select('is_blocked')
      .eq('invitation_id', invitationId)
      .single();

    if (settings?.is_blocked) {
      return NextResponse.json({ error: '관리자에 의해 방명록 작성이 제한된 청첩장입니다.' }, { status: 403 });
    }

    // 2. IP 및 Device ID 블랙리스트 차단 (방어 A)
    const { data: bannedClient } = await supabase
      .from('guestbook_banned_clients')
      .select('id')
      .or(`client_id.eq.${clientId},ip_address.eq.${ip}`)
      .limit(1);

    if (bannedClient && bannedClient.length > 0) {
      return NextResponse.json({ error: '비정상적인 이용으로 인해 차단된 기기 또는 IP입니다.' }, { status: 403 });
    }

    // 3. 서버사이드 Rate Limiting (도배 방지 - 방어 B)
    // 1분에 5회 이상 작성 시도 시 5분간 차단
    const now = Date.now();
    const rateLimitKey = `${invitationId}_${ip}`;
    const rateData = rateLimitStore.get(rateLimitKey);

    if (rateData && now < rateData.resetTime) {
      if (rateData.count >= 5) {
        return NextResponse.json({ error: '짧은 시간에 너무 많은 글을 작성했습니다. 잠시 후 다시 시도해주세요.' }, { status: 429 });
      }
      rateLimitStore.set(rateLimitKey, { count: rateData.count + 1, resetTime: rateData.resetTime });
    } else {
      rateLimitStore.set(rateLimitKey, { count: 1, resetTime: now + 60000 }); // 1분
    }

    // 4. 서버사이드 금칙어 확인 (방어 C)
    const BANNED_WORDS = ['바보', '멍청이', '쓰레기', '씨발', '개새끼', '존나', '지랄', '병신', '호구', '창녀', '미친'];
    const hasBadWord = BANNED_WORDS.some(word => content.includes(word) || name.includes(word));
    if (hasBadWord) {
      return NextResponse.json({ error: '금칙어가 포함되어 있습니다.' }, { status: 400 });
    }

    // 5. 유사도 검사 (최근 1시간 내 차단된 글과 유사한지 확인)
    const { data: recentHidden } = await supabase
      .from('guestbook_messages')
      .select('content')
      .eq('invitation_id', invitationId)
      .eq('is_hidden', true)
      .gte('created_at', new Date(now - 3600000).toISOString()); // 1시간 이내
    
    if (recentHidden && recentHidden.length > 0) {
      const isSimilar = recentHidden.some(msg => msg.content === content || content.includes(msg.content));
      if (isSimilar) {
        return NextResponse.json({ error: '신고된 내용과 매우 유사한 글은 작성할 수 없습니다.' }, { status: 400 });
      }
    }

    // 6. 정상 등록
    const { data: newMessage, error } = await supabase
      .from('guestbook_messages')
      .insert({
        invitation_id: invitationId,
        name,
        content,
        password,
        is_private: isPrivate,
        client_id: clientId,
        ip_address: ip
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true, 
      message: {
        id: newMessage.id,
        name: newMessage.name,
        content: newMessage.content,
        password: newMessage.password,
        date: new Date(newMessage.created_at).toLocaleDateString('ko-KR').replace(/. /g, '.').replace(/.$/, ''),
        isPrivate: newMessage.is_private,
        clientId: newMessage.client_id
      }
    });
  } catch (error: any) {
    console.error('Error creating guestbook entry:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
