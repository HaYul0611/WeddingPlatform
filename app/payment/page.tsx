'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Mail,
  CreditCard,
  BarChart3,
  UserCheck,
  Camera,
  Gift,
  MessageSquare,
  MessageCircle,
  User,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  BadgePercent,
  Lock,
  Wallet,
  Apple,
  Check,
  Heart,
  AlertCircle,
  X,
  FileSpreadsheet,
  RotateCcw,
  Zap,
  Star,
  ArrowLeft,
  Folder,
  Circle,
  MoreHorizontal,
  Pencil,
  Share2,
  Download,
  ShieldAlert,
  LogOut,
  ChevronRight
} from 'lucide-react';

// ── 타입 정의 ──────────────────────────────────────────────────────────────
type TabType = 'dashboard' | 'invite' | 'payment' | 'stats' | 'checkin' | 'photodrop' | 'reward' | 'inquiry' | 'profile';
type PayMethod = 'card' | 'apple' | 'kakao' | 'naver' | 'samsung' | 'toss' | 'payco';
type ModalType = 'terms' | 'privacy' | 'refund' | null;

// ── 약관 콘텐츠 상숫값 ────────────────────────────────────────────────────────
const TERMS_CONTENT = `
제1조 (목적)
이 약관은 (주)WeddingPlatform 웨딩테크(이하 "회사")가 운영하는 WeddingCare 플랫폼에서 제공하는 유료 서비스(이하 "서비스")의 이용 조건 및 절차, 회사와 이용자 간의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.
`;

const PRIVACY_CONTENT = `
개인정보 수집 항목: 카드정보, 이름, 연락처
수집 목적: 프리미엄 서비스 유료 결제 승인
`;

const REFUND_CONTENT = `
미사용 서비스에 한하여 결제일로부터 7일 이내 신청 시 100% 전액 환불을 보장합니다.
`;

const BENEFITS = [
  { icon: FileSpreadsheet, title: 'RSVP 구글 실시간 동기화', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { icon: RotateCcw, title: '하객 명단 무제한 엑셀 다운로드', color: 'text-blue-600', bg: 'bg-blue-50' },
  { icon: Zap, title: '고화질 갤러리 50장 확장', color: 'text-amber-600', bg: 'bg-amber-50' },
  { icon: Star, title: '브랜드 로고 완전 제거', color: 'text-rose-600', bg: 'bg-rose-50' },
  { icon: Heart, title: 'BGM 자동재생 플레이어', color: 'text-purple-600', bg: 'bg-purple-50' },
];

const SIDEBAR_ITEMS = [
  { id: 'dashboard' as TabType, icon: LayoutDashboard, label: '대시보드' },
  { id: 'invite' as TabType, icon: Mail, label: '내 초대장' },
  { id: 'payment' as TabType, icon: CreditCard, label: '결제 내역' },
  { id: 'stats' as TabType, icon: BarChart3, label: '통계' },
  { id: 'checkin' as TabType, icon: UserCheck, label: '체크인' },
  { id: 'photodrop' as TabType, icon: Camera, label: '포토드롭' },
  { id: 'reward' as TabType, icon: Gift, label: '보상' },
  { id: 'inquiry' as TabType, icon: MessageSquare, label: '1:1 문의' },
  { id: 'profile' as TabType, icon: User, label: '프로필' },
];

export default function PaymentPage() {
  const router = useRouter();

  // 대시보드 탭 분기 상태
  const [activeTab, setActiveTab] = useState<TabType>('payment');

  // 필터 탭 상태
  const [filterTab, setFilterTab] = useState<'all' | 'published' | 'draft' | 'premium'>('all');

  // 로그인한 사용자 데이터 상태 (하드코딩 제거 및 실시간 API 연동)
  const [myInfo, setMyInfo] = useState({
    name: '홍길동',
    email: '[EMAIL_ADDRESS]',
    company_id: 'main',
    profile_image: '/images/pooh_profile.png'
  });

  // 초대장 공개하기 모달 상태
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  // publishUrl: 마운트 시 localStorage에서 복원하거나 랜덤 8자리 해시 자동 생성
  const [publishUrl, setPublishUrl] = useState('');

  // 결제 관련 상태 제어
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [payMethod, setPayMethod] = useState<PayMethod>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // 카드 번호 입력 양식 상태
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardName, setCardName] = useState('');

  // 쿠폰 처리 상태
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  // 약관 동의 상태
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeRefund, setAgreeRefund] = useState(false);
  const [agreeAll, setAgreeAll] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // 개별 약관 팝업 모달 상태
  const [openModal, setOpenModal] = useState<ModalType>(null);

  // 날짜 계산 (공개 시 2일 자동 삭제 안내)
  const [expireDateStr, setExpireDateStr] = useState('2026-05-23');

  // 기타 컬렉션 제어 상태
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  // 1:1 문의 인라인 폼 및 카카오톡 토스트 상태
  const [showInquiryForm, setShowInquiryForm] = useState(false);
  const [inquiryTitle, setInquiryTitle] = useState('');
  const [inquiryContent, setInquiryContent] = useState('');
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [showKakaoToast, setShowKakaoToast] = useState(false);

  // 포토드롭 실시간 제어 상태
  const [photoDropImages, setPhotoDropImages] = useState<any[]>([]);
  const [photoDropFilter, setPhotoDropFilter] = useState<'최신순' | '인기순'>('최신순');
  const [isPhotoDropLoading, setIsPhotoDropLoading] = useState(false);

  const handleKakaoClick = () => {
    setShowKakaoToast(true);
    setTimeout(() => setShowKakaoToast(false), 3000);
  };

  // 1. 로그인한 계정 정보 실시간 연동 로직
  useEffect(() => {
    fetch('/api/admin/auth')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.admin) {
          setMyInfo({
            name: json.admin.name || '송수민',
            email: json.admin.email || 'sumin3314@naver.com',
            company_id: json.admin.company_id || 'main',
            profile_image: '/images/pooh_profile.png' // 푸 캐릭터 아바타는 메인 프로필 기본 에셋으로 유지
          });
        }
      })
      .catch(() => {
        // 비로그인 시 모크 폴백 유지 (송수민 / sumin3314@naver.com)
      });
  }, []);

  useEffect(() => {
    // 현재 날짜 기준으로 +2일 포맷
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 2);
    const yyyy = targetDate.getFullYear();
    const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
    const dd = String(targetDate.getDate()).padStart(2, '0');
    setExpireDateStr(`${yyyy}-${mm}-${dd}`);

    // publishUrl: localStorage에서 복원하거나 랜덤 8자리 해시 자동 생성
    const savedUrl = localStorage.getItem('wedding_publish_url');
    if (savedUrl) {
      setPublishUrl(savedUrl);
    } else {
      const randomHash = Math.random().toString(36).substring(2, 6) + Math.random().toString(36).substring(2, 6);
      setPublishUrl(randomHash);
      localStorage.setItem('wedding_publish_url', randomHash);
    }
  }, []);

  // 2. 포토드롭 실시간 연동 및 필터링 로직
  useEffect(() => {
    if (activeTab !== 'photodrop') return;

    let isMounted = true;

    const fetchPhotos = async () => {
      try {
        setIsPhotoDropLoading(true);
        const res = await fetch('/api/photo-drop/images?invitationId=preview');
        const data = await res.json();
        if (data.images && isMounted) {
           let sorted = [...data.images];
           if (photoDropFilter === '최신순') {
             sorted.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
           } else {
             sorted.sort((a,b) => (b.likes_count || 0) - (a.likes_count || 0));
           }
           setPhotoDropImages(sorted);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) setIsPhotoDropLoading(false);
      }
    };

    fetchPhotos();

    // Supabase 실시간 동기화
    let channel: any = null;
    import('@/lib/supabaseClient').then(({ supabase }) => {
      channel = supabase.channel('photo_drop_changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'photo_drop_images' }, () => {
          fetchPhotos();
        })
        .subscribe();
    });

    return () => {
      isMounted = false;
      if (channel) {
        import('@/lib/supabaseClient').then(({ supabase }) => supabase.removeChannel(channel));
      }
    };
  }, [activeTab, photoDropFilter]);

  // 가격 자동 계산
  const originalPrice = 49000;
  const launchDiscount = 30000;
  const basePrice = originalPrice - launchDiscount;
  const finalPrice = Math.max(0, basePrice - discountAmount);

  // 약관 전체 동의 핸들러
  const handleAgreeAll = (v: boolean) => {
    setAgreeAll(v);
    setAgreeTerms(v);
    setAgreePrivacy(v);
    setAgreeRefund(v);
  };

  useEffect(() => {
    setAgreeAll(agreeTerms && agreePrivacy && agreeRefund);
  }, [agreeTerms, agreePrivacy, agreeRefund]);

  // 카드 번호 4자리 구분 실시간 포맷터
  const handleCardNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    const chunks = raw.match(/.{1,4}/g);
    setCardNumber(chunks ? chunks.slice(0, 4).join('-') : raw);
  };

  // 유효기간 MM/YY 실시간 포맷터
  const handleExpiry = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (raw.length <= 4) {
      setExpiry(raw.length > 2 ? `${raw.slice(0, 2)}/${raw.slice(2)}` : raw);
    }
  };

  // 쿠폰 적용 핸들러
  const handleCoupon = () => {
    if (couponCode.trim().toUpperCase() === 'WEDDING2026') {
      setCouponApplied(true);
      setDiscountAmount(5000);
      setCouponError('');
    } else {
      setCouponError('유효하지 않은 쿠폰 코드입니다.');
      setCouponApplied(false);
      setDiscountAmount(0);
    }
  };

  // 최종 결제 격발 핸들러 (PG API 연동 구조)
  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitAttempted(true);

    if (!agreeTerms || !agreePrivacy || !agreeRefund) return;

    if (payMethod === 'card') {
      if (!cardNumber || !expiry || !cvc || !cardName) return;
    }

    setIsProcessing(true);

    try {
      // PG API 연동 시뮬레이션
      // 실제 PG 연동 시 아래와 같은 패턴으로 API 호출 필요
      const pgResponse = await simulatePGPayment({
        method: payMethod,
        amount: finalPrice,
        cardNumber: payMethod === 'card' ? cardNumber : undefined,
        expiry: payMethod === 'card' ? expiry : undefined,
        customerName: myInfo.name,
        customerEmail: myInfo.email,
      });

      if (pgResponse.success) {
        // 결제 성공 처리
        setIsProcessing(false);
        setIsSuccess(true);

        if (typeof window !== 'undefined') {
          localStorage.setItem('wedding_builder_is_premium', 'true');
          localStorage.setItem('wedding_premium_paid_at', new Date().toISOString());
          localStorage.setItem('wedding_premium_method', payMethod);
          localStorage.setItem('wedding_pg_transaction_id', pgResponse.transactionId);
        }

        setTimeout(() => {
          setIsSuccess(false);
          setIsPaymentModalOpen(false);
          setActiveTab('dashboard');
        }, 2000);
      } else {
        // 결제 실패 처리
        setIsProcessing(false);
        alert(`결제 실패: ${pgResponse.message}`);
      }
    } catch (error) {
      setIsProcessing(false);
      alert('결제 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
      console.error('Payment error:', error);
    }
  };

  // PG API 시뮬레이션 함수 (실제 PG 연동 시 백엔드 API로 대체 필요)
  async function simulatePGPayment(params: {
    method: PayMethod;
    amount: number;
    cardNumber?: string;
    expiry?: string;
    customerName: string;
    customerEmail: string;
  }) {
    // 실제 PG 연동 시 백엔드 API 호출 예시:
    // const response = await fetch('/api/payment/pg-request', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     pgCompany: 'toss', // 또는 'kakaopay', 'naverpay', 'inicis' 등
    //     method: params.method,
    //     amount: params.amount,
    //     orderId: generateOrderId(),
    //     customerName: params.customerName,
    //     customerEmail: params.customerEmail,
    //     cardNumber: params.cardNumber,
    //     expiry: params.expiry,
    //   })
    // });

    return new Promise<{ success: boolean; message: string; transactionId: string }>((resolve) => {
      setTimeout(() => {
        // 시뮬레이션: 90% 성공률
        const isSuccess = Math.random() > 0.1;

        if (isSuccess) {
          resolve({
            success: true,
            message: '결제가 완료되었습니다.',
            transactionId: `PG-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
          });
        } else {
          resolve({
            success: false,
            message: '결제 승인이 거부되었습니다. 카드 정보를 확인해주세요.',
            transactionId: ''
          });
        }
      }, 2000);
    });
  }

  // ── 약관 팝업 모달창 컴포넌트 ──────────────────────────────────────────
  const ModalPopup = ({ type, title, content }: { type: ModalType; title: string; content: string }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-stone-900/30 animate-in fade-in duration-200" onClick={() => setOpenModal(null)} />
      <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-xl flex flex-col max-h-[75vh] animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-200">
          <h3 className="text-sm font-bold text-stone-900">{title}</h3>
          <button onClick={() => setOpenModal(null)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors">
            <X size={14} />
          </button>
        </div>
        <div className="overflow-y-auto px-4 py-1.5 flex-1 custom-scrollbar text-[11px] leading-relaxed text-stone-700">
          <div className="whitespace-pre-wrap font-sans break-keep">{content}</div>
        </div>
        <div className="px-4 py-2.5 border-t border-stone-200">
          <button
            onClick={() => {
              if (type === 'terms') setAgreeTerms(true);
              if (type === 'privacy') setAgreePrivacy(true);
              if (type === 'refund') setAgreeRefund(true);
              setOpenModal(null);
            }}
            className="w-full h-9 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-[11px] font-semibold transition-colors"
          >
            동의 완료
          </button>
        </div>
      </div>
    </div>
  );

  const RefundPolicyModal = ({ onClose, onAgree }: { onClose: () => void, onAgree: () => void }) => {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-stone-900/30 animate-in fade-in duration-200" onClick={onClose} />
        <div className="relative z-10 w-full max-w-3xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-center pt-8 pb-6 relative">
            <h2 className="text-2xl font-black text-stone-900 tracking-tight">환불 정책</h2>
            <button onClick={onClose} className="absolute right-6 top-8 w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="overflow-y-auto px-8 pb-8 custom-scrollbar space-y-4">
            
            <div className="bg-stone-50 border border-stone-200/60 rounded-xl px-4 py-3 flex items-center gap-2">
              <AlertCircle size={16} className="text-stone-500 shrink-0" strokeWidth={2}/>
              <p className="text-[13px] text-stone-600 font-medium">본 환불 정책은 전자상거래법 제17조를 준수하여 작성되었습니다.</p>
            </div>

            <div className="border border-stone-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 size={20} className="text-stone-900" strokeWidth={2} />
                <h3 className="text-[16px] font-bold text-stone-900">환불 가능 조건</h3>
              </div>
              <p className="text-[14px] text-stone-600 mb-4">결제일로부터 7일 이내이며, 다음 조건을 모두 충족해야 합니다:</p>
              <ul className="text-[14px] text-stone-600 space-y-1.5 mb-4 list-disc list-inside marker:text-stone-400">
                <li>초대장 URL 미공유 (조회수 0회)</li>
                <li>RSVP 응답 미수집 (0건)</li>
                <li>방명록 미작성 (0건)</li>
              </ul>
              <p className="text-[14px] text-stone-600">전자상거래법 제17조에 따른 청약철회권이 적용됩니다.</p>
            </div>

            <div className="border border-stone-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <X size={20} className="text-stone-900" strokeWidth={2.5} />
                <h3 className="text-[16px] font-bold text-stone-900">환불 불가 조건</h3>
              </div>
              <p className="text-[14px] text-stone-600 mb-4">다음의 경우 전자상거래법 제17조 제2항 제5호에 따라 환불이 제한됩니다:</p>
              <ul className="text-[14px] text-stone-600 space-y-1.5 mb-4 list-disc list-inside marker:text-stone-400">
                <li>7일 환불 기간 경과</li>
                <li>초대장 URL 공유 (조회수 1회 이상)</li>
                <li>RSVP 응답 수집 (1건 이상)</li>
                <li>방명록 작성 (1건 이상)</li>
                <li>디지털 콘텐츠 제공 개시</li>
              </ul>
              <p className="text-[13px] text-stone-500 mt-5">※ 사용자의 이벤트 취소/연기는 환불 사유가 아닙니다.</p>
            </div>

            <div className="border border-stone-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-[20px] h-[20px] flex items-center justify-center"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-900"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
                <h3 className="text-[16px] font-bold text-stone-900">환불 처리 기간</h3>
              </div>
              <p className="text-[14px] text-stone-600 mb-4">승인 후 결제 수단별 처리 기간:</p>
              <ul className="text-[14px] text-stone-600 space-y-1.5 mb-5 list-disc list-inside marker:text-stone-400">
                <li>신용카드: 3-7 영업일 (카드사 정책에 따라 상이)</li>
                <li>카카오페이: 카카오페이머니/포인트 취소 즉시~1-2일 이내 / 카드 결제 3-7 영업일</li>
                <li>나이스페이: 카드 결제 3-7 영업일</li>
                <li>LemonSqueezy: 최대 10 영업일</li>
              </ul>
              <p className="text-[13px] text-stone-500">※ 카드사/결제사 정책에 따라 실제 입금일은 차이가 있을 수 있습니다.</p>
              <p className="text-[13px] text-stone-500 mt-0.5">※ LemonSqueezy 결제는 USD(미국 달러)로 처리되며, 환불 시 환율 변동에 따라 원화 환불 금액이 결제 시와 다를 수 있습니다.</p>
            </div>

            <div className="border border-stone-200 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-[20px] h-[20px] flex items-center justify-center"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-stone-900"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg></div>
                <h3 className="text-[16px] font-bold text-stone-900">문의 및 분쟁 해결</h3>
              </div>
              <p className="text-[14px] text-stone-600 mb-1">고객센터:</p>
              <ul className="text-[14px] text-stone-600 space-y-1 mb-5 list-disc list-inside marker:text-stone-400">
                <li>전화: 02-1234-5678</li>
                <li>이메일: help@ourwedding.site</li>
                <li>운영시간: 평일 09:00-18:00 (KST)</li>
              </ul>
              
              <p className="text-[14px] text-stone-600 mb-1">소비자 피해 구제:</p>
              <ul className="text-[14px] text-stone-600 space-y-1 list-disc list-inside marker:text-stone-400">
                <li>전자상거래 분쟁조정위원회: 1372</li>
                <li>소비자상담센터: 1372</li>
                <li>웹사이트: www.ecmc.or.kr</li>
              </ul>
            </div>
            
            <div className="bg-stone-50 rounded-xl py-3 text-center border border-stone-100">
              <p className="text-[14px] text-stone-600">자세한 내용은 <span className="font-bold underline cursor-pointer" onClick={() => {onClose(); setOpenModal('terms');}}>이용약관</span>을 참조하시기 바랍니다.</p>
            </div>

          </div>
          
          <div className="px-6 py-4 border-t border-stone-200">
            <button
              onClick={onAgree}
              className="w-full h-12 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-[14px] font-bold transition-colors"
            >
              동의 완료
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-[#FAF9F6] text-stone-800 font-sans flex relative overflow-hidden">
      {/* ── 약관 세부 팝업 바인딩 ────────────────────────────────────── */}
      {openModal === 'terms' && <ModalPopup type="terms" title="이용약관 동의" content={TERMS_CONTENT} />}
      {openModal === 'privacy' && <ModalPopup type="privacy" title="개인정보 처리 동의" content={PRIVACY_CONTENT} />}
      {openModal === 'refund' && <RefundPolicyModal onClose={() => setOpenModal(null)} onAgree={() => { setAgreeRefund(true); setOpenModal(null); }} />}

      {/* ── 결제 승인 중 & 완료 오버레이 ──────────────────────────────── */}
      {isProcessing && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center z-[100] animate-in fade-in duration-300">
          <div className="relative mb-6">
            <div className="w-16 h-16 border-4 border-rose-100 border-t-rose-500 rounded-full animate-spin" />
            <Lock size={18} className="text-rose-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-base font-extrabold text-stone-900 tracking-tight">안전하게 금융 승인 대기 중...</p>
          <p className="text-[11px] text-stone-400 mt-2">금융감독원 지정 암호화 보안망을 통과하고 있습니다.</p>
        </div>
      )}

      {/* isSuccess 오버레이 */}
      {isSuccess && (
        <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[100] animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-100 animate-bounce">
            <CheckCircle2 size={36} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-stone-900">결제 및 혜택 적용 완료! 🎉</p>
          <p className="text-xs text-emerald-600 font-bold mt-2">청첩장 하단 브랜드 워터마크 및 WeddingPlatform 로고가 영구 제거되었습니다.</p>
          <p className="text-[10px] text-stone-300 mt-10 animate-pulse">잠시 후 대시보드로 자동 연결됩니다...</p>
        </div>
      )}

      {/* ── 좌측 사이드바 영역 ────────────────────────────────────────── */}
      <aside className="w-[240px] shrink-0 bg-[#FAF9F6] flex flex-col justify-between py-8 px-6">
        <div>
          {/* 사이드바 최상단 브랜드 로고 */}
          <div className="flex items-center gap-2 mb-10 px-2 cursor-pointer" onClick={() => router.back()}>
            <ArrowLeft size={15} className="text-stone-600" />
            <span className="font-extrabold text-[13px] tracking-tight text-stone-600">뒤로가기</span>
          </div>

          {/* 사이드바 메뉴 */}
          <nav className="flex flex-col gap-1.5">
            {SIDEBAR_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.id === 'invite') {
                      setIsPublishModalOpen(true);
                    } else {
                      setActiveTab(item.id);
                    }
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[12px] font-extrabold transition-all ${isActive
                    ? 'text-stone-950 bg-white/70 shadow-sm border border-stone-200/40'
                    : 'text-stone-400 hover:text-stone-700'
                    }`}
                >
                  <Icon size={14} className={isActive ? 'text-rose-500' : 'text-stone-300'} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* 프로필 요약 카드 (하드코딩 배제, 실시간 계정 데이터 연동) */}
        <div className="px-2 flex items-center gap-3 border-t border-stone-200/50 pt-5 cursor-pointer" onClick={() => setActiveTab('profile')}>
          <div className="w-8 h-8 rounded-full bg-white border border-stone-200/50 flex items-center justify-center overflow-hidden">
            <img src={myInfo.profile_image} alt="profile" className="w-full h-full object-cover" />
          </div>
          <div>
            <p className="text-[11px] font-black text-stone-800 leading-tight">{myInfo.name}</p>
            <p className="text-[9px] text-stone-400 tracking-tight leading-none mt-0.5">{myInfo.email}</p>
          </div>
        </div>
      </aside>

      {/* ── 우측 메인 콘텐츠 영역 ────────────────────────────────────────── */}
      <section className="flex-1 bg-white border-l border-stone-200/60 overflow-y-auto px-8 lg:px-14 py-12 custom-scrollbar">

        {/* ── 탭 분기 1: 대시보드 (기존 '내 컬렉션' 메인 뷰) ───────────────────────── */}
        {activeTab === 'dashboard' && (
          <div className="animate-in fade-in duration-200">
            {/* 상단 헤더 */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-2xl font-black text-stone-950 tracking-tight">내 컬렉션</h1>
                <p className="text-[11px] font-bold text-stone-400 mt-1">생성한 초대장 템플릿 목록</p>
              </div>
              <button
                onClick={() => router.push('/invite/create')}
                className="h-10 px-5 rounded-full bg-stone-950 hover:bg-stone-850 text-white text-[11px] font-bold flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <span>+</span> 새 초대장 만들기
              </button>
            </div>

            {/* 중단 가로 탭 바 */}
            <div className="bg-[#FAF9F6] rounded-2xl p-1 flex gap-1 mb-8 max-w-md border border-stone-200/20">
              <button
                onClick={() => setFilterTab('all')}
                className={`flex-1 px-4 py-2.5 rounded-xl text-[11px] font-black transition-all text-center ${filterTab === 'all'
                  ? 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.03)] text-stone-850'
                  : 'text-stone-400 hover:text-stone-600'
                  }`}
              >
                전체 (1)
              </button>
              <button
                onClick={() => setFilterTab('published')}
                className={`flex-1 px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all text-center ${filterTab === 'published'
                  ? 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.03)] text-stone-850'
                  : 'text-stone-400 hover:text-stone-600'
                  }`}
              >
                공개중 (0)
              </button>
              <button
                onClick={() => setFilterTab('draft')}
                className={`flex-1 px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all text-center ${filterTab === 'draft'
                  ? 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.03)] text-stone-850'
                  : 'text-stone-400 hover:text-stone-600'
                  }`}
              >
                작성중 (1)
              </button>
              <button
                onClick={() => setFilterTab('premium')}
                className={`flex-1 px-4 py-2.5 rounded-xl text-[11px] font-bold transition-all text-center ${filterTab === 'premium'
                  ? 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.03)] text-stone-850'
                  : 'text-stone-400 hover:text-stone-600'
                  }`}
              >
                프리미엄 (0)
              </button>
            </div>

            {/* 청첩장 리스트 카드 */}
            <div className="bg-white rounded-[2rem] border border-stone-200/80 p-7 md:p-9 shadow-[0_12px_45px_rgba(0,0,0,0.02)] max-w-3xl">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-stone-100">
                <div className="flex items-start gap-6">
                  <div className="w-24 h-24 rounded-2xl bg-[#FAF9F6] flex items-center justify-center shrink-0 border border-stone-200/40 text-stone-300">
                    <Folder size={32} strokeWidth={1.5} />
                  </div>
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-base font-extrabold text-stone-900 tracking-tight">제목없음</h3>
                      <div className="flex items-center gap-1 text-stone-300 text-[10px] font-bold mt-1">
                        <span className="w-3.5 h-3.5 rounded-full border border-stone-200 flex items-center justify-center text-[8px] font-black">?</span>
                        <span>조회수 0</span>
                      </div>
                    </div>
                    <div className="space-y-1.5 text-[11px] font-bold text-stone-500">
                      <div className="flex items-center gap-2">
                        <Circle size={10} className="text-stone-300 fill-stone-50" />
                        <span>OG 설정 필요</span>
                      </div>
                      <div className="flex items-center gap-2 text-emerald-600">
                        <CheckCircle2 size={11} className="text-emerald-500 fill-emerald-50" />
                        <span>공유 링크 준비됨</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Circle size={10} className="text-stone-300 fill-stone-50" />
                        <span>광고 제거 필요</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto">
                  <button
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="h-10 px-5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-extrabold flex items-center gap-1.5 transition-all shadow-md shadow-rose-500/20"
                  >
                    <CreditCard size={13} />
                    결제하기
                  </button>
                  
                  <div className="relative">
                    <button
                      onClick={() => setShowMoreMenu(!showMoreMenu)}
                      className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center text-stone-400 hover:bg-stone-50 hover:text-stone-700 transition-colors cursor-pointer"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    
                    {showMoreMenu && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setShowMoreMenu(false)} />
                        <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-lg shadow-stone-200/50 border border-stone-100 z-50 py-1.5 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                          <button 
                            onClick={() => { setShowMoreMenu(false); alert('이름 변경 모달 오픈 (준비중)'); }}
                            className="w-full text-left px-4 py-2.5 hover:bg-stone-50 text-[11px] font-bold text-stone-700 transition-colors"
                          >
                            초대장 이름 변경
                          </button>
                          <button 
                            onClick={() => { setShowMoreMenu(false); alert('초대장이 복제되었습니다.'); }}
                            className="w-full text-left px-4 py-2.5 hover:bg-stone-50 text-[11px] font-bold text-stone-700 transition-colors"
                          >
                            초대장 복제하기
                          </button>
                          <div className="h-px bg-stone-100 my-1 mx-2" />
                          <button 
                            onClick={() => { 
                              setShowMoreMenu(false); 
                              if(confirm('정말로 이 초대장을 삭제하시겠습니까?')) alert('삭제되었습니다.'); 
                            }}
                            className="w-full text-left px-4 py-2.5 hover:bg-rose-50 text-[11px] font-bold text-rose-600 transition-colors"
                          >
                            초대장 삭제
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <span className="self-start text-[10px] font-black text-stone-400 bg-stone-100 rounded-lg px-2.5 py-1 tracking-tight">
                  작성중
                </span>
                <div className="flex gap-2.5 w-full sm:w-auto">
                  <button
                    onClick={() => router.push('/invite/create')}
                    className="flex-1 sm:flex-none h-10 px-5 rounded-full bg-stone-500 hover:bg-stone-600 text-white text-[11px] font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-stone-500/20"
                  >
                    <Pencil size={13} />
                    수정하기
                  </button>
                  <button
                    onClick={() => setIsPublishModalOpen(true)}
                    className="flex-1 sm:flex-none h-10 px-5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-extrabold flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20"
                  >
                    <Share2 size={13} />
                    공유하기
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 탭 분기: 실제 결제 내역 (Payment History) ───────────────────────── */}
        {activeTab === 'payment' && (
          <div className="animate-in fade-in duration-200 max-w-5xl">
            <div className="mb-8">
              <h1 className="text-2xl font-black text-stone-950 tracking-tight">결제 내역</h1>
            </div>

            {/* 상단 요약 3단 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white border border-stone-200/60 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-[116px]">
                <div className="text-[12px] font-extrabold text-stone-400">총 결제 금액</div>
                <div className="flex items-center justify-between">
                  <div className="text-[26px] font-black text-stone-900 tracking-tighter leading-none">₩0</div>
                  <div className="text-stone-300"><Wallet size={24} strokeWidth={1.5}/></div>
                </div>
              </div>
              <div className="bg-white border border-stone-200/60 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-[116px]">
                <div className="text-[12px] font-extrabold text-stone-400">총 결제 횟수</div>
                <div className="flex items-center justify-between">
                  <div className="text-[26px] font-black text-stone-900 tracking-tighter leading-none">0</div>
                  <div className="text-stone-300"><FileSpreadsheet size={24} strokeWidth={1.5}/></div>
                </div>
              </div>
              <div className="bg-white border border-stone-200/60 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-[116px]">
                <div className="text-[12px] font-extrabold text-stone-400">프리미엄 템플릿</div>
                <div className="flex items-center justify-between">
                  <div className="text-[26px] font-black text-stone-900 tracking-tighter leading-none">0</div>
                  <div className="text-stone-300"><BarChart3 size={24} strokeWidth={1.5}/></div>
                </div>
              </div>
            </div>

            {/* 필터 바 */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
              <div className="relative flex-1 max-w-md">
                <input 
                  type="text" 
                  placeholder="템플릿 이름으로 검색..." 
                  className="w-full h-10 pl-10 pr-4 text-[12px] bg-white border border-stone-200/60 rounded-xl focus:border-stone-400 outline-none text-stone-700 font-medium"
                />
                <svg className="w-[15px] h-[15px] text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="flex items-center gap-2">
                <select className="h-10 px-3 text-[11px] font-bold text-stone-600 bg-white border border-stone-200/60 rounded-xl outline-none cursor-pointer">
                  <option>모든 상태</option>
                  <option>결제 완료</option>
                  <option>환불됨</option>
                </select>
                <select className="h-10 px-3 text-[11px] font-bold text-stone-600 bg-white border border-stone-200/60 rounded-xl outline-none cursor-pointer">
                  <option>전체 기간</option>
                  <option>최근 1개월</option>
                  <option>최근 6개월</option>
                </select>
              </div>
            </div>

            {/* 리스트 본문 (Empty State) */}
            <div className="bg-white border border-stone-200/60 rounded-3xl flex flex-col items-center justify-center p-16 text-center shadow-[0_4px_25px_rgba(0,0,0,0.015)] min-h-[380px] mb-6">
              <div className="w-[60px] h-[60px] rounded-2xl bg-[#FAF9F6] flex items-center justify-center mb-5 border border-stone-100/50">
                <CreditCard size={28} className="text-stone-400" strokeWidth={1.5} />
              </div>
              <h3 className="text-[15px] font-black text-stone-900 tracking-tight">결제 내역이 없습니다</h3>
              <p className="text-[12px] font-bold text-stone-400 mt-2 max-w-[280px] leading-relaxed break-keep">
                아직 결제하신 내역이 없습니다. 프리미엄 플랜을 구독하여 광고 없는 초대장을 공유하세요.
              </p>
            </div>

            {/* 환불 정책 요약 박스 */}
            <div className="bg-white border border-stone-200/60 rounded-2xl p-5 flex items-center justify-between shadow-sm">
              <div className="flex gap-3 items-start">
                <AlertCircle size={15} className="text-stone-500 shrink-0 mt-[1px]" strokeWidth={2.5}/>
                <div>
                  <h4 className="text-[12px] font-black text-stone-800 tracking-tight">환불 정책</h4>
                  <p className="text-[10px] font-bold text-stone-400 mt-1">환불 정책은 이용약관 및 환불 정책 페이지에서 확인하실 수 있습니다.</p>
                </div>
              </div>
              <button 
                onClick={() => setOpenModal('refund')}
                className="px-4 py-2 bg-[#FAF9F6] border border-stone-200/80 text-stone-600 text-[11px] font-bold rounded-xl hover:bg-stone-100 transition-colors"
              >
                환불 정책 보기
              </button>
            </div>
          </div>
        )}

        {/* ── 탭 분기 2: 1:1 문의 (두 번째 이미지 상세 형태 그대로 100% 매칭 튜닝) ─────────── */}
        {activeTab === 'inquiry' && (
          <div className="animate-in fade-in duration-200 relative">
            {/* 카카오톡 상담 토스트 */}
            {showKakaoToast && (
              <div className="absolute top-[3px] left-[130px] z-[50] bg-stone-800 text-white px-4 py-2 rounded-xl text-[10px] font-bold shadow-lg animate-in fade-in slide-in-from-top-2 duration-300 pointer-events-none">
                자체 카카오톡 상담 채널 연동 예정입니다.
              </div>
            )}

            <div className="flex items-start justify-between mb-8 max-w-full">
              <div>
                <h1 className="text-2xl font-black text-stone-950 tracking-tight">1:1 문의</h1>
                <p className="text-[11px] font-bold text-stone-400 mt-1">내 문의 목록</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleKakaoClick}
                  className="h-10 px-5 rounded-full border border-stone-200 hover:bg-stone-50 bg-white text-stone-600 text-[11px] font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                >
                  <MessageCircle size={13} className="text-stone-400" />
                  카카오톡 상담
                </button>
                <button
                  onClick={() => {
                    setShowInquiryForm(true);
                    setInquirySubmitted(false);
                  }}
                  className="h-10 px-5 rounded-full bg-stone-950 hover:bg-stone-850 text-white text-[11px] font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                >
                  <span>+</span> 새 문의 작성
                </button>
              </div>
            </div>

            {/* 비어있는 상태의 문의 내역 상자 (두 번째 이미지 양식 완전 동기화) */}
            <div className="w-full bg-white border border-stone-200 rounded-[2rem] flex flex-col min-h-[350px] shadow-[0_4px_25px_rgba(0,0,0,0.015)] relative overflow-hidden">
              {showInquiryForm ? (
                inquirySubmitted ? (
                  <div className="flex flex-col items-center justify-center flex-1 text-center animate-in fade-in zoom-in-95 duration-300 py-10">
                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-6 shadow-sm">
                      <CheckCircle2 size={28} className="text-emerald-500" />
                    </div>
                    <h3 className="text-sm font-black text-stone-900">문의가 성공적으로 접수되었습니다</h3>
                    <p className="text-[11px] font-bold text-stone-400 mt-2">담당자가 확인 후 답변해 드릴 예정입니다.</p>
                    <button
                      onClick={() => setShowInquiryForm(false)}
                      className="mt-6 h-9 px-6 rounded-full border border-stone-200 hover:bg-stone-50 text-stone-600 text-[11px] font-bold transition-colors"
                    >
                      돌아가기
                    </button>
                  </div>
                ) : (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 flex-1 flex flex-col p-8">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
                      <h3 className="text-sm font-black text-stone-900">새 문의 작성</h3>
                      <button onClick={() => setShowInquiryForm(false)} className="text-stone-400 hover:text-stone-600 transition-colors p-1">
                        <X size={16} />
                      </button>
                    </div>

                    <div className="space-y-5 flex-1 flex flex-col">
                      <div>
                        <label className="text-[10px] font-black text-stone-400 uppercase tracking-wider block mb-2">문의 제목</label>
                        <input
                          type="text"
                          placeholder="어떤 내용이 궁금하신가요?"
                          value={inquiryTitle}
                          onChange={(e) => setInquiryTitle(e.target.value)}
                          className="w-full border border-stone-200 rounded-xl px-4 py-3 text-xs font-bold text-stone-700 outline-none focus:border-stone-400 transition-colors bg-stone-50/50"
                        />
                      </div>
                      <div className="flex-1 flex flex-col min-h-[120px]">
                        <label className="text-[10px] font-black text-stone-400 uppercase tracking-wider block mb-2">문의 내용</label>
                        <textarea
                          placeholder="문의하실 내용을 상세히 적어주세요."
                          value={inquiryContent}
                          onChange={(e) => setInquiryContent(e.target.value)}
                          className="w-full flex-1 border border-stone-200 rounded-xl px-4 py-3 text-xs font-bold text-stone-700 outline-none focus:border-stone-400 transition-colors resize-none bg-stone-50/50"
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-2 pt-5 border-t border-stone-100">
                      <button
                        onClick={() => setShowInquiryForm(false)}
                        className="h-10 px-5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 text-[11px] font-bold transition-colors"
                      >
                        취소
                      </button>
                      <button
                        onClick={() => {
                          if (!inquiryTitle.trim() || !inquiryContent.trim()) {
                            alert('제목과 내용을 모두 입력해주세요.');
                            return;
                          }
                          setInquirySubmitted(true);
                          setInquiryTitle('');
                          setInquiryContent('');
                        }}
                        className="h-10 px-6 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-bold transition-colors shadow-sm"
                      >
                        문의 접수하기
                      </button>
                    </div>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 text-center py-20 animate-in fade-in duration-300">
                  <div className="text-stone-300 mb-6 flex items-center justify-center">
                    <MessageCircle size={48} strokeWidth={1.0} className="text-[#b2bac2]" />
                  </div>
                  <h3 className="text-sm font-bold text-stone-800">아직 문의 내역이 없습니다</h3>
                  <p className="text-[10px] text-stone-400 font-bold mt-2">궁금한 점을 문의해보세요</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── 탭 분기 3: 포토드롭 ─────────────────────────────────────── */}
        {activeTab === 'photodrop' && (
          <div className="animate-in fade-in duration-200">
            <div className="flex items-start gap-4 mb-8">
              <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 shrink-0">
                <Camera size={18} />
              </div>
              <div>
                <h1 className="text-2xl font-black text-stone-950 tracking-tight">포토드롭</h1>
                <p className="text-[11px] font-bold text-stone-400 mt-1">게스트가 올린 사진을 관리하세요</p>
              </div>
            </div>

            {/* 제어 바 */}
            <div className="flex items-center justify-between mb-6 max-w-full">
              <span className="text-[10px] font-black text-white bg-stone-950 px-3.5 py-1.5 rounded-full tracking-tight">
                전체 {photoDropImages.length}장
              </span>
              <select 
                value={photoDropFilter}
                onChange={(e) => setPhotoDropFilter(e.target.value as any)}
                className="border border-stone-200 rounded-xl px-4 py-2 text-[11px] font-bold text-stone-500 outline-none bg-white cursor-pointer hover:border-stone-300"
              >
                <option value="최신순">최신순</option>
                <option value="인기순">인기순</option>
              </select>
            </div>

            {/* 비어있는 상태의 사진 드롭 박스 혹은 리스트 그리드 */}
            {isPhotoDropLoading ? (
              <div className="w-full flex items-center justify-center min-h-[360px]">
                <div className="w-8 h-8 border-2 border-stone-200 border-t-stone-500 rounded-full animate-spin" />
              </div>
            ) : photoDropImages.length === 0 ? (
              <div className="w-full bg-white border-2 border-dashed border-stone-200 rounded-[2.5rem] p-16 flex flex-col items-center justify-center min-h-[360px] text-center">
                <div className="w-16 h-16 rounded-full bg-[#FAF9F6] flex items-center justify-center text-stone-300 mb-5">
                  <Camera size={26} strokeWidth={1.5} />
                </div>
                <p className="text-xs font-black text-stone-400">아직 게스트가 올린 사진이 없습니다</p>
              </div>
            ) : (
              <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 pb-20">
                {photoDropImages.map((img) => (
                  <div key={img.id} className="relative aspect-[3/4] rounded-2xl overflow-hidden group shadow-sm bg-stone-50">
                    <img src={img.image_url} alt="Guest Photo" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-100 flex items-end p-3.5">
                      <div className="text-white w-full flex items-end justify-between">
                        <p className="font-bold text-[11px]">{img.guest_name}</p>
                        <div className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded-full backdrop-blur-md">
                          <Heart size={10} className={img.likes_count > 0 ? "fill-rose-500 text-rose-500" : "text-white"} />
                          <span className="text-[10px] font-bold">{img.likes_count || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── 탭 분기 4: 프로필 (하드코딩 제거 및 실시간 계정 데이터 연동) ─────────────────── */}
        {activeTab === 'profile' && (
          <div className="animate-in fade-in duration-200 max-w-full">
            <div className="mb-8">
              <h1 className="text-2xl font-black text-stone-950 tracking-tight">프로필</h1>
              <p className="text-[11px] font-bold text-stone-400 mt-1">계정 정보를 확인하고 관리하세요</p>
            </div>

            {/* 1. 계정 정보 패널 */}
            <div className="bg-white border border-stone-200/60 rounded-[2rem] p-8 flex flex-col sm:flex-row items-center gap-8 mb-6 shadow-[0_8px_30px_rgba(0,0,0,0.01)]">
              {/* 푸 아바타 */}
              <div className="relative w-20 h-20 rounded-full border border-stone-200/60 overflow-visible shrink-0 bg-stone-50 flex items-center justify-center">
                <img
                  src={myInfo.profile_image}
                  alt="Avatar"
                  className="w-full h-full object-cover rounded-full"
                />
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center text-[10px] cursor-pointer shadow">
                  <X size={10} strokeWidth={2.5} />
                </div>
                <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-stone-100 text-[9px] font-black text-stone-500 border border-stone-200/50 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                  일반 사용자
                </div>
              </div>

              {/* 실시간 바인딩 계정 상세 그리드 */}
              <div className="flex-1 grid grid-cols-[80px_1fr] gap-x-4 gap-y-2 text-xs font-bold text-stone-700">
                <span className="text-stone-400">이름</span>
                <span className="text-stone-950 font-black">{myInfo.name}</span>

                <span className="text-stone-400">이메일</span>
                <span className="text-stone-950 font-black">{myInfo.email}</span>

                <span className="text-stone-400">계정 상태</span>
                <div className="flex items-center gap-1">
                  <span className="text-stone-950 font-black">활성</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                </div>
              </div>
            </div>

            {/* 2. 카카오 알림톡 수신 번호 패널 */}
            <div className="bg-white border border-stone-200/60 rounded-[2rem] p-8 mb-6 shadow-[0_8px_30px_rgba(0,0,0,0.01)] space-y-4">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded bg-yellow-400 flex items-center justify-center text-yellow-900 shrink-0">
                  <MessageSquare size={12} className="fill-yellow-900" />
                </div>
                <h3 className="text-xs font-black text-stone-850">카카오 알림톡 수신 번호</h3>
              </div>

              <div className="flex items-center gap-3.5">
                <span className="text-xs font-bold text-stone-400">미등록</span>
                <button
                  onClick={() => {
                    const phoneNumber = prompt('카카오 알림톡을 수신할 전화번호를 입력해주세요 (예: 010-1234-5678):');
                    if (phoneNumber) {
                      alert(`전화번호 ${phoneNumber} (으)로 알림톡 수신이 등록되었습니다.`);
                    } else if (phoneNumber !== null) {
                      alert('전화번호 입력을 취소했습니다.');
                    }
                  }}
                  className="h-10 px-5 rounded-full bg-stone-500 hover:bg-stone-600 text-white text-[11px] font-extrabold flex items-center gap-1.5 transition-all shadow-md shadow-stone-500/20"
                >
                  <Pencil size={13} />
                  등록하기
                </button>
              </div>

              <p className="text-[10px] text-stone-400 font-bold leading-relaxed pt-2 border-t border-stone-100">
                결제 완료, 청첩장 발행 등 주요 알림을 카카오톡으로 받으실 수 있습니다.
              </p>
            </div>

            {/* 3. 보안 알림 */}
            <div className="bg-amber-50/50 border border-amber-100/60 rounded-2xl p-4.5 mb-6 flex items-center gap-3">
              <ShieldAlert size={16} className="text-amber-600 shrink-0" />
              <p className="text-xs font-bold text-amber-800">
                계정 보안을 위해 정기적으로 비밀번호를 변경해주세요.
              </p>
            </div>

            {/* 4. 로그아웃 */}
            <button className="h-11 px-6 rounded-xl border border-stone-200 hover:bg-stone-50 text-[11px] font-bold text-stone-600 flex items-center justify-center gap-1.5 transition-all mb-10 bg-white">
              <LogOut size={13} />
              로그아웃
            </button>

            {/* 5. 회원 탈퇴 */}
            <div className="border border-rose-100 rounded-[2rem] p-8 bg-white space-y-3.5 shadow-sm">
              <h3 className="text-sm font-black text-stone-850">회원 탈퇴</h3>
              <p className="text-[10px] text-stone-400 font-bold">
                계정 탈퇴를 신청할 수 있습니다. 30일 유예기간이 적용됩니다.
              </p>
              <button
                onClick={() => {
                  if (confirm('정말로 회원 탈퇴를 신청하시겠습니까? 30일 유예기간이 적용됩니다.')) {
                    alert('회원 탈퇴 신청이 접수되었습니다. 30일 유예기간 동안 탈퇴가능합니다.');
                  }
                }}
                className="h-10 px-5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-[11px] font-extrabold transition-all shadow-md shadow-rose-500/20"
              >
                회원 탈퇴
              </button>
            </div>
          </div>
        )}

        {/* ── 기타 탭 처리 ────────────────────────────────────────── */}
        {(activeTab === 'stats' || activeTab === 'checkin' || activeTab === 'reward') && (
          <div className="animate-in fade-in duration-200">
            <h1 className="text-2xl font-black text-stone-950 tracking-tight capitalize">{activeTab}</h1>
            <p className="text-[11px] font-bold text-stone-400 mt-1">해당 기능이 준비 중입니다.</p>
            <div className="bg-white border border-stone-200/60 rounded-[2.5rem] p-16 flex flex-col items-center justify-center min-h-[300px] text-center mt-8 shadow-sm">
              <Star size={32} className="text-stone-300 mb-4 animate-spin-slow" />
              <p className="text-xs font-bold text-stone-400">서비스 준비 단계입니다. 곧 찾아뵙겠습니다!</p>
            </div>
          </div>
        )}

      </section>

      {/* ── 9. [MODIFIED] 초대장 공개하기 모달창 (주소 체계 변경, 고화질 진짜 QR 코드 API 바인딩, 클릭 시 템플릿 이동) ─────── */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setIsPublishModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-8 animate-in zoom-in-95 duration-200 space-y-6">

            {/* 상단 닫기 */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-stone-950">초대장 공개하기</h3>
                <p className="text-[11px] font-bold text-stone-400 mt-1">초대장을 공개할 URL 주소를 설정하세요.</p>
              </div>
              <button
                onClick={() => setIsPublishModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-50 text-stone-400 transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* 공개시 자동삭제 공지 */}
            <div className="bg-rose-50/50 border border-rose-100 rounded-xl p-3.5 flex items-start gap-2.5">
              <AlertCircle size={14} className="text-rose-500 shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold text-rose-600 leading-normal">
                공개시: 2일({expireDateStr}까지) 유지 후 자동 삭제
              </p>
            </div>

            {/* URL 입력 필드 */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">URL 주소</label>
              <input
                type="text"
                value={publishUrl}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^a-zA-Z0-9-]/g, '');
                  setPublishUrl(val);
                  if (val.length >= 3) localStorage.setItem('wedding_publish_url', val);
                }}
                className="w-full h-11 rounded-xl border border-stone-200/80 bg-stone-50 px-4 text-xs font-semibold outline-none focus:border-rose-300 focus:bg-white transition-all text-stone-900"
              />
              <p className="text-[9px] text-stone-400 font-bold">영문, 숫자, 하이폰(-)만 사용 가능 (최소 3자)</p>
            </div>

            {/* 미리보기 필드 — 클릭 시 실제 로컈 주소(/ko/invitation/lovecard/[id])로 이동하여 사용자가 만든 청첩장 화면이 저장된 미리보기 화면으로 연결 */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-stone-400 uppercase tracking-wider block">미리보기</label>
              <a
                href={`/ko/invitation/lovecard/${publishUrl || '2e164682'}`}
                target="_blank"
                rel="noreferrer"
                title="클릭 시 제작하신 청첩장 화면이 새 탭에서 열립니다"
                className="w-full h-11 bg-[#FAF9F6] border border-stone-200/60 rounded-xl px-4 flex items-center text-[11px] font-bold text-rose-600 select-all overflow-x-auto whitespace-nowrap cursor-pointer hover:bg-stone-100/80 hover:border-rose-200 transition-all shadow-sm"
              >
                https://wedding-platform.co/ko/invitation/lovecard/{publishUrl || '2e164682'}
              </a>
              <p className="text-[8.5px] text-rose-400 font-bold flex items-center gap-1 mt-1">
                <Sparkles size={9} /> 위 핑크색 링크 주소를 클릭하면 제작하신 템플릿 화면으로 바로 연결됩니다.
              </p>
            </div>

            {/* QR 코드 영역 (실시간 라이브 QR 코드 API 연동하여 초정밀 고화질 실제 QR 코드 구현) */}
            <div className="flex flex-col items-center justify-center py-4 border-t border-stone-100 space-y-4">
              <div className="w-40 h-40 bg-white border border-stone-200 rounded-2xl flex items-center justify-center p-3.5 shadow-sm">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https://wedding-platform.co/ko/invitation/lovecard/${publishUrl || '2e164682'}`}
                  alt="QR Code"
                  className="w-full h-full object-contain"
                />
              </div>
              <a
                href={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://wedding-platform.co/ko/invitation/lovecard/${publishUrl || '2e164682'}`}
                target="_blank"
                rel="noreferrer"
                className="h-9 px-5 rounded-full border border-stone-200 hover:bg-stone-50 text-[10px] font-black text-stone-600 flex items-center gap-1.5 transition-colors bg-white shadow-sm"
              >
                <Download size={12} />
                QR 코드 다운로드
              </a>
            </div>

            {/* 취소 / 공개하기 버튼 */}
            <div className="flex gap-2.5 pt-4 border-t border-stone-100">
              <button
                onClick={() => setIsPublishModalOpen(false)}
                className="flex-1 h-14 rounded-xl border border-stone-200 hover:bg-stone-50 text-[12px] font-bold text-stone-500 transition-colors"
              >
                취소
              </button>
              <button
                onClick={() => {
                  setIsPublishModalOpen(false);
                  window.open(`https://wedding-platform.co/ko/invitation/lovecard/${publishUrl || '2e164682'}`, '_blank');
                }}
                className="flex-1 h-14 rounded-xl bg-stone-950 hover:bg-stone-850 text-white text-[12px] font-black transition-colors"
              >
                공개하기
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── 10. 고품격 결제 다이얼로그 모달 ───────────────────────────────── */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setIsPaymentModalOpen(false)}
          />

          <div className="relative z-10 w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl flex flex-col lg:flex-row max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-255">
            {/* 모달 닫기 버튼 */}
            <button
              onClick={() => setIsPaymentModalOpen(false)}
              className="absolute top-6 right-6 w-9 h-9 flex items-center justify-center rounded-full bg-stone-100/50 hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors z-20"
            >
              <X size={16} />
            </button>

            {/* 모달 왼쪽: 프리미엄 혜택 리스트 */}
            <div className="w-full lg:w-[42%] bg-[#FAF9F6] p-7 md:p-9 border-r border-stone-100 flex flex-col justify-between overflow-y-auto custom-scrollbar">
              <div className="space-y-6">
                <div>
                  <div className="inline-flex items-center gap-2 text-rose-500 mb-2">
                    <Sparkles size={14} className="fill-rose-100/30" />
                    <span className="text-[10px] font-black tracking-widest uppercase">Premium Upgrade</span>
                  </div>
                  <h3 className="text-xl font-black text-stone-900 tracking-tight leading-tight">
                    단 한 번의 업그레이드,<br />완벽한 청첩장 완성
                  </h3>
                  <p className="text-[11px] text-stone-400 mt-2 leading-relaxed font-medium">
                    결제 즉시 모든 프리미엄 템플릿과 갤러리 확장 용량이 활성화되며, 실시간 RSVP 정보는 구글 시트에 즉시 누적 동기화됩니다.
                  </p>
                </div>

                {/* 혜택들 콤팩트 스택 */}
                <div className="flex flex-col gap-3">
                  {BENEFITS.map((b) => {
                    const Icon = b.icon;
                    return (
                      <div key={b.title} className="flex items-center gap-3.5 p-3.5 rounded-xl bg-white border border-stone-200/30 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                        <div className={`w-8 h-8 rounded-lg ${b.bg} flex items-center justify-center shrink-0`}>
                          <Icon size={14} className={b.color} />
                        </div>
                        <span className="text-[11px] font-extrabold text-stone-850">{b.title}</span>
                        <Check size={13} className="text-emerald-500 ml-auto shrink-0" />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 하단 신뢰 배지 */}
              <div className="border-t border-stone-200/50 pt-5 mt-6 flex items-center justify-between text-[9px] text-stone-400 font-bold">
                <span className="flex items-center gap-1"><ShieldCheck size={11} className="text-emerald-500" /> SSL 보안망 보안 작동</span>
                <span>주식회사 Wedding Platform</span>
              </div>
            </div>

            {/* 모달 오른쪽: 금액 산정 및 실결제 폼 */}
            <div className="w-full lg:w-[58%] p-7 md:p-9 overflow-y-auto custom-scrollbar flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-black text-stone-950 uppercase tracking-wider mb-6 flex items-center gap-1.5">
                  <Lock size={12} className="text-rose-500" /> 안전 결제 프로세스
                </h3>

                {/* 가격 및 쿠폰 영역 */}
                <div className="bg-[#FAF9F6] rounded-2xl p-5 border border-stone-200/20 mb-6 space-y-3.5 text-[11px] font-bold">
                  <div className="flex justify-between text-stone-400 font-semibold">
                    <span>정가 금액</span>
                    <span className="line-through">₩{originalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-rose-500">
                    <span className="flex items-center gap-1"><BadgePercent size={13} /> 런칭 특별 61% 절감</span>
                    <span>-₩{launchDiscount.toLocaleString()}</span>
                  </div>
                  {couponApplied && (
                    <div className="flex justify-between text-emerald-600">
                      <span>쿠폰 특별 적용 할인</span>
                      <span>-₩{discountAmount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t border-dashed border-stone-200 pt-3 flex justify-between items-end">
                    <span className="font-extrabold text-[12px] text-stone-900">최종 결제 금액</span>
                    <span className="text-2xl font-black text-rose-500">₩{finalPrice.toLocaleString()}</span>
                  </div>

                  {/* 쿠폰 입력란 */}
                  <div className="flex gap-2 pt-2">
                    <input
                      type="text"
                      placeholder="쿠폰 코드 (WEDDING2026)"
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value);
                        setCouponError('');
                      }}
                      disabled={couponApplied}
                      className="flex-1 h-10 rounded-xl border border-stone-200 bg-white px-3 text-[11px] font-semibold outline-none focus:border-rose-300 disabled:opacity-50"
                    />
                    <button
                      onClick={handleCoupon}
                      disabled={couponApplied || !couponCode.trim()}
                      className="h-10 px-4 rounded-xl bg-stone-950 hover:bg-stone-850 text-white text-[11px] font-bold disabled:opacity-40 transition-colors shrink-0"
                    >
                      {couponApplied ? '적용됨' : '적용'}
                    </button>
                  </div>
                  {couponError && <p className="text-[10px] text-rose-500 flex items-center gap-1"><AlertCircle size={10} /> {couponError}</p>}
                </div>

                {/* 결제 수단 선택 버튼 - 다양한 PG 옵션 */}
                <div className="space-y-3 mb-6">
                  <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-wider">결제 수단 선택</h4>

                  {/* 신용카드 그룹 */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'card' as PayMethod, icon: CreditCard, label: '신용카드', color: 'bg-blue-50 border-blue-200 text-blue-700' },
                      { id: 'samsung' as PayMethod, icon: CreditCard, label: '삼성페이', color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
                    ].map(({ id, icon: Icon, label, color }) => {
                      const isSelected = payMethod === id;
                      return (
                        <button
                          key={id}
                          onClick={() => setPayMethod(id)}
                          className={`h-12 rounded-xl border-2 flex items-center justify-center gap-2 text-[11px] font-extrabold transition-all ${isSelected
                            ? 'border-rose-400 bg-rose-50 text-rose-700 shadow-md shadow-rose-100'
                            : color
                            }`}
                        >
                          <Icon size={14} />
                          <span>{label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* 간편결제 그룹 */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'kakao' as PayMethod, icon: Wallet, label: '카카오페이', color: 'bg-yellow-50 border-yellow-300 text-yellow-800' },
                      { id: 'naver' as PayMethod, icon: Wallet, label: '네이버페이', color: 'bg-green-50 border-green-200 text-green-700' },
                      { id: 'toss' as PayMethod, icon: Wallet, label: '토스', color: 'bg-sky-50 border-sky-200 text-sky-700' },
                    ].map(({ id, icon: Icon, label, color }) => {
                      const isSelected = payMethod === id;
                      return (
                        <button
                          key={id}
                          onClick={() => setPayMethod(id)}
                          className={`h-12 rounded-xl border-2 flex flex-col items-center justify-center gap-1 text-[10px] font-extrabold transition-all ${isSelected
                            ? 'border-rose-400 bg-rose-50 text-rose-700 shadow-md shadow-rose-100'
                            : color
                            }`}
                        >
                          <Icon size={12} />
                          <span>{label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* 기타 결제 수단 */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'apple' as PayMethod, icon: Apple, label: '애플페이', color: 'bg-gray-50 border-gray-200 text-gray-700' },
                      { id: 'payco' as PayMethod, icon: Wallet, label: 'PAYCO', color: 'bg-red-50 border-red-200 text-red-700' },
                    ].map(({ id, icon: Icon, label, color }) => {
                      const isSelected = payMethod === id;
                      return (
                        <button
                          key={id}
                          onClick={() => setPayMethod(id)}
                          className={`h-12 rounded-xl border-2 flex items-center justify-center gap-2 text-[11px] font-extrabold transition-all ${isSelected
                            ? 'border-rose-400 bg-rose-50 text-rose-700 shadow-md shadow-rose-100'
                            : color
                            }`}
                        >
                          <Icon size={14} />
                          <span>{label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 신용카드 상세 폼 */}
                {payMethod === 'card' && (
                  <form onSubmit={handlePay} className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-stone-400 uppercase tracking-wider">카드 번호</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          placeholder="XXXX - XXXX - XXXX - XXXX"
                          value={cardNumber}
                          onChange={handleCardNumber}
                          maxLength={19}
                          className="w-full h-11 rounded-xl border border-stone-200 bg-stone-50 pl-4 pr-10 text-[11px] font-semibold outline-none focus:border-rose-300 focus:bg-white transition-all"
                        />
                        <CreditCard size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-300" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-stone-400 uppercase tracking-wider">유효기간</label>
                        <input
                          type="text"
                          required
                          placeholder="MM / YY"
                          value={expiry}
                          onChange={handleExpiry}
                          maxLength={5}
                          className="w-full h-11 rounded-xl border border-stone-200 bg-stone-50 px-3 text-[11px] font-semibold text-center outline-none focus:border-rose-300 focus:bg-white transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-stone-400 uppercase tracking-wider">CVC</label>
                        <input
                          type="password"
                          required
                          placeholder="뒷 3자리"
                          value={cvc}
                          onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 3))}
                          maxLength={3}
                          className="w-full h-11 rounded-xl border border-stone-200 bg-stone-50 px-3 text-[11px] font-semibold text-center outline-none focus:border-rose-300 focus:bg-white transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-stone-400 uppercase tracking-wider">카드 소유주 영문명</label>
                      <input
                        type="text"
                        required
                        placeholder="GILDONG HONG"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value.toUpperCase())}
                        className="w-full h-11 rounded-xl border border-stone-200 bg-stone-50 px-4 text-[11px] font-semibold outline-none focus:border-rose-300 focus:bg-white transition-all"
                      />
                    </div>

                    <AgreementSection
                      agreeAll={agreeAll}
                      agreeTerms={agreeTerms}
                      agreePrivacy={agreePrivacy}
                      agreeRefund={agreeRefund}
                      submitAttempted={submitAttempted}
                      onAllChange={handleAgreeAll}
                      onTermsChange={setAgreeTerms}
                      onPrivacyChange={setAgreePrivacy}
                      onRefundChange={setAgreeRefund}
                      onOpenModal={setOpenModal}
                    />

                    <button
                      type="submit"
                      className="w-full h-13.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-black shadow-md shadow-rose-100 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Lock size={12} />
                      <span>{finalPrice.toLocaleString()}원 안전 카드 결제</span>
                    </button>
                  </form>
                )}

                {/* 간편결제 폼 */}
                {payMethod !== 'card' && (
                  <div className="space-y-4">
                    <div className={`rounded-2xl p-4.5 text-center border ${payMethod === 'kakao' ? 'bg-yellow-50/50 border-yellow-200' : 'bg-stone-50 border-stone-200'
                      }`}>
                      <p className="text-xs font-bold text-stone-700">
                        {payMethod === 'kakao' && '카카오페이 안전결제'}
                        {payMethod === 'naver' && '네이버페이 본인인증결제'}
                        {payMethod === 'apple' && 'Apple Pay 생체간편결제'}
                      </p>
                      <p className="text-[10px] text-stone-400 mt-1">간편결제 서비스 기기 연동을 확인한 후 진행합니다</p>
                    </div>

                    <AgreementSection
                      agreeAll={agreeAll}
                      agreeTerms={agreeTerms}
                      agreePrivacy={agreePrivacy}
                      agreeRefund={agreeRefund}
                      submitAttempted={submitAttempted}
                      onAllChange={handleAgreeAll}
                      onTermsChange={setAgreeTerms}
                      onPrivacyChange={setAgreePrivacy}
                      onRefundChange={setAgreeRefund}
                      onOpenModal={setOpenModal}
                    />

                    <button
                      onClick={handlePay}
                      className={`w-full h-12 rounded-xl text-xs font-black shadow-md transition-colors flex items-center justify-center gap-1.5 ${payMethod === 'kakao'
                        ? 'bg-[#FEE500] text-[#3C1E1E] shadow-yellow-100 hover:bg-[#FADA00]'
                        : 'bg-stone-900 text-white shadow-stone-200 hover:bg-black'
                        }`}
                    >
                      {payMethod === 'kakao' && <Wallet size={11} />}
                      {payMethod === 'naver' && <Wallet size={11} />}
                      {payMethod === 'apple' && <Apple size={11} />}
                      <span>{finalPrice.toLocaleString()}원 간편 결제 요청</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// ── 약관 동의 섹션 컴포넌트 ───────────────────────────────────────────────
function AgreementSection({
  agreeAll, agreeTerms, agreePrivacy, agreeRefund, submitAttempted,
  onAllChange, onTermsChange, onPrivacyChange, onRefundChange, onOpenModal,
}: {
  agreeAll: boolean;
  agreeTerms: boolean;
  agreePrivacy: boolean;
  agreeRefund: boolean;
  submitAttempted: boolean;
  onAllChange: (v: boolean) => void;
  onTermsChange: (v: boolean) => void;
  onPrivacyChange: (v: boolean) => void;
  onRefundChange: (v: boolean) => void;
  onOpenModal: (t: ModalType) => void;
}) {
  const missingAgreement = submitAttempted && (!agreeTerms || !agreePrivacy || !agreeRefund);

  return (
    <div className={`rounded-xl border p-4 space-y-3 transition-colors ${missingAgreement ? 'border-rose-200 bg-rose-50/40 animate-pulse' : 'border-stone-150 bg-stone-50/50'
      }`}>
      {missingAgreement && <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1"><AlertCircle size={11} /> 필수 약관에 동의해 주세요</p>}

      <label className="flex items-center gap-3 cursor-pointer pb-3 border-b border-stone-200/50">
        <div
          onClick={() => onAllChange(!agreeAll)}
          className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${agreeAll ? 'bg-rose-500 border-rose-500 text-white' : 'border-stone-300 bg-white'
            }`}
        >
          {agreeAll && <Check size={10} strokeWidth={3.5} />}
        </div>
        <span className="text-[11px] font-black text-stone-850">모든 결제 동의사항 전체 수락</span>
      </label>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => onTermsChange(!agreeTerms)}
              className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${agreeTerms ? 'bg-rose-500 border-rose-500 text-white' : 'border-stone-300 bg-white'
                }`}
            >
              {agreeTerms && <Check size={10} strokeWidth={3.5} />}
            </div>
            <span className="text-[10px] text-stone-600 font-bold"><span className="text-rose-500 font-extrabold">[필수]</span> 이용약관</span>
          </label>
          <button type="button" onClick={() => onOpenModal('terms')} className="h-8 px-3.5 rounded-lg border border-stone-200 hover:border-rose-300 hover:bg-rose-50 text-[10px] text-stone-600 hover:text-rose-700 shrink-0 font-bold transition-all">내용보기</button>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => onPrivacyChange(!agreePrivacy)}
              className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${agreePrivacy ? 'bg-rose-500 border-rose-500 text-white' : 'border-stone-300 bg-white'
                }`}
            >
              {agreePrivacy && <Check size={10} strokeWidth={3.5} />}
            </div>
            <span className="text-[10px] text-stone-600 font-bold"><span className="text-rose-500 font-extrabold">[필수]</span> 개인정보동의</span>
          </label>
          <button type="button" onClick={() => onOpenModal('privacy')} className="h-8 px-3.5 rounded-lg border border-stone-200 hover:border-rose-300 hover:bg-rose-50 text-[10px] text-stone-600 hover:text-rose-700 shrink-0 font-bold transition-all">내용보기</button>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => onRefundChange(!agreeRefund)}
              className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${agreeRefund ? 'bg-rose-500 border-rose-500 text-white' : 'border-stone-300 bg-white'
                }`}
            >
              {agreeRefund && <Check size={10} strokeWidth={3.5} />}
            </div>
            <span className="text-[10px] text-stone-600 font-bold"><span className="text-rose-500 font-extrabold">[필수]</span> 환불정책 규정</span>
          </label>
          <button type="button" onClick={() => onOpenModal('refund')} className="h-8 px-3.5 rounded-lg border border-stone-200 hover:border-rose-300 hover:bg-rose-50 text-[10px] text-stone-600 hover:text-rose-700 shrink-0 font-bold transition-all">내용보기</button>
        </div>
      </div>
    </div>
  );
}
