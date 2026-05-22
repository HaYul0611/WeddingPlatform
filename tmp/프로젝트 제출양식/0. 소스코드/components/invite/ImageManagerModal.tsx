'use client';

import { useState } from 'react';
import { X, Upload, Wand2, ImagePlus, Square, Image as ImageIcon } from 'lucide-react';

interface ImageManagerModalProps {
  onClose: () => void;
}

export default function ImageManagerModal({ onClose }: ImageManagerModalProps) {
  const [isSharpen, setIsSharpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'used' | 'unused'>('all');

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[500px] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#F1F2F4]">
          <div className="flex items-center gap-2">
            <ImageIcon size={20} strokeWidth={2.5} className="text-[#111827]" />
            <h2 className="text-[18px] font-bold text-[#111827]">이미지 관리</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#9ca3af] hover:text-[#111827] hover:bg-[#F3F4F6] rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col gap-6">

          {/* Upload Area */}
          <div className="w-full py-8 border-2 border-dashed border-[#E5E7EB] rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-[#3B82F6] hover:bg-[#EFF6FF]/30 transition-colors group">
            <div className="w-12 h-12 mb-3 text-[#9ca3af] group-hover:text-[#3B82F6] transition-colors flex items-center justify-center">
              <Upload size={32} strokeWidth={1.5} />
            </div>
            <p className="text-[15px] font-bold text-[#374151] mb-1">여기에 이미지를 드래그하거나 클릭하세요</p>
            <p className="text-[13px] text-[#9ca3af]">여러 파일을 한 번에 선택할 수 있습니다</p>
          </div>

          {/* Sharpen Toggle */}
          <div className="flex items-center justify-between p-4 bg-[#F9FAFB] rounded-xl border border-[#F1F2F4]">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#F5F3FF] rounded-lg text-[#8B5CF6]">
                <Wand2 size={18} strokeWidth={2.5} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-bold text-[#374151]">선명하게</span>
                <span className="text-[13px] text-[#9ca3af]">윤곽을 또렷하게</span>
              </div>
            </div>
            <button
              onClick={() => setIsSharpen(!isSharpen)}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${isSharpen ? 'bg-[#3B82F6]' : 'bg-[#E5E7EB]'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm absolute transition-transform ${isSharpen ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
            </button>
          </div>

          {/* Tabs and Counter */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-1.5 rounded-full text-[13px] font-bold transition-colors ${activeTab === 'all' ? 'bg-[#EFF6FF] text-[#3B82F6]' : 'text-[#6B7280] hover:bg-[#F3F4F6]'}`}
              >
                전체
              </button>
              <button
                onClick={() => setActiveTab('used')}
                className={`px-4 py-1.5 rounded-full text-[13px] font-bold transition-colors ${activeTab === 'used' ? 'bg-[#EFF6FF] text-[#3B82F6]' : 'text-[#6B7280] hover:bg-[#F3F4F6]'}`}
              >
                사용 중
              </button>
              <button
                onClick={() => setActiveTab('unused')}
                className={`px-4 py-1.5 rounded-full text-[13px] font-bold transition-colors ${activeTab === 'unused' ? 'bg-[#EFF6FF] text-[#3B82F6]' : 'text-[#6B7280] hover:bg-[#F3F4F6]'}`}
              >
                미사용
              </button>
            </div>
            <span className="text-[13px] text-[#9ca3af] font-medium">0/5 이미지</span>
          </div>

          {/* Empty State */}
          <div className="py-12 flex flex-col items-center justify-center">
            <ImagePlus size={48} strokeWidth={1.5} className="text-[#D1D5DB] mb-4" />
            <p className="text-[15px] font-bold text-[#6B7280] mb-2">사진을 추가해보세요</p>
            <p className="text-[13px] text-[#9CA3AF]">위 영역에 이미지를 드래그하거나 클릭하여 업로드하세요</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[#F1F2F4] bg-white">
          <button className="flex items-center gap-2 text-[#4B5563] hover:text-[#111827] transition-colors">
            <Square size={18} className="text-[#D1D5DB]" />
            <span className="text-[14px] font-medium">선택 해제</span>
          </button>
        </div>

      </div>
    </div>
  );
}
