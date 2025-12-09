import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  FlatList,
  RefreshControl,
  Modal,
  ScrollView,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { lookupService } from '@/api/services/lookup.service';
import { colors, spacing } from '@/theme';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { BackButton } from '@/components/ui/BackButton';
import { Screen } from '@/components/layout/Screen';
import { ApplicationFilterSheet } from '@/components/applications/ApplicationFilterSheet';
import { ApplicationCard } from '@/components/applications/ApplicationCard';
import { useApplications } from '../hooks/useApplications';
import { useApplicationDetail } from '../hooks/useApplicationDetail';
import { useWithdrawApplication } from '../hooks/useWithdrawApplication';
import { FileText, Filter, CheckCircle, Clock, XCircle, Eye, AlertCircle, Building2, MapPin, Phone, Mail, X } from 'lucide-react-native';

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
        {isLoading && (
          <View style={styles.modalLoader}>
            <ActivityIndicator size="large" color={colors.primary[600]} />
            <Typography variant="body" style={styles.modalLoaderText}>
              Yükleniyor...
            </Typography>
          </View>
        )}
        {isError && (
          <View style={styles.modalLoader}>
            <View style={styles.errorIcon}>
              <XCircle size={48} color={colors.error[600]} />
            </View>
            <Typography variant="h3" style={styles.errorTitle}>
              Başvuru Yüklenemedi
            </Typography>
            <Typography variant="body" style={styles.errorText}>
              Lütfen internet bağlantınızı kontrol edip tekrar deneyin.
            </Typography>
            <Button 
              label="Tekrar Dene" 
              onPress={() => refetch()} 
              variant="primary"
              size="lg"
            />
          </View>
        )}
        {data && (
          <ScrollView contentContainerStyle={styles.modalContent}>
            {/* Back Button */}
            <View style={styles.backButtonContainer}>
              <BackButton onPress={onClose} />
            </View>

            {/* Header */}
            <View style={styles.modalHeaderInline}>
              <Typography variant="h2" style={styles.modalHeaderTitle}>
                Başvuru Detayı
              </Typography>
            </View>
            {/* Job Info Card */}
            <Card variant="elevated" padding="lg" style={styles.jobInfoCard}>
              <View style={styles.jobInfoHeader}>
                <View style={styles.jobIconContainer}>
                  <FileText size={24} color={colors.primary[600]} />
                </View>
                <View style={{ flex: 1 }}>
                  <Typography variant="h2" style={styles.jobTitle}>
                    {data.job_title ?? 'Başvuru'}
                  </Typography>
                  <Typography variant="body" style={styles.hospitalName}>
                    {data.hospital_name ?? 'Kurum bilgisi yok'}
                  </Typography>
                  {data.city_name && (
                    <Typography variant="caption" style={styles.cityText}>
                      📍 {data.city_name}
                    </Typography>
                  )}
                </View>
              </View>
              
              <View style={styles.modalDivider} />
              
              <View style={styles.modalInfoRow}>
                <View style={styles.modalInfoItem}>
                  <Typography variant="caption" style={styles.modalInfoLabel}>
                    Durum
                  </Typography>
                  <Badge 
                    variant={
                      data.status?.toLowerCase() === 'kabul edildi' ? 'success' :
                      data.status?.toLowerCase() === 'red edildi' ? 'error' :
                      data.status?.toLowerCase() === 'inceleniyor' ? 'warning' :
                      'primary'
                    }
                    size="sm"
                  >
                    {data.status ?? 'Durum yok'}
                  </Badge>
                </View>
                <View style={styles.modalInfoItem}>
                  <Typography variant="caption" style={styles.modalInfoLabel}>
                    Başvuru Tarihi
                  </Typography>
                  <Typography variant="body" style={styles.modalInfoValue}>
                    {new Date(data.created_at).toLocaleDateString('tr-TR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </Typography>
                </View>
              </View>

              {/* Job Details Grid */}
              {(data.employment_type || data.min_experience_years !== null || data.specialty_name) && (
                <>
                  <View style={styles.modalDivider} />
                  <View style={styles.jobDetailsGrid}>
                    {data.employment_type && (
                      <View style={styles.jobDetailItem}>
                        <Typography variant="caption" style={styles.modalInfoLabel}>
                          Çalışma Tipi
                        </Typography>
                        <Typography variant="body" style={styles.modalInfoValue}>
                          {data.employment_type}
                        </Typography>
                      </View>
                    )}
                    {data.min_experience_years !== null && data.min_experience_years !== undefined && (
                      <View style={styles.jobDetailItem}>
                        <Typography variant="caption" style={styles.modalInfoLabel}>
                          Min. Deneyim
                        </Typography>
                        <Typography variant="body" style={styles.modalInfoValue}>
                          {data.min_experience_years} yıl
                        </Typography>
                      </View>
                    )}
                    {data.specialty_name && (
                      <View style={styles.jobDetailItem}>
                        <Typography variant="caption" style={styles.modalInfoLabel}>
                          Uzmanlık
                        </Typography>
                        <Typography variant="body" style={styles.modalInfoValue}>
                          {data.specialty_name}
                        </Typography>
                        {data.subspecialty_name && (
                          <Typography variant="caption" style={styles.subspecialtyText}>
                            {data.subspecialty_name}
                          </Typography>
                        )}
                      </View>
                    )}
                  </View>
                </>
              )}
            </Card>

            {/* Job Description */}
            {data.description && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconContainer}>
                    <FileText size={18} color={colors.primary[600]} />
                  </View>
                  <Typography variant="h4" style={styles.sectionTitle}>
                    İş Tanımı
                  </Typography>
                </View>
                <Card variant="outlined" padding="lg">
                  <Typography variant="body" style={styles.coverLetterText}>
                    {data.description}
                  </Typography>
                </Card>
              </View>
            )}

            {/* Cover Letter */}
            {data.cover_letter && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconContainer}>
                    <FileText size={18} color={colors.primary[600]} />
                  </View>
                  <Typography variant="h4" style={styles.sectionTitle}>
                    Ön Yazınız
                  </Typography>
                </View>
                <Card variant="outlined" padding="lg">
                  <Typography variant="body" style={styles.coverLetterText}>
                    {data.cover_letter}
                  </Typography>
                </Card>
              </View>
            )}

            {/* Hospital Info */}
            {(data.hospital_address || data.hospital_phone || data.hospital_email || data.hospital_about) && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconContainer}>
                    <Building2 size={18} color={colors.primary[600]} />
                  </View>
                  <Typography variant="h4" style={styles.sectionTitle}>
                    Hastane Bilgileri
                  </Typography>
                </View>
                <Card variant="outlined" padding="lg">
                  {data.hospital_about && (
                    <Typography variant="body" style={styles.hospitalAboutText}>
                      {data.hospital_about}
                    </Typography>
                  )}
                  {(data.hospital_address || data.hospital_phone || data.hospital_email) && (
                    <View style={{ gap: spacing.sm }}>
                      {data.hospital_address && (
                        <View style={styles.hospitalContactRow}>
                          <MapPin size={14} color={colors.text.secondary} />
                          <Typography variant="caption" style={styles.hospitalContactText}>
                            {data.hospital_address}
                          </Typography>
                        </View>
                      )}
                      {data.hospital_phone && (
                        <View style={styles.hospitalContactRow}>
                          <Phone size={14} color={colors.text.secondary} />
                          <Typography variant="caption" style={styles.hospitalContactText}>
                            {data.hospital_phone}
                          </Typography>
                        </View>
                      )}
                      {data.hospital_email && (
                        <View style={styles.hospitalContactRow}>
                          <Mail size={14} color={colors.text.secondary} />
                          <Typography variant="caption" style={styles.hospitalContactText}>
                            {data.hospital_email}
                          </Typography>
                        </View>
                      )}
                    </View>
                  )}
                </Card>
              </View>
            )}

            {/* Hospital Notes */}
            {data.notes && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionIconContainer, { backgroundColor: colors.warning[50] }]}>
                    <AlertCircle size={18} color={colors.warning[600]} />
                  </View>
                  <Typography variant="h4" style={styles.sectionTitle}>
                    Hastane Notu
                  </Typography>
                </View>
                <Card variant="outlined" padding="lg" style={styles.notesCard}>
                  <Typography variant="body" style={styles.notesText}>
                    {data.notes}
                  </Typography>
                </Card>
              </View>
            )}

            {/* Withdraw Button */}
            {canWithdraw && (
              <Button
                label="Başvuruyu Geri Çek"
                variant="outline"
                onPress={handleWithdraw}
                loading={withdrawMutation.isPending}
                fullWidth
                size="lg"
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
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  const { data: statuses = [] } = useQuery({
    queryKey: ['lookup', 'application-statuses'],
    queryFn: lookupService.getApplicationStatuses,
  });

  const query = useApplications({ status: selectedStatus });

  // İngilizce API değerini Türkçe'ye çevir (veritabanındaki değerlerle eşleşmeli)
  const getStatusDisplayName = (apiValue: string): string => {
    if (!apiValue) return 'Tüm Başvurular';
    const mapping: Record<string, string> = {
      'pending': 'Başvuruldu',
      'reviewing': 'İnceleniyor',
      'approved': 'Kabul Edildi',
      'rejected': 'Red Edildi',
      'withdrawn': 'Geri Çekildi',
    };
    return mapping[apiValue] || apiValue;
  };

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
    setShowFilterSheet(true);
  }, []);

  const handleApplyFilters = useCallback(() => {
    setShowFilterSheet(false);
    query.refetch();
  }, [query]);

  const handleResetFilters = useCallback(() => {
    setSelectedStatus('');
    setShowFilterSheet(false);
    query.refetch();
  }, [query]);

  const hasActiveFilter = selectedStatus !== '';

  const renderContent = () => (
    <View style={styles.container}>
      {/* Modern Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <FileText size={28} color={colors.success[600]} />
          </View>
          <View style={styles.headerText}>
            <Typography variant="h2" style={styles.headerTitle}>
              Başvurularım
            </Typography>
            <Typography variant="caption" style={styles.headerSubtitle}>
              {applications.length} başvuru takip ediliyor
            </Typography>
          </View>
        </View>
        {hasActiveFilter && (
          <TouchableOpacity 
            style={styles.clearFilterButton}
            onPress={handleResetFilters}
          >
            <X size={16} color={colors.error[600]} />
          </TouchableOpacity>
        )}
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, styles.pendingIcon]}>
            <Clock size={18} color={colors.warning[700]} />
          </View>
          <Typography variant="caption" style={styles.statLabel}>
            Beklemede
          </Typography>
          <Typography variant="h3" style={styles.statValue}>
            {applications.filter(a => a.status?.toLowerCase() === 'başvuruldu').length}
          </Typography>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, styles.acceptedIcon]}>
            <CheckCircle size={18} color={colors.success[700]} />
          </View>
          <Typography variant="caption" style={styles.statLabel}>
            Kabul Edilen
          </Typography>
          <Typography variant="h3" style={styles.statValue}>
            {applications.filter(a => a.status?.toLowerCase() === 'kabul edildi').length}
          </Typography>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.statIconContainer, styles.reviewedIcon]}>
            <Eye size={18} color={colors.primary[700]} />
          </View>
          <Typography variant="caption" style={styles.statLabel}>
            İncelenen
          </Typography>
          <Typography variant="h3" style={styles.statValue}>
            {applications.filter(a => a.status?.toLowerCase() === 'inceleniyor').length}
          </Typography>
        </View>
      </View>

      {/* Filter Button */}
      <TouchableOpacity 
        style={[styles.filterButton, hasActiveFilter && styles.filterButtonActive]}
        onPress={openFilters}
      >
        <Filter size={20} color={hasActiveFilter ? colors.background.primary : colors.primary[600]} />
        <Typography 
          variant="body" 
          style={hasActiveFilter ? styles.filterButtonTextActive : styles.filterButtonText}
        >
          {getStatusDisplayName(selectedStatus)}
        </Typography>
        {hasActiveFilter && (
          <View style={styles.filterBadge}>
            <Typography variant="caption" style={styles.filterBadgeText}>
              1
            </Typography>
          </View>
        )}
      </TouchableOpacity>

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
          !query.isLoading && !query.isError ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <FileText size={64} color={colors.neutral[300]} />
              </View>
              <Typography variant="h3" style={styles.emptyTitle}>
                {hasActiveFilter ? 'Başvuru Bulunamadı' : 'Henüz Başvuru Yok'}
              </Typography>
              <Typography variant="body" style={styles.emptyText}>
                {hasActiveFilter 
                  ? 'Bu durumda başvuru bulunmuyor'
                  : 'Yeni ilanlara başvurarak kariyer yolculuğuna başla'}
              </Typography>
              {hasActiveFilter && (
                <TouchableOpacity 
                  style={styles.emptyButton}
                  onPress={handleResetFilters}
                >
                  <Typography variant="body" style={styles.emptyButtonText}>
                    Tüm Başvuruları Göster
                  </Typography>
                </TouchableOpacity>
              )}
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
  },
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
    backgroundColor: colors.success[50],
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
  clearFilterButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.error[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.background.primary,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  pendingIcon: {
    backgroundColor: colors.warning[100],
  },
  acceptedIcon: {
    backgroundColor: colors.success[100],
  },
  reviewedIcon: {
    backgroundColor: colors.primary[100],
  },
  statLabel: {
    color: colors.text.secondary,
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.primary[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary[200],
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  filterButtonText: {
    flex: 1,
    color: colors.primary[700],
    fontWeight: '600',
  },
  filterButtonTextActive: {
    color: colors.background.primary,
  },
  modalHeaderTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
  },
  modalLoaderText: {
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  errorIcon: {
    marginBottom: spacing.md,
  },
  errorTitle: {
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  errorText: {
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  jobInfoCard: {
    marginTop: spacing.md,
  },
  jobInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  jobIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  hospitalName: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  modalDivider: {
    height: 1,
    backgroundColor: colors.neutral[100],
    marginVertical: spacing.md,
  },
  modalInfoRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  modalInfoItem: {
    flex: 1,
    gap: spacing.xs,
  },
  modalInfoLabel: {
    color: colors.text.secondary,
    fontSize: 11,
  },
  modalInfoValue: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverLetterText: {
    color: colors.text.primary,
    lineHeight: 22,
  },
  notesCard: {
    backgroundColor: colors.warning[50],
    borderColor: colors.warning[200],
  },
  notesText: {
    color: colors.text.primary,
    lineHeight: 22,
  },
  cityText: {
    color: colors.text.secondary,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  jobDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  jobDetailItem: {
    flex: 1,
    minWidth: '45%',
  },
  subspecialtyText: {
    color: colors.primary[600],
    fontSize: 11,
    marginTop: 2,
  },
  hospitalAboutText: {
    color: colors.text.primary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  hospitalContactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  hospitalContactText: {
    color: colors.text.secondary,
    fontSize: 12,
    flex: 1,
  },
  filterBadge: {
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
  loader: {
    paddingVertical: spacing['5xl'],
    alignItems: 'center',
  },
  listLoader: {
    marginVertical: spacing.lg,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing['3xl'],
    gap: spacing.md,
  },
  backButtonContainer: {
    marginBottom: spacing.md,
  },
  modalHeaderInline: {
    marginBottom: spacing.lg,
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
