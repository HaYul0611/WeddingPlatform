'use client';

import { useState, useEffect, memo, useRef, useCallback } from 'react';
import type { InvitationTheme } from '@/types/invitation';
import {
  ChevronDown,
  ChevronUp,
  Music,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Info,
  Check,
  ChevronLeft,
  Layers,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { CustomSelect } from './CustomSelect';

interface DesignPanelProps {
  theme: InvitationTheme;
  onUpdate: (u: Partial<InvitationTheme>) => void;
}

// ── 컴포넌트들을 외부로 이동 (리렌더링 시 리마운트 방지) ──

const CircleColorPicker = memo(({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div className="flex flex-col items-center gap-2.5">
    <div className="relative w-12 h-12 rounded-full border-2 border-gray-100 overflow-hidden cursor-pointer shadow-sm hover:scale-110 transition-transform bg-white">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 w-[160%] h-[160%] -translate-x-[20%] -translate-y-[20%] cursor-pointer border-none p-0"
      />
    </div>
    <span className="text-[11px] font-bold text-[#4b5563] text-center">{label}</span>
  </div>
));
CircleColorPicker.displayName = 'CircleColorPicker';

const Toggle = memo(({ label, sublabel, value, onToggle }: { label: string; sublabel?: string; value: boolean; onToggle: () => void }) => (
  <div className="flex items-center justify-between p-3.5 bg-white border border-[#e5e7eb] rounded-xl w-full mb-3">
    <div>
      <div className="text-[13px] font-bold text-[#4b5563]">{label}</div>
      {sublabel && <div className="text-[11px] text-[#9ca3af] mt-0.5">{sublabel}</div>}
    </div>
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onToggle(); }}
      className={`relative w-[46px] h-[26px] rounded-full transition-colors duration-300 ease-in-out outline-none shrink-0 ${value ? 'bg-[#4b5563]' : 'bg-[#e5e7eb]'}`}
    >
      <div className={`absolute top-[2px] w-[22px] h-[22px] rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out ${value ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
    </button>
  </div>
));
Toggle.displayName = 'Toggle';

const SectionCard = memo(({ title, icon: Icon, id, children, isOpen, onToggle, isAccordion = true, iconColor = "text-[#111827]" }: any) => {
  return (
    <div className="bg-white rounded-2xl border border-[#F1F2F4] shadow-sm overflow-hidden mb-4">
      <div
        className={`flex items-center justify-between px-5 py-5 transition-colors ${isAccordion ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'}`}
        onClick={() => isAccordion && onToggle(isOpen ? null : id)}
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon size={19} className={iconColor} strokeWidth={2.5} />}
          <span className="text-[14px] font-bold text-[#111827]">{title}</span>
        </div>
        {isAccordion && (
          isOpen ? <ChevronUp size={16} className="text-[#9ca3af]" /> : <ChevronDown size={16} className="text-[#9ca3af]" />
        )}
      </div>
      <div className={`grid transition-all duration-300 ease-in-out ${(!isAccordion || isOpen) ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
        <div className="overflow-hidden min-h-0">
          <div className="px-5 pb-8">{children}</div>
        </div>
      </div>
    </div>
  );
});
SectionCard.displayName = 'SectionCard';

const CustomSlider = memo(({ min, max, step, value, onChange, label, unit = "%", sublabel }: any) => {
  const percentage = ((value - min) / (max - min)) * 100;
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[13px] font-bold text-[#111827]">{label}: {value}{unit}</span>
      </div>
      <input
        type="range"
        className="range-slider"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ '--slider-percent': `${percentage}%` } as any}
      />
      {sublabel && <p className="text-[11px] text-[#9ca3af] mt-1.5 leading-relaxed">{sublabel}</p>}
    </div>
  );
});
CustomSlider.displayName = 'CustomSlider';

const ThumbnailSlider = memo(({ items, selectedValue, onSelect, sublabel, showHint = false }: any) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [thumbWidth, setThumbWidth] = useState(30);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartScrollLeft = useRef(0);

  const updateScrollProgress = useCallback(() => {
    const el = scrollRef.current;
    if (el) {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      const maxScroll = scrollWidth - clientWidth;
      const progress = maxScroll > 0 ? scrollLeft / maxScroll : 0;
      setScrollProgress(progress);
      setThumbWidth(Math.max((clientWidth / scrollWidth) * 100, 15));
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', updateScrollProgress, { passive: true });
      const timer = setTimeout(updateScrollProgress, 100);
      return () => {
        el.removeEventListener('scroll', updateScrollProgress);
        clearTimeout(timer);
      };
    }
  }, [items, updateScrollProgress]);

  // 드래그 로직
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const track = trackRef.current;
      const el = scrollRef.current;
      if (track && el) {
        const rect = track.getBoundingClientRect();
        const deltaX = e.clientX - dragStartX.current;
        const scrollRange = el.scrollWidth - el.clientWidth;
        const trackRange = rect.width * (1 - thumbWidth / 100);

        if (trackRange > 0) {
          const deltaScroll = (deltaX / trackRange) * scrollRange;
          el.scrollLeft = dragStartScrollLeft.current + deltaScroll;
        }
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      document.body.style.userSelect = '';
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, thumbWidth]);

  const handleThumbMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const el = scrollRef.current;
    if (el) {
      setIsDragging(true);
      dragStartX.current = e.clientX;
      dragStartScrollLeft.current = el.scrollLeft;
      document.body.style.userSelect = 'none'; // 드래그 중 텍스트 선택 방지
    }
  };

  const handleManualScroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (el) {
      el.scrollBy({ left: direction === 'left' ? -200 : 200, behavior: 'smooth' });
    }
  };

  const handleTrackClick = (e: React.MouseEvent) => {
    const track = trackRef.current;
    const el = scrollRef.current;
    if (track && el) {
      const rect = track.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      // 썸 중앙이 클릭 위치로 오게 계산
      const percentage = Math.min(Math.max((clickX - (rect.width * (thumbWidth / 100)) / 2) / (rect.width * (1 - thumbWidth / 100)), 0), 1);
      const targetScroll = percentage * (el.scrollWidth - el.clientWidth);
      el.scrollTo({ left: targetScroll, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative group w-full" style={{ height: '64px' }}>
        <button
          onClick={() => handleManualScroll('left')}
          className="absolute -left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white border border-gray-100 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        >
          <ChevronLeft size={16} className="text-[#3B82F6]" strokeWidth={3} />
        </button>

        <div
          ref={scrollRef}
          id={`slider-${sublabel}`}
          className={`flex gap-2.5 overflow-x-auto no-scrollbar w-full h-full px-1 ${isDragging ? '' : 'scroll-smooth'}`}
        >
          {items.map((item: any) => {
            const isSelected = selectedValue === item.value;
            const hasColor = !!item.color;
            // 어두운 컬러칩들은 텍스트 가독성을 위해 흰색 글자로 분기 처리
            const isDarkColor = hasColor && [
              '#453c4b', '#2b1b15', '#0a1120', '#3d0714', '#302c29', '#40240d', '#161514', '#320c4a'
            ].includes(item.color.toLowerCase());

            return (
              <div
                key={item.value}
                onClick={() => onSelect(item.value)}
                className={`relative w-[80px] h-[64px] shrink-0 rounded-xl cursor-pointer transition-all border-2 overflow-hidden flex flex-col justify-between p-2 ${isSelected ? 'border-[#3B82F6] shadow-[0_0_0_1px_rgba(59,130,246,0.2)]' : 'border-[#F1F2F4] hover:border-gray-300'}`}
                style={{
                  backgroundColor: item.color || '#ffffff',
                }}
              >
                <div className="w-full h-full flex items-center justify-center">
                  <span
                    className={`text-[10px] text-center font-extrabold leading-tight break-keep select-none ${isDarkColor ? 'text-white/95' : 'text-stone-700/90'
                      }`}
                  >
                    {item.label}
                  </span>
                </div>
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 bg-[#3B82F6] rounded-full p-0.5 shadow-sm">
                    <Check size={10} className="text-white" strokeWidth={4} />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={() => handleManualScroll('right')}
          className="absolute -right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 bg-white border border-gray-100 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
        >
          <ChevronDown size={16} className="text-[#3B82F6] -rotate-90" strokeWidth={3} />
        </button>
      </div>

      {/* 커스텀 디자인 스크롤바 (Snappost 스타일 + 드래그 & 클릭 이동 기능) */}
      <div className="relative px-4 mt-2 h-6 flex items-center">
        <div className="h-[8px] w-full bg-[#f1f2f4] rounded-full relative flex items-center px-4">
          <button
            onClick={() => handleManualScroll('left')}
            className="absolute left-1 flex items-center justify-center w-2 h-full outline-none z-10"
          >
            <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-r-[5px] border-r-[#9ca3af] hover:border-r-[#3B82F6]" />
          </button>

          <div
            ref={trackRef}
            onClick={handleTrackClick}
            className="relative flex-1 h-full mx-1 cursor-pointer"
          >
            <div
              onMouseDown={handleThumbMouseDown}
              className={`absolute h-[8px] bg-[#9ca3af] hover:bg-[#3B82F6] rounded-full transition-all ease-out cursor-grab active:cursor-grabbing ${isDragging ? 'duration-0 bg-[#3B82F6]' : 'duration-300'}`}
              style={{
                width: `${thumbWidth}%`,
                left: `${scrollProgress * (100 - thumbWidth)}%`
              }}
            />
          </div>

          <button
            onClick={() => handleManualScroll('right')}
            className="absolute right-1 flex items-center justify-center w-2 h-full outline-none z-10"
          >
            <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[5px] border-l-[#9ca3af] hover:border-l-[#3B82F6]" />
          </button>
        </div>
      </div>

      {showHint && (
        <p className="text-[10px] text-[#9ca3af] text-center font-medium mt-1">← 좌우로 스크롤하여 더 많은 선택지 보기 →</p>
      )}
    </div>
  );
});
ThumbnailSlider.displayName = 'ThumbnailSlider';

export default function DesignPanel({ theme, onUpdate }: DesignPanelProps) {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [isDecoOpen, setIsDecoOpen] = useState(false);
  const [activeColorTab, setActiveColorTab] = useState<'preset' | 'custom'>('preset');
  const [customColorSubTab, setCustomColorSubTab] = useState<'base' | 'text' | 'border'>('base');

  // 초기 진입 시 기본값 보정 (textAlign 등)
  const currentTextAlign = theme.textAlign || 'center';
  const currentFontSize = theme.fontSize || 100;
  const currentBgmVolume = theme.bgmVolume ?? 50;

  const colorPresets = [
    { id: 'minimal', name: 'Minimal', colors: ['#111827', '#4B5563', '#FFFFFF', '#F3F4F6'] },
    { id: 'classic', name: 'Classic', colors: ['#633231', '#8B5E5C', '#FFFFFF', '#FDFBFB'] },
    { id: 'brown', name: 'Brown', colors: ['#734F40', '#9C7E6B', '#FFFFFF', '#F9F7F6'] },
    { id: 'spring', name: 'Spring', colors: ['#647352', '#919C84', '#FFFFFF', '#F8F9F5'] },
    { id: 'blue', name: 'Blue', colors: ['#4A6375', '#768999', '#FFFFFF', '#F5F7F9'] },
    { id: 'lavender', name: 'Lavender', colors: ['#61557A', '#8A819C', '#FFFFFF', '#F7F6F9'] },
    { id: 'pink', name: 'Pink', colors: ['#C54B64', '#D68A9A', '#FFFFFF', '#FCF6F7'] },
    { id: 'dark', name: 'Dark', colors: ['#E5E7EB', '#9CA3AF', '#111827', '#1F2937'] },
    { id: 'vivid', name: 'Vivid', colors: ['#D81B60', '#EC407A', '#FFFFFF', '#FFF5F8'] },
    { id: 'lemon', name: 'Lemon', colors: ['#827717', '#AFB42B', '#FFFFFF', '#FEFDEB'] },
    { id: 'mint', label: 'Mint', colors: ['#00695C', '#26A69A', '#FFFFFF', '#F2FAF9'] },
    { id: 'cherry', label: 'Cherry', colors: ['#C62828', '#EF5350', '#FFFFFF', '#FFF5F5'] },
    { id: 'dusty-rose', label: 'Dusty-rose', colors: ['#A64452', '#C27E88', '#FFFFFF', '#F9F4F5'] },
    { id: 'sage', label: 'Sage', colors: ['#708271', '#9BA89C', '#FFFFFF', '#F6F7F6'] },
    { id: 'charcoal', label: 'Charcoal', colors: ['#374151', '#6B7280', '#FFFFFF', '#F9FAFB'] },
    { id: 'slate', label: 'Slate', colors: ['#475569', '#94A3B8', '#FFFFFF', '#F8FAFC'] },
  ];

  const handleApplyPreset = (preset: any) => {
    onUpdate({
      primaryColor: preset.colors[0],
      accentColor: preset.colors[1],
      bgColor: preset.colors[2],
      surfaceColor: preset.colors[3],
    });
  };

  const handleResetColors = () => {
    onUpdate({
      primaryColor: '#3B82F6',
      accentColor: '#60A5FA',
      bgColor: '#FFFFFF',
      surfaceColor: '#FFFFFF',
      textColor: '#111827',
      heroTextColor: '#111827',
      borderColor: '#E5E7EB',
      dividerColor: '#F3F4F6',
    });
  };

  return (
    <div className="flex flex-col p-3 bg-[#F9FAFB]">
      <SectionCard title="배경 음악 설정" icon={Music} id="bgm" isOpen={openSection === 'bgm'} onToggle={setOpenSection} iconColor="text-[#A855F7]">
        <div className="space-y-4">
          <div>
            <div className="text-[13px] font-bold text-[#111827] mb-2">프리셋 음악</div>
            <CustomSelect
              value={theme.bgmUrl || ''}
              options={[
                { id: '', name: '음악 없음', extra: '사운드 끔' },
                { id: 'AboveTheTreetops.mp3', name: '🎵 AboveTheTreetops', extra: '로컬 BGM' },
                { id: 'Alon Peretz - The Hive.mp3', name: '🎵 The Hive — Alon Peretz', extra: '로컬 BGM' },
                { id: 'Anthony Lazaro - Like a Song - Instrumental version.mp3', name: '🎵 Like a Song - Instrumental version — Anthony Lazaro', extra: '로컬 BGM' },
                { id: 'Aquarium.mp3', name: '🎵 Aquarium', extra: '로컬 BGM' },
                { id: 'Assaf Ayalon - Stand.mp3', name: '🎵 Stand — Assaf Ayalon', extra: '로컬 BGM' },
                { id: 'Assaf Ayalon - Unexpected Moment.mp3', name: '🎵 Unexpected Moment — Assaf Ayalon', extra: '로컬 BGM' },
                { id: 'BadGuys.mp3', name: '🎵 BadGuys', extra: '로컬 BGM' },
                { id: 'Elad Perez - A World of Peace.mp3', name: '🎵 A World of Peace — Elad Perez', extra: '로컬 BGM' },
                { id: 'FantasticThinking.mp3', name: '🎵 FantasticThinking', extra: '로컬 BGM' },
                { id: 'FloralLife.mp3', name: '🎵 FloralLife', extra: '로컬 BGM' },
                { id: 'Ian Post - Circus Clown.mp3', name: '🎵 Circus Clown — Ian Post', extra: '로컬 BGM' },
                { id: 'Ian Post - Just Jump.mp3', name: '🎵 Just Jump — Ian Post', extra: '로컬 BGM' },
                { id: 'Kyle J Hartman - Luminance.mp3', name: '🎵 Luminance — Kyle J Hartman', extra: '로컬 BGM' },
                { id: 'Leafre.mp3', name: '🎵 Leafre', extra: '로컬 BGM' },
                { id: 'Michael Shynes - The Best Time of the Year - Alternative - Short version a.mp3', name: '🎵 The Best Time of the Year - Alternative - Short version a — Michael Shynes', extra: '로컬 BGM' },
                { id: 'MuruengHill.mp3', name: '🎵 MuruengHill', extra: '로컬 BGM' },
                { id: 'Paper Planes - Goodbye Skies - Instrumental version.mp3', name: '🎵 Goodbye Skies - Instrumental version — Paper Planes', extra: '로컬 BGM' },
                { id: 'ShininHarbor.mp3', name: '🎵 ShininHarbor', extra: '로컬 BGM' },
                { id: 'SnowyVillage.mp3', name: '🎵 SnowyVillage', extra: '로컬 BGM' },
                { id: 'Steven Beddall - Blanket of Starlight - No Backing Vocals.mp3', name: '🎵 Blanket of Starlight - No Backing Vocals — Steven Beddall', extra: '로컬 BGM' },
                { id: 'The David Roy Collective - Springtime Blessings.mp3', name: '🎵 Springtime Blessings — The David Roy Collective', extra: '로컬 BGM' },
                { id: 'WhenTheMorningComes.mp3', name: '🎵 WhenTheMorningComes', extra: '로컬 BGM' },
                { id: 'Zac Nelson - Life Begins.mp3', name: '🎵 Life Begins — Zac Nelson', extra: '로컬 BGM' },
                { id: 'Ziggy - Happy Birthday - Around the Campfire - No Lead Melodies.mp3', name: '🎵 Happy Birthday - Around the Campfire - No Lead Melodies — Ziggy', extra: '로컬 BGM' },
                { id: 'Ziv Moran - Like a Feather - Acoustic Guitars Version.mp3', name: '🎵 Like a Feather - Acoustic Guitars Version — Ziv Moran', extra: '로컬 BGM' },
                { id: 'idokay - Through the Yellow Blue Fields.mp3', name: '🎵 Through the Yellow Blue Fields — idokay', extra: '로컬 BGM' },
              ]}
              onChange={(v) => {
                const presetInfo: Record<string, { title: string; artist: string }> = {
                  'AboveTheTreetops.mp3': { title: 'AboveTheTreetops', artist: 'Unknown' },
                  'Alon Peretz - The Hive.mp3': { title: 'The Hive', artist: 'Alon Peretz' },
                  'Anthony Lazaro - Like a Song - Instrumental version.mp3': { title: 'Like a Song - Instrumental version', artist: 'Anthony Lazaro' },
                  'Aquarium.mp3': { title: 'Aquarium', artist: 'Unknown' },
                  'Assaf Ayalon - Stand.mp3': { title: 'Stand', artist: 'Assaf Ayalon' },
                  'Assaf Ayalon - Unexpected Moment.mp3': { title: 'Unexpected Moment', artist: 'Assaf Ayalon' },
                  'BadGuys.mp3': { title: 'BadGuys', artist: 'Unknown' },
                  'Elad Perez - A World of Peace.mp3': { title: 'A World of Peace', artist: 'Elad Perez' },
                  'FantasticThinking.mp3': { title: 'FantasticThinking', artist: 'Unknown' },
                  'FloralLife.mp3': { title: 'FloralLife', artist: 'Unknown' },
                  'Ian Post - Circus Clown.mp3': { title: 'Circus Clown', artist: 'Ian Post' },
                  'Ian Post - Just Jump.mp3': { title: 'Just Jump', artist: 'Ian Post' },
                  'Kyle J Hartman - Luminance.mp3': { title: 'Luminance', artist: 'Kyle J Hartman' },
                  'Leafre.mp3': { title: 'Leafre', artist: 'Unknown' },
                  'Michael Shynes - The Best Time of the Year - Alternative - Short version a.mp3': { title: 'The Best Time of the Year - Alternative - Short version a', artist: 'Michael Shynes' },
                  'MuruengHill.mp3': { title: 'MuruengHill', artist: 'Unknown' },
                  'Paper Planes - Goodbye Skies - Instrumental version.mp3': { title: 'Goodbye Skies - Instrumental version', artist: 'Paper Planes' },
                  'ShininHarbor.mp3': { title: 'ShininHarbor', artist: 'Unknown' },
                  'SnowyVillage.mp3': { title: 'SnowyVillage', artist: 'Unknown' },
                  'Steven Beddall - Blanket of Starlight - No Backing Vocals.mp3': { title: 'Blanket of Starlight - No Backing Vocals', artist: 'Steven Beddall' },
                  'The David Roy Collective - Springtime Blessings.mp3': { title: 'Springtime Blessings', artist: 'The David Roy Collective' },
                  'WhenTheMorningComes.mp3': { title: 'WhenTheMorningComes', artist: 'Unknown' },
                  'Zac Nelson - Life Begins.mp3': { title: 'Life Begins', artist: 'Zac Nelson' },
                  'Ziggy - Happy Birthday - Around the Campfire - No Lead Melodies.mp3': { title: 'Happy Birthday - Around the Campfire - No Lead Melodies', artist: 'Ziggy' },
                  'Ziv Moran - Like a Feather - Acoustic Guitars Version.mp3': { title: 'Like a Feather - Acoustic Guitars Version', artist: 'Ziv Moran' },
                  'idokay - Through the Yellow Blue Fields.mp3': { title: 'Through the Yellow Blue Fields', artist: 'idokay' },
                };

                if (v && presetInfo[v]) {
                  onUpdate({
                    bgmUrl: v,
                    bgmTitle: presetInfo[v].title,
                    bgmArtist: presetInfo[v].artist
                  });
                } else {
                  onUpdate({
                    bgmUrl: v,
                    bgmTitle: undefined,
                    bgmArtist: undefined
                  });
                }
              }}
            />
          </div>
          <div className="space-y-4">
            <div>
              <div className="text-[13px] font-bold text-[#111827] mb-2 flex items-center justify-between">
                <span>커스텀 음악 파일 첨부</span>
                {theme.bgmCustomFile && (
                  <button onClick={() => onUpdate({ bgmCustomFile: undefined, bgmTitle: undefined, bgmArtist: undefined })} className="text-[11px] text-red-500 hover:underline">삭제</button>
                )}
              </div>
              <label className="flex items-center justify-center w-full p-3 bg-white border border-dashed border-[#d1d5db] hover:border-[#3B82F6] rounded-xl text-[13px] cursor-pointer transition-colors">
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const url = URL.createObjectURL(file);
                      const title = file.name.replace(/\.[^/.]+$/, "");

                      // 오디오 메타데이터(길이) 추출
                      const audio = new Audio(url);
                      audio.addEventListener('loadedmetadata', () => {
                        onUpdate({
                          bgmCustomFile: url,
                          bgmTitle: title,
                          bgmDuration: audio.duration,
                          bgmStartTime: 0,
                          bgmEndTime: audio.duration
                        });
                      });
                    }
                  }}
                />
                <span className="text-[#6b7280]">
                  {theme.bgmCustomFile ? '음악 파일 변경하기' : '오디오 파일 업로드 (MP3 등)'}
                </span>
              </label>
            </div>

            {(theme.bgmCustomFile || theme.bgmUrl) && (
              <>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <div className="text-[11px] font-bold text-[#4b5563] mb-1.5">곡 제목</div>
                    <input
                      type="text"
                      placeholder="곡 제목 입력"
                      className="w-full p-2.5 bg-white border border-[#e5e7eb] rounded-xl text-[12px] outline-none"
                      value={theme.bgmTitle || ''}
                      onChange={(e) => onUpdate({ bgmTitle: e.target.value })}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-[11px] font-bold text-[#4b5563] mb-1.5">아티스트</div>
                    <input
                      type="text"
                      placeholder="아티스트 입력"
                      className="w-full p-2.5 bg-white border border-[#e5e7eb] rounded-xl text-[12px] outline-none"
                      value={theme.bgmArtist || ''}
                      onChange={(e) => onUpdate({ bgmArtist: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <div className="text-[13px] font-bold text-[#111827] mb-2 flex items-center justify-between">
                    <span>커버 이미지 업로드 (선택)</span>
                    {theme.bgmCoverImage && (
                      <button onClick={() => onUpdate({ bgmCoverImage: undefined })} className="text-[11px] text-red-500 hover:underline">삭제</button>
                    )}
                  </div>
                  <label className="flex items-center justify-center w-full p-3 bg-white border border-dashed border-[#d1d5db] hover:border-[#3B82F6] rounded-xl text-[13px] cursor-pointer transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = URL.createObjectURL(file);
                          onUpdate({ bgmCoverImage: url });
                        }
                      }}
                    />
                    <span className="text-[#6b7280]">
                      {theme.bgmCoverImage ? '커버 이미지 변경하기' : '이미지 파일 업로드'}
                    </span>
                  </label>
                  <p className="text-[11px] text-[#9ca3af] mt-1.5">오프닝 탭의 뮤직 플레이어 앨범 아트로 사용됩니다.</p>
                </div>
              </>
            )}
          </div>
          <Toggle label="자동 재생" sublabel="페이지 로드 시 자동으로 음악 재생" value={!!theme.bgmAutoPlay} onToggle={() => onUpdate({ bgmAutoPlay: !theme.bgmAutoPlay })} />
          {theme.bgmAutoPlay && (
            <div className="bg-[#FFFBEB] border border-[#FEF3C7] rounded-xl p-4 flex gap-3">
              <Info size={18} className="text-[#D97706] flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#B45309] leading-[1.7] font-medium break-keep">
                브라우저 자동재생 정책에 따라 일부 환경(iPhone·iPad·신규 방문자 등)에서는 즉시 자동재생이 차단됩니다. 이 경우 사용자가 화면을 한 번 탭하는 순간 음악이 시작됩니다.
              </p>
            </div>
          )}
          <Toggle label="반복 재생" value={!!theme.bgmLoop} onToggle={() => onUpdate({ bgmLoop: !theme.bgmLoop })} />
          <CustomSlider min={0} max={100} step={5} value={currentBgmVolume} onChange={(v: number) => onUpdate({ bgmVolume: v })} label="볼륨" />
        </div>
      </SectionCard>

      <SectionCard title="글꼴 및 텍스트" icon={Type} id="font" isAccordion={false}>
        <div className="space-y-6">
          <div>
            <div className="text-[13px] font-bold text-[#4b5563] mb-2.5">폰트</div>
            <CustomSelect
              value={theme.fontFamily || 'Gowun Batang'}
              options={[
                { id: 'Gowun Batang', name: 'Gowun Batang', extra: 'Serif' },
                { id: 'Noto Sans KR', name: 'Noto Sans KR', extra: 'Sans-Serif' },
                { id: 'Pretendard', name: 'Pretendard', extra: 'Sans-Serif' },
                { id: 'Nanum Myeongjo', name: 'Nanum Myeongjo', extra: 'Serif' },
                { id: 'Mapo Flower Island', name: 'Mapo Flower Island', extra: 'Display' },
                { id: 'Chosun Centennal', name: 'Chosun Centennal', extra: 'Serif' }
              ]}
              onChange={(v) => onUpdate({ fontFamily: v })}
            />
          </div>
          <CustomSlider min={50} max={200} step={5} value={currentFontSize} onChange={(v: number) => onUpdate({ fontSize: v })} label="폰트 크기" />
          <div>
            <div className="text-[13px] font-bold text-[#4b5563] mb-2.5">텍스트 정렬</div>
            <div className="flex gap-2">
              {(['left', 'center', 'right'] as const).map((align) => (
                <button
                  key={align}
                  onClick={() => onUpdate({ textAlign: align })}
                  className={`flex-1 flex justify-center py-2.5 border rounded-xl transition-all ${currentTextAlign === align ? 'border-[#3B82F6] bg-[#EFF6FF] text-[#3B82F6] shadow-[0_0_0_1px_rgba(59,130,246,0.1)]' : 'border-[#e5e7eb] text-[#6b7280] bg-white'}`}
                >
                  {align === 'left' && <AlignLeft size={18} />}
                  {align === 'center' && <AlignCenter size={18} />}
                  {align === 'right' && <AlignRight size={18} />}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-[#F1F2F4]">
            <SectionCard
              title="텍스트 장식 & 애니메이션"
              id="text_deco"
              isAccordion
              isOpen={isDecoOpen}
              onToggle={() => setIsDecoOpen(!isDecoOpen)}
              iconColor="text-[#A855F7]"
            >
              <div className="space-y-6 pt-2">
                <p className="text-[11px] text-[#9ca3af] leading-relaxed mb-1">히어로 섹션에 장식용 텍스트를 추가합니다.</p>
                <Toggle
                  label="활성화"
                  sublabel="SVG 텍스트 장식을 표시합니다."
                  value={!!theme.useTextDecoration}
                  onToggle={() => onUpdate({ useTextDecoration: !theme.useTextDecoration })}
                />

                {theme.useTextDecoration && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div>
                      <div className="text-[13px] font-bold text-[#111827] mb-3">텍스트 스타일 선택</div>
                      <ThumbnailSlider
                        sublabel="deco-styles"
                        selectedValue={theme.decorationText || 'style1'}
                        onSelect={(v: any) => onUpdate({ decorationText: v })}
                        items={[
                          { value: 'style1', label: 'Just Married', image: '' },
                          { value: 'style2', label: '결혼합니다', image: '' },
                          { value: 'style3', label: '우리 결혼합니다', image: '' },
                          { value: 'style4', label: 'Wedding Day', image: '' },
                          { value: 'style5', label: 'Wedding Day (Script)', image: '' },
                        ]}
                        showHint
                      />
                    </div>

                    <div>
                      <div className="text-[13px] font-bold text-[#111827] mb-2">애니메이션</div>
                      <CustomSelect
                        value={theme.textAnimation || 'none'}
                        options={[
                          { id: 'none', name: '없음', extra: '애니메이션 비활성화' },
                          { id: 'fadeIn', name: '페이드 인', extra: '서서히 나타남' },
                          { id: 'fadeUp', name: '페이드 업', extra: '위로 올라오며 나타남' },
                          { id: 'fadeDown', name: '페이드 다운', extra: '아래로 내려가며 나타남' },
                          { id: 'typing', name: '타이핑', extra: '글자가 하나씩 써짐' }
                        ]}
                        onChange={(v) => onUpdate({ textAnimation: v as any })}
                      />
                    </div>

                    <div>
                      <div className="text-[13px] font-bold text-[#111827] mb-2">색상</div>
                      <div className="flex gap-2">
                        <div className="w-10 h-10 rounded-lg border border-gray-200 overflow-hidden relative flex-shrink-0 shadow-sm">
                          <input
                            type="color"
                            value={theme.decorationColor || '#ffffff'}
                            onChange={(e) => onUpdate({ decorationColor: e.target.value })}
                            className="absolute inset-0 w-[160%] h-[160%] -translate-x-[20%] -translate-y-[20%] cursor-pointer"
                          />
                        </div>
                        <input
                          type="text"
                          value={theme.decorationColor || '#ffffff'}
                          onChange={(e) => onUpdate({ decorationColor: e.target.value })}
                          className="flex-1 px-3 border border-[#e5e7eb] rounded-lg text-[13px] outline-none focus:border-[#3B82F6]"
                        />
                      </div>
                    </div>

                    <div className="space-y-6 pt-2">
                      <CustomSlider
                        label="모바일 크기"
                        unit="vw"
                        min={0}
                        max={200}
                        value={theme.mobileSize ?? 80}
                        onChange={(v: number) => onUpdate({ mobileSize: v })}
                        sublabel="모바일에서의 크기. 0은 모바일에서 숨김."
                      />
                      <CustomSlider
                        label="위치 (상하)"
                        unit="%"
                        min={5}
                        max={95}
                        value={theme.mobileVPosition ?? 63}
                        onChange={(v: number) => onUpdate({ mobileVPosition: v })}
                      />
                      <CustomSlider
                        label="데스크톱 크기"
                        unit="vw"
                        min={0}
                        max={200}
                        value={theme.desktopSize ?? 20}
                        onChange={(v: number) => onUpdate({ desktopSize: v })}
                        sublabel="데스크톱에서의 크기. 0은 데스크톱에서 숨김."
                      />
                      <CustomSlider
                        label="데스크톱 최대 너비"
                        unit="px"
                        min={0}
                        max={1600}
                        step={10}
                        value={theme.desktopMaxWidth ?? 0}
                        onChange={(v: number) => onUpdate({ desktopMaxWidth: v })}
                        sublabel="데스크톱에서 SVG의 최대 너비를 제한합니다. 0은 제한 없음."
                      />
                      <CustomSlider
                        label="데스크톱 상하 위치"
                        unit="%"
                        min={5}
                        max={95}
                        value={theme.desktopVPosition ?? 63}
                        onChange={(v: number) => onUpdate({ desktopVPosition: v })}
                        sublabel="데스크톱에서 SVG의 상하 위치를 별도로 설정합니다."
                      />
                      <CustomSlider
                        label="데스크톱 좌우 위치"
                        unit="%"
                        min={-50}
                        max={50}
                        value={theme.desktopHPosition ?? 0}
                        onChange={(v: number) => onUpdate({ desktopHPosition: v })}
                        sublabel="데스크톱에서 SVG의 좌우 위치를 조정합니다. 음수는 왼쪽, 양수는 오른쪽."
                      />
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="스크롤 애니메이션" icon={Layers} id="scroll_animation" isAccordion={false}>
        <div className="space-y-5">
          <Toggle
            label="애니메이션 사용"
            value={!!theme.useScrollAnimation}
            onToggle={() => onUpdate({ useScrollAnimation: !theme.useScrollAnimation })}
          />
          {theme.useScrollAnimation && (
            <div className="animate-in fade-in duration-300">
              <div className="text-[12px] font-bold text-[#6b7280] mb-2.5">애니메이션 스타일</div>
              <div className="flex p-1 bg-white border border-[#e5e7eb] rounded-xl w-fit">
                {(['slide', 'blur', 'none'] as const).map((style) => {
                  const isSelected = theme.scrollAnimationType === style || (!theme.scrollAnimationType && style === 'slide');
                  return (
                    <button
                      key={style}
                      onClick={() => onUpdate({ scrollAnimationType: style })}
                      className={`px-5 py-1.5 text-[12px] font-bold rounded-lg transition-all ${isSelected
                        ? 'bg-white text-[#3B82F6] shadow-sm border border-[#e5e7eb]'
                        : 'text-[#6b7280] hover:text-[#111827] border border-transparent'
                        }`}
                    >
                      {style === 'slide' ? '슬라이드' : style === 'blur' ? '블러' : '초기화'}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard title="오프닝 애니메이션" icon={Sparkles} id="opening_animation" isAccordion={false}>
        <div className="space-y-4">
          <Toggle
            label="오프닝 애니메이션 활성화"
            value={!!theme.useOpeningAnimation}
            onToggle={() => onUpdate({ useOpeningAnimation: !theme.useOpeningAnimation })}
          />
        </div>
      </SectionCard>

      <SectionCard title="디자인 설정" id="design_settings" isAccordion={false}>
        <div className="space-y-8 mt-1 min-h-[400px]">
          <div className="pt-2 border-b border-gray-100 pb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[13px] font-bold text-[#111827]">색상 테마</div>
              <button
                onClick={handleResetColors}
                className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-black text-stone-600 bg-stone-100 hover:bg-stone-200 active:scale-[0.95] rounded-md transition-all border border-stone-200/50 cursor-pointer"
                translate="no"
              >
                <RotateCcw size={11} strokeWidth={2.5} className="text-stone-500" />
                <span className="notranslate">초기화</span>
              </button>
            </div>

            <div className="flex p-1 bg-gray-100/80 rounded-xl mb-6 border border-gray-100 shadow-sm">
              <button onClick={() => setActiveColorTab('preset')} className={`flex-1 py-1.5 text-[12px] font-bold rounded-lg transition-all ${activeColorTab === 'preset' ? 'bg-white text-[#111827] shadow-sm' : 'text-[#9ca3af]'}`}>프리셋</button>
              <button onClick={() => setActiveColorTab('custom')} className={`flex-1 py-1.5 text-[12px] font-bold rounded-lg transition-all ${activeColorTab === 'custom' ? 'bg-white text-[#111827] shadow-sm' : 'text-[#9ca3af]'}`}>커스텀</button>
            </div>

            {activeColorTab === 'preset' ? (
              <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-300">
                {colorPresets.map((p) => {
                  const isSelected = theme.primaryColor === p.colors[0] && theme.bgColor === p.colors[2];
                  return (
                    <div key={p.id} onClick={() => handleApplyPreset(p)} className={`relative p-3 rounded-xl border-2 transition-all cursor-pointer ${isSelected ? 'border-[#3B82F6] bg-[#3B82F6]/5' : 'border-gray-100 bg-white'}`}>
                      <div className="text-[12px] font-bold text-[#111827] mb-2">{p.name || (p as any).label}</div>
                      <div className="flex gap-1">
                        {p.colors.map((c, i) => <div key={i} className="w-5 h-5 rounded-md border border-gray-100" style={{ backgroundColor: c }} />)}
                      </div>
                      {isSelected && <div className="absolute top-2 right-2 bg-[#3B82F6] rounded-full p-0.5"><Check size={10} className="text-white" strokeWidth={3} /></div>}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="flex p-1 bg-gray-50 rounded-xl border border-gray-100 shadow-inner">
                  {(['base', 'text', 'border'] as const).map((t) => (
                    <button key={t} onClick={() => setCustomColorSubTab(t)} className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${customColorSubTab === t ? 'bg-white text-[#3B82F6] shadow-sm' : 'text-[#9ca3af]'}`}>{t.toUpperCase()}</button>
                  ))}
                </div>
                <div className="flex flex-wrap gap-x-6 gap-y-6 justify-start px-2">
                  {customColorSubTab === 'base' && (
                    <>
                      <CircleColorPicker label="Primary" value={theme.primaryColor} onChange={(c) => onUpdate({ primaryColor: c })} />
                      <CircleColorPicker label="Secondary" value={theme.accentColor} onChange={(c) => onUpdate({ accentColor: c })} />
                      <CircleColorPicker label="Background" value={theme.bgColor} onChange={(c) => onUpdate({ bgColor: c })} />
                      <CircleColorPicker label="Surface" value={theme.surfaceColor || '#FFFFFF'} onChange={(c) => onUpdate({ surfaceColor: c })} />
                    </>
                  )}
                  {customColorSubTab === 'text' && (
                    <>
                      <CircleColorPicker label="Hero" value={theme.heroTextColor || '#111827'} onChange={(c) => onUpdate({ heroTextColor: c })} />
                      <CircleColorPicker label="Main" value={theme.textColor || '#111827'} onChange={(c) => onUpdate({ textColor: c })} />
                      <CircleColorPicker label="Sub" value={theme.secondaryColor || '#4B5563'} onChange={(c) => onUpdate({ secondaryColor: c })} />
                    </>
                  )}
                  {customColorSubTab === 'border' && (
                    <>
                      <CircleColorPicker label="Border" value={theme.borderColor || '#E5E7EB'} onChange={(c) => onUpdate({ borderColor: c })} />
                      <CircleColorPicker label="Divider" value={theme.dividerColor || '#F3F4F6'} onChange={(c) => onUpdate({ dividerColor: c })} />
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="text-[13px] font-bold text-[#111827] mb-3">배경 패턴</div>
            {/* 
              [사용자 안내 주석]
              배경 패턴 썸네일에 들어갈 실제 이미지 파일들은 Next.js 프로젝트의 `public/images/patterns/` 경로에 
              아래 지정된 이름과 확장자(png, jpg 등)로 저장해주시면 브라우저 화면에 마법처럼 실시간 매핑되어 출력됩니다!
              예시 위치:
              - 한지 패턴: /public/images/patterns/paper.png
              - 마블 패턴: /public/images/patterns/marble.png
              - 도트 패턴: /public/images/patterns/dots.png
              - 리넨 패턴: /public/images/patterns/linen.png
              - 실크 패턴: /public/images/patterns/silk.png
              - 회벽 패턴: /public/images/patterns/plaster.png
            */}
            <ThumbnailSlider sublabel="pattern" selectedValue={theme.pattern || 'none'} onSelect={(v: any) => onUpdate({ pattern: v })} items={[
              { value: 'none', label: '없음', image: '', color: '#ffffff' },
              // ── Category 1. 클래식 & 전통 한지 무드 (8종) ──
              { value: 'cozyHanji', label: '단아한 한지조각', image: '/images/patterns/traditional_cozy_hanji.jpg', color: '#fefdfa' },
              { value: 'traditionalTile', label: '백년가약 기와', image: '/images/patterns/traditional_tile.jpg', color: '#f3f2ee' },
              { value: 'palaceGrid', label: '단청 격자 창살', image: '/images/patterns/traditional_palace_grid.jpg', color: '#fcfaf6' },
              { value: 'lotusVase', label: '연화문 화병', image: '/images/patterns/traditional_lotus_vase.jpg', color: '#f0f4f5' },
              { value: 'coarseHemp', label: '은은한 삼베결', image: '/images/patterns/traditional_coarse_hemp.jpg', color: '#f4f1ea' },
              { value: 'rainbowThread', label: '오색 실타래', image: '/images/patterns/traditional_rainbow_thread.jpg', color: '#faf8f5' },
              { value: 'goldSilkEmb', label: '비단 금사 자수', image: '/images/patterns/traditional_gold_silk_emb.jpg', color: '#fffdf0' },
              { value: 'orientalInk', label: '단청 먹선', image: '/images/patterns/traditional_oriental_ink.jpg', color: '#f5f5f5' },

              // ── Category 2. 로맨틱 & 보태니컬 플라워 (8종) ──
              { value: 'margaretWreath', label: '마가렛 리스', image: '/images/patterns/botanical_margaret_wreath.jpg', color: '#ffffff' },
              { value: 'oliveGarden', label: '올리브 가든', image: '/images/patterns/botanical_olive_garden.jpg', color: '#f7fcf8' },
              { value: 'flowerArch', label: '도트 플라워 아치', image: '/images/patterns/botanical_flower_arch.jpg', color: '#fffcfb' },
              { value: 'roseGate', label: '유러피안 장미 가든', image: '/images/patterns/botanical_rose_gate.jpg', color: '#fffafb' },
              { value: 'botanicalWatercolor', label: '보태니컬 수채화', image: '/images/patterns/botanical_watercolor.jpg', color: '#f4fcf6' },
              { value: 'mistFlower', label: '안개꽃 실루엣', image: '/images/patterns/botanical_mist_flower.jpg', color: '#fbf8ff' },
              { value: 'lavenderBreeze', label: '라벤더 가든 들판', image: '/images/patterns/botanical_lavender_breeze.jpg', color: '#faf7fd' },
              { value: 'vintageLeafBorder', label: '빈티지 리프 보더', image: '/images/patterns/botanical_vintage_leaf_border.jpg', color: '#faf9f5' },

              // ── Category 3. 내추럴 & 오가닉 패브릭 (8종) ──
              { value: 'chiffonSilk', label: '밀크 쉬폰 실크', image: '/images/patterns/fabric_chiffon_silk.jpg', color: '#fefefe' },
              { value: 'rawLinen', label: '내추럴 생지 리넨', image: '/images/patterns/fabric_raw_linen.jpg', color: '#f6f5f0' },
              { value: 'cozyFelt', label: '포근한 모직 펠트', image: '/images/patterns/fabric_cozy_felt.jpg', color: '#fcfbfa' },
              { value: 'vintageCraft', label: '크래프트 빈티지', image: '/images/patterns/fabric_vintage_craft.jpg', color: '#efe9df' },
              { value: 'suedeMauve', label: '더스티 바이올렛 스웨이드', image: '/images/patterns/fabric_suede_mauve.jpg', color: '#453c4b' },
              { value: 'espressoWrinkle', label: '에스프레소 주름 가죽', image: '/images/patterns/fabric_espresso_wrinkle.jpg', color: '#2b1b15' },
              { value: 'satinNavy', label: '새틴 로열 네이비', image: '/images/patterns/fabric_satin_navy.jpg', color: '#0a1120' },
              { value: 'roseVelvet', label: '로즈골드 벨벳', image: '/images/patterns/fabric_rose_velvet.jpg', color: '#3d0714' },

              // ── Category 4. 미니멀 & 모던 스톤 (8종) ──
              { value: 'italianVein', label: '이탈리안 모던 마블', image: '/images/patterns/stone_italian_vein.jpg', color: '#fcfdfe' },
              { value: 'coarseSand', label: '러프 샌드스톤 베이지', image: '/images/patterns/stone_coarse_sand.jpg', color: '#faf8f3' },
              { value: 'charcoalCement', label: '모던 차콜 시멘트', image: '/images/patterns/stone_charcoal_cement.jpg', color: '#302c29' },
              { value: 'antiqueGoldCrack', label: '안티크 골드 크랙', image: '/images/patterns/stone_antique_gold_crack.jpg', color: '#40240d' },
              { value: 'blackMatteSteel', label: '블랙 매트 헤어라인', image: '/images/patterns/stone_black_matte_steel.jpg', color: '#161514' },
              { value: 'pearlRock', label: '진주 암석 텍스처', image: '/images/patterns/stone_pearl_rock.jpg', color: '#f0edf2' },
              { value: 'taupeMud', label: '토브 머드 샌드', image: '/images/patterns/stone_taupe_mud.jpg', color: '#faf6f0' },
              { value: 'gypsumPress', label: '화이트 석고 프레스', image: '/images/patterns/stone_gypsum_press.jpg', color: '#fafafb' },

              // ── Category 5. 유니크 & 디자인 텍스처 (8종) ──
              { value: 'goldGlitter', label: '메탈릭 골드 글리터', image: '/images/patterns/unique_gold_glitter.jpg', color: '#fffaeb' },
              { value: 'seashellPearl', label: '조개 참 로즈골드', image: '/images/patterns/unique_seashell_pearl.jpg', color: '#fff5f5' },
              { value: 'doubleArch', label: '모던 더블 아치 라인', image: '/images/patterns/unique_double_arch.jpg', color: '#edf2f7' },
              { value: 'postalEnvelope', label: '우편 엽서 빈티지', image: '/images/patterns/unique_postal_envelope.jpg', color: '#faf6f0' },
              { value: 'filmCinema', label: '영화 속 필름 프레임', image: '/images/patterns/unique_film_cinema.jpg', color: '#fbfbfa' },
              { value: 'champagneGoldWave', label: '샴페인 골드 웨이브', image: '/images/patterns/unique_champagne_gold_wave.jpg', color: '#fffaf0' },
              { value: 'crystalDrops', label: '오색 크리스탈 드롭', image: '/images/patterns/unique_crystal_drops.jpg', color: '#f9fbff' },
              { value: 'sweetBabyHeart', label: '스윗 베이비 하트', image: '/images/patterns/unique_sweet_baby_heart.jpg', color: '#ffeff2' },
            ]} showHint />
          </div>

          <Toggle label="섹션 프레임" sublabel="섹션 콘텐츠를 타워 프레임으로 감쌉니다" value={theme.sectionFrame === 'round'} onToggle={() => onUpdate({ sectionFrame: theme.sectionFrame === 'round' ? 'none' : 'round' })} />
          {theme.sectionFrame === 'round' && (
            <div className="px-1 py-2 animate-in fade-in duration-200">
              <CustomSlider
                min={0}
                max={100}
                step={1}
                value={theme.sectionFrameOpacity ?? 100}
                onChange={(v: number) => onUpdate({ sectionFrameOpacity: v })}
                label="프레임 투명도"
              />
            </div>
          )}

          <div>
            <div className="text-[13px] font-bold text-[#111827] mb-3">메인 이미지 효과</div>
            {/* 
              [사용자 안내 주석]
              메인 이미지 효과 썸네일에 적용할 실제 이미지 파일들은 Next.js 프로젝트의 `public/images/effects/` 경로에
              아래 지정된 이름과 확장자(png, jpg 등)로 저장해주시면 모바일 청첩장 화면에 무결점 오버레이 형태로 노출됩니다!
              예시 위치:
              - 벚꽃 효과: /public/images/effects/cherry-blossom.png
              - 꽃가루 효과: /public/images/effects/confetti.png
              - 비눗방울 효과: /public/images/effects/bubbles.png
              - 함박눈 효과: /public/images/effects/snow.png
              - 보케조명 효과: /public/images/effects/bokeh.png
              - 나비 효과: /public/images/effects/butterflies.png
            */}
            <ThumbnailSlider sublabel="effect" selectedValue={theme.mainImageEffect || 'none'} onSelect={(v: any) => onUpdate({ mainImageEffect: v })} items={[
              { value: 'none', label: '없음', image: '' },
              { value: 'cherryBlossom', label: '벚꽃', image: '/벚꽃.jpg' },
              { value: 'confetti', label: '꽃가루', image: '/꽃가루.jpg' },
              { value: 'bubbles', label: '비눗방울', image: '/비눗방울.jpg' },
              { value: 'snow', label: '함박눈', image: '/함박눈.jpg' },
              { value: 'bokeh', label: '보케조명', image: '/보케조명.jpg' },
              { value: 'butterflies', label: '나비', image: '/나비.jpg' },
              { value: 'lightBulbs', label: '알전구', image: '/알전구.jpg' },
              { value: 'eucalyptus', label: '네잎클로버', image: '/네잎클로버.jpg' },
              { value: 'petals', label: '장미꽃잎', image: '/장미꽃잎.jpg' },
              { value: 'hearts', label: '러브하트', image: '/러브하트.jpg' },
              { value: 'heartSnow', label: '하트눈', image: '/하트눈.jpg' },
              { value: 'fireworks', label: '폭죽', image: '/폭죽.jpg' },
              { value: 'stars', label: '은하수별빛', image: '/은하수별빛.jpg' },
              { value: 'sparkle', label: '반짝이', image: '/반짝이.jpg' },
              { value: 'feathers', label: '천사의깃털', image: '/천사의깃털.jpg' },
              { value: 'rain', label: '감성단비', image: '/감성단비.jpg' },
              { value: 'silkCurtain', label: '실크커튼', image: '/실크커튼.jpg' },
            ]} showHint />
            <div className="mt-4 pt-4 border-t border-[#F1F2F4] flex flex-col gap-4">
              <Toggle
                label="효과 반복 재생"
                sublabel="메인 이미지 효과를 무한 반복합니다"
                value={!!theme.mainImageEffectLoop}
                onToggle={() => onUpdate({ mainImageEffectLoop: !theme.mainImageEffectLoop })}
              />
              {theme.mainImageEffect && theme.mainImageEffect !== 'none' && (
                <div className="mt-2 pt-2 border-t border-[#F1F2F4]">
                  <CustomSlider
                    min={0}
                    max={100}
                    step={5}
                    value={theme.mainImageEffectOpacity ?? 40}
                    onChange={(v: number) => onUpdate({ mainImageEffectOpacity: v })}
                    label="효과 투명도"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </SectionCard>

      <style jsx global>{`
        /* 모든 썸네일 슬라이더의 기본 스크롤바 숨김 */
        .no-scrollbar::-webkit-scrollbar {
          display: none !important;
        }
        .no-scrollbar {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }

        /* 슬라이더 화살표 아이콘 호버 애니메이션 */
        .group:hover button {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
}
