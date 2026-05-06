'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) return;

    setIsLoading(true);
    setError('');

    const res = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    const json = await res.json();
    setIsLoading(false);

    if (json.success) {
      router.push('/admin');
      router.refresh();
    } else {
      setError(json.error ?? '로그인에 실패했습니다.');
      setPassword('');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-sm">
        {/* 로고 */}
        <div className="mb-8 text-center">
          <p className="font-display text-3xl font-semibold italic text-stone-800">
            WeddingCare
          </p>
          <p className="mt-1 text-sm text-stone-400">관리자 로그인</p>
        </div>

        {/* 폼 */}
        <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-stone-100">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-stone-700">
                비밀번호
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="관리자 비밀번호"
                autoFocus
                className={`w-full rounded-xl border px-4 py-3 text-sm text-stone-800 outline-none transition-colors placeholder:text-stone-300
                  focus:border-rose-300 focus:ring-2 focus:ring-rose-100
                  ${error ? 'border-rose-400 bg-rose-50' : 'border-stone-200 bg-white'}`}
              />
              {error && (
                <p className="mt-1.5 flex items-center gap-1 text-xs text-rose-500">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || !password.trim()}
              className="w-full rounded-xl bg-rose-500 py-3.5 text-sm font-semibold text-white transition-all hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? '확인 중...' : '로그인'}
            </button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-stone-300">
          환경변수 ADMIN_PASSWORD로 설정된 비밀번호를 입력하세요.
        </p>
      </div>
    </div>
  );
}
