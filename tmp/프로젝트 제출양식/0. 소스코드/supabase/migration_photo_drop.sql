-- 포토 드롭 관련 테이블 생성 스크립트 (V2)

-- 1. 사진 테이블
CREATE TABLE IF NOT EXISTS public.photo_drop_images (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    invitation_id TEXT NOT NULL, 
    url TEXT NOT NULL,
    uploader_name TEXT DEFAULT '익명 하객',
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 사진 좋아요 테이블
CREATE TABLE IF NOT EXISTS public.photo_drop_likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    image_id UUID REFERENCES public.photo_drop_images(id) ON DELETE CASCADE,
    client_id TEXT NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(image_id, client_id)
);

-- 3. 댓글 테이블 (대댓글 포함, 보안 및 신고 기능 추가)
CREATE TABLE IF NOT EXISTS public.photo_drop_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    image_id UUID REFERENCES public.photo_drop_images(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES public.photo_drop_comments(id) ON DELETE CASCADE, 
    author_name TEXT DEFAULT '하객',
    content TEXT NOT NULL,
    client_id TEXT, -- 작성자 기기 식별 (비회원 인증용)
    password TEXT,  -- 4자리 비밀번호 (타 기기 수정/삭제용)
    report_count INTEGER DEFAULT 0, -- 신고 누적 횟수
    is_hidden BOOLEAN DEFAULT false, -- 숨김 처리 여부 (신고 누적 시 true)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 댓글 좋아요 테이블
CREATE TABLE IF NOT EXISTS public.photo_drop_comment_likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    comment_id UUID REFERENCES public.photo_drop_comments(id) ON DELETE CASCADE,
    client_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(comment_id, client_id)
);

-- 5. 차단된 사용자 테이블 (신고 누적으로 차단된 기기 식별자)
CREATE TABLE IF NOT EXISTS public.photo_drop_banned_clients (
    client_id TEXT PRIMARY KEY,
    reason TEXT DEFAULT '누적 신고로 인한 자동 차단',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 설정 생략 (필요시 추가)
