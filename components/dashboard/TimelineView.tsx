'use client';

import { useMemo } from 'react';
import { timelineTasks, TimelineTask } from '@/data/timelineTasks';
import TaskCard from './TaskCard';

type Milestone = TimelineTask['milestone'];

const MILESTONES: { key: Milestone; label: string; minDday: number }[] = [
  { key: 'D-90', label: 'D-90 · 준비 시작',    minDday: 60 },
  { key: 'D-60', label: 'D-60 · 본격 준비',    minDday: 30 },
  { key: 'D-30', label: 'D-30 · 마무리 단계',  minDday: 14 },
  { key: 'D-14', label: 'D-14 · 최종 점검',    minDday: 7 },
  { key: 'D-7',  label: 'D-7 · 컨디션 관리',   minDday: 0 },
];

interface TimelineViewProps {
  dday: number;
  onCTAClick: (milestone: Milestone) => void;
}

export default function TimelineView({ dday, onCTAClick }: TimelineViewProps) {
  // 현재 D-Day 기준 활성 마일스톤 계산
  const activeMilestone = useMemo<Milestone>(() => {
    if (dday >= 90) return 'D-90';
    if (dday >= 60) return 'D-60';
    if (dday >= 30) return 'D-30';
    if (dday >= 14) return 'D-14';
    return 'D-7';
  }, [dday]);

  const tasksByMilestone = useMemo(() => {
    return timelineTasks.reduce<Record<Milestone, TimelineTask[]>>(
      (acc, task) => {
        if (!acc[task.milestone]) acc[task.milestone] = [];
        acc[task.milestone].push(task);
        return acc;
      },
      {} as Record<Milestone, TimelineTask[]>,
    );
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-stone-800">준비 타임라인</h2>

      {MILESTONES.map(({ key, label }) => {
        const isActive = key === activeMilestone;
        const isPast = MILESTONES.findIndex((m) => m.key === key) <
          MILESTONES.findIndex((m) => m.key === activeMilestone);
        const tasks = tasksByMilestone[key] ?? [];

        return (
          <div key={key}>
            {/* 마일스톤 헤더 */}
            <div className="mb-3 flex items-center gap-3">
              <div
                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold
                  ${isActive ? 'bg-rose-500 text-white' : isPast ? 'bg-stone-200 text-stone-400' : 'bg-stone-100 text-stone-400'}`}
              >
                {isPast ? '✓' : ''}
              </div>
              <span
                className={`text-sm font-semibold ${isActive ? 'text-rose-600' : isPast ? 'text-stone-400 line-through' : 'text-stone-500'}`}
              >
                {label}
                {isActive && (
                  <span className="ml-2 rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-500">
                    현재 단계
                  </span>
                )}
              </span>
            </div>

            {/* 태스크 카드 (현재 마일스톤만 펼침) */}
            {isActive && (
              <div className="ml-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onCTAClick={() => onCTAClick(key)}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
