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

interface ApplicationCardProps {
  application: any;
  onPress: () => void;
}

// Status ID'ye göre renk ve stil mapping
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

// Default style for unknown statuses
const DEFAULT_STATUS_STYLE = { 
  bgColor: colors.neutral[100], 
  textColor: colors.neutral[600], 
  icon: 'help-circle' as const 
};

export const ApplicationCard: React.FC<ApplicationCardProps> = ({ application, onPress }) => {
  const dateToUse = application.applied_at || application.created_at;
  const timeAgo = formatRelativeTime(dateToUse) || null;

  // İlan durumu kontrolleri (web ile uyumlu)
  const isJobUnavailable = application.is_job_deleted || application.is_hospital_active === false;
  const unavailableReason = application.is_job_deleted 
    ? 'İlan Kaldırıldı' 
    : (application.is_hospital_active === false ? 'Hastane Pasif' : null);

  // Get status style based on status_id
  const statusId = application.status_id || 1;
  const statusStyle = STATUS_STYLES[statusId] || DEFAULT_STATUS_STYLE;
  const statusLabel = application.status_label || application.status || 'Başvuruldu';

  return (
    <View>
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <Card variant="elevated" padding="lg" style={isJobUnavailable ? {...styles.card, ...styles.cardUnavailable} : styles.card}>
        {/* Header with Status Badge */}
        <View style={styles.header}>
          <Avatar
            size="md"
            initials={application.hospital_name?.substring(0, 2).toUpperCase()}
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
            {/* Dynamic Status Badge */}
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bgColor }]}>
              <Ionicons name={statusStyle.icon} size={12} color={statusStyle.textColor} />
              <Typography variant="caption" style={{ ...styles.statusText, color: statusStyle.textColor }}>
                {statusLabel}
              </Typography>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.neutral[400]} style={{ marginTop: 4 }} />
          </View>
        </View>

        <Divider spacing="sm" />
        
        {/* Details */}
        <View style={styles.details}>
          {/* Uyarı: İlan yayından kaldırıldı veya hastane pasif */}
          {isJobUnavailable && unavailableReason && (
            <Chip
              label={unavailableReason}
              icon={<Ionicons name="warning" size={12} color={colors.warning[700]} />}
              variant="soft"
              color="warning"
              size="sm"
            />
          )}
          {application.city_name && (
            <Chip
              label={application.city_name}
              icon={<Ionicons name="location" size={12} color={colors.primary[700]} />}
              variant="soft"
              color="primary"
              size="sm"
            />
          )}
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
