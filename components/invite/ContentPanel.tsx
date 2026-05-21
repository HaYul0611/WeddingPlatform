'use client';

import { useState } from 'react';
import type { InvitationSection } from '@/types/invitation';
import SectionList from './SectionList';
import SectionEditor from './SectionEditor';

interface ContentPanelProps {
  sections: InvitationSection[];
  expandedId?: string;
  onExpand: (id: string | undefined) => void;
  onUpdate: (id: string, updates: Partial<InvitationSection>) => void;
  onAdd: (type: InvitationSection['type']) => void;
  onRemove: (id: string) => void;
  onMove: (id: string, dir: 'up' | 'down') => void;
  onReorder: (sections: InvitationSection[]) => void;
  onReset: () => void;
  selectedId?: string;
  onImageEdit?: () => void;
}

export default function ContentPanel({
  sections, expandedId, onExpand, onUpdate, onAdd, onRemove, onMove, onReorder, onReset, selectedId, onImageEdit,
}: ContentPanelProps) {
  return (
    <div className="flex flex-col h-full bg-[#F9FAFB] animate-in fade-in duration-300">
      <SectionList
        sections={sections}
        selectedId={expandedId}
        onSelect={onExpand}
        onAdd={onAdd}
        onRemove={onRemove}
        onMove={onMove}
        onReorder={onReorder}
        onUpdate={onUpdate}
        onReset={onReset}
      />
    </div>
  );
}
