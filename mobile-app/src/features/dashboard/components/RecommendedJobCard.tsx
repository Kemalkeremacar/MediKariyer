import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export interface RecommendedJobCardProps {
  hospitalName: string;
  positionTitle: string;
  city: string;
  workType: string;
  onDetailPress: () => void;
  onQuickApplyPress: () => void;
}

export const RecommendedJobCard: React.FC<RecommendedJobCardProps> = ({
  hospitalName,
  positionTitle,
  city,
  workType,
  onDetailPress,
  onQuickApplyPress,
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Card padding="lg" style={styles.container}>
      <Text style={styles.hospitalName}>{hospitalName}</Text>
      <Text style={styles.positionTitle}>{positionTitle}</Text>
      <Text style={styles.location}>{`${city} · ${workType}`}</Text>
      
      <View style={styles.buttonContainer}>
        <Button
          variant="outline"
          size="md"
          onPress={onDetailPress}
          label="Detay"
          style={styles.button}
        />
        <Button
          variant="primary"
          size="md"
          onPress={onQuickApplyPress}
          label="Hızlı Başvuru"
          style={styles.button}
        />
      </View>
    </Card>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      marginBottom: theme.spacing.md,
    },
    hospitalName: {
      fontSize: theme.typography.fontSize.lg,
      fontWeight: theme.typography.fontWeight.semibold,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
    },
    positionTitle: {
      fontSize: theme.typography.fontSize.base,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.sm,
    },
    location: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.normal,
      color: theme.colors.text.secondary,
      marginBottom: theme.spacing.lg,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    button: {
      flex: 1,
    },
  });
