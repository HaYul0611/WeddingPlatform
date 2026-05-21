'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import SectionRenderer from '@/components/invite/SectionRenderer';
import BgmPlayer from '@/components/invite/BgmPlayer';
import type { Invitation, InvitationSection, InvitationTheme } from '@/types/invitation';
import { invitationTemplates } from '@/data/invitation-templates';
import { MapPin, Calendar, Phone } from 'lucide-react';

const DEFAULT_THEME: InvitationTheme = invitationTemplates[0].theme;

export default function LoveCardPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  // 기기 감지: 모바일(<768px)이면 mobile, 아니면 desktop
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  const [sections, setSections] = useState<InvitationSection[]>([]);
  const [theme, setTheme] = useState<InvitationTheme>(DEFAULT_THEME);

  const [summary, setSummary] = useState({
    groomName: '오하율',
    brideName: '김채원',
    weddingDate: '2027-11-08',
    weddingTime: '오전 11시',
    weddingPlace: '롯데 호텔 크리스탈 볼룸',
    mainImage: '/images/wedding_1.png',
    introText:
      '서로를 바라보며 다짐한 사랑의 약속,\n저희 두 사람이 부부의 연을 맺는 자리에\n소중한 분들을 초대합니다.'
  });

  // 기기 폭 감지 (SSR 안전)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // localStorage에서 사용자가 만든 청첩장 데이터 복원
  useEffect(() => {
    const savedInv = localStorage.getItem('wedding_builder_invitation');
    const savedSecs = localStorage.getItem('wedding_builder_sections');

    if (savedInv) {
      try {
        const inv: Invitation = JSON.parse(savedInv);
        const secs: InvitationSection[] = savedSecs
          ? JSON.parse(savedSecs)
          : inv.sections;
        setSections(secs);
        setTheme(inv.theme || DEFAULT_THEME);

        const introSec = secs?.find((s: any) => s.type === 'intro') as any;
        if (introSec) {
          setSummary({
            groomName: introSec.groom?.name || '오하율',
            brideName: introSec.bride?.name || '김채원',
            weddingDate: introSec.weddingDate || '2027-11-08',
            weddingTime: introSec.weddingTime || '오전 11시',
            weddingPlace: introSec.weddingPlace || '롯데 호텔 크리스탈 볼룸',
            mainImage: introSec.mainImage || '/images/wedding_1.png',
            introText:
              introSec.content ||
              '서로를 바라보며 다짐한 사랑의 약속,\n저희 두 사람이 부부의 연을 맺는 자리에\n소중한 분들을 초대합니다.'
          });
        }
      } catch (e) {
        console.error('lovecard preview: parse error', e);
      }
    } else {
      const tpl = invitationTemplates[0];
      setSections(tpl.defaultSections.map((s) => ({ ...s })));
      setTheme(tpl.theme);
    }
  }, []);

  // 기기 감지 완료 전 — 빈 화면으로 대기 (깜빡임 방지)
  if (isMobile === null) {
    return <div className="min-h-screen bg-[#FAF9F6]" />;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MOBILE: 청첩장 콘텐츠 풀스크린 (헤더/푸터/툴바 없음)
  // ─────────────────────────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div className="min-h-screen relative" style={{ backgroundColor: theme.bgColor || '#FAF9F6' }}>
        {/* BGM 플로팅 버튼 — 기존 BgmPlayer 컴포넌트 동일 형태 */}
        {theme.bgmUrl && (
          <div className="fixed top-4 right-4 z-50">
            <BgmPlayer
              url={theme.bgmUrl}
              autoPlay={theme.bgmAutoPlay}
              loop={theme.bgmLoop}
              volume={theme.bgmVolume}
            />
          </div>
        )}

        {/* 실제 사용자 청첩장 섹션 콘텐츠 */}
        {sections.length > 0 ? (
          <div>
            {sections.map((section) => (
              <SectionRenderer
                key={section.id}
                section={section}
                theme={theme}
                allSections={sections}
              />
            ))}
          </div>
        ) : (
          <DefaultMobileContent data={summary} theme={theme} />
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DESKTOP: 청첩장 콘텐츠 데스크톱 넓이로 풀스크린 (헤더/푸터/툴바 없음)
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen relative" style={{ backgroundColor: theme.bgColor || '#FAF9F6' }}>
      {/* BGM 플로팅 버튼 — 기존 BgmPlayer 컴포넌트 동일 형태 */}
      {theme.bgmUrl && (
        <div className="fixed top-4 right-4 z-50">
          <BgmPlayer
            url={theme.bgmUrl}
            autoPlay={theme.bgmAutoPlay}
            loop={theme.bgmLoop}
            volume={theme.bgmVolume}
          />
        </div>
      )}

      {/* 데스크톱 실제 청첩장 콘텐츠 — 가운데 정렬, 최대 너비 제한 */}
      <div className="max-w-2xl mx-auto">
        {sections.length > 0 ? (
          sections.map((section) => (
            <SectionRenderer
              key={section.id}
              section={section}
              theme={theme}
              allSections={sections}
            />
          ))
        ) : (
          <DesktopFallbackContent data={summary} theme={theme} />
        )}
      </div>
    </div>
  );
}

// ── 모바일 폴백 콘텐츠 (섹션 없을 때) ────────────────────────────────────
function DefaultMobileContent({ data, theme }: { data: any; theme: InvitationTheme }) {
  return (
    <div className="flex flex-col items-center px-6 py-10 space-y-8 min-h-screen" style={{ backgroundColor: theme.bgColor || '#FAF9F6' }}>
      <div className="w-[270px] h-[350px] rounded-t-[9rem] overflow-hidden shadow-lg border border-stone-200/60">
        <img src={data.mainImage} alt="Wedding" className="w-full h-full object-cover" />
      </div>
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-3">
          <span className="text-base font-extrabold text-stone-800 tracking-tight">{data.groomName}</span>
          <div className="w-6 h-6 rounded-full bg-white border border-stone-200 flex items-center justify-center text-[10px] text-[#b5a796] shadow-sm">♥</div>
          <span className="text-base font-extrabold text-stone-800 tracking-tight">{data.brideName}</span>
        </div>
        <p className="text-[11px] text-[#b5a796] font-black tracking-widest">
          {data.weddingDate?.replace(/-/g, '.')} {data.weddingTime}
        </p>
        <p className="text-[11px] text-stone-400 font-bold">{data.weddingPlace}</p>
      </div>
      <div className="bg-white border border-stone-200/50 rounded-3xl p-6 text-center w-full shadow-sm space-y-3">
        <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Greeting</p>
        <div className="w-1 h-1 rounded-full bg-rose-300 mx-auto" />
        <pre className="whitespace-pre-wrap font-sans text-[11px] leading-relaxed text-stone-500 font-bold break-keep">
          {data.introText}
        </pre>
      </div>
      <div className="bg-white border border-stone-200/50 rounded-3xl p-6 w-full shadow-sm space-y-3">
        <p className="text-[10px] font-black text-stone-400 uppercase tracking-wider">연락처</p>
        <div className="space-y-2 text-xs font-bold text-stone-600">
          <div className="flex items-center justify-between border-b border-stone-50 pb-2">
            <span>신랑측 혼주</span>
            <a href="tel:01012345678" className="h-7 px-3 bg-stone-100 rounded-lg flex items-center gap-1.5 text-[10px]">
              <Phone size={10} /> 전화하기
            </a>
          </div>
          <div className="flex items-center justify-between">
            <span>신부측 혼주</span>
            <a href="tel:01087654321" className="h-7 px-3 bg-stone-100 rounded-lg flex items-center gap-1.5 text-[10px]">
              <Phone size={10} /> 전화하기
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 데스크톱 폴백 콘텐츠 (섹션 없을 때) ────────────────────────────────────
function DesktopFallbackContent({ data, theme }: { data: any; theme: InvitationTheme }) {
  return (
    <div className="py-20 px-12 flex flex-col md:flex-row items-center gap-14" style={{ backgroundColor: theme.bgColor || '#FAF9F6' }}>
      <div className="w-full md:w-1/2 flex justify-center">
        <div className="w-[300px] h-[420px] rounded-t-[9rem] overflow-hidden shadow-xl border border-stone-200/80">
          <img src={data.mainImage} alt="Wedding" className="w-full h-full object-cover" />
        </div>
      </div>
      <div className="w-full md:w-1/2 space-y-6">
        <div>
          <p className="text-[10px] font-black tracking-widest uppercase text-rose-500 mb-2">Wedding Invitation</p>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">
            {data.groomName} <span className="text-rose-400 font-light">♥</span> {data.brideName}
          </h1>
        </div>
        <div className="space-y-3 pt-4 border-t border-stone-100">
          <div className="flex items-center gap-3 text-sm text-stone-600 font-bold">
            <Calendar size={14} className="text-stone-400 shrink-0" />
            <span>{data.weddingDate} · {data.weddingTime}</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-stone-600 font-bold">
            <MapPin size={14} className="text-stone-400 shrink-0" />
            <span>{data.weddingPlace}</span>
          </div>
        </div>
        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-stone-500 break-keep pt-2">
          {data.introText}
        </pre>
      </div>
    </div>
  );
}
