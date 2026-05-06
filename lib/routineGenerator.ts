import { BodyInfo, RoutineOutput, FitnessGoal, ActivityLevel } from '@/types/healthcare';

// ───────────────────────────────
// 상수 정의
// ───────────────────────────────
const DISCLAIMER =
  '이 내용은 일반적인 건강 관리 안내입니다. 개인의 건강 상태에 따라 다를 수 있으며, 의료 조언을 대체하지 않습니다.';

// ───────────────────────────────
// 운동 횟수 결정 (goal + activity)
// ───────────────────────────────
const WORKOUT_DAYS: Record<FitnessGoal, Record<ActivityLevel, number>> = {
  diet: { low: 3, medium: 4, high: 5 },
  tone: { low: 3, medium: 4, high: 5 },
  maintain: { low: 2, medium: 3, high: 4 },
};

// ───────────────────────────────
// 운동 포커스 결정
// ───────────────────────────────
const WORKOUT_FOCUS: Record<FitnessGoal, string[]> = {
  diet: ['유산소 운동 중심 (걷기, 자전거, 수영 등)', '전신 순환 운동', '근력 보조 운동'],
  tone: ['근력 운동 중심', '부위별 탄력 운동', '코어 강화 운동'],
  maintain: ['균형 잡힌 유산소 + 근력', '스트레칭 및 유연성 운동'],
};

// ───────────────────────────────
// 식단 가이드 결정
// ───────────────────────────────
const DIET_GUIDELINES: Record<FitnessGoal, string[]> = {
  diet: [
    '하루 세 끼 규칙적으로 식사하세요',
    '가공식품과 고당분 음식을 줄이세요',
    '채소와 단백질 위주로 구성하세요',
    '충분한 수분을 섭취하세요 (하루 1.5~2L)',
  ],
  tone: [
    '운동 후 단백질 섭취를 신경 쓰세요',
    '근육 회복을 위한 균형 잡힌 식사를 유지하세요',
    '극단적인 칼로리 제한은 피하세요',
    '충분한 수분을 섭취하세요',
  ],
  maintain: [
    '균형 잡힌 식단을 유지하세요',
    '폭식이나 극단적인 다이어트는 피하세요',
    '충분한 수분을 섭취하세요',
  ],
};

// ───────────────────────────────
// D-Day 기반 안내 메시지
// ───────────────────────────────
function getDdayNote(dday: number): string {
  if (dday > 90) return '충분한 시간이 있습니다. 꾸준히 루틴을 유지하는 것이 중요합니다.';
  if (dday > 60) return '목표를 향해 루틴을 이어가세요. 이 시기의 꾸준함이 중요합니다.';
  if (dday > 30) return '무리한 변화보다 현재 루틴을 안정적으로 유지하는 것을 권장합니다.';
  return '컨디션 관리에 집중하세요. 급격한 변화는 오히려 역효과일 수 있습니다.';
}

// ───────────────────────────────
// BMI 계산 (표시용만 사용)
// ───────────────────────────────
function calcBmi(height: number, weight: number): number {
  const heightM = height / 100;
  return Math.round((weight / (heightM * heightM)) * 10) / 10;
}

// ───────────────────────────────
// 메인 생성 함수
// ───────────────────────────────
export function generateRoutine(info: BodyInfo): RoutineOutput {
  const { goal, activityLevel, height, weight, weddingDday } = info;

  const bmi = calcBmi(height, weight);
  const ddayNote = getDdayNote(weddingDday);

  const workoutFocus = [
    ...WORKOUT_FOCUS[goal],
    ddayNote,
  ];

  const dietGuidelines = [
    ...DIET_GUIDELINES[goal],
  ];

  return {
    bmi,
    workoutDaysPerWeek: WORKOUT_DAYS[goal][activityLevel],
    workoutFocus,
    dietGuidelines,
    disclaimer: DISCLAIMER,
  };
}
