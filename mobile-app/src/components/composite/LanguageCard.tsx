import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { Badge } from '@/components/ui/Badge';
import { colors, spacing } from '@/theme';

export interface LanguageCardProps {
  language: string;
  level: string;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const levelColors = {
  'Başlangıç': 'neutral' as const,
  'Temel': 'neutral' as const,
  'Orta': 'primary' as const,
  'Orta Üstü': 'primary' as const,
  'İleri': 'success' as const,
  'Ana Dil': 'success' as const,
};

const levelLabels = {
  'Başlangıç': 'A1',
  'Temel': 'A2',
  'Orta': 'B1',
  'Orta Üstü': 'B2',
  'İleri': 'C1',
  'Ana Dil': 'C2',
};

export const LanguageCard: React.FC<LanguageCardProps> = ({
  language,
  level,
  onPress,
  onEdit,
  onDelete,
}) => {
  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper onPress={onPress} activeOpacity={0.7}>
      <Card variant="outlined" padding="md">
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <Ionicons name="language" size={20} color={colors.primary[600]} />
          </View>
          <View style={styles.content}>
            <Typography variant="h3" style={styles.language}>
              {language}
            </Typography>
            <View style={styles.levelContainer}>
              <Badge variant={levelColors[level as keyof typeof levelColors] || 'primary'} size="sm">
                {level}
              </Badge>
              <Typography variant="caption" style={styles.levelText}>
                {levelLabels[level as keyof typeof levelLabels] || level}
              </Typography>
            </View>
          </View>
          <View style={styles.actions}>
            {onEdit && (
              <TouchableOpacity onPress={onEdit} style={styles.editButton}>
                <Ionicons name="pencil-outline" size={18} color={colors.primary[600]} />
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
                <Ionicons name="trash-outline" size={18} color={colors.error[600]} />
              </TouchableOpacity>
            )}
            {onPress && !onDelete && !onEdit && (
              <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} />
            )}
          </View>
        </View>
      </Card>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  language: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  levelText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'center',
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.error[50],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.error[100],
  },
});
