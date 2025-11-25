import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useDoctorDashboard } from '@/hooks/useDoctorDashboard';
import { colors, shadows, spacing, borderRadius, typography } from '@/constants/theme';
import type { DashboardApplication, DashboardJob } from '@/types/dashboard';

const STATUS_COLORS: Record<
  string,
  { text: string; border: string; bg: string }
> = {
  Başvuruldu: {
    text: colors.warning[800],
    border: colors.warning[300],
    bg: colors.warning[100],
  },
  İnceleniyor: {
    text: colors.primary[700],
    border: colors.primary[200],
    bg: colors.primary[100],
  },
  'Kabul Edildi': {
    text: colors.success[800],
    border: colors.success[300],
    bg: colors.success[100],
  },
  'Red Edildi': {
    text: colors.error[800],
    border: colors.error[300],
    bg: colors.error[100],
  },
  'Geri Çekildi': {
    text: colors.neutral[700],
    border: colors.neutral[200],
    bg: colors.neutral[100],
  },
};

const formatBadgeStyle = (status?: string | null) => {
  if (!status) {
    return styles.badgeNeutral;
  }
  const palette = STATUS_COLORS[status] ?? null;
  if (!palette) {
    return styles.badgeNeutral;
  }
  return {
    borderColor: palette.border,
    backgroundColor: palette.bg,
    color: palette.text,
  };
};

const formatDate = (value?: string | null) => {
  if (!value) {
    return '-';
  }
  try {
    return new Date(value).toLocaleDateString('tr-TR');
  } catch {
    return value;
  }
};

const EmptyState = ({ message }: { message: string }) => (
  <View style={styles.emptyState}>
    <Text style={styles.emptyStateText}>{message}</Text>
  </View>
);

const SectionTitle = ({ title }: { title: string }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
);

export const DashboardScreen = () => {
  const firstName = useAuthStore((state) => state.user?.first_name ?? 'Doktor');
  const { data, isLoading, isError, refetch, isRefetching } =
    useDoctorDashboard();

  const renderApplications = (items: DashboardApplication[]) => {
    if (!items.length) {
      return <EmptyState message="Henüz başvuru yapılmadı." />;
    }

    return items.map((item) => (
      <View key={item.id} style={styles.cardItem}>
        <Text style={styles.itemTitle}>{item.job_title ?? 'İlan'}</Text>
        <Text style={styles.itemSubtitle}>
          {item.hospital_name ?? 'Kurum bilgisi yok'}
        </Text>
        <View style={styles.itemMeta}>
          <View style={[styles.badge, formatBadgeStyle(item.status ?? undefined)]}>
            <Text style={styles.badgeText}>{item.status ?? 'Durum bilinmiyor'}</Text>
          </View>
          <Text style={styles.metaText}>{formatDate(item.created_at)}</Text>
        </View>
      </View>
    ));
  };

  const renderJobs = (items: DashboardJob[]) => {
    if (!items.length) {
      return <EmptyState message="Önerilen iş ilanı bulunamadı." />;
    }

    return items.map((item) => (
      <View key={item.id} style={styles.cardItem}>
        <View style={styles.jobHeader}>
          <Text style={styles.itemTitle}>{item.title ?? 'İlan'}</Text>
          {item.is_applied && (
            <View style={[styles.badge, styles.badgeApplied]}>
              <Text style={[styles.badgeText, { color: '#065f46' }]}>
                Başvuruldu
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.itemSubtitle}>
          {item.hospital_name ?? 'Kurum bilgisi yok'}
        </Text>
        <View style={styles.itemMetaWrap}>
          <Text style={styles.metaText}>
            {item.city_name ?? 'Şehir belirtilmedi'}
          </Text>
          <Text style={styles.metaText}>{formatDate(item.created_at)}</Text>
        </View>
        {item.salary_range && (
          <Text style={styles.metaHighlight}>{item.salary_range}</Text>
        )}
      </View>
    ));
  };

  if (isLoading && !data) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={styles.loader}>
        <Text style={styles.errorTitle}>Dashboard yüklenemedi</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => refetch()}
        >
          <Text style={styles.retryText}>Tekrar dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
    >
      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>Hoş geldin</Text>
        <Text style={styles.heroTitle}>{firstName}</Text>
        <Text style={styles.heroDescription}>
          Başvurularını ve önerilen ilanları buradan takip edebilirsin.
        </Text>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Bildirim</Text>
          <Text style={styles.summaryValue}>
            {data.unread_notifications_count}
          </Text>
          <Text style={styles.summaryHelper}>Okunmamış</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Profil Tamamlanma</Text>
          <Text style={styles.summaryValue}>
            {data.profile_completion_percent}%
          </Text>
          <Text style={styles.summaryHelper}>Profilini güncel tut</Text>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <SectionTitle title="Son Başvurular" />
        {renderApplications(data.recent_applications)}
      </View>

      <View style={styles.sectionCard}>
        <SectionTitle title="Önerilen İş İlanları" />
        {renderJobs(data.recommended_jobs)}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
    gap: spacing.lg,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
    backgroundColor: colors.background.secondary,
  },
  errorTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  retryButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary[600],
  },
  retryText: {
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.semibold,
  },
  heroCard: {
    backgroundColor: colors.primary[600],
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    ...shadows.md,
  },
  heroLabel: {
    color: colors.primary[100],
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.xs,
  },
  heroTitle: {
    color: colors.text.inverse,
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
  },
  heroDescription: {
    color: colors.primary[100],
    marginTop: spacing.sm,
    lineHeight: typography.lineHeight.normal,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  summaryLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  summaryValue: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  summaryHelper: {
    marginTop: spacing.xs,
    color: colors.text.secondary,
  },
  sectionCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  cardItem: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  itemTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  itemSubtitle: {
    marginTop: spacing.xs,
    color: colors.text.secondary,
  },
  itemMeta: {
    marginTop: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemMetaWrap: {
    marginTop: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.sm,
  },
  metaHighlight: {
    marginTop: spacing.sm,
    color: colors.neutral[800],
    fontWeight: typography.fontWeight.medium,
  },
  badge: {
    borderWidth: 1,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  badgeNeutral: {
    borderColor: colors.border.light,
    backgroundColor: colors.neutral[100],
    color: colors.neutral[700],
  },
  badgeApplied: {
    borderColor: colors.success[300],
    backgroundColor: colors.success[100],
  },
  badgeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  emptyState: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#6b7280',
  },
});

