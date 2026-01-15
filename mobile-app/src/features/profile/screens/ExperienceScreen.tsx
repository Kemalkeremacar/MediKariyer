/**
 * @file ExperienceScreen.tsx
 * @description Mesleki deneyim listesi ekranı - Web ile uyumlu modern tasarım
 * @author MediKariyer Development Team
 * @version 2.0.0
 * 
 * **ÖZELLİKLER:**
 * - Deneyim listesi görüntüleme (kurum, pozisyon, tarih aralığı)
 * - Yeni deneyim ekleme (FAB butonu)
 * - Deneyim düzenleme ve silme
 * - "Devam ediyor" durumu desteği
 * - Pull-to-refresh desteği
 * - Empty state gösterimi
 * - Mor tema (web ile uyumlu)
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
import { FAB } from '@/components/ui/FAB';
import { ExperienceCard } from '@/components/composite/ExperienceCard';
import { GradientHeader } from '@/components/composite/GradientHeader';
import { colors, spacing } from '@/theme';
import { useExperiences, useExperience } from '../hooks/useExperiences';
import { formatYear } from '@/utils/date';
import type { DoctorExperience } from '@/types/profile';
import type { ProfileStackParamList } from '@/navigation/types';

type ExperienceScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'Experience'>;

// Mavi tema
const THEME = {
  background: '#EFF6FF', // blue-50
  emptyIconColor: '#2563EB', // blue-600
};

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
    <Screen scrollable={false} style={styles.screen}>
      {/* Header - Sabit (FlatList dışında, unmount olmaz) */}
      <View style={styles.headerSection}>
        <GradientHeader
          title="İş Deneyimi"
          subtitle="İş deneyimlerinizi yönetin"
          icon={<Ionicons name="briefcase-sharp" size={28} color="#FFFFFF" />}
          variant="profile"
          iconColorPreset="teal"
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
        />
      </View>

      {/* Liste - flex:1 container içinde (KRİTİK!) */}
      <View style={{ flex: 1 }}>
        <FlatList
          data={experiences}
          keyExtractor={(item) => `experience-${item.id}`}
          renderItem={({ item }) => (
            <ExperienceCard
              title={item.role_title || 'Pozisyon'}
              company={item.organization || 'Kurum'}
              location={item.specialty_name || ''}
              startDate={formatYear(item.start_date)}
              endDate={item.is_current ? '' : formatYear(item.end_date)}
              current={item.is_current}
              description={item.description || undefined}
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
              <View style={styles.emptyIconContainer}>
                <Ionicons name="briefcase" size={48} color={THEME.emptyIconColor} />
              </View>
              <Typography variant="h3" style={styles.emptyTitle}>
                Henüz deneyim eklenmemiş
              </Typography>
              <Typography variant="body" style={styles.emptyText}>
                İş deneyimlerinizi ekleyerek profilinizi güçlendirin
              </Typography>
            </View>
          }
        />
      </View>

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
  screen: {
    backgroundColor: THEME.background,
  },
  headerSection: {
    backgroundColor: THEME.background,
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
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DBEAFE', // blue-100
    alignItems: 'center',
    justifyContent: 'center',
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
  },
});
