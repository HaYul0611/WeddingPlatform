'use client';

import { useState, useRef, useEffect } from 'react';
import type { InvitationSection } from '@/types/invitation';
import SectionEditor from './SectionEditor';
import ImagePickerModal from './ImagePickerModal';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import {
  Menu, ChevronDown, ChevronUp, Plus, Trash2, RotateCcw,
  Wand2,
  Image as ImageIcon,
  MessageSquare,
  Images,
  Calendar,
  MapPin,
  CreditCard,
  CheckCircle,
  MessageCircle,
  Gift,
  QrCode,
  Timer,
  Camera,
  Users,
  Info,
  Clock,
  Phone,
  Heart,
  Video,
  Type,
  Users2,
  Scissors
} from 'lucide-react';

interface SectionListProps {
  sections: InvitationSection[];
  onUpdate: (id: string, updates: Partial<InvitationSection>) => void;
  onAdd: (type: InvitationSection['type']) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
  onReorder: (sections: InvitationSection[]) => void;
  selectedId?: string;
  onSelect: (id: string | undefined) => void;
  onReset: () => void;
}

const SECTION_LABELS: Record<string, string> = {
  cover: '메인 이미지',
  greeting: '인사말',
  datetime: '날짜/시간',
  timeline: '타임라인',
  map: '위치/지도',
  gallery: '갤러리',
  contact: '연락처',
  bankAccount: '계좌번호',
  guestbook: '방명록',
  wishlist: '위시리스트',
  notice: '안내사항',
  rsvp: '참석 여부',
  countdown: '카운트다운',
  closing: '마무리',
  intro: '신랑신부 소개',
  photoDrop: '포토 드롭',
  guestList: '참석자 목록',
  video: '영상 삽입',
  text: '텍스트'
};

const SECTION_ICONS: Record<string, any> = {
  cover: ImageIcon,
  greeting: MessageSquare,
  datetime: Calendar,
  timeline: Clock,
  map: MapPin,
  gallery: Images,
  contact: Phone,
  bankAccount: CreditCard,
  guestbook: MessageCircle,
  wishlist: Gift,
  notice: Info,
  rsvp: CheckCircle,
  countdown: Timer,
  closing: Heart,
  intro: Users,
  photoDrop: Camera,
  guestList: Users2,
  video: Video,
  text: Type
};

// 드롭다운에 표시될 전체 목록 (이미지 참조 1번과 동일한 순서)
const NAV_LIST: InvitationSection['type'][] = [
  'cover', 'greeting', 'datetime', 'timeline', 'map', 'gallery', 'contact', 'bankAccount', 'guestbook', 'wishlist', 'notice', 'rsvp', 'countdown', 'closing', 'intro', 'photoDrop', 'guestList', 'video', 'text'
];

/* ── 개별 정렬 가능 아이템 컴포넌트 ── */
function SortableItem({
  section,
  idx,
  displayName,
  isExpanded,
  onSelect,
  onRemove,
  onUpdate
}: {
  section: InvitationSection;
  idx: number;
  displayName: string;
  isExpanded: boolean;
  onSelect: (id: string | undefined) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: any) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : (isExpanded ? 100 : 1),
    position: 'relative' as any,
  };

  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isExpanded && itemRef.current) {
      // 펼쳐질 때 헤더가 화면 최상단에 붙지 않도록 약간의 여백을 두고 스크롤
      const element = itemRef.current;
      const offset = 80; // 상단 여백
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, [isExpanded]);

  const isCleared = !!(section as any).isCleared;
  const Icon = SECTION_ICONS[section.type] || ImageIcon;

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        (itemRef as any).current = node;
      }}
      style={style}
      className={`group flex flex-col transition-all border rounded-2xl bg-white ${isCleared
        ? 'opacity-65 bg-stone-50 border-dashed border-stone-300'
        : isExpanded
          ? 'border-[#3B82F6] shadow-lg ring-4 ring-[#3B82F6]/5 mb-2'
          : 'border-[#E5E7EB] hover:border-[#3B82F6]/30'
        } ${isDragging ? 'opacity-50' : ''}`}
    >
      <div
        onClick={() => {
          if (isCleared) return;
          onSelect(isExpanded ? undefined : section.id);
        }}
        className={`flex items-center justify-between p-4 cursor-pointer transition-all ${isExpanded && !isCleared ? 'bg-[#EFF6FF]/30 border-b border-[#F1F2F4]' : ''
          }`}
      >
        <div className="flex items-center gap-3">
          <div
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            className={`flex items-center gap-1.5 p-1 px-1.5 rounded-lg hover:bg-[#F3F4F6] transition-all duration-200 cursor-grab active:cursor-grabbing group/handle ${isCleared ? 'pointer-events-none opacity-40' : ''}`}
          >
            <Menu size={16} className="text-[#D1D5DB] group-hover/handle:text-[#3B82F6] transition-colors" />
            <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-black ${isCleared ? 'bg-stone-200 text-stone-500' : 'bg-[#EFF6FF] text-[#3B82F6]'} shadow-sm`}>
              {idx}
            </div>
          </div>

          <div className="flex items-center gap-2.5 ml-1">
            <Icon size={18} className={isCleared ? 'text-stone-400' : 'text-[#4B5563]'} strokeWidth={2.5} />
            <span className={`text-[13px] font-bold ${isCleared ? 'text-stone-400 line-through font-medium' : isExpanded ? 'text-[#111827]' : 'text-[#374151]'}`}>
              {displayName}
            </span>
            {isCleared && (
              <span className="text-[10px] font-extrabold text-stone-500 px-2 py-0.5 rounded-md bg-stone-200/80 ml-1.5 tracking-tight">비활성화됨</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isCleared ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUpdate(section.id, { isCleared: false });
              }}
              className="p-1.5 rounded-lg bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#3B82F6] hover:text-[#2563EB] transition-all duration-200 flex items-center justify-center shadow-sm"
              title="다시 활성화하기"
            >
              <Plus size={16} strokeWidth={3} />
            </button>
          ) : (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onRemove(section.id); }}
                className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 hover:text-red-600 transition-colors"
                title="비활성화하기"
              >
                <Trash2 size={16} strokeWidth={2} />
              </button>
              {isExpanded ? <ChevronUp size={18} className="text-[#3B82F6]" /> : <ChevronDown size={18} className="text-[#D1D5DB]" />}
            </>
          )}
        </div>
      </div>

      {isExpanded && !isCleared && (
        <div className="bg-white p-5 animate-in slide-in-from-top-2 duration-300 rounded-b-2xl">
          <SectionEditor
            section={section}
            onUpdate={(updates: any) => onUpdate(section.id, updates)}
          />
        </div>
      )}
    </div>
  );
}

export default function SectionList({
  sections,
  onUpdate,
  onAdd,
  onRemove,
  onMove,
  onReorder,
  selectedId,
  onSelect,
  onReset
}: SectionListProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);
  const [uploadedImagesCount, setUploadedImagesCount] = useState(0);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  useEffect(() => {
    // 초기 로드 시 개수 및 이미지 목록 가져오기
    const saved = localStorage.getItem('wedding_builder_uploaded_images');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setUploadedImagesCount(parsed.length);
          setUploadedImages(parsed);
        }
      } catch (e) {
        console.error(e);
      }
    }

    // 모달에서 업로드/삭제가 일어났을 때 개수 및 이미지 목록을 수신하는 이벤트 리스너 등록
    const handleUploadedImagesChanged = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && Array.isArray(customEvent.detail.images)) {
        setUploadedImagesCount(customEvent.detail.images.length);
        setUploadedImages(customEvent.detail.images);
      }
    };

    window.addEventListener('uploaded-images-changed', handleUploadedImagesChanged);
    return () => {
      window.removeEventListener('uploaded-images-changed', handleUploadedImagesChanged);
    };
  }, []);

  const handleOpenImagePicker = () => {
    const collectedInUse: string[] = [];
    sections.forEach(sec => {
      const s = sec as any;
      if (s.image) collectedInUse.push(s.image);
      if (s.image2) collectedInUse.push(s.image2);
      if (s.mobileImage) collectedInUse.push(s.mobileImage);
      if (s.mapImage) collectedInUse.push(s.mapImage);
      if (s.images && Array.isArray(s.images)) {
        s.images.forEach((img: any) => {
          if (typeof img === 'string') collectedInUse.push(img);
          else if (img && img.url) collectedInUse.push(img.url);
        });
      }
    });

    const event = new CustomEvent('open-image-picker', {
      detail: {
        onSelect: () => { },
        inUseImages: collectedInUse
      }
    });
    window.dispatchEvent(event);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      onReorder(arrayMove(sections, oldIndex, newIndex));
    }
  };
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) {
        setShowAddMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 프리미엄 업그레이드 여부에 따른 동적 한도 설정 (기본 5개, 프리미엄 50개)
  const isPremium = typeof window !== 'undefined' && localStorage.getItem('wedding_builder_is_premium') === 'true';
  const maxImages = isPremium ? 50 : 5;
  const progressPercentage = Math.min((uploadedImagesCount / maxImages) * 100, 100);

  // 게이지 바 컬러 동적 필터 적용 (70% 미만: 시원한 파란색, 70%~100% 미만: 경고 주황, 100% 이상: 초과 빨강)
  let gaugeColor = 'bg-[#3B82F6]';
  if (progressPercentage >= 100) {
    gaugeColor = 'bg-[#EF4444]';
  } else if (progressPercentage >= 70) {
    gaugeColor = 'bg-[#F59E0B]';
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 가로 스크롤바 히든 처리용 스타일 태그 안전 주입 */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar-hide::-webkit-scrollbar {
          display: none !important;
        }
        .custom-scrollbar-hide {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}} />

      {/* 1. 이미지 관리 카드 (스냅포스트 스타일 완벽 재현) */}
      <div className="bg-white border border-[#E5E7EB] rounded-3xl p-5 shadow-sm transition-all duration-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <ImageIcon size={18} className="text-[#374151]" strokeWidth={2.5} />
            <span className="text-[13px] font-black text-[#111827]">{uploadedImagesCount}/{maxImages} 이미지</span>
          </div>
          <button
            onClick={handleOpenImagePicker}
            className="flex items-center gap-1.5 text-[11px] font-bold text-[#3B82F6] bg-[#EFF6FF] border border-[#EFF6FF] px-3.5 py-1.5 rounded-full hover:bg-[#DBEAFE] hover:border-[#BFDBFE] transition-all duration-200"
          >
            <Scissors size={11} strokeWidth={2.5} className="rotate-90" />
            이미지편집
          </button>
        </div>

        {uploadedImagesCount > 0 ? (
          <div
            onClick={handleOpenImagePicker}
            className="flex items-center gap-3 overflow-x-auto py-1 cursor-pointer custom-scrollbar-hide"
          >
            {uploadedImages.map((url, idx) => (
              <div key={idx} className="w-[64px] h-[64px] rounded-2xl overflow-hidden border border-[#E5E7EB] shrink-0 shadow-sm hover:scale-102 transition-transform duration-200 bg-slate-900 flex items-center justify-center">
                <img src={url} className="w-full h-full object-cover" alt="" />
              </div>
            ))}
          </div>
        ) : (
          <div
            onClick={handleOpenImagePicker}
            className="h-24 bg-[#F9FAFB] rounded-2xl border-2 border-dashed border-[#E5E7EB] flex flex-col items-center justify-center gap-2 hover:border-[#3B82F6]/50 hover:bg-[#EFF6FF]/50 transition-all cursor-pointer group"
          >
            <ImageIcon size={22} className="text-[#D1D5DB] group-hover:text-[#3B82F6] transition-colors" />
            <span className="text-[12px] font-black text-[#D1D5DB] group-hover:text-[#3B82F6] transition-colors">이미지 업로드</span>
          </div>
        )}

        <div className="mt-4 w-full h-[6px] bg-[#E5E7EB] rounded-full overflow-hidden">
          <div
            className={`h-full ${gaugeColor} transition-all duration-500`}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <div className="mt-2 text-[11px] font-bold text-[#FF5E3A] leading-none">
          프리미엄 업그레이드 시 사진 50장까지
        </div>
      </div>

      {/* 2. 통합 섹션 관리 카드 */}
      <div className="bg-white border border-[#E5E7EB] rounded-3xl shadow-sm overflow-hidden p-6 flex flex-col gap-6">
        {/* 섹션 구성 헤더 */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-black text-[#111827]">섹션 구성</h3>
            <div className="flex items-center gap-3 relative">
              <button
                onClick={onReset}
                className="text-[12px] font-bold text-[#9ca3af] hover:text-[#111827] flex items-center gap-1 transition-colors"
              >
                <RotateCcw size={14} /> 초기화
              </button>
              <button
                onClick={() => setShowAddMenu(!showAddMenu)}
                className="w-7 h-7 bg-[#3B82F6] rounded-full flex items-center justify-center text-white shadow-sm hover:scale-105 transition-all"
                title="섹션 바로가기"
              >
                <Plus size={18} strokeWidth={3} />
              </button>

              {/* 섹션 바로가기 드롭다운 (이미지 1번 풀 목록 반영) */}
              {showAddMenu && (
                <div
                  ref={addMenuRef}
                  className="absolute top-full right-0 mt-2 w-56 bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl z-[200] py-2 animate-in fade-in zoom-in-95 duration-200"
                >
                  <div className="max-h-[380px] overflow-y-auto font-list-scrollbar px-1">
                    <style jsx>{`
                      .font-list-scrollbar::-webkit-scrollbar {
                        width: 6px;
                      }
                      .font-list-scrollbar::-webkit-scrollbar-track {
                        background: transparent;
                      }
                      .font-list-scrollbar::-webkit-scrollbar-thumb {
                        background: #E5E7EB;
                        border-radius: 10px;
                      }
                      .font-list-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: #D1D5DB;
                      }
                    `}</style>
                    {NAV_LIST.map((type) => {
                      const Icon = SECTION_ICONS[type] || ImageIcon;
                      const targetSection = sections.find(s => s.type === type);

                      return (
                        <button
                          key={type}
                          onClick={() => {
                            onAdd(type);
                            setShowAddMenu(false);
                          }}
                          className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-[#F9FAFB] transition-colors group"
                        >
                          <Icon size={16} className="text-[#9ca3af] group-hover:text-[#3B82F6]" />
                          <span className="text-[13px] font-bold text-[#4B5563] group-hover:text-[#111827]">
                            {SECTION_LABELS[type]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
          <p className="text-[12px] text-[#6b7280]">드래그하여 순서를 변경하거나 섹션을 편집하세요</p>
        </div>

        {/* 섹션 목록 (Sortable 적용) */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sections.map(s => s.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col gap-3">
              {(() => {
                const typeCounters: Record<string, number> = {};
                const typeTotalCounts: Record<string, number> = {};
                sections.forEach(s => {
                  typeTotalCounts[s.type] = (typeTotalCounts[s.type] || 0) + 1;
                });

                return sections.map((section, idx) => {
                  typeCounters[section.type] = (typeCounters[section.type] || 0) + 1;
                  const currentCount = typeCounters[section.type];
                  const totalCount = typeTotalCounts[section.type];
                  const baseLabel = SECTION_LABELS[section.type] || section.type;
                  const displayName = totalCount > 1 ? `${baseLabel}(${currentCount})` : baseLabel;

                  return (
                    <SortableItem
                      key={section.id}
                      section={section}
                      idx={idx}
                      displayName={displayName}
                      isExpanded={selectedId === section.id}
                      onSelect={onSelect}
                      onRemove={onRemove}
                      onUpdate={onUpdate}
                    />
                  );
                });
              })()}
            </div>
          </SortableContext>
        </DndContext>
      </div>
      <ImagePickerModal />
    </div>
  );
}
