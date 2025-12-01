import React, { useState } from 'react';
import {
  ScrollView,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import {
  Box,
  Text,
  VStack,
  HStack,
  Icon,
  Divider,
} from '@gluestack-ui/themed';
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
import { JobsStackParamList } from '@/navigation/JobsStackNavigator';
import { colors, spacing, borderRadius } from '@/constants/theme';
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
        <Box flex={1} justifyContent="center" alignItems="center">
          <ActivityIndicator size="large" color={colors.primary[600]} />
        </Box>
      </ScreenContainer>
    );
  }

  if (isError || !job) {
    return (
      <ScreenContainer scrollable={false}>
        <Box flex={1} justifyContent="center" alignItems="center" px="$4">
          <Typography variant="title" style={{ marginBottom: spacing.md }}>
            İlan detayları yüklenemedi
          </Typography>
          <Button 
            label="Geri Dön" 
            variant="secondary" 
            onPress={() => navigation.goBack()} 
          />
        </Box>
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
        <Box
          position="absolute"
          top={insets.top + spacing.md}
          left={spacing.lg}
          zIndex={10}
        >
          <Button
            label=""
            variant="ghost"
            onPress={() => navigation.goBack()}
            leftIcon={<Icon as={ChevronLeft} color="$textDark900" size="md" />}
            style={{
              backgroundColor: 'white',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 4,
              borderRadius: 9999,
              width: 40,
              height: 40,
            }}
          />
        </Box>

      {/* Scrollable İçerik */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card */}
        <Card padding="2xl" style={styles.headerCard}>
          <VStack space="md">
            <HStack space="md" alignItems="center">
              <Box
                w={64}
                h={64}
                bg="$backgroundLight50"
                borderRadius="$xl"
                borderWidth={1}
                borderColor="$borderLight"
                justifyContent="center"
                alignItems="center"
              >
                <Icon as={Building2} size="xl" color="$textLight700" />
              </Box>
              <VStack flex={1} space="xs">
                <Typography variant="heading">{job.title ?? 'İş İlanı'}</Typography>
                <Typography variant="bodySecondary">
                  {job.hospital_name ?? 'Kurum bilgisi yok'}
                </Typography>
              </VStack>
            </HStack>

            <Divider bg="$borderLight" />

            <VStack space="sm">
              <HStack space="md" flexWrap="wrap">
                <HStack space="xs" alignItems="center">
                  <Icon as={MapPin} size="xs" color="$textLight700" />
                  <Typography variant="caption" style={styles.metaText}>
                    {job.city_name ?? 'Lokasyon yok'}
                  </Typography>
                </HStack>
                <HStack space="xs" alignItems="center">
                  <Icon as={Briefcase} size="xs" color="$textLight700" />
                  <Typography variant="caption" style={styles.metaText}>
                    {job.work_type ?? '-'}
                  </Typography>
                </HStack>
                <HStack space="xs" alignItems="center">
                  <Icon as={Clock} size="xs" color="$textLight700" />
                  <Typography variant="caption" style={styles.metaText}>
                    {formatDate(job.created_at)}
                  </Typography>
                </HStack>
              </HStack>

              {job.salary_range && (
                <Box
                  bg="$primary50"
                  p="$3"
                  borderRadius="$lg"
                  mt="$2"
                >
                  <Typography variant="caption" color="$primary700" mb="$1">
                    Tahmini Maaş Aralığı
                  </Typography>
                  <Typography variant="title" color="$primary600">
                    {job.salary_range}
                  </Typography>
                </Box>
              )}
            </VStack>
          </VStack>
        </Card>

        {/* İş Tanımı */}
        {job.description && (
          <Card padding="2xl" style={styles.contentCard}>
            <Typography variant="title" style={styles.sectionTitle}>
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
            <Typography variant="title" style={styles.sectionTitle}>
              Aranan Nitelikler
            </Typography>
            <VStack space="sm" mt="$2">
              {job.requirements.map((req: string, index: number) => (
                <HStack key={index} space="sm" alignItems="flex-start">
                  <Text style={styles.bullet}>•</Text>
                  <Typography variant="bodySecondary" flex={1}>
                    {req}
                  </Typography>
                </HStack>
              ))}
            </VStack>
          </Card>
        )}

        {/* Ön Yazı (Başvuru için) */}
        {!job.is_applied && (
          <Card padding="2xl" style={styles.contentCard}>
            <Typography variant="title" style={styles.sectionTitle}>
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
            <HStack space="sm" alignItems="center" justifyContent="center">
              <Icon as={CheckCircle} size="md" color="$success600" />
              <Typography variant="title" color="$success600">
                Bu ilana başvurdunuz
              </Typography>
            </HStack>
          </Card>
        )}
      </ScrollView>

      {/* Sticky Bottom Action Bar */}
      {!job.is_applied && (
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          bg="$white"
          p="$4"
          pb={insets.bottom + spacing.lg}
          borderTopWidth={1}
          borderColor="$borderLight"
          sx={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 10,
          }}
        >
          <Button
            label={applyMutation.isPending ? 'İşleniyor...' : 'Hemen Başvur'}
            size="lg"
            variant="primary"
            onPress={() => applyMutation.mutate()}
            loading={applyMutation.isPending}
            isDisabled={job.is_applied || applyMutation.isPending}
            fullWidth
          />
        </Box>
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  scrollContent: {
    paddingBottom: spacing['4xl'],
  },
  headerCard: {
    marginBottom: spacing.md,
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
  metaText: {
    color: colors.text.secondary,
  },
  bullet: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 2,
  },
  coverLetterInput: {
    marginTop: spacing.sm,
    minHeight: 100,
  },
});

