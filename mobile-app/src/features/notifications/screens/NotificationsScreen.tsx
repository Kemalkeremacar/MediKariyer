/**
 * @file NotificationsScreen.tsx
 * @description Bildirimler ekranı - Bildirimleri listeleme, okuma ve silme
 * @author MediKariyer Development Team
 * @version 1.0.0
 * 
 * **ÖNEMLİ ÖZELLİKLER:**
 * - Bildirimleri listeleme (tümü/okunmamış)
 * - Bildirim okuma ve okundu işaretleme
 * - Toplu işlemler (seçme, okundu işaretleme, silme)
 * - Bildirim tipine göre yönlendirme
 * - Otomatik yenileme (focus'ta)
 * 
 * **AKIŞ:**
 * 1. Bildirimler backend'den çekilir (sayfalı)
 * 2. Kullanıcı tab ile tümü/okunmamış arasında geçiş yapar
 * 3. Bildirime tıklayınca ilgili sayfaya yönlendirilir
 * 4. Toplu işlem modu ile birden fazla bildirim seçilebilir
 * 5. Seçili bildirimler okundu işaretlenebilir veya silinebilir
 * 
 * **BİLDİRİM TİPLERİ VE YÖNLENDİRME:**
 * - application: Başvurular sayfasına
 * - job: İlan detay sayfasına (job_id varsa)
 * - profile: Profil düzenleme sayfasına
 * - photo: Fotoğraf yönetim sayfasına
 * - system/info/message: Yönlendirme yok
 * 
 * **KRİTİK NOKTALAR:**
 * - Backend'den filtreli veri çekilir (showUnreadOnly)
 * - Polling yerine focus'ta refetch (mobil best practice)
 * - Push notifications ile anında bildirim
 * - Toplu işlem modu ile kullanıcı deneyimi
 * - İyimser güncelleme (optimistic update)
 * 
 * **MOBİL OPTİMİZASYON:**
 * - Polling yerine focus'ta refetch (pil dostu)
 * - Push notifications ile anında bildirim
 * - Aşamalı yükleme (pagination)
 * - Pull-to-refresh ile manuel yenileme
 */

import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useAlertHelpers } from '@/utils/alertHelpers';
import { devLog } from '@/utils/devLogger';
import { Screen } from '@/components/layout/Screen';
import { Typography } from '@/components/ui/Typography';
import { IconButton } from '@/components/ui/IconButton';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { Checkbox } from '@/components/ui/Checkbox';
import { NotificationCard } from '@/components/composite/NotificationCard';
import { colors, spacing } from '@/theme';
import { 
  useNotifications, 
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotifications 
} from '@/features/notifications/hooks/useNotifications';
import type { NotificationItem } from '@/types/notification';
import type { ProfileStackParamList, AppTabParamList } from '@/navigation/types';

type NotificationsScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<ProfileStackParamList, 'Notifications'>,
  BottomTabNavigationProp<AppTabParamList>
>;

export const NotificationsScreen = () => {
  const navigation = useNavigation<NotificationsScreenNavigationProp>();
  const alert = useAlertHelpers();
  const [activeTab, setActiveTab] = useState('all');
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // activeTab değiştiğinde backend'den filtreli data çek
  const { 
    notifications: notificationList, 
    isLoading, 
    isError, 
    refetch, 
    isFetching,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  } = useNotifications({ 
    limit: 20,
    showUnreadOnly: activeTab === 'unread' // Backend'den sadece okunmamışları çek
  });

  const { mutateAsync: markAsRead } = useMarkAsRead();
  const { mutateAsync: markAllAsRead } = useMarkAllAsRead();
  const deleteNotificationsMutation = useDeleteNotifications();

  // Screen focus olduğunda bildirimleri yenile
  // MOBILE BEST PRACTICE: Polling yerine sadece focus'ta refetch + push notifications kullan
  // Push notifications zaten yeni bildirimleri anında gönderiyor, polling gereksiz
  const refetchRef = React.useRef(refetch);
  
  // refetch değiştiğinde ref'i güncelle
  React.useEffect(() => {
    refetchRef.current = refetch;
  }, [refetch]);
  
  useFocusEffect(
    useCallback(() => {
      // Screen focus olduğunda sadece stale data varsa refetch yap
      // refetchOnMount: true zaten stale ise otomatik refetch yapıyor
      // Burada sadece manuel refresh için çağırıyoruz
      if (!isFetching && !isLoading) {
        refetchRef.current();
      }
      
      // Cleanup: Focus kaybolduğunda bir şey yapma
      return () => {
        // No cleanup needed - React Query handles caching
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // Boş dependency array - sadece focus değişikliklerinde çalışsın
  );

  // Backend'den zaten filtreli geliyor (showUnreadOnly parametresi ile)
  // Bu yüzden client-side filtering'e gerek yok, direkt kullan
  const filteredNotifications = notificationList;

  // Unread count için backend'den tam sayıyı al (ayrı query ile)
  // Bu sayede her tab'da doğru unread count gösterilir
  const { unreadCount: backendUnreadCount } = useUnreadCount();
  const unreadCount = backendUnreadCount;

  /**
   * Bildirime tıklandığında ilgili sayfaya yönlendirir
   */
  const handleNotificationPress = useCallback(async (notification: NotificationItem) => {
    // Mark as read (isRead veya is_read kontrolü)
    const isRead = notification.isRead ?? notification.is_read ?? false;
    if (!isRead) {
      try {
        await markAsRead(notification.id);
      } catch (error) {
        devLog.error('Failed to mark notification as read:', error);
      }
    }
    
    // Navigate based on notification type and data
    const notificationType = notification.type?.toLowerCase();
    const notificationData = notification.data || {};
    
    try {
      switch (notificationType) {
        case 'application':
        case 'application_status':
        case 'application_update':
          // Başvuru bildirimi - Başvurular ekranına git
          navigation.navigate('Applications');
          break;
          
        case 'job':
        case 'new_job':
        case 'job_alert':
          // İş ilanı bildirimi - İlan detayına git (job_id varsa)
          if (notificationData.job_id && typeof notificationData.job_id === 'number') {
            navigation.navigate('JobsTab', {
              screen: 'JobDetail',
              params: { id: notificationData.job_id },
            });
          } else {
            // job_id yoksa ilanlar listesine git
            navigation.navigate('JobsTab', { screen: 'JobsList' });
          }
          break;
          
        case 'profile':
        case 'profile_update':
          // Profil bildirimi - Profil düzenleme ekranına git
          navigation.navigate('ProfileEdit');
          break;
          
        case 'photo':
        case 'photo_status':
          // Fotoğraf onay bildirimi - Fotoğraf yönetim ekranına git
          navigation.navigate('PhotoManagement');
          break;
          
        case 'system':
        case 'info':
        case 'message':
        default:
          // Sistem bildirimi veya bilinmeyen tip - Sadece okundu işaretlendi, navigasyon yok
          break;
      }
    } catch (error) {
      devLog.error('Navigation error:', error);
    }
  }, [navigation, markAsRead]);

  /**
   * Tüm bildirimleri okundu olarak işaretler
   */
  const handleMarkAllRead = useCallback(async () => {
    // isRead veya is_read field'ını kullan (camelCase öncelikli)
    const unreadNotifications = notificationList.filter((n) => {
      return !(n.isRead ?? n.is_read ?? false);
    });
    if (unreadNotifications.length === 0) return;
    
    try {
      // Backend'deki mark-all-read endpoint'ini kullan (daha efficient)
      await markAllAsRead();
    } catch (error) {
      devLog.error('Failed to mark all as read:', error);
    }
  }, [notificationList, markAllAsRead]);

  const toggleSelectionMode = useCallback(() => {
    setSelectionMode((prev) => !prev);
    setSelectedIds(new Set());
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (prev.size === filteredNotifications.length) {
        return new Set();
      } else {
        return new Set(filteredNotifications.map((n) => n.id));
      }
    });
  }, [filteredNotifications]);

  const toggleSelectNotification = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const newSelected = new Set(prev);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      return newSelected;
    });
  }, []);

  const handleMarkSelectedAsRead = useCallback(async () => {
    const selectedNotifications = Array.from(selectedIds);
    if (selectedNotifications.length === 0) return;
    
    try {
      await Promise.all(
        selectedNotifications.map((id) => markAsRead(id))
      );
      setSelectedIds(new Set());
      setSelectionMode(false);
    } catch (error) {
      devLog.error('Failed to mark selected as read:', error);
    }
  }, [selectedIds, markAsRead]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  /**
   * Seçili bildirimleri siler
   */
  const handleDeleteSelected = useCallback(() => {
    if (selectedIds.size === 0) return;
    
    const selectedCount = selectedIds.size;
    
    alert.confirmDestructive(
      'Bildirimleri Sil',
      `${selectedCount} bildirim silinecek. Bu işlem geri alınamaz.`,
      async () => {
        try {
          const idsArray = Array.from(selectedIds);
          await deleteNotificationsMutation.mutateAsync(idsArray);
          setSelectedIds(new Set());
          setSelectionMode(false);
        } catch (error) {
          devLog.error('Failed to delete notifications:', error);
        }
      },
      undefined,
      'Sil'
    );
  }, [selectedIds, deleteNotificationsMutation]);

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
            <Ionicons name="notifications" size={28} color={colors.primary[600]} />
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
        <View style={styles.headerActions}>
          {!selectionMode && unreadCount > 0 && (
            <IconButton
              icon={<Ionicons name="checkmark-done" size={20} color={colors.primary[600]} />}
              onPress={handleMarkAllRead}
              size="md"
              variant="ghost"
            />
          )}
          <IconButton
            icon={selectionMode ? <Ionicons name="checkbox" size={20} color={colors.primary[600]} /> : <Ionicons name="square-outline" size={20} color={colors.primary[600]} />}
            onPress={toggleSelectionMode}
            size="md"
            variant="ghost"
          />
        </View>
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
              icon={<Ionicons name="trash" size={18} color={selectedIds.size > 0 && !deleteNotificationsMutation.isPending ? colors.error[600] : colors.neutral[400]} />}
              onPress={handleDeleteSelected}
              size="sm"
              variant="ghost"
              disabled={selectedIds.size === 0 || deleteNotificationsMutation.isPending}
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
                timestamp={item.createdAt || item.created_at || new Date().toISOString()}
                read={item.isRead ?? item.is_read ?? false}
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
              <Ionicons name="notifications" size={64} color={colors.neutral[300]} />
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
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
