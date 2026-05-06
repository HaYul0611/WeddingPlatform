'use client';

import { Phone, Tag, DollarSign, Calendar, ChevronRight } from './Icons';
import type { Lead, LeadStatus } from '@/types/crm';

interface LeadCardProps {
  lead: Lead;
  onClick: (lead: Lead) => void;
}

// ── 상수 ─────────────────────────────────
export const CATEGORY_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  wedding:    { label: '웨딩',    bg: 'bg-rose-50',    text: 'text-rose-600'    },
  beauty:     { label: '뷰티',    bg: 'bg-pink-50',    text: 'text-pink-600'    },
  healthcare: { label: '건강관리', bg: 'bg-emerald-50', text: 'text-emerald-600' },
  medical:    { label: '의료',    bg: 'bg-blue-50',    text: 'text-blue-600'    },
};

export const STATUS_CONFIG: Record<LeadStatus, { label: string; bg: string; text: string; bar: string }> = {
  new:       { label: '신규',   bg: 'bg-blue-50',    text: 'text-blue-700',    bar: 'bg-blue-400'    },
  contacted: { label: '연락함', bg: 'bg-amber-50',   text: 'text-amber-700',   bar: 'bg-amber-400'   },
  completed: { label: '완료',   bg: 'bg-emerald-50', text: 'text-emerald-700', bar: 'bg-emerald-400' },
};

export const BUDGET_LABEL: Record<string, string> = {
  undecided:   '예산 미정',
  under_500:   '50만원 미만',
  '500_1000':  '50~100만원',
  '1000_3000': '100~300만원',
  over_3000:   '300만원 이상',
};

// ── 유틸 ─────────────────────────────────
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 60)  return `${mins}분 전`;
  if (hours < 24)  return `${hours}시간 전`;
  if (days  < 30)  return `${days}일 전`;
  return new Date(iso).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

function getInitial(name: string): string {
  return name.charAt(0);
}

// ── 컴포넌트 ─────────────────────────────
export default function LeadCard({ lead, onClick }: LeadCardProps) {
  const status   = STATUS_CONFIG[lead.status   ?? 'new'];
  const category = CATEGORY_CONFIG[lead.category] ?? { label: lead.category, bg: 'bg-slate-50', text: 'text-slate-600' };

  return (
    <button
      onClick={() => onClick(lead)}
      className="group w-full rounded-2xl border border-black/[0.06] bg-white p-5 text-left shadow-sm
                 transition-all duration-200 hover:-translate-y-0.5 hover:border-black/10 hover:shadow-md
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
    >
      {/* 헤더 행 */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* 아바타 */}
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold
              ${category.bg} ${category.text}`}
          >
            {getInitial(lead.name)}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">{lead.name}</p>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Phone size={11} />
              <span>{lead.phone}</span>
            </div>
          </div>
        </div>

        {/* 상태 배지 */}
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${status.bg} ${status.text}`}
        >
          {status.label}
        </span>
      </div>

      {/* 태그 행 */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${category.bg} ${category.text}`}>
          <Tag size={10} />
          {category.label}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-500">
          <DollarSign size={10} />
          {BUDGET_LABEL[lead.budget] ?? lead.budget}
        </span>
      </div>

      {/* 메시지 미리보기 */}
      {lead.message && (
        <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-slate-400">
          {lead.message}
        </p>
      )}

      {/* 푸터 */}
      <div className="flex items-center justify-between border-t border-slate-50 pt-3">
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Calendar size={11} />
          <span>{timeAgo(lead.created_at)}</span>
        </div>
        <ChevronRight
          size={14}
          className="text-slate-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-slate-500"
        />
      </div>
    </button>
  );
}
