import React, { useState } from 'react';
import { showAlert } from '@/utils/alert';
import { View, FlatList, StyleSheet, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Screen } from '@/components/layout/Screen';
import { Typography } from '@/components/ui/Typography';
import { BackButton } from '@/components/ui/BackButton';
import { FAB } from '@/components/ui/FAB';
import { ExperienceCard } from '@/components/composite/ExperienceCard';
import { GradientHeader } from '@/components/composite/GradientHeader';
import { ExperienceFormModal } from '../components/ExperienceFormModal';
import { colors, spacing } from '@/theme';
import { useExperiences, useExperience } from '../hooks/useProfile';
import { formatYear } from '@/utils/date';
import type { DoctorExperience, CreateExperiencePayload, UpdateExperiencePayload } from '@/types/profile';

export const ExperienceScreen = () => {
  const navigation = useNavigation();
  const [selectedExperience, setSelectedExperience] = useState<DoctorExperience | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  const { data: experiences = [], isLoading, error, refetch, isRefetching } = useExperiences();
  const experienceMutations = useExperience();

  const handleAddExperience = () => {
    setSelectedExperience(null);
    setModalVisible(true);
  };

  const handleEditExperience = (experience: DoctorExperience) => {
    setSelectedExperience(experience);
    setModalVisible(true);
  };

  const handleDeleteExperience = (id: number) => {
    showAlert.confirmDestructive(
      'Deneyim Sil',
      'Bu deneyim kaydını silmek istediğinizden emin misiniz?',
      () => experienceMutations.delete.mutate(id)
    );
  };

  const handleSubmitExperience = (data: CreateExperiencePayload | UpdateExperiencePayload) => {
    if (selectedExperience) {
      experienceMutations.update.mutate(
        { id: selectedExperience.id, data },
        {
          onSuccess: () => {
            setModalVisible(false);
            setSelectedExperience(null);
          },
        }
      );
    } else {
      experienceMutations.create.mutate(data as CreateExperiencePayload, {
        onSuccess: () => {
          setModalVisible(false);
        },
      });
    }
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

      {/* Experience Form Modal */}
      <ExperienceFormModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setSelectedExperience(null);
        }}
        onSubmit={handleSubmitExperience}
        experience={selectedExperience}
        isLoading={experienceMutations.create.isPending || experienceMutations.update.isPending}
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
