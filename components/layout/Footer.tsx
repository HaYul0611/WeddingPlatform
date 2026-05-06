import Link from 'next/link';

const NAV_LINKS = [
  { href: '/dashboard', label: 'D-Day 대시보드' },
  { href: '/healthcare', label: '건강 관리' },
  { href: '/wedding', label: '웨딩 서비스' },
  { href: '/beauty', label: '뷰티 · 의료 정보' },
  { href: '/consultation', label: '상담 신청' },
];

export default function Footer() {
  return (
    <footer className="border-t border-stone-100 bg-stone-50">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:justify-between">
          {/* 브랜드 */}
          <div className="max-w-xs">
            <p className="font-display mb-3 text-xl font-bold italic text-stone-800">
              WeddingCare
            </p>
            <p className="text-sm leading-relaxed text-stone-500 break-keep">
              결혼 준비의 모든 과정을 한 곳에서 안내합니다.
              웨딩, 건강 관리, 뷰티 정보까지 전문 파트너와 함께하세요.
            </p>
          </div>

          {/* 내부 링크 */}
          <nav className="grid grid-cols-2 gap-x-10 gap-y-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-stone-400 transition-colors hover:text-rose-500"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* 신뢰 배지 */}
        <div className="mb-6 flex flex-wrap gap-4">
          {TRUST_ITEMS.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span className="text-base">{item.icon}</span>
              <span className="text-xs text-stone-400">{item.label}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mb-8 rounded-3xl bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-100 px-6 py-10 text-center shadow-sm">
          <p className="font-display mb-2 text-2xl font-bold italic text-stone-800">
            특별한 날을 함께 준비하세요
          </p>
          <p className="mb-6 text-sm text-stone-600 break-keep">
            지금 상담을 신청하시면 48시간 이내에 전문 담당자가 직접 연락드립니다.
          </p>
          <Link
            href="/consultation"
            className="inline-block rounded-full bg-rose-500 px-10 py-3 text-base font-semibold text-white shadow-lg shadow-rose-200 transition-all hover:bg-rose-600 hover:-translate-y-0.5 active:scale-95"
          >
            무료 상담 신청하기 →
          </Link>
          <div className="mt-4 flex justify-center gap-4 text-[11px] text-stone-400 font-medium">
            <span>비용 없음</span>
            <span>•</span>
            <span>부담 없음</span>
            <span>•</span>
            <span>48시간 이내 응답</span>
          </div>
        </div>

        {/* 법적 고지 */}
        <div className="border-t border-stone-200 pt-6">
          <p className="text-[13px] leading-relaxed text-stone-500 break-keep">
            본 플랫폼에서 제공하는 건강 관리 및 의료 관련 정보는{' '}
            <strong className="text-stone-700">일반적인 안내 목적</strong>으로만 제공되며, 의료 진단·치료 추천이 아닙니다.
            개인의 건강 상태에 따라 차이가 있을 수 있으며, 전문의 상담을 권장합니다.
          </p>
          <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p className="text-xs text-stone-400">
              © {new Date().getFullYear()} WeddingCare. All rights reserved.
            </p>
            <div className="flex gap-4 text-xs text-stone-400">
              <Link href="/policy" className="hover:text-stone-600 underline underline-offset-2">이용약관</Link>
              <Link href="/privacy" className="hover:text-stone-600 underline underline-offset-2 font-semibold">개인정보처리방침</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

const TRUST_ITEMS = [
  {
    icon: (
      <svg className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    label: '48시간 이내 응답'
  },
  {
    icon: (
      <svg className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    label: '개인정보 안전 보호'
  },
  {
    icon: (
      <svg className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    label: '무료 상담'
  },
  {
    icon: (
      <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    label: '전문 파트너 연결'
  },
];
