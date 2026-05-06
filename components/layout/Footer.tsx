import Link from 'next/link';
import { Icons } from '../common/Icons';

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
            <p className="font-display mb-2 text-lg font-semibold italic text-stone-800">
              WeddingCare
            </p>
            <p className="text-sm leading-relaxed text-stone-500">
              결혼 준비의 모든 과정을 한 곳에서 안내합니다.
              <br />
              웨딩, 건강 관리, 뷰티 정보까지.
            </p>
          </div>

          {/* 내부 링크 */}
          <nav className="grid grid-cols-2 gap-x-10 gap-y-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-stone-500 transition-colors hover:text-rose-600"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* 신뢰 배지 */}
        <div className="mb-6 flex flex-wrap gap-x-6 gap-y-3">
          {TRUST_ITEMS.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span className="text-rose-400">{item.icon}</span>
              <span className="text-xs font-medium text-stone-600">{item.label}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mb-8 rounded-2xl bg-rose-500 px-6 py-6 text-center">
          <p className="font-display mb-1 text-xl font-semibold italic text-white">
            특별한 날을 함께 준비하세요
          </p>
          <p className="mb-4 text-sm text-rose-100">
            지금 상담을 신청하시면 48시간 이내에 연락드립니다.
          </p>
          <Link
            href="/consultation"
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-rose-500 transition-all hover:bg-rose-50"
          >
            무료 상담 신청하기 <Icons.ArrowRight />
          </Link>
        </div>

        {/* 법적 고지 */}
        <div className="border-t border-stone-200 pt-6">
          <p className="text-xs leading-relaxed text-stone-500">
            본 플랫폼에서 제공하는 건강 관리 및 의료 관련 정보는{' '}
            <strong className="text-stone-700">일반적인 안내 목적</strong>으로만 제공되며, 의료 진단·치료 추천이 아닙니다.
            개인의 건강 상태에 따라 차이가 있을 수 있으며, 전문의 상담을 권장합니다.
          </p>
          <p className="mt-3 text-xs text-stone-400">
            © {new Date().getFullYear()} WeddingCare. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

const TRUST_ITEMS = [
  { icon: <Icons.Bolt size={18} />, label: '48시간 이내 응답' },
  { icon: <Icons.Shield size={18} />, label: '개인정보 안전 보호' },
  { icon: <Icons.Message size={18} />, label: '무료 상담' },
  { icon: <Icons.CheckCircle size={18} />, label: '전문 파트너 연결' },
];
