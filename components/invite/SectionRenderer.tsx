'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { InvitationSection, InvitationTheme } from '@/types/invitation';
import { MapPin, Calendar, Users, Heart, MessageSquare, ClipboardCheck, Share2, Info, Camera, Bell, CheckCircle2, QrCode, User, ChevronDown, X, Image as ImageIcon, ChevronLeft, ChevronRight, Lock, Play, Pause, SkipBack, SkipForward, Copy, Phone } from 'lucide-react';
import PhotoDropWidget from './PhotoDropWidget';

interface SectionRendererProps {
  section: InvitationSection;
  theme: InvitationTheme;
  allSections?: InvitationSection[];
}

import SectionHeader from './SectionHeader';

/* ──────────────────────────────────────────
   RSVP 섹션 독립 컴포넌트 (Hook 규칙 준수)
 ────────────────────────────────────────── */
function SectionDividerComp() {
  return (
    <div className="flex items-center gap-3 w-16">
      <div className="flex-1 h-px bg-current opacity-20" />
      <div className="w-1 h-1 rounded-full bg-current opacity-30" />
      <div className="flex-1 h-px bg-current opacity-20" />
    </div>
  );
}

// ── 주소 복사 버튼 — 클릭 시 노란색 체크 피드백 1.5초 표시 후 원복 ──
function CopyAddressButton({ address, theme, st }: { address: string; theme: any; st: any }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    if (!address.trim()) return;
    navigator.clipboard.writeText(address.trim())
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); })
      .catch(() => { setCopied(false); });
  };
  return (
    <button
      onClick={handleCopy}
      className={`w-full mt-3 py-3.5 border rounded-2xl text-[13px] font-bold transition-all shadow-[0_2px_10px_rgba(0,0,0,0.02)] active:scale-[0.98] flex items-center justify-center gap-2 ${copied ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : ''
        }`}
      style={copied ? undefined : {
        backgroundColor: theme.bgColor === '#ffffff' ? '#ffffff' : 'rgba(255,255,255,0.07)',
        borderColor: theme.bgColor === '#ffffff' ? '#e7e5e4' : 'rgba(255,255,255,0.15)',
        color: st.color || '#444444'
      }}
    >
      {copied ? (
        <>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M20 6L9 17l-5-5" />
          </svg>
          복사되었습니다!
        </>
      ) : (
        <>
          <Copy className="w-4 h-4 shrink-0" />
          주소 복사하기
        </>
      )}
    </button>
  );
}

// ── 3D 플립 카드 전용 하위 컴포넌트 (하객 비공개 카드 뒤집기 모션) ──
const GuestbookCard = ({ msg, st, onOpenDelete }: { msg: any; st: any; onOpenDelete: () => void }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // 카드 본문 폰트 스타일 상속 빌더 (색상과 레이아웃 조화를 고려하여 폰트 패밀리, 굵기, 자간, 행간 전용 매핑)
  const cardFontInherit = {
    fontFamily: st?.fontFamily,
    fontWeight: st?.fontWeight,
    letterSpacing: st?.letterSpacing,
    lineHeight: st?.lineHeight,
  };

  if (msg.isPrivate) {
    return (
      <div
        className="w-full aspect-[2.2/1] perspective-1000 cursor-pointer group"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <style jsx>{`
          .perspective-1000 {
            perspective: 1000px;
          }
          .preserve-3d {
            transform-style: preserve-3d;
          }
          .backface-hidden {
            backface-visibility: hidden;
            -webkit-backface-visibility: hidden;
          }
        `}</style>
        <div
          className="relative w-full h-full duration-700 preserve-3d transition-transform select-none"
          style={{
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
          }}
        >
          {/* CARD BACK (비공개 상태의 카드 뒷면 - 기품 있는 초콜릿 다크 테마) */}
          <div
            className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#1C1917] to-[#2E2A27] rounded-2xl border border-stone-800 shadow-lg p-4 flex flex-col justify-between text-center overflow-hidden backface-hidden"
          >
            {/* 은은한 엠보싱 골드 테두리 프레임 데코 */}
            <div className="absolute inset-1.5 border border-amber-500/10 rounded-xl pointer-events-none flex items-center justify-center">
              <div className="w-[97%] h-[97%] border border-amber-500/5 rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-14 h-14 opacity-5 text-amber-400" fill="currentColor">
                  <path d="M50 20c-8.3 0-15 6.7-15 15 0 10 15 25 15 25s15-15 15-25c0-8.3-6.7-15-15-15zm0 20c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5z" />
                </svg>
              </div>
            </div>

            <div className="flex justify-between items-start w-full relative z-10 mb-1">
              <span className="text-[7.5px] font-black text-amber-500/50 tracking-[0.3em] uppercase">Private Card</span>
              <span className="text-[7.5px] font-bold text-stone-500/60 tracking-[0.2em] uppercase">Wedding Invitation</span>
            </div>

            <div className="flex flex-col items-center gap-1.5 relative z-10 py-1">
              <div className="w-7 h-7 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 animate-pulse">
                <Lock size={10} className="text-amber-400" />
              </div>
              <p
                className="text-[12px] font-bold text-stone-200 tracking-wide break-keep"
                style={cardFontInherit}
              >
                비공개로 작성된 축하 카드입니다.
              </p>
              <span className="text-[9px] font-medium text-stone-400/90 tracking-wide bg-stone-800/40 px-2 py-0.5 rounded-full border border-stone-700/30">
                탭하여 축하 메시지 확인하기 ↺
              </span>
            </div>

            <div className="border-t border-stone-800/60 pt-2 flex justify-between items-end relative z-10">
              <div className="flex flex-col text-left">
                <span className="text-[7px] text-stone-500 uppercase tracking-widest leading-none mb-1">GUEST</span>
                <span
                  className="text-[11px] font-bold text-stone-300 tracking-wide leading-none"
                  style={cardFontInherit}
                >{msg.name}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[7px] text-stone-500 uppercase tracking-widest leading-none mb-1">DATE</span>
                <span className="text-[9.5px] font-semibold text-stone-400 tracking-wider leading-none">{msg.date.replace(/\./g, '/')}</span>
              </div>
            </div>
          </div>

          {/* CARD FRONT (클릭 시 뒤집히는 카드 앞면) */}
          <div
            className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#FAF9F5] to-[#F1EFEA] rounded-2xl border border-[#E5E3DC] shadow-md p-5 flex flex-col justify-between text-left overflow-hidden backface-hidden"
            style={{ transform: 'rotateY(180deg)' }}
          >
            {/* 우측 하단 은은한 엠보싱 실크 하트 데코 */}
            <div className="absolute -right-8 -bottom-8 w-28 h-28 rounded-full border border-stone-400/5 pointer-events-none" />

            {/* 우측 상단 미니 브랜드 텍스트 데코 */}
            <span className="absolute right-10 top-2 text-[8px] font-bold text-stone-400/45 tracking-[0.25em] uppercase pointer-events-none whitespace-nowrap">
              Wedding
            </span>

            {/* 우측 상단 삭제 버튼 — hover 시에만 표시 */}
            <button
              onClick={(e) => {
                e.stopPropagation(); // 카드 뒤집히는 이벤트 방지
                onOpenDelete();
              }}
              className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 text-stone-300 hover:text-stone-500 transition-all p-0.5 bg-transparent border-0 cursor-pointer z-20"
            >
              <X size={13} />
            </button>

            {/* 중앙 영역 */}
            <div className="my-auto flex items-center gap-3.5 w-full min-h-[65px] relative z-10 pt-2">
              <div className="w-12 shrink-0 flex items-center justify-center pointer-events-none relative">
                <svg viewBox="0 0 24 24" className="w-11 h-11 drop-shadow-[0_1.5px_2px_rgba(217,119,6,0.25)] relative z-10" fill="url(#goldICChipPriv)" stroke="#B45309" strokeWidth="0.4">
                  <defs>
                    <linearGradient id="goldICChipPriv" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FDE68A" />
                      <stop offset="25%" stopColor="#F59E0B" />
                      <stop offset="50%" stopColor="#FFFBEB" />
                      <stop offset="75%" stopColor="#D97706" />
                      <stop offset="100%" stopColor="#92400E" />
                    </linearGradient>
                    <clipPath id="heartChipClipPriv">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </clipPath>
                  </defs>
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  <g clipPath="url(#heartChipClipPriv)">
                    <rect x="3" y="3.5" width="18" height="14" rx="2.5" stroke="#78350F" strokeWidth="0.45" fill="none" opacity="0.8" />
                    <line x1="3" y1="10.5" x2="21" y2="10.5" stroke="#78350F" strokeWidth="0.45" opacity="0.8" />
                    <line x1="8.5" y1="3.5" x2="8.5" y2="17.5" stroke="#78350F" strokeWidth="0.45" opacity="0.8" />
                    <line x1="15.5" y1="3.5" x2="15.5" y2="17.5" stroke="#78350F" strokeWidth="0.45" opacity="0.8" />
                    <path d="M 8.5 7 H 15.5 M 8.5 14 H 15.5" stroke="#78350F" strokeWidth="0.45" fill="none" opacity="0.8" />
                    <path d="M 5.5 10.5 V 7 H 8.5 M 5.5 10.5 V 14 H 8.5" stroke="#78350F" strokeWidth="0.45" fill="none" opacity="0.8" />
                    <path d="M 18.5 10.5 V 7 H 15.5 M 18.5 10.5 V 14 H 15.5" stroke="#78350F" strokeWidth="0.45" fill="none" opacity="0.8" />
                    <rect x="10.5" y="8.2" width="3" height="4.6" rx="0.5" stroke="#78350F" strokeWidth="0.4" fill="none" opacity="0.75" />
                  </g>
                </svg>
              </div>
              <div className="flex-1 min-w-0 pr-5 flex items-center">
                <p
                  className="text-[12.5px] text-stone-700 font-medium leading-relaxed break-keep line-clamp-3 w-full"
                  style={{ ...cardFontInherit, fontSize: st?.fontSize ? `calc(12.5px * ${parseFloat(st.fontSize) / 100})` : undefined }}
                >
                  "{msg.content}"
                </p>
              </div>
            </div>

            {/* 하단 영역: GUEST CARD & VALID THRU */}
            <div className="border-t border-stone-300/30 pt-2 flex justify-between items-end">
              <div className="flex flex-col text-left">
                <span className="text-[7px] text-stone-400 uppercase tracking-widest leading-none mb-1">Guest Card</span>
                <span
                  className="text-[12px] font-bold text-stone-600 tracking-wide leading-none"
                  style={cardFontInherit}
                >{msg.name}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[7px] text-stone-400 uppercase tracking-widest leading-none mb-1">Valid Thru</span>
                <span className="text-[10px] font-semibold text-stone-500 tracking-wider leading-none">{msg.date.replace(/\./g, '/')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 일반 카드
  return (
    <div className="relative w-full aspect-[2.2/1] bg-gradient-to-br from-[#FAF9F5] to-[#F1EFEA] rounded-2xl border border-[#E5E3DC] shadow-md p-4 flex flex-col justify-between text-left overflow-hidden select-none group">
      <div className="absolute -right-8 -bottom-8 w-28 h-28 rounded-full border border-stone-400/5 pointer-events-none" />
      <span className="absolute right-10 top-2 text-[8px] font-bold text-stone-400/45 tracking-[0.25em] uppercase pointer-events-none whitespace-nowrap">
        Wedding
      </span>
      <button
        onClick={onOpenDelete}
        className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 text-stone-300 hover:text-stone-500 transition-all p-0.5 bg-transparent border-0 cursor-pointer z-20"
      >
        <X size={13} />
      </button>

      <div className="my-auto flex items-center gap-3.5 w-full min-h-[65px] relative z-10 pt-2">
        <div className="w-12 shrink-0 flex items-center justify-center pointer-events-none relative">
          <svg viewBox="0 0 24 24" className="w-11 h-11 drop-shadow-[0_1.5px_2px_rgba(217,119,6,0.25)] relative z-10" fill="url(#goldICChipNrm)" stroke="#B45309" strokeWidth="0.4">
            <defs>
              <linearGradient id="goldICChipNrm" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDE68A" />
                <stop offset="25%" stopColor="#F59E0B" />
                <stop offset="50%" stopColor="#FFFBEB" />
                <stop offset="75%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#92400E" />
              </linearGradient>
              <clipPath id="heartChipClipNrm">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </clipPath>
            </defs>
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            <g clipPath="url(#heartChipClipNrm)">
              <rect x="3" y="3.5" width="18" height="14" rx="2.5" stroke="#78350F" strokeWidth="0.45" fill="none" opacity="0.8" />
              <line x1="3" y1="10.5" x2="21" y2="10.5" stroke="#78350F" strokeWidth="0.45" opacity="0.8" />
              <line x1="8.5" y1="3.5" x2="8.5" y2="17.5" stroke="#78350F" strokeWidth="0.45" opacity="0.8" />
              <line x1="15.5" y1="3.5" x2="15.5" y2="17.5" stroke="#78350F" strokeWidth="0.45" opacity="0.8" />
              <path d="M 8.5 7 H 15.5 M 8.5 14 H 15.5" stroke="#78350F" strokeWidth="0.45" fill="none" opacity="0.8" />
              <path d="M 5.5 10.5 V 7 H 8.5 M 5.5 10.5 V 14 H 8.5" stroke="#78350F" strokeWidth="0.45" fill="none" opacity="0.8" />
              <path d="M 18.5 10.5 V 7 H 15.5 M 18.5 10.5 V 14 H 15.5" stroke="#78350F" strokeWidth="0.45" fill="none" opacity="0.8" />
              <rect x="10.5" y="8.2" width="3" height="4.6" rx="0.5" stroke="#78350F" strokeWidth="0.4" fill="none" opacity="0.75" />
            </g>
          </svg>
        </div>
        <div className="flex-1 min-w-0 pr-5 flex items-center">
          <p
            className="text-[12.5px] text-stone-700 font-medium leading-relaxed break-keep line-clamp-3 w-full"
            style={{ ...cardFontInherit, fontSize: st?.fontSize ? `calc(12.5px * ${parseFloat(st.fontSize) / 100})` : undefined }}
          >
            "{msg.content}"
          </p>
        </div>
      </div>

      <div className="border-t border-stone-300/30 pt-2 flex justify-between items-end">
        <div className="flex flex-col text-left">
          <span className="text-[7px] text-stone-400 uppercase tracking-widest leading-none mb-1">Guest Card</span>
          <span className="text-[12px] font-bold text-stone-600 tracking-wide leading-none">{msg.name}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[7px] text-stone-400 uppercase tracking-widest leading-none mb-1">Valid Thru</span>
          <span className="text-[10px] font-semibold text-stone-500 tracking-wider leading-none">{msg.date.replace(/\./g, '/')}</span>
        </div>
      </div>
    </div>
  );
};

function GuestbookWidget({ section, st }: { section: any; st: any }) {
  const [messages, setMessages] = useState<Array<{ id: string; name: string; content: string; password?: string; date: string; isPrivate?: boolean; clientId?: string }>>([]);
  const [isWriteOpen, setIsWriteOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [targetDeleteId, setTargetDeleteId] = useState<string | null>(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [invitationId, setInvitationId] = useState<string>('preview');

  // 포털 마운트 체커
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const isPublished = window.location.pathname.includes('/lovecard/');
      const currentId = isPublished ? window.location.pathname.split('/').pop() || 'preview' : 'preview';
      setInvitationId(currentId);
    }
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (invitationId === 'preview') {
      setMessages([
        { id: '1', name: '축하객 1', content: '두 분의 결혼을 진심으로 축하드립니다!', password: '1111', date: '2026.05.18', isPrivate: false },
        { id: '2', name: '축하객 2', content: '서로 아끼고 사랑하며 행복한 가정 이루시길 기원합니다.', password: '2222', date: '2026.05.18', isPrivate: true }
      ]);
      return;
    }
    fetch(`/api/guestbook?invitationId=${invitationId}`)
      .then(res => res.json())
      .then(data => {
        if (data.messages) setMessages(data.messages);
        if (data.isBlocked) setIsBlocked(true);
      })
      .catch(err => console.error('Error fetching guestbook:', err));
  }, [invitationId]);

  const getClientId = () => {
    if (typeof window === 'undefined') return 'unknown';
    let id = localStorage.getItem('wedding_guestbook_clientId');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('wedding_guestbook_clientId', id);
    }
    return id;
  };

  // 작성 폼 상태
  const [newName, setNewName] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newPassword, setNewPassword] = useState(''); // 숫자 4자리
  const [isNewPrivate, setIsNewPrivate] = useState(false); // 비공개 토글

  // 삭제 폼 상태
  const [deletePassword, setDeletePassword] = useState('');

  const align = section.textAlign || 'center';
  const uiStyle = section.uiStyle || 'card';
  const alignClass = align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center';

  const handleRegister = async () => {
    if (!newName.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }
    if (!newContent.trim()) {
      alert('메시지를 입력해주세요.');
      return;
    }
    if (!/^\d{4}$/.test(newPassword)) {
      alert('비밀번호는 숫자 4자리여야 합니다.');
      return;
    }

    if (invitationId === 'preview') {
      const today = new Date();
      const todayStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;
      const newMsg = {
        id: crypto.randomUUID(),
        name: newName,
        content: newContent,
        password: newPassword,
        date: todayStr,
        isPrivate: isNewPrivate,
        clientId: getClientId()
      };
      setMessages([newMsg, ...messages]);
      setIsWriteOpen(false);
      setNewName(''); setNewContent(''); setNewPassword(''); setIsNewPrivate(false);
      return;
    }

    try {
      const res = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitationId,
          name: newName,
          content: newContent,
          password: newPassword,
          isPrivate: isNewPrivate,
          clientId: getClientId()
        })
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || '방명록 등록에 실패했습니다.');
        return;
      }

      setMessages([data.message, ...messages]);
      setIsWriteOpen(false);
      setNewName(''); setNewContent(''); setNewPassword(''); setIsNewPrivate(false);
    } catch (e) {
      alert('네트워크 오류가 발생했습니다.');
    }
  };

  const handleDelete = async () => {
    const targetMsg = messages.find(m => m.id === targetDeleteId);
    if (!targetMsg) return;

    const clientId = getClientId();

    if (invitationId === 'preview') {
      if (targetMsg.clientId === clientId || targetMsg.password === deletePassword) {
        setMessages(messages.filter(m => m.id !== targetDeleteId));
        setIsDeleteOpen(false); setDeletePassword(''); setTargetDeleteId(null);
        alert('방명록이 성공적으로 삭제되었습니다.');
      } else {
        alert('권한이 없습니다. (비밀번호 불일치)');
      }
      return;
    }

    try {
      const res = await fetch(`/api/guestbook/${targetDeleteId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: deletePassword, clientId })
      });
      const data = await res.json();

      if (!res.ok) {
        alert(data.error || '삭제에 실패했습니다.');
        return;
      }

      setMessages(messages.filter(m => m.id !== targetDeleteId));
      setIsDeleteOpen(false); setDeletePassword(''); setTargetDeleteId(null);
      alert('방명록이 성공적으로 삭제되었습니다.');
    } catch (e) {
      alert('네트워크 오류가 발생했습니다.');
    }
  };

  const handleOpenDelete = (msg: any) => {
    const clientId = getClientId();
    if (msg.clientId === clientId && msg.clientId !== 'unknown') {
      if (window.confirm('방명록을 삭제하시겠습니까?')) {
        setTargetDeleteId(msg.id);
        setDeletePassword(''); // 본인 기기면 백엔드 검증 시 password 없어도 clientId로 패스되게 해야하지만, 모달 패스용으로 바로 삭제 처리
        // 직접 handleDelete를 호출하도록 구성하는 편이 좋으나, 모달을 띄우지 않으려면 임시로 deletePassword 세팅 후 handleDelete 호출
        handleDeleteDirect(msg.id, clientId, '');
      }
    } else {
      setTargetDeleteId(msg.id);
      setIsDeleteOpen(true);
    }
  };

  const handleDeleteDirect = async (id: string, clientId: string, password: string) => {
    if (invitationId === 'preview') {
      setMessages(messages.filter(m => m.id !== id));
      alert('방명록이 성공적으로 삭제되었습니다.');
      return;
    }
    try {
      const res = await fetch(`/api/guestbook/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, clientId })
      });
      if (res.ok) {
        setMessages(messages.filter(m => m.id !== id));
        alert('방명록이 성공적으로 삭제되었습니다.');
      } else {
        const data = await res.json();
        alert(data.error || '삭제에 실패했습니다.');
      }
    } catch (e) {}
  };

  const handleReport = async (msg: any) => {
    if (window.confirm('이 글을 신고하시겠습니까? 누적 시 게시글이 차단될 수 있습니다.')) {
      if (invitationId === 'preview') {
        alert('미리보기에서는 신고할 수 없습니다.');
        return;
      }
      try {
        const res = await fetch(`/api/guestbook/${msg.id}/report`, { method: 'POST' });
        const data = await res.json();
        if (data.success) {
          alert('신고가 접수되었습니다.');
          if (data.isHidden) {
            setMessages(messages.filter(m => m.id !== msg.id));
            setIsBlocked(true); // 차단 임계치 도달 시
          }
        } else {
          alert('신고 처리에 실패했습니다.');
        }
      } catch (e) {}
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {messages.map((msg, idx) => {
          const i = idx + 1;
          if (uiStyle === 'chat') {
            return (
              <div key={msg.id} className={`flex items-start gap-2.5 ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                <div className="w-10 h-10 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center shrink-0 mt-4 shadow-sm">
                  <User size={20} className="text-stone-300" />
                </div>
                <div className={`flex flex-col gap-1.5 max-w-[75%] ${i % 2 === 0 ? 'items-end' : 'items-start'} relative`}>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[11px] font-bold text-stone-400 ${i % 2 === 0 ? 'mr-1' : 'ml-1'}`}
                      style={{
                        fontFamily: st?.fontFamily,
                        fontWeight: st?.fontWeight,
                        letterSpacing: st?.letterSpacing,
                      }}
                    >{msg.name}</span>
                    <span className="text-[9px] text-stone-300">{msg.date}</span>
                    <button
                      onClick={() => handleOpenDelete(msg)}
                      className="text-stone-300 hover:text-red-500 transition-colors ml-1 p-0.5"
                    >
                      <X size={10} />
                    </button>
                  </div>
                  <div
                    className={`px-5 py-4 rounded-[1.5rem] shadow-sm ${i % 2 === 0 ? 'bg-stone-100 rounded-tr-sm' : 'bg-white border border-stone-100 rounded-tl-sm text-left'}`}
                    style={{
                      fontFamily: st?.fontFamily,
                      fontWeight: st?.fontWeight,
                      letterSpacing: st?.letterSpacing,
                      lineHeight: st?.lineHeight,
                    }}
                  >
                    <p
                      className="text-[14px] text-stone-700 leading-relaxed break-keep font-medium"
                      style={{
                        fontSize: st?.fontSize ? `calc(14px * ${parseFloat(st.fontSize) / 100})` : undefined,
                        color: st?.color || undefined,
                      }}
                    >
                      {msg.isPrivate ? '🔒 비공개 방명록입니다.' : msg.content}
                    </p>
                  </div>
                </div>
              </div>
            );
          } else if (uiStyle === 'list') {
            return (
              <div key={msg.id} className="py-4 border-b border-stone-100 last:border-0 text-left relative pr-6">
                <div className="flex justify-between items-center mb-2">
                  <span
                    className="text-[13px] font-bold text-stone-700"
                    style={{
                      fontFamily: st?.fontFamily,
                      fontWeight: st?.fontWeight,
                      letterSpacing: st?.letterSpacing,
                    }}
                  >{msg.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-stone-400">{msg.date}</span>
                    <button
                      onClick={() => handleOpenDelete(msg)}
                      className="text-stone-300 hover:text-red-500 transition-colors p-0.5"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
                <p
                  className="text-[14px] text-stone-600 leading-relaxed break-keep"
                  style={{
                    fontFamily: st?.fontFamily,
                    fontWeight: st?.fontWeight,
                    fontSize: st?.fontSize ? `calc(14px * ${parseFloat(st.fontSize) / 100})` : undefined,
                    color: st?.color || undefined,
                    letterSpacing: st?.letterSpacing,
                    lineHeight: st?.lineHeight,
                  }}
                >
                  {msg.isPrivate ? '🔒 비공개 방명록입니다.' : msg.content}
                </p>
              </div>
            );
          } else {
            // 프리미엄 웨딩 신용카드 테마 ('card' style)
            return (
              <GuestbookCard
                key={msg.id}
                msg={msg}
                st={st}
                onOpenDelete={() => handleOpenDelete(msg)}
              />
            );
          }
        })}
      </div>

      {isBlocked ? (
        <div className="w-full py-4 bg-red-50 border border-red-100 text-red-500/80 rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 shadow-sm select-none">
          <MessageSquare size={16} /> 신고 누적으로 인해 방명록 작성이 제한되었습니다
        </div>
      ) : (
        <button
          onClick={() => setIsWriteOpen(true)}
          className="w-full py-4 bg-stone-50 border border-stone-200 text-stone-600 rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 hover:bg-stone-100 transition-colors shadow-sm active:scale-[0.99]"
        >
          <MessageSquare size={16} /> 방명록 작성하기
        </button>
      )}

      {/* 작성 모달 팝업 - Body Portal 전격 탑재 */}
      {isWriteOpen && mounted && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-200"
          onClick={() => { setIsWriteOpen(false); setNewName(''); setNewContent(''); setNewPassword(''); setIsNewPrivate(false); }}
        >
          <div
            className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl relative text-left animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 우측 상단 닫기 X 버튼 */}
            <button
              type="button"
              onClick={() => { setIsWriteOpen(false); setNewName(''); setNewContent(''); setNewPassword(''); setIsNewPrivate(false); }}
              className="absolute right-5 top-5 text-stone-400 hover:text-stone-600 transition-colors p-1 bg-transparent border-0 cursor-pointer"
            >
              <X size={16} />
            </button>

            <h4 className="text-[16px] font-bold text-stone-900 mb-4 flex items-center gap-2 pr-8">
              <MessageSquare size={18} className="text-stone-500" /> 축하 메시지 작성
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-stone-400 mb-1.5 uppercase tracking-wider text-left">이름</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="작성자 이름"
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-xs focus:border-stone-400 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-400 mb-1.5 uppercase tracking-wider text-left">비밀번호 (숫자 4자리)</label>
                <input
                  type="password"
                  maxLength={4}
                  pattern="\d*"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="삭제 시 필요한 비밀번호"
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-xs focus:border-stone-400 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-400 mb-1.5 uppercase tracking-wider text-left">메시지</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="두 분에게 축하의 한마디를 남겨주세요."
                  rows={4}
                  maxLength={section.maxLength || 500}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-xs focus:border-stone-400 focus:outline-none resize-none transition-colors"
                />
                <span className="block text-right text-[9px] text-stone-300 mt-1">
                  {newContent.length} / {section.maxLength || 500}
                </span>
              </div>

              {/* 비공개 작성 토글 및 사용자 맞춤 안내 가이드 영역 */}
              <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-2xl flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col text-left">
                    <span className="text-[12px] font-bold text-stone-700">비공개로 작성하기</span>
                    <span className="text-[10px] text-stone-400 mt-0.5">축하 메시지를 뒷면 카드로 비밀스럽게 선물합니다.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsNewPrivate(!isNewPrivate)}
                    className={`relative w-[42px] h-[22px] rounded-full transition-colors duration-300 ease-in-out outline-none shrink-0 ${isNewPrivate ? 'bg-[#1C1917]' : 'bg-[#E5E7EB]'}`}
                  >
                    <div className={`absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out ${isNewPrivate ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
                  </button>
                </div>
                {/* 비공개 안내 문구 주입 */}
                <div className="flex gap-2 items-start border-t border-stone-200/50 pt-2">
                  <Info size={12} className="text-amber-600 mt-0.5 shrink-0" />
                  <p className="text-[9.5px] text-stone-500 leading-normal text-left break-keep">
                    비공개 적용 시 메시지가 아예 안 보이지 않고, <strong>기품 있는 카드 뒷면 형태</strong>로 아름답게 제출됩니다. 탭(클릭/터치)하면 3D 카드 플립 효과와 함께 내용을 열람할 수 있습니다.
                  </p>
                </div>
              </div>

            </div>

            <div className="flex gap-2 mt-6">
              <button
                type="button"
                onClick={() => { setIsWriteOpen(false); setNewName(''); setNewContent(''); setNewPassword(''); setIsNewPrivate(false); }}
                className="flex-1 py-3 bg-stone-100 text-stone-500 rounded-xl text-xs font-bold hover:bg-stone-200 transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleRegister}
                className="flex-1 py-3 bg-[#1C1917] text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors"
              >
                등록하기
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* 삭제 비밀번호 검증 모달 - Body Portal 전격 탑재 */}
      {isDeleteOpen && mounted && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 animate-in fade-in duration-200"
          onClick={() => { setIsDeleteOpen(false); setDeletePassword(''); setTargetDeleteId(null); }}
        >
          <div
            className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative text-left animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 우측 상단 닫기 X 버튼 */}
            <button
              type="button"
              onClick={() => { setIsDeleteOpen(false); setDeletePassword(''); setTargetDeleteId(null); }}
              className="absolute right-5 top-5 text-stone-400 hover:text-stone-600 transition-colors p-1 bg-transparent border-0 cursor-pointer"
            >
              <X size={16} />
            </button>

            <h4 className="text-[16px] font-bold text-stone-900 mb-3 pr-8">
              메시지 삭제
            </h4>
            <p className="text-stone-500 text-[11px] mb-4 text-left leading-relaxed">
              등록 시 설정했던 숫자 4자리 비밀번호를 입력해주세요.
            </p>
            <div>
              <label className="block text-[10px] font-bold text-stone-400 mb-1.5 uppercase tracking-wider text-left">비밀번호</label>
              <input
                type="password"
                maxLength={4}
                pattern="\d*"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="비밀번호 4자리"
                className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 text-xs focus:border-stone-400 focus:outline-none transition-colors"
              />
            </div>

            <div className="flex gap-2 mt-5">
              <button
                type="button"
                onClick={() => { setIsDeleteOpen(false); setDeletePassword(''); setTargetDeleteId(null); }}
                className="flex-1 py-3 bg-stone-100 text-stone-500 rounded-xl text-xs font-bold hover:bg-stone-200 transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 py-3 bg-[#1C1917] text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors"
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function ContactSectionRenderer({ section, theme, st, setCopyToastMessage }: { section: any; theme: InvitationTheme; st: any; setCopyToastMessage?: (msg: string) => void }) {
  const [modalOpen, setModalOpen] = useState(false);
  const useBg = section.useBackgroundColor;
  const align = section.textAlign || section.align || 'center';
  const displayStyle = section.displayStyle || 'modal';
  const fontScale = section.fontSizePercent ? section.fontSizePercent / 100 : 1;
  const customSt = {
    ...st,
    fontFamily: section.fontFamily || st.fontFamily,
    fontSize: section.fontSizePercent ? `${15 * fontScale}px` : st.fontSize,
  };

  const alignClass = align === 'left' ? 'text-left items-start' : align === 'right' ? 'text-right items-end' : 'text-center items-center';
  const contacts = section.contacts || [];

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (setCopyToastMessage) {
      setCopyToastMessage("연락처가 복사되었습니다.");
      setTimeout(() => setCopyToastMessage(""), 2500);
    }
  };

  return (
    <div className={`px-6 py-16 flex flex-col gap-8 ${alignClass}`} style={{ ...customSt, backgroundColor: useBg ? '#F9FAFB' : customSt.backgroundColor }}>
      {section.title && (
        <SectionHeader title={section.title} englishLabel="CONTACT" fontScale={fontScale} textColor={st.color} align={align as any} />
      )}

      {displayStyle === 'simple' ? (
        <div className="w-full flex flex-col gap-6 max-w-[400px] mx-auto mt-4">
          {contacts.map((group: any, idx: number) => (
            <div key={idx} className="flex flex-col gap-4">
              <span className="text-[14px] font-bold opacity-80 border-b pb-2 mb-2" style={{ borderColor: theme.dividerColor || '#E5E7EB' }}>
                {group.group}
              </span>
              {group.persons.map((p: any, pIdx: number) => (
                <div key={pIdx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[13px] opacity-60 w-12">{p.relation}</span>
                    <span className="text-[15px] font-medium">{p.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <a href={`tel:${p.phone}`} className="w-9 h-9 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 transition-colors text-stone-600">
                      <Phone size={14} />
                    </a>
                    <button onClick={() => handleCopy(p.phone)} className="w-9 h-9 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 transition-colors text-stone-600">
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="w-full flex flex-col items-center mt-2">
          <button
            onClick={() => setModalOpen(true)}
            className="w-full max-w-[280px] py-3.5 rounded-full shadow-sm text-[14px] font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90"
            style={{ backgroundColor: theme.primaryColor, color: theme.bgColor }}
          >
            <Phone size={16} />
            연락처 보기
          </button>

          {modalOpen && (
            <div
              className="fixed inset-0 z-[9999] flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.4)' }}
              onClick={() => setModalOpen(false)}
            >
              <div
                className="relative w-[320px] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom-6 duration-300"
                onClick={e => e.stopPropagation()}
              >
                {/* 우상단 X 버튼 */}
                <button
                  onClick={() => setModalOpen(false)}
                  className="absolute top-4 right-4 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 text-stone-400 hover:text-stone-700 transition-colors"
                >
                  <X size={16} />
                </button>

                <div className="p-5 border-b border-stone-100 bg-stone-50">
                  <span className="font-bold text-[15px] text-stone-800">연락처</span>
                </div>
                
                <div className="flex flex-col p-5 gap-6 max-h-[65vh] overflow-y-auto custom-scrollbar-preview">
                  {contacts.map((group: any, idx: number) => {
                    const visiblePersons = group.persons.filter((p: any) => p.name || p.phone);
                    return (
                      <div key={idx} className="flex flex-col gap-3">
                        <span className="text-[12px] font-bold text-stone-400 tracking-wider">
                          {group.group}
                        </span>
                        <div className="flex flex-col gap-4">
                          {visiblePersons.length > 0 ? visiblePersons.map((p: any, pIdx: number) => (
                            <div key={pIdx} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <span className="text-[12px] text-stone-500 w-12">{p.relation}</span>
                                <span className="text-[14px] font-medium text-stone-800">{p.name}</span>
                              </div>
                              <div className="flex gap-2">
                                <a href={`tel:${p.phone}`} className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 transition-colors text-stone-600">
                                  <Phone size={13} />
                                </a>
                                <button onClick={() => handleCopy(p.phone)} className="w-8 h-8 flex items-center justify-center rounded-full bg-stone-100 hover:bg-stone-200 transition-colors text-stone-600">
                                  <Copy size={13} />
                                </button>
                              </div>
                            </div>
                          )) : (
                            <span className="text-[12px] text-stone-400">등록된 연락처가 없습니다.</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RsvpSectionRenderer({ section, theme, st }: { section: any; theme: InvitationTheme; st: any }) {
  const globalScale = (theme.fontSize || 100) / 100;
  const sectionScale = (section.fontSizePercent || 100) / 100;
  const fontScale = globalScale * sectionScale;

  const [showModal, setShowModal] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isStickyVisible, setIsStickyVisible] = useState(true);
  const [step, setStep] = useState(1);
  const [attendance, setAttendance] = useState<'참석' | '불참' | null>(null);

  // 추가 정보 상태
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [side, setSide] = useState<'신랑측' | '신부측' | null>(null);
  const [hasCompanion, setHasCompanion] = useState<'예' | '아니오' | null>(null);
  const [adultCount, setAdultCount] = useState('1');
  const [childCount, setChildCount] = useState('0');
  const [babyCount, setBabyCount] = useState('0');
  const [meal, setMeal] = useState<'예' | '아니오' | null>(null);
  const [message, setMessage] = useState('');

  const [submitted, setSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const hasAutoPoppedRef = useRef(false);

  const displayMode = section.displayMode || 'inline';
  const isDark = theme.bgColor !== '#ffffff';
  const align = section.textAlign || 'center';

  const rsvpStyle = {
    ...st,
    fontFamily: section.fontFamily || st.fontFamily,
    textAlign: 'center' as any,
  };

  useEffect(() => { setMounted(true); }, []);

  const handleOpenModal = () => {
    setStep(1);
    setAttendance(null);
    setName('');
    setContact('');
    setSubmitted(false);
    setIsClosing(false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowModal(false);
      setIsClosing(false);
    }, 400);
  };

  useEffect(() => {
    if (!sectionRef.current || !mounted) return;

    const scrollRoot = document.querySelector('.custom-scrollbar-preview') as HTMLElement | null;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (displayMode === 'sticky') {
          setIsStickyVisible(!entry.isIntersecting);
        }
        if (displayMode === 'popup' && entry.isIntersecting && !hasAutoPoppedRef.current) {
          hasAutoPoppedRef.current = true;
          setTimeout(() => handleOpenModal(), 600);
        }
      },
      { threshold: 0.3, root: scrollRoot }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [displayMode, mounted]);

  const inputBase = "w-full py-3.5 bg-transparent border-b-2 border-stone-200 text-[15px] focus:border-stone-800 outline-none transition-all placeholder:text-stone-300 font-medium";
  const labelBase = "text-[10px] font-black text-stone-400 uppercase tracking-[0.25em] mb-1.5 block";

  const renderRsvpContent = () => {
    return (
      <div className="w-full text-left relative">
        {step > 1 && step < 6 && (
          <button
            type="button"
            onClick={() => {
              if (step === 2) setStep(1);
              else if (step === 3) setStep(2);
              else if (step === 4) setStep(3);
              else if (step === 5) {
                if (attendance === '불참' || hasCompanion === '아니오') setStep(3);
                else setStep(4);
              }
            }}
            className="absolute -top-12 left-0 text-[11px] text-[#a1a1aa] flex items-center gap-1 hover:text-[#78716c] transition-colors"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            뒤로가기
          </button>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-6 animate-in fade-in">
            <div>
              <label className="text-[12px] font-bold text-[#a1a1aa] mb-2 flex gap-1 items-center">이름 <span className="text-rose-400 text-[9px] font-black">◆</span></label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full py-2 bg-transparent border-b border-[#e5e5e5] text-[14px] text-[#52525b] outline-none transition-all placeholder:text-[#d4d4d8]"
                placeholder="성함 (전체 이름)"
              />
            </div>
            <div>
              <label className="text-[12px] font-bold text-[#a1a1aa] mb-3 flex gap-1 items-center">참석 여부 <span className="text-rose-400 text-[9px] font-black">◆</span></label>
              <div className="flex items-center gap-2">
                <button type="button" className={`flex-1 py-3 border rounded-md text-[14px] transition-colors ${attendance === '참석' ? 'border-[#8b736c] bg-[#8b736c] text-white' : 'border-[#e5e5e5] text-[#a1a1aa] bg-transparent'}`} onClick={() => setAttendance('참석')}>
                  참석
                </button>
                <button type="button" className={`flex-1 py-3 border rounded-md text-[14px] transition-colors ${attendance === '불참' ? 'border-[#8b736c] bg-[#8b736c] text-white' : 'border-[#e5e5e5] text-[#a1a1aa] bg-transparent'}`} onClick={() => setAttendance('불참')}>
                  불참
                </button>
              </div>
            </div>
            <div className="flex justify-center mt-6">
              <button
                type="button"
                onClick={() => {
                  if (name.trim() && attendance) {
                    if (attendance === '불참') {
                      setSubmitted(true);
                      setStep(6);
                    } else {
                      setStep(2);
                    }
                  }
                }}
                className={`w-28 py-2.5 border rounded-md text-[13px] transition-colors font-medium ${(!name.trim() || !attendance) ? 'border-[#e5e5e5] text-[#d4d4d8] cursor-not-allowed' : 'border-[#8b736c] text-[#8b736c] hover:bg-[#fafaf9]'}`}
                disabled={!name.trim() || !attendance}
              >
                {attendance === '불참' ? '제출하기' : '다음'}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-6 animate-in fade-in">
            <div>
              <label className="text-[12px] font-bold text-[#a1a1aa] mb-2 flex gap-1 items-center">연락처 <span className="text-rose-400 text-[9px] font-black">◆</span></label>
              <input
                type="text"
                value={contact}
                onChange={e => {
                  const rawVal = e.target.value.replace(/[^0-9]/g, '');
                  let formatted = rawVal;
                  if (rawVal.length > 3 && rawVal.length <= 7) {
                    formatted = `${rawVal.slice(0, 3)}-${rawVal.slice(3)}`;
                  } else if (rawVal.length > 7) {
                    formatted = `${rawVal.slice(0, 3)}-${rawVal.slice(3, 7)}-${rawVal.slice(7, 11)}`;
                  }
                  setContact(formatted);
                }}
                className="w-full py-2 bg-transparent border-b border-[#e5e5e5] text-[14px] text-[#52525b] outline-none transition-all placeholder:text-[#d4d4d8]"
                placeholder="010-1234-5678"
                maxLength={13}
              />
              <p className="text-[10px] text-[#a1a1aa] mt-2">필수사항 - 참석 인원 파악 및 안내를 위한 정보입니다</p>
            </div>
            <div className="flex justify-center mt-4">
              <button
                type="button"
                onClick={() => {
                  if (contact.trim()) setStep(3);
                }}
                className={`w-28 py-2.5 border rounded-md text-[13px] transition-colors font-medium ${!contact.trim() ? 'border-[#e5e5e5] text-[#d4d4d8] cursor-not-allowed' : 'border-[#8b736c] text-[#8b736c] hover:bg-[#fafaf9]'}`}
                disabled={!contact.trim()}
              >
                다음
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-6 animate-in fade-in">
            <div>
              <label className="text-[12px] font-bold text-[#a1a1aa] mb-3 block">참석 여부</label>
              <div className="flex items-center gap-2">
                <button type="button" className={`flex-1 py-3 border rounded-md text-[14px] transition-colors ${side === '신랑측' ? 'border-[#8b736c] bg-[#8b736c] text-white' : 'border-[#e5e5e5] text-[#a1a1aa] bg-transparent'}`} onClick={() => setSide('신랑측')}>
                  신랑측
                </button>
                <button type="button" className={`flex-1 py-3 border rounded-md text-[14px] transition-colors ${side === '신부측' ? 'border-[#8b736c] bg-[#8b736c] text-white' : 'border-[#e5e5e5] text-[#a1a1aa] bg-transparent'}`} onClick={() => setSide('신부측')}>
                  신부측
                </button>
              </div>
            </div>

            {attendance === '참석' && (
              <div>
                <label className="text-[12px] font-bold text-[#a1a1aa] mb-3 block">본인 외 추가 참석 인원이 있나요?</label>
                <div className="flex items-center gap-2 mb-2">
                  <button type="button" className={`flex-1 py-3 border rounded-md text-[14px] transition-colors ${hasCompanion === '아니오' ? 'border-[#8b736c] bg-[#8b736c] text-white' : 'border-[#e5e5e5] text-[#a1a1aa] bg-transparent'}`} onClick={() => setHasCompanion('아니오')}>
                    아니오
                  </button>
                  <button type="button" className={`flex-1 py-3 border rounded-md text-[14px] transition-colors ${hasCompanion === '예' ? 'border-[#8b736c] bg-[#8b736c] text-white' : 'border-[#e5e5e5] text-[#a1a1aa] bg-transparent'}`} onClick={() => setHasCompanion('예')}>
                    예
                  </button>
                </div>
                <p className="text-[10px] text-[#a1a1aa]">동반하시는 분이 계시면 "예"를 선택해주세요</p>
              </div>
            )}

            <div className="flex justify-center mt-4">
              <button type="button" onClick={() => {
                if (attendance === '불참' || hasCompanion === '아니오') setStep(5);
                else setStep(4);
              }} className="w-28 py-2.5 border rounded-md border-[#8b736c] text-[#8b736c] text-[13px] hover:bg-[#fafaf9] transition-colors font-medium">다음</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-6 animate-in fade-in">
            <div>
              <label className="text-[12px] font-bold text-[#a1a1aa] mb-2 block">성인 (필수)</label>
              <div className="relative">
                <select value={adultCount} onChange={e => setAdultCount(e.target.value)} className="w-full py-2 bg-transparent border-b border-[#e5e5e5] text-[14px] text-[#78716c] outline-none appearance-none">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <ChevronDown className="absolute right-0 top-3 text-[#a1a1aa] pointer-events-none" size={16} />
              </div>
            </div>
            <div>
              <label className="text-[12px] font-bold text-[#a1a1aa] mb-2 block">어린이 (만 3-12세)</label>
              <div className="relative">
                <select value={childCount} onChange={e => setChildCount(e.target.value)} className="w-full py-2 bg-transparent border-b border-[#e5e5e5] text-[14px] text-[#78716c] outline-none appearance-none">
                  {[0, 1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <ChevronDown className="absolute right-0 top-3 text-[#a1a1aa] pointer-events-none" size={16} />
              </div>
            </div>
            <div>
              <label className="text-[12px] font-bold text-[#a1a1aa] mb-2 block">유아 (만 3세 미만)</label>
              <div className="relative">
                <select value={babyCount} onChange={e => setBabyCount(e.target.value)} className="w-full py-2 bg-transparent border-b border-[#e5e5e5] text-[14px] text-[#78716c] outline-none appearance-none">
                  {[0, 1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <ChevronDown className="absolute right-0 top-3 text-[#a1a1aa] pointer-events-none" size={16} />
              </div>
            </div>
            <div className="flex justify-center mt-4">
              <button type="button" onClick={() => setStep(5)} className="w-28 py-2.5 border rounded-md border-[#8b736c] text-[#8b736c] text-[13px] hover:bg-[#fafaf9] transition-colors font-medium">다음</button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="flex flex-col gap-6 animate-in fade-in">
            {attendance === '참석' && (
              <div>
                <label className="text-[12px] font-bold text-[#a1a1aa] mb-3 block">식사 여부</label>
                <div className="flex items-center gap-2">
                  <button type="button" className={`flex-1 py-3 border rounded-md text-[14px] transition-colors ${meal === '예' ? 'border-[#8b736c] bg-[#8b736c] text-white' : 'border-[#e5e5e5] text-[#a1a1aa] bg-transparent'}`} onClick={() => setMeal('예')}>
                    예
                  </button>
                  <button type="button" className={`flex-1 py-3 border rounded-md text-[14px] transition-colors ${meal === '아니오' ? 'border-[#8b736c] bg-[#8b736c] text-white' : 'border-[#e5e5e5] text-[#a1a1aa] bg-transparent'}`} onClick={() => setMeal('아니오')}>
                    아니오
                  </button>
                </div>
              </div>
            )}

            <div>
              <label className="text-[12px] font-bold text-[#a1a1aa] mb-2 block">전하실 말씀</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} className="w-full py-2 bg-transparent border-b border-[#e5e5e5] text-[14px] text-[#52525b] outline-none placeholder:text-[#d4d4d8] h-16 resize-none" placeholder="..." />
            </div>

            <div className="flex justify-center mt-6">
              <button type="button" onClick={() => { setSubmitted(true); setStep(6); }} className="w-28 py-2.5 border rounded-md border-[#8b736c] text-[#8b736c] text-[13px] hover:bg-[#fafaf9] transition-colors font-medium">제출</button>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="flex flex-col items-center py-6 text-center animate-in fade-in">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#8b736c15' }}>
              <CheckCircle2 size={24} style={{ color: '#8b736c' }} />
            </div>
            <p className="text-[15px] font-bold text-[#52525b] mb-2">
              {attendance === '불참' ? '전달되었습니다' : '참석 의사가 전달되었습니다'}
            </p>
            <p className="text-[11px] text-[#a1a1aa] leading-relaxed mb-6">
              {attendance === '불참' ? '소중한 답변 감사합니다.' : '참석해 주셔서 감사합니다. 좋은 날 함께해요.'}
            </p>
            <button
              type="button"
              onClick={() => {
                if (displayMode === 'inline') {
                  setStep(1); setAttendance(null); setSide(null); setHasCompanion(null); setMeal(null); setSubmitted(false);
                } else {
                  handleCloseModal();
                }
              }}
              className="px-6 py-2 border border-[#d6d3d1] text-[#78716c] text-[13px] hover:bg-[#fafaf9] transition-colors"
            >
              {displayMode === 'inline' ? '다시 입력하기' : '닫기'}
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderInlineForm = () => (
    <div className="bg-white text-left px-4 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#f5f5f5] overflow-hidden">
      <div className="px-4 py-8">
        {renderRsvpContent()}
      </div>
    </div>
  );

  const renderModalStep1 = () => renderRsvpContent();
  const renderModalStep2 = () => renderRsvpContent();
  const renderModalStep3 = () => renderRsvpContent();
  const renderModalDone = () => renderRsvpContent();

  const renderPreviewModal = (stepCount: number) => (
    <div
      className={`fixed inset-0 z-[9999] flex items-end justify-center bg-black/50 transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
      onClick={(e) => { if (e.target === e.currentTarget) handleCloseModal(); }}
    >
      <div
        className={`relative w-full bg-white shadow-2xl overflow-y-auto no-scrollbar transition-transform duration-300 ease-in-out ${isClosing ? 'translate-y-full' : 'translate-y-0 animate-in slide-in-from-bottom-full'}`}
        style={{ maxWidth: '480px', maxHeight: '88vh', borderRadius: '1.5rem 1.5rem 0 0', padding: '1.5rem 1.5rem 2.5rem' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1.5 bg-stone-200 rounded-full mx-auto mb-5" />
        <button onClick={handleCloseModal} className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center bg-stone-100 text-stone-500 rounded-full hover:bg-stone-200 transition-all">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {step < 6 && (
          <>
            <div className="text-center mb-5">
              <h5 className="text-[19px] font-bold text-stone-900">{section.title ?? '참석 여부를 알려주세요'}</h5>
            </div>
            <div className="flex items-center justify-center gap-2 mb-5">
              {Array.from({ length: 5 }, (_, i) => i + 1).map((s) => (
                <div key={s} className="rounded-full transition-all duration-300" style={{ width: step === s ? '20px' : '7px', height: '7px', backgroundColor: step >= s ? '#1c1917' : '#e7e5e4' }} />
              ))}
            </div>
          </>
        )}
        {renderRsvpContent()}
      </div>
    </div>
  );

  return (
    <>
      <div ref={sectionRef} className="px-8 py-14 relative" style={{ ...rsvpStyle, backgroundColor: (theme?.pattern && theme.pattern !== 'none') ? 'transparent' : (displayMode === 'inline' ? '#ffffff' : (section.useBackgroundColor ? '#F9FAFB' : undefined)) }}>
        {displayMode !== 'inline' && (
          <>
            <SectionHeader title={section.title || '참석 여부'} englishLabel="RSVP" fontScale={fontScale} textColor={rsvpStyle.color} align={align as any} />
            {section.subtitle && (
              <p className="text-[13px] text-stone-500 font-medium text-center -mt-6 mb-10 leading-relaxed max-w-[290px] mx-auto opacity-75" style={{ fontSize: `${13 * fontScale}px`, color: rsvpStyle.color }}>{section.subtitle}</p>
            )}
          </>
        )}

        {displayMode === 'inline' && renderInlineForm()}

        {(displayMode === 'button' || displayMode === 'popup' || displayMode === 'sticky') && (
          <button
            onClick={handleOpenModal}
            className="w-full py-3.5 rounded-[12px] text-[15px] font-bold shadow-[0_4px_20px_rgba(0,0,0,0.2)] active:scale-[0.96] transition-all flex items-center justify-center"
            style={{ backgroundColor: '#404040', color: '#ffffff' }}
          >
            참석 의사 전달하기
          </button>
        )}
      </div>

      {/* sticky 버튼: 포털 제거 — 직접 JSX로 렌더링 */}
      {displayMode === 'sticky' && isStickyVisible && mounted && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex justify-center">
          <button
            onClick={handleOpenModal}
            className="px-8 py-2.5 rounded-full text-[13px] font-black tracking-wide shadow-[0_6px_22px_rgba(0,0,0,0.15)] active:scale-[0.95] transition-all flex items-center justify-center hover:scale-[1.03] bg-[#2D2D2D] hover:bg-[#1C1917] text-white"
          >
            참석 의사 전달하기
          </button>
        </div>
      )}

      {/* RSVP 모달: fixed 오버레이 — 화면 중앙 하단에 패널 등장 */}
      {showModal && mounted && (displayMode === 'button' || displayMode === 'popup' || displayMode === 'sticky') && (
        renderPreviewModal(3)
      )}
    </>
  );
}

// 실시간 카운트다운 타이머 위젯 컴포넌트
function CountdownTimerWidget({
  targetDateStr,
  targetTimeStr,
  style,
  title,
  description,
  useBg,
  hasPattern,
  fontScale,
  align = 'center'
}: {
  targetDateStr: string;
  targetTimeStr: string;
  style: string;
  title?: string;
  description?: string;
  useBg?: boolean;
  hasPattern?: boolean;
  fontScale?: number;
  align?: 'left' | 'center' | 'right';
}) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // 1. 날짜 정수 추출 및 가공
    let year = 2027;
    let month = 10;
    let day = 18;

    let cleanDate = targetDateStr.replace(/\s/g, ''); // 공백 제거
    const dateMatch = cleanDate.match(/(\d{4})[.-]?(\d{1,2})[.-]?(\d{1,2})/);

    if (dateMatch) {
      year = parseInt(dateMatch[1], 10);
      month = parseInt(dateMatch[2], 10);
      day = parseInt(dateMatch[3], 10);
    }

    // 2. 시간 정수 추출 및 가공
    let hour = 14;
    let min = 0;

    let cleanTime = targetTimeStr.replace(/\s/g, ''); // 공백 제거
    if (cleanTime.includes('오후')) {
      const matchHour = parseInt(cleanTime.replace(/[^0-9]/g, ''), 10);
      hour = matchHour === 12 ? 12 : (matchHour < 12 ? matchHour + 12 : matchHour);
    } else if (cleanTime.includes('오전')) {
      const matchHour = parseInt(cleanTime.replace(/[^0-9]/g, ''), 10);
      hour = matchHour === 12 ? 0 : matchHour;
    } else {
      const timeMatch = cleanTime.match(/(\d{1,2}):(\d{1,2})/);
      if (timeMatch) {
        hour = parseInt(timeMatch[1], 10);
        min = parseInt(timeMatch[2], 10);
      } else {
        const justNum = parseInt(cleanTime.replace(/[^0-9]/g, ''), 10);
        if (!isNaN(justNum) && justNum < 24) {
          hour = justNum;
        }
      }
    }

    // 3. 브라우저 100% 호환 보증 Direct Integer Constructor 호출
    // month-1 적용 (JavaScript의 월 인덱스는 0부터 시작)
    const targetDate = new Date(year, month - 1, day, hour, min, 0);

    const updateTimer = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime(); // 미래 날짜 - 현재 날짜 = 남은 시간(1초마다 감소)

      if (isNaN(diff) || diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000)
        });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [targetDateStr, targetTimeStr]);

  const { days, hours, minutes, seconds } = timeLeft;

  return (
    <div
      className="px-8 py-14 text-center"
      style={{
        backgroundColor: hasPattern ? 'transparent' : (useBg ? '#F9FAFB' : '#ffffff')
      }}
    >
      {title && <SectionHeader title={title} englishLabel="COUNTDOWN" fontScale={fontScale || 1.0} align={align as any} />}
      {description && <p className="text-[13px] text-stone-500 mb-10 leading-relaxed break-keep -mt-4 opacity-75">{description}</p>}

      {style === 'simple' && (
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-50 rounded-full text-[14px] font-bold text-rose-500 shadow-sm border border-rose-100/50">
            <Heart size={14} fill="currentColor" className="text-rose-500 animate-pulse" />
            <span>D-{days}</span>
          </div>
          <p className="text-[12px] text-stone-400 font-medium tracking-tight">
            두 사람의 소중한 날까지 {days}일 남았습니다.
          </p>
        </div>
      )}

      {style === 'card' && (
        <div className="flex justify-center gap-3.5">
          {[
            { val: days, label: 'DAYS' },
            { val: hours, label: 'HOURS' },
            { val: minutes, label: 'MINS' },
            { val: seconds, label: 'SECS' }
          ].map((item) => (
            <div
              key={item.label}
              className="w-16 h-20 bg-stone-50 border border-stone-100 rounded-2xl shadow-sm flex flex-col items-center justify-center gap-1.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md relative overflow-hidden group"
            >
              <span className="text-[24px] font-serif font-bold text-stone-800 leading-none">
                {item.val.toString().padStart(2, '0')}
              </span>
              <span className="text-[8px] font-black text-stone-400 tracking-widest">{item.label}</span>
            </div>
          ))}
        </div>
      )}

      {style === 'flip' && (
        <div className="flex justify-center items-center gap-2">
          {[
            { val: days, label: 'D' },
            { val: hours, label: 'H' },
            { val: minutes, label: 'M' },
            { val: seconds, label: 'S' }
          ].map((item, i) => (
            <div key={i} className="flex gap-1.5 items-center">
              <div className="flex flex-col items-center gap-1">
                <div
                  className="w-14 h-16 bg-[#2B2B2B] rounded-xl flex items-center justify-center text-[26px] font-bold text-stone-100 relative overflow-hidden shadow-lg border-b-[3px] border-black/40"
                  style={{ perspective: '200px' }}
                >
                  <div className="absolute inset-x-0 top-1/2 h-[1px] bg-black/30 z-10" />
                  <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />
                  {/* 리액트 key 바인딩을 통해 매 초마다 접히는 3D 폴딩 플립 애니메이션 구현 */}
                  <span
                    key={item.val}
                    className="inline-block transform-gpu origin-center animate-flip-fold"
                  >
                    {item.val.toString().padStart(2, '0')}
                  </span>
                </div>
                <span className="text-[8px] font-black text-stone-400/80 tracking-widest uppercase">{item.label}</span>
              </div>
              {i < 3 && (
                <div className="flex flex-col gap-1.5 px-0.5 mb-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-stone-300 animate-pulse" />
                  <div className="w-1.5 h-1.5 rounded-full bg-stone-300" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}


      {style === 'typo' && (
        <div className="flex flex-col items-center justify-center py-4">
          <div className="relative flex items-baseline justify-center mb-6">
            <span className="text-[72px] font-serif font-light text-stone-900 leading-none tracking-tighter">
              {days}
            </span>
            <span className="text-[12px] font-bold text-[#E5D5C5] tracking-widest ml-3 uppercase">DAYS TO GO</span>
          </div>

          <div className="flex items-center gap-2 px-6 py-2 border-y border-stone-100 text-[13px] font-medium text-stone-600 tracking-[0.25em]">
            <span>{hours.toString().padStart(2, '0')}</span>
            <span className="text-[#E5D5C5] animate-pulse">:</span>
            <span>{minutes.toString().padStart(2, '0')}</span>
            <span className="text-[#E5D5C5] animate-pulse">:</span>
            <span className="text-[#E5D5C5] font-bold">{seconds.toString().padStart(2, '0')}</span>
          </div>
        </div>
      )}
    </div>
  );
}


// 메인 이미지 효과 컴포넌트
function MainImageEffect({ type, loop, opacity }: { type: string; loop?: boolean; opacity?: number }) {
  // 모바일 프리뷰 전체 화면 오버레이(MobilePreview)로 기능을 이관하여 여기서는 중복 렌더링을 방지하기 위해 null을 반환합니다.
  return null;
}

function LegacyMainImageEffect({ type, loop, opacity }: { type: string; loop?: boolean; opacity?: number }) {
  if (!type || type === 'none') return null;

  const effectClass = loop ? 'animate-loop' : 'animate-once';
  const currentOpacity = opacity !== undefined ? opacity / 100 : 0.4;

  return (
    <div
      className={`absolute inset-0 z-[10] pointer-events-none overflow-hidden ${effectClass}`}
      style={{ opacity: currentOpacity }}
    >
      {type === 'cherryBlossom' && (
        <div className="absolute inset-0 opacity-30">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-fall-rotate text-pink-200/60"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${10 + Math.random() * 20}%`,
                fontSize: `${12 + Math.random() * 12}px`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${8 + Math.random() * 10}s`,
              }}
            >
              🌸
            </div>
          ))}
        </div>
      )}
      {type === 'eucalyptus' && (
        <div className="absolute inset-0 opacity-20">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-fall-rotate text-emerald-800/40"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${10 + Math.random() * 20}%`,
                fontSize: `${14 + Math.random() * 14}px`,
                animationDelay: `${Math.random() * 12}s`,
                animationDuration: `${12 + Math.random() * 12}s`,
              }}
            >
              🍃
            </div>
          ))}
        </div>
      )}
      {type === 'snow' && (
        <div className="absolute inset-0 opacity-30">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-fall bg-white rounded-full"
              style={{
                width: `${2 + Math.random() * 3}px`,
                height: `${2 + Math.random() * 3}px`,
                left: `${Math.random() * 100}%`,
                top: `-${5 + Math.random() * 15}%`,
                animationDelay: `${Math.random() * 8}s`,
                animationDuration: `${5 + Math.random() * 5}s`,
                filter: 'blur(0.5px)',
              }}
            />
          ))}
        </div>
      )}
      {type === 'confetti' && (
        <div className="absolute inset-0 opacity-20">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-fall-rotate"
              style={{
                width: `${4 + Math.random() * 4}px`,
                height: `${4 + Math.random() * 4}px`,
                backgroundColor: ['#fff5f5', '#fffaf0', '#f0fff4', '#f0f9ff', '#fdf2f8'][Math.floor(Math.random() * 5)],
                left: `${Math.random() * 100}%`,
                top: `-${5 + Math.random() * 15}%`,
                animationDelay: `${Math.random() * 6}s`,
                animationDuration: `${4 + Math.random() * 4}s`,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
              }}
            />
          ))}
        </div>
      )}
      {type === 'bubbles' && (
        <div className="absolute inset-0 opacity-20">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float border border-white/40 rounded-full"
              style={{
                width: `${20 + Math.random() * 30}px`,
                height: `${20 + Math.random() * 30}px`,
                left: `${Math.random() * 100}%`,
                top: `${100 + Math.random() * 20}%`,
                animationDelay: `${Math.random() * 12}s`,
                animationDuration: `${10 + Math.random() * 10}s`,
                background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), transparent)',
              }}
            />
          ))}
        </div>
      )}
      {type === 'petals' && (
        <div className="absolute inset-0 opacity-40">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-fall-rotate text-rose-200/80"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${10 + Math.random() * 20}%`,
                fontSize: `${14 + Math.random() * 14}px`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${10 + Math.random() * 10}s`,
              }}
            >
              🌹
            </div>
          ))}
        </div>
      )}
      {type === 'hearts' && (
        <div className="absolute inset-0 opacity-30">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float text-rose-400/60"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${100 + Math.random() * 20}%`,
                fontSize: `${16 + Math.random() * 10}px`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${12 + Math.random() * 8}s`,
              }}
            >
              ❤️
            </div>
          ))}
        </div>
      )}
      {type === 'stars' && (
        <div className="absolute inset-0 opacity-40">
          {[...Array(25)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-pulse-slow text-yellow-200/80"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                fontSize: `${8 + Math.random() * 8}px`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 5}s`,
              }}
            >
              ⭐
            </div>
          ))}
        </div>
      )}
      {type === 'sparkle' && (
        <div className="absolute inset-0 opacity-50">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-pulse text-white/90 blur-[0.5px]"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                fontSize: `${10 + Math.random() * 6}px`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${1 + Math.random() * 2}s`,
              }}
            >
              ✨
            </div>
          ))}
        </div>
      )}
      {type === 'rain' && (
        <div className="absolute inset-0 opacity-20">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-fall bg-white/40"
              style={{
                width: '1px',
                height: `${10 + Math.random() * 15}px`,
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 20}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${0.5 + Math.random() * 1}s`,
              }}
            />
          ))}
        </div>
      )}
      {type === 'feathers' && (
        <div className="absolute inset-0 opacity-30">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-fall-rotate text-white/70"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${10 + Math.random() * 30}%`,
                fontSize: `${20 + Math.random() * 15}px`,
                animationDelay: `${Math.random() * 15}s`,
                animationDuration: `${15 + Math.random() * 10}s`,
              }}
            >
              🪶
            </div>
          ))}
        </div>
      )}
      {type === 'butterflies' && (
        <div className="absolute inset-0 opacity-40">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float text-rose-300/60"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${80 + Math.random() * 20}%`,
                fontSize: `${18 + Math.random() * 12}px`,
                animationDelay: `${Math.random() * 20}s`,
                animationDuration: `${20 + Math.random() * 15}s`,
              }}
            >
              🦋
            </div>
          ))}
        </div>
      )}
      {(type === 'bokeh' || type === 'lights' || type === 'glow' || type === 'rays') && (
        <div className="absolute inset-0 overflow-hidden opacity-60">
          {[...Array(type === 'rays' ? 3 : 8)].map((_, i) => (
            <div
              key={i}
              className={`absolute rounded-full animate-pulse-slow ${type === 'rays' ? 'bg-yellow-100/10 blur-3xl' : 'bg-white/10 blur-2xl'}`}
              style={{
                width: `${200 + Math.random() * 300}px`,
                height: `${200 + Math.random() * 300}px`,
                left: `${Math.random() * 100 - 50}%`,
                top: `${Math.random() * 100 - 50}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${8 + Math.random() * 8}s`,
                transform: type === 'rays' ? `rotate(${Math.random() * 360}deg) skew(20deg)` : 'none',
              }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-50/5 to-transparent" />
        </div>
      )}
    </div>
  );
}

function InnerSectionRenderer({ section, theme, allSections, setCopyToastMessage }: SectionRendererProps & { setCopyToastMessage: (msg: string | null) => void }) {
  // 사용자가 삭제(초기화) 버튼을 눌렀을 경우 미리보기에서 렌더링하지 않음
  if ((section as any).isCleared) return null;

  const hasPattern = theme?.pattern && theme.pattern !== 'none';

  // 글로벌 테마 폰트 스케일 및 개별 섹션 폰트 스케일을 곱 연산한 종합 폰트 배율 인자 계산
  const globalScale = (theme.fontSize || 100) / 100;
  const sectionScale = ((section as any).fontSizePercent || 100) / 100;
  const fontScale = globalScale * sectionScale;

  // 개별 섹션 폰트 설정 도구 속성 추출 및 안전 병합 (부모 상속 지원을 위해 as any 단언 처리)
  const sec = section as any;
  const sectionFontFamily = sec.fontFamily || undefined;
  const sectionFontWeight = sec.fontWeight || undefined;
  const sectionFontColor = sec.fontColor || undefined;
  const sectionFontSize = sec.fontSizePercent ? `${sec.fontSizePercent}%` : undefined;
  const sectionLetterSpacing = sec.letterSpacing !== undefined ? `${sec.letterSpacing}px` : undefined;
  const sectionLineHeight = sec.lineHeight !== undefined ? sec.lineHeight : undefined;

  const st = {
    fontFamily: sectionFontFamily || theme.fontFamily,
    color: sectionFontColor || theme.textColor || theme.primaryColor,
    accentColor: theme.accentColor,
    backgroundColor: hasPattern ? 'transparent' : (theme.bgColor || '#ffffff'),
    fontWeight: sectionFontWeight,
    fontSize: sectionFontSize,
    letterSpacing: sectionLetterSpacing,
    lineHeight: sectionLineHeight,
  };

  const getAnimClass = () => {
    const anim = theme.textAnimation;
    if (!anim || anim === 'none') return '';
    if (anim === 'typing') return 'animate-typing';
    if (anim === 'fadeIn' || anim === 'fadeUp') return 'animate-fade-in';
    if (anim === 'slide' || anim === 'slideUp') return 'animate-slide-up';
    if (anim === 'blur') return 'animate-blur-in';
    return '';
  };

  const SectionDivider = () => (
    <div className="flex items-center justify-center py-6">
      <div className="w-[4px] h-[4px] rounded-full bg-stone-300 mx-1" />
      <div className="w-[4px] h-[4px] rounded-full bg-stone-300 mx-1" />
      <div className="w-[4px] h-[4px] rounded-full bg-stone-300 mx-1" />
    </div>
  );

  const templateId = theme?.id ? theme.id.replace('-theme', '') : 'classic-arch';

  // ── 12개 템플릿별로 잘림 없는 32x32 뷰박스 공간 내 진짜 대칭 하트 및 프리미엄 마이크로 모션 정의 (💓💗💞❣️💕💘 완벽 특화) ──
  const HEART_STYLES = `
        /* 1. 클래식 아우라 파동 박동 */
        @keyframes classic-pulse {
          0%, 100% { transform: scale(1); }
          15% { transform: scale(1.35) rotate(-3deg); }
          30% { transform: scale(1.15) rotate(3deg); }
          45% { transform: scale(1.3) rotate(0deg); }
        }
        @keyframes classic-wave {
          0% { transform: scale(0.9); opacity: 0.9; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        .animate-classic-heart { animation: classic-pulse 1.8s ease-in-out infinite; transform-origin: center; overflow: visible; }
        .animate-classic-wave { animation: classic-wave 1.8s cubic-bezier(0.1, 0.8, 0.3, 1) infinite; transform-origin: center; }

        /* 2. 에디토리얼 시그널 와이파이 전파 */
        @keyframes editorial-breath {
          0%, 100% { transform: scale(0.96); filter: drop-shadow(0 0 1px rgba(217,70,239,0.3)); }
          50% { transform: scale(1.12); filter: drop-shadow(0 0 4px rgba(217,70,239,0.6)); }
        }
        @keyframes signal-burst-left {
          0% { transform: rotate(-30deg) scale(0.6); opacity: 0; }
          30% { transform: rotate(-30deg) scale(1); opacity: 1; }
          100% { transform: rotate(-30deg) scale(1.6) translate(-2px, -3px); opacity: 0; }
        }
        @keyframes signal-burst-right {
          0% { transform: rotate(30deg) scale(0.6); opacity: 0; }
          30% { transform: rotate(30deg) scale(1); opacity: 1; }
          100% { transform: rotate(30deg) scale(1.6) translate(2px, -3px); opacity: 0; }
        }
        .animate-editorial-heart { animation: editorial-breath 2.2s ease-in-out infinite; transform-origin: center; overflow: visible; }
        .animate-signal-left-1 { animation: signal-burst-left 2.2s ease-out infinite; transform-origin: 7.5px 2px; transform-box: view-box; }
        .animate-signal-left-2 { animation: signal-burst-left 2.2s ease-out infinite; animation-delay: 0.3s; transform-origin: 7.5px 2px; transform-box: view-box; }
        .animate-signal-right-1 { animation: signal-burst-right 2.2s ease-out infinite; transform-origin: 24.5px 2px; transform-box: view-box; }
        .animate-signal-right-2 { animation: signal-burst-right 2.2s ease-out infinite; animation-delay: 0.3s; transform-origin: 24.5px 2px; transform-box: view-box; }

        /* 3. 매거진 큐피트 반동 화살 관통 */
        @keyframes arrow-tension {
          0%, 100% { transform: scale(1) rotate(0deg); }
          12% { transform: scale(1.28) rotate(-10deg); }
          24% { transform: scale(0.88) rotate(8deg); }
          36% { transform: scale(1.16) rotate(-5deg); }
          48% { transform: scale(0.94) rotate(3deg); }
          60% { transform: scale(1.02) rotate(-1deg); }
        }
        .animate-magazine-heart { animation: arrow-tension 1.6s cubic-bezier(0.25, 0.8, 0.25, 1) infinite; transform-origin: center; overflow: visible; }

        /* 4. 폴라로이드 퐁퐁 솟아오르는 풍선 */
        @keyframes balloon-rise-1 {
          0% { transform: translate(-4px, 12px) scale(0.3) rotate(-15deg); opacity: 0; }
          25% { opacity: 0.95; }
          100% { transform: translate(-15px, -28px) scale(0.9) rotate(20deg); opacity: 0; }
        }
        @keyframes balloon-rise-2 {
          0% { transform: translate(4px, 12px) scale(0.3) rotate(15deg); opacity: 0; }
          35% { opacity: 0.95; }
          100% { transform: translate(15px, -28px) scale(0.9) rotate(-20deg); opacity: 0; }
        }
        @keyframes vintage-breath {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.18); }
        }
        .animate-vintage-heart { animation: vintage-breath 2.4s ease-in-out infinite; transform-origin: center; overflow: visible; }
        .animate-balloon-1 { animation: balloon-rise-1 2.5s ease-in-out infinite; }
        .animate-balloon-2 { animation: balloon-rise-2 2.8s ease-in-out infinite; animation-delay: 0.9s; }

        /* 5. 포토부스 스파이럴 듀얼 댄싱 */
        @keyframes photobooth-spiral {
          0%, 100% { transform: rotate(-12deg) scale(0.95) translateY(0); }
          50% { transform: rotate(18deg) scale(1.22) translateY(-4px); filter: drop-shadow(0 0 5px rgba(244,63,94,0.6)); }
        }
        .animate-photobooth-heart { animation: photobooth-spiral 2s ease-in-out infinite; transform-origin: center; overflow: visible; }

        /* 6. 소울메이트 트랜스포밍 체인저 */
        @keyframes changer-morph {
          0%, 100% { transform: scale(0.95); fill: none; stroke: #bfdbfe; stroke-width: 2; filter: none; }
          30% { transform: scale(1.3); fill: #3b82f6; stroke: none; filter: drop-shadow(0 0 5px #bfdbfe); }
          65% { transform: scale(1.1) rotate(45deg); fill: #60a5fa; stroke: none; filter: drop-shadow(0 0 6px #93c5fd); }
        }
        .animate-soulmate-heart { animation: changer-morph 2.6s ease-in-out infinite; transform-origin: center; overflow: visible; }

        /* 7. 포레스트 바람 부는 리프 브리딩 (초록 퇴출, 로즈골드 우아함) */
        @keyframes rose-leaf-sway {
          0%, 100% { transform: rotate(-8deg) scale(0.95); }
          50% { transform: rotate(8deg) scale(1.12); filter: drop-shadow(0 0 4px rgba(244,114,182,0.45)); }
        }
        .animate-forest-heart { animation: rose-leaf-sway 2.5s ease-in-out infinite; transform-origin: center; overflow: visible; }

        /* 8. 흑백 로맨틱 인피니티 결속 */
        @keyframes bw-infinite-breath {
          0%, 100% { transform: scale(0.9) opacity: 0.65; }
          50% { transform: scale(1.18) opacity: 1; filter: drop-shadow(0 0 4px #1f2937); }
        }
        .animate-bw-heart { animation: bw-infinite-breath 2.2s ease-in-out infinite; transform-origin: center; overflow: visible; }

        /* 9. 골든프레임 로열 트윈클 엠퍼러 왕관 */
        @keyframes crown-shimmer {
          0%, 100% { filter: drop-shadow(0 0 1px #d97706); opacity: 0.7; transform: scale(1); }
          50% { filter: drop-shadow(0 0 6px #fbbf24); opacity: 1; transform: scale(1.15); }
        }
        .animate-gold-heart { animation: crown-shimmer 2.2s ease-in-out infinite; transform-origin: center; overflow: visible; }

        /* 10. 캘리그라피 꽃잎 3D 개화 */
        @keyframes floral-blossom {
          0%, 100% { transform: scale(0.82) rotate(-5deg); opacity: 0.8; }
          50% { transform: scale(1.28) rotate(6deg); opacity: 1; filter: drop-shadow(0 0 3px #e11d48); }
        }
        .animate-floral-heart { animation: floral-blossom 2.4s ease-in-out infinite; transform-origin: center; overflow: visible; }

        /* 11. 미니멀 크리스탈 섬광 스파클 */
        @keyframes pure-crystal-sparkle {
          0%, 100%, 75% { transform: scale(0.6) rotate(0deg); opacity: 0.15; }
          35% { transform: scale(1.4) rotate(90deg); opacity: 1; filter: drop-shadow(0 0 4px #888888); }
        }
        .animate-minimal-heart { animation: pure-crystal-sparkle 1.8s cubic-bezier(0.2, 0.8, 0.2, 1) infinite; transform-origin: center; overflow: visible; }

        /* 12. 파스텔 오로라 플루이드 멜팅 */
        @keyframes pastel-aurora-shift {
          0% { fill: #f472b6; filter: drop-shadow(0 0 5px #f472b6); transform: scale(1) rotate(0deg); }
          25% { fill: #fb7185; filter: drop-shadow(0 0 5px #fb7185); transform: scale(1.1) rotate(4deg); }
          50% { fill: #c084fc; filter: drop-shadow(0 0 5px #c084fc); transform: scale(0.95) rotate(-4deg); }
          75% { fill: #60a5fa; filter: drop-shadow(0 0 5px #60a5fa); transform: scale(1.08) rotate(3deg); }
          100% { fill: #f472b6; filter: drop-shadow(0 0 5px #f472b6); transform: scale(1) rotate(0deg); }
        }
        .animate-pastel-heart { animation: pastel-aurora-shift 4.5s ease-in-out infinite; transform-origin: center; overflow: visible; }

        /* 🚀 [추가 특별 모션] 신랑쪽에서 신부쪽으로 날아가는 꼬마 사랑 메신저 모션 */
        @keyframes courier-fly-1 {
          0% { transform: translate(-36px, 6px) scale(0.2); opacity: 0; }
          12% { opacity: 0.95; }
          50% { transform: translate(0px, -18px) scale(0.9); }
          88% { opacity: 0.95; }
          100% { transform: translate(36px, 6px) scale(0.2); opacity: 0; }
        }
        @keyframes courier-fly-2 {
          0% { transform: translate(-32px, -2px) scale(0.15); opacity: 0; }
          18% { opacity: 0.9; }
          55% { transform: translate(4px, -22px) scale(0.75); }
          82% { opacity: 0.9; }
          100% { transform: translate(32px, 4px) scale(0.15); opacity: 0; }
        }
        .courier-micro-heart-1 {
          position: absolute;
          animation: courier-fly-1 3.2s ease-in-out infinite;
          color: #f43f5e;
          pointer-events: none;
          font-size: 8px;
          line-height: 1;
          z-index: 10;
        }
        .courier-micro-heart-2 {
          position: absolute;
          animation: courier-fly-2 3.6s ease-in-out infinite;
          animation-delay: 1.6s;
          color: #ec4899;
          pointer-events: none;
          font-size: 7px;
          line-height: 1;
          z-index: 10;
        }
      `;

  // ── 12개 템플릿별로 형태(Shape)가 확실하고 대칭이 잘 맞는 진짜 하트 SVG 렌더러 (잘림 완전 차단) ──
  const renderTemplateHeart = () => {
    const svgClass = "w-[18px] h-[18px] overflow-visible select-none";

    const microHearts = (
      <>
        <span className="courier-micro-heart-1">❤️</span>
        <span className="courier-micro-heart-2">💗</span>
      </>
    );

    if (templateId === 'classic-arch') {
      return (
        <span className="relative flex items-center justify-center shrink-0 w-5 h-5 overflow-visible">
          {microHearts}
          <svg viewBox="0 0 32 32" className={`absolute ${svgClass} animate-classic-wave`} fill="none">
            <path d="M16 26.5L13.8 24.5C6.5 17.8 2 13.8 2 9C2 5 5 2 9 2C11.5 2 13.9 3.3 16 5.3C18.1 3.3 20.5 2 23 2C27 2 30 5 30 9C30 13.8 25.5 17.8 18.2 24.5L16 26.5Z" stroke="#c9a882" strokeWidth="1.5" opacity="0.6" />
          </svg>
          <svg viewBox="0 0 32 32" className={`${svgClass} animate-classic-heart`} fill="#c9a882">
            <path d="M16 26.5L13.8 24.5C6.5 17.8 2 13.8 2 9C2 5 5 2 9 2C11.5 2 13.9 3.3 16 5.3C18.1 3.3 20.5 2 23 2C27 2 30 5 30 9C30 13.8 25.5 17.8 18.2 24.5L16 26.5Z" />
          </svg>
        </span>
      );
    }
    if (templateId === 'editorial-journal') {
      return (
        <span className="relative flex items-center justify-center shrink-0 w-5 h-5 overflow-visible">
          {microHearts}
          <svg viewBox="0 0 32 32" className={svgClass} fill="none" stroke="#9a8a7a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" overflow="visible">
            {/* 하트 왼쪽 머리 파동 (좌측 끝단으로 이동) */}
            <path d="M 1 0 Q 4.5 -2.5 8 0" className="animate-signal-left-1" stroke="#fb7185" strokeWidth="1.8" />
            <path d="M -1 -2 Q 4.5 -5.5 10 -2" className="animate-signal-left-2" stroke="#fb7185" strokeWidth="1.8" />
            {/* 하트 오른쪽 머리 파동 (우측 끝단으로 이동) */}
            <path d="M 24 0 Q 27.5 -2.5 31 0" className="animate-signal-right-1" stroke="#fb7185" strokeWidth="1.8" />
            <path d="M 22 -2 Q 27.5 -5.5 33 -2" className="animate-signal-right-2" stroke="#fb7185" strokeWidth="1.8" />
            {/* 메인 라인 하트 */}
            <path d="M16 27.5L13.8 25.5C6.5 18.8 2 14.8 2 10C2 6 5 3 9 3C11.5 3 13.9 4.3 16 6.3C18.1 4.3 20.5 3 23 3C27 3 30 6 30 10C30 14.8 25.5 18.8 18.2 25.5L16 27.5Z" className="animate-editorial-heart" />
          </svg>
        </span>
      );
    }
    if (templateId === 'magazine-torn') {
      return (
        <span className="relative flex items-center justify-center shrink-0 w-5 h-5 overflow-visible">
          {microHearts}
          <svg viewBox="0 0 32 32" className={`${svgClass} animate-magazine-heart`} fill="none" strokeLinecap="round" strokeLinejoin="round">
            {/* 화살촉 (하트 뒷면 관통) */}
            <path d="M16 16 L29 3" stroke="#ffffff" strokeWidth="2.5" />
            <path d="M16 16 L29 3" stroke="#2a2a2a" strokeWidth="1.2" />
            <path d="M29 3 L24 3 M29 3 L29 8" stroke="#2a2a2a" strokeWidth="2" />
            {/* 메인 하트 */}
            <path d="M16 26.5L13.8 24.5C6.5 17.8 2 13.8 2 9C2 5 5 2 9 2C11.5 2 13.9 3.3 16 5.3C18.1 3.3 20.5 2 23 2C27 2 30 5 30 9C30 13.8 25.5 17.8 18.2 24.5L16 26.5Z" fill="#ff4757" />
            {/* 화살 깃 (하트 앞면 꽂힘) */}
            <path d="M3 29 L11 21" stroke="#ffffff" strokeWidth="2.5" />
            <path d="M3 29 L11 21" stroke="#2a2a2a" strokeWidth="1.2" />
            <path d="M3 29 L6 26 M3 29 L2 26 M5 28 L4 25" stroke="#2a2a2a" strokeWidth="1.5" />
          </svg>
        </span>
      );
    }
    if (templateId === 'polaroid-vintage') {
      return (
        <span className="relative flex items-center justify-center shrink-0 w-5 h-5 overflow-visible">
          {microHearts}
          <span className="absolute animate-balloon-1 pointer-events-none select-none text-[8px]">💖</span>
          <span className="absolute animate-balloon-2 pointer-events-none select-none text-[7px]">💗</span>
          <svg viewBox="0 0 32 32" className={`${svgClass} animate-vintage-heart`} fill="#fbcfe8" stroke="#f43f5e" strokeWidth="1.5">
            <path d="M16 26.5L13.8 24.5C6.5 17.8 2 13.8 2 9C2 5 5 2 9 2C11.5 2 13.9 3.3 16 5.3C18.1 3.3 20.5 2 23 2C27 2 30 5 30 9C30 13.8 25.5 17.8 18.2 24.5L16 26.5Z" />
          </svg>
        </span>
      );
    }
    if (templateId === 'photobooth') {
      return (
        <span className="relative flex items-center justify-center shrink-0 w-5 h-5 overflow-visible">
          {microHearts}
          <svg viewBox="0 0 32 32" className={`${svgClass} animate-photobooth-heart`} fill="#fda4af">
            <path d="M14 24L12 22.2C5.5 16.3 1.5 12.7 1.5 8.5C1.5 5 4 2.5 7.5 2.5C9.7 2.5 11.8 3.7 13 5.5C14.2 3.7 16.3 2.5 18.5 2.5C22 2.5 24.5 5 24.5 8.5C24.5 12.7 20.5 16.3 14 22.2L14 24Z" />
            <path d="M22 29L20.5 27.6C15.6 23 12.5 20.2 12.5 17C12.5 14.3 14.4 12.4 17.1 12.4C18.8 12.4 20.4 13.3 21.3 14.7C22.2 13.3 23.8 12.4 25.5 12.4C28.2 12.4 30.1 14.3 30.1 17C30.1 20.2 27 23 22.1 27.6L22 29Z" fill="#fb7185" opacity="0.85" />
          </svg>
        </span>
      );
    }
    if (templateId === 'soulmate-oval') {
      return (
        <span className="relative flex items-center justify-center shrink-0 w-5 h-5 overflow-visible">
          {microHearts}
          <svg viewBox="0 0 32 32" className={`${svgClass} animate-soulmate-heart`}>
            <path d="M16 26.5L13.8 24.5C6.5 17.8 2 13.8 2 9C2 5 5 2 9 2C11.5 2 13.9 3.3 16 5.3C18.1 3.3 20.5 2 23 2C27 2 30 5 30 9C30 13.8 25.5 17.8 18.2 24.5L16 26.5Z" />
          </svg>
        </span>
      );
    }
    if (templateId === 'forest-classic') {
      return (
        <span className="relative flex items-center justify-center shrink-0 w-5 h-5 overflow-visible">
          {microHearts}
          <svg viewBox="0 0 32 32" className={`${svgClass} animate-forest-heart`} fill="none" stroke="#f472b6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 26.5L13.8 24.5C6.5 17.8 2 13.8 2 9C2 5 5 2 9 2C11.5 2 13.9 3.3 16 5.3C18.1 3.3 20.5 2 23 2C27 2 30 5 30 9C30 13.8 25.5 17.8 18.2 24.5L16 26.5Z" fill="#fce7f3" />
          </svg>
        </span>
      );
    }
    if (templateId === 'bw-romantic') {
      return (
        <span className="relative flex items-center justify-center shrink-0 w-5 h-5 overflow-visible">
          {microHearts}
          <svg viewBox="0 0 32 32" className={`${svgClass} animate-bw-heart`} fill="none">
            <path d="M16 26.5L13.8 24.5C6.5 17.8 2 13.8 2 9C2 5 5 2 9 2C11.5 2 13.9 3.3 16 5.3C18.1 3.3 20.5 2 23 2C27 2 30 5 30 9C30 13.8 25.5 17.8 18.2 24.5L16 26.5Z" fill="#374151" stroke="#4b5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      );
    }
    if (templateId === 'golden-frame') {
      return (
        <span className="relative flex items-center justify-center shrink-0 w-5 h-5 overflow-visible">
          {microHearts}
          <svg viewBox="0 0 32 32" className={`${svgClass} animate-gold-heart`} fill="#fef08a" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 27.5L13.8 25.5C6.5 18.8 2 14.8 2 10C2 6 5 3 9 3C11.5 3 13.9 4.3 16 6.3C18.1 4.3 20.5 3 23 3C27 3 30 6 30 10C30 14.8 25.5 18.8 18.2 25.5L16 27.5Z" />
            <path d="M11 6 L13 10 L16 5 L19 10 L21 6 L23 12 L9 12 Z" fill="#d97706" stroke="none" />
            <circle cx="11" cy="5" r="1" fill="#ffffff" />
            <circle cx="16" cy="4" r="1" fill="#ffffff" />
            <circle cx="21" cy="5" r="1" fill="#ffffff" />
          </svg>
        </span>
      );
    }
    if (templateId === 'calligraphy-floral') {
      return (
        <span className="relative flex items-center justify-center shrink-0 w-5 h-5 overflow-visible">
          {microHearts}
          <svg viewBox="0 0 32 32" className={`${svgClass} animate-floral-heart`} fill="none">
            <path d="M16 24.5L14.2 22.8C8.2 17.3 4.5 14 4.5 10C4.5 6.5 7 4 10.5 4C12.5 4 14.5 5.2 16 7C17.5 5.2 19.5 4 21.5 4C25 4 27.5 6.5 27.5 10C27.5 14 23.8 17.3 17.8 22.8L16 24.5Z" fill="#ffe4e6" stroke="#e11d48" strokeWidth="1" />
            <circle cx="16" cy="8" r="3.5" fill="#fecdd3" opacity="0.85" />
            <circle cx="11" cy="13" r="3.5" fill="#fecdd3" opacity="0.85" />
            <circle cx="21" cy="13" r="3.5" fill="#fecdd3" opacity="0.85" />
            <circle cx="13" cy="19" r="3.5" fill="#fecdd3" opacity="0.85" />
            <circle cx="19" cy="19" r="3.5" fill="#fecdd3" opacity="0.85" />
            <circle cx="16" cy="13" r="1.5" fill="#e11d48" />
          </svg>
        </span>
      );
    }
    if (templateId === 'minimal-pure') {
      return (
        <span className="relative flex items-center justify-center shrink-0 w-5 h-5 overflow-visible">
          {microHearts}
          <svg viewBox="0 0 32 32" className={`${svgClass} animate-minimal-heart`} fill="none" stroke="#737373" strokeWidth="1.8">
            <path d="M16 26.5L13.8 24.5C6.5 17.8 2 13.8 2 9C2 5 5 2 9 2C11.5 2 13.9 3.3 16 5.3C18.1 3.3 20.5 2 23 2C27 2 30 5 30 9C30 13.8 25.5 17.8 18.2 24.5L16 26.5Z" fill="#f5f5f5" />
            <path d="M16 7 L18 11.5 L22.5 12 L18 13.5 L16 18 L14 13.5 L9.5 12 L14 11.5 Z" fill="#737373" stroke="none" />
          </svg>
        </span>
      );
    }
    if (templateId === 'pastel-photostrip') {
      return (
        <span className="relative flex items-center justify-center shrink-0 w-5 h-5 overflow-visible">
          {microHearts}
          <svg viewBox="0 0 32 32" className={`${svgClass} animate-pastel-heart`}>
            <path d="M16 28C14.5 28 13 27.2 11.8 26C5.5 19.8 1.5 15.8 1.5 11C1.5 6.5 5 3 9.5 3C11.8 3 14 4.3 16 6.3C18 4.3 20.2 3 22.5 3C27 3 30.5 6.5 30.5 11C30.5 15.8 26.5 19.8 20.2 26C19 27.2 17.5 28 16 28Z" />
          </svg>
        </span>
      );
    }
    return null;
  };

  switch (section.type) {
    case 'cover': {
      const layout = section.layout || 'full';
      const textColor = section.textColor || st.color;

      return (
        <div className="s s-main relative overflow-hidden" style={{ ...st, color: textColor }}>
          <style dangerouslySetInnerHTML={{ __html: HEART_STYLES }} />
          {layout === 'full' && (
            <>
              <div className="main-photo-wrap relative w-full overflow-hidden">
                {(section.mobileImage || section.image) ? (
                  <div className="relative">
                    <img
                      src={section.mobileImage || section.image}
                      alt="Cover"
                      className="w-full aspect-square object-cover block"
                    />
                    {section.overlayOpacity !== undefined && (
                      <div
                        className="absolute inset-0 bg-black transition-opacity duration-300"
                        style={{ opacity: Math.min(section.overlayOpacity, 90) / 100 }}
                      />
                    )}
                    <MainImageEffect type={theme?.mainImageEffect || 'none'} loop={theme?.mainImageEffectLoop} />
                  </div>
                ) : (
                  <div className="w-full aspect-square flex items-center justify-center text-stone-300 bg-stone-50 relative">
                    <ImageIcon size={48} strokeWidth={1} />
                    <MainImageEffect type={theme?.mainImageEffect || 'none'} loop={theme?.mainImageEffectLoop} />
                  </div>
                )}
              </div>

              <div
                className="main-text-wrap relative px-10 py-20 flex flex-col items-center gap-8"
                style={{
                  marginTop: section.vPosition ? `${(section.vPosition - 50) * 2}px` : 0
                }}
              >
                {section.title && <h1 className="text-[32px] font-serif leading-tight whitespace-pre-line tracking-tight text-center">{section.title}</h1>}
                {section.subtitle && <p className="text-[14px] font-medium tracking-[0.2em] uppercase opacity-60">{section.subtitle}</p>}

                <div className="flex flex-col items-center gap-3">
                  <div className="relative flex items-center justify-center gap-6 text-[20px] font-serif">
                    <span>{section.groom}</span>
                    {renderTemplateHeart()}
                    <span>{section.bride}</span>
                  </div>
                  <div className="text-[13px] font-medium opacity-50 tracking-widest">{section.date} {section.time}</div>
                  <div className="text-[13px] font-medium opacity-50 tracking-widest mt-1">{section.venue}</div>
                </div>
              </div>
            </>
          )}

          {layout === 'split' && (
            <div className="flex flex-col items-center pt-24 pb-20 px-8 gap-12">
              <div className="flex flex-col items-center gap-4">
                {section.subtitle && <span className="text-[12px] font-black tracking-[0.3em] text-stone-300 uppercase">{section.subtitle}</span>}
                {section.title && <h1 className="text-[36px] font-serif text-center leading-tight tracking-tighter">{section.title}</h1>}
              </div>

              <div className="w-full aspect-[4/5] rounded-[4rem] overflow-hidden shadow-2xl relative">
                {(section.mobileImage || section.image) ? (
                  <>
                    <img src={section.mobileImage || section.image} className="w-full h-full object-cover" alt="Cover" />
                    <MainImageEffect type={theme?.mainImageEffect || 'none'} loop={theme?.mainImageEffectLoop} opacity={theme?.mainImageEffectOpacity} />
                  </>
                ) : (
                  <div className="w-full h-full bg-stone-50 flex items-center justify-center relative">
                    <ImageIcon size={48} className="text-stone-200" />
                    <MainImageEffect type={theme?.mainImageEffect || 'none'} loop={theme?.mainImageEffectLoop} opacity={theme?.mainImageEffectOpacity} />
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center gap-6">
                <div className="relative flex items-center justify-center gap-6 text-[22px] font-serif">
                  <span>{section.groom}</span>
                  {renderTemplateHeart()}
                  <span>{section.bride}</span>
                </div>
                <div className="flex flex-col items-center gap-1.5 text-[14px] text-stone-400 font-medium">
                  <span>{section.date} {section.time}</span>
                  <span>{section.venue}</span>
                </div>
              </div>
            </div>
          )}

          {layout === 'minimal' && (
            <div className="flex flex-col items-center pt-32 pb-24 px-10 gap-16">
              <div className="flex flex-col items-center gap-10">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-[1px] bg-stone-200 mb-2" />
                  <span className="text-[13px] font-serif italic text-stone-400">{section.subtitle || 'Invitation'}</span>
                </div>
                <h1 className="text-[42px] font-serif text-center leading-none tracking-tight break-keep">{section.title}</h1>
              </div>

              <div className="w-full flex flex-col items-center gap-12">
                <div className="w-32 h-32 rounded-full overflow-hidden border-8 border-stone-50 shadow-sm">
                  {section.image2 ? (
                    <img src={section.image2} className="w-full h-full object-cover" alt="Sub" />
                  ) : (
                    <div className="w-full h-full bg-stone-100 flex items-center justify-center"><User size={40} className="text-stone-200" /></div>
                  )}
                </div>

                <div className="w-full flex flex-col items-center gap-8">
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative flex items-center justify-center gap-6 text-[18px] font-serif">
                      <span>{section.groom}</span>
                      {renderTemplateHeart()}
                      <span>{section.bride}</span>
                    </div>
                    <div className="w-12 h-[1px] bg-stone-100 my-2" />
                    <span className="text-[14px] text-stone-400 tracking-widest">{section.date} {section.time}</span>
                    <span className="text-[13px] text-stone-300 mt-1">{section.venue}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {layout === 'classic-arch' && (
            <div className="flex flex-col items-center pt-12 pb-16 px-6 gap-8 bg-[#fdf8f5] min-h-[600px] w-full">
              {/* Arch photo */}
              <div className="relative w-[80%] mx-auto">
                {(section.mobileImage || section.image) ? (
                  <div className="relative overflow-hidden" style={{ borderRadius: '50% 50% 0 0 / 60% 60% 0 0' }}>
                    <img
                      src={section.mobileImage || section.image}
                      alt="Cover"
                      className="w-full aspect-[3/4] object-cover block shadow-lg"
                    />
                    {section.overlayOpacity !== undefined && (
                      <div
                        className="absolute inset-0 bg-black transition-opacity duration-300"
                        style={{ opacity: Math.min(section.overlayOpacity, 90) / 100 }}
                      />
                    )}
                    <MainImageEffect type={theme?.mainImageEffect || 'none'} loop={theme?.mainImageEffectLoop} />
                  </div>
                ) : (
                  <div
                    className="w-full aspect-[3/4] bg-stone-100 flex items-center justify-center text-stone-300 relative"
                    style={{
                      borderRadius: '50% 50% 0 0 / 60% 60% 0 0',
                    }}
                  >
                    <ImageIcon size={40} />
                    <MainImageEffect type={theme?.mainImageEffect || 'none'} loop={theme?.mainImageEffectLoop} />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-col items-center mt-4 px-4 text-center gap-2">
                <div className="relative flex items-center justify-center gap-6 text-[15px] font-serif text-[#7a6655] font-semibold tracking-wide">
                  <span style={{ fontSize: section.groomSize ? `${section.groomSize}rem` : undefined }}>{section.groom}</span>
                  {renderTemplateHeart()}
                  <span style={{ fontSize: section.brideSize ? `${section.brideSize}rem` : undefined }}>{section.bride}</span>
                </div>
                <p className="text-[11px] text-[#b09080] font-serif tracking-widest mt-1" style={{ fontSize: section.dateSize ? `${section.dateSize}rem` : undefined }}>
                  {section.date} {section.time}
                </p>
                <p className="text-[11px] text-[#b09080] font-serif tracking-wide opacity-80">
                  {section.venue}
                </p>
              </div>
            </div>
          )}

          {layout === 'editorial-journal' && (
            <div className="flex flex-col pt-10 pb-16 px-6 gap-6 bg-[#f7f3ee] min-h-[600px] w-full">
              <p
                className="text-center text-[10px] tracking-[0.25em] font-serif font-black text-[#8a7a6a]"
                style={{ fontSize: section.subtitleSize ? `${section.subtitleSize}rem` : undefined }}
              >
                {section.subtitle || 'SAVE THE DATE'}
              </p>

              <div className="mx-2 shadow-xl border-[6px] border-white/60 rounded-sm overflow-hidden aspect-[4/5] relative">
                {(section.mobileImage || section.image) ? (
                  <>
                    <img
                      src={section.mobileImage || section.image}
                      className="w-full h-full object-cover block"
                      alt="Cover"
                    />
                    {section.overlayOpacity !== undefined && (
                      <div
                        className="absolute inset-0 bg-black transition-opacity duration-300"
                        style={{ opacity: Math.min(section.overlayOpacity, 90) / 100 }}
                      />
                    )}
                    <MainImageEffect type={theme?.mainImageEffect || 'none'} loop={theme?.mainImageEffectLoop} />
                  </>
                ) : (
                  <div className="w-full h-full bg-stone-100 flex items-center justify-center text-stone-200 relative">
                    <ImageIcon size={40} />
                    <MainImageEffect type={theme?.mainImageEffect || 'none'} loop={theme?.mainImageEffectLoop} />
                  </div>
                )}
              </div>

              <p
                className="text-center text-[11px] italic font-serif text-[#9a8a7a] mt-2 tracking-wide"
                style={{ fontSize: section.titleSize ? `${section.titleSize}rem` : undefined }}
              >
                {section.title || '— a story written in love —'}
              </p>

              <div
                className="flex flex-col items-center gap-2 mt-4"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                <div className="relative flex items-center justify-center gap-6 text-[15px] text-[#4a3a2a] font-serif font-semibold">
                  <span style={{ fontSize: section.groomSize ? `${section.groomSize}rem` : undefined }}>{section.groom}</span>
                  {renderTemplateHeart()}
                  <span style={{ fontSize: section.brideSize ? `${section.brideSize}rem` : undefined }}>{section.bride}</span>
                </div>
                <p className="text-[11px] text-[#8a7a6a] tracking-widest mt-1">
                  {section.date} {section.time}
                </p>
                <p className="text-[11px] text-[#8a7a6a] tracking-wide opacity-85">
                  {section.venue}
                </p>
              </div>
            </div>
          )}

          {/* 공통 추가 이미지 (기존 로직 보존) */}
          {layout === 'full' && section.image2 && (
            <div className="px-6 py-12">
              <div className="w-full aspect-[4/5] rounded-[2rem] overflow-hidden shadow-lg">
                <img src={section.image2} className="w-full h-full object-cover" alt="Sub Cover" />
              </div>
            </div>
          )}
        </div>
      );
    }
    case 'greeting': {
      const align = (section as any).textAlign || (section as any).align || 'center';

      return (
        <div
          className="px-8 py-16 flex flex-col gap-8 items-center"
          style={{
            ...st,
            backgroundColor: (theme?.pattern && theme.pattern !== 'none') ? 'transparent' : (section.useBackgroundColor ? '#F9FAFB' : st.backgroundColor)
          }}
        >
          <SectionHeader
            title={section.title || '소중한 분들을 초대합니다'}
            englishLabel="GREETING"
            fontScale={fontScale}
            textColor={st.color}
            align={align as any}
          />
          {section.subtitle && (
            <p className="text-[13px] font-medium text-center -mt-6 max-w-[280px] opacity-70" style={{ fontSize: `${13 * fontScale}px`, color: st.color || 'inherit' }}>{section.subtitle}</p>
          )}

          {section.image && (
            <div className="w-full aspect-[4/5] rounded-[3rem] overflow-hidden shadow-sm my-4">
              <img src={section.image} className="w-full h-full object-cover" alt="Greeting" />
            </div>
          )}

          <div className="flex flex-col gap-8 w-full">
            <p className={`whitespace-pre-line text-[16px] leading-[2.2] font-medium tracking-tight ${getAnimClass()} ${align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center'}`} style={{ color: st.color || 'inherit' }}>
              {section.text || '살아가다 문득 뒤돌아보았을 때\n가장 먼저 떠오르는 사람이\n서로이길 바라는 마음으로\n저희 두 사람이 사랑의 서약을 하려 합니다.'}
            </p>

            {(section.groomParents || section.brideParents) && (
              <div className="flex flex-col gap-3 pt-8 border-t border-stone-200/20">
                {section.groomParents && (
                  <div className="text-[14px] font-serif" style={{ color: st.color || 'inherit' }}>
                    {section.groomParents}
                  </div>
                )}
                {section.brideParents && (
                  <div className="text-[14px] font-serif" style={{ color: st.color || 'inherit' }}>
                    {section.brideParents}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    case 'gallery': {
      const images = section.images || [];
      // magazine-torn 템플릿의 경우 3열 그리드가 기본으로 표현되도록 동적 폴백 적용
      const layout = theme.id === 'magazine-torn-theme' ? (section.layout === 'masonry' ? 'grid' : (section.layout || 'grid')) : (section.layout || 'grid');
      const columns = theme.id === 'magazine-torn-theme' ? 3 : (section.columns || 3);

      const getImgUrl = (img: any) => typeof img === 'string' ? img : img?.url || '';

      const renderGalleryContent = () => {
        if (images.length === 0) {
          return (
            <div className="grid grid-cols-3 gap-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-square bg-stone-50 rounded-lg flex items-center justify-center border border-stone-100">
                  <Camera size={20} className="text-stone-200" />
                </div>
              ))}
            </div>
          );
        }

        switch (layout) {
          case 'slideshow': {
            return <BgmSlideshowWidget images={images} getImgUrl={getImgUrl} />;
          }

          case 'masonry': {
            const leftCol = images.filter((_, i) => i % 2 === 0);
            const rightCol = images.filter((_, i) => i % 2 !== 0);
            return (
              <div className="grid grid-cols-2 gap-3 px-1">
                <div className="flex flex-col gap-3">
                  {leftCol.map((img, i) => (
                    <div key={i} className="rounded-2xl overflow-hidden border border-stone-100 shadow-sm bg-white hover:scale-[1.01] transition-transform">
                      <img src={getImgUrl(img)} className="w-full h-auto object-cover" alt={`Masonry Left ${i}`} />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-3 mt-4">
                  {rightCol.map((img, i) => (
                    <div key={i} className="rounded-2xl overflow-hidden border border-stone-100 shadow-sm bg-white hover:scale-[1.01] transition-transform">
                      <img src={getImgUrl(img)} className="w-full h-auto object-cover" alt={`Masonry Right ${i}`} />
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          case 'polaroid': {
            return (
              <div className="flex flex-col gap-6 px-4">
                {images.map((img, i) => (
                  <div key={i} className="bg-white p-3.5 pb-8 rounded-sm shadow-md border border-stone-100 flex flex-col gap-3 rotate-[1deg] odd:-rotate-[1.5deg] hover:rotate-0 transition-transform">
                    <div className="mx-auto w-2 h-2 rounded-full bg-stone-300 shadow-inner -mb-1" />
                    <div className="w-full aspect-[4/5] bg-stone-50 overflow-hidden border border-stone-100/50">
                      <img src={getImgUrl(img)} className="w-full h-full object-cover" alt={`Polaroid ${i}`} />
                    </div>
                    <div className="text-center font-serif text-[11px] text-stone-400 italic">
                      {img.caption || `sweet memory #${i + 1}`}
                    </div>
                  </div>
                ))}
              </div>
            );
          }

          case 'inline': {
            return (
              <div className="flex flex-col gap-4">
                {images.map((img, i) => (
                  <div key={i} className="w-full aspect-[3/4] bg-stone-50 rounded-2xl overflow-hidden border border-stone-100 shadow-sm relative group">
                    <img src={getImgUrl(img)} className="w-full h-full object-cover" alt={`Inline ${i}`} />
                    {img.caption && (
                      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent text-white text-[12px] font-bold">
                        {img.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          }

          case 'carousel': {
            return <BgmCarouselWidget images={images} getImgUrl={getImgUrl} />;
          }

          case 'grid':
          default: {
            return (
              <div className={`grid gap-2 ${columns === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                {images.map((img, i) => (
                  <div key={i} className="aspect-square bg-stone-50 rounded-lg overflow-hidden border border-stone-100 hover:scale-[1.02] transition-transform">
                    <img src={getImgUrl(img)} className="w-full h-full object-cover" alt={`Grid ${i}`} />
                  </div>
                ))}
              </div>
            );
          }
        }
      };

      const align = (section as any).textAlign || (section as any).align || 'center';

      return (
        <div className={`px-4 py-14`} style={st}>
          <SectionHeader
            title={section.title || '우리들의 아름다운 순간'}
            englishLabel="GALLERY"
            fontScale={fontScale}
            textColor={st.color}
            align={align as any}
          />
          <div className="mt-6">
            {renderGalleryContent()}
          </div>
        </div>
      );
    }

    case 'map':
      const address = section.address || '서울 강남구 테헤란로 123';
      const encodedAddress = encodeURIComponent(address);
      const mapType = (section as any).mapType || (section as any).provider || 'naver';

      const mapLinks = {
        naver: `https://map.naver.com/v5/search/${encodedAddress}`,
        kakao: `https://map.kakao.com/link/search/${encodedAddress}`,
        google: `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`
      };

      const currentMapLink = mapLinks[mapType as keyof typeof mapLinks] || mapLinks.naver;
      const currentMapLabel = mapType === 'naver' ? '네이버 지도' : mapType === 'kakao' ? '카카오 맵' : '구글 맵';
      const align = (section as any).textAlign || (section as any).align || 'center';

      return (
        <div className="px-6 py-16" style={{ ...st, backgroundColor: (theme?.pattern && theme.pattern !== 'none') ? 'transparent' : (section.useBackgroundColor ? '#F9FAFB' : st.backgroundColor) }}>
          <SectionHeader
            title={section.title || '오시는 길'}
            englishLabel="LOCATION"
            fontScale={fontScale}
            textColor={st.color}
            align={align as any}
          />

          {section.showMap !== false && (
            <div className="w-full h-[240px] bg-stone-100 rounded-[2.5rem] mb-8 overflow-hidden border border-stone-200 relative shadow-inner">
              {(section as any).useMapApi === false && (section as any).mapImage ? (
                <img src={(section as any).mapImage} className="w-full h-full object-cover" alt="약도" />
              ) : (
                <div className="relative w-full h-full">
                  <iframe
                    title="wedding-location"
                    width="100%"
                    height="100%"
                    style={{
                      border: 0,
                      filter: mapType === 'kakao'
                        ? 'sepia(30%) hue-rotate(15deg) saturate(110%) contrast(95%)'
                        : mapType === 'naver'
                          ? 'hue-rotate(-15deg) saturate(95%) contrast(98%)'
                          : 'none'
                    }}
                    src={`https://maps.google.com/maps?q=${encodedAddress}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
                    allowFullScreen
                    loading="lazy"
                  />

                  {/* 중앙 브랜드 정밀 마커 핀 오버레이 (둥실둥실 애니메이션) */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10">
                    <div className="flex flex-col items-center -mt-6 animate-bounce" style={{ animationDuration: '2s' }}>
                      {mapType === 'kakao' ? (
                        <div className="flex flex-col items-center">
                          <div className="px-3 py-1.5 bg-[#FFEB00] text-[#3C1E1E] text-[10px] font-black rounded-xl shadow-lg border border-[#E2C900] flex items-center gap-1.5">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 shrink-0">
                              <path d="M12 3c-5.52 0-10 3.73-10 8.33 0 2.97 1.84 5.58 4.67 7.02l-.93 3.4c-.08.31.23.57.51.41l4.08-2.4c.54.06 1.09.09 1.67.09 5.52 0 10-3.73 10-8.33s-4.48-8.33-10-8.33z" />
                            </svg>
                            <span>Kakao Map</span>
                          </div>
                          <div className="w-2.5 h-2.5 bg-[#FFEB00] border-r border-b border-[#E2C900] rotate-45 -mt-1.5 shadow-sm" />
                        </div>
                      ) : mapType === 'naver' ? (
                        <div className="flex flex-col items-center">
                          <div className="px-3 py-1.5 bg-[#03C75A] text-white text-[10px] font-black rounded-xl shadow-lg border border-[#02a048] flex items-center gap-1.5">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 shrink-0">
                              <path d="M16.2 3H20v18h-3.8l-8.4-12V21H4V3h3.8l8.4 12V3z" />
                            </svg>
                            <span>Naver Map</span>
                          </div>
                          <div className="w-2.5 h-2.5 bg-[#03C75A] border-r border-b border-[#02a048] rotate-45 -mt-1.5 shadow-sm" />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <div className="px-3 py-1.5 bg-[#EA4335] text-white text-[10px] font-black rounded-xl shadow-lg border border-[#c5372b] flex items-center gap-1.5">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 shrink-0">
                              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                            </svg>
                            <span>Google Map</span>
                          </div>
                          <div className="w-2.5 h-2.5 bg-[#EA4335] border-r border-b border-[#c5372b] rotate-45 -mt-1.5 shadow-sm" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 좌측 상단 브랜드 전용 아웃링크 버튼 (구글 기본 버튼 완전히 스마트하게 오버레이 커버) */}
                  <a
                    href={currentMapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`absolute top-3 left-3 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[10.5px] font-black shadow-md border transition-all z-20 cursor-pointer ${mapType === 'naver'
                      ? 'bg-[#03C75A] text-white border-[#02a048] hover:bg-[#028b3d]'
                      : mapType === 'kakao'
                        ? 'bg-[#FFEB00] text-[#3C1E1E] border-[#E2C900] hover:bg-[#ebd800]'
                        : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                      }`}
                  >
                    {mapType === 'naver' ? (
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 shrink-0">
                        <path d="M16.2 3H20v18h-3.8l-8.4-12V21H4V3h3.8l8.4 12V3z" />
                      </svg>
                    ) : mapType === 'kakao' ? (
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 shrink-0">
                        <path d="M12 3c-5.52 0-10 3.73-10 8.33 0 2.97 1.84 5.58 4.67 7.02l-.93 3.4c-.08.31.23.57.51.41l4.08-2.4c.54.06 1.09.09 1.67.09 5.52 0 10-3.73 10-8.33s-4.48-8.33-10-8.33z" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-[#EA4335] shrink-0">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                      </svg>
                    )}
                    <span>{currentMapLabel} 앱으로 열기</span>
                  </a>
                </div>
              )}
            </div>
          )}

          <div className="text-center px-4">
            <h4 className="text-[20px] font-bold mb-3 tracking-tight" style={{ color: st.color || 'inherit' }}>
              {section.venue || '예식장 이름을 입력하세요'}
            </h4>
            <p className="text-[14px] leading-relaxed mb-10 break-keep opacity-75" style={{ color: st.color || 'inherit' }}>
              {section.address || '주소를 입력하세요'}
              {section.detailAddress && <><br />{section.detailAddress}</>}
            </p>

            {(section as any).showNavButtons !== false && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {(section as any).showNaverMap !== false && (
                  <a
                    href={`https://map.naver.com/v5/search/${encodeURIComponent(section.address || '서울 강남구 테헤란로 123')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 py-3 px-1 bg-stone-50 border border-stone-100 rounded-xl text-[10px] font-bold text-stone-600 hover:bg-stone-100 transition-all cursor-pointer whitespace-nowrap overflow-hidden shrink-0"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-[#03C75A] shrink-0">
                      <path d="M16.2 3H20v18h-3.8l-8.4-12V21H4V3h3.8l8.4 12V3z" />
                    </svg>
                    <span className="truncate">네이버</span>
                  </a>
                )}
                {(section as any).showKakaoMap !== false && (
                  <a
                    href={`https://map.kakao.com/link/search/${encodeURIComponent(section.address || '서울 강남구 테헤란로 123')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 py-3 px-1 bg-stone-50 border border-stone-100 rounded-xl text-[9px] sm:text-[11px] font-bold text-stone-600 hover:bg-stone-100 transition-all cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis shrink-0"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-[#3C1E1E] shrink-0">
                      <path d="M12 3c-5.52 0-10 3.73-10 8.33 0 2.97 1.84 5.58 4.67 7.02l-.93 3.4c-.08.31.23.57.51.41l4.08-2.4c.54.06 1.09.09 1.67.09 5.52 0 10-3.73 10-8.33s-4.48-8.33-10-8.33z" />
                    </svg>
                    <span className="truncate text-[10px]">카카오</span>
                  </a>
                )}
                {(section as any).showGoogleMap !== false && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(section.address || '서울 강남구 테헤란로 123')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 py-3 px-1 bg-stone-50 border border-stone-100 rounded-xl text-[9px] sm:text-[11px] font-bold text-stone-600 hover:bg-stone-100 transition-all cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis shrink-0"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-[#EA4335] shrink-0">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    <span className="truncate text-[10px]">구글</span>
                  </a>
                )}
              </div>
            )}

            {section.showCopyAddress && (
              <CopyAddressButton
                address={`${section.address || ''}${section.detailAddress ? ' ' + section.detailAddress : ''}`}
                theme={theme}
                st={st}
              />
            )}
          </div>
        </div>
      );

    case 'bankAccount': {
      const accounts = section.accounts || [];
      const displayStyle = section.displayStyle || 'accordion';
      const align = (section as any).textAlign || (section as any).align || 'center';

      return (
        <div className="px-6 py-16" style={{ ...st, backgroundColor: (theme?.pattern && theme.pattern !== 'none') ? 'transparent' : (section.useBackgroundColor ? '#F9FAFB' : st.backgroundColor) }}>
          <SectionHeader
            title={section.title || '마음 전하실 곳'}
            englishLabel="ACCOUNT"
            fontScale={fontScale}
            textColor={st.color}
            align={align as any}
          />
          <p className="text-center text-[13px] -mt-6 mb-10 leading-relaxed break-keep px-4 opacity-75" style={{ color: st.color || 'inherit' }}>
            {section.description || '축복의 마음을 담아 보내주시는 축의금은\n신랑 신부의 앞날을 위해 소중히 사용하겠습니다.'}
          </p>

          <div className="flex flex-col gap-4">
            {accounts.length > 0 ? (
              accounts.map((acc, i) => (
                <div
                  key={acc.id || i}
                  className="p-6 rounded-3xl border shadow-sm flex flex-col gap-4"
                  style={{
                    backgroundColor: theme.bgColor === '#ffffff' ? '#ffffff' : 'rgba(255,255,255,0.05)',
                    borderColor: theme.bgColor === '#ffffff' ? '#f5f5f5' : 'rgba(255,255,255,0.1)'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-60" style={{ color: st.color || 'inherit' }}>
                        {acc.ownerType === 'groom' ? '신랑' : acc.ownerType === 'bride' ? '신부' : acc.relation || '혼주'}
                      </span>
                      <span className="text-[15px] font-bold whitespace-nowrap break-keep truncate" style={{ color: st.color || 'inherit' }}>{acc.bank} {acc.name}</span>
                    </div>
                    <button
                      className="w-[58px] h-7 flex items-center justify-center shrink-0 border rounded-full text-[10px] font-bold transition-all whitespace-nowrap active:scale-95"
                      style={{
                        backgroundColor: theme.bgColor === '#ffffff' ? '#f8f8f8' : 'rgba(255,255,255,0.06)',
                        borderColor: theme.bgColor === '#ffffff' ? '#e7e5e4' : 'rgba(255,255,255,0.15)',
                        color: st.color || '#444444'
                      }}
                      onClick={() => {
                        if (typeof navigator !== 'undefined' && navigator.clipboard) {
                          navigator.clipboard.writeText(acc.accountNumber).then(() => {
                            setCopyToastMessage('계좌번호가 복사되었습니다.');
                            setTimeout(() => setCopyToastMessage(null), 2000);
                          }).catch(() => {
                            const textArea = document.createElement("textarea");
                            textArea.value = acc.accountNumber;
                            document.body.appendChild(textArea);
                            textArea.select();
                            try {
                              document.execCommand('copy');
                              setCopyToastMessage('계좌번호가 복사되었습니다.');
                              setTimeout(() => setCopyToastMessage(null), 2000);
                            } catch (err) {
                              window.alert('복사 실패');
                            }
                            document.body.removeChild(textArea);
                          });
                        }
                      }}
                    >
                      <div className="flex items-center gap-1.5">
                        <Copy className="w-3 h-3 shrink-0" />
                        복사하기
                      </div>
                    </button>
                  </div>
                  <div className="text-[14px] font-medium tracking-tight opacity-75" style={{ color: st.color || 'inherit' }}>
                    {acc.accountNumber}
                  </div>
                  <div className="flex flex-col gap-2 mt-1">
                    <button
                      onClick={() => {
                        const url = (acc as any).kakaoPayUrl || (acc as any).kakaoPayLink || `https://qr.kakaopay.com/`;
                        window.open(url, '_blank');
                      }}
                      className="w-full py-3.5 bg-[#FEE500] text-[#191919] rounded-2xl text-[12px] font-bold flex items-center justify-center gap-2.5 transition-all hover:opacity-90 active:scale-95 shadow-sm border border-yellow-100"
                    >
                      <svg className="w-4 h-4 shrink-0 text-[#191919]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 3c-4.97 0-9 3.185-9 7.115 0 2.502 1.637 4.702 4.112 5.968l-.837 3.076c-.09.333.11.66.442.66.155 0 .307-.06.417-.174l3.593-3.52c.42.06.848.09 1.283.09 4.97 0 9-3.186 9-7.116C21 6.185 16.97 3 12 3z" />
                      </svg>
                      카카오페이 송금
                    </button>
                    <button
                      onClick={() => {
                        const url = (acc as any).tossUrl || `https://toss.im/_m/${acc.bank}/${acc.accountNumber}`;
                        window.open(url, '_blank');
                      }}
                      className="w-full py-3.5 bg-[#0064FF] text-white rounded-2xl text-[12px] font-bold flex items-center justify-center gap-2.5 transition-all hover:opacity-90 active:scale-95 shadow-sm"
                    >
                      <svg className="w-4 h-4 shrink-0 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 10.5h-5.5V3c0-.4-.3-.6-.6-.4L4.3 13.6c-.2.2-.1.5.2.5h5.5v7.5c0 .4.3.6.6.4l8.6-11c.2-.3.1-.6-.2-.6z" />
                      </svg>
                      토스 송금
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div
                className="p-10 rounded-3xl border border-dashed text-center"
                style={{
                  backgroundColor: theme.bgColor === '#ffffff' ? '#ffffff' : 'rgba(255,255,255,0.02)',
                  borderColor: theme.bgColor === '#ffffff' ? '#e7e5e4' : 'rgba(255,255,255,0.1)'
                }}
              >
                <p className="text-[12px] font-bold opacity-40" style={{ color: st.color || 'inherit' }}>등록된 계좌가 없습니다</p>
              </div>
            )}
          </div>
        </div >
      );
    }


    case 'guestbook': {
      const useBg = section.useBackgroundColor;
      const align = section.textAlign || 'center';
      const alignClass = align === 'left' ? 'text-left' : align === 'right' ? 'text-right' : 'text-center';

      return (
        <div className={`px-8 py-16 ${useBg ? 'bg-[#F9FAFB]' : 'bg-white'}`} style={{ ...st }}>
          <SectionHeader
            title={section.title || '방명록'}
            englishLabel="GUESTBOOK"
            fontScale={fontScale}
            textColor={st.color}
            align={align as any}
          />
          {section.subtitle && (
            <p className="text-[13px] text-stone-400 font-medium text-center -mt-6 mb-8 max-w-[280px] mx-auto opacity-75" style={{ fontSize: `${13 * fontScale}px` }}>{section.subtitle}</p>
          )}

          <GuestbookWidget section={section} st={st} />
        </div>
      );
    }

    case 'dday':
    case 'countdown': {
      // 4단계 다중 폴백 날짜 추출 시스템 (1순위: 메인 예식일 최우선)
      let targetDateStr = '2026-10-18'; // 디폴트 안전 미래 날짜
      let targetTimeStr = '14:00';

      // 1순위: 청첩장의 실제 'datetime' (날짜/시간) 섹션에서 사용자가 편집하여 채워둔 날짜를 100% 최우선 반영!
      const dateTimeSection = allSections?.find((s: any) => s.type === 'datetime') as any;
      // 2순위: 'cover' (대문 표지) 섹션의 날짜를 차선책으로 추적!
      const coverSection = allSections?.find((s: any) => s.type === 'cover') as any;

      if (dateTimeSection?.date) {
        targetDateStr = dateTimeSection.date;
        if (dateTimeSection.time) {
          targetTimeStr = dateTimeSection.time;
        }
      } else if (coverSection?.date) {
        targetDateStr = coverSection.date;
        if (coverSection.time) {
          targetTimeStr = coverSection.time;
        }
      }
      // 3순위: countdown/dday 섹션 자체에 날짜 정보가 기입되어 있는 경우를 차선 보루로 사용!
      else if ((section as any).targetDate) {
        targetDateStr = (section as any).targetDate;
      } else if ((section as any).date) {
        targetDateStr = (section as any).date;
      }

      const style = (section as any).style || 'simple';
      const useBg = (section as any).useBackgroundColor;

      const align = (section as any).textAlign || (section as any).align || 'center';

      return (
        <CountdownTimerWidget
          targetDateStr={targetDateStr}
          targetTimeStr={targetTimeStr}
          style={style}
          title={(section as any).title}
          description={(section as any).description}
          useBg={useBg}
          fontScale={fontScale}
          align={align as any}
        />
      );
    }

    case 'intro': {
      const [showInterviewModal, setShowInterviewModal] = useState(false);
      const [isVisible, setIsVisible] = useState(false);
      const [mounted, setMounted] = useState(false);

      useEffect(() => {
        setMounted(true);
      }, []);

      const handleOpen = () => {
        setShowInterviewModal(true);
        // 작은 지연시간을 주어 마운트 직후 트랜지션이 트리거되게 함
        setTimeout(() => setIsVisible(true), 10);
      };

      const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
          setShowInterviewModal(false);
        }, 500); // 트랜지션 시간과 일치
      };

      const coverSection = allSections?.find(s => s.type === 'cover');
      const groomName = coverSection?.groom || '신랑';
      const brideName = coverSection?.bride || '신부';


      const introSection = section as any;
      const useBg = introSection.useBackgroundColor;
      const align = introSection.textAlign || 'center';
      const shapeClass = introSection.imageShape === 'circle' ? 'rounded-full' : introSection.imageShape === 'rounded' ? 'rounded-3xl' : 'rounded-none';
      const style = (introSection.style || 'lovestory') as any;
      const isCircle = introSection.imageShape === 'circle';

      return (
        <div className={`relative px-8 py-16 ${useBg ? 'bg-[#F9FAFB]' : 'bg-white'}`} style={{ ...st }}>
          <style dangerouslySetInnerHTML={{ __html: HEART_STYLES }} />
          <SectionHeader
            title={introSection.title || '우리의 이야기'}
            englishLabel={introSection.subtitle || 'LOVE STORY'}
            fontScale={fontScale}
            textColor={st.color}
            align={align as any}
          />

          {showInterviewModal && mounted && (
            createPortal(
              <>
                {/* 백드롭 (외부 클릭 시 닫힘) */}
                <div
                  className={`absolute inset-0 bg-black/60 z-[999] transition-opacity duration-500 ease-in-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                  onClick={handleClose}
                />

                {/* 모달 본체 */}
                <div
                  className={`absolute inset-x-0 bottom-0 z-[1000] bg-white rounded-t-[2.5rem] h-[85%] flex flex-col shadow-[0_-20px_50px_rgba(0,0,0,0.15)] transition-transform duration-500 ease-out transform ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}
                >
                  {/* 상단 핸들 및 헤더 */}
                  <div className="pt-4 pb-6 flex flex-col items-center shrink-0 relative">
                    <div className="w-10 h-1.5 bg-stone-200 rounded-full mb-8" />
                    <span className="text-[26px] font-serif text-stone-800 mb-1 leading-none">Interview</span>
                    <span className="text-[14px] text-stone-400 font-medium tracking-tight">
                      {introSection.subtitle || '신랑 신부 인터뷰'}
                    </span>

                    {/* 닫기 버튼 */}
                    <button
                      onClick={handleClose}
                      className="absolute top-8 right-8 w-10 h-10 flex items-center justify-center rounded-full hover:bg-stone-100 transition-colors"
                    >
                      <span className="text-3xl text-stone-300 font-light">&times;</span>
                    </button>
                  </div>

                  {/* 인터뷰 내용 영역 */}
                  <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-10 custom-scrollbar-preview pb-24">
                    {(introSection.interviews || []).map((item: any) => {
                      const cover = allSections?.find(s => s.type === 'cover') as any;
                      const groomName = cover?.groom || '신랑';
                      const brideName = cover?.bride || '신부';

                      return (
                        <div key={item.id} className="flex flex-col gap-6">
                          {/* 질문 뱃지 (Snappost 스타일) */}
                          <div className="flex justify-center">
                            <div className="bg-[#444] px-6 py-2.5 rounded-full shadow-sm">
                              <p className="text-[13px] font-bold text-white tracking-tight">Q. {item.question}</p>
                            </div>
                          </div>

                          {/* 신랑 답변 (왼쪽 버블) */}
                          <div className="flex items-start gap-2.5">
                            <div className="w-10 h-10 rounded-full bg-white border border-stone-100 flex items-center justify-center shrink-0 mt-4 shadow-sm">
                              <User size={20} className="text-stone-300" />
                            </div>
                            <div className="flex flex-col gap-1.5 max-w-[75%]">
                              <span className="text-[11px] font-bold text-stone-400 ml-2">{groomName}</span>
                              <div className="bg-white px-5 py-4 rounded-[1.5rem] rounded-tl-sm shadow-sm border border-stone-100">
                                <p className="text-[14px] text-stone-700 leading-relaxed break-keep font-medium">
                                  {item.groomAnswer || '답변을 입력해 주세요.'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* 신부 답변 (오른쪽 버블) */}
                          <div className="flex items-start gap-2.5 flex-row-reverse">
                            <div className="w-10 h-10 rounded-full bg-white border border-stone-100 flex items-center justify-center shrink-0 mt-4 shadow-sm">
                              <User size={20} className="text-stone-300" />
                            </div>
                            <div className="flex flex-col gap-1.5 items-end max-w-[75%]">
                              <span className="text-[11px] font-bold text-stone-400 mr-2">{brideName}</span>
                              <div className="bg-stone-100 px-5 py-4 rounded-[1.5rem] rounded-tr-sm shadow-sm">
                                <p className="text-[14px] text-stone-700 leading-relaxed break-keep font-medium">
                                  {item.brideAnswer || '답변을 입력해 주세요.'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>,
              document.getElementById('preview-phone-screen') || document.body
            )
          )}

          {(style === 'lovestory' || style === 'love-story') && (
            <div className="flex flex-col items-center gap-8">
              <div className={`overflow-hidden shadow-xl ${shapeClass} ${isCircle ? 'w-56 aspect-square' : 'w-48 h-60'}`}>
                {(introSection.image || introSection.mainImage) ? (
                  <img src={introSection.image || introSection.mainImage} alt="Intro" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-stone-100 flex items-center justify-center">
                    <Camera size={24} className="text-stone-300" />
                  </div>
                )}
              </div>
              <button
                onClick={handleOpen}
                className="px-10 py-3 bg-[#4B5563] rounded-xl text-[14px] font-bold text-white shadow-lg hover:bg-stone-800 transition-all active:scale-95"
              >
                인터뷰 보기
              </button>
            </div>
          )}

          {(style === 'classic' || style === 'profile') && (
            <div className="flex flex-col gap-12">
              <div className="grid grid-cols-2 gap-6 relative">
                <div className="flex flex-col items-center gap-4">
                  <div className={`overflow-hidden shadow-lg ${shapeClass} ${isCircle ? 'w-full aspect-square' : 'w-full aspect-[3/4]'}`}>
                    {introSection.groomImage ? <img src={introSection.groomImage} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-stone-100 flex items-center justify-center"><User size={40} className="text-stone-200" /></div>}
                  </div>
                  <span className="text-[14px] font-bold text-stone-700">{groomName}</span>
                </div>
                {/* 신랑 신부 이름 사이 중앙 하트 애니메이션 */}
                <div className="absolute left-1/2 bottom-0 -translate-x-1/2 flex items-center justify-center pointer-events-none">
                  {renderTemplateHeart()}
                </div>
                <div className="flex flex-col items-center gap-4">
                  <div className={`overflow-hidden shadow-lg ${shapeClass} ${isCircle ? 'w-full aspect-square' : 'w-full aspect-[3/4]'}`}>
                    {introSection.brideImage ? <img src={introSection.brideImage} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-stone-100 flex items-center justify-center"><User size={40} className="text-stone-200" /></div>}
                  </div>
                  <span className="text-[14px] font-bold text-stone-700">{brideName}</span>
                </div>
              </div>
              <p className="text-[15px] leading-[2] text-stone-600 break-keep">
                {(introSection.interviews?.[0]?.groomAnswer || '') + '\n' + (introSection.interviews?.[0]?.brideAnswer || '')}
              </p>
            </div>
          )}

          {style === 'interview' && (
            <div className="flex flex-col gap-12 text-left">
              {/* 질문과 신랑신부 대화 챗봇 말풍선 리스트 */}
              {(section.interviews || []).map((item: any, i: number) => {
                const cover = allSections?.find(s => s.type === 'cover') as any;
                const groomName = cover?.groom || '신랑';
                const brideName = cover?.bride || '신부';

                return (
                  <div key={item.id} className="flex flex-col gap-6">
                    {/* 질문 뱃지 (Snappost 스타일) */}
                    <div className="flex justify-center">
                      <div className="bg-[#444] px-6 py-2.5 rounded-full shadow-sm">
                        <p className="text-[13px] font-bold text-white tracking-tight">Q. {item.question}</p>
                      </div>
                    </div>

                    {/* 신랑 답변 (왼쪽 버블) */}
                    <div className="flex items-start gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-white border border-stone-200 flex items-center justify-center shrink-0 mt-1 shadow-sm overflow-hidden">
                        {section.groomImage ? (
                          <img src={section.groomImage} className="w-full h-full object-cover" />
                        ) : (
                          <User size={18} className="text-stone-300" />
                        )}
                      </div>
                      <div className="flex flex-col gap-1 max-w-[75%]">
                        <span className="text-[11px] font-bold text-stone-400 ml-1">{groomName}</span>
                        <div className="bg-white px-4 py-2.5 rounded-[1.25rem] rounded-tl-sm shadow-sm border border-stone-200">
                          <p className="text-[13px] text-stone-700 leading-relaxed break-keep font-medium">
                            {item.groomAnswer || '답변을 입력해 주세요.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* 신부 답변 (오른쪽 버블) */}
                    <div className="flex items-start gap-2.5 flex-row-reverse">
                      <div className="w-9 h-9 rounded-full bg-white border border-stone-200 flex items-center justify-center shrink-0 mt-1 shadow-sm overflow-hidden">
                        {section.brideImage ? (
                          <img src={section.brideImage} className="w-full h-full object-cover" />
                        ) : (
                          <User size={18} className="text-stone-300" />
                        )}
                      </div>
                      <div className="flex flex-col gap-1 items-end max-w-[75%]">
                        <span className="text-[11px] font-bold text-stone-400 mr-1">{brideName}</span>
                        <div className="bg-stone-100 px-4 py-2.5 rounded-[1.25rem] rounded-tr-sm shadow-sm">
                          <p className="text-[13px] text-stone-700 leading-relaxed break-keep font-medium">
                            {item.brideAnswer || '답변을 입력해 주세요.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    case 'photoDrop': {
      return <PhotoDropWidget section={section} st={st} fontScale={fontScale} />;
    }

    case 'notice': {
      const useBg = (section as any).useBackgroundColor;
      const align = (section as any).textAlign || 'center';
      const items = (section as any).items || [];
      const [activeTab, setActiveTab] = useState(0);

      // 에디터의 displayMode 바인딩 (기본값 'inline')
      const displayMode = (section as any).displayMode || 'inline';
      // 에디터의 uiStyle 바인딩 (기본값 'classic')
      const uiStyle = (section as any).uiStyle || 'classic';

      const noticeStyle = {
        ...st,
        fontFamily: (section as any).fontFamily || st.fontFamily,
        fontSize: `${15 * fontScale}px`
      };

      // UI 스타일에 따른 공통 카드 스타일링 래핑 적용
      const getCardClasses = (isOpen: boolean) => {
        let base = "overflow-hidden transition-all duration-300 ";
        if (uiStyle === 'minimal') {
          base += "border-b border-stone-200/60 rounded-none bg-transparent shadow-none";
        } else if (uiStyle === 'border') {
          base += "border border-stone-300 rounded-[20px] bg-white shadow-none p-6";
        } else if (uiStyle === 'modern') {
          base += "border border-stone-100/70 rounded-3xl bg-[#F9FAFB] shadow-md hover:shadow-lg p-6";
        } else {
          // classic
          base += "border border-stone-100 rounded-3xl bg-white shadow-sm p-6";
        }
        return base;
      };

      // 슬라이더 전용 다음/이전 전환 기능
      const handlePrevSlider = () => {
        setActiveTab((prev) => (prev === 0 ? items.length - 1 : prev - 1));
      };

      const handleNextSlider = () => {
        setActiveTab((prev) => (prev === items.length - 1 ? 0 : prev + 1));
      };

      return (
        <div className={`px-8 py-16 ${useBg ? 'bg-[#F9FAFB]' : 'bg-white'}`} style={noticeStyle}>
          {/* 1. 텍스트 정렬 프롭스를 align에 직접 전달하여 제목 정렬 위치가 완벽히 실시간 전환되게 함 */}
          <SectionHeader
            title={section.title || '안내사항'}
            englishLabel="INFORMATION"
            fontScale={fontScale}
            textColor={st.color}
            align={align as any}
          />

          {displayMode === 'slider' ? (
            // [슬라이더 모드]: 실제 포커 카드들이 뒤에 기품 있게 포개어져(양옆으로 겹쳐 깔려 노출되는 구조) 미끄러지듯 교체되는 초호화 프리미엄 3D 스택 캐러셀 구현
            <div className="flex flex-col gap-6 w-full animate-fade-in">
              <div className="relative w-full h-[320px] flex items-center justify-between gap-1 overflow-visible select-none px-1">
                {items.length > 1 && (
                  <button
                    onClick={handlePrevSlider}
                    className="w-9 h-9 rounded-full bg-white/95 shadow-md border border-stone-100/80 flex items-center justify-center text-stone-600 hover:bg-stone-50 active:scale-90 transition-all shrink-0 z-40 cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                )}

                {/* 슬라이더 3D 겹침 카드 데크 영역 */}
                <div className="flex-1 relative h-full flex items-center justify-center overflow-visible">
                  {items.map((item: any, idx: number) => {
                    // 순환 거리에 따른 입체 카드 위치 및 변형 계산
                    const diff = (idx - activeTab + items.length) % items.length;

                    let cardTransform = "";
                    let cardOpacity = 0;
                    let cardZIndex = 0;
                    let isVisible = false;

                    if (diff === 0) {
                      // 1. 현재 액티브 메인 카드 (중앙 전면에 배치)
                      cardTransform = "translate3d(0, 0, 0) scale(1) rotate(0deg)";
                      cardOpacity = 1;
                      cardZIndex = 30;
                      isVisible = true;
                    } else if (diff === 1 && items.length > 1) {
                      // 2. 우측 뒤편에 겹쳐 깔린 다음 대기 카드 (포커 카드처럼 샥 겹쳐 누움)
                      cardTransform = "translate3d(16px, 0, -10px) scale(0.9) rotate(3deg)";
                      cardOpacity = 0.5;
                      cardZIndex = 20;
                      isVisible = true;
                    } else if (diff === items.length - 1 && items.length > 2) {
                      // 3. 좌측 뒤편에 겹쳐 깔린 이전 대기 카드 (포커 카드처럼 샥 겹쳐 누움)
                      cardTransform = "translate3d(-16px, 0, -10px) scale(0.9) rotate(-3deg)";
                      cardOpacity = 0.5;
                      cardZIndex = 10;
                      isVisible = true;
                    }

                    if (items.length === 2 && diff === 1) {
                      // 아이템이 2개뿐일 때는 우측 뒤편에만 깔리도록 연출
                      cardTransform = "translate3d(12px, 0, -10px) scale(0.9) rotate(3deg)";
                      cardOpacity = 0.45;
                      cardZIndex = 20;
                      isVisible = true;
                    }

                    return (
                      <div
                        key={item.id || idx}
                        style={{
                          transform: cardTransform,
                          opacity: cardOpacity,
                          zIndex: cardZIndex,
                        }}
                        className={`absolute w-[85%] h-full transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) ${isVisible ? 'block' : 'hidden pointer-events-none'}`}
                      >
                        <div className={`${getCardClasses(true)} w-full h-full flex flex-col justify-between gap-3 bg-white border border-stone-100 shadow-md rounded-3xl p-5 text-left`}>
                          <div className="flex flex-col gap-2.5 overflow-y-auto custom-scrollbar-preview h-full">
                            <span className="text-[14.5px] font-black text-stone-800 tracking-tight block">
                              {item.title}
                            </span>
                            {item.image && (
                              <div className="w-full aspect-[16/10] overflow-hidden rounded-xl shadow-sm border border-stone-100 shrink-0">
                                <img src={item.image} className="w-full h-full object-cover" alt="" />
                              </div>
                            )}
                            <p className="text-[13px] leading-[1.7] text-stone-600 break-keep whitespace-pre-wrap px-0.5">
                              {item.description || item.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {items.length > 1 && (
                  <button
                    onClick={handleNextSlider}
                    className="w-9 h-9 rounded-full bg-white/95 shadow-md border border-stone-100/80 flex items-center justify-center text-stone-600 hover:bg-stone-50 active:scale-90 transition-all shrink-0 z-40 cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                )}
              </div>

              {/* 슬라이더 인디케이터 점(dot) 표시 */}
              <div className="flex items-center justify-center gap-1.5 mt-2">
                {items.map((_: any, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => setActiveTab(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${activeTab === idx ? 'w-4 bg-stone-800' : 'w-1.5 bg-stone-200 hover:bg-stone-300'}`}
                  />
                ))}
              </div>
            </div>
          ) : displayMode === 'tab' ? (
            // [탭 모드]: 상단 수평 탭을 누르면 하단 카드가 전환되는 스타일
            <div className="flex flex-col gap-6 w-full animate-fade-in">
              {/* Elegant Tabs - Horizontal Scroll */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1.5 px-1 flex-nowrap justify-start min-w-full">
                {items.map((item: any, i: number) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(i)}
                    className={`px-5 py-2 text-[12.5px] font-black tracking-tight transition-all rounded-full whitespace-nowrap shrink-0 shadow-sm ${activeTab === i ? 'bg-stone-800 text-white' : 'bg-stone-50 text-stone-400 hover:bg-stone-100'}`}
                  >
                    {item.title}
                  </button>
                ))}
              </div>

              {/* Content Card (UI 스타일에 맞게 감싸기) */}
              {items[activeTab] && (
                <div key={activeTab} className={`${getCardClasses(true)} flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-3 duration-300`}>
                  {items[activeTab].image && (
                    <div className="w-full aspect-[4/3] overflow-hidden rounded-[24px] shadow-sm border border-stone-100">
                      <img src={items[activeTab].image} className="w-full h-full object-cover" alt="" />
                    </div>
                  )}
                  <p className="text-[14px] leading-[1.8] text-stone-600 break-keep whitespace-pre-wrap text-left">
                    {items[activeTab].description || items[activeTab].content}
                  </p>
                </div>
              )}
            </div>
          ) : displayMode === 'accordion' ? (
            // [아코디언 모드]: 접기/펼치기 아코디언 구현
            <div className="flex flex-col gap-4">
              {items.map((item: any, i: number) => {
                const isOpen = activeTab === i;
                // getCardClasses 내부 패딩 부여 처리 고려하여 버튼 부분 패딩 조정
                return (
                  <div key={item.id} className={getCardClasses(isOpen)}>
                    <button
                      onClick={() => setActiveTab(isOpen ? -1 : i)}
                      className={`w-full flex items-center justify-between transition-colors ${uiStyle === 'minimal' || uiStyle === 'border' || uiStyle === 'modern' || uiStyle === 'classic' ? 'py-1' : 'px-7 py-6'}`}
                    >
                      <span className={`text-[16px] font-bold ${isOpen ? 'text-stone-800' : 'text-stone-500'}`}>{item.title}</span>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isOpen ? 'bg-stone-800 text-white' : 'bg-stone-50 text-stone-300'}`}>
                        <ChevronDown size={16} className={`transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} />
                      </div>
                    </button>
                    {isOpen && (
                      <div className="pt-5 flex flex-col gap-5 animate-in slide-in-from-top-4 duration-500">
                        {item.image && (
                          <div className="w-full aspect-[16/9] overflow-hidden rounded-2xl shadow-inner border border-stone-100">
                            <img src={item.image} className="w-full h-full object-cover" alt="" />
                          </div>
                        )}
                        <p className="text-[14px] leading-[1.8] text-stone-600 break-keep whitespace-pre-wrap text-left">
                          {item.description || item.content}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            // [인라인 모드]: 전체 목록이 한눈에 보이는 스타일
            <div className="flex flex-col gap-10">
              {items.map((item: any) => (
                <div key={item.id} className={`${getCardClasses(true)} flex flex-col gap-5 ${align === 'left' ? 'items-start text-left' : align === 'right' ? 'items-end text-right' : 'items-center text-center'}`}>
                  <div className={`flex flex-col gap-2 ${align === 'left' ? 'items-start' : align === 'right' ? 'items-end' : 'items-center'}`}>
                    <h5 className="text-[16.5px] font-bold text-stone-800 tracking-tight">{item.title}</h5>
                    <div className={`w-6 h-[1.5px] bg-[#D97706]/40 ${align === 'left' ? 'ml-0' : align === 'right' ? 'mr-0' : 'mx-auto'}`} />
                  </div>
                  {item.image && (
                    <div className="w-full aspect-[16/9] overflow-hidden rounded-[20px] shadow-sm border border-stone-100">
                      <img src={item.image} className="w-full h-full object-cover" alt="" />
                    </div>
                  )}
                  <p className="text-[14px] leading-[1.8] text-stone-600 break-keep whitespace-pre-wrap text-left px-1">
                    {item.description || item.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    case 'datetime': {
      const useBg = section.useBackgroundColor;
      const align = (section as any).textAlign || (section as any).align || 'center';
      const style = section.style || 'classic';
      const alignClass = align === 'left' ? 'items-start text-left' : align === 'right' ? 'items-end text-right' : 'items-center text-center';

      const dateTimeStyle = {
        ...st,
        fontFamily: section.fontFamily || st.fontFamily,
        fontSize: section.fontSizePercent ? `${(section.fontSizePercent / 100) * 15}px` : undefined,
      };

      const isInvalidDate = !section.date || isNaN(new Date(section.date).getTime());
      const dateObj = new Date(section.date || '2026-11-20');
      const year = dateObj.getFullYear();
      const month = dateObj.getMonth();
      const day = dateObj.getDate();
      const dayOfWeek = dateObj.getDay();
      const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
      const shortDays = ['일', '월', '화', '수', '목', '금', '토'];

      const yearStr = isInvalidDate ? '-' : year.toString();
      const monthStr = isInvalidDate ? '-' : (month + 1).toString();
      const dayStr = isInvalidDate ? '-' : day.toString();
      const dayOfWeekStr = isInvalidDate ? '-' : days[dayOfWeek];

      const dateString = isInvalidDate ? '-' : `${yearStr}년 ${monthStr}월 ${dayStr}일 ${dayOfWeekStr}`;

      const timeStr = section.time;
      const isInvalidTime = !timeStr || timeStr.trim() === '' || !timeStr.includes(':');

      let timeString = '-';
      if (!isInvalidTime) {
        const timeParts = timeStr.split(':');
        let hour = parseInt(timeParts[0] || '', 10);
        const min = parseInt(timeParts[1] || '', 10);

        if (!isNaN(hour) && !isNaN(min)) {
          const ampm = hour >= 12 ? '오후' : '오전';
          hour = hour % 12;
          if (hour === 0) hour = 12;
          timeString = `${ampm} ${hour}시${min > 0 ? ` ${min}분` : ''}`;
        }
      }

      // 달력 데이터 생성
      const firstDay = new Date(year, month, 1).getDay();
      const lastDate = new Date(year, month + 1, 0).getDate();
      const calendarDays = [];
      for (let i = 0; i < firstDay; i++) calendarDays.push(null);
      for (let i = 1; i <= lastDate; i++) calendarDays.push(i);

      return (
        <div
          className="px-8 py-16"
          style={{
            ...dateTimeStyle,
            backgroundColor: (theme?.pattern && theme.pattern !== 'none') ? 'transparent' : (useBg ? '#F9FAFB' : dateTimeStyle.backgroundColor)
          }}
        >
          <SectionHeader
            title={section.title || '소중한 날에 초대합니다'}
            englishLabel="DATE & TIME"
            fontScale={fontScale}
            textColor={st.color}
            align={align as any}
          />
          <div className="flex flex-col gap-8 items-center text-center">

            {style === 'classic' && (
              <div className="flex flex-col gap-6 items-center text-center">
                <div className="flex flex-col gap-2">
                  <span className="text-[24px] font-serif" style={{ fontSize: `${24 * fontScale}px`, color: st.color }}>{dateString}</span>
                  <span className="text-[16px] font-medium opacity-80" style={{ color: st.color }}>{timeString}</span>
                </div>
                {section.description && <p className="text-[14px] leading-relaxed break-keep max-w-[280px] opacity-70" style={{ color: st.color }}>{section.description}</p>}
              </div>
            )}

            {style === 'calendar' && (
              <div className="flex flex-col items-center gap-10 w-full">
                <div className="flex flex-col gap-1 items-center">
                  <span className="text-[24px] font-serif" style={{ fontSize: `${24 * fontScale}px`, color: st.color }}>{isInvalidDate ? '- . -' : `${year}. ${(month + 1).toString().padStart(2, '0')}`}</span>
                  <span className="text-[14px] font-medium opacity-70" style={{ color: st.color }}>{dateString} {timeString}</span>
                </div>

                <div className="w-full max-w-[300px]">
                  <div className="grid grid-cols-7 mb-4 py-3 border-y" style={{ borderColor: theme.bgColor === '#ffffff' ? '#f5f5f5' : 'rgba(255,255,255,0.1)' }}>
                    {shortDays.map((d, i) => (
                      <span key={i} className="text-center text-[12px] font-bold" style={{ color: i === 0 ? '#f87171' : (st.color || '#a8a29e') }}>{d}</span>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-y-2">
                    {calendarDays.map((d, i) => {
                      const isSelected = d === day;
                      return (
                        <div key={i} className="h-9 flex items-center justify-center relative">
                          {isSelected && (
                            <div className="absolute inset-0 m-auto w-8 h-8 rounded-full flex items-center justify-center z-0" style={{ backgroundColor: theme.bgColor === '#ffffff' ? '#fff1f2' : 'rgba(244,63,94,0.15)' }}>
                              <div className="w-full h-full border rounded-full animate-ping opacity-20" style={{ borderColor: '#f43f5e' }} />
                            </div>
                          )}
                          <span
                            className="text-[13px] font-medium relative z-10"
                            style={{
                              color: isSelected
                                ? '#f43f5e'
                                : d === null
                                  ? 'transparent'
                                  : (i % 7 === 0 ? '#fca5a5' : (st.color || '#444444')),
                              fontWeight: isSelected ? 'bold' : 'normal'
                            }}
                          >
                            {d}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {section.description && <p className="text-[14px] leading-relaxed break-keep text-center max-w-[260px] opacity-70" style={{ color: st.color }}>{section.description}</p>}
              </div>
            )}

            {style === 'card' && (
              <div className="w-full flex flex-col gap-8 items-center">
                <div
                  className="w-full rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border overflow-hidden"
                  style={{
                    backgroundColor: theme.bgColor === '#ffffff' ? '#ffffff' : 'rgba(255,255,255,0.05)',
                    borderColor: theme.bgColor === '#ffffff' ? '#f5f5f5' : 'rgba(255,255,255,0.1)'
                  }}
                >
                  <div
                    className="px-8 py-10 flex flex-col items-center gap-4 border-b"
                    style={{
                      backgroundColor: theme.bgColor === '#ffffff' ? 'rgba(120,113,108,0.03)' : 'rgba(255,255,255,0.02)',
                      borderColor: theme.bgColor === '#ffffff' ? '#e7e5e4' : 'rgba(255,255,255,0.1)'
                    }}
                  >
                    <span className="text-[14px] font-bold text-rose-400 tracking-widest uppercase">The Wedding Day</span>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-center">
                        <span className="text-[28px] font-serif leading-none" style={{ color: st.color || 'inherit' }}>{isInvalidDate ? '-' : year}</span>
                        <span className="text-[11px] font-black mt-1 uppercase opacity-45" style={{ color: st.color || 'inherit' }}>Year</span>
                      </div>
                      <div className="w-[1px] h-10 bg-stone-200/30" />
                      <div className="flex flex-col items-center">
                        <span className="text-[28px] font-serif leading-none" style={{ color: st.color || 'inherit' }}>{isInvalidDate ? '-' : (month + 1).toString().padStart(2, '0')}</span>
                        <span className="text-[11px] font-black mt-1 uppercase opacity-45" style={{ color: st.color || 'inherit' }}>Month</span>
                      </div>
                      <div className="w-[1px] h-10 bg-stone-200/30" />
                      <div className="flex flex-col items-center">
                        <span className="text-[28px] font-serif leading-none" style={{ color: st.color || 'inherit' }}>{isInvalidDate ? '-' : day.toString().padStart(2, '0')}</span>
                        <span className="text-[11px] font-black mt-1 uppercase opacity-45" style={{ color: st.color || 'inherit' }}>Day</span>
                      </div>
                    </div>
                  </div>
                  <div className="px-8 py-8 flex flex-col items-center gap-2">
                    <span className="text-[18px] font-medium" style={{ color: st.color || 'inherit' }}>{isInvalidDate ? '-' : days[dayOfWeek]} {timeString}</span>
                    <span className="text-[13px] opacity-60" style={{ color: st.color || 'inherit' }}>당신의 소중한 발걸음을 기다립니다</span>
                  </div>
                </div>
                {section.description && <p className="text-[14px] leading-relaxed break-keep text-center max-w-[260px] opacity-70" style={{ color: st.color }}>{section.description}</p>}
              </div>
            )}

            {style === 'typo' && (
              <div className="flex flex-col items-center gap-8 w-full">
                <div className="flex flex-col items-center">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[80px] font-serif leading-none tracking-tighter" style={{ color: st.color || '#111111' }}>{isInvalidDate ? '-' : (month + 1).toString().padStart(2, '0')}</span>
                    <span className="text-[30px] font-serif opacity-30" style={{ color: st.color || '#d4d4d8' }}>/</span>
                    <span className="text-[80px] font-serif leading-none tracking-tighter" style={{ color: st.color || '#111111' }}>{isInvalidDate ? '-' : day.toString().padStart(2, '0')}</span>
                  </div>
                  <div className="w-full h-[1px] my-4" style={{ backgroundColor: theme.bgColor === '#ffffff' ? '#f5f5f5' : 'rgba(255,255,255,0.1)' }} />
                  <span className="text-[18px] font-serif tracking-[0.2em] uppercase opacity-80" style={{ color: st.color || '#444444' }}>{isInvalidDate ? '-' : days[dayOfWeek]} {timeString}</span>
                </div>
                {section.description && <p className="text-[14px] leading-relaxed break-keep text-center mt-4 opacity-70" style={{ color: st.color }}>{section.description}</p>}
              </div>
            )}

            {style === 'editorial' && (
              <div className="flex flex-col items-center gap-12 w-full">
                <div className="relative pt-6">
                  <div className="flex flex-col items-center relative w-full justify-center">
                    <span className="text-[120px] font-serif absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[25%] -z-0 opacity-10 select-none pointer-events-none" style={{ color: st.color || '#111111' }}>
                      {isInvalidDate ? '-' : (month + 1).toString().padStart(2, '0')}
                    </span>
                    <span className="text-[40px] font-serif relative z-10 tracking-widest" style={{ color: st.color || '#111111' }}>
                      {isInvalidDate ? '-' : day.toString().padStart(2, '0')}
                    </span>
                    <div className="w-12 h-[2px] bg-rose-300 my-6 relative z-10" />
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-[16px] font-serif uppercase tracking-[0.3em] opacity-65" style={{ color: st.color || '#444444' }}>{isInvalidDate ? '-' : days[dayOfWeek]}</span>
                      <span className="text-[18px] font-serif" style={{ color: st.color || '#111111' }}>{timeString}</span>
                    </div>
                  </div>
                </div>
                {section.description && <p className="text-[15px] font-serif italic leading-loose break-keep text-center max-w-[240px] opacity-70" style={{ color: st.color }}>" {section.description} "</p>}
              </div>
            )}
          </div>
        </div>
      );
    }

    case 'contact':
      return <ContactSectionRenderer section={section} theme={theme} st={st} setCopyToastMessage={setCopyToastMessage} />;

    case 'rsvp':
      return <RsvpSectionRenderer section={section} theme={theme} st={st} />;



    default:
      return (
        <div className="px-8 py-24 text-center bg-white border-y border-stone-50" style={st}>
          <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-stone-100">
            <Info size={20} className="text-stone-300" />
          </div>
          <p className="text-[11px] font-black text-stone-300 tracking-[0.2em] mb-2 uppercase">{section.type}</p>
          <h3 className="text-[14px] font-bold text-stone-400">{section.title || '준비 중인 섹션입니다'}</h3>
        </div>
      );
  }
}

export default function SectionRenderer(props: SectionRendererProps) {
  const [copyToastMessage, setCopyToastMessage] = useState<string | null>(null);

  return (
    <>
      <InnerSectionRenderer {...props} setCopyToastMessage={setCopyToastMessage} />
      {copyToastMessage && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[9999] bg-stone-900/95 text-white text-[12px] font-medium px-5 py-3 rounded-2xl shadow-2xl transition-all animate-fade-in flex items-center gap-2 border border-stone-800">
          <span className="text-[14px]">✨</span>
          <span>{copyToastMessage}</span>
        </div>
      )}
    </>
  );
}

/* 진짜 카카오/네이버 SDK 렌더링용 초고화질 듀얼 실시간 지도 컴포넌트 */
interface LiveMapContainerProps {
  address: string;
  mapType: 'naver' | 'kakao' | 'google';
}

function LiveMapContainer({ address, mapType }: LiveMapContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadStatus, setLoadStatus] = useState<'loading' | 'success' | 'fallback'>('loading');

  useEffect(() => {
    if (mapType === 'google') {
      setLoadStatus('success');
      return;
    }

    setLoadStatus('loading');
    let isMounted = true;
    const scriptId = mapType === 'kakao' ? 'kakao-map-sdk' : 'naver-map-sdk';

    // 컨테이너 초기화
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    const initMap = () => {
      if (!isMounted || !containerRef.current) return;

      try {
        if (mapType === 'kakao') {
          const kakao = (window as any).kakao;
          if (!kakao || !kakao.maps) {
            setLoadStatus('fallback');
            return;
          }

          kakao.maps.load(() => {
            if (!containerRef.current) return;
            const geocoder = new kakao.maps.services.Geocoder();
            geocoder.addressSearch(address, (result: any, status: any) => {
              if (!isMounted || !containerRef.current) return;
              if (status === kakao.maps.services.Status.OK && result[0]) {
                const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
                const options = {
                  center: coords,
                  level: 3
                };
                const map = new kakao.maps.Map(containerRef.current, options);
                new kakao.maps.Marker({
                  map: map,
                  position: coords
                });
                setLoadStatus('success');
              } else {
                const coords = new kakao.maps.LatLng(37.566826, 126.9786567);
                const options = { center: coords, level: 3 };
                const map = new kakao.maps.Map(containerRef.current, options);
                new kakao.maps.Marker({ map: map, position: coords });
                setLoadStatus('success');
              }
            });
          });
        } else if (mapType === 'naver') {
          const naver = (window as any).naver;
          if (!naver || !naver.maps) {
            setLoadStatus('fallback');
            return;
          }

          naver.maps.Service.geocode({ query: address }, (status: any, response: any) => {
            if (!isMounted || !containerRef.current) return;
            if (status === naver.maps.Service.Status.ERROR || !response.v2.addresses[0]) {
              const coords = new naver.maps.LatLng(37.566826, 126.9786567);
              const map = new naver.maps.Map(containerRef.current!, {
                center: coords,
                zoom: 15
              });
              new naver.maps.Marker({
                position: coords,
                map: map
              });
              setLoadStatus('success');
              return;
            }

            const item = response.v2.addresses[0];
            const coords = new naver.maps.LatLng(item.y, item.x);
            const map = new naver.maps.Map(containerRef.current!, {
              center: coords,
              zoom: 16,
              logoControl: false,
              mapDataControl: false
            });

            new naver.maps.Marker({
              position: coords,
              map: map
            });
            setLoadStatus('success');
          });
        }
      } catch (err) {
        console.error('Failed to init live map:', err);
        setLoadStatus('fallback');
      }
    };

    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      setTimeout(initMap, 100);
    } else {
      const script = document.createElement('script');
      script.id = scriptId;
      script.type = 'text/javascript';

      if (mapType === 'kakao') {
        script.src = '//dapi.kakao.com/v2/maps/sdk.js?appkey=c644d6736ff63d76e2746a48972e35a1&libraries=services&autoload=false';
      } else {
        script.src = '//openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=gq5e744mch&submodules=geocoder';
      }

      script.onload = () => {
        setTimeout(initMap, 200);
      };
      script.onerror = () => {
        setLoadStatus('fallback');
      };
      document.head.appendChild(script);
    }

    const timer = setTimeout(() => {
      if (isMounted && loadStatus === 'loading') {
        setLoadStatus('fallback');
      }
    }, 2500);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [address, mapType]);

  const encodedAddress = encodeURIComponent(address);

  if (mapType === 'google' || loadStatus === 'fallback') {
    return (
      <iframe
        title="wedding-location"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        src={`https://maps.google.com/maps?q=${encodedAddress}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
        allowFullScreen
        loading="lazy"
      />
    );
  }

  return (
    <div className="w-full h-full relative">
      <div ref={containerRef} className="w-full h-full bg-stone-50" />
      {loadStatus === 'loading' && (
        <div className="absolute inset-0 bg-stone-50/80 backdrop-blur-sm flex items-center justify-center z-30">
          <div className="flex flex-col items-center gap-2">
            <span className="w-6 h-6 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin" />
            <span className="text-[10px] font-bold text-stone-500 tracking-wider">지도를 실시간 동기화 중...</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Slider(Slideshow) 갤러리를 위한 프리미엄 러버밴드 탄성 드래그 스와이프 슬라이더 위젯 ──
function BgmSlideshowWidget({ images, getImgUrl }: { images: any[]; getImgUrl: (img: any) => string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [swipeOut, setSwipeOut] = useState<number | null>(null); // 날아간 인덱스 애니메이션 트리거
  const [swipeDir, setSwipeDir] = useState<'left' | 'right' | 'none'>('none');

  const dragStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setStartX(clientX);
    setStartY(clientY);
    setDragOffset({ x: 0, y: 0 });
    setSwipeOut(null);
    setSwipeDir('none');
  };

  const dragMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    const diffX = clientX - startX;
    const diffY = clientY - startY;
    setDragOffset({ x: diffX, y: diffY });
  };

  const dragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 100;
    if (dragOffset.x > threshold) {
      triggerSwipe('right');
    } else if (dragOffset.x < -threshold) {
      triggerSwipe('left');
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const triggerSwipe = (dir: 'left' | 'right') => {
    setSwipeOut(currentIndex);
    setSwipeDir(dir);

    setTimeout(() => {
      if (dir === 'left') {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      } else {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }
      setDragOffset({ x: 0, y: 0 });
      setSwipeOut(null);
      setSwipeDir('none');
    }, 350);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerSwipe('left');
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerSwipe('right');
  };

  const renderCards = () => {
    const cardElements = [];
    const maxVisibleCards = Math.min(images.length, 3);

    for (let depth = maxVisibleCards - 1; depth >= 0; depth--) {
      const cardIndex = (currentIndex + depth) % images.length;
      const isTopCard = depth === 0;

      let style: React.CSSProperties = {};
      let cardClass = "";

      if (isTopCard) {
        if (swipeOut === cardIndex) {
          const flyX = swipeDir === 'right' ? 400 : -400;
          style = {
            transform: `translate3d(${flyX}px, ${dragOffset.y}px, 0) rotate(${flyX * 0.12}deg) scale(0.9)`,
            opacity: 0,
            transition: 'transform 0.35s ease-out, opacity 0.35s ease-out',
            zIndex: 40,
          };
        } else {
          style = {
            transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) rotate(${dragOffset.x * 0.08}deg) scale(1)`,
            transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.25, 0.8, 0.25, 1)',
            zIndex: 30,
          };
        }
        cardClass = "cursor-grab active:cursor-grabbing";
      } else if (depth === 1) {
        const ratio = Math.min(Math.abs(dragOffset.x) / 150, 1);
        const currentScale = 0.94 + ratio * 0.06;
        const currentTranslateY = 16 - ratio * 16;
        const currentRotate = 3 - ratio * 3;

        style = {
          transform: `translate3d(6px, ${currentTranslateY}px, 0) rotate(${currentRotate}deg) scale(${currentScale})`,
          transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)',
          zIndex: 20,
          opacity: 0.95,
        };
      } else if (depth === 2) {
        const ratio = Math.min(Math.abs(dragOffset.x) / 150, 1);
        const currentScale = 0.88 + ratio * 0.06;
        const currentTranslateY = 32 - ratio * 16;
        const currentRotate = -3 + ratio * 6;

        style = {
          transform: `translate3d(-6px, ${currentTranslateY}px, 0) rotate(${currentRotate}deg) scale(${currentScale})`,
          transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)',
          zIndex: 10,
          opacity: 0.85,
        };
      }

      cardElements.push(
        <div
          key={cardIndex}
          style={style}
          className={`absolute w-[88%] h-[88%] rounded-3xl overflow-hidden bg-white shadow-[0_12px_36px_rgba(0,0,0,0.12)] border border-stone-200/40 select-none ${cardClass}`}
          onTouchStart={isTopCard ? (e) => dragStart(e.touches[0].clientX, e.touches[0].clientY) : undefined}
          onTouchMove={isTopCard ? (e) => dragMove(e.touches[0].clientX, e.touches[0].clientY) : undefined}
          onTouchEnd={isTopCard ? dragEnd : undefined}
          onMouseDown={isTopCard ? (e) => { e.preventDefault(); dragStart(e.clientX, e.clientY); } : undefined}
          onMouseMove={isTopCard ? (e) => dragMove(e.clientX, e.clientY) : undefined}
          onMouseUp={isTopCard ? dragEnd : undefined}
          onMouseLeave={isTopCard ? dragEnd : undefined}
        >
          <img
            src={getImgUrl(images[cardIndex])}
            className="w-full h-full object-cover pointer-events-none select-none"
            alt={`Gallery Stack Card ${cardIndex}`}
            draggable={false}
          />
        </div>
      );
    }

    return cardElements;
  };

  return (
    <div className="relative w-full aspect-square flex items-center justify-center select-none overflow-visible py-4">
      <div className="relative w-full h-full flex items-center justify-center overflow-visible">
        {renderCards()}
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 hover:bg-white flex items-center justify-center shadow-lg text-stone-700 active:scale-95 transition-all text-xl font-black z-[100] border border-black/5"
          >
            ‹
          </button>
          <button
            onClick={handleNext}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/95 hover:bg-white flex items-center justify-center shadow-lg text-stone-700 active:scale-95 transition-all text-xl font-black z-[100] border border-black/5"
          >
            ›
          </button>
        </>
      )}

      {images.length > 1 && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 px-3.5 py-1.5 rounded-full bg-black/25 backdrop-blur-[2px] z-[100] pointer-events-auto">
          {images.map((_, i) => (
            <div
              key={i}
              onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
              className={`w-2 h-2 rounded-full cursor-pointer transition-all ${currentIndex === i ? 'bg-white scale-110' : 'bg-white/40 hover:bg-white/60'}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Carousel 갤러리를 위한 쫀득한 마우스 드래그 및 자석식 스냅 관성 스크롤 위젯 ──
function BgmCarouselWidget({ images, getImgUrl }: { images: any[]; getImgUrl: (img: any) => string }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDown(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDown(false);
  };

  const handleMouseUp = () => {
    setIsDown(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // 드래그 가속율 1.5배
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div
      ref={scrollRef}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      className="w-full overflow-x-auto flex gap-3 pb-3 custom-scrollbar-horizontal scroll-smooth px-1 select-none active:cursor-grabbing cursor-grab snap-x snap-mandatory"
      style={{ scrollBehavior: isDown ? 'auto' : 'smooth' }}
    >
      {images.map((img, i) => (
        <div
          key={i}
          className="w-[180px] shrink-0 aspect-[4/5] bg-stone-50 rounded-2xl overflow-hidden border border-stone-100 shadow-sm relative snap-center pointer-events-none"
        >
          <img
            src={getImgUrl(img)}
            className="w-full h-full object-cover pointer-events-none select-none"
            alt={`Carousel ${i}`}
            draggable={false}
          />
        </div>
      ))}
    </div>
  );
}
