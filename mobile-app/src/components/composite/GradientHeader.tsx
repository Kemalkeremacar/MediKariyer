/**
 * GradientHeader - Reusable gradient header component
 * 
 * Supports:
 * - Preset variants (primary, profile)
 * - Custom gradient colors
 * - Custom icon with gradient background
 * - Title and subtitle
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Typography } from '@/components/ui/Typography';
import { spacing } from '@/theme';

// Preset gradient colors for header background
const HEADER_PRESETS = {
  primary: ['#1D4ED8', '#2563EB', '#3B82F6'] as const,
  profile: ['#6096B4', '#7BA8BE', '#93BFCF'] as const,
} as const;

// Preset icon gradient colors
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

export interface GradientHeaderProps {
  /** Header title */
  title: string;
  /** Subtitle text */
  subtitle: string;
  /** Icon to display (ReactNode - typically Ionicons) */
  icon: React.ReactNode;
  /** Header background preset variant */
  variant?: HeaderVariant;
  /** Custom header gradient colors (overrides variant) */
  gradientColors?: readonly [string, string, string];
  /** Icon color preset */
  iconColorPreset?: IconColorPreset;
  /** Custom icon gradient colors (overrides iconColorPreset) */
  iconColors?: readonly [string, string];
  /** Shadow color for header */
  shadowColor?: string;
  /** Icon shadow color */
  iconShadowColor?: string;
  /** Additional style for container */
  style?: StyleProp<ViewStyle>;
  /** Whether to show dots around subtitle */
  showDots?: boolean;
}

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
}) => {
  // Resolve colors
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
      {/* Decorative Elements */}
      <View style={styles.headerDecoration}>
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />
      </View>

      {/* Content */}
      <View style={styles.headerContent}>
        {/* Icon */}
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

        {/* Title */}
        <Typography variant="h1" style={styles.headerTitle}>
          {title}
        </Typography>

        {/* Subtitle */}
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

const styles = StyleSheet.create({
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
