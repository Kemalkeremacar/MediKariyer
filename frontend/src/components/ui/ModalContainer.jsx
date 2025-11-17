/**
 * @file ModalContainer.jsx
 * @description Modal Container Component - Merkezi modal yönetim bileşeni
 * 
 * Bu bileşen, uygulama genelinde kullanılan tüm modal'lar için merkezi bir container sağlar.
 * Dark theme varsayılan olarak ayarlanmıştır ve modern glassmorphism tasarım kullanır.
 * 
 * Ana Özellikler:
 * - Body scroll kilitleme: Modal açıkken arka plan scroll'u engellenir
 * - ESC tuşu desteği: Klavye ile modal kapatma
 * - Backdrop click: Arka plana tıklayarak kapatma
 * - Focus trap: Modal içinde odak yönetimi (Tab tuşu ile)
 * - Responsive tasarım: Mobil ve desktop uyumlu
 * - Scroll pozisyon koruma: Modal açılıp kapanırken scroll pozisyonu korunur
 * - Erişilebilirlik (A11y): ARIA atributları, role="dialog", aria-modal
 * - Animasyonlar: Fade-in ve zoom-in efektleri
 * - Hizalama seçenekleri: center, top, bottom (varsayılan: bottom)
 * - Boyut seçenekleri: small, medium, large, xl (varsayılan: medium)
 * 
 * Kullanım Örnekleri:
 * ```jsx
 * <ModalContainer
 *   isOpen={isOpen}
 *   onClose={handleClose}
 *   title="Başlık"
 *   size="medium"
 *   align="bottom"
 * >
 *   <p>Modal içeriği</p>
 * </ModalContainer>
 * ```
 * 
 * Teknik Detaylar:
 * - useRef kullanarak scroll pozisyonu kaydedilir (closure sorunu önlenir)
 * - requestAnimationFrame ile güvenli scroll restore
 * - Event listener cleanup ile memory leak önlenir
 * - Portal kullanılmaz, direkt DOM'da render edilir
 * 
 * @author MediKariyer Development Team
 * @version 2.0.0
 * @since 2024
 */

import React, { useEffect, useRef, useCallback, useMemo, useLayoutEffect, useState } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import {
  useFloating,
  flip,
  shift,
  offset,
  autoUpdate
} from '@floating-ui/react';

let bodyLockCount = 0;
let savedScrollY = 0;

const lockBodyScroll = () => {
  if (typeof document === 'undefined') return;
  if (bodyLockCount === 0) {
    savedScrollY = window.scrollY || window.pageYOffset;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
  }
  bodyLockCount += 1;
};

const unlockBodyScroll = () => {
  if (typeof document === 'undefined') return;
  if (bodyLockCount === 0) return;
  bodyLockCount -= 1;
  if (bodyLockCount === 0) {
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    const scrollToRestore = savedScrollY;
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollToRestore);
    });
  }
};

const getModalRoot = () => {
  if (typeof document === 'undefined') return null;
  return document.getElementById('modal-root');
};

export const ModalContainer = ({ 
  isOpen, 
  onClose, 
  children, 
  title,
  size = 'medium',
  closeOnBackdrop = true,
  maxHeight = '90vh',
  showCloseButton = true,
  align = 'bottom',
  initialFocusRef,
  fullScreenOnMobile = false,
  anchorRect = null,
  placement = 'bottom',
  offsetDistance = 16,
  backdropClassName = '',
  containerClassName = ''
}) => {
  const modalRef = useRef(null);
  const labelledByIdRef = useRef(null);
  if (!labelledByIdRef.current) {
    labelledByIdRef.current = `modal-title-${Math.random().toString(36).slice(2)}`;
  }
  const labelledById = labelledByIdRef.current;
  const modalRoot = getModalRoot();

  const hasAnchor = Boolean(anchorRect);

  const virtualReference = useMemo(() => {
    if (!anchorRect) return null;
    return {
      getBoundingClientRect: () => anchorRect
    };
  }, [anchorRect]);

  const {
    refs,
    floatingStyles,
    update
  } = useFloating({
    placement,
    middleware: [
      offset(offsetDistance),
      flip({ padding: 16 }),
      shift({ padding: 16 })
    ],
    strategy: 'fixed',
    whileElementsMounted: hasAnchor ? autoUpdate : undefined
  });

  useEffect(() => {
    if (!isOpen) return;
    lockBodyScroll();
    return () => {
      unlockBodyScroll();
    };
  }, [isOpen]);

  const calculateViewportPosition = useCallback(() => {
    if (typeof window === 'undefined') {
      return {
        center: 0,
        top: 0,
        bottom: 0
      };
    }
    const scrollY = window.scrollY || window.pageYOffset;
    const innerHeight = window.innerHeight;
    const topPadding = Math.min(innerHeight / 4, 160);
    return {
      center: scrollY + innerHeight / 2,
      top: scrollY + topPadding,
      bottom: scrollY + innerHeight - topPadding
    };
  }, []);

  const [viewportPosition, setViewportPosition] = useState(() => calculateViewportPosition());

  useEffect(() => {
    if (!isOpen || hasAnchor) return;
    const handleReposition = () => {
      setViewportPosition(calculateViewportPosition());
    };
    handleReposition();
    window.addEventListener('scroll', handleReposition, { passive: true });
    window.addEventListener('resize', handleReposition);
    return () => {
      window.removeEventListener('scroll', handleReposition);
      window.removeEventListener('resize', handleReposition);
    };
  }, [isOpen, hasAnchor, calculateViewportPosition]);

  useEffect(() => {
    if (!isOpen || !virtualReference) return;
    refs.setReference(virtualReference);
    update?.();
  }, [isOpen, virtualReference, refs, update]);

  useEffect(() => {
    if (!isOpen || !modalRoot) return;
    const handleResize = () => {
      update?.();
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [isOpen, modalRoot, update]);

  useEffect(() => {
    if (isOpen) {
      // ESC tuşu ile kapatma
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      // Focus trap (Tab tuşu için)
      const handleKeyTrap = (e) => {
        if (e.key !== 'Tab') return;
        const root = modalRef.current;
        if (!root) return;
        const focusable = root.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          last.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
          first.focus();
          e.preventDefault();
        }
      };

      document.addEventListener('keydown', handleEscape);
      document.addEventListener('keydown', handleKeyTrap);

      // Initial focus
      setTimeout(() => {
        if (initialFocusRef?.current) {
          initialFocusRef.current.focus();
        }
      }, 0);

      return () => {
        // Cleanup: body lock'u kaldır ve scroll pozisyonunu restore et
        document.removeEventListener('keydown', handleEscape);
        document.removeEventListener('keydown', handleKeyTrap);
      };
    }
  }, [isOpen, onClose, initialFocusRef]);

  useLayoutEffect(() => {
    if (hasAnchor && modalRef.current) {
      refs.setFloating(modalRef.current);
    }
  }, [hasAnchor, refs]);

  const handleBackdropClick = useCallback((e) => {
    if (!closeOnBackdrop) return;
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [closeOnBackdrop, onClose]);

  if (!isOpen || !modalRoot) return null;

  // Size configuration
  const sizeConfig = {
    small: 'max-w-md',
    medium: 'max-w-3xl',
    large: 'max-w-5xl',
    xl: 'max-w-7xl'
  };

  const containerResponsive = fullScreenOnMobile
    ? 'md:rounded-2xl md:max-w-[inherit] md:w-full md:h-auto h-screen max-w-none rounded-none'
    : '';

  const overlayClasses = hasAnchor
    ? 'fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-start justify-start p-0 animate-in fade-in duration-200'
    : 'fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] animate-in fade-in duration-200';

  const modalClasses = [
    'bg-white rounded-2xl shadow-2xl w-full',
    sizeConfig[size],
    containerResponsive,
    'flex flex-col animate-in zoom-in-95 duration-300 border border-blue-100',
    containerClassName
  ].filter(Boolean).join(' ');

  let modalStyle;
  if (hasAnchor) {
    modalStyle = {
      ...floatingStyles,
      maxHeight,
      overflow: 'hidden'
    };
  } else {
    const { center, top, bottom } = viewportPosition;
    let topValue = center;
    let leftValue = '50%';
    let transformValue = 'translate(-50%, -50%)';

    if (align === 'top' || align === 'start') {
      topValue = top;
      transformValue = 'translate(-50%, 0)';
    } else if (align === 'bottom' || align === 'end') {
      topValue = bottom;
      transformValue = 'translate(-50%, -100%)';
    }

    if (align === 'left') {
      leftValue = '2rem';
      transformValue = 'translate(0, -50%)';
    } else if (align === 'right') {
      leftValue = 'calc(100% - 2rem)';
      transformValue = 'translate(-100%, -50%)';
    }

    modalStyle = {
      position: 'absolute',
      top: `${topValue}px`,
      left: leftValue,
      transform: transformValue,
      maxHeight,
      overflow: 'hidden'
    };
  }
  
  return createPortal(
    <div 
      className={`${overlayClasses} ${backdropClassName}`.trim()}
      onClick={handleBackdropClick}
    >
      <div className="relative z-[101] w-full h-full pointer-events-none">
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? labelledById : undefined}
          className={`${modalClasses} pointer-events-auto`}
          style={modalStyle}
          onClick={(e) => e.stopPropagation()}
        >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0 rounded-t-2xl">
            {title && (
              <h2 id={labelledById} className="text-xl md:text-2xl font-bold text-gray-900">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-lg"
                aria-label="Modalı kapat"
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>
        )}

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 md:p-6">
          {children}
        </div>
      </div>
      </div>
    </div>,
    modalRoot
  );
};
