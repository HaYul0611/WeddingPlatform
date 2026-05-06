/**
 * 📖 USAGE REFERENCE — Consultation System
 *
 * 이 파일은 실제 코드가 아닌 사용 예시 참조 파일입니다.
 * 각 페이지에서 상담 시스템을 연결하는 패턴을 보여줍니다.
 */

// ─────────────────────────────────────────────────────────────
// 패턴 1: 페이지에서 직접 useConsultation 사용
// (CTAButton, CTABanner에 openModal 전달)
// ─────────────────────────────────────────────────────────────

/*
'use client';
import { useConsultation } from '@/hooks/useConsultation';
import ConsultationModal from '@/components/consultation/ConsultationModal';
import CTABanner from '@/components/cta/CTABanner';
import CTAButton from '@/components/cta/CTAButton';

export default function DashboardPage() {
  const { isOpen, openModal, closeModal, sourcePage, defaultCategory } = useConsultation();

  return (
    <>
      <main>
        <CTAButton
          onClick={() => openModal('dashboard', 'wedding')}
          label="웨딩 준비 상담 신청"
          variant="primary"
        />

        // 페이지 하단 배너
        <CTABanner
          title="웨딩 준비, 전문가와 함께하세요"
          description="입력하신 일정을 바탕으로 더 자세한 안내를 받을 수 있습니다."
          onClickCTA={() => openModal('dashboard', 'wedding')}
        />
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
*/

// ─────────────────────────────────────────────────────────────
// 패턴 2: 필터 결과 이후 CTA 트리거
// (사용자가 필터링 후 결과를 보면 → CTA 노출)
// ─────────────────────────────────────────────────────────────

/*
const [hasFiltered, setHasFiltered] = useState(false);

function handleFilter() {
  const results = filterClinics(clinics, { budget, category });
  setFilteredClinics(results);
  setHasFiltered(true);   // 필터 완료 → CTA 노출 트리거
}

// 렌더링부
{hasFiltered && (
  <CTABanner
    title="선택하신 조건에 맞는 클리닉이 있습니다"
    description="직접 상담을 통해 더 자세한 정보를 받아보세요."
    onClickCTA={() => openModal('beauty', 'beauty')}
    variant="bold"
  />
)}
*/

// ─────────────────────────────────────────────────────────────
// 패턴 3: FloatingCTA — layout.tsx에 한 번만 추가
// (모든 페이지에서 모바일 하단 고정 노출)
// ─────────────────────────────────────────────────────────────

/*
// app/layout.tsx
import FloatingCTA from '@/components/cta/FloatingCTA';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
        <FloatingCTA sourcePage="global" defaultCategory="wedding" />
      </body>
    </html>
  );
}
*/

// ─────────────────────────────────────────────────────────────
// Lead 데이터 예시 (제출 시 저장되는 구조)
// ─────────────────────────────────────────────────────────────

/*
{
  id: "a1b2c3d4-...",
  timestamp: "2024-08-15T09:30:00.000Z",
  sourcePage: "beauty",            // 어느 페이지에서 신청했는지
  category: "beauty",              // 상담 분야
  name: "홍길동",
  phone: "010-1234-5678",
  budget: "500_1000",
  message: "피부 관리 관련 문의드립니다."
}
*/

export {};
