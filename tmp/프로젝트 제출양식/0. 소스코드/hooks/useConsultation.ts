'use client';

import { useState, useCallback } from 'react';
import { ConsultationCategory } from '@/types/consultation';

interface ConsultationState {
  isOpen: boolean;
  sourcePage: string;
  defaultCategory: ConsultationCategory;
}

interface UseConsultationReturn extends ConsultationState {
  openModal: (sourcePage: string, category?: ConsultationCategory) => void;
  closeModal: () => void;
}

const DEFAULT_STATE: ConsultationState = {
  isOpen: false,
  sourcePage: 'unknown',
  defaultCategory: 'wedding',
};

/**
 * 상담 모달 상태를 관리하는 커스텀 훅.
 * 어느 컴포넌트에서든 openModal(sourcePage, category) 호출로 모달을 트리거할 수 있습니다.
 *
 * @example
 * const { isOpen, openModal, closeModal, sourcePage, defaultCategory } = useConsultation();
 * <button onClick={() => openModal('dashboard', 'wedding')}>상담 신청</button>
 * <ConsultationModal isOpen={isOpen} onClose={closeModal} sourcePage={sourcePage} defaultCategory={defaultCategory} />
 */
export function useConsultation(): UseConsultationReturn {
  const [state, setState] = useState<ConsultationState>(DEFAULT_STATE);

  const openModal = useCallback(
    (sourcePage: string, category: ConsultationCategory = 'wedding') => {
      setState({ isOpen: true, sourcePage, defaultCategory: category });
    },
    [],
  );

  const closeModal = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return { ...state, openModal, closeModal };
}
