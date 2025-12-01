import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';
import { notificationService } from '@/api/services/notification.service';
import type { NotificationItem, NotificationsResponse } from '@/types/notification';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { Box, HStack, VStack, Spinner, Badge, BadgeText } from '@gluestack-ui/themed';

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
    const cardStyle = StyleSheet.flatten([
      styles.card,
      !item.is_read ? styles.unreadCard : {},
    ]);

    return (
      <Card style={cardStyle}>
        <HStack justifyContent="space-between" alignItems="center" mb="$2">
          <Badge
            borderRadius="$full"
            px="$2"
            py="$1"
            backgroundColor={palette.bg}
          >
            <BadgeText color={palette.text} fontSize="$xs">
              {item.type?.toUpperCase() ?? 'BİLDİRİM'}
            </BadgeText>
          </Badge>
          <Typography variant="caption" style={styles.dateText}>
            {formatDate(item.created_at)}
          </Typography>
        </HStack>
        <Typography variant="title">{item.title || 'Bildirim'}</Typography>
        <Typography variant="bodySecondary" style={styles.body}>
          {item.body || '-'}
        </Typography>
        {!item.is_read && (
          <Button
            label="Okundu işaretle"
            variant="secondary"
            onPress={() => markAsReadMutation.mutate(item.id)}
            loading={markAsReadMutation.isPending}
            fullWidth
            style={styles.markReadButton}
          />
        )}
      </Card>
    );
  };

  const onRefresh = () => {
    notificationsQuery.refetch();
  };

  const renderErrorState = () => (
    <ErrorMessage
      title="Bildirimler yüklenemedi"
      message="Lütfen internet bağlantınızı kontrol edip tekrar deneyin."
      onRetry={() => notificationsQuery.refetch()}
    />
  );

  const renderSkeletons = () => (
    <VStack style={styles.skeletonContainer} space="md">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={`skeleton-${index}`}>
          <Box height={20} width="30%" backgroundColor={colors.neutral[100]} borderRadius={borderRadius.md} mb="$3" />
          <Box height={16} width="60%" backgroundColor={colors.neutral[100]} borderRadius={borderRadius.md} mb="$2" />
          <Box height={12} width="80%" backgroundColor={colors.neutral[100]} borderRadius={borderRadius.md} />
          <Box height={12} width="40%" backgroundColor={colors.neutral[100]} borderRadius={borderRadius.md} mt="$2" />
        </Card>
      ))}
    </VStack>
  );

  return (
    <ScreenContainer scrollable={false}>
      <Box style={styles.header}>
        <VStack>
          <Typography variant="heading">Bildirimler</Typography>
          <Typography variant="bodySecondary">
            {showUnreadOnly ? 'Okunmamış' : 'Tüm'} bildirimleri görüntülüyorsun
          </Typography>
        </VStack>
        <Button
          label={showUnreadOnly ? 'Tümünü göster' : 'Okunmamış'}
          variant="ghost"
          onPress={() => setShowUnreadOnly((prev) => !prev)}
        />
      </Box>

      {showUnreadOnly && (
        <Card style={styles.unreadInfo}>
          <Typography variant="subtitle">
            {unReadCount} okunmamış bildirim
          </Typography>
        </Card>
      )}

      <FlatList
        data={notifications}
        keyExtractor={(item, index) => `notif-${item.id}-${index}`}
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
            <Spinner style={{ marginVertical: spacing.md }} color="$primary600" />
          ) : null
        }
        ListEmptyComponent={
          notificationsQuery.isLoading ? (
            renderSkeletons()
          ) : notificationsQuery.isError ? (
            renderErrorState()
          ) : (
            <EmptyState
              type="notifications"
              title="Henüz bildirim bulunmamaktadır."
              description="Yeni gelişmeler olduğunda burada görünecek."
            />
          )
        }
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  unreadInfo: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    backgroundColor: colors.warning[50],
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing['3xl'],
    gap: spacing.md,
  },
  card: {
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  unreadCard: {
    borderColor: colors.primary[200],
  },
  dateText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  body: {
    marginTop: spacing.xs,
  },
  markReadButton: {
    marginTop: spacing.md,
  },
  errorState: {
    paddingVertical: spacing['3xl'],
    alignItems: 'center',
    gap: spacing.sm,
  },
  skeletonContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing['2xl'],
  },
});

export default NotificationsScreen;

