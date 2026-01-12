/**
 * @file ApplicationDetailModal.tsx
 * @description Başvuru detay modal bileşeni - Başvuru bilgilerini gösterir
 * @author MediKariyer Development Team
 * @version 1.0.0
 * 
 * **ÖZELLİKLER:**
 * - Başvuru bilgileri (durum, tarih)
 * - İş ilanı bilgileri (başlık, hastane, şehir, branş)
 * - İş tanımı
 * - Ön yazı (cover letter)
 * - Hastane notu (varsa)
 * - Fotoğraf karşılaştırması (mevcut vs yeni)
 * - Başvuru geri çekme (sadece "Başvuruldu" durumunda)
 * 
 * **KULLANIM:**
 * ApplicationsScreen'den açılır, başvuru detaylarını gösterir.
 * 
 * **NOT:** Root-level BottomSheetModalProvider kullanır (App.tsx)
 * 
 * **REFACTOR:** ApplicationsScreen'den ayrıldı (TD-002)
 */

import React, { useState } from 'react';
import {
  StyleSheet,
  Modal as RNModal,
  ScrollView,
  View,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useAlertHelpers } from '@/utils/alertHelpers';
import { colors, spacing, borderRadius, shadows, typography } from '@/theme';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
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
  const [withdrawReason, setWithdrawReason] = useState('');
  const alert = useAlertHelpers();
  const { data, isLoading, isError, refetch } = useApplicationDetail(
    applicationId,
    visible
  );
  const withdrawMutation = useWithdrawApplication();

  const handleWithdraw = () => {
    if (applicationId) {
      withdrawMutation.mutate(
        { applicationId, reason: withdrawReason },
        {
          onSuccess: () => {
            setWithdrawReason(''); // Clear reason on successful withdrawal
            onClose(); // Close the detail modal after successful withdrawal
            refetch(); // Refresh the applications list
          },
        }
      );
    }
  };

  const handleWithdrawPress = () => {
    alert.confirmDestructive(
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
    <RNModal 
      visible={visible} 
      transparent
      animationType="slide" 
      onRequestClose={onClose}
      statusBarTranslucent={true}
      {...(Platform.OS === 'ios' ? { presentationStyle: 'overFullScreen' as const } : {})}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity 
          style={styles.modalCard}
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
        >
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
            <>
              <View style={styles.modalHeader}>
                <Typography variant="h2" style={styles.modalHeaderTitle}>
                  Başvuru Detayı
                </Typography>
              </View>
              
              <ScrollView 
                style={styles.modalBody}
                contentContainerStyle={styles.modalContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
              >

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
                  <>
                    {/* Withdrawal Reason Input */}
                    <Card variant="outlined" padding="lg" style={styles.reasonCard}>
                      <View style={styles.reasonHeader}>
                        <View style={styles.reasonIconContainer}>
                          <Ionicons name="chatbox-ellipses" size={18} color={colors.primary[600]} />
                        </View>
                        <Typography variant="h3" style={styles.reasonTitle}>
                          Geri Çekme Nedeni (Opsiyonel)
                        </Typography>
                      </View>
                      <Input
                        placeholder="Neden geri çekiyorsunuz?"
                        value={withdrawReason}
                        onChangeText={setWithdrawReason}
                        multiline
                        numberOfLines={3}
                        maxLength={500}
                        helperText="Bu bilgi hastane ile paylaşılacaktır."
                        style={styles.reasonInput}
                      />
                    </Card>
                    
                    <Button
                      label="Başvuruyu Geri Çek"
                      variant="destructive"
                      onPress={handleWithdrawPress}
                      fullWidth
                      size="lg"
                      style={styles.withdrawButton}
                    />
                  </>
                )}
              </ScrollView>
              
              <View style={styles.modalFooter}>
                <Button
                  label="Kapat"
                  variant="outline"
                  onPress={onClose}
                  style={styles.cancelButton}
                  size="lg"
                  fullWidth
                />
              </View>
            </>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    ...shadows.md,
    maxHeight: '90%',
    flex: 1,
  },
  modalLoader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 300,
  },
  modalLoaderText: {
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  modalHeader: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalHeaderTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  modalBody: {
    flex: 1,
    padding: spacing.lg,
  },
  modalContent: {
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  modalFooter: {
    padding: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    backgroundColor: colors.background.primary,
  },
  cancelButton: {
    minHeight: 56,
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
  reasonCard: {
    marginTop: spacing.xl,
    backgroundColor: colors.background.secondary,
    borderColor: colors.border.light,
  },
  reasonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  reasonIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  reasonTitle: {
    fontWeight: '600',
    color: colors.text.primary,
    fontSize: 16,
  },
  reasonInput: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: spacing.md,
  },
  withdrawButton: {
    marginTop: spacing.xl,
  },
});
