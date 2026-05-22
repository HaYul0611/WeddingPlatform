'use client';

import { Phone, Tag, DollarSign, Calendar, ChevronRight } from './Icons';
import type { Lead, LeadStatus } from '@/types/crm';

interface LeadCardProps {
  lead: Lead;
  onClick: (lead: Lead) => void;
}

// ── 상수 ─────────────────────────────────
export const CATEGORY_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  wedding: { label: '웨딩', bg: 'bg-rose-50', text: 'text-rose-600' },
  beauty: { label: '뷰티', bg: 'bg-pink-50', text: 'text-pink-600' },
  healthcare: { label: '건강관리', bg: 'bg-emerald-50', text: 'text-emerald-600' },
  medical: { label: '의료', bg: 'bg-blue-50', text: 'text-blue-600' },
};

export const STATUS_CONFIG: Record<LeadStatus, { label: string; bg: string; text: string; bar: string }> = {
  new: { label: '신규', bg: 'bg-blue-50', text: 'text-blue-700', bar: 'bg-blue-400' },
  qualified: { label: '적합', bg: 'bg-violet-50', text: 'text-violet-700', bar: 'bg-violet-400' },
  matched: { label: '매칭됨', bg: 'bg-indigo-50', text: 'text-indigo-700', bar: 'bg-indigo-400' },
  contacted: { label: '연락함', bg: 'bg-amber-50', text: 'text-amber-700', bar: 'bg-amber-400' },
  completed: { label: '완료', bg: 'bg-emerald-50', text: 'text-emerald-700', bar: 'bg-emerald-400' },
  lost: { label: '이탈', bg: 'bg-red-50', text: 'text-red-700', bar: 'bg-red-400' },
};

export const STATUS_BUTTONS: { value: LeadStatus; label: string; active: string; idle: string }[] = [
  { value: 'new', label: '신규', active: 'bg-blue-500 text-white shadow-sm', idle: 'border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100' },
  { value: 'qualified', label: '적합', active: 'bg-violet-500 text-white shadow-sm', idle: 'border border-violet-200 bg-violet-50 text-violet-600 hover:bg-violet-100' },
  { value: 'matched', label: '매칭', active: 'bg-indigo-500 text-white shadow-sm', idle: 'border border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100' },
  { value: 'contacted', label: '연락함', active: 'bg-amber-500 text-white shadow-sm', idle: 'border border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100' },
  { value: 'completed', label: '완료', active: 'bg-emerald-500 text-white shadow-sm', idle: 'border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100' },
  { value: 'lost', label: '이탈', active: 'bg-red-500 text-white shadow-sm', idle: 'border border-red-200 bg-red-50 text-red-600 hover:bg-red-100' },
];

export const BUDGET_LABEL: Record<string, string> = {
  undecided: '예산 미정',
  under_500: '50만원 미만',
  '500_1000': '50~100만원',
  '1000_3000': '100~300만원',
  over_3000: '300만원 이상',
};

// ── 유틸 ─────────────────────────────────
function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 60) return `${mins}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 30) return `${days}일 전`;
  return new Date(iso).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

function getInitial(name: string): string {
  return name.charAt(0);
}

// ── 컴포넌트 ─────────────────────────────
export default function LeadCard({ lead, onClick }: LeadCardProps) {
  const status = STATUS_CONFIG[lead.status ?? 'new'];
  const category = CATEGORY_CONFIG[lead.category] ?? { label: lead.category, bg: 'bg-stone-50', text: 'text-stone-600' };

  return (
    <button
      onClick={() => onClick(lead)}
      className="group relative w-full overflow-hidden rounded-[2rem] border border-white bg-white/70 backdrop-blur-md p-6 text-left shadow-sm
                 transition-all duration-300 hover:-translate-y-2 hover:bg-white hover:shadow-xl
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500"
    >
      <div className="absolute right-0 top-0 h-1.5 w-full bg-gradient-to-r from-transparent via-stone-100 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
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
            <p className="text-[17px] font-black tracking-tight text-stone-900 group-hover:text-stone-600 transition-colors">{lead.name}</p>
            <div className="mt-1 flex items-center gap-1.5 text-xs font-bold text-stone-400">
              <Phone size={11} className="text-stone-300" />
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
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-black ${category.bg} ${category.text}`}>
          <Tag size={10} />
          {category.label}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-stone-100/50 px-2.5 py-0.5 text-[11px] font-bold text-stone-500">
          <DollarSign size={10} />
          {BUDGET_LABEL[lead.budget] ?? lead.budget}
        </span>
      </div>

      {/* 메시지 미리보기 */}
      {lead.message && (
        <p className="mb-4 line-clamp-2 text-xs leading-relaxed text-stone-500 font-medium">
          {lead.message}
        </p>
      )}

      {/* 푸터 */}
      <div className="flex items-center justify-between border-t border-stone-100/50 pt-3">
        <div className="flex items-center gap-1 text-[11px] font-bold text-stone-400">
          <Calendar size={11} />
          <span className="uppercase tracking-widest">{timeAgo(lead.created_at)}</span>
        </div>
        <ChevronRight
          size={14}
          className="text-stone-300 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-stone-500"
        />
      </div>
    </button>
  );
}
