/**
 * @file Toast.tsx
 * @description Engellemeyen mesaj bildirimi bileşeni
 * 
 * Özellikler:
 * - Dört toast tipi (success, error, warning, info)
 * - Animasyonlu giriş/çıkış
 * - Otomatik kapanma
 * - İkon ve renk şeması
 * - Prop validasyonu (geliştirici modu)
 * 
 * Gereksinimler:
 * - 4.5: Toast tiplerini destekle: success, error, warning, info
 * - 9.6: Açıklayıcı prop validasyon hataları sağla
 * 
 * Kullanım:
 * ```tsx
 * <Toast message="İşlem başarılı" type="success" duration={3000} />
 * ```
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import React, { useEffect } from 'react';
import { StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@/theme';
import { Typography } from './Typography';

/**
 * Toast tipi
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Toast bileşeni props interface'i
 */
export interface ToastProps {
  /** Toast mesajı */
  message: string;
  /** Toast tipi */
  type?: ToastType;
  /** Görünme süresi (milisaniye) */
  duration?: number;
  /** Kapandığında çağrılır */
  onHide?: () => void;
}

/** Geçerli toast tipleri (prop validasyonu için) */
const VALID_TOAST_TYPES: ToastType[] = ['success', 'error', 'warning', 'info'];

/**
 * Toast için geliştirici modu prop validasyonu
 * Geçersiz props için açıklayıcı hatalar loglar (Gereksinim 9.6)
 * 
 * @param {ToastProps} props - Doğrulanacak bileşen props'ları
 * @returns {boolean} Tüm props geçerliyse true, değilse false
 */
const validateProps = (props: ToastProps): boolean => {
  if (!__DEV__) return true;
  
  let isValid = true;
  
  // message prop'unu doğrula
  if (typeof props.message !== 'string') {
    console.error(
      `[Toast] Geçersiz prop 'message': string bekleniyor, ${typeof props.message} alındı. ` +
      `Toast mesajı string olmalıdır.`
    );
    isValid = false;
  } else if (props.message.trim() === '') {
    console.warn(
      `[Toast] Uyarı: 'message' prop'u boş string. ` +
      `Daha iyi kullanıcı deneyimi için anlamlı bir mesaj sağlamayı düşünün.`
    );
  }
  
  // type prop'unu doğrula (opsiyonel, varsayılan 'info')
  if (props.type !== undefined && !VALID_TOAST_TYPES.includes(props.type)) {
    console.error(
      `[Toast] Geçersiz prop 'type': '${props.type}' alındı. ` +
      `Geçerli tipler: ${VALID_TOAST_TYPES.join(', ')}. Varsayılan 'info' kullanılacak.`
    );
    isValid = false;
  }
  
  // duration prop'unu doğrula (opsiyonel)
  if (props.duration !== undefined) {
    if (typeof props.duration !== 'number') {
      console.error(
        `[Toast] Geçersiz prop 'duration': number bekleniyor, ${typeof props.duration} alındı. ` +
        `Süre milisaniye cinsinden bir sayı olmalıdır.`
      );
      isValid = false;
    } else if (props.duration <= 0) {
      console.warn(
        `[Toast] Uyarı: 'duration' prop'u ${props.duration}ms. ` +
        `Toast'un görünür olması için pozitif bir süre kullanmayı düşünün.`
      );
    } else if (props.duration < 500) {
      console.warn(
        `[Toast] Uyarı: 'duration' prop'u ${props.duration}ms çok kısa. ` +
        `Kullanıcılar mesajı okumak için yeterli zamana sahip olmayabilir.`
      );
    }
  }
  
  // onHide prop'unu doğrula (opsiyonel)
  if (props.onHide !== undefined && typeof props.onHide !== 'function') {
    console.error(
      `[Toast] Geçersiz prop 'onHide': function veya undefined bekleniyor, ${typeof props.onHide} alındı. ` +
      `onHide callback'i bir fonksiyon olmalıdır.`
    );
    isValid = false;
  }
  
  return isValid;
};

/**
 * İkon haritası (toast tipine göre)
 */
const iconMap = {
  success: 'checkmark-circle' as const,
  error: 'close-circle' as const,
  warning: 'alert-circle' as const,
  info: 'information-circle' as const,
};

/**
 * Renk haritası (toast tipine göre)
 */
const colorMap = {
  success: colors.success[600],
  error: colors.error[600],
  warning: colors.warning[600],
  info: colors.primary[600],
};

/**
 * Arka plan renk haritası (toast tipine göre)
 */
const bgColorMap = {
  success: colors.success[50],
  error: colors.error[50],
  warning: colors.warning[50],
  info: colors.primary[50],
};

/**
 * Toast Bileşeni
 * Animasyonlu bildirim mesajı
 */
export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onHide,
}) => {
  // Geliştirme modunda props'ları doğrula (Gereksinim 9.6)
  useEffect(() => {
    validateProps({ message, type, duration, onHide });
  }, [message, type, duration, onHide]);

  // Animasyon değerlerini render'lar arasında korumak için useRef kullan
  const opacity = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(-20)).current;
  
  // Unmount'ta temizlik için animasyon referanslarını takip et (Gereksinim 10.6)
  const animationRef = React.useRef<Animated.CompositeAnimation | null>(null);
  const hideAnimationRef = React.useRef<Animated.CompositeAnimation | null>(null);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = React.useRef(true);
  
  const iconName = iconMap[type];

  useEffect(() => {
    isMountedRef.current = true;
    
    // Gösterim animasyonunu başlat
    animationRef.current = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]);
    
    animationRef.current.start(() => {
      // Animasyon tamamlandıktan sonra referansı temizle
      animationRef.current = null;
    });

    timerRef.current = setTimeout(() => {
      if (!isMountedRef.current) return;
      
      // Gizleme animasyonunu başlat
      hideAnimationRef.current = Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -20,
          duration: 300,
          useNativeDriver: true,
        }),
      ]);
      
      hideAnimationRef.current.start(() => {
        // Animasyon tamamlandıktan sonra referansı temizle
        hideAnimationRef.current = null;
        // Sadece hala mount edilmişse onHide'ı çağır
        if (isMountedRef.current) {
          onHide?.();
        }
      });
    }, duration);

    // Temizlik fonksiyonu - unmount'ta animasyonları ve timer'ları iptal et (Gereksinim 10.6)
    return () => {
      isMountedRef.current = false;
      
      // Timer'ı temizle
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      
      // Çalışıyorsa gösterim animasyonunu iptal et
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }
      
      // Çalışıyorsa gizleme animasyonunu iptal et
      if (hideAnimationRef.current) {
        hideAnimationRef.current.stop();
        hideAnimationRef.current = null;
      }
    };
  }, [duration, onHide, opacity, translateY]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: bgColorMap[type],
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <Ionicons name={iconName} size={20} color={colorMap[type]} />
      <Typography variant="body" style={{ ...styles.message, color: colorMap[type] }}>
        {message}
      </Typography>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
});
