import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing, typography as typeScale } from '@/constants/theme';

interface FormFieldProps {
  label: string;
  error?: string;
  helperText?: string;
  children: React.ReactNode;
}

export const FormField = ({ label, error, helperText, children }: FormFieldProps) => (
  <View style={styles.field}>
    <Typography variant="subtitle" style={styles.label}>
      {label}
    </Typography>
    {children}
    {helperText && !error && (
      <Typography variant="caption" style={styles.helper}>
        {helperText}
      </Typography>
    )}
    {error && (
      <Typography variant="caption" style={styles.error}>
        {error}
      </Typography>
    )}
  </View>
);

const styles = StyleSheet.create({
  field: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  label: {
    fontWeight: typeScale.fontWeight.medium,
    marginBottom: spacing.xs,
  },
  helper: {
    marginTop: spacing.xs,
    color: colors.text.secondary,
  },
  error: {
    marginTop: spacing.xs,
    color: colors.error[600],
  },
});


