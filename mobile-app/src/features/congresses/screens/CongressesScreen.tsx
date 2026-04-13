/**
 * @file CongressesScreen.tsx
 * @description Kongre listesi ekranı - Kongreleri listeleme, arama ve filtreleme
 * @author MediKariyer Development Team
 * @version 1.0.0
 * 
 * **ÖNEMLİ ÖZELLİKLER:**
 * - Kongreleri listeleme (FlashList ile performanslı)
 * - Arama ve filtreleme (uzmanlık, şehir, ülke)
 * - Sonsuz scroll (pagination)
 * - Pull-to-refresh
 * - Client-side ve server-side filtreleme
 */

import React, { useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import type { CongressesStackNavigationProp } from '@/navigation/types';
import { useFilter } from '@/hooks/useFilter';
import { useCongresses } from '../hooks/useCongresses';
import { colors, spacing } from '@/theme';
import { PAGINATION } from '@/config/constants';
import { Typography } from '@/components/ui/Typography';
import { SearchBar } from '@/components/ui/SearchBar';
import { IconButton } from '@/components/ui/IconButton';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Chip } from '@/components/ui/Chip';
import { CongressCard } from '@/components/composite/CongressCard';
import { CongressFilterSheet, CongressFilters } from '@/components/composite/CongressFilterSheet';
import { GradientHeader } from '@/components/composite/GradientHeader';
import { Screen } from '@/components/layout/Screen';
import { Ionicons } from '@expo/vector-icons';
import type { CongressListItem } from '@/types/congress';

export const CongressesScreen = () => {
  const navigation = useNavigation<CongressesStackNavigationProp>();
  
  // Filter hook
  const filter = useFilter<CongressFilters>({}, { minLength: 2 });

  // Query params
  const queryParams = useMemo(() => ({
    keyword: filter.shouldFetch ? filter.debouncedQuery : undefined,
    specialty_id: filter.filters.specialtyIds && filter.filters.specialtyIds.length > 0 
      ? filter.filters.specialtyIds.join(',') 
      : undefined,
    city: filter.filters.city,
    country: filter.filters.country,
    limit: PAGINATION.JOBS_PAGE_SIZE,
  }), [filter.shouldFetch, filter.debouncedQuery, filter.filters.specialtyIds, filter.filters.city, filter.filters.country]);

  // Query with filters
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useCongresses(queryParams);

  // Get total count
  const totalCount = useMemo(() => {
    return data?.pages?.[0]?.pagination?.total ?? 0;
  }, [data]);

  // Backend'den gelen tüm kongreler
  const allCongresses = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.data);
  }, [data]);

  // Client-side filtreleme
  const congresses = useMemo(() => {
    if (allCongresses.length === 0) return [];
    if (!filter.clientQuery) return allCongresses;
    
    const lowerQuery = filter.clientQuery.toLowerCase();
    return allCongresses.filter((congress) => {
      const title = congress.title?.toLowerCase() || '';
      const organizer = congress.organizer?.toLowerCase() || '';
      const city = congress.city?.toLowerCase() || '';
      const country = congress.country?.toLowerCase() || '';
      
      return (
        title.includes(lowerQuery) ||
        organizer.includes(lowerQuery) ||
        city.includes(lowerQuery) ||
        country.includes(lowerQuery)
      );
    });
  }, [allCongresses, filter.clientQuery]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderCongress = useCallback(
    ({ item }: { item: CongressListItem }) => (
      <CongressCard
        congress={item}
        onPress={() => {
          navigation.navigate('CongressDetail', { id: item.id });
        }}
      />
    ),
    [navigation]
  );

  const handleApplyFilters = useCallback((newFilters: CongressFilters) => {
    filter.handleFilterChange(newFilters);
  }, [filter]);

  const keyExtractor = useCallback((item: CongressListItem) => `congress-${item.id}`, []);

  return (
    <Screen
      scrollable={false}
      loading={false}
      error={isError ? new Error('Kongreler yüklenemedi') : null}
      onRetry={refetch}
    >
      {/* Header + SearchBar */}
      <View style={styles.headerSection}>
        <GradientHeader
          title="Kongre Takvimi"
          subtitle="Yaklaşan tıbbi kongre ve etkinlikleri keşfedin"
          icon={<Ionicons name="calendar-sharp" size={28} color="#FFFFFF" />}
          variant="primary"
          iconColorPreset="blue"
        />

        <View style={styles.searchContainer}>
          <SearchBar
            value={filter.searchQuery}
            onChangeText={filter.handleSearchChange}
            placeholder="Kongre başlığı veya organizatör ara..."
            onClear={filter.handleSearchClear}
            style={styles.searchBar}
            isSearching={filter.isSearching}
          />
          <View style={styles.filterButtonWrapper}>
            {filter.isSearching && (
              <View style={styles.searchingIndicator}>
                <ActivityIndicator size="small" color={colors.primary[600]} />
              </View>
            )}
            <IconButton
              icon={
                <Ionicons
                  name="filter"
                  size={20}
                  color={
                    filter.activeFilterCount > 0
                      ? colors.background.primary
                      : colors.primary[600]
                  }
                />
              }
              onPress={() => filter.setShowFilterSheet(true)}
              size="md"
              variant={filter.activeFilterCount > 0 ? 'filled' : 'ghost'}
              color="primary"
            />
            {filter.activeFilterCount > 0 && (
              <View style={styles.filterBadge}>
                <Typography variant="caption" style={styles.filterBadgeText}>
                  {filter.activeFilterCount}
                </Typography>
              </View>
            )}
          </View>
        </View>

        {filter.hasActiveFilters && (
          <View style={styles.activeFiltersContainer}>
            {filter.filters.specialtyIds && filter.filters.specialtyIds.length > 0 && (
              <Chip
                label={`Branş (${filter.filters.specialtyIds.length})`}
                variant="soft"
                color="primary"
                size="sm"
                onDelete={() => filter.handleRemoveFilter('specialtyIds')}
              />
            )}
            {filter.filters.city && (
              <Chip
                label={`Şehir: ${filter.filters.city}`}
                icon={<Ionicons name="location" size={12} color={colors.primary[700]} />}
                variant="soft"
                color="primary"
                size="sm"
                onDelete={() => filter.handleRemoveFilter('city')}
              />
            )}
            {filter.filters.country && (
              <Chip
                label={`Ülke: ${filter.filters.country}`}
                variant="soft"
                color="primary"
                size="sm"
                onDelete={() => filter.handleRemoveFilter('country')}
              />
            )}
          </View>
        )}
      </View>

      {/* Congress List */}
      {isLoading ? (
        <View style={styles.skeletonList}>
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </View>
      ) : (
        <FlashList
          data={congresses}
          renderItem={renderCongress}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.primary[600]}
            />
          }
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="calendar-outline" size={64} color={colors.neutral[300]} />
              </View>
              <Typography variant="h3" style={styles.emptyTitle}>
                Kongre Bulunamadı
              </Typography>
              <Typography variant="body" style={styles.emptyText}>
                {filter.hasActiveFilters
                  ? 'Arama kriterlerinizi değiştirerek tekrar deneyin'
                  : 'Henüz kongre bulunmuyor'}
              </Typography>
              {filter.hasActiveFilters && (
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={filter.resetFilters}
                >
                  <Typography variant="body" style={styles.emptyButtonText}>
                    Filtreleri Temizle
                  </Typography>
                </TouchableOpacity>
              )}
            </View>
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={styles.footer}>
                <ActivityIndicator size="small" color={colors.primary[600]} />
                <Typography variant="caption" style={styles.footerText}>
                  Daha fazla kongre yükleniyor...
                </Typography>
              </View>
            ) : congresses.length > 0 && !hasNextPage ? (
              <View style={styles.footer}>
                <Typography variant="caption" style={styles.footerText}>
                  Tüm kongreler yüklendi ({congresses.length}/{totalCount})
                </Typography>
              </View>
            ) : null
          }
        />
      )}

      <CongressFilterSheet
        visible={filter.showFilterSheet}
        onClose={() => filter.setShowFilterSheet(false)}
        filters={filter.filters}
        onApply={handleApplyFilters}
        onReset={filter.resetFilters}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  headerSection: {
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
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.error[600],
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    color: colors.background.primary,
    fontSize: 10,
    fontWeight: '700',
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.background.primary,
  },
  skeletonList: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  listContent: {
    paddingTop: 0,
    paddingBottom: spacing['4xl'],
  },
  footer: {
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
