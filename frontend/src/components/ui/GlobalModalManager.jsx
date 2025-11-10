/**
 * @file GlobalModalManager.jsx
 * @description Zustand store'dan açık modalları okuyup ilgili bileşenleri render eder.
 */

import React from 'react';
import ConfirmationModal from './ConfirmationModal';
import useUiStore from '@/store/uiStore';

const MODAL_COMPONENTS = {
  confirmation: ConfirmationModal,
};

const GlobalModalManager = () => {
  const modalOrder = useUiStore((state) => state.modalOrder);
  const modals = useUiStore((state) => state.modals);
  const closeModal = useUiStore((state) => state.closeModal);

  if (!modalOrder.length) return null;

  return modalOrder.map((modalId) => {
    const modalConfig = modals[modalId];
    if (!modalConfig?.open) return null;

    const ModalComponent = MODAL_COMPONENTS[modalId];
    if (!ModalComponent) return null;

    return (
      <ModalComponent
        key={modalId}
        modalId={modalId}
        config={modalConfig}
        closeModal={closeModal}
      />
    );
  });
};

export default GlobalModalManager;

