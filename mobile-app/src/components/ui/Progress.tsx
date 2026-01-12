/**
 * @file Progress.tsx
 * @description İlerleme çubuğu bileşenleri
 * 
 * İki bileşen içerir:
 * 1. Progress - Yatay ilerleme çubuğu
 * 2. CircularProgress - Dairesel ilerleme göstergesi
 * 
 * Özellikler:
 * - Üç boyut seçeneği (sm, md, lg)
 * - Beş renk seçeneği (primary, secondary, success, warning, error)
 * - Yüzde etiketi gösterimi
 * - 0-100 arası değer desteği
 * 
 * Kullanım:
 * ```tsx
 * <Progress value={75} showLabel color="success" />
 * <CircularProgress value={50} size={100} />
 * ```
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/theme';
import { Typography } from './Typography';

/**
 * Progress bileşeni props interface'i
 */
export interface ProgressProps {
  /** İlerleme değeri (0-100) */
  value: number;
  /** Yüzde etiketi göster */
  showLabel?: boolean;
  /** İlerleme çubuğu boyutu */
  size?: 'sm' | 'md' | 'lg';
  /** İlerleme çubuğu rengi */
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  /** Ek stil */
  style?: ViewStyle;
}

/**
 * Boyut haritası (yükseklik - piksel cinsinden)
 */
const sizeMap = {
  sm: 4,
  md: 8,
  lg: 12,
};

/**
 * Yatay İlerleme Çubuğu Bileşeni
 */
export const Progress: React.FC<ProgressProps> = ({
  value,
  showLabel = false,
  size = 'md',
  color = 'primary',
  style,
}) => {
  const height = sizeMap[size];
  const clampedValue = Math.min(Math.max(value, 0), 100);

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.track, { height, borderRadius: height / 2 }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${clampedValue}%`,
              height,
              borderRadius: height / 2,
              backgroundColor: colors[color][600],
            },
          ]}
        />
      </View>
      {showLabel && (
        <Typography variant="caption" style={styles.label}>
          {Math.round(clampedValue)}%
        </Typography>
      )}
    </View>
  );
};

/**
 * CircularProgress bileşeni props interface'i
 */
export interface CircularProgressProps {
  /** İlerleme değeri (0-100) */
  value: number;
  /** Daire boyutu (piksel) */
  size?: number;
  /** Çizgi kalınlığı (piksel) */
  strokeWidth?: number;
  /** İlerleme rengi */
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  /** Yüzde etiketi göster */
  showLabel?: boolean;
}

/**
 * Dairesel İlerleme Göstergesi Bileşeni
 * Not: Tam implementasyon için react-native-svg gerekir
 */
export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  size = 80,
  strokeWidth = 8,
  showLabel = true,
}) => {
  const clampedValue = Math.min(Math.max(value, 0), 100);

  return (
    <View style={[styles.circularContainer, { width: size, height: size }]}>
      {/* Arka plan dairesi */}
      <View
        style={[
          styles.circularTrack,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: colors.neutral[200],
          },
        ]}
      />
      {/* İlerleme dairesi - tam implementasyon için react-native-svg gerekir */}
      {showLabel && (
        <View style={styles.circularLabel}>
          <Typography variant="h3" style={styles.circularValue}>
            {Math.round(clampedValue)}%
          </Typography>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  track: {
    flex: 1,
    backgroundColor: colors.neutral[200],
    overflow: 'hidden',
  },
  fill: {
    backgroundColor: colors.primary[600],
  },
  label: {
    minWidth: 40,
    textAlign: 'right',
    color: colors.text.secondary,
    fontSize: 12,
    fontWeight: '600',
  },
  circularContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularTrack: {
    position: 'absolute',
  },
  circularLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
});
