import React, { useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Screen } from '@/components/layout/Screen';
import { Typography } from '@/components/ui/Typography';
import { BackButton } from '@/components/ui/BackButton';
import { FAB } from '@/components/ui/FAB';
import { LanguageCard } from '@/components/composite/LanguageCard';
import { LanguageFormModal } from '../components/LanguageFormModal';
import { colors, spacing } from '@/theme';
import { useLanguages, useLanguage } from '../hooks/useProfile';
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
    Alert.alert(
      'Dil Sil',
      'Bu dil kaydını silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => languageMutations.delete.mutate(id),
        },
      ]
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

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Ionicons name="language" size={28} color={colors.secondary[600]} />
          </View>
          <View style={styles.headerText}>
            <Typography variant="h2" style={styles.headerTitle}>
              Yabancı Diller
            </Typography>
            <Typography variant="caption" style={styles.headerSubtitle}>
              {languages.length} dil
            </Typography>
          </View>
        </View>
      </View>

      {/* Languages List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[600]} />
          <Typography variant="body" style={styles.loadingText}>
            Diller yükleniyor...
          </Typography>
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
    backgroundColor: colors.secondary[50],
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
});
