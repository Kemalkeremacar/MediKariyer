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
import { EducationCard } from '@/components/composite/EducationCard';
import { GradientHeader } from '@/components/composite/GradientHeader';
import { colors, spacing } from '@/theme';
import { useEducations, useEducation } from '../hooks/useEducations';
import type { DoctorEducation } from '@/types/profile';
import type { ProfileStackParamList } from '@/navigation/types';

type EducationScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'Education'>;

export const EducationScreen = () => {
  const navigation = useNavigation<EducationScreenNavigationProp>();
  const alert = useAlertHelpers();
  
  const { data: educations = [], refetch, isRefetching } = useEducations();
  const educationMutations = useEducation();

  const handleAddEducation = () => {
    navigation.navigate('EducationFormModal', { education: undefined });
  };

  const handleEditEducation = (education: DoctorEducation) => {
    navigation.navigate('EducationFormModal', { education });
  };

  const handleDeleteEducation = (id: number) => {
    alert.confirmDestructive(
      'Eğitim Sil',
      'Bu eğitim kaydını silmek istediğinizden emin misiniz?',
      () => educationMutations.delete.mutate(id)
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
