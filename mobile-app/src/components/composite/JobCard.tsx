/**
 * @file JobCard.tsx
 * @description İş ilanı kartı bileşeni
 * 
 * Bu bileşen iş ilanlarını liste görünümünde gösterir.
 * Hastane logosu, iş başlığı, branş bilgileri ve detay butonu içerir.
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
import { Avatar } from '@/components/ui/Avatar';
import { Divider } from '@/components/ui/Divider';
import { colors, spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { isWithinDays } from '@/utils/date';
import type { JobListItem } from '@/types/job';

/**
 * JobCard bileşeni için prop tipleri
 * 
 * @interface JobCardProps
 * @property {JobListItem} job - İş ilanı verisi
 * @property {Function} onPress - Kart tıklama callback'i (detay sayfasına gider)
 */
interface JobCardProps {
  job: JobListItem;
  onPress: () => void;
}

/**
 * İş ilanı kartı bileşeni
 * 
 * **Özellikler:**
 * - Hastane logosu gösterimi (Avatar ile)
 * - İş başlığı ve hastane adı
 * - YENİ badge'i (3 gün içinde eklenen ilanlar için)
 * - Ana dal ve yan dal chip'leri
 * - Detay butonu (smooth animasyon ile)
 * 
 * **Logo İşleme Mantığı:**
 * 1. Base64 string'ler (data:image/...) → Direkt kullan
 * 2. Full URL'ler (http/https) → Direkt kullan
 * 3. Path formatı (logo.png) → null geç, Avatar fallback gösterir
 * 
 * **Kullanım:**
 * ```tsx
 * <JobCard
 *   job={jobData}
 *   onPress={() => navigation.navigate('JobDetail', { id: jobData.id })}
 * />
 * ```
 * 
 * @param props - JobCard prop'ları
 * @returns İş ilanı kartı bileşeni
 */
export const JobCard: React.FC<JobCardProps> = ({ job, onPress }) => {
  /**
   * Hastane logosu URL'ini işle
   * Base64, full URL veya path formatlarını kontrol eder
   */
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

  /**
   * Detay butonu için smooth animasyon değerleri
   * Butona basıldığında hafif küçülme efekti sağlar
   */
  const scale = useSharedValue(1);
  
  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  /**
   * Butona basıldığında animasyonu başlat
   */
  const handleButtonPressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
  };

  /**
   * Butondan el çekildiğinde animasyonu geri al
   */
  const handleButtonPressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };
  
  return (
    <View>
      <Card 
        variant="elevated" 
        padding="lg" 
        style={styles.card}
      >
        {/* Başlık Bölümü - Logo, İş Başlığı, Hastane Adı */}
        <View style={styles.header}>
          {/* Hastane logosu (Avatar ile fallback desteği) */}
          <Avatar
            size="md"
            source={hospitalLogoUrl ?? undefined}
            initials={job.hospital_name?.substring(0, 2).toUpperCase() || '??'}
          />
          
          <View style={styles.headerContent}>
            {/* İş başlığı ve YENİ badge'i */}
            <View style={styles.titleRow}>
              <Typography variant="h3" style={styles.title}>
                {job.title}
              </Typography>
              {/* Son 3 gün içinde eklenen ilanlar için YENİ badge'i */}
              {job.created_at && isWithinDays(job.created_at, 3) && (
                <Badge variant="success" size="sm">
                  YENİ
                </Badge>
              )}
            </View>
            
            {/* Hastane adı */}
            <View style={styles.hospitalRow}>
              <Ionicons name="business" size={14} color={colors.text.secondary} />
              <Typography variant="body" style={styles.hospital}>
                {job.hospital_name}
              </Typography>
            </View>
          </View>
        </View>

        <Divider spacing="sm" />
        
        {/* Branş Bilgileri - Ana Dal ve Yan Dal */}
        <View style={styles.details}>
          {job.specialty && (
            <View style={styles.specialtyContainer}>
              {/* Ana dal chip'i */}
              <Chip
                label={job.specialty}
                variant="soft"
                color="primary"
                size="sm"
              />
              {/* Yan dal chip'i (varsa) */}
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

/**
 * Stil tanımlamaları
 * Modern kart tasarımı ve animasyon stilleri
 */
const styles = StyleSheet.create({
  // Kart container
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
