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
import { EducationCard } from '@/components/composite/EducationCard';
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
              colors={['#4CAF50', '#388E3C']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.headerIconGradient}
            >
              <Ionicons name="school-sharp" size={28} color="#FFFFFF" />
            </LinearGradient>
          </View>
          <Typography variant="h1" style={styles.headerTitle}>
            Eğitim Bilgileri
          </Typography>
          <View style={styles.headerSubtitleContainer}>
            <View style={styles.headerDot} />
            <Typography variant="body" style={styles.headerSubtitle}>
              {educations.length} eğitim kaydı
            </Typography>
            <View style={styles.headerDot} />
          </View>
        </View>
      </LinearGradient>

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
    shadowColor: '#4CAF50',
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
