import React, { useState } from 'react';
import { showAlert } from '@/utils/alert';
import { View, FlatList, StyleSheet, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Screen } from '@/components/layout/Screen';
import { Typography } from '@/components/ui/Typography';
import { BackButton } from '@/components/ui/BackButton';
import { FAB } from '@/components/ui/FAB';
import { EducationCard } from '@/components/composite/EducationCard';
import { GradientHeader } from '@/components/composite/GradientHeader';
import { EducationFormModal } from '../components/EducationFormModal';
import { colors, spacing } from '@/theme';
import { useEducations, useEducation } from '../hooks/useProfile';
import type { DoctorEducation, CreateEducationPayload, UpdateEducationPayload } from '@/types/profile';

export const EducationScreen = () => {
  const navigation = useNavigation();
  const [selectedEducation, setSelectedEducation] = useState<DoctorEducation | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  const { data: educations = [], isLoading, error, refetch, isRefetching } = useEducations();
  const educationMutations = useEducation();

  const handleAddEducation = () => {
    setSelectedEducation(null);
    setShowModal(true);
  };

  const handleEditEducation = (education: DoctorEducation) => {
    setSelectedEducation(education);
    setShowModal(true);
  };

  const handleDeleteEducation = (id: number) => {
    showAlert.confirmDestructive(
      'Eğitim Sil',
      'Bu eğitim kaydını silmek istediğinizden emin misiniz?',
      () => educationMutations.delete.mutate(id)
    );
  };

  const handleSubmit = (data: CreateEducationPayload | UpdateEducationPayload) => {
    if (selectedEducation) {
      educationMutations.update.mutate(
        { id: selectedEducation.id, data },
        {
          onSuccess: () => {
            setShowModal(false);
            setSelectedEducation(null);
          },
        }
      );
    } else {
      educationMutations.create.mutate(data as CreateEducationPayload, {
        onSuccess: () => {
          setShowModal(false);
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
        title="Eğitim Bilgileri"
        subtitle={`${educations.length} eğitim kaydı`}
        icon={<Ionicons name="school-sharp" size={28} color="#FFFFFF" />}
        variant="profile"
        iconColorPreset="green"
      />

      {/* Education List */}
      <FlatList
        data={educations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <EducationCard
            degree={item.education_type_name || item.education_type || 'Eğitim'}
            institution={item.education_institution || 'Kurum'}
            field={item.field || ''}
            startDate=""
            endDate={item.graduation_year ? `Mezuniyet: ${item.graduation_year}` : ''}
            current={false}
            onEdit={() => handleEditEducation(item)}
            onDelete={() => handleDeleteEducation(item.id)}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="school" size={64} color={colors.neutral[300]} />
            <Typography variant="h3" style={styles.emptyTitle}>
              Eğitim Bilgisi Yok
            </Typography>
            <Typography variant="body" style={styles.emptyText}>
              Eğitim bilgilerinizi ekleyerek profilinizi tamamlayın
            </Typography>
          </View>
        }
      />

      {/* FAB for adding education */}
      <FAB
        icon={<Ionicons name="add" size={24} color={colors.background.primary} />}
        onPress={handleAddEducation}
        position="bottom-right"
      />

      {/* Education Form Modal */}
      <EducationFormModal
        visible={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedEducation(null);
        }}
        onSubmit={handleSubmit}
        education={selectedEducation}
        isLoading={educationMutations.create.isPending || educationMutations.update.isPending}
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
