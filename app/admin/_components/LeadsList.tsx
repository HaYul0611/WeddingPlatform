'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, RefreshCw, Inbox, ChevronLeft, ChevronRight, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
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
      try {
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
      } catch (err) {
        console.error('Fetch error:', err);
      }
    }
    setIsLoading(false);
  }, [isDemoMode, filters, page, refreshKey]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const handleExcelDownload = () => {
    if (pageState.data.length === 0) return;
    try {
      const exportData = pageState.data.map((lead) => ({
        '이름': lead.name,
        '연락처': lead.phone,
        '상담분야': CATEGORY_OPTS.find(o => o.value === lead.category)?.label || lead.category,
        '현재상태': STATUS_OPTS.find(o => o.value === lead.status)?.label || lead.status,
        '예상예산': lead.budget,
        '메시지': lead.message || '',
        '접수시각': new Date(lead.created_at).toLocaleString('ko-KR'),
        '유입경로': lead.source_page
      }));
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, '상담리스트');
      const dateStr = new Date().toISOString().split('T')[0];
      XLSX.writeFile(workbook, `웨딩케어_상담리스트_${dateStr}.xlsx`);
    } catch (err) {
      console.error('Excel export failed:', err);
      alert('엑셀 파일 생성 중 오류가 발생했습니다.');
    }
  };

  const hasActiveFilter = filters.status !== 'all' || filters.category !== 'all' || filters.search !== '';

  return (
    <div className="space-y-4">
      {/* 필터 및 액션 바 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text" placeholder="이름 또는 연락처 검색..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="h-11 w-full rounded-[0.9rem] border border-black/[0.05] bg-white pl-10 pr-4 text-sm text-slate-700 outline-none transition-all focus:border-rose-300 focus:ring-4 focus:ring-rose-50"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="shrink-0 text-slate-400" />
          <select
            value={filters.status}
            onChange={(e) => onFiltersChange({ ...filters, status: e.target.value as any })}
            className="h-11 rounded-[0.9rem] border border-black/[0.05] bg-white px-4 text-sm font-medium text-slate-600 outline-none"
          >
            {STATUS_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <select
            value={filters.category}
            onChange={(e) => onFiltersChange({ ...filters, category: e.target.value as any })}
            className="h-11 rounded-[0.9rem] border border-black/[0.05] bg-white px-4 text-sm font-medium text-slate-600 outline-none"
          >
            {CATEGORY_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExcelDownload}
            disabled={pageState.data.length === 0}
            className="flex h-11 items-center gap-2 rounded-[0.9rem] border border-emerald-100 bg-emerald-50 px-4 text-sm font-bold text-emerald-600 transition-all hover:bg-emerald-100 active:scale-95 disabled:opacity-30"
          >
            <FileSpreadsheet size={16} />
            <span className="hidden sm:inline">엑셀 다운로드</span>
          </button>
          <button
            onClick={fetchLeads}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[0.9rem] border border-black/[0.05] bg-white text-slate-400 hover:bg-slate-50 hover:text-indigo-600 active:scale-95 transition-all"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* 요약 및 리스트 영역 */}
      {!isLoading && (
        <div className="flex items-center justify-between px-1">
          <p className="text-sm text-slate-500">
            검색 결과 <span className="font-bold text-slate-900">{pageState.total}</span>건
            {hasActiveFilter && <button onClick={() => onFiltersChange({ status: 'all', category: 'all', search: '' })} className="ml-2 text-indigo-500 hover:underline">필터 초기화</button>}
          </p>
          {pageState.totalPages > 1 && <p className="text-xs text-slate-400">{page} / {pageState.totalPages} 페이지</p>}
        </div>
      )}

      {isLoading ? (
        <LeadsListSkeleton />
      ) : pageState.data.length === 0 ? (
        <EmptyState hasFilter={hasActiveFilter} onReset={() => onFiltersChange({ status: 'all', category: 'all', search: '' })} />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {pageState.data.map((lead) => <LeadCard key={lead.id} lead={lead} onClick={onLeadSelect} />)}
        </div>
      )}

      {/* 페이지네이션 */}
      {pageState.totalPages > 1 && !isLoading && (
        <Pagination page={page} totalPages={pageState.totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}

function EmptyState({ hasFilter, onReset }: { hasFilter: boolean; onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-slate-200 py-24 bg-white/50">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><Inbox size={28} /></div>
      <p className="mb-1 text-base font-bold text-slate-700">{hasFilter ? '검색 결과가 없습니다' : '아직 접수된 상담이 없습니다'}</p>
      {hasFilter && <button onClick={onReset} className="mt-6 rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-black transition-all">필터 초기화</button>}
    </div>
  );
}

function Pagination({ page, totalPages, onPageChange }: { page: number; totalPages: number; onPageChange: (p: number) => void }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="flex items-center justify-center gap-1.5 pt-6">
      <button onClick={() => onPageChange(page - 1)} disabled={page === 1} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl disabled:opacity-20"><ChevronLeft size={20} /></button>
      {pages.map(p => (
        <button key={p} onClick={() => onPageChange(p)} className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${page === p ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'}`}>{p}</button>
      ))}
      <button onClick={() => onPageChange(page + 1)} disabled={page === totalPages} className="p-2 text-slate-400 hover:bg-slate-100 rounded-xl disabled:opacity-20"><ChevronRight size={20} /></button>
    </div>
  );
}
