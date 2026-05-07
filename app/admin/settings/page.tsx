'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ArrowLeft, ShieldCheck, AlertCircle, Save, Heart, CheckCircle2, Eye, EyeOff, Users, Mail, UserPlus, Trash2, KeyRound, ShieldAlert, Edit2, X, Shield } from 'lucide-react';
import Link from 'next/link';

type AdminAccount = {
  id: string;
  email: string;
  name: string;
  company_id: string;
  status: 'active' | 'inactive';
  created_at: string;
};

type Company = {
  id: string;
  name: string;
  created_at: string;
};

export default function AdminSettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'security' | 'accounts' | 'companies'>('security');

  // 내 보안 설정 상태
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [strength, setStrength] = useState({ score: 0, label: '대기', color: 'bg-stone-100' });

  // 계정 및 업체 관리 상태
  const [is2FAVerified, setIs2FAVerified] = useState(false);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [myInfo, setMyInfo] = useState<{ email: string; name: string; company_id: string } | null>(null);
  const [adminList, setAdminList] = useState<AdminAccount[]>([]);
  const [companyList, setCompanyList] = useState<Company[]>([]);
  const [newAdmin, setNewAdmin] = useState({ email: '', password: '', name: '', targetCompanyId: 'main' });
  const [newCompanyName, setNewCompanyName] = useState('');
  const [editingAdmin, setEditingAdmin] = useState<AdminAccount | null>(null);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [pendingTab, setPendingTab] = useState<string | null>(null);

  // 타이머 관련 상태
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchCompanies = async () => {
    try {
      const res = await fetch('/api/admin/companies');
      const json = await res.json();
      if (json.success) setCompanyList(json.data);
    } catch (err) {
      console.error('Failed to fetch companies');
    }
  };

  const createCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;
    setIsLoading(true);
    const res = await fetch('/api/admin/companies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCompanyName })
    });
    const json = await res.json();
    setIsLoading(false);
    if (json.success) {
      setNewCompanyName('');
      fetchCompanies();
    } else {
      alert(json.error);
    }
  };

  const deleteCompany = async (id: string) => {
    if (!confirm('정말로 이 업체를 삭제하시겠습니까? 관련 계정의 권한 유형이 올바르지 않게 될 수 있습니다.')) return;
    const res = await fetch(`/api/admin/companies?id=${id}`, { method: 'DELETE' });
    if ((await res.json()).success) {
      fetchCompanies();
    }
  };

  const updateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany) return;
    setIsLoading(true);
    const res = await fetch('/api/admin/companies', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editingCompany.id, name: editingCompany.name })
    });
    const json = await res.json();
    setIsLoading(false);
    if (json.success) {
      setEditingCompany(null);
      fetchCompanies();
    } else {
      alert(json.error);
    }
  };

  const toggleAdminStatus = async (adminId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const res = await fetch('/api/admin/accounts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: adminId, status: newStatus })
    });
    if ((await res.json()).success) {
      fetchAdminList();
    }
  };

  // 초기 데이터 로드 (내 정보 확인)
  useEffect(() => {
    fetch('/api/admin/auth')
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setMyInfo(json.admin);
        } else {
          // 세션 만료 시 로그인 페이지로 이동
          router.push('/admin/login');
        }
        setIsInitialLoading(false);
      })
      .catch(() => setIsInitialLoading(false));
  }, [router]);

  // 타이머 로직
  useEffect(() => {
    if (timer > 0) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0 && timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timer]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // 비밀번호 강도 체크
  useEffect(() => {
    if (!newPassword) {
      setStrength({ score: 0, label: '대기', color: 'bg-stone-100' });
      return;
    }
    let score = 0;
    if (newPassword.length >= 8) score += 1;
    if (/[A-Z]/.test(newPassword) || /[0-9]/.test(newPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1;

    if (score === 1) setStrength({ score: 1, label: '취약', color: 'bg-rose-400' });
    else if (score === 2) setStrength({ score: 2, label: '미비', color: 'bg-orange-300' });
    else if (score >= 3) setStrength({ score: 3, label: '적합', color: 'bg-emerald-400' });
  }, [newPassword]);

  // 탭 전환 핸들러 (강력한 권한 체크 로직)
  const handleTabChange = async (tab: 'security' | 'accounts' | 'companies') => {
    if (tab === 'accounts' || tab === 'companies') {
      if (isInitialLoading) {
        alert('정보를 불러오는 중입니다. 잠시만 기다려 주세요.');
        return;
      }

      // 이미 인증되었다면 바로 이동
      if (is2FAVerified) {
        setActiveTab(tab);
        if (tab === 'accounts') {
          fetchAdminList();
          fetchCompanies(); // 계정 등록 폼의 드롭다운을 위해 업체 목록도 호출
        }
        if (tab === 'companies') fetchCompanies();
        return;
      }

      // 본사 마스터 계정 여부 엄격 확인
      const isMainAdmin = myInfo?.company_id === 'main' || myInfo?.email === 'ohayul.me@gmail.com';

      if (!isMainAdmin) {
        alert('본사 마스터 계정만 접근 가능한 메뉴입니다.');
        return;
      }

      // 2차 인증 절차 시작
      setPendingTab(tab); // 클릭한 탭을 임시 저장
      setIs2FAModalOpen(true);
      if (timer === 0) {
        sendOTP(true);
      }
      return;
    }
    setActiveTab('security');
  };

  const sendOTP = async (isAuto = false) => {
    if (!isAuto && timer > 0) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/auth/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', email: myInfo?.email })
      });
      const json = await res.json();
      if (json.success) {
        setTimer(180);
      } else {
        alert('발송 실패: ' + json.error);
      }
    } catch {
      alert('발송 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOTP = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/auth/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', code: otpCode })
      });
      const json = await res.json();
      if (json.success) {
        setIs2FAVerified(true);
        setIs2FAModalOpen(false);
        setOtpCode('');

        // 인증 성공 시 대기 중이던 탭으로 즉시 진입 및 데이터 로드
        if (pendingTab) {
          setActiveTab(pendingTab as any);
          if (pendingTab === 'accounts') {
            fetchAdminList();
            fetchCompanies(); // 계정 등록 시 필요한 업체 목록 미리 로드
          }
          if (pendingTab === 'companies') fetchCompanies();
          setPendingTab(null);
        }
      } else {
        alert(json.error);
      }
    } catch {
      alert('인증 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAdminList = async () => {
    const res = await fetch('/api/admin/accounts');
    const json = await res.json();
    if (json.success) setAdminList(json.data);
  };

  const createAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await fetch('/api/admin/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newAdmin)
    });
    const json = await res.json();
    setIsLoading(false);
    if (json.success) {
      alert('계정이 성공적으로 등록되었습니다.');
      setNewAdmin({ email: '', password: '', name: '', targetCompanyId: 'main' });
      fetchAdminList();
    } else {
      alert(json.error);
    }
  };

  const updateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdmin) return;
    setIsLoading(true);
    const res = await fetch('/api/admin/accounts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: editingAdmin.id,
        name: editingAdmin.name,
        email: editingAdmin.email,
        company_id: editingAdmin.company_id
      })
    });
    const json = await res.json();
    setIsLoading(false);
    if (json.success) {
      alert('정보가 성공적으로 수정되었습니다.');
      setEditingAdmin(null);
      fetchAdminList();
    } else {
      alert(json.error);
    }
  };

  const deleteAdmin = async (id: string) => {
    if (!confirm('정말로 이 계정을 삭제하시겠습니까?')) return;
    const res = await fetch(`/api/admin/accounts?id=${id}`, { method: 'DELETE' });
    if ((await res.json()).success) {
      fetchAdminList();
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: '새 비밀번호가 서로 일치하지 않습니다.' });
      return;
    }
    setIsLoading(true);
    const res = await fetch('/api/admin/auth/password', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const json = await res.json();
    setIsLoading(false);
    if (json.success) {
      setMessage({ type: 'success', text: '비밀번호가 변경되었습니다.' });
      setTimeout(() => {
        fetch('/api/admin/auth', { method: 'DELETE' }).then(() => {
          window.location.href = '/admin/login';
        });
      }, 2000);
    } else {
      setMessage({ type: 'error', text: json.error });
    }
  };

  return (
    <div className="min-h-screen bg-[#FCF9F7] selection:bg-rose-100">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[5%] w-[45%] h-[45%] rounded-full bg-gradient-to-br from-rose-100/40 to-orange-50/20 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 py-12 sm:py-16 lg:py-24">

        {/* 상단바: 권한 식별 배지 추가 */}
        <div className="mb-14 flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="group inline-flex items-center gap-2 text-sm font-bold text-rose-300 hover:text-rose-600 transition-colors">
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              대시보드
            </Link>
            <div className="h-4 w-[1px] bg-rose-100" />
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black tracking-wider shadow-sm border transition-all ${(myInfo?.company_id === 'main' || myInfo?.email === 'ohayul.me@gmail.com') ? 'bg-rose-500 text-white border-rose-400 shadow-rose-100' : 'bg-white text-rose-400 border-rose-50'}`}>
              <ShieldCheck size={13} className={(myInfo?.company_id === 'main' || myInfo?.email === 'ohayul.me@gmail.com') ? 'text-rose-100' : 'text-rose-200'} />
              {isInitialLoading ? '권한 확인 중...' : ((myInfo?.company_id === 'main' || myInfo?.email === 'ohayul.me@gmail.com') ? '본사 마스터' : '협력업체')}
            </div>
          </div>

          <div className="flex w-full gap-1 p-1 bg-white/80 backdrop-blur-sm border border-rose-100 rounded-2xl shadow-sm sm:w-auto">
            <button onClick={() => handleTabChange('security')} className={`flex-1 whitespace-nowrap px-8 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'security' ? 'bg-rose-400 text-white shadow-lg shadow-rose-100' : 'text-rose-300 hover:bg-rose-50'}`}>내 보안 설정</button>
            {(myInfo?.company_id === 'main' || myInfo?.email === 'ohayul.me@gmail.com') && (
              <>
                <button onClick={() => handleTabChange('accounts')} disabled={isInitialLoading} className={`flex-1 whitespace-nowrap px-8 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'accounts' ? 'bg-rose-400 text-white shadow-lg shadow-rose-100' : 'text-rose-300 hover:bg-rose-50'} ${isInitialLoading ? 'opacity-50' : ''}`}>전체 계정 관리</button>
                <button onClick={() => handleTabChange('companies')} disabled={isInitialLoading} className={`flex-1 whitespace-nowrap px-8 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === 'companies' ? 'bg-rose-400 text-white shadow-lg shadow-rose-100' : 'text-rose-300 hover:bg-rose-50'} ${isInitialLoading ? 'opacity-50' : ''}`}>업체 명단 관리</button>
              </>
            )}
          </div>
        </div>

        {/* 내 보안 설정 */}
        {activeTab === 'security' && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="mb-12 text-center">
              <Heart size={24} className="text-rose-200 fill-rose-50 mx-auto mb-5" />
              <h2 className="text-3xl font-bold text-stone-800 tracking-tight sm:text-4xl">계정 보안 설정</h2>
              <p className="mt-3 text-sm text-stone-400 leading-relaxed sm:text-base">
                <span className="text-stone-800 font-bold">{myInfo?.name || '관리자'}</span>님의 소중한 정보를 안전하게 보호하세요.
              </p>
            </div>
            <div className="mx-auto max-w-xl rounded-[3rem] border border-white bg-white/70 p-8 shadow-[0_50px_100px_rgba(225,180,180,0.15)] backdrop-blur-xl sm:p-14 sm:rounded-[3.5rem]">
              <form onSubmit={handlePasswordChange} className="space-y-12 text-center">
                <div className="space-y-4">
                  <label className="block text-[11px] font-bold text-rose-400 uppercase tracking-[0.2em] ml-1">현재 비밀번호</label>
                  <div className="relative">
                    <Lock className="absolute left-7 top-1/2 -translate-y-1/2 text-rose-200" size={18} />
                    <input type={showCurrent ? "text" : "password"} required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="현재 비밀번호를 입력하세요" className="w-full rounded-[1.5rem] border border-rose-50 bg-white/50 px-16 py-6 text-base text-stone-700 outline-none focus:border-rose-200 focus:bg-white transition-all shadow-sm text-center" />
                    <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-7 top-1/2 -translate-y-1/2 text-rose-200 hover:text-rose-400">{showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                  </div>
                </div>
                <div className="space-y-12">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-[11px] font-bold text-rose-400 uppercase tracking-[0.2em]">새 비밀번호</label>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md text-white ${strength.color}`}>{strength.label}</span>
                    </div>
                    <div className="relative"><input type={showNew ? "text" : "password"} required minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="8자 이상의 조합" className="w-full rounded-[1.5rem] border border-rose-50 bg-white/50 px-8 py-6 text-base text-stone-700 outline-none focus:border-rose-200 focus:bg-white transition-all shadow-sm text-center" /><button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-8 top-1/2 -translate-y-1/2 text-rose-200 hover:text-rose-400">{showNew ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
                    <div className="flex gap-2 h-1 px-1">{[1, 2, 3].map(i => <div key={i} className={`flex-1 rounded-full transition-all duration-500 ${strength.score >= i ? strength.color : 'bg-stone-50'}`} />)}</div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[11px] font-bold text-rose-400 uppercase tracking-[0.2em] ml-1">비밀번호 확인</label>
                    <div className="relative"><input type={showConfirm ? "text" : "password"} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="다시 한번 입력하세요" className={`w-full rounded-[1.5rem] border bg-white/50 px-8 py-6 text-base text-stone-700 outline-none transition-all shadow-sm text-center ${confirmPassword ? (newPassword === confirmPassword ? 'border-emerald-100' : 'border-rose-100') : 'border-rose-50'}`} /><button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-8 top-1/2 -translate-y-1/2 text-rose-200 hover:text-rose-400">{showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}</button></div>
                  </div>
                </div>
                <button type="submit" disabled={isLoading} className="w-full rounded-[1.5rem] bg-gradient-to-r from-rose-400 to-rose-300 py-6 text-base font-black text-white shadow-2xl shadow-rose-100 transition-all tracking-[0.2em]">설정 저장하기</button>
              </form>
            </div>
          </div>
        )}

        {/* 전체 계정 관리 */}
        {activeTab === 'accounts' && is2FAVerified && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-10">
            <div className="text-center">
              <Users size={24} className="text-rose-200 mx-auto mb-5" />
              <h2 className="text-3xl font-bold text-stone-800 tracking-tight sm:text-4xl">마스터 통합 관리</h2>
              <p className="mt-3 text-sm text-stone-400 sm:text-base leading-relaxed">전체 관리자 계정을 실시간으로 제어합니다.</p>
            </div>

            <div className="rounded-[3.5rem] border border-white bg-white/70 p-10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] backdrop-blur-2xl sm:p-14 text-center max-w-6xl mx-auto w-full">
              <h3 className="mb-12 flex items-center justify-center gap-3 text-xl font-bold text-stone-800 tracking-tight">
                <UserPlus size={24} className="text-rose-400" /> 신규 관리자 등록
              </h3>
              <form onSubmit={createAdmin} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 items-stretch">
                {/* 첫 번째 줄 */}
                <div className="lg:col-span-2">
                  <input type="text" placeholder="업체명" required value={newAdmin.name} onChange={e => setNewAdmin({ ...newAdmin, name: e.target.value })} className="w-full h-full rounded-[1.5rem] border border-rose-50 bg-white px-8 py-6 text-sm outline-none focus:border-rose-200 focus:ring-4 focus:ring-rose-50/50 transition-all text-center font-medium shadow-sm" />
                </div>
                <div className="lg:col-span-4">
                  <input type="email" placeholder="이메일 주소 (company@wedding.care)" required value={newAdmin.email} onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })} className="w-full h-full rounded-[1.5rem] border border-rose-50 bg-white px-8 py-6 text-sm outline-none focus:border-rose-200 focus:ring-4 focus:ring-rose-50/50 transition-all text-center font-medium shadow-sm" />
                </div>

                {/* 두 번째 줄 */}
                <div className="lg:col-span-2">
                  <input type="password" placeholder="비밀번호" required value={newAdmin.password} onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })} className="w-full h-full rounded-[1.5rem] border border-rose-50 bg-white px-8 py-6 text-sm outline-none focus:border-rose-200 focus:ring-4 focus:ring-rose-50/50 transition-all text-center font-medium shadow-sm" />
                </div>
                <div className="lg:col-span-2 relative group">
                  <select value={newAdmin.targetCompanyId} onChange={e => setNewAdmin({ ...newAdmin, targetCompanyId: e.target.value })} className="w-full h-full rounded-[1.5rem] border border-rose-50 bg-white pl-17 pr-14 py-6 text-sm outline-none focus:border-rose-200 focus:ring-4 focus:ring-rose-50/50 transition-all appearance-none cursor-pointer text-center font-bold text-rose-400 shadow-sm" style={{ textAlignLast: 'center' }}>
                    <option value="main" className="text-center font-bold">본사 마스터</option>
                    {companyList.map(c => <option key={c.id} value={c.id} className="text-center">{c.name}</option>)}
                  </select>
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none text-rose-200 group-hover:text-rose-400 transition-colors">
                    <CheckCircle2 size={18} />
                  </div>
                </div>
                <div className="lg:col-span-2">
                  <button type="submit" disabled={isLoading} className="w-full h-full rounded-[1.5rem] bg-stone-900 text-white text-sm font-black py-6 hover:bg-black transition-all shadow-xl shadow-stone-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2">
                    {isLoading ? '등록 중...' : '계정 등록하기'}
                  </button>
                </div>
              </form>
              <p className="mt-8 text-[11px] font-bold text-stone-300 uppercase tracking-[0.2em]">모든 필드는 필수 입력 항목입니다</p>
            </div>

            <div className="overflow-hidden rounded-[2.5rem] border border-white bg-white/70 shadow-2xl backdrop-blur-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[800px]">
                  <thead className="bg-rose-50/40 text-[11px] font-bold uppercase tracking-[0.2em] text-rose-400 border-b border-rose-50/50">
                    <tr>
                      <th className="px-8 py-8 text-center font-black">업체명</th>
                      <th className="px-8 py-8 text-center font-black">이메일 주소</th>
                      <th className="px-8 py-8 text-center font-black">상태 제어</th>
                      <th className="px-8 py-8 text-center font-black">권한 유형</th>
                      <th className="px-8 py-8 text-center font-black">제어</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-50/20">
                    {adminList.map((admin) => (
                      <tr key={admin.id} className="group hover:bg-rose-50/10 transition-colors">
                        <td className="px-8 py-8 font-bold text-stone-800 text-center">{admin.name}</td>
                        <td className="px-8 py-8 text-stone-500 font-medium text-center">{admin.email}</td>
                        <td className="px-8 py-8">
                          <div className="flex justify-center">
                            <span className={`rounded-full px-5 py-1.5 text-[10px] font-black tracking-widest shadow-sm ${admin.company_id === 'main' ? 'bg-stone-900 text-white' : 'bg-rose-100 text-rose-500'}`}>
                              {admin.company_id === 'main' ? '본사' : (companyList.find(c => c.id === admin.company_id)?.name || '업체')}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-8">
                          <div className="flex justify-center gap-3">
                            <button onClick={() => setEditingAdmin(admin)} className="text-stone-300 hover:text-stone-600 transition-colors p-2"><Edit2 size={18} /></button>
                            {admin.email !== myInfo?.email && <button onClick={() => deleteAdmin(admin.id)} className="text-rose-200 hover:text-rose-500 transition-colors p-2"><Trash2 size={18} /></button>}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 업체 명단 관리 */}
        {activeTab === 'companies' && is2FAVerified && (
          <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-10">
            <div className="text-center">
              <ShieldCheck size={24} className="text-rose-200 mx-auto mb-5" />
              <h2 className="text-3xl font-bold text-stone-800 tracking-tight sm:text-4xl">협력업체 명단 관리</h2>
              <p className="mt-3 text-sm text-stone-400 sm:text-base leading-relaxed">관리자 계정 생성 시 선택할 수 있는 협력업체 목록을 관리합니다.</p>
            </div>

            <div className="rounded-[2.5rem] border border-white bg-white/70 p-8 shadow-sm backdrop-blur-xl sm:p-10 text-center">
              <h3 className="mb-10 flex items-center justify-center gap-2 text-lg font-bold text-stone-800"><UserPlus size={22} className="text-rose-400" /> 신규 업체 등록</h3>
              <form onSubmit={createCompany} className="flex flex-col gap-5 sm:flex-row sm:items-center max-w-2xl mx-auto">
                <input type="text" placeholder="등록할 업체명을 입력하세요 (예: 루미너스)" required value={newCompanyName} onChange={e => setNewCompanyName(e.target.value)} className="flex-[3] rounded-2xl border border-rose-50 bg-white px-8 py-5 text-sm outline-none focus:border-rose-200 text-center shadow-inner" />
                <button type="submit" disabled={isLoading} className="flex-[1] rounded-2xl bg-stone-900 text-white text-sm font-bold py-5 hover:bg-black transition-all shadow-lg">업체 추가하기</button>
              </form>
            </div>

            <div className="overflow-hidden rounded-[2.5rem] border border-white bg-white/70 shadow-2xl backdrop-blur-xl max-w-2xl mx-auto">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-rose-50/40 text-[11px] font-bold uppercase tracking-[0.2em] text-rose-400 border-b border-rose-50/50">
                    <tr>
                      <th className="px-8 py-8 text-center font-black">업체명</th>
                      <th className="px-8 py-8 text-center font-black">등록일</th>
                      <th className="px-8 py-8 text-center font-black">제어</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-50/20 text-center">
                    {companyList.map((company) => (
                      <tr key={company.id} className="group hover:bg-rose-50/10 transition-colors">
                        <td className="px-8 py-8 font-bold text-stone-800">{company.name}</td>
                        <td className="px-8 py-8 text-stone-500 font-medium">{new Date(company.created_at).toLocaleDateString()}</td>
                        <td className="px-8 py-8">
                          <div className="flex justify-center gap-3">
                            <button onClick={() => setEditingCompany(company)} className="text-stone-300 hover:text-stone-600 transition-colors p-2"><Edit2 size={18} /></button>
                            <button onClick={() => deleteCompany(company.id)} className="text-rose-200 hover:text-rose-500 transition-colors p-2"><Trash2 size={18} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {companyList.length === 0 && (
                      <tr><td colSpan={3} className="px-8 py-20 text-stone-300 font-bold italic text-center">등록된 업체가 없습니다.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 업체 수정 모달 */}
            {editingCompany && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 text-center">
                <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={() => setEditingCompany(null)} />
                <div className="relative w-full max-w-md rounded-[2.5rem] bg-white p-10 shadow-2xl animate-in fade-in zoom-in duration-300">
                  <div className="flex items-center justify-between mb-10">
                    <h3 className="text-xl font-bold text-stone-800">업체명 수정</h3>
                    <button onClick={() => setEditingCompany(null)} className="text-stone-300 hover:text-stone-800 transition-colors"><X size={24} /></button>
                  </div>
                  <form onSubmit={updateCompany} className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-rose-400 uppercase tracking-widest block text-center">새 업체명</label>
                      <input type="text" required value={editingCompany.name} onChange={e => setEditingCompany({ ...editingCompany, name: e.target.value })} className="w-full rounded-2xl border border-rose-50 bg-stone-50 px-6 py-5 text-base text-stone-700 outline-none focus:bg-white text-center shadow-inner" />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full rounded-2xl bg-stone-900 py-6 text-base font-black text-white hover:bg-black transition-all shadow-xl shadow-stone-100">수정 완료</button>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2차 인증 모달 */}
        {is2FAModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 text-center">
            <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-md" onClick={() => setIs2FAModalOpen(false)} />
            <div className="relative w-full max-w-md rounded-[3rem] bg-white p-10 shadow-2xl animate-in zoom-in duration-300 sm:p-14">
              <div className="mb-10 text-center">
                <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-rose-50 text-rose-400 border border-rose-100 shadow-sm"><ShieldAlert size={36} /></div>
                <h3 className="text-2xl font-black text-stone-800 sm:text-3xl tracking-tight">본인 확인 인증</h3>
                <div className="mt-6 space-y-3">
                  <p className="text-lg font-black text-rose-500 underline underline-offset-4 decoration-rose-200">{myInfo?.email}</p>
                  <p className="text-sm text-stone-400 leading-relaxed font-semibold">인증번호 6자리를 입력해 주세요.</p>
                </div>
              </div>
              <div className="space-y-8">
                <div className="relative">
                  <input type="text" maxLength={6} value={otpCode} onChange={e => setOtpCode(e.target.value)} placeholder="_ _ _ _ _ _" className="w-full rounded-3xl border border-rose-50 bg-stone-50/50 px-6 py-6 text-center text-3xl font-black tracking-[0.4em] text-stone-800 outline-none focus:bg-white focus:border-rose-300 shadow-inner" />
                  {timer > 0 && <span className="absolute right-6 top-1/2 -translate-y-1/2 text-rose-400 font-bold text-sm tabular-nums">{formatTime(timer)}</span>}
                </div>
                <div className="flex flex-col gap-4 items-center">
                  <button onClick={verifyOTP} disabled={otpCode.length !== 6 || isLoading} className="w-full rounded-2xl bg-stone-900 py-5 text-base font-black text-white hover:bg-black disabled:opacity-30 transition-all shadow-lg">인증 확인</button>
                  <button onClick={() => sendOTP(false)} disabled={timer > 0 || isLoading} className={`py-2 text-sm font-bold transition-colors ${timer > 0 ? 'text-stone-300 cursor-not-allowed' : 'text-rose-300 hover:text-rose-500'}`}>
                    {timer > 0 ? `재발송 대기 (${formatTime(timer)})` : '인증번호 재발송'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 계정 수정 모달 */}
        {editingAdmin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-center">
            <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={() => setEditingAdmin(null)} />
            <div className="relative w-full max-w-lg rounded-[2.5rem] bg-white p-10 shadow-2xl animate-in fade-in zoom-in duration-300">
              <div className="flex items-center justify-between mb-10">
                <h3 className="text-xl font-bold text-stone-800">관리자 정보 수정</h3>
                <button onClick={() => setEditingAdmin(null)} className="text-stone-300 hover:text-stone-800 transition-colors"><X size={24} /></button>
              </div>
              <form onSubmit={updateAdmin} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-rose-400 uppercase tracking-widest block text-center">업체명</label>
                  <input type="text" required value={editingAdmin.name} onChange={e => setEditingAdmin({ ...editingAdmin, name: e.target.value })} className="w-full rounded-2xl border border-rose-50 bg-stone-50 px-6 py-5 text-base text-stone-700 outline-none focus:bg-white text-center shadow-inner" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-rose-400 uppercase tracking-widest block text-center">이메일 주소</label>
                  <input type="email" required value={editingAdmin.email} onChange={e => setEditingAdmin({ ...editingAdmin, email: e.target.value })} className="w-full rounded-2xl border border-rose-50 bg-stone-50 px-6 py-5 text-base text-stone-700 outline-none focus:bg-white text-center shadow-inner" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-rose-400 uppercase tracking-widest block text-center">권한 유형</label>
                  <select value={editingAdmin.company_id} onChange={e => setEditingAdmin({ ...editingAdmin, company_id: e.target.value })} className="w-full rounded-2xl border border-rose-50 bg-stone-50 px-6 py-5 text-base font-bold text-rose-400 outline-none focus:bg-white cursor-pointer appearance-none text-center shadow-inner" style={{ textAlignLast: 'center' }}>
                    <option value="main" className="text-center">본사 마스터</option>
                    {companyList.map(c => <option key={c.id} value={c.id} className="text-center">{c.name}</option>)}
                  </select>
                </div>
                <button type="submit" disabled={isLoading} className="w-full rounded-2xl bg-stone-900 py-6 text-base font-black text-white hover:bg-black transition-all shadow-xl shadow-stone-100">수정사항 저장하기</button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
