'use client';

import { useSearchParams } from 'next/navigation';
import InvitationBuilder from '@/components/invite/InvitationBuilder';

export default function BuilderPageClient() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get('template') ?? undefined;

  return <InvitationBuilder templateId={templateId} />;
}
