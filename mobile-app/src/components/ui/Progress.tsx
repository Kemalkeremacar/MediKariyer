import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/theme';
import { Typography } from './Typography';

export interface ProgressProps {
  value: number; // 0-100
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  style?: ViewStyle;
}

const sizeMap = {
  sm: 4,
  md: 8,
  lg: 12,
};

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

// Circular Progress Component
export interface CircularProgressProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  showLabel?: boolean;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  size = 80,
  strokeWidth = 8,
  showLabel = true,
}) => {
  const clampedValue = Math.min(Math.max(value, 0), 100);

  return (
    <View style={[styles.circularContainer, { width: size, height: size }]}>
      {/* Background circle */}
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
      {/* Progress circle - would need react-native-svg for proper implementation */}
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
