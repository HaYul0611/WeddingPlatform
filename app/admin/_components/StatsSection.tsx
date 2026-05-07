'use client';

import { useState, useEffect } from 'react';
import { Users, Inbox, BadgeCheck, Clock, ArrowUpRight, type IconProps } from './Icons';
import { StatsSkeleton } from './Skeletons';
import { getDemoStats } from '@/lib/demo-seed';
import type { StatsData } from '@/types/crm';

interface StatsSectionProps {
  isDemoMode: boolean;
  refreshKey: number;
}

interface StatCard {
  key: keyof StatsData;
  label: string;
  icon: React.FC<IconProps>;
  color: { bg: string; icon: string; value: string; ring: string };
}

const CARDS: StatCard[] = [
  {
    key: 'total',
    label: '전체 접수 상담',
    icon: Users,
    color: { bg: 'bg-slate-50', icon: 'text-slate-600', value: 'text-slate-900', ring: 'ring-slate-100' },
  },
  {
    key: 'new',
    label: '신규 신청',
    icon: Inbox,
    color: { bg: 'bg-rose-50/50', icon: 'text-rose-600', value: 'text-rose-900', ring: 'ring-rose-100/50' },
  },
  {
    key: 'contacted',
    label: '연락 진행 중',
    icon: Clock,
    color: { bg: 'bg-amber-50/50', icon: 'text-amber-600', value: 'text-amber-900', ring: 'ring-amber-100/50' },
  },
  {
    key: 'completed',
    label: '상담 완료',
    icon: BadgeCheck,
    color: { bg: 'bg-emerald-50/50', icon: 'text-emerald-600', value: 'text-emerald-900', ring: 'ring-emerald-100/50' },
  },
];

export default function StatsSection({ isDemoMode, refreshKey }: StatsSectionProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        if (isDemoMode) {
          await new Promise((r) => setTimeout(r, 400));
          setStats(getDemoStats());
        } else {
          const res = await fetch('/api/admin/stats');
          if (!res.ok) throw new Error('Failed to fetch stats');
          const json = await res.json();
          if (json.success) setStats(json.data);
        }
      } catch (err) {
        console.error('Stats load error:', err);
      } finally {
        setIsLoading(false);
      }
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
        const Icon = card.icon;
        const value = stats[card.key];
        const { bg, icon, value: valueCls, ring } = card.color;

        return (
          <div
            key={card.key}
            className="group relative overflow-hidden rounded-[2rem] border border-black/[0.03] bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]
                       transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)]"
          >
            <div className="relative mb-6 flex items-center justify-between">
              <p className="text-xs font-bold tracking-tight text-slate-400 uppercase">{card.label}</p>
              <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ring-1 transition-transform duration-500 group-hover:rotate-12 ${bg} ${ring}`}>
                <Icon size={18} className={icon} />
              </div>
            </div>

            <div className="relative">
              <p className={`text-4xl font-black tracking-tighter ${valueCls}`}>
                {value.toLocaleString()}
              </p>
            </div>

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
