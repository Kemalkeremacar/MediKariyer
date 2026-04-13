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
    
    // Gün bazında karşılaştırma için saatleri sıfırla
    now.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const daysToStart = Math.round((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const daysToEnd = Math.round((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Güvenlik: Bitmiş kongreler hiç gösterilmemeli (backend filtrelemeli ama yine de kontrol)
    if (daysToEnd < 0) {
      return null; // Bitmiş kongre - gösterme
    }

    // Henüz başlamamış kongreler
    if (daysToStart > 0) {
      return null; // Status gösterme
    }
    
    // Bugün başlayan kongreler
    if (daysToStart === 0) {
      if (daysToEnd === 0) {
        return { label: 'Bugün (Tek Gün)', color: colors.warning[600] };
      }
      return { label: 'Bugün Başlıyor', color: colors.warning[600] };
    }
    
    // Devam eden kongreler
    if (daysToEnd > 0) {
      return { label: 'Devam Ediyor', color: colors.primary[600] };
    }
    
    // Bugün biten kongreler
    if (daysToEnd === 0) {
      return { label: 'Son Gün', color: colors.warning[600] };
    }
    
    // Bu duruma hiç gelmemeli çünkü backend bitmiş kongreleri filtreliyor
    return null;
  };

  const status = getCongressStatus();
  
  // Konum bilgisi - web ile uyumlu format
  const locationParts = [];
  if (congress.location) {
    locationParts.push(congress.location);
  }
  if (congress.city || congress.country) {
    locationParts.push([congress.city, congress.country].filter(Boolean).join(', '));
  }
  const locationText = locationParts.join(' - ');
  
  return (
    <View>
      <Card 
        variant="elevated" 
        padding="lg" 
        shadow="lg"
        style={styles.card}
      >
        {/* Başlık ve Status */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.titleRow}>
              <Typography variant="h3" style={styles.title}>
                {congress.title}
              </Typography>
            </View>
            
            {/* Status Badge - Web ile uyumlu (ikon + metin) */}
            {status && (
              <View style={[
                styles.statusBadge, 
                { 
                  backgroundColor: status.color === colors.primary[600] ? colors.primary[50] : colors.warning[50],
                  borderColor: status.color === colors.primary[600] ? colors.primary[200] : colors.warning[200]
                }
              ]}>
                <Ionicons 
                  name="time" 
                  size={12} 
                  color={status.color} 
                />
                <Typography 
                  variant="caption" 
                  style={[styles.statusText, { color: status.color }] as any}
                >
                  {status.label}
                </Typography>
              </View>
            )}
            
            {congress.organizer && (
              <View style={styles.organizerRow}>
                <Ionicons name="people" size={16} color={colors.text.secondary} />
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
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <View style={styles.iconContainer}>
                <Ionicons name="calendar-outline" size={16} color={colors.primary[600]} />
              </View>
              <Typography variant="body" style={styles.infoText}>
                {formatDate(congress.start_date)} - {formatDate(congress.end_date)}
              </Typography>
            </View>
            {locationText && (
              <View style={styles.infoItem}>
                <View style={styles.iconContainer}>
                  <Ionicons name="location-outline" size={16} color={colors.primary[600]} />
                </View>
                <Typography variant="body" style={styles.infoText}>
                  {locationText}
                </Typography>
              </View>
            )}
          </View>
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
              <Ionicons name="arrow-forward" size={14} color="#2563A8" />
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
    // Daha belirgin kenarlar ve gölge
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
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
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text.primary,
    lineHeight: 24,
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  organizerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  organizer: {
    color: colors.text.secondary,
    fontSize: 15,
    flex: 1,
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
  infoSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  infoRow: {
    flexDirection: 'column',
    gap: spacing.sm,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    color: colors.text.primary,
    fontSize: 15,
    flex: 1,
    fontWeight: '500',
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
    borderColor: '#2563A8', // Header'daki mavi ile aynı
  },
  detailButtonText: {
    color: '#2563A8', // Header'daki mavi ile aynı
    fontWeight: '600',
    fontSize: 13,
  },
});

export default CongressCard;
