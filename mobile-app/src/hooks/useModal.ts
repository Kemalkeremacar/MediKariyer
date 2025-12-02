/**
 * useModal Hook
 * Provides modal management functionality using global UI store
 */

import { useCallback } from 'react';
import { useUIStore } from '@/store/uiStore';

interface UseModalReturn {
  activeModal: string | null;
  modalData: any;
  openModal: (modalId: string, data?: any) => void;
  closeModal: () => void;
  isModalOpen: (modalId: string) => boolean;
}

/**
 * Hook for managing modals through global UI store
 * @returns Modal management functions and state
 */
export const useModal = (): UseModalReturn => {
  const activeModal = useUIStore((state) => state.activeModal);
  const modalData = useUIStore((state) => state.modalData);
  const openModalAction = useUIStore((state) => state.openModal);
  const closeModalAction = useUIStore((state) => state.closeModal);

  const openModal = useCallback(
    (modalId: string, data?: any) => {
      openModalAction(modalId, data);
    },
    [openModalAction]
  );

  const closeModal = useCallback(() => {
    closeModalAction();
  }, [closeModalAction]);

  const isModalOpen = useCallback(
    (modalId: string) => {
      return activeModal === modalId;
    },
    [activeModal]
  );

  return {
    activeModal,
    modalData,
    openModal,
    closeModal,
    isModalOpen,
  };
};
