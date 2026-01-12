/**
 * @file alert.ts
 * @description Alert sistemi tip tanımları
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 * 
 * **Özellikler:**
 * - Global mutable state olmadan sadece React Context kullanan
 *   deterministik alert sistemi için tip tanımları
 */

// ============================================================================
// ALERT TYPES
// ============================================================================

/**
 * Alert tipleri
 * 
 * - success: Olumlu geri bildirim (yeşil ikon)
 * - error: Hata/başarısızlık geri bildirimi (kırmızı ikon)
 * - info: Bilgilendirme mesajı (mavi ikon)
 * - confirm: Onayla/İptal butonlu onay dialogu (amber ikon)
 * - confirmDestructive: Yıkıcı işlem onayı (kırmızı ikon, kırmızı onayla butonu)
 */
export type AlertType = 'success' | 'error' | 'info' | 'confirm' | 'confirmDestructive';

// ============================================================================
// ALERT CONFIGURATION
// ============================================================================

/**
 * Alert gösterme konfigürasyon objesi
 */
export interface AlertConfig {
  /** Alert tipini belirler (ikon ve renk şeması) */
  type: AlertType;
  /** Alert'in üst kısmında gösterilen başlık */
  title: string;
  /** Alert'in mesaj içeriği */
  message: string;
  /** Kullanıcı onayla butonuna bastığında çalışacak callback */
  onConfirm?: () => void;
  /** Kullanıcı iptal butonuna bastığında çalışacak callback (sadece confirm tipleri için) */
  onCancel?: () => void;
  /** Onayla butonu metni (varsayılan: info tipleri için 'Tamam', confirm tipleri için 'Onayla') */
  confirmText?: string;
  /** İptal butonu metni (varsayılan: 'İptal') */
  cancelText?: string;
}

// ============================================================================
// CONTEXT TYPES
// ============================================================================

/**
 * AlertProvider tarafından useAlert hook'u ile sunulan context tipi
 */
export interface AlertContextType {
  /** Verilen konfigürasyonla alert göster */
  showAlert: (config: AlertConfig) => void;
  /** Görünür alert'i gizle */
  hideAlert: () => void;
  /** Şu anda bir alert görünür mü? */
  isVisible: boolean;
}

/**
 * AlertProvider tarafından yönetilen internal state
 */
export interface AlertProviderState {
  /** Mevcut alert konfigürasyonu, alert görünür değilse null */
  config: AlertConfig | null;
  /** Hızlı tıklamalardan kaynaklanan çoklu callback yürütmelerini önlemek için guard flag */
  isExecuting: boolean;
}

// ============================================================================
// REF TYPES
// ============================================================================

/**
 * Component olmayan koddan imperative alert erişimi için ref tipi
 */
export interface AlertRef {
  showAlert: (config: AlertConfig) => void;
  hideAlert: () => void;
}
