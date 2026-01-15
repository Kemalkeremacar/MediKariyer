/**
 * @file ApplicationsScreen.tsx
 * @description Başvurular listesi ekranı - Durum bazlı filtreleme
 * @author MediKariyer Development Team
 * @version 2.0.0
 * 
 * **ÖZELLİKLER:**
 * - FlashList ile performanslı listeleme
 * - Durum bazlı filtreleme (tek seçim)
 * - Pull-to-refresh
 * - Infinite scroll pagination
 * - Empty state
 * 
 * **NOT:** Web ile uyumlu - sadece durum filtresi var, arama yok
 */

import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  RefreshControl,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { colors, spacing } from '@/theme';
import { Typography } from '@/components/ui/Typography';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Screen } from '@/components/layout/Screen';
import { ApplicationCard } from '@/components/composite/ApplicationCard';
import { GradientHeader } from '@/components/composite/GradientHeader';
import { useApplications } from '../hooks/useApplications';
import { useApplicationStatuses } from '@/hooks/useLookup';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import type { ApplicationsStackParamList } from '@/navigation/types';

// Başvuru filtre değerleri
interface ApplicationFilters {
  status_id?: number;
}

// Status display mapping with colors and icons (ApplicationCard ile uyumlu)
const STATUS_CONFIG: Record<number, { 
  name: string; 
  icon: string; 
  color: string; 
  bgColor: string;
}> = {
  1: { 
    name: 'Başvuruldu', 
    icon: 'time', 
    color: colors.warning[700], // ApplicationCard ile aynı
    bgColor: colors.warning[100], // ApplicationCard ile aynı
  },
  2: { 
    name: 'İnceleniyor', 
    icon: 'eye', 
    color: colors.primary[700], // ApplicationCard ile aynı
    bgColor: colors.primary[100], // ApplicationCard ile aynı
  },
  3: { 
    name: 'Kabul Edildi', 
    icon: 'checkmark-circle', 
    color: colors.success[700], // ApplicationCard ile aynı
    bgColor: colors.success[100], // ApplicationCard ile aynı
  },
  4: { 
    name: 'Reddedildi', 
    icon: 'close-circle', 
    color: colors.error[700], // ApplicationCard ile aynı
    bgColor: colors.error[100], // ApplicationCard ile aynı
  },
  5: { 
    name: 'Geri Çekildi', 
    icon: 'arrow-undo', 
    color: colors.neutral[600], // ApplicationCard ile aynı
    bgColor: colors.neutral[200], // ApplicationCard ile aynı
  },
};

const STATUS_DISPLAY: Record<number, string> = {
  1: 'Başvuruldu',
  2: 'İnceleniyor',
  3: 'Kabul Edildi',
  4: 'Reddedildi',
  5: 'Geri Çekildi',
};

const SCREEN_HEIGHT = Dimensions.get('window').height;

export const ApplicationsScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<ApplicationsStackParamList>>();
  
  // Fetch application statuses for display names
  const { data: statuses = [] } = useApplicationStatuses();
  
  // Filter state - sadece durum filtresi
  const [filters, setFilters] = useState<ApplicationFilters>({});
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Animasyon değerleri
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  // Açılış animasyonu
  useEffect(() => {
    if (showFilterModal) {
      // Değerleri sıfırla ve animasyonu başlat
      overlayOpacity.setValue(0);
      sheetTranslateY.setValue(SCREEN_HEIGHT);
      
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showFilterModal, overlayOpacity, sheetTranslateY]);

  const closeModal = useCallback(() => {
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowFilterModal(false);
    });
  }, [overlayOpacity, sheetTranslateY]);

  // Query filters - sadece status_id
  const queryFilters = useMemo(() => ({
    status_id: filters.status_id || undefined,
  }), [filters.status_id]);

  // API çağrısı
  const query = useApplications(queryFilters);

  const totalCount = useMemo(() => {
    return query.data?.pages?.[0]?.pagination?.total ?? 0;
  }, [query.data]);

  // Backend'den gelen tüm başvurular
  const applications = useMemo(() => {
    if (!query.data) return [];
    const pages = query.data.pages ?? [];
    return pages.flatMap((page) => page.data);
  }, [query.data]);

  const loadMore = useCallback(() => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
  }, [query.hasNextPage, query.isFetchingNextPage, query.fetchNextPage]);

  const handleApplyFilters = useCallback((newFilters: ApplicationFilters) => {
    setFilters(newFilters);
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowFilterModal(false);
    });
  }, [overlayOpacity, sheetTranslateY]);

  const handleResetFilters = useCallback(() => {
    setFilters({});
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowFilterModal(false);
    });
  }, [overlayOpacity, sheetTranslateY]);

  // Aktif filtre var mı?
  const hasActiveFilters = useMemo(() => {
    return !!filters.status_id;
  }, [filters.status_id]);

  // Get status display name from lookup or fallback
  const getStatusDisplayName = useCallback((statusId?: number): string => {
    if (!statusId) return 'Tüm Başvurular';
    // Try to find from lookup data first
    const status = statuses.find(s => s.id === statusId);
    if (status) return status.name;
    // Fallback to hardcoded mapping
    return STATUS_DISPLAY[statusId] || `Durum ${statusId}`;
  }, [statuses]);

  const renderContent = () => (
    <View style={styles.container}>
      {/* Header - Sabit (FlashList dışında, unmount olmaz) */}
      <View style={styles.headerSection}>
        <GradientHeader
          title="Başvurularım"
          subtitle="Başvuru durumlarınızı takip edin"
          icon={<Ionicons name="document-text-sharp" size={28} color="#FFFFFF" />}
          variant="primary"
          iconColorPreset="blue"
        />

        {/* Filter Button */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            onPress={() => setShowFilterModal(true)}
            style={[
              styles.filterButton,
              hasActiveFilters && styles.filterButtonActive,
            ]}
            activeOpacity={0.7}
          >
            <Ionicons
              name="filter"
              size={20}
              color={hasActiveFilters ? colors.background.primary : colors.primary[600]}
            />
            <Typography 
              variant="body" 
              style={hasActiveFilters ? styles.filterButtonTextActive : styles.filterButtonText}
            >
              {hasActiveFilters ? getStatusDisplayName(filters.status_id) : 'Tüm Başvurular'}
            </Typography>
            {hasActiveFilters && (
              <View style={styles.filterBadge}>
                <Typography variant="caption" style={styles.filterBadgeText}>
                  1
                </Typography>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Liste - flex:1 container içinde (KRİTİK!) */}
      {query.isLoading ? (
        <View style={styles.skeletonContainer}>
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <FlashList
            data={applications}
            keyExtractor={(item) => `application-${item.id}`}
            renderItem={({ item }) => (
              <ApplicationCard
                application={item}
                onPress={() => navigation.navigate('ApplicationDetail', { applicationId: item.id })}
              />
            )}
            refreshControl={
              <RefreshControl
                refreshing={query.isRefetching}
                onRefresh={() => query.refetch()}
                tintColor={colors.primary[600]}
              />
            }
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            ListFooterComponent={
              query.isFetchingNextPage ? (
                <View style={styles.listFooter}>
                  <ActivityIndicator size="small" color={colors.primary[600]} />
                  <Typography variant="caption" style={styles.footerText}>
                    Daha fazla başvuru yükleniyor...
                  </Typography>
                </View>
              ) : applications.length > 0 && !query.hasNextPage ? (
                <View style={styles.listFooter}>
                  <Typography variant="caption" style={styles.footerText}>
                    Tüm başvurular yüklendi ({applications.length}/{totalCount})
                  </Typography>
                </View>
              ) : null
            }
            ListEmptyComponent={
              !query.isLoading && !query.isError ? (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIcon}>
                    <Ionicons name="document-text" size={64} color={colors.neutral[300]} />
                  </View>
                  <Typography variant="h3" style={styles.emptyTitle}>
                    {hasActiveFilters ? 'Başvuru Bulunamadı' : 'Henüz Başvuru Yok'}
                  </Typography>
                  <Typography variant="body" style={styles.emptyText}>
                    {hasActiveFilters
                      ? 'Filtre kriterlerinizi değiştirerek tekrar deneyin'
                      : 'Yeni ilanlara başvurarak kariyer yolculuğuna başla'}
                  </Typography>
                  {hasActiveFilters && (
                    <TouchableOpacity 
                      style={styles.emptyButton} 
                      onPress={handleResetFilters}
                    >
                      <Typography variant="body" style={styles.emptyButtonText}>
                        Filtreleri Temizle
                      </Typography>
                    </TouchableOpacity>
                  )}
                </View>
              ) : null
            }
            contentContainerStyle={styles.listContent}
          />
        </View>
      )}

      {/* Simple Status Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="none"
        transparent
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <Animated.View style={[styles.modalBackdrop, { opacity: overlayOpacity }]}>
            <Pressable style={StyleSheet.absoluteFill} onPress={closeModal} />
          </Animated.View>
          <Animated.View style={[styles.modalContent, { transform: [{ translateY: sheetTranslateY }] }]}>
            <View style={styles.modalHeader}>
              <Typography variant="h3" style={styles.modalTitle}>
                Durum Filtresi
              </Typography>
              <TouchableOpacity onPress={closeModal}>
                <Ionicons name="close" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {/* Tümü */}
              <TouchableOpacity
                style={[
                  styles.statusOption,
                  !filters.status_id && styles.statusOptionActive,
                ]}
                onPress={() => handleApplyFilters({})}
              >
                <View style={[styles.statusIconContainer, { backgroundColor: colors.primary[50] }]}>
                  <Ionicons name="apps" size={20} color={colors.primary[600]} />
                </View>
                <Typography 
                  variant="body" 
                  style={!filters.status_id ? styles.statusTextActive : styles.statusText}
                >
                  Tüm Başvurular
                </Typography>
                {!filters.status_id && (
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary[600]} />
                )}
              </TouchableOpacity>

              {/* Durumlar */}
              {statuses.map((status) => {
                const config = STATUS_CONFIG[status.id];
                if (!config) return null;
                
                return (
                  <TouchableOpacity
                    key={status.id}
                    style={[
                      styles.statusOption,
                      filters.status_id === status.id && styles.statusOptionActive,
                    ]}
                    onPress={() => handleApplyFilters({ status_id: status.id })}
                  >
                    <View style={[styles.statusIconContainer, { backgroundColor: config.bgColor }]}>
                      <Ionicons name={config.icon as any} size={20} color={config.color} />
                    </View>
                    <Typography 
                      variant="body" 
                      style={filters.status_id === status.id ? styles.statusTextActive : styles.statusText}
                    >
                      {config.name}
                    </Typography>
                    {filters.status_id === status.id && (
                      <Ionicons name="checkmark-circle" size={24} color={colors.primary[600]} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );

  return (
    <Screen
      scrollable={false}
      loading={query.isLoading}
      error={query.isError ? new Error('Başvurular yüklenemedi') : null}
      onRetry={() => query.refetch()}
    >
      {renderContent()}
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerSection: {
    backgroundColor: colors.background.primary,
  },
  filterContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.background.primary,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[100],
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  filterButtonText: {
    color: colors.primary[600],
    fontWeight: '600',
    fontSize: 14,
    flex: 1,
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
  skeletonContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  listContent: {
    paddingBottom: spacing['4xl'],
  },
  listFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  footerText: {
    color: colors.text.secondary,
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
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  modalBody: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  statusOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    backgroundColor: colors.background.secondary,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: spacing.md,
  },
  statusIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusOptionActive: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[600],
  },
  statusText: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '500',
    flex: 1,
  },
  statusTextActive: {
    fontSize: 16,
    color: colors.primary[700],
    fontWeight: '600',
  },
});
