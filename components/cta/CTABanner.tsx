'use client';

import { ConsultationCategory } from '@/types/consultation';
import CTAButton from './CTAButton';

interface CTABannerProps {
  title?: string;
  description?: string;
  buttonLabel?: string;
  onClickCTA: () => void;
  variant?: 'soft' | 'bold';
}

/**
 * 페이지 내 섹션 하단에 삽입하는 CTA 배너.
 * onClickCTA는 상위에서 openModal(sourcePage, category)를 전달합니다.
 *
 * @example
 * <CTABanner
 *   title="전문가와 직접 상담해보세요"
 *   description="입력하신 내용을 바탕으로 맞춤 안내를 받을 수 있습니다."
 *   onClickCTA={() => openModal('dashboard', 'wedding')}
 * />
 */
export default function CTABanner({
  title = '전문가와 직접 상담해보세요',
  description = '선택하신 조건을 바탕으로 더 자세한 안내를 받을 수 있습니다.',
  buttonLabel = '무료 상담 신청',
  onClickCTA,
  variant = 'soft',
}: CTABannerProps) {
  if (variant === 'bold') {
    return (
      <section className="rounded-2xl bg-rose-500 px-6 py-8 text-center text-white">
        <h3 className="mb-2 text-lg font-semibold">{title}</h3>
        <p className="mb-5 text-sm text-rose-100">{description}</p>
        <button
          type="button"
          onClick={onClickCTA}
          className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-rose-500 shadow transition-all hover:bg-rose-50 active:scale-[0.98]"
        >
          {buttonLabel} →
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-rose-100 bg-rose-50 px-6 py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-semibold text-stone-800">{title}</h3>
          <p className="mt-1 text-sm text-stone-500">{description}</p>
        </div>
        <CTAButton
          onClick={onClickCTA}
          label={buttonLabel}
          variant="primary"
          size="md"
          className="flex-shrink-0"
        />
      </div>
    </section>
  );
}
