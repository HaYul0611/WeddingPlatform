'use client';

import { useState, useEffect } from 'react';
import { Clock } from './Icons';
import type { ActivityLog, LeadStatus } from '@/types/crm';

interface ActivityLogProps {
  leadId: string;
  isDemoMode: boolean;
  currentStatus: LeadStatus;
}

const STATUS_LABEL: Record<string, string> = {
  new: '신규', qualified: '적합', matched: '매칭됨',
  contacted: '연락 완료', completed: '상담 완료', lost: '이탈',
};

const DEMO_ACTIVITIES: ActivityLog[] = [
  { id: 'a1', lead_id: '', action: 'status_change', from_status: 'new', to_status: 'qualified', created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 'a2', lead_id: '', action: 'status_change', from_status: undefined, to_status: 'new', created_at: new Date(Date.now() - 86400000).toISOString() },
];

function timeAgo(iso: string): string {
  const diff  = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 60) return `${mins}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  return `${days}일 전`;
}

export default function ActivityLogPanel({ leadId, isDemoMode, currentStatus }: ActivityLogProps) {
  const [logs, setLogs]           = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      if (isDemoMode) {
        await new Promise((r) => setTimeout(r, 300));
        setLogs(DEMO_ACTIVITIES.map((a) => ({ ...a, lead_id: leadId })));
      } else {
        try {
          const res  = await fetch(`/api/admin/leads/${leadId}/activity`);
          const json = await res.json();
          setLogs(json.success ? json.data : []);
        } catch { setLogs([]); }
      }
      setIsLoading(false);
    }
    load();
  }, [leadId, isDemoMode]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="flex gap-3">
            <div className="h-7 w-7 shrink-0 animate-pulse rounded-full bg-slate-100" />
            <div className="flex-1 space-y-1.5 pt-0.5">
              <div className="h-3 w-40 animate-pulse rounded-lg bg-slate-100" />
              <div className="h-3 w-24 animate-pulse rounded-lg bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="py-8 text-center">
        <Clock size={20} className="mx-auto mb-2 text-slate-300" />
        <p className="text-xs text-slate-400">기록된 활동이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-1">
      {/* 타임라인 선 */}
      <div className="absolute left-3 top-3 bottom-3 w-px bg-slate-100" />

      {logs.map((log) => (
        <div key={log.id} className="relative flex items-start gap-3 pl-0">
          {/* 도트 */}
          <div className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white ring-2 ring-slate-200">
            <div className={`h-2 w-2 rounded-full ${
              log.to_status === 'completed' ? 'bg-emerald-400' :
              log.to_status === 'lost'      ? 'bg-red-400'     :
              log.to_status === 'contacted' ? 'bg-amber-400'   : 'bg-indigo-400'
            }`} />
          </div>

          <div className="flex-1 pb-3">
            <p className="text-xs font-medium text-slate-700">
              {log.action === 'status_change' ? (
                <>
                  {log.from_status
                    ? <><span className="text-slate-400">{STATUS_LABEL[log.from_status]}</span> → <span className="font-semibold">{STATUS_LABEL[log.to_status ?? '']}</span></>
                    : <>상태 설정: <span className="font-semibold">{STATUS_LABEL[log.to_status ?? '']}</span></>
                  }
                </>
              ) : log.action === 'matched' ? (
                '업체 매칭됨'
              ) : (
                log.note ?? '메모 추가됨'
              )}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">{timeAgo(log.created_at)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
