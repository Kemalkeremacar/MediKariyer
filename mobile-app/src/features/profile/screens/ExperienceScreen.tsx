import React, { useState } from 'react';
import { showAlert } from '@/utils/alert';
import { View, FlatList, StyleSheet, RefreshControl, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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

      {/* Modern Gradient Header */}
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <View style={styles.headerDecoration}>
          <View style={styles.decorCircle1} />
          <View style={styles.decorCircle2} />
        </View>
        
        <View style={styles.headerContent}>
          <View style={styles.headerIconWrapper}>
            <LinearGradient
              colors={['#2196F3', '#1976D2']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerIconGradient}
            >
              <Ionicons name="briefcase-sharp" size={28} color="#FFFFFF" />
            </LinearGradient>
          </View>
          <Typography variant="h1" style={styles.headerTitle}>
            Mesleki Deneyimler
          </Typography>
          <View style={styles.headerSubtitleContainer}>
            <View style={styles.headerDot} />
            <Typography variant="body" style={styles.headerSubtitle}>
              {experiences.length} iş deneyimi
            </Typography>
            <View style={styles.headerDot} />
          </View>
        </View>
      </LinearGradient>

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
  gradientHeader: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  headerDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  decorCircle1: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    top: -50,
    right: -30,
  },
  decorCircle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    bottom: -30,
    left: -20,
  },
  headerContent: {
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  headerIconWrapper: {
    marginBottom: spacing.sm,
  },
  headerIconGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  headerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 18,
    textAlign: 'center',
    fontWeight: '500',
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
