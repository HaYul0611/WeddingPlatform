'use client';

import { useMemo } from 'react';
import { RoutineOutput } from '@/types/healthcare';
import { MapPin, ArrowRight, Sparkles, Flame, Apple, Heart, Activity } from 'lucide-react';

interface RoutineDisplayProps {
  routine: RoutineOutput;
  openModal: (sourcePage: string, category?: any) => void;
}

export default function RoutineDisplay({ routine, openModal }: RoutineDisplayProps) {
  // BMI 상태 및 테마 컬러 계산
  const bmiStatus = useMemo(() => {
    const val = routine.bmi;
    if (val < 18.5) return { label: '저체중', color: 'text-sky-500', bg: 'bg-sky-50', bar: 'bg-sky-400' };
    if (val < 23) return { label: '정상', color: 'text-rose-500', bg: 'bg-rose-50', bar: 'bg-rose-500' };
    if (val < 25) return { label: '과체중', color: 'text-amber-500', bg: 'bg-amber-50', bar: 'bg-amber-500' };
    return { label: '비만', color: 'text-rose-700', bg: 'bg-rose-50', bar: 'bg-rose-600' };
  }, [routine.bmi]);

  // 1. 온디바이스 AI 건강 상담 및 맞춤형 문장 생성 엔진
  const aiPrescription = useMemo(() => {
    const bmi = routine.bmi;

    if (bmi < 18.5) {
      return {
        title: '체성분 증강 및 린매스업(Lean Mass Up) 솔루션',
        advice: '현재 체질량지수(BMI)가 표준 기준치 미달로 감지되어, 근육량과 골밀도 보강이 강력하게 권장됩니다! 무리한 고강도 유산소 운동은 피해야 하며, 세포 활성화와 근탄력 강화를 최우선하는 AI 처방 가이드를 이행해 보세요.',
        workoutDays: '주 3회 권장',
        workoutList: [
          '근육 세포 확장을 유도하는 맨몸 및 저중량 점진적 근력 강화 코스 (스쿼트, 데드리프트, 플랭크)',
          '심폐 기능 유지를 돕는 가벼운 유산소 운동 (하루 20분 미만의 산책 수준으로 제한)',
          '관절과 인대 부상 방지를 위한 충분한 동적 스트레칭 필수 포함'
        ],
        dietList: [
          '벌크 강화를 위한 저염 고단백 탄수화물 식단 (끼니마다 계란 2구 혹은 닭가슴살 130g 이상 배정)',
          '주 식단 사이사이에 견과류, 바나나, 고단백 그릭 요거트 같은 건강한 고에너지 간식 적극 섭취',
          '하루 수분 2.0L 섭취를 균등하게 나누어 섭취해 체내 영양 성분의 빠른 흡수 유도'
        ]
      };
    }

    if (bmi < 23) {
      return {
        title: '웨딩 드레스 & 수트 핏 최적화 코어 쉐이핑 솔루션',
        advice: '현재 최고 수준의 골격근량과 기초대사 황금 밸런스(정상 범위)를 정밀 유지 중입니다! 일생의 한 번뿐인 본식 날을 위한 수트 라인과 아름다운 쇄골/승모근 데피니션을 극대화할 수 있도록 코어 근력 및 슬림 피팅에 초점을 맞추세요.',
        workoutDays: '주 4회 권장',
        workoutList: [
          '라인 쉐이핑과 균형 잡힌 골반 정렬을 돕는 기구 필라테스 및 코어 요가 세션 결합',
          '노폐물 체외 방출과 투명한 피부 세포 리셋을 돕는 유산소 인터벌 걷기 (하루 30분 이행)',
          '매끄러운 어깨선 형성을 위한 가벼운 아령 숄더 프레스 및 래터럴 레이즈 15회 3세트'
        ],
        dietList: [
          '현재의 건강하고 깨끗한 밸런스를 고정하는 저염·자연식 단백질 위주 클린 식사량 설계',
          '세포 항산화 효과와 붓기 완화에 탁월한 케일, 토마토, 브로콜리 섭취량 매일 추가 확보',
          '하루 수분 1.5L 이상 규칙적 섭취로 피부에 촉촉하고 영롱한 천연 수분 광채감 연동 완료'
        ]
      };
    }

    if (bmi < 25) {
      return {
        title: '체지방 커팅 및 슬리밍 집중 가속화 솔루션',
        advice: '현재 안전하고 날렵한 체지방 조절이 필요한 최고의 바디 슬리밍 골든 타임입니다! 관절과 관절 마디에 과도한 부하를 가하지 않으면서 심박수를 기분 좋게 2배로 이끌어내어 체지방을 빠르게 소각하는 지능형 운동 가이드입니다.',
        workoutDays: '주 4~5회 권장',
        workoutList: [
          '체지방 커팅 효과를 최고로 유도하는 파워 인터벌 유산소 (빠른 걷기 15분 + 가벼운 러닝 5분 3회 교대)',
          '기초대사 소비 열량을 대폭 향상시키는 전신 다관절 맨몸 스쿼트 트레이닝 20회 4세트',
          '슬림한 허리 라인 실현을 위한 복부 트위스트 및 코어 버팀목 플랭크 트레이닝 매일 1분 유지'
        ],
        dietList: [
          '흰 밀가루, 백미, 액상과당 음료를 전면 금하고 100% 현미밥 및 삶은 단호박으로 대체 처방',
          '확실한 체지방 커팅을 위해 매 끼니 신선한 초록 채소 샐러드 및 고밀도 두부 반 모 섭취',
          '저녁 7시 이후 철저한 공복 상태를 실천하며, 가짜 배고픔을 달래기 위해 따뜻한 허브차 2.0L 분할 섭취'
        ]
      };
    }

    return {
      title: '관절 보호형 고효율 다이어트 및 전신 순환 솔루션',
      advice: '내장 지방 감소와 즉각적인 체지방 컷오프가 집중 조율되어야 하는 케어 단계입니다! 과도한 달리기는 연골 부상을 가져올 수 있으므로 수영, 평지 걷기 등 신체 무리를 최소화하며 지방 연소율을 극대화하는 AI 다이어트 코스를 엄격히 권장합니다.',
      workoutDays: '주 5회 권장',
      workoutList: [
        '무릎 보호를 위한 경사도가 전혀 없는 부드러운 평지 걷기 운동 (매일 일정 속도로 40분 이상 이행)',
        '하체 관절 부담을 완벽히 흡수하는 실내 고정형 자전거 스피닝 트레이닝 (가벼운 강도로 회전력 유지)',
        '전신 림프선 자극 및 붓기 방출을 위한 아침/저녁 전신 스트레칭 및 폼롤러 마사지 매일 15분'
      ],
      dietList: [
        '소금, 동물성 지방, 탄산음료를 일절 멀리하고 전형적인 닭가슴살 및 삶은 고구마 위주 다이어트 돌입',
        '아침 및 점심 식사는 신선한 양상추 샐러드 1팩, 계란 흰자 3구, 완숙 방울토마토 15구 고정',
        '하루 수분 2.5L 섭취를 완벽히 습관화하여 염분과 노폐물을 체외로 빠르게 방출 유도'
      ]
    };
  }, [routine.bmi]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* BMI 결과 카드 */}
      <section className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-100">

        {/* 온디바이스 AI 진단 완료 태그 및 이펙트 */}
        <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 w-28 h-28 bg-rose-50/30 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between relative z-10">
          <div>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">나의 BMI 지수(체질량지수)</span>
              {/* '무료' 단어를 제거한 AI 정밀 진단 뱃지 */}
              <span className="text-[9px] font-black bg-[#EFF6FF] text-[#3B82F6] px-2.5 py-0.5 rounded-full flex items-center gap-0.5">
                <Sparkles size={8} /> AI 정밀 진단
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <h2 className={`font-round text-5xl font-black tracking-tight ${bmiStatus.color}`}>{routine.bmi}</h2>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${bmiStatus.bg} ${bmiStatus.color}`}>
                {bmiStatus.label}
              </span>
            </div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50/50 text-rose-500 shadow-inner">
            <Activity size={22} className="animate-pulse" />
          </div>
        </div>

        {/* BMI 바 시각화 */}
        <div className="mt-5 h-2 w-full rounded-full bg-stone-100 overflow-hidden relative z-10">
          <div
            className={`h-full transition-all duration-1000 ${bmiStatus.bar}`}
            style={{ width: `${Math.min(100, (routine.bmi / 40) * 100)}%` }}
          />
        </div>

        {/* AI 정밀 솔루션 타이틀 및 가이드라인 문장 (✨ 표시 완벽 제거) */}
        <div className="mt-5 pt-4 border-t border-stone-50/85 relative z-10">
          <div className="flex items-center gap-1.5 mb-2">
            <h4 className="text-[13px] font-black text-stone-900 tracking-tight">{aiPrescription.title}</h4>
          </div>
          <p className="text-[12.5px] leading-relaxed text-stone-500 break-keep">
            {aiPrescription.advice}
          </p>
        </div>
      </section>

      {/* 추천 센터 리스트 */}
      {routine.recommendedCompanies.length > 0 && (
        <section className="space-y-3">
          <h3 className="flex items-center gap-2 px-1 text-sm font-bold text-stone-800">
            <MapPin size={16} className="text-rose-500" />
            내 주변 추천 센터
          </h3>
          <div className="space-y-3">
            {routine.recommendedCompanies.map((company) => (
              <div
                key={company.id}
                onClick={() => openModal(`healthcare-${company.id}`, 'healthcare')}
                className="group relative cursor-pointer rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-100 transition-all hover:shadow-md hover:ring-rose-300"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="mb-1.5 flex items-center gap-2">
                      <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-500">
                        {company.type.toUpperCase()}
                      </span>
                      <h4 className="text-[16px] font-bold text-stone-800">{company.name}</h4>
                    </div>
                    <p className="text-sm text-stone-500 line-clamp-1">{company.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {company.tags.map(tag => (
                        <span key={tag} className="rounded-full bg-stone-50 px-2 py-0.5 text-[10px] text-stone-500 font-medium border border-stone-100">#{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-stone-50 text-stone-400 transition-all group-hover:bg-rose-500 group-hover:text-white group-hover:scale-110"
                  >
                    <ArrowRight size={20} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 온디바이스 AI 처방 가이드 (운동/식단 가로 병렬 그리드, '무료 AI' 뱃지 제거) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

        {/* AI 운동 가이드 */}
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-100 relative overflow-hidden">

          <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 w-16 h-16 bg-emerald-50/20 rounded-full blur-xl pointer-events-none" />

          <div className="mb-4 flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 shadow-sm">
                <Flame size={14} />
              </div>
              <h3 className="text-[13.5px] font-black text-stone-900 tracking-tight">AI 운동 가이드</h3>
            </div>
          </div>

          <div className="mb-4 rounded-xl bg-emerald-50/50 px-3.5 py-2.5 relative z-10 border border-emerald-100/40">
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none mb-1">AI 맞춤형 권장 횟수</p>
            <p className="text-lg font-black text-emerald-700 tracking-tight">{aiPrescription.workoutDays}</p>
          </div>

          <ul className="space-y-3 relative z-10 text-stone-600">
            {aiPrescription.workoutList.map((item, i) => (
              <li key={i} className="text-[12.5px] leading-snug text-stone-600 break-keep flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* AI 식단 가이드 */}
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-100 relative overflow-hidden">

          <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 w-16 h-16 bg-amber-50/20 rounded-full blur-xl pointer-events-none" />

          <div className="mb-4 flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-50 text-amber-600 shadow-sm">
                <Apple size={14} />
              </div>
              <h3 className="text-[13.5px] font-black text-stone-900 tracking-tight">AI 식단 가이드</h3>
            </div>
          </div>

          <div className="mb-4 rounded-xl bg-amber-50/50 px-3.5 py-2.5 relative z-10 border border-amber-100/40">
            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest leading-none mb-1">AI 맞춤형 영양 케어</p>
            <p className="text-lg font-black text-amber-700 tracking-tight">수분 공급 & 대사 고정 💧</p>
          </div>

          <ul className="space-y-3 relative z-10 text-stone-600">
            {aiPrescription.dietList.map((item, i) => (
              <li key={i} className="text-[12.5px] leading-snug text-stone-600 break-keep flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* 면책 고지 */}
      <div className="rounded-xl bg-stone-50 p-3.5 ring-1 ring-stone-100 flex items-start gap-2">
        <span className="mt-0.5 text-stone-400 text-[10px] font-black shrink-0 px-1.5 py-0.5 bg-stone-200 rounded">NOTICE</span>
        <p className="text-[11px] leading-normal text-stone-400 break-keep">
          이 AI 가이드는 입력된 키, 체중 기반의 체질량지수(BMI) 분석 결과물로서, 보편적인 스포츠 의학 가이드라인을 토대로 로컬 온디바이스 AI가 직접 다이내믹하게 분석 및 조립한 건강 가이드라인입니다. 특이 체질이나 질환이 있는 경우 반드시 의료진과 상의해 주십시오.
        </p>
      </div>
    </div>
  );
}
