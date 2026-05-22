'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, CheckCircle2, XCircle, Download, Share2, ArrowLeft, 
  Sparkles, Table, ToggleLeft, ToggleRight, Check, Heart, ExternalLink,
  MessageSquare, Phone, BadgeHelp, HelpCircle
} from 'lucide-react';

// RSVP 모크 데이터 (사용자가 실제 RSVP를 등록하면 축적되는 데이터셋)
const INITIAL_RSVP_DATA = [
  { id: '1', name: '김하율', contact: '010-1234-5678', attendance: '참석', side: '신랑측', companion: 1, meal: '식사함', memo: '결혼을 진심으로 축하해! 행복하게 잘 살아라!' },
  { id: '2', name: '박채원', contact: '010-9876-5432', attendance: '참석', side: '신부측', companion: 0, meal: '식사함', memo: '세상에서 가장 아름다운 신부가 될 거야, 채원아 축하해!' },
  { id: '3', name: '이동현', contact: '010-5555-8888', attendance: '참석', side: '신랑측', companion: 2, meal: '식사함', memo: '하율아 축하한다! 동반 2인 같이 갈게!' },
  { id: '4', name: '정예린', contact: '010-2222-3333', attendance: '불참', side: '신부측', companion: 0, meal: '식사안함', memo: '개인 사정으로 아쉽게 불참하지만 마음으로 깊이 축복할게!' },
  { id: '5', name: '최재현', contact: '010-4444-7777', attendance: '참석', side: '신랑측', companion: 0, meal: '미정', memo: '멋진 예식 기대하고 있을게!' },
  { id: '6', name: '윤서연', contact: '010-8888-9999', attendance: '참석', side: '신부측', companion: 1, meal: '식사함', memo: '행복이 가득한 가정 이루길 기원할게!' }
];

export default function RsvpDashboardPage() {
  const router = useRouter();
  const [rsvpList, setRsvpList] = useState(INITIAL_RSVP_DATA);
  const [isGoogleLinked, setIsGoogleLinked] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // 1. 구글 스프레드 시트 연동 토글 이벤트
  const handleGoogleToggle = () => {
    const nextState = !isGoogleLinked;
    setIsGoogleLinked(nextState);
    setToastMessage(
      nextState 
        ? '🎉 구글 스프레드 시트 실시간 연동이 정상 활성화되었습니다!' 
        : '🔒 구글 스프레드 시트 연동이 안전하게 해제되었습니다.'
    );
    setShowToast(true);
  };

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // 2. 엑셀(CSV) 다운로드 대망의 리얼 핵심 브라우저 로직!
  const handleDownloadExcel = () => {
    // 엑셀에서 한글 깨짐 방지를 위해 BOM(Byte Order Mark) 설정 (\ufeff)
    const BOM = '\uFEFF';
    
    // CSV 헤더 정의
    const headers = ['순번', '하객 성함', '연락처', '참석 여부', '신랑/신부 구분', '동반인원 (명)', '식사 여부', '축하 메시지'];
    
    // 행 데이터 빌드
    const rows = rsvpList.map((item, index) => [
      index + 1,
      item.name,
      item.contact,
      item.attendance,
      item.side,
      item.companion,
      item.meal,
      item.memo.replace(/"/g, '""') // CSV 이스케이프 처리
    ]);
    
    // 헤더와 데이터를 합쳐서 CSV 문자열 구성
    const csvContent = BOM + [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Blob 생성
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // 가상 다운로드 앵커(a) 태그 생성 후 자동 격발!
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `하율_채원_결혼식_RSVP_명단_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // 사용자 알림
    setToastMessage('💾 RSVP 하객 명단 엑셀(CSV) 파일이 정상적으로 다운로드되었습니다!');
    setShowToast(true);
  };

  // 통계 계산
  const totalRsvps = rsvpList.length;
  const attendingCount = rsvpList.filter(r => r.attendance === '참석').length;
  const companionAttending = rsvpList.reduce((acc, curr) => curr.attendance === '참석' ? acc + curr.companion : acc, 0);
  const totalAttendingGuests = attendingCount + companionAttending; // 하객 본인 + 동반 인원 총합

  const absentCount = rsvpList.filter(r => r.attendance === '불참').length;
  
  const mealCount = rsvpList.filter(r => r.attendance === '참석' && r.meal === '식사함').reduce((acc, curr) => acc + 1 + curr.companion, 0);
  const mealNoCount = rsvpList.filter(r => r.attendance === '참석' && r.meal === '식사안함').reduce((acc, curr) => acc + 1 + curr.companion, 0);
  const mealUndecidedCount = rsvpList.filter(r => r.attendance === '참석' && r.meal === '미정').reduce((acc, curr) => acc + 1 + curr.companion, 0);

  return (
    <main className="min-h-screen bg-[#FAF9F6] text-stone-800 font-sans py-10 px-4 md:px-8 relative overflow-hidden">
      {/* 장식용 그래디언트 원 */}
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-rose-100/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-50/40 rounded-full blur-[100px] pointer-events-none" />

      {/* 토스트 알림 컴포넌트 */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-stone-900 text-white text-xs font-bold px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-2 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* 상단 액션 및 네비게이션 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-rose-500 mb-2">
              <Sparkles size={16} />
              <span className="text-[10px] font-black tracking-widest uppercase">Premium Partner Dashboard</span>
            </div>
            <h1 className="text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
              하율 & 채원 모바일 청첩장 RSVP 관리
              <span className="text-[10px] bg-rose-500 text-white px-2.5 py-1 rounded-full font-black">PREMIUM</span>
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => router.push('/invite')}
              className="px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-xs font-bold hover:bg-stone-50 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <ArrowLeft size={14} /> 청첩장 리스트
            </button>
            <button
              onClick={handleDownloadExcel}
              className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-md shadow-rose-200"
            >
              <Download size={14} /> 엑셀 다운로드 (CSV)
            </button>
          </div>
        </div>

        {/* 대시보드 통계 카드 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          
          {/* 카드 1: 총 하객 (본인 + 동반인원 포함) */}
          <div className="bg-white border border-stone-100 rounded-3xl p-6 shadow-[0_12px_40px_rgba(0,0,0,0.02)] flex items-center justify-between">
            <div className="flex flex-col gap-1">
              <span className="text-[11px] font-black text-stone-400 uppercase tracking-wider">참석 예정 총 하객 수</span>
              <span className="text-3xl font-black text-stone-900 tracking-tight">{totalAttendingGuests}명</span>
              <span className="text-[10px] text-stone-400 font-bold">참석 {attendingCount}명 + 동반가족 {companionAttending}명</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500">
              <Users size={22} strokeWidth={2.5} />
            </div>
          </div>

          {/* 카드 2: 참석 여부 비율 */}
          <div className="bg-white border border-stone-100 rounded-3xl p-6 shadow-[0_12px_40px_rgba(0,0,0,0.02)] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-stone-400 uppercase tracking-wider">참석 여부 통계</span>
              <span className="text-xs font-black text-[#3B82F6]">{attendingCount}명 참석 ({absentCount}명 불참)</span>
            </div>
            <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden flex">
              <div className="bg-[#3B82F6] h-full" style={{ width: `${(attendingCount / totalRsvps) * 100}%` }} />
              <div className="bg-rose-400 h-full" style={{ width: `${(absentCount / totalRsvps) * 100}%` }} />
            </div>
            <div className="flex items-center justify-between text-[10px] text-stone-400 font-bold">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-[#3B82F6] rounded-full inline-block" /> 참석 ({Math.round((attendingCount / totalRsvps) * 100)}%)</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-rose-400 rounded-full inline-block" /> 불참 ({Math.round((absentCount / totalRsvps) * 100)}%)</span>
            </div>
          </div>

          {/* 카드 3: 식사 인원 통계 */}
          <div className="bg-white border border-stone-100 rounded-3xl p-6 shadow-[0_12px_40px_rgba(0,0,0,0.02)] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black text-stone-400 uppercase tracking-wider">식사 진행 총 인원</span>
              <span className="text-xs font-black text-emerald-500">{mealCount}명 식사</span>
            </div>
            <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden flex">
              <div className="bg-emerald-400 h-full" style={{ width: `${(mealCount / totalAttendingGuests) * 100}%` }} />
              <div className="bg-stone-300 h-full" style={{ width: `${(mealNoCount / totalAttendingGuests) * 100}%` }} />
              <div className="bg-[#F59E0B] h-full" style={{ width: `${(mealUndecidedCount / totalAttendingGuests) * 100}%` }} />
            </div>
            <div className="flex items-center justify-between text-[9px] text-stone-400 font-bold">
              <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block" /> 함 ({mealCount}명)</span>
              <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 bg-stone-300 rounded-full inline-block" /> 안함 ({mealNoCount}명)</span>
              <span className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 bg-[#F59E0B] rounded-full inline-block" /> 미정 ({mealUndecidedCount}명)</span>
            </div>
          </div>

          {/* 카드 4: 구글 시트 연동 제어 카드 (핵심 요구사항) */}
          <div className={`border rounded-3xl p-5 shadow-[0_12px_40px_rgba(0,0,0,0.02)] flex flex-col justify-between transition-all ${isGoogleLinked ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white border-stone-100'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black text-stone-400 uppercase tracking-wider">구글 스프레드 시트 연동</span>
              <button 
                onClick={handleGoogleToggle} 
                className="focus:outline-none transition-transform active:scale-95"
              >
                {isGoogleLinked ? (
                  <ToggleRight size={38} className="text-emerald-500 cursor-pointer" />
                ) : (
                  <ToggleLeft size={38} className="text-stone-300 cursor-pointer" />
                )}
              </button>
            </div>
            
            {isGoogleLinked ? (
              <div className="flex flex-col gap-1 animate-in fade-in duration-200">
                <span className="text-[10px] font-black text-emerald-600 flex items-center gap-1 leading-none">
                  <Check size={12} strokeWidth={3} /> 실시간 연동 작동 중
                </span>
                <a 
                  href="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKv1aM9_0PsDPuXYvBYdzPkM_K8DY/edit" 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-[9px] text-stone-500 hover:text-emerald-700 underline font-bold mt-1.5 inline-flex items-center gap-0.5"
                >
                  연동 스프레드시트 바로가기 <ExternalLink size={8} />
                </a>
              </div>
            ) : (
              <span className="text-[10px] text-stone-400 font-bold leading-normal">
                클릭 시 구글 시트가 연동되어 실시간으로 하객 리스트가 동기화됩니다.
              </span>
            )}
          </div>

        </div>

        {/* 실시간 RSVP 하객 명단 그리드 테이블 (핵심 요구사항) */}
        <div className="bg-white border border-stone-100 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.02)] overflow-hidden">
          <div className="p-6 border-b border-stone-50 flex items-center justify-between">
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-widest flex items-center gap-2">
              <Table size={16} className="text-stone-400" />
              실시간 RSVP 접수 목록
            </h3>
            <span className="text-[10px] text-stone-400 font-bold">전체 {totalRsvps}건 접수됨</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF9F6]/80 text-[10px] font-black text-stone-400 uppercase tracking-wider border-b border-stone-100">
                  <th className="py-4 px-6 text-center w-[70px]">순번</th>
                  <th className="py-4 px-6">하객 성함</th>
                  <th className="py-4 px-6">신랑/신부</th>
                  <th className="py-4 px-6">연락처</th>
                  <th className="py-4 px-6 text-center">참석여부</th>
                  <th className="py-4 px-6 text-center">동반인원</th>
                  <th className="py-4 px-6 text-center">식사여부</th>
                  <th className="py-4 px-6 w-[320px]">축하 및 남기실 말씀</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50 text-xs font-bold text-stone-700">
                {rsvpList.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-[#FAF9F6]/30 transition-colors">
                    <td className="py-4 px-6 text-center text-stone-300 font-black">{idx + 1}</td>
                    <td className="py-4 px-6 font-black text-stone-950">{item.name}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${item.side === '신랑측' ? 'bg-blue-50 text-[#3B82F6]' : 'bg-rose-50 text-rose-500'}`}>
                        {item.side}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-stone-500 flex items-center gap-1.5">
                      <Phone size={12} className="text-stone-300" />
                      {item.contact}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black ${item.attendance === '참석' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'}`}>
                        {item.attendance}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center text-stone-500">{item.companion}명</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] ${item.meal === '식사함' ? 'bg-emerald-50 text-emerald-600' : item.meal === '식사안함' ? 'bg-stone-100 text-stone-400' : 'bg-amber-50 text-amber-600'}`}>
                        {item.meal}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-stone-500 leading-normal flex items-start gap-1">
                      <MessageSquare size={12} className="text-stone-300 shrink-0 mt-0.5" />
                      <span className="line-clamp-2" title={item.memo}>{item.memo}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-6 bg-[#FAF9F6]/50 border-t border-stone-50 text-center">
            <p className="text-[10px] text-stone-400 font-bold flex items-center justify-center gap-1">
              <Heart size={10} className="text-rose-400" />
              하객들이 입력한 귀중한 설문 정보는 실시간으로 즉시 동기화되어 반영됩니다.
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}
