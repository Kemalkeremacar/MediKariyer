/**
 * @file alertHelpers.ts
 * @description Yaygın alert pattern'leri için kolaylık hook'u
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 * 
 * **Özellikler:**
 * - useAlert'i ergonomik yardımcı metodlarla wrap eder
 * - Tüm callback'ler değiştirilmeden iletilir
 * 
 * **Kullanım:**
 * ```typescript
 * const alert = useAlertHelpers();
 * 
 * // Basit alert'ler
 * alert.success('İşlem tamamlandı');
 * alert.error('Bir şeyler yanlış gitti');
 * alert.info('İşte bazı bilgiler');
 * 
 * // Onay dialogları
 * alert.confirm('Emin misiniz?', () => doSomething());
 * alert.confirmDestructive('Öğeyi Sil', 'Bu işlem geri alınamaz', () => deleteItem());
 * ```
 * 
 * **Gereksinimler:** 8.1, 8.4
 */

import { useCallback, useMemo } from 'react';
import { useAlert } from '@/providers/AlertProvider';
import type { AlertConfig } from '@/types/alert';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Onay dialogları için seçenekler
 */
export interface ConfirmOptions {
  /** Başlık */
  title?: string;
  /** Onayla butonu metni */
  confirmText?: string;
  /** İptal butonu metni */
  cancelText?: string;
}

/**
 * useAlertHelpers hook'u tarafından döndürülen alert yardımcı metodları
 */
export interface AlertHelpers {
  /**
   * Başarı alert'i göster
   * @param message - Gösterilecek mesaj
   * @param onConfirm - Kullanıcı onayladığında çalışacak opsiyonel callback
   */
  success: (message: string, onConfirm?: () => void) => void;

  /**
   * Hata alert'i göster
   * @param message - Gösterilecek mesaj
   * @param onConfirm - Kullanıcı onayladığında çalışacak opsiyonel callback
   */
  error: (message: string, onConfirm?: () => void) => void;

  /**
   * Bilgi alert'i göster
   * @param message - Gösterilecek mesaj
   * @param onConfirm - Kullanıcı onayladığında çalışacak opsiyonel callback
   */
  info: (message: string, onConfirm?: () => void) => void;

  /**
   * Onay dialogu göster
   * @param message - Gösterilecek mesaj
   * @param onConfirm - Kullanıcı onayladığında çalışacak callback
   * @param onCancel - Kullanıcı iptal ettiğinde çalışacak opsiyonel callback
   * @param options - Opsiyonel başlık ve buton metni override'ları
   */
  confirm: (
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    options?: ConfirmOptions
  ) => void;

  /**
   * Yıkıcı onay dialogu göster (silme/kaldırma işlemleri için)
   * @param title - Alert başlığı
   * @param message - Gösterilecek mesaj
   * @param onConfirm - Kullanıcı onayladığında çalışacak callback
   * @param onCancel - Kullanıcı iptal ettiğinde çalışacak opsiyonel callback
   * @param confirmText - Opsiyonel onayla butonu metni (varsayılan: 'Sil')
   */
  confirmDestructive: (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmText?: string
  ) => void;

  /**
   * Özel konfigürasyonlar için showAlert'e direkt erişim
   */
  showAlert: (config: AlertConfig) => void;

  /**
   * Görünür alert'i gizle
   */
  hideAlert: () => void;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Yaygın alert pattern'leri için kolaylık metodları sağlayan hook
 * AlertProvider içinde kullanılmalıdır
 * 
 * Tüm callback'ler değiştirilmeden iletilir, böylece
 * iş mantığı çağıran component'te kalır
 * 
 * @throws Error AlertProvider dışında kullanılırsa hata fırlatır
 * @returns Kolaylık metodları içeren AlertHelpers objesi
 */
export const useAlertHelpers = (): AlertHelpers => {
  const { showAlert, hideAlert } = useAlert();

  const success = useCallback(
    (message: string, onConfirm?: () => void) => {
      showAlert({
        type: 'success',
        title: 'Başarılı',
        message,
        onConfirm,
        confirmText: 'Tamam',
      });
    },
    [showAlert]
  );

  const error = useCallback(
    (message: string, onConfirm?: () => void) => {
      showAlert({
        type: 'error',
        title: 'Hata',
        message,
        onConfirm,
        confirmText: 'Tamam',
      });
    },
    [showAlert]
  );

  const info = useCallback(
    (message: string, onConfirm?: () => void) => {
      showAlert({
        type: 'info',
        title: 'Bilgi',
        message,
        onConfirm,
        confirmText: 'Tamam',
      });
    },
    [showAlert]
  );

  const confirm = useCallback(
    (
      message: string,
      onConfirm: () => void,
      onCancel?: () => void,
      options?: ConfirmOptions
    ) => {
      showAlert({
        type: 'confirm',
        title: options?.title ?? 'Emin misiniz?',
        message,
        onConfirm,
        onCancel,
        confirmText: options?.confirmText ?? 'Onayla',
        cancelText: options?.cancelText ?? 'İptal',
      });
    },
    [showAlert]
  );

  const confirmDestructive = useCallback(
    (
      title: string,
      message: string,
      onConfirm: () => void,
      onCancel?: () => void,
      confirmText = 'Sil'
    ) => {
      showAlert({
        type: 'confirmDestructive',
        title,
        message,
        onConfirm,
        onCancel,
        confirmText,
        cancelText: 'İptal',
      });
    },
    [showAlert]
  );

  // Gereksiz re-render'ları önlemek için helpers objesini memoize et
  const helpers = useMemo<AlertHelpers>(
    () => ({
      success,
      error,
      info,
      confirm,
      confirmDestructive,
      showAlert,
      hideAlert,
    }),
    [success, error, info, confirm, confirmDestructive, showAlert, hideAlert]
  );

  return helpers;
};
