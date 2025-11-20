/**
 * @file ModalContainer.jsx
 * @description Viewport merkezli global modal bileşeni
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

let bodyLockCount = 0;

const lockBodyScroll = () => {
  if (typeof document === 'undefined') return;
  if (bodyLockCount === 0) {
    document.body.style.overflow = 'hidden';
  }
  bodyLockCount += 1;
};

const unlockBodyScroll = () => {
  if (typeof document === 'undefined') return;
  if (bodyLockCount === 0) return;
  bodyLockCount -= 1;
  if (bodyLockCount === 0) {
    document.body.style.overflow = '';
  }
};

export const ModalContainer = ({
  isOpen,
  onClose,
  children,
  title,
  size = 'medium',
  closeOnBackdrop = true,
  maxHeight = '85vh',
  showCloseButton = true,
  align = 'center',
  initialFocusRef,
  fullScreenOnMobile = false,
  backdropClassName = '',
  containerClassName = '',
}) => {
  const modalRef = useRef(null);
  const overlayRef = useRef(null);
  const rafIdRef = useRef(null);
  const labelledByIdRef = useRef(null);
  if (!labelledByIdRef.current) {
    labelledByIdRef.current = `modal-title-${Math.random().toString(36).slice(2)}`;
  }
  const labelledById = labelledByIdRef.current;

  // Modal'ın her zaman viewport'un görünür alanında kalmasını sağla
  useEffect(() => {
    if (!isOpen || !modalRef.current) {
      return;
    }
    
    const adjustModal = () => {
      const modalElement = modalRef.current;
      if (!modalElement) return;
      
      // Viewport bilgilerini al
      const viewportHeight = window.innerHeight || 0;
      const padding = 16; // Overlay padding'i (p-4 = 16px)
      
      // maxHeight prop'u varsa onu dikkate al, yoksa viewport'a göre hesapla
      let maxModalHeight;
      if (typeof maxHeight === 'string' && maxHeight.endsWith('vh')) {
        const vhValue = parseFloat(maxHeight);
        maxModalHeight = (viewportHeight * vhValue) / 100;
      } else {
        maxModalHeight = viewportHeight - (padding * 2);
      }
      
      // Viewport'a sığmayacak kadar büyükse, viewport'a göre ayarla
      const viewportMaxHeight = viewportHeight - (padding * 2);
      if (maxModalHeight > viewportMaxHeight) {
        maxModalHeight = viewportMaxHeight;
      }
      
      // Modal'ın max-height'ını ayarla
      modalElement.style.maxHeight = `${maxModalHeight}px`;
      
      // Modal içeriğinin scroll edilebilir olduğundan emin ol
      const contentElement = modalElement.querySelector('[class*="overflow-y-auto"]');
      if (contentElement) {
        const headerHeight = 80; // Yaklaşık header yüksekliği
        const contentMaxHeight = maxModalHeight - headerHeight;
        contentElement.style.maxHeight = `${contentMaxHeight}px`;
      }
      
      // Modal'ı overlay içinde görünür alana getir
      // Overlay overflow-y-auto olduğu için, modal'ı overlay'in scroll pozisyonuna göre ayarlıyoruz
      if (overlayRef.current) {
        // Modal render edildikten sonra, modal'ı overlay içinde görünür alana scroll et
        const modalRect = modalElement.getBoundingClientRect();
        const overlayRect = overlayRef.current.getBoundingClientRect();
        
        // Modal'ın overlay içindeki pozisyonunu hesapla
        const modalTopRelativeToOverlay = modalRect.top - overlayRect.top + overlayRef.current.scrollTop;
        
        // Modal'ı overlay'in görünür alanına getir
        // Eğer modal overlay'in üstündeyse veya altındaysa, scroll yap
        const padding = 16;
        const desiredScrollTop = modalTopRelativeToOverlay - padding;
        
        if (desiredScrollTop > 0 && Math.abs(overlayRef.current.scrollTop - desiredScrollTop) > 10) {
          overlayRef.current.scrollTo({
            top: desiredScrollTop,
            behavior: 'smooth'
          });
        }
      }
    };
    
    // İlk ayarlama - render tamamlandıktan sonra
    const timeoutId = setTimeout(adjustModal, 100);
    
    // Resize ve orientation change event'lerini dinle
    window.addEventListener('resize', adjustModal);
    window.addEventListener('orientationchange', adjustModal);
    
    // Modal içeriği değiştiğinde yeniden ayarla
    const observer = new ResizeObserver(adjustModal);
    if (modalRef.current) {
      observer.observe(modalRef.current);
    }
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', adjustModal);
      window.removeEventListener('orientationchange', adjustModal);
      observer.disconnect();
    };
  }, [isOpen, maxHeight]);

  useEffect(() => {
    if (!isOpen) return;
    lockBodyScroll();
    return () => {
      unlockBodyScroll();
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

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

    setTimeout(() => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
      }
    }, 0);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleKeyTrap);
    };
  }, [isOpen, onClose, initialFocusRef]);

  const handleBackdropClick = useCallback(
    (e) => {
      if (!closeOnBackdrop) return;
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [closeOnBackdrop, onClose]
  );

  // Eğer DOM henüz hazır değilse null dön
  if (typeof document === 'undefined') return null;
  if (!isOpen) return null;

  const sizeConfig = {
    small: 'max-w-md',
    medium: 'max-w-3xl',
    large: 'max-w-5xl',
    xl: 'max-w-7xl',
  };

  const alignmentClasses = {
    center: 'items-center justify-center',
    top: 'items-start justify-center pt-10',
    bottom: 'items-end justify-center pb-10',
    start: 'items-start justify-center pt-10',
    end: 'items-end justify-center pb-10',
    left: 'items-center justify-start pl-6',
    right: 'items-center justify-end pr-6',
  };

  const containerResponsive = fullScreenOnMobile
    ? 'md:rounded-2xl md:max-w-[inherit] md:w-full md:h-auto h-screen max-w-none rounded-none'
    : '';

  // Overlay viewport'u kaplar (fixed inset-0) ve modal'ı üstten başlatır
  // Overlay'e overflow-y-auto ekleyerek modal'ı overlay içinde scroll edilebilir yapıyoruz
  // Böylece modal her zaman viewport'un görünür alanında kalır
  // items-start kullanarak modal'ı overlay'in üstüne yerleştiriyoruz (center yerine)
  const overlayClasses = [
    'fixed inset-0 bg-slate-950/55 backdrop-blur-[3px] z-[100] animate-in fade-in duration-200 flex',
    'items-start justify-center', // items-center yerine items-start - modal üstten başlasın
    backdropClassName,
    // Overlay içinde padding - modal her zaman görünür alanda kalır
    'pt-4 md:pt-6 pb-4 md:pb-6 px-4 md:px-6',
    // Overlay'e scroll ekle - modal viewport dışına taşırsa overlay içinde scroll edilebilir
    'overflow-y-auto',
  ]
    .filter(Boolean)
    .join(' ');

  const modalClasses = [
    'bg-white/95 backdrop-blur-2xl rounded-[28px] shadow-[0_30px_120px_rgba(15,23,42,0.18)] ring-1 ring-white/50 w-full pointer-events-auto',
    sizeConfig[size],
    containerResponsive,
    'flex flex-col animate-in zoom-in-95 duration-300 border border-white/60',
    containerClassName,
  ]
    .filter(Boolean)
    .join(' ');

  // maxHeight prop'unu viewport'a göre dinamik olarak ayarla
  // Eğer vh birimiyse (örn: "85vh"), viewport'a göre hesapla
  // Aksi halde prop değerini kullan
  const getMaxHeight = () => {
    if (typeof maxHeight === 'string' && maxHeight.endsWith('vh')) {
      const vhValue = parseFloat(maxHeight);
      const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
      return `${(viewportHeight * vhValue) / 100}px`;
    }
    return maxHeight;
  };

  const modalStyle = {
    maxHeight: getMaxHeight(),
    overflow: 'hidden',
  };

  return createPortal(
    <div ref={overlayRef} className={overlayClasses} onClick={handleBackdropClick}>
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? labelledById : undefined}
        className={modalClasses}
        style={modalStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <div className="relative flex items-center justify-between gap-4 p-5 md:p-6 border-b border-white/70 bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50/80 flex-shrink-0 rounded-t-[28px]">
            {title && (
              <h2 id={labelledById} className="relative text-xl md:text-2xl font-semibold text-slate-900 tracking-tight">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="relative text-slate-400 hover:text-slate-900 transition-colors p-2 rounded-full hover:bg-white/70 focus:outline-none focus:ring-2 focus:ring-blue-200/70"
                aria-label="Modalı kapat"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto overscroll-contain p-5 md:p-8 bg-gradient-to-b from-white via-white to-slate-50 relative rounded-b-[28px]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.08),transparent_45%)]" />
          <div className="relative">{children}</div>
        </div>
      </div>
    </div>,
    document.body // DEĞİŞİKLİK: Modal'ı direkt body'ye bindir - #root'taki transform'dan etkilenmez
  );
};
