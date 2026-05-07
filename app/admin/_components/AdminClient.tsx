'use client';

import { useState, useCallback, useEffect } from 'react';
import { LogOut, FlaskConical, Sparkles, BarChart2, Settings, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import DemoModeBanner from './DemoModeBanner';
import StatsSection from './StatsSection';
import LeadsList from './LeadsList';
import LeadDetailModal from './LeadDetailModal';
import DashboardAnalytics from './DashboardAnalytics';
import ActivityFeed from './ActivityFeed';
import { getDemoStats } from '@/lib/demo-seed';
import type { Lead, LeadFilters, LeadStatus, StatsData } from '@/types/crm';

const DEFAULT_FILTERS: LeadFilters = {
  status: 'all',
  category: 'all',
  search: '',
};

export default function AdminClient() {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [filters, setFilters] = useState<LeadFilters>(DEFAULT_FILTERS);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [stats, setStats] = useState<StatsData | null>(null);

  // 통계 데이터 로드 (시각화 분석용)
  useEffect(() => {
    async function loadStats() {
      if (isDemoMode) {
        setStats(getDemoStats());
      } else {
        try {
          const res = await fetch('/api/admin/stats');
          const json = await res.json();
          if (json.success) setStats(json.data);
        } catch (err) {
          console.error('Failed to load stats:', err);
        }
      }
    }
    loadStats();
  }, [isDemoMode, refreshKey]);

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

  const [adminInfo, setAdminInfo] = useState<{ email: string; name: string; company_id: string } | null>(null);

  // 관리자 정보 로드
  useEffect(() => {
    async function fetchAdminInfo() {
      try {
        const res = await fetch('/api/admin/auth');
        if (!res.ok) throw new Error('Auth failed');
        const json = await res.json();
        if (json.success) setAdminInfo(json.admin);
      } catch (err) {
        console.error('Admin info fetch error:', err);
      }
    }
    fetchAdminInfo();
  }, []);

  async function handleLogout() {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    window.location.href = '/admin/login';
  }

  const isMaster = adminInfo?.company_id === 'main' || adminInfo?.email === 'ohayul.me@gmail.com';

  return (
    <div className="min-h-screen bg-[#FDFCFB] font-sans pb-20">
      {/* Demo 배너 */}
      {isDemoMode && <DemoModeBanner onDisable={() => setIsDemoMode(false)} />}

      {/* 헤더 */}
      <header className="sticky top-0 z-30 border-b border-black/[0.06] bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-3.5">
          {/* 로고 및 권한 식별 */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-rose-400 shadow-lg shadow-rose-100">
                <BarChart2 size={20} className="text-white" />
              </div>
              <div className="flex flex-col">
                <p className="text-lg font-bold tracking-tight text-stone-800 leading-none">WeddingCare</p>
                <p className="mt-1 text-[10px] font-bold text-rose-300 tracking-[0.2em] uppercase">관리 센터</p>
              </div>
            </div>

            {adminInfo && (
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black tracking-tight border shadow-sm transition-all ${isMaster ? 'bg-rose-500 text-white border-rose-400 shadow-rose-100' : 'bg-white text-stone-400 border-stone-100'}`}>
                <ShieldCheck size={13} className={isMaster ? 'text-rose-100' : 'text-stone-200'} />
                {isMaster ? '본사 마스터' : '협력업체'}
              </div>
            )}
          </div>

          {/* 액션 */}
          <div className="flex items-center gap-2">
            {isMaster && (
              <button
                onClick={() => setIsDemoMode((v) => !v)}
                className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200 ${isDemoMode
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-100 hover:bg-black'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
              >
                {isDemoMode ? <Sparkles size={14} /> : <FlaskConical size={14} />}
                {isDemoMode ? '데모 활성' : '데모 체험'}
              </button>
            )}

            <Link
              href="/admin/settings"
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
            >
              <Settings size={13} />
              설정
            </Link>

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
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {isDemoMode ? '데모 대시보드' : (adminInfo?.name ? `${adminInfo.name}님, 반갑습니다` : '관리자 대시보드')}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {isDemoMode
                ? '샘플 데이터로 분석 시스템을 미리 체험할 수 있습니다.'
                : (isMaster ? '실시간 상담 현황과 비즈니스 지표를 분석합니다.' : '소중한 상담 신청 내역을 실시간으로 확인하세요.')}
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">시스템 상태</p>
            <p className="text-sm font-bold text-emerald-500 flex items-center justify-end gap-1.5 mt-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              정상 작동 중
            </p>
          </div>
        </div>

        {/* KPI 섹션 */}
        <StatsSection isDemoMode={isDemoMode} refreshKey={refreshKey} />

        {/* 분석 및 활동 피드 섹션 (4번 작업 핵심) */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
          <div className="xl:col-span-3">
            {stats && <DashboardAnalytics stats={stats} />}
          </div>
          <div className="xl:col-span-1">
            <ActivityFeed isDemoMode={isDemoMode} />
          </div>
        </div>

        {/* 구분선 */}
        <div className="flex items-center gap-4 pt-4">
          <p className="shrink-0 text-sm font-bold text-slate-800 uppercase tracking-widest">상담 리스트</p>
          <div className="h-px flex-1 bg-slate-100" />
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
