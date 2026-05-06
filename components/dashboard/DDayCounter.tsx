'use client';

import { useState, useEffect } from 'react';

interface DDayCounterProps {
  onDateSet: (dday: number) => void;
}

function calcDday(dateString: string): number {
  const target = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

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
    if (!dateInput) return;
    const d = calcDday(dateInput);
    setDday(d);
    localStorage.setItem('wcp_wedding_date', dateInput);
    onDateSet(d);
  }

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
          <p className="mt-1 text-sm text-stone-400">
            {new Date(dateInput).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      ) : (
        <p className="mb-4 text-sm text-stone-400">결혼 예정일을 입력하면 타임라인을 확인할 수 있습니다.</p>
      )}

      <div className="flex gap-2">
        <input
          type="date"
          value={dateInput}
          onChange={(e) => setDateInput(e.target.value)}
          className="flex-1 rounded-xl border border-stone-200 px-4 py-2.5 text-sm text-stone-700 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
        />
        <button
          onClick={handleConfirm}
          disabled={!dateInput}
          className="rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-600 disabled:opacity-40"
        >
          {dday !== null ? '변경' : '확인'}
        </button>
      </div>
    </div>
  );
}
