'use client';

import { useState } from 'react';
import Link from 'next/link';
import { invitationTemplates, TEMPLATE_CATEGORIES } from '@/data/invitation-templates';
import type { InvitationTemplate } from '@/types/invitation';
import TemplatePreviewModal from '@/components/invite/TemplatePreviewModal';
import { GalleryPhoneMockup } from '@/components/invite/GalleryPhoneMockup';
import { GalleryTemplateCard } from '@/components/invite/GalleryTemplateCard';

const DEFAULT_WEDDING_INFO = {
  groomName: '오하율',
  brideName: '김채원',
  date: '2027년 11월 08일 토요일',
  time: '오전 11시',
  venue: '롯데 호텔 크리스탈 볼룸',
  venueAddress: '서울특별시 중구 을지로 30',
};

/* ─── 기능 뱃지 ─── */
const FEATURES = [
  { icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z', label: '포토 갤러리' },
  { icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z', label: '지도/길찾기' },
  { icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z', label: '계좌번호' },
  { icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', label: 'RSVP' },
  { icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', label: 'D-day 카운트' },
  { icon: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3', label: '배경 음악' },
  { icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z', label: '방명록' },
  { icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z', label: 'AI 인사말' },
];

const STATS = [
  { value: '50,000+', label: '청첩장 제작' },
  { value: '3분', label: '평균 제작 시간' },
  { value: '무료', label: '48시간 체험' },
];

export default function InvitePage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [previewTemplate, setPreviewTemplate] = useState<InvitationTemplate | null>(null);

  const filtered = activeCategory === 'all'
    ? invitationTemplates
    : invitationTemplates.filter((t) => t.category === activeCategory);

  return (
    <main className="min-h-screen bg-white">
      {previewTemplate && (
        <TemplatePreviewModal
          template={previewTemplate}
          onClose={() => setPreviewTemplate(null)}
        />
      )}

      {/* ── Hero ─── */}
      <section className="relative overflow-hidden bg-[#FAF8F5] pb-16 pt-14 text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(226,98,110,0.10),transparent)]" />
        <div className="relative mx-auto max-w-3xl px-4">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-4 py-1.5 shadow-sm">
            <span className="h-2 w-2 animate-pulse rounded-full bg-rose-400" />
            <span className="text-xs font-semibold text-rose-500">지금 48시간 무료 체험 가능</span>
          </div>
          <h1 className="font-display mb-4 text-4xl font-bold leading-tight text-stone-900 sm:text-5xl lg:text-6xl">
            세상에 하나뿐인<br />
            <em className="not-italic text-rose-500">모바일 청첩장</em>
          </h1>
          <p className="mx-auto mb-8 max-w-lg text-base leading-relaxed text-stone-500">
            드래그 앤 드롭으로 3분 만에 완성.<br />
            RSVP · 지도 · 갤러리 · 계좌번호까지 모두 담을 수 있어요.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/invite/create"
              className="rounded-full bg-rose-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-200 transition-all hover:bg-rose-600 hover:-translate-y-0.5 active:scale-95"
            >
              무료로 만들기 →
            </Link>
            <button
              onClick={() => document.getElementById('templates')?.scrollIntoView({ behavior: 'smooth' })}
              className="rounded-full border border-stone-200 bg-white px-8 py-3.5 text-sm font-semibold text-stone-600 transition-all hover:border-rose-200 hover:text-rose-500"
            >
              템플릿 보기
            </button>
          </div>
        </div>
      </section>

      {/* ── 통계 바 ─── */}
      <section className="border-y border-stone-100 bg-white">
        <div className="mx-auto flex max-w-2xl divide-x divide-stone-100">
          {STATS.map((s) => (
            <div key={s.label} className="flex flex-1 flex-col items-center py-5">
              <p className="font-display text-2xl font-bold text-stone-800">{s.value}</p>
              <p className="mt-0.5 text-xs text-stone-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 기능 배지 ─── */}
      <section className="bg-[#FAF8F5] px-6 py-14">
        <div className="mx-auto max-w-5xl">
          <p className="mb-8 text-center text-[15px] font-bold text-stone-800 tracking-tight">청첩장에 필요한 모든 기능</p>
          <div className="grid grid-cols-4 gap-3 md:flex md:flex-row md:justify-between md:gap-4">
            {FEATURES.map((f) => (
              <div
                key={f.label}
                className="flex flex-col items-center justify-center bg-white rounded-[24px] border border-[#f5f2eb]/75 py-5 px-3 w-full transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-default select-none"
                style={{
                  boxShadow: '0 8px 30px rgba(0,0,0,0.03), 0 1px 3px rgba(0,0,0,0.01)'
                }}
              >
                {/* 둥근 파스텔 핑크색 아이콘 쿠션 서클 */}
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fdf2f4]/90 mb-3 shadow-[0_2px_8px_rgba(253,242,244,0.3)]">
                  <svg className="h-5 w-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                  </svg>
                </div>
                {/* 볼드하고 세련된 한국어 텍스트 라벨 */}
                <p className="text-center text-[11px] sm:text-xs font-bold leading-none text-stone-700 tracking-tight">{f.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 템플릿 갤러리 ─── */}
      <section id="templates" className="px-4 py-14">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <h2 className="font-display mb-2 text-3xl font-bold text-stone-900">템플릿 선택</h2>
            <p className="text-sm text-stone-400">마음에 드는 디자인을 골라 바로 만들어보세요</p>
          </div>

          {/* 카테고리 필터 */}
          <div className="mb-8 flex flex-wrap justify-center gap-2">
            {TEMPLATE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition-all ${activeCategory === cat.id
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'border border-stone-200 bg-white text-stone-500 hover:border-stone-300 hover:text-stone-700'
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* 카드 그리드 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filtered.map((tpl) => (
              <TemplateCard
                key={tpl.id}
                template={tpl}
                onPreview={setPreviewTemplate}
              />
            ))}

            {/* 처음부터 만들기 */}
            <Link
              href="/invite/create"
              className="group flex aspect-[9/16] flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-stone-200 bg-stone-50 transition-all hover:border-rose-300 hover:bg-rose-50/30"
              style={{ minHeight: '378px' }}
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm transition-transform group-hover:scale-110">
                <svg className="h-6 w-6 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-stone-600 group-hover:text-rose-500">처음부터</p>
                <p className="text-sm font-bold text-stone-600 group-hover:text-rose-500">만들기</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

    </main>
  );
}

/* ─── 템플릿 카드 컴포넌트 ─── */
function TemplateCard({
  template,
  onPreview,
}: {
  template: InvitationTemplate;
  onPreview?: (t: InvitationTemplate) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 group relative">
      {/* 폰 목업 래퍼 */}
      <div className="relative transition-transform duration-200 group-hover:-translate-y-1">
        <GalleryPhoneMockup scale={1.05}>
          <GalleryTemplateCard style={template.id as any} info={DEFAULT_WEDDING_INFO} />
        </GalleryPhoneMockup>

        {/* 호버 오버레이 (폰 스크린 위에 오버레이) */}
        <div className="absolute inset-[8px] rounded-[20px] overflow-hidden bg-black/40 backdrop-blur-[2px] opacity-0 transition-opacity duration-200 group-hover:opacity-100 flex flex-col items-center justify-center gap-3 z-20">
          <Link
            href={`/invite/create?template=${template.id}`}
            className="w-32 rounded-full bg-rose-500 py-2.5 text-center text-xs font-bold text-white shadow-lg transition-transform hover:scale-105"
          >
            만들기
          </Link>
          <button
            onClick={() => onPreview?.(template)}
            className="w-32 rounded-full bg-white/90 py-2.5 text-center text-xs font-bold text-stone-700 shadow transition-transform hover:scale-105"
          >
            미리보기
          </button>
        </div>
      </div>

      {/* 라벨 정보 */}
      <div className="text-center mt-1">
        <h3 className="text-sm font-bold text-stone-800">{template.name}</h3>
        <div className="flex justify-center gap-1.5 mt-1">
          {template.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 border border-stone-200"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
