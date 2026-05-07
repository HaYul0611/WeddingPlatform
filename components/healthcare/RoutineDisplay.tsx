import { useMemo } from 'react';
import { RoutineOutput, HealthcareCompany } from '@/types/healthcare';
import { MapPin, ArrowRight, Sparkles } from 'lucide-react';
import { useConsultation } from '@/hooks/useConsultation';

interface RoutineDisplayProps {
  routine: RoutineOutput;
  openModal: (sourcePage: string, category?: any) => void;
}

export default function RoutineDisplay({ routine, openModal }: RoutineDisplayProps) {
  // BMI 상태 계산
  const bmiStatus = useMemo(() => {
    const val = routine.bmi;
    if (val < 18.5) return { label: '저체중', color: 'text-sky-500', bg: 'bg-sky-50', bar: 'bg-sky-400' };
    if (val < 23) return { label: '정상', color: 'text-rose-500', bg: 'bg-rose-50', bar: 'bg-rose-500' };
    if (val < 25) return { label: '과체중', color: 'text-amber-500', bg: 'bg-amber-50', bar: 'bg-amber-500' };
    return { label: '비만', color: 'text-rose-700', bg: 'bg-rose-50', bar: 'bg-rose-600' };
  }, [routine.bmi]);

  return (
    <div className="space-y-6">
      {/* BMI 결과 카드 */}
      <section className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-stone-400 mb-1">나의 BMI 지수(체질량지수)</p>
            <div className="flex items-baseline gap-2">
              <h2 className={`font-round text-5xl font-black tracking-tight ${bmiStatus.color}`}>{routine.bmi}</h2>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${bmiStatus.bg} ${bmiStatus.color}`}>
                {bmiStatus.label}
              </span>
            </div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-50 text-stone-400">
            <Sparkles size={24} />
          </div>
        </div>

        {/* BMI 바 시각화 */}
        <div className="mt-5 h-2 w-full rounded-full bg-stone-100 overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ${bmiStatus.bar}`}
            style={{ width: `${Math.min(100, (routine.bmi / 40) * 100)}%` }}
          />
        </div>
        <p className="mt-4 text-[13px] leading-relaxed text-stone-500 break-keep">
          {routine.workoutFocus[routine.workoutFocus.length - 2]} {/* BMI 조언 추출 */}
        </p>
      </section>

      {/* 추천 센터 리스트 */}
      {routine.recommendedCompanies.length > 0 && (
        <section className="space-y-3">
          <h3 className="flex items-center gap-2 px-1 text-sm font-bold text-stone-800">
            <MapPin size={16} className="text-rose-500" />
            내 주변 추천 센터
          </h3>
          <div className="space-y-3">
            {routine.recommendedCompanies.map((company) => (
              <div
                key={company.id}
                onClick={() => openModal(`healthcare-${company.id}`, 'healthcare')}
                className="group relative cursor-pointer rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-100 transition-all hover:shadow-md hover:ring-rose-300"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="mb-1.5 flex items-center gap-2">
                      <span className="rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-500">
                        {company.type.toUpperCase()}
                      </span>
                      <h4 className="text-[16px] font-bold text-stone-800">{company.name}</h4>
                    </div>
                    <p className="text-sm text-stone-500 line-clamp-1">{company.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {company.tags.map(tag => (
                        <span key={tag} className="rounded-full bg-stone-50 px-2 py-0.5 text-[10px] text-stone-500 font-medium border border-stone-100">#{tag}</span>
                      ))}
                    </div>
                  </div>
                  <div
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-stone-50 text-stone-400 transition-all group-hover:bg-rose-500 group-hover:text-white group-hover:scale-110"
                  >
                    <ArrowRight size={20} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 상세 가이드 (운동/식단) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* 운동 가이드 */}
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-100">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-[14px] font-bold text-stone-800">운동 가이드</h3>
          </div>
          <div className="mb-3 rounded-xl bg-emerald-50/50 px-3 py-2">
            <p className="text-[10px] font-bold text-emerald-600">권장 횟수</p>
            <p className="text-base font-black text-emerald-700">주 {routine.workoutDaysPerWeek}회</p>
          </div>
          <ul className="space-y-2">
            {routine.workoutFocus.slice(0, 3).map((item, i) => (
              <li key={i} className="text-[13px] leading-snug text-stone-600 break-keep flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-emerald-400" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* 식단 가이드 */}
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-100">
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-50 text-amber-600">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
            <h3 className="text-[14px] font-bold text-stone-800">식단 가이드</h3>
          </div>
          <ul className="space-y-2">
            {routine.dietGuidelines.map((item, i) => (
              <li key={i} className="text-[13px] leading-snug text-stone-600 break-keep flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-amber-400" />
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* 면책 고지 */}
      <div className="rounded-xl bg-stone-50 p-3 ring-1 ring-stone-100">
        <p className="text-[11px] leading-relaxed text-stone-400 break-keep">
          {routine.disclaimer}
        </p>
      </div>
    </div>
  );
}
