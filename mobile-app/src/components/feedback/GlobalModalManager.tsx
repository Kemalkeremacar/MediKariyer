/**
 * Global Modal Manager
 * Manages modals through the UI store
 */

import React from 'react';
import { useUIStore } from '@/store/uiStore';
import { Modal } from '@/components/ui/Modal';

interface ModalConfig {
  id: string;
  title?: string;
  content: React.ReactNode;
  onClose?: () => void;
}

// Registry of available modals
const modalRegistry: Record<string, (data: any) => ModalConfig> = {};

/**
 * Register a modal configuration
 */
export const registerModal = (
  id: string,
  configFactory: (data: any) => ModalConfig
): void => {
  modalRegistry[id] = configFactory;
};

/**
 * Global Modal Manager Component
 */
export const GlobalModalManager: React.FC = () => {
  const { activeModal, modalData, closeModal } = useUIStore();

  if (!activeModal || !modalRegistry[activeModal]) {
    return null;
  }

  const modalConfig = modalRegistry[activeModal](modalData);

  const handleClose = () => {
    if (modalConfig.onClose) {
      modalConfig.onClose();
    }
    closeModal();
  };

  return (
    <Modal
      visible={true}
      onClose={handleClose}
      title={modalConfig.title}
    >
      {modalConfig.content}
    </Modal>
  );
};

/**
 * Hook to use modal functionality
 */
export const useGlobalModal = () => {
  const { openModal, closeModal } = useUIStore();

  return {
    openModal,
    closeModal,
  };
};
