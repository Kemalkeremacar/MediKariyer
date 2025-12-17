import React, { useState } from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Button } from '@/components/ui/Button';
import { BackButton } from '@/components/ui/BackButton';
import { Tabs } from '@/components/ui/Tabs';
import { FAB } from '@/components/ui/FAB';
import { Divider } from '@/components/ui/Divider';
import { Chip } from '@/components/ui/Chip';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
import { formatRelativeTime } from '@/utils/date';

type Props = NativeStackScreenProps<JobsStackParamList, 'JobDetail'>;

export const JobDetailScreen = ({ route, navigation }: Props) => {
  const { id } = route.params;
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [coverLetter, setCoverLetter] = useState('');
  const [activeTab, setActiveTab] = useState('details');

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
      // Başarılı başvuru sonrası coverLetter'ı temizle
      setCoverLetter('');
      // Cache'i güncelle (butonu "Başvuruldu" yapmak için)
      queryClient.invalidateQueries({ queryKey: ['jobDetail', id] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      // Job detail'i yeniden çek
      refetch();
      showToast('Başvurunuz başarıyla iletildi', 'success');
    },
    onError: (error: any) => {
      // Backend'den gelen error mesajını göster
      const errorMessage = 
        error?.response?.data?.message || 
        error?.message || 
        'Başvuru yapılırken bir sorun oluştu.';
      showToast(errorMessage, 'error');
    },
  });

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

  // Maaş Formatı (Backend'den zaten formatlanmış geliyor)
  const salaryText = job.salary_range || 'Maaş Belirtilmemiş';


  return (
    <Screen scrollable={false} contentContainerStyle={styles.container}>
      {/* Scrollable İçerik */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <View style={styles.backButtonContainer}>
          <BackButton />
        </View>
        {/* Header Card */}
        <Card variant="elevated" padding="2xl" style={styles.headerCard}>
          <View style={{ gap: spacing.lg }}>
            {/* Hospital Logo & Title */}
            <View style={styles.row}>
              <Avatar
                size="lg"
                initials={job.hospital_name?.substring(0, 2).toUpperCase()}
              />
              <View style={{ flex: 1, gap: spacing.xs }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                  <Typography variant="h2" style={styles.jobTitle}>
                    {job.title ?? 'İş İlanı'}
                  </Typography>
                </View>
                <Typography variant="body" style={styles.hospitalName}>
                  {job.hospital_name ?? 'Kurum bilgisi yok'}
                </Typography>
                <Typography variant="caption" style={styles.postedDate}>
                  {formatRelativeTime(job.created_at, { fallback: 'Tarih belirtilmemiş' })}
                </Typography>
              </View>
            </View>

            {/* Info Grid */}
            <View style={styles.infoGrid}>
              <View style={styles.infoCard}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="location" size={18} color={colors.primary[600]} />
                </View>
                <Typography variant="caption" style={styles.infoLabel}>
                  Lokasyon
                </Typography>
                <Typography variant="body" style={styles.infoValue}>
                  {job.city_name ?? '-'}
                </Typography>
              </View>

              <View style={styles.infoCard}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="briefcase" size={18} color={colors.primary[600]} />
                </View>
                <Typography variant="caption" style={styles.infoLabel}>
                  Çalışma Tipi
                </Typography>
                <Typography variant="body" style={styles.infoValue}>
                  {job.work_type ?? '-'}
                </Typography>
              </View>

              <View style={styles.infoCard}>
                <View style={styles.infoIconContainer}>
                  <Ionicons name="calendar" size={18} color={colors.primary[600]} />
                </View>
                <Typography variant="caption" style={styles.infoLabel}>
                  Yayınlanma
                </Typography>
                <Typography variant="body" style={styles.infoValue}>
                  {formatRelativeTime(job.created_at, { fallback: 'Tarih belirtilmemiş' })}
                </Typography>
              </View>

              {job.min_experience_years !== null && job.min_experience_years !== undefined && (
                <View style={styles.infoCard}>
                  <View style={styles.infoIconContainer}>
                    <Ionicons name="people" size={18} color={colors.primary[600]} />
                  </View>
                  <Typography variant="caption" style={styles.infoLabel}>
                    Min. Deneyim
                  </Typography>
                  <Typography variant="body" style={styles.infoValue}>
                    {job.min_experience_years} yıl
                  </Typography>
                </View>
              )}

              {job.salary_range && (
                <View style={styles.infoCard}>
                  <View style={styles.infoIconContainer}>
                    <Ionicons name="cash" size={18} color={colors.success[600]} />
                  </View>
                  <Typography variant="caption" style={styles.infoLabel}>
                    Maaş Aralığı
                  </Typography>
                  <Typography variant="body" style={styles.salaryInfoValue}>
                    {job.salary_range}
                  </Typography>
                </View>
              )}
            </View>

            {/* Specialty Info */}
            {(job.specialty || job.subspecialty_name) && (
              <View style={styles.specialtyContainer}>
                {job.specialty && (
                  <View style={styles.specialtyBadge}>
                    <Typography variant="caption" style={styles.specialtyText}>
                      {job.specialty}
                    </Typography>
                  </View>
                )}
                {job.subspecialty_name && (
                  <View style={[styles.specialtyBadge, styles.subspecialtyBadge]}>
                    <Typography variant="caption" style={styles.subspecialtyText}>
                      {job.subspecialty_name}
                    </Typography>
                  </View>
                )}
              </View>
            )}

            {/* Applied Badge */}
            {job.is_applied && (
              <View style={styles.appliedBadgeInline}>
                <Ionicons name="checkmark-circle" size={18} color={colors.success[600]} />
                <Typography variant="body" style={styles.appliedTextInline}>
                  Başvuruldu
                </Typography>
              </View>
            )}
          </View>
        </Card>

        {/* Hastane Bilgileri */}
        {(job.hospital_address || job.hospital_phone || job.hospital_email || job.hospital_website || job.hospital_about) && (
          <Card padding="2xl" style={styles.contentCard}>
            <Typography variant="h3" style={styles.sectionTitle}>
              Hastane Bilgileri
            </Typography>
            <View style={{ gap: spacing.md }}>
              {job.hospital_about && (
                <View>
                  <Typography variant="body" style={styles.hospitalAbout}>
                    {job.hospital_about}
                  </Typography>
                  <View style={styles.divider} />
                </View>
              )}
              {job.hospital_address && (
                <View style={styles.hospitalInfoRow}>
                  <Ionicons name="location" size={16} color={colors.text.secondary} />
                  <View style={{ flex: 1 }}>
                    <Typography variant="caption" style={styles.hospitalInfoLabel}>
                      Adres
                    </Typography>
                    <Typography variant="body" style={styles.hospitalInfoValue}>
                      {job.hospital_address}
                    </Typography>
                  </View>
                </View>
              )}
              {job.hospital_phone && (
                <View style={styles.hospitalInfoRow}>
                  <Ionicons name="call" size={16} color={colors.text.secondary} />
                  <View style={{ flex: 1 }}>
                    <Typography variant="caption" style={styles.hospitalInfoLabel}>
                      Telefon
                    </Typography>
                    <Typography variant="body" style={styles.hospitalInfoValue}>
                      {job.hospital_phone}
                    </Typography>
                  </View>
                </View>
              )}
              {job.hospital_email && (
                <View style={styles.hospitalInfoRow}>
                  <Ionicons name="mail" size={16} color={colors.text.secondary} />
                  <View style={{ flex: 1 }}>
                    <Typography variant="caption" style={styles.hospitalInfoLabel}>
                      E-posta
                    </Typography>
                    <Typography variant="body" style={styles.hospitalInfoValue}>
                      {job.hospital_email}
                    </Typography>
                  </View>
                </View>
              )}
              {job.hospital_website && (
                <View style={styles.hospitalInfoRow}>
                  <Ionicons name="globe" size={16} color={colors.text.secondary} />
                  <View style={{ flex: 1 }}>
                    <Typography variant="caption" style={styles.hospitalInfoLabel}>
                      Website
                    </Typography>
                    <Typography variant="body" style={styles.linkText}>
                      {job.hospital_website}
                    </Typography>
                  </View>
                </View>
              )}
            </View>
          </Card>
        )}

        {/* İş Tanımı */}
        {job.description && (
          <Card padding="2xl" style={styles.contentCard}>
            <Typography variant="h3" style={styles.sectionTitle}>
              İş Tanımı
            </Typography>
            <Typography variant="body" style={styles.descriptionText}>
              {job.description}
            </Typography>
          </Card>
        )}

        {/* Gereksinimler */}
        {job.requirements && (
          <Card padding="2xl" style={styles.contentCard}>
            <Typography variant="h3" style={styles.sectionTitle}>
              Aranan Nitelikler
            </Typography>
            <Typography variant="body" style={styles.descriptionText}>
              {job.requirements}
            </Typography>
          </Card>
        )}

        {/* Avantajlar */}
        {job.benefits && (
          <Card padding="2xl" style={styles.contentCard}>
            <Typography variant="h3" style={styles.sectionTitle}>
              Avantajlar
            </Typography>
            <Typography variant="body" style={styles.descriptionText}>
              {job.benefits}
            </Typography>
          </Card>
        )}

        {/* Ön Yazı (Başvuru için) */}
        {!job.is_applied && (
          <Card padding="2xl" style={styles.contentCard}>
            <Typography variant="h3" style={styles.sectionTitle}>
              Ön Yazı (Opsiyonel)
            </Typography>
            <Input
              multiline
              numberOfLines={4}
              placeholder="Kendinizden bahsetmek ister misiniz?"
              value={coverLetter}
              onChangeText={setCoverLetter}
              containerStyle={styles.coverLetterInput}
            />
          </Card>
        )}

        {/* Başvuruldu Badge */}
        {job.is_applied && (
          <Card padding="2xl" style={styles.contentCard}>
            <View style={styles.appliedBadge}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success[600]} />
              <Typography variant="h3" style={styles.appliedText}>
                Bu ilana başvurdunuz
              </Typography>
            </View>
          </Card>
        )}

        {/* Başvur Butonu */}
        {!job.is_applied && (
          <Button
            label={applyMutation.isPending ? 'İşleniyor...' : 'Hemen Başvur'}
            size="lg"
            variant="primary"
            onPress={() => applyMutation.mutate()}
            loading={applyMutation.isPending}
            disabled={job.is_applied || applyMutation.isPending}
            fullWidth
            style={styles.applyButton}
          />
        )}
      </ScrollView>
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
  backButtonContainer: {
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm, // BackButton için padding
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
    paddingBottom: 100, // Bottom bar için boşluk
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
});
