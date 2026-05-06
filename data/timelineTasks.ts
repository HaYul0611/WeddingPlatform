export interface TimelineTask {
  id: string;
  milestone: 'D-90' | 'D-60' | 'D-30' | 'D-14' | 'D-7';
  daysFromNow: number;          // milestone 기준 일수
  title: string;
  description: string;
  category: 'wedding' | 'beauty' | 'healthcare' | 'admin';
  hasCTA: boolean;              // 상담 CTA 연결 여부
}

export const timelineTasks: TimelineTask[] = [
  // D-90
  {
    id: 'task-001',
    milestone: 'D-90',
    daysFromNow: 90,
    title: '웨딩 패키지 비교 시작',
    description: '스튜디오, 드레스, 메이크업 패키지를 비교해보세요.',
    category: 'wedding',
    hasCTA: true,
  },
  {
    id: 'task-002',
    milestone: 'D-90',
    daysFromNow: 90,
    title: '피부 관리 시작',
    description: '결혼 전 피부 컨디션 개선을 위한 케어를 시작하기 좋은 시기입니다.',
    category: 'beauty',
    hasCTA: true,
  },
  {
    id: 'task-003',
    milestone: 'D-90',
    daysFromNow: 90,
    title: '건강 관리 루틴 설정',
    description: '목표 체형을 위한 운동 및 식단 루틴을 설정해보세요.',
    category: 'healthcare',
    hasCTA: false,
  },

  // D-60
  {
    id: 'task-004',
    milestone: 'D-60',
    daysFromNow: 60,
    title: '웨딩 업체 상담 진행',
    description: '관심 있는 업체에 실제 상담을 진행해보세요.',
    category: 'wedding',
    hasCTA: true,
  },
  {
    id: 'task-005',
    milestone: 'D-60',
    daysFromNow: 60,
    title: '시술 타이밍 확인',
    description: '회복 기간이 필요한 뷰티 시술은 지금 시작하기 적당한 시기입니다.',
    category: 'beauty',
    hasCTA: true,
  },
  {
    id: 'task-006',
    milestone: 'D-60',
    daysFromNow: 60,
    title: '체중 관리 중간 점검',
    description: '현재 루틴이 목표에 맞게 진행되고 있는지 점검해보세요.',
    category: 'healthcare',
    hasCTA: false,
  },

  // D-30
  {
    id: 'task-007',
    milestone: 'D-30',
    daysFromNow: 30,
    title: '드레스 피팅 일정 확인',
    description: '드레스 최종 피팅 일정을 업체와 조율하세요.',
    category: 'wedding',
    hasCTA: false,
  },
  {
    id: 'task-008',
    milestone: 'D-30',
    daysFromNow: 30,
    title: '피부 집중 케어',
    description: '부담이 적은 기초 스킨케어 위주로 마무리 관리를 진행하세요.',
    category: 'beauty',
    hasCTA: true,
  },
  {
    id: 'task-009',
    milestone: 'D-30',
    daysFromNow: 30,
    title: '식단 조절 강화',
    description: '건강한 식단을 유지하며 컨디션 관리에 집중하세요.',
    category: 'healthcare',
    hasCTA: false,
  },

  // D-14
  {
    id: 'task-010',
    milestone: 'D-14',
    daysFromNow: 14,
    title: '최종 준비 리스트 점검',
    description: '예식 관련 준비사항을 최종적으로 확인하세요.',
    category: 'admin',
    hasCTA: false,
  },
  {
    id: 'task-011',
    milestone: 'D-14',
    daysFromNow: 14,
    title: '메이크업 리허설',
    description: '웨딩 당일 메이크업 리허설을 진행해보세요.',
    category: 'beauty',
    hasCTA: false,
  },

  // D-7
  {
    id: 'task-012',
    milestone: 'D-7',
    daysFromNow: 7,
    title: '충분한 수면과 수분 섭취',
    description: '컨디션 관리에 집중하세요. 새로운 시술이나 화장품 사용은 피하세요.',
    category: 'healthcare',
    hasCTA: false,
  },
  {
    id: 'task-013',
    milestone: 'D-7',
    daysFromNow: 7,
    title: '최종 업체 연락',
    description: '모든 예약 업체에 최종 확인 연락을 취하세요.',
    category: 'wedding',
    hasCTA: false,
  },
];
