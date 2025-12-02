import React from 'react';
import { View, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '@/theme';
import { Text } from '@/components/ui/Text';

export interface HeaderProps {
  title: string;
  subtitle?: string;
  leftAction?: {
    icon: React.ReactNode;
    onPress: () => void;
  };
  rightAction?: {
    icon: React.ReactNode;
    onPress: () => void;
  };
  style?: ViewStyle;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  leftAction,
  rightAction,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.leftSection}>
        {leftAction && (
          <TouchableOpacity onPress={leftAction.onPress} style={styles.actionButton}>
            {leftAction.icon}
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.centerSection}>
        <Text variant="h3" align="center" numberOfLines={1}>
          {title}
        </Text>
        {subtitle && (
          <Text variant="bodySmall" align="center" color={theme.colors.text.secondary}>
            {subtitle}
          </Text>
        )}
      </View>

      <View style={styles.rightSection}>
        {rightAction && (
          <TouchableOpacity onPress={rightAction.onPress} style={styles.actionButton}>
            {rightAction.icon}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  leftSection: {
    width: 44,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  rightSection: {
    width: 44,
    alignItems: 'flex-end',
  },
  actionButton: {
    padding: theme.spacing.sm,
  },
});
