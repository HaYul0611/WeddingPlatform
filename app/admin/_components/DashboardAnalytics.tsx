'use client';

import { useMemo } from 'react';
import { StatsData } from '@/types/crm';
import { TrendingUp, PieChart, Layers } from 'lucide-react';

interface DashboardAnalyticsProps {
  stats: StatsData;
}

export default function DashboardAnalytics({ stats }: DashboardAnalyticsProps) {
  // 1. 퍼널 데이터 계산
  const funnelSteps = useMemo(() => {
    const { total, contacted, completed } = stats;
    return [
      { label: '전체 접수', value: total, color: 'bg-slate-200' },
      { label: '상담 진행', value: contacted, color: 'bg-amber-400' },
      { label: '최종 완료', value: completed, color: 'bg-emerald-500' },
    ];
  }, [stats]);

  // 2. 카테고리 비중 (데모용 임시 데이터, 실제로는 API 연동 가능)
  const categories = [
    { label: '웨딩', value: 45, color: '#E2626E' },
    { label: '뷰티', value: 25, color: '#F7B7BB' },
    { label: '다이어트', value: 20, color: '#FBDBDD' },
    { label: '기타', value: 10, color: '#F1F5F9' },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* 1. 상담 퍼널 분석 */}
      <div className="col-span-1 rounded-[2.5rem] border border-black/[0.03] bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] lg:col-span-2">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <Layers size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">상담 전환 퍼널</h3>
              <p className="text-xs text-slate-400">유입부터 최종 완료까지의 흐름</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            실시간 분석
          </div>
        </div>

        <div className="relative flex h-48 items-end justify-between gap-4 px-4">
          {funnelSteps.map((step, i) => {
            const height = stats.total > 0 ? (step.value / stats.total) * 100 : 0;
            return (
              <div key={step.label} className="group relative flex flex-1 flex-col items-center">
                {/* 바 그래프 */}
                <div
                  className={`relative w-full rounded-2xl transition-all duration-1000 ease-out ${step.color} shadow-sm group-hover:brightness-95`}
                  style={{ height: `${Math.max(height, 5)}%` }}
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 scale-90 opacity-0 transition-all group-hover:scale-100 group-hover:opacity-100">
                    <div className="rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-bold text-white shadow-xl">
                      {step.value}건
                    </div>
                    <div className="mx-auto h-2 w-2 translate-y-[-4px] rotate-45 bg-slate-900" />
                  </div>
                </div>
                <p className="mt-4 text-xs font-bold text-slate-500">{step.label}</p>
                {i < funnelSteps.length - 1 && (
                  <div className="absolute right-[-20%] top-1/2 -translate-y-1/2 text-slate-200">
                    <TrendingUp size={16} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. 카테고리 분포 (Donut) */}
      <div className="rounded-[2.5rem] border border-black/[0.03] bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <PieChart size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">분야별 비중</h3>
            <p className="text-xs text-slate-400">인기 상담 카테고리</p>
          </div>
        </div>

        <div className="flex flex-col items-center">
          {/* Simple SVG Donut */}
          <div className="relative mb-8 flex h-32 w-32 items-center justify-center">
            <svg viewBox="0 0 36 36" className="h-32 w-32 -rotate-90">
              <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#F1F5F9" strokeWidth="4" />
              <circle
                cx="18" cy="18" r="15.915" fill="transparent" stroke="#E2626E" strokeWidth="4"
                strokeDasharray="45 55" strokeDashoffset="0"
                className="transition-all duration-1000 ease-out"
              />
              <circle
                cx="18" cy="18" r="15.915" fill="transparent" stroke="#F7B7BB" strokeWidth="4"
                strokeDasharray="25 75" strokeDashoffset="-45"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">전체 합계</p>
              <p className="text-xl font-black text-slate-900">{stats.total}</p>
            </div>
          </div>

          <div className="grid w-full grid-cols-2 gap-3">
            {categories.map((cat) => (
              <div key={cat.label} className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: cat.color }} />
                <p className="text-[11px] font-bold text-slate-600">{cat.label}</p>
                <p className="ml-auto text-[11px] font-medium text-slate-400">{cat.value}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
