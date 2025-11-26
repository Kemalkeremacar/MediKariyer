import React from 'react';
import { RefreshControl, StyleSheet } from 'react-native';
import { useAuthStore } from '@/store/authStore';
import { useDoctorDashboard } from '@/hooks/useDoctorDashboard';
import { colors, spacing, borderRadius, shadows, typography } from '@/constants/theme';
import type { DashboardApplication, DashboardJob } from '@/types/dashboard';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Box,
  VStack,
  HStack,
  Badge,
  BadgeText,
  Spinner,
} from '@gluestack-ui/themed';

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

const NEUTRAL_BADGE = {
  borderColor: colors.border.light,
  backgroundColor: colors.neutral[100],
  color: colors.neutral[700],
};

const formatBadgeStyle = (status?: string | null) => {
  if (!status) {
    return NEUTRAL_BADGE;
  }
  const palette = STATUS_COLORS[status] ?? null;
  if (!palette) {
    return NEUTRAL_BADGE;
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

const StatusBadge = ({ status }: { status?: string | null }) => {
  const palette = formatBadgeStyle(status);
  return (
    <Badge
      borderWidth={1}
      borderColor={palette.borderColor}
      backgroundColor={palette.backgroundColor}
      rounded="$full"
      px="$2"
      py="$1"
    >
      <BadgeText color={palette.color} fontSize="$xs">
        {status ?? 'Durum bilinmiyor'}
      </BadgeText>
    </Badge>
  );
};

const SectionTitle = ({ title }: { title: string }) => (
  <Typography variant="title" style={styles.sectionTitle}>
    {title}
  </Typography>
);

export const DashboardScreen = () => {
  const firstName = useAuthStore((state) => state.user?.first_name ?? 'Doktor');
  const { data, isLoading, isError, refetch, isRefetching } =
    useDoctorDashboard();

  const renderApplications = (items: DashboardApplication[]) => {
    if (!items.length) {
      return (
        <EmptyState
          title="Henüz başvuru yapılmadı"
          description="Yeni fırsatlara göz atarak başvurularını başlatabilirsin."
        />
      );
    }

    return (
      <VStack space="md">
        {items.map((item) => (
          <Card
            key={item.id}
            padding="lg"
            shadow="none"
            style={styles.listCard}
          >
            <Typography variant="title">
              {item.job_title ?? 'İlan'}
            </Typography>
            <Typography variant="bodySecondary">
              {item.hospital_name ?? 'Kurum bilgisi yok'}
            </Typography>
            <HStack mt="$2" justifyContent="space-between" alignItems="center">
              <StatusBadge status={item.status} />
              <Typography variant="caption">
                {formatDate(item.created_at)}
              </Typography>
            </HStack>
          </Card>
        ))}
      </VStack>
    );
  };

  const renderJobs = (items: DashboardJob[]) => {
    if (!items.length) {
      return (
        <EmptyState
          title="Önerilen iş ilanı bulunamadı"
          description="Profilini güncelleyerek daha iyi öneriler alabilirsin."
        />
      );
    }

    return (
      <VStack space="md">
        {items.map((item) => (
          <Card
            key={item.id}
            padding="lg"
            shadow="none"
            style={styles.listCard}
          >
            <HStack justifyContent="space-between" alignItems="center">
              <Typography variant="title">{item.title ?? 'İlan'}</Typography>
              {item.is_applied && (
                <Badge
                  borderWidth={1}
                  borderColor={colors.success[300]}
                  backgroundColor={colors.success[100]}
                  rounded="$full"
                  px="$2"
                  py="$1"
                >
                  <BadgeText color="$success900" fontSize="$xs">
                    Başvuruldu
                  </BadgeText>
                </Badge>
              )}
            </HStack>
            <Typography variant="bodySecondary">
              {item.hospital_name ?? 'Kurum bilgisi yok'}
            </Typography>
            <HStack mt="$2" justifyContent="space-between">
              <Typography variant="caption">
                {item.city_name ?? 'Şehir belirtilmedi'}
              </Typography>
              <Typography variant="caption">
                {formatDate(item.created_at)}
              </Typography>
            </HStack>
            {item.salary_range && (
              <Typography variant="body" style={styles.metaHighlight}>
                {item.salary_range}
              </Typography>
            )}
          </Card>
        ))}
      </VStack>
    );
  };

  if (isLoading && !data) {
    return (
      <ScreenContainer scrollable={false} contentContainerStyle={styles.loader}>
        <Spinner size="large" color="$primary600" />
      </ScreenContainer>
    );
  }

  if (isError || !data) {
    return (
      <ScreenContainer scrollable={false} contentContainerStyle={styles.loader}>
        <Typography variant="title">Dashboard yüklenemedi</Typography>
        <Button label="Tekrar dene" onPress={() => refetch()} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
      }
    >
      <Card padding="2xl" shadow="lg" style={styles.heroCard}>
        <Typography variant="caption" style={styles.heroLabel}>
          Hoş geldin
        </Typography>
        <Typography variant="heading">{firstName}</Typography>
        <Typography variant="bodySecondary" style={styles.heroDescription}>
          Başvurularını ve önerilen ilanları buradan takip edebilirsin.
        </Typography>
      </Card>

      <HStack space="md">
        <Card style={styles.summaryCard}>
          <Typography variant="subtitle">Bildirim</Typography>
          <Typography variant="heading">
            {data.unread_notifications_count}
          </Typography>
          <Typography variant="bodySecondary">Okunmamış</Typography>
        </Card>
        <Card style={styles.summaryCard}>
          <Typography variant="subtitle">Profil Tamamlanma</Typography>
          <Typography variant="heading">
            {data.profile_completion_percent}%
          </Typography>
          <Typography variant="bodySecondary">
            Profilini güncel tut
          </Typography>
        </Card>
      </HStack>

      <Card style={styles.sectionCard}>
        <SectionTitle title="Son Başvurular" />
        {renderApplications(data.recent_applications)}
      </Card>

      <Card style={styles.sectionCard}>
        <SectionTitle title="Önerilen İş İlanları" />
        {renderJobs(data.recommended_jobs)}
      </Card>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  loader: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  heroCard: {
    backgroundColor: colors.primary[600],
    borderRadius: borderRadius.xl,
    ...shadows.md,
  },
  heroLabel: {
    color: colors.primary[100],
  },
  heroDescription: {
    color: colors.primary[100],
    marginTop: spacing.sm,
  },
  summaryCard: {
    flex: 1,
    gap: spacing.xs,
  },
  sectionCard: {
    gap: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.sm,
  },
  listCard: {
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  metaHighlight: {
    marginTop: spacing.sm,
    color: colors.neutral[800],
    fontWeight: typography.fontWeight.medium,
  },
});

