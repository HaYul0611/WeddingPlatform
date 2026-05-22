import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data: companies, error } = await supabase
      .from('companies')
      .select('id, name')
      .order('name', { ascending: true });

    if (error) {
      if (error.code === 'PGRST116' || error.code === '42P01') return NextResponse.json({ success: true, data: [] });
      throw error;
    }
    return NextResponse.json({ success: true, data: companies });
  } catch (err) {
    console.error('[Public Company List API Error]', err);
    return NextResponse.json({ success: false, error: '목록을 불러오지 못했습니다.' }, { status: 500 });
  }
}
