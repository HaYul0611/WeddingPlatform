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

  return (
    <html lang="ko">
      <body className="min-h-screen bg-[#FAF8F5] text-stone-800 antialiased">
        {/* 관리자 페이지가 아닐 때만 사용자 헤더/푸터 표시 */}
        {!isAdminPage && <Header />}

        <div className={isAdminPage ? "" : "pb-4"}>
          {children}
        </div>

        {!isAdminPage && <Footer />}
        {!isAdminPage && <GlobalCTAWrapper />}
      </body>
    </html>
  );
}
