'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, RefreshCw, Inbox, ChevronLeft, ChevronRight } from './Icons';
import LeadCard from './LeadCard';
import { LeadsListSkeleton } from './Skeletons';
import { filterDemoLeads, DEMO_LEADS } from '@/lib/demo-seed';
import type { Lead, LeadFilters } from '@/types/crm';

const PAGE_SIZE = 12;

interface LeadsListProps {
  isDemoMode: boolean;
  filters: LeadFilters;
  onFiltersChange: (f: LeadFilters) => void;
  onLeadSelect: (lead: Lead) => void;
  refreshKey: number;
}

interface PageState {
  data: Lead[];
  total: number;
  totalPages: number;
}

// ── 필터 옵션 ──────────────────────────────
const STATUS_OPTS = [
  { value: 'all', label: '전체 상태' },
  { value: 'new', label: '신규' },
  { value: 'contacted', label: '연락함' },
  { value: 'completed', label: '완료' },
];

const CATEGORY_OPTS = [
  { value: 'all', label: '전체 분야' },
  { value: 'wedding', label: '웨딩' },
  { value: 'beauty', label: '뷰티' },
  { value: 'healthcare', label: '건강관리' },
  { value: 'medical', label: '의료' },
];

// ── 컴포넌트 ─────────────────────────────
export default function LeadsList({
  isDemoMode,
  filters,
  onFiltersChange,
  onLeadSelect,
  refreshKey,
}: LeadsListProps) {
  const [page, setPage] = useState(1);
  const [pageState, setPageState] = useState<PageState>({ data: [], total: 0, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // 필터 변경 시 1페이지로 리셋
  useEffect(() => { setPage(1); }, [filters]);

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);

    if (isDemoMode) {
      await new Promise((r) => setTimeout(r, 300));
      const { data, total } = filterDemoLeads(DEMO_LEADS, {
        status: filters.status,
        category: filters.category,
        search: filters.search,
        page,
        pageSize: PAGE_SIZE,
      });
      setPageState({ data, total, totalPages: Math.ceil(total / PAGE_SIZE) });
    } else {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        status: filters.status,
        category: filters.category,
      });
      if (filters.search) params.set('search', filters.search);

      const res = await fetch(`/api/admin/leads?${params}`);
      const json = await res.json();
      if (json.success) {
        setPageState({
          data: json.data,
          total: json.pagination.total,
          totalPages: json.pagination.totalPages,
        });
      }
    }

    setIsLoading(false);
  }, [isDemoMode, filters, page, refreshKey]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const hasActiveFilter =
    filters.status !== 'all' ||
    filters.category !== 'all' ||
    filters.search !== '';

  return (
    <div className="space-y-4">
      {/* 필터 바 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* 검색 */}
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="이름 또는 연락처 검색..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="h-11 w-full rounded-[0.9rem] border border-black/[0.05] bg-white pl-10 pr-4 text-sm text-slate-700
                       placeholder:text-slate-300 outline-none transition-all duration-300
                       focus:border-rose-300 focus:ring-4 focus:ring-rose-50"
          />
        </div>

        {/* 상태 필터 */}
        <div className="flex items-center gap-2">
          <Filter size={14} className="shrink-0 text-slate-400" />
          <select
            value={filters.status}
            onChange={(e) => onFiltersChange({ ...filters, status: e.target.value as LeadFilters['status'] })}
            className="h-11 rounded-[0.9rem] border border-black/[0.05] bg-white px-4 text-sm font-medium text-slate-600
                       outline-none transition-all hover:bg-slate-50 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50"
          >
            {STATUS_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <select
            value={filters.category}
            onChange={(e) => onFiltersChange({ ...filters, category: e.target.value as LeadFilters['category'] })}
            className="h-11 rounded-[0.9rem] border border-black/[0.05] bg-white px-4 text-sm font-medium text-slate-600
                       outline-none transition-all hover:bg-slate-50 focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50"
          >
            {CATEGORY_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* 새로고침 */}
        <button
          onClick={fetchLeads}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.9rem] border border-black/[0.05]
                     bg-white text-slate-400 shadow-sm transition-all hover:bg-slate-50 hover:text-indigo-600 active:scale-95"
          aria-label="새로고침"
        >
          <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* 결과 수 */}
      {!isLoading && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            <span className="font-semibold text-slate-800">{pageState.total}</span>건
            {hasActiveFilter && (
              <>
                {' '}
                <button
                  onClick={() => onFiltersChange({ status: 'all', category: 'all', search: '' })}
                  className="text-indigo-500 underline underline-offset-2 hover:text-indigo-700"
                >
                  필터 초기화
                </button>
              </>
            )}
          </p>
          {pageState.totalPages > 1 && (
            <p className="text-xs text-slate-400">
              {page} / {pageState.totalPages} 페이지
            </p>
          )}
        </div>
      )}

      {/* 리스트 */}
      {isLoading ? (
        <LeadsListSkeleton />
      ) : pageState.data.length === 0 ? (
        <EmptyState hasFilter={hasActiveFilter} onReset={() => onFiltersChange({ status: 'all', category: 'all', search: '' })} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {pageState.data.map((lead) => (
            <LeadCard key={lead.id} lead={lead} onClick={onLeadSelect} />
          ))}
        </div>
      )}

      {/* 페이지네이션 */}
      {pageState.totalPages > 1 && !isLoading && (
        <Pagination
          page={page}
          totalPages={pageState.totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}

// ── 서브 컴포넌트 ─────────────────────────
function EmptyState({ hasFilter, onReset }: { hasFilter: boolean; onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-20">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
        <Inbox size={22} className="text-slate-400" />
      </div>
      <p className="mb-1 text-sm font-semibold text-slate-600">
        {hasFilter ? '조건에 맞는 리드가 없습니다' : '아직 접수된 상담이 없습니다'}
      </p>
      <p className="mb-4 text-xs text-slate-400">
        {hasFilter ? '다른 조건으로 검색해 보세요' : '상담 신청이 들어오면 여기 표시됩니다'}
      </p>
      {hasFilter && (
        <button
          onClick={onReset}
          className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-600 transition-colors"
        >
          필터 초기화
        </button>
      )}
    </div>
  );
}

function Pagination({
  page, totalPages, onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  const pages = getPageNumbers(page, totalPages);

  return (
    <div className="flex items-center justify-center gap-1 pt-2">
      <NavBtn onClick={() => onPageChange(page - 1)} disabled={page === 1} label="이전 페이지">
        <ChevronLeft size={15} />
      </NavBtn>

      {pages.map((p, i) =>
        p === '...'
          ? <span key={`e${i}`} className="px-1 text-slate-300">…</span>
          : (
            <button
              key={p}
              onClick={() => onPageChange(Number(p))}
              className={`min-w-[40px] rounded-2xl px-4 py-2.5 text-sm font-bold transition-all duration-300 ${page === Number(p)
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-200 scale-105'
                  : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                }`}
            >
              {p}
            </button>
          ),
      )}

      <NavBtn onClick={() => onPageChange(page + 1)} disabled={page === totalPages} label="다음 페이지">
        <ChevronRight size={15} />
      </NavBtn>
    </div>
  );
}

function NavBtn({
  children, onClick, disabled, label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition-colors
                 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
    >
      {children}
    </button>
  );
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '...')[] = [1];
  if (current > 3) pages.push('...');
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}
