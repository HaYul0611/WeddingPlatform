-- companies 테이블에 rating, review_count 컬럼 추가
-- 기존 companies 테이블이 있을 경우 실행

ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS rating       numeric(3,1) check (rating >= 1 and rating <= 5),
  ADD COLUMN IF NOT EXISTS review_count int          default 0;

-- 기존 샘플 데이터에 rating 반영 (선택)
UPDATE companies SET rating = 4.8, review_count = 214 WHERE name = '화이트데이 웨딩';
UPDATE companies SET rating = 4.6, review_count = 178 WHERE name = '로열웨딩 스튜디오';
UPDATE companies SET rating = 4.5, review_count = 132 WHERE name = '블룸 가든 웨딩';
UPDATE companies SET rating = 4.7, review_count = 341 WHERE name = '강남 글로우 피부과';
UPDATE companies SET rating = 4.4, review_count = 89  WHERE name = '서울 리프팅 클리닉';
UPDATE companies SET rating = 4.3, review_count = 156 WHERE name = '부산 스킨케어 센터';
UPDATE companies SET rating = 4.9, review_count = 267 WHERE name = '웨딩핏 PT 센터';
UPDATE companies SET rating = 4.5, review_count = 122 WHERE name = '다이어트 메디컬센터';
UPDATE companies SET rating = 4.2, review_count = 88  WHERE name = '바디플랜 피트니스';
UPDATE companies SET rating = 4.6, review_count = 195 WHERE name = '웨딩 덴탈케어';
UPDATE companies SET rating = 4.1, review_count = 73  WHERE name = '경기 뷰티 클리닉';
UPDATE companies SET rating = 4.7, review_count = 201 WHERE name = '미니멀 포토그레이';
