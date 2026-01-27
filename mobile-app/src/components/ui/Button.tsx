/**
 * @file Button.tsx
 * @description Modern buton bileşeni
 * 
 * Özellikler:
 * - Farklı varyantlar (primary, secondary, outline, ghost, gradient, destructive)
 * - Üç boyut seçeneği (sm, md, lg)
 * - Yükleme durumu göstergesi
 * - Devre dışı bırakma
 * - Tam genişlik seçeneği
 * - Gradient renk desteği
 * - Dokunmatik geri bildirim (haptic feedback)
 * - Animasyonlu basma efekti
 * - Erişilebilirlik desteği
 * 
 * Kullanım:
 * ```tsx
 * <Button variant="primary" onPress={handlePress}>Kaydet</Button>
 * <Button variant="gradient" loading fullWidth>Yükleniyor...</Button>
 * ```
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Button bileşeni props interface'i
 */
export interface ButtonProps {
  /** Buton varyantı */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'gradient' | 'destructive' | 'danger';
  /** Buton boyutu */
  size?: 'sm' | 'md' | 'lg';
  /** Yükleme durumu */
  loading?: boolean;
  /** Devre dışı durumu */
  disabled?: boolean;
  /** Tam genişlik */
  fullWidth?: boolean;
  /** Tıklama fonksiyonu */
  onPress: () => void;
  /** Buton metni */
  label?: string;
  /** Buton içeriği (label yerine kullanılabilir) */
  children?: React.ReactNode;
  /** Ek stil */
  style?: ViewStyle;
  /** Metin stili */
  textStyle?: TextStyle;
  /** Gradient renkleri */
  gradientColors?: [string, string];
  /** Erişilebilirlik etiketi (ekran okuyucular için) */
  accessibilityLabel?: string;
  /** Erişilebilirlik ipucu (ekran okuyucular için) */
  accessibilityHint?: string;
  /** İkon (label'ın solunda gösterilir) */
  icon?: React.ReactNode;
}

/**
 * Button Bileşeni
 * Modern, animasyonlu ve erişilebilir buton
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  onPress,
  label,
  children,
  style,
  textStyle,
  gradientColors,
  accessibilityLabel,
  accessibilityHint,
  icon,
}) => {
  const { theme } = useTheme();
  const isDisabled = disabled || loading;

  // danger variant'ı destructive'e çevir (alias)
  const effectiveVariant = variant === 'danger' ? 'destructive' : variant;

  const styles = useMemo(() => createStyles(theme), [theme]);
  
  const content = label || children;

  // Zıplayan basma animasyonu
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    // Buton basıldığında hafif dokunsal geri bildirim
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1.02, { damping: 15, stiffness: 400 }, () => {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    });
  };

  /**
   * Gradient renklerini döndürür
   */
  const getGradientColors = (): [string, string] => {
    if (gradientColors) {
      return gradientColors;
    }
    if (effectiveVariant === 'gradient') {
      return ['#6096B4', '#93BFCF']; // Mavi gradient (web ile eşleşir)
    }
    if (effectiveVariant === 'primary') {
      return ['#60A5FA', '#3B82F6']; // Modern açık mavi gradient
    }
    if (effectiveVariant === 'secondary') {
      return ['#38BDF8', '#0EA5E9']; // Gök mavisi gradient
    }
    if (effectiveVariant === 'destructive') {
      return ['#EF4444', '#DC2626']; // Kırmızı gradient
    }
    return ['transparent', 'transparent'];
  };

  const renderContent = () => (
    <>
      {loading ? (
        <ActivityIndicator
          color={
            effectiveVariant === 'outline' || effectiveVariant === 'ghost'
              ? theme.colors.primary[600]
              : effectiveVariant === 'destructive'
              ? theme.colors.text.inverse
              : theme.colors.text.inverse
          }
        />
      ) : (
        <>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text
            allowFontScaling={false}
            maxFontSizeMultiplier={1}
            style={[
              styles.text,
              styles[`text_${effectiveVariant}`] || styles.text_primary,
              styles[`textSize_${size}`],
              isDisabled && styles.textDisabled,
              textStyle,
            ]}
          >
            {content}
          </Text>
        </>
      )}
    </>
  );

  if (effectiveVariant === 'primary' || effectiveVariant === 'secondary' || effectiveVariant === 'gradient' || effectiveVariant === 'destructive') {
    return (
      <AnimatedPressable
        style={[
          styles.base,
          styles[`size_${size}`],
          fullWidth && styles.fullWidth,
          isDisabled && styles.disabled,
          style,
          animatedStyle,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel || (typeof label === 'string' ? label : undefined)}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
      >
        <LinearGradient
          colors={getGradientColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.gradient,
            styles[`size_${size}`],
          ]}
        >
          {renderContent()}
        </LinearGradient>
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedPressable
      style={[
        styles.base,
        styles[effectiveVariant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
        animatedStyle,
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel || (typeof label === 'string' ? label : undefined)}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
    >
      {renderContent()}
    </AnimatedPressable>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius?.xl || 22, // Modern: Daha yuvarlak
    overflow: 'hidden',
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius?.xl || 22, // Modern: Daha yuvarlak
    width: '100%',
  },
  fullWidth: {
    width: '100%',
  },
  primary: {
    backgroundColor: theme.colors.primary[500], // #4F46E5
    // Modern: Soft pastel shadow
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 3,
  },
  secondary: {
    backgroundColor: theme.colors.secondary[500], // #764ba2
    // Modern: Soft pastel shadow
    shadowColor: theme.colors.secondary[500],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 3,
  },
  destructive: {
    backgroundColor: theme.colors.error[500] || '#EF4444', // Red
    // Modern: Soft pastel shadow
    shadowColor: theme.colors.error[500] || '#EF4444',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 3,
  },
  outline: {
    backgroundColor: 'transparent',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  size_sm: {
    paddingHorizontal: theme.spacing.lg, // 16px
    paddingVertical: theme.spacing.sm, // 8px
    minHeight: 36,
  },
  size_md: {
    paddingHorizontal: theme.spacing.xl, // 20px
    paddingVertical: theme.spacing.md, // 12px
    minHeight: 44,
  },
  size_lg: {
    paddingHorizontal: theme.spacing['2xl'], // 24px
    paddingVertical: theme.spacing.lg, // 16px
    minHeight: 52,
  },
  text: {
    fontFamily: theme.typography.fontFamily.default,
    fontWeight: theme.typography.fontWeight.semibold, // 600
    includeFontPadding: false, // Android için
    textAlignVertical: 'center', // Android için
  },
  text_primary: {
    color: theme.colors.text.inverse,
  },
  text_secondary: {
    color: theme.colors.text.inverse,
  },
  text_outline: {
    color: '#4F46E5',
  },
  text_ghost: {
    color: theme.colors.primary[500],
  },
  text_gradient: {
    color: theme.colors.text.inverse,
  },
  text_destructive: {
    color: theme.colors.text.inverse,
  },
  textDisabled: {
    color: theme.colors.text.disabled,
  },
  textSize_sm: {
    fontSize: theme.typography.fontSize.sm, // 14px
  },
  textSize_md: {
    fontSize: theme.typography.fontSize.base, // 15px
  },
  textSize_lg: {
    fontSize: theme.typography.fontSize.lg, // 18px
  },
  iconContainer: {
    marginRight: theme.spacing?.sm || 8,
  },
});
