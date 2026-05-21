'use client';

import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import GlobalCTAWrapper from '@/components/layout/GlobalCTAWrapper';
import { usePathname } from 'next/navigation';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');
  // 청첩장 빌더는 풀스크린 UI이므로 헤더/푸터 제거
  const isBuilderPage = pathname?.startsWith('/invite/create');
  // 청첩장 미리보기/뷰어 페이지 — 사용자가 만든 콘텐츠만 노출
  const isLoveCardPage = pathname?.startsWith('/ko/invitation');
  // 결제/대시보드 페이지 — 독자적 레이아웃 사용
  const isPaymentPage = pathname?.startsWith('/payment');
  const hideShell = isAdminPage || isBuilderPage || isLoveCardPage || isPaymentPage;

  return (
    <html lang="ko">
      <body className="min-h-screen bg-[#FAF8F5] text-stone-800 antialiased">
        {/* 관리자/빌더 페이지가 아닐 때만 사용자 헤더/푸터 표시 */}
        {!hideShell && <Header />}

        <div className={hideShell ? "" : "pb-4"}>
          {children}
        </div>

        {!hideShell && <Footer />}
        {!hideShell && <GlobalCTAWrapper />}
      </body>
    </html>
  );
}
