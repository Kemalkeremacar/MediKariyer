import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';
import { notificationService } from '@/api/services/notification.service';
import type { NotificationItem, NotificationsResponse } from '@/types/notification';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';

const formatDate = (value?: string | null) => {
  if (!value) {
    return '-';
  }
  try {
    return new Date(value).toLocaleString('tr-TR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return value;
  }
};

const typeColorMap: Record<string, { bg: string; text: string }> = {
  success: { bg: colors.success[100], text: colors.success[800] },
  warning: { bg: colors.warning[100], text: colors.warning[800] },
  error: { bg: colors.error[100], text: colors.error[800] },
  info: { bg: colors.primary[100], text: colors.primary[800] },
};

const RETRY_DELAY = (attempt: number) => Math.min(1000 * 2 ** attempt, 8000);

export const NotificationsScreen = () => {
  const queryClient = useQueryClient();
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const notificationsQuery = useInfiniteQuery({
    queryKey: ['notifications', { showUnreadOnly }],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const response = await notificationService.listNotifications({
        page: typeof pageParam === 'number' ? pageParam : 1,
        limit: 20,
        is_read: showUnreadOnly ? false : undefined,
      });
      return response;
    },
    getNextPageParam: (lastPage) => {
      const { pagination } = lastPage;
      return pagination.has_next ? pagination.current_page + 1 : undefined;
    },
    retry: 2,
    retryDelay: RETRY_DELAY,
  });

  const notifications = useMemo(() => {
    const pages =
      (notificationsQuery.data as InfiniteData<NotificationsResponse, number> | undefined)
        ?.pages ?? [];
    return pages.flatMap((page) => page.data);
  }, [notificationsQuery.data]);

  const unReadCount = notifications.filter((item) => !item.is_read).length;

  useEffect(() => {
    if (notificationsQuery.isError) {
      console.warn('Bildirimler yüklenirken hata oluştu:', notificationsQuery.error);
    }
  }, [notificationsQuery.isError, notificationsQuery.error]);

  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: number) => notificationService.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: () => {
      Alert.alert('İşlem başarısız', 'Bildirim okundu olarak işaretlenemedi. Lütfen tekrar deneyin.');
    },
  });

  const renderItem = ({ item }: { item: NotificationItem }) => {
    const palette = typeColorMap[item.type] ?? typeColorMap.info;
    return (
      <View style={[styles.card, !item.is_read && styles.unreadCard]}>
        <View style={styles.cardHeader}>
          <View style={[styles.badge, { backgroundColor: palette.bg }]}>
            <Text style={[styles.badgeText, { color: palette.text }]}>
              {item.type?.toUpperCase() ?? 'BİLDİRİM'}
            </Text>
          </View>
          <Text style={styles.dateText}>{formatDate(item.created_at)}</Text>
        </View>
        <Text style={styles.title}>{item.title || 'Bildirim'}</Text>
        <Text style={styles.body}>{item.body || '-'}</Text>
        {!item.is_read && (
          <TouchableOpacity
            style={styles.markReadButton}
            onPress={() => markAsReadMutation.mutate(item.id)}
            disabled={markAsReadMutation.isPending}
          >
            {markAsReadMutation.isPending ? (
              <ActivityIndicator size="small" color={colors.text.inverse} />
            ) : (
              <Text style={styles.markReadText}>Okundu işaretle</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const onRefresh = () => {
    notificationsQuery.refetch();
  };

  const renderErrorState = () => (
    <View style={styles.errorState}>
      <Text style={styles.errorTitle}>Bildirimler yüklenemedi</Text>
      <TouchableOpacity style={styles.retryButton} onPress={() => notificationsQuery.refetch()}>
        <Text style={styles.retryText}>Tekrar dene</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSkeletons = () => (
    <View style={styles.skeletonContainer}>
      {Array.from({ length: 3 }).map((_, index) => (
        <View key={index} style={styles.skeletonCard}>
          <View style={styles.skeletonBadge} />
          <View style={styles.skeletonLineWide} />
          <View style={styles.skeletonLine} />
          <View style={styles.skeletonLineShort} />
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Bildirimler</Text>
          <Text style={styles.headerSubtitle}>
            {showUnreadOnly ? 'Okunmamış' : 'Tüm'} bildirimleri görüntülüyorsun
          </Text>
        </View>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setShowUnreadOnly((prev) => !prev)}
        >
          <Text style={styles.toggleText}>
            {showUnreadOnly ? 'Tümünü göster' : 'Okunmamış'}
          </Text>
        </TouchableOpacity>
      </View>

      {showUnreadOnly && (
        <View style={styles.unreadInfo}>
          <Text style={styles.unreadInfoText}>{unReadCount} okunmamış bildirim</Text>
        </View>
      )}

      <FlatList
        data={notifications}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={notificationsQuery.isRefetching} onRefresh={onRefresh} />
        }
        onEndReached={() => {
          if (notificationsQuery.hasNextPage && !notificationsQuery.isFetchingNextPage) {
            notificationsQuery.fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          notificationsQuery.isFetchingNextPage ? (
            <ActivityIndicator style={{ marginVertical: spacing.md }} />
          ) : null
        }
        ListEmptyComponent={
          notificationsQuery.isLoading ? (
            renderSkeletons()
          ) : notificationsQuery.isError ? (
            renderErrorState()
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Bildirim bulunamadı.</Text>
            </View>
          )
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  headerSubtitle: {
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  toggleButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[600],
  },
  toggleText: {
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.medium,
  },
  unreadInfo: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.warning[100],
  },
  unreadInfoText: {
    color: colors.warning[800],
    fontWeight: typography.fontWeight.medium,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
    gap: spacing.md,
  },
  card: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  unreadCard: {
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  badge: {
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  dateText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  body: {
    color: colors.text.secondary,
    lineHeight: typography.fontSize.base * 1.5,
  },
  markReadButton: {
    marginTop: spacing.md,
    backgroundColor: colors.primary[600],
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  markReadText: {
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.semibold,
  },
  emptyState: {
    paddingVertical: spacing['3xl'],
    alignItems: 'center',
  },
  emptyStateText: {
    color: colors.text.secondary,
  },
  errorState: {
    paddingVertical: spacing['3xl'],
    alignItems: 'center',
    gap: spacing.sm,
  },
  errorTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  retryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[600],
  },
  retryText: {
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.medium,
  },
  skeletonContainer: {
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing['2xl'],
  },
  skeletonCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  skeletonBadge: {
    width: 90,
    height: 20,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[100],
    marginBottom: spacing.sm,
  },
  skeletonLineWide: {
    height: 16,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[100],
    marginBottom: spacing.xs,
  },
  skeletonLine: {
    height: 12,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[100],
    marginBottom: spacing.xs,
  },
  skeletonLineShort: {
    height: 12,
    width: '60%',
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[100],
  },
});

export default NotificationsScreen;

