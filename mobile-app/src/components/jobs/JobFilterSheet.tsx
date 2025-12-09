import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { colors, spacing } from '@/theme';

interface JobFilterSheetProps {
  onApply: (filters: any) => void;
  onReset: () => void;
}

export const JobFilterSheet: React.FC<JobFilterSheetProps> = ({ onApply, onReset }) => {
  return (
    <View style={styles.container}>
      <Typography variant="h3" style={styles.title}>
        Filtrele
      </Typography>
      <View style={styles.actions}>
        <Button variant="outline" onPress={onReset}>
          Temizle
        </Button>
        <Button onPress={() => onApply({})}>
          Uygula
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  title: {
    marginBottom: spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
});
