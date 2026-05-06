'use client';

import { useState, useEffect } from 'react';
import { Phone, MessageCircle, MapPin, Star, Building2, DollarSign } from './Icons';
import { MatchesSkeleton } from './Skeletons';
import { getDemoMatches } from '@/lib/demo-seed';
import type { Company } from '@/types/crm';

interface MatchedCompaniesProps {
  leadId: string;
  category: string;
  budget: string;
  isDemoMode: boolean;
}

const CATEGORY_LABEL: Record<string, string> = {
  wedding: '웨딩', beauty: '뷰티', healthcare: '건강관리', medical: '의료',
};

export default function MatchedCompanies({ leadId, category, budget, isDemoMode }: MatchedCompaniesProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        if (isDemoMode) {
          await new Promise((r) => setTimeout(r, 500));
          setCompanies(getDemoMatches(category, budget));
        } else {
          const res = await fetch(`/api/admin/leads/${leadId}/matches`);
          const json = await res.json();
          if (!json.success) throw new Error(json.error);
          setCompanies(json.data ?? []);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : '불러오기 실패');
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [leadId, category, budget, isDemoMode]);

  if (isLoading) return <MatchesSkeleton />;

  if (error) return (
    <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-center">
      <p className="text-xs text-red-500">{error}</p>
    </div>
  );

  if (companies.length === 0) return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-12">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
        <Building2 size={18} className="text-slate-400" />
      </div>
      <p className="text-sm font-medium text-slate-500">매칭 업체 없음</p>
      <p className="mt-1 text-xs text-slate-400">{CATEGORY_LABEL[category]} 분야의 등록된 업체가 없습니다.</p>
    </div>
  );

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">
        <span className="font-semibold text-slate-700">{companies.length}개</span> 업체가 매칭되었습니다
      </p>
      {companies.map((c) => <CompanyCard key={c.id} company={c} />)}
    </div>
  );
}

function CompanyCard({ company }: { company: Company }) {
  const budgetText =
    company.budget_min != null && company.budget_max != null
      ? `${company.budget_min.toLocaleString()}~${company.budget_max.toLocaleString()}만원`
      : company.budget_min != null ? `${company.budget_min.toLocaleString()}만원~` : null;

  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-slate-800">{company.name}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-400">
            {company.region && (
              <span className="flex items-center gap-0.5"><MapPin size={10} />{company.region}</span>
            )}
            {budgetText && (
              <span className="flex items-center gap-0.5"><DollarSign size={10} />{budgetText}</span>
            )}
          </div>
        </div>
        {company.rating != null && (
          <div className="flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1">
            <Star size={11} className="fill-amber-400 text-amber-400" />
            <span className="text-xs font-semibold text-amber-700">{company.rating.toFixed(1)}</span>
            {company.review_count != null && (
              <span className="text-xs text-amber-600 opacity-70">({company.review_count})</span>
            )}
          </div>
        )}
      </div>
      {company.description && (
        <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-slate-500">{company.description}</p>
      )}
      <div className="flex gap-2">
        {company.phone && (
          <a
            href={`tel:${company.phone}`}
            onClick={(e) => e.stopPropagation()}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
          >
            <Phone size={13} />{company.phone}
          </a>
        )}
        {company.kakao_link && (
          <a
            href={company.kakao_link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#FEE500] py-2.5 text-xs font-semibold text-[#3C1E1E] transition-opacity hover:opacity-90"
          >
            <MessageCircle size={13} />카카오 상담
          </a>
        )}
      </div>
    </div>
  );
}
