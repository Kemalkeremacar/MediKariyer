import React from 'react';
import { TouchableOpacity, View, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@/theme';
import { Typography } from './Typography';

export interface ChipProps {
  label: string;
  variant?: 'filled' | 'outlined' | 'soft';
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral';
  size?: 'sm' | 'md';
  selected?: boolean;
  onPress?: () => void;
  onDelete?: () => void;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  variant = 'soft',
  color = 'primary',
  size = 'md',
  selected = false,
  onPress,
  onDelete,
  icon,
  style,
}) => {
  const Container = onPress ? TouchableOpacity : View;
  
  const getBackgroundColor = () => {
    if (selected) return colors[color][600];
    if (variant === 'filled') return colors[color][600];
    if (variant === 'outlined') return 'transparent';
    return colors[color][50]; // soft
  };

  const getTextColor = () => {
    if (selected || variant === 'filled') return colors.background.primary;
    return colors[color][700];
  };

  const getBorderColor = () => {
    if (variant === 'outlined') return colors[color][300];
    return 'transparent';
  };

  return (
    <Container
      style={[
        styles.chip,
        size === 'sm' ? styles.chipSm : styles.chipMd,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outlined' ? 1 : 0,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {icon && <View style={styles.icon}>{icon}</View>}
      <Typography
        variant="caption"
        style={{
          ...(size === 'sm' ? styles.textSm : styles.textMd),
          color: getTextColor(),
        }}
      >
        {label}
      </Typography>
      {onDelete && (
        <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
          <Ionicons name="close" size={size === 'sm' ? 12 : 14} color={getTextColor()} />
        </TouchableOpacity>
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  chipSm: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: 4,
  },
  chipMd: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  icon: {
    marginRight: -2,
  },
  textSm: {
    fontSize: 11,
    fontWeight: '600',
  },
  textMd: {
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    marginLeft: 2,
    padding: 2,
  },
});
