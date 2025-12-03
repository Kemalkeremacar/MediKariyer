import React from 'react';
import { View, Image, Text, StyleSheet, ViewStyle, ImageSourcePropType } from 'react-native';
import { theme } from '@/theme';

export interface AvatarProps {
  source?: ImageSourcePropType;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  style?: ViewStyle;
}

export const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  size = 'md',
  color,
  style,
}) => {
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const sizeValue = sizeMap[size];

  return (
    <View style={[styles.container, { width: sizeValue, height: sizeValue }, style]}>
      {source ? (
        <Image source={source} style={styles.image} />
      ) : (
        <View style={styles.placeholder}>
          <Text style={[styles.initials, styles[`initials_${size}`]]}>
            {name ? getInitials(name) : '?'}
          </Text>
        </View>
      )}
    </View>
  );
};

const sizeMap = {
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
    backgroundColor: theme.colors.neutral[200],
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primary[100],
  },
  initials: {
    color: theme.colors.primary[700],
    fontWeight: theme.typography.fontWeight.semibold,
  },
  initials_sm: {
    fontSize: theme.typography.fontSize.xs,
  },
  initials_md: {
    fontSize: theme.typography.fontSize.sm,
  },
  initials_lg: {
    fontSize: theme.typography.fontSize.lg,
  },
  initials_xl: {
    fontSize: theme.typography.fontSize['2xl'],
  },
});
