import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';
import { jobService } from '@/api/services/job.service';
import { lookupService } from '@/api/services/lookup.service';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import type { JobListItem, JobDetail, JobsResponse } from '@/types/job';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { JobCard } from '@/components/molecules/JobCard';
import { JobFilterSheet } from '@/components/organisms/JobFilterSheet';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

const useJobsQuery = (filters: {
  search: string;
  cityId: string;
  specialtyId: string;
}) =>
  useInfiniteQuery<JobsResponse, Error, JobsResponse, ['jobs', typeof filters], number>({
    queryKey: ['jobs', filters],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const page = typeof pageParam === 'number' ? pageParam : 1;
      const response = await jobService.listJobs({
        page,
        limit: 10,
        search: filters.search ? filters.search.trim() : undefined,
        city_id: filters.cityId ? Number(filters.cityId) : undefined,
        specialty_id: filters.specialtyId
          ? Number(filters.specialtyId)
          : undefined,
      });
      return response;
    },
    getNextPageParam: (lastPage) => {
      const pagination = lastPage.pagination;
      if (!pagination) {
        return undefined;
      }
      const current =
        pagination.current_page ?? (pagination as any).page ?? 1;
      if (pagination.next_page) {
        return pagination.next_page;
      }
      if (pagination.has_next ?? pagination.has_next_page) {
        return current + 1;
      }
      if (
        pagination.total_pages &&
        current < pagination.total_pages
      ) {
        return current + 1;
      }
      return undefined;
    },
  });

const DetailsModal = ({
  jobId,
  visible,
  onClose,
}: {
  jobId: number | null;
  visible: boolean;
  onClose: () => void;
}) => {
  const queryClient = useQueryClient();
  const [coverLetter, setCoverLetter] = useState('');
  const { data, isLoading, isError, refetch } = useQuery({
    enabled: visible && Boolean(jobId),
    queryKey: ['job', jobId],
    queryFn: () => jobService.getJobDetail(jobId as number),
  });

  const applyMutation = useMutation({
    mutationFn: ({ jobId: targetJobId }: { jobId: number }) =>
      jobService.applyToJob({
        jobId: targetJobId,
        coverLetter: coverLetter.trim(),
      }),
    onSuccess: () => {
      Alert.alert('Başvuru alındı', 'Başvurunuz başarıyla iletildi.');
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      refetch();
    },
    onError: () => {
      Alert.alert('Hata', 'Başvuru yapılırken bir sorun oluştu.');
    },
  });

  const job = data;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <Button
          label="Kapat"
          variant="ghost"
          onPress={onClose}
          style={styles.modalClose}
        />
        {isLoading && (
          <View style={styles.modalLoader}>
            <ActivityIndicator size="large" color={colors.primary[600]} />
          </View>
        )}
        {isError && (
          <View style={styles.modalLoader}>
            <Typography variant="title">İlan yüklenemedi</Typography>
            <Button label="Tekrar dene" onPress={() => refetch()} />
          </View>
        )}
        {job && (
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Typography variant="heading">{job.title ?? 'İş İlanı'}</Typography>
            <Typography variant="bodySecondary" style={styles.modalSubtitle}>
              {job.hospital_name ?? 'Kurum bilgisi yok'}
            </Typography>
            <View style={styles.modalMetaRow}>
              <Typography variant="caption" style={styles.metaText}>
                {job.city_name ?? 'Şehir belirtilmedi'}
              </Typography>
              <Typography variant="caption" style={styles.metaText}>
                {job.work_type ?? '-'}
              </Typography>
            </View>
            {job.salary_range && (
              <Typography variant="body" style={styles.metaHighlight}>
                {job.salary_range}
              </Typography>
            )}
            <Typography variant="title" style={styles.sectionTitle}>
              İş Tanımı
            </Typography>
            <Typography variant="body">
              {job.description ?? 'Paylaşılmadı.'}
            </Typography>
            {!!job.requirements?.length && (
              <>
                <Typography variant="title" style={styles.sectionTitle}>
                  Gereksinimler
                </Typography>
                {job.requirements.map((req, index) => (
                  <Typography
                    key={`${req}-${index}`}
                    variant="bodySecondary"
                    style={styles.requirementItem}
                  >
                    • {req}
                  </Typography>
                ))}
              </>
            )}

            <Typography variant="title" style={styles.sectionTitle}>
              Ön Yazı (opsiyonel)
            </Typography>
            <Input
              multiline
              placeholder="Kendinden bahsetmek ister misin?"
              value={coverLetter}
              onChangeText={setCoverLetter}
              containerStyle={styles.coverLetterInput}
            />
            <Button
              label={job.is_applied ? 'Başvuruldu' : 'Başvuru Yap'}
              onPress={() => job.id && applyMutation.mutate({ jobId: job.id })}
              loading={applyMutation.isPending}
              disabled={job.is_applied}
              fullWidth
              style={styles.applyButton}
            />
          </ScrollView>
        )}
      </View>
    </Modal>
  );
};

export const JobsScreen = () => {
  const [search, setSearch] = useState('');
  const [cityId, setCityId] = useState('');
  const [specialtyId, setSpecialtyId] = useState('');
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const filterSheetRef = useRef<BottomSheetModal>(null);

  const { data: cities = [] } = useQuery({
    queryKey: ['lookup', 'cities'],
    queryFn: lookupService.getCities,
  });
  const { data: specialties = [] } = useQuery({
    queryKey: ['lookup', 'specialties'],
    queryFn: lookupService.getSpecialties,
  });

  const query = useJobsQuery({ search, cityId, specialtyId });
  const jobs = useMemo(() => {
    const pages =
      (query.data as InfiniteData<JobsResponse, number> | undefined)?.pages ??
      [];
    return pages.flatMap((page) => page.data);
  }, [query.data]);

  const loadMore = () => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
  };

  const onRefresh = () => {
    query.refetch();
  };

  const openFilters = useCallback(() => {
    filterSheetRef.current?.present();
  }, []);

  const handleApplyFilters = useCallback(() => {
    filterSheetRef.current?.dismiss();
    query.refetch();
  }, [query]);

  const handleResetFilters = useCallback(() => {
    setCityId('');
    setSpecialtyId('');
    filterSheetRef.current?.dismiss();
    query.refetch();
  }, [query]);

  return (
    <ScreenContainer
      scrollable={false}
      contentContainerStyle={styles.screenContent}
    >
      <View style={styles.container}>
        <Card style={styles.searchSection}>
          <Input
            placeholder="İlan ara..."
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            containerStyle={styles.searchInput}
          />
          <Button
            label="Filtreleri Aç"
            variant="ghost"
            fullWidth
            onPress={openFilters}
          />
        </Card>

        <FlatList
          data={jobs}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <JobCard item={item} onPress={() => setSelectedJobId(item.id)} />
          )}
          refreshControl={
            <RefreshControl refreshing={query.isRefetching} onRefresh={onRefresh} />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            query.isFetchingNextPage ? (
              <ActivityIndicator style={styles.listLoader} />
            ) : null
          }
          ListEmptyComponent={
            query.isLoading ? (
              <View style={styles.loader}>
                <ActivityIndicator size="large" color={colors.primary[600]} />
              </View>
            ) : (
              <EmptyState
                title="İlan bulunamadı"
                description="Filtreleri değiştirerek yeni ilanlara göz at."
              />
            )
          }
          contentContainerStyle={styles.listContent}
        />

        <DetailsModal
          visible={selectedJobId !== null}
          jobId={selectedJobId}
          onClose={() => setSelectedJobId(null)}
        />

        <JobFilterSheet
          ref={filterSheetRef}
          cities={cities}
          specialties={specialties}
          cityId={cityId}
          specialtyId={specialtyId}
          onCityChange={setCityId}
          onSpecialtyChange={setSpecialtyId}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
        />
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  screenContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  container: {
    flex: 1,
  },
  searchSection: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  searchInput: {
    marginBottom: spacing.xs,
  },
  loader: {
    paddingVertical: spacing['3xl'],
    alignItems: 'center',
  },
  listLoader: {
    marginVertical: spacing.lg,
  },
  listContent: {
    paddingBottom: spacing['4xl'],
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  modalClose: {
    alignSelf: 'flex-end',
    margin: spacing.lg,
  },
  modalLoader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  modalContent: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['3xl'],
    gap: spacing.md,
  },
  modalSubtitle: {
    color: colors.text.secondary,
  },
  modalMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  metaText: {
    color: colors.text.secondary,
  },
  metaHighlight: {
    marginTop: spacing.sm,
    color: colors.neutral[800],
    fontWeight: typography.fontWeight.semibold,
  },
  requirementItem: {
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  coverLetterInput: {
    marginTop: spacing.sm,
  },
  sectionTitle: {
    marginTop: spacing.lg,
  },
  applyButton: {
    marginTop: spacing.lg,
  },
});


