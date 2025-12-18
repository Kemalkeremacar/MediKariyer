/**
 * JOBS SCREEN - Modern İş İlanları Ekranı
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { jobService } from '@/api/services/job.service';
import { useDebounce } from '@/hooks/useDebounce';
import { colors, spacing } from '@/theme';
import { Typography } from '@/components/ui/Typography';
import { SearchBar } from '@/components/ui/SearchBar';
import { IconButton } from '@/components/ui/IconButton';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Chip } from '@/components/ui/Chip';
import { JobCard } from '@/components/composite/JobCard';
import { JobFilterSheet, JobFilters } from '@/components/composite/JobFilterSheet';
import { GradientHeader } from '@/components/composite/GradientHeader';
import { Screen } from '@/components/layout/Screen';
import { Ionicons } from '@expo/vector-icons';
import type { JobListItem } from '@/types/job';

export const JobsScreen = () => {
  const navigation = useNavigation();
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<JobFilters>({});
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  // Debounce search query - Her tuş vuruşunda API çağrısı yapmamak için
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

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
  } = useInfiniteQuery({
    queryKey: ['jobs', debouncedSearchQuery, filters],
    queryFn: ({ pageParam = 1 }) =>
      jobService.listJobs({
        page: pageParam,
        limit: 10,
        ...(debouncedSearchQuery ? { keyword: debouncedSearchQuery } : {}),
        ...(filters.specialtyId ? { specialty_id: filters.specialtyId } : {}),
        ...(filters.cityId ? { city_id: filters.cityId } : {}),
        ...(filters.employmentType ? { employment_type: filters.employmentType } : {}),
      }),
    getNextPageParam: (lastPage) =>
      lastPage.pagination?.has_next
        ? lastPage.pagination.current_page + 1
        : undefined,
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5, // 5 dakika cache
  });

  // Get total count from pagination
  const totalCount = useMemo(() => {
    return data?.pages?.[0]?.pagination?.total ?? 0;
  }, [data]);

  const jobs = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.data);
  }, [data]);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderJob = useCallback(
    ({ item }: { item: JobListItem }) => (
      <JobCard
        job={item}
        onPress={() => {
          // @ts-ignore - Navigation type issue
          navigation.navigate('JobDetail', { id: item.id });
        }}
      />
    ),
    [navigation]
  );

  // Filter handlers
  const handleApplyFilters = useCallback((newFilters: JobFilters) => {
    setFilters(newFilters);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({});
    setSearchQuery('');
  }, []);

  const handleRemoveFilter = useCallback((key: keyof JobFilters) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    return [filters.specialtyId, filters.cityId, filters.employmentType].filter(Boolean).length;
  }, [filters]);

  const hasActiveFilters = activeFilterCount > 0 || debouncedSearchQuery.length > 0;
  
  // Arama yapılıyor mu kontrolü
  const isSearching = searchQuery !== debouncedSearchQuery;

  const renderListHeader = () => (
    <>
      {/* Premium Gradient Header */}
      <GradientHeader
        title="İş İlanları"
        subtitle={`${totalCount} aktif ilan`}
        icon={<Ionicons name="briefcase-sharp" size={28} color="#FFFFFF" />}
        variant="primary"
        iconColorPreset="blue"
      />

      {/* Modern Search & Filter */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Hastane, şehir veya branş ara..."
          onClear={() => setSearchQuery('')}
          style={styles.searchBar}
        />
        <View style={styles.filterButtonWrapper}>
          {isSearching && (
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
                  activeFilterCount > 0
                    ? colors.background.primary
                    : colors.primary[600]
                }
              />
            }
            onPress={() => setShowFilterSheet(true)}
            size="md"
            variant={activeFilterCount > 0 ? 'filled' : 'ghost'}
            color="primary"
          />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Typography variant="caption" style={styles.filterBadgeText}>
                {activeFilterCount}
              </Typography>
            </View>
          )}
        </View>
      </View>

      {/* Active Filters with Modern Chips */}
      {hasActiveFilters && (
        <View style={styles.activeFiltersContainer}>
          {filters.specialtyId && (
            <Chip
              label="Branş Filtresi"
              variant="soft"
              color="primary"
              size="sm"
              onDelete={() => handleRemoveFilter('specialtyId')}
            />
          )}
          {filters.cityId && (
            <Chip
              label="Şehir"
              icon={<Ionicons name="location" size={12} color={colors.primary[700]} />}
              variant="soft"
              color="primary"
              size="sm"
              onDelete={() => handleRemoveFilter('cityId')}
            />
          )}
          {filters.employmentType && (
            <Chip
              label={filters.employmentType}
              variant="soft"
              color="primary"
              size="sm"
              onDelete={() => handleRemoveFilter('employmentType')}
            />
          )}
        </View>
      )}
    </>
  );

  const renderContent = () => {
    if (!data) return null;

    return (
      <FlatList
          data={jobs}
          renderItem={renderJob}
          keyExtractor={(item) => item.id.toString()}
          ListHeaderComponent={renderListHeader}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshing={isRefetching}
          onRefresh={refetch}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="briefcase-outline" size={64} color={colors.neutral[300]} />
              </View>
              <Typography variant="h3" style={styles.emptyTitle}>
                İlan Bulunamadı
              </Typography>
              <Typography variant="body" style={styles.emptyText}>
                {hasActiveFilters
                  ? 'Arama kriterlerinizi değiştirerek tekrar deneyin'
                  : 'Henüz ilan bulunmuyor'}
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
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View style={styles.footer}>
                <ActivityIndicator size="small" color={colors.primary[600]} />
                <Typography variant="caption" style={styles.footerText}>
                  Daha fazla ilan yükleniyor...
                </Typography>
              </View>
            ) : jobs.length > 0 && !hasNextPage ? (
              <View style={styles.footer}>
                <Typography variant="caption" style={styles.footerText}>
                  Tüm ilanlar yüklendi ({jobs.length}/{totalCount})
                </Typography>
              </View>
            ) : null
          }
      />
    );
  };

  return (
    <Screen
      scrollable={false}
      loading={false}
      error={isError ? new Error('İlanlar yüklenemedi') : null}
      onRetry={refetch}
    >
      {isLoading ? (
        <View style={styles.skeletonContainer}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.headerIcon}>
                <Ionicons name="briefcase" size={28} color={colors.primary[600]} />
              </View>
              <View style={styles.headerText}>
                <Typography variant="h2" style={styles.headerTitle}>
                  İş İlanları
                </Typography>
                <Typography variant="caption" style={styles.headerSubtitle}>
                  Yükleniyor...
                </Typography>
              </View>
            </View>
          </View>
          <View style={styles.skeletonList}>
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </View>
        </View>
      ) : (
        renderContent()
      )}

      <JobFilterSheet
        visible={showFilterSheet}
        onClose={() => setShowFilterSheet(false)}
        filters={filters}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
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
  skeletonContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  skeletonList: {
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
