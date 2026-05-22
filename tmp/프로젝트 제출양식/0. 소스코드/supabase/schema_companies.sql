-- ============================================================
-- companies 테이블
-- ============================================================
create table companies (
  id           uuid        primary key default gen_random_uuid(),
  name         text        not null,
  category     text        not null
                           check (category in ('wedding', 'beauty', 'healthcare', 'medical')),
  phone        text,
  kakao_link   text,                          -- https://open.kakao.com/o/... 형태
  description  text,
  region       text,
  budget_min   int,                           -- 만원 단위 (예: 50 = 50만원)
  budget_max   int,                           -- null = 상한 없음
  is_active    boolean     not null default true,
  created_at   timestamptz not null default now()
);

-- 인덱스 (카테고리 기준 매칭 쿼리 최적화)
create index idx_companies_category  on companies (category);
create index idx_companies_is_active on companies (is_active);

-- RLS 정책 (service_role key 사용 시 bypass됨)
alter table companies enable row level security;

create policy "service role full access" on companies
  using (true)
  with check (true);


-- ============================================================
-- 샘플 데이터
-- ============================================================

-- 웨딩 (wedding)
insert into companies (name, category, phone, kakao_link, description, region, budget_min, budget_max) values
(
  '화이트데이 웨딩',
  'wedding',
  '02-1234-5678',
  'https://open.kakao.com/o/whiteday',
  '강남 지역 웨딩 전문 업체. 스튜디오·드레스·메이크업 원스톱 패키지 제공. 합리적인 가격으로 많은 분들이 선택합니다.',
  '서울 강남',
  150, 400
),
(
  '로열웨딩 스튜디오',
  'wedding',
  '02-2345-6789',
  'https://open.kakao.com/o/royalwedding',
  '20년 경력의 전문 웨딩팀. 프리미엄 풀패키지부터 스냅 촬영까지 다양한 옵션 제공.',
  '서울 송파',
  300, 800
),
(
  '블룸 가든 웨딩',
  'wedding',
  '031-345-7890',
  'https://open.kakao.com/o/bloomgarden',
  '경기 지역 대형 가든 웨딩 전문. 야외·실내 복합 공간에서 자연 컨셉 웨딩 진행.',
  '경기 성남',
  200, 500
),
(
  '미니멀 포토그레이',
  'wedding',
  '02-4567-8901',
  'https://open.kakao.com/o/photogrey',
  '불필요한 요소를 덜어낸 미니멀 웨딩 전문. 빠른 촬영과 자연스러운 편집을 지향합니다.',
  '서울 마포',
  100, 250
),

-- 뷰티 (beauty)
(
  '강남 글로우 피부과',
  'beauty',
  '02-5678-9012',
  'https://open.kakao.com/o/glowclinic',
  '레이저 토닝, 필러, 리프팅 전문 피부과. 웨딩 전 피부 컨디션 집중 케어 프로그램 운영.',
  '서울 강남',
  50, 500
),
(
  '서울 리프팅 클리닉',
  'beauty',
  '02-6789-0123',
  'https://open.kakao.com/o/liftingclinic',
  '리프팅·필러 전문 클리닉. 경험 많은 전문의가 상담부터 시술까지 담당합니다.',
  '서울 강서',
  200, 1500
),
(
  '부산 스킨케어 센터',
  'beauty',
  '051-789-0234',
  'https://open.kakao.com/o/busanskin',
  '부산 지역 대표 피부관리 센터. 기초 케어부터 레이저까지 웨딩 전 맞춤 관리.',
  '부산 해운대',
  40, 300
),

-- 건강관리 (healthcare)
(
  '웨딩핏 PT 센터',
  'healthcare',
  '02-8901-2345',
  'https://open.kakao.com/o/weddingfit',
  '웨딩 전 체형 관리 전문 PT 센터. 1:1 맞춤 운동 프로그램 + 식단 코칭 함께 제공.',
  '서울 강남',
  30, 200
),
(
  '다이어트 메디컬센터',
  'healthcare',
  '02-9012-3456',
  'https://open.kakao.com/o/dietmedical',
  '의학적 접근의 체중 관리 전문 센터. 호르몬·대사 검사 후 개인 맞춤 관리 진행.',
  '서울 송파',
  100, 600
),
(
  '바디플랜 피트니스',
  'healthcare',
  '02-0123-4567',
  'https://open.kakao.com/o/bodyplan',
  '그룹 PT + 개인 PT 병행 프로그램. 웨딩 D-90 전용 패키지 운영.',
  '서울 마포',
  20, 150
),

-- 의료 (medical)
(
  '웨딩 덴탈케어',
  'medical',
  '02-1234-5670',
  'https://open.kakao.com/o/weddingdental',
  '웨딩 전 치아 미백, 라미네이트 전문 치과. 당일 상담 가능, 빠른 일정 진행.',
  '서울 서초',
  80, 500
),
(
  '경기 뷰티 클리닉',
  'medical',
  '031-234-5678',
  'https://open.kakao.com/o/gyeonggibeauty',
  '시술 정보 안내 및 상담 전문 클리닉. 피부과·성형 관련 일반 정보 제공.',
  '경기 성남',
  50, 1000
);


-- ============================================================
-- leads 테이블 확인 (status 컬럼 없으면 아래 실행)
-- ============================================================
-- alter table leads
--   add column if not exists status text not null default 'new'
--   check (status in ('new', 'contacted', 'completed'));
