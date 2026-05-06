'use client';

import { useState } from 'react';
import { ConsultationCategory, BudgetRange, LeadData } from '@/types/consultation';
import { createLead, submitLead } from '@/lib/leadHandler';
import SuccessMessage from './SuccessMessage';

// ───────────────────────────────
// 타입
// ───────────────────────────────
interface FormValues {
  name: string;
  phone: string;
  category: ConsultationCategory;
  budget: BudgetRange;
  message: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  category?: string;
  budget?: string;
}

interface ConsultationFormProps {
  sourcePage: string;                       // 리드 추적용 — 호출부에서 주입
  defaultCategory?: ConsultationCategory;   // 페이지별 기본 카테고리
  onSuccess?: () => void;                   // 제출 성공 후 콜백 (모달 닫기 등)
}

// ───────────────────────────────
// 상수
// ───────────────────────────────
const CATEGORY_OPTIONS: { value: ConsultationCategory; label: string; icon: React.ReactNode }[] = [
  {
    value: 'wedding',
    label: '웨딩 서비스',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    )
  },
  {
    value: 'beauty',
    label: '뷰티 / 피부 관리',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4M4 19h4m12-12v4m-2-2h4m-5 9l-1.1-1.1a2 2 0 00-2.8 0L9 18m5 0l1.1 1.1a2 2 0 002.8 0L19 18" />
      </svg>
    )
  },
  {
    value: 'healthcare',
    label: '건강 / 다이어트',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  },
  {
    value: 'medical',
    label: '의료 / 시술 정보',
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )
  },
];

const BUDGET_OPTIONS: { value: BudgetRange; label: string }[] = [
  { value: 'undecided', label: '아직 미정이에요' },
  { value: 'under_500', label: '50만원 미만' },
  { value: '500_1000', label: '50만원 ~ 100만원' },
  { value: '1000_3000', label: '100만원 ~ 300만원' },
  { value: 'over_3000', label: '300만원 이상' },
];

const INITIAL_VALUES: FormValues = {
  name: '',
  phone: '',
  category: 'wedding',
  budget: 'undecided',
  message: '',
};

// ───────────────────────────────
// 유효성 검사 (순수 함수)
// ───────────────────────────────
const PHONE_REGEX = /^01[0-9]{1}-?[0-9]{3,4}-?[0-9]{4}$/;

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.name.trim()) {
    errors.name = '이름을 입력해 주세요.';
  }

  if (!values.phone.trim()) {
    errors.phone = '연락처를 입력해 주세요.';
  } else if (!PHONE_REGEX.test(values.phone.replace(/-/g, ''))) {
    errors.phone = '올바른 연락처 형식을 입력해 주세요. (예: 010-1234-5678)';
  }

  return errors;
}

function hasErrors(errors: FormErrors): boolean {
  return Object.keys(errors).length > 0;
}

// ───────────────────────────────
// 컴포넌트
// ───────────────────────────────
export default function ConsultationForm({
  sourcePage,
  defaultCategory = 'wedding',
  onSuccess,
}: ConsultationFormProps) {
  const [values, setValues] = useState<FormValues>({
    ...INITIAL_VALUES,
    category: defaultCategory,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // 필드 변경
  function handleChange(
    field: keyof FormValues,
    value: string,
  ) {
    let finalValue = value;

    // 연락처 자동 하이픈
    if (field === 'phone') {
      const digits = value.replace(/\D/g, '').slice(0, 11);
      if (digits.length <= 3) {
        finalValue = digits;
      } else if (digits.length <= 7) {
        finalValue = `${digits.slice(0, 3)}-${digits.slice(3)}`;
      } else {
        finalValue = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
      }
    }

    const updated = { ...values, [field]: finalValue };
    setValues(updated);

    // 터치된 필드만 실시간 재검사
    if (touched[field]) {
      setErrors(validate(updated));
    }
  }

  // 필드 blur → touched 마킹 + 즉시 검사
  function handleBlur(field: keyof FormValues) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate(values));
  }

  // 제출
  async function handleSubmit() {
    // 전체 필드 touched 처리 (제출 시 모든 오류 표시)
    setTouched({ name: true, phone: true, category: true, budget: true });

    const validationErrors = validate(values);
    if (hasErrors(validationErrors)) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    const lead: LeadData = createLead({
      name: values.name.trim(),
      phone: values.phone.trim(),
      category: values.category,
      budget: values.budget,
      message: values.message.trim() || undefined,
      sourcePage,
    });

    const result = await submitLead(lead);
    setIsLoading(false);

    if (result.success) {
      setIsSubmitted(true);
      onSuccess?.();
    }
    // [Inference] 실패 케이스: MVP에서는 재시도 안내 없이 조용히 처리
    // 추후 toast 알림으로 교체 권장
  }

  // ───────────────────────────────
  // 제출 완료 상태
  // ───────────────────────────────
  if (isSubmitted) {
    return <SuccessMessage onClose={onSuccess} />;
  }

  // ───────────────────────────────
  // 폼 렌더링
  // ───────────────────────────────
  return (
    <div className="w-full">
      {/* 헤더 */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-stone-800">무료 상담 신청</h2>
        <p className="mt-1 text-sm text-stone-500">
          간단한 정보만 남겨주시면 48시간 이내에 연락드립니다.
        </p>
      </div>

      <div className="space-y-4">
        {/* 이름 */}
        <Field label="이름" required error={touched.name ? errors.name : undefined}>
          <input
            type="text"
            placeholder="홍길동"
            value={values.name}
            onChange={(e) => handleChange('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            className={inputClass(!!touched.name && !!errors.name)}
          />
        </Field>

        {/* 연락처 */}
        <Field label="연락처" required error={touched.phone ? errors.phone : undefined}>
          <input
            type="tel"
            placeholder="010-1234-5678"
            value={values.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            onBlur={() => handleBlur('phone')}
            className={inputClass(!!touched.phone && !!errors.phone)}
          />
        </Field>

        {/* 상담 분야 */}
        <Field label="상담 분야" required>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleChange('category', opt.value)}
                className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all break-keep ${values.category === opt.value
                    ? 'border-rose-400 bg-rose-50 text-rose-600'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-rose-200 hover:bg-rose-50/50'
                  }`}
              >
                <span className={values.category === opt.value ? 'text-rose-500' : 'text-stone-400'}>
                  {opt.icon}
                </span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </Field>

        {/* 예산 */}
        <Field label="예산 범위">
          <select
            value={values.budget}
            onChange={(e) => handleChange('budget', e.target.value as BudgetRange)}
            className={inputClass(false)}
          >
            {BUDGET_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </Field>

        {/* 메시지 (선택) */}
        <Field label="추가 메시지" optional>
          <textarea
            placeholder="궁금하신 사항이 있으면 자유롭게 적어주세요."
            value={values.message}
            onChange={(e) => handleChange('message', e.target.value)}
            rows={3}
            className={`${inputClass(false)} resize-none`}
          />
        </Field>

        {/* 개인정보 안내 */}
        <p className="text-xs text-stone-400">
          입력하신 정보는 상담 목적으로만 사용되며, 제3자에게 제공되지 않습니다.
        </p>

        {/* 제출 버튼 */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full rounded-xl bg-rose-500 py-4 text-base font-semibold text-white shadow-sm transition-all hover:bg-rose-600 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <LoadingSpinner />
              제출 중...
            </span>
          ) : (
            '무료 상담 신청하기'
          )}
        </button>
      </div>
    </div>
  );
}

// ───────────────────────────────
// 서브 컴포넌트 & 유틸
// ───────────────────────────────
function Field({
  label,
  required,
  optional,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-sm font-medium text-stone-700">
        {label}
        {required && <span className="text-rose-400">*</span>}
        {optional && <span className="text-xs font-normal text-stone-400">(선택)</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs text-rose-500">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

function inputClass(hasError: boolean): string {
  return [
    'w-full rounded-xl border px-4 py-3 text-sm text-stone-800',
    'placeholder:text-stone-300 outline-none transition-colors',
    'focus:ring-2 focus:ring-rose-300',
    hasError
      ? 'border-rose-400 bg-rose-50 focus:border-rose-400'
      : 'border-stone-200 bg-white focus:border-rose-300',
  ].join(' ');
}

function categoryButtonClass(isSelected: boolean): string {
  return [
    'rounded-xl border px-3 py-2.5 text-sm font-medium transition-all',
    isSelected
      ? 'border-rose-400 bg-rose-50 text-rose-600'
      : 'border-stone-200 bg-white text-stone-600 hover:border-rose-200 hover:bg-rose-50/50',
  ].join(' ');
}
