import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { X } from 'lucide-react-native';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/theme';

export interface SkillChipProps {
  label: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  onRemove?: () => void;
  onPress?: () => void;
}

const levelColors = {
  beginner: colors.neutral[500],
  intermediate: colors.primary[500],
  advanced: colors.secondary[500],
  expert: colors.success[600],
};

const levelLabels = {
  beginner: 'Başlangıç',
  intermediate: 'Orta',
  advanced: 'İleri',
  expert: 'Uzman',
};

export const SkillChip: React.FC<SkillChipProps> = ({
  label,
  level,
  onRemove,
  onPress,
}) => {
  const levelColor = level ? levelColors[level] : colors.primary[600];
  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      style={[styles.container, { borderColor: levelColor }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.indicator, { backgroundColor: levelColor }]} />
      <View style={styles.content}>
        <Typography variant="body" style={styles.label}>
          {label}
        </Typography>
        {level && (
          <Typography variant="caption" style={styles.level}>
            {levelLabels[level]}
          </Typography>
        )}
      </View>
      {onRemove && (
        <TouchableOpacity
          style={styles.removeButton}
          onPress={onRemove}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <X size={14} color={colors.neutral[500]} />
        </TouchableOpacity>
      )}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
    borderRadius: 20,
    borderWidth: 1.5,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
  },
  level: {
    fontSize: 10,
    color: colors.text.tertiary,
  },
  removeButton: {
    padding: 2,
  },
});
