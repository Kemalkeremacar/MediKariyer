/**
 * Confirmation Modal Component
 * Gelişmiş onay modalı bileşeni
 * Keyboard support, animasyonlar, dark mode ve erişilebilirlik özellikleri içerir
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';
import useUiStore from '../../store/uiStore';

/**
 * Icon mapping dictionary
 */
const ICONS = {
  danger: <AlertTriangle className="h-16 w-16 text-red-500" />,
  success: <CheckCircle className="h-16 w-16 text-green-500" />,
  warning: <AlertCircle className="h-16 w-16 text-yellow-500" />,
  info: <Info className="h-16 w-16 text-blue-500" />,
};

/**
 * Button style mapping dictionary
 */
const BUTTON_STYLES = {
  danger: {
    confirm: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white',
    cancel: 'bg-gray-300 hover:bg-gray-400 focus:ring-gray-500 text-gray-800',
  },
  success: {
    confirm: 'bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white',
    cancel: 'bg-gray-300 hover:bg-gray-400 focus:ring-gray-500 text-gray-800',
  },
  warning: {
    confirm: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500 text-white',
    cancel: 'bg-gray-300 hover:bg-gray-400 focus:ring-gray-500 text-gray-800',
  },
  info: {
    confirm: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white',
    cancel: 'bg-gray-300 hover:bg-gray-400 focus:ring-gray-500 text-gray-800',
  },
};

/**
 * Modal boyut ayarları
 */
const MODAL_SIZES = {
  small: 'max-w-sm',
  medium: 'max-w-md',
  large: 'max-w-lg',
  xlarge: 'max-w-xl',
};

/**
 * ConfirmationModal Component
 */
const ConfirmationModal = () => {
  const { modals, closeModal } = useUiStore();
  const confirmationModal = modals.confirmation;
  const modalRef = useRef(null);
  const confirmButtonRef = useRef(null);
  const cancelButtonRef = useRef(null);

  // Confirm ve Cancel handler'ları
  const handleConfirm = useCallback(() => {
    if (confirmationModal?.props?.onConfirm) {
      confirmationModal.props.onConfirm();
    }
    closeModal('confirmation');
  }, [confirmationModal?.props?.onConfirm, closeModal]);

  const handleCancel = useCallback(() => {
    if (confirmationModal?.props?.onCancel) {
      confirmationModal.props.onCancel();
    }
    closeModal('confirmation');
  }, [confirmationModal?.props?.onCancel, closeModal]);

  // Hook'ları her zaman çağır, koşullu return'den önce
  useEffect(() => {
    // Modal açık değilse event listener'ları ekleme
    if (!confirmationModal?.open) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        handleCancel();
      } else if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleConfirm();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    
    // Focus management
    if (confirmButtonRef.current) {
      confirmButtonRef.current.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [confirmationModal?.open, handleConfirm, handleCancel]);

  // Modal açık değilse render etme
  if (!confirmationModal?.open) {
    return null;
  }

  const {
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Onayla',
    cancelText = 'İptal',
    type = 'info',
    size = 'medium',
    closeOnBackdrop = true,
    destructive = false,
  } = confirmationModal.props;

  // Icon ve button style'ları al
  const icon = ICONS[type] || ICONS.info;
  const buttonStyles = BUTTON_STYLES[type] || BUTTON_STYLES.info;
  const modalSize = MODAL_SIZES[size] || MODAL_SIZES.medium;

  // Destructive mod için özel styling
  const destructiveStyles = destructive ? {
    icon: <AlertTriangle className="h-20 w-20 text-red-600" />,
    confirmButton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white text-lg px-10 py-4',
  } : {};

  // Backdrop click handler
  const handleBackdropClick = (event) => {
    if (closeOnBackdrop && event.target === event.currentTarget) {
      handleCancel();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="bg-slate-800/95 rounded-3xl border border-white/20 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="p-8">
            {/* Close Button */}
            <button
              onClick={handleCancel}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 rounded-full p-1"
              aria-label="Modalı kapat"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Content */}
            <div className="text-center">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                {destructive ? destructiveStyles.icon : icon}
              </div>

              {/* Title */}
              <h3 
                id="modal-title"
                className="text-2xl font-bold text-white mb-4"
              >
                {title}
              </h3>

              {/* Message */}
              <p 
                id="modal-description"
                className="text-lg text-gray-300 mb-8 leading-relaxed"
              >
                {message}
              </p>

              {/* Buttons */}
              <div className="flex space-x-4 justify-center">
                {/* Cancel Button */}
                <button
                  ref={cancelButtonRef}
                  onClick={handleCancel}
                  className="px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 bg-white/10 border border-white/20 text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  aria-label="İşlemi iptal et"
                >
                  {cancelText}
                </button>

                {/* Confirm Button */}
                <button
                  ref={confirmButtonRef}
                  onClick={handleConfirm}
                  className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${destructive ? destructiveStyles.confirmButton : buttonStyles.confirm}`}
                  aria-label="İşlemi onayla"
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;