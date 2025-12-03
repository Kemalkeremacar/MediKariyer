import React, { useState } from 'react';
import { StyleSheet, FlatList, RefreshControl, View, ActivityIndicator } from 'react-native';
import { colors, spacing, borderRadius } from '@/theme';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/layout/Screen';
import { NotificationCard } from '../components/NotificationCard';
import { useNotifications } from '../hooks/useNotifications';
import { useMarkAsRead } from '../hooks/useMarkAsRead';
import type { NotificationItem } from '@/types/notification';

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

  return (
    <Screen 
      scrollable={false}
      loading={isLoading}
      error={isError ? (error as Error) : null}
      onRetry={refetch}
    >
      <View style={styles.header}>
        <View>
          <Typography variant="h2">Bildirimler</Typography>
          <Typography variant="caption">
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
            <View style={styles.loadingFooter}>
              <ActivityIndicator size="small" color={colors.primary[600]} />
              <Typography variant="caption">Daha fazla yükleniyor...</Typography>
            </View>
          ) : null
        }
        ListEmptyComponent={
          !isLoading && !isError ? (
            <View style={styles.emptyState}>
              <Typography variant="h3" style={styles.emptyTitle}>Henüz bildirim bulunmamaktadır.</Typography>
              <Typography variant="body" style={styles.emptyText}>
                Yeni gelişmeler olduğunda burada görünecek.
              </Typography>
            </View>
          ) : null
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
  loadingFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

export default NotificationsScreen;
