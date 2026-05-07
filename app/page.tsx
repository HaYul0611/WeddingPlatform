'use client';

import Link from 'next/link';
import { useConsultation } from '@/hooks/useConsultation';
import ConsultationModal from '@/components/consultation/ConsultationModal';

import FallingPetals from '@/components/decoration/FallingPetals';
import FloatingBubbles from '@/components/decoration/FloatingBubbles';

// ───────────────────────────────
// 데이터
// ───────────────────────────────
const FEATURES = [
  {
    href: '/dashboard',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    tag: 'D-Day',
    title: '결혼 준비 타임라인',
    description:
      '결혼 예정일을 입력하면 D-90부터 D-7까지 단계별 준비 일정을 자동으로 안내합니다.',
    cta: '타임라인 확인하기',
    accent: 'rose',
  },
  {
    href: '/healthcare',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    tag: '건강관리',
    title: '건강 루틴 가이드',
    description:
      '키, 몸무게, 목표를 입력하면 웨딩 전 컨디션 관리를 위한 일반적인 운동·식단 안내를 제공합니다.',
    cta: '루틴 확인하기',
    accent: 'emerald',
  },
  {
    href: '/wedding',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
    tag: '웨딩',
    title: '웨딩 패키지 탐색',
    description:
      '예산, 스타일, 지역 조건에 맞는 웨딩 패키지를 한눈에 비교하고 전문가 상담으로 연결됩니다.',
    cta: '패키지 보기',
    accent: 'pink',
  },
  {
    href: '/beauty',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4M4 19h4m12-12v4m-2-2h4m-5 9l-1.1-1.1a2 2 0 00-2.8 0L9 18m5 0l1.1 1.1a2 2 0 002.8 0L19 18" />
      </svg>
    ),
    tag: '뷰티',
    title: '뷰티·의료 정보',
    description:
      '웨딩 전 고려할 수 있는 뷰티 관리와 의료 시술에 대한 일반 정보를 예산·기간별로 확인하세요.',
    cta: '정보 보기',
    accent: 'fuchsia',
  },
];

const SOCIAL_PROOF = [
  { value: '2,400+', label: '이번 달 상담 신청' },
  { value: '48h', label: '평균 응답 시간' },
  { value: '4개', label: '전문 케어 영역' },
];

const ACCENT_COLORS: Record<string, { bg: string; text: string; tag: string }> = {
  rose: { bg: 'bg-rose-50', text: 'text-rose-600', tag: 'bg-rose-100 text-rose-600' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', tag: 'bg-emerald-100 text-emerald-600' },
  pink: { bg: 'bg-pink-50', text: 'text-pink-600', tag: 'bg-pink-100 text-pink-600' },
  fuchsia: { bg: 'bg-fuchsia-50', text: 'text-fuchsia-600', tag: 'bg-fuchsia-100 text-fuchsia-600' },
};

// ───────────────────────────────
// 컴포넌트
// ───────────────────────────────
export default function LandingPage() {
  const { isOpen, openModal, closeModal, sourcePage, defaultCategory } = useConsultation();

  return (
    <>
      <main>
        {/* ── Hero ─────────────────────────── */}
        <section className="relative overflow-hidden px-4 pb-16 pt-12 sm:pt-20">
          {/* 배경 이미지 레이어 */}
          <div className="absolute inset-0 z-0 overflow-hidden rounded-[2.5rem]">
            <img
              src="/wedding_bouquet_bg_1778054754766.png"
              alt="Wedding Background"
              className="h-full w-full object-cover opacity-60 transition-transform duration-[10s] hover:scale-105"
            />
            {/* 화사한 레이어드 오버레이 */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/80 to-[#FAF8F5]" />
            <div className="absolute inset-0 bg-white/20 backdrop-blur-[0.5px]" />

            {/* 흩날리는 꽃잎 애니메이션 */}
            <FallingPetals />

            {/* 떠오르는 비눗방울 애니메이션 */}
            <FloatingBubbles />
          </div>

          <div className="relative z-10 mx-auto max-w-4xl px-4 py-24 text-center sm:py-32">
            {/* 배지 */}
            <div className="fade-up mb-6 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white/90 px-4 py-1.5 shadow-sm">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400" />
              <span className="text-xs font-semibold text-rose-600">결혼 준비 토탈 케어 플랫폼</span>
            </div>

            {/* 메인 헤드라인 */}
            <h1 className="fade-up fade-up-delay-1 font-display mb-6 text-[2.75rem] font-bold leading-[1.15] tracking-tight text-stone-900 sm:text-7xl break-keep">
              특별한 날을 위한
              <br />
              <span className="text-rose-500">
                완벽한 준비
              </span>
            </h1>

            <p className="fade-up fade-up-delay-2 mx-auto mb-10 max-w-xl text-base leading-relaxed text-stone-600 sm:text-lg break-keep">
              웨딩 준비부터 건강 관리, 뷰티 케어까지.
              <br className="hidden sm:block" />
              모든 과정을 한 곳에서 안내받으세요.
            </p>

            {/* Hero CTA */}
            <div className="fade-up fade-up-delay-3 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <button
                onClick={() => openModal('hero', 'wedding')}
                className="group relative w-full rounded-full bg-rose-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-rose-200 transition-all hover:bg-rose-600 hover:-translate-y-0.5 active:scale-[0.98] sm:w-auto"
              >
                <span className="relative z-10">무료 상담 신청하기 →</span>
              </button>
              <Link
                href="/dashboard"
                className="w-full rounded-full border border-stone-200 bg-white px-8 py-4 text-base font-semibold text-stone-600 shadow-sm transition-all hover:border-rose-200 hover:text-rose-500 hover:-translate-y-0.5 sm:w-auto"
              >
                D-Day 확인하기
              </Link>
            </div>
          </div>
        </section>

        {/* ── 소셜 프루프 ─────────────────── */}
        <section className="border-y border-stone-100 bg-white px-4 py-10">
          <div className="mx-auto flex max-w-2xl justify-around gap-4">
            {SOCIAL_PROOF.map((item) => (
              <div key={item.label} className="text-center">
                <p className="text-3xl font-bold tracking-tighter text-stone-900 sm:text-4xl">
                  {item.value}
                </p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-stone-400">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 기능 소개 ────────────────────── */}
        <section className="px-4 py-14">
          <div className="mx-auto max-w-2xl">
            <div className="mb-10 text-center">
              <h2 className="font-display mb-2 text-3xl font-semibold text-stone-800 sm:text-4xl">
                결혼 준비, 이렇게 도와드립니다
              </h2>
              <p className="text-sm text-stone-400">
                입력하신 조건을 바탕으로 맞춤형 정보를 안내합니다.
              </p>
            </div>

            <div className="space-y-4">
              {FEATURES.map((feature) => {
                const color = ACCENT_COLORS[feature.accent];
                return (
                  <div
                    key={feature.href}
                    className={`rounded-2xl p-6 ${color.bg} transition-transform hover:-translate-y-0.5`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm ${color.text}`}>
                        {feature.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="mb-2 flex items-center gap-2">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${color.tag}`}>
                            {feature.tag}
                          </span>
                        </div>
                        <h3 className={`mb-1 font-display text-lg font-semibold ${color.text} break-keep`}>
                          {feature.title}
                        </h3>
                        <p className="mb-4 text-sm leading-relaxed text-stone-500 break-keep">
                          {feature.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={feature.href}
                            className={`rounded-full border bg-white px-4 py-2 text-xs font-semibold transition-colors hover:bg-white/80 ${color.text}`}
                          >
                            {feature.cta}
                          </Link>
                          <button
                            onClick={() => openModal('feature-' + feature.tag, 'wedding')}
                            className={`rounded-full px-4 py-2 text-xs font-semibold text-white transition-all ${feature.accent === 'emerald' ? 'bg-emerald-500 hover:bg-emerald-600' :
                              feature.accent === 'pink' ? 'bg-pink-500 hover:bg-pink-600' :
                                feature.accent === 'fuchsia' ? 'bg-fuchsia-500 hover:bg-fuchsia-600' :
                                  'bg-rose-500 hover:bg-rose-600'
                              }`}
                          >
                            상담 신청
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 하단 강조 CTA ─────────────────── */}
        <section className="px-4 pb-16">
          <div className="mx-auto max-w-2xl">
            <div className="relative overflow-hidden rounded-3xl bg-white px-8 py-14 text-center ring-1 ring-stone-100 shadow-xl shadow-stone-200/40">
              {/* 배경 장식 */}
              <div aria-hidden="true" className="pointer-events-none absolute -left-10 -top-10 h-48 w-48 rounded-full bg-rose-50 blur-3xl" />
              <div aria-hidden="true" className="pointer-events-none absolute -bottom-8 -right-8 h-40 w-40 rounded-full bg-rose-50 blur-3xl" />

              {/* 비눗방울 애니메이션 */}
              <FloatingBubbles />

              <div className="relative z-10">
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-rose-500">
                  무료 상담
                </p>
                <h2 className="font-display mb-4 text-3xl font-semibold text-stone-800 sm:text-4xl">
                  지금 시작해보세요
                </h2>
                <p className="mx-auto mb-10 max-w-sm text-sm leading-relaxed text-stone-500">
                  간단한 정보만 남겨주시면 48시간 이내에 전문 담당자가 직접 연락드립니다.
                </p>

                <button
                  onClick={() => openModal('landing-bottom', 'wedding')}
                  className="rounded-full bg-rose-500 px-10 py-4.5 text-base font-bold text-white shadow-xl shadow-rose-200 transition-all hover:bg-rose-600 hover:scale-105 active:scale-95"
                >
                  무료 상담 신청하기 →
                </button>

                <p className="mt-6 text-xs font-medium text-stone-400">
                  비용 없음 · 부담 없음 · 48시간 이내 응답
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <ConsultationModal
        isOpen={isOpen}
        onClose={closeModal}
        sourcePage={sourcePage}
        defaultCategory={defaultCategory}
      />
    </>
  );
}
