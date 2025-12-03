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
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { JobCard } from '@/components/ui/JobCard';
import { Screen } from '@/components/layout/Screen';
import { Filter } from 'lucide-react-native';
import type { JobListItem } from '@/types/job';
import { JobFilterSheet } from '../components/JobFilterSheet';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

export const JobsScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialtyId, setSelectedSpecialtyId] = useState<number | undefined>();
  const [selectedCityId, setSelectedCityId] = useState<number | undefined>();
  const [selectedWorkType, setSelectedWorkType] = useState<string | undefined>();
  const filterSheetRef = React.useRef<any>(null);

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
        key={item.id}
        title={item.title || ''}
        company={item.hospital_name || undefined}
        location={item.city_name || undefined}
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

  const renderContent = () => {
    if (!data) return null;
    
    return (
      <>
        {/* Header */}
        <View style={styles.header}>
          <Typography variant="h3">İş İlanları</Typography>
          <View style={styles.headerActions}>
            <Badge variant="primary" size="sm">{jobs.length} ilan</Badge>
          </View>
        </View>

        {/* Search & Filter */}
        <View style={styles.searchContainer}>
          <View style={styles.searchWrapper}>
            <Input
              placeholder="İlan ara..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchInput}
            />
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => filterSheetRef.current?.present()}
          >
            <Filter size={20} color={colors.primary[600]} />
          </TouchableOpacity>
        </View>

        {/* Active Filters */}
        {(selectedSpecialtyId || selectedCityId || selectedWorkType) && (
          <View style={styles.activeFilters}>
            <Typography variant="caption" style={styles.activeFiltersText}>
              {[
                selectedSpecialtyId && 'Branş',
                selectedCityId && 'Şehir',
                selectedWorkType && 'Çalışma Şekli',
              ]
                .filter(Boolean)
                .join(', ')}{' '}
              filtrelendi
            </Typography>
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
              <Typography variant="h3" style={styles.emptyTitle}>İlan bulunamadı</Typography>
              <Typography variant="body" style={styles.emptyText}>
                Arama kriterlerinizi değiştirerek tekrar deneyin
              </Typography>
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
    filterSheetRef.current?.dismiss();
    refetch();
  }, [refetch]);

  const handleResetFilters = useCallback(() => {
    setSelectedSpecialtyId(undefined);
    setSelectedCityId(undefined);
    setSelectedWorkType(undefined);
    filterSheetRef.current?.dismiss();
    refetch();
  }, [refetch]);

  return (
    <Screen 
      scrollable={false} 
      loading={isLoading}
      error={isError ? (new Error('İlanlar yüklenemedi')) : null}
      onRetry={refetch}
    >
      {renderContent()}
      
      <JobFilterSheet
        ref={filterSheetRef}
        selectedSpecialtyId={selectedSpecialtyId}
        selectedCityId={selectedCityId}
        selectedWorkType={selectedWorkType}
        onSpecialtyChange={setSelectedSpecialtyId}
        onCityChange={setSelectedCityId}
        onWorkTypeChange={setSelectedWorkType}
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
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
  },
  searchWrapper: {
    flex: 1,
  },
  searchInput: {
    marginBottom: 0,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeFilters: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.background.primary,
  },
  activeFiltersText: {
    color: colors.primary[600],
    fontWeight: '500',
  },
  listContent: {
    padding: spacing.lg,
  },
  footer: {
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
