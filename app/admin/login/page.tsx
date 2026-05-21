'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, HelpCircle, X, Mail, CheckCircle2 } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [isForgotSent, setIsForgotSent] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // 로그인 처리
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();
      if (json.success) {
        router.push('/admin');
        router.refresh();
      } else {
        setError(json.error ?? '로그인 정보가 일치하지 않습니다.');
        setPassword('');
      }
    } catch {
      setError('서버 연결에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  }

  // 계정 찾기 요청 (실제 API 연동)
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/auth/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });

      const json = await res.json();

      if (json.success) {
        setIsForgotSent(true);
        // 5초 후 모달 닫기 및 상태 초기화
        setTimeout(() => {
          setIsForgotModalOpen(false);
          setIsForgotSent(false);
          setForgotEmail('');
        }, 5000);
      } else {
        setAlertMessage(json.error ?? '계정 정보를 찾을 수 없습니다.');
      }
    } catch {
      setAlertMessage('서버와의 통신 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-sm">
        {/* 로고 영역 */}
        <div className="mb-8 text-center">
          <p className="font-display text-3xl font-semibold italic text-stone-800 tracking-tight">
            WeddingCare
          </p>
          <p className="mt-2 text-[11px] font-bold text-stone-400 uppercase tracking-widest">프리미엄 관리자 콘솔</p>
        </div>

        {/* 로그인 폼 카드 */}
        <div className="rounded-[2rem] bg-white p-10 shadow-[0_20px_60px_rgba(0,0,0,0.03)] ring-1 ring-stone-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="mb-2 flex items-center gap-2 text-[11px] font-bold text-stone-500 tracking-wider">
                  <Mail size={12} /> 관리자 아이디 (이메일)
                </label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full rounded-2xl border border-stone-100 bg-stone-50/50 px-4 py-3.5 text-sm text-stone-800 outline-none transition-all focus:border-rose-200 focus:bg-white focus:ring-4 focus:ring-rose-50"
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-[11px] font-bold text-stone-500 tracking-wider">
                  <Lock size={12} /> 비밀번호
                </label>
                <input
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="관리자 비밀번호"
                  className={`w-full rounded-2xl border px-4 py-3.5 text-sm text-stone-800 outline-none transition-all focus:ring-4 focus:ring-rose-50 ${error ? 'border-rose-200 bg-rose-50' : 'border-stone-100 bg-stone-50/50 focus:border-rose-200 focus:bg-white'}`}
                />
                {error && <p className="mt-2 text-[11px] font-bold text-rose-500">{error}</p>}
              </div>
            </div>

            <button
              type="submit" disabled={isLoading || !password.trim() || !email.trim()}
              className="w-full rounded-2xl bg-stone-900 py-4 text-sm font-bold text-white transition-all hover:bg-black active:scale-[0.98] disabled:opacity-30"
            >
              {isLoading ? '인증 중...' : '로그인'}
            </button>

            <div className="flex justify-center">
              <button
                type="button" onClick={() => setIsForgotModalOpen(true)}
                className="flex items-center gap-1.5 text-[11px] font-medium text-stone-400 hover:text-stone-600 transition-colors"
              >
                <HelpCircle size={12} /> 아이디 / 비밀번호 찾기
              </button>
            </div>
          </form>
        </div>

        {/* 하단 정보 */}
        <div className="mt-8 text-center space-y-1">
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">인가된 관리자 전용 시스템</p>
          <p className="text-[9px] font-medium text-stone-300 uppercase tracking-[0.2em]">엔터프라이즈 보안망에 의해 보호됨</p>
        </div>
      </div>

      {/* 계정 찾기 모달 */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={() => setIsForgotModalOpen(false)} />
          <div className="relative w-full max-w-sm rounded-[2rem] bg-white p-8 shadow-2xl animate-in fade-in zoom-in duration-300">
            {!isForgotSent ? (
              <>
                <button onClick={() => setIsForgotModalOpen(false)} className="absolute right-6 top-6 text-stone-300 hover:text-stone-600"><X size={20} /></button>

                <div className="mb-6">
                  <h3 className="text-lg font-bold text-stone-800">계정 정보 찾기</h3>
                  <p className="mt-1 text-xs text-stone-400 leading-relaxed">등록된 관리자 이메일 주소로<br />임시 비밀번호 발송 안내를 도와드립니다.</p>
                </div>

                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" />
                    <input
                      type="email" required value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="관리자 이메일 주소"
                      className="w-full rounded-2xl border border-stone-100 bg-stone-50 px-10 py-3.5 text-sm text-stone-800 outline-none focus:border-rose-200 focus:bg-white focus:ring-4 focus:ring-rose-50"
                    />
                  </div>
                  <button
                    type="submit" disabled={isLoading}
                    className="w-full rounded-2xl bg-rose-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-100 hover:bg-rose-600 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isLoading ? '발송 요청 중...' : '복구 메일 발송'}
                  </button>
                </form>
              </>
            ) : (
              <div className="py-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-lg font-bold text-stone-800">발송 완료</h3>
                <p className="mt-2 text-xs text-stone-500 leading-relaxed">
                  {forgotEmail} 주소로<br />
                  계정 복구 안내 메일이 발송되었습니다.
                </p>
                <p className="mt-6 text-[10px] text-stone-300">잠시 후 모달이 자동으로 닫힙니다.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 커스텀 얼럿 모달 (세번째 이미지 디자인 반영하여 화면 중앙 정렬) */}
      {alertMessage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => setAlertMessage('')} />
          <div className="relative w-full max-w-sm rounded-[1.5rem] bg-[#1a1a1a] p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-[14px] font-medium text-white mb-8 leading-relaxed break-keep">
              {alertMessage}
            </h3>
            <div className="flex justify-end">
              <button 
                onClick={() => setAlertMessage('')}
                className="px-6 py-2.5 rounded-full bg-[#A3C87A] hover:bg-[#92b56d] text-black text-[13px] font-bold transition-all"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
