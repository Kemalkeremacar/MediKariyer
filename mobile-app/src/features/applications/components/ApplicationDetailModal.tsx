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
import { useApplicationDetail } from '../hooks/useApplicationDetail';
import { useWithdrawApplication } from '../hooks/useWithdrawApplication';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from '@/utils/date';

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

  // Sadece "Başvuruldu" (status_id = 1) durumundaki başvurular geri çekilebilir
  const canWithdraw = (data as any)?.status_id === 1 && !withdrawMutation.isPending;

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

            {/* Başvuru Bilgileri */}
            <Card variant="elevated" padding="lg" style={styles.infoCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardIconContainer}>
                  <Ionicons name="calendar" size={20} color={colors.primary[600]} />
                </View>
                <Typography variant="h3" style={styles.cardTitle}>
                  Başvuru Bilgileri
                </Typography>
              </View>
              <View style={styles.cardDivider} />
              <View style={styles.cardInfoRow}>
                <View style={styles.cardInfoItem}>
                  <Typography variant="caption" style={styles.cardInfoLabel}>
                    Başvuru Tarihi
                  </Typography>
                  <Typography variant="body" style={styles.cardInfoValue}>
                    {formatDate(data.created_at)}
                  </Typography>
                </View>
                <View style={styles.cardInfoItem}>
                  <Typography variant="caption" style={styles.cardInfoLabel}>
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
              </View>
            </Card>

            {/* İş İlanı Bilgileri */}
            <Card variant="elevated" padding="lg" style={styles.infoCard}>
              <View style={styles.cardHeader}>
                <View style={styles.cardIconContainer}>
                  <Ionicons name="briefcase" size={20} color={colors.primary[600]} />
                </View>
                <Typography variant="h3" style={styles.cardTitle}>
                  İş İlanı Bilgileri
                </Typography>
              </View>
              <View style={styles.cardDivider} />
              <View style={styles.jobDetailsGrid}>
                <View style={styles.jobDetailItem}>
                  <Typography variant="caption" style={styles.cardInfoLabel}>
                    İlan Başlığı
                  </Typography>
                  <Typography variant="body" style={styles.cardInfoValue}>
                    {data.job_title ?? 'İlan başlığı yok'}
                  </Typography>
                </View>
                <View style={styles.jobDetailItem}>
                  <Typography variant="caption" style={styles.cardInfoLabel}>
                    Hastane
                  </Typography>
                  <Typography variant="body" style={styles.cardInfoValue}>
                    {data.hospital_name ?? 'Kurum bilgisi yok'}
                  </Typography>
                </View>
                {data.city_name && (
                  <View style={styles.jobDetailItem}>
                    <Typography variant="caption" style={styles.cardInfoLabel}>
                      Şehir
                    </Typography>
                    <Typography variant="body" style={styles.cardInfoValue}>
                      {data.city_name}
                    </Typography>
                  </View>
                )}
                {data.specialty_name && (
                  <View style={styles.jobDetailItem}>
                    <Typography variant="caption" style={styles.cardInfoLabel}>
                      Uzmanlık Alanı
                    </Typography>
                    <Typography variant="body" style={styles.cardInfoValue}>
                      {data.specialty_name}
                    </Typography>
                    {data.subspecialty_name && (
                      <Typography variant="caption" style={styles.subspecialtyText}>
                        Yan Dal: {data.subspecialty_name}
                      </Typography>
                    )}
                  </View>
                )}
                {data.employment_type && (
                  <View style={styles.jobDetailItem}>
                    <Typography variant="caption" style={styles.cardInfoLabel}>
                      Çalışma Türü
                    </Typography>
                    <Typography variant="body" style={styles.cardInfoValue}>
                      {data.employment_type}
                    </Typography>
                  </View>
                )}
                {data.min_experience_years !== null &&
                  data.min_experience_years !== undefined && (
                    <View style={styles.jobDetailItem}>
                      <Typography variant="caption" style={styles.cardInfoLabel}>
                        Min. Deneyim
                      </Typography>
                      <Typography variant="body" style={styles.cardInfoValue}>
                        {data.min_experience_years} yıl
                      </Typography>
                    </View>
                  )}
              </View>
            </Card>

            {/* İş Tanımı */}
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
                  <Typography variant="body" style={styles.descriptionText}>
                    {data.description}
                  </Typography>
                </Card>
              </View>
            )}

            {/* Ön Yazı */}
            {data.cover_letter && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionIconContainer}>
                    <Ionicons name="document-text" size={18} color={colors.primary[600]} />
                  </View>
                  <Typography variant="h3" style={styles.sectionTitle}>
                    Ön Yazı
                  </Typography>
                </View>
                <Card variant="outlined" padding="lg">
                  <Typography variant="body" style={styles.coverLetterText}>
                    {data.cover_letter}
                  </Typography>
                </Card>
              </View>
            )}

            {/* Hastane Notu - Dinamik olarak en altta görünür (hastane işlem yaptığında) */}
            {data.notes && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionIconContainer, { backgroundColor: colors.primary[50] }]}>
                    <Ionicons name="checkmark-circle" size={18} color={colors.primary[600]} />
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
                variant="destructive"
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
  infoCard: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  cardIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontWeight: '600',
    color: colors.text.primary,
    fontSize: 16,
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.border.light,
    marginBottom: spacing.md,
  },
  cardInfoRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  cardInfoItem: {
    flex: 1,
    gap: spacing.xs,
  },
  cardInfoLabel: {
    color: colors.text.secondary,
    fontSize: 11,
  },
  cardInfoValue: {
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
  descriptionText: {
    color: colors.text.primary,
    lineHeight: 22,
  },
  coverLetterText: {
    color: colors.text.primary,
    lineHeight: 22,
  },
  notesCard: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[200],
  },
  notesText: {
    color: colors.text.primary,
    lineHeight: 22,
  },
  withdrawButton: {
    marginTop: spacing.xl,
  },
});
