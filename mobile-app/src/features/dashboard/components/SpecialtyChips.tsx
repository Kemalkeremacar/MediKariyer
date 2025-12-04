import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export interface SpecialtyChipsProps {
  specialties: string[];
  maxVisible?: number;
  onViewAll?: () => void;
}

export const SpecialtyChips: React.FC<SpecialtyChipsProps> = ({
  specialties,
  maxVisible = 3,
  onViewAll,
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Determine which specialties to display
  const displayedSpecialties = specialties.slice(0, maxVisible);
  const hasMore = specialties.length > maxVisible;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {displayedSpecialties.map((specialty, index) => (
          <View key={`${specialty}-${index}`} style={styles.chip}>
            <Text style={styles.chipText}>{specialty}</Text>
          </View>
        ))}
        {hasMore && onViewAll && (
          <TouchableOpacity
            onPress={onViewAll}
            style={styles.viewAllButton}
            accessibilityLabel="Tümünü gör"
            accessibilityRole="button"
          >
            <Text style={styles.viewAllText}>Tümünü gör</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      width: '100%',
    },
    scrollContent: {
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.sm, // 8px spacing between chips
    },
    chip: {
      paddingHorizontal: theme.spacing.sm, // 8px horizontal padding
      paddingVertical: 6, // 6px vertical padding
      borderRadius: theme.borderRadius.lg, // 16px border radius
      backgroundColor: theme.colors.primary[50],
      borderWidth: 1,
      borderColor: theme.colors.primary[200],
    },
    chipText: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.primary[700],
    },
    viewAllButton: {
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.sm,
      minHeight: 44, // Accessibility touch target
    },
    viewAllText: {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.primary[600],
    },
  });
