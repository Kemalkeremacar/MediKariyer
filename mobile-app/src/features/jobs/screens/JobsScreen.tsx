/**
 * JOBS SCREEN - Modern İş İlanları Ekranı
 */

import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { jobService } from '@/api/services/job.service';
import { colors, spacing, borderRadius } from '@/theme';
import { Typography, Input, JobCard, LoadingState, ErrorState, EmptyState, Badge } from '@/ui';
import { Screen, Section } from '@/layouts';
import { FadeIn } from '@/animations';
import { Search, Filter, MapPin, Briefcase } from 'lucide-react-native';
import type { JobListItem } from '@/types/job';

export const JobsScreen = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<any>({});

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
    queryKey: ['jobs', searchQuery, filters],
    queryFn: ({ pageParam = 1 }) =>
      jobService.listJobs({
        page: pageParam,
        limit: 10,
        search: searchQuery,
        ...filters,
      }),
    getNextPageParam: (lastPage) => lastPage.pagination?.hasMore ? lastPage.pagination.page + 1 : undefined,
    initialPageParam: 1,
  });

  const jobs = data?.pages.flatMap((page) => page.data) || [];

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderJob = useCallback(
    ({ item, index }: { item: JobListItem; index: number }) => (
      <JobCard
        key={item.id}
        title={item.title || ''}
        hospital_name={item.hospital_name || undefined}
        city_name={item.city_name || undefined}
        is_applied={item.is_applied}
        onPress={() => navigation.navigate('JobDetail' as never, { jobId: item.id } as never)}
        onApply={() => handleApply(item.id)}
      />
    ),
    [navigation]
  );

  const handleApply = (jobId: number) => {
    // TODO: Başvuru işlemi
    console.log('Apply to job:', jobId);
  };

  if (isLoading) return <LoadingState message="İlanlar yükleniyor..." />;
  if (isError) return <ErrorState title="İlanlar yüklenemedi" onRetry={refetch} />;

  return (
    <Screen scrollable={false} padding={false}>
      {/* Header */}
      <FadeIn>
        <View style={styles.header}>
          <Typography variant="h3">İş İlanları</Typography>
          <View style={styles.headerActions}>
            <Badge label={`${jobs.length} ilan`} variant="primary" size="sm" />
          </View>
        </View>
      </FadeIn>

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
        <TouchableOpacity style={styles.filterButton} onPress={() => {/* TODO: Filter modal */}}>
          <Filter size={20} color={colors.primary[600]} />
        </TouchableOpacity>
      </View>

      {/* Active Filters */}
      {Object.keys(filters).length > 0 && (
        <View style={styles.activeFilters}>
          {Object.entries(filters).map(([key, value]) => (
            <Badge
              key={key}
              label={`${key}: ${value}`}
              variant="accent"
              size="sm"
              style={styles.filterBadge}
            />
          ))}
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
          <EmptyState
            title="İlan bulunamadı"
            description="Arama kriterlerinizi değiştirerek tekrar deneyin"
          />
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={styles.footer}>
              <LoadingState message="Daha fazla ilan yükleniyor..." />
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.background.primary,
  },
  filterBadge: {
    marginRight: spacing.xs,
  },
  listContent: {
    padding: spacing.lg,
  },
  footer: {
    paddingVertical: spacing.lg,
  },
});
