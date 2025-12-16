/**
 * APPLICATIONS SCREEN - Modern Başvurularım Ekranı
 */

import React, { useCallback, useMemo, useState } from 'react';
import {
  StyleSheet,
  FlatList,
  RefreshControl,
  Modal as RNModal,
  ScrollView,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { showAlert } from '@/utils/alert';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing } from '@/theme';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { BackButton } from '@/components/ui/BackButton';
import { Modal } from '@/components/ui/Modal';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Screen } from '@/components/layout/Screen';
import { IconButton } from '@/components/ui/IconButton';
import { SearchBar } from '@/components/ui/SearchBar';
import {
  ApplicationFilterSheet,
  ApplicationFilters,
} from '@/components/composite/ApplicationFilterSheet';
import { ApplicationCard } from '@/components/composite/ApplicationCard';
import { StatCard } from '@/components/composite/StatCard';
import { TimelineItem } from '@/components/composite/TimelineItem';
import { useApplications } from '../hooks/useApplications';
import { useApplicationDetail } from '../hooks/useApplicationDetail';
import { useWithdrawApplication } from '../hooks/useWithdrawApplication';
import { Ionicons } from '@expo/vector-icons';

// Status display mapping
const STATUS_DISPLAY: Record<string, string> = {
  pending: 'Başvuruldu',
  reviewing: 'İnceleniyor',
  approved: 'Kabul Edildi',
  rejected: 'Red Edildi',
  withdrawn: 'Geri Çekildi',
};


const DetailsModal = ({
  applicationId,
  visible,
  onClose,
}: {
  applicationId: number | null;
  visible: boolean;
  onClose: () => void;
}) => {
  const { data, isLoading, isError, refetch } = useApplicationDetail(
    applicationId,
    visible
  );
  const withdrawMutation = useWithdrawApplication();

  const handleWithdraw = () => {
    if (applicationId) {
      withdrawMutation.mutate(applicationId, {
        onSuccess: () => {
          onClose(); // Close the detail modal after successful withdrawal
          refetch(); // Refresh the applications list
        },
      });
    }
  };

  const handleWithdrawPress = () => {
    showAlert.confirmDestructive(
      'Başvuruyu Geri Çek',
      'Bu başvuruyu geri çekmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      handleWithdraw,
      undefined,
      'Geri Çek'
    );
  };

  const canWithdraw =
    data?.status?.toLowerCase() === 'başvuruldu' && !withdrawMutation.isPending;

  return (
    <RNModal visible={visible} animationType="slide" onRequestClose={onClose}>
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
              <Ionicons name="close-circle" size={48} color={colors.error[600]} />
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
          <ScrollView 
            contentContainerStyle={styles.modalContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.backButtonContainer}>
              <BackButton onPress={onClose} />
            </View>

            <View style={styles.modalHeaderInline}>
              <Typography variant="h2" style={styles.modalHeaderTitle}>
                Başvuru Detayı
              </Typography>
            </View>

            <Card variant="elevated" padding="lg" style={styles.jobInfoCard}>
              <View style={styles.jobInfoHeader}>
                <View style={styles.jobIconContainer}>
                  <Ionicons name="document-text" size={24} color={colors.primary[600]} />
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
                      data.status?.toLowerCase() === 'kabul edildi'
                        ? 'success'
                        : data.status?.toLowerCase() === 'red edildi'
                        ? 'error'
                        : data.status?.toLowerCase() === 'inceleniyor'
                        ? 'warning'
                        : 'primary'
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
                      year: 'numeric',
                    })}
                  </Typography>
                </View>
              </View>

              {(data.employment_type ||
                data.min_experience_years !== null ||
                data.specialty_name) && (
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
                    {data.min_experience_years !== null &&
                      data.min_experience_years !== undefined && (
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

            {data.description && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconContainer}>
                    <Ionicons name="document-text" size={18} color={colors.primary[600]} />
                  </View>
                  <Typography variant="h3" style={styles.sectionTitle}>
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

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconContainer}>
                  <Ionicons name="time" size={18} color={colors.primary[600]} />
                </View>
                <Typography variant="h3" style={styles.sectionTitle}>
                  Başvuru Süreci
                </Typography>
              </View>
              <Card variant="outlined" padding="lg">
                <TimelineItem
                  title="Başvuru Gönderildi"
                  date={new Date(data.created_at).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'short',
                  })}
                  description="Başvurunuz başarıyla iletildi"
                  status="completed"
                  icon={<Ionicons name="checkmark-circle" size={16} color={colors.background.primary} />}
                />
                <TimelineItem
                  title={data.status || 'İnceleniyor'}
                  date={new Date(data.updated_at || data.created_at).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'short',
                  })}
                  description={
                    data.status?.toLowerCase() === 'kabul edildi'
                      ? 'Tebrikler! Başvurunuz kabul edildi'
                      : data.status?.toLowerCase() === 'red edildi'
                      ? 'Başvurunuz değerlendirildi'
                      : 'Başvurunuz inceleniyor'
                  }
                  status={
                    data.status?.toLowerCase() === 'kabul edildi' ||
                    data.status?.toLowerCase() === 'red edildi'
                      ? 'completed'
                      : 'current'
                  }
                  icon={
                    data.status?.toLowerCase() === 'kabul edildi' ? (
                      <Ionicons name="checkmark-circle" size={16} color={colors.background.primary} />
                    ) : data.status?.toLowerCase() === 'red edildi' ? (
                      <Ionicons name="close-circle" size={16} color={colors.background.primary} />
                    ) : (
                      <Ionicons name="time" size={16} color={colors.background.primary} />
                    )
                  }
                  isLast
                />
              </Card>
            </View>

            {data.cover_letter && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconContainer}>
                    <Ionicons name="document-text" size={18} color={colors.primary[600]} />
                  </View>
                  <Typography variant="h3" style={styles.sectionTitle}>
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

            {(data.hospital_address || data.hospital_phone || data.hospital_email || data.hospital_about) && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconContainer}>
                    <Ionicons name="business" size={18} color={colors.primary[600]} />
                  </View>
                  <Typography variant="h3" style={styles.sectionTitle}>
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
                          <Ionicons name="location" size={14} color={colors.text.secondary} />
                          <Typography variant="caption" style={styles.hospitalContactText}>
                            {data.hospital_address}
                          </Typography>
                        </View>
                      )}
                      {data.hospital_phone && (
                        <View style={styles.hospitalContactRow}>
                          <Ionicons name="call" size={14} color={colors.text.secondary} />
                          <Typography variant="caption" style={styles.hospitalContactText}>
                            {data.hospital_phone}
                          </Typography>
                        </View>
                      )}
                      {data.hospital_email && (
                        <View style={styles.hospitalContactRow}>
                          <Ionicons name="mail" size={14} color={colors.text.secondary} />
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

            {data.notes && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionIconContainer, { backgroundColor: colors.warning[50] }]}>
                    <Ionicons name="alert-circle" size={18} color={colors.warning[600]} />
                  </View>
                  <Typography variant="h3" style={styles.sectionTitle}>
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

            {canWithdraw && (
              <Button
                label="Başvuruyu Geri Çek"
                variant="outline"
                onPress={handleWithdrawPress}
                fullWidth
                size="lg"
                style={styles.withdrawButton}
              />
            )}
          </ScrollView>
        )}


      </View>
    </RNModal>
  );
};


export const ApplicationsScreen = () => {
  const [filters, setFilters] = useState<ApplicationFilters>({});
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const query = useApplications({ status: filters.status });

  const totalCount = useMemo(() => {
    return query.data?.pages?.[0]?.pagination?.total ?? 0;
  }, [query.data]);

  const applications = useMemo(() => {
    if (!query.data) return [];
    const pages = query.data.pages ?? [];
    const allApplications = pages.flatMap((page) => page.data);
    
    // Client-side search filter
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      return allApplications.filter((app) => 
        app.hospital_name?.toLowerCase().includes(lowerQuery) ||
        app.job_title?.toLowerCase().includes(lowerQuery)
      );
    }
    
    return allApplications;
  }, [query.data, searchQuery]);

  const stats = useMemo(() => {
    return {
      pending: applications.filter((a) => a.status?.toLowerCase() === 'başvuruldu').length,
      approved: applications.filter((a) => a.status?.toLowerCase() === 'kabul edildi').length,
      reviewing: applications.filter((a) => a.status?.toLowerCase() === 'inceleniyor').length,
    };
  }, [applications]);

  const loadMore = useCallback(() => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
  }, [query]);

  const handleApplyFilters = useCallback((newFilters: ApplicationFilters) => {
    setFilters(newFilters);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({});
  }, []);

  const hasActiveFilter = Boolean(filters.status);

  const getStatusDisplayName = (status?: string): string => {
    if (!status) return 'Tüm Başvurular';
    return STATUS_DISPLAY[status] || status;
  };

  const renderListHeader = () => (
    <>
      {/* Premium Gradient Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        {/* Decorative Elements */}
        <View style={styles.headerDecoration}>
          <View style={styles.decorCircle1} />
          <View style={styles.decorCircle2} />
        </View>
        
        <View style={styles.headerContent}>
          <View style={styles.headerIconWrapper}>
            <LinearGradient
              colors={['#F59E0B', '#D97706']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerIconGradient}
            >
              <Ionicons name="document-text-sharp" size={28} color="#FFFFFF" />
            </LinearGradient>
          </View>
          <Typography variant="h1" style={styles.headerTitle}>
            Başvurularım
          </Typography>
          <View style={styles.headerSubtitleContainer}>
            <View style={styles.headerDot} />
            <Typography variant="body" style={styles.headerSubtitle}>
              {totalCount} başvuru
            </Typography>
            <View style={styles.headerDot} />
          </View>
        </View>
      </LinearGradient>

      {/* Modern Search & Filter */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Hastane veya pozisyon ara..."
          onClear={() => setSearchQuery('')}
          style={styles.searchBar}
        />
        <View style={styles.filterButtonWrapper}>
          <TouchableOpacity
            onPress={() => setShowFilterSheet(true)}
            style={[
              styles.filterButton,
              hasActiveFilter && styles.filterButtonActive,
            ]}
            activeOpacity={0.7}
          >
            <Ionicons
              name="filter"
              size={20}
              color={hasActiveFilter ? colors.background.primary : colors.primary[600]}
            />
          </TouchableOpacity>
          {hasActiveFilter && (
            <View style={styles.filterBadge}>
              <Typography variant="caption" style={styles.filterBadgeText}>
                1
              </Typography>
            </View>
          )}
        </View>
      </View>

      {/* Active Filter Chip */}
      {hasActiveFilter && (
        <View style={styles.activeFiltersContainer}>
          <View style={styles.activeFilterChip}>
            <Typography variant="body" style={styles.activeFilterText}>
              {getStatusDisplayName(filters.status)}
            </Typography>
            <TouchableOpacity onPress={() => setFilters({})}>
              <Ionicons name="close-circle" size={18} color={colors.primary[600]} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </>
  );

  const renderContent = () => (
    <View style={styles.container}>
      {query.isLoading ? (
        <View style={styles.skeletonContainer}>
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </View>
      ) : (
        <FlatList
          ListHeaderComponent={renderListHeader}
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
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            query.isFetchingNextPage ? (
              <View style={styles.listFooter}>
                <ActivityIndicator size="small" color={colors.primary[600]} />
                <Typography variant="caption" style={styles.footerText}>
                  Daha fazla başvuru yükleniyor...
                </Typography>
              </View>
            ) : applications.length > 0 && !query.hasNextPage ? (
              <View style={styles.listFooter}>
                <Typography variant="caption" style={styles.footerText}>
                  Tüm başvurular yüklendi ({applications.length}/{totalCount})
                </Typography>
              </View>
            ) : null
          }
          ListEmptyComponent={
            !query.isLoading && !query.isError ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="document-text" size={64} color={colors.neutral[300]} />
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
                  <TouchableOpacity style={styles.emptyButton} onPress={handleResetFilters}>
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
      )}

      <DetailsModal
        applicationId={selectedApplicationId}
        visible={selectedApplicationId !== null}
        onClose={() => setSelectedApplicationId(null)}
      />

      <ApplicationFilterSheet
        visible={showFilterSheet}
        onClose={() => setShowFilterSheet(false)}
        filters={filters}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />
    </View>
  );

  return (
    <Screen
      scrollable={false}
      loading={query.isLoading}
      error={query.isError ? new Error('Başvurular yüklenemedi') : null}
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
  // Premium Gradient Header - STANDARD SIZE
  gradientHeader: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    paddingHorizontal: 0,
    marginBottom: spacing.md,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  headerDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  decorCircle1: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    top: -50,
    right: -30,
  },
  decorCircle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    bottom: -30,
    left: -20,
  },
  headerContent: {
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
    paddingHorizontal: spacing.lg,
  },
  headerIconWrapper: {
    marginBottom: spacing.sm,
  },
  headerIconGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  headerSubtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.background.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.background.primary,
  },
  searchBar: {
    flex: 1,
  },
  filterButtonWrapper: {
    position: 'relative',
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  filterButtonActive: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  activeFiltersContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primary[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary[100],
    alignSelf: 'flex-start',
  },
  activeFilterText: {
    color: colors.primary[700],
    fontWeight: '600',
    fontSize: 14,
  },
  filterBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.error[600],
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: colors.background.primary,
  },
  filterBadgeText: {
    color: colors.background.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  skeletonContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  listContent: {
    paddingBottom: spacing['4xl'],
  },
  listFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  footerText: {
    color: colors.text.secondary,
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
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  modalLoader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  modalLoaderText: {
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  modalContent: {
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  backButtonContainer: {
    marginBottom: spacing.md,
  },
  modalHeaderInline: {
    marginBottom: spacing.lg,
  },
  modalHeaderTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
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
  cityText: {
    color: colors.text.secondary,
    fontSize: 12,
    marginTop: spacing.xs,
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
  sectionTitle: {
    fontWeight: '600',
    color: colors.text.primary,
  },
  coverLetterText: {
    color: colors.text.primary,
    lineHeight: 22,
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
  notesCard: {
    backgroundColor: colors.warning[50],
    borderColor: colors.warning[200],
  },
  notesText: {
    color: colors.text.primary,
    lineHeight: 22,
  },
  withdrawButton: {
    marginTop: spacing.xl,
  },
  confirmModalContent: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  confirmIcon: {
    marginBottom: spacing.md,
  },
  confirmText: {
    textAlign: 'center',
    color: colors.text.secondary,
    marginBottom: spacing.xl,
  },
  confirmActions: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  confirmButton: {
    flex: 1,
  },
});
