'use client';

import { FlaskConical, X } from './Icons';

interface DemoModeBannerProps {
  onDisable: () => void;
}

export default function DemoModeBanner({ onDisable }: DemoModeBannerProps) {
  return (
    <div className="flex items-center justify-between bg-indigo-600 px-4 py-2.5 text-white sm:px-6">
      <div className="flex items-center gap-2.5">
        <FlaskConical size={15} className="shrink-0 opacity-90" />
        <p className="text-sm font-medium">
          Demo Mode 활성화됨 &mdash; 실제 데이터가 아닌 샘플 데이터를 표시하고 있습니다.
        </p>
      </div>
      <button
        onClick={onDisable}
        className="ml-4 shrink-0 rounded-lg p-1 opacity-80 transition-opacity hover:opacity-100"
        aria-label="데모 모드 해제"
      >
        <X size={15} />
      </button>
    </div>
  );
}
