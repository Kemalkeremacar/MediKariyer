/**
 * @file CustomAlert.tsx
 * @description Özel uyarı dialog bileşeni (Stateless - sadece görsel)
 * 
 * Tüm callback mantığı AlertProvider tarafından yönetilir.
 * Bu bileşen sadece şunları yapar:
 * - Animasyon
 * - Props'lara göre UI render etme
 * - Buton tıklamalarını provider callback'lerine iletme
 * 
 * Özellikler:
 * - Beş alert tipi (success, error, info, confirm, confirmDestructive)
 * - Animasyonlu giriş/çıkış
 * - İkon ve renk şeması
 * - Tek veya çift buton desteği
 * - Callback doğrulama ve hata yönetimi
 * - Geliştirici modu prop validasyonu
 * 
 * Gereksinimler:
 * - 2.1: onConfirm callback çalıştırma (provider'a delege edilir)
 * - 2.2: onCancel callback çalıştırma (provider'a delege edilir)
 * - 2.3: onClose callback temizlik için (provider tarafından yönetilir)
 * - 9.4: Callback'leri çağırmadan önce fonksiyon olduğunu doğrula
 * - 9.6: Açıklayıcı prop validasyon hataları sağla
 * - 10.5: Callback çalıştırmayı try-catch ile sar, sadece dev modda logla
 * 
 * Kullanım:
 * ```tsx
 * <CustomAlert
 *   visible={true}
 *   type="success"
 *   title="Başarılı"
 *   message="İşlem tamamlandı"
 *   onConfirm={handleConfirm}
 *   onCancel={handleCancel}
 * />
 * ```
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import React, { useRef, useEffect } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from './Typography';
import { Button } from './Button';
import type { AlertType } from '@/types/alert';

// Geriye dönük uyumluluk için AlertType'ı yeniden export et
export type { AlertType } from '@/types/alert';

/**
 * CustomAlert bileşeni props interface'i
 */
interface CustomAlertProps {
  /** Alert görünür mü? */
  visible: boolean;
  /** Alert tipi (ikon ve renk şemasını belirler) */
  type: AlertType;
  /** Alert başlığı */
  title: string;
  /** Alert mesajı */
  message: string;
  /** Onayla butonu tıklandığında çağrılır - provider tarafından yönetilir */
  onConfirm: () => void;
  /** İptal butonu tıklandığında çağrılır - provider tarafından yönetilir */
  onCancel: () => void;
  /** Onayla butonu metni */
  confirmText?: string;
  /** İptal butonu metni */
  cancelText?: string;
}

/**
 * Alert tiplerine göre ikon konfigürasyonu
 */
const ICON_CONFIG: Record<AlertType, { name: keyof typeof Ionicons.glyphMap; color: string }> = {
  success: { name: 'checkmark-circle', color: '#10B981' },
  error: { name: 'close-circle', color: '#EF4444' },
  info: { name: 'information-circle', color: '#3B82F6' },
  confirm: { name: 'help-circle', color: '#F59E0B' },
  confirmDestructive: { name: 'warning', color: '#EF4444' },
};

/** Geçerli alert tipleri (prop validasyonu için) */
const VALID_ALERT_TYPES: AlertType[] = ['success', 'error', 'info', 'confirm', 'confirmDestructive'];

/**
 * CustomAlert için geliştirici modu prop validasyonu
 * Geçersiz props için açıklayıcı hatalar loglar (Gereksinim 9.6)
 * 
 * @param {CustomAlertProps} props - Doğrulanacak bileşen props'ları
 * @returns {boolean} Tüm props geçerliyse true, değilse false
 */
const validateProps = (props: CustomAlertProps): boolean => {
  if (!__DEV__) return true;
  
  let isValid = true;
  
  // visible prop'unu doğrula
  if (typeof props.visible !== 'boolean') {
    console.error(
      `[CustomAlert] Geçersiz prop 'visible': boolean bekleniyor, ${typeof props.visible} alındı. ` +
      `Alert görünürlük durumu boolean değer olmalıdır.`
    );
    isValid = false;
  }
  
  // type prop'unu doğrula
  if (!VALID_ALERT_TYPES.includes(props.type)) {
    console.error(
      `[CustomAlert] Geçersiz prop 'type': '${props.type}' alındı. ` +
      `Geçerli tipler: ${VALID_ALERT_TYPES.join(', ')}.`
    );
    isValid = false;
  }
  
  // title prop'unu doğrula
  if (typeof props.title !== 'string') {
    console.error(
      `[CustomAlert] Geçersiz prop 'title': string bekleniyor, ${typeof props.title} alındı. ` +
      `Alert başlığı string olmalıdır.`
    );
    isValid = false;
  } else if (props.title.trim() === '') {
    console.warn(
      `[CustomAlert] Uyarı: 'title' prop'u boş string. ` +
      `Daha iyi kullanıcı deneyimi için anlamlı bir başlık sağlamayı düşünün.`
    );
  }
  
  // message prop'unu doğrula
  if (typeof props.message !== 'string') {
    console.error(
      `[CustomAlert] Geçersiz prop 'message': string bekleniyor, ${typeof props.message} alındı. ` +
      `Alert mesajı string olmalıdır.`
    );
    isValid = false;
  }
  
  // onConfirm prop'unu doğrula
  if (typeof props.onConfirm !== 'function') {
    console.error(
      `[CustomAlert] Geçersiz prop 'onConfirm': function bekleniyor, ${typeof props.onConfirm} alındı. ` +
      `onConfirm callback'i AlertProvider tarafından sağlanan bir fonksiyon olmalıdır.`
    );
    isValid = false;
  }
  
  // onCancel prop'unu doğrula
  if (typeof props.onCancel !== 'function') {
    console.error(
      `[CustomAlert] Geçersiz prop 'onCancel': function bekleniyor, ${typeof props.onCancel} alındı. ` +
      `onCancel callback'i AlertProvider tarafından sağlanan bir fonksiyon olmalıdır.`
    );
    isValid = false;
  }
  
  // Opsiyonel confirmText prop'unu doğrula
  if (props.confirmText !== undefined && typeof props.confirmText !== 'string') {
    console.error(
      `[CustomAlert] Geçersiz prop 'confirmText': string veya undefined bekleniyor, ${typeof props.confirmText} alındı. ` +
      `Onayla butonu metni string olmalıdır.`
    );
    isValid = false;
  }
  
  // Opsiyonel cancelText prop'unu doğrula
  if (props.cancelText !== undefined && typeof props.cancelText !== 'string') {
    console.error(
      `[CustomAlert] Geçersiz prop 'cancelText': string veya undefined bekleniyor, ${typeof props.cancelText} alındı. ` +
      `İptal butonu metni string olmalıdır.`
    );
    isValid = false;
  }
  
  return isValid;
};

/**
 * Callback'i doğrulama ve hata yönetimi ile güvenli şekilde çalıştırır
 * - Çağırmadan önce callback'in fonksiyon olduğunu doğrular (Gereksinim 9.4)
 * - Çalıştırmayı try-catch ile sarar (Gereksinim 10.5)
 * - Sadece geliştirme modunda hataları loglar (Gereksinim 10.5)
 * 
 * @param {(() => void) | undefined} callback - Çalıştırılacak callback fonksiyonu
 * @param {string} callbackName - Hata loglama için callback adı
 */
const safeExecuteCallback = (
  callback: (() => void) | undefined,
  callbackName: string
): void => {
  // Çağırmadan önce callback'in fonksiyon olduğunu doğrula (Gereksinim 9.4)
  if (typeof callback !== 'function') {
    if (__DEV__) {
      console.warn(`[CustomAlert] ${callbackName} fonksiyon değil, çalıştırma atlanıyor`);
    }
    return;
  }

  // Callback çalıştırmayı try-catch ile sar (Gereksinim 10.5)
  try {
    callback();
  } catch (error) {
    // Sadece geliştirme modunda hataları logla (Gereksinim 10.5)
    if (__DEV__) {
      console.error(`[CustomAlert] ${callbackName} çalıştırılırken hata:`, error);
    }
    // Çökmeden devam et - alert yine de kapanacak
  }
};

/**
 * CustomAlert Bileşeni
 * Modern, animasyonlu uyarı dialog'u
 */
export const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  type,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Tamam',
  cancelText = 'İptal',
}) => {
  // Geliştirme modunda props'ları doğrula (Gereksinim 9.6)
  useEffect(() => {
    validateProps({ visible, type, title, message, onConfirm, onCancel, confirmText, cancelText });
  }, [visible, type, title, message, onConfirm, onCancel, confirmText, cancelText]);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const isMountedRef = useRef(true);

  // Animasyon temizliği için mount durumunu takip et
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      // Unmount'ta çalışan animasyonu iptal et (bellek sızıntısını önle)
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (visible) {
      // Temizlik için animasyon referansını sakla
      animationRef.current = Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      });
      animationRef.current.start(() => {
        // Animasyon tamamlandıktan sonra referansı temizle
        animationRef.current = null;
      });
    } else {
      // Sıfırlamadan önce çalışan animasyonu iptal et
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }
      // Görünür değilken animasyon değerini sıfırla
      scaleAnim.setValue(0);
    }
  }, [visible, scaleAnim]);

  const iconConfig = ICON_CONFIG[type];
  const isConfirmType = type === 'confirm' || type === 'confirmDestructive';
  const isDestructive = type === 'confirmDestructive';

  /**
   * Onayla butonu tıklamasını işle
   * onConfirm callback'ini doğrular ve güvenli şekilde çalıştırır
   */
  const handleConfirmPress = (): void => {
    safeExecuteCallback(onConfirm, 'onConfirm');
  };

  /**
   * İptal butonu tıklamasını işle
   * onCancel callback'ini doğrular ve güvenli şekilde çalıştırır
   */
  const handleCancelPress = (): void => {
    safeExecuteCallback(onCancel, 'onCancel');
  };

  /**
   * Confirm olmayan alert tipleri için kapatma işlemini işle
   * Tek butonlu alert'ler için kapatma, confirm callback'ini tetikler
   */
  const handleDismiss = (): void => {
    handleConfirmPress();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={isConfirmType ? handleCancelPress : handleDismiss}
      statusBarTranslucent
      {...(Platform.OS === 'ios' && { presentationStyle: 'overFullScreen' })}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.alertContainer, { transform: [{ scale: scaleAnim }] }]}>
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: `${iconConfig.color}15` }]}>
            <Ionicons name={iconConfig.name} size={48} color={iconConfig.color} />
          </View>

          {/* Title */}
          <Typography variant="h3" style={styles.title}>
            {title}
          </Typography>

          {/* Message */}
          <Typography variant="body" style={styles.message}>
            {message}
          </Typography>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {isConfirmType ? (
              <>
                <Button
                  variant="outline"
                  label={cancelText}
                  onPress={handleCancelPress}
                  style={styles.button}
                />
                <TouchableOpacity
                  style={[
                    styles.button,
                    isDestructive ? styles.destructiveButton : styles.confirmButton,
                  ]}
                  onPress={handleConfirmPress}
                  activeOpacity={0.8}
                >
                  <Typography variant="body" style={styles.confirmButtonText}>
                    {confirmText}
                  </Typography>
                </TouchableOpacity>
              </>
            ) : (
              <Button
                variant="gradient"
                label={confirmText}
                onPress={handleDismiss}
                gradientColors={['#4A90E2', '#2E5C8A']}
                fullWidth
              />
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  alertContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  button: {
    flex: 1,
  },
  confirmButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  destructiveButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
});
