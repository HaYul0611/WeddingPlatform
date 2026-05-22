import { Suspense } from 'react';
import type { Metadata } from 'next';
import BuilderPageClient from './BuilderPageClient';

export const metadata: Metadata = {
  title: '모바일 청첩장 만들기 — WeddingCare',
  description: '드래그 앤 드롭으로 3분 만에 완성하는 모바일 청첩장',
};

export default function CreateInvitationPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-sm text-stone-400">로딩 중...</div>}>
      <BuilderPageClient />
    </Suspense>
  );
}
