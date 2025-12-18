/**
 * APPLICATION DETAIL MODAL - Başvuru Detay Modal Bileşeni
 * ApplicationsScreen'den ayrıldı (TD-002 refactor)
 */

import React from 'react';
import {
  StyleSheet,
  Modal as RNModal,
  ScrollView,
  View,
  ActivityIndicator,
} from 'react-native';
import { showAlert } from '@/utils/alert';
import { colors, spacing } from '@/theme';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { BackButton } from '@/components/ui/BackButton';
import { TimelineItem } from '@/components/composite/TimelineItem';
import { useApplicationDetail } from '../hooks/useApplicationDetail';
import { useWithdrawApplication } from '../hooks/useWithdrawApplication';
import { Ionicons } from '@expo/vector-icons';
import { formatDate, formatDayMonth } from '@/utils/date';

export interface ApplicationDetailModalProps {
  applicationId: number | null;
  visible: boolean;
  onClose: () => void;
}

export const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  applicationId,
  visible,
  onClose,
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
                    {formatDate(data.created_at)}
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
                  date={formatDayMonth(data.created_at)}
                  description="Başvurunuz başarıyla iletildi"
                  status="completed"
                  icon={<Ionicons name="checkmark-circle" size={16} color={colors.background.primary} />}
                />
                <TimelineItem
                  title={data.status || 'İnceleniyor'}
                  date={formatDayMonth(data.updated_at || data.created_at)}
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

const styles = StyleSheet.create({
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
});
