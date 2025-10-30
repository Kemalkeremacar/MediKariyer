/**
 * Modal Container Component
 * 
 * Tüm modaller için merkezi konumlandırma ve responsive yönetim
 * - Ekrana dinamik hizalama
 * - Mobil/Tablet optimizasyonu
 * - Viewport kontrolü
 */

import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

export const ModalContainer = ({ 
  isOpen, 
  onClose, 
  children, 
  title,
  size = 'medium',
  closeOnBackdrop = true,
  maxHeight = '90vh',
  showCloseButton = true,
  align = 'auto', 
  initialFocusRef,
  anchorY,
  anchorOffset = 16,
  fullScreenOnMobile = true,
  stickToAnchor = false
}) => {
  const modalRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const labelledById = useRef(`modal-title-${Math.random().toString(36).slice(2)}`);
  const [computedAlign, setComputedAlign] = useState('center');
  const [modalTopPx, setModalTopPx] = useState(undefined);

  // Pozisyon ve görünürlük hesaplama
  useEffect(() => {
    if (isOpen) {
      // Hedefe kaydır ve ardından body'yi kilitle
      const initialScroll = window.scrollY || window.pageYOffset;
      let targetScroll = initialScroll;
      if (typeof anchorY === 'number') {
        const viewportHeight = (window.innerHeight || document.documentElement.clientHeight);
        const docHeight = Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight
        );
        if (stickToAnchor) {
          // AnchorY sayfa (mutlak) koordinatı olarak beklenir
          const desiredTop = Math.max(0, Math.min(anchorY - 120, docHeight - viewportHeight));
          targetScroll = desiredTop;
          window.scrollTo({ top: desiredTop, behavior: 'auto' });
        } else {
          const viewportCenter = viewportHeight / 2;
          const desiredTop = initialScroll + (anchorY - viewportCenter) - anchorOffset;
          targetScroll = Math.max(0, Math.min(desiredTop, docHeight - viewportHeight));
          window.scrollTo({ top: targetScroll, behavior: 'auto' });
        }
      }

      setScrollPosition(targetScroll);

      // Body scroll'u kilitle
      document.body.style.position = 'fixed';
      document.body.style.top = `-${targetScroll}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      // ESC tuşu ile kapatma
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

      // Modal boyutuna göre hizalama ve görünür alana getirme
      setTimeout(() => {
        const node = modalRef.current;
        if (node) {
          if (typeof anchorY === 'number') {
            // Anchor varsa ve stickToAnchor açıksa, üstte hizala; değilse merkezle
            if (stickToAnchor) {
              setComputedAlign('top');
              // Modal yüksekliğini ölç ve görünür alana sığacak şekilde üst boşluğu hesapla
              const vh = window.innerHeight || document.documentElement.clientHeight;
              const nodeRect = node.getBoundingClientRect();
              const nodeH = nodeRect.height;
              const docHeight = Math.max(
                document.body.scrollHeight,
                document.documentElement.scrollHeight
              );
              // Hedef üst: anchorY'nin biraz üstü (120px), fakat sayfa sınırlarına ve alt taşmaya göre kısıtla
              let targetTop = anchorY - 120;
              targetTop = Math.max(16, targetTop);
              const maxTop = docHeight - nodeH - 16;
              if (!Number.isNaN(maxTop)) targetTop = Math.min(targetTop, Math.max(16, maxTop));
              setModalTopPx(targetTop);
            } else {
              setComputedAlign('center');
              node.scrollIntoView({ block: 'center', behavior: 'auto' });
            }
          } else {
            const rect = node.getBoundingClientRect();
            const vh = window.innerHeight || document.documentElement.clientHeight;
            const willFit = rect.height + 32 <= vh; // padding hesaba kat
            setComputedAlign(willFit ? 'center' : 'top');
            const blockPos = willFit ? 'center' : 'start';
            node.scrollIntoView({ block: blockPos, behavior: 'auto' });
          }
        }
        if (initialFocusRef?.current) {
          initialFocusRef.current.focus();
        }
      }, 0);

      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, targetScroll);
        document.removeEventListener('keydown', handleEscape);
        document.removeEventListener('keydown', handleKeyTrap);
      };
    }
  }, [isOpen, onClose, anchorY, anchorOffset]);

  // Backdrop click handler
  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Size configuration
  const sizeConfig = {
    small: 'max-w-md',
    medium: 'max-w-3xl',
    large: 'max-w-5xl',
    xl: 'max-w-7xl'
  };

  // Wrapper hizalama sınıfı
  const effectiveAlign = align === 'auto' ? computedAlign : align;
  const alignClass = effectiveAlign === 'top' ? 'items-start' : 'items-center';

  const containerResponsive = fullScreenOnMobile
    ? 'md:rounded-2xl md:max-w-[inherit] md:w-full md:h-auto h-screen max-w-none rounded-none'
    : '';

  return (
    <div 
      className={`fixed inset-0 z-[100] flex ${alignClass} justify-center p-4 animate-in fade-in duration-200 bg-black/60 backdrop-blur-sm overflow-y-auto`}
      onClick={handleBackdropClick}
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100
      }}
    >
      <div 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? labelledById.current : undefined}
        className={`bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full ${sizeConfig[size]} ${containerResponsive} flex flex-col animate-in zoom-in-95 duration-300`}
        style={{ 
          maxHeight,
          overflow: 'hidden',
          marginTop: (stickToAnchor && typeof anchorY === 'number' && typeof modalTopPx === 'number')
            ? Math.max(16, modalTopPx - scrollPosition)
            : undefined
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 dark:border-white/10 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 flex-shrink-0">
            {title && (
              <h2 id={labelledById.current} className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"
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
  );
};

// Dark theme için özel modal
export const DarkModalContainer = ({ 
  isOpen, 
  onClose, 
  children, 
  title,
  size = 'medium',
  closeOnBackdrop = true,
  maxHeight = '90vh',
  showCloseButton = true,
  align = 'auto',
  initialFocusRef,
  fullScreenOnMobile = false
}) => {
  const modalRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const labelledById = useRef(`modal-title-${Math.random().toString(36).slice(2)}`);
  const [computedAlign, setComputedAlign] = useState('center');

  useEffect(() => {
    if (isOpen) {
      const currentScroll = window.scrollY || window.pageYOffset;
      setScrollPosition(currentScroll);

      document.body.style.position = 'fixed';
      document.body.style.top = `-${currentScroll}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);

      setTimeout(() => {
        const node = modalRef.current;
        if (node) {
          const rect = node.getBoundingClientRect();
          const vh = window.innerHeight || document.documentElement.clientHeight;
          const willFit = rect.height + 32 <= vh;
          setComputedAlign(willFit ? 'center' : 'top');
          const blockPos = willFit ? 'center' : 'start';
          node.scrollIntoView({ block: blockPos, behavior: 'auto' });
        }
        if (initialFocusRef?.current) {
          initialFocusRef.current.focus();
        }
      }, 0);

      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, currentScroll);
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const sizeConfig = {
    small: 'max-w-md',
    medium: 'max-w-3xl',
    large: 'max-w-5xl',
    xl: 'max-w-7xl'
  };

  const effectiveAlign = align === 'auto' ? computedAlign : align;
  const alignClass = effectiveAlign === 'top' ? 'items-start' : 'items-center';

  const containerResponsive = fullScreenOnMobile
    ? 'md:rounded-2xl md:max-w-[inherit] md:w-full md:h-auto h-screen max-w-none rounded-none'
    : '';

  return (
    <div 
      className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex ${alignClass} justify-center p-4 animate-in fade-in duration-200 overflow-y-auto`}
      onClick={handleBackdropClick}
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100
      }}
    >
      <div 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? labelledById.current : undefined}
        className={`bg-slate-800/95 rounded-2xl shadow-2xl w-full ${sizeConfig[size]} ${containerResponsive} flex flex-col animate-in zoom-in-95 duration-300 border border-white/20`}
        style={{ 
          maxHeight,
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10 bg-gradient-to-r from-slate-800 to-slate-900 flex-shrink-0">
            {title && (
              <h2 id={labelledById.current} className="text-xl md:text-2xl font-bold text-white">
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-red-400 transition-colors p-2 hover:bg-red-500/10 rounded-lg"
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
  );
};

