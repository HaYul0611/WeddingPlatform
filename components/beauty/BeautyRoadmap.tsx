'use client';

import {
  Sparkles,
  Heart,
  ShieldAlert,
  ArrowRight,
  CheckCircle,
  Shirt,
  Waves,
  ChevronDown,
  Circle,
  MessageCircle,
  type LucideIcon,
} from 'lucide-react';
import { TimelineWindow } from '@/types/healthcare';

// 드레스 스타일 타입 정의
export type DressStyle = 'off_shoulder' | 'mermaid' | 'backless' | 'minimal';

interface BeautyRoadmapProps {
  timeline: TimelineWindow | 'all';
  dressStyle: DressStyle;
  region: string;
  onTimelineChange: (timeline: TimelineWindow) => void;
  onDressStyleChange: (style: DressStyle) => void;
  onCTAClick: () => void;
}

const DRESS_STYLE_OPTIONS: {
  value: DressStyle;
  label: string;
  desc: string;
  Icon: LucideIcon;
}[] = [
    { value: 'off_shoulder', label: '오프숄더 / 튜브탑', desc: '승모근, 쇄골, 팔뚝 집중 케어', Icon: Shirt },
    { value: 'mermaid', label: '머메이드 라인', desc: '골반 라인, 복부 탄력 케어', Icon: Waves },
    { value: 'backless', label: '백리스 / 오픈백', desc: '등 피부결, 뒤태 라인 케어', Icon: ChevronDown },
    { value: 'minimal', label: '미니멀 / 실크 드레스', desc: '얼굴 광채, V라인 케어', Icon: Circle },
  ];

export default function BeautyRoadmap({
  timeline,
  dressStyle,
  region,
  onTimelineChange,
  onDressStyleChange,
  onCTAClick,
}: BeautyRoadmapProps) {
  const activeTimeline: TimelineWindow = timeline === 'all' ? '3_6months' : timeline;

  // 드레스 스타일별 큐레이션 데이터
  const getDressCuration = (style: DressStyle) => {
    switch (style) {
      case 'off_shoulder':
        return {
          title: '승모근 라인 & 데콜테 브라이트닝 스페셜',
          target: '승모근, 데콜테(쇄골), 어깨선, 팔뚝',
          tip: '오프숄더는 시선이 목에서 어깨선으로 수평하게 흐릅니다. 승모근 부종을 완화하는 메디컬 림프 테라피와 쇄골 라인의 수분 브라이트닝 케어를 병행하면 여리여리한 드레스 핏이 극대화됩니다.',
          points: [
            '본식 2~3달 전 승모근 보톡스 고려 (필요 시 전문의 상담)',
            '주 2회 승모근 & 목 빗근 온열 홈케어 및 스트레칭',
            '쇄골 라인 수분 공급 및 톤업 바디 브라이트닝 크림 관리',
          ],
        };
      case 'mermaid':
        return {
          title: '코어 라인 밀착 & 팔뚝 탄력 슬리밍 스페셜',
          target: '복부, 옆구리, 팔뚝 안쪽, 힙 라인',
          tip: '머메이드 라인은 가슴부터 골반까지 유려한 S라인이 고스란히 밀착됩니다. 복부 셀룰라이트 개선 및 팔뚝 탄력을 강화하는 순환 케어가 필수적입니다.',
          points: [
            '메디컬 체중관리 디톡스 프로그램 연동 스케줄 설계',
            '인모드 바디 리프팅 또는 순환 림프 마사지 고려',
            '매일 밤 폼롤러를 활용한 하체 및 골반 림프 스트레칭',
          ],
        };
      case 'backless':
        return {
          title: '매끄러운 백(Back) 스킨케어 & 목선 집중 스페셜',
          target: '등 전체, 목 뒷선, 날개뼈 주위',
          tip: '하객들에게 가장 오랫동안 노출되는 신부의 뒷모습입니다. 등 부위의 트러블 자국을 없애는 스킨 필링 및 날개뼈 라인의 긴장도를 풀어 입체감 있는 뒤태 라인을 만듭니다.',
          points: [
            '본식 최소 3개월 전 등 스킨 필링 및 재생 케어 시작',
            '등 여드름 전용 바디 미스트 및 약산성 바디워시 사용',
            '거울을 통한 등 피부 장벽 상태 수시 셀프 체크',
          ],
        };
      case 'minimal':
      default:
        return {
          title: '얼굴 결점 제로 하이엔드 광채 & V라인 스페셜',
          target: '얼굴 전체, 이중턱, 심술보, 피부톤',
          tip: '클래식하고 미니멀한 실크 드레스는 시선이 신부의 얼굴로 가장 강력히 집중됩니다. 잡티 하나 없는 깨끗한 투명 피부톤과 또렷한 턱선(V라인)을 위한 스킨부스터 및 윤곽 케어가 효과적입니다.',
          points: [
            '본식 1~2달 전 물광 스킨부스터 큐레이션 가이드 고려',
            '이중턱 밀착 탄력을 위한 리프팅 가이드 및 윤곽 케어',
            '매일 3L 이상 충분한 수분 섭취 및 비타민 C 복용',
          ],
        };
    }
  };

  const curation = getDressCuration(dressStyle);

  // D-Day 타임라인 스텝 데이터
  const getTimelineSteps = (time: TimelineWindow) => {
    const steps = [
      {
        key: 'over_6months',
        title: 'D-180+ 기초 정지 작업',
        desc: '장기적 호흡의 스킨 체질 개선 및 치과 케어',
        details: '피부 재생 주기를 정상화하기 위한 장기 스킨 스케줄링과 밝고 환한 미소를 위한 치아 화이트닝 및 구강 케어를 여유롭게 시작할 최적의 적기입니다.',
        badges: ['치아 화이트닝', '피부 장벽 개선', '식단 플래닝'],
      },
      {
        key: '3_6months',
        title: 'D-90+ 윤곽 및 볼륨 케어',
        desc: '얼굴 윤곽 정돈 및 피부 속 깊은 영양 채움',
        details: '시술 후 완전히 자연스럽게 자리를 잡는 리프팅 및 볼륨 관리의 마지노선 기간입니다. 본식 날 스냅 촬영 시 카메라 앞에서 가장 고운 표정 선을 연출하도록 준비합니다.',
        badges: ['윤곽 탄력 케어', '볼륨 관리', '드레스 핏 집중 마사지'],
      },
      {
        key: '1_3months',
        title: 'D-30+ 잡티 커팅 & 수분 부스팅',
        desc: '깨끗한 피부 톤 개선과 즉각적인 속광 충전',
        details: '본식이 얼마 남지 않은 시점으로, 메이크업이 들뜨지 않도록 강력한 수분 밀착을 돕는 스킨부스터 물광 주입 및 멜라닌 조각 커팅으로 맑은 피부 톤을 최상으로 끌어올립니다.',
        badges: ['스킨부스터 물광', '잡티 토닝 레이저', '진정 케어'],
      },
      {
        key: 'under_1month',
        title: 'D-7 본식 직전 안심 진정',
        desc: '자극 배제, 오직 부기 완화와 수분 보호막 집중',
        details: '이 시기에는 새로운 고자극 시술은 절대 금물입니다. 림프 순환을 돕는 메디컬 디톡스 마사지와 충분한 진정 팩으로 얼굴 부기를 예방하고 최상의 컨디션을 보호합니다.',
        badges: ['림프 부종 순환', '안심 진정 팩', '수분 락킹'],
      },
    ];

    return steps.map((step) => ({
      ...step,
      isCurrent: step.key === time,
      isPast: (
        (time === '3_6months' && step.key === 'over_6months') ||
        (time === '1_3months' && (step.key === 'over_6months' || step.key === '3_6months')) ||
        (time === 'under_1month' && step.key !== 'under_1month')
      ),
    }));
  };

  const timelineSteps = getTimelineSteps(activeTimeline);

  return (
    <div className="rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50/40 via-white to-white p-5 shadow-sm animate-in slide-in-from-bottom duration-500">
      {/* 헤더 */}
      <div className="space-y-1 mb-5">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-500">
          <Sparkles size={10} className="text-rose-400" />
          <span>AI 웨딩 뷰티 로드맵</span>
        </div>
        <h2 className="text-[17px] font-extrabold text-stone-800 tracking-tight break-keep leading-snug">
          나의 본식 D-Day 안심 뷰티 설계
        </h2>
        <p className="text-xs text-stone-400 break-keep leading-relaxed">
          결혼식 일정과 드레스 핏에 맞춘 가장 안전하고 스마트한 스케줄 가이드를 실시간 분석합니다.
        </p>
      </div>

      <div className="space-y-4">
        {/* STEP 1: 드레스 스타일 선택 */}
        <div className="space-y-2">
          <p className="text-[11px] font-black text-stone-500 uppercase tracking-wider">
            Step 1 · 준비하시는 드레스 라인을 선택해주세요
          </p>
          <div className="grid grid-cols-2 gap-2">
            {DRESS_STYLE_OPTIONS.map(({ value, label, desc, Icon }) => {
              const isSelected = dressStyle === value;
              return (
                <button
                  key={value}
                  onClick={() => onDressStyleChange(value)}
                  className={`p-3 rounded-xl border text-left transition-all ${isSelected
                      ? 'border-rose-400 bg-rose-500 text-white shadow-sm'
                      : 'border-stone-200 bg-white text-stone-600 hover:border-rose-200 hover:bg-rose-50/30'
                    }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon size={12} className={isSelected ? 'text-rose-200' : 'text-stone-400'} />
                    <p className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-stone-700'}`}>
                      {label}
                    </p>
                  </div>
                  <p className={`text-[9.5px] font-medium leading-snug ${isSelected ? 'text-stone-400' : 'text-stone-400'}`}>
                    {desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP 2: 드레스 맞춤 타겟 큐레이션 */}
        <div className="rounded-xl bg-rose-50/30 border border-rose-100/70 p-4 space-y-2.5">
          <div className="flex items-center gap-1.5 text-stone-700 font-bold text-xs">
            <Heart size={13} className="text-rose-500 fill-rose-100" />
            <span>{curation.title}</span>
          </div>
          <p className="text-[11px] leading-relaxed text-stone-500 break-keep">
            {curation.tip}
          </p>
          <div className="border-t border-stone-200 pt-2 space-y-1.5">
            <p className="text-[10px] font-black text-stone-400 tracking-wide">
              집중 관리 부위 —{' '}
              <span className="text-stone-700 font-extrabold">{curation.target}</span>
            </p>
            <ul className="space-y-1">
              {curation.points.map((pt, idx) => (
                <li key={idx} className="flex items-start gap-1.5 text-[10.5px] text-stone-600 leading-snug">
                  <CheckCircle size={11} className="mt-0.5 text-rose-400 flex-shrink-0" />
                  <span className="break-keep">{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* STEP 3: D-Day 타임라인 */}
        <div className="space-y-2.5">
          <p className="text-[11px] font-black text-stone-500 uppercase tracking-wider">
            Step 2 · 현재 본식까지 남은 기간
          </p>
          <div className="grid grid-cols-4 gap-1 bg-stone-100 p-1 rounded-xl">
            {([
              { key: 'over_6months', label: '6개월+' },
              { key: '3_6months', label: '3~6개월' },
              { key: '1_3months', label: '1~3개월' },
              { key: 'under_1month', label: '1개월-' },
            ] as { key: TimelineWindow; label: string }[]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => onTimelineChange(tab.key)}
                className={`rounded-lg py-1.5 text-[10px] font-bold transition-all ${activeTimeline === tab.key
                    ? 'bg-white text-stone-800 shadow-sm'
                    : 'text-stone-400 hover:text-stone-600'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 타임라인 플로우 */}
          <div className="relative border-l-2 border-stone-200 pl-4 ml-2 py-1 space-y-4">
            {timelineSteps.map((step) => (
              <div
                key={step.key}
                className={`relative transition-all duration-300 ${step.isCurrent ? 'opacity-100' : step.isPast ? 'opacity-50' : 'opacity-25'
                  }`}
              >
                {/* 타임라인 마커 */}
                <div
                  className={`absolute -left-[21px] top-0.5 h-3.5 w-3.5 rounded-full border-2 transition-all ${step.isCurrent
                      ? 'border-rose-500 bg-rose-500 ring-4 ring-rose-100'
                      : step.isPast
                        ? 'border-stone-400 bg-stone-400'
                        : 'border-stone-300 bg-white'
                    }`}
                />

                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-xs font-black ${step.isCurrent ? 'text-rose-600' : 'text-stone-500'}`}>
                      {step.title}
                    </span>
                    {step.isCurrent && (
                      <span className="bg-rose-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full">
                        현재 단계
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-stone-400 font-semibold leading-tight">
                    {step.desc}
                  </p>
                  {step.isCurrent && (
                    <p className="text-[10.5px] text-stone-600 break-keep leading-relaxed bg-rose-50/50 p-2.5 rounded-lg border border-rose-100/60 mt-1">
                      {step.details}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {step.badges.map((b, i) => (
                      <span
                        key={i}
                        className={`text-[8.5px] px-1.5 py-0.5 rounded-md font-bold ${step.isCurrent
                            ? 'bg-rose-50 text-rose-500 border border-rose-100'
                            : 'bg-stone-100/50 text-stone-400'
                          }`}
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 의료법 준수 고지 — 광고 아님 강조 */}
        <div className="rounded-xl border-2 border-amber-200 bg-amber-50 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
              <ShieldAlert size={15} className="text-amber-600" />
            </div>
            <div>
              <p className="text-[11px] font-black text-amber-800 tracking-tight">
                광고 아님 — 의료법 완전 준수 고지
              </p>
              <p className="text-[9px] text-amber-600 font-bold">
                의료법 제27조 환자 유인·알선 행위 해당 없음
              </p>
            </div>
          </div>
          <p className="text-[9px] text-amber-700 leading-relaxed break-keep pl-9">
            본 로드맵은 <strong>비의료 목적의 일반 뷰티 스케줄 가이드</strong>로, 특정 병원의 시술·진료를 유인하거나 예약을 강제하는 알선 행위와 무관합니다. 모든 가이드는 공개된 건강 상식 수준의 참고 정보이며, 정확한 진단은 반드시 전문의와 직접 면담하시기 바랍니다.
          </p>
        </div>

        {/* CTA 버튼 */}
        <button
          onClick={onCTAClick}
          className="w-full group rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 py-3.5 px-4 transition-all shadow-sm hover:shadow-md flex items-center justify-between text-left"
        >
          <div>
            <p className="text-white text-[12.5px] font-black tracking-tight flex items-center gap-1.5">
              <MessageCircle size={13} className="text-rose-200" />
              <span>내 D-Day 맞춤 상담 받기 (무료)</span>
            </p>
            <p className="text-rose-200/80 text-[9.5px] font-semibold mt-0.5">
              {region && region !== 'all' ? `${region} 인근 플래너가` : '웨딩 전문 뷰티 플래너가'}{' '}
              내 결혼 예산 & 일정에 맞춰 정밀 설계해 드려요
            </p>
          </div>
          <div className="bg-rose-400/40 group-hover:bg-rose-400/60 p-1.5 rounded-lg text-white transition-all flex-shrink-0">
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>
      </div>
    </div>
  );
}
