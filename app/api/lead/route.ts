import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { name, phone, category, budget, message, sourcePage, timestamp } = body;

    // 필수 필드 검증
    if (!name || !phone || !category || !timestamp) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // [Confirmed] MVP: 콘솔 출력
    // 추후 DB INSERT 또는 CRM API 호출로 교체
    console.log('[Lead Received]', {
      name,
      phone,
      category,
      budget,
      message: message ?? '',
      sourcePage,
      timestamp,
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('[Lead API Error]', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
