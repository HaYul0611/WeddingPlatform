-- ============================================================
-- Migration v2: Lead Funnel 6단계 + Lead Score + Activity Log
-- ============================================================

-- 1. leads 테이블 상태값 확장 (기존 'new','contacted','completed' 유지)
ALTER TABLE leads
  DROP CONSTRAINT IF EXISTS leads_status_check;

ALTER TABLE leads
  ADD CONSTRAINT leads_status_check
  CHECK (status IN ('new', 'qualified', 'matched', 'contacted', 'completed', 'lost'));

-- 2. leads 테이블에 score 컬럼 추가
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS score smallint CHECK (score >= 0 AND score <= 100);

-- 기존 데이터에 기본 점수 부여 (새 리드는 API에서 자동 계산)
UPDATE leads SET score = 50 WHERE score IS NULL;

-- 3. lead_activities 테이블 생성 (활동 이력)
CREATE TABLE IF NOT EXISTS lead_activities (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id     text        NOT NULL,
  action      text        NOT NULL
              CHECK (action IN ('status_change', 'note_added', 'matched')),
  from_status text,
  to_status   text,
  note        text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lead_activities_lead_id
  ON lead_activities (lead_id);

CREATE INDEX IF NOT EXISTS idx_lead_activities_created_at
  ON lead_activities (created_at DESC);

-- RLS
ALTER TABLE lead_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "service role full access" ON lead_activities
  USING (true)
  WITH CHECK (true);

-- 4. companies 테이블 rating 컬럼 (이미 있으면 skip)
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS rating       numeric(3,1) CHECK (rating >= 1 AND rating <= 5),
  ADD COLUMN IF NOT EXISTS review_count int          DEFAULT 0;

-- ============================================================
-- 기존 'contacted' → 'qualified' 로 일부 변경 (선택사항)
-- 운영 중인 서버에서 상태 재분류 필요 시 아래 주석 해제
-- ============================================================
-- UPDATE leads SET status = 'qualified' WHERE status = 'contacted' AND created_at > NOW() - INTERVAL '30 days';
