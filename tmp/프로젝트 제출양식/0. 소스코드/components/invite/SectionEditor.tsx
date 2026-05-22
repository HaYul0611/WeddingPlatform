'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { AlignLeft, AlignCenter, AlignRight, Wand2, Sparkles, Image as ImageIcon, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, RotateCcw, Info, Camera, Plus, Calendar, Clock, CreditCard, Trash2, Users, Heart, MessageSquare, ClipboardCheck, Share2, Bell, CheckCircle2, QrCode, User, GripVertical, X } from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, horizontalListSortingStrategy, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { InvitationSection, DateTimeSection } from '@/types/invitation';
import { CustomSelect } from './CustomSelect';

interface SectionEditorProps {
  section: InvitationSection;
  onUpdate: (updates: any) => void;
}

const FONTS = [
  { id: 'Nanum Gothic', name: 'Nanum Gothic', type: 'Sans-Serif' },
  { id: 'Song Myung', name: 'Soonbatang', type: 'Serif' },
  { id: 'Gowun Batang', name: 'MaruBuri', type: 'Serif' },
  { id: 'Gamja Flower', name: 'Galmat', type: 'Handwriting' },
  { id: 'Hi Melody', name: 'GangBujangNim', type: 'Handwriting' },
  { id: 'Nanum Myeongjo', name: 'Nanum Myeongjo', type: 'Serif' }
];

/* 공통 편집기 서브 컴포넌트 */

const EditorLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="block text-[11px] font-black text-[#6b7280] mb-2 uppercase tracking-tight">{children}</label>
);

const EditorInput = ({ value, onChange, placeholder }: { value?: string; onChange: (v: string) => void; placeholder?: string }) => (
  <input
    type="text"
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-[13px] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-all"
  />
);

const EditorSlider = ({ label, value, min, max, step, unit, onChange }: { label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (v: number) => void }) => (
  <div className="flex flex-col gap-2 py-2">
    <div className="flex items-center justify-between">
      <span className="text-[11px] font-black text-[#6b7280] uppercase">{label}</span>
      <span className="text-[11px] font-bold text-[#3B82F6]">{value}{unit}</span>
    </div>
    <div className="flex items-center gap-3">
      <span className="text-[10px] text-[#9ca3af]">작게</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1 h-[5px] bg-[#E5E7EB] rounded-full appearance-none cursor-pointer accent-[#3B82F6]"
        style={{
          background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${((value - min) / (max - min)) * 100}%, #E5E7EB ${((value - min) / (max - min)) * 100}%, #E5E7EB 100%)`
        }}
      />
      <span className="text-[10px] text-[#9ca3af]">크게</span>
    </div>
  </div>
);

const EditorTextarea = ({ value, onChange, placeholder }: { value?: string; onChange: (v: string) => void; placeholder?: string }) => (
  <textarea
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    rows={4}
    className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-[13px] text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/20 focus:border-[#3B82F6] transition-all resize-none"
  />
);

const EditorToggle = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) => (
  <div className="flex items-center justify-between py-1">
    <span className="text-[12px] font-bold text-[#4B5563]">{label}</span>
    <button
      onClick={() => onChange(!checked)}
      className={`w-10 h-6 rounded-full transition-all relative ${checked ? 'bg-[#00df5a]' : 'bg-[#E5E7EB]'}`}
    >
      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${checked ? 'left-5' : 'left-1'}`} />
    </button>
  </div>
);

const EditorImagePicker = ({ label, subtitle, value, onChange }: { label: string; subtitle: string; value?: string; onChange: (v: string) => void }) => (
  <div className="flex flex-col gap-2">
    <span className="text-[11px] font-bold text-[#4b5563]">{label}</span>
    <div
      onClick={() => {
        const event = new CustomEvent('open-image-picker', {
          detail: {
            currentValue: value,
            onSelect: (url: string) => onChange(url)
          }
        });
        window.dispatchEvent(event);
      }}
      className="relative h-28 bg-[#F9FAFB] rounded-xl border border-dashed border-[#E5E7EB] flex flex-col items-center justify-center gap-2 hover:border-[#3B82F6]/50 hover:bg-[#EFF6FF]/50 transition-all cursor-pointer group/img-upload overflow-hidden"
    >
      {value ? (
        <>
          <img src={value} className="w-full h-full object-cover opacity-50 group-hover/img-upload:opacity-30 transition-opacity" alt="" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
            <ImageIcon size={20} className="text-[#3B82F6]" />
            <span className="text-[10px] font-bold text-[#3B82F6]">변경하기</span>
          </div>
        </>
      ) : (
        <>
          <ImageIcon size={20} className="text-[#D1D5DB] group-hover/img-upload:text-[#3B82F6] transition-colors" />
          <span className="text-[11px] font-bold text-[#D1D5DB] group-hover/img-upload:text-[#3B82F6] transition-colors">이미지 선택</span>
        </>
      )}
    </div>
    <span className="text-[10px] text-[#9ca3af]">{subtitle}</span>
  </div>
);

const Tooltip = ({ text, children }: { text: string; children: React.ReactNode }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[#111827] text-white text-[10px] rounded-lg shadow-xl z-[1000] animate-in fade-in zoom-in-95 duration-200">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#111827]" />
        </div>
      )}
    </div>
  );
};

const FontSettingsBlock = ({ section, onUpdate, showFont, setShowFont, showFontList, setShowFontList }: { section: any; onUpdate: (updates: any) => void; showFont: boolean; setShowFont: (v: boolean) => void; showFontList: boolean; setShowFontList: (v: boolean) => void }) => {
  const isCustomized = section.fontFamily || (section.fontSizePercent && section.fontSizePercent !== 100) || section.fontWeight || section.letterSpacing || section.lineHeight || section.fontColor;

  return (
    <div className="border-t border-[#F1F2F4] pt-2">
      <button onClick={() => setShowFont(!showFont)} className="w-full flex items-center justify-between py-2 text-[12px] font-black text-[#111827]">
        <div className="flex items-center gap-1.5">
          <span>폰트 설정</span>
          {isCustomized && <div className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />}
        </div>
        {showFont ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {showFont && (
        <div className="pb-4 pt-2 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <EditorLabel>폰트</EditorLabel>
            <div className="relative">
              <div onClick={() => setShowFontList(!showFontList)} className="w-full px-4 py-3 bg-white border rounded-xl text-[13px] text-[#111827] flex justify-between items-center cursor-pointer border-[#E5E7EB]">
                <span className="font-serif">{FONTS.find(f => f.id === (section.fontFamily || 'Soonbatang'))?.name || (section.fontFamily || 'Soonbatang')}</span>
                <ChevronDown size={16} />
              </div>
              {showFontList && (
                <div className="absolute top-full left-0 w-full bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl z-[500] mt-1 max-h-[300px] overflow-y-auto py-2 font-list-scrollbar">
                  {FONTS.map(font => (
                    <div key={font.id} onClick={() => { onUpdate({ fontFamily: font.id }); setShowFontList(false); }} className="px-6 py-3 text-[13px] hover:bg-[#F9FAFB] cursor-pointer border-b border-[#F1F2F4] last:border-0 transition-colors group/font">
                      <span className="text-[11px] text-[#9ca3af] group-hover/font:text-[#3B82F6]">{font.name}</span><br />
                      <span className="text-[18px]" style={{ fontFamily: font.id }}>아름다운 한글 폰트</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <EditorLabel>굵기</EditorLabel>
              <select value={section.fontWeight || '400'} onChange={(e) => onUpdate({ fontWeight: e.target.value })} className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-xl text-[12px]">
                <option value="300">가늘게</option>
                <option value="400">보통</option>
                <option value="500">약간 굵게</option>
                <option value="600">굵게</option>
                <option value="700">매우 굵게</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <EditorLabel>색상</EditorLabel>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg border border-[#E5E7EB] shadow-sm relative overflow-hidden" style={{ backgroundColor: section.fontColor || '#111827' }}>
                  <input type="color" value={section.fontColor || '#111827'} onChange={(e) => onUpdate({ fontColor: e.target.value })} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                <span className="text-[11px] text-[#6b7280] font-mono uppercase">{section.fontColor || '#111827'}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <EditorSlider label="글자 크기" value={section.fontSizePercent || 100} min={80} max={120} step={1} unit="%" onChange={(v) => onUpdate({ fontSizePercent: v })} />
            <EditorSlider label="자간 (Spacing)" value={section.letterSpacing || 0} min={-2} max={10} step={0.1} unit="px" onChange={(v) => onUpdate({ letterSpacing: v })} />
            <EditorSlider label="행간 (Height)" value={section.lineHeight || 1.6} min={1.0} max={2.5} step={0.1} unit="" onChange={(v) => onUpdate({ lineHeight: v })} />
          </div>
        </div>
      )}
    </div>
  );
};

const AlignmentBlock = ({ value, onChange }: { value?: string; onChange: (v: string) => void }) => (
  <div className="flex items-center gap-1 p-1 bg-[#F3F4F6] rounded-lg">
    {[AlignLeft, AlignCenter, AlignRight].map((Icon, i) => {
      const align = i === 0 ? 'left' : i === 1 ? 'center' : 'right';
      return (
        <button key={align} onClick={() => onChange(align)} className={`p-1.5 rounded-md transition-all ${((value || 'center') === align) ? 'bg-white text-[#3B82F6] shadow-sm' : 'text-[#9ca3af] hover:text-[#4b5563]'}`}>
          <Icon size={16} />
        </button>
      );
    })}
  </div>
);

/* 디자인 메인 이미지(Cover) 편집기 */
function CoverEditor({ section, onUpdate }: { section: any; onUpdate: (updates: any) => void }) {
  const [showFont, setShowFont] = useState(false);
  const [showFontList, setShowFontList] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <EditorLabel>디자인 선택</EditorLabel>
        <div className="grid grid-cols-4 gap-2">
          {[
            { id: 'full', name: '전체화면', desc: '이미지 강조형' },
            { id: 'split', name: '분할형', desc: '부드러운 라운드' },
            { id: 'minimal', name: '미니멀', desc: '텍스트 강조형' },
            { id: 'classic-arch', name: '클래식 아치', desc: '아치형 프레임' },
            { id: 'editorial-journal', name: '에디토리얼', desc: '저널 감성형' }
          ].map((layout) => (
            <button
              key={layout.id}
              onClick={() => onUpdate({ layout: layout.id })}
              className={`flex flex-col items-center gap-2 p-2 rounded-2xl border transition-all ${((section.layout || 'full') === layout.id) ? 'border-[#3B82F6] bg-[#EFF6FF] shadow-sm' : 'border-[#F3F4F6] bg-white hover:border-[#E5E7EB]'}`}
            >
              <div className={`w-full aspect-[3/4] rounded-lg bg-stone-100 flex items-center justify-center relative overflow-hidden`}>
                {layout.id === 'full' && <div className="absolute inset-0 bg-stone-200" />}
                {layout.id === 'split' && (
                  <div className="flex flex-col gap-1 w-full h-full p-1">
                    <div className="flex-1 bg-stone-200 rounded-lg" />
                    <div className="h-4 bg-stone-100 rounded-sm" />
                  </div>
                )}
                {layout.id === 'minimal' && (
                  <div className="flex flex-col items-center justify-center gap-1">
                    <div className="w-8 h-8 rounded-full bg-stone-200" />
                    <div className="w-10 h-1 bg-stone-100 rounded-full" />
                  </div>
                )}
                {layout.id === 'classic-arch' && (
                  <div className="flex flex-col items-center justify-center gap-1.5 w-full h-full p-1 bg-[#fdf8f5]">
                    <div className="w-[60%] aspect-[3/4] bg-stone-200" style={{ borderRadius: '50% 50% 0 0 / 60% 60% 0 0' }} />
                    <div className="w-8 h-1 bg-stone-300 rounded-full" />
                  </div>
                )}
                {layout.id === 'editorial-journal' && (
                  <div className="flex flex-col items-center justify-center gap-1.5 w-full h-full p-1 bg-[#f7f3ee]">
                    <div className="w-8 h-[2px] bg-stone-300 rounded-full" />
                    <div className="w-[65%] flex-1 bg-stone-200" />
                    <div className="w-8 h-1 bg-stone-300 rounded-full" />
                  </div>
                )}
                {((section.layout || 'full') === layout.id) && (
                  <div className="absolute top-1 right-1 w-4 h-4 bg-[#3B82F6] rounded-full flex items-center justify-center shadow-sm">
                    <CheckCircle2 size={10} className="text-white" />
                  </div>
                )}
              </div>
              <span className={`text-[10px] font-bold text-center leading-tight ${((section.layout || 'full') === layout.id) ? 'text-[#3B82F6]' : 'text-[#6b7280]'}`}>{layout.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-6 pt-4 border-t border-[#F1F2F4]">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <EditorLabel>제목</EditorLabel>
            <EditorTextarea value={section.title} onChange={(v) => onUpdate({ title: v })} placeholder="Save the date" />
          </div>
          <div className="flex flex-col gap-2">
            <EditorLabel>부제목</EditorLabel>
            <EditorTextarea value={section.subtitle} onChange={(v) => onUpdate({ subtitle: v })} placeholder="a story written in june" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <EditorLabel>신랑</EditorLabel>
            <EditorInput value={section.groom} onChange={(v) => onUpdate({ groom: v })} placeholder="Hayul" />
          </div>
          <div className="flex flex-col gap-2">
            <EditorLabel>신부</EditorLabel>
            <EditorInput value={section.bride} onChange={(v) => onUpdate({ bride: v })} placeholder="Chaewon" />
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-2 border-t border-[#F1F2F4]">
          <span className="text-[12px] font-black text-[#111827]">배경 이미지</span>
          <div className="grid grid-cols-2 gap-4">
            <EditorImagePicker
              label="모바일"
              subtitle="모바일 전용 배경"
              value={section.mobileImage}
              onChange={(v) => onUpdate({ mobileImage: v })}
            />
            <EditorImagePicker
              label="데스크톱"
              subtitle="데스크톱 전용 배경"
              value={section.image}
              onChange={(v) => onUpdate({ image: v })}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-2 border-t border-[#F1F2F4]">
          <span className="text-[12px] font-black text-[#111827]">사진 2 (추가 이미지)</span>
          <EditorImagePicker
            label="서브 이미지"
            subtitle="메인 이미지 아래에 표시되는 추가 사진"
            value={section.image2}
            onChange={(v) => onUpdate({ image2: v })}
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 py-2">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-black text-[#6b7280] uppercase">배경 어둡게</span>
              <span className="text-[11px] font-bold text-[#3B82F6]">{section.overlayOpacity || 0}%</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-[#9ca3af]">밝게</span>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={section.overlayOpacity || 0}
                onChange={(e) => onUpdate({ overlayOpacity: parseInt(e.target.value) })}
                className="flex-1 h-[5px] bg-[#E5E7EB] rounded-full appearance-none cursor-pointer accent-[#3B82F6]"
                style={{
                  background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${section.overlayOpacity || 0}%, #E5E7EB ${section.overlayOpacity || 0}%, #E5E7EB 100%)`
                }}
              />
              <span className="text-[10px] text-[#9ca3af]">어둡게</span>
            </div>
          </div>

          <div className="flex flex-col gap-3 py-2 border-t border-[#F1F2F4] pt-4">
            <EditorLabel>텍스트 색상</EditorLabel>
            <div className="flex flex-wrap gap-2">
              {['#ffffff', '#000000', '#4B5563', '#9CA3AF', '#F3F4F6', '#FEF2F2', '#FFFBEB', '#ECFDF5', '#EFF6FF', '#F5F3FF', '#FDF2F8'].map((color) => (
                <button
                  key={color}
                  onClick={() => onUpdate({ textColor: color })}
                  className={`w-8 h-8 rounded-lg border transition-all ${section.textColor === color ? 'border-[#3B82F6] scale-110 shadow-sm' : 'border-[#E5E7EB]'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
              <div className="relative">
                <div className="w-8 h-8 rounded-lg border border-[#E5E7EB] bg-gradient-to-br from-red-500 via-green-500 to-blue-500 cursor-pointer" />
                <input
                  type="color"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  value={section.textColor || '#ffffff'}
                  onChange={(e) => onUpdate({ textColor: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 py-2 border-t border-[#F1F2F4] pt-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-black text-[#6b7280] uppercase">텍스트 위치</span>
              <span className="text-[11px] font-bold text-[#3B82F6]">{section.vPosition || 50}%</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-[#9ca3af]">상단</span>
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={section.vPosition || 50}
                onChange={(e) => onUpdate({ vPosition: parseInt(e.target.value) })}
                className="flex-1 h-[5px] bg-[#E5E7EB] rounded-full appearance-none cursor-pointer accent-[#3B82F6]"
                style={{
                  background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${section.vPosition || 50}%, #E5E7EB ${section.vPosition || 50}%, #E5E7EB 100%)`
                }}
              />
              <span className="text-[10px] text-[#9ca3af]">하단</span>
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-[#F1F2F4] pt-4">
            <span className="text-[12px] font-black text-[#111827]">텍스트 크기 조절</span>
            <EditorSlider label="제목" value={section.titleSize || 1.2} min={0.5} max={3} step={0.1} unit="rem" onChange={(v) => onUpdate({ titleSize: v })} />
            <EditorSlider label="부제목" value={section.subtitleSize || 0.7} min={0.5} max={2} step={0.1} unit="rem" onChange={(v) => onUpdate({ subtitleSize: v })} />
            <EditorSlider label="신랑" value={section.groomSize || 1.3} min={0.5} max={3} step={0.1} unit="rem" onChange={(v) => onUpdate({ groomSize: v })} />
            <EditorSlider label="신부" value={section.brideSize || 1.3} min={0.5} max={3} step={0.1} unit="rem" onChange={(v) => onUpdate({ brideSize: v })} />
          </div>
        </div>

        <FontSettingsBlock section={section} onUpdate={onUpdate} showFont={showFont} setShowFont={setShowFont} showFontList={showFontList} setShowFontList={setShowFontList} />
      </div>
    </div>
  );
}

/* 디자인 인사말(Greeting) 편집기 */
function GreetingEditor({ section, onUpdate }: { section: any; onUpdate: (updates: any) => void }) {
  const [showFont, setShowFont] = useState(false);
  const [showFontList, setShowFontList] = useState(false);

  // [신규 기능]: AI 수정 버튼 팝오버 및 로딩 상태
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);

  const greetingStyles = [
    { id: 'classic', name: '클래식' },
    { id: 'letter', name: '편지형' },
    { id: 'card', name: '카드형' },
    { id: 'quote', name: '인용문형' },
    { id: 'typo', name: '타이포형' },
    { id: 'editorial', name: '에디토리얼' }
  ];

  // 톤 버튼 클릭 시 백엔드 무료 Gemini AI를 타고 실시간 번안하는 헬퍼 함수
  async function handleFieldAIChange(
    currentText: string,
    tone: string,
    onSuccess: (newText: string) => void,
    closePopover: () => void
  ) {
    if (!currentText.trim()) {
      alert("변환할 텍스트를 먼저 입력해 주세요!");
      return;
    }
    setIsAILoading(true);
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          genType: 'greeting',
          tone: tone,
          prompt: `아래 청첩장 인사말을 주어진 톤에 맞추어 결혼식에 어울리는 감동적이고 자연스러운 문장으로 재구성해줘. 원래 맥락은 유지하면서 줄바꿈도 이쁘게 다듬어줘:\n\n${currentText}`
        })
      });
      if (!res.ok) throw new Error('AI 변환 실패');
      const data = await res.json();
      onSuccess(data.result);
    } catch (err) {
      alert("AI 변환 처리 도중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setIsAILoading(false);
      closePopover();
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-black text-[#111827]">섹션 타이틀</span>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold text-[#4B5563]">텍스트 정렬</span>
          <AlignmentBlock value={section.textAlign} onChange={(v) => onUpdate({ textAlign: v })} />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <EditorLabel>인사말 스타일</EditorLabel>
          <div className="grid grid-cols-3 gap-2">
            {greetingStyles.map(s => (
              <button key={s.id} onClick={() => onUpdate({ style: s.id })} className={`py-2.5 text-[11px] font-bold rounded-xl border transition-all ${(section.style || 'editorial') === s.id ? 'border-[#3B82F6] bg-[#EFF6FF] text-[#3B82F6]' : 'border-[#F3F4F6] bg-white text-[#4B5563] hover:border-[#E5E7EB]'}`}>{s.name}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2"><EditorLabel>제목</EditorLabel><EditorInput value={section.title} onChange={(v) => onUpdate({ title: v })} placeholder="A page turned together." /></div>
          <div className="flex flex-col gap-2"><EditorLabel>부제목</EditorLabel><EditorInput value={section.subtitle} onChange={(v) => onUpdate({ subtitle: v })} placeholder="GREETING" /></div>
        </div>

        <div className="flex flex-col gap-2">
          <EditorLabel>이미지</EditorLabel>
          <EditorImagePicker label="인사말 이미지" subtitle="내용 상단에 표시되는 사진" value={section.image} onChange={(v) => onUpdate({ image: v })} />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between mb-1">
            <EditorLabel>내용</EditorLabel>

            {/* [신규 AI 수정 팝오버 컨테이너] */}
            <div className="relative inline-block">
              <button
                onClick={() => setIsAIOpen(!isAIOpen)}
                className="flex items-center gap-1.5 text-[10px] font-bold text-white bg-[#F59E0B] px-3 py-1.5 rounded-full hover:bg-[#D97706] transition-all cursor-pointer shadow-sm"
              >
                <Wand2 size={12} /> AI 수정
              </button>

              {isAIOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-[#E5E7EB] rounded-2xl shadow-xl p-4 z-50 animate-in fade-in slide-in-from-bottom-1 duration-200">
                  <div className="text-[10px] font-bold text-stone-500 mb-2">원하시는 웨딩 톤을 선택해 주세요</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'formal', label: '격식체' },
                      { id: 'friendly', label: '친근한' },
                      { id: 'emotional', label: '감성적인' },
                      { id: 'humorous', label: '유머러스' },
                      { id: 'poetic', label: '시적인' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        disabled={isAILoading}
                        onClick={() => handleFieldAIChange(
                          section.text || '',
                          t.id,
                          (newText) => onUpdate({ text: newText }),
                          () => setIsAIOpen(false)
                        )}
                        className="py-1.5 rounded-lg text-[10px] font-bold bg-[#FAF9F5] text-stone-600 border border-[#E8E6E0] hover:bg-[#FFF1F2] hover:text-[#E11D48] hover:border-[#FECDD3] transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                  {isAILoading && (
                    <div className="absolute inset-0 bg-white/70 rounded-2xl flex items-center justify-center z-10">
                      <div className="w-5 h-5 border-2 border-[#E11D48]/30 border-t-[#E11D48] rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <EditorTextarea value={section.text} onChange={(v) => onUpdate({ text: v })} placeholder="인사말 내용을 입력하세요.." />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#F1F2F4]">
          <div className="flex flex-col gap-2"><EditorLabel>신랑측 혼주</EditorLabel><EditorInput value={section.groomParents} onChange={(v) => onUpdate({ groomParents: v })} placeholder="OOO · OOO의 장남 하율" /></div>
          <div className="flex flex-col gap-2"><EditorLabel>신부측 혼주</EditorLabel><EditorInput value={section.brideParents} onChange={(v) => onUpdate({ brideParents: v })} placeholder="OOO · OOO의 장녀 채원" /></div>
        </div>

        <div className="flex flex-col gap-3 py-1 border-t border-[#F1F2F4] pt-4">
          <EditorToggle label="배경색 사용" checked={!!section.useBackgroundColor} onChange={(v) => onUpdate({ useBackgroundColor: v })} />
        </div>
      </div>

      <FontSettingsBlock section={section} onUpdate={onUpdate} showFont={showFont} setShowFont={setShowFont} showFontList={showFontList} setShowFontList={setShowFontList} />
    </div>
  );
}

/* 디자인 갤러리(Gallery) 편집기 */
function GalleryEditor({ section, onUpdate }: { section: any; onUpdate: (updates: any) => void }) {
  const [showFont, setShowFont] = useState(false);
  const [showFontList, setShowFontList] = useState(false);
  const [showTypeList, setShowTypeList] = useState(false);

  const galleryTypes = ['Grid (그리드)', 'Slider (슬라이더)', 'Masonry (메이슨리)', 'Polaroid (폴라로이드)', 'Inline (인라인)', 'Carousel (캐러셀)'];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-black text-[#111827]">섹션 타이틀</span>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold text-[#4B5563]">텍스트 정렬</span>
          <AlignmentBlock value={section.textAlign} onChange={(v) => onUpdate({ textAlign: v })} />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <EditorLabel>갤러리 제목</EditorLabel>
        <EditorInput value={section.title} onChange={(v) => onUpdate({ title: v })} placeholder="Our Gallery" />
      </div>

      <div className="flex flex-col gap-2">
        <EditorLabel>갤러리 타입</EditorLabel>
        <div className="relative">
          <div
            onClick={() => setShowTypeList(!showTypeList)}
            className={`w-full px-4 py-3 bg-white border rounded-xl text-[13px] text-[#111827] flex justify-between items-center cursor-pointer transition-all ${showTypeList ? 'border-[#3B82F6] ring-2 ring-[#3B82F6]/10' : 'border-[#E5E7EB] hover:border-[#3B82F6]'}`}
          >
            <span>
              {section.layout === 'grid' ? 'Grid (그리드)' :
                section.layout === 'slideshow' ? 'Slider (슬라이더)' :
                  section.layout === 'masonry' ? 'Masonry (메이슨리)' :
                    section.layout === 'polaroid' ? 'Polaroid (폴라로이드)' :
                      section.layout === 'inline' ? 'Inline (인라인)' :
                        section.layout === 'carousel' ? 'Carousel (캐러셀)' : 'Grid (그리드)'}
            </span>
            <ChevronDown size={16} className={`text-[#9ca3af] transition-transform ${showTypeList ? 'rotate-180' : ''}`} />
          </div>
          {showTypeList && (
            <div className="absolute top-full left-0 w-full bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl z-[110] mt-1 overflow-hidden">
              {[
                { label: 'Grid (그리드)', value: 'grid' },
                { label: 'Slider (슬라이더)', value: 'slideshow' },
                { label: 'Masonry (메이슨리)', value: 'masonry' },
                { label: 'Polaroid (폴라로이드)', value: 'polaroid' },
                { label: 'Inline (인라인)', value: 'inline' },
                { label: 'Carousel (캐러셀)', value: 'carousel' }
              ].map(item => (
                <div
                  key={item.value}
                  onClick={() => { onUpdate({ layout: item.value }); setShowTypeList(false); }}
                  className={`px-4 py-3 text-[13px] cursor-pointer transition-colors border-b border-[#F1F2F4] last:border-0 ${(section.layout || 'grid') === item.value ? 'bg-[#3B82F6] text-white font-bold' : 'text-[#111827] hover:bg-[#F9FAFB]'}`}
                >
                  {item.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <EditorLabel>이미지</EditorLabel>
        <div
          onClick={() => {
            const event = new CustomEvent('open-image-picker', {
              detail: {
                onSelect: (url: string) => {
                  onUpdate({ images: [...(section.images || []), { url }] });
                }
              }
            });
            window.dispatchEvent(event);
          }}
          className="h-40 bg-[#F9FAFB] rounded-2xl border border-dashed border-[#E5E7EB] flex flex-col items-center justify-center gap-2 hover:border-[#3B82F6]/50 hover:bg-[#EFF6FF]/30 transition-all cursor-pointer group/img-upload"
        >
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#D1D5DB] group-hover/img-upload:text-[#3B82F6] shadow-sm transition-colors">
            <span className="text-2xl font-light">+</span>
          </div>
          <span className="text-[12px] font-bold text-[#D1D5DB] group-hover/img-upload:text-[#3B82F6] transition-colors">이미지 선택</span>
        </div>

        {section.images && section.images.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mt-2">
            {section.images.map((img: any, idx: number) => {
              const imgUrl = typeof img === 'string' ? img : img?.url;
              if (!imgUrl) return null;
              return (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-[#E5E7EB] group">
                  <img src={imgUrl} className="w-full h-full object-cover" alt="" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const nextImages = section.images.filter((_: any, i: number) => i !== idx);
                      onUpdate({ images: nextImages });
                    }}
                    className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 py-1 border-t border-[#F1F2F4] pt-4">
        <EditorToggle label="섹션 프레임 사용 안함" checked={!!section.noFrame} onChange={(v) => onUpdate({ noFrame: v })} />
        <EditorToggle label="배경색 사용" checked={!!section.useBackgroundColor} onChange={(v) => onUpdate({ useBackgroundColor: v })} />
      </div>

      <FontSettingsBlock section={section} onUpdate={onUpdate} showFont={showFont} setShowFont={setShowFont} showFontList={showFontList} setShowFontList={setShowFontList} />
    </div>
  );
}


/* 디자인 위치/지도(Map) 편집기 */
function MapEditor({ section, onUpdate }: { section: any; onUpdate: (updates: any) => void }) {
  const [showFont, setShowFont] = useState(false);
  const [showFontList, setShowFontList] = useState(false);

  const handleAddressSearch = () => {
    const scriptId = 'daum-postcode-script';

    const openPostcode = () => {
      new (window as any).daum.Postcode({
        oncomplete: (data: any) => {
          let fullAddress = data.address;
          let extraAddress = '';

          if (data.addressType === 'R') {
            if (data.bname !== '') {
              extraAddress += data.bname;
            }
            if (data.buildingName !== '') {
              extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
            }
            fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
          }

          onUpdate({ address: fullAddress });
        }
      }).open();
    };

    if ((window as any).daum && (window as any).daum.Postcode) {
      openPostcode();
    } else {
      const existingScript = document.getElementById(scriptId);
      if (!existingScript) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
        script.onload = openPostcode;
        document.body.appendChild(script);
      }
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-black text-[#111827]">섹션 타이틀</span>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold text-[#4B5563]">텍스트 정렬</span>
          <AlignmentBlock value={section.textAlign} onChange={(v) => onUpdate({ textAlign: v })} />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <EditorLabel>위치 제목</EditorLabel>
          <EditorInput value={section.title} onChange={(v) => onUpdate({ title: v })} placeholder="오시는 길" />
        </div>
        <div className="flex flex-col gap-2">
          <EditorLabel>예식장 이름</EditorLabel>
          <EditorTextarea value={section.venue} onChange={(v) => onUpdate({ venue: v })} placeholder="더 채플앳청담" />
        </div>
        <div className="flex flex-col gap-2">
          <EditorLabel>주소</EditorLabel>
          <div className="flex gap-2">
            <EditorInput value={section.address} onChange={(v) => onUpdate({ address: v })} placeholder="서울 강남구 선릉로 434" />
            <button
              onClick={handleAddressSearch}
              className="shrink-0 px-4 py-2 bg-[#F3F4F6] text-[#4B5563] text-[12px] font-bold rounded-xl hover:bg-[#E5E7EB] transition-all"
            >
              주소 검색
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <EditorLabel>상세 주소</EditorLabel>
          <EditorInput value={section.detailAddress} onChange={(v) => onUpdate({ detailAddress: v })} placeholder="3층 그랜드볼룸" />
        </div>
        <div className="flex flex-col gap-2">
          <EditorLabel>교통안내</EditorLabel>
          <EditorTextarea value={section.transport} onChange={(v) => onUpdate({ transport: v })} placeholder="지하철 및 버스 안내" />
        </div>
        <div className="flex flex-col gap-2">
          <EditorLabel>주차 안내</EditorLabel>
          <EditorTextarea value={section.parking} onChange={(v) => onUpdate({ parking: v })} placeholder="주차 가능 여부 및 시간 안내" />
        </div>

        <div className="flex flex-col gap-3 py-2 border-t border-[#F1F2F4] mt-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="use-map-api"
              className="w-4 h-4 rounded border-[#E5E7EB] text-[#3B82F6] focus:ring-[#3B82F6] cursor-pointer"
              checked={section.useMapApi !== false}
              onChange={(e) => onUpdate({ useMapApi: e.target.checked })}
            />
            <label htmlFor="use-map-api" className="text-[12px] font-bold text-[#4B5563] cursor-pointer">지도 API 사용 (네이버 | 카카오맵 | 구글맵)</label>
          </div>
          <span className="text-[10px] text-[#9ca3af] ml-6">체크 해제 시 직접 업로드한 약도 이미지를 사용합니다.</span>
        </div>

        {(section.useMapApi !== false) ? (
          <div className="flex flex-col gap-3">
            <EditorLabel>지도 종류</EditorLabel>
            <div className="flex p-1 bg-[#F3F4F6] rounded-xl">
              {['naver', 'kakao', 'google'].map((type) => (
                <button
                  key={type}
                  onClick={() => onUpdate({ mapType: type })}
                  className={`flex-1 py-2 text-[12px] font-bold rounded-lg transition-all ${(section.mapType || 'naver') === type ? 'bg-white text-[#3B82F6] shadow-sm' : 'text-[#9ca3af] hover:text-[#4b5563]'}`}
                >
                  {type === 'naver' ? '네이버' : type === 'kakao' ? '카카오' : '구글'}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <EditorLabel>약도 이미지</EditorLabel>
            <div
              onClick={() => {
                const event = new CustomEvent('open-image-picker', {
                  detail: {
                    currentValue: section.mapImage,
                    onSelect: (url: string) => onUpdate({ mapImage: url })
                  }
                });
                window.dispatchEvent(event);
              }}
              className="relative h-32 bg-[#F9FAFB] rounded-2xl border border-dashed border-[#E5E7EB] flex flex-col items-center justify-center gap-2 hover:border-[#3B82F6]/50 transition-all cursor-pointer group/img-upload overflow-hidden"
            >
              {section.mapImage ? (
                <>
                  <img src={section.mapImage} className="w-full h-full object-cover opacity-50 group-hover/img-upload:opacity-30 transition-opacity" alt="" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
                    <ImageIcon size={20} className="text-[#3B82F6]" />
                    <span className="text-[10px] font-bold text-[#3B82F6]">변경하기</span>
                  </div>
                </>
              ) : (
                <>
                  <ImageIcon size={24} className="text-[#D1D5DB] group-hover/img-upload:text-[#3B82F6] transition-colors" />
                  <span className="text-[12px] font-bold text-[#D1D5DB] group-hover/img-upload:text-[#3B82F6] transition-colors">약도 이미지 업로드</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 py-1 border-t border-[#F1F2F4] pt-4">
        <EditorToggle label="내비게이션 버튼 표시" checked={!!section.showNavButtons} onChange={(v) => onUpdate({ showNavButtons: v })} />
        {section.showNavButtons && (
          <div className="pl-6 flex flex-col gap-3 animate-in slide-in-from-top-1 duration-200">
            <EditorToggle label="네이버 지도" checked={section.showNaverMap !== false} onChange={(v) => onUpdate({ showNaverMap: v })} />
            <EditorToggle label="카카오 맵" checked={section.showKakaoMap !== false} onChange={(v) => onUpdate({ showKakaoMap: v })} />
            <EditorToggle label="구글 맵" checked={section.showGoogleMap !== false} onChange={(v) => onUpdate({ showGoogleMap: v })} />
          </div>
        )}
        <EditorToggle label="배경색 사용" checked={!!section.useBackgroundColor} onChange={(v) => onUpdate({ useBackgroundColor: v })} />
      </div>

      <FontSettingsBlock section={section} onUpdate={onUpdate} showFont={showFont} setShowFont={setShowFont} showFontList={showFontList} setShowFontList={setShowFontList} />
    </div>
  );
}


/* 디자인 날짜/시간(DateTime) 편집기 */
function DateTimeEditor({ section, onUpdate }: { section: any; onUpdate: (updates: any) => void }) {
  const [showFont, setShowFont] = useState(false);
  const [showFontList, setShowFontList] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-black text-[#111827]">섹션 타이틀</span>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold text-[#4B5563]">텍스트 정렬</span>
          <AlignmentBlock value={section.textAlign} onChange={(v) => onUpdate({ textAlign: v })} />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <EditorLabel>날짜/시간 제목</EditorLabel>
          <EditorInput value={section.title} onChange={(v) => onUpdate({ title: v })} placeholder="WEDDING DAY" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <EditorLabel>날짜</EditorLabel>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 text-[#9ca3af]" size={16} />
              <input type="date" value={section.date} onChange={(e) => onUpdate({ date: e.target.value })} className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-[13px]" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <EditorLabel>시간</EditorLabel>
            <div className="relative">
              <Clock className="absolute left-3 top-3 text-[#9ca3af]" size={16} />
              <input type="time" value={section.time} onChange={(e) => onUpdate({ time: e.target.value })} className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-[13px]" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <EditorLabel>스타일</EditorLabel>
        <div className="grid grid-cols-5 gap-1.5">
          {['classic', 'calendar', 'card', 'typo', 'editorial'].map((id) => (
            <button
              key={id}
              onClick={() => onUpdate({ style: id })}
              className={`py-2.5 rounded-xl border transition-all text-[11px] font-bold ${(section.style || 'classic') === id ? 'border-[#3B82F6] bg-[#EFF6FF] text-[#3B82F6]' : 'border-[#F3F4F6] bg-white text-[#4B5563] hover:border-[#E5E7EB]'}`}
            >
              {id === 'classic' ? '클래식' : id === 'calendar' ? '캘린더' : id === 'card' ? '카드' : id === 'typo' ? '타이포' : '에디토리얼'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 py-1 border-t border-[#F1F2F4] pt-4">
        <EditorToggle label="배경색 사용" checked={!!section.useBackgroundColor} onChange={(v) => onUpdate({ useBackgroundColor: v })} />
      </div>

      <FontSettingsBlock section={section} onUpdate={onUpdate} showFont={showFont} setShowFont={setShowFont} showFontList={showFontList} setShowFontList={setShowFontList} />
    </div>
  );
}


/* 디자인 카운트다운(Dday) 편집기 */
function DdayEditor({ section, onUpdate }: { section: any; onUpdate: (updates: any) => void }) {
  const [showFont, setShowFont] = useState(false);
  const [showFontList, setShowFontList] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-black text-[#111827]">섹션 타이틀</span>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold text-[#4B5563]">텍스트 정렬</span>
          <AlignmentBlock value={section.textAlign} onChange={(v) => onUpdate({ textAlign: v })} />
        </div>
      </div>

      <div className="p-4 bg-[#EFF6FF] rounded-2xl flex gap-3 border border-[#DBEAFE]">
        <Info size={18} className="text-[#3B82F6] shrink-0 mt-0.5" />
        <span className="text-[12px] leading-relaxed text-[#1D4ED8] font-medium">카운트다운 날짜/시간은 "예식 일시" 섹션의 값을 자동으로 사용합니다.</span>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <EditorLabel>제목 (예: 결혼식까지)</EditorLabel>
          <EditorInput value={section.title} onChange={(v) => onUpdate({ title: v })} placeholder="결혼식까지" />
        </div>
        <div className="flex flex-col gap-2">
          <EditorLabel>설명 (예: 소중한 날을 기다립니다)</EditorLabel>
          <EditorTextarea value={section.description} onChange={(v) => onUpdate({ description: v })} placeholder="소중한 날을 기다립니다" />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <EditorLabel>스타일</EditorLabel>
        <div className="grid grid-cols-4 gap-1.5">
          {['simple', 'card', 'flip', 'typo'].map((id) => (
            <button
              key={id}
              onClick={() => onUpdate({ style: id })}
              className={`py-2.5 rounded-xl border transition-all text-[11px] font-bold ${(section.style || 'simple') === id ? 'border-[#3B82F6] bg-[#EFF6FF] text-[#3B82F6]' : 'border-[#F3F4F6] bg-white text-[#4B5563] hover:border-[#E5E7EB]'}`}
            >
              {id === 'simple' ? '심플' : id === 'card' ? '카드' : id === 'flip' ? '플립' : '타이포'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 py-1 border-t border-[#F1F2F4] pt-4">
        <EditorToggle label="배경색 사용" checked={!!section.useBackgroundColor} onChange={(v) => onUpdate({ useBackgroundColor: v })} />
      </div>

      <FontSettingsBlock section={section} onUpdate={onUpdate} showFont={showFont} setShowFont={setShowFont} showFontList={showFontList} setShowFontList={setShowFontList} />
    </div>
  );
}


/* 디자인 계좌번호(BankAccount) 편집기 */
function BankAccountEditor({ section, onUpdate }: { section: any; onUpdate: (updates: any) => void }) {
  const [showFont, setShowFont] = useState(false);
  const [showFontList, setShowFontList] = useState(false);
  const [showBankList, setShowBankList] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  const accounts = section.accounts || [];

  const addAccount = () => {
    const next = [...accounts, { ownerType: 'groom', relationship: '신랑', name: '', bank: '', accountNumber: '', kakaoPayUrl: '', tossUrl: '' }];
    onUpdate({ accounts: next });
    setActiveIdx(next.length - 1);
  };

  const removeAccount = (idx: number) => {
    const next = accounts.filter((_: any, i: number) => i !== idx);
    onUpdate({ accounts: next });
    if (activeIdx >= next.length) setActiveIdx(Math.max(0, next.length - 1));
  };

  const updateAccount = (idx: number, field: string, value: string) => {
    const next = [...accounts];
    next[idx] = { ...next[idx], [field]: value };
    onUpdate({ accounts: next });
  };

  const currentAcc = accounts[activeIdx];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-black text-[#111827]">섹션 타이틀</span>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold text-[#4B5563]">텍스트 정렬</span>
          <AlignmentBlock value={section.textAlign} onChange={(v) => onUpdate({ textAlign: v })} />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <EditorLabel>제목</EditorLabel>
          <EditorInput value={section.title} onChange={(v) => onUpdate({ title: v })} placeholder="마음 전하실 곳" />
        </div>
        <div className="flex flex-col gap-2">
          <EditorLabel>설명</EditorLabel>
          <EditorTextarea value={section.description} onChange={(v) => onUpdate({ description: v })} placeholder="축하의 마음을 담아 축의금을 전달해보세요" />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <EditorLabel>표시 스타일</EditorLabel>
        <div className="grid grid-cols-3 gap-2">
          {['accordion', 'inline', 'modal'].map((style) => (
            <button key={style} onClick={() => onUpdate({ displayStyle: style })} className={`py-3 rounded-xl border transition-all text-[13px] font-bold ${section.displayStyle === style ? 'border-[#3B82F6] bg-[#EFF6FF] text-[#3B82F6]' : 'border-[#F3F4F6] bg-white text-[#4B5563] hover:border-[#E5E7EB]'}`}>
              {style === 'accordion' ? '아코디언' : style === 'inline' ? '인라인' : '모달'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 pt-2 border-t border-[#F1F2F4]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><EditorLabel>계좌 정보</EditorLabel><span className="text-[11px] font-bold text-[#9ca3af] mb-2">({accounts.length})</span></div>
          <button onClick={addAccount} className="text-[11px] font-bold text-[#3B82F6] hover:underline mb-2">계좌 추가</button>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar border-b border-[#E5E7EB]">
          {accounts.map((acc: any, i: number) => (
            <button key={i} onClick={() => setActiveIdx(i)} className={`px-4 py-2 text-[13px] font-bold transition-all relative whitespace-nowrap ${activeIdx === i ? 'text-[#3B82F6]' : 'text-[#9ca3af]'}`}>
              {acc.name || acc.relationship || `계좌 ${i + 1}`}
              {activeIdx === i && <div className="absolute bottom-0 left-0 w-full h-[2.5px] bg-[#3B82F6] rounded-t-full" />}
            </button>
          ))}
        </div>

        {currentAcc && (
          <div className="flex flex-col gap-4 mt-2 p-5 bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB] relative group/acc shadow-sm">
            <button onClick={() => removeAccount(activeIdx)} className="absolute top-5 right-5 flex items-center gap-1 text-[11px] font-bold text-[#E2626E] hover:text-red-600 transition-colors"><Trash2 size={14} /><span>삭제</span></button>
            <div className="flex flex-col gap-2 pt-2">
              <EditorLabel>관계</EditorLabel>
              <CustomSelect value={currentAcc.relationship} options={[{ id: 'groom', name: '신랑' }, { id: 'groom_father', name: '신랑측 부' }, { id: 'groom_mother', name: '신랑측 모' }, { id: 'bride', name: '신부' }, { id: 'bride_father', name: '신부측 부' }, { id: 'bride_mother', name: '신부측 모' }]} onChange={(v) => { const nameMap: any = { 'groom': '신랑', 'groom_father': '신랑측 부', 'groom_mother': '신랑측 모', 'bride': '신부', 'bride_father': '신부측 부', 'bride_mother': '신부측 모' }; updateAccount(activeIdx, 'relationship', nameMap[v]); }} />
            </div>
            <div className="flex flex-col gap-2"><EditorLabel>성명</EditorLabel><input type="text" value={currentAcc.name} onChange={(e) => updateAccount(activeIdx, 'name', e.target.value)} placeholder="예) 홍길동" className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-[13px] text-[#111827] font-medium focus:outline-none focus:border-[#3B82F6]" /></div>
            <div className="flex flex-col gap-2"><EditorLabel>은행</EditorLabel>
              <div className="flex gap-2 relative">
                <input type="text" value={currentAcc.bank} onChange={(e) => updateAccount(activeIdx, 'bank', e.target.value)} placeholder="국민은행" className="flex-1 px-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-[13px] text-[#111827] font-medium focus:outline-none" />
                <button onClick={() => setShowBankList(!showBankList)} className="px-4 py-3 bg-[#F3F4F6] text-[#4B5563] text-[12px] font-bold rounded-xl hover:bg-[#E5E7EB] shrink-0 border border-[#E5E7EB]">목록</button>
                {showBankList && (
                  <div className="absolute top-full right-0 mt-1 w-full bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl z-[110] max-h-[300px] overflow-y-auto py-2">
                    {['KB국민은행', '신한은행', '우리은행', '하나은행', 'NH농협은행', 'IBK기업은행', '카카오뱅크', '토스뱅크', '우체국'].map(bank => (
                      <div key={bank} onClick={() => { updateAccount(activeIdx, 'bank', bank); setShowBankList(false); }} className="px-6 py-3 text-[13px] hover:bg-[#F3F4F6] cursor-pointer">{bank}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2"><EditorLabel>계좌번호</EditorLabel><input type="text" value={currentAcc.accountNumber} onChange={(e) => updateAccount(activeIdx, 'accountNumber', e.target.value)} placeholder="000-000-000000" className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-[13px] text-[#111827] font-medium" /></div>
            <div className="flex flex-col gap-2"><EditorLabel>카카오페이 송금 링크 (선택)</EditorLabel><input type="text" value={currentAcc.kakaoPayUrl} onChange={(e) => updateAccount(activeIdx, 'kakaoPayUrl', e.target.value)} placeholder="https://qr.kakaopay.com/..." className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-[13px] text-[#111827] font-medium" /></div>
            <div className="flex flex-col gap-2"><EditorLabel>토스 송금 링크 (선택)</EditorLabel><input type="text" value={currentAcc.tossUrl || ''} onChange={(e) => updateAccount(activeIdx, 'tossUrl', e.target.value)} placeholder="https://toss.me/..." className="w-full px-4 py-3 bg-white border border-[#E5E7EB] rounded-xl text-[13px] text-[#111827] font-medium" /></div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 py-1 border-t border-[#F1F2F4] pt-4">
        <EditorToggle label="배경색 사용" checked={!!section.useBackgroundColor} onChange={(v) => onUpdate({ useBackgroundColor: v })} />
      </div>

      <FontSettingsBlock section={section} onUpdate={onUpdate} showFont={showFont} setShowFont={setShowFont} showFontList={showFontList} setShowFontList={setShowFontList} />
    </div>
  );
}


/* 정렬용 탭 컴포넌트 */
function SortableTab({ id, label, index, isActive, onClick, onRemove }: { id: string; label: string; index: number; isActive: boolean; onClick: () => void; onRemove?: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = { transform: CSS.Translate.toString(transform), transition, zIndex: isDragging ? 100 : 'auto', opacity: isDragging ? 0.6 : 1 };
  return (
    <div ref={setNodeRef} style={style} className={`flex items-center gap-1.5 px-3 py-2.5 text-[12px] font-bold whitespace-nowrap transition-all rounded-lg relative group ${isActive ? 'text-[#3B82F6] bg-[#F3F4F6]' : 'text-[#6b7280] bg-[#F9FAFB] hover:bg-[#F3F4F6]'}`}>
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-0.5 -ml-1 text-[#D1D5DB] hover:text-[#9ca3af]"><GripVertical size={14} /></div>
      <button onClick={onClick} className="flex-1 text-left">{label || `항목 ${index + 1}`}</button>
      {isActive && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#3B82F6] rounded-full" />}
    </div>
  );
}

/* 디자인 소개(Intro/Interview) 편집기 */
function IntroEditor({ section, onUpdate }: { section: any; onUpdate: (updates: any) => void }) {
  const [showFont, setShowFont] = useState(false);
  const [showFontList, setShowFontList] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const interviews = section.interviews || [];
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const introStyles = [
    { id: 'love-story', name: '러브스토리' },
    { id: 'interview', name: '인터뷰' },
    { id: 'profile', name: '프로필' }
  ];

  const imageShapes = [
    { id: 'circle', name: '원형' },
    { id: 'rounded', name: '라운드' },
    { id: 'square', name: '사각형' }
  ];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = interviews.findIndex((it: any) => it.id === active.id);
      const newIndex = interviews.findIndex((it: any) => it.id === over.id);
      onUpdate({ interviews: arrayMove(interviews, oldIndex, newIndex) });
      setActiveIdx(newIndex);
    }
  };

  const addInterview = () => {
    const next = [...interviews, { id: crypto.randomUUID(), question: '질문을 입력하세요', groomAnswer: '', brideAnswer: '' }];
    onUpdate({ interviews: next });
    setActiveIdx(next.length - 1);
  };

  const removeInterview = (idx: number) => {
    const next = interviews.filter((_: any, i: number) => i !== idx);
    onUpdate({ interviews: next });
    setActiveIdx(Math.max(0, idx - 1));
  };

  const updateInterview = (updates: any) => {
    const next = interviews.map((it: any, i: number) => i === activeIdx ? { ...it, ...updates } : it);
    onUpdate({ interviews: next });
  };

  const current = interviews[activeIdx];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-black text-[#111827]">섹션 타이틀</span>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold text-[#4B5563]">텍스트 정렬</span>
          <AlignmentBlock value={section.textAlign} onChange={(v) => onUpdate({ textAlign: v })} />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <EditorLabel>섹션 제목</EditorLabel>
          <EditorInput value={section.title} onChange={(v) => onUpdate({ title: v })} placeholder="Groom & Bride" />
        </div>
        <div className="flex flex-col gap-2">
          <EditorLabel>섹션 부제목</EditorLabel>
          <EditorInput value={section.subtitle} onChange={(v) => onUpdate({ subtitle: v })} placeholder="신랑 신부를 소개합니다" />
        </div>
        <div className="flex flex-col gap-2">
          <EditorLabel>디자인 스타일</EditorLabel>
          <div className="grid grid-cols-3 gap-2">
            {introStyles.map((style) => (
              <button
                key={style.id}
                onClick={() => onUpdate({ style: style.id })}
                className={`py-2.5 text-[11px] font-bold rounded-xl border transition-all ${(section.style || 'love-story') === style.id
                  ? 'bg-[#EFF6FF] border-[#3B82F6] text-[#3B82F6]'
                  : 'bg-white border-[#E5E7EB] text-[#6b7280] hover:border-[#3B82F6]'
                  }`}
              >
                {style.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 pt-2 border-t border-[#F1F2F4]">
        <span className="text-[12px] font-black text-[#111827]">대표 사진 설정</span>
        <EditorImagePicker label="섹션 대표 사진" subtitle="상단에 표시될 메인 사진" value={section.image} onChange={(v) => onUpdate({ image: v })} />
        <div className="flex flex-col gap-2">
          <EditorLabel>사진 모양</EditorLabel>
          <div className="grid grid-cols-3 gap-2">
            {imageShapes.map(shape => (
              <button key={shape.id} onClick={() => onUpdate({ imageShape: shape.id })} className={`py-2 text-[11px] font-bold rounded-xl border transition-all ${((section.imageShape || 'circle') === shape.id) ? 'bg-[#EFF6FF] border-[#3B82F6] text-[#3B82F6]' : 'bg-white border-[#E5E7EB] text-[#6b7280]'}`}>{shape.name}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 pt-4 border-t border-[#F1F2F4]">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-black text-[#111827]">인터뷰 목록 <span className="text-[#3B82F6]">({interviews.length})</span></span>
          <button onClick={addInterview} className="flex items-center gap-1 text-[11px] font-bold text-[#3B82F6] hover:underline"><Plus size={14} /> 질문 추가</button>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={interviews.map((it: any) => it.id)} strategy={horizontalListSortingStrategy}>
              {interviews.map((item: any, i: number) => (
                <SortableTab key={item.id} id={item.id} label={item.question} index={i} isActive={activeIdx === i} onClick={() => setActiveIdx(i)} />
              ))}
            </SortableContext>
          </DndContext>
        </div>
        {current && (
          <div className="p-5 bg-white border border-[#E5E7EB] rounded-2xl flex flex-col gap-5 relative shadow-sm">
            <button onClick={() => removeInterview(activeIdx)} className="absolute top-4 right-4 text-[#F87171] hover:text-red-500 flex items-center gap-1 text-[11px] font-bold"><Trash2 size={14} /> 삭제</button>
            <div className="flex flex-col gap-2"><EditorLabel>질문</EditorLabel><EditorInput value={current.question} onChange={(v) => updateInterview({ question: v })} placeholder="첫인상은 어땠나요?" /></div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between mb-1"><span className="text-[11px] font-bold text-[#6b7280]">신랑 답변</span><button className="flex items-center gap-1 text-[10px] text-[#F59E0B] font-bold px-2 py-1 rounded-full bg-[#FFFBEB] hover:bg-[#FEF3C7] transition-colors"><Wand2 size={10} /> AI 수정</button></div>
              <EditorTextarea value={current.groomAnswer} onChange={(v) => updateInterview({ groomAnswer: v })} />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between mb-1"><span className="text-[11px] font-bold text-[#6b7280]">신부 답변</span><button className="flex items-center gap-1 text-[10px] text-[#F59E0B] font-bold px-2 py-1 rounded-full bg-[#FFFBEB] hover:bg-[#FEF3C7] transition-colors"><Wand2 size={10} /> AI 수정</button></div>
              <EditorTextarea value={current.brideAnswer} onChange={(v) => updateInterview({ brideAnswer: v })} />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 py-1 border-t border-[#F1F2F4] pt-4">
        <EditorToggle label="배경색 사용" checked={!!section.useBackgroundColor} onChange={(v) => onUpdate({ useBackgroundColor: v })} />
      </div>

      <FontSettingsBlock section={section} onUpdate={onUpdate} showFont={showFont} setShowFont={setShowFont} showFontList={showFontList} setShowFontList={setShowFontList} />
    </div>
  );
}


/* 디자인 포토드롭(PhotoDrop) 편집기 */
function PhotoDropEditor({ section, onUpdate }: { section: any; onUpdate: (updates: any) => void }) {
  const [showFont, setShowFont] = useState(false);
  const [showFontList, setShowFontList] = useState(false);

  const images = section.images || [];
  // ── 포토드롭의 대표 이미지는 등록된 다중 이미지 목록 중 첫 번째 이미지 또는 section.image 단일 값과 연동 ──
  const representativeImage = section.image || images[0]?.url || '';

  const addImage = () => {
    const event = new CustomEvent('open-image-picker', {
      detail: {
        currentValue: '',
        onSelect: (url: string) => {
          const nextImages = [...images, { url }];
          onUpdate({
            images: nextImages,
            // 첫 번째 사진이 등록되는 경우 대표 이미지 속성도 함께 채워줌
            image: section.image ? section.image : (images.length === 0 ? url : section.image)
          });
        }
      }
    });
    window.dispatchEvent(event);
  };

  const removeImage = (idx: number) => {
    const nextImages = images.filter((_: any, i: number) => i !== idx);
    const deletedUrl = images[idx]?.url;
    let nextRepImage = section.image;

    // 만약 지워진 사진이 현재 대표 이미지와 같다면 새 리스트의 첫 번째 사진으로 대표 이미지 갱신
    if (deletedUrl === section.image) {
      nextRepImage = nextImages[0]?.url || '';
    }

    onUpdate({
      images: nextImages,
      image: nextRepImage
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-black text-[#111827]">섹션 타이틀</span>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold text-[#4B5563]">텍스트 정렬</span>
          <AlignmentBlock value={section.textAlign} onChange={(v) => onUpdate({ textAlign: v })} />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <EditorLabel>제목</EditorLabel>
          <EditorInput value={section.title} onChange={(v) => onUpdate({ title: v })} placeholder="Our Photo Drop" />
        </div>
        <div className="flex flex-col gap-2">
          <EditorLabel>설명</EditorLabel>
          <EditorTextarea value={section.description} onChange={(v) => onUpdate({ description: v })} placeholder="소중한 순간들을 공유해 주세요" />
        </div>
        <div className="flex flex-col gap-2">
          <EditorLabel>이미지 노출 개수 (Column)</EditorLabel>
          <div className="flex items-center gap-4">
            <input type="range" min={2} max={5} step={1} value={section.columns || 3} onChange={(e) => onUpdate({ columns: parseInt(e.target.value) })} className="flex-1 h-1.5 bg-[#E5E7EB] rounded-full appearance-none cursor-pointer accent-[#3B82F6]" />
            <span className="text-[13px] font-bold text-[#3B82F6] w-4">{section.columns || 3}</span>
          </div>
        </div>
      </div>

      {/* 1. 대표 이미지 자동 연동 및 실시간 싱크로나이즈 (세 번째 이미지 완벽 해결!) */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <EditorLabel>대표 이미지</EditorLabel>
          {representativeImage && (
            <span className="text-[10px] font-extrabold text-[#3B82F6] px-2 py-0.5 rounded-md bg-[#EFF6FF] border border-[#DBEAFE]">동적 연동 중</span>
          )}
        </div>
        <EditorImagePicker
          label="대표 이미지 선택"
          subtitle="포토드롭 섹션 상단 메인 이미지"
          value={representativeImage}
          onChange={(v) => {
            const nextImages = [...images];
            if (nextImages.length > 0) {
              nextImages[0] = { url: v };
            } else {
              nextImages.push({ url: v });
            }
            onUpdate({
              image: v,
              images: nextImages
            });
          }}
        />
      </div>

      {/* 2. 포토드롭 등록 이미지 다중 관리 리스트 구역 추가 (GalleryEditor 명품 스타일 적용) */}
      <div className="flex flex-col gap-3 pt-4 border-t border-[#F1F2F4]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <EditorLabel>포토드롭 이미지 리스트</EditorLabel>
            <span className="text-[11px] font-bold text-[#9ca3af]">({images.length})</span>
          </div>
          <button onClick={addImage} className="text-[11px] font-black text-[#3B82F6] hover:underline">+ 사진 추가</button>
        </div>

        {images.length > 0 ? (
          <div className="grid grid-cols-4 gap-2.5 bg-[#F9FAFB] p-3.5 rounded-2xl border border-[#E5E7EB]">
            {images.map((img: any, i: number) => (
              <div key={i} className="aspect-square bg-white border border-[#E5E7EB] rounded-xl relative group/item overflow-hidden shadow-sm">
                <img src={img.url} className="w-full h-full object-cover" alt="" />
                {/* 첫 번째 사진은 대표 이미지임을 명시해주는 라벨 장착 */}
                {i === 0 && (
                  <div className="absolute top-1 left-1 bg-[#3B82F6] text-white text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-sm z-10 select-none">
                    대표
                  </div>
                )}
                <button
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-stone-800/80 hover:bg-stone-950 text-white flex items-center justify-center transition-all opacity-0 group-hover/item:opacity-100 z-10 shadow-md"
                >
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 bg-[#F9FAFB] rounded-2xl border border-dashed border-[#E5E7EB] text-center flex flex-col items-center justify-center gap-1.5 select-none">
            <span className="text-[12px] font-bold text-[#9ca3af]">등록된 이미지가 없습니다.</span>
            <span className="text-[10px] text-[#D1D5DB]">상단 [사진 추가] 버튼을 눌러보세요.</span>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 py-1 border-t border-[#F1F2F4] pt-4">
        <EditorToggle label="캡션 사용" checked={!!section.showCaption} onChange={(v) => onUpdate({ showCaption: v })} />
        <EditorToggle label="배경색 사용" checked={!!section.useBackgroundColor} onChange={(v) => onUpdate({ useBackgroundColor: v })} />
      </div>

      <FontSettingsBlock section={section} onUpdate={onUpdate} showFont={showFont} setShowFont={setShowFont} showFontList={showFontList} setShowFontList={setShowFontList} />
    </div>
  );
}


/* 디자인 안내사항(Notice) 편집기 */
function NoticeEditor({ section, onUpdate }: { section: any; onUpdate: (updates: any) => void }) {
  const [showFont, setShowFont] = useState(false);
  const [showFontList, setShowFontList] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const items = section.items || [];
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((it: any) => it.id === active.id);
      const newIndex = items.findIndex((it: any) => it.id === over.id);
      onUpdate({ items: arrayMove(items, oldIndex, newIndex) });
      setActiveIdx(newIndex);
    }
  };

  const addItem = () => {
    const next = [...items, { id: crypto.randomUUID(), title: '항목 제목', content: '' }];
    onUpdate({ items: next });
    setActiveIdx(next.length - 1);
  };

  const removeItem = (idx: number) => {
    const next = items.filter((_: any, i: number) => i !== idx);
    onUpdate({ items: next });
    setActiveIdx(Math.max(0, idx - 1));
  };

  const updateItem = (updates: any) => {
    const next = items.map((it: any, i: number) => i === activeIdx ? { ...it, ...updates } : it);
    onUpdate({ items: next });
  };

  const current = items[activeIdx];

  const displayModes = [
    { id: 'inline', name: '인라인' },
    { id: 'slider', name: '슬라이더' },
    { id: 'tab', name: '탭' },
    { id: 'accordion', name: '아코디언' }
  ];

  const uiStyles = [
    { id: 'classic', name: '클래식' },
    { id: 'modern', name: '모던' },
    { id: 'border', name: '테두리형' },
    { id: 'minimal', name: '미니멀' }
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-black text-[#111827]">섹션 타이틀</span>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold text-[#4B5563]">텍스트 정렬</span>
          <AlignmentBlock value={section.textAlign} onChange={(v) => onUpdate({ textAlign: v })} />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <EditorLabel>표시 모드</EditorLabel>
          <div className="grid grid-cols-4 gap-1.5">
            {displayModes.map(mode => (
              <button key={mode.id} onClick={() => onUpdate({ displayMode: mode.id })} className={`py-2.5 text-[11px] font-bold rounded-xl border transition-all ${((section.displayMode || 'inline') === mode.id) ? 'bg-[#EFF6FF] border-[#3B82F6] text-[#3B82F6] shadow-sm' : 'bg-white border-[#E5E7EB] text-[#6b7280] hover:border-[#3B82F6]'}`}>{mode.name}</button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <EditorLabel>UI 스타일</EditorLabel>
          <div className="grid grid-cols-4 gap-1.5">
            {uiStyles.map(style => (
              <button key={style.id} onClick={() => onUpdate({ uiStyle: style.id })} className={`py-2.5 text-[11px] font-bold rounded-xl border transition-all ${((section.uiStyle || 'classic') === style.id) ? 'bg-[#EFF6FF] border-[#3B82F6] text-[#3B82F6] shadow-sm' : 'bg-white border-[#E5E7EB] text-[#6b7280] hover:border-[#3B82F6]'}`}>{style.name}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 pt-4 border-t border-[#F1F2F4]">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-black text-[#111827]">안내 목록 <span className="text-[#3B82F6]">({items.length})</span></span>
          <button onClick={addItem} className="flex items-center gap-1 text-[11px] font-bold text-[#3B82F6] hover:underline"><Plus size={14} /> 항목 추가</button>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((it: any) => it.id)} strategy={horizontalListSortingStrategy}>
              {items.map((item: any, i: number) => (
                <SortableTab key={item.id} id={item.id} label={item.title} index={i} isActive={activeIdx === i} onClick={() => setActiveIdx(i)} />
              ))}
            </SortableContext>
          </DndContext>
        </div>
        {current && (
          <div className="p-5 bg-white border border-[#E5E7EB] rounded-2xl flex flex-col gap-5 relative shadow-sm">
            <button onClick={() => removeItem(activeIdx)} className="absolute top-4 right-4 text-[#F87171] hover:text-red-500 flex items-center gap-1 text-[11px] font-bold"><Trash2 size={14} /> 삭제</button>
            <div className="flex flex-col gap-2"><EditorLabel>제목</EditorLabel><EditorInput value={current.title} onChange={(v) => updateItem({ title: v })} placeholder="화환 정중히 사양합니다" /></div>
            <div className="flex flex-col gap-2"><EditorLabel>내용</EditorLabel><EditorTextarea value={current.content} onChange={(v) => updateItem({ content: v })} /></div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 py-1 border-t border-[#F1F2F4] pt-4">
        <EditorToggle label="배경색 사용" checked={!!section.useBackgroundColor} onChange={(v) => onUpdate({ useBackgroundColor: v })} />
      </div>

      <FontSettingsBlock section={section} onUpdate={onUpdate} showFont={showFont} setShowFont={setShowFont} showFontList={showFontList} setShowFontList={setShowFontList} />
    </div>
  );
}


/* 디자인 RSVP 편집기 */
function RsvpEditor({ section, onUpdate }: { section: any; onUpdate: (updates: any) => void }) {
  const [showFont, setShowFont] = useState(false);
  const [showFontList, setShowFontList] = useState(false);
  const displayModes = [{ id: 'inline', name: '인라인' }, { id: 'button', name: '버튼' }, { id: 'popup', name: '자동 팝업' }, { id: 'sticky', name: '스티키' }];
  const uiStyles = [{ id: 'modern', name: '모던' }, { id: 'classic', name: '클래식' }, { id: 'minimal', name: '미니멀' }];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-black text-[#111827]">섹션 타이틀</span>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold text-[#4B5563]">텍스트 정렬</span>
          <AlignmentBlock value={section.textAlign} onChange={(v) => onUpdate({ textAlign: v })} />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2"><EditorLabel>참석 여부 제목</EditorLabel><EditorInput value={section.title} onChange={(v) => onUpdate({ title: v })} placeholder="참석 여부를 알려주세요" /></div>
        <div className="flex flex-col gap-2"><EditorLabel>부제목</EditorLabel><EditorInput value={section.subtitle} onChange={(v) => onUpdate({ subtitle: v })} placeholder="원활한 예식 진행을 위해 참석 여부를 미리 알려주시면 감사하겠습니다" /></div>

        <div className="flex flex-col gap-2">
          <EditorLabel>표시 모드</EditorLabel>
          <div className="grid grid-cols-4 gap-1.5">
            {displayModes.map(mode => (
              <button key={mode.id} onClick={() => onUpdate({ displayMode: mode.id })} className={`py-2.5 text-[11px] font-bold rounded-xl border transition-all ${((section.displayMode || 'inline') === mode.id) ? 'bg-[#EFF6FF] border-[#3B82F6] text-[#3B82F6] shadow-sm' : 'bg-white border-[#E5E7EB] text-[#6b7280] hover:border-[#3B82F6]'}`}>{mode.name}</button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <EditorLabel>UI 스타일</EditorLabel>
          <CustomSelect value={section.uiStyle || 'modern'} options={uiStyles} onChange={(v) => onUpdate({ uiStyle: v })} />
        </div>
      </div>

      <div className="flex flex-col gap-3 py-1 border-t border-[#F1F2F4] pt-4">
        <EditorToggle label="배경색 사용" checked={!!section.useBackgroundColor} onChange={(v) => onUpdate({ useBackgroundColor: v })} />
      </div>

      <FontSettingsBlock section={section} onUpdate={onUpdate} showFont={showFont} setShowFont={setShowFont} showFontList={showFontList} setShowFontList={setShowFontList} />
    </div>
  );
}


/* 디자인 방명록(Guestbook) 편집기 */
function GuestbookEditor({ section, onUpdate }: { section: any; onUpdate: (updates: any) => void }) {
  const [showFont, setShowFont] = useState(false);
  const [showFontList, setShowFontList] = useState(false);
  const uiStyles = [{ id: 'card', name: '카드형', desc: '카드형 레이아웃, 좌측 컬러 바 강조' }, { id: 'list', name: '리스트형', desc: '리스트형 레이아웃, 심플한 디자인' }, { id: 'chat', name: '대화형', desc: '대화창 형태의 레이아웃' }];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-black text-[#111827]">섹션 타이틀</span>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold text-[#4B5563]">텍스트 정렬</span>
          <AlignmentBlock value={section.textAlign} onChange={(v) => onUpdate({ textAlign: v })} />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2"><EditorLabel>축하 메시지 제목</EditorLabel><EditorInput value={section.title} onChange={(v) => onUpdate({ title: v })} placeholder="방명록" /></div>
        <div className="flex flex-col gap-2"><EditorLabel>축하 문구</EditorLabel><EditorInput value={section.subtitle} onChange={(v) => onUpdate({ subtitle: v })} placeholder="축하의 메시지를 남겨주세요" /></div>

        <div className="flex flex-col gap-2">
          <EditorLabel>최대 글자수</EditorLabel>
          <input type="number" value={section.maxLength || 500} onChange={(e) => onUpdate({ maxLength: parseInt(e.target.value) || 500 })} className="w-full px-4 py-2.5 bg-white border border-[#E5E7EB] rounded-xl text-[13px] text-[#111827]" />
        </div>

        <div className="flex flex-col gap-2">
          <EditorLabel>UI 스타일</EditorLabel>
          <div className="grid grid-cols-3 gap-2">
            {uiStyles.map((s) => {
              const isActive = (section.uiStyle || 'card') === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onUpdate({ uiStyle: s.id })}
                  className={`py-2.5 text-[12px] font-bold rounded-xl transition-all border text-center ${isActive
                    ? 'bg-[#EFF6FF] border-[#3B82F6] text-[#2563EB]'
                    : 'bg-white border-[#E5E7EB] text-[#4B5563] hover:bg-[#F9FAFB]'
                    }`}
                >
                  {s.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-1 border-t border-[#F1F2F4] pt-4">
          <EditorToggle label="이미지 표시" checked={!!section.showImage} onChange={(v) => onUpdate({ showImage: v })} />
          <EditorToggle label="배경색 사용" checked={!!section.useBackgroundColor} onChange={(v) => onUpdate({ useBackgroundColor: v })} />
        </div>
      </div>

      <FontSettingsBlock section={section} onUpdate={onUpdate} showFont={showFont} setShowFont={setShowFont} showFontList={showFontList} setShowFontList={setShowFontList} />
    </div>
  );
}


/* 메인 섹션 에디터 팩토리 컴포넌트 */
export default function SectionEditor({ section, onUpdate }: SectionEditorProps) {
  switch (section.type) {
    case 'cover':
      return <CoverEditor section={section} onUpdate={onUpdate} />;
    case 'greeting':
      return <GreetingEditor section={section} onUpdate={onUpdate} />;
    case 'gallery':
      return <GalleryEditor section={section} onUpdate={onUpdate} />;
    case 'map':
      return <MapEditor section={section} onUpdate={onUpdate} />;
    case 'bankAccount':
      return <BankAccountEditor section={section} onUpdate={onUpdate} />;
    case 'dday':
    case 'countdown':
      return <DdayEditor section={section} onUpdate={onUpdate} />;
    case 'datetime':
      return <DateTimeEditor section={section} onUpdate={onUpdate} />;
    case 'photoDrop':
      return <PhotoDropEditor section={section} onUpdate={onUpdate} />;
    case 'intro':
      return <IntroEditor section={section} onUpdate={onUpdate} />;
    case 'notice':
      return <NoticeEditor section={section} onUpdate={onUpdate} />;
    case 'rsvp':
      return <RsvpEditor section={section} onUpdate={onUpdate} />;
    case 'guestbook':
      return <GuestbookEditor section={section} onUpdate={onUpdate} />;
    default:
      return (
        <div className="py-10 flex flex-col items-center justify-center gap-4 bg-[#F9FAFB] rounded-2xl border border-dashed border-[#E5E7EB]">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#D1D5DB] shadow-sm">
            <Wand2 size={24} />
          </div>
          <p className="text-[13px] font-bold text-[#9ca3af]">준비 중인 편집기입니다 ({section.type})</p>
          <button className="text-[12px] font-bold text-[#3B82F6] hover:underline">기본 설정 사용하기</button>
        </div>
      );
  }
}
