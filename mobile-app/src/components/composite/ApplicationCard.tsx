/**
 * @file ApplicationCard.tsx
 * @description Başvuru kartı bileşeni
 * 
 * Özellikler:
 * - Başvuru bilgileri (iş başlığı, hastane, durum, tarih)
 * - Dinamik durum rozeti (renk ve ikon)
 * - İlan durumu uyarıları (kaldırıldı, hastane pasif)
 * - Avatar ve ikonlar
 * - Tıklanabilir kart
 * - Modern tasarım
 * 
 * Kullanım:
 * ```tsx
 * <ApplicationCard application={app} onPress={handlePress} />
 * ```
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { Chip } from '@/components/ui/Chip';
import { Avatar } from '@/components/ui/Avatar';
import { Divider } from '@/components/ui/Divider';
import { colors, spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { formatRelativeTime } from '@/utils/date';
import { getFullImageUrl } from '@/utils/imageUrl';

/**
 * ApplicationCard bileşeni props interface'i
 */
interface ApplicationCardProps {
  /** Başvuru verisi */
  application: any;
  /** Tıklama fonksiyonu */
  onPress: () => void;
}

/**
 * Status ID'ye göre renk ve stil haritası
 */
const STATUS_STYLES: Record<number, { 
  bgColor: string; 
  textColor: string; 
  icon: keyof typeof Ionicons.glyphMap;
}> = {
  1: { bgColor: colors.warning[100], textColor: colors.warning[700], icon: 'time' },           // Başvuruldu
  2: { bgColor: colors.primary[100], textColor: colors.primary[700], icon: 'eye' },            // İnceleniyor
  3: { bgColor: colors.success[100], textColor: colors.success[700], icon: 'checkmark-circle' }, // Kabul Edildi
  4: { bgColor: colors.error[100], textColor: colors.error[700], icon: 'close-circle' },       // Reddedildi
  5: { bgColor: colors.neutral[200], textColor: colors.neutral[600], icon: 'arrow-undo' },     // Geri Çekildi
};

/**
 * Bilinmeyen durumlar için varsayılan stil
 */
const DEFAULT_STATUS_STYLE = { 
  bgColor: colors.neutral[100], 
  textColor: colors.neutral[600], 
  icon: 'help-circle' as const 
};

/**
 * Başvuru Kartı Bileşeni
 * Başvuru listesinde kullanılır
 */
export const ApplicationCard: React.FC<ApplicationCardProps> = ({ application, onPress }) => {
  const dateToUse = application.applied_at || application.created_at;
  const timeAgo = formatRelativeTime(dateToUse) || null;

  // İlan durumu kontrolleri (web ile uyumlu)
  const jobStatus = application.job_status || '';
  const isJobDeleted = application.is_job_deleted || Boolean(application.job_deleted_at);
  const isJobPassive = 
    application.job_status_id === 4 || 
    jobStatus === 'Pasif' || 
    jobStatus === 'Passive' ||
    (typeof jobStatus === 'string' && jobStatus.toLowerCase().includes('pasif')) ||
    (typeof jobStatus === 'string' && jobStatus.toLowerCase().includes('passive'));
  const isJobUnavailable = isJobDeleted || isJobPassive || application.is_hospital_active === false;
  const unavailableReason = isJobDeleted 
    ? 'İlan Kaldırıldı' 
    : isJobPassive
    ? 'İlan Pasif'
    : (application.is_hospital_active === false ? 'Hastane Pasif' : null);

  // Status ID'ye göre stil al
  const statusId = application.status_id || 1;
  const statusStyle = STATUS_STYLES[statusId] || DEFAULT_STATUS_STYLE;
  const statusLabel = application.status_label || application.status || 'Başvuruldu';

  return (
    <View>
      <TouchableOpacity 
        onPress={isJobUnavailable ? undefined : onPress} 
        activeOpacity={isJobUnavailable ? 1 : 0.7}
        disabled={isJobUnavailable}
      >
        <Card variant="elevated" padding="lg" style={isJobUnavailable ? {...styles.card, ...styles.cardUnavailable} : styles.card}>
        {/* Başlık ve Durum Rozeti */}
        <View style={styles.header}>
          <Avatar
            size="md"
            source={application.hospital_logo ? getFullImageUrl(application.hospital_logo) : undefined}
            initials={application.hospital_name?.substring(0, 2).toUpperCase()}
            contentFit="contain"
          />
          <View style={styles.headerContent}>
            <Typography variant="h3" style={isJobUnavailable ? {...styles.title, ...styles.titleUnavailable} : styles.title}>
              {application.job_title || application.position_title}
            </Typography>
            <View style={styles.hospitalRow}>
              <Ionicons name="business" size={14} color={colors.text.secondary} />
              <Typography variant="body" style={styles.hospital}>
                {application.hospital_name}
              </Typography>
            </View>
          </View>
          <View style={styles.headerRight}>
            {/* İlan pasif/silinmiş ise sadece uyarı göster, durum badge'i gösterme */}
            {isJobUnavailable ? (
              <View style={[styles.statusBadge, { backgroundColor: colors.warning[100] }]}>
                <Ionicons name="warning" size={12} color={colors.warning[700]} />
                <Typography variant="caption" style={{ ...styles.statusText, color: colors.warning[700] }}>
                  {unavailableReason}
                </Typography>
              </View>
            ) : (
              <>
                {/* Dinamik Durum Rozeti - Sadece aktif ilanlar için */}
                <View style={[styles.statusBadge, { backgroundColor: statusStyle.bgColor }]}>
                  <Ionicons name={statusStyle.icon} size={12} color={statusStyle.textColor} />
                  <Typography variant="caption" style={{ ...styles.statusText, color: statusStyle.textColor }}>
                    {statusLabel}
                  </Typography>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} style={{ marginTop: 4 }} />
              </>
            )}
          </View>
        </View>

        <Divider spacing="sm" />
        
        {/* Detaylar */}
        <View style={styles.details}>
          {/* Tarih bilgisi */}
          {timeAgo && (
            <Chip
              label={timeAgo}
              icon={<Ionicons name="calendar-outline" size={12} color={colors.neutral[600]} />}
              variant="soft"
              color="neutral"
              size="sm"
            />
          )}
        </View>
        </Card>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  cardUnavailable: {
    opacity: 0.7,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning[400],
  },
  titleUnavailable: {
    textDecorationLine: 'line-through',
    color: colors.text.tertiary,
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
  headerRight: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    lineHeight: 22,
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
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
