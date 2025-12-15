import React, { useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Screen } from '@/components/layout/Screen';
import { Typography } from '@/components/ui/Typography';
import { BackButton } from '@/components/ui/BackButton';
import { FAB } from '@/components/ui/FAB';
import { ExperienceCard } from '@/components/composite/ExperienceCard';
import { ExperienceFormModal } from '../components/ExperienceFormModal';
import { colors, spacing } from '@/theme';
import { useExperiences, useExperience } from '../hooks/useProfile';
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
    Alert.alert(
      'Deneyim Sil',
      'Bu deneyim kaydını silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => experienceMutations.delete.mutate(id),
        },
      ]
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.getFullYear().toString();
  };

  return (
    <Screen scrollable={false}>
      {/* Back Button */}
      <View style={styles.backButton}>
        <BackButton onPress={() => navigation.goBack()} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Ionicons name="briefcase" size={28} color={colors.primary[600]} />
          </View>
          <View style={styles.headerText}>
            <Typography variant="h2" style={styles.headerTitle}>
              Mesleki Deneyimler
            </Typography>
            <Typography variant="caption" style={styles.headerSubtitle}>
              {experiences.length} iş deneyimi
            </Typography>
          </View>
        </View>
      </View>

      {/* Experience List */}
      <FlatList
        data={experiences}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ExperienceCard
            title={item.role_title || 'Pozisyon'}
            company={item.organization || 'Kurum'}
            location={item.specialty_name || ''}
            startDate={formatDate(item.start_date)}
            endDate={item.is_current ? 'Devam ediyor' : formatDate(item.end_date)}
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
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
  },
  headerSubtitle: {
    color: colors.text.secondary,
    fontSize: 13,
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
