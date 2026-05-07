'use client';

import { useState } from 'react';
import { Shield, LogOut, Check, AlertCircle } from './Icons';

interface SecuritySettingsProps {
  onLogoutAll: () => void;
}

type AlertState = { type: 'success' | 'error'; message: string } | null;

export default function SecuritySettings({ onLogoutAll }: SecuritySettingsProps) {
  const [current, setCurrent]     = useState('');
  const [next, setNext]           = useState('');
  const [confirm, setConfirm]     = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert]         = useState<AlertState>(null);

  async function handlePasswordChange() {
    setAlert(null);

    if (!current || !next || !confirm) {
      setAlert({ type: 'error', message: '모든 필드를 입력해 주세요.' });
      return;
    }
    if (next !== confirm) {
      setAlert({ type: 'error', message: '새 비밀번호가 일치하지 않습니다.' });
      return;
    }
    if (next.length < 8) {
      setAlert({ type: 'error', message: '새 비밀번호는 8자 이상이어야 합니다.' });
      return;
    }

    setIsLoading(true);
    const res  = await fetch('/api/admin/settings/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword: current, newPassword: next }),
    });
    const json = await res.json();
    setIsLoading(false);

    if (json.success) {
      setAlert({ type: 'success', message: json.message });
      setCurrent(''); setNext(''); setConfirm('');
      if (json.requireRelogin) setTimeout(() => { window.location.href = '/admin/login'; }, 2500);
    } else {
      setAlert({ type: 'error', message: json.error });
    }
  }

  return (
    <div className="space-y-4">
      {/* 비밀번호 변경 */}
      <div className="rounded-2xl border border-black/[0.06] bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-50">
            <Shield size={14} className="text-indigo-600" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">비밀번호 변경</h3>
        </div>

        <div className="space-y-3">
          <PasswordInput label="현재 비밀번호" value={current} onChange={setCurrent} placeholder="현재 비밀번호" />
          <PasswordInput label="새 비밀번호"   value={next}    onChange={setNext}    placeholder="8자 이상" />
          <PasswordInput label="비밀번호 확인" value={confirm} onChange={setConfirm} placeholder="새 비밀번호 재입력" />
        </div>

        {alert && (
          <div className={`mt-3 flex items-start gap-2 rounded-xl px-3 py-2.5 text-xs ${
            alert.type === 'success'
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-red-50 text-red-600'
          }`}>
            {alert.type === 'success'
              ? <Check size={13} className="mt-0.5 shrink-0" />
              : <AlertCircle size={13} className="mt-0.5 shrink-0" />
            }
            <span>{alert.message}</span>
          </div>
        )}

        <button
          onClick={handlePasswordChange}
          disabled={isLoading}
          className="mt-4 w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
        >
          {isLoading ? '처리 중...' : '비밀번호 변경'}
        </button>

        <p className="mt-2 text-center text-xs text-slate-400">
          변경 확인 후 .env의 ADMIN_PASSWORD를 직접 수정하고 재배포하세요.
        </p>
      </div>

      {/* 세션 관리 */}
      <div className="rounded-2xl border border-red-100 bg-red-50 p-5">
        <div className="mb-3 flex items-center gap-2">
          <LogOut size={14} className="text-red-500" />
          <h3 className="text-sm font-semibold text-red-700">전체 세션 종료</h3>
        </div>
        <p className="mb-4 text-xs text-red-600">
          모든 기기에서 관리자 세션을 종료합니다. 즉시 로그인 화면으로 이동합니다.
        </p>
        <button
          onClick={onLogoutAll}
          className="w-full rounded-xl border border-red-200 bg-white py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
        >
          전체 로그아웃
        </button>
      </div>
    </div>
  );
}

function PasswordInput({
  label, value, onChange, placeholder,
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-600">{label}</label>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-black/[0.08] bg-slate-50 px-3 py-2.5 text-sm text-slate-800
                   outline-none placeholder:text-slate-300 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
      />
    </div>
  );
}
