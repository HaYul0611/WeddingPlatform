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
      { label: '전체 접수', value: total, color: 'bg-gradient-to-t from-stone-200 to-stone-50 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.05)] border border-white' },
      { label: '상담 진행', value: contacted, color: 'bg-gradient-to-t from-stone-400 to-stone-300 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.1)] border border-stone-200/50' },
      { label: '최종 완료', value: completed, color: 'bg-gradient-to-t from-stone-900 to-stone-700 shadow-[0_15px_30px_-10px_rgba(0,0,0,0.3)] border border-stone-600' },
    ];
  }, [stats]);

  // 2. 카테고리 비중 (데모용 임시 데이터, 실제로는 API 연동 가능)
  const categories = [
    { label: '웨딩', value: 45, color: '#1c1917' }, // stone-900
    { label: '뷰티', value: 25, color: '#78716c' }, // stone-500
    { label: '다이어트', value: 20, color: '#d6d3d1' }, // stone-300
    { label: '기타', value: 10, color: '#f5f5f4' }, // stone-100
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 fill-mode-both">
      {/* 1. 상담 퍼널 분석 */}
      <div className="col-span-1 rounded-[2.5rem] border border-white bg-white/70 p-8 shadow-sm backdrop-blur-md lg:col-span-2">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100/50 text-stone-600 ring-1 ring-stone-200/50">
              <Layers size={22} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 tracking-tight">상담 전환 퍼널</h3>
              <p className="text-xs font-semibold text-stone-400 mt-0.5">유입부터 최종 완료까지의 흐름</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-stone-200/50 bg-white px-3.5 py-1.5 text-[10px] font-bold text-stone-500 uppercase tracking-wider shadow-sm">
            Live Analysis
          </div>
        </div>

        <div className="relative flex h-48 items-end justify-between gap-4 px-4">
          {funnelSteps.map((step, i) => {
            const height = stats.total > 0 ? (step.value / stats.total) * 100 : 0;
            return (
              <div key={step.label} className="group relative flex h-full flex-1 flex-col justify-end items-center">
                {/* 바 그래프 */}
                <div
                  className={`relative w-full rounded-t-[1.5rem] rounded-b-xl transition-all duration-500 ease-out ${step.color} group-hover:brightness-110 group-hover:-translate-y-2 group-hover:scale-[1.02] flex flex-col justify-start items-center pt-3`}
                  style={{ height: `${Math.max(height, 8)}%` }}
                >
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 transition-all duration-300 group-hover:opacity-100 pointer-events-none z-10">
                    <div className="rounded-xl bg-white/90 backdrop-blur-sm px-3 py-1.5 text-[11px] font-black text-stone-700 shadow-xl border border-stone-100">
                      {step.value}건
                    </div>
                    <div className="mx-auto h-2 w-2 translate-y-[-4px] rotate-45 bg-white border-r border-b border-stone-100" />
                  </div>
                  
                  {/* 광택 효과 (Glass reflection) */}
                  <div className="absolute top-1 left-2 right-2 h-1/4 rounded-t-[1rem] bg-gradient-to-b from-white/30 to-transparent pointer-events-none" />
                </div>
                <p className="mt-4 shrink-0 text-xs font-bold text-stone-500 tracking-tight">{step.label}</p>
                {i < funnelSteps.length - 1 && (
                  <div className="absolute right-[-20%] top-1/2 -translate-y-1/2 text-stone-300">
                    <TrendingUp size={18} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. 카테고리 분포 (Donut) */}
      <div className="rounded-[2.5rem] border border-white bg-white/70 p-8 shadow-sm backdrop-blur-md">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100/50 text-stone-600 ring-1 ring-stone-200/50">
            <PieChart size={22} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-stone-900 tracking-tight">분야별 비중</h3>
            <p className="text-xs font-semibold text-stone-400 mt-0.5">인기 상담 카테고리</p>
          </div>
        </div>

        <div className="flex flex-col items-center">
          {/* Simple SVG Donut */}
          <div className="relative mb-8 flex h-32 w-32 items-center justify-center">
            <svg viewBox="0 0 36 36" className="h-32 w-32 -rotate-90">
              <circle cx="18" cy="18" r="15.915" fill="transparent" stroke="#f5f5f4" strokeWidth="4" />
              <circle
                cx="18" cy="18" r="15.915" fill="transparent" stroke="#1c1917" strokeWidth="4"
                strokeDasharray="45 55" strokeDashoffset="0"
                className="transition-all duration-1000 ease-out"
              />
              <circle
                cx="18" cy="18" r="15.915" fill="transparent" stroke="#78716c" strokeWidth="4"
                strokeDasharray="25 75" strokeDashoffset="-45"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">전체 합계</p>
              <p className="text-[1.5rem] leading-none mt-1 font-black tracking-tighter text-stone-900">{stats.total}</p>
            </div>
          </div>

          <div className="grid w-full grid-cols-2 gap-y-4 gap-x-2">
            {categories.map((cat) => (
              <div key={cat.label} className="group flex items-center gap-2 rounded-xl p-2 hover:bg-stone-50/80 transition-all duration-300 cursor-default hover:scale-105">
                <div className="h-2.5 w-2.5 rounded-full shadow-sm group-hover:scale-125 transition-transform" style={{ backgroundColor: cat.color }} />
                <p className="text-[11px] font-bold text-stone-600 group-hover:text-stone-900 transition-colors">{cat.label}</p>
                <p className="ml-auto text-[11px] font-black text-stone-400 group-hover:text-stone-700 transition-colors">{cat.value}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
