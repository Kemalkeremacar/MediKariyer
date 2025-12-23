/**
 * APPLICATIONS SCREEN - Modern Başvurularım Ekranı
 * TD-002: DetailsModal ayrı dosyaya taşındı (ApplicationDetailModal.tsx)
 */

import React, { useCallback, useMemo, useState } from 'react';
import { useSearch } from '@/hooks/useSearch';
import {
  StyleSheet,
  RefreshControl,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { colors, spacing } from '@/theme';
import { Typography } from '@/components/ui/Typography';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Screen } from '@/components/layout/Screen';
import { SearchBar } from '@/components/ui/SearchBar';
import {
  ApplicationFilterSheet,
  ApplicationFilters,
} from '@/components/composite/ApplicationFilterSheet';
import { ApplicationCard } from '@/components/composite/ApplicationCard';
import { GradientHeader } from '@/components/composite/GradientHeader';
import { ApplicationDetailModal } from '../components/ApplicationDetailModal';
import { useApplications } from '../hooks/useApplications';
import { Ionicons } from '@expo/vector-icons';

// Status display mapping
const STATUS_DISPLAY: Record<string, string> = {
  pending: 'Başvuruldu',
  reviewing: 'İnceleniyor',
  approved: 'Kabul Edildi',
  rejected: 'Red Edildi',
  withdrawn: 'Geri Çekildi',
};

export const ApplicationsScreen = () => {
  const [filters, setFilters] = useState<ApplicationFilters>({});
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Search handlers - useCallback ile optimize et, imleç kaybolmasını önle
  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  const handleSearchClear = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Global search hook - Modern, kullanıcı dostu arama
  const { debouncedQuery, clientQuery, shouldFetch, isSearching: isSearchingDebounce } = useSearch(searchQuery, { minLength: 2 });

  // Query filters - useMemo ile normalize et, gereksiz re-render'ları önle
  const queryFilters = useMemo(() => ({
    status: filters.status || undefined,
    keyword: shouldFetch ? debouncedQuery : undefined,
  }), [filters.status, shouldFetch, debouncedQuery]);

  // Sadece debounced query değiştiğinde API çağrısı yap
  const query = useApplications(queryFilters);

  const totalCount = useMemo(() => {
    return query.data?.pages?.[0]?.pagination?.total ?? 0;
  }, [query.data]);

  // Backend'den gelen tüm başvurular
  const allApplications = useMemo(() => {
    if (!query.data) return [];
    const pages = query.data.pages ?? [];
    return pages.flatMap((page) => page.data);
  }, [query.data]);

  // Client-side filtreleme - Yazarken sonuçlar kaybolmaz, sadece filtrelenir
  const applications = useMemo(() => {
    // Backend'den veri yoksa boş döndür
    if (allApplications.length === 0) return [];
    
    // Client-side arama sorgusu yoksa tüm sonuçları göster
    if (!clientQuery) return allApplications;
    
    // Client-side filtreleme yap (yazarken anında filtrele)
    const lowerQuery = clientQuery.toLowerCase();
    return allApplications.filter((app) => {
      const jobTitle = app.job_title?.toLowerCase() || '';
      const hospital = app.hospital_name?.toLowerCase() || '';
      
      return jobTitle.includes(lowerQuery) || hospital.includes(lowerQuery);
    });
  }, [allApplications, clientQuery]);

  // Arama yapılıyor mu kontrolü (backend isteği için)
  const isSearching = isSearchingDebounce;

  const loadMore = useCallback(() => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
  }, [query]);

  const handleApplyFilters = useCallback((newFilters: ApplicationFilters) => {
    setFilters(newFilters);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({});
  }, []);

  const hasActiveFilter = Boolean(filters.status);

  const getStatusDisplayName = (status?: string): string => {
    if (!status) return 'Tüm Başvurular';
    return STATUS_DISPLAY[status] || status;
  };

  const renderListHeader = () => (
    <>
      {/* Premium Gradient Header */}
      <GradientHeader
        title="Başvurularım"
        subtitle={`${totalCount} başvuru`}
        icon={<Ionicons name="document-text-sharp" size={28} color="#FFFFFF" />}
        variant="primary"
        iconColorPreset="blue"
      />

      {/* Modern Search & Filter */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={handleSearchChange}
          placeholder="Hastane veya pozisyon ara..."
          onClear={handleSearchClear}
          style={styles.searchBar}
          isSearching={isSearching}
        />
        <View style={styles.filterButtonWrapper}>
          {isSearching && (
            <View style={styles.searchingIndicator}>
              <ActivityIndicator size="small" color={colors.primary[600]} />
            </View>
          )}
          <TouchableOpacity
            onPress={() => setShowFilterSheet(true)}
            style={[
              styles.filterButton,
              hasActiveFilter && styles.filterButtonActive,
            ]}
            activeOpacity={0.7}
          >
            <Ionicons
              name="filter"
              size={20}
              color={hasActiveFilter ? colors.background.primary : colors.primary[600]}
            />
          </TouchableOpacity>
          {hasActiveFilter && (
            <View style={styles.filterBadge}>
              <Typography variant="caption" style={styles.filterBadgeText}>
                1
              </Typography>
            </View>
          )}
        </View>
      </View>

      {/* Active Filter Chip */}
      {hasActiveFilter && (
        <View style={styles.activeFiltersContainer}>
          <View style={styles.activeFilterChip}>
            <Typography variant="body" style={styles.activeFilterText}>
              {getStatusDisplayName(filters.status)}
            </Typography>
            <TouchableOpacity onPress={() => setFilters({})}>
              <Ionicons name="close-circle" size={18} color={colors.primary[600]} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );

  const renderContent = () => (
    <View style={styles.container}>
      {query.isLoading ? (
        <View style={styles.skeletonContainer}>
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </View>
      ) : (
        <FlashList
          ListHeaderComponent={renderListHeader}
          data={applications}
          keyExtractor={(item, index) => `app-${item.id}-${index}`}
          renderItem={({ item, index }) => (
            <ApplicationCard
              application={item}
              index={index}
              onPress={() => setSelectedApplicationId(item.id)}
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
                  {(hasActiveFilter || clientQuery) ? 'Başvuru Bulunamadı' : 'Henüz Başvuru Yok'}
                </Typography>
                <Typography variant="body" style={styles.emptyText}>
                  {(hasActiveFilter || clientQuery)
                    ? 'Arama kriterlerinizi değiştirerek tekrar deneyin'
                    : 'Yeni ilanlara başvurarak kariyer yolculuğuna başla'}
                </Typography>
                {(hasActiveFilter || clientQuery) && (
                  <TouchableOpacity 
                    style={styles.emptyButton} 
                    onPress={() => {
                      handleResetFilters();
                      setSearchQuery('');
                    }}
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
      )}

      <ApplicationDetailModal
        applicationId={selectedApplicationId}
        visible={selectedApplicationId !== null}
        onClose={() => setSelectedApplicationId(null)}
      />

      <ApplicationFilterSheet
        visible={showFilterSheet}
        onClose={() => setShowFilterSheet(false)}
        filters={filters}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />
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
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.background.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.background.primary,
  },
  searchBar: {
    flex: 1,
  },
  filterButtonWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchingIndicator: {
    marginRight: spacing.xs,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  filterButtonActive: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  activeFiltersContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primary[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary[100],
    alignSelf: 'flex-start',
  },
  activeFilterText: {
    color: colors.primary[700],
    fontWeight: '600',
    fontSize: 14,
  },
  filterBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.error[600],
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: colors.background.primary,
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
});
