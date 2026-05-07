'use client';

import { useState } from 'react';
import { BodyInfo, FitnessGoal, ActivityLevel } from '@/types/healthcare';

interface BodyInfoFormProps {
  onSubmit: (info: BodyInfo) => void;
}

const GOAL_OPTIONS: { value: FitnessGoal; label: string; desc: string }[] = [
  { value: 'diet', label: '체중 감량', desc: '웨딩 전 체중을 줄이고 싶어요' },
  { value: 'tone', label: '라인 관리', desc: '탄력 있는 몸매를 만들고 싶어요' },
  { value: 'maintain', label: '유지 관리', desc: '현재 상태를 건강하게 유지하고 싶어요' },
];

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string }[] = [
  { value: 'low', label: '낮음 (주 1회 이하)' },
  { value: 'medium', label: '보통 (주 2~3회)' },
  { value: 'high', label: '높음 (주 4회 이상)' },
];

const EMPTY: Omit<BodyInfo, 'weddingDday' | 'height' | 'weight'> & { height: string; weight: string } = {
  height: '',
  weight: '',
  goal: 'diet',
  activityLevel: 'medium',
};

export default function BodyInfoForm({ onSubmit }: BodyInfoFormProps) {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<{ height?: string; weight?: string }>({});

  function validate() {
    const e: typeof errors = {};
    const h = Number(values.height);
    const w = Number(values.weight);
    if (!values.height || isNaN(h) || h < 100 || h > 250) e.height = '올바른 키를 입력해 주세요. (100~250cm)';
    if (!values.weight || isNaN(w) || w < 30 || w > 200) e.weight = '올바른 몸무게를 입력해 주세요. (30~200kg)';
    return e;
  }

  function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    const savedDate = localStorage.getItem('wcp_wedding_date');
    const weddingDday = savedDate
      ? Math.ceil((new Date(savedDate).getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000)
      : 180; // 날짜 미설정 시 기본값

    onSubmit({
      height: Number(values.height),
      weight: Number(values.weight),
      goal: values.goal,
      activityLevel: values.activityLevel,
      weddingDday,
    });
  }

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-100">
      <h2 className="mb-4 text-base font-semibold text-stone-800">기본 정보 입력</h2>

      <div className="space-y-5">
        {/* 키 / 몸무게 */}
        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="키"
            unit="cm"
            value={values.height}
            onChange={(v) => { setValues((p) => ({ ...p, height: v })); setErrors((p) => ({ ...p, height: undefined })); }}
            error={errors.height}
            placeholder="165"
          />
          <InputField
            label="몸무게"
            unit="kg"
            value={values.weight}
            onChange={(v) => { setValues((p) => ({ ...p, weight: v })); setErrors((p) => ({ ...p, weight: undefined })); }}
            error={errors.weight}
            placeholder="58"
          />
        </div>

        {/* 목표 */}
        <div>
          <p className="mb-2 text-sm font-medium text-stone-700">목표</p>
          <div className="space-y-2">
            {GOAL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setValues((p) => ({ ...p, goal: opt.value }))}
                className={`w-full rounded-xl border px-4 py-3 text-left transition-all ${values.goal === opt.value
                    ? 'border-rose-400 bg-rose-50'
                    : 'border-stone-200 bg-white hover:border-rose-200'
                  }`}
              >
                <p className={`text-sm font-semibold ${values.goal === opt.value ? 'text-rose-600' : 'text-stone-700'}`}>
                  {opt.label}
                </p>
                <p className="mt-0.5 text-xs text-stone-400">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 활동량 */}
        <div>
          <p className="mb-2 text-sm font-medium text-stone-700">현재 활동량</p>
          <div className="grid grid-cols-3 gap-2">
            {ACTIVITY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setValues((p) => ({ ...p, activityLevel: opt.value }))}
                className={`rounded-xl border py-2.5 text-center text-xs font-semibold transition-all ${values.activityLevel === opt.value
                    ? 'border-rose-400 bg-rose-50 text-rose-600'
                    : 'border-stone-200 bg-white text-stone-500 hover:border-rose-200'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          className="w-full rounded-xl bg-rose-500 py-3.5 text-sm font-semibold text-white hover:bg-rose-600 active:scale-[0.99] transition-all"
        >
          루틴 확인하기
        </button>
      </div>
    </div>
  );
}

function InputField({
  label, unit, value, onChange, error, placeholder,
}: {
  label: string; unit: string; value: string;
  onChange: (v: string) => void; error?: string; placeholder: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-stone-700">{label}</label>
      <div className={`flex items-center rounded-xl border px-3 py-2.5 ${error ? 'border-rose-400 bg-rose-50' : 'border-stone-200 bg-white focus-within:border-rose-300 focus-within:ring-2 focus-within:ring-rose-100'}`}>
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-stone-800 outline-none placeholder:text-stone-300"
        />
        <span className="ml-1 text-xs text-stone-400">{unit}</span>
      </div>
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </div>
  );
}
