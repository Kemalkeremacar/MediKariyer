/**
 * JOBS SCREEN - Modern İş İlanları Ekranı
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { jobService } from '@/api/services/job.service';
import { colors, spacing, borderRadius } from '@/theme';
import { Typography } from '@/components/ui/Typography';
import { SearchBar } from '@/components/ui/SearchBar';
import { IconButton } from '@/components/ui/IconButton';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Chip } from '@/components/ui/Chip';
import { JobCard } from '@/components/composite/JobCard';
import { Screen } from '@/components/layout/Screen';
import { Filter, Briefcase, MapPin, X } from 'lucide-react-native';
import type { JobListItem } from '@/types/job';
import { JobFilterSheet } from '@/components/composite/JobFilterSheet';

import { useToast } from '@/providers/ToastProvider';

export const JobsScreen = () => {
  const navigation = useNavigation();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<number | undefined>();
  const [selectedCityId, setSelectedCityId] = useState<number | undefined>();
  const [selectedWorkType, setSelectedWorkType] = useState<string | undefined>();
  const [showFilterSheet, setShowFilterSheet] = React.useState(false);

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
    queryKey: ['jobs', searchQuery, selectedSpecialtyId, selectedCityId, selectedWorkType],
    queryFn: ({ pageParam = 1 }) =>
      jobService.listJobs({
        page: pageParam,
        limit: 10,
        ...(searchQuery ? { search: searchQuery } : {}),
        ...(selectedSpecialtyId ? { specialty_id: selectedSpecialtyId } : {}),
        ...(selectedCityId ? { city_id: selectedCityId } : {}),
        ...(selectedWorkType ? { work_type: selectedWorkType } : {}),
      }),
    getNextPageParam: (lastPage) => lastPage.pagination?.current_page && lastPage.pagination?.total_pages && lastPage.pagination.current_page < lastPage.pagination.total_pages ? lastPage.pagination.current_page + 1 : undefined,
    initialPageParam: 1,
  });

  // Remove duplicate jobs by ID (backend sometimes returns duplicates)
  const jobs = useMemo(() => {
    if (!data?.pages) return [];
    
    const allJobs = data.pages.flatMap((page) => page.data);
    const uniqueJobsMap = new Map<number, JobListItem>();
    
    allJobs.forEach((job) => {
      if (!uniqueJobsMap.has(job.id)) {
        uniqueJobsMap.set(job.id, job);
      }
    });
    
    return Array.from(uniqueJobsMap.values());
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

  const handleApply = (jobId: number) => {
    // TODO: Başvuru işlemi
  };

  const hasActiveFilters = selectedSpecialtyId || selectedCityId || selectedWorkType;

  const renderContent = () => {
    if (!data) return null;
    
    return (
      <>
        {/* Modern Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerIcon}>
              <Briefcase size={28} color={colors.primary[600]} />
            </View>
            <View style={styles.headerText}>
              <Typography variant="h2" style={styles.headerTitle}>
                İş İlanları
              </Typography>
              <Typography variant="caption" style={styles.headerSubtitle}>
                {jobs.length} fırsat seni bekliyor
              </Typography>
            </View>
          </View>
          {hasActiveFilters && (
            <TouchableOpacity 
              style={styles.clearFiltersButton}
              onPress={handleResetFilters}
            >
              <X size={16} color={colors.error[600]} />
            </TouchableOpacity>
          )}
        </View>

        {/* Modern Search & Filter */}
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Hastane, şehir veya branş ara..."
            onClear={() => setSearchQuery('')}
            style={styles.searchBar}
          />
          <IconButton
            icon={<Filter size={20} color={hasActiveFilters ? colors.background.primary : colors.primary[600]} />}
            onPress={() => setShowFilterSheet(true)}
            size="md"
            variant={hasActiveFilters ? 'filled' : 'ghost'}
            color="primary"
            style={styles.filterButton}
          />
          {hasActiveFilters && (
            <View style={styles.filterBadge}>
              <Typography variant="caption" style={styles.filterBadgeText}>
                {[selectedSpecialtyId, selectedCityId, selectedWorkType].filter(Boolean).length}
              </Typography>
            </View>
          )}
        </View>

        {/* Active Filters with Modern Chips */}
        {hasActiveFilters && (
          <View style={styles.activeFiltersContainer}>
            {selectedSpecialtyId && (
              <Chip
                label="Branş Filtresi"
                variant="soft"
                color="primary"
                size="sm"
                onDelete={() => setSelectedSpecialtyId(undefined)}
              />
            )}
            {selectedCityId && (
              <Chip
                label="Şehir"
                icon={<MapPin size={12} color={colors.primary[700]} />}
                variant="soft"
                color="primary"
                size="sm"
                onDelete={() => setSelectedCityId(undefined)}
              />
            )}
            {selectedWorkType && (
              <Chip
                label={selectedWorkType}
                variant="soft"
                color="primary"
                size="sm"
                onDelete={() => setSelectedWorkType(undefined)}
              />
            )}
          </View>
        )}

        {/* Jobs List */}
        <FlatList
          data={jobs}
          renderItem={renderJob}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshing={isRefetching}
          onRefresh={refetch}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Briefcase size={64} color={colors.neutral[300]} />
              </View>
              <Typography variant="h3" style={styles.emptyTitle}>
                İlan Bulunamadı
              </Typography>
              <Typography variant="body" style={styles.emptyText}>
                {searchQuery || hasActiveFilters 
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
                <Typography variant="caption">Daha fazla ilan yükleniyor...</Typography>
              </View>
            ) : null
          }
        />
      </>
    );
  };

  const handleApplyFilters = useCallback(() => {
    setShowFilterSheet(false);
    refetch();
  }, [refetch]);

  const handleResetFilters = useCallback(() => {
    setSelectedSpecialtyId(undefined);
    setSelectedCityId(undefined);
    setSelectedWorkType(undefined);
    setShowFilterSheet(false);
    refetch();
  }, [refetch]);

  return (
    <Screen 
      scrollable={false} 
      loading={false}
      error={isError ? (new Error('İlanlar yüklenemedi')) : null}
      onRetry={refetch}
    >
      {isLoading ? (
        <View style={styles.skeletonContainer}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.headerIcon}>
                <Briefcase size={28} color={colors.primary[600]} />
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
  clearFiltersButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.error[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.background.primary,
    position: 'relative',
  },
  searchBar: {
    flex: 1,
  },
  filterButton: {
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing['4xl'],
  },
  footer: {
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
