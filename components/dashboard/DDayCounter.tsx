'use client';

import { useState, useEffect } from 'react';
import { Icons } from '../common/Icons';

interface DDayCounterProps {
  onDateSet: (dday: number) => void;
}

function calcDday(dateString: string): number {
  const digits = dateString.replace(/\D/g, '');
  if (digits.length !== 8) return 0;

  const y = parseInt(digits.slice(0, 4));
  const m = parseInt(digits.slice(4, 6)) - 1;
  const d = parseInt(digits.slice(6, 8));

  const target = new Date(y, m, d);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

const formatDate = (val: string) => {
  const digits = val.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
};

export default function DDayCounter({ onDateSet }: DDayCounterProps) {
  const [dateInput, setDateInput] = useState('');
  const [dday, setDday] = useState<number | null>(null);

  // localStorage에서 복원
  useEffect(() => {
    const saved = localStorage.getItem('wcp_wedding_date');
    if (saved) {
      setDateInput(saved);
      const d = calcDday(saved);
      setDday(d);
      onDateSet(d);
    }
  }, [onDateSet]);

  function handleConfirm() {
    const digits = dateInput.replace(/\D/g, '');
    if (digits.length !== 8) return;

    const d = calcDday(dateInput);
    setDday(d);
    localStorage.setItem('wcp_wedding_date', dateInput);
    onDateSet(d);
  }

  function handleDateChange(val: string) {
    const formatted = formatDate(val);
    setDateInput(formatted);
  }

  const isValidDate = dateInput.replace(/\D/g, '').length === 8;

  const ddayLabel =
    dday === null ? null : dday > 0 ? `D - ${dday}` : dday === 0 ? 'D - DAY' : `D + ${Math.abs(dday)}`;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-100">
      <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-rose-400">
        Wedding D-Day
      </p>

      {dday !== null ? (
        <div className="mb-4">
          <p className="text-5xl font-bold tracking-tight text-stone-800">{ddayLabel}</p>
          <p className="mt-1 text-sm font-medium text-stone-500">
            {(() => {
              const digits = dateInput.replace(/\D/g, '');
              const y = parseInt(digits.slice(0, 4));
              const m = parseInt(digits.slice(4, 6)) - 1;
              const d = parseInt(digits.slice(6, 8));
              return new Date(y, m, d).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });
            })()}
          </p>
        </div>
      ) : (
        <p className="mb-4 text-sm font-medium text-stone-500">결혼 예정일을 입력하면 타임라인을 확인할 수 있습니다.</p>
      )}

      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="연도-월-일"
            value={dateInput}
            onChange={(e) => handleDateChange(e.target.value)}
            className="w-full rounded-xl border border-stone-200 pl-4 pr-10 py-2.5 text-sm text-stone-700 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
          />
          <Icons.Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
        </div>
        <button
          onClick={handleConfirm}
          disabled={!isValidDate}
          className="rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-600 disabled:opacity-40"
        >
          {dday !== null ? '변경' : '확인'}
        </button>
      </div>
    </div>
  );
}
