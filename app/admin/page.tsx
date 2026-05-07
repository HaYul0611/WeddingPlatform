import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { isValidSession } from '@/lib/auth';
import AdminClient from './_components/AdminClient';

export const metadata: Metadata = {
  title: '관리자 대시보드 — WeddingCare',
  robots: 'noindex, nofollow',
};

export default async function AdminPage() {
  const cookieStore = cookies();
  const session = cookieStore.get('admin_session')?.value;

  if (!isValidSession(session)) {
    redirect('/admin/login');
  }

  return <AdminClient />;
}
