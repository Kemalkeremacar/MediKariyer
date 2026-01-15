/**
 * @file JobDetailScreen.tsx
 * @description İş ilanı detay ekranı - İlan bilgilerini görüntüleme ve başvuru yapma
 * @author MediKariyer Development Team
 * @version 1.0.0
 * 
 * **ÖNEMLİ ÖZELLİKLER:**
 * - İlan detaylarını görüntüleme (başlık, açıklama, hastane bilgileri)
 * - Başvuru yapma ve ön yazı ekleme
 * - Başvuru durumu kontrolü (başvuruldu/başvurulmadı)
 * - Kelime sayısı limiti (200 kelime)
 * - Haptic feedback ile kullanıcı deneyimi
 * 
 * **AKIŞ:**
 * 1. İlan detayları backend'den çekilir
 * 2. Kullanıcı başvuru yapabilir (ön yazı ile)
 * 3. Başvuru sonrası durum güncellenir
 * 4. Başvurulmuş ilanlarda "Başvurunuz Bulunuyor" gösterilir
 * 
 * **KRİTİK NOKTALAR:**
 * - Başvuru yapılmışsa tekrar başvuru yapılamaz
 * - Ön yazı 200 kelime ile sınırlıdır
 * - Başvuru sonrası cache güncellenir
 * - Haptic feedback ile başarılı/başarısız durumlar bildirilir
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Button } from '@/components/ui/Button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useToast } from '@/providers/ToastProvider';
import { Ionicons } from '@expo/vector-icons';
import { jobService } from '@/api/services/job.service';
import type { JobsStackParamList } from '@/navigation/types';
import { colors, spacing, borderRadius } from '@/theme';
import { Screen } from '@/components/layout/Screen';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { formatDate } from '@/utils/date';
import { handleApiError } from '@/utils/errorHandler';

type Props = NativeStackScreenProps<JobsStackParamList, 'JobDetail'>;

export const JobDetailScreen = ({ route, navigation }: Props) => {
  const { id } = route.params;
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');

  // Kelime sayısını hesapla
  const getWordCount = (text: string) => {
    if (!text || text.trim().length === 0) return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const MAX_WORDS = 200;
  const wordCount = getWordCount(coverLetter);

  const {
    data: job,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['jobDetail', id],
    queryFn: () => jobService.getJobDetail(id),
  });

  const applyMutation = useMutation({
    mutationFn: () =>
      jobService.applyToJob({
        jobId: id,
        coverLetter: coverLetter.trim() || undefined,
      }),
    onSuccess: () => {
      // Success haptic feedback for successful application
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      // Başarılı başvuru sonrası modal'ı kapat ve coverLetter'ı temizle
      setShowApplicationModal(false);
      setCoverLetter('');
      // Cache'i güncelle (butonu "Başvuruldu" yapmak için)
      queryClient.invalidateQueries({ queryKey: ['jobDetail', id] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      // Job detail'i yeniden çek
      refetch();
      showToast('Başvurunuz başarıyla iletildi', 'success');
    },
    onError: (error: Error) => {
      handleApiError(error, '/jobs/apply', showToast);
    },
  });

  const handleOpenApplicationModal = () => {
    setShowApplicationModal(true);
  };

  const handleCloseApplicationModal = () => {
    setShowApplicationModal(false);
    setCoverLetter('');
  };

  const handleApplicationSubmit = () => {
    applyMutation.mutate();
  };

  if (isLoading) {
    return (
      <Screen scrollable={false}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary[600]} />
        </View>
      </Screen>
    );
  }

  if (isError || !job) {
    return (
      <Screen scrollable={false}>
        <View style={[styles.centerContainer, { padding: spacing.lg }]}>
          <Typography variant="h3" style={{ marginBottom: spacing.md }}>
            İlan detayları yüklenemedi
          </Typography>
          <Button 
            label="Geri Dön" 
            variant="secondary" 
            onPress={() => navigation.goBack()} 
          />
        </View>
      </Screen>
    );
  }

  return (
    <Screen scrollable={false} contentContainerStyle={styles.container}>
      {/* Header - Sabit (ScrollView dışında) */}
      <LinearGradient
        colors={['#1E40AF', '#3B82F6']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        {/* Back + Title Row */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={22} color="#ffffff" />
          </TouchableOpacity>
          
          <View style={styles.headerTitleContainer}>
            <Typography variant="h3" style={styles.headerJobTitle} numberOfLines={1}>
              {job.title ?? 'İş İlanı'}
            </Typography>
            <Typography variant="caption" style={styles.headerHospital} numberOfLines={1}>
              {job.hospital_name ?? 'Kurum'}
            </Typography>
          </View>

          {job.is_applied && (
            <View style={styles.appliedDot}>
              <Ionicons name="checkmark-circle" size={20} color="#34D399" />
            </View>
          )}
        </View>
      </LinearGradient>

      {/* Scrollable İçerik */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* İlan Bilgileri - Web'deki sıralamaya göre ilk */}
        {(job.specialty || job.subspecialty_name || job.work_type || job.min_experience_years || job.city_name) && (
          <Card variant="elevated" padding="2xl" style={styles.contentCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <Ionicons name="briefcase" size={20} color={colors.primary[600]} />
              </View>
              <Typography variant="h3" style={styles.sectionTitle}>
                İlan Bilgileri
              </Typography>
            </View>
            <View style={styles.jobInfoGrid}>
              {job.specialty && (
                <View style={styles.jobInfoItem}>
                  <View style={styles.jobInfoIconRow}>
                    <View style={[styles.jobInfoIcon, { backgroundColor: '#EEF2FF' }]}>
                      <Ionicons name="medical" size={16} color="#6366F1" />
                    </View>
                    <Typography variant="caption" style={styles.jobInfoLabel}>
                      Uzmanlık Alanı
                    </Typography>
                  </View>
                  <Typography variant="body" style={styles.jobInfoValue}>
                    {job.specialty}
                  </Typography>
                </View>
              )}
              {job.subspecialty_name && (
                <View style={styles.jobInfoItem}>
                  <View style={styles.jobInfoIconRow}>
                    <View style={[styles.jobInfoIcon, { backgroundColor: '#F0FDFA' }]}>
                      <Ionicons name="git-branch" size={16} color="#14B8A6" />
                    </View>
                    <Typography variant="caption" style={styles.jobInfoLabel}>
                      Yan Dal
                    </Typography>
                  </View>
                  <Typography variant="body" style={styles.jobInfoValue}>
                    {job.subspecialty_name}
                  </Typography>
                </View>
              )}
              {job.work_type && (
                <View style={styles.jobInfoItem}>
                  <View style={styles.jobInfoIconRow}>
                    <View style={[styles.jobInfoIcon, { backgroundColor: '#FEF3C7' }]}>
                      <Ionicons name="time" size={16} color="#F59E0B" />
                    </View>
                    <Typography variant="caption" style={styles.jobInfoLabel}>
                      Çalışma Türü
                    </Typography>
                  </View>
                  <Typography variant="body" style={styles.jobInfoValue}>
                    {job.work_type}
                  </Typography>
                </View>
              )}
              {job.min_experience_years !== null && job.min_experience_years !== undefined && (
                <View style={styles.jobInfoItem}>
                  <View style={styles.jobInfoIconRow}>
                    <View style={[styles.jobInfoIcon, { backgroundColor: '#DBEAFE' }]}>
                      <Ionicons name="star" size={16} color="#3B82F6" />
                    </View>
                    <Typography variant="caption" style={styles.jobInfoLabel}>
                      Min. Deneyim
                    </Typography>
                  </View>
                  <Typography variant="body" style={styles.jobInfoValue}>
                    {job.min_experience_years} yıl
                  </Typography>
                </View>
              )}
              {job.city_name && (
                <View style={styles.jobInfoItem}>
                  <View style={styles.jobInfoIconRow}>
                    <View style={[styles.jobInfoIcon, { backgroundColor: '#FEE2E2' }]}>
                      <Ionicons name="location" size={16} color="#EF4444" />
                    </View>
                    <Typography variant="caption" style={styles.jobInfoLabel}>
                      Şehir
                    </Typography>
                  </View>
                  <Typography variant="body" style={styles.jobInfoValue}>
                    {job.city_name}
                  </Typography>
                </View>
              )}
              {job.created_at && (
                <View style={styles.jobInfoItem}>
                  <View style={styles.jobInfoIconRow}>
                    <View style={[styles.jobInfoIcon, { backgroundColor: '#F3F4F6' }]}>
                      <Ionicons name="calendar" size={16} color="#6B7280" />
                    </View>
                    <Typography variant="caption" style={styles.jobInfoLabel}>
                      İlan Tarihi
                    </Typography>
                  </View>
                  <Typography variant="body" style={styles.jobInfoValue}>
                    {formatDate(job.created_at)}
                  </Typography>
                </View>
              )}
            </View>
          </Card>
        )}

        {/* Hastane Bilgileri - Web'deki sıralamaya göre ikinci */}
        {(job.hospital_name || job.hospital_address || job.hospital_phone || job.hospital_email || job.hospital_website || job.city_name) && (
          <Card variant="elevated" padding="2xl" style={styles.contentCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <Ionicons name="business" size={20} color={colors.primary[600]} />
              </View>
              <Typography variant="h3" style={styles.sectionTitle}>
                Hastane Bilgileri
              </Typography>
            </View>
            <View style={styles.hospitalInfoGrid}>
              {job.hospital_name && (
                <View style={styles.hospitalInfoItem}>
                  <Typography variant="caption" style={styles.hospitalInfoLabel}>
                    Hastane Adı
                  </Typography>
                  <Typography variant="body" style={styles.hospitalInfoValue}>
                    {job.hospital_name}
                  </Typography>
                </View>
              )}
              {job.hospital_address && (
                <View style={styles.hospitalInfoItem}>
                  <Typography variant="caption" style={styles.hospitalInfoLabel}>
                    Adres
                  </Typography>
                  <Typography variant="body" style={styles.hospitalInfoValue}>
                    {job.hospital_address}
                  </Typography>
                </View>
              )}
              {job.hospital_phone && (
                <View style={styles.hospitalInfoItem}>
                  <Typography variant="caption" style={styles.hospitalInfoLabel}>
                    Telefon
                  </Typography>
                  <Typography variant="body" style={styles.hospitalInfoValue}>
                    {job.hospital_phone}
                  </Typography>
                </View>
              )}
              {job.hospital_email && (
                <View style={styles.hospitalInfoItem}>
                  <Typography variant="caption" style={styles.hospitalInfoLabel}>
                    E-posta
                  </Typography>
                  <Typography variant="body" style={styles.hospitalInfoValueLink}>
                    {job.hospital_email}
                  </Typography>
                </View>
              )}
              {job.hospital_website && (
                <View style={styles.hospitalInfoItem}>
                  <Typography variant="caption" style={styles.hospitalInfoLabel}>
                    Website
                  </Typography>
                  <Typography variant="body" style={styles.hospitalInfoValueLink}>
                    {job.hospital_website}
                  </Typography>
                </View>
              )}
            </View>
          </Card>
        )}

        {/* İş Tanımı - Web'deki sıralamaya göre üçüncü */}
        {job.description && (
          <Card variant="elevated" padding="2xl" style={styles.contentCard}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconContainer}>
                <Ionicons name="document-text" size={20} color={colors.primary[600]} />
              </View>
              <Typography variant="h3" style={styles.sectionTitle}>
                İş Tanımı
              </Typography>
            </View>
            <View style={styles.descriptionBox}>
              <Typography variant="body" style={styles.descriptionText}>
                {job.description}
              </Typography>
            </View>
          </Card>
        )}

        {/* Başvurunuz Var Banner */}
        {job.is_applied && (
          <View style={styles.infoBanner}>
            <Ionicons name="checkmark-circle" size={20} color={colors.success[600]} />
            <Typography variant="body" style={styles.infoBannerText}>
              Bu ilana zaten bir başvurunuz var. Detayları Başvurularım sayfasından takip edebilirsiniz.
            </Typography>
          </View>
        )}
      </ScrollView>

      {/* Alt Butonlar */}
      <View style={styles.bottomButtons}>
        <Button
          label="Geri"
          variant="outline"
          onPress={() => navigation.goBack()}
          style={styles.bottomBackButton}
          size="sm"
        />
        {job.is_applied ? (
          <Button
            variant="secondary"
            onPress={() => {}}
            disabled={true}
            style={styles.bottomAppliedButton}
            size="sm"
          >
            <View style={styles.buttonContentContainer}>
              <Ionicons name="checkmark-circle" size={14} color={colors.text.inverse} />
              <Typography variant="caption" style={styles.buttonText}>
                Başvuruldu
              </Typography>
            </View>
          </Button>
        ) : (
          <Button
            label="Hemen Başvur"
            variant="primary"
            onPress={handleOpenApplicationModal}
            style={styles.bottomApplyButton}
            size="sm"
          />
        )}
      </View>

      {/* Başvuru Modal */}
      {job && (
        <Modal
          visible={showApplicationModal}
          onClose={handleCloseApplicationModal}
          title="Başvuru Yap"
          size="md"
          dismissable={true}
        >
          <View style={styles.modalContent}>
            {/* İlan Bilgisi */}
            <View style={styles.modalJobInfo}>
              <View style={styles.modalJobInfoRow}>
                <Ionicons name="briefcase" size={18} color={colors.primary[600]} />
                <Typography variant="body" style={styles.modalJobTitle} numberOfLines={1}>
                  {job.title || 'İş İlanı'}
                </Typography>
              </View>
              <Typography variant="caption" style={styles.modalHospitalName} numberOfLines={1}>
                {job.hospital_name || 'Kurum bilgisi yok'}
              </Typography>
            </View>

          {/* Ön Yazı Input */}
          <View style={styles.modalInputContainer}>
            <Typography variant="body" style={styles.modalInputLabel}>
              Ön Yazı <Typography variant="caption" style={styles.optionalText}>(İsteğe bağlı)</Typography>
            </Typography>
            <Input
              multiline
              numberOfLines={10}
              placeholder="Kendinizi tanıtın ve neden bu pozisyon için uygun olduğunuzu açıklayın..."
              value={coverLetter}
              onChangeText={setCoverLetter}
              style={styles.modalCoverLetterInput}
              textAlignVertical="top"
            />
            <Typography 
              variant="caption" 
              style={wordCount > MAX_WORDS ? styles.characterCountError : styles.characterCount}
            >
              {wordCount}/{MAX_WORDS} kelime {wordCount > MAX_WORDS && '⚠️'}
            </Typography>
          </View>

          {/* Bilgi Mesajı */}
          <View style={styles.modalInfoBox}>
            <Ionicons name="information-circle" size={16} color={colors.primary[600]} />
            <Typography variant="caption" style={styles.modalInfoText}>
              Profil bilgileriniz ve CV'niz otomatik olarak gönderilecektir.
            </Typography>
          </View>

          {/* Butonlar */}
          <View style={styles.modalButtons}>
            <Button
              label="İptal"
              variant="secondary"
              onPress={handleCloseApplicationModal}
              style={styles.modalCancelButton}
            />
            <Button
              label={applyMutation.isPending ? 'İşleniyor...' : 'Başvur'}
              variant="primary"
              onPress={handleApplicationSubmit}
              loading={applyMutation.isPending}
              disabled={applyMutation.isPending}
              style={styles.modalSubmitButton}
            />
          </View>
        </View>
      </Modal>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Gradient Header Styles
  gradientHeader: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    gap: 2,
  },
  headerJobTitle: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 17,
  },
  headerHospital: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
  },
  appliedDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonContainer: {
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  jobTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  hospitalName: {
    color: colors.text.secondary,
    fontSize: 15,
  },
  postedDate: {
    color: colors.text.tertiary,
    fontSize: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  infoCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.background.secondary,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    gap: spacing.xs,
  },
  infoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  infoLabel: {
    color: colors.text.secondary,
    fontSize: 11,
  },
  infoValue: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  appliedBadgeInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.success[50],
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    alignSelf: 'flex-start',
  },
  appliedTextInline: {
    color: colors.success[700],
    fontWeight: '600',
    fontSize: 14,
  },
  salaryInfoValue: {
    color: colors.success[600],
    fontSize: 14,
    fontWeight: '600',
  },
  specialtyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  specialtyBadge: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  specialtyText: {
    color: colors.primary[700],
    fontSize: 13,
    fontWeight: '600',
  },
  subspecialtyBadge: {
    backgroundColor: colors.secondary[100],
  },
  subspecialtyText: {
    color: colors.secondary[700],
    fontSize: 13,
    fontWeight: '600',
  },
  hospitalAbout: {
    color: colors.text.secondary,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  hospitalInfoRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  hospitalInfoLabel: {
    color: colors.text.secondary,
    fontSize: 11,
    marginBottom: 2,
  },
  hospitalInfoValue: {
    color: colors.text.primary,
    fontSize: 14,
  },
  linkText: {
    color: colors.primary[600],
    fontSize: 14,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  headerCard: {
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  iconContainer: {
    width: 64,
    height: 64,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border.light,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    color: colors.text.secondary,
  },
  salaryBox: {
    backgroundColor: colors.primary[50],
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.sm,
  },
  salaryLabel: {
    color: colors.primary[700],
    marginBottom: spacing.xs,
  },
  salaryValue: {
    color: colors.primary[600],
  },
  contentCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  descriptionText: {
    lineHeight: 24,
  },
  requirementRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  bullet: {
    color: colors.text.secondary,
    marginTop: 2,
  },
  coverLetterInput: {
    marginTop: spacing.sm,
    minHeight: 100,
  },
  appliedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  appliedText: {
    color: colors.success[600],
  },
  applyButton: {
    marginTop: spacing.lg,
  },
  modalContent: {
    gap: spacing.md,
  },
  modalJobInfo: {
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  modalJobInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  modalJobTitle: {
    flex: 1,
    fontWeight: '600',
    color: colors.text.primary,
  },
  modalHospitalName: {
    color: colors.text.secondary,
    marginLeft: 26, // Icon width + gap
  },
  modalInputContainer: {
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  modalInputLabel: {
    fontWeight: '600',
    color: colors.text.primary,
  },
  optionalText: {
    color: colors.text.secondary,
    fontWeight: '400',
  },
  modalCoverLetterInput: {
    minHeight: 160,
    height: 160,
    textAlignVertical: 'top',
  },
  characterCount: {
    textAlign: 'right',
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  characterCountError: {
    textAlign: 'right',
    color: colors.error[600],
    marginTop: spacing.xs,
    fontWeight: '600',
  },
  modalInfoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.primary[50],
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary[200],
    marginBottom: spacing.xs,
  },
  modalInfoText: {
    flex: 1,
    color: colors.primary[800],
    lineHeight: 18,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  modalCancelButton: {
    flex: 1,
  },
  modalSubmitButton: {
    flex: 1,
  },
  // Web benzeri yeni stiller
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  descriptionBox: {
    backgroundColor: colors.primary[50],
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginTop: spacing.sm,
  },
  dateCard: {
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dateText: {
    color: colors.text.primary,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.success[50],
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.success[200],
  },
  infoBannerText: {
    flex: 1,
    color: colors.text.primary,
    lineHeight: 20,
  },
  bottomButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  bottomBackButton: {
    flex: 0.3,
    minHeight: 38,
  },
  bottomAppliedButton: {
    flex: 1,
    opacity: 0.6,
    minHeight: 38,
  },
  bottomApplyButton: {
    flex: 1,
    minHeight: 38,
  },
  buttonIconContainer: {
    marginRight: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  buttonText: {
    color: colors.text.inverse,
    fontWeight: '600',
  },
  // İlan Bilgileri stilleri - Modern ve temiz
  jobInfoGrid: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  jobInfoItem: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  jobInfoIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  jobInfoIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jobInfoLabel: {
    color: colors.text.secondary,
    fontSize: 12,
    fontWeight: '500',
  },
  jobInfoValue: {
    color: colors.text.primary,
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 22,
  },
  subspecialtyLabel: {
    color: colors.primary[600],
    fontSize: 13,
    marginTop: spacing.xs,
    fontWeight: '500',
  },
  // Hastane Bilgileri stilleri - Modern ve temiz
  hospitalInfoGrid: {
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  hospitalInfoItem: {
    gap: spacing.xs,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  hospitalInfoValueLink: {
    color: colors.primary[600],
    fontSize: 15,
    fontWeight: '500',
  },
});
