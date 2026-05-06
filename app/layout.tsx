import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import GlobalCTAWrapper from '@/components/layout/GlobalCTAWrapper';

export const metadata: Metadata = {
  title: 'WeddingCare — 결혼 준비의 모든 것',
  description:
    '웨딩 서비스, 건강 관리, 뷰티 정보를 한 곳에서. 전문가와 함께 특별한 날을 준비하세요.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-[#FAF8F5] text-stone-800 antialiased">
        {/* 상단 헤더 (자체 CTA 모달 포함) */}
        <Header />

        {/* 페이지 콘텐츠 */}
        <div className="pb-4">{children}</div>

        {/* 푸터 */}
        <Footer />

        {/* 전역 FloatingCTA (모바일 하단 고정) */}
        <GlobalCTAWrapper />
      </body>
    </html>
  );
}
