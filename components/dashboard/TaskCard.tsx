'use client';

import { TimelineTask } from '@/data/timelineTasks';

const CATEGORY_STYLE: Record<TimelineTask['category'], { bg: string; text: string; dot: string }> = {
  wedding:    { bg: 'bg-rose-50',   text: 'text-rose-600',   dot: 'bg-rose-400' },
  beauty:     { bg: 'bg-pink-50',   text: 'text-pink-600',   dot: 'bg-pink-400' },
  healthcare: { bg: 'bg-emerald-50',text: 'text-emerald-600',dot: 'bg-emerald-400' },
  admin:      { bg: 'bg-stone-50',  text: 'text-stone-500',  dot: 'bg-stone-400' },
};

const CATEGORY_LABEL: Record<TimelineTask['category'], string> = {
  wedding: '웨딩',
  beauty: '뷰티',
  healthcare: '건강관리',
  admin: '행정',
};

interface TaskCardProps {
  task: TimelineTask;
  onCTAClick?: () => void;
}

export default function TaskCard({ task, onCTAClick }: TaskCardProps) {
  const style = CATEGORY_STYLE[task.category];

  return (
    <div className={`rounded-xl p-4 ${style.bg}`}>
      <div className="mb-2 flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${style.dot}`} />
        <span className={`text-xs font-semibold ${style.text}`}>
          {CATEGORY_LABEL[task.category]}
        </span>
      </div>
      <p className="mb-1 text-sm font-semibold text-stone-800">{task.title}</p>
      <p className="text-xs text-stone-500">{task.description}</p>

      {task.hasCTA && onCTAClick && (
        <button
          onClick={onCTAClick}
          className="mt-3 text-xs font-semibold text-rose-500 hover:text-rose-700"
        >
          전문가 상담 받기 →
        </button>
      )}
    </div>
  );
}
