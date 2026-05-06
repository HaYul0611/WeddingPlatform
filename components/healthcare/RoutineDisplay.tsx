'use client';

import { useMemo } from 'react';
import { RoutineOutput } from '@/types/healthcare';

interface RoutineDisplayProps {
  routine: RoutineOutput;
}

export default function RoutineDisplay({ routine }: RoutineDisplayProps) {
  // BMI 상태 계산
  const bmiStatus = useMemo(() => {
    const val = routine.bmi;
    if (val < 18.5) return { label: '저체중', color: 'text-blue-600', bg: 'bg-blue-50', bar: 'bg-blue-500' };
    if (val < 23) return { label: '정상', color: 'text-emerald-600', bg: 'bg-emerald-50', bar: 'bg-emerald-500' };
    if (val < 25) return { label: '과체중', color: 'text-amber-600', bg: 'bg-amber-50', bar: 'bg-amber-500' };
    return { label: '비만', color: 'text-rose-600', bg: 'bg-rose-50', bar: 'bg-rose-500' };
  }, [routine.bmi]);

  return (
    <div className="space-y-4">
      {/* BMI 결과 카드 */}
      <section className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-1">Your BMI Index</p>
            <div className="flex items-baseline gap-2">
              <h2 className="text-4xl font-bold tracking-tight text-stone-800">{routine.bmi}</h2>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${bmiStatus.bg} ${bmiStatus.color}`}>
                {bmiStatus.label}
              </span>
            </div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-50">
            <svg className="h-6 w-6 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>

        {/* BMI 바 시각화 (간소화) */}
        <div className="mt-5 h-2 w-full rounded-full bg-stone-100 overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${bmiStatus.bar}`}
            style={{ width: `${Math.min(100, (routine.bmi / 40) * 100)}%` }}
          />
        </div>
        <p className="mt-3 text-[13px] text-stone-500 break-keep">
          이 수치는 일반적인 참고 지표이며, 근육량 등 개인 체성분에 따라 차이가 있을 수 있습니다.
        </p>
      </section>

      {/* 운동 루틴 */}
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-100">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </span>
          <h3 className="font-semibold text-stone-800">운동 가이드</h3>
        </div>

        <div className="mb-4 rounded-xl bg-emerald-50 px-4 py-3">
          <p className="text-xs text-emerald-600">선택하신 조건 기준</p>
          <p className="text-lg font-bold text-emerald-700">
            주 {routine.workoutDaysPerWeek}회 운동
          </p>
        </div>

        <ul className="space-y-3">
          {routine.workoutFocus.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-[14px] leading-relaxed text-stone-600 break-keep">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* 식단 가이드 */}
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-100">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
          </span>
          <h3 className="font-semibold text-stone-800">식단 가이드</h3>
        </div>

        <ul className="space-y-3">
          {routine.dietGuidelines.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-[14px] leading-relaxed text-stone-600 break-keep">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* 면책 고지 */}
      <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
        <p className="text-[13px] leading-relaxed text-stone-500 break-keep flex items-start gap-1.5">
          <svg className="mt-0.5 h-4 w-4 flex-shrink-0 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {routine.disclaimer}
        </p>
      </div>
    </div>
  );
}
