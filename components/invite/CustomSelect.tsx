'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface CustomSelectProps {
  value: string;
  options: { id: string; name: string; preview?: string; extra?: string }[];
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}

export const CustomSelect = ({
  value,
  options,
  onChange,
  placeholder = '선택하세요',
  className = ''
}: CustomSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find(o => o.id === value);

  return (
    <div className={`relative ${className}`}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 bg-white border rounded-xl text-[13px] text-[#111827] flex justify-between items-center cursor-pointer transition-all ${isOpen ? 'border-[#3B82F6] ring-2 ring-[#3B82F6]/10' : 'border-[#E5E7EB] hover:border-[#3B82F6]'}`}
      >
        <span className="font-medium">{selectedOption?.name || placeholder}</span>
        <ChevronDown size={16} className={`text-[#9ca3af] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 w-full bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl z-[9999] mt-1 max-h-[320px] overflow-y-auto font-list-scrollbar py-1 animate-in fade-in zoom-in-95 duration-200">
            {options.map(option => (
              <div
                key={option.id}
                onClick={() => { onChange(option.id); setIsOpen(false); }}
                className={`px-5 py-2.5 hover:bg-[#F9FAFB] cursor-pointer border-b border-[#F1F2F4] last:border-0 flex flex-col gap-0.5 transition-colors group/opt ${value === option.id ? 'bg-[#EFF6FF]/50' : ''}`}
              >
                <span className={`text-[9.5px] font-bold transition-colors ${value === option.id ? 'text-[#3B82F6]' : 'text-[#9ca3af] group-hover/opt:text-[#3B82F6]'}`}>{option.id.toUpperCase()}</span>
                <span className={`text-[14px] font-semibold leading-tight ${value === option.id ? 'text-[#3B82F6] font-bold' : 'text-[#111827]'}`}>{option.name}</span>
                {option.extra && <span className="text-[10px] text-[#9ca3af]">{option.extra}</span>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
