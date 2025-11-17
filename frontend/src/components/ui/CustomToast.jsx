/**
 * @file CustomToast.jsx
 * @description Custom Toast Component - Viewport-aware toast sistemi
 * 
 * Basit, güvenilir, viewport'ta sabit duran toast sistemi
 */

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, XCircle, AlertCircle, Info, Loader } from 'lucide-react';

// ============================================================================
// TOAST STATE - Global state management
// ============================================================================

let toastId = 0;
const listeners = new Set();

const toastState = {
  toasts: [],
  
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  
  notify() {
    listeners.forEach(listener => listener(toastState.toasts));
  },
  
  add(toast) {
    const id = ++toastId;
    const newToast = { ...toast, id, createdAt: Date.now() };
    toastState.toasts = [...toastState.toasts, newToast];
    toastState.notify();
    
    if (toast.duration && toast.duration !== Infinity) {
      setTimeout(() => toastState.remove(id), toast.duration);
    }
    
    return id;
  },
  
  remove(id) {
    toastState.toasts = toastState.toasts.filter(t => t.id !== id);
    toastState.notify();
  },
  
  clear() {
    toastState.toasts = [];
    toastState.notify();
  }
};

// ============================================================================
// TOAST API - Public interface
// ============================================================================

export const toast = {
  success: (message, options = {}) =>
    toastState.add({ type: 'success', message, duration: 4000, ...options }),
  
  error: (message, options = {}) =>
    toastState.add({ type: 'error', message, duration: 5000, ...options }),
  
  warning: (message, options = {}) =>
    toastState.add({ type: 'warning', message, duration: 4500, ...options }),
  
  info: (message, options = {}) =>
    toastState.add({ type: 'info', message, duration: 4000, ...options }),
  
  loading: (message, options = {}) =>
    toastState.add({ type: 'loading', message, duration: Infinity, ...options }),
  
  custom: (message, options = {}) =>
    toastState.add({ type: 'custom', message, duration: 4000, ...options }),
  
  dismiss: (id) => {
    if (id) {
      toastState.remove(id);
    } else {
      toastState.clear();
    }
  },
  
  promise: async (promise, messages) => {
    const id = toastState.add({ 
      type: 'loading', 
      message: messages.loading, 
      duration: Infinity 
    });
    
    try {
      const result = await promise;
      toastState.remove(id);
      toastState.add({ 
        type: 'success', 
        message: messages.success, 
        duration: 4000 
      });
      return result;
    } catch (error) {
      toastState.remove(id);
      toastState.add({ 
        type: 'error', 
        message: messages.error, 
        duration: 5000 
      });
      throw error;
    }
  }
};

// ============================================================================
// TOAST ITEM - Single toast component
// ============================================================================

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
  loading: Loader,
};

const colors = {
  success: 'bg-gradient-to-r from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/30',
  error: 'bg-gradient-to-r from-rose-500 to-red-600 shadow-lg shadow-rose-500/30',
  warning: 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg shadow-amber-500/30',
  info: 'bg-gradient-to-r from-blue-500 to-cyan-600 shadow-lg shadow-blue-500/30',
  loading: 'bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30',
  custom: 'bg-white border border-gray-200 shadow-xl',
};

const ToastItem = ({ toast: t, onDismiss }) => {
  const Icon = icons[t.type] || Info;
  const colorClass = colors[t.type] || colors.custom;
  const textColor = t.type === 'custom' ? 'text-gray-900' : 'text-white';

  return (
    <div
      className={`
        ${colorClass} ${textColor}
        flex items-center gap-3 px-5 py-4 rounded-xl
        min-w-[320px] max-w-[500px] w-full
        backdrop-blur-sm
        pointer-events-auto
        transform transition-all duration-300 hover:scale-[1.02]
        border border-white/20
      `}
      role="alert"
      aria-live="polite"
    >
      <Icon
        className={`w-5 h-5 flex-shrink-0 ${t.type === 'loading' ? 'animate-spin' : ''}`}
        aria-hidden="true"
      />
      <p className="flex-1 text-sm font-semibold">{t.message}</p>
      {t.duration !== Infinity && (
        <button
          onClick={() => onDismiss(t.id)}
          className="flex-shrink-0 hover:bg-white/30 rounded-lg p-1.5 transition-colors"
          aria-label="Kapat"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

// ============================================================================
// TOAST CONTAINER - Main component
// ============================================================================

export const CustomToaster = () => {
  const [toasts, setToasts] = useState([]);
  const [container, setContainer] = useState(null);

  useEffect(() => {
    let portalRoot = document.getElementById('toast-portal-root');
    let rafId = null;
    const topOffset = 20;
    const bottomOffset = 40;
    const visiblePadding = topOffset + bottomOffset;

    if (!portalRoot) {
      portalRoot = document.createElement('div');
      portalRoot.id = 'toast-portal-root';
      portalRoot.setAttribute('style', `
        position: absolute !important;
        left: 50% !important;
        transform: translate(-50%, 0) !important;
        z-index: 999999 !important;
        pointer-events: auto !important;
        display: flex !important;
        flex-direction: column !important;
        gap: 12px !important;
        align-items: stretch !important;
        width: min(520px, calc(100vw - 32px)) !important;
        max-height: calc(100vh - ${visiblePadding}px) !important;
        overflow-y: auto !important;
        padding-right: 4px !important;
        margin: 0 !important;
        padding: 0 !important;
      `.replace(/\s+/g, ' ').trim());

      document.body.appendChild(portalRoot);
    }

    const positionContainer = () => {
      if (!portalRoot) return;
      const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
      const viewportHeight = window.innerHeight || 0;
      const containerHeight = portalRoot.offsetHeight || 0;
      const minTop = scrollY + topOffset;
      const desiredTop = scrollY + viewportHeight - bottomOffset - containerHeight;
      const top = Math.max(minTop, desiredTop);
      portalRoot.style.top = `${top}px`;
    };

    const schedulePosition = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(positionContainer);
    };

    schedulePosition();
    window.addEventListener('scroll', schedulePosition, { passive: true });
    window.addEventListener('resize', schedulePosition);

    setContainer(portalRoot);

    const unsubscribe = toastState.subscribe((nextToasts) => {
      setToasts(nextToasts);
      schedulePosition();
      // Toast renderı tamamlandığında yeniden ölç
      requestAnimationFrame(() => schedulePosition());
      setTimeout(() => schedulePosition(), 0);
    });

    return () => {
      unsubscribe();
      window.removeEventListener('scroll', schedulePosition);
      window.removeEventListener('resize', schedulePosition);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  if (!container || toasts.length === 0) return null;

  return createPortal(
    <>
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={toastState.remove} />
      ))}
    </>,
    container
  );
};

export default toast;
