import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { colors } from '@/theme';

export interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 1000 }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width as any,
          height,
          borderRadius,
        },
        animatedStyle,
        style,
      ]}
    />
  );
};

// Preset skeleton components
export const SkeletonText: React.FC<{ lines?: number }> = ({ lines = 3 }) => (
  <View style={styles.textContainer}>
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton
        key={index}
        height={16}
        width={index === lines - 1 ? '70%' : '100%'}
        style={styles.textLine}
      />
    ))}
  </View>
);

export const SkeletonCard: React.FC = () => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <Skeleton width={56} height={56} borderRadius={28} />
      <View style={styles.cardHeaderText}>
        <Skeleton width="80%" height={20} />
        <Skeleton width="60%" height={16} style={{ marginTop: 8 }} />
      </View>
    </View>
    <SkeletonText lines={2} />
  </View>
);

export const SkeletonAvatar: React.FC<{ size?: number }> = ({ size = 56 }) => (
  <Skeleton width={size} height={size} borderRadius={size / 2} />
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.neutral[200],
  },
  textContainer: {
    gap: 8,
  },
  textLine: {
    marginBottom: 4,
  },
  card: {
    padding: 16,
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  cardHeaderText: {
    flex: 1,
  },
});
