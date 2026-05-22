'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import MobilePreview from '@/components/invite/MobilePreview';
import DesignPanel from '@/components/invite/DesignPanel';
import ContentPanel from '@/components/invite/ContentPanel';
import AIPanel from '@/components/invite/AIPanel';
import ImageManagerModal from '@/components/invite/ImageManagerModal';
import { invitationTemplates } from '@/data/invitation-templates';
import type { Invitation, InvitationSection, InvitationTheme, PreviewDevice } from '@/types/invitation';
import { ArrowLeft, Save, Smartphone, Monitor, Play, Palette, LayoutList, Sparkles } from 'lucide-react';

import { useRouter } from 'next/navigation';

function makeDefaultInvitation(templateId?: string): Invitation {
  const tpl = templateId
    ? invitationTemplates.find((t) => t.id === templateId)
    : invitationTemplates[0];
  const base = tpl ?? invitationTemplates[0];
  return {
    id: crypto.randomUUID(),
    templateId: base.id,
    theme: {
      ...base.theme,
      bgmUrl: 'AboveTheTreetops.mp3',
      bgmAutoPlay: true,
      bgmLoop: true,
      bgmVolume: 50,
      bgmTitle: '인생의 회전목마',
      bgmArtist: 'Joe Hisaishi',
    },
    sections: base.defaultSections.map((s) => ({ ...s })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    published: false,
  };
}

export type EditorTab = 'design' | 'content' | 'ai';

interface InvitationBuilderProps {
  templateId?: string;
}

export default function InvitationBuilder({ templateId }: InvitationBuilderProps) {
  const router = useRouter();
  const [invitation, setInvitation] = useState<Invitation>(() => makeDefaultInvitation(templateId));
  const [activeTab, setActiveTab] = useState<EditorTab>('design');
  const [device, setDevice] = useState<PreviewDevice>('mobile');
  const [isSaving, setIsSaving] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | undefined>(undefined);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [showSaveAnimation, setShowSaveAnimation] = useState(false);

  // 컴포넌트 마운트 완료 후 클라이언트 사이드에서만 로컬스토리지 데이터를 안전하게 복구 및 마이그레이션
  useEffect(() => {
    const saved = localStorage.getItem('wedding_builder_sections');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const migratedSections = parsed.map((s) => {
            if (s.type === 'map') {
              return {
                ...s,
                showGoogleMap: s.showGoogleMap !== false,
                showNaverMap: s.showNaverMap !== false,
                showKakaoMap: s.showKakaoMap !== false
              };
            }
            return s;
          });
          setInvitation((prev) => ({
            ...prev,
            sections: migratedSections,
            updatedAt: new Date().toISOString()
          }));
        }
      } catch (e) {
        console.error('Error loading sections from localStorage:', e);
      }
    }
  }, []);

  // 1. sections 상태가 변경될 때마다 로컬스토리지의 'wedding_builder_sections' 키를 실시간 동기화
  useEffect(() => {
    localStorage.setItem('wedding_builder_sections', JSON.stringify(invitation.sections));
  }, [invitation.sections]);

  // 2. 모달창 등 외부에서 변경한 섹션 정보를 수신하여 React 상태와 즉각 동기화
  useEffect(() => {
    const handleSectionsChanged = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && Array.isArray(customEvent.detail.sections)) {
        setInvitation((prev) => ({
          ...prev,
          sections: customEvent.detail.sections,
          updatedAt: new Date().toISOString()
        }));
      }
    };
    window.addEventListener('wedding_builder_sections_changed', handleSectionsChanged);
    return () => {
      window.removeEventListener('wedding_builder_sections_changed', handleSectionsChanged);
    };
  }, []);

  /* ── 업데이트 로직 ── */
  const updateTheme = useCallback((updates: Partial<InvitationTheme>) => {
    setInvitation((prev) => ({ ...prev, theme: { ...prev.theme, ...updates } }));
  }, []);

  const updateSection = useCallback((sectionId: string, updates: Partial<InvitationSection>) => {
    setInvitation((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => s.id === sectionId ? { ...s, ...updates } as InvitationSection : s),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const addSection = useCallback((type: InvitationSection['type']) => {
    const id = crypto.randomUUID();
    const SECTION_LABELS: Record<string, string> = {
      cover: '메인 이미지', greeting: '인사말', datetime: '날짜/시간', timeline: '타임라인',
      map: '위치/지도', gallery: '갤러리', contact: '연락처', bankAccount: '계좌번호',
      guestbook: '방명록', wishlist: '위시리스트', notice: '안내사항', rsvp: '참석 여부',
      countdown: '카운트다운', closing: '마무리', intro: '신랑신부 소개', photoDrop: '포토 드롭',
      guestList: '참석자 목록', video: '영상 삽입', text: '텍스트'
    };
    const title = SECTION_LABELS[type] || '새 섹션';
    const newSection = { type, id, title } as any;
    setInvitation((prev) => ({ ...prev, sections: [...prev.sections, newSection] }));
    setExpandedSection(id);
  }, []);

  const removeSection = useCallback((sectionId: string) => {
    setInvitation((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId
          ? { ...s, items: [], images: [], interviews: [], content: '', isCleared: true } as any
          : s
      )
    }));
  }, []);

  const moveSection = useCallback((sectionId: string, direction: 'up' | 'down') => {
    setInvitation((prev) => {
      const idx = prev.sections.findIndex((s) => s.id === sectionId);
      const next = [...prev.sections];
      const swap = direction === 'up' ? idx - 1 : idx + 1;
      if (swap < 0 || swap >= next.length) return prev;
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return { ...prev, sections: next };
    });
  }, []);

  const reorderSections = useCallback((newSections: InvitationSection[]) => {
    setInvitation((prev) => ({ ...prev, sections: newSections, updatedAt: new Date().toISOString() }));
  }, []);

  const resetSections = useCallback(() => {
    const tpl = invitationTemplates.find((t) => t.id === invitation.templateId) ?? invitationTemplates[0];
    setInvitation((prev) => ({ ...prev, sections: tpl.defaultSections.map((s) => ({ ...s })) }));
  }, [invitation.templateId]);

  const handleSaveComplete = useCallback(() => {
    setShowSaveAnimation(false);
    setIsSaving(false);
  }, []);

  async function handleSave() {
    setIsSaving(true);
    setShowSaveAnimation(true);

    // 최종 청첩장 데이터를 로컬스토리지에 완벽 저장!
    localStorage.setItem('wedding_builder_invitation', JSON.stringify(invitation));
    localStorage.setItem('wedding_builder_sections', JSON.stringify(invitation.sections));

    setTimeout(() => {
      setIsSaving(false);
      setShowSaveAnimation(false);
      // 저장 완료 후, 프리미엄 결제 페이지로 자연스럽게 라우팅 시킵니다!
      router.push('/payment');
    }, 1200);
  }

  return (
    <div className="h-screen flex flex-col bg-[#F9FAFB] overflow-hidden">

      {/* ── 상단 툴바 (고정) ── */}
      <header className="h-14 shrink-0 flex items-center justify-between px-5 bg-white border-b border-[#F1F2F4] z-[100] shadow-sm">
        <div className="flex items-center gap-4">
          <Link href="/invite" className="flex items-center gap-2 px-3 py-1.5 -ml-1 text-[#111827] hover:bg-[#F3F4F6] rounded-lg transition-all">
            <ArrowLeft size={16} strokeWidth={2.5} />
            <span className="text-[14px] font-bold">뒤로가기</span>
          </Link>
        </div>

        {/* 중앙 컨트롤 제거됨 */}
        <div />

        <div>
          <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg text-[14px] font-bold transition-all active:scale-[0.98] shadow-sm">
            {isSaving ? (
              '저장 중...'
            ) : (
              <>
                <Save size={17} />
                <span>저장</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* ── 메인 스크롤 영역 ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="flex min-h-full p-6 gap-8 relative">

          {/* ── 좌측 사이드바 (투명 컨테이너 구조) ── */}
          <aside className="w-[680px] shrink-0 flex flex-col min-h-[1200px]">

            {/* 탭 메뉴 (개별 카드 형태가 아닌 패널 상단 고정 느낌) */}
            <div className="bg-white rounded-2xl border border-[#F1F2F4] shadow-sm overflow-hidden mb-6">
              <div className="flex border-b border-[#F1F2F4]">
                {[
                  { id: 'design', label: '디자인', icon: Palette },
                  { id: 'content', label: '콘텐츠', icon: LayoutList },
                  { id: 'ai', label: 'AI', icon: Sparkles }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id as any); setShowImageEditor(false); }}
                      className={`flex-1 py-4 text-[14px] font-bold transition-all relative flex items-center justify-center gap-2 ${activeTab === tab.id ? 'text-[#111827]' : 'text-[#9ca3af]'}`}
                    >
                      <Icon size={16} strokeWidth={2.5} className={activeTab === tab.id ? 'text-[#3B82F6]' : 'text-[#9ca3af]'} />
                      {tab.label}
                      {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#3B82F6]" />}
                    </button>
                  );
                })}
              </div>

              {/* 패널 내부 콘텐츠 (각 탭의 실제 내용) */}
              <div className="p-1 bg-[#F9FAFB]">
                {activeTab === 'design' && <DesignPanel theme={invitation.theme} onUpdate={updateTheme} />}
                {activeTab === 'content' && (
                  <ContentPanel
                    sections={invitation.sections}
                    onUpdate={updateSection}
                    onAdd={addSection}
                    onRemove={removeSection}
                    onMove={moveSection}
                    onReorder={reorderSections}
                    expandedId={expandedSection}
                    onExpand={setExpandedSection}
                    onReset={resetSections}
                  />
                )}
                {activeTab === 'ai' && <AIPanel sections={invitation.sections} onApply={(id, text) => updateSection(id, { text } as any)} />}
              </div>
            </div>

            {/* 좌측 패널 하단 저장 버튼 */}
            <div className="mt-2 pb-6 bg-transparent px-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-4 bg-[#4b5563] hover:bg-[#374151] text-white rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? '저장 중...' : (
                  <>
                    <Save size={18} />
                    <span>저장</span>
                  </>
                )}
              </button>
            </div>
          </aside>

          {/* ── 우측 미리보기 ── */}
          <main className="flex-1 flex justify-center items-start pt-0">
            <div className="sticky top-0">
              <MobilePreview
                invitation={invitation}
                device={device}
                onDeviceChange={setDevice}
                selectedSectionId={expandedSection}
                onSectionClick={(id) => { setExpandedSection(id); setActiveTab('content'); }}
                onUpdateTheme={updateTheme}
              />
            </div>
          </main>
        </div>
      </div>

      {/* ── 이미지 관리 모달 ── */}
      {showImageEditor && (
        <ImageManagerModal onClose={() => setShowImageEditor(false)} />
      )}

      {/* ── 저장 중 로딩 오버레이 (블러 없음) ── */}
      {isSaving && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
          <div className="bg-white px-8 py-6 rounded-2xl shadow-[0_10px_40px_rgb(0,0,0,0.12)] flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-200">
            <div className="w-8 h-8 border-4 border-[#F1F2F4] border-t-[#3B82F6] rounded-full animate-spin" />
            <p className="text-[15px] font-bold text-[#111827]">잠시만 기다려 주세요</p>
          </div>
        </div>
      )}
    </div>
  );
}
