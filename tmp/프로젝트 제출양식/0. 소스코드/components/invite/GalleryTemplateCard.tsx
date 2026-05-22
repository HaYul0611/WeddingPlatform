'use client';

export interface WeddingInfo {
  groomName: string;
  brideName: string;
  date: string;
  time: string;
  venue: string;
  venueAddress?: string;
  photoUrl?: string;
}

export type TemplateStyle =
  | 'classic-arch'
  | 'minimal-pure'
  | 'editorial-journal'
  | 'magazine-torn'
  | 'polaroid-vintage'
  | 'photobooth'
  | 'soulmate-oval'
  | 'forest-classic'
  | 'bw-romantic'
  | 'golden-frame'
  | 'calligraphy-floral'
  | 'minimal-pure'
  | 'pastel-photostrip';

interface TemplateCardProps {
  style: TemplateStyle;
  info: WeddingInfo;
}

const WEDDING_1 = '/images/wedding_1.png';
const WEDDING_2 = '/images/wedding_2.png';
const WEDDING_3 = '/images/wedding_3.png';
const WEDDING_4 = '/images/wedding_4.png';
const WEDDING_5 = '/images/wedding_5.png';
const WEDDING_6 = '/images/wedding_6.png';

// ── 12개 템플릿별로 각각 고유하고 독창적인 하트 애니메이션 정의 (HTML style 정리 원칙 준수) ──
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

  /* 4. 폴라로이드 - 풍선하트가 하늘로 퐁퐁 솟구치는 모션 */
  @keyframes balloon-rise-1 {
    0% { transform: translate(-3px, 14px) scale(0.25) rotate(-18deg); opacity: 0; }
    20% { opacity: 1; }
    100% { transform: translate(-18px, -30px) scale(1) rotate(22deg); opacity: 0; }
  }
  @keyframes balloon-rise-2 {
    0% { transform: translate(3px, 14px) scale(0.25) rotate(18deg); opacity: 0; }
    30% { opacity: 1; }
    100% { transform: translate(18px, -30px) scale(1) rotate(-22deg); opacity: 0; }
  }
  @keyframes vintage-float {
    0%, 100% { transform: scale(1) translateY(0px); }
    40% { transform: scale(1.22) translateY(-3px); }
    70% { transform: scale(0.95) translateY(1.5px); }
  }
  .animate-vintage-heart { animation: vintage-float 2.6s ease-in-out infinite; transform-origin: center; overflow: visible; }
  .animate-balloon-1 { animation: balloon-rise-1 2.4s ease-in-out infinite; }
  .animate-balloon-2 { animation: balloon-rise-2 2.7s ease-in-out infinite; animation-delay: 1s; }

  /* 5. 포토부스 - 두 하트가 빙글빙글 공전하며 충돌 댄스 */
  @keyframes photobooth-orbit {
    0%, 100% { transform: rotate(-10deg) scale(0.9); }
    25% { transform: rotate(16deg) scale(1.28); filter: drop-shadow(0 0 7px rgba(253,164,175,0.85)); }
    50% { transform: rotate(-5deg) scale(1.04); }
    75% { transform: rotate(20deg) scale(1.2); filter: drop-shadow(0 0 5px rgba(251,113,133,0.65)); }
  }
  .animate-photobooth-heart { animation: photobooth-orbit 1.9s ease-in-out infinite; transform-origin: center; overflow: visible; }

  /* 6. 소울메이트 - 빈 하트가 붉게 채워지며 빛나는 필(Fill) 모션 */
  @keyframes soulmate-fill {
    0%, 100% { transform: scale(0.88); fill: none; stroke: #fda4af; stroke-width: 2.5; filter: none; }
    20% { transform: scale(1.06); fill: #fecdd3; stroke: none; filter: drop-shadow(0 0 3px rgba(253,164,175,0.5)); }
    45% { transform: scale(1.28); fill: #fb7185; stroke: none; filter: drop-shadow(0 0 8px rgba(251,113,133,0.8)); }
    68% { transform: scale(1.12); fill: #f43f5e; stroke: none; filter: drop-shadow(0 0 6px rgba(244,63,94,0.7)); }
    86% { transform: scale(0.96); fill: #fecdd3; stroke: none; filter: drop-shadow(0 0 2px rgba(254,205,211,0.4)); }
  }
  .animate-soulmate-heart { animation: soulmate-fill 2.8s ease-in-out infinite; transform-origin: center; overflow: visible; }

  /* 7. 포레스트 바람 부는 리프 브리딩 (초록 퇴출, 로즈골드 우아함) */
  @keyframes rose-leaf-sway {
    0%, 100% { transform: rotate(-8deg) scale(0.95); }
    50% { transform: rotate(8deg) scale(1.12); filter: drop-shadow(0 0 4px rgba(244,114,182,0.45)); }
  }
  .animate-forest-heart { animation: rose-leaf-sway 2.5s ease-in-out infinite; transform-origin: center; overflow: visible; }

  /* 8. 흑백 로맨틱 - 심전도처럼 강하게 터지는 비트 박동 */
  @keyframes bw-ecg-beat {
    0%, 100% { transform: scale(1); filter: drop-shadow(0 0 0px #374151); }
    10% { transform: scale(1.48); filter: drop-shadow(0 0 10px rgba(55,65,81,0.8)); }
    20% { transform: scale(0.82); filter: drop-shadow(0 0 2px #374151); }
    32% { transform: scale(1.22); filter: drop-shadow(0 0 5px rgba(55,65,81,0.5)); }
    50% { transform: scale(1); filter: drop-shadow(0 0 0px #374151); }
  }
  .animate-bw-heart { animation: bw-ecg-beat 1.5s ease-in-out infinite; transform-origin: center; overflow: visible; }

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

  /* 11. 미니멀 퓨어 - 은은하게 나타났다 사라지는 크리스탈 글로우 펄스 (회전 없음) */
  @keyframes pure-crystal-sparkle {
    0%, 100% { transform: scale(0.88); opacity: 0.35; filter: none; }
    30% { transform: scale(1.08); opacity: 0.75; filter: drop-shadow(0 0 2px rgba(115,115,115,0.4)); }
    55% { transform: scale(1.18); opacity: 1; filter: drop-shadow(0 0 5px rgba(115,115,115,0.55)); }
    80% { transform: scale(1.05); opacity: 0.8; filter: drop-shadow(0 0 2px rgba(115,115,115,0.3)); }
  }
  .animate-minimal-heart { animation: pure-crystal-sparkle 2.4s ease-in-out infinite; transform-origin: center; overflow: visible; }

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
function renderTemplateHeart(templateId: string) {
  // 잘림을 원천 차단하기 위해 넉넉한 32x32 뷰박스 활용 및 overflow visible 적용
  const svgClass = "w-[18px] h-[18px] overflow-visible select-none";

  const microHearts = (
    <>
      <span className="courier-micro-heart-1">❤️</span>
      <span className="courier-micro-heart-2">💗</span>
    </>
  );

  if (templateId === 'classic-arch') {
    // 💓 클래식 아치 - 두근두근 골드브라운 앰버 하트 (심장박동 & 파동 서클 배치)
    return (
      <span className="relative flex items-center justify-center shrink-0 w-5 h-5 overflow-visible">
        {microHearts}
        {/* 파동용 서클 */}
        <svg viewBox="0 0 32 32" className={`absolute ${svgClass} animate-classic-wave`} fill="none">
          <path d="M16 26.5L13.8 24.5C6.5 17.8 2 13.8 2 9C2 5 5 2 9 2C11.5 2 13.9 3.3 16 5.3C18.1 3.3 20.5 2 23 2C27 2 30 5 30 9C30 13.8 25.5 17.8 18.2 24.5L16 26.5Z" stroke="#c9a882" strokeWidth="1.5" opacity="0.6" />
        </svg>
        {/* 실제 메인 하트 */}
        <svg viewBox="0 0 32 32" className={`${svgClass} animate-classic-heart`} fill="#c9a882">
          <path d="M16 26.5L13.8 24.5C6.5 17.8 2 13.8 2 9C2 5 5 2 9 2C11.5 2 13.9 3.3 16 5.3C18.1 3.3 20.5 2 23 2C27 2 30 5 30 9C30 13.8 25.5 17.8 18.2 24.5L16 26.5Z" />
        </svg>
      </span>
    );
  }

  if (templateId === 'editorial-journal') {
    // 📡 에디토리얼 - 시그널 와이파이 라벤더 하트 (머리 위 2중 전파 아크)
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
    // 💘 매거진 - 텐션 큐피트 루비 하트 (화살 대각 관통 & 미세 진동)
    return (
      <span className="relative flex items-center justify-center shrink-0 w-5 h-5 overflow-visible">
        {microHearts}
        <svg viewBox="0 0 32 32" className={`${svgClass} animate-magazine-heart`} fill="none" strokeLinecap="round" strokeLinejoin="round">
          {/* 화살촉 (하트 뒷면 관통) */}
          <path d="M16 16 L29 3" stroke="#ffffff" strokeWidth="2.5" />
          <path d="M16 16 L29 3" stroke="#2a2a2a" strokeWidth="1.2" />
          <path d="M29 3 L24 3 M29 3 L29 8" stroke="#2a2a2a" strokeWidth="2" />
          {/* 루비 RED 하트 */}
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
    // 💕 폴라로이드 - 퐁퐁 솟구쳐 비상하는 듀얼 풍선 하트
    return (
      <span className="relative flex items-center justify-center shrink-0 w-5 h-5 overflow-visible">
        {microHearts}
        {/* 하늘로 퐁퐁 날아가는 마이크로 하트 풍선들 */}
        <span className="absolute animate-balloon-1 pointer-events-none select-none text-[8px]">💖</span>
        <span className="absolute animate-balloon-2 pointer-events-none select-none text-[7px]">💗</span>
        {/* 메인 하트 */}
        <svg viewBox="0 0 32 32" className={`${svgClass} animate-vintage-heart`} fill="#fbcfe8" stroke="#f43f5e" strokeWidth="1.5">
          <path d="M16 26.5L13.8 24.5C6.5 17.8 2 13.8 2 9C2 5 5 2 9 2C11.5 2 13.9 3.3 16 5.3C18.1 3.3 20.5 2 23 2C27 2 30 5 30 9C30 13.8 25.5 17.8 18.2 24.5L16 26.5Z" />
        </svg>
      </span>
    );
  }

  if (templateId === 'photobooth') {
    // 💞 포토부스 - 스파이럴 코랄 핑크 듀얼 댄싱 하트 (나선 공전 댄스)
    return (
      <span className="relative flex items-center justify-center shrink-0 w-5 h-5 overflow-visible">
        {microHearts}
        <svg viewBox="0 0 32 32" className={`${svgClass} animate-photobooth-heart`} fill="#fda4af">
          {/* 메인 큰 하트 */}
          <path d="M14 24L12 22.2C5.5 16.3 1.5 12.7 1.5 8.5C1.5 5 4 2.5 7.5 2.5C9.7 2.5 11.8 3.7 13 5.5C14.2 3.7 16.3 2.5 18.5 2.5C22 2.5 24.5 5 24.5 8.5C24.5 12.7 20.5 16.3 14 22.2L14 24Z" />
          {/* 뒤에 포개진 귀여운 보조 하트 */}
          <path d="M22 29L20.5 27.6C15.6 23 12.5 20.2 12.5 17C12.5 14.3 14.4 12.4 17.1 12.4C18.8 12.4 20.4 13.3 21.3 14.7C22.2 13.3 23.8 12.4 25.5 12.4C28.2 12.4 30.1 14.3 30.1 17C30.1 20.2 27 23 22.1 27.6L22 29Z" fill="#fb7185" opacity="0.85" />
        </svg>
      </span>
    );
  }

  if (templateId === 'soulmate-oval') {
    // 💗 소울메이트 - 매핑 트랜스포밍 체인저 하트 (속이 비었다 채워지고 별빛으로 형태 전환)
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
    // 🌿💝 포레스트 - 에코 로즈골드 보태니컬 하트 (초록색 퇴출! 우아한 로즈골드 리프 장착)
    return (
      <span className="relative flex items-center justify-center shrink-0 w-5 h-5 overflow-visible">
        {microHearts}
        <svg viewBox="0 0 32 32" className={`${svgClass} animate-forest-heart`} fill="none" stroke="#f472b6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {/* 메인 우아한 로즈골드 광택 하트 */}
          <path d="M16 26.5L13.8 24.5C6.5 17.8 2 13.8 2 9C2 5 5 2 9 2C11.5 2 13.9 3.3 16 5.3C18.1 3.3 20.5 2 23 2C27 2 30 5 30 9C30 13.8 25.5 17.8 18.2 24.5L16 26.5Z" fill="#fce7f3" />
        </svg>
      </span>
    );
  }

  if (templateId === 'bw-romantic') {
    // 🖤 흑백 로맨틱 - 영원의 피스톤 인피니티 챠콜 하트
    return (
      <span className="relative flex items-center justify-center shrink-0 w-5 h-5 overflow-visible">
        {microHearts}
        <svg viewBox="0 0 32 32" className={`${svgClass} animate-bw-heart`} fill="none">
          {/* 다크 챠콜톤 바디 */}
          <path d="M16 26.5L13.8 24.5C6.5 17.8 2 13.8 2 9C2 5 5 2 9 2C11.5 2 13.9 3.3 16 5.3C18.1 3.3 20.5 2 23 2C27 2 30 5 30 9C30 13.8 25.5 17.8 18.2 24.5L16 26.5Z" fill="#374151" stroke="#4b5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }

  if (templateId === 'golden-frame') {
    // 👑💛 골든프레임 - 로열 트윈클 엠퍼러 왕관 골드 하트 (별빛 보석 반짝임)
    return (
      <span className="relative flex items-center justify-center shrink-0 w-5 h-5 overflow-visible">
        {microHearts}
        <svg viewBox="0 0 32 32" className={`${svgClass} animate-gold-heart`} fill="#fef08a" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          {/* 24K 골드 하트 */}
          <path d="M16 27.5L13.8 25.5C6.5 18.8 2 14.8 2 10C2 6 5 3 9 3C11.5 3 13.9 4.3 16 6.3C18.1 4.3 20.5 3 23 3C27 3 30 6 30 10C30 14.8 25.5 18.8 18.2 25.5L16 27.5Z" />
          {/* 상단 우아한 로열 골드 왕관 */}
          <path d="M11 6 L13 10 L16 5 L19 10 L21 6 L23 12 L9 12 Z" fill="#d97706" stroke="none" />
          {/* 왕관 위 세 개의 빛나는 스타 다이아 보석 */}
          <circle cx="11" cy="5" r="1" fill="#ffffff" />
          <circle cx="16" cy="4" r="1" fill="#ffffff" />
          <circle cx="21" cy="5" r="1" fill="#ffffff" />
        </svg>
      </span>
    );
  }

  if (templateId === 'calligraphy-floral') {
    // 🌸💖 캘리그라피 - 피어나는 로맨틱 플라워 하트 (꽃잎 타임랩스 입체 개화)
    return (
      <span className="relative flex items-center justify-center shrink-0 w-5 h-5 overflow-visible">
        {microHearts}
        <svg viewBox="0 0 32 32" className={`${svgClass} animate-floral-heart`} fill="none">
          {/* 중앙 화사한 꽃술 하트 */}
          <path d="M16 24.5L14.2 22.8C8.2 17.3 4.5 14 4.5 10C4.5 6.5 7 4 10.5 4C12.5 4 14.5 5.2 16 7C17.5 5.2 19.5 4 21.5 4C25 4 27.5 6.5 27.5 10C27.5 14 23.8 17.3 17.8 22.8L16 24.5Z" fill="#ffe4e6" stroke="#e11d48" strokeWidth="1" />
          {/* 주변을 동그랗게 감싸며 개화하는 5엽 꽃잎 실루엣 */}
          <circle cx="16" cy="8" r="3.5" fill="#fecdd3" opacity="0.85" />
          <circle cx="11" cy="13" r="3.5" fill="#fecdd3" opacity="0.85" />
          <circle cx="21" cy="13" r="3.5" fill="#fecdd3" opacity="0.85" />
          <circle cx="13" cy="19" r="3.5" fill="#fecdd3" opacity="0.85" />
          <circle cx="19" cy="19" r="3.5" fill="#fecdd3" opacity="0.85" />
          {/* 하트 내부 꽃술 데코 */}
          <circle cx="16" cy="13" r="1.5" fill="#e11d48" />
        </svg>
      </span>
    );
  }

  if (templateId === 'minimal-pure') {
    // ✦🤍 미니멀 퓨어 - 깔끔한 라인 하트 + 중앙 작은 닷 글로우
    return (
      <span className="relative flex items-center justify-center shrink-0 w-5 h-5 overflow-visible">
        {microHearts}
        <svg viewBox="0 0 32 32" className={`${svgClass} animate-minimal-heart`} fill="none">
          {/* 얇고 정갈한 스트로크 하트 */}
          <path
            d="M16 26.5L13.8 24.5C6.5 17.8 2 13.8 2 9C2 5 5 2 9 2C11.5 2 13.9 3.3 16 5.3C18.1 3.3 20.5 2 23 2C27 2 30 5 30 9C30 13.8 25.5 17.8 18.2 24.5L16 26.5Z"
            fill="#f5f5f5"
            stroke="#9ca3af"
            strokeWidth="1.6"
          />
          {/* 중앙 미니멀 포인트 닷 */}
          <circle cx="16" cy="14" r="1.8" fill="#9ca3af" />
          {/* 상단 좌우 반짝이 작은 닷 */}
          <circle cx="10" cy="8" r="0.9" fill="#d1d5db" />
          <circle cx="22" cy="8" r="0.9" fill="#d1d5db" />
        </svg>
      </span>
    );
  }

  if (templateId === 'pastel-photostrip') {
    // 🌈 파스텔 - 오로라 플루이드 멜팅 하트 (파스텔 물방울 무지개 컬러시프트)
    return (
      <span className="relative flex items-center justify-center shrink-0 w-5 h-5 overflow-visible">
        {microHearts}
        <svg viewBox="0 0 32 32" className={`${svgClass} animate-pastel-heart`}>
          {/* 유기적 물방울 감성의 파스텔 멜팅 하트 */}
          <path d="M16 28C14.5 28 13 27.2 11.8 26C5.5 19.8 1.5 15.8 1.5 11C1.5 6.5 5 3 9.5 3C11.8 3 14 4.3 16 6.3C18 4.3 20.2 3 22.5 3C27 3 30.5 6.5 30.5 11C30.5 15.8 26.5 19.8 20.2 26C19 27.2 17.5 28 16 28Z" />
        </svg>
      </span>
    );
  }

  return null;
}

export function GalleryTemplateCard({ style, info }: TemplateCardProps) {
  const props = { info };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: HEART_STYLES }} />
      {(() => {
        switch (style) {
          case 'classic-arch':
            return <ClassicArch {...props} />;
          case 'editorial-journal':
            return <EditorialJournal {...props} />;
          case 'magazine-torn':
            return <MagazineTorn {...props} />;
          case 'polaroid-vintage':
            return <PolaroidVintage {...props} />;
          case 'photobooth':
            return <Photobooth {...props} />;
          case 'soulmate-oval':
            return <SoulmateOval {...props} />;
          case 'forest-classic':
            return <ForestClassic {...props} />;
          case 'bw-romantic':
            return <BWRomantic {...props} />;
          case 'golden-frame':
            return <GoldenFrame {...props} />;
          case 'calligraphy-floral':
            return <CalligraphyFloral {...props} />;
          case 'minimal-pure':
            return <MinimalPure {...props} />;
          case 'pastel-photostrip':
            return <PastelPhotostrip {...props} />;
          default:
            return null;
        }
      })()}
    </>
  );
}

// 1. 클래식 아치 (ClassicArch)
function ClassicArch({ info }: { info: WeddingInfo }) {
  return (
    <div className="w-full h-full bg-[#fdf8f5] flex flex-col items-center overflow-hidden">
      <div className="relative mt-5 w-[75%]">
        <div
          className="w-full bg-cover"
          style={{
            backgroundImage: `url(${WEDDING_1})`,
            backgroundPosition: 'center 15%',
            borderRadius: '50% 50% 0 0 / 55% 55% 0 0',
            aspectRatio: '3/4',
          }}
        />
      </div>
      <div className="flex flex-col items-center mt-3 px-4 text-center gap-1">
        <div
          className="relative flex items-center justify-center gap-4 text-[12px] font-medium whitespace-nowrap"
          style={{ color: '#7a6655', fontFamily: 'Georgia, serif' }}
        >
          <span>{info.groomName}</span>
          {renderTemplateHeart('classic-arch')}
          <span>{info.brideName}</span>
        </div>
        <p
          className="text-center text-[7.5px] mt-1.5 mb-0.5"
          style={{ color: '#7a6655', fontFamily: "'Nanum Myeongjo', 'Georgia', serif", letterSpacing: '0.05em' }}
        >
          2027-11-08 오전 11시 롯데 호텔 크리스탈 볼룸
        </p>
      </div>
    </div>
  );
}

// 2. 에디토리얼 저널 (EditorialJournal)
function EditorialJournal({ info }: { info: WeddingInfo }) {
  return (
    <div className="w-full h-full bg-[#f7f3ee] flex flex-col overflow-hidden">
      <p
        className="text-center text-[7px] tracking-[0.2em] mt-4 mb-2"
        style={{ color: '#8a7a6a', fontFamily: 'Georgia, serif' }}
      >
        SAVE THE DATE
      </p>
      <div
        className="mx-4 flex-1 bg-cover"
        style={{ backgroundImage: `url(${WEDDING_2})`, backgroundPosition: 'center 15%', maxHeight: '55%' }}
      />
      <p
        className="text-center text-[7px] italic mt-2"
        style={{ color: '#9a8a7a', fontFamily: 'Georgia, serif' }}
      >
        — a story written in love —
      </p>
      <div
        className="flex flex-col items-center mt-2 pb-3"
        style={{ fontFamily: 'Georgia, serif' }}
      >
        <div className="relative flex items-center justify-center gap-4 text-[11px] font-medium whitespace-nowrap" style={{ color: '#4a3a2a' }}>
          <span>{info.groomName}</span>
          {renderTemplateHeart('editorial-journal')}
          <span>{info.brideName}</span>
        </div>
        <p
          className="text-center text-[7px] mt-2 tracking-wider"
          style={{ color: '#4a3a2a', fontFamily: "'Playfair Display', 'Georgia', serif", fontStyle: 'italic', letterSpacing: '0.02em' }}
        >
          2027-11-08 오전 11시 롯데 호텔 크리스탈 볼룸
        </p>
      </div>
    </div>
  );
}

// 3. 매거진 감성 (MagazineTorn)
function MagazineTorn({ info }: { info: WeddingInfo }) {
  return (
    <div className="w-full h-full flex flex-col overflow-hidden" style={{ background: '#1a1a1a' }}>
      <div
        className="w-full bg-cover"
        style={{ backgroundImage: `url(${WEDDING_6})`, backgroundPosition: 'center 15%', height: '62%', flexShrink: 0 }}
      />
      <div
        className="relative -mt-3 flex-1"
        style={{
          background: 'white',
          clipPath: 'polygon(0 15px, 5% 0, 12% 12px, 22% 2px, 35% 15px, 50% 0, 65% 14px, 80% 2px, 92% 12px, 100% 0, 100% 100%, 0 100%)',
        }}
      >
        <p
          className="text-center text-[9px] italic mt-5"
          style={{ color: '#c0a090', fontFamily: 'Georgia, serif' }}
        >
          Always & Forever
        </p>
        <div className="flex flex-col items-center mt-1">
          <div className="relative flex items-center justify-center gap-4 text-[10px] font-bold whitespace-nowrap" style={{ color: '#4a3a2a' }}>
            <span>{info.groomName}</span>
            {renderTemplateHeart('magazine-torn')}
            <span>{info.brideName}</span>
          </div>
          <p
            className="text-center text-[6.5px] mt-1.5 uppercase tracking-[0.25em]"
            style={{ color: '#4a3a2a', fontFamily: "'Montserrat', sans-serif" }}
          >
            2027.11.08 | THE HOTEL CRYSTAL
          </p>
        </div>
      </div>
    </div>
  );
}

// 4. 빈티지 폴라로이드 (PolaroidVintage)
function PolaroidVintage({ info }: { info: WeddingInfo }) {
  return (
    <div className="w-full h-full bg-white flex flex-col items-center justify-center overflow-hidden">
      <div
        className="bg-white p-2 pb-5 shadow-md"
        style={{ width: '75%', transform: 'rotate(-2deg)', boxShadow: '0 4px 15px rgba(0,0,0,0.12)' }}
      >
        <div
          className="w-full bg-cover"
          style={{ backgroundImage: `url(${WEDDING_3})`, backgroundPosition: 'center 15%', aspectRatio: '1/1' }}
        />
      </div>
      <div className="flex flex-col items-center mt-4 text-center">
        <div className="relative flex items-center justify-center gap-4 text-[10px] font-medium whitespace-nowrap" style={{ color: '#4a3a2a', fontFamily: 'Georgia, serif' }}>
          <span>{info.groomName}</span>
          {renderTemplateHeart('polaroid-vintage')}
          <span>{info.brideName}</span>
        </div>
        <p
          className="text-center text-[7.5px] mt-1.5 font-bold"
          style={{ color: '#6a5a4a', fontFamily: "'Courier New', Courier, monospace", letterSpacing: '0.05em' }}
        >
          2027-11-08 오전 11시 롯데 호텔 크리스탈 볼룸
        </p>
      </div>
    </div>
  );
}

// 5. 포토부스 (Photobooth)
function Photobooth({ info }: { info: WeddingInfo }) {
  return (
    <div className="w-full h-full bg-[#fde8ef] flex flex-col items-center justify-center py-4 gap-3 overflow-hidden">
      <div className="flex flex-col gap-2 w-[70%]">
        <div
          className="w-full bg-cover rounded"
          style={{ backgroundImage: `url(${WEDDING_1})`, backgroundPosition: 'center 15%', aspectRatio: '4/3' }}
        />
        <div
          className="w-full bg-cover rounded"
          style={{ backgroundImage: `url(${WEDDING_4})`, backgroundPosition: 'center 15%', aspectRatio: '4/3' }}
        />
      </div>
      <div className="relative flex flex-col items-center gap-1 mt-1">
        <div
          className="relative flex items-center justify-center gap-4 text-[11px] italic font-bold whitespace-nowrap"
          style={{ color: '#c0506a', fontFamily: "'Dancing Script', Georgia, serif" }}
        >
          <span>{info.groomName}</span>
          {renderTemplateHeart('photobooth')}
          <span>{info.brideName}</span>
        </div>
        <p
          className="text-center text-[7.5px] mt-1.5 font-bold"
          style={{ color: '#6a5a4a', fontFamily: "'Courier New', Courier, monospace", letterSpacing: '0.05em' }}
        >
          2027-11-08 오전 11시 롯데 호텔 크리스탈 볼룸
        </p>
      </div>
    </div>
  );
}

// 6. 소울메이트 오벌 (SoulmateOval)
function SoulmateOval({ info }: { info: WeddingInfo }) {
  return (
    <div className="w-full h-full bg-white flex flex-col items-center overflow-hidden">
      <p
        className="mt-5 text-[13px] italic"
        style={{ color: '#e879a8', fontFamily: "'Dancing Script', Georgia, serif" }}
      >
        Soulmates
      </p>
      <div className="mt-2 w-[65%]">
        <div
          className="w-full bg-cover"
          style={{
            backgroundImage: `url(${WEDDING_2})`,
            backgroundPosition: 'center 15%',
            aspectRatio: '3/4',
            borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
          }}
        />
      </div>
      <div className="flex flex-col items-center mt-2 pb-3 gap-1">
        <div
          className="relative flex items-center justify-center gap-4 text-[11px] font-medium whitespace-nowrap"
          style={{ color: '#c0618a', fontFamily: 'Georgia, serif' }}
        >
          <span>{info.groomName}</span>
          {renderTemplateHeart('soulmate-oval')}
          <span>{info.brideName}</span>
        </div>
        <p className="text-[7px] text-center" style={{ color: '#c0618a' }}>
          2027-11-08 오전 11시 롯데 호텔 크리스탈 볼룸
        </p>
      </div>
    </div>
  );
}

// 7. 숲속의 약속 (ForestClassic)
function ForestClassic({ info }: { info: WeddingInfo }) {
  return (
    <div className="w-full h-full bg-[#f5f2ee] flex flex-col overflow-hidden">
      <div className="flex justify-center mt-4 mb-2">
        <div className="text-center" style={{ fontFamily: 'Georgia, serif' }}>
          <div className="relative flex items-center justify-center gap-4 text-[10px] mt-1 font-medium whitespace-nowrap" style={{ color: '#8a7a6a' }}>
            <span>{info.groomName}</span>
            {renderTemplateHeart('forest-classic')}
            <span>{info.brideName}</span>
          </div>
        </div>
      </div>
      <div
        className="flex-1 mx-3 bg-cover"
        style={{ backgroundImage: `url(${WEDDING_3})`, backgroundPosition: 'center 15%' }}
      />
      <p
        className="text-center text-[7px] my-2"
        style={{ color: '#8a7a6a', fontFamily: "'Georgia', serif", fontStyle: 'italic', letterSpacing: '0.05em' }}
      >
        2027-11-08 오전 11시 롯데 호텔 크리스탈 볼룸
      </p>
    </div>
  );
}

// 8. 흑백 로맨틱 / 미니멀 뷰어 (BWRomantic)
function BWRomantic({ info }: { info: WeddingInfo }) {
  return (
    <div className="w-full h-full bg-white flex flex-col overflow-hidden">
      <div
        className="w-full bg-cover"
        style={{
          backgroundImage: `url(${WEDDING_4})`,
          backgroundPosition: 'center 15%',
          height: '65%',
          filter: 'grayscale(100%)',
          flexShrink: 0,
        }}
      />
      <div
        className="flex flex-col items-center justify-center flex-1 pb-2"
        style={{ fontFamily: 'Georgia, serif' }}
      >
        <div className="relative flex items-center justify-center gap-4 text-[10px] font-medium whitespace-nowrap" style={{ color: '#2a2a2a' }}>
          <span>{info.groomName}</span>
          {renderTemplateHeart('bw-romantic')}
          <span>{info.brideName}</span>
        </div>
        <p
          className="text-[7px] mt-1"
          style={{ color: '#5a5a5a', fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: '300', letterSpacing: '0.1em' }}
        >
          2027-11-08 오전 11시 롯데 호텔 크리스탈 볼룸
        </p>
      </div>
    </div>
  );
}

// 9. 미니멀 클래식 (GoldenFrame)
function GoldenFrame({ info }: { info: WeddingInfo }) {
  return (
    <div
      className="w-full h-full bg-white flex flex-col items-center justify-center overflow-hidden"
      style={{ fontFamily: 'Georgia, serif' }}
    >
      <div
        className="w-[85%] h-[90%] flex flex-col items-center justify-center py-4 gap-2.5"
        style={{ border: '3px solid #c9a240' }}
      >
        <p className="text-[7px] tracking-[0.25em]" style={{ color: '#4a3a2a' }}>
          SAVE THE DATE
        </p>
        <div
          className="w-[75%] aspect-[4/3] bg-cover rounded-sm"
          style={{ backgroundImage: `url(${WEDDING_1})`, backgroundPosition: 'center 15%' }}
        />
        <div className="text-center flex flex-col items-center gap-1">
          <div className="relative flex items-center justify-center gap-6 text-[10px] font-bold tracking-[0.1em]" style={{ color: '#8a6a2a' }}>
            <span>{info.groomName}</span>
            {renderTemplateHeart('golden-frame')}
            <span>{info.brideName}</span>
          </div>
          <p
            className="text-[6.5px] mt-1"
            style={{ color: '#8a6a2a', fontFamily: "'Cinzel', 'Noto Serif KR', serif", letterSpacing: '0.12em', fontWeight: 'normal' }}
          >
            2027-11-08 오전 11시 롯데 호텔 크리스탈 볼룸
          </p>
        </div>
      </div>
    </div>
  );
}

// 10. 캘리그라피 플로럴 (CalligraphyFloral)
function CalligraphyFloral({ info }: { info: WeddingInfo }) {
  return (
    <div className="w-full h-full bg-[#fef9f5] flex flex-col overflow-hidden">
      <div
        className="w-full bg-cover"
        style={{ backgroundImage: `url(${WEDDING_5})`, backgroundPosition: 'center 15%', height: '60%', flexShrink: 0 }}
      />
      <div className="flex flex-col items-center flex-1 justify-center">
        <p
          className="text-[11px] italic"
          style={{ color: '#c07060', fontFamily: "'Dancing Script', Georgia, serif" }}
        >
          Join us to celebrate
        </p>
        <div className="relative flex items-center justify-center gap-6 text-[11px] mt-1.5 font-medium" style={{ color: '#4a3a2a' }}>
          <span>{info.groomName}</span>
          {renderTemplateHeart('calligraphy-floral')}
          <span>{info.brideName}</span>
        </div>
        <p
          className="text-[7px] mt-1.5"
          style={{ color: '#b07060', fontFamily: "'Dancing Script', 'Gowun Batang', serif", letterSpacing: '0.02em' }}
        >
          2027-11-08 오전 11시 롯데 호텔 크리스탈 볼룸
        </p>
      </div>
    </div>
  );
}

// 11. 미니멀 퓨어 (MinimalPure)
function MinimalPure({ info }: { info: WeddingInfo }) {
  return (
    <div
      className="w-full h-full bg-white flex flex-col overflow-hidden"
      style={{ fontFamily: 'Georgia, serif' }}
    >
      <div
        className="w-full bg-cover"
        style={{ backgroundImage: `url(${WEDDING_6})`, backgroundPosition: 'center 15%', height: '68%', flexShrink: 0 }}
      />
      <div className="flex flex-col items-center flex-1 justify-center px-3">
        <p className="text-[7px] tracking-[0.2em] mb-1.5" style={{ color: '#9a8a7a' }}>
          GROOM &nbsp;&nbsp; BRIDE
        </p>
        <div className="relative flex items-center justify-center gap-6 text-[10px] font-medium" style={{ color: '#3a2a1a' }}>
          <span>{info.groomName}</span>
          {renderTemplateHeart('minimal-pure')}
          <span>{info.brideName}</span>
        </div>
        <p
          className="text-[7px] mt-1.5"
          style={{ color: '#9a8a7a', fontFamily: "system-ui, -apple-system, sans-serif", letterSpacing: '0.05em', fontWeight: '400' }}
        >
          2027-11-08 오전 11시 롯데 호텔 크리스탈 볼룸
        </p>
      </div>
    </div>
  );
}

// 12. 파스텔 포토스트립 (PastelPhotostrip)
function PastelPhotostrip({ info }: { info: WeddingInfo }) {
  return (
    <div className="w-full h-full bg-gradient-to-tr from-[#fdf2f4] via-[#fbf0f6] to-[#faf5ff] flex flex-col items-center justify-center p-3.5 overflow-hidden">
      {/* 도톰한 입체 셰도우를 입힌 순백의 인생네컷 화이트 스트립 프레임 */}
      <div
        className="w-[82%] bg-white p-2.5 pb-4 rounded shadow-lg border border-[#f5ebf0]/50 flex flex-col gap-1.5 flex-shrink-0"
        style={{ transform: 'rotate(-1.5deg)' }}
      >
        {/* 슬림하고 간격이 완벽한 3단 인생네컷 사진 */}
        <div
          className="w-full aspect-[3/2.2] bg-cover rounded-sm border border-stone-100/30"
          style={{ backgroundImage: `url(${WEDDING_1})`, backgroundPosition: 'center 15%' }}
        />
        <div
          className="w-full aspect-[3/2.2] bg-cover rounded-sm border border-stone-100/30"
          style={{ backgroundImage: `url(${WEDDING_2})`, backgroundPosition: 'center 15%' }}
        />
        <div
          className="w-full aspect-[3/2.2] bg-cover rounded-sm border border-stone-100/30"
          style={{ backgroundImage: `url(${WEDDING_3})`, backgroundPosition: 'center 15%' }}
        />

        {/* 하단 서명 레터링란 감성 영역 */}
        <div className="flex flex-col items-center mt-2.5 gap-0.5">
          <div
            className="flex items-center justify-center gap-4 text-[10px] italic font-semibold whitespace-nowrap"
            style={{ color: '#b85474', fontFamily: "'Georgia', serif" }}
          >
            <span>{info.groomName}</span>
            {renderTemplateHeart('pastel-photostrip')}
            <span>{info.brideName}</span>
          </div>
          <p
            className="text-[6.5px] font-medium mt-0.5 text-center leading-normal"
            style={{ color: '#b85474', fontFamily: "'Courier New', monospace", letterSpacing: '0.05em', fontWeight: 'bold' }}
          >
            2027-11-08 오전 11시<br />롯데 호텔 크리스탈 볼룸
          </p>
        </div>
      </div>
    </div>
  );
}


