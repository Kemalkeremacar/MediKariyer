/**
 * @file ConfirmationModal.jsx
 * @description Onay Modal Bileşeni - Gelişmiş kullanıcı onay dialogları için merkezi modal sistemi
 * 
 * Bu bileşen, Zustand store üzerinden yönetilen global onay modal sistemini sağlar.
 * Kullanıcıdan onay gerektiren işlemler için (silme, güncelleme, iptal vb.) kullanılır.
 * 
 * Ana Özellikler:
 * - Global state yönetimi: Zustand store ile merkezi modal kontrolü
 * - Çoklu tip desteği: danger, success, warning, info
 * - Keyboard desteği: ESC ile iptal, Enter ile onay
 * - Animasyonlar: Fade-in/out efektleri
 * - Dark mode: Glassmorphism dark theme
 * - Erişilebilirlik: ARIA atributları, focus yönetimi
 * - Destructive mode: Silme işlemleri için özel vurgu
 * - Responsive tasarım: Mobil ve desktop uyumlu
 * - Özelleştirilebilir: Mesaj, başlık, buton metinleri
 * 
 * Kullanım:
 * Zustand store üzerinden modal açılır:
 * ```jsx
 * openModal('confirmation', {
 *   title: 'Silme Onayı',
 *   message: 'Bu işlemi geri alamazsınız.',
 *   type: 'danger',
 *   onConfirm: () => handleDelete(),
 *   onCancel: () => console.log('İptal')
 * });
 * ```
 * 
 * Modal Tipleri:
 * - danger: Kırmızı tema (silme, tehlikeli işlemler)
 * - success: Yeşil tema (başarılı işlemler)
 * - warning: Sarı tema (uyarı işlemleri)
 * - info: Mavi tema (bilgilendirme)
 * 
 * @author MediKariyer Development Team
 * @version 2.0.0
 * @since 2024
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from 'lucide-react';
import { ModalContainer } from './ModalContainer';

/**
 * ============================================================================
 * ICON MAPPING - Modal tipine göre ikon eşleştirmesi
 * ============================================================================
 */
const ICONS = {
  danger: <AlertTriangle className="h-16 w-16 text-red-500" />,
  success: <CheckCircle className="h-16 w-16 text-green-500" />,
  warning: <AlertCircle className="h-16 w-16 text-yellow-500" />,
  info: <Info className="h-16 w-16 text-blue-500" />,
};

/**
 * ============================================================================
 * BUTTON STYLE MAPPING - Modal tipine göre buton stil eşleştirmesi
 * ============================================================================
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
 * ============================================================================
 * MODAL BOYUT AYARLARI - Responsive modal genişlik konfigürasyonu
 * ============================================================================
 */
/**
 * ============================================================================
 * CONFIRMATION MODAL COMPONENT
 * ============================================================================
 * 
 * Ana modal bileşeni - Zustand store'dan modal state'ini okur ve render eder
 * 
 * State Yönetimi:
 * - useUiStore hook'u ile global modal state'ine erişir
 * - Modal açık/kapalı durumu store tarafından kontrol edilir
 * 
 * Event Handlers:
 * - handleConfirm: Onay butonuna tıklandığında çalışır
 * - handleCancel: İptal butonuna tıklandığında veya ESC tuşuna basıldığında çalışır
 * 
 * Keyboard Events:
 * - ESC: Modal'ı kapatır (handleCancel)
 * - Enter: Modal'ı onaylar (handleConfirm)
 * 
 * Focus Management:
 * - Modal açıldığında confirm butonuna otomatik focus
 * - Tab tuşu ile modal içinde focus döngüsü
 */
const ConfirmationModal = ({ modalId = 'confirmation', config, closeModal }) => {
  const confirmationModal = config;
  const modalRef = useRef(null);
  const confirmButtonRef = useRef(null);
  const cancelButtonRef = useRef(null);

  // Confirm ve Cancel handler'ları
  const handleConfirm = useCallback(() => {
    if (!confirmationModal?.props) return;
    confirmationModal.props.onConfirm?.();
    closeModal(modalId);
  }, [confirmationModal?.props, closeModal, modalId]);

  const handleCancel = useCallback(() => {
    if (!confirmationModal?.props) return;
    confirmationModal.props.onCancel?.();
    closeModal(modalId);
  }, [confirmationModal?.props, closeModal, modalId]);

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
    anchorRect = null,
    placement = 'auto',
    offsetDistance = 20
  } = confirmationModal.props;

  // Icon ve button style'ları al
  const icon = ICONS[type] || ICONS.info;
  const buttonStyles = BUTTON_STYLES[type] || BUTTON_STYLES.info;
  const modalSize = ['small', 'medium', 'large', 'xl'].includes(size) ? size : 'medium';
  const isCompact = modalSize === 'small';
  const sizeClassName = {
    small: 'max-w-md',
    medium: 'max-w-lg',
    large: 'max-w-3xl',
    xl: 'max-w-4xl'
  }[modalSize] || 'max-w-lg';

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
    <ModalContainer
      isOpen={confirmationModal.open}
      onClose={handleCancel}
      title={title}
      size={modalSize}
      align="center"
      maxHeight="85vh"
      closeOnBackdrop={closeOnBackdrop}
      showCloseButton={false}
      anchorRect={anchorRect}
      placement={placement}
      offsetDistance={offsetDistance}
      containerClassName={`relative overflow-visible ${sizeClassName}`}
    >
      <div ref={modalRef} className={`relative ${isCompact ? 'p-3 md:p-5' : 'p-2 md:p-4'}`}>
        <button
          onClick={handleCancel}
          className={`absolute top-2 right-2 md:top-0 md:right-0 text-gray-400 hover:text-red-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 rounded-full ${isCompact ? 'p-1' : 'p-1.5'}`}
          aria-label="Modalı kapat"
        >
          <X className={isCompact ? 'h-5 w-5' : 'h-6 w-6'} />
        </button>

        <div className={`text-center ${isCompact ? 'pt-4 md:pt-2' : 'pt-6 md:pt-4'}`}>
          <div className={`flex justify-center ${isCompact ? 'mb-4' : 'mb-6'}`}>
            {destructive
              ? (isCompact
                ? <AlertTriangle className="h-14 w-14 text-red-600" />
                : destructiveStyles.icon)
              : (isCompact
                ? React.cloneElement(icon, { className: 'h-14 w-14 ' + (icon.props.className || '') })
                : icon)}
          </div>

          <h3
            id="modal-title"
            className={`${isCompact ? 'text-xl md:text-2xl' : 'text-2xl md:text-3xl'} font-bold text-white ${isCompact ? 'mb-3' : 'mb-4'}`}
          >
            {title}
          </h3>

          <p
            id="modal-description"
            className={`${isCompact ? 'text-base md:text-lg' : 'text-lg'} text-gray-300 ${isCompact ? 'mb-6' : 'mb-8'} leading-relaxed`}
          >
            {message}
          </p>

          <div className={`flex flex-col sm:flex-row ${isCompact ? 'sm:space-x-3 gap-2 sm:gap-0' : 'sm:space-x-4 gap-3 sm:gap-0'} justify-center`}>
            <button
              ref={cancelButtonRef}
              onClick={handleCancel}
              className={`${isCompact ? 'px-5 py-2.5 text-sm md:text-base rounded-lg' : 'px-8 py-4 rounded-xl text-lg'} font-semibold transition-all duration-200 bg-white/10 border border-white/20 text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-gray-500`}
              aria-label="İşlemi iptal et"
            >
              {cancelText}
            </button>

            <button
              ref={confirmButtonRef}
              onClick={handleConfirm}
              className={`${isCompact ? 'px-5 py-2.5 text-sm md:text-base rounded-lg' : 'px-8 py-4 rounded-xl text-lg'} font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${destructive ? (isCompact ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 text-white' : destructiveStyles.confirmButton) : buttonStyles.confirm}`}
              aria-label="İşlemi onayla"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </ModalContainer>
  );
};

export default ConfirmationModal;