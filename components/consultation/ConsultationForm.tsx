'use client';

import { useState } from 'react';
import { ConsultationCategory, BudgetRange, LeadData } from '@/types/consultation';
import { createLead, submitLead } from '@/lib/leadHandler';
import SuccessMessage from './SuccessMessage';
import { Phone, CheckCircle2, ChevronLeft } from 'lucide-react';

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
  sourcePage: string;
  defaultCategory?: ConsultationCategory;
  onSuccess?: () => void;
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

const PHONE_REGEX = /^01[0-9]{1}-?[0-9]{3,4}-?[0-9]{4}$/;

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};
  if (!values.name.trim()) errors.name = '이름을 입력해 주세요.';
  if (!values.phone.trim()) {
    errors.phone = '연락처를 입력해 주세요.';
  } else if (!PHONE_REGEX.test(values.phone.replace(/-/g, ''))) {
    errors.phone = '올바른 연락처 형식을 입력해 주세요.';
  }
  return errors;
}

// ───────────────────────────────
// 컴포넌트
// ───────────────────────────────
export default function ConsultationForm({
  sourcePage,
  defaultCategory = 'wedding',
  onSuccess,
}: ConsultationFormProps) {
  const [values, setValues] = useState<FormValues>({ ...INITIAL_VALUES, category: defaultCategory });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  function handleChange(field: keyof FormValues, value: string) {
    let finalValue = value;
    if (field === 'phone') {
      const digits = value.replace(/\D/g, '').slice(0, 11);
      if (digits.length <= 3) finalValue = digits;
      else if (digits.length <= 7) finalValue = `${digits.slice(0, 3)}-${digits.slice(3)}`;
      else finalValue = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
    }
    const updated = { ...values, [field]: finalValue };
    setValues(updated);
    if (touched[field]) setErrors(validate(updated));
  }

  function handleBlur(field: keyof FormValues) {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors(validate(values));
  }

  // 1단계: 유효성 검사 후 확인 창 띄우기
  function handleRequestConfirm() {
    setTouched({ name: true, phone: true });
    const validationErrors = validate(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setShowConfirm(true);
  }

  // 2단계: 최종 전송
  async function handleFinalSubmit() {
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
  }

  if (isSubmitted) return <SuccessMessage onClose={onSuccess} />;

  // 최종 번호 확인 화면 (UX 개선)
  if (showConfirm) {
    return (
      <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button
          onClick={() => setShowConfirm(false)}
          className="mb-6 flex items-center gap-1 text-sm text-stone-400 hover:text-stone-600 transition-colors"
        >
          <ChevronLeft size={16} /> 정보 수정하기
        </button>

        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-500">
            <Phone size={32} />
          </div>
          <h2 className="text-2xl font-bold text-stone-800">연락처가 정확하신가요?</h2>
          <p className="mt-2 text-stone-500">
            잘못된 번호를 입력하시면<br />
            소중한 상담 안내를 받으실 수 없습니다.
          </p>

          <div className="my-8 rounded-2xl bg-stone-50 p-6">
            <p className="text-sm text-stone-400">입력하신 번호</p>
            <p className="mt-1 text-3xl font-bold tracking-tight text-rose-500">{values.phone}</p>
          </div>

          <button
            onClick={handleFinalSubmit}
            disabled={isLoading}
            className="w-full rounded-xl bg-rose-500 py-4 text-lg font-semibold text-white shadow-lg shadow-rose-100 transition-all hover:bg-rose-600 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? "전송 중..." : "네, 정확합니다. 신청할게요"}
          </button>

          <p className="mt-4 text-xs text-stone-300">
            개인정보 보호법에 따라 안전하게 관리됩니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full animate-in fade-in duration-500">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-stone-800">무료 상담 신청</h2>
        <p className="mt-1 text-sm text-stone-500">전문 담당자가 48시간 이내에 연락드립니다.</p>
      </div>

      <div className="space-y-4">
        <Field label="이름" required error={touched.name ? errors.name : undefined}>
          <input
            type="text" placeholder="성함을 입력해주세요"
            value={values.name} onChange={(e) => handleChange('name', e.target.value)}
            onBlur={() => handleBlur('name')} className={inputClass(!!touched.name && !!errors.name)}
          />
        </Field>

        <Field label="연락처" required error={touched.phone ? errors.phone : undefined}>
          <input
            type="tel" placeholder="010-0000-0000"
            value={values.phone} onChange={(e) => handleChange('phone', e.target.value)}
            onBlur={() => handleBlur('phone')} className={inputClass(!!touched.phone && !!errors.phone)}
          />
        </Field>

        <Field label="상담 분야" required>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORY_OPTIONS.map((opt) => (
              <button
                key={opt.value} type="button" onClick={() => handleChange('category', opt.value)}
                className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition-all ${values.category === opt.value ? 'border-rose-400 bg-rose-50 text-rose-600' : 'border-stone-200 bg-white text-stone-600'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="예산 범위">
          <select value={values.budget} onChange={(e) => handleChange('budget', e.target.value as BudgetRange)} className={inputClass(false)}>
            {BUDGET_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </Field>

        <Field label="추가 메시지" optional>
          <textarea
            placeholder="궁금하신 사항을 적어주세요." value={values.message}
            onChange={(e) => handleChange('message', e.target.value)} rows={3} className={`${inputClass(false)} resize-none`}
          />
        </Field>

        <button
          type="button" onClick={handleRequestConfirm}
          className="w-full rounded-xl bg-rose-500 py-4 text-base font-semibold text-white shadow-sm transition-all hover:bg-rose-600 active:scale-[0.99]"
        >
          무료 상담 신청하기
        </button>
      </div>
    </div>
  );
}

function Field({ label, required, optional, error, children }: any) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1 text-sm font-medium text-stone-700">
        {label} {required && <span className="text-rose-400">*</span>} {optional && <span className="text-xs text-stone-400">(선택)</span>}
      </label>
      {children}
      {error && <p className="text-xs text-rose-500">{error}</p>}
    </div>
  );
}

function inputClass(hasError: boolean): string {
  return [
    'w-full rounded-xl border px-4 py-3 text-sm text-stone-800 outline-none transition-all',
    hasError ? 'border-rose-400 bg-rose-50' : 'border-stone-200 bg-white focus:border-rose-300 focus:ring-2 focus:ring-rose-100',
  ].join(' ');
}
