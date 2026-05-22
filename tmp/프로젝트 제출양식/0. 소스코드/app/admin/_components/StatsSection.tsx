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
    color: { bg: 'bg-stone-100/50', icon: 'text-stone-600', value: 'text-stone-900', ring: 'ring-stone-200/50' },
  },
  {
    key: 'new',
    label: '신규 신청',
    icon: Inbox,
    color: { bg: 'bg-rose-50', icon: 'text-rose-500', value: 'text-rose-600', ring: 'ring-rose-100/50' },
  },
  {
    key: 'contacted',
    label: '연락 진행 중',
    icon: Clock,
    color: { bg: 'bg-orange-50', icon: 'text-orange-500', value: 'text-orange-600', ring: 'ring-orange-100/50' },
  },
  {
    key: 'completed',
    label: '상담 완료',
    icon: BadgeCheck,
    color: { bg: 'bg-emerald-50', icon: 'text-emerald-500', value: 'text-emerald-600', ring: 'ring-emerald-100/50' },
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
      {CARDS.map((card, index) => {
        const Icon = card.icon;
        const value = stats[card.key];
        const { bg, icon, value: valueCls, ring } = card.color;

        return (
          <div
            key={card.key}
            className="group relative overflow-hidden rounded-[2.5rem] border border-white bg-white/70 p-8 shadow-sm backdrop-blur-md
                       transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:bg-white animate-in fade-in slide-in-from-bottom-8"
            style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
          >
            <div className="relative mb-8 flex items-center justify-between">
              <p className="text-[13px] font-bold tracking-tight text-stone-500">{card.label}</p>
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ring-1 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 ${bg} ${ring}`}>
                <Icon size={22} className={icon} />
              </div>
            </div>

            <div className="relative mb-3">
              <p className={`text-[3.5rem] leading-none font-black tracking-tighter ${valueCls}`}>
                {value.toLocaleString()}
              </p>
            </div>

            {card.key === 'completed' ? (
              <div className="flex items-center gap-1.5 mt-1">
                <ArrowUpRight size={14} className="text-emerald-500" />
                <p className="text-[11px] font-bold text-stone-400">
                  완료율 <span className="text-emerald-500">{completionRate}%</span>
                </p>
              </div>
            ) : card.key === 'total' ? (
              <p className="text-[11px] font-bold text-stone-400 mt-1">
                전체 접수된 상담 수
              </p>
            ) : (
              <p className="text-[11px] font-bold text-stone-400 mt-1">
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
