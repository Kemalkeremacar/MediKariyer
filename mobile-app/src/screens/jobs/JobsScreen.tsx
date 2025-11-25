import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';
import { jobService } from '@/api/services/job.service';
import { lookupService } from '@/api/services/lookup.service';
import { colors, spacing, borderRadius, typography, shadows } from '@/constants/theme';
import type { JobListItem, JobDetail, JobsResponse } from '@/types/job';

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
        <TouchableOpacity style={styles.modalClose} onPress={onClose}>
          <Text style={styles.modalCloseText}>Kapat</Text>
        </TouchableOpacity>
        {isLoading && (
          <View style={styles.modalLoader}>
            <ActivityIndicator size="large" color={colors.primary[600]} />
          </View>
        )}
        {isError && (
          <View style={styles.modalLoader}>
            <Text style={styles.errorTitle}>İlan yüklenemedi</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
              <Text style={styles.retryText}>Tekrar dene</Text>
            </TouchableOpacity>
          </View>
        )}
        {job && (
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalTitle}>{job.title ?? 'İş İlanı'}</Text>
            <Text style={styles.modalSubtitle}>
              {job.hospital_name ?? 'Kurum bilgisi yok'}
            </Text>
            <View style={styles.modalMetaRow}>
              <Text style={styles.metaText}>
                {job.city_name ?? 'Şehir belirtilmedi'}
              </Text>
              <Text style={styles.metaText}>{job.work_type ?? '-'}</Text>
            </View>
            {job.salary_range && (
              <Text style={styles.metaHighlight}>{job.salary_range}</Text>
            )}
            <Text style={styles.sectionTitle}>İş Tanımı</Text>
            <Text style={styles.modalDescription}>
              {job.description ?? 'Paylaşılmadı.'}
            </Text>
            {!!job.requirements?.length && (
              <>
                <Text style={styles.sectionTitle}>Gereksinimler</Text>
                {job.requirements.map((req, index) => (
                  <Text key={`${req}-${index}`} style={styles.requirementItem}>
                    • {req}
                  </Text>
                ))}
              </>
            )}

            <Text style={styles.sectionTitle}>Ön Yazı (opsiyonel)</Text>
            <TextInput
              style={styles.coverLetterInput}
              placeholder="Kendinden bahsetmek ister misin?"
              multiline
              value={coverLetter}
              onChangeText={setCoverLetter}
            />
            <TouchableOpacity
              style={[
                styles.applyButton,
                job.is_applied && styles.applyButtonDisabled,
              ]}
              disabled={job.is_applied || applyMutation.isPending}
              onPress={() =>
                job.id && applyMutation.mutate({ jobId: job.id })
              }
            >
              {applyMutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.applyButtonText}>
                  {job.is_applied ? 'Başvuruldu' : 'Başvuru Yap'}
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>
    </Modal>
  );
};

const renderJobCard = ({
  item,
  onPress,
}: {
  item: JobListItem;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.cardItem} onPress={onPress}>
    <View style={styles.jobHeader}>
      <Text style={styles.itemTitle}>{item.title ?? 'İlan'}</Text>
      {item.is_applied && (
        <View style={[styles.badge, styles.badgeApplied]}>
          <Text style={[styles.badgeText, { color: colors.success[900] }]}>
            Başvuruldu
          </Text>
        </View>
      )}
    </View>
    <Text style={styles.itemSubtitle}>
      {item.hospital_name ?? 'Kurum bilgisi yok'}
    </Text>
    <View style={styles.itemMetaWrap}>
      <Text style={styles.metaText}>{item.city_name ?? '-'}</Text>
      <Text style={styles.metaText}>{item.work_type ?? '-'}</Text>
    </View>
    {item.salary_range && (
      <Text style={styles.metaHighlight}>{item.salary_range}</Text>
    )}
  </TouchableOpacity>
);

export const JobsScreen = () => {
  const [search, setSearch] = useState('');
  const [cityId, setCityId] = useState('');
  const [specialtyId, setSpecialtyId] = useState('');
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);

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

  return (
    <View style={styles.container}>
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="İlan ara..."
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        <View style={styles.filterRow}>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={cityId}
              onValueChange={(value) => setCityId(value)}
            >
              <Picker.Item label="Şehir" value="" />
              {cities.map((city) => (
                <Picker.Item
                  label={city.name}
                  value={String(city.id)}
                  key={city.id}
                />
              ))}
            </Picker>
          </View>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={specialtyId}
              onValueChange={(value) => setSpecialtyId(value)}
            >
              <Picker.Item label="Branş" value="" />
              {specialties.map((item) => (
                <Picker.Item
                  label={item.name}
                  value={String(item.id)}
                  key={item.id}
                />
              ))}
            </Picker>
          </View>
        </View>
      </View>

      <FlatList
        data={jobs}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) =>
          renderJobCard({
            item,
            onPress: () => setSelectedJobId(item.id),
          })
        }
        refreshControl={
          <RefreshControl refreshing={query.isRefetching} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          query.isFetchingNextPage ? (
            <ActivityIndicator style={{ marginVertical: 16 }} />
          ) : null
        }
        ListEmptyComponent={
          query.isLoading ? (
            <View style={styles.loader}>
              <ActivityIndicator size="large" color={colors.primary[600]} />
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>İlan bulunamadı.</Text>
            </View>
          )
        }
        contentContainerStyle={{ paddingBottom: 32 }}
      />

      <DetailsModal
        visible={selectedJobId !== null}
        jobId={selectedJobId}
        onClose={() => setSelectedJobId(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    padding: spacing.lg,
  },
  searchSection: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.base,
    marginBottom: spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  pickerWrapper: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.background.secondary,
  },
  cardItem: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.background.primary,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  itemSubtitle: {
    marginTop: spacing.xs,
    color: colors.text.secondary,
  },
  itemMetaWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  metaText: {
    color: colors.text.secondary,
  },
  metaHighlight: {
    marginTop: spacing.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[800],
  },
  badge: {
    borderWidth: 1,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  badgeApplied: {
    borderColor: colors.success[300],
    backgroundColor: colors.success[100],
  },
  badgeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  loader: {
    paddingVertical: spacing['3xl'],
    alignItems: 'center',
  },
  emptyState: {
    paddingVertical: spacing['3xl'],
    alignItems: 'center',
  },
  emptyStateText: {
    color: colors.text.secondary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  modalClose: {
    alignSelf: 'flex-end',
    padding: spacing.lg,
  },
  modalCloseText: {
    color: colors.primary[600],
    fontWeight: typography.fontWeight.semibold,
  },
  modalLoader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['3xl'],
    gap: spacing.md,
  },
  modalTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  modalSubtitle: {
    color: colors.text.secondary,
  },
  modalMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  modalDescription: {
    color: colors.text.primary,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    color: colors.text.primary,
  },
  requirementItem: {
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  coverLetterInput: {
    borderWidth: 1,
    borderColor: colors.border.medium,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  applyButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary[600],
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  applyButtonDisabled: {
    backgroundColor: colors.neutral[300],
  },
  applyButtonText: {
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.semibold,
  },
  errorTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  retryButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary[600],
  },
  retryText: {
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.semibold,
  },
});


