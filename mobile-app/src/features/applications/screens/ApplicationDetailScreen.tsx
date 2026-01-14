/**
 * @file ApplicationDetailScreen.tsx
 * @description Başvuru detay ekranı - Başvuru bilgilerini gösterir
 * @author MediKariyer Development Team
 * @version 2.0.0
 * 
 * **ÖZELLİKLER:**
 * - Başvuru bilgileri (durum, tarih)
 * - İş ilanı bilgileri (başlık, hastane, şehir, branş)
 * - İş tanımı
 * - Ön yazı (cover letter)
 * - Hastane notu (varsa)
 * - Başvuru geri çekme (sadece "Başvuruldu" durumunda)
 * 
 * **KULLANIM:**
 * ApplicationsScreen'den navigation ile açılır
 * 
 * **REFACTOR:** Modal'dan screen'e dönüştürüldü (scroll sorunları çözümü)
 */

import React from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, spacing } from '@/theme';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Screen } from '@/components/layout/Screen';
import { GradientHeader } from '@/components/composite/GradientHeader';
import { useApplicationDetail } from '../hooks/useApplicationDetail';
import { useWithdrawApplication } from '../hooks/useWithdrawApplication';
import { Ionicons } from '@expo/vector-icons';
import { formatDate } from '@/utils/date';
import type { ApplicationsStackParamList } from '@/navigation/types';

type ApplicationDetailScreenNavigationProp = NativeStackNavigationProp<
  ApplicationsStackParamList,
  'ApplicationDetail'
>;

type RouteParams = {
  applicationId: number;
};

export const ApplicationDetailScreen = () => {
  const navigation = useNavigation<ApplicationDetailScreenNavigationProp>();
  const route = useRoute();
  const params = route.params as RouteParams | undefined;
  const applicationId = params?.applicationId ?? null;

  const { data, isLoading, isError, refetch } = useApplicationDetail(
    applicationId,
    applicationId !== null
  );
  const withdrawMutation = useWithdrawApplication();

  const handleWithdraw = () => {
    if (applicationId) {
      withdrawMutation.mutate(
        { applicationId },
        {
          onSuccess: () => {
            navigation.goBack();
          },
        }
      );
    }
  };

  const handleWithdrawPress = () => {
    Alert.alert(
      'Başvuruyu Geri Çek',
      'Bu başvuruyu geri çekmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      [
        {
          text: 'İptal',
          style: 'cancel',
        },
        {
          text: 'Geri Çek',
          style: 'destructive',
          onPress: handleWithdraw,
        },
      ]
    );
  };

  // Sadece "Başvuruldu" (status_id = 1) durumundaki başvurular geri çekilebilir
  const canWithdraw = data?.status_id === 1 && !withdrawMutation.isPending;

  // applicationId yoksa hata göster
  if (!applicationId) {
    return (
      <Screen scrollable={false}>
        <GradientHeader
          title="Başvuru Detayı"
          subtitle="Hata"
          icon={<Ionicons name="document-text" size={28} color="#FFFFFF" />}
          variant="primary"
          iconColorPreset="blue"
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.errorContainer}>
          <View style={styles.errorIcon}>
            <Ionicons name="alert-circle" size={48} color={colors.error[600]} />
          </View>
          <Typography variant="h3" style={styles.errorTitle}>
            Başvuru Bulunamadı
          </Typography>
          <Typography variant="body" style={styles.errorText}>
            Başvuru bilgileri yüklenemedi. Lütfen tekrar deneyin.
          </Typography>
          <Button
            label="Geri Dön"
            onPress={() => navigation.goBack()}
            variant="primary"
            size="lg"
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scrollable={false}>
      <GradientHeader
        title="Başvuru Detayı"
        subtitle={data?.job_title || 'Başvuru bilgileri'}
        icon={<Ionicons name="document-text" size={28} color="#FFFFFF" />}
        variant="primary"
        iconColorPreset="blue"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      {isLoading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary[600]} />
          <Typography variant="body" style={styles.loaderText}>
            Yükleniyor...
          </Typography>
        </View>
      )}

      {isError && (
        <View style={styles.errorContainer}>
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
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={true}
          bounces={true}
        >
          {/* İlan Durumu Uyarısı */}
          {(data.is_job_deleted || data.is_hospital_active === false) && (
            <Card variant="outlined" padding="lg" style={styles.warningCard}>
              <View style={styles.warningContent}>
                <View style={styles.warningIconContainer}>
                  <Ionicons 
                    name="warning" 
                    size={24} 
                    color={colors.warning[600]} 
                  />
                </View>
                <View style={styles.warningTextContainer}>
                  <Typography variant="h3" style={styles.warningTitle}>
                    {data.is_job_deleted ? 'İlan Yayından Kaldırıldı' : 'Hastane Pasif'}
                  </Typography>
                  <Typography variant="body" style={styles.warningText}>
                    {data.is_job_deleted 
                      ? 'Bu iş ilanı yayından kaldırılmıştır. Başvurunuz hala geçerlidir ve durumunu takip edebilirsiniz.'
                      : 'Bu hastane şu anda pasif durumdadır. Başvurunuz hala geçerlidir ve durumunu takip edebilirsiniz.'}
                  </Typography>
                </View>
              </View>
            </Card>
          )}

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
            <View style={styles.jobInfoGrid}>
              {data.job_title && (
                <View style={styles.jobInfoItem}>
                  <Typography variant="caption" style={styles.jobInfoLabel}>
                    İlan Başlığı
                  </Typography>
                  <Typography variant="body" style={styles.jobInfoValue}>
                    {data.job_title}
                  </Typography>
                </View>
              )}
              {data.hospital_name && (
                <View style={styles.jobInfoItem}>
                  <Typography variant="caption" style={styles.jobInfoLabel}>
                    Hastane
                  </Typography>
                  <Typography variant="body" style={styles.jobInfoValue}>
                    {data.hospital_name}
                  </Typography>
                </View>
              )}
              {data.specialty_name && (
                <View style={styles.jobInfoItem}>
                  <Typography variant="caption" style={styles.jobInfoLabel}>
                    Uzmanlık Alanı
                  </Typography>
                  <Typography variant="body" style={styles.jobInfoValue}>
                    {data.specialty_name}
                  </Typography>
                </View>
              )}
              {data.subspecialty_name && (
                <View style={styles.jobInfoItem}>
                  <Typography variant="caption" style={styles.jobInfoLabel}>
                    Yan Dal
                  </Typography>
                  <Typography variant="body" style={styles.jobInfoValue}>
                    {data.subspecialty_name}
                  </Typography>
                </View>
              )}
              {data.employment_type && (
                <View style={styles.jobInfoItem}>
                  <Typography variant="caption" style={styles.jobInfoLabel}>
                    Çalışma Türü
                  </Typography>
                  <Typography variant="body" style={styles.jobInfoValue}>
                    {data.employment_type}
                  </Typography>
                </View>
              )}
              {data.min_experience_years !== null &&
                data.min_experience_years !== undefined && (
                  <View style={styles.jobInfoItem}>
                    <Typography variant="caption" style={styles.jobInfoLabel}>
                      Min. Deneyim
                    </Typography>
                    <Typography variant="body" style={styles.jobInfoValue}>
                      {data.min_experience_years} yıl
                    </Typography>
                  </View>
                )}
              {data.city_name && (
                <View style={[styles.jobInfoItem, styles.jobInfoItemLast]}>
                  <Typography variant="caption" style={styles.jobInfoLabel}>
                    Şehir
                  </Typography>
                  <Typography variant="body" style={styles.jobInfoValue}>
                    {data.city_name}
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

          {/* Hastane Notu */}
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
        </ScrollView>
      )}

      {/* Alt Butonlar */}
      {data && canWithdraw && (
        <View style={styles.bottomButtons}>
          <Button
            label={withdrawMutation.isPending ? 'İşleniyor...' : 'Başvuruyu Geri Çek'}
            variant="destructive"
            onPress={handleWithdrawPress}
            style={styles.bottomWithdrawButton}
            size="sm"
            loading={withdrawMutation.isPending}
            disabled={withdrawMutation.isPending}
            fullWidth
          />
        </View>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
    gap: spacing.md,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  loaderText: {
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['3xl'],
    gap: spacing.md,
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
  jobInfoGrid: {
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  jobInfoItem: {
    gap: spacing.xs,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  jobInfoItemLast: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },
  jobInfoLabel: {
    color: colors.text.secondary,
    fontSize: 12,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  jobInfoValue: {
    color: colors.text.primary,
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 22,
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
  warningCard: {
    backgroundColor: colors.warning[50],
    borderColor: colors.warning[200],
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  warningContent: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  warningIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.warning[100],
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  warningTextContainer: {
    flex: 1,
    gap: spacing.xs,
  },
  warningTitle: {
    color: colors.warning[700],
    fontWeight: '600',
    fontSize: 15,
  },
  warningText: {
    color: colors.warning[800],
    fontSize: 13,
    lineHeight: 18,
  },
  bottomButtons: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  bottomWithdrawButton: {
    minHeight: 44,
  },
});
