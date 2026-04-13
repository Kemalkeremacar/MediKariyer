/**
 * @file CongressCard.tsx
 * @description Kongre kartı bileşeni
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { Chip } from '@/components/ui/Chip';
import { Badge } from '@/components/ui/Badge';
import { Divider } from '@/components/ui/Divider';
import { colors, spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from '@/utils/date';
import type { CongressListItem } from '@/types/congress';

interface CongressCardProps {
  congress: CongressListItem;
  onPress: () => void;
}

export const CongressCard: React.FC<CongressCardProps> = ({ congress, onPress }) => {
  const scale = useSharedValue(1);
  
  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handleButtonPressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
  };

  const handleButtonPressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const getCongressStatus = () => {
    const start = new Date(congress.start_date);
    const end = new Date(congress.end_date);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const diffFromNow = Math.round((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffFromNow === 0) {
      return { label: 'Bugün Başlıyor', color: colors.warning[600] };
    }
    if (diffFromNow > 0) {
      return null;
    }
    if (now <= end) {
      return { label: 'Devam Ediyor', color: colors.primary[600] };
    }
    return { label: 'Sona Erdi', color: colors.neutral[500] };
  };

  const status = getCongressStatus();
  const locationText = [congress.city, congress.country].filter(Boolean).join(', ');
  
  return (
    <View>
      <Card 
        variant="elevated" 
        padding="lg" 
        style={styles.card}
      >
        {/* Başlık ve Status */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.titleRow}>
              <Typography variant="h3" style={styles.title}>
                {congress.title}
              </Typography>
              {status && (
                <Badge 
                  variant={status.color === colors.primary[600] ? 'primary' : 'secondary'} 
                  size="sm"
                >
                  {status.label}
                </Badge>
              )}
            </View>
            
            {congress.organizer && (
              <View style={styles.organizerRow}>
                <Ionicons name="people" size={14} color={colors.text.secondary} />
                <Typography variant="body" style={styles.organizer}>
                  {congress.organizer}
                </Typography>
              </View>
            )}
          </View>
        </View>

        <Divider spacing="sm" />
        
        {/* Uzmanlık Bilgileri */}
        {(congress.specialties && congress.specialties.length > 0) || congress.specialty_name ? (
          <View style={styles.details}>
            <View style={styles.specialtyContainer}>
              {congress.specialties && congress.specialties.length > 0 ? (
                congress.specialties.slice(0, 3).map((s) => (
                  <Chip
                    key={s.id}
                    label={s.name}
                    variant="soft"
                    color="primary"
                    size="sm"
                  />
                ))
              ) : congress.specialty_name ? (
                <Chip
                  label={congress.specialty_name}
                  variant="soft"
                  color="primary"
                  size="sm"
                />
              ) : null}
              {congress.specialties && congress.specialties.length > 3 && (
                <Chip
                  label={`+${congress.specialties.length - 3}`}
                  variant="soft"
                  color="secondary"
                  size="sm"
                />
              )}
              {congress.subspecialty_name && (
                <Chip
                  label={congress.subspecialty_name}
                  variant="soft"
                  color="secondary"
                  size="sm"
                />
              )}
            </View>
          </View>
        ) : null}

        {/* Tarih ve Konum Bilgileri */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={14} color={colors.text.secondary} />
            <Typography variant="caption" style={styles.infoText}>
              {formatDate(congress.start_date)} - {formatDate(congress.end_date)}
            </Typography>
          </View>
          {locationText && (
            <View style={styles.infoItem}>
              <Ionicons name="location-outline" size={14} color={colors.text.secondary} />
              <Typography variant="caption" style={styles.infoText}>
                {locationText}
              </Typography>
            </View>
          )}
        </View>

        {/* Detay Butonu */}
        <View style={styles.footer}>
          <Animated.View style={animatedButtonStyle}>
            <TouchableOpacity 
              style={styles.detailButton}
              onPress={onPress}
              onPressIn={handleButtonPressIn}
              onPressOut={handleButtonPressOut}
              activeOpacity={1}
            >
              <Typography variant="caption" style={styles.detailButtonText}>
                Detayları Gör
              </Typography>
              <Ionicons name="arrow-forward" size={14} color={colors.primary[600]} />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  headerContent: {
    flex: 1,
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    lineHeight: 22,
    flex: 1,
  },
  organizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  organizer: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  details: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
    marginTop: spacing.xs,
  },
  specialtyContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
    flexWrap: 'wrap',
    alignItems: 'flex-start',
  },
  infoRow: {
    flexDirection: 'column',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    color: colors.text.secondary,
    fontSize: 13,
    flex: 1,
  },
  footer: {
    marginTop: spacing.md,
    alignItems: 'flex-end',
  },
  detailButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary[50],
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  detailButtonText: {
    color: colors.primary[600],
    fontWeight: '600',
    fontSize: 13,
  },
});

export default CongressCard;
