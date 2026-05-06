'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Phone, Tag, DollarSign, Calendar, MapPin, Info, User } from './Icons';
import MatchedCompanies from './MatchedCompanies';
import { STATUS_CONFIG, CATEGORY_CONFIG, BUDGET_LABEL } from './LeadCard';
import type { Lead, LeadStatus } from '@/types/crm';

interface LeadDetailModalProps {
  lead: Lead;
  isDemoMode: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: LeadStatus) => void;
}

type Tab = 'info' | 'matches';

const STATUS_BUTTONS: { value: LeadStatus; label: string; active: string; idle: string }[] = [
  { value: 'new',       label: '신규',   active: 'bg-blue-500 text-white shadow-sm',    idle: 'border border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-100'   },
  { value: 'contacted', label: '연락함', active: 'bg-amber-500 text-white shadow-sm',   idle: 'border border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100' },
  { value: 'completed', label: '완료',   active: 'bg-emerald-500 text-white shadow-sm', idle: 'border border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100' },
];

export default function LeadDetailModal({ lead, isDemoMode, onClose, onStatusChange }: LeadDetailModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('info');

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [handleKey]);

  const receivedAt = new Date(lead.created_at).toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });

  const statusCfg   = STATUS_CONFIG[lead.status ?? 'new'];
  const categoryCfg = CATEGORY_CONFIG[lead.category] ?? { label: lead.category, bg: 'bg-slate-50', text: 'text-slate-600' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative z-10 flex w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        style={{ maxHeight: '92vh' }}
      >
        {/* 헤더 */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold ${categoryCfg.bg} ${categoryCfg.text}`}>
              {lead.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">{lead.name}</p>
              <p className="text-xs text-slate-400">{lead.phone}</p>
            </div>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusCfg.bg} ${statusCfg.text}`}>
              {statusCfg.label}
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={16} />
          </button>
        </div>

        {/* 탭 */}
        <div className="flex shrink-0 border-b border-slate-100 px-6">
          {([['info', '상담 정보'], ['matches', '추천 업체']] as [Tab, string][]).map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative mr-2 py-3 text-sm font-medium transition-colors ${
                activeTab === tab ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {label}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-indigo-500" />
              )}
            </button>
          ))}
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {activeTab === 'info' && (
            <div className="space-y-5">
              {/* 기본 정보 그리드 */}
              <div className="grid grid-cols-2 gap-3">
                <InfoTile icon={<User size={13} />} label="이름" value={lead.name} />
                <InfoTile icon={<Phone size={13} />} label="연락처" value={lead.phone} highlight />
                <InfoTile icon={<Tag size={13} />} label="분야" value={categoryCfg.label} />
                <InfoTile icon={<DollarSign size={13} />} label="예산" value={BUDGET_LABEL[lead.budget] ?? lead.budget} />
                <InfoTile icon={<MapPin size={13} />} label="유입 경로" value={lead.source_page} />
                <InfoTile icon={<Calendar size={13} />} label="접수 시각" value={receivedAt} />
              </div>

              {/* 메시지 */}
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  <Info size={12} />
                  메시지
                </p>
                <div className="rounded-xl bg-slate-50 px-4 py-3">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
                    {lead.message?.trim() || '(없음)'}
                  </p>
                </div>
              </div>

              {/* 상태 변경 */}
              <div>
                <p className="mb-2 text-xs font-medium text-slate-500">상태 변경</p>
                <div className="flex gap-2">
                  {STATUS_BUTTONS.map((btn) => (
                    <button
                      key={btn.value}
                      onClick={() => onStatusChange(lead.id, btn.value)}
                      className={`flex-1 rounded-xl py-2.5 text-xs font-semibold transition-all ${
                        lead.status === btn.value ? btn.active : btn.idle
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'matches' && (
            <div className="space-y-4">
              <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">
                <p className="text-xs text-indigo-700">
                  <span className="font-semibold">{lead.name}</span>님의{' '}
                  <span className="font-semibold">{categoryCfg.label}</span> 분야 &middot;{' '}
                  <span className="font-semibold">{BUDGET_LABEL[lead.budget] ?? lead.budget}</span> 기준으로 매칭된 업체입니다.
                </p>
              </div>
              <MatchedCompanies
                leadId={lead.id}
                category={lead.category}
                budget={lead.budget}
                isDemoMode={isDemoMode}
              />
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="flex shrink-0 gap-2 border-t border-slate-100 px-6 py-4">
          {activeTab === 'info' ? (
            <button
              onClick={() => setActiveTab('matches')}
              className="flex-1 rounded-xl border border-indigo-200 bg-indigo-50 py-2.5 text-sm font-semibold text-indigo-600 transition-colors hover:bg-indigo-100"
            >
              추천 업체 보기
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('info')}
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100"
            >
              상담 정보
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-slate-100 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-200"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoTile({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-xl border border-black/[0.05] bg-slate-50 p-3">
      <div className="mb-1 flex items-center gap-1.5 text-slate-400">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className={`text-sm font-semibold ${highlight ? 'text-indigo-600' : 'text-slate-800'}`}>
        {value}
      </p>
    </div>
  );
}

export type { LeadStatus };
