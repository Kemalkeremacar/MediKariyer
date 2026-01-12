/**
 * @file ExperienceScreen.tsx
 * @description Mesleki deneyim listesi ekranı - CRUD işlemleri
 * @author MediKariyer Development Team
 * @version 1.0.0
 * 
 * **ÖZELLİKLER:**
 * - Deneyim listesi görüntüleme (kurum, pozisyon, tarih aralığı)
 * - Yeni deneyim ekleme (FAB butonu)
 * - Deneyim düzenleme ve silme
 * - "Devam ediyor" durumu desteği
 * - Pull-to-refresh desteği
 * - Empty state gösterimi
 * 
 * **KULLANIM AKIŞI:**
 * 1. Deneyimler listelenir
 * 2. FAB butonu ile yeni deneyim eklenir
 * 3. Kart üzerinden düzenleme/silme yapılır
 */
import React from 'react';
import { useAlertHelpers } from '@/utils/alertHelpers';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '@/components/layout/Screen';
import { Typography } from '@/components/ui/Typography';
import { BackButton } from '@/components/ui/BackButton';
import { FAB } from '@/components/ui/FAB';
import { ExperienceCard } from '@/components/composite/ExperienceCard';
import { GradientHeader } from '@/components/composite/GradientHeader';
import { colors, spacing } from '@/theme';
import { useExperiences, useExperience } from '../hooks/useExperiences';
import { formatYear } from '@/utils/date';
import type { DoctorExperience } from '@/types/profile';
import type { ProfileStackParamList } from '@/navigation/types';

type ExperienceScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'Experience'>;

export const ExperienceScreen = () => {
  const navigation = useNavigation<ExperienceScreenNavigationProp>();
  const alert = useAlertHelpers();
  
  const { data: experiences = [], refetch, isRefetching } = useExperiences();
  const experienceMutations = useExperience();

  const handleAddExperience = () => {
    navigation.navigate('ExperienceFormModal', { experience: undefined });
  };

  const handleEditExperience = (experience: DoctorExperience) => {
    navigation.navigate('ExperienceFormModal', { experience });
  };

  const handleDeleteExperience = (id: number) => {
    alert.confirmDestructive(
      'Deneyim Sil',
      'Bu deneyim kaydını silmek istediğinizden emin misiniz?',
      () => experienceMutations.delete.mutate(id)
    );
  };

  return (
    <Screen scrollable={false}>
      {/* Back Button */}
      <View style={styles.backButton}>
        <BackButton onPress={() => navigation.goBack()} />
      </View>

      {/* Modern Gradient Header */}
      <GradientHeader
        title="Mesleki Deneyimler"
        subtitle={`${experiences.length} iş deneyimi`}
        icon={<Ionicons name="briefcase-sharp" size={28} color="#FFFFFF" />}
        variant="profile"
        iconColorPreset="teal"
      />

      {/* Experience List */}
      <FlatList
        data={experiences}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ExperienceCard
            title={item.role_title || 'Pozisyon'}
            company={item.organization || 'Kurum'}
            location={item.specialty_name || ''}
            startDate={formatYear(item.start_date)}
            endDate={item.is_current ? 'Devam ediyor' : formatYear(item.end_date)}
            current={item.is_current}
            onEdit={() => handleEditExperience(item)}
            onDelete={() => handleDeleteExperience(item.id)}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="briefcase" size={64} color={colors.neutral[300]} />
            <Typography variant="h3" style={styles.emptyTitle}>
              Henüz deneyim eklenmemiş
            </Typography>
            <Typography variant="body" style={styles.emptyText}>
              İş deneyimlerinizi ekleyerek profilinizi güçlendirin
            </Typography>
          </View>
        }
      />

      {/* FAB */}
      <FAB
        icon={<Ionicons name="add" size={24} color={colors.background.primary} />}
        onPress={handleAddExperience}
        position="bottom-right"
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  backButton: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background.primary,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing['4xl'],
  },
  emptyState: {
    padding: spacing['3xl'],
    alignItems: 'center',
  },
  emptyTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
    color: colors.text.primary,
  },
  emptyText: {
    color: colors.text.secondary,
    textAlign: 'center',
    fontSize: 14,
  },
});
