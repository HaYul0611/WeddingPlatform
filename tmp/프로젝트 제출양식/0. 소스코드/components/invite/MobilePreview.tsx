'use client';

import { useState, useEffect, useRef } from 'react';
import type { Invitation, InvitationSection, InvitationTheme, PreviewDevice } from '@/types/invitation';
import SectionRenderer from '@/components/invite/SectionRenderer';
import BgmPlayer from '@/components/invite/BgmPlayer';
import { Smartphone, Monitor, Signal, Wifi, Battery, Play, Heart, SkipBack, SkipForward, Music, Pause } from 'lucide-react';

interface MobilePreviewProps {
  invitation: Invitation;
  device: PreviewDevice;
  onDeviceChange?: (device: PreviewDevice) => void;
  selectedSectionId?: string;
  onSectionClick: (id: string) => void;
  onUpdateTheme?: (updates: Partial<InvitationTheme>) => void;
}

function SectionWrapper({ children, section, theme, selectedSectionId, onSectionClick }: {
  children: React.ReactNode;
  section: InvitationSection;
  theme: InvitationTheme;
  selectedSectionId?: string;
  onSectionClick: (id: string) => void;
}) {
  return (
    <div
      onClickCapture={(e) => {
        // RSVP 버튼 등 인터랙티브 요소는 이벤트 통과
        const target = e.target as HTMLElement;
        if (target.closest('button') || target.closest('input') || target.closest('select') || target.closest('textarea') || target.closest('a') || target.closest('label')) {
          return;
        }
        e.stopPropagation();
        onSectionClick(section.id);
      }}
      className="relative cursor-pointer transition-all duration-300 hover:bg-stone-100/60 rounded-2xl p-1"
    >
      {children}
    </div>
  );
}

function getPatternCSS(pattern: string, color: string) {
  if (pattern === 'none') return '';

  const patternUrls: Record<string, string> = {
    // ── Category 1. 클래식 & 전통 한지 무드 (8종) ──
    cozyHanji: '/images/patterns/traditional_cozy_hanji.jpg',
    traditionalTile: '/images/patterns/traditional_tile.jpg',
    palaceGrid: '/images/patterns/traditional_palace_grid.jpg',
    lotusVase: '/images/patterns/traditional_lotus_vase.jpg',
    coarseHemp: '/images/patterns/traditional_coarse_hemp.jpg',
    rainbowThread: '/images/patterns/traditional_rainbow_thread.jpg',
    goldSilkEmb: '/images/patterns/traditional_gold_silk_emb.jpg',
    orientalInk: '/images/patterns/traditional_oriental_ink.jpg',

    // ── Category 2. 로맨틱 & 보태니컬 플라워 (8종) ──
    margaretWreath: '/images/patterns/botanical_margaret_wreath.jpg',
    oliveGarden: '/images/patterns/botanical_olive_garden.jpg',
    flowerArch: '/images/patterns/botanical_flower_arch.jpg',
    roseGate: '/images/patterns/botanical_rose_gate.jpg',
    botanicalWatercolor: '/images/patterns/botanical_watercolor.jpg',
    mistFlower: '/images/patterns/botanical_mist_flower.jpg',
    lavenderBreeze: '/images/patterns/botanical_lavender_breeze.jpg',
    vintageLeafBorder: '/images/patterns/botanical_vintage_leaf_border.jpg',

    // ── Category 3. 내추럴 & 오가닉 패브릭 (8종) ──
    chiffonSilk: '/images/patterns/fabric_chiffon_silk.jpg',
    rawLinen: '/images/patterns/fabric_raw_linen.jpg',
    cozyFelt: '/images/patterns/fabric_cozy_felt.jpg',
    vintageCraft: '/images/patterns/fabric_vintage_craft.jpg',
    suedeMauve: '/images/patterns/fabric_suede_mauve.jpg',
    espressoWrinkle: '/images/patterns/fabric_espresso_wrinkle.jpg',
    satinNavy: '/images/patterns/fabric_satin_navy.jpg',
    roseVelvet: '/images/patterns/fabric_rose_velvet.jpg',

    // ── Category 4. 미니멀 & 모던 스톤 (8종) ──
    italianVein: '/images/patterns/stone_italian_vein.jpg',
    coarseSand: '/images/patterns/stone_coarse_sand.jpg',
    charcoalCement: '/images/patterns/stone_charcoal_cement.jpg',
    antiqueGoldCrack: '/images/patterns/stone_antique_gold_crack.jpg',
    blackMatteSteel: '/images/patterns/stone_black_matte_steel.jpg',
    pearlRock: '/images/patterns/stone_pearl_rock.jpg',
    taupeMud: '/images/patterns/stone_taupe_mud.jpg',
    gypsumPress: '/images/patterns/stone_gypsum_press.jpg',

    // ── Category 5. 유니크 & 디자인 텍스처 (8종) ──
    goldGlitter: '/images/patterns/unique_gold_glitter.jpg',
    seashellPearl: '/images/patterns/unique_seashell_pearl.jpg',
    doubleArch: '/images/patterns/unique_double_arch.jpg',
    postalEnvelope: '/images/patterns/unique_postal_envelope.jpg',
    filmCinema: '/images/patterns/unique_film_cinema.jpg',
    champagneGoldWave: '/images/patterns/unique_champagne_gold_wave.jpg',
    crystalDrops: '/images/patterns/unique_crystal_drops.jpg',
    sweetBabyHeart: '/images/patterns/unique_sweet_baby_heart.jpg',
  };

  if (patternUrls[pattern]) {
    return `url("${patternUrls[pattern]}")`;
  }

  return '';
}

// 메인 이미지 효과 컴포넌트
const ButterflySVG = ({ color }: { color: string }) => (
  <svg viewBox="0 0 100 100" className="w-full h-full" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.12))' }}>
    <style>{`
      @keyframes flap-l {
        0% { transform: scaleX(1); }
        100% { transform: scaleX(0.25); }
      }
      @keyframes flap-r {
        0% { transform: scaleX(1); }
        100% { transform: scaleX(0.25); }
      }
    `}</style>
    {/* Left wing group with flapping animation and crisp outline */}
    <g style={{ transformOrigin: '50px 50px', animation: 'flap-l 0.5s ease-in-out infinite alternate' }}>
      <path d="M50 50 C 30 12, 4 18, 14 50 C 4 65, 24 78, 50 60" fill={color} stroke="rgba(0,0,0,0.12)" strokeWidth="1.2" />
    </g>
    {/* Right wing group with flapping animation and crisp outline */}
    <g style={{ transformOrigin: '50px 50px', animation: 'flap-r 0.5s ease-in-out infinite alternate' }}>
      <path d="M50 50 C 70 12, 96 18, 86 50 C 96 65, 76 78, 50 60" fill={color} stroke="rgba(0,0,0,0.12)" strokeWidth="1.2" />
    </g>
    {/* Body */}
    <path d="M49 32 Q50 30 51 32 L51.5 68 Q50 70 48.5 68 Z" fill="rgba(80, 90, 100, 0.6)" />
    {/* Antennae */}
    <path d="M49 32 Q45 23 41 25 M51 32 Q55 23 59 25" fill="none" stroke="rgba(80, 90, 100, 0.6)" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const CherryPetalSVG = ({ color }: { color: string }) => (
  <svg viewBox="0 0 24 24" className="w-full h-full">
    {/* A realistic delicate cherry blossom petal */}
    <path
      d="M12 2 C8 4, 6 9, 8 15 C10 19, 14 20, 16 16 C18 12, 16 6, 12 2 Z"
      fill={color}
    />
    {/* Tiny darker gradient inside the petal for a 3D feel */}
    <path
      d="M12 8 C10 9, 9 12, 10 15 C11 17, 13 17, 14 15 Z"
      fill="rgba(244, 143, 177, 0.3)"
    />
  </svg>
);

const RosePetalSVG = ({ color }: { color: string }) => (
  <svg viewBox="0 0 100 100" className="w-full h-full" style={{ filter: 'drop-shadow(0 4.5px 9px rgba(0,0,0,0.28))' }}>
    <defs>
      {/* 2nd 이미지의 벨벳 같은 깊이와 자연스러운 생화를 구현하기 위한 방사형 그라데이션 */}
      <radialGradient id={`rose-velvet-${color}`} cx="45%" cy="35%" r="65%">
        <stop offset="0%" stopColor="#ff4081" /> {/* 부드러운 분홍빛 광택 */}
        <stop offset="30%" stopColor="#e91e63" />
        <stop offset="70%" stopColor={color} /> {/* 크림슨 레드 */}
        <stop offset="100%" stopColor="#3f000b" /> {/* 가장자리 그늘진 벨벳 다크레드 */}
      </radialGradient>
    </defs>

    {/* 자연스러운 비대칭(asymmetrical) 및 유기적인 생화 장미꽃잎 형상 */}
    {/* 밑부분은 가늘게 모이고, 위쪽은 자연스럽게 둥글고 한쪽이 살짝 삐져나온 리얼 꽃잎 */}
    <path
      d="M48 94 C18 88, 3 66, 6 42 C8 24, 26 6, 50 10 C74 13, 96 22, 92 48 C88 72, 72 90, 48 94 Z"
      fill={`url(#rose-velvet-${color})`}
    />

    {/* 밑부분의 생기 넘치는 반투명 하이라이트 레이어 (비대칭) */}
    <path
      d="M48 94 C32 90, 22 78, 25 60 C28 45, 42 42, 52 45 C64 48, 70 62, 65 78 C60 90, 56 94, 48 94 Z"
      fill="rgba(255, 128, 171, 0.42)"
    />

    {/* 2번째 이미지 특유의 말려 들어간 입체적 테두리 반사광 (자연스럽게 물결치는 형상) */}
    <path
      d="M12 36 C28 20, 68 16, 84 28 C70 24, 28 26, 12 36 Z"
      fill="#ffffff"
      opacity="0.25"
    />
    <path
      d="M8 48 C20 34, 76 30, 88 42 C76 38, 22 38, 8 48 Z"
      fill="#ffffff"
      opacity="0.14"
    />

    {/* 생화다운 3D 미세 결맥(vein lines) */}
    <path d="M48 94 Q40 62 30 30" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" fill="none" />
    <path d="M48 94 Q48 58 48 20" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" fill="none" />
    <path d="M48 94 Q56 62 68 32" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" fill="none" />
  </svg>
);

const FeatherSVG = () => {
  // 깃대(Shaft)의 유려한 베지에 곡선 좌표 생성: P0 = (25, 95), P1 = (55, 65), P2 = (90, 25)
  const getShaftPoint = (t: number) => {
    const x = (1 - t) * (1 - t) * 25 + 2 * (1 - t) * t * 55 + t * t * 90;
    const y = (1 - t) * (1 - t) * 95 + 2 * (1 - t) * t * 65 + t * t * 25;
    return { x, y };
  };

  const barbsCount = 35;
  const leftBarbs: string[] = [];
  const rightBarbs: string[] = [];

  for (let i = 2; i <= barbsCount; i++) {
    const t = i / barbsCount;
    const { x, y } = getShaftPoint(t);

    // 중앙부는 두껍고 끝으로 갈수록 슬림해지는 천연 날개 깃 구조 매핑
    const barbLength = 22 * Math.sin(t * Math.PI);

    // 왼쪽 깃털(barbs): 깃대에서 비스듬히 뻗어나가며 우아하게 상향 곡선
    const lx = x - barbLength * 0.95;
    const ly = y - barbLength * 0.35 - (1 - t) * 8;
    const lcx = x - barbLength * 0.5;
    const lcy = y - barbLength * 0.1;
    leftBarbs.push(`M ${x} ${y} Q ${lcx} ${lcy} ${lx} ${ly}`);

    // 오른쪽 깃털(barbs): 대칭형으로 비스듬히 뻗어나가며 우아하게 상향 곡선
    const rx = x + barbLength * 0.95;
    const ry = y - barbLength * 0.35 - (1 - t) * 8;
    const rcx = x + barbLength * 0.5;
    const rcy = y - barbLength * 0.1;
    rightBarbs.push(`M ${x} ${y} Q ${rcx} ${rcy} ${rx} ${ry}`);
  }

  return (
    <svg viewBox="0 0 110 110" className="w-full h-full" style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.14))' }}>
      {/* 솜털 깃털 고유의 은은하고 부드러운 화이트 바디 볼륨 필터 */}
      <path
        d="M 25 95 Q 10 75 35 45 Q 60 20 90 25 Q 85 55 58 80 Z"
        fill="#FFFFFF"
        opacity="0.15"
      />

      {/* 1. 깃대 하단(Quill end)의 보풀보풀하고 흩날리는 다운 솜털(Downy tufts) */}
      <g stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.9">
        <path d="M 25 95 Q 12 102 8 98" />
        <path d="M 25 95 Q 15 106 18 108" />
        <path d="M 28 90 Q 14 96 10 90" />
        <path d="M 28 90 Q 16 101 22 103" />
        <path d="M 31 85 Q 15 90 12 84" />
        <path d="M 31 85 Q 18 95 24 97" />
        {/* 아주 곱슬곱슬한 세사 파이버 */}
        <path d="M 24 96 C 18 90, 12 75, 20 68" strokeWidth="0.8" opacity="0.75" />
        <path d="M 28 90 C 22 84, 18 70, 26 63" strokeWidth="0.8" opacity="0.75" />
      </g>

      {/* 2. 유저 참고 이미지 속 빗살형 평행선 바브(Barb Stripes) 패턴 동적 생성 */}
      <g stroke="#ffffff" strokeWidth="1.1" strokeLinecap="round" fill="none" opacity="0.95">
        {leftBarbs.map((d, idx) => (
          <path key={`l-${idx}`} d={d} />
        ))}
        {rightBarbs.map((d, idx) => (
          <path key={`r-${idx}`} d={d} />
        ))}
      </g>

      {/* 3. 중앙을 단단하게 지탱해주는 유려한 백색 깃대 (Shaft/Rachis) */}
      <path
        d="M 22 98 Q 55 65 90 25"
        stroke="#ffffff"
        strokeWidth="2.8"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 22 98 Q 55 65 90 25"
        stroke="#f1f5f9"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};

const CloverSVG = () => (
  <svg viewBox="0 0 100 120" className="w-full h-full" style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.16))' }}>
    {/* 1. 4개 하트 잎사귀를 먼저 그림 (줄기가 잎사귀 밑에 깔리지 않고 위에 선명하게 렌더링되게 함) */}
    {[0, 90, 180, 270].map((angle, idx) => (
      <g key={idx} transform={`rotate(${angle} 50 50)`}>
        {/* Left lobe of the leaf */}
        <path d="M50 50 C40 40 25 35 30 20 C35 5 48 10 50 25" fill="#4caf50" opacity="0.95" />
        {/* Right lobe of the leaf */}
        <path d="M50 50 C60 40 75 35 70 20 C65 5 52 10 50 25" fill="#388e3c" opacity="0.95" />
        {/* Leaf inner highlight/vein line */}
        <path d="M50 50 Q50 35 50 25" stroke="#a5d6a7" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.75" />
      </g>
    ))}
    {/* 잎사귀 중앙의 작고 예쁜 럭키 골든 코어 코팅 */}
    <circle cx="50" cy="50" r="4" fill="#fff9c4" />

    {/* 2. 줄기를 마지막(후순위)에 드로잉하여 180도 회전 잎사귀 위로 완벽 노출 + 120px 높이 하단 연장선 묘사 */}
    <path d="M50 60 Q54 90 32 112" stroke="#ffffff" strokeWidth="9" fill="none" strokeLinecap="round" opacity="0.9" />
    <path d="M50 60 Q54 90 32 112" stroke="#1b5e20" strokeWidth="5.2" fill="none" strokeLinecap="round" />
  </svg>
);

const SparkleSVG = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full" style={{ filter: 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.9))' }}>
    {/* 4-point beautiful glowing crystal starburst core (크리스탈 다이아몬드 별빛) */}
    <path
      d="M50 10 Q50 50 10 50 Q50 50 50 90 Q50 50 90 50 Q50 50 50 10 Z"
      fill="#FFFFFF"
    />
    <circle cx="50" cy="50" r="8" fill="#FFF9C4" />
    <circle cx="50" cy="50" r="3" fill="#FFFFFF" />
  </svg>
);

// 초고화질 실사 3D 캔버스 폭죽 시뮬레이터 (마스터피스 물리 피닉스 입자 시스템)
function CanvasFireworks({ opacity }: { opacity: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = canvas.width = canvas.offsetWidth || 375;
    let height = canvas.height = canvas.offsetHeight || 650;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        width = canvas.width = entry.contentRect.width;
        height = canvas.height = entry.contentRect.height;
      }
    });
    resizeObserver.observe(canvas);

    interface Rocket {
      x: number;
      y: number;
      targetY: number;
      vx: number;
      vy: number;
      color: string;
      trail: { x: number; y: number }[];
      exploded: boolean;
    }

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      alpha: number;
      fade: number;
      size: number;
      gravity: number;
      drag: number;
      twinkle: boolean;
    }

    let rockets: Rocket[] = [];
    let particles: Particle[] = [];

    const fireworkColors = [
      '#ffcc00', // Premium Gold
      '#ff3d81', // Luxury Rose Gold Pink
      '#00e5ff', // Opal Turquoise Blue
      '#e040fb', // Royal Violet Magenta
      '#ffffff'  // Crystal White
    ];

    const spawnRocket = (startX?: number, targetY?: number, color?: string) => {
      const x = startX ?? (0.2 + Math.random() * 0.6) * width;
      const tY = targetY ?? (0.15 + Math.random() * 0.25) * height;
      const col = color ?? fireworkColors[Math.floor(Math.random() * fireworkColors.length)];

      const vy = -Math.sqrt(2 * 0.12 * (height - tY)) * (0.8 + Math.random() * 0.2);

      rockets.push({
        x,
        y: height,
        targetY: tY,
        vx: (Math.random() - 0.5) * 1.2,
        vy,
        color: col,
        trail: [],
        exploded: false
      });
    };

    const explode = (x: number, y: number, color: string) => {
      const pCount = 55 + Math.floor(Math.random() * 20);

      for (let j = 0; j < 5; j++) {
        particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2,
          color: '#ffffff',
          alpha: 1,
          fade: 0.08 + Math.random() * 0.05,
          size: 4 + Math.random() * 4,
          gravity: 0.02,
          drag: 0.9,
          twinkle: false
        });
      }

      for (let i = 0; i < pCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.8 + Math.random() * 5.0;
        const isTwinkle = Math.random() > 0.65;

        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.6,
          color: Math.random() > 0.2 ? color : '#ffffff',
          alpha: 1.0,
          fade: 0.010 + Math.random() * 0.016,
          size: 1.2 + Math.random() * 1.8,
          gravity: 0.09 + Math.random() * 0.05,
          drag: 0.95 + Math.random() * 0.02,
          twinkle: isTwinkle
        });
      }
    };

    let lastSpawn = 0;
    const spawnInterval = 2200;

    const loop = (timestamp: number) => {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = `rgba(0, 0, 0, ${0.16 * opacity})`;
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = 'lighter';

      if (timestamp - lastSpawn > spawnInterval) {
        spawnRocket();
        if (Math.random() > 0.5) {
          setTimeout(() => spawnRocket(), 600);
        }
        lastSpawn = timestamp;
      }

      rockets.forEach((r) => {
        r.trail.push({ x: r.x, y: r.y });
        if (r.trail.length > 8) r.trail.shift();

        ctx.beginPath();
        if (r.trail.length > 1) {
          ctx.moveTo(r.trail[0].x, r.trail[0].y);
          for (let i = 1; i < r.trail.length; i++) {
            ctx.lineTo(r.trail[i].x, r.trail[i].y);
          }
        }
        ctx.strokeStyle = r.color;
        ctx.lineWidth = 1.8;
        ctx.globalAlpha = 0.7;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(r.x, r.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 1.0;
        ctx.fill();

        r.x += r.vx;
        r.y += r.vy;
        r.vy += 0.08;

        if (r.vy >= 0.2 || r.y <= r.targetY) {
          explode(r.x, r.y, r.color);
          r.exploded = true;
        }
      });
      rockets = rockets.filter(r => !r.exploded);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= p.drag;
        p.vy *= p.drag;
        p.alpha -= p.fade;

        if (p.alpha > 0) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

          let drawAlpha = p.alpha;
          if (p.twinkle && Math.random() > 0.5) {
            drawAlpha = p.alpha * 0.25;
          }

          ctx.fillStyle = p.color;
          ctx.globalAlpha = drawAlpha;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 3.5, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = drawAlpha * 0.22;
          ctx.fill();
        }
      });
      particles = particles.filter(p => p.alpha > 0);

      animationFrameId = requestAnimationFrame(loop);
    };

    setTimeout(() => {
      explode(width * 0.3, height * 0.28, '#ffcc00');
    }, 150);
    setTimeout(() => {
      explode(width * 0.7, height * 0.32, '#ff3d81');
    }, 700);
    setTimeout(() => {
      explode(width * 0.5, height * 0.22, '#00e5ff');
    }, 1400);

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [opacity]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-[25]" />;
}

interface FireworkInstance {
  id: string;
  left: string;
  top: string;
  color: string;
  shape: 'radial' | 'heart' | 'love';
}

// 메인 이미지 효과 컴포넌트
function MainImageEffect({ type, loop, opacity }: { type: string; loop?: boolean; opacity?: number }) {
  const [activeFireworks, setActiveFireworks] = useState<FireworkInstance[]>([]);

  useEffect(() => {
    if (type !== 'fireworks') {
      setActiveFireworks([]);
      return;
    }

    const fireworkColors = [
      '#ffcc00', // 프리미엄 골드
      '#ff77aa', // 러블리 핑크
      '#00e5ff', // 오팔 터키블루
      '#e040fb', // 로열 바이올렛
      '#ffffff'  // 크리스탈 화이트
    ];
    const shapes: ('radial' | 'heart' | 'love')[] = ['radial', 'heart', 'love'];
    let shapeIndex = 0;

    const spawnFirework = () => {
      const id = Math.random().toString(36).substring(2, 9);
      // 다양한 폭 영역 (가로 15% ~ 85% 범위로 아주 다채롭게 터짐)
      const leftVal = (15 + Math.random() * 70).toFixed(1);
      // 다양한 높이 영역 (세로 15% ~ 45% 범위로 고저를 고르게 배치)
      const topVal = (15 + Math.random() * 30).toFixed(1);

      const color = fireworkColors[Math.floor(Math.random() * fireworkColors.length)];
      const shape = shapes[shapeIndex % shapes.length];
      shapeIndex++;

      const newFw: FireworkInstance = {
        id,
        left: `${leftVal}%`,
        top: `${topVal}%`,
        color,
        shape,
      };

      setActiveFireworks((prev) => [...prev, newFw]);

      // 3.6초 후 애니메이션이 완전히 끝난 후 배열에서 안전 소멸
      setTimeout(() => {
        setActiveFireworks((prev) => prev.filter((item) => item.id !== id));
      }, 3600);
    };

    // 마운트 시점에 정적으로 노출되는 불빛을 방지하기 위해 마운트 100ms 후 첫 폭죽 쏘아올림
    const initialSpawn = setTimeout(() => {
      spawnFirework();
    }, 100);

    // 700ms 뒤에 다른 위치에 풍성하게 교차 스폰
    const secondSpawn = setTimeout(() => {
      spawnFirework();
    }, 700);

    // 1.8초 주기로 지속해서 다채로운 위치에 쏘아 올림
    const interval = setInterval(() => {
      spawnFirework();
    }, 1800);

    return () => {
      clearTimeout(initialSpawn);
      clearTimeout(secondSpawn);
      clearInterval(interval);
    };
  }, [type]);

  if (!type || type === 'none') return null;

  const effectClass = loop ? 'animate-loop' : 'animate-once';
  // 사용자의 직관적인 '투명도' 해석 반영:
  // 투명도 100% = 완전 투명하여 안 보임(opacity: 0)
  // 투명도 0% = 완전 불투명하여 선명함(opacity: 1)
  const currentOpacity = opacity !== undefined ? (100 - opacity) / 100 : 0.65;

  // 1. 클래식 방사형 폭죽 키프레임 생성 (모든 방향 구형 퍼짐)
  const radialSparkKeyframes = [...Array(24)].map((_, i) => {
    const angle = (i * 360) / 24;
    const rad = (angle * Math.PI) / 180;
    const dist = 80 + (i % 3) * 15; // 80px ~ 110px 대칭감 있는 방사 거리
    const tx = (Math.cos(rad) * dist).toFixed(1);
    const ty = (Math.sin(rad) * dist).toFixed(1);
    // 자연스러운 하강 효과 (바람 편향 최소화)
    const finalTx = (parseFloat(tx) * 1.1 + 4).toFixed(1);
    const finalTy = (parseFloat(ty) * 1.1 + 25).toFixed(1);
    return `
      @keyframes spark-radial-${i} {
        0%, 18% {
          transform: translate(0, 0) rotate(${angle}deg) scaleY(0.1);
          opacity: 0;
        }
        21% {
          transform: translate(0, 0) rotate(${angle}deg) scaleY(1.6);
          opacity: 1;
        }
        35% {
          transform: translate(${parseFloat(tx) * 0.7}px, ${parseFloat(ty) * 0.7}px) rotate(${angle}deg) scaleY(1.0);
          opacity: 1;
        }
        100% {
          transform: translate(${finalTx}px, ${finalTy}px) rotate(${angle}deg) scaleY(0.05);
          opacity: 0;
        }
      }
    `;
  }).join('\n');

  // 2. 하트(♥) 모양 폭죽 키프레임 생성 (수학적 하트 극좌표 방정식)
  const heartSparkKeyframes = [...Array(24)].map((_, i) => {
    const t = (i * 2 * Math.PI) / 24;
    // 하트 곡선 매개변수 방정식
    const x = (16 * Math.pow(Math.sin(t), 3) * 6.5).toFixed(1);
    const y = (- (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * 6.5).toFixed(1);
    // 중력 영향으로 나중에 살짝 아래로 쳐지는 자연스러움
    const finalTx = (parseFloat(x) * 1.1).toFixed(1);
    const finalTy = (parseFloat(y) * 1.1 + 25).toFixed(1);
    return `
      @keyframes spark-heart-${i} {
        0%, 18% {
          transform: translate(0, 0) scale(0.1) rotate(0deg);
          opacity: 0;
        }
        21% {
          transform: translate(0, 0) scale(1.5) rotate(0deg);
          opacity: 1;
        }
        35% {
          transform: translate(${x}px, ${y}px) scale(1.2) rotate(0deg);
          opacity: 1;
        }
        70% {
          transform: translate(${x}px, ${y}px) scale(1.0) rotate(0deg);
          opacity: 0.9;
        }
        100% {
          transform: translate(${finalTx}px, ${finalTy}px) scale(0.1) rotate(0deg);
          opacity: 0;
        }
      }
    `;
  }).join('\n');

  // 3. LOVE 글자 모양 폭죽 키프레임 생성 (24개 입자 균등 분할 매핑)
  const loveSparkKeyframes = [...Array(24)].map((_, i) => {
    let x = 0;
    let y = 0;

    // L (0 ~ 5)
    if (i >= 0 && i <= 5) {
      const lX = -75;
      if (i === 0) { x = lX; y = -25; }
      else if (i === 1) { x = lX; y = -5; }
      else if (i === 2) { x = lX; y = 15; }
      else if (i === 3) { x = lX; y = 35; }
      else if (i === 4) { x = lX + 15; y = 35; }
      else if (i === 5) { x = lX + 30; y = 35; }
    }
    // O (6 ~ 11)
    else if (i >= 6 && i <= 11) {
      const idx = i - 6;
      const angle = (idx * 360) / 6;
      const rad = (angle * Math.PI) / 180;
      x = -15 + Math.cos(rad) * 20;
      y = 5 + Math.sin(rad) * 30;
    }
    // V (12 ~ 17)
    else if (i >= 12 && i <= 17) {
      if (i === 12) { x = 12; y = -25; }
      else if (i === 13) { x = 17; y = -5; }
      else if (i === 14) { x = 22; y = 15; }
      else if (i === 15) { x = 25; y = 35; } // 꼭짓점
      else if (i === 16) { x = 30; y = 5; }
      else if (i === 17) { x = 38; y = -25; }
    }
    // E (18 ~ 23)
    else if (i >= 18 && i <= 23) {
      const eX = 55;
      if (i === 18) { x = eX; y = -25; }
      else if (i === 19) { x = eX; y = 5; }
      else if (i === 20) { x = eX; y = 35; }
      else if (i === 21) { x = eX + 20; y = -25; }
      else if (i === 22) { x = eX + 15; y = 5; }
      else if (i === 23) { x = eX + 20; y = 35; }
    }

    // 흩어지며 흘러내리는 최종 목적지 좌표
    const finalTx = (x + (Math.random() - 0.5) * 15).toFixed(1);
    const finalTy = (y + 40 + Math.random() * 20).toFixed(1);

    return `
      @keyframes spark-love-${i} {
        0%, 18% {
          transform: translate(0, 0) scale(0.1);
          opacity: 0;
        }
        21% {
          transform: translate(0, 0) scale(1.4);
          opacity: 1;
        }
        25% {
          transform: translate(${x}px, ${y}px) scale(1.2);
          opacity: 1;
        }
        65% {
          transform: translate(${x}px, ${y}px) scale(1.1);
          opacity: 1;
        }
        75% {
          transform: translate(${x + (parseFloat(finalTx) - x) * 0.3}px, ${y + (parseFloat(finalTy) - y) * 0.3}px) scale(0.9);
          opacity: 0.8;
        }
        100% {
          transform: translate(${finalTx}px, ${finalTy}px) scale(0.1);
          opacity: 0;
        }
      }
    `;
  }).join('\n');

  // 8방향의 미세 고밀도 트윈클 글리터 반짝이 입자 궤적 생성 (엇각 배치)
  const glitterKeyframes = [...Array(8)].map((_, i) => {
    const angle = (i * 360) / 8 + 22.5; // 외곽 구형 입자 틈새를 채우는 엇박자 각도
    const rad = (angle * Math.PI) / 180;
    const dist = 30 + (i % 2) * 10;
    const tx = (Math.cos(rad) * dist).toFixed(1);
    const ty = (Math.sin(rad) * dist).toFixed(1);
    const finalTx = (parseFloat(tx) + 8).toFixed(1);
    const finalTy = (parseFloat(ty) + 20).toFixed(1);
    return `
      @keyframes glitter-drift-${i} {
        0%, 20% {
          transform: translate(0, 0) scale(0);
          opacity: 0;
        }
        22% {
          transform: translate(0, 0) scale(1.5);
          opacity: 1;
        }
        40%, 60%, 80% {
          opacity: 0.35;
        }
        50%, 70% {
          opacity: 1;
        }
        100% {
          transform: translate(${finalTx}px, ${finalTy}px) scale(0.1);
          opacity: 0;
        }
      }
    `;
  }).join('\n');

  return (
    <div
      className={`absolute inset-0 z-[25] pointer-events-none overflow-hidden ${effectClass}`}
      style={{ opacity: currentOpacity }}
    >
      <style dangerouslySetInnerHTML={{
        __html: `
        /* 1. 나비 자유 3D 비행 애니메이션 A (컨테이너 기준 105% -> -15% 완벽 순환) */
        @keyframes flutter-free-3d-a {
          0% {
            top: 105%;
            transform: translateX(0) scale(0.65) rotate(-15deg);
            opacity: 0;
          }
          15% {
            opacity: 0.95;
            transform: translateX(50px) scale(0.85) rotate(18deg);
          }
          35% {
            transform: translateX(-55px) scale(1.1) rotate(-22deg);
          }
          50% {
            transform: translateX(40px) scale(0.9) rotate(25deg);
          }
          70% {
            transform: translateX(-45px) scale(1.2) rotate(-18deg);
          }
          85% {
            opacity: 0.95;
            transform: translateX(25px) scale(0.85) rotate(12deg);
          }
          100% {
            top: -15%;
            transform: translateX(0) scale(0.65) rotate(-5deg);
            opacity: 0;
          }
        }

        /* 2. 나비 자유 3D 비행 애니메이션 B (교차 대각 비행 기류) */
        @keyframes flutter-free-3d-b {
          0% {
            top: 105%;
            transform: translateX(25px) scale(0.8) rotate(12deg);
            opacity: 0;
          }
          20% {
            opacity: 0.95;
            transform: translateX(-45px) scale(1.15) rotate(-20deg);
          }
          45% {
            transform: translateX(55px) scale(0.9) rotate(22deg);
          }
          65% {
            transform: translateX(-40px) scale(1.2) rotate(-12deg);
          }
          85% {
            opacity: 0.95;
            transform: translateX(30px) scale(0.95) rotate(15deg);
          }
          100% {
            top: -15%;
            transform: translateX(0) scale(0.8) rotate(-5deg);
            opacity: 0;
          }
        }

        /* 3. 꽃잎 및 네잎클로버 3D 기류 회전 및 뒤집힘 (-15% -> 115% 낙하) */
        @keyframes wind-swirl {
          0% {
            top: -15%;
            transform: translateX(0) rotate(0deg) rotateY(0deg);
            opacity: 0;
          }
          10% { opacity: 0.95; }
          25% {
            transform: translateX(45px) rotate(180deg) rotateY(180deg);
          }
          50% {
            transform: translateX(-35px) rotate(360deg) rotateY(0deg);
          }
          75% {
            transform: translateX(50px) rotate(540deg) rotateY(180deg);
          }
          90% { opacity: 0.95; }
          100% {
            top: 115%;
            transform: translateX(10px) rotate(720deg) rotateY(360deg);
            opacity: 0;
          }
        }
      ` }} />
      {type === 'lightBulbs' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-[26] opacity-100">
          <style dangerouslySetInnerHTML={{
            __html: `
            @keyframes bulb-sway {
              0%, 100% { transform: rotate(-8deg); }
              50% { transform: rotate(8deg); }
            }
            @keyframes bulb-glow-a {
              0%, 100% {
                fill: #ffd966;
                filter: drop-shadow(0 0 5px rgba(251, 191, 36, 0.5));
              }
              50% {
                fill: #ffffff;
                filter: drop-shadow(0 0 16px #ffcc00) drop-shadow(0 0 6px #ffffff);
              }
            }
            @keyframes bulb-glow-b {
              0%, 100% {
                fill: #ffffff;
                filter: drop-shadow(0 0 16px #ffcc00) drop-shadow(0 0 6px #ffffff);
              }
              50% {
                fill: #ffd966;
                filter: drop-shadow(0 0 5px rgba(251, 191, 36, 0.5));
              }
            }
          ` }} />
          <svg viewBox="0 0 375 600" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
            {/* 가닥 1: Top-Right -> Top-Left */}
            <path d="M 375,40 Q 200,100 0,130" fill="none" stroke="rgba(120, 113, 108, 0.45)" strokeWidth="1.2" />
            <path d="M 375,40 Q 200,100 0,130" fill="none" stroke="rgba(251, 191, 36, 0.2)" strokeWidth="0.8" strokeDasharray="3,3" />

            {/* 가닥 2: Top-Left -> Mid-Right */}
            <path d="M 0,130 Q 180,200 375,230" fill="none" stroke="rgba(120, 113, 108, 0.45)" strokeWidth="1.2" />
            <path d="M 0,130 Q 180,200 375,230" fill="none" stroke="rgba(251, 191, 36, 0.2)" strokeWidth="0.8" strokeDasharray="3,3" />

            {/* 가닥 3: Mid-Right -> Mid-Left */}
            <path d="M 375,230 Q 180,290 0,340" fill="none" stroke="rgba(120, 113, 108, 0.45)" strokeWidth="1.2" />
            <path d="M 375,230 Q 180,290 0,340" fill="none" stroke="rgba(251, 191, 36, 0.2)" strokeWidth="0.8" strokeDasharray="3,3" />

            {/* 가닥 4: Mid-Left -> Bottom-Right */}
            <path d="M 0,340 Q 180,400 375,450" fill="none" stroke="rgba(120, 113, 108, 0.45)" strokeWidth="1.2" />
            <path d="M 0,340 Q 180,400 375,450" fill="none" stroke="rgba(251, 191, 36, 0.2)" strokeWidth="0.8" strokeDasharray="3,3" />

            {/* 가닥 5: Bottom-Right -> Bottom-Left */}
            <path d="M 375,450 Q 180,500 0,530" fill="none" stroke="rgba(120, 113, 108, 0.45)" strokeWidth="1.2" />
            <path d="M 375,450 Q 180,500 0,530" fill="none" stroke="rgba(251, 191, 36, 0.2)" strokeWidth="0.8" strokeDasharray="3,3" />

            {/* 가닥 6: Bottom-Left -> Bottom-Right */}
            <path d="M 0,530 Q 180,570 375,590" fill="none" stroke="rgba(120, 113, 108, 0.45)" strokeWidth="1.2" />
            <path d="M 0,530 Q 180,570 375,590" fill="none" stroke="rgba(251, 191, 36, 0.2)" strokeWidth="0.8" strokeDasharray="3,3" />

            {/* 전구 렌더링 - 6개 가닥별로 완벽한 동글전구 좌표 매핑 */}
            {[
              // 가닥 1 Bulbs (Top-Right -> Top-Left)
              { cx: 304, cy: 63, channel: 'a', delay: '0' },
              { cx: 194, cy: 93, channel: 'b', delay: '0.5' },
              { cx: 79, cy: 117, channel: 'a', delay: '1.0' },

              // 가닥 2 Bulbs (Top-Left -> Mid-Right)
              { cx: 73, cy: 156, channel: 'b', delay: '1.5' },
              { cx: 184, cy: 190, channel: 'a', delay: '2.0' },
              { cx: 298, cy: 216, channel: 'b', delay: '2.5' },

              // 가닥 3 Bulbs (Mid-Right -> Mid-Left)
              { cx: 298, cy: 254, channel: 'a', delay: '0.3' },
              { cx: 184, cy: 288, channel: 'b', delay: '0.8' },
              { cx: 73, cy: 320, channel: 'a', delay: '1.3' },

              // 가닥 4 Bulbs (Mid-Left -> Bottom-Right)
              { cx: 73, cy: 364, channel: 'b', delay: '1.8' },
              { cx: 184, cy: 398, channel: 'a', delay: '2.3' },
              { cx: 298, cy: 430, channel: 'b', delay: '2.8' },

              // 가닥 5 Bulbs (Bottom-Right -> Bottom-Left)
              { cx: 298, cy: 469, channel: 'a', delay: '0.6' },
              { cx: 184, cy: 495, channel: 'b', delay: '1.1' },
              { cx: 73, cy: 517, channel: 'a', delay: '1.6' },

              // 가닥 6 Bulbs (Bottom-Left -> Bottom-Right)
              { cx: 73, cy: 545, channel: 'b', delay: '2.1' },
              { cx: 184, cy: 565, channel: 'a', delay: '2.6' },
              { cx: 298, cy: 581, channel: 'b', delay: '3.1' }
            ].map((b, i) => (
              <g
                key={i}
                style={{
                  transformOrigin: `${b.cx}px ${b.cy}px`,
                  animation: `bulb-sway 4.5s ease-in-out infinite`,
                  animationDelay: `${b.delay}s`
                }}
              >
                {/* 부드러운 골든 아우라 후광 */}
                <circle cx={b.cx} cy={b.cy + 7} r="14" fill="rgba(255, 204, 0, 0.12)" />
                {/* 미니멀 소켓 연결 캡 */}
                <rect x={b.cx - 2.5} y={b.cy - 4} width="5" height="5.5" fill="#4b5563" rx="0.5" />
                <path d={`M ${b.cx - 2.5} ${b.cy - 1.5} Q ${b.cx} ${b.cy} ${b.cx + 2.5} ${b.cy - 1.5}`} stroke="#1f2937" strokeWidth="0.8" fill="none" />

                {/* 첨부파일의 완벽히 둥글고 자연스러운 명품 동글 전구 모양 (기본값 warm yellow로 검정색 물듦 버그 해결!) */}
                <circle
                  cx={b.cx}
                  cy={b.cy + 7}
                  r="7.2"
                  fill="#ffd966"
                  stroke="#d97706"
                  strokeWidth="1.1"
                  style={{
                    animation: `${b.channel === 'a' ? 'bulb-glow-a' : 'bulb-glow-b'} 3.5s ease-in-out infinite`,
                    animationDelay: `${b.delay}s`
                  }}
                />
                {/* 은은히 불타는 백열 전구 필라멘트 코어 */}
                <circle cx={b.cx} cy={b.cy + 7} r="2.2" fill="#ffffff" />
                {/* 3D 리얼 입체 글래스 반사 하이라이트 */}
                <path d={`M ${b.cx - 3.5} ${b.cy + 4.5} A 4 4 0 0 1 ${b.cx - 1.2} ${b.cy + 2.5}`} stroke="#ffffff" strokeWidth="0.85" strokeLinecap="round" fill="none" opacity="0.85" />
              </g>
            ))}
          </svg>
        </div>
      )}

      {/* 벚꽃 효과 (3D 입체 뒤집힘 & 은은한 저속 기류 하강) */}
      {type === 'cherryBlossom' && (
        <div className="absolute inset-0 opacity-90">
          {[...Array(20)].map((_, i) => {
            const colors = ['#FFC0CB', '#FFB6C1', '#FFCCD5', '#FFF0F5', '#FFA6C9', '#FCE1D4'];
            const color = colors[i % colors.length];
            const size = 10 + Math.random() * 10;
            const duration = 22 + Math.random() * 18; // 서정적인 초저속 슬로우 템포 (22s~40s)
            const delay = -Math.random() * duration;
            return (
              <div
                key={i}
                className="absolute"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left: `${Math.random() * 110 - 10}%`,
                  top: `-${15 + Math.random() * 15}%`,
                  animation: `wind-swirl ${duration}s linear infinite`,
                  animationDelay: `${delay}s`,
                }}
              >
                <CherryPetalSVG color={color} />
              </div>
            );
          })}
        </div>
      )}

      {/* 네잎클로버 효과 (기존 유칼립투스 항목을 실물 3D CloverSVG로 전격 쇄신) */}
      {type === 'eucalyptus' && (
        <div className="absolute inset-0 opacity-90">
          {[...Array(10)].map((_, i) => {
            const size = 18 + Math.random() * 14;
            const duration = 26 + Math.random() * 16; // 극도로 서정적이고 느린 슬로우 템포 (26s~42s)
            const delay = -Math.random() * duration;
            return (
              <div
                key={i}
                className="absolute"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left: `${Math.random() * 100}%`,
                  top: `-${15 + Math.random() * 15}%`,
                  animation: `wind-swirl ${duration}s linear infinite`,
                  animationDelay: `${delay}s`,
                }}
              >
                <CloverSVG />
              </div>
            );
          })}
        </div>
      )}

      {/* 함박눈 효과 (은은한 저속 낙하 & 후광 글로우) */}
      {type === 'snow' && (
        <div className="absolute inset-0 opacity-85">
          {[...Array(25)].map((_, i) => {
            const size = 4 + Math.random() * 6;
            const duration = 18 + Math.random() * 14; // 초저속 낙하 (18s~32s)
            const delay = -Math.random() * duration;
            const glowColor = i % 2 === 0 ? 'rgba(255,255,255,0.95)' : 'rgba(254,243,199,0.95)';
            return (
              <div
                key={i}
                className="absolute animate-fall rounded-full bg-white"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left: `${Math.random() * 100}%`,
                  top: `-${10 + Math.random() * 15}%`,
                  animationDelay: `${delay}s`,
                  animationDuration: `${duration}s`,
                  boxShadow: `0 0 6px 2.5px ${glowColor}, 0 0 2px 1px rgba(255, 255, 255, 0.6)`,
                  filter: 'blur(0.2px)',
                }}
              />
            );
          })}
        </div>
      )}

      {/* 꽃가루 효과 (3D 종이 꽃가루 형태로 뒤집히며 낙하) */}
      {type === 'confetti' && (
        <div className="absolute inset-0 opacity-90">
          {[...Array(25)].map((_, i) => {
            const colors = ['#FFD700', '#FFB6C1', '#87CEFA', '#98FB98', '#DDA0DD', '#FF7F50', '#F0E68C'];
            const color = colors[i % colors.length];
            const width = 6 + Math.random() * 7;
            const height = 3 + Math.random() * 4;
            const duration = 18 + Math.random() * 14; // 서정적인 템포 감속 (18s~32s)
            const delay = -Math.random() * duration;
            const rotation = Math.random() * 360;
            return (
              <div
                key={i}
                className="absolute"
                style={{
                  width: `${width}px`,
                  height: `${height}px`,
                  backgroundColor: color,
                  left: `${Math.random() * 100}%`,
                  top: `-${15 + Math.random() * 15}%`,
                  animation: `wind-swirl ${duration}s linear infinite`,
                  animationDelay: `${delay}s`,
                  transform: `rotate(${rotation}deg)`,
                  opacity: 0.8 + Math.random() * 0.2,
                  boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                  borderRadius: Math.random() > 0.5 ? '1px' : '0px',
                }}
              />
            );
          })}
        </div>
      )}

      {/* 오로라 비눗방울 효과 (입체 네온 핑크-민트-골드 그라데이션 및 네온 후광 섀도우) */}
      {type === 'bubbles' && (
        <div className="absolute inset-0 opacity-95">
          {[...Array(14)].map((_, i) => {
            const size = 18 + Math.random() * 24;
            const duration = 26 + Math.random() * 16; // 매우 느린 템포로 둥실부유 (26s~42s)
            const delay = -Math.random() * duration;
            return (
              <div
                key={i}
                className="absolute border border-white/80 rounded-full"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${100 + Math.random() * 15}%`,
                  animation: `bubble-drift ${duration}s ease-in-out infinite`,
                  animationDelay: `${delay}s`,
                  /* 오로라 무지갯빛 반사광의 몽환적 그라데이션 주입 (밀도 대폭 상향) */
                  background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9) 0%, rgba(244,143,177,0.45) 30%, rgba(129,230,217,0.5) 60%, rgba(225,190,231,0.3) 80%, rgba(255,255,255,0.15) 100%)',
                  /* 이중 외부/내부 오로라 글로우 섀도우 극대화 */
                  boxShadow: '0 0 12px 3px rgba(129,230,217,0.55), 0 0 5px 1px rgba(244,143,177,0.5), inset -2px -2px 10px rgba(225,190,231,0.6), inset 2px 2px 10px rgba(129,230,217,0.6)',
                }}
              />
            );
          })}
        </div>
      )}

      {/* 장미꽃잎 효과 (둥글고 입체감 있는 생화 장미꽃잎 RosePetalSVG 낙하 구현) */}
      {type === 'petals' && (
        <div className="absolute inset-0 opacity-95">
          {[...Array(14)].map((_, i) => {
            const colors = ['#D81B60', '#C2185B', '#AD1457', '#880E4F', '#B71C1C', '#C62828']; // 장미 생화 루비/크림슨 베리에이션
            const color = colors[i % colors.length];
            const size = 16 + Math.random() * 16; // 장미꽃잎 크기 보강
            const duration = 24 + Math.random() * 18; // 서정적인 초저속 슬로우 템포 (24s~42s)
            const delay = -Math.random() * duration;
            return (
              <div
                key={i}
                className="absolute"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left: `${Math.random() * 100}%`,
                  top: `-${15 + Math.random() * 15}%`,
                  animation: `wind-swirl ${duration}s linear infinite`,
                  animationDelay: `${delay}s`,
                }}
              >
                <RosePetalSVG color={color} />
              </div>
            );
          })}
        </div>
      )}

      {/* 러브하트 효과 (파스텔 하트 부드럽게 유영 상승) */}
      {type === 'hearts' && (
        <div className="absolute inset-0 opacity-90">
          {[...Array(12)].map((_, i) => {
            const duration = 24 + Math.random() * 14; // 서정적인 슬로우 템포 (24s~38s)
            const delay = -Math.random() * duration;
            return (
              <div
                key={i}
                className="absolute text-rose-400/80"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${100 + Math.random() * 15}%`,
                  fontSize: `${18 + Math.random() * 12}px`,
                  animation: `bubble-drift ${duration}s ease-in-out infinite`,
                  animationDelay: `${delay}s`,
                }}
              >
                ❤️
              </div>
            );
          })}
        </div>
      )}

      {/* 은하수별빛 효과 (고정식 탈피, diagonal 유영 흐름을 갖는 은하수) */}
      {type === 'stars' && (
        <div className="absolute inset-0 opacity-90">
          {[...Array(20)].map((_, i) => {
            const duration = 12 + Math.random() * 10; // 대폭 감속 (12s~22s)
            const delay = -Math.random() * duration;
            return (
              <div
                key={i}
                className="absolute text-yellow-100/90"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  fontSize: `${10 + Math.random() * 10}px`,
                  animation: `galactic-drift ${duration}s ease-in-out infinite`,
                  animationDelay: `${delay}s`,
                }}
              >
                ⭐
              </div>
            );
          })}
        </div>
      )}

      {/* 반짝이 효과 (이모티콘 배제, 4방 크리스탈 펄 SparkleSVG 교차 점멸) */}
      {type === 'sparkle' && (
        <div className="absolute inset-0 opacity-95">
          {[...Array(16)].map((_, i) => {
            const size = 10 + Math.random() * 12;
            const duration = 6 + Math.random() * 6; // 감속 (6s~12s)
            const delay = -Math.random() * duration;
            return (
              <div
                key={i}
                className="absolute animate-pulse"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${delay}s`,
                  animationDuration: `${duration}s`,
                }}
              >
                <SparkleSVG />
              </div>
            );
          })}
        </div>
      )}

      {/* 감성단비 효과 (여름날 빗방울 슬로우 모션 연출) */}
      {type === 'rain' && (
        <div className="absolute inset-0 opacity-80">
          {[...Array(35)].map((_, i) => {
            const duration = 5.0 + Math.random() * 4.0; // 여름날 단비 슬로우 모션 (5s~9s)
            const delay = -Math.random() * duration;
            return (
              <div
                key={i}
                className="absolute bg-white/40"
                style={{
                  width: '1px',
                  height: `${10 + Math.random() * 15}px`,
                  left: `${Math.random() * 100}%`,
                  top: `-${Math.random() * 20}%`,
                  animation: `slow-fall ${duration}s linear infinite`,
                  animationDelay: `${delay}s`,
                }}
              />
            );
          })}
        </div>
      )}

      {/* 천사의깃털 효과 (낙엽 형태 배제, 순백의 극세사 솜털 FeatherSVG 느린 낙하) */}
      {type === 'feathers' && (
        <div className="absolute inset-0 opacity-90">
          {[...Array(8)].map((_, i) => {
            const size = 24 + Math.random() * 18; // 솜털 크기 보강
            const duration = 26 + Math.random() * 16; // 극도로 느린 슬로우 템포 낙하 (26s~42s)
            const delay = -Math.random() * duration;
            return (
              <div
                key={i}
                className="absolute"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left: `${Math.random() * 100}%`,
                  top: `-${15 + Math.random() * 15}%`,
                  animation: `wind-swirl ${duration}s linear infinite`,
                  animationDelay: `${delay}s`,
                }}
              >
                <FeatherSVG />
              </div>
            );
          })}
        </div>
      )}

      {/* 나비 효과 (크기 확장 및 진짜 나비 같은 3D 지그재그 회전 입체 비행 flutter-free-3d) */}
      {type === 'butterflies' && (
        <div className="absolute inset-0 opacity-95">
          {[...Array(8)].map((_, i) => {
            const colors = ['#FFD1DC', '#D1F2D9', '#D5E6FA', '#FCE1D4', '#FFF3CD', '#E8D5FA', '#D5FAFA'];
            const color = colors[i % colors.length];
            const size = 26 + Math.random() * 14; // 나비 크기 대폭 확장 (26px~40px)
            const duration = 28 + Math.random() * 16; // 매우 느리게 지그재그 유영 (28s~44s)
            const delay = -Math.random() * duration;
            const animName = i % 2 === 0 ? 'flutter-free-3d-a' : 'flutter-free-3d-b'; // A/B 교차 기류 패턴
            return (
              <div
                key={i}
                className="absolute"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left: `${5 + Math.random() * 90}%`,
                  top: `${100 + Math.random() * 15}%`,
                  animation: `${animName} ${duration}s ease-in-out infinite`,
                  animationDelay: `${delay}s`,
                }}
              >
                <ButterflySVG color={color} />
              </div>
            );
          })}
        </div>
      )}

      {/* 보케조명 효과 (대담한 보케 크기 및 밀도 보강, 촛불처럼 따뜻하고 느린 맥박) */}
      {(type === 'bokeh' || type === 'lights' || type === 'glow' || type === 'rays') && (
        <div className="absolute inset-0 overflow-hidden opacity-95 pointer-events-none">
          {[...Array(8)].map((_, i) => {
            const size = 180 + Math.random() * 150; // 최대 330px 보완 확장
            const duration = 16 + Math.random() * 14; // 아주 느리게 촛불처럼 깜빡임
            const delay = -Math.random() * duration;
            const gradients = [
              'radial-gradient(circle, rgba(253,230,138,0.65) 0%, rgba(251,207,232,0.35) 50%, transparent 80%)',
              'radial-gradient(circle, rgba(254,215,170,0.6) 0%, rgba(251,207,232,0.3) 50%, transparent 80%)',
              'radial-gradient(circle, rgba(251,207,232,0.65) 0%, rgba(129,230,217,0.3) 50%, transparent 80%)',
              'radial-gradient(circle, rgba(245,245,244,0.55) 0%, rgba(254,243,199,0.25) 50%, transparent 80%)'
            ];
            const gradient = gradients[i % gradients.length];
            return (
              <div
                key={i}
                className="absolute rounded-full animate-pulse-slow blur-xl"
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left: `${Math.random() * 120 - 30}%`,
                  top: `${Math.random() * 120 - 30}%`,
                  background: gradient,
                  animationDelay: `${delay}s`,
                  animationDuration: `${duration}s`,
                }}
              />
            );
          })}
          <div className="absolute inset-0 bg-gradient-to-b from-yellow-50/5 to-transparent pointer-events-none" />
        </div>
      )}

      {/* 실크커튼 효과 (은은한 실크 커튼 바람에 흔들리는 느낌 - Left/Right draping sheer white wave) */}
      {type === 'silkCurtain' && (
        <div className="absolute inset-0 z-[26] pointer-events-none flex justify-between w-full h-full overflow-hidden" style={{ transformStyle: 'preserve-3d', perspective: '1000px' }}>
          <style dangerouslySetInnerHTML={{
            __html: `
            @keyframes silk-sway-left {
              0%, 100% {
                transform: perspective(1000px) rotateX(0deg) rotateY(0deg) skewX(0deg) scaleX(1);
                filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.04));
              }
              50% {
                transform: perspective(1000px) rotateX(3deg) rotateY(22deg) skewX(3deg) scaleX(1.12);
                filter: drop-shadow(10px 15px 25px rgba(0, 0, 0, 0.15));
              }
            }
            @keyframes silk-sway-right {
              0%, 100% {
                transform: perspective(1000px) rotateX(0deg) rotateY(0deg) skewX(0deg) scaleX(1);
                filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.04));
              }
              50% {
                transform: perspective(1000px) rotateX(-3deg) rotateY(-22deg) skewX(-3deg) scaleX(1.12);
                filter: drop-shadow(-10px 15px 25px rgba(0, 0, 0, 0.15));
              }
            }
          ` }} />
          {/* 좌측 실크 커튼 (Left sheer silk curtain draped with vertical elegant folds) */}
          <div
            className="relative h-full w-[40%] origin-top-left opacity-95"
            style={{
              animation: 'silk-sway-left 14s ease-in-out infinite alternate',
              transformStyle: 'preserve-3d'
            }}
          >
            <svg viewBox="0 0 120 500" preserveAspectRatio="none" className="w-full h-full fill-none">
              <defs>
                <linearGradient id="silk-grad-left" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(255, 255, 255, 0.98)" />
                  <stop offset="25%" stopColor="rgba(255, 255, 255, 0.85)" />
                  <stop offset="50%" stopColor="rgba(255, 255, 255, 0.45)" />
                  <stop offset="75%" stopColor="rgba(255, 255, 255, 0.75)" />
                  <stop offset="90%" stopColor="rgba(255, 255, 255, 0.25)" />
                  <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
                </linearGradient>
              </defs>
              {/* 중첩 실크 드레이프 레이어 - 한층 더 풍성하고 입체적인 감각 */}
              <path d="M0,0 Q40,150 25,300 Q50,400 20,500 L0,500 Z" fill="url(#silk-grad-left)" />
              <path d="M0,0 Q65,180 45,320 Q80,420 35,500 L0,500 Z" fill="url(#silk-grad-left)" opacity="0.65" />
              <path d="M0,0 Q85,210 70,340 Q95,440 55,500 L0,500 Z" fill="url(#silk-grad-left)" opacity="0.35" />
              <path d="M0,0 Q105,240 90,360 Q110,460 70,500 L0,500 Z" fill="url(#silk-grad-left)" opacity="0.15" />
              {/* 세로 실크 골짜기 음영 라인 보강 */}
              <path d="M15,0 C30,120 22,240 30,500" stroke="rgba(255, 255, 255, 0.55)" strokeWidth="3" />
              <path d="M45,0 C55,150 48,280 54,500" stroke="rgba(255, 255, 255, 0.38)" strokeWidth="2.5" />
              <path d="M70,0 C80,180 75,300 80,500" stroke="rgba(255, 255, 255, 0.22)" strokeWidth="1.5" />
            </svg>
          </div>

          {/* 우측 실크 커튼 (Right sheer silk curtain flipped) */}
          <div
            className="relative h-full w-[40%] origin-top-right opacity-95"
            style={{
              animation: 'silk-sway-right 16s ease-in-out infinite alternate',
              animationDelay: '-3s',
              transformStyle: 'preserve-3d'
            }}
          >
            <svg viewBox="0 0 120 500" preserveAspectRatio="none" className="w-full h-full fill-none scale-x-[-1]">
              <defs>
                <linearGradient id="silk-grad-right" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(255, 255, 255, 0.98)" />
                  <stop offset="25%" stopColor="rgba(255, 255, 255, 0.85)" />
                  <stop offset="50%" stopColor="rgba(255, 255, 255, 0.45)" />
                  <stop offset="75%" stopColor="rgba(255, 255, 255, 0.75)" />
                  <stop offset="90%" stopColor="rgba(255, 255, 255, 0.25)" />
                  <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
                </linearGradient>
              </defs>
              <path d="M0,0 Q40,150 25,300 Q50,400 20,500 L0,500 Z" fill="url(#silk-grad-right)" />
              <path d="M0,0 Q65,180 45,320 Q80,420 35,500 L0,500 Z" fill="url(#silk-grad-right)" opacity="0.65" />
              <path d="M0,0 Q85,210 70,340 Q95,440 55,500 L0,500 Z" fill="url(#silk-grad-right)" opacity="0.35" />
              <path d="M0,0 Q105,240 90,360 Q110,460 70,500 L0,500 Z" fill="url(#silk-grad-right)" opacity="0.15" />
              <path d="M15,0 C30,120 22,240 30,500" stroke="rgba(255, 255, 255, 0.55)" strokeWidth="3" />
              <path d="M45,0 C55,150 48,280 54,500" stroke="rgba(255, 255, 255, 0.38)" strokeWidth="2.5" />
              <path d="M70,0 C80,180 75,300 80,500" stroke="rgba(255, 255, 255, 0.22)" strokeWidth="1.5" />
            </svg>
          </div>
        </div>
      )}

      {/* 하트눈 효과 (투명하고 하얀 하트가 함박눈처럼 내림) */}
      {type === 'heartSnow' && (
        <div className="absolute inset-0 opacity-80 z-[26] pointer-events-none overflow-hidden">
          {[...Array(22)].map((_, i) => {
            const size = 12 + Math.random() * 12; // 12px ~ 24px
            const duration = 15 + Math.random() * 12; // 15s ~ 27s
            const delay = -Math.random() * duration;
            const opacity = 0.25 + Math.random() * 0.45; // 투명도 조절 (25% ~ 70%)
            const rotation = Math.random() * 360;
            return (
              <div
                key={i}
                className="absolute text-white pointer-events-none"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-${10 + Math.random() * 15}%`,
                  width: `${size}px`,
                  height: `${size}px`,
                  animation: `wind-swirl ${duration}s linear infinite`,
                  animationDelay: `${delay}s`,
                  opacity: opacity,
                }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full" style={{ transform: `rotate(${rotation}deg)` }}>
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
            );
          })}
        </div>
      )}

      {/* 폭죽 애니메이션 효과 (시네마틱 3D 더블레이어 스파클러 쇼) */}
      {type === 'fireworks' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-[26] opacity-95">
          <style dangerouslySetInnerHTML={{
            __html: `
            @keyframes rocket-rise-1 {
              0% { transform: translateY(350px) scale(0.2); opacity: 0; }
              4% { opacity: 1; }
              22% { transform: translateY(0px) scale(1); opacity: 1; }
              25% { opacity: 0; }
              100% { opacity: 0; }
            }
            @keyframes flash-burst {
              0%, 20% { transform: scale(0.1); opacity: 0; }
              22% { transform: scale(1.6); opacity: 1; }
              35% { transform: scale(1); opacity: 0; }
              100% { opacity: 0; }
            }
            ${radialSparkKeyframes}
            ${heartSparkKeyframes}
            ${loveSparkKeyframes}
            ${glitterKeyframes}
          ` }} />
          {activeFireworks.map((fw) => (
            <div
              key={fw.id}
              className="absolute w-2 h-2"
              style={{
                left: fw.left,
                top: fw.top,
              }}
            >
              {/* 위로 솟구치는 불꽃 꼬리 로켓 */}
              <div
                className="absolute w-1.5 h-12 -translate-x-1/2"
                style={{
                  bottom: 0,
                  background: `linear-gradient(to top, transparent, ${fw.color} 80%, #ffffff 100%)`,
                  borderRadius: '9999px',
                  boxShadow: `0 0 10px ${fw.color}`,
                  transformOrigin: 'bottom center',
                  animation: `rocket-rise-1 3.6s ease-out infinite`,
                }}
              />

              {/* 중앙 폭발 순간 백색 섬광 플래시 */}
              <div
                className="absolute w-20 h-20 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
                style={{
                  background: `radial-gradient(circle, #ffffff 0%, ${fw.color} 40%, transparent 70%)`,
                  animation: `flash-burst 3.6s ease-out infinite`,
                }}
              />

              {/* 1레이어: 형태별(민들레 방사형, 하트, LOVE) 특수 연출 불꽃 입자 궤적 */}
              {fw.shape === 'radial' && [...Array(24)].map((_, i) => (
                <div
                  key={`spark-radial-${i}`}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                  style={{
                    animation: `spark-radial-${i} 3.6s cubic-bezier(0.1, 0.85, 0.15, 1) infinite`,
                  }}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{
                      background: `radial-gradient(circle, #ffffff 40%, ${fw.color} 100%)`,
                      boxShadow: `0 0 10px 2px ${fw.color}, 0 0 4px #ffffff`,
                    }}
                  />
                </div>
              ))}

              {fw.shape === 'heart' && [...Array(24)].map((_, i) => (
                <div
                  key={`spark-heart-${i}`}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                  style={{
                    animation: `spark-heart-${i} 3.6s cubic-bezier(0.12, 0.8, 0.15, 1) infinite`,
                    width: '14px',
                    height: '14px',
                  }}
                >
                  <svg viewBox="0 0 24 24" fill={fw.color} className="w-full h-full" style={{ filter: `drop-shadow(0 0 5px ${fw.color})` }}>
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </div>
              ))}

              {fw.shape === 'love' && [...Array(24)].map((_, i) => (
                <div
                  key={`spark-love-${i}`}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                  style={{
                    animation: `spark-love-${i} 3.6s cubic-bezier(0.15, 0.82, 0.16, 1) infinite`,
                  }}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      background: `radial-gradient(circle, #ffffff 40%, ${fw.color} 100%)`,
                      boxShadow: `0 0 10px 2px ${fw.color}, 0 0 4px #ffffff`,
                    }}
                  />
                </div>
              ))}

              {/* 2레이어: 8방향의 미세 다이아몬드 트윈클 글리터 반짝이 */}
              {[...Array(8)].map((_, i) => (
                <div
                  key={`glitter-${i}`}
                  className="absolute w-2.5 h-2.5 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                  style={{
                    animation: `glitter-drift-${i} 3.6s ease-out infinite`,
                  }}
                >
                  <svg viewBox="0 0 100 100" className="w-2.5 h-2.5" style={{ filter: `drop-shadow(0 0 5px ${fw.color})` }}>
                    <path d="M50 10 Q50 50 10 50 Q50 50 50 90 Q50 50 90 50 Q50 50 50 10 Z" fill="#ffffff" />
                  </svg>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MobilePreview({
  invitation, device, onDeviceChange, selectedSectionId, onSectionClick,
}: MobilePreviewProps) {
  const { theme } = invitation;

  const isDarkColor = (color: string) => {
    if (!color) return false;
    const hex = color.replace('#', '');
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      return (r * 0.299 + g * 0.587 + b * 0.114) < 140;
    } else if (hex.length === 6) {
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return (r * 0.299 + g * 0.587 + b * 0.114) < 140;
    }
    return false;
  };

  const isDarkBg = ['suedeMauve', 'espressoWrinkle', 'satinNavy', 'roseVelvet', 'charcoalCement', 'antiqueGoldCrack', 'blackMatteSteel'].includes(theme.pattern || '') || isDarkColor(theme.bgColor || '');

  const [currentTime, setCurrentTime] = useState('');
  const [isBgmPlaying, setIsBgmPlaying] = useState(theme.bgmAutoPlay || false);
  const [bgmCurrentTime, setBgmCurrentTime] = useState(0);
  const [bgmDuration, setBgmDuration] = useState(0);

  // BGM 재생 상태 및 실시간 가상 째깍 타임 전역 CustomEvent 동기화 바인딩
  useEffect(() => {
    const handleBgmStateChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        if (typeof customEvent.detail.isPlaying === 'boolean') {
          setIsBgmPlaying(customEvent.detail.isPlaying);
        }
        if (typeof customEvent.detail.currentTime === 'number') {
          setBgmCurrentTime(customEvent.detail.currentTime);
        }
        if (typeof customEvent.detail.duration === 'number') {
          setBgmDuration(customEvent.detail.duration);
        }
      }
    };
    window.addEventListener('bgm-state-changed', handleBgmStateChange);
    return () => {
      window.removeEventListener('bgm-state-changed', handleBgmStateChange);
    };
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // 선택된 섹션으로 자동 스크롤
  useEffect(() => {
    if (selectedSectionId) {
      const element = document.getElementById(`preview-section-${selectedSectionId}`);
      const container = document.querySelector('.custom-scrollbar-preview');
      if (element && container) {
        const containerTop = container.getBoundingClientRect().top;
        const elementTop = element.getBoundingClientRect().top;
        const scrollPosition = container.scrollTop + (elementTop - containerTop) - (container.clientHeight / 2) + (element.clientHeight / 2);
        container.scrollTo({
          top: scrollPosition,
          behavior: 'smooth'
        });
      }
    }
  }, [selectedSectionId]);


  const isMobile = device === 'mobile' || device === 'opening';

  /* ─── 미리보기 컨테이너 ─── */
  return (
    <div className="flex flex-col items-center justify-start w-full min-h-full transition-all duration-500">

      {/* ── 기기 프레임 ── */}
      <div
        className={`relative transition-all duration-500 ease-in-out shadow-[0_50px_100px_rgba(0,0,0,0.12)] overflow-hidden rounded-[3rem] border-[6px] border-[#d1d5db] bg-white ${isMobile
          ? 'w-[375px] h-[720px]'
          : 'w-[1100px] h-[720px]'
          }`}
      >
        {/* Notch / Speaker */}
        {isMobile && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-stone-200 rounded-full z-[110]" />
        )}
        {/* 상단 통합 스위처 (다이나믹 아일랜드 형태 - 글래스모피즘) */}
        <div className={`absolute top-2 left-1/2 -translate-x-1/2 z-[110] flex justify-center pointer-events-none transition-all duration-500`}>
          <div className="flex flex-row p-1 bg-white/40 backdrop-blur-md rounded-full border border-white/50 shadow-sm pointer-events-auto items-center">
            <button
              onClick={() => onDeviceChange?.('mobile')}
              className={`flex flex-row items-center justify-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-all ${device === 'mobile' ? 'bg-white text-[#111827] shadow-sm' : 'text-[#9ca3af] hover:text-[#4b5563]'}`}
            >
              <Smartphone size={12} strokeWidth={2.5} className="shrink-0" />
              <span>모바일</span>
            </button>
            <button
              onClick={() => onDeviceChange?.('desktop')}
              className={`flex flex-row items-center justify-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-all ${(device as string) === 'desktop' ? 'bg-white text-[#111827] shadow-sm' : 'text-[#9ca3af] hover:text-[#4b5563]'}`}
            >
              <Monitor size={12} strokeWidth={2.5} className="shrink-0" />
              <span>데스크톱</span>
            </button>
            <button
              onClick={() => onDeviceChange?.('opening')}
              className={`flex flex-row items-center justify-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-all ${device === 'opening' ? 'bg-white text-[#111827] shadow-sm' : 'text-[#9ca3af] hover:text-[#4b5563]'}`}
            >
              <Play size={12} fill="currentColor" className="shrink-0" />
              <span>오프닝</span>
            </button>
          </div>
        </div>

        {/* 상태 표시줄 (모바일/데스크톱 공통 표시 요청) */}
        <div className={`absolute top-0 left-0 w-full h-10 z-[100] px-8 flex items-center justify-between pointer-events-none transition-all duration-500 ${!isMobile ? 'opacity-60 scale-95 origin-top' : ''}`}>
          <span className={`text-[13px] font-bold mt-2 transition-colors ${isDarkBg ? 'text-white' : 'text-stone-900'}`}>{currentTime || '9:41'}</span>
          <div className="flex items-center gap-2 mt-2">
            <Wifi size={14} strokeWidth={2.5} className={`transition-colors ${isDarkBg ? 'text-white' : 'text-stone-900'}`} />
            {/* 하트 충전 아이콘 애니메이션 */}
            <div className="relative w-[18px] h-[18px] flex items-center justify-center">
              <svg className={`w-full h-full fill-current transition-colors ${isDarkBg ? 'text-white/30' : 'text-stone-200'}`} viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <div className="absolute inset-0 overflow-hidden animate-heart-fill">
                <svg className="w-[18px] h-[18px] text-rose-500 fill-current" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* 음악 재생 플레이어 - key={theme.bgmUrl}로 리스트 변경 시 완전 remount → 즉시 새 음원 재생 보장 */}
        {theme.bgmUrl && (
          <div className={`absolute right-6 z-[120] ${isMobile ? 'top-12' : 'top-14'}`}>
            <BgmPlayer key={theme.bgmUrl} url={theme.bgmUrl} autoPlay={theme.bgmAutoPlay} loop={theme.bgmLoop} volume={theme.bgmVolume} />
          </div>
        )}

        {/* ── 내부 화면 영역 ── */}
        <div
          id="preview-phone-screen"
          className={`absolute inset-0 overflow-hidden rounded-[2.5rem] transition-colors duration-500 z-0 ${['suedeMauve', 'espressoWrinkle', 'satinNavy', 'roseVelvet', 'charcoalCement', 'antiqueGoldCrack', 'blackMatteSteel'].includes(theme.pattern || '')
            ? 'is-dark-pattern text-white'
            : 'text-stone-800'
            }`}
        >
          <style dangerouslySetInnerHTML={{
            __html: `
            .is-dark-pattern .bg-white {
              background-color: rgba(255, 255, 255, 0.08) !important;
              border-color: rgba(255, 255, 255, 0.12) !important;
              backdrop-filter: blur(12px) !important;
              box-shadow: 0 10px 40px rgba(0, 0, 0, 0.22) !important;
            }

            .is-dark-pattern .text-stone-900,
            .is-dark-pattern .text-stone-850,
            .is-dark-pattern .text-stone-800,
            .is-dark-pattern .text-stone-700,
            .is-dark-pattern .text-stone-600,
            .is-dark-pattern .text-gray-900,
            .is-dark-pattern .text-gray-850,
            .is-dark-pattern .text-gray-800,
            .is-dark-pattern .text-gray-700,
            .is-dark-pattern .text-gray-600,
            .is-dark-pattern .text-slate-900,
            .is-dark-pattern .text-slate-800,
            .is-dark-pattern .text-slate-700,
            .is-dark-pattern .text-\\[\\#333333\\],
            .is-dark-pattern .text-\\[\\#444444\\] {
              color: rgba(255, 255, 255, 0.94) !important;
            }

            .is-dark-pattern .text-stone-500,
            .is-dark-pattern .text-stone-400,
            .is-dark-pattern .text-gray-500,
            .is-dark-pattern .text-gray-400,
            .is-dark-pattern .text-slate-500,
            .is-dark-pattern .text-slate-400 {
              color: rgba(255, 255, 255, 0.6) !important;
            }

            .is-dark-pattern .border-stone-100,
            .is-dark-pattern .border-stone-200,
            .is-dark-pattern .border-gray-100,
            .is-dark-pattern .border-gray-200,
            .is-dark-pattern .border-slate-100,
            .is-dark-pattern .border-slate-200 {
              border-color: rgba(255, 255, 255, 0.12) !important;
            }

            .is-dark-pattern input,
            .is-dark-pattern textarea {
              background-color: rgba(255, 255, 255, 0.05) !important;
              border-color: rgba(255, 255, 255, 0.15) !important;
              color: rgba(255, 255, 255, 0.95) !important;
            }

            .is-dark-pattern input::placeholder,
            .is-dark-pattern textarea::placeholder {
              color: rgba(255, 255, 255, 0.4) !important;
            }

            /* ── 스크롤 본문 및 모든 내부 자식 요소들의 마우스/터치 클릭 이벤트 강제 활성화 (z-[80] 오버레이 관통) ── */
            .custom-scrollbar-preview,
            .custom-scrollbar-preview * {
              pointer-events: auto !important;
            }
          ` }} />
          {(() => {
            const patternVal = theme.pattern as string;
            return (
              <>
                {/* ── [배경 백드롭 컬러 레이어 (z-0)] ── */}
                <div
                  className="absolute inset-0 z-0 transition-all duration-500"
                  style={{
                    backgroundColor: (() => {
                      // ── Category 1. 클래식 & 전통 한지 무드 (8종) ──
                      if (patternVal === 'cozyHanji') return '#fefdfa';
                      if (patternVal === 'traditionalTile') return '#f3f2ee';
                      if (patternVal === 'palaceGrid') return '#fcfaf6';
                      if (patternVal === 'lotusVase') return '#f0f4f5';
                      if (patternVal === 'coarseHemp') return '#f4f1ea';
                      if (patternVal === 'rainbowThread') return '#faf8f5';
                      if (patternVal === 'goldSilkEmb') return '#fffdf0';
                      if (patternVal === 'orientalInk') return '#f5f5f5';

                      // ── Category 2. 로맨틱 & 보태니컬 플라워 (8종) ──
                      if (patternVal === 'margaretWreath') return '#ffffff';
                      if (patternVal === 'oliveGarden') return '#f7fcf8';
                      if (patternVal === 'flowerArch') return '#fffcfb';
                      if (patternVal === 'roseGate') return '#fffafb';
                      if (patternVal === 'botanicalWatercolor') return '#f4fcf6';
                      if (patternVal === 'mistFlower') return '#fbf8ff';
                      if (patternVal === 'lavenderBreeze') return '#faf7fd';
                      if (patternVal === 'vintageLeafBorder') return '#faf9f5';

                      // ── Category 3. 내추럴 & 오가닉 패브릭 (8종) ──
                      if (patternVal === 'chiffonSilk') return '#fefefe';
                      if (patternVal === 'rawLinen') return '#f6f5f0';
                      if (patternVal === 'cozyFelt') return '#fcfbfa';
                      if (patternVal === 'vintageCraft') return '#efe9df';
                      if (patternVal === 'suedeMauve') return '#453c4b';
                      if (patternVal === 'espressoWrinkle') return '#2b1b15';
                      if (patternVal === 'satinNavy') return '#0a1120';
                      if (patternVal === 'roseVelvet') return '#3d0714';

                      // ── Category 4. 미니멀 & 모던 스톤 (8종) ──
                      if (patternVal === 'italianVein') return '#fcfdfe';
                      if (patternVal === 'coarseSand') return '#faf8f3';
                      if (patternVal === 'charcoalCement') return '#302c29';
                      if (patternVal === 'antiqueGoldCrack') return '#40240d';
                      if (patternVal === 'blackMatteSteel') return '#161514';
                      if (patternVal === 'pearlRock') return '#f0edf2';
                      if (patternVal === 'taupeMud') return '#faf6f0';
                      if (patternVal === 'gypsumPress') return '#fafafb';

                      // ── Category 5. 유니크 & 디자인 텍스처 (8종) ──
                      if (patternVal === 'goldGlitter') return '#fffaeb';
                      if (patternVal === 'seashellPearl') return '#fff5f5';
                      if (patternVal === 'doubleArch') return '#edf2f7';
                      if (patternVal === 'postalEnvelope') return '#faf6f0';
                      if (patternVal === 'filmCinema') return '#fbfbfa';
                      if (patternVal === 'champagneGoldWave') return '#fffaf0';
                      if (patternVal === 'crystalDrops') return '#f9fbff';
                      if (patternVal === 'sweetBabyHeart') return '#ffeff2';

                      return theme.bgColor || '#ffffff';
                    })(),
                  }}
                />

                {/* ── [본문 위에 투과되는 패턴 & 질감 오버레이 레이어 (z-[80] pointer-events-none)] ── */}
                {patternVal !== 'none' && (
                  <div
                    className="absolute inset-0 z-[80] transition-all duration-500"
                    style={{
                      backgroundImage: getPatternCSS(patternVal, theme.accentColor),
                      backgroundSize: 'cover',
                      backgroundBlendMode: (() => {
                        const overlayPatterns = [
                          'goldGlitter', 'seashellPearl', 'crystalDrops', 'sweetBabyHeart', 'doubleArch'
                        ];
                        if (overlayPatterns.includes(patternVal)) return 'overlay';
                        return 'multiply';
                      })(),
                      opacity: 0.18, // 흰색 카드나 글자들 위에 고혹적이게 투과되어 질감이 선명히 만져지도록 최적 18% 농도 설정
                      pointerEvents: 'none', // 인라인 스타일로 포인터 이벤트를 완전히 관통시켜 하위 이미지 클릭 기능 먹통 문제 완벽 해결
                    }}
                  />
                )}
              </>
            );
          })()}
          {/* 전체 화면 애니메이션 효과 적용 (z-[25]로 스크롤 내용물 z-20 위에 오버레이) */}
          <MainImageEffect
            type={theme.mainImageEffect || 'none'}
            loop={theme.mainImageEffectLoop}
            opacity={theme.mainImageEffectOpacity}
          />
          <div
            className={`absolute inset-x-2 bottom-4 top-0 overflow-y-auto scroll-smooth z-10 custom-scrollbar-preview`}
            style={{ scrollbarWidth: 'none', fontSize: `${theme.fontSize || 100}%`, textAlign: theme.textAlign || 'center' }}
          >
            <div
              className={`flex flex-col relative z-20 mx-auto transition-all duration-500 w-full pt-16 pb-10 ${!isMobile ? 'pb-32 px-10' : ''} ${theme.sectionFrame === 'round' ? 'p-5 pt-20 gap-6' : ''}`}
              style={{
                fontWeight: theme.isBold ? 'bold' : 'normal',
                fontStyle: theme.isItalic ? 'italic' : 'normal',
                textDecoration: [theme.isUnderline ? 'underline' : '', theme.isStrikethrough ? 'line-through' : ''].filter(Boolean).join(' ') || 'none'
              }}
            >
              {invitation.sections.map((section) => (
                <SectionWrapper key={section.id} section={section} theme={theme} selectedSectionId={selectedSectionId} onSectionClick={onSectionClick}>
                  <div
                    id={`preview-section-${section.id}`}
                    className={`${theme.sectionFrame === 'round' ? 'bg-white rounded-[2.5rem] shadow-[0_10px_30px_rgba(0,0,0,0.04)] overflow-hidden' : ''}`}
                  >
                    <SectionRenderer section={section} theme={theme} allSections={invitation.sections} />
                  </div>
                </SectionWrapper>
              ))}
            </div>
          </div>

          {/* 오프닝 탭 - 뮤직 플레이어 오버레이 */}
          {device === 'opening' && (
            <div className="absolute inset-0 z-[150] bg-gradient-to-b from-black/10 via-black/40 to-black/70 flex flex-col items-center justify-start pointer-events-auto pt-16 pb-6 overflow-y-auto">
              {/* 이미지 영역 크기를 w-[70%]로 슬림화하고 마진을 mb-4로 줄여 전체 레이아웃을 위로 눈부시게 격상 */}
              <div className="w-[70%] aspect-square rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.4)] mb-4 relative border border-white/20 mt-2">
                {theme.bgmCoverImage ? (
                  <img src={theme.bgmCoverImage} alt="Album Cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-500/80 to-purple-600/80 flex items-center justify-center">
                    <Music size={48} className="text-white/60" />
                  </div>
                )}
                {/* 앨범 커버 텍스트 (옵션) */}
                {(theme.bgmTitle || theme.bgmArtist) && (
                  <div className="absolute bottom-4 inset-x-4 border border-white/40 rounded-xl p-2 bg-white/10 backdrop-blur-sm text-center">
                    <p className="text-white text-[10px] font-medium tracking-widest uppercase">{theme.bgmTitle || 'Music'}</p>
                  </div>
                )}
              </div>

              <div className="text-center mb-4 w-full px-8">
                <h3 className="text-white text-2xl font-bold mb-1.5 drop-shadow-md">{theme.bgmTitle || 'Love poem'}</h3>
                <p className="text-white/80 text-sm font-medium drop-shadow-sm">{theme.bgmArtist || 'Joe Hisaishi'}</p>
              </div>

              {/* 플레이어 컨트롤 */}
              <div className="flex items-center gap-8 mb-10">
                <button className="text-white/90 hover:text-white hover:scale-110 transition-all">
                  <SkipBack size={28} fill="currentColor" />
                </button>
                <button
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('bgm-toggle-play'));
                  }}
                  className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 border border-white/30 flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all pointer-events-auto"
                >
                  {isBgmPlaying ? (
                    <div className="flex gap-[4.5px] h-[20px] items-center">
                      <div className="w-[3px] h-full bg-white rounded-full animate-[bgm-visualizer_1.2s_infinite]" />
                      <div className="w-[3px] h-[12px] bg-white rounded-full animate-[bgm-visualizer_1.2s_infinite]" style={{ animationDelay: '-0.4s' }} />
                      <div className="w-[3px] h-full bg-white rounded-full animate-[bgm-visualizer_1.2s_infinite]" style={{ animationDelay: '-0.8s' }} />
                    </div>
                  ) : (
                    <Play size={28} fill="currentColor" className="ml-1" />
                  )}
                </button>
                <button className="text-white/90 hover:text-white hover:scale-110 transition-all">
                  <SkipForward size={28} fill="currentColor" />
                </button>
              </div>

              {/* 반짝이는 네온 하트 */}
              <div className="relative mb-6 group cursor-pointer hover:scale-110 transition-transform">
                <div className="absolute inset-0 bg-rose-500 blur-xl opacity-40 rounded-full animate-pulse" />
                <Heart size={64} className="text-rose-500 relative z-10 filter drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]" strokeWidth={1.5} />
              </div>

              {/* 음악 구간 선택 (Range Slider) */}
              <div className="w-[85%] mt-2 flex flex-col gap-2">
                {(() => {
                  const resolvedDuration = bgmDuration > 0 ? bgmDuration : 180;
                  const progressPercent = (bgmCurrentTime / resolvedDuration) * 100;

                  const formatBgmTime = (seconds: number) => {
                    const mins = Math.floor(seconds / 60);
                    const secs = Math.floor(seconds % 60);
                    return `${mins}:${String(secs).padStart(2, '0')}`;
                  };

                  const handleSliderClick = (e: React.MouseEvent<HTMLDivElement>) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
                    const seekTime = Math.floor(percentage * resolvedDuration);

                    // 전역 음원 구간 세크 탐색 이벤트 방출
                    window.dispatchEvent(new CustomEvent('bgm-seek', {
                      detail: { time: seekTime }
                    }));
                  };

                  return (
                    <>
                      <div className="flex justify-between text-[10px] text-white/80 font-medium px-1">
                        <span>{formatBgmTime(bgmCurrentTime)}</span>
                        <span>{formatBgmTime(resolvedDuration)}</span>
                      </div>

                      {/* 클릭 가능한 반응형 게이지바 트랙 */}
                      <div
                        onClick={handleSliderClick}
                        className="relative w-full h-2 bg-white/20 rounded-full flex items-center cursor-pointer pointer-events-auto hover:bg-white/30 transition-colors"
                      >
                        {/* 진행 바 */}
                        <div
                          className="absolute h-full bg-rose-400 rounded-full"
                          style={{
                            left: '0%',
                            width: `${progressPercent}%`
                          }}
                        />

                        {/* 재생 헤드 (Thumb) */}
                        <div
                          className="absolute w-3.5 h-3.5 bg-white rounded-full shadow-[0_0_10px_rgba(244,63,94,0.6)] cursor-grab active:cursor-grabbing hover:scale-125 transition-transform"
                          style={{ left: `${progressPercent}%`, transform: 'translateX(-50%)' }}
                        />
                      </div>
                    </>
                  );
                })()}
                <p className="text-white/40 text-[10px] text-center mt-2">게이지바의 특정 위치를 터치하여 원하는 시작 구간을 설정해 보세요</p>
              </div>
            </div>
          )}
          {/* Home Indicator */}
          {isMobile && (
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-stone-300/60 rounded-full z-10" />
          )}
        </div>
      </div>

      <p className="mt-4 text-[11px] font-medium text-stone-400/80 tracking-tight flex items-center gap-1.5 select-none">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        실제 디자인과 차이가 있을 수 있습니다.
      </p>
    </div>
  );
}
