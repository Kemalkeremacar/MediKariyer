import React, { useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { Bell, CheckSquare, Square, Trash2 } from 'lucide-react-native';
import { Screen } from '@/components/layout/Screen';
import { Typography } from '@/components/ui/Typography';
import { IconButton } from '@/components/ui/IconButton';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { Checkbox } from '@/components/ui/Checkbox';
import { NotificationCard } from '@/components/composite/NotificationCard';
import { colors, spacing } from '@/theme';
import { notificationService } from '@/api/services/notification.service';
import { useNotifications } from '@/features/notifications/hooks/useNotifications';
import { useMarkAsRead } from '@/features/notifications/hooks/useMarkAsRead';

export const NotificationsScreen = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const { 
    notifications: notificationList, 
    isLoading, 
    isError, 
    refetch, 
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  } = useNotifications({ limit: 20 });

  const { mutateAsync: markAsRead } = useMarkAsRead();

  const filteredNotifications = React.useMemo(() => {
    if (activeTab === 'unread') {
      return notificationList.filter((n: any) => !n.is_read);
    }
    
    return notificationList;
  }, [notificationList, activeTab]);

  const unreadCount = notificationList.filter((n: any) => !n.is_read).length;

  const handleNotificationPress = async (notification: any) => {
    // Mark as read
    if (!notification.is_read) {
      try {
        await markAsRead(notification.id);
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
    
    // Navigate based on notification type
    // TODO: Add navigation logic
  };

  const handleMarkAllRead = async () => {
    // Mark all unread notifications as read
    const unreadNotifications = notificationList.filter((n: any) => !n.is_read);
    try {
      await Promise.all(
        unreadNotifications.map((n: any) => markAsRead(n.id))
      );
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedIds(new Set());
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredNotifications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredNotifications.map((n: any) => n.id)));
    }
  };

  const toggleSelectNotification = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleMarkSelectedAsRead = async () => {
    const selectedNotifications = Array.from(selectedIds);
    try {
      await Promise.all(
        selectedNotifications.map((id) => markAsRead(id))
      );
      setSelectedIds(new Set());
      setSelectionMode(false);
    } catch (error) {
      console.error('Failed to mark selected as read:', error);
    }
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const handleDeleteSelected = async () => {
    // TODO: Implement delete API
    setSelectedIds(new Set());
    setSelectionMode(false);
    refetch();
  };

  return (
    <Screen
      scrollable={false}
      loading={isLoading}
      error={isError ? new Error('Bildirimler yüklenemedi') : null}
      onRetry={refetch}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Bell size={28} color={colors.primary[600]} />
          </View>
          <View style={styles.headerText}>
            <Typography variant="h2" style={styles.headerTitle}>
              {selectionMode ? `${selectedIds.size} seçildi` : 'Bildirimler'}
            </Typography>
            <Typography variant="caption" style={styles.headerSubtitle}>
              {selectionMode 
                ? 'Toplu işlem modu' 
                : unreadCount > 0 ? `${unreadCount} okunmamış` : 'Tüm bildirimler okundu'}
            </Typography>
          </View>
        </View>
        <IconButton
          icon={selectionMode ? <CheckSquare size={20} color={colors.primary[600]} /> : <Square size={20} color={colors.primary[600]} />}
          onPress={toggleSelectionMode}
          size="md"
          variant="ghost"
        />
      </View>

      {/* Selection Actions */}
      {selectionMode && (
        <View style={styles.selectionActions}>
          <TouchableOpacity 
            style={styles.selectAllButton}
            onPress={toggleSelectAll}
          >
            <Typography variant="body" style={styles.selectAllText}>
              {selectedIds.size === filteredNotifications.length ? 'Tümünü Kaldır' : 'Tümünü Seç'}
            </Typography>
          </TouchableOpacity>
          <View style={styles.actionButtons}>
            <Button
              label="Okundu İşaretle"
              onPress={handleMarkSelectedAsRead}
              variant="outline"
              size="sm"
              disabled={selectedIds.size === 0}
            />
            <IconButton
              icon={<Trash2 size={18} color={selectedIds.size > 0 ? colors.error[600] : colors.neutral[400]} />}
              onPress={handleDeleteSelected}
              size="sm"
              variant="ghost"
              disabled={selectedIds.size === 0}
            />
          </View>
        </View>
      )}

      {/* Tabs */}
      {!selectionMode && (
        <Tabs
          tabs={[
            { key: 'all', label: 'Tümü', badge: notificationList.length },
            { key: 'unread', label: 'Okunmamış', badge: unreadCount },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          variant="default"
        />
      )}

      {/* Notifications List */}
      <FlatList
        data={filteredNotifications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.notificationRow}>
            {selectionMode && (
              <View style={styles.checkboxContainer}>
                <Checkbox
                  checked={selectedIds.has(item.id)}
                  onPress={() => toggleSelectNotification(item.id)}
                  size="sm"
                />
              </View>
            )}
            <View style={{ flex: 1 }}>
              <NotificationCard
                id={item.id}
                type={(item.type as 'application' | 'job' | 'system' | 'message') || 'system'}
                title={item.title}
                message={item.body}
                timestamp={item.created_at || new Date().toISOString()}
                read={item.is_read}
                onPress={() => selectionMode ? toggleSelectNotification(item.id) : handleNotificationPress(item)}
              />
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isFetchingNextPage}
            onRefresh={refetch}
            tintColor={colors.primary[600]}
          />
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={styles.loadingMore}>
              <Typography variant="caption" style={styles.loadingText}>
                Yükleniyor...
              </Typography>
            </View>
          ) : null
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={styles.emptyState}>
              <Bell size={64} color={colors.neutral[300]} />
              <Typography variant="h3" style={styles.emptyTitle}>
                Bildirim Yok
              </Typography>
              <Typography variant="body" style={styles.emptyText}>
                Henüz hiç bildiriminiz bulunmuyor
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
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing['4xl'],
  },
  emptyState: {
    padding: spacing['3xl'],
    alignItems: 'center',
  },
  emptyTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
    color: colors.text.primary,
  },
  emptyText: {
    color: colors.text.secondary,
    textAlign: 'center',
    fontSize: 14,
  },
  selectionActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary[50],
    borderBottomWidth: 1,
    borderBottomColor: colors.primary[100],
  },
  selectAllButton: {
    paddingVertical: spacing.sm,
  },
  selectAllText: {
    color: colors.primary[600],
    fontWeight: '600',
    fontSize: 14,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkboxContainer: {
    paddingLeft: spacing.lg,
  },
  loadingMore: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  loadingText: {
    color: colors.text.secondary,
  },
});
