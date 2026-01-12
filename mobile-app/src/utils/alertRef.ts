/**
 * @file alertRef.ts
 * @description Component olmayan kodlar için imperative alert API
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 * 
 * **Özellikler:**
 * - API interceptor'lar ve utility fonksiyonlarından alert gösterme
 * - AlertProvider mount olduğunda useImperativeHandle ile bağlanır
 * - Provider mount değilse native Alert.alert'e fallback
 * 
 * **Gereksinim:** 8.5
 * 
 * **Kullanım (component olmayan kodda):**
 * ```typescript
 * import { imperativeAlert } from '@/utils/alertRef';
 * 
 * // API interceptor'da
 * if (error.response?.status === 401) {
 *   imperativeAlert.error('Oturum süresi doldu');
 * }
 * ```
 */

import { createRef } from 'react';
import { Alert, AlertButton } from 'react-native';
import type { AlertConfig, AlertRef } from '@/types/alert';
import { overlayDevLog } from '@/utils/devLogger';

// ============================================================================
// ALERT REF
// ============================================================================

/**
 * AlertProvider'ın useImperativeHandle ile bağlandığı ref
 * Component olmayan kodların alert fonksiyonalitesine erişmesini sağlar
 */
export const alertRef = createRef<AlertRef>();

// ============================================================================
// IMPERATIVE ALERT API
// ============================================================================

/**
 * Component olmayan kodlar için imperative alert API
 * AlertProvider mount değilse native Alert.alert'e fallback yapar
 * 
 * **NOT:** Component'lerde useAlertHelpers hook'unu kullanın.
 * Bu API şunlar için tasarlanmıştır:
 * - API interceptor'lar
 * - React component tree dışında çağrılan utility fonksiyonlar
 * - Component olmayan koddaki hata handler'lar
 */
export const imperativeAlert = {
  /**
   * Başarı alert'i göster
   * 
   * @param message - Gösterilecek mesaj
   * @param onConfirm - Kullanıcı onayladığında çalışacak opsiyonel callback
   * 
   * @example
   * ```typescript
   * imperativeAlert.success('İşlem başarılı');
   * imperativeAlert.success('Kayıt tamamlandı', () => navigate('Home'));
   * ```
   */
  success: (message: string, onConfirm?: () => void) => {
    if (alertRef.current) {
      alertRef.current.showAlert({
        type: 'success',
        title: 'Başarılı',
        message,
        onConfirm,
        confirmText: 'Tamam',
      });
    } else {
      overlayDevLog('[alertRef] AlertProvider not mounted, falling back to native Alert');
      Alert.alert('Başarılı', message, [{ text: 'Tamam', onPress: onConfirm }]);
    }
  },

  /**
   * Hata alert'i göster
   * 
   * @param message - Gösterilecek mesaj
   * @param onConfirm - Kullanıcı onayladığında çalışacak opsiyonel callback
   * 
   * @example
   * ```typescript
   * imperativeAlert.error('Bir hata oluştu');
   * imperativeAlert.error('Bağlantı hatası', () => retry());
   * ```
   */
  error: (message: string, onConfirm?: () => void) => {
    if (alertRef.current) {
      alertRef.current.showAlert({
        type: 'error',
        title: 'Hata',
        message,
        onConfirm,
        confirmText: 'Tamam',
      });
    } else {
      overlayDevLog('[alertRef] AlertProvider not mounted, falling back to native Alert');
      Alert.alert('Hata', message, [{ text: 'Tamam', onPress: onConfirm }]);
    }
  },

  /**
   * Bilgi alert'i göster
   * 
   * @param message - Gösterilecek mesaj
   * @param onConfirm - Kullanıcı onayladığında çalışacak opsiyonel callback
   * 
   * @example
   * ```typescript
   * imperativeAlert.info('Yeni güncelleme mevcut');
   * ```
   */
  info: (message: string, onConfirm?: () => void) => {
    if (alertRef.current) {
      alertRef.current.showAlert({
        type: 'info',
        title: 'Bilgi',
        message,
        onConfirm,
        confirmText: 'Tamam',
      });
    } else {
      overlayDevLog('[alertRef] AlertProvider not mounted, falling back to native Alert');
      Alert.alert('Bilgi', message, [{ text: 'Tamam', onPress: onConfirm }]);
    }
  },

  /**
   * Onay dialogu göster
   * 
   * @param message - Gösterilecek mesaj
   * @param onConfirm - Kullanıcı onayladığında çalışacak callback
   * @param onCancel - Kullanıcı iptal ettiğinde çalışacak opsiyonel callback
   * @param options - Opsiyonel başlık ve buton metni override'ları
   * 
   * @example
   * ```typescript
   * imperativeAlert.confirm(
   *   'Değişiklikleri kaydetmek istiyor musunuz?',
   *   () => save(),
   *   () => discard()
   * );
   * ```
   */
  confirm: (
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    options?: { title?: string; confirmText?: string; cancelText?: string }
  ) => {
    if (alertRef.current) {
      alertRef.current.showAlert({
        type: 'confirm',
        title: options?.title ?? 'Emin misiniz?',
        message,
        onConfirm,
        onCancel,
        confirmText: options?.confirmText ?? 'Onayla',
        cancelText: options?.cancelText ?? 'İptal',
      });
    } else {
      overlayDevLog('[alertRef] AlertProvider not mounted, falling back to native Alert');
      Alert.alert(options?.title ?? 'Emin misiniz?', message, [
        { text: options?.cancelText ?? 'İptal', style: 'cancel', onPress: onCancel },
        { text: options?.confirmText ?? 'Onayla', onPress: onConfirm },
      ]);
    }
  },

  /**
   * Yıkıcı işlem onay dialogu göster (silme/kaldırma işlemleri için)
   * 
   * @param title - Alert başlığı
   * @param message - Gösterilecek mesaj
   * @param onConfirm - Kullanıcı onayladığında çalışacak callback
   * @param onCancel - Kullanıcı iptal ettiğinde çalışacak opsiyonel callback
   * @param confirmText - Opsiyonel onayla butonu metni (varsayılan: 'Sil')
   * 
   * @example
   * ```typescript
   * imperativeAlert.confirmDestructive(
   *   'Öğeyi Sil',
   *   'Bu işlem geri alınamaz',
   *   () => deleteItem()
   * );
   * ```
   */
  confirmDestructive: (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmText = 'Sil'
  ) => {
    if (alertRef.current) {
      alertRef.current.showAlert({
        type: 'confirmDestructive',
        title,
        message,
        onConfirm,
        onCancel,
        confirmText,
        cancelText: 'İptal',
      });
    } else {
      overlayDevLog('[alertRef] AlertProvider not mounted, falling back to native Alert');
      Alert.alert(title, message, [
        { text: 'İptal', style: 'cancel', onPress: onCancel },
        { text: confirmText, style: 'destructive', onPress: onConfirm },
      ]);
    }
  },

  /**
   * Tam konfigürasyonla özel alert göster
   * 
   * @param config - Tam alert konfigürasyonu
   * 
   * @example
   * ```typescript
   * imperativeAlert.custom({
   *   type: 'confirm',
   *   title: 'Özel Başlık',
   *   message: 'Özel mesaj',
   *   onConfirm: () => console.log('Onaylandı'),
   *   confirmText: 'Evet',
   *   cancelText: 'Hayır',
   * });
   * ```
   */
  custom: (config: AlertConfig) => {
    if (alertRef.current) {
      alertRef.current.showAlert(config);
    } else {
      overlayDevLog('[alertRef] AlertProvider not mounted, falling back to native Alert');
      const buttons: AlertButton[] = [];
      
      if (config.type === 'confirm' || config.type === 'confirmDestructive') {
        buttons.push({
          text: config.cancelText ?? 'İptal',
          style: 'cancel',
          onPress: config.onCancel,
        });
        buttons.push({
          text: config.confirmText ?? 'Tamam',
          style: config.type === 'confirmDestructive' ? 'destructive' : 'default',
          onPress: config.onConfirm,
        });
      } else {
        buttons.push({
          text: config.confirmText ?? 'Tamam',
          onPress: config.onConfirm,
        });
      }
      
      Alert.alert(config.title, config.message, buttons);
    }
  },

  /**
   * Görünür alert'i gizle
   * Sadece AlertProvider mount olduğunda çalışır
   * 
   * @example
   * ```typescript
   * imperativeAlert.hide();
   * ```
   */
  hide: () => {
    if (alertRef.current) {
      alertRef.current.hideAlert();
    } else {
      overlayDevLog('[alertRef] AlertProvider not mounted, cannot hide alert');
    }
  },
};
