import React, { useState } from 'react';
import { showAlert } from '@/utils/alert';
import { View, FlatList, StyleSheet, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Screen } from '@/components/layout/Screen';
import { Typography } from '@/components/ui/Typography';
import { BackButton } from '@/components/ui/BackButton';
import { FAB } from '@/components/ui/FAB';
import { LanguageCard } from '@/components/composite/LanguageCard';
import { GradientHeader } from '@/components/composite/GradientHeader';
import { LanguageFormModal } from '../components/LanguageFormModal';
import { colors, spacing } from '@/theme';
import { useLanguages, useLanguage } from '../hooks/useLanguages';
import type { DoctorLanguage, CreateLanguagePayload, UpdateLanguagePayload } from '@/types/profile';

export const LanguagesScreen = () => {
  const navigation = useNavigation();
  const [selectedLanguage, setSelectedLanguage] = useState<DoctorLanguage | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  const { data: languages = [], isLoading, error, refetch, isRefetching } = useLanguages();
  const languageMutations = useLanguage();

  const handleAddLanguage = () => {
    setSelectedLanguage(null);
    setModalVisible(true);
  };

  const handleEditLanguage = (language: DoctorLanguage) => {
    setSelectedLanguage(language);
    setModalVisible(true);
  };

  const handleDeleteLanguage = (id: number) => {
    showAlert.confirmDestructive(
      'Dil Sil',
      'Bu dil kaydını silmek istediğinizden emin misiniz?',
      () => languageMutations.delete.mutate(id)
    );
  };

  const handleSubmitLanguage = (data: CreateLanguagePayload | UpdateLanguagePayload) => {
    if (selectedLanguage) {
      languageMutations.update.mutate(
        { id: selectedLanguage.id, data },
        {
          onSuccess: () => {
            setModalVisible(false);
            setSelectedLanguage(null);
          },
        }
      );
    } else {
      languageMutations.create.mutate(data as CreateLanguagePayload, {
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
        title="Yabancı Diller"
        subtitle={`${languages.length} dil`}
        icon={<Ionicons name="language" size={28} color="#FFFFFF" />}
        variant="profile"
        iconColorPreset="purple"
      />

      {/* Languages List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[600]} />
          <Typography variant="body" style={styles.loadingText}>
            Diller yükleniyor...
          </Typography>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={colors.error[500]} />
          <Typography variant="h3" style={styles.errorTitle}>
            Hata Oluştu
          </Typography>
          <Typography variant="body" style={styles.errorText}>
            {error instanceof Error ? error.message : 'Diller yüklenirken bir hata oluştu'}
          </Typography>
          <TouchableOpacity style={styles.errorButton} onPress={() => refetch()}>
            <Typography variant="body" style={styles.retryButton}>
              Tekrar Dene
            </Typography>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={languages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            // Eğer language veya level null ise bu item'ı gösterme
            if (!item.language || !item.level) {
              return null;
            }
            return (
              <LanguageCard
                language={item.language}
                level={item.level}
                onEdit={() => handleEditLanguage(item)}
                onDelete={() => handleDeleteLanguage(item.id)}
              />
            );
          }}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="language" size={64} color={colors.neutral[300]} />
            <Typography variant="h3" style={styles.emptyTitle}>
              Henüz dil eklenmemiş
            </Typography>
            <Typography variant="body" style={styles.emptyText}>
              Yabancı dil bilgilerinizi ekleyerek profilinizi güçlendirin
            </Typography>
          </View>
        }
        />
      )}

      {/* FAB */}
      <FAB
        icon={<Ionicons name="add" size={24} color={colors.background.primary} />}
        onPress={handleAddLanguage}
        position="bottom-right"
      />

      {/* Language Form Modal */}
      <LanguageFormModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setSelectedLanguage(null);
        }}
        onSubmit={handleSubmitLanguage}
        language={selectedLanguage}
        isLoading={languageMutations.create.isPending || languageMutations.update.isPending}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['3xl'],
  },
  loadingText: {
    marginTop: spacing.md,
    color: colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['3xl'],
  },
  errorTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
    color: colors.text.primary,
  },
  errorText: {
    color: colors.text.secondary,
    textAlign: 'center',
    fontSize: 14,
    marginBottom: spacing.lg,
  },
  errorButton: {
    marginTop: spacing.md,
  },
  retryButton: {
    color: colors.primary[600],
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
