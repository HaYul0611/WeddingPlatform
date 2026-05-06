import { Lead, Company, LeadCategory, LeadStatus, BudgetKey, StatsData } from '@/types/crm';

// ─────────────────────────────────────────
// 데모 업체 (12개)
// ─────────────────────────────────────────
export const DEMO_COMPANIES: Company[] = [
  {
    id: 'dc-001', name: '화이트데이 웨딩', category: 'wedding',
    phone: '02-1234-5678', kakao_link: 'https://open.kakao.com/o/whiteday',
    description: '강남 웨딩 전문 업체. 스튜디오·드레스·메이크업 원스톱 패키지. 합리적 가격으로 만족도 높은 서비스를 제공합니다.',
    region: '서울 강남', budget_min: 150, budget_max: 400,
    rating: 4.8, review_count: 214, is_active: true, created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'dc-002', name: '로열웨딩 스튜디오', category: 'wedding',
    phone: '02-2345-6789', kakao_link: 'https://open.kakao.com/o/royalwedding',
    description: '20년 경력의 프리미엄 웨딩팀. 풀패키지부터 스냅 촬영까지 다양한 옵션.',
    region: '서울 송파', budget_min: 300, budget_max: 800,
    rating: 4.6, review_count: 178, is_active: true, created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'dc-003', name: '블룸 가든 웨딩', category: 'wedding',
    phone: '031-345-7890', kakao_link: 'https://open.kakao.com/o/bloomgarden',
    description: '경기 대형 가든 웨딩 전문. 야외·실내 복합 공간에서 자연 컨셉 웨딩.',
    region: '경기 성남', budget_min: 200, budget_max: 500,
    rating: 4.5, review_count: 132, is_active: true, created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'dc-004', name: '강남 글로우 피부과', category: 'beauty',
    phone: '02-5678-9012', kakao_link: 'https://open.kakao.com/o/glowclinic',
    description: '레이저 토닝, 필러, 리프팅 전문 피부과. 웨딩 전 피부 집중 케어 프로그램 운영.',
    region: '서울 강남', budget_min: 50, budget_max: 500,
    rating: 4.7, review_count: 341, is_active: true, created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'dc-005', name: '서울 리프팅 클리닉', category: 'beauty',
    phone: '02-6789-0123', kakao_link: 'https://open.kakao.com/o/liftingclinic',
    description: '리프팅·필러 전문. 경험 많은 전문의가 상담부터 시술까지 담당합니다.',
    region: '서울 강서', budget_min: 200, budget_max: 1500,
    rating: 4.4, review_count: 89, is_active: true, created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'dc-006', name: '부산 스킨케어 센터', category: 'beauty',
    phone: '051-789-0234', kakao_link: 'https://open.kakao.com/o/busanskin',
    description: '부산 지역 대표 피부관리 센터. 기초 케어부터 레이저까지 웨딩 전 맞춤 관리.',
    region: '부산 해운대', budget_min: 40, budget_max: 300,
    rating: 4.3, review_count: 156, is_active: true, created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'dc-007', name: '웨딩핏 PT 센터', category: 'healthcare',
    phone: '02-8901-2345', kakao_link: 'https://open.kakao.com/o/weddingfit',
    description: '웨딩 전 체형 관리 PT 전문 센터. 1:1 맞춤 운동 + 식단 코칭 제공.',
    region: '서울 강남', budget_min: 30, budget_max: 200,
    rating: 4.9, review_count: 267, is_active: true, created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'dc-008', name: '다이어트 메디컬센터', category: 'healthcare',
    phone: '02-9012-3456', kakao_link: 'https://open.kakao.com/o/dietmedical',
    description: '의학적 체중 관리 전문. 호르몬·대사 검사 후 개인 맞춤 관리.',
    region: '서울 송파', budget_min: 100, budget_max: 600,
    rating: 4.5, review_count: 122, is_active: true, created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'dc-009', name: '바디플랜 피트니스', category: 'healthcare',
    phone: '02-0123-4567', kakao_link: 'https://open.kakao.com/o/bodyplan',
    description: '그룹 PT + 개인 PT 병행 프로그램. 웨딩 D-90 전용 패키지 운영.',
    region: '서울 마포', budget_min: 20, budget_max: 150,
    rating: 4.2, review_count: 88, is_active: true, created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'dc-010', name: '웨딩 덴탈케어', category: 'medical',
    phone: '02-1234-5670', kakao_link: 'https://open.kakao.com/o/weddingdental',
    description: '웨딩 전 치아 미백, 라미네이트 전문. 당일 상담 가능.',
    region: '서울 서초', budget_min: 80, budget_max: 500,
    rating: 4.6, review_count: 195, is_active: true, created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'dc-011', name: '경기 뷰티 클리닉', category: 'medical',
    phone: '031-234-5678', kakao_link: 'https://open.kakao.com/o/gyeonggibeauty',
    description: '피부과·성형 관련 시술 정보 안내 및 상담 전문 클리닉.',
    region: '경기 성남', budget_min: 50, budget_max: 1000,
    rating: 4.1, review_count: 73, is_active: true, created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 'dc-012', name: '미니멀 포토그레이', category: 'wedding',
    phone: '02-4567-8901', kakao_link: 'https://open.kakao.com/o/photogrey',
    description: '미니멀 웨딩 전문. 자연스러운 편집과 빠른 일정으로 만족도 높은 서비스.',
    region: '서울 마포', budget_min: 100, budget_max: 250,
    rating: 4.7, review_count: 201, is_active: true, created_at: '2024-01-01T00:00:00Z',
  },
];

// ─────────────────────────────────────────
// 데모 리드 (25개)
// ─────────────────────────────────────────
const NAMES   = ['김민준','이서연','박지훈','최수아','정도윤','강민서','조예린','윤재현','임하은','한소희','신동혁','권나리','오준혁','배유진','송민지','류채원','문지호','안세진','황지민','심은지','차준호','노아린','구세현','백다영','엄태준'];
const PHONES  = ['010-2345-6789','010-3456-7890','010-4567-8901','010-5678-9012','010-6789-0123','010-7890-1234','010-8901-2345','010-9012-3456','010-1122-3344','010-2233-4455','010-3344-5566','010-4455-6677','010-5566-7788','010-6677-8899','010-7788-9900','010-8899-0011','010-9900-1122','010-1234-9876','010-2345-8765','010-3456-7654','010-4567-6543','010-5678-5432','010-6789-4321','010-7890-3210','010-8901-2109'];
const PAGES   = ['landing', 'hero', 'dashboard', 'beauty', 'healthcare', 'wedding', 'feature-웨딩', 'feature-뷰티', 'floating-cta', 'header'];
const CATS:   LeadCategory[] = ['wedding','beauty','healthcare','medical','wedding','beauty','wedding','healthcare','wedding','beauty','medical','healthcare','wedding','beauty','wedding','healthcare','beauty','wedding','medical','healthcare','wedding','beauty','wedding','healthcare','wedding'];
const STATS:  LeadStatus[]   = ['new','new','contacted','completed','new','contacted','new','completed','new','new','contacted','completed','new','contacted','new','new','completed','contacted','new','new','contacted','new','completed','new','contacted'];
const BUDGETS: BudgetKey[]   = ['500_1000','1000_3000','under_500','1000_3000','undecided','500_1000','1000_3000','under_500','over_3000','500_1000','undecided','1000_3000','500_1000','under_500','1000_3000','undecided','500_1000','over_3000','1000_3000','under_500','500_1000','1000_3000','undecided','500_1000','over_3000'];
const MSGS = [
  '결혼 준비를 시작하려는데 어디서부터 해야 할지 막막합니다. 상담 부탁드립니다.',
  '웨딩 사진 스타일이 미니멀한 편을 원하는데 관련 패키지 있나요?',
  '피부 관리를 시작하려고 합니다. 결혼 전 6개월 남았어요.',
  '다이어트 관리 문의입니다. 목표 체중은 5kg 감량이에요.',
  '',
  '레이저 토닝 시술 가격 문의드립니다.',
  '웨딩홀 선택부터 스튜디오, 드레스 모두 패키지로 진행하고 싶어요.',
  '운동 시작하려는데 주 3회 정도 할 수 있을 것 같아요.',
  '치아 미백 상담 원합니다. 결혼식 3개월 전이에요.',
  '',
  '필러 시술 정보 문의드립니다. 비용이 어느 정도 되나요?',
  '예산은 150만원 정도로 생각하고 있어요.',
  '스드메 패키지 중 가장 인기 있는 것으로 추천해 주세요.',
  '리프팅 시술 후 회복 기간이 얼마나 걸리나요?',
  '가을 예식 준비 중인데 6월부터 시작해도 될까요?',
  '',
  '체중 관리와 운동 루틴 함께 받을 수 있나요?',
  '결혼 준비를 2인이 같이 상담받을 수 있는지 궁금합니다.',
  '의료 시술은 처음이라 걱정이 많아요. 자세한 상담 원해요.',
  '운동 경험은 없지만 PT 받아보고 싶어요.',
  '드레스 피팅 일정도 같이 잡을 수 있나요?',
  '강남 지역 업체 위주로 알아보고 있어요.',
  '',
  '헬스케어 관련 전반적인 상담을 받고 싶어요.',
  '예산 조정이 가능한지 먼저 상담해보고 싶습니다.',
];

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60), 0, 0);
  return d.toISOString();
}

export const DEMO_LEADS: Lead[] = NAMES.map((name, i) => ({
  id:          `demo-lead-${String(i + 1).padStart(3, '0')}`,
  name,
  phone:       PHONES[i],
  category:    CATS[i],
  budget:      BUDGETS[i],
  message:     MSGS[i] || undefined,
  source_page: PAGES[i % PAGES.length],
  created_at:  daysAgo(i * 1.2),
  status:      STATS[i],
}));

// ─────────────────────────────────────────
// 통계 계산
// ─────────────────────────────────────────
export function getDemoStats(): StatsData {
  return {
    total:     DEMO_LEADS.length,
    new:       DEMO_LEADS.filter((l) => l.status === 'new').length,
    contacted: DEMO_LEADS.filter((l) => l.status === 'contacted').length,
    completed: DEMO_LEADS.filter((l) => l.status === 'completed').length,
  };
}

// ─────────────────────────────────────────
// 필터 + 페이지네이션
// ─────────────────────────────────────────
export function filterDemoLeads(
  leads: Lead[],
  opts: { status?: string; category?: string; search?: string; page?: number; pageSize?: number },
): { data: Lead[]; total: number } {
  let result = [...leads];

  if (opts.status && opts.status !== 'all')
    result = result.filter((l) => l.status === opts.status);
  if (opts.category && opts.category !== 'all')
    result = result.filter((l) => l.category === opts.category);
  if (opts.search) {
    const q = opts.search.toLowerCase();
    result = result.filter(
      (l) => l.name.includes(q) || l.phone.replace(/-/g, '').includes(q.replace(/-/g, '')),
    );
  }

  const total    = result.length;
  const page     = opts.page ?? 1;
  const pageSize = opts.pageSize ?? 12;
  const start    = (page - 1) * pageSize;

  return { data: result.slice(start, start + pageSize), total };
}

// ─────────────────────────────────────────
// 매칭 로직 (demo)
// ─────────────────────────────────────────
const BUDGET_RANGE: Record<string, { min: number; max: number }> = {
  under_500:   { min: 0,   max: 50   },
  '500_1000':  { min: 50,  max: 100  },
  '1000_3000': { min: 100, max: 300  },
  over_3000:   { min: 300, max: 99999 },
  undecided:   { min: 0,   max: 99999 },
};

export function getDemoMatches(category: string, budget: string): Company[] {
  const range = BUDGET_RANGE[budget] ?? BUDGET_RANGE.undecided;

  return DEMO_COMPANIES.filter((c) => {
    if (c.category !== category || !c.is_active) return false;
    if (budget === 'undecided') return true;
    const bMin = c.budget_min ?? 0;
    const bMax = c.budget_max ?? 99999;
    return bMin <= range.max && bMax >= range.min;
  }).slice(0, 5);
}
