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
import { Avatar } from '@/components/ui/Avatar';
import { Divider } from '@/components/ui/Divider';
import { colors, spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { isWithinDays } from '@/utils/date';
import type { JobListItem } from '@/types/job';

interface JobCardProps {
  job: JobListItem;
  onPress: () => void;
}

export const JobCard: React.FC<JobCardProps> = ({ job, onPress }) => {
  // Logo işleme mantığı:
  // 1. Base64 string'ler (data:image/...) → direkt kullan (hastane yüklediği logolar)
  // 2. Path formatındaki logolar (logo.png) → null geç, fallback göster (dosyalar uploads klasöründe yok)
  // 3. Full URL'ler → direkt kullan
  const hospitalLogoUrl = (() => {
    if (!job.hospital_logo) return null;
    
    // Base64 string ise direkt kullan
    if (job.hospital_logo.startsWith('data:image/')) {
      return job.hospital_logo;
    }
    
    // Full URL ise direkt kullan
    if (job.hospital_logo.startsWith('http://') || job.hospital_logo.startsWith('https://')) {
      return job.hospital_logo;
    }
    
    // Path formatındaki logolar (logo.png, logo22.png vb.) → null
    // Çünkü bu dosyalar uploads klasöründe yok, 404 verecek
    // Avatar component'i fallback (initials) gösterecek
    return null;
  })();

  // Smooth press animation for detail button only
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
  
  return (
    // Wrapper - no animation
    <View>
      <Card 
        variant="elevated" 
        padding="lg" 
        style={styles.card}
      >
        {/* Header */}
        <View style={styles.header}>
          <Avatar
            size="md"
            source={hospitalLogoUrl ?? undefined}
            initials={job.hospital_name?.substring(0, 2).toUpperCase() || '??'}
          />
          <View style={styles.headerContent}>
            <View style={styles.titleRow}>
              <Typography variant="h3" style={styles.title}>
                {job.title}
              </Typography>
              {job.created_at && isWithinDays(job.created_at, 3) && (
                <Badge variant="success" size="sm">
                  YENİ
                </Badge>
              )}
            </View>
            <View style={styles.hospitalRow}>
              <Ionicons name="business" size={14} color={colors.text.secondary} />
              <Typography variant="body" style={styles.hospital}>
                {job.hospital_name}
              </Typography>
            </View>
          </View>
        </View>

        <Divider spacing="sm" />
        
        {/* Details - Ana Dal ve Yan Dal */}
        <View style={styles.details}>
          {job.specialty && (
            <View style={styles.specialtyContainer}>
              <Chip
                label={job.specialty}
                variant="soft"
                color="primary"
                size="sm"
              />
              {job.subspecialty_name && (
                <View style={styles.subspecialtyRow}>
                  <Chip
                    label={job.subspecialty_name}
                    variant="soft"
                    color="secondary"
                    size="sm"
                    style={styles.subspecialtyChip}
                  />
                </View>
              )}
            </View>
          )}
        </View>

        {/* Detay Butonu - Smooth animasyon ile */}
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
                Detay
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
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
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
  hospitalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  hospital: {
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
    flexDirection: 'column',
    gap: spacing.xs,
    alignItems: 'flex-start',
  },
  subspecialtyRow: {
    marginTop: spacing.xs,
  },
  subspecialtyChip: {
    marginTop: 0,
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

export default JobCard;
