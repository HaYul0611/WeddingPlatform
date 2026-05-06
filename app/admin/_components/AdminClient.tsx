'use client';

import { useState, useCallback } from 'react';
import { LogOut, FlaskConical, Sparkles, BarChart2 } from './Icons';
import DemoModeBanner from './DemoModeBanner';
import StatsSection from './StatsSection';
import LeadsList from './LeadsList';
import LeadDetailModal from './LeadDetailModal';
import type { Lead, LeadFilters, LeadStatus } from '@/types/crm';

const DEFAULT_FILTERS: LeadFilters = {
  status:   'all',
  category: 'all',
  search:   '',
};

export default function AdminClient() {
  const [isDemoMode, setIsDemoMode]   = useState(false);
  const [filters, setFilters]         = useState<LeadFilters>(DEFAULT_FILTERS);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [refreshKey, setRefreshKey]   = useState(0);

  // 상태 변경 → 모달 낙관적 업데이트 + 목록 갱신
  const handleStatusChange = useCallback(async (id: string, status: LeadStatus) => {
    setSelectedLead((prev) => prev && { ...prev, status });
    if (!isDemoMode) {
      await fetch(`/api/admin/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    }
    setRefreshKey((k) => k + 1);
  }, [isDemoMode]);

  async function handleLogout() {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    window.location.href = '/admin/login';
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Demo 배너 */}
      {isDemoMode && <DemoModeBanner onDisable={() => setIsDemoMode(false)} />}

      {/* 헤더 */}
      <header className="sticky top-0 z-30 border-b border-black/[0.06] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-3.5">
          {/* 로고 */}
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 shadow-sm">
              <BarChart2 size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight text-slate-800">WeddingCare</p>
              <p className="text-[11px] text-slate-400 leading-none">CRM Dashboard</p>
            </div>
          </div>

          {/* 액션 */}
          <div className="flex items-center gap-2">
            {/* Demo 토글 */}
            <button
              onClick={() => setIsDemoMode((v) => !v)}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                isDemoMode
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'border border-slate-200 bg-white text-slate-500 hover:border-indigo-200 hover:text-indigo-600'
              }`}
            >
              {isDemoMode ? <Sparkles size={13} /> : <FlaskConical size={13} />}
              {isDemoMode ? 'Demo 중' : 'Demo 보기'}
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
            >
              <LogOut size={13} />
              로그아웃
            </button>
          </div>
        </div>
      </header>

      {/* 메인 */}
      <main className="mx-auto max-w-[1280px] space-y-8 px-6 py-8">
        {/* 페이지 타이틀 */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {isDemoMode ? '데모 대시보드' : '관리자 대시보드'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isDemoMode
              ? '샘플 데이터로 시스템을 미리 체험할 수 있습니다.'
              : '접수된 상담을 확인하고 업체를 매칭하세요.'}
          </p>
        </div>

        {/* KPI */}
        <StatsSection isDemoMode={isDemoMode} refreshKey={refreshKey} />

        {/* 구분선 */}
        <div className="flex items-center gap-4">
          <p className="shrink-0 text-sm font-semibold text-slate-700">상담 목록</p>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        {/* 리드 목록 */}
        <LeadsList
          isDemoMode={isDemoMode}
          filters={filters}
          onFiltersChange={setFilters}
          onLeadSelect={setSelectedLead}
          refreshKey={refreshKey}
        />
      </main>

      {/* 상세 모달 */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          isDemoMode={isDemoMode}
          onClose={() => setSelectedLead(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
