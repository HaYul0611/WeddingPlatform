import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
      return NextResponse.json({ error: 'invitationId is required' }, { status: 400 });
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      // Mock data for demo purposes when supabase is not connected
      const mockImages = [
        {
          id: '1',
          invitation_id: 'preview',
          image_url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format&fit=crop',
          guest_name: '지수 친구',
          likes_count: 12,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          invitation_id: 'preview',
          image_url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop',
          guest_name: '민호 선배',
          likes_count: 5,
          created_at: new Date(Date.now() - 100000).toISOString()
        },
        {
          id: '3',
          invitation_id: 'preview',
          image_url: 'https://images.unsplash.com/photo-1532712938310-34cb3982ef74?q=80&w=800&auto=format&fit=crop',
          guest_name: '은지 하객',
          likes_count: 0,
          created_at: new Date(Date.now() - 200000).toISOString()
        }
      ];
      return NextResponse.json({ images: mockImages });
    }

    const supabase = getSupabase();
    
    // 1. Get images
    const { data: images, error: imagesError } = await supabase
      .from('photo_drop_images')
      .select('*')
      .eq('invitation_id', invitationId)
      .order('created_at', { ascending: false });

    if (imagesError) throw imagesError;

    // 2. Get likes counts
    const { data: likes, error: likesError } = await supabase
      .from('photo_drop_likes')
      .select('image_id, client_id');
      
    if (likesError) throw likesError;

    // 3. Get comments count
    const { data: comments, error: commentsError } = await supabase
      .from('photo_drop_comments')
      .select('image_id, id');

    if (commentsError) throw commentsError;

    // Aggregate data
    const aggregatedImages = images.map((img: any) => {
      const imgLikes = likes.filter((l: any) => l.image_id === img.id);
      const imgComments = comments.filter((c: any) => c.image_id === img.id);
      return {
        ...img,
        likesCount: imgLikes.length,
        likedByClients: imgLikes.map((l: any) => l.client_id),
        commentsCount: imgComments.length
      };
    });

    return NextResponse.json({ images: aggregatedImages });
  } catch (error: any) {
    console.error('Error fetching photo drop images:', error);
    // Return mock data on error as well to prevent infinite loading
    const mockImages = [
      {
        id: '1',
        invitation_id: 'preview',
        image_url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format&fit=crop',
        guest_name: '지수 친구',
        likes_count: 12,
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        invitation_id: 'preview',
        image_url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop',
        guest_name: '민호 선배',
        likes_count: 5,
        created_at: new Date(Date.now() - 100000).toISOString()
      }
    ];
    return NextResponse.json({ images: mockImages });
  }
}

export async function POST(request: Request) {
  try {
    const { invitationId, url, uploaderName } = await request.json();

    if (!invitationId || !url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('photo_drop_images')
      .insert({
        invitation_id: invitationId,
        url,
        uploader_name: uploaderName || '익명 하객',
        view_count: 0
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ image: data });
  } catch (error: any) {
    console.error('Error uploading photo drop image:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
