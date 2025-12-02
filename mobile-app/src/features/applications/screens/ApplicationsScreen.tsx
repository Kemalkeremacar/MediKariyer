import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  FlatList,
  RefreshControl,
  Modal,
  ScrollView,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';
import { lookupService } from '@/api/services/lookup.service';
import { colors, spacing } from '@/theme';
import { Typography, Button, Card, Badge, EmptyState, ErrorState } from '@/ui';
import { Screen } from '@/layouts';
import type { ApplicationListItem } from '@/types/application';
import type { ApplicationsListResponse } from '@/api/services/application.service';
import { ApplicationFilterSheet, ApplicationCard } from '@/features/applications/components';
import { useApplications, useApplicationDetail, useWithdrawApplication } from '@/features/applications/hooks';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

const DetailsModal = ({
  applicationId,
  visible,
  onClose,
}: {
  applicationId: number | null;
  visible: boolean;
  onClose: () => void;
}) => {
  const { data, isLoading, isError, refetch } = useApplicationDetail(applicationId, visible);
  const withdrawMutation = useWithdrawApplication();

  const handleWithdraw = () => {
    if (applicationId) {
      withdrawMutation.mutate(applicationId, {
        onSuccess: () => {
          refetch();
        },
      });
    }
  };

  const canWithdraw =
    data?.status?.toLowerCase() === 'başvuruldu' && !withdrawMutation.isPending;

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
            <Typography variant="h4" style={{ color: colors.error[700], marginBottom: spacing.sm }}>
              Başvuru yüklenemedi
            </Typography>
            <Typography variant="bodySmall" color="secondary" style={{ marginBottom: spacing.md, textAlign: 'center' }}>
              Lütfen internet bağlantınızı kontrol edip tekrar deneyin.
            </Typography>
            <Button label="Tekrar dene" onPress={() => refetch()} variant="primary" />
          </View>
        )}
        {data && (
          <ScrollView contentContainerStyle={styles.modalContent}>
            <Typography variant="h2">
              {data.job_title ?? 'Başvuru'}
            </Typography>
            <Typography variant="bodySmall" color="secondary" style={styles.modalSubtitle}>
              {data.hospital_name ?? 'Kurum bilgisi yok'}
            </Typography>
            <View style={styles.modalRow}>
              <Badge 
                label={data.status ?? 'Durum yok'}
                variant="primary"
                size="sm"
              />
              <Typography variant="caption">
                {new Date(data.created_at).toLocaleDateString('tr-TR')}
              </Typography>
            </View>
            <Typography variant="h4" style={styles.sectionTitle}>
              Ön Yazı
            </Typography>
            <Typography variant="body">
              {data.cover_letter || 'Ön yazı bulunmuyor.'}
            </Typography>
            {data.notes && (
              <>
                <Typography variant="h4" style={styles.sectionTitle}>
                  Hastane Notu
                </Typography>
                <Typography variant="body">{data.notes}</Typography>
              </>
            )}
            {canWithdraw && (
              <Button
                label="Başvuruyu Geri Çek"
                variant="secondary"
                onPress={handleWithdraw}
                loading={withdrawMutation.isPending}
                fullWidth
                style={styles.withdrawButton}
              />
            )}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
};

export const ApplicationsScreen = () => {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);
  const filterSheetRef = useRef<BottomSheetModal>(null);

  const { data: statuses = [] } = useQuery({
    queryKey: ['lookup', 'application-statuses'],
    queryFn: lookupService.getApplicationStatuses,
  });

  const query = useApplications({ status: selectedStatus });

  const applications = useMemo(() => {
    if (!query.data) return [];
    const pages = query.data.pages ?? [];
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
    <Screen scrollable={false} padding={false}>
      <View style={styles.container}>
        <Card style={styles.filterCard}>
          <Typography variant="bodySmall" color="secondary">Başvuru Durumu</Typography>
          <Typography variant="h4">
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
          keyExtractor={(item, index) => `app-${item.id}-${index}`}
          renderItem={({ item }) => (
            <ApplicationCard
              application={item}
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
          ListFooterComponent={
            query.isFetchingNextPage ? (
              <ActivityIndicator style={styles.listLoader} color={colors.primary[600]} />
            ) : null
          }
          ListEmptyComponent={
            query.isLoading ? (
              <View style={styles.loader}>
                <ActivityIndicator size="large" color={colors.primary[600]} />
              </View>
            ) : query.isError ? (
              <ErrorState
                title="Başvurular yüklenemedi"
                message="Lütfen internet bağlantınızı kontrol edip tekrar deneyin."
                onRetry={() => query.refetch()}
              />
            ) : (
              <EmptyState
                title="Henüz başvuru yapılmadı"
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
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  filterCard: {
    marginBottom: spacing.md,
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
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  sectionTitle: {
    marginTop: spacing.lg,
  },
  withdrawButton: {
    marginTop: spacing.lg,
  },
});
