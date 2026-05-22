'use client';

interface SuccessMessageProps {
  onClose?: () => void;
}

export default function SuccessMessage({ onClose }: SuccessMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
      {/* 아이콘 */}
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-rose-50">
        <svg
          className="h-10 w-10 text-rose-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      {/* 메인 메시지 */}
      <h3 className="mb-2 text-xl font-semibold text-stone-800">
        상담 신청이 완료되었습니다
      </h3>
      <p className="mb-1 text-sm text-stone-500">
        입력하신 연락처로 <span className="font-medium text-stone-700">48시간 이내</span>에 연락드리겠습니다.
      </p>
      <p className="mb-8 text-sm text-stone-400">
        상담 전, 아래 콘텐츠를 참고하시면 더욱 도움이 됩니다.
      </p>

      {/* 다음 액션 유도 */}
      <div className="mb-8 w-full rounded-2xl bg-stone-50 p-5 text-left">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-stone-400">
          다음 단계
        </p>
        <ul className="space-y-3">
          {NEXT_STEPS.map((step) => (
            <li key={step.label} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-rose-100 text-xs font-bold text-rose-500">
                {step.index}
              </span>
              <div>
                <p className="text-sm font-medium text-stone-700">{step.label}</p>
                <p className="text-xs text-stone-400">{step.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* 닫기 버튼 */}
      {onClose && (
        <button
          onClick={onClose}
          className="w-full rounded-xl bg-rose-500 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-rose-600 active:bg-rose-700"
        >
          확인
        </button>
      )}
    </div>
  );
}

const NEXT_STEPS = [
  {
    index: 1,
    label: '연락처를 확인해 주세요',
    description: '담당자가 입력하신 번호로 직접 연락드립니다.',
  },
  {
    index: 2,
    label: 'D-Day 대시보드를 활용해 보세요',
    description: '결혼 준비 타임라인을 미리 확인할 수 있습니다.',
  },
  {
    index: 3,
    label: '건강 관리 루틴을 확인해 보세요',
    description: '웨딩 전 컨디션 관리에 도움이 되는 정보를 제공합니다.',
  },
];
