import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { colors, spacing, borderRadius } from '@/theme';

export type SettingsItemProps = {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  showChevron?: boolean;
  danger?: boolean;
};

export const SettingsItem = ({
  icon,
  label,
  onPress,
  showChevron = true,
  danger = false,
}: SettingsItemProps) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
    <View style={styles.container}>
      <View style={styles.leftContent}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: danger ? colors.error[50] : colors.primary[50] }
          ]}
        >
          {icon}
        </View>
        <Text
          style={[styles.settingsLabel, danger && styles.dangerText]}
        >
          {label}
        </Text>
      </View>
      {showChevron && (
        <ChevronRight 
          size={20} 
          color={danger ? colors.error[600] : colors.neutral[400]} 
        />
      )}
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
  },
  dangerText: {
    color: colors.error[600],
  },
});
