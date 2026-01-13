/**
 * @file FeaturedJobCard.tsx
 * @description Öne çıkan iş ilanı kartı bileşeni
 * 
 * Özellikler:
 * - Yatay kaydırma için optimize edilmiş genişlik
 * - İş ilanı bilgileri (başlık, hastane, şehir, çalışma tipi)
 * - Başvuru durumu rozeti
 * - İkon ve tarih gösterimi
 * - Modern tasarım (yuvarlatılmış köşeler, gölge)
 * 
 * Kullanım:
 * ```tsx
 * <FeaturedJobCard job={jobData} onPress={handlePress} />
 * ```
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from './Typography';
import { Avatar } from './Avatar';
import { colors } from '@/theme';
import { JobListItem } from '@/types/job';
import { formatDate } from '@/utils/date';
import { getFullImageUrl } from '@/utils/imageUrl';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;

/**
 * FeaturedJobCard bileşeni props interface'i
 */
interface FeaturedJobCardProps {
  /** İş ilanı verisi */
  job: JobListItem;
  /** Tıklama fonksiyonu */
  onPress: () => void;
}

/**
 * Öne Çıkan İş İlanı Kartı Bileşeni
 * Dashboard'da yatay kaydırmalı liste için kullanılır
 */
export const FeaturedJobCard: React.FC<FeaturedJobCardProps> = ({ job, onPress }) => {
  // Hastane logosu URL'ini işle
  const hospitalLogoUrl = getFullImageUrl(job.hospital_logo);
  
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <View style={styles.header}>
        <Avatar
          size="sm"
          source={hospitalLogoUrl ?? undefined}
          initials={job.hospital_name?.substring(0, 2).toUpperCase() || '??'}
        />
        <View style={styles.headerContent}>
          <Typography variant="body" style={styles.title} numberOfLines={1}>
            {job.title}
          </Typography>
          <Typography variant="caption" style={styles.hospital} numberOfLines={1}>
            {job.hospital_name}
          </Typography>
        </View>
        {job.is_applied && (
          <View style={styles.appliedBadge}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success[600]} />
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.row}>
          <Ionicons name="location-outline" size={16} color={colors.neutral[500]} />
          <Typography variant="caption" style={styles.text}>
            {job.city_name}
          </Typography>
        </View>
        <View style={styles.row}>
          <Ionicons name="time-outline" size={16} color={colors.neutral[500]} />
          <Typography variant="caption" style={styles.text}>
            {job.work_type}
          </Typography>
        </View>
      </View>

      <View style={styles.footer}>
        <Typography variant="caption" style={styles.date}>
          {formatDate(job.created_at || '')}
        </Typography>
        <View style={styles.actionButton}>
          <Typography variant="caption" style={styles.actionText}>
            İncele
          </Typography>
          <Ionicons name="arrow-forward" size={14} color={colors.primary[600]} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.neutral[100],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: 2,
  },
  hospital: {
    color: colors.neutral[500],
  },
  appliedBadge: {
    marginLeft: 8,
  },
  content: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  text: {
    color: colors.neutral[600],
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  date: {
    color: colors.neutral[400],
    fontSize: 11,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary[50],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  actionText: {
    color: colors.primary[600],
    fontWeight: '600',
    fontSize: 11,
  },
});
