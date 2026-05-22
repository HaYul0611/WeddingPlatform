'use client';

import { useState, useEffect } from 'react';
import { getDemoStats } from '@/lib/demo-seed';
import { StatsSkeleton } from './Skeletons';
import type { StatsData, LeadStatus } from '@/types/crm';

interface FunnelPanelProps {
  isDemoMode: boolean;
  refreshKey: number;
  onFilterByStatus: (status: LeadStatus | 'all') => void;
}

// ── 퍼널 단계 설정 ────────────────────────
const FUNNEL_STEPS: {
  key: keyof Omit<StatsData, 'total'>;
  label: string;
  color: string;
  bar: string;
  text: string;
}[] = [
  { key: 'new',       label: '신규',    color: 'bg-blue-50',    bar: 'bg-blue-400',    text: 'text-blue-700'    },
  { key: 'qualified', label: '적합',    color: 'bg-violet-50',  bar: 'bg-violet-400',  text: 'text-violet-700'  },
  { key: 'matched',   label: '매칭',    color: 'bg-indigo-50',  bar: 'bg-indigo-400',  text: 'text-indigo-700'  },
  { key: 'contacted', label: '연락',    color: 'bg-amber-50',   bar: 'bg-amber-400',   text: 'text-amber-700'   },
  { key: 'completed', label: '완료',    color: 'bg-emerald-50', bar: 'bg-emerald-400', text: 'text-emerald-700' },
  { key: 'lost',      label: '이탈',    color: 'bg-red-50',     bar: 'bg-red-300',     text: 'text-red-600'     },
];

export default function FunnelPanel({ isDemoMode, refreshKey, onFilterByStatus }: FunnelPanelProps) {
  const [stats, setStats]         = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      if (isDemoMode) {
        await new Promise((r) => setTimeout(r, 350));
        setStats(getDemoStats());
      } else {
        const res  = await fetch('/api/admin/stats');
        const json = await res.json();
        if (json.success) setStats(json.data);
      }
      setIsLoading(false);
    }
    load();
  }, [isDemoMode, refreshKey]);

  if (isLoading || !stats) {
    return (
      <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm">
        <div className="mb-4 h-4 w-32 animate-pulse rounded-lg bg-slate-100" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 animate-pulse rounded-xl bg-slate-50" />
          ))}
        </div>
      </div>
    );
  }

  const maxCount = Math.max(stats.new, stats.qualified, stats.matched, stats.contacted, 1);
  const conversionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">Funnel 현황</h3>
        <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="text-xs font-semibold text-emerald-700">전환율 {conversionRate}%</span>
        </div>
      </div>

      <div className="space-y-2">
        {FUNNEL_STEPS.map((step) => {
          const count = stats[step.key as keyof StatsData] as number;
          const pct   = maxCount > 0 ? (count / maxCount) * 100 : 0;

          return (
            <button
              key={step.key}
              onClick={() => onFilterByStatus(step.key as LeadStatus)}
              className={`group w-full rounded-xl border border-transparent px-3 py-2.5 text-left transition-all duration-200
                hover:border-black/[0.06] hover:shadow-sm ${step.color}`}
            >
              <div className="mb-1.5 flex items-center justify-between">
                <span className={`text-xs font-semibold ${step.text}`}>{step.label}</span>
                <span className={`text-sm font-bold ${step.text}`}>{count}</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-black/[0.06]">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${step.bar}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onFilterByStatus('all')}
        className="mt-3 w-full rounded-xl border border-slate-100 py-2 text-xs font-semibold text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600"
      >
        전체 보기
      </button>
    </div>
  );
}
