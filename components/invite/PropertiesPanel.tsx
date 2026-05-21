'use client';

import type { InvitationSection, InvitationTheme } from '@/types/invitation';
import { useState } from 'react';

interface PropertiesPanelProps {
  section: InvitationSection;
  theme: InvitationTheme;
  onUpdate: (updates: Partial<InvitationSection>) => void;
}

export default function PropertiesPanel({ section, theme, onUpdate }: PropertiesPanelProps) {
  return (
    <div>
      <div className="border-b border-stone-100 px-4 py-3">
        <p className="text-xs font-bold text-stone-700">섹션 편집</p>
        <p className="text-[10px] text-stone-400 capitalize">{section.type}</p>
      </div>

      <div className="space-y-4 p-4">
        {section.type === 'cover' && <CoverProps section={section} onUpdate={onUpdate} />}
        {section.type === 'greeting' && <GreetingProps section={section} onUpdate={onUpdate} />}
        {section.type === 'dday' && <DdayProps section={section} onUpdate={onUpdate} />}
        {section.type === 'gallery' && <GalleryProps section={section} onUpdate={onUpdate} theme={theme} />}
        {section.type === 'map' && <MapProps section={section} onUpdate={onUpdate} />}
        {section.type === 'bankAccount' && <BankProps section={section} onUpdate={onUpdate} />}
        {section.type === 'rsvp' && <RsvpProps section={section} onUpdate={onUpdate} />}
        {section.type === 'guestbook' && <GuestbookProps section={section} onUpdate={onUpdate} />}
        {section.type === 'schedule' && <ScheduleProps section={section} onUpdate={onUpdate} />}
        {section.type === 'wishlist' && <WishlistProps section={section} onUpdate={onUpdate} />}
      </div>
    </div>
  );
}

// ── 필드 컴포넌트 ────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-stone-400">{label}</label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, multiline }: {
  value: string; onChange: (v: string) => void; placeholder?: string; multiline?: boolean;
}) {
  const cls = 'w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-stone-800 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100 transition-all';
  if (multiline) return (
    <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={4}
      className={`${cls} resize-none`} />
  );
  return <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cls} />;
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center justify-between">
      <span className="text-xs text-stone-600">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 rounded-full transition-colors ${checked ? 'bg-rose-400' : 'bg-stone-200'}`}
      >
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </button>
    </label>
  );
}

// ── 섹션별 속성 편집 컴포넌트 ──────────────
function CoverProps({ section, onUpdate }: { section: any; onUpdate: any }) {
  return (
    <>
      <Field label="신랑 이름"><TextInput value={section.groom} onChange={(v) => onUpdate({ groom: v })} placeholder="신랑" /></Field>
      <Field label="신부 이름"><TextInput value={section.bride} onChange={(v) => onUpdate({ bride: v })} placeholder="신부" /></Field>
      <Field label="날짜"><input type="date" value={section.date} onChange={(e) => onUpdate({ date: e.target.value })}
        className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100" /></Field>
      <Field label="시간"><TextInput value={section.time} onChange={(v) => onUpdate({ time: v })} placeholder="오후 2시" /></Field>
      <Field label="예식장"><TextInput value={section.venue} onChange={(v) => onUpdate({ venue: v })} placeholder="예식장 이름" /></Field>
      <Field label="부제목"><TextInput value={section.subtitle ?? ''} onChange={(v) => onUpdate({ subtitle: v })} placeholder="부제목 (선택)" /></Field>
      <Field label="사진 스타일">
        <div className="grid grid-cols-2 gap-1.5">
          {(['full', 'circle', 'rounded', 'square'] as const).map((s) => (
            <button key={s} onClick={() => onUpdate({ imageStyle: s })}
              className={`rounded-xl py-2 text-[10px] font-semibold transition-all ${section.imageStyle === s ? 'bg-rose-100 text-rose-600 ring-1 ring-rose-300' : 'bg-stone-50 text-stone-500 hover:bg-stone-100'}`}>
              {s === 'full' ? '전체' : s === 'circle' ? '원형' : s === 'rounded' ? '둥근' : '사각'}
            </button>
          ))}
        </div>
      </Field>
    </>
  );
}

function GreetingProps({ section, onUpdate }: { section: any; onUpdate: any }) {
  return (
    <>
      <Field label="제목"><TextInput value={section.title ?? ''} onChange={(v) => onUpdate({ title: v })} placeholder="제목 (선택)" /></Field>
      <Field label="인사말 내용">
        <TextInput value={section.text} onChange={(v) => onUpdate({ text: v })} placeholder="인사말을 입력하세요" multiline />
      </Field>
      <Field label="발신인"><TextInput value={section.senderName ?? ''} onChange={(v) => onUpdate({ senderName: v })} placeholder="신랑이름·신부이름" /></Field>
    </>
  );
}

function DdayProps({ section, onUpdate }: { section: any; onUpdate: any }) {
  return (
    <>
      <Field label="제목"><TextInput value={section.title ?? ''} onChange={(v) => onUpdate({ title: v })} /></Field>
      <Field label="목표 날짜">
        <input type="date" value={section.targetDate} onChange={(e) => onUpdate({ targetDate: e.target.value })}
          className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100" />
      </Field>
    </>
  );
}

function GalleryProps({ section, onUpdate, theme }: { section: any; onUpdate: any; theme: InvitationTheme }) {
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  async function handleGenerateAI() {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 200,
          messages: [{ role: 'user', content: `Generate a romantic wedding photo description for: ${aiPrompt}. Reply with just 1 sentence description.` }],
        }),
      });
      const data = await res.json();
      const desc = data.content?.[0]?.text ?? '';
      alert(`AI 설명: ${desc}\n\n실제 이미지 생성은 OpenAI DALL-E API 연동이 필요합니다.`);
    } catch {
      alert('AI 기능을 사용하려면 API 키가 필요합니다.');
    }
    setIsGenerating(false);
  }

  return (
    <>
      <Field label="제목"><TextInput value={section.title ?? ''} onChange={(v) => onUpdate({ title: v })} /></Field>
      <Field label="레이아웃">
        <div className="grid grid-cols-3 gap-1.5">
          {(['grid', 'slideshow', 'masonry'] as const).map((l) => (
            <button key={l} onClick={() => onUpdate({ layout: l })}
              className={`rounded-xl py-2 text-[10px] font-semibold ${section.layout === l ? 'bg-rose-100 text-rose-600 ring-1 ring-rose-300' : 'bg-stone-50 text-stone-500'}`}>
              {l === 'grid' ? '그리드' : l === 'slideshow' ? '슬라이드' : '매거진'}
            </button>
          ))}
        </div>
      </Field>
      <Field label="자동 재생"><Toggle checked={section.autoPlay} onChange={(v) => onUpdate({ autoPlay: v })} label="슬라이드쇼 자동 재생" /></Field>
      <div className="rounded-xl border border-dashed border-rose-200 bg-rose-50/30 p-3">
        <p className="mb-2 text-[10px] font-bold text-rose-500">AI 이미지 생성</p>
        <TextInput value={aiPrompt} onChange={setAiPrompt} placeholder="예: 봄날의 웨딩 사진" />
        <button onClick={handleGenerateAI} disabled={isGenerating}
          className="mt-2 w-full rounded-xl bg-rose-500 py-2 text-[10px] font-bold text-white hover:bg-rose-600 disabled:opacity-50">
          {isGenerating ? '생성 중...' : 'AI로 이미지 생성'}
        </button>
        <p className="mt-1 text-[9px] text-stone-400">OpenAI DALL-E API 연동 시 실제 이미지 생성</p>
      </div>
    </>
  );
}

function MapProps({ section, onUpdate }: { section: any; onUpdate: any }) {
  return (
    <>
      <Field label="제목"><TextInput value={section.title ?? ''} onChange={(v) => onUpdate({ title: v })} /></Field>
      <Field label="예식장 이름"><TextInput value={section.venue} onChange={(v) => onUpdate({ venue: v })} /></Field>
      <Field label="주소"><TextInput value={section.address} onChange={(v) => onUpdate({ address: v })} placeholder="도로명 주소" /></Field>
      <Field label="지도 제공자">
        <div className="grid grid-cols-3 gap-1.5">
          {(['kakao', 'naver', 'google'] as const).map((p) => (
            <button key={p} onClick={() => onUpdate({ provider: p })}
              className={`rounded-xl py-2 text-[10px] font-semibold ${section.provider === p ? 'bg-rose-100 text-rose-600 ring-1 ring-rose-300' : 'bg-stone-50 text-stone-500'}`}>
              {p === 'kakao' ? '카카오' : p === 'naver' ? '네이버' : '구글'}
            </button>
          ))}
        </div>
      </Field>
      <div className="space-y-2">
        <Toggle checked={section.showCopyAddress} onChange={(v) => onUpdate({ showCopyAddress: v })} label="주소 복사 버튼" />
        <Toggle checked={section.showKakaoMap} onChange={(v) => onUpdate({ showKakaoMap: v })} label="카카오맵 버튼" />
        <Toggle checked={section.showNaverMap} onChange={(v) => onUpdate({ showNaverMap: v })} label="네이버지도 버튼" />
        <Toggle checked={section.showGoogleMap} onChange={(v) => onUpdate({ showGoogleMap: v })} label="구글맵 버튼" />
      </div>
    </>
  );
}

function BankProps({ section, onUpdate }: { section: any; onUpdate: any }) {
  function addAccount() {
    const newAcc = { id: crypto.randomUUID(), owner: '신랑', bank: '', accountNumber: '', showKakaoPay: false };
    onUpdate({ accounts: [...section.accounts, newAcc] });
  }
  function updateAccount(id: string, updates: object) {
    onUpdate({ accounts: section.accounts.map((a: any) => a.id === id ? { ...a, ...updates } : a) });
  }
  function removeAccount(id: string) {
    onUpdate({ accounts: section.accounts.filter((a: any) => a.id !== id) });
  }

  return (
    <>
      <Field label="제목"><TextInput value={section.title ?? ''} onChange={(v) => onUpdate({ title: v })} /></Field>
      {section.accounts.map((acc: any) => (
        <div key={acc.id} className="rounded-xl border border-stone-200 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-stone-500">계좌 정보</span>
            <button onClick={() => removeAccount(acc.id)} className="text-red-400 hover:text-red-600">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <TextInput value={acc.owner} onChange={(v) => updateAccount(acc.id, { owner: v })} placeholder="예금주 (신랑/신부)" />
          <TextInput value={acc.bank} onChange={(v) => updateAccount(acc.id, { bank: v })} placeholder="은행명" />
          <TextInput value={acc.accountNumber} onChange={(v) => updateAccount(acc.id, { accountNumber: v })} placeholder="계좌번호" />
          <Toggle checked={acc.showKakaoPay} onChange={(v) => updateAccount(acc.id, { showKakaoPay: v })} label="카카오페이 버튼" />
          {acc.showKakaoPay && (
            <TextInput value={acc.kakaoPayLink ?? ''} onChange={(v) => updateAccount(acc.id, { kakaoPayLink: v })} placeholder="카카오페이 링크" />
          )}
        </div>
      ))}
      <button onClick={addAccount}
        className="w-full rounded-xl border border-dashed border-stone-300 py-2.5 text-xs font-semibold text-stone-400 hover:border-rose-300 hover:text-rose-400 transition-colors">
        + 계좌 추가
      </button>
    </>
  );
}

function RsvpProps({ section, onUpdate }: { section: any; onUpdate: any }) {
  return (
    <>
      <Field label="제목"><TextInput value={section.title ?? ''} onChange={(v) => onUpdate({ title: v })} /></Field>
      <Field label="마감일">
        <input type="date" value={section.deadline} onChange={(e) => onUpdate({ deadline: e.target.value })}
          className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs outline-none focus:border-rose-300" />
      </Field>
      <Toggle checked={section.allowPlusOne} onChange={(v) => onUpdate({ allowPlusOne: v })} label="동반인 허용" />
      <Field label="포함 필드">
        {['name', 'phone', 'attendance', 'meal', 'message'].map((f) => (
          <label key={f} className="flex cursor-pointer items-center gap-2 py-1">
            <input type="checkbox" checked={section.fields.includes(f)}
              onChange={(e) => {
                const next = e.target.checked ? [...section.fields, f] : section.fields.filter((x: string) => x !== f);
                onUpdate({ fields: next });
              }} className="rounded" />
            <span className="text-xs text-stone-600">{{ name: '이름', phone: '연락처', attendance: '참석여부', meal: '식사', message: '메시지' }[f]}</span>
          </label>
        ))}
      </Field>
    </>
  );
}

function GuestbookProps({ section, onUpdate }: { section: any; onUpdate: any }) {
  return (
    <>
      <Field label="제목"><TextInput value={section.title ?? ''} onChange={(v) => onUpdate({ title: v })} /></Field>
      <Toggle checked={section.allowAnonymous} onChange={(v) => onUpdate({ allowAnonymous: v })} label="익명 작성 허용" />
    </>
  );
}

function ScheduleProps({ section, onUpdate }: { section: any; onUpdate: any }) {
  function addItem() {
    onUpdate({ items: [...section.items, { time: '', description: '' }] });
  }
  function updateItem(i: number, field: string, value: string) {
    const next = section.items.map((item: any, idx: number) => idx === i ? { ...item, [field]: value } : item);
    onUpdate({ items: next });
  }

  return (
    <>
      <Field label="제목"><TextInput value={section.title ?? ''} onChange={(v) => onUpdate({ title: v })} /></Field>
      {section.items.map((item: any, i: number) => (
        <div key={i} className="flex gap-2">
          <input value={item.time} onChange={(e) => updateItem(i, 'time', e.target.value)} placeholder="13:00"
            className="w-20 rounded-xl border border-stone-200 bg-stone-50 px-2 py-2 text-xs outline-none" />
          <input value={item.description} onChange={(e) => updateItem(i, 'description', e.target.value)} placeholder="순서"
            className="flex-1 rounded-xl border border-stone-200 bg-stone-50 px-2 py-2 text-xs outline-none" />
        </div>
      ))}
      <button onClick={addItem}
        className="w-full rounded-xl border border-dashed border-stone-300 py-2 text-xs font-semibold text-stone-400 hover:border-rose-300 hover:text-rose-400">
        + 순서 추가
      </button>
    </>
  );
}

function WishlistProps({ section, onUpdate }: { section: any; onUpdate: any }) {
  function addItem() {
    onUpdate({ items: [...section.items, { id: crypto.randomUUID(), name: '', price: undefined, url: '', reserved: false }] });
  }
  function updateItem(id: string, updates: object) {
    onUpdate({ items: section.items.map((i: any) => i.id === id ? { ...i, ...updates } : i) });
  }

  return (
    <>
      <Field label="제목"><TextInput value={section.title ?? ''} onChange={(v) => onUpdate({ title: v })} /></Field>
      {section.items.map((item: any) => (
        <div key={item.id} className="rounded-xl border border-stone-100 p-2 space-y-1.5">
          <TextInput value={item.name} onChange={(v) => updateItem(item.id, { name: v })} placeholder="선물 이름" />
          <input type="number" value={item.price ?? ''} onChange={(e) => updateItem(item.id, { price: Number(e.target.value) })}
            placeholder="가격 (원)"
            className="w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs outline-none" />
        </div>
      ))}
      <button onClick={addItem}
        className="w-full rounded-xl border border-dashed border-stone-300 py-2 text-xs font-semibold text-stone-400 hover:border-rose-300 hover:text-rose-400">
        + 항목 추가
      </button>
    </>
  );
}
