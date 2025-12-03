import React, { useState } from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { Button } from '@/components/ui/Button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  MapPin,
  Clock,
  Briefcase,
  CheckCircle,
  Building2,
  ChevronLeft,
} from 'lucide-react-native';
import { jobService } from '@/api/services/job.service';
import type { JobsStackParamList } from '@/navigation/types';
import { colors, spacing, borderRadius } from '@/theme';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { Input } from '@/components/ui/Input';

type Props = NativeStackScreenProps<JobsStackParamList, 'JobDetail'>;

export const JobDetailScreen = ({ route, navigation }: Props) => {
  const { id } = route.params;
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [coverLetter, setCoverLetter] = useState('');

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
      Alert.alert('Başarılı', 'Başvurunuz başarıyla iletildi.');
    },
    onError: (error: any) => {
      // Backend'den gelen error mesajını göster
      const errorMessage = 
        error?.response?.data?.message || 
        error?.message || 
        'Başvuru yapılırken bir sorun oluştu.';
      Alert.alert('Hata', errorMessage);
    },
  });

  if (isLoading) {
    return (
      <ScreenContainer scrollable={false}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary[600]} />
        </View>
      </ScreenContainer>
    );
  }

  if (isError || !job) {
    return (
      <ScreenContainer scrollable={false}>
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
      </ScreenContainer>
    );
  }

  // Maaş Formatı (Backend'den zaten formatlanmış geliyor)
  const salaryText = job.salary_range || 'Maaş Belirtilmemiş';

  // Tarih formatı (basit)
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Tarih belirtilmemiş';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Bugün';
    if (diffDays === 1) return 'Dün';
    if (diffDays < 7) return `${diffDays} gün önce`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} ay önce`;
    return `${Math.floor(diffDays / 365)} yıl önce`;
  };

  return (
    <ScreenContainer scrollable={false} contentContainerStyle={styles.container}>
      {/* Geri Butonu */}
      <View style={[styles.backButton, { top: insets.top + spacing.md }]}>
        <Button
          label=""
          variant="ghost"
          onPress={() => navigation.goBack()}
          style={styles.backButtonInner}
        />
      </View>

      {/* Scrollable İçerik */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card */}
        <Card padding="2xl" style={styles.headerCard}>
          <View style={{ gap: spacing.md }}>
            <View style={styles.row}>
              <View style={styles.iconContainer}>
                <Building2 size={32} color={colors.text.secondary} />
              </View>
              <View style={{ flex: 1, gap: spacing.xs }}>
                <Typography variant="heading">{job.title ?? 'İş İlanı'}</Typography>
                <Typography variant="bodySecondary">
                  {job.hospital_name ?? 'Kurum bilgisi yok'}
                </Typography>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={{ gap: spacing.sm }}>
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <MapPin size={14} color={colors.text.secondary} />
                  <Typography variant="caption" style={styles.metaText}>
                    {job.city_name ?? 'Lokasyon yok'}
                  </Typography>
                </View>
                <View style={styles.metaItem}>
                  <Briefcase size={14} color={colors.text.secondary} />
                  <Typography variant="caption" style={styles.metaText}>
                    {job.work_type ?? '-'}
                  </Typography>
                </View>
                <View style={styles.metaItem}>
                  <Clock size={14} color={colors.text.secondary} />
                  <Typography variant="caption" style={styles.metaText}>
                    {formatDate(job.created_at)}
                  </Typography>
                </View>
              </View>

              {job.salary_range && (
                <View style={styles.salaryBox}>
                  <Typography variant="caption" style={styles.salaryLabel}>
                    Tahmini Maaş Aralığı
                  </Typography>
                  <Typography variant="h3" style={styles.salaryValue}>
                    {job.salary_range}
                  </Typography>
                </View>
              )}
            </View>
          </View>
        </Card>

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
        {job.requirements && job.requirements.length > 0 && (
          <Card padding="2xl" style={styles.contentCard}>
            <Typography variant="h3" style={styles.sectionTitle}>
              Aranan Nitelikler
            </Typography>
            <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
              {job.requirements.map((req: string, index: number) => (
                <View key={index} style={styles.requirementRow}>
                  <Typography variant="body" style={styles.bullet}>•</Typography>
                  <Typography variant="bodySecondary" style={{ flex: 1 }}>
                    {req}
                  </Typography>
                </View>
              ))}
            </View>
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
              <CheckCircle size={20} color={colors.success[600]} />
              <Typography variant="h3" style={styles.appliedText}>
                Bu ilana başvurdunuz
              </Typography>
            </View>
          </Card>
        )}
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      {!job.is_applied && (
        <View style={[styles.stickyFooter, { paddingBottom: insets.bottom + spacing.lg }]}>
          <Button
            label={applyMutation.isPending ? 'İşleniyor...' : 'Hemen Başvur'}
            size="lg"
            variant="primary"
            onPress={() => applyMutation.mutate()}
            loading={applyMutation.isPending}
            disabled={job.is_applied || applyMutation.isPending}
            fullWidth
          />
        </View>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    left: spacing.lg,
    zIndex: 10,
  },
  backButtonInner: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    borderRadius: 9999,
    width: 40,
    height: 40,
  },
  scrollContent: {
    paddingBottom: spacing['4xl'],
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
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
});
