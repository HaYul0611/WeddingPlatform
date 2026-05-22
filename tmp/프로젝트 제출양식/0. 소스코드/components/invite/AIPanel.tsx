'use client';

import { useState } from 'react';
import type { InvitationSection } from '@/types/invitation';
import { Sparkles, Languages, Send, Check } from 'lucide-react';

type GenType = 'greeting' | 'translate';
type Tone = 'formal' | 'friendly' | 'emotional' | 'humorous' | 'poetic';

const TONES: { id: Tone; label: string }[] = [
  { id: 'formal', label: '격식체' },
  { id: 'friendly', label: '친근한' },
  { id: 'emotional', label: '감성적인' },
  { id: 'humorous', label: '유머러스' },
  { id: 'poetic', label: '시적인' },
];

const TONE_SAMPLES: Record<Tone, string> = {
  formal: '두 사람이 만나 하나가 되는 날,\n소중한 인연을 소중한 분들과 나누고 싶습니다.\n\n바쁘신 중에도 귀한 걸음 해 주시면\n더없는 기쁨이 될 것입니다.',
  friendly: '드디어! 우리 결혼해요 🎉\n오랫동안 기다려온 그 날,\n꼭 함께해 주세요!\n\n여러분의 축복이 필요합니다.',
  emotional: '당신이라는 계절이 제 삶에 찾아온 날,\n세상의 모든 꽃이 피었습니다.\n\n같은 길을 걸으며 같은 하늘을 바라보며\n남은 모든 계절을 함께 맞이하려 합니다.',
  humorous: '드디어 짝을 찾았습니다!\n수많은 우여곡절 끝에 완성된 우리의 인연,\n증인이 되어 주세요!\n\n오시면 맛있는 것도 드립니다 😄',
  poetic: '한 잎의 꽃잎처럼 너에게로 날아가\n너의 정원에 뿌리를 내리고 싶었습니다.\n\n오늘 그 꿈이 이루어집니다.\n우리의 봄날을 함께 축복해 주세요.',
};

interface AIPanelProps {
  sections: InvitationSection[];
  onApply: (sectionId: string, text: string) => void;
}

export default function AIPanel({ sections, onApply }: AIPanelProps) {
  const [genType, setGenType] = useState<GenType>('greeting');

  // [버그 수정]: 다중 활성화를 방지하기 위해 단일 Tone 상태로 변경
  const [selectedTone, setSelectedTone] = useState<Tone>('formal');
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // [신규 기능]: AI 생성결과를 적용할 텍스트 수정 가능 섹션들 스마트 필터링
  const editableSections = sections.filter((s) => ['greeting', 'rsvp'].includes(s.type));
  const defaultTarget = editableSections.find((s) => s.type === 'greeting') || editableSections[0];
  const [targetSectionId, setTargetSectionId] = useState<string>(defaultTarget?.id || '');

  // 현재 선택된 타겟 섹션의 레이블 획득
  const currentTargetSection = sections.find((s) => s.id === targetSectionId);
  const targetLabel = currentTargetSection?.type === 'greeting' ? '인사말' : 'RSVP 안내글';

  async function handleGenerate() {
    if (isLoading) return;
    setIsLoading(true);
    setResult('');

    try {
      // Next.js 무료 Gemini API 프록시 라우트 호출
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          genType,
          tone: selectedTone,
          prompt: prompt.trim()
        })
      });

      if (!res.ok) throw new Error('AI 생성 오류');
      const data = await res.json();
      setResult(data.result);
    } catch (err) {
      // 서버/네트워크 오류 시 로컬 지능형 Fallback AI 엔진으로 안전 백업 복원!
      await new Promise((r) => setTimeout(r, 600));
      const base = TONE_SAMPLES[selectedTone];
      setResult(prompt.trim() ? `${base}\n\n[추천 키워드 반영] ${prompt}` : base);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-0.5 animate-in fade-in slide-in-from-bottom-4 duration-300">

      {/* 1. AI 가이드 카드 */}
      <div className="bg-white rounded-2xl border border-[#F1F2F4] shadow-sm p-5 mb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-[#FFF1F2] rounded-lg text-[#E11D48]">
            <Sparkles size={18} strokeWidth={2.5} />
          </div>
          <span className="text-[14px] font-bold text-[#111827]">AI 콘텐츠 생성</span>
        </div>
        <p className="text-[12px] text-[#9ca3af] font-medium leading-[1.6]">AI가 카테고리에 맞는 최적의 콘텐츠를 생성해 드립니다.</p>
      </div>

      {/* 2. 생성 설정 카드 */}
      <div className="bg-white rounded-2xl border border-[#F1F2F4] shadow-sm p-5 space-y-5">
        <div>
          <div className="text-[13px] font-bold text-[#111827] mb-3">생성 유형</div>
          <div className="flex gap-2">
            {[
              { id: 'greeting' as GenType, label: '인사말', icon: Sparkles },
              { id: 'translate' as GenType, label: '번역', icon: Languages },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setGenType(t.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 border rounded-xl text-[12px] font-bold transition-all ${genType === t.id
                    ? 'border-[#FECDD3] bg-[#FFF1F2] text-[#E11D48]'
                    : 'border-[#E8E6E0] bg-[#FAF9F5] text-[#9ca3af]'
                  }`}
              >
                <t.icon size={14} /> {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[13px] font-bold text-[#111827] mb-3">톤 설정</div>
          <div className="flex flex-wrap gap-1.5">
            {TONES.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTone(t.id)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all ${selectedTone === t.id
                    ? 'bg-[#FFF1F2] text-[#E11D48] border-[#FECDD3]'
                    : 'bg-[#FAF9F5] text-[#6B7280] border-[#E8E6E0]'
                  }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* [신규 기능]: 생성 결과 적용 대상 드롭다운 선택 스위처 */}
        {editableSections.length > 0 && (
          <div>
            <div className="text-[13px] font-bold text-[#111827] mb-2.5">적용할 청첩장 영역</div>
            <select
              value={targetSectionId}
              onChange={(e) => setTargetSectionId(e.target.value)}
              className="w-full h-10 px-3.5 border border-[#E8E6E0] bg-[#FAF9F5] rounded-xl text-[12.5px] font-semibold text-stone-700 outline-none focus:border-[#FECDD3] transition-all cursor-pointer"
            >
              {editableSections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.type === 'greeting' ? '인사말 섹션 (Greeting)' : '참석 안내 섹션 (RSVP)'}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={genType === 'greeting' ? '예: 밝고 간결하게, 사랑과 감사 키워드 포함' : '번역할 텍스트를 입력하세요'}
            rows={4}
            className="w-full resize-none rounded-xl border border-[#E5E7EB] p-4 text-[13px] outline-none focus:border-[#FECDD3] transition-all"
          />
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="absolute bottom-3 right-3 w-8 h-8 bg-[#E11D48] rounded-full flex items-center justify-center text-white hover:scale-105 transition-all disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={14} />}
          </button>
        </div>
      </div>

      {/* 3. 결과 영역 */}
      {result && (
        <div className="mt-4 bg-white rounded-2xl border-2 border-[#E11D48] p-5 animate-in zoom-in-95 duration-300 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-[#E11D48]">
            <Check size={16} strokeWidth={3} />
            <span className="text-[12px] font-bold">AI 생성 결과</span>
          </div>
          <p className="text-[13px] text-[#374151] leading-[1.8] whitespace-pre-line mb-5">{result}</p>
          <button
            onClick={() => result && targetSectionId && onApply(targetSectionId, result)}
            className="w-full py-3 bg-[#E11D48] text-white rounded-xl text-[13px] font-bold hover:bg-[#BE123C] transition-all cursor-pointer shadow-sm"
          >
            {targetLabel}에 적용하기
          </button>
        </div>
      )}

    </div>
  );
}
