'use client';

import { ConsultationCategory } from '@/types/consultation';

type CTAVariant = 'primary' | 'secondary' | 'ghost' | 'floating';
type CTASize = 'sm' | 'md' | 'lg';

interface CTAButtonProps {
  onClick: () => void;
  label?: string;
  variant?: CTAVariant;
  size?: CTASize;
  fullWidth?: boolean;
  className?: string;
}

export default function CTAButton({
  onClick,
  label = '무료 상담 신청',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
}: CTAButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        VARIANT_CLASS[variant],
        SIZE_CLASS[size],
        fullWidth ? 'w-full' : '',
        'inline-flex items-center justify-center gap-2 font-semibold transition-all active:scale-[0.98]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {label}
      {variant !== 'ghost' && (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      )}
    </button>
  );
}

const VARIANT_CLASS: Record<CTAVariant, string> = {
  primary:   'rounded-xl bg-rose-500 text-white shadow-sm hover:bg-rose-600',
  secondary: 'rounded-xl border-2 border-rose-400 text-rose-500 hover:bg-rose-50',
  ghost:     'rounded-xl text-rose-500 underline underline-offset-2 hover:text-rose-700',
  floating:  'rounded-full bg-rose-500 text-white shadow-lg hover:bg-rose-600 hover:shadow-xl',
};

const SIZE_CLASS: Record<CTASize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-5 py-3 text-sm',
  lg: 'px-6 py-4 text-base',
};
