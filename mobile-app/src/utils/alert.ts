/**
 * @file alert.ts
 * @description Alert helper - Tüm alert mesajlarını merkezi olarak yönetir
 * 
 * Faydaları:
 * - Tutarlı alert formatı
 * - Daha az kod tekrarı
 * - Güzel animasyonlu alert'ler
 * - TypeScript tip güvenliği
 * 
 * @author MediKariyer Development Team
 * @version 2.0.0
 * @since 2024
 */

import { Alert, AlertButton } from 'react-native';

// Global alert handler - AlertProvider tarafından set edilecek
let globalAlertHandler: any = null;

export const setGlobalAlertHandler = (handler: any) => {
  globalAlertHandler = handler;
};

/**
 * Alert helper fonksiyonları
 * 
 * Kullanım:
 * ```typescript
 * import { showAlert } from '@/utils/alert';
 * 
 * showAlert.success('İşlem başarılı');
 * showAlert.error('Bir hata oluştu');
 * showAlert.confirm('Emin misiniz?', () => handleDelete());
 * ```
 */
export const showAlert = {
  /**
   * Başarı mesajı göster
   * @param message - Gösterilecek mesaj
   * @param onPress - Tamam butonuna basıldığında çalışacak fonksiyon (opsiyonel)
   */
  success: (message: string, onPress?: () => void) => {
    if (globalAlertHandler) {
      globalAlertHandler.showAlert({
        type: 'success',
        title: 'Başarılı',
        message,
        onConfirm: onPress,
        confirmText: 'Tamam',
      });
    } else {
      Alert.alert('Başarılı', message, [{ text: 'Tamam', onPress }]);
    }
  },

  /**
   * Hata mesajı göster
   * @param message - Gösterilecek hata mesajı
   * @param onPress - Tamam butonuna basıldığında çalışacak fonksiyon (opsiyonel)
   */
  error: (message: string, onPress?: () => void) => {
    if (globalAlertHandler) {
      globalAlertHandler.showAlert({
        type: 'error',
        title: 'Hata',
        message,
        onConfirm: onPress,
        confirmText: 'Tamam',
      });
    } else {
      Alert.alert('Hata', message, [{ text: 'Tamam', onPress }]);
    }
  },

  /**
   * Bilgi mesajı göster
   * @param message - Gösterilecek bilgi mesajı
   * @param onPress - Tamam butonuna basıldığında çalışacak fonksiyon (opsiyonel)
   */
  info: (message: string, onPress?: () => void) => {
    if (globalAlertHandler) {
      globalAlertHandler.showAlert({
        type: 'info',
        title: 'Bilgi',
        message,
        onConfirm: onPress,
        confirmText: 'Tamam',
      });
    } else {
      Alert.alert('Bilgi', message, [{ text: 'Tamam', onPress }]);
    }
  },

  /**
   * Onay dialogu göster
   * @param message - Onay mesajı
   * @param onConfirm - Onayla butonuna basıldığında çalışacak fonksiyon
   * @param onCancel - İptal butonuna basıldığında çalışacak fonksiyon (opsiyonel)
   * @param options - Ek seçenekler (başlık, buton metinleri)
   */
  confirm: (
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    options?: {
      title?: string;
      confirmText?: string;
      cancelText?: string;
    }
  ) => {
    if (globalAlertHandler) {
      globalAlertHandler.showAlert({
        type: 'confirm',
        title: options?.title || 'Emin misiniz?',
        message,
        onConfirm,
        confirmText: options?.confirmText || 'Onayla',
        cancelText: options?.cancelText || 'İptal',
      });
    } else {
      Alert.alert(
        options?.title || 'Emin misiniz?',
        message,
        [
          {
            text: options?.cancelText || 'İptal',
            style: 'cancel',
            onPress: onCancel,
          },
          {
            text: options?.confirmText || 'Onayla',
            onPress: onConfirm,
          },
        ]
      );
    }
  },

  /**
   * Tehlikeli işlem onay dialogu göster (kırmızı buton)
   * @param title - Dialog başlığı
   * @param message - Onay mesajı
   * @param onConfirm - Onayla butonuna basıldığında çalışacak fonksiyon
   * @param onCancel - İptal butonuna basıldığında çalışacak fonksiyon (opsiyonel)
   * @param confirmText - Onayla butonu metni (varsayılan: "Sil")
   */
  confirmDestructive: (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    confirmText: string = 'Sil'
  ) => {
    if (globalAlertHandler) {
      globalAlertHandler.showAlert({
        type: 'confirmDestructive',
        title,
        message,
        onConfirm,
        onCancel,
        confirmText,
        cancelText: 'İptal',
      });
    } else {
      Alert.alert(
        title,
        message,
        [
          {
            text: 'İptal',
            style: 'cancel',
            onPress: onCancel,
          },
          {
            text: confirmText,
            style: 'destructive',
            onPress: onConfirm,
          },
        ]
      );
    }
  },

  /**
   * Özel alert göster (tam kontrol)
   * @param title - Alert başlığı
   * @param message - Alert mesajı
   * @param buttons - Butonlar dizisi
   */
  custom: (title: string, message: string, buttons: AlertButton[]) => {
    // Custom alerts için native Alert kullan
    Alert.alert(title, message, buttons);
  },
};

/**
 * Geriye uyumluluk için - eski Alert.alert kullanımlarını destekler
 * @deprecated showAlert kullanın
 */
export const alert = Alert.alert;
