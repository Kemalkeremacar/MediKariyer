import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';
import { applicationService } from '@/api/services/application.service';
import { lookupService } from '@/api/services/lookup.service';
import { colors, shadows, spacing, borderRadius, typography } from '@/constants/theme';
import type {
  ApplicationListItem,
  ApplicationDetail,
  ApplicationsResponse,
} from '@/types/application';

const useApplicationsQuery = (filters: { status: string }) =>
  useInfiniteQuery<
    ApplicationsResponse,
    Error,
    ApplicationsResponse,
    ['applications', typeof filters],
    number
  >({
    queryKey: ['applications', filters],
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const page = typeof pageParam === 'number' ? pageParam : 1;
      return applicationService.listApplications({
        page,
        limit: 10,
        status: filters.status || undefined,
      });
    },
    getNextPageParam: (lastPage) => {
      const pagination = lastPage.pagination;
      if (!pagination) {
        return undefined;
      }
      const current =
        pagination.current_page ?? (pagination as any).page ?? 1;
      if (pagination.has_next) {
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

const StatusBadge = ({ status }: { status?: string | null }) => (
  <View style={styles.badge}>
    <Text style={styles.badgeText}>{status ?? 'Durum yok'}</Text>
  </View>
);

const DetailsModal = ({
  applicationId,
  visible,
  onClose,
}: {
  applicationId: number | null;
  visible: boolean;
  onClose: () => void;
}) => {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({
    enabled: visible && Boolean(applicationId),
    queryKey: ['application', applicationId],
    queryFn: () => applicationService.getApplicationDetail(applicationId as number),
  });

  const withdrawMutation = useMutation({
    mutationFn: () =>
      applicationService.withdraw(applicationId as number),
    onSuccess: () => {
      Alert.alert('Başvuru geri çekildi');
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      refetch();
    },
    onError: () => {
      Alert.alert('Hata', 'Başvuru geri çekilemedi');
    },
  });

  const canWithdraw =
    data?.status?.toLowerCase() === 'başvuruldu' && !withdrawMutation.isPending;

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
            <Text style={styles.errorTitle}>Başvuru yüklenemedi</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
              <Text style={styles.retryText}>Tekrar dene</Text>
            </TouchableOpacity>
          </View>
        )}
        {data && (
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Text style={styles.modalTitle}>{data.job_title ?? 'Başvuru'}</Text>
            <Text style={styles.modalSubtitle}>
              {data.hospital_name ?? 'Kurum bilgisi yok'}
            </Text>
            <View style={styles.modalMetaRow}>
              <StatusBadge status={data.status} />
              <Text style={styles.metaText}>
                {new Date(data.created_at).toLocaleDateString('tr-TR')}
              </Text>
            </View>
            <Text style={styles.sectionTitle}>Ön Yazı</Text>
            <Text style={styles.modalDescription}>
              {data.cover_letter || 'Ön yazı bulunmuyor.'}
            </Text>
            {data.notes && (
              <>
                <Text style={styles.sectionTitle}>Hastane Notu</Text>
                <Text style={styles.modalDescription}>{data.notes}</Text>
              </>
            )}
            {canWithdraw && (
              <TouchableOpacity
                style={styles.withdrawButton}
                onPress={() => withdrawMutation.mutate()}
              >
                {withdrawMutation.isPending ? (
                  <ActivityIndicator color={colors.text.inverse} />
                ) : (
                  <Text style={styles.withdrawButtonText}>Başvuruyu Geri Çek</Text>
                )}
              </TouchableOpacity>
            )}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
};

const renderApplicationCard = ({
  item,
  onPress,
}: {
  item: ApplicationListItem;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.cardItem} onPress={onPress}>
    <Text style={styles.itemTitle}>{item.job_title ?? 'Başvuru'}</Text>
    <Text style={styles.itemSubtitle}>
      {item.hospital_name ?? 'Kurum bilgisi yok'}
    </Text>
    <View style={styles.itemMeta}>
      <StatusBadge status={item.status} />
      <Text style={styles.metaText}>
        {new Date(item.created_at).toLocaleDateString('tr-TR')}
      </Text>
    </View>
  </TouchableOpacity>
);

export const ApplicationsScreen = () => {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);

  const { data: statuses = [] } = useQuery({
    queryKey: ['lookup', 'application-statuses'],
    queryFn: lookupService.getApplicationStatuses,
  });

  const query = useApplicationsQuery({ status: selectedStatus });

  const applications = useMemo(() => {
    const pages =
      (query.data as InfiniteData<ApplicationsResponse, number> | undefined)
        ?.pages ?? [];
    return pages.flatMap((page) => page.data);
  }, [query.data]);

  const loadMore = () => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterCard}>
        <Text style={styles.sectionTitle}>Filtreler</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedStatus}
            onValueChange={(value) => setSelectedStatus(value)}
          >
            <Picker.Item label="Tüm Durumlar" value="" />
            {statuses.map((status) => (
              <Picker.Item
                key={status.id}
                label={status.name}
                value={status.name}
              />
            ))}
          </Picker>
        </View>
      </View>

      <FlatList
        data={applications}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) =>
          renderApplicationCard({
            item,
            onPress: () => setSelectedApplicationId(item.id),
          })
        }
        refreshControl={
          <RefreshControl
            refreshing={query.isRefetching}
            onRefresh={() => query.refetch()}
          />
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
              <Text style={styles.emptyStateText}>Başvuru bulunamadı.</Text>
            </View>
          )
        }
        contentContainerStyle={{ paddingBottom: 32 }}
      />

      <DetailsModal
        applicationId={selectedApplicationId}
        visible={selectedApplicationId !== null}
        onClose={() => setSelectedApplicationId(null)}
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
  filterCard: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  pickerWrapper: {
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
  itemTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  itemSubtitle: {
    marginTop: spacing.xs,
    color: colors.text.secondary,
  },
  itemMeta: {
    marginTop: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaText: {
    color: colors.text.secondary,
  },
  badge: {
    borderWidth: 1,
    borderColor: colors.primary[200],
    backgroundColor: colors.primary[100],
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    color: colors.primary[800],
    fontWeight: typography.fontWeight.semibold,
  },
  loader: {
    paddingVertical: spacing['5xl'],
    alignItems: 'center',
  },
  emptyState: {
    paddingVertical: spacing['5xl'],
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
    paddingHorizontal: spacing.xl,
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
    alignItems: 'center',
  },
  modalDescription: {
    color: colors.neutral[800],
    lineHeight: typography.lineHeight.normal,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  withdrawButton: {
    marginTop: spacing.lg,
    backgroundColor: colors.error[600],
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  withdrawButtonText: {
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


