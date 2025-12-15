import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { Chip } from '@/components/ui/Chip';
import { Divider } from '@/components/ui/Divider';
import { colors, spacing } from '@/theme';

export interface ExperienceCardProps {
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description?: string;
  onPress?: () => void;
}

export const ExperienceCard: React.FC<ExperienceCardProps> = ({
  title,
  company,
  location,
  startDate,
  endDate,
  current = false,
  description,
  onPress,
}) => {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container onPress={onPress} activeOpacity={0.7}>
      <Card variant="outlined" padding="lg" style={styles.card}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="briefcase" size={20} color={colors.secondary[600]} />
          </View>
          <View style={styles.content}>
            <Typography variant="h3" style={styles.title}>
              {title}
            </Typography>
            <Typography variant="body" style={styles.company}>
              {company}
            </Typography>
          </View>
        </View>

        {description && (
          <>
            <Divider spacing="sm" />
            <Typography variant="body" style={styles.description}>
              {description}
            </Typography>
          </>
        )}

        <View style={styles.footer}>
          <Chip
            label={`${startDate} - ${current ? 'Devam Ediyor' : endDate}`}
            icon={<Ionicons name="calendar" size={12} color={colors.neutral[600]} />}
            variant="soft"
            color="neutral"
            size="sm"
          />
          {location && (
            <Chip
              label={location}
              icon={<Ionicons name="location" size={12} color={colors.neutral[600]} />}
              variant="soft"
              color="neutral"
              size="sm"
            />
          )}
        </View>
      </Card>
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  company: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  description: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
});
