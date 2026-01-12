/**
 * @file OfflineNotice.tsx
 * @description Çevrimdışı bağlantı bildirimi bileşeni
 * 
 * Bu bileşen internet bağlantısı kesildiğinde ekranın üstünde
 * animasyonlu bir banner gösterir. Production-ready tasarım.
 * 
 * **Özellikler:**
 * - Animasyonlu giriş/çıkış
 * - Marka uyumlu tasarım
 * - Bağlantı geri geldiğinde otomatik gizlenme
 * - Safe area desteği
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 */

import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from '@/components/ui/Typography';
import { Ionicons } from '@expo/vector-icons';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { colors, spacing } from '@/theme';
import { zIndex } from '@/theme/zIndex';

/**
 * Çevrimdışı bildirim bileşeni
 * 
 * **Animasyon Mantığı:**
 * - Çevrimdışı olunca: Yukarıdan aşağı kayarak giriş
 * - Çevrimiçi olunca: Aşağıdan yukarı kayarak çıkış
 * - Smooth spring animasyonları
 * 
 * **Kullanım:**
 * Bu bileşen genellikle App.tsx veya Screen.tsx'te otomatik olarak kullanılır.
 * Manuel kullanım gerekmez, network durumunu otomatik takip eder.
 * 
 * @returns Çevrimdışı bildirim banner'ı
 */
export const OfflineNotice: React.FC = () => {
  const { isOffline, isInternetReachable } = useNetworkStatus();
  const insets = useSafeAreaInsets();
  
  /**
   * Animasyon değerleri
   * slideAnim: Dikey kayma (-100 → 0)
   * opacityAnim: Opaklık (0 → 1)
   */
  const slideAnim = React.useRef(new Animated.Value(-100)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  /**
   * Banner'ı göster/gizle kontrolü
   * Açıkça çevrimdışı VEYA internet erişilemez durumunda göster
   */
  const shouldShow = isOffline || isInternetReachable === false;

  /**
   * Network durumu değiştiğinde animasyonu tetikle
   */
  useEffect(() => {
    if (shouldShow) {
      // Giriş animasyonu - Yukarıdan aşağı kayarak gir
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Çıkış animasyonu - Aşağıdan yukarı kayarak çık
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [shouldShow, slideAnim, opacityAnim]);

  // Banner gösterilmeyecekse hiçbir şey render etme
  if (!shouldShow) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          top: insets.top, // Safe area desteği
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={styles.content}>
        {/* Çevrimdışı ikonu */}
        <View style={styles.iconContainer}>
          <Ionicons name="cloud-offline" size={20} color="#FFFFFF" />
        </View>
        
        {/* Bildirim metni */}
        <Typography variant="body" style={styles.text}>
          İnternet bağlantısı yok
        </Typography>
        
        {/* Pulse göstergesi */}
        <View style={styles.pulseContainer}>
          <View style={styles.pulse} />
        </View>
      </View>
    </Animated.View>
  );
};

/**
 * Stil tanımlamaları
 * Üstte sabit konumlu animasyonlu banner tasarımı
 */
const styles = StyleSheet.create({
  // Ana container - Absolute positioning ile üstte sabit
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: zIndex.offlineNotice, // En üstte görünsün
    backgroundColor: colors.error[600],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    // Platform bazlı gölge efekti
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  iconContainer: {
    marginRight: spacing.xs,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  pulseContainer: {
    marginLeft: spacing.xs,
    width: 8,
    height: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    opacity: 0.8,
  },
});

