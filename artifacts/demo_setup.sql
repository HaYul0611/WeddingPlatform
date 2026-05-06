-- [시연 발표용 DB 설정 SQL]
-- Supabase SQL Editor에서 아래 내용을 복사하여 실행해 주세요.

-- 1. 업체(companies) 테이블 생성
create table if not exists companies (
  id uuid default gen_random_uuid() primary key,
  name text unique not null,
  category text not null, -- wedding, beauty, healthcare, medical
  phone text,
  kakao_link text,
  description text,
  region text,
  budget_min integer, -- 만원 단위
  budget_max integer,
  rating float8 default 5.0,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- 2. 상담(leads) 테이블에 상태(status) 컬럼 추가
alter table leads add column if not exists status text default 'new';

-- 3. 시연용 샘플 업체 데이터 삽입
insert into companies (name, category, region, description, phone, budget_min, budget_max, rating)
values 
  ('라포레 웨딩홀', 'wedding', '서울 강남', '강남 중심가의 품격 있는 호텔식 웨딩홀', '02-555-1234', 2000, 5000, 4.8),
  ('더 벨라 스튜디오', 'wedding', '서울 청담', '자연스러운 인물 중심의 웨딩 촬영 전문', '02-444-5678', 150, 300, 4.9),
  ('오하나 뷰티살롱', 'beauty', '서울 도산', '신부 메이크업 및 퍼스널 컬러 진단 전문', '02-333-9012', 50, 120, 4.9),
  ('청담 에스테틱', 'beauty', '서울 청담', '웨딩 전신 케어 및 피부 탄력 패키지', '02-222-3456', 80, 200, 4.8),
  ('메디핏 필라테스', 'healthcare', '서울 잠실', '체형 교정 및 드레스 라인 관리 전문', '010-1234-5678', 40, 100, 4.7),
  ('고운미 피부과', 'medical', '서울 신사', '물광 피부 및 웨딩 패키지 특화 피부과', '02-111-7890', 30, 150, 4.9)
on conflict (name) do nothing;
