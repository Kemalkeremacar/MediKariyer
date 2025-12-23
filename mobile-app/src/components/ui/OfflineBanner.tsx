/**
 * @file OfflineBanner.tsx
 * @description Animated banner component for offline status indication
 * 
 * Shows a sleek, animated banner when the device loses internet connectivity.
 * Automatically slides in/out based on connection status.
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 */

import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from './Typography';
import { useTheme } from '@/contexts/ThemeContext';
import type { Theme } from '@/theme';

interface OfflineBannerProps {
  /** Whether the banner should be visible */
  visible: boolean;
  /** Custom message to display */
  message?: string;
}

/**
 * Animated offline status banner
 * 
 * @example
 * ```tsx
 * const { isOffline } = useNetworkStatus();
 * return <OfflineBanner visible={isOffline} />;
 * ```
 */
export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  visible,
  message = 'İnternet bağlantısı yok',
}) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = React.useMemo(() => createStyles(theme, insets.top), [theme, insets.top]);

  // Animation values
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, {
        damping: 15,
        stiffness: 150,
      });
      opacity.value = withTiming(1, { duration: 200 });
    } else {
      translateY.value = withSpring(-100, {
        damping: 20,
        stiffness: 200,
      });
      opacity.value = withTiming(0, { duration: 150 });
    }
  }, [visible, translateY, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          opacity.value,
          [0, 1],
          [0.5, 1],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  // Note: We removed the `opacity.value === 0` check from render to fix Reanimated warning
  // The component will render based on `visible` prop only
  // Animation will handle the opacity transition smoothly

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.content}>
        <Animated.View style={iconAnimatedStyle}>
          <Ionicons
            name="cloud-offline"
            size={20}
            color={theme.colors.text.inverse}
          />
        </Animated.View>
        <Typography variant="bodySmall" style={styles.text}>
          {message}
        </Typography>
      </View>
    </Animated.View>
  );
};

const createStyles = (theme: Theme, topInset: number) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      backgroundColor: theme.colors.warning[600],
      paddingTop: topInset + 8,
      paddingBottom: 12,
      paddingHorizontal: theme.spacing.lg,
      shadowColor: theme.colors.warning[900],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.sm,
    },
    text: {
      color: theme.colors.text.inverse,
      fontWeight: '600',
      letterSpacing: 0.3,
    },
  });

export default OfflineBanner;
