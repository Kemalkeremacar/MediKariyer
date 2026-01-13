/**
 * @file GradientHeader.tsx
 * @description Gradient arka planlı modern header bileşeni
 * 
 * Bu bileşen sayfa başlıklarında kullanılan gradient efektli header'ı sağlar.
 * İkon, başlık, alt başlık ve dekoratif elementler içerir.
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui/Typography';
import { spacing } from '@/theme';

/**
 * Header arka plan gradient renk setleri
 * Hazır tema varyantları için kullanılır
 */
const HEADER_PRESETS = {
  primary: ['#1D4ED8', '#2563EB', '#3B82F6'] as const,
  profile: ['#6096B4', '#7BA8BE', '#93BFCF'] as const,
} as const;

/**
 * İkon arka plan gradient renk setleri
 * İkon container'ı için hazır renk kombinasyonları
 */
const ICON_PRESETS = {
  blue: ['#2563EB', '#1D4ED8'] as const,
  green: ['#4CAF50', '#388E3C'] as const,
  orange: ['#F59E0B', '#D97706'] as const,
  purple: ['#8B5CF6', '#6D28D9'] as const,
  cyan: ['#06B6D4', '#0891B2'] as const,
  red: ['#EF4444', '#DC2626'] as const,
  teal: ['#2196F3', '#1976D2'] as const,
} as const;

export type HeaderVariant = keyof typeof HEADER_PRESETS;
export type IconColorPreset = keyof typeof ICON_PRESETS;

/**
 * GradientHeader bileşeni için prop tipleri
 * 
 * @interface GradientHeaderProps
 * @property {string} title - Ana başlık metni
 * @property {string} subtitle - Alt başlık metni
 * @property {React.ReactNode} icon - Gösterilecek ikon (genellikle Ionicons)
 * @property {HeaderVariant} [variant] - Hazır header renk teması (primary/profile)
 * @property {readonly [string, string, string]} [gradientColors] - Özel gradient renkleri (variant'ı override eder)
 * @property {IconColorPreset} [iconColorPreset] - Hazır ikon renk teması
 * @property {readonly [string, string]} [iconColors] - Özel ikon gradient renkleri (preset'i override eder)
 * @property {string} [shadowColor] - Header gölge rengi
 * @property {string} [iconShadowColor] - İkon gölge rengi
 * @property {StyleProp<ViewStyle>} [style] - Ek stil özellikleri
 * @property {boolean} [showDots] - Alt başlık yanında nokta göster
 * @property {() => void} [onBackPress] - Geri butonu tıklama fonksiyonu
 * @property {boolean} [showBackButton] - Geri butonu göster (default: false)
 */
export interface GradientHeaderProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  variant?: HeaderVariant;
  gradientColors?: readonly [string, string, string];
  iconColorPreset?: IconColorPreset;
  iconColors?: readonly [string, string];
  shadowColor?: string;
  iconShadowColor?: string;
  style?: StyleProp<ViewStyle>;
  showDots?: boolean;
  onBackPress?: () => void;
  showBackButton?: boolean;
}

/**
 * Gradient header bileşeni
 * 
 * **Özellikler:**
 * - Gradient arka plan efekti
 * - Dekoratif daire elementleri
 * - İkon ile gradient container
 * - Başlık ve alt başlık
 * - Özelleştirilebilir renkler
 * 
 * **Kullanım:**
 * ```tsx
 * <GradientHeader
 *   title="Profilim"
 *   subtitle="Kişisel bilgilerinizi yönetin"
 *   icon={<Ionicons name="person" size={24} color="#FFF" />}
 *   variant="profile"
 *   iconColorPreset="blue"
 * />
 * ```
 * 
 * @param props - GradientHeader prop'ları
 * @returns Gradient header bileşeni
 */
export const GradientHeader: React.FC<GradientHeaderProps> = ({
  title,
  subtitle,
  icon,
  variant = 'primary',
  gradientColors,
  iconColorPreset = 'blue',
  iconColors,
  shadowColor,
  iconShadowColor,
  style,
  showDots = true,
  onBackPress,
  showBackButton = false,
}) => {
  // Renk çözümlemeleri - Özel renkler varsa onları kullan, yoksa preset'leri kullan
  const headerColors = gradientColors || HEADER_PRESETS[variant];
  const resolvedIconColors = iconColors || ICON_PRESETS[iconColorPreset];
  const resolvedShadowColor = shadowColor || (variant === 'primary' ? '#1D4ED8' : '#6096B4');
  const resolvedIconShadowColor = iconShadowColor || resolvedIconColors[0];

  return (
    <LinearGradient
      colors={[...headerColors]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.gradientHeader,
        { shadowColor: resolvedShadowColor },
        style,
      ]}
    >
      {/* Back Button - Sol üst köşe */}
      {showBackButton && onBackPress && (
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={onBackPress}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {/* Dekoratif Elementler - Arka planda daireler */}
      <View style={styles.headerDecoration}>
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />
      </View>

      {/* İçerik Bölümü */}
      <View style={styles.headerContent}>
        {/* İkon Container - Gradient arka planlı */}
        <View style={styles.headerIconWrapper}>
          <LinearGradient
            colors={[...resolvedIconColors]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.headerIconGradient,
              { shadowColor: resolvedIconShadowColor },
            ]}
          >
            {icon}
          </LinearGradient>
        </View>

        {/* Ana Başlık */}
        <Typography variant="h1" style={styles.headerTitle}>
          {title}
        </Typography>

        {/* Alt Başlık - Nokta dekorasyonları ile */}
        <View style={styles.headerSubtitleContainer}>
          {showDots && <View style={styles.headerDot} />}
          <Typography variant="body" style={styles.headerSubtitle}>
            {subtitle}
          </Typography>
          {showDots && <View style={styles.headerDot} />}
        </View>
      </View>
    </LinearGradient>
  );
};

/**
 * Stil tanımlamaları
 * Gradient efektler, gölgeler ve dekoratif elementler için stiller
 */
const styles = StyleSheet.create({
  // Ana gradient header container
  gradientHeader: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: 'relative',
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  backButton: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  decorCircle1: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    top: -50,
    right: -30,
  },
  decorCircle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    bottom: -30,
    left: -20,
  },
  headerContent: {
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  headerIconWrapper: {
    marginBottom: spacing.sm,
  },
  headerIconGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default GradientHeader;
