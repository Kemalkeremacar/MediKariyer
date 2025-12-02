import React, { useEffect, useState } from 'react';
import { StyleSheet, FlatList, RefreshControl, View } from 'react-native';
import { colors, spacing, borderRadius } from '@/theme';
import { Card, Typography, Button, EmptyState, ErrorState, LoadingState } from '@/ui';
import { Screen } from '@/layouts';
import { NotificationCard } from '../components/NotificationCard';
import { useNotifications } from '../hooks/useNotifications';
import { useMarkAsRead } from '../hooks/useMarkAsRead';
import type { NotificationItem } from '../types';

export const NotificationsScreen = () => {
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const {
    notifications,
    unreadCount,
    isLoading,
    isError,
    error,
    isRefetching,
    isFetchingNextPage,
    hasNextPage,
    refetch,
    fetchNextPage,
  } = useNotifications({ showUnreadOnly });

  const markAsReadMutation = useMarkAsRead();

  useEffect(() => {
    if (isError) {
      console.warn('Bildirimler yüklenirken hata oluştu:', error);
    }
  }, [isError, error]);

  const renderItem = ({ item }: { item: NotificationItem }) => {
    return (
      <NotificationCard
        notification={item}
        onMarkAsRead={(id) => markAsReadMutation.mutate(id)}
        isMarkingAsRead={markAsReadMutation.isPending}
      />
    );
  };

  const onRefresh = () => {
    refetch();
  };

  const renderErrorState = () => (
    <ErrorState
      title="Bildirimler yüklenemedi"
      message="Lütfen internet bağlantınızı kontrol edip tekrar deneyin."
      onRetry={() => refetch()}
    />
  );

  return (
    <Screen scrollable={false}>
      <View style={styles.header}>
        <View>
          <Typography variant="h2">Bildirimler</Typography>
          <Typography variant="bodySmall" color="secondary">
            {showUnreadOnly ? 'Okunmamış' : 'Tüm'} bildirimleri görüntülüyorsun
          </Typography>
        </View>
        <Button
          label={showUnreadOnly ? 'Tümünü göster' : 'Okunmamış'}
          variant="ghost"
          size="sm"
          onPress={() => setShowUnreadOnly((prev) => !prev)}
        />
      </View>

      {showUnreadOnly && (
        <Card variant="outlined" padding="md" style={styles.unreadInfo}>
          <Typography variant="body">
            {unreadCount} okunmamış bildirim
          </Typography>
        </Card>
      )}

      <FlatList
        data={notifications}
        keyExtractor={(item, index) => `notif-${item.id}-${index}`}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} />
        }
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <LoadingState message="Daha fazla yükleniyor..." size="small" />
          ) : null
        }
        ListEmptyComponent={
          isLoading ? (
            <LoadingState message="Bildirimler yükleniyor..." />
          ) : isError ? (
            renderErrorState()
          ) : (
            <EmptyState
              title="Henüz bildirim bulunmamaktadır."
              description="Yeni gelişmeler olduğunda burada görünecek."
            />
          )
        }
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  },
});

export default NotificationsScreen;
