/**
 * Profile Feature Component - Profile Menu Item
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { ChevronRight, LucideIcon } from 'lucide-react-native';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/theme';

interface ProfileMenuItemProps {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  showChevron?: boolean;
}

export const ProfileMenuItem = ({
  icon: Icon,
  label,
  onPress,
  showChevron = true,
}: ProfileMenuItemProps) => {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <View style={styles.left}>
        <View style={styles.iconContainer}>
          <Icon size={20} color={colors.text.secondary} />
        </View>
        <Typography variant="body">{label}</Typography>
      </View>
      {showChevron && <ChevronRight size={20} color={colors.text.secondary} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
});
