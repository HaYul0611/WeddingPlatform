'use client';

import { useEffect, useCallback } from 'react';

export type LeadStatus = 'new' | 'contacted' | 'completed';

export interface Lead {
  id: string;
  name: string;
  phone: string;
  category: string;
  budget: string;
  message: string;
  source_page: string;
  created_at: string;
  status: LeadStatus;
}

interface LeadDetailModalProps {
  lead: Lead;
  onClose: () => void;
  onStatusChange: (id: string, status: LeadStatus) => void;
}

const CATEGORY_LABEL: Record<string, string> = {
  wedding: '💍 웨딩 서비스',
  beauty: '✨ 뷰티 / 피부 관리',
  healthcare: '💪 건강 / 다이어트',
  medical: '🏥 의료 / 시술 정보',
};

const BUDGET_LABEL: Record<string, string> = {
  undecided: '미정',
  under_500: '50만원 미만',
  '500_1000': '50 ~ 100만원',
  '1000_3000': '100 ~ 300만원',
  over_3000: '300만원 이상',
};

export const STATUS_CONFIG: Record<LeadStatus, { label: string; bg: string; text: string; dot: string }> = {
  new: { label: '신규', bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-400' },
  contacted: { label: '연락함', bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-400' },
  completed: { label: '완료', bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-400' },
};

const STATUS_BUTTONS: { value: LeadStatus; label: string; active: string; idle: string }[] = [
  {
    value: 'new',
    label: '신규',
    active: 'bg-blue-500 text-white',
    idle: 'border border-blue-200 text-blue-500 hover:bg-blue-50',
  },
  {
    value: 'contacted',
    label: '연락함',
    active: 'bg-amber-500 text-white',
    idle: 'border border-amber-200 text-amber-500 hover:bg-amber-50',
  },
  {
    value: 'completed',
    label: '완료',
    active: 'bg-emerald-500 text-white',
    idle: 'border border-emerald-200 text-emerald-500 hover:bg-emerald-50',
  },
];

export default function LeadDetailModal({ lead, onClose, onStatusChange }: LeadDetailModalProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  const receivedAt = new Date(lead.created_at).toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-stone-800">상담 상세</h2>
            <StatusBadge status={lead.status} />
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 본문 */}
        <div className="max-h-[65vh] overflow-y-auto px-6 py-5">
          <div className="space-y-4">
            <Row label="이름" value={lead.name} />
            <Row label="연락처" value={lead.phone} highlight />
            <Row label="상담 분야" value={CATEGORY_LABEL[lead.category] ?? lead.category} />
            <Row label="예산" value={BUDGET_LABEL[lead.budget] ?? lead.budget} />
            <Row label="유입 경로" value={lead.source_page} />
            <Row label="접수 시각" value={receivedAt} />

            {/* 메시지 */}
            <div>
              <p className="mb-1.5 text-xs font-medium text-stone-400">메시지</p>
              <div className="rounded-xl bg-stone-50 px-4 py-3">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-stone-600">
                  {lead.message?.trim() || '(없음)'}
                </p>
              </div>
            </div>

            {/* 상태 변경 */}
            <div>
              <p className="mb-2 text-xs font-medium text-stone-400">상태 변경</p>
              <div className="flex gap-2">
                {STATUS_BUTTONS.map((btn) => (
                  <button
                    key={btn.value}
                    onClick={() => onStatusChange(lead.id, btn.value)}
                    className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all ${lead.status === btn.value ? btn.active : btn.idle
                      }`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="border-t border-stone-100 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-stone-100 py-2.5 text-sm font-semibold text-stone-600 hover:bg-stone-200 transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 서브 컴포넌트 ─────────────────────────────
function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-stone-50 pb-3">
      <span className="flex-shrink-0 text-xs text-stone-400">{label}</span>
      <span className={`text-right text-sm ${highlight ? 'font-semibold text-rose-600' : 'text-stone-700'}`}>
        {value}
      </span>
    </div>
  );
}

export function StatusBadge({ status }: { status: LeadStatus }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.new;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
