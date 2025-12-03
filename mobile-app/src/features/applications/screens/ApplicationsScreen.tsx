import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  FlatList,
  RefreshControl,
  Modal,
  ScrollView,
  View,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { lookupService } from '@/api/services/lookup.service';
import { colors, spacing } from '@/theme';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Screen } from '@/components/layout/Screen';
import { ApplicationFilterSheet } from '../components/ApplicationFilterSheet';
import { ApplicationCard } from '../components/ApplicationCard';
import { useApplications } from '../hooks/useApplications';
import { useApplicationDetail } from '../hooks/useApplicationDetail';
import { useWithdrawApplication } from '../hooks/useWithdrawApplication';
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
            <Typography variant="h3" style={{ color: colors.error[700], marginBottom: spacing.sm }}>
              Başvuru yüklenemedi
            </Typography>
            <Typography variant="caption" style={{ marginBottom: spacing.md, textAlign: 'center', color: colors.text.secondary }}>
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
            <Typography variant="caption" style={styles.modalSubtitle}>
              {data.hospital_name ?? 'Kurum bilgisi yok'}
            </Typography>
            <View style={styles.modalRow}>
              <Badge 
                variant="primary"
                size="sm"
              >
                {data.status ?? 'Durum yok'}
              </Badge>
              <Typography variant="caption">
                {new Date(data.created_at).toLocaleDateString('tr-TR')}
              </Typography>
            </View>
            <Typography variant="h3" style={styles.sectionTitle}>
              Ön Yazı
            </Typography>
            <Typography variant="body">
              {data.cover_letter || 'Ön yazı bulunmuyor.'}
            </Typography>
            {data.notes && (
              <>
                <Typography variant="h3" style={styles.sectionTitle}>
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

  const renderContent = () => (
    <View style={styles.container}>
      <Card style={styles.filterCard}>
        <Typography variant="caption" style={{ color: colors.text.secondary }}>Başvuru Durumu</Typography>
        <Typography variant="h3">
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
            hospitalName={item.hospital_name || 'Kurum bilgisi yok'}
            position={item.job_title || 'Pozisyon bilgisi yok'}
            status={
              item.status?.toLowerCase() === 'başvuruldu' ? 'pending' :
              item.status?.toLowerCase() === 'onaylandı' ? 'accepted' :
              item.status?.toLowerCase() === 'reddedildi' ? 'rejected' :
              'reviewed'
            }
            statusLabel={item.status || 'Durum yok'}
            date={new Date(item.created_at).toLocaleDateString('tr-TR')}
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
          !query.isLoading && !query.isError ? (
            <View style={styles.emptyState}>
              <Typography variant="h3" style={styles.emptyTitle}>Henüz başvuru yapılmadı</Typography>
              <Typography variant="body" style={styles.emptyText}>
                Yeni ilanlara başvurarak bu alanı doldurabilirsin.
              </Typography>
            </View>
          ) : null
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
  );

  return (
    <Screen 
      scrollable={false} 
      loading={query.isLoading}
      error={query.isError ? (new Error('Başvurular yüklenemedi')) : null}
      onRetry={() => query.refetch()}
    >
      {renderContent()}
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
