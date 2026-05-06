'use client';

import { useState, useEffect } from 'react';
import { Users, Inbox, BadgeCheck, Clock, ArrowUpRight, type LucideProps } from './Icons';
import { StatsSkeleton } from './Skeletons';
import { getDemoStats } from '@/lib/demo-seed';
import type { StatsData } from '@/types/crm';

interface StatsSectionProps {
  isDemoMode: boolean;
  refreshKey: number;
}

interface StatCard {
  key:     keyof StatsData;
  label:   string;
  icon:    React.FC<LucideProps>;
  color:   { bg: string; icon: string; value: string; ring: string };
}

const CARDS: StatCard[] = [
  {
    key: 'total',
    label: '전체 상담',
    icon: Users,
    color: { bg: 'bg-indigo-50', icon: 'text-indigo-600', value: 'text-indigo-700', ring: 'ring-indigo-100' },
  },
  {
    key: 'new',
    label: '신규',
    icon: Inbox,
    color: { bg: 'bg-blue-50', icon: 'text-blue-600', value: 'text-blue-700', ring: 'ring-blue-100' },
  },
  {
    key: 'contacted',
    label: '연락 완료',
    icon: Clock,
    color: { bg: 'bg-amber-50', icon: 'text-amber-600', value: 'text-amber-700', ring: 'ring-amber-100' },
  },
  {
    key: 'completed',
    label: '상담 완료',
    icon: BadgeCheck,
    color: { bg: 'bg-emerald-50', icon: 'text-emerald-600', value: 'text-emerald-700', ring: 'ring-emerald-100' },
  },
];

export default function StatsSection({ isDemoMode, refreshKey }: StatsSectionProps) {
  const [stats, setStats]     = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      if (isDemoMode) {
        await new Promise((r) => setTimeout(r, 400)); // 자연스러운 로딩
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

  if (isLoading || !stats) return <StatsSkeleton />;

  const completionRate = stats.total > 0
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {CARDS.map((card) => {
        const Icon  = card.icon;
        const value = stats[card.key];
        const { bg, icon, value: valueCls, ring } = card.color;

        return (
          <div
            key={card.key}
            className="group rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm
                       transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{card.label}</p>
              <div className={`rounded-xl p-2 ring-1 ${bg} ${ring}`}>
                <Icon size={16} className={icon} />
              </div>
            </div>

            <p className={`mb-1 text-3xl font-bold tracking-tight ${valueCls}`}>
              {value.toLocaleString()}
            </p>

            {card.key === 'completed' ? (
              <div className="flex items-center gap-1">
                <ArrowUpRight size={13} className="text-emerald-500" />
                <p className="text-xs text-slate-400">
                  완료율 <span className="font-semibold text-emerald-600">{completionRate}%</span>
                </p>
              </div>
            ) : card.key === 'total' ? (
              <p className="text-xs text-slate-400">
                전체 접수된 상담 수
              </p>
            ) : (
              <p className="text-xs text-slate-400">
                {stats.total > 0
                  ? `전체의 ${Math.round((value / stats.total) * 100)}%`
                  : '데이터 없음'}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
