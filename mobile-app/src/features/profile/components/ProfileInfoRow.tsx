/**
 * Profile Feature Component - Profile Info Row
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/theme';

interface ProfileInfoRowProps {
  icon: LucideIcon;
  label: string;
  value: string | React.ReactNode;
}

export const ProfileInfoRow = ({ icon: Icon, label, value }: ProfileInfoRowProps) => {
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <View style={styles.iconContainer}>
          <Icon size={20} color={colors.primary[600]} />
        </View>
        <View>
          <Typography variant="caption" style={styles.label}>
            {label}
          </Typography>
          {typeof value === 'string' ? (
            <Typography variant="body">{value}</Typography>
          ) : (
            value
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    color: colors.text.secondary,
  },
});
