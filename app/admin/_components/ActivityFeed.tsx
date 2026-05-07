'use client';

import { useState, useEffect } from 'react';
import { Activity, Bell, CheckCircle2, MessageSquare, UserPlus } from 'lucide-react';

interface FeedItem {
  id: string;
  type: 'status' | 'message' | 'new_lead';
  user: string;
  action: string;
  time: string;
}

export default function ActivityFeed({ isDemoMode }: { isDemoMode: boolean }) {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadActivities() {
      if (isDemoMode) {
        setItems([
          { id: '1', type: 'new_lead', user: '이보라', action: '신규 웨딩 상담 신청 접수', time: '방금 전' },
          { id: '2', type: 'message', user: '하연수', action: '카카오 알림톡 발송 완료', time: '5분 전' },
          { id: '3', type: 'status', user: '김민준', action: '상담 상태가 연락함으로 변경됨', time: '12분 전' },
          { id: '4', type: 'message', user: '박서준', action: '관리자 메시지가 전달되었습니다', time: '34분 전' },
        ]);
        setIsLoading(false);
      } else {
        try {
          const res = await fetch('/api/admin/activities');
          const json = await res.json();
          if (json.success) {
            setItems(json.data);
          }
        } catch (err) {
          console.error('Failed to load activities:', err);
        } finally {
          setIsLoading(false);
        }
      }
    }
    loadActivities();
  }, [isDemoMode]);

  return (
    <div className="rounded-[2.5rem] border border-black/[0.03] bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
            <Bell size={20} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">최근 활동 피드</h3>
        </div>
        <button className="text-[11px] font-bold text-indigo-500 hover:underline">전체보기</button>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <div className="flex flex-col gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex animate-pulse gap-4">
                <div className="h-10 w-10 rounded-xl bg-slate-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-24 rounded bg-slate-100" />
                  <div className="h-3 w-full rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-xs text-slate-400 font-medium italic">최근 활동 내역이 없습니다.</p>
          </div>
        ) : (
          items.map((item, i) => (
            <div key={item.id} className="group relative flex items-start gap-4">
              {/* 타임라인 라인 */}
              {i < items.length - 1 && (
                <div className="absolute left-[19px] top-10 h-8 w-px bg-slate-100" />
              )}

              <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 ${item.type === 'new_lead' ? 'bg-blue-50 text-blue-500' :
                item.type === 'message' ? 'bg-[#FEE500]/10 text-[#191919]' :
                  'bg-emerald-50 text-emerald-500'
                }`}>
                {item.type === 'new_lead' ? <UserPlus size={16} /> :
                  item.type === 'message' ? <MessageSquare size={16} /> :
                    <CheckCircle2 size={16} />}
              </div>

              <div className="flex flex-col">
                <p className="text-sm font-bold text-slate-800">
                  <span className="text-indigo-600">{item.user}</span> 고객님
                </p>
                <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">{item.action}</p>
                <p className="mt-1 text-[10px] font-medium text-slate-300 uppercase">{item.time}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
