'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, Phone, Tag, DollarSign, Calendar, MapPin, Info, User, MessageSquare, Send, History } from 'lucide-react';
import MatchedCompanies from './MatchedCompanies';
import { STATUS_CONFIG, CATEGORY_CONFIG, BUDGET_LABEL, STATUS_BUTTONS } from './LeadCard';
import type { Lead, LeadStatus } from '@/types/crm';

interface LeadDetailModalProps {
  lead: Lead;
  isDemoMode: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: LeadStatus) => void;
}

type Tab = 'info' | 'matches' | 'activities';

interface Activity {
  id: string;
  action: string;
  from_status?: string;
  to_status?: string;
  note?: string;
  created_at: string;
}

export default function LeadDetailModal({ lead, isDemoMode, onClose, onStatusChange }: LeadDetailModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // 활동 이력 조회
  const fetchActivities = useCallback(async () => {
    if (isDemoMode) {
      // 데모 모드 가상 데이터
      setActivities([
        { id: '1', action: 'status_change', to_status: 'new', note: '상담 신청 접수 완료', created_at: lead.created_at },
        { id: '2', action: 'note_added', note: '카카오 알림톡 자동 발송 완료', created_at: lead.created_at }
      ]);
      return;
    }

    setIsActivitiesLoading(true);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}/activity`);
      const result = await res.json();
      if (result.success) setActivities(result.data);
    } catch (err) {
      console.error('Failed to fetch activities:', err);
    } finally {
      setIsActivitiesLoading(false);
    }
  }, [lead.id, lead.created_at, isDemoMode]);

  useEffect(() => {
    if (activeTab === 'activities') fetchActivities();
  }, [activeTab, fetchActivities]);

  // 메시지 발송 (시뮬레이션)
  const handleSendMessage = async (type: 'kakao' | 'sms') => {
    if (!message.trim()) return;

    setIsSending(true);
    try {
      const res = await fetch(`/api/admin/leads/${lead.id}/activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'note_added',
          note: `[${type === 'kakao' ? '알림톡' : 'SMS'} 발송] ${message}`
        })
      });

      if (res.ok) {
        setMessage('');
        if (activeTab === 'activities') fetchActivities();
        else setActiveTab('activities'); // 발송 후 이력 탭으로 이동
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const receivedAt = new Date(lead.created_at).toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  });

  const statusCfg = STATUS_CONFIG[lead.status ?? 'new'];
  const categoryCfg = CATEGORY_CONFIG[lead.category] ?? { label: lead.category, bg: 'bg-slate-50', text: 'text-slate-600' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 flex w-full max-w-xl flex-col overflow-hidden rounded-[2.5rem] border border-white bg-white/90 backdrop-blur-xl shadow-2xl animate-in zoom-in-95 duration-300" style={{ maxHeight: '92vh' }}>
        {/* 헤더 */}
        <div className="flex shrink-0 items-center justify-between border-b border-stone-200/50 px-8 py-6">
          <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-black shadow-sm ring-1 ring-white/50 ${categoryCfg.bg} ${categoryCfg.text}`}>
              {lead.name.charAt(0)}
            </div>
            <div>
              <p className="text-lg font-black text-stone-900 tracking-tight">{lead.name}</p>
              <p className="text-[13px] font-bold text-stone-400 mt-0.5">{lead.phone}</p>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs font-bold shadow-sm ${statusCfg.bg} ${statusCfg.text}`}>
              {statusCfg.label}
            </span>
          </div>
          <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-2xl text-stone-400 bg-stone-50 hover:bg-stone-100 hover:text-stone-600 transition-colors shadow-sm"><X size={18} /></button>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex shrink-0 border-b border-stone-200/50 px-8 overflow-x-auto scrollbar-hide">
          {([['info', '정보'], ['matches', '매칭'], ['activities', '활동/메시지']] as [Tab, string][]).map(([tab, label]) => (
            <button
              key={tab} onClick={() => setActiveTab(tab)}
              className={`relative mr-8 py-4 text-[13px] font-bold transition-colors whitespace-nowrap ${activeTab === tab ? 'text-rose-500' : 'text-stone-400 hover:text-stone-600'}`}
            >
              {label}
              {activeTab === tab && <span className="absolute bottom-0 left-0 right-0 h-[3px] rounded-t-full bg-rose-500 animate-in fade-in zoom-in duration-300" />}
            </button>
          ))}
        </div>

        {/* 본문 콘텐츠 */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {activeTab === 'info' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-2 gap-4">
                <InfoTile icon={<User size={14} />} label="이름" value={lead.name} />
                <InfoTile icon={<Phone size={14} />} label="연락처" value={lead.phone} highlight />
                <InfoTile icon={<Tag size={14} />} label="분야" value={categoryCfg.label} />
                <InfoTile icon={<DollarSign size={14} />} label="예산" value={BUDGET_LABEL[lead.budget] ?? lead.budget} />
                <InfoTile icon={<MapPin size={14} />} label="유입 경로" value={lead.source_page} />
                <InfoTile icon={<Calendar size={14} />} label="접수 시각" value={receivedAt} />
              </div>

              <div>
                <p className="mb-3 flex items-center gap-1.5 text-xs font-bold text-stone-500 uppercase tracking-widest"><Info size={14} /> 상담 요청 메시지</p>
                <div className="rounded-2xl bg-white px-5 py-4 border border-stone-100 shadow-sm"><p className="text-sm font-medium leading-relaxed text-stone-600 whitespace-pre-wrap">{lead.message?.trim() || '(없음)'}</p></div>
              </div>

              <div>
                <p className="mb-3 text-xs font-bold text-stone-500 uppercase tracking-widest">리드 상태 관리</p>
                <div className="grid grid-cols-3 gap-2">
                  {STATUS_BUTTONS.map((btn) => (
                    <button key={btn.value} onClick={() => onStatusChange(lead.id, btn.value)}
                      className={`rounded-xl py-3 text-[13px] font-black transition-all shadow-sm ${lead.status === btn.value ? btn.active.replace('indigo', 'rose').replace('blue', 'stone') : btn.idle.replace('indigo', 'rose').replace('blue', 'stone')}`}>
                      {btn.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'matches' && (
            <div className="space-y-4">
              <MatchedCompanies leadId={lead.id} category={lead.category} budget={lead.budget} isDemoMode={isDemoMode} />
            </div>
          )}

          {activeTab === 'activities' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              {/* 메시지 발송 센터 */}
              <div className="rounded-[2rem] border border-white bg-white/50 p-6 shadow-sm backdrop-blur-md">
                <p className="mb-4 flex items-center gap-2 text-sm font-bold text-stone-800">
                  <MessageSquare size={18} className="text-rose-500" /> 메시지 발송
                </p>
                <textarea
                  value={message} onChange={(e) => setMessage(e.target.value)}
                  placeholder="고객님께 보낼 메시지를 입력하세요..."
                  className="w-full min-h-[120px] rounded-2xl border border-white bg-white/70 backdrop-blur-sm p-4 text-[13px] font-bold text-stone-700 outline-none focus:border-rose-300 focus:ring-4 focus:ring-rose-50 transition-all resize-none shadow-sm"
                />
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => handleSendMessage('kakao')} disabled={isSending || !message.trim()}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#FEE500] py-3 text-[13px] font-black text-[#191919] hover:bg-[#FADA0A] disabled:opacity-50 transition-all shadow-sm"
                  >
                    <Send size={16} /> 카카오 알림톡 발송
                  </button>
                  <button
                    onClick={() => handleSendMessage('sms')} disabled={isSending || !message.trim()}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-stone-900 py-3 text-[13px] font-black text-white hover:bg-black disabled:opacity-50 transition-all shadow-sm"
                  >
                    <Send size={16} /> SMS 문자 발송
                  </button>
                </div>
              </div>

              {/* 활동 이력 타임라인 */}
              <div>
                <p className="mb-6 flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-widest">
                  <History size={16} /> 활동 내역
                </p>
                <div className="space-y-6 relative before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-px before:bg-stone-200">
                  {isActivitiesLoading ? (
                    <div className="text-center py-10 text-stone-400 text-sm font-bold">기록 불러오는 중...</div>
                  ) : activities.length === 0 ? (
                    <div className="text-center py-10 text-stone-400 text-sm font-bold">활동 기록이 없습니다.</div>
                  ) : (
                    activities.map((act) => (
                      <div key={act.id} className="relative pl-10 animate-in slide-in-from-left-2 duration-300">
                        <div className={`absolute left-0 top-1.5 h-8 w-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${act.action === 'status_change' ? 'bg-rose-500' : 'bg-stone-500'}`}>
                          <div className="h-2 w-2 rounded-full bg-white" />
                        </div>
                        <div className="rounded-2xl border border-white bg-white/70 backdrop-blur-sm p-4 shadow-sm">
                          <p className="text-[13px] font-bold text-stone-800">{act.note}</p>
                          <p className="mt-1.5 text-[11px] font-bold text-stone-400 tracking-widest uppercase">{new Date(act.created_at).toLocaleString('ko-KR')}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="flex shrink-0 gap-3 border-t border-stone-200/50 px-8 py-5 bg-white/50 backdrop-blur-md">
          <button onClick={onClose} className="flex-1 rounded-2xl bg-white border border-stone-200 py-3.5 text-sm font-black text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors shadow-sm">닫기</button>
        </div>
      </div>
    </div>
  );
}

function InfoTile({ icon, label, value, highlight }: { icon: React.ReactNode; label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-2xl border border-white bg-white/70 backdrop-blur-sm p-4 shadow-sm">
      <div className="mb-1.5 flex items-center gap-1.5 text-stone-400">
        {icon}<span className="text-[11px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <p className={`text-[13px] font-black ${highlight ? 'text-rose-500' : 'text-stone-800'}`}>{value}</p>
    </div>
  );
}
