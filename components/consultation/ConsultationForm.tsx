'use client';

import { useState } from 'react';
import { ConsultationCategory, LeadData } from '@/types/consultation';
import { createLead, submitLead } from '@/lib/leadHandler';
import SuccessMessage from './SuccessMessage';
import { Icons } from '../common/Icons';

// ───────────────────────────────
// 타입
// ───────────────────────────────
interface FormValues {
  name: string;
  phone: string;
  category: ConsultationCategory;
  budget: string;
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
  { value: 'wedding', label: '웨딩 서비스', icon: <Icons.Wedding size={18} className="text-rose-500" /> },
  { value: 'beauty', label: '뷰티 / 피부 관리', icon: <Icons.Sparkles size={18} className="text-rose-500" /> },
  { value: 'healthcare', label: '건강 / 다이어트', icon: <Icons.Activity size={18} className="text-rose-500" /> },
  { value: 'medical', label: '의료 / 시술 정보', icon: <Icons.Medical size={18} className="text-rose-500" /> },
];

const MIN_BUDGET = 500000; // 최소 50만원

const INITIAL_VALUES: FormValues = {
  name: '',
  phone: '',
  category: 'wedding',
  budget: '',
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

  const phoneDigits = values.phone.replace(/\D/g, '');
  if (!values.phone.trim()) {
    errors.phone = '연락처를 입력해 주세요.';
  } else if (!PHONE_REGEX.test(phoneDigits)) {
    errors.phone = '올바른 연락처 형식을 입력해 주세요. (예: 010-1234-5678)';
  }

  if (values.budget && parseInt(values.budget.replace(/\D/g, '')) < MIN_BUDGET) {
    errors.budget = `최소 ${MIN_BUDGET.toLocaleString()}원부터 상담이 가능합니다.`;
  }

  return errors;
}

const formatPhone = (val: string) => {
  const digits = val.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
};

const formatCurrency = (val: string) => {
  const digits = val.replace(/\D/g, '');
  if (!digits) return '';
  return parseInt(digits).toLocaleString();
};

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
    const updated = { ...values, [field]: value };
    setValues(updated);

    // 터치된 필드만 실시간 재검사
    if (touched[field]) {
      setErrors(validate(updated));
    }
  }

  function handlePhoneChange(val: string) {
    const formatted = formatPhone(val);
    handleChange('phone', formatted);
  }

  function handleBudgetChange(val: string) {
    const formatted = formatCurrency(val);
    handleChange('budget', formatted);
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
      phone: values.phone.replace(/\D/g, ''),
      category: values.category,
      budget: (values.budget.replace(/\D/g, '') || '0') as any, // 010-1234-5678 -> 01012345678
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
        <p className="mt-1 text-sm font-medium leading-relaxed text-stone-600">
          간단한 정보만 남겨주시면 <span className="text-rose-600 font-bold">48시간 이내</span>에
          <br />
          전문 담당자가 직접 연락드립니다.
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
            onChange={(e) => handlePhoneChange(e.target.value)}
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
                className={categoryButtonClass(values.category === opt.value)}
              >
                <span className="flex items-center justify-center gap-2">
                  {opt.icon}
                  {opt.label}
                </span>
              </button>
            ))}
          </div>
        </Field>

        {/* 예산 */}
        <Field label="예산 범위" error={touched.budget ? errors.budget : undefined}>
          <div className="relative">
            <input
              type="text"
              placeholder="직접 입력 (예: 500,000)"
              value={values.budget}
              onChange={(e) => handleBudgetChange(e.target.value)}
              onBlur={() => handleBlur('budget')}
              className={inputClass(!!touched.budget && !!errors.budget)}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-stone-400">원</span>
          </div>
          <p className="mt-1 text-[11px] text-stone-400">
            * 최소 {MIN_BUDGET.toLocaleString()}원부터 상담이 가능합니다.
          </p>
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
        {optional && <span className="text-xs font-normal text-stone-500">(선택)</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-xs text-rose-500">
          <Icons.Alert /> {error}
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
