import React from 'react';
import { StyleSheet } from 'react-native';
import { Box, VStack } from '@gluestack-ui/themed';
import { Card } from '../ui/Card';
import { Typography } from '../ui/Typography';
import { colors, spacing } from '@/constants/theme';

type StatBoxProps = {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
};

export const StatBox = ({ label, value, subtext, icon }: StatBoxProps) => {
  return (
    <Card variant="elevated" style={styles.card}>
      <VStack space="xs" alignItems="center">
        {icon && <Box mb="$1">{icon}</Box>}
        <Typography variant="caption" style={styles.label}>
          {label}
        </Typography>
        <Typography variant="heading" style={styles.value}>
          {value}
        </Typography>
        {subtext && (
          <Typography variant="caption" style={styles.subtext}>
            {subtext}
          </Typography>
        )}
      </VStack>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  label: {
    color: colors.neutral[500],
    marginBottom: spacing.xs,
    fontWeight: '500',
  },
  value: {
    color: colors.primary[600],
    marginBottom: spacing.xs,
    fontSize: 24,
    fontWeight: '700',
  },
  subtext: {
    color: colors.neutral[600],
    fontSize: 11,
  },
});

