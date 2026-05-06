'use client';

import { useState, useEffect, useCallback } from 'react';
import LeadDetailModal, { Lead, LeadStatus, StatusBadge } from './LeadDetailModal';

// ─────────────────────────────────────────
// 상수
// ─────────────────────────────────────────
const CATEGORY_LABEL: Record<string, string> = {
  all:        '전체',
  wedding:    '웨딩',
  beauty:     '뷰티',
  healthcare: '건강관리',
  medical:    '의료',
};

const CATEGORY_EMOJI: Record<string, string> = {
  wedding: '💍', beauty: '✨', healthcare: '💪', medical: '🏥',
};

const STATUS_FILTER_OPTIONS = [
  { value: 'all',       label: '전체 상태' },
  { value: 'new',       label: '신규' },
  { value: 'contacted', label: '연락함' },
  { value: 'completed', label: '완료' },
];

const CATEGORY_FILTER_OPTIONS = [
  { value: 'all',        label: '전체 분야' },
  { value: 'wedding',    label: '💍 웨딩' },
  { value: 'beauty',     label: '✨ 뷰티' },
  { value: 'healthcare', label: '💪 건강관리' },
  { value: 'medical',    label: '🏥 의료' },
];

const PAGE_SIZE = 20;

// ─────────────────────────────────────────
// 타입
// ─────────────────────────────────────────
interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

// ─────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────
export default function AdminClient() {
  const [leads, setLeads]           = useState<Lead[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState<string | null>(null);

  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus]     = useState('all');
  const [currentPage, setCurrentPage]       = useState(1);

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // ── 데이터 조회 ──────────────────────────
  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams({
      page:     String(currentPage),
      pageSize: String(PAGE_SIZE),
      category: filterCategory,
      status:   filterStatus,
    });

    try {
      const res = await fetch(`/api/admin/leads?${params}`);
      if (res.status === 401) {
        window.location.href = '/admin/login';
        return;
      }
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setLeads(json.data ?? []);
      setPagination(json.pagination);
    } catch (e) {
      setError(e instanceof Error ? e.message : '데이터를 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, filterCategory, filterStatus]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  // 필터 변경 시 1페이지로 리셋
  function handleFilterChange(type: 'category' | 'status', value: string) {
    setCurrentPage(1);
    if (type === 'category') setFilterCategory(value);
    else setFilterStatus(value);
  }

  // ── 상태 변경 ──────────────────────────
  async function handleStatusChange(id: string, status: LeadStatus) {
    const res = await fetch(`/api/admin/leads/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) return;

    // 낙관적 업데이트
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    if (selectedLead?.id === id) setSelectedLead((prev) => prev && { ...prev, status });
  }

  // ── 로그아웃 ───────────────────────────
  async function handleLogout() {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    window.location.href = '/admin/login';
  }

  // ─────────────────────────────────────────
  // 렌더링
  // ─────────────────────────────────────────
  return (
    <div className="min-h-screen bg-stone-50">
      {/* 헤더 */}
      <header className="sticky top-0 z-20 border-b border-stone-200 bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <p className="font-display text-lg font-semibold italic text-stone-800">WeddingCare</p>
            <p className="text-xs text-stone-400">관리자 대시보드</p>
          </div>
          <div className="flex items-center gap-3">
            {pagination && (
              <span className="hidden text-xs text-stone-400 sm:block">
                총 {pagination.total.toLocaleString()}건
              </span>
            )}
            <button
              onClick={handleLogout}
              className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-500 hover:bg-stone-50 transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        {/* 필터 */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <select
            value={filterCategory}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
          >
            {CATEGORY_FILTER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-700 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
          >
            {STATUS_FILTER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {(filterCategory !== 'all' || filterStatus !== 'all') && (
            <button
              onClick={() => { setFilterCategory('all'); setFilterStatus('all'); setCurrentPage(1); }}
              className="rounded-xl bg-stone-100 px-3 py-2 text-xs font-medium text-stone-500 hover:bg-stone-200 transition-colors"
            >
              필터 초기화 ×
            </button>
          )}

          <button
            onClick={fetchLeads}
            className="ml-auto rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-medium text-stone-500 hover:bg-stone-50 transition-colors"
          >
            새로고침
          </button>
        </div>

        {/* 테이블 영역 */}
        <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          {isLoading ? (
            <LoadingRows />
          ) : error ? (
            <ErrorState message={error} onRetry={fetchLeads} />
          ) : leads.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* 데스크톱 테이블 */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-stone-100 bg-stone-50/80">
                      {['이름', '연락처', '분야', '예산', '메시지', '접수일', '상태'].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-stone-400">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {leads.map((lead) => (
                      <tr
                        key={lead.id}
                        onClick={() => setSelectedLead(lead)}
                        className="cursor-pointer transition-colors hover:bg-rose-50/40"
                      >
                        <td className="px-4 py-3.5 text-sm font-semibold text-stone-800">
                          {lead.name}
                        </td>
                        <td className="px-4 py-3.5 text-sm font-medium text-rose-600">
                          {lead.phone}
                        </td>
                        <td className="px-4 py-3.5 text-sm text-stone-600">
                          <span className="inline-flex items-center gap-1">
                            <span>{CATEGORY_EMOJI[lead.category]}</span>
                            <span>{CATEGORY_LABEL[lead.category] ?? lead.category}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-stone-500">
                          {formatBudget(lead.budget)}
                        </td>
                        <td className="max-w-[200px] px-4 py-3.5 text-sm text-stone-400">
                          <span className="block truncate">
                            {lead.message?.trim() || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-stone-400">
                          {formatDate(lead.created_at)}
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusBadge status={lead.status ?? 'new'} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 모바일 카드 */}
              <div className="divide-y divide-stone-100 md:hidden">
                {leads.map((lead) => (
                  <div
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className="cursor-pointer px-4 py-4 transition-colors hover:bg-rose-50/30"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-stone-800">{lead.name}</span>
                        <span className="text-xs text-stone-400">
                          {CATEGORY_EMOJI[lead.category]} {CATEGORY_LABEL[lead.category]}
                        </span>
                      </div>
                      <StatusBadge status={lead.status ?? 'new'} />
                    </div>
                    <p className="text-sm font-medium text-rose-600">{lead.phone}</p>
                    {lead.message?.trim() && (
                      <p className="mt-1 truncate text-xs text-stone-400">{lead.message}</p>
                    )}
                    <p className="mt-1 text-xs text-stone-300">{formatDate(lead.created_at)}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* 페이지네이션 */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-stone-400">
              {((currentPage - 1) * PAGE_SIZE) + 1} –{' '}
              {Math.min(currentPage * PAGE_SIZE, pagination.total)} / {pagination.total}건
            </p>
            <div className="flex items-center gap-1">
              <PageButton
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                ←
              </PageButton>

              {getPageNumbers(currentPage, pagination.totalPages).map((n, i) =>
                n === '...' ? (
                  <span key={`ellipsis-${i}`} className="px-2 text-stone-300">…</span>
                ) : (
                  <PageButton
                    key={n}
                    onClick={() => setCurrentPage(Number(n))}
                    active={currentPage === Number(n)}
                  >
                    {n}
                  </PageButton>
                ),
              )}

              <PageButton
                onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={currentPage === pagination.totalPages}
              >
                →
              </PageButton>
            </div>
          </div>
        )}
      </main>

      {/* 상세 모달 */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────
// 유틸
// ─────────────────────────────────────────
function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

function formatBudget(budget: string): string {
  const map: Record<string, string> = {
    undecided: '미정', under_500: '50만 미만',
    '500_1000': '50~100만', '1000_3000': '100~300만', over_3000: '300만+',
  };
  return map[budget] ?? budget;
}

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '...')[] = [1];
  if (current > 3)  pages.push('...');
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}

// ─────────────────────────────────────────
// 서브 컴포넌트
// ─────────────────────────────────────────
function PageButton({
  children, onClick, disabled, active,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`min-w-[32px] rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
        active    ? 'bg-rose-500 text-white' :
        disabled  ? 'cursor-not-allowed text-stone-300' :
        'text-stone-500 hover:bg-stone-100'
      }`}
    >
      {children}
    </button>
  );
}

function LoadingRows() {
  return (
    <div className="divide-y divide-stone-50">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-4">
          <div className="h-3 w-16 animate-pulse rounded-full bg-stone-100" />
          <div className="h-3 w-24 animate-pulse rounded-full bg-stone-100" />
          <div className="h-3 w-14 animate-pulse rounded-full bg-stone-100" />
          <div className="ml-auto h-5 w-12 animate-pulse rounded-full bg-stone-100" />
        </div>
      ))}
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="py-16 text-center">
      <p className="mb-1 text-sm font-semibold text-stone-600">데이터를 불러올 수 없습니다</p>
      <p className="mb-4 text-xs text-stone-400">{message}</p>
      <button onClick={onRetry} className="rounded-xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-600">
        다시 시도
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="py-20 text-center">
      <p className="text-4xl">📋</p>
      <p className="mt-3 text-sm font-semibold text-stone-600">상담 신청이 없습니다</p>
      <p className="mt-1 text-xs text-stone-400">조건을 변경하거나 새로고침해 보세요.</p>
    </div>
  );
}
