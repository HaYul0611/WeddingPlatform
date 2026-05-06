'use client';

import { WeddingPackage } from '@/types/wedding';

const STYLE_LABEL: Record<WeddingPackage['style'], string> = {
  modern: '모던', classic: '클래식', garden: '가든', minimal: '미니멀',
};

const REGION_LABEL: Record<WeddingPackage['region'], string> = {
  seoul: '서울', gyeonggi: '경기', busan: '부산', daegu: '대구', other: '기타',
};

interface WeddingCardProps {
  pkg: WeddingPackage;
  onCTAClick: () => void;
}

export default function WeddingCard({ pkg, onCTAClick }: WeddingCardProps) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-100">
      {/* 태그 행 */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        <Tag>{REGION_LABEL[pkg.region]}</Tag>
        <Tag>{STYLE_LABEL[pkg.style]}</Tag>
        {pkg.tags.map((tag) => <Tag key={tag}>{tag}</Tag>)}
      </div>

      {/* 업체명 / 패키지명 */}
      <p className="mb-0.5 text-xs text-stone-400">{pkg.vendor}</p>
      <h3 className="mb-2 text-base font-semibold text-stone-800">{pkg.name}</h3>

      {/* 가격 */}
      <p className="mb-3 text-sm font-bold text-rose-500">
        {pkg.priceMin.toLocaleString()}만 ~ {pkg.priceMax.toLocaleString()}만원
      </p>

      {/* 포함 항목 */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {pkg.includes.map((item) => (
          <span key={item} className="rounded-lg bg-stone-50 px-2.5 py-1 text-xs text-stone-500">
            {item}
          </span>
        ))}
      </div>

      <p className="mb-4 text-xs leading-relaxed text-stone-400">{pkg.description}</p>

      <button
        onClick={onCTAClick}
        className="w-full rounded-xl border border-rose-300 py-2.5 text-sm font-semibold text-rose-500 transition-all hover:bg-rose-50"
      >
        상담 신청하기
      </button>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs text-stone-500">
      {children}
    </span>
  );
}
