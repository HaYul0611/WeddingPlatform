'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CreditCard, CheckCircle2, ShieldCheck, ArrowRight, Sparkles,
  BadgePercent, Lock, Wallet, Apple, Landmark, ArrowLeft
} from 'lucide-react';

export default function PaymentPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [payMethod, setPayMethod] = useState<'card' | 'apple' | 'kakao'>('card');

  // 가상 카드 정보 상태
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardName, setCardName] = useState('');

  // 실시간 입력 하이픈 및 정화 포맷터
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    const chunks = raw.match(/.{1,4}/g);
    setCardNumber(chunks ? chunks.slice(0, 4).join('-') : raw);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    if (raw.length <= 4) {
      const month = raw.slice(0, 2);
      const year = raw.slice(2, 4);
      setExpiry(raw.length > 2 ? `${month}/${year}` : raw);
    }
  };

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // 1.5초간의 극적인 명품 결제 승인 시뮬레이션
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);

      // 로컬스토리지에 프리미엄 상태 저장
      localStorage.setItem('wedding_builder_is_premium', 'true');

      setTimeout(() => {
        router.push('/invite/dashboard');
      }, 1500);
    }, 1800);
  };

  return (
    <main className="min-h-screen w-full bg-white text-stone-800 font-sans flex flex-col md:flex-row relative overflow-hidden">

      {/* 1. 결제 승인 오버레이 피드백 (전체 화면 스케일로 압도적 몰입감 연출) */}
      {isProcessing && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-in fade-in duration-300">
          <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-rose-100 border-t-rose-500 rounded-full animate-spin" />
            <Lock size={20} className="text-rose-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <h3 className="text-lg font-black tracking-tight text-stone-900 animate-pulse">안전한 프리미엄 결제 승인 중...</h3>
          <p className="text-xs text-stone-400 mt-2">금융기관의 보안 결제망을 통해 안전하게 승인을 대기 중입니다.</p>
        </div>
      )}

      {isSuccess && (
        <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50 animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-100/50 animate-bounce">
            <CheckCircle2 size={40} className="text-emerald-500" />
          </div>
          <h3 className="text-2xl font-black tracking-tight text-stone-900">결제 승인 완료! 🎉</h3>
          <p className="text-sm text-emerald-600 font-bold mt-2">모든 모바일 청첩장 프리미엄 기능이 해제되었습니다.</p>
          <p className="text-xs text-stone-400 mt-8 animate-pulse">잠시 후 RSVP 및 하객 관리 대시보드로 이동합니다...</p>
        </div>
      )}

      {/* 2. 좌측 영역 (45% 가중치) - 맑고 기품있는 파스텔 백그라운드 */}
      <section className="w-full md:w-[45%] bg-[#FAF8F5] p-8 md:p-16 lg:p-24 flex flex-col justify-between border-b md:border-b-0 md:border-r border-stone-100/80">

        {/* 뒤로 가기 링크 */}
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-3.5 py-2 text-stone-500 hover:text-stone-900 hover:bg-stone-200/50 rounded-xl transition-all text-xs font-bold -ml-2 mb-12"
          >
            <ArrowLeft size={14} strokeWidth={2.5} />
            <span>이전 단계로</span>
          </button>

          <div className="flex items-center gap-2 text-rose-500 mb-6">
            <Sparkles size={16} strokeWidth={2.5} />
            <span className="text-[11px] font-black tracking-widest uppercase">Premium Upgrade</span>
          </div>

          <h1 className="text-3xl lg:text-4xl font-black text-stone-900 leading-tight tracking-tight mb-4">
            가장 소중한 순간,<br />완벽한 청첩장을 완성하다
          </h1>
          <p className="text-sm text-stone-500 leading-relaxed mb-10 max-w-md">
            한 번 결제만으로 예식일 종료 시까지 어떠한 광고 노출도 없이 무제한 사용이 가능하며, RSVP 하객 정보를 구글 스프레드시트와 실시간 연동해 안전하게 통합 관리해 드립니다.
          </p>

          {/* 프리미엄 혜택 상세 리스트 */}
          <div className="flex flex-col gap-5 mb-12">
            {[
              'RSVP 구글 스프레드 시트 실시간 동기화',
              'RSVP 하객 전체 명단 무제한 엑셀 다운로드',
              '갤러리 및 본식 사진 고화질 이미지 최대 50장 확장',
              '청첩장 최하단 워터마크 및 해율 로고 영구 제거',
              '귀빈들을 위한 감동적인 배경음악 BGM 자동 재생 제공'
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[10px] text-rose-600 font-extrabold">✓</span>
                </div>
                <span className="text-xs font-bold text-stone-700 tracking-tight leading-snug">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 가격 합산 영수증 */}
        <div className="border-t border-stone-200/70 pt-8 max-w-md">
          <div className="flex items-center justify-between text-xs text-stone-400 font-bold mb-1.5">
            <span>청첩장 프리미엄 업그레이드 정가</span>
            <span className="line-through">₩49,000</span>
          </div>
          <div className="flex items-center justify-between text-xs text-rose-500 font-black mb-5">
            <span className="flex items-center gap-1">
              <BadgePercent size={14} /> 런칭 특별 60% 즉시 할인 적용
            </span>
            <span>-₩30,000</span>
          </div>
          <div className="flex items-end justify-between border-t border-dashed border-stone-300 pt-5">
            <span className="text-sm font-black text-stone-900">최종 결제 금액</span>
            <span className="text-3xl font-black text-stone-950 tracking-tight">₩19,000</span>
          </div>
        </div>
      </section>

      {/* 3. 우측 영역 (55% 가중치) - 극도의 미니멀리즘 화이트 플랫 */}
      <section className="w-full md:w-[55%] bg-white p-8 md:p-16 lg:p-24 flex flex-col justify-between">
        <div className="max-w-xl w-full mx-auto my-auto">

          <div className="flex items-center justify-between mb-10">
            <h2 className="text-sm font-black text-stone-900 uppercase tracking-widest">결제 수단 선택</h2>
            <span className="text-[10px] text-stone-400 font-bold flex items-center gap-1">
              <ShieldCheck size={13} /> 256-bit SSL 금융 보안망 작동 중
            </span>
          </div>

          {/* 무테 스타일 결제 수단 선택 버튼 */}
          <div className="grid grid-cols-3 gap-3 mb-10">
            <button
              type="button"
              onClick={() => setPayMethod('card')}
              className={`py-4 rounded-2xl border text-xs font-black flex flex-col items-center gap-2 transition-all ${payMethod === 'card' ? 'border-stone-900 bg-stone-900 text-white shadow-lg shadow-stone-900/10' : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'}`}
            >
              <CreditCard size={18} />
              신용카드
            </button>
            <button
              type="button"
              onClick={() => setPayMethod('apple')}
              className={`py-4 rounded-2xl border text-xs font-black flex flex-col items-center gap-2 transition-all ${payMethod === 'apple' ? 'border-stone-900 bg-stone-900 text-white shadow-lg shadow-stone-900/10' : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'}`}
            >
              <Apple size={18} />
              애플페이
            </button>
            <button
              type="button"
              onClick={() => setPayMethod('kakao')}
              className={`py-4 rounded-2xl border text-xs font-black flex flex-col items-center gap-2 transition-all ${payMethod === 'kakao' ? 'border-[#FEE500] bg-[#FEE500] text-[#191919] shadow-lg shadow-[#FEE500]/25' : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'}`}
            >
              <Wallet size={18} />
              카카오페이
            </button>
          </div>

          {payMethod === 'card' ? (
            <form onSubmit={handlePay} className="flex flex-col gap-5">

              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">카드 번호</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    maxLength={19}
                    className="w-full px-5 py-3.5 bg-stone-50 border border-stone-200/80 rounded-xl text-sm font-bold text-stone-900 placeholder-stone-300 focus:outline-none focus:border-rose-400 focus:bg-white transition-all"
                  />
                  <CreditCard size={18} className="text-stone-300 absolute right-5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">유효기간</label>
                  <input
                    type="text"
                    required
                    placeholder="MM / YY"
                    value={expiry}
                    onChange={handleExpiryChange}
                    maxLength={5}
                    className="w-full px-5 py-3.5 bg-stone-50 border border-stone-200/80 rounded-xl text-sm font-bold text-stone-900 placeholder-stone-300 focus:outline-none focus:border-rose-400 focus:bg-white transition-all text-center"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">CVC 번호</label>
                  <input
                    type="password"
                    required
                    placeholder="카드 뒤 3자리"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value.replace(/[^0-9]/g, ''))}
                    maxLength={3}
                    className="w-full px-5 py-3.5 bg-stone-50 border border-stone-200/80 rounded-xl text-sm font-bold text-stone-900 placeholder-stone-300 focus:outline-none focus:border-rose-400 focus:bg-white transition-all text-center"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2 mb-8">
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest">카드 소유주 영문명</label>
                <input
                  type="text"
                  required
                  placeholder="GILDONG HONG"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value.toUpperCase())}
                  className="w-full px-5 py-3.5 bg-stone-50 border border-stone-200/80 rounded-xl text-sm font-bold text-stone-900 placeholder-stone-300 focus:outline-none focus:border-rose-400 focus:bg-white transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4.5 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl text-[14px] font-black flex items-center justify-center gap-2 shadow-lg shadow-rose-200/60 transition-all active:scale-[0.99]"
              >
                <span>19,000원 프리미엄 결제하기</span>
                <ArrowRight size={15} strokeWidth={2.5} />
              </button>
            </form>
          ) : (
            <div className="flex flex-col gap-8 text-center py-10 border border-dashed border-stone-200 rounded-3xl bg-[#FAF8F5]/50 animate-in fade-in duration-300">
              <div className="flex justify-center gap-4 text-stone-400">
                {payMethod === 'apple' ? (
                  <div className="flex flex-col items-center gap-3">
                    <Apple size={36} className="text-stone-850" />
                    <span className="text-[11px] font-black tracking-wider">Apple Pay 결제창 호출</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <Landmark size={36} className="text-[#191919]" />
                    <span className="text-[11px] font-black tracking-wider">카카오페이 안전결제 요청</span>
                  </div>
                )}
              </div>
              <div className="px-10">
                <p className="text-xs text-stone-500 font-bold mb-6 leading-relaxed">
                  스마트폰 생체인식 및 모바일 브라우저 연동 기기를 활용하여<br />간편인증 후 더욱 안전하고 즉각적으로 결제를 승인합니다.
                </p>
                <button
                  onClick={handlePay}
                  className="px-8 py-3.5 bg-stone-900 hover:bg-stone-850 text-white text-xs font-black rounded-xl transition-all shadow-md active:scale-[0.98]"
                >
                  {payMethod === 'apple' ? '애플페이 승인 요청' : '카카오페이 본인인증 진행'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 최하단 저작권 및 푸터 */}
        <div className="max-w-xl w-full mx-auto flex items-center justify-between text-[10px] text-stone-400 font-bold border-t border-stone-100 pt-6 mt-12">
          <span>주식회사 해율 웨딩테크</span>
          <span>고객지원센터 1644-1234</span>
        </div>
      </section>

    </main>
  );
}
