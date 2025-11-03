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

import React, { useEffect, useRef } from 'react';
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
  align = 'bottom',
  initialFocusRef,
  fullScreenOnMobile = false
}) => {
  const modalRef = useRef(null);
  const scrollPositionRef = useRef(0);
  const labelledById = useRef(`modal-title-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    if (isOpen) {
      // Mevcut scroll pozisyonunu kaydet (useRef ile - closure sorunu yok)
      const currentScroll = window.scrollY || window.pageYOffset;
      scrollPositionRef.current = currentScroll;

      // Body scroll'u kilitle
      document.body.style.position = 'fixed';
      document.body.style.top = `-${currentScroll}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

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
        const savedScroll = scrollPositionRef.current;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        // Scroll restore - requestAnimationFrame ile güvenli restore
        requestAnimationFrame(() => {
          window.scrollTo(0, savedScroll);
        });
        document.removeEventListener('keydown', handleEscape);
        document.removeEventListener('keydown', handleKeyTrap);
      };
    }
  }, [isOpen, onClose, initialFocusRef]);

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

  // Align configuration
  const alignClass = align === 'top' ? 'items-start' 
    : align === 'bottom' || align === 'end' ? 'items-end' 
    : 'items-center';

  const containerResponsive = fullScreenOnMobile
    ? 'md:rounded-2xl md:max-w-[inherit] md:w-full md:h-auto h-screen max-w-none rounded-none'
    : '';

  // Bottom align için ekstra padding
  const paddingBottom = (align === 'bottom' || align === 'end') ? 'pb-16 md:pb-20' : '';
  
  return (
    <div 
      className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex ${alignClass} justify-center p-4 ${paddingBottom} animate-in fade-in duration-200`}
      onClick={handleBackdropClick}
    >
      <div 
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? labelledById.current : undefined}
        className={`bg-slate-800/95 rounded-2xl shadow-2xl w-full ${sizeConfig[size]} ${containerResponsive} flex flex-col animate-in zoom-in-95 duration-300 border border-white/20`}
        style={{ maxHeight, overflow: 'hidden' }}
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
