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

    // supabase RPC or simple select -> update
    const { data: img, error: fetchError } = await supabase
      .from('photo_drop_images')
      .select('view_count')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    const newViewCount = (img.view_count || 0) + 1;

    const { error: updateError } = await supabase
      .from('photo_drop_images')
      .update({ view_count: newViewCount })
      .eq('id', id);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, viewCount: newViewCount });
  } catch (error: any) {
    console.error('Error incrementing view count:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
