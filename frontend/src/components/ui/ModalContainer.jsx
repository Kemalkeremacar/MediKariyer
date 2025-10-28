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
  showCloseButton = true
}) => {
  const modalRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  // Pozisyon hesaplama
  useEffect(() => {
    if (isOpen) {
      // Scroll pozisyonunu kaydet
      const currentScroll = window.scrollY || window.pageYOffset;
      setScrollPosition(currentScroll);

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

      document.addEventListener('keydown', handleEscape);

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

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200"
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
        className={`bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full ${sizeConfig[size]} flex flex-col animate-in zoom-in-95 duration-300`}
        style={{ 
          maxHeight,
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200 dark:border-white/10 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900 flex-shrink-0">
            {title && (
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
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
  showCloseButton = true
}) => {
  const modalRef = useRef(null);
  const [scrollPosition, setScrollPosition] = useState(0);

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

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200"
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
        className={`bg-slate-800/95 rounded-2xl shadow-2xl w-full ${sizeConfig[size]} flex flex-col animate-in zoom-in-95 duration-300 border border-white/20`}
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
              <h2 className="text-xl md:text-2xl font-bold text-white">
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

