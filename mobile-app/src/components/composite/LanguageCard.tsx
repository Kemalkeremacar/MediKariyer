import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Languages, ChevronRight } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { Badge } from '@/components/ui/Badge';
import { colors, spacing } from '@/theme';

export interface LanguageCardProps {
  language: string;
  level: string;
  onPress?: () => void;
}

const levelColors = {
  A1: 'neutral' as const,
  A2: 'neutral' as const,
  B1: 'primary' as const,
  B2: 'primary' as const,
  C1: 'success' as const,
  C2: 'success' as const,
  Native: 'success' as const,
};

const levelLabels = {
  A1: 'Başlangıç',
  A2: 'Temel',
  B1: 'Orta',
  B2: 'Orta-İleri',
  C1: 'İleri',
  C2: 'Çok İleri',
  Native: 'Ana Dil',
};

export const LanguageCard: React.FC<LanguageCardProps> = ({
  language,
  level,
  onPress,
}) => {
  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper onPress={onPress} activeOpacity={0.7}>
      <Card variant="outlined" padding="md">
        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <Languages size={20} color={colors.primary[600]} />
          </View>
          <View style={styles.content}>
            <Typography variant="h4" style={styles.language}>
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
          {onPress && (
            <ChevronRight size={20} color={colors.neutral[400]} />
          )}
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
});
