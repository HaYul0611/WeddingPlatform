import ConsultationPageForm from '@/components/consultation/ConsultationPageForm';
import Link from 'next/link';

export const metadata = {
  title: '무료 상담 신청 — WeddingCare',
  description: '웨딩, 건강 관리, 뷰티 전문가에게 무료 상담을 신청하세요.',
};

export default function ConsultationPage() {
  return (
    <main className="mx-auto max-w-lg px-4 py-10">
      {/* 뒤로가기 */}
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-stone-400 hover:text-stone-600"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        홈으로
      </Link>

      {/* 신뢰 메시지 */}
      <div className="mb-6 text-center">
        <p className="font-display text-3xl font-semibold italic text-stone-800">
          무료 상담 신청
        </p>
        <p className="mt-2 text-sm text-stone-400">
          간단한 정보만 남겨주시면 전문 담당자가 48시간 이내에 연락드립니다.
        </p>
      </div>

      {/* 신뢰 배지 */}
      <div className="mb-8 grid grid-cols-3 gap-3">
        {TRUST_BADGES.map((badge) => (
          <div key={badge.label} className="rounded-2xl bg-stone-50 px-3 py-4 text-center">
            <p className="mb-1 text-xl">{badge.icon}</p>
            <p className="text-xs font-semibold text-stone-600">{badge.label}</p>
            <p className="mt-0.5 text-xs text-stone-400">{badge.sub}</p>
          </div>
        ))}
      </div>

      {/* 폼 */}
      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-stone-100">
        {/* [Inference] Server Component이므로 sourcePage를 'consultation-page'로 고정 */}
        <ConsultationPageForm />
      </div>

      {/* 하단 고지 */}
      <p className="mt-6 text-center text-xs text-stone-300">
        입력하신 개인정보는 상담 목적으로만 사용되며, 제3자에게 제공되지 않습니다.
      </p>
    </main>
  );
}

const TRUST_BADGES = [
  { icon: '⚡', label: '빠른 응답',  sub: '48시간 이내' },
  { icon: '🔒', label: '정보 보호',  sub: '안전하게 관리' },
  { icon: '💬', label: '무료 상담',  sub: '비용 없음' },
];


