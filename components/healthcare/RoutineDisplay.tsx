'use client';

import { RoutineOutput } from '@/types/healthcare';

interface RoutineDisplayProps {
  routine: RoutineOutput;
}

export default function RoutineDisplay({ routine }: RoutineDisplayProps) {
  return (
    <div className="space-y-4">
      {/* 운동 루틴 */}
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-100">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-base">
            💪
          </span>
          <h3 className="font-semibold text-stone-800">운동 가이드</h3>
        </div>

        <div className="mb-4 rounded-xl bg-emerald-50 px-4 py-3">
          <p className="text-xs text-emerald-600">선택하신 조건 기준</p>
          <p className="text-lg font-bold text-emerald-700">
            주 {routine.workoutDaysPerWeek}회 운동
          </p>
        </div>

        <ul className="space-y-2">
          {routine.workoutFocus.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-stone-600">
              <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-400" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* 식단 가이드 */}
      <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-100">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-base">
            🥗
          </span>
          <h3 className="font-semibold text-stone-800">식단 가이드</h3>
        </div>

        <ul className="space-y-2">
          {routine.dietGuidelines.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-stone-600">
              <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      {/* 면책 고지 */}
      <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
        <p className="text-xs leading-relaxed text-stone-400">
          ⚠ {routine.disclaimer}
        </p>
      </div>
    </div>
  );
}
