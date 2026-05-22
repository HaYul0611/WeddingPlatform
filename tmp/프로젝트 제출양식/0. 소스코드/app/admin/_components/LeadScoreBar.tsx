'use client';

import { getScoreConfig } from '@/lib/lead-scoring';

interface LeadScoreBarProps {
  score: number;
  size?: 'sm' | 'md';
}

export default function LeadScoreBar({ score, size = 'sm' }: LeadScoreBarProps) {
  const cfg = getScoreConfig(score);

  if (size === 'sm') {
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ${cfg.bg} ${cfg.color}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${cfg.bar}`} />
        {score}
      </span>
    );
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-500">리드 점수</span>
        <span className={`text-sm font-bold ${cfg.color}`}>{score} <span className="text-xs font-normal text-slate-400">/ 100</span></span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-700 ${cfg.bar}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <p className={`text-right text-xs font-semibold ${cfg.color}`}>{cfg.label}</p>
    </div>
  );
}
