import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { name, phone, category, budget, message, sourcePage, timestamp } = body;

    // 필수 필드 검증
    if (!name || !phone || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Supabase 'leads' 테이블에 저장
    const { error } = await supabase
      .from('leads')
      .insert([
        {
          name,
          phone,
          category,
          budget: budget ? parseInt(String(budget).replace(/\D/g, '')) : 0,
          message: message ?? '',
          source: sourcePage ?? 'unknown',
          created_at: timestamp ? new Date(timestamp).toISOString() : new Date().toISOString(),
        },
      ]);

    if (error) {
      console.error('[Supabase Insert Error]', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('[Lead API Error]', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 },
    );
  }
}
