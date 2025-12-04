import React, { useState } from 'react';
import { StyleSheet, FlatList, RefreshControl, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius } from '@/theme';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/layout/Screen';
import { NotificationCard } from '../components/NotificationCard';
import { useNotifications } from '../hooks/useNotifications';
import { useMarkAsRead } from '../hooks/useMarkAsRead';
import { Bell, BellOff, Inbox } from 'lucide-react-native';
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



  const renderItem = ({ item }: { item: NotificationItem }) => {
    const handlePress = () => {
      if (!item.is_read) {
        markAsReadMutation.mutate(item.id);
      }
    };

    const formatTimestamp = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInHours = diffInMs / (1000 * 60 * 60);
      
      if (diffInHours < 1) {
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        return `${diffInMinutes} dakika önce`;
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)} saat önce`;
      } else {
        return date.toLocaleDateString('tr-TR', { 
          day: 'numeric', 
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    };

    return (
      <NotificationCard
        title={item.title}
        message={item.message || 'Bildirim'}
        timestamp={item.created_at ? formatTimestamp(item.created_at) : 'Tarih yok'}
        isRead={item.is_read || false}
        type={item.type || 'info'}
        onPress={handlePress}
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
      {/* Modern Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Bell size={28} color={colors.primary[600]} />
          </View>
          <View style={styles.headerText}>
            <Typography variant="h2" style={styles.headerTitle}>
              Bildirimler
            </Typography>
            <Typography variant="caption" style={styles.headerSubtitle}>
              {unreadCount > 0 ? `${unreadCount} okunmamış bildirim` : 'Tüm bildirimler okundu'}
            </Typography>
          </View>
        </View>
      </View>

      {/* Stats & Filter */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, styles.totalIcon]}>
            <Inbox size={18} color={colors.primary[700]} />
          </View>
          <Typography variant="caption" style={styles.statLabel}>
            Toplam
          </Typography>
          <Typography variant="h3" style={styles.statValue}>
            {notifications.length}
          </Typography>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, styles.unreadIcon]}>
            <BellOff size={18} color={colors.warning[700]} />
          </View>
          <Typography variant="caption" style={styles.statLabel}>
            Okunmamış
          </Typography>
          <Typography variant="h3" style={styles.statValue}>
            {unreadCount}
          </Typography>
        </View>
      </View>

      {/* Filter Toggle */}
      <TouchableOpacity 
        style={[styles.filterButton, showUnreadOnly && styles.filterButtonActive]}
        onPress={() => setShowUnreadOnly((prev) => !prev)}
      >
        <BellOff size={20} color={showUnreadOnly ? colors.background.primary : colors.primary[600]} />
        <Typography 
          variant="body" 
          style={showUnreadOnly ? styles.filterButtonTextActive : styles.filterButtonText}
        >
          {showUnreadOnly ? 'Sadece Okunmamışlar' : 'Tüm Bildirimler'}
        </Typography>
        {showUnreadOnly && unreadCount > 0 && (
          <View style={styles.filterBadge}>
            <Typography variant="caption" style={styles.filterBadgeText}>
              {unreadCount}
            </Typography>
          </View>
        )}
      </TouchableOpacity>

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
              <View style={styles.emptyIcon}>
                <Bell size={64} color={colors.neutral[300]} />
              </View>
              <Typography variant="h3" style={styles.emptyTitle}>
                {showUnreadOnly ? 'Okunmamış Bildirim Yok' : 'Henüz Bildirim Yok'}
              </Typography>
              <Typography variant="body" style={styles.emptyText}>
                {showUnreadOnly 
                  ? 'Tüm bildirimleriniz okunmuş durumda'
                  : 'Yeni gelişmeler olduğunda burada görünecek'}
              </Typography>
              {showUnreadOnly && (
                <TouchableOpacity 
                  style={styles.emptyButton}
                  onPress={() => setShowUnreadOnly(false)}
                >
                  <Typography variant="body" style={styles.emptyButtonText}>
                    Tüm Bildirimleri Göster
                  </Typography>
                </TouchableOpacity>
              )}
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
    paddingVertical: spacing.lg,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
  },
  headerSubtitle: {
    color: colors.text.secondary,
    fontSize: 13,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.background.primary,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  totalIcon: {
    backgroundColor: colors.primary[100],
  },
  unreadIcon: {
    backgroundColor: colors.warning[100],
  },
  statLabel: {
    color: colors.text.secondary,
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.primary[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  filterButtonActive: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  filterButtonText: {
    flex: 1,
    color: colors.primary[700],
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: colors.background.primary,
  },
  filterBadge: {
    backgroundColor: colors.error[600],
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  filterBadgeText: {
    color: colors.background.primary,
    fontSize: 11,
    fontWeight: '700',
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
    padding: spacing['3xl'],
    alignItems: 'center',
  },
  emptyIcon: {
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    marginBottom: spacing.sm,
    textAlign: 'center',
    color: colors.text.primary,
  },
  emptyText: {
    color: colors.text.secondary,
    textAlign: 'center',
    fontSize: 14,
    marginBottom: spacing.lg,
  },
  emptyButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary[600],
    borderRadius: 24,
  },
  emptyButtonText: {
    color: colors.background.primary,
    fontWeight: '600',
  },
});

export default NotificationsScreen;
