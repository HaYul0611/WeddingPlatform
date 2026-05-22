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
    <div className="min-h-screen bg-stone-50 font-sans pb-20 selection:bg-rose-100">
      {/* 배경 장식 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-gradient-to-br from-rose-100/30 to-transparent blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-gradient-to-tl from-emerald-50/40 to-transparent blur-[120px]" />
      </div>

      {/* Demo 배너 */}
      <div className="relative z-40">
        {isDemoMode && <DemoModeBanner onDisable={() => setIsDemoMode(false)} />}
      </div>

      {/* 헤더 */}
      <header className="sticky top-0 z-30 border-b border-stone-200/50 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-4">
          {/* 로고 및 권한 식별 */}
          <div className="flex items-center gap-5">
            <Link href="/" className="flex items-center gap-3 group cursor-pointer">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-stone-900 to-stone-700 shadow-lg shadow-stone-200 transition-transform group-hover:scale-105">
                <BarChart2 size={22} className="text-white" />
              </div>
              <div className="flex flex-col">
                <p className="text-xl font-bold tracking-tight text-stone-900 leading-none">WeddingCare</p>
                <p className="mt-1 text-[10px] font-black text-stone-400 tracking-[0.25em] uppercase">Premium Admin</p>
              </div>
            </Link>

            {adminInfo && (
              <div className="hidden sm:block h-6 w-px bg-stone-200 mx-2" />
            )}
            
            {adminInfo && (
              <div className={`hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[11px] font-bold tracking-tight transition-all ${isMaster ? 'bg-stone-900 text-white shadow-md' : 'bg-white text-stone-500 border border-stone-200 shadow-sm'}`}>
                <ShieldCheck size={14} className={isMaster ? 'text-emerald-400' : 'text-stone-400'} />
                {isMaster ? '마스터 권한' : '협력업체'}
              </div>
            )}
          </div>

          {/* 액션 버튼 */}
          <div className="flex items-center gap-3">
            {isMaster && (
              <button
                onClick={() => setIsDemoMode((v) => !v)}
                className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold transition-all duration-300 ${isDemoMode
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-200/50 hover:bg-rose-600 hover:-translate-y-0.5'
                  : 'bg-white border border-stone-200 text-stone-600 shadow-sm hover:border-stone-300 hover:shadow-md hover:-translate-y-0.5'
                  }`}
              >
                {isDemoMode ? <Sparkles size={15} /> : <FlaskConical size={15} />}
                {isDemoMode ? '데모 종료' : '데모 체험'}
              </button>
            )}

            <div className="h-5 w-px bg-stone-200 mx-1 hidden sm:block" />

            <Link
              href="/admin/settings"
              className="flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2.5 text-xs font-bold text-stone-600 shadow-sm transition-all hover:bg-stone-50 hover:border-stone-300 hover:shadow-md hover:-translate-y-0.5"
            >
              <Settings size={15} />
              <span className="hidden sm:inline">설정</span>
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-full border border-stone-200 bg-white px-4 py-2.5 text-xs font-bold text-stone-600 shadow-sm transition-all hover:bg-stone-50 hover:border-stone-300 hover:shadow-md hover:-translate-y-0.5"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">로그아웃</span>
            </button>
          </div>
        </div>
      </header>

      {/* 메인 */}
      <main className="relative z-10 mx-auto max-w-[1280px] space-y-10 px-6 py-10 animate-in fade-in duration-700 slide-in-from-bottom-4">
        {/* 페이지 타이틀 */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">
              {isDemoMode ? '데모 대시보드' : (adminInfo?.name ? `${adminInfo.name}님, 환영합니다` : '관리자 대시보드')}
            </h1>
            <p className="mt-2 text-sm text-stone-500 sm:text-base">
              {isDemoMode
                ? '샘플 데이터를 활용하여 프리미엄 분석 시스템을 체험 중입니다.'
                : (isMaster ? '비즈니스 핵심 지표와 실시간 리드를 한눈에 파악하세요.' : '배정된 고객 리드를 관리하고 성과를 확인하세요.')}
            </p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-[11px] font-bold text-stone-400 tracking-widest">시스템 상태</p>
            <div className="mt-2 flex items-center justify-end gap-2 rounded-full bg-emerald-50 px-3 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-bold text-emerald-600">모든 시스템 정상 작동</span>
            </div>
          </div>
        </div>

        {/* KPI 섹션 */}
        <StatsSection isDemoMode={isDemoMode} refreshKey={refreshKey} />

        {/* 분석 섹션 */}
        <div className="w-full">
          {stats && <DashboardAnalytics stats={stats} />}
        </div>

        {/* 실시간 활동 피드 섹션 */}
        <div className="w-full">
          <ActivityFeed isDemoMode={isDemoMode} />
        </div>

        {/* 구분선 */}
        <div className="flex items-center gap-6 pt-6 pb-2">
          <h2 className="text-xl font-bold text-stone-900 tracking-tight">상담 리스트</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-stone-200 to-transparent" />
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
