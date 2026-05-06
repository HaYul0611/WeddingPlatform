'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ConsultationModal from '@/components/consultation/ConsultationModal';
import { useConsultation } from '@/hooks/useConsultation';

const NAV_LINKS = [
  { href: '/dashboard',  label: 'D-Day' },
  { href: '/healthcare', label: '건강관리' },
  { href: '/wedding',    label: '웨딩' },
  { href: '/beauty',     label: '뷰티' },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isOpen, openModal, closeModal, sourcePage, defaultCategory } = useConsultation();

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-stone-100 bg-[#FAF8F5]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          {/* 로고 */}
          <Link href="/" className="flex items-center gap-2">
            <span className="font-display text-xl font-semibold text-stone-800 italic">
              WeddingCare
            </span>
          </Link>

          {/* 데스크톱 네비게이션 */}
          <nav className="hidden items-center gap-1 sm:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-rose-50 text-rose-600'
                    : 'text-stone-500 hover:bg-stone-100 hover:text-stone-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* 데스크톱 CTA */}
          <button
            onClick={() => openModal('header', 'wedding')}
            className="hidden rounded-full bg-rose-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-rose-600 active:scale-[0.98] sm:block"
          >
            무료 상담 신청
          </button>

          {/* 모바일: 햄버거 */}
          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-stone-600 hover:bg-stone-100 sm:hidden"
            aria-label="메뉴"
          >
            {mobileMenuOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* 모바일 드로어 */}
        {mobileMenuOpen && (
          <div className="border-t border-stone-100 bg-[#FAF8F5] px-4 pb-4 sm:hidden">
            <nav className="space-y-1 pt-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? 'bg-rose-50 text-rose-600'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      <ConsultationModal
        isOpen={isOpen}
        onClose={closeModal}
        sourcePage={sourcePage}
        defaultCategory={defaultCategory}
      />
    </>
  );
}
