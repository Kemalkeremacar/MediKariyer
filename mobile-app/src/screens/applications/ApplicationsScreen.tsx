import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  FlatList,
  RefreshControl,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';
import { applicationService } from '@/api/services/application.service';
import { lookupService } from '@/api/services/lookup.service';
import { colors, spacing, borderRadius, typography } from '@/constants/theme';
import type {
  ApplicationListItem,
  ApplicationDetail,
  ApplicationsResponse,
} from '@/types/application';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Box,
  VStack,
  HStack,
  Spinner,
  Badge,
  BadgeText,
} from '@gluestack-ui/themed';
import { ApplicationFilterSheet } from '@/components/organisms/ApplicationFilterSheet';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

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
  <Badge
    borderWidth={1}
    borderColor={colors.primary[200]}
    backgroundColor={colors.primary[100]}
    rounded="$full"
    px="$2"
    py="$1"
  >
    <BadgeText color="$primary800" fontSize="$xs">
      {status ?? 'Durum yok'}
    </BadgeText>
  </Badge>
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
      <Box flex={1} bg="$backgroundLight100">
        <Button
          label="Kapat"
          variant="ghost"
          onPress={onClose}
          style={styles.modalClose}
        />
        {isLoading && (
          <Box style={styles.modalLoader}>
            <Spinner size="large" color="$primary600" />
          </Box>
        )}
        {isError && (
          <Box style={styles.modalLoader}>
            <Typography variant="title">Başvuru yüklenemedi</Typography>
            <Button label="Tekrar dene" onPress={() => refetch()} />
          </Box>
        )}
        {data && (
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Typography variant="heading">
              {data.job_title ?? 'Başvuru'}
            </Typography>
            <Typography variant="bodySecondary" style={styles.modalSubtitle}>
              {data.hospital_name ?? 'Kurum bilgisi yok'}
            </Typography>
            <HStack mt="$2" justifyContent="space-between" alignItems="center">
              <StatusBadge status={data.status} />
              <Typography variant="caption">
                {new Date(data.created_at).toLocaleDateString('tr-TR')}
              </Typography>
            </HStack>
            <Typography variant="title" style={styles.sectionTitle}>
              Ön Yazı
            </Typography>
            <Typography variant="body">
              {data.cover_letter || 'Ön yazı bulunmuyor.'}
            </Typography>
            {data.notes && (
              <>
                <Typography variant="title" style={styles.sectionTitle}>
                  Hastane Notu
                </Typography>
                <Typography variant="body">{data.notes}</Typography>
              </>
            )}
            {canWithdraw && (
              <Button
                label="Başvuruyu Geri Çek"
                variant="secondary"
                onPress={() => withdrawMutation.mutate()}
                loading={withdrawMutation.isPending}
                fullWidth
                style={styles.withdrawButton}
              />
            )}
          </ScrollView>
        )}
      </Box>
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
  <Card style={styles.cardItem} onPress={onPress}>
    <Typography variant="title">{item.job_title ?? 'Başvuru'}</Typography>
    <Typography variant="bodySecondary">
      {item.hospital_name ?? 'Kurum bilgisi yok'}
    </Typography>
    <HStack mt="$2" justifyContent="space-between" alignItems="center">
      <StatusBadge status={item.status} />
      <Typography variant="caption">
        {new Date(item.created_at).toLocaleDateString('tr-TR')}
      </Typography>
    </HStack>
  </Card>
);

export const ApplicationsScreen = () => {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);
  const filterSheetRef = useRef<BottomSheetModal>(null);

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

  const openFilters = useCallback(() => {
    filterSheetRef.current?.present();
  }, []);

  const handleApplyFilters = useCallback(() => {
    filterSheetRef.current?.dismiss();
    query.refetch();
  }, [query]);

  const handleResetFilters = useCallback(() => {
    setSelectedStatus('');
    filterSheetRef.current?.dismiss();
    query.refetch();
  }, [query]);

  return (
    <ScreenContainer
      scrollable={false}
      contentContainerStyle={styles.screenContent}
    >
      <Box style={styles.container}>
        <Card style={styles.filterCard}>
          <Typography variant="subtitle">Başvuru Durumu</Typography>
          <Typography variant="title">
            {selectedStatus || 'Tüm durumlar'}
          </Typography>
          <Button
            label="Filtreleri Aç"
            variant="ghost"
            fullWidth
            onPress={openFilters}
          />
        </Card>

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
              <Spinner style={styles.listLoader} color="$primary600" />
            ) : null
          }
          ListEmptyComponent={
            query.isLoading ? (
              <Box style={styles.loader}>
                <Spinner size="large" color="$primary600" />
              </Box>
            ) : (
              <EmptyState
                title="Başvuru bulunamadı"
                description="Yeni ilanlara başvurarak bu alanı doldurabilirsin."
              />
            )
          }
          contentContainerStyle={styles.listContent}
        />

        <DetailsModal
          applicationId={selectedApplicationId}
          visible={selectedApplicationId !== null}
          onClose={() => setSelectedApplicationId(null)}
        />

        <ApplicationFilterSheet
          ref={filterSheetRef}
          statuses={statuses}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
        />
      </Box>
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
  filterCard: {
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  cardItem: {
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  loader: {
    paddingVertical: spacing['5xl'],
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
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  modalContent: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing['3xl'],
    gap: spacing.md,
  },
  modalSubtitle: {
    color: colors.text.secondary,
  },
  sectionTitle: {
    marginTop: spacing.lg,
  },
  withdrawButton: {
    marginTop: spacing.lg,
  },
});


