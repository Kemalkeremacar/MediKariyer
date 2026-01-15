/**
 * @file LanguagesScreen.tsx
 * @description Yabancı dil listesi ekranı - Web ile uyumlu modern tasarım
 * @author MediKariyer Development Team
 * @version 2.0.0
 * 
 * **ÖZELLİKLER:**
 * - Dil listesi görüntüleme (dil adı, seviye)
 * - Yeni dil ekleme (FAB butonu)
 * - Dil düzenleme ve silme
 * - Pull-to-refresh desteği
 * - Loading ve error state'leri
 * - Empty state gösterimi
 * - Cyan tema (web ile uyumlu)
 * 
 * **KULLANIM AKIŞI:**
 * 1. Diller listelenir
 * 2. FAB butonu ile yeni dil eklenir
 * 3. Kart üzerinden düzenleme/silme yapılır
 */
import React from 'react';
import { useAlertHelpers } from '@/utils/alertHelpers';
import { View, FlatList, StyleSheet, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '@/components/layout/Screen';
import { Typography } from '@/components/ui/Typography';
import { FAB } from '@/components/ui/FAB';
import { LanguageCard } from '@/components/composite/LanguageCard';
import { GradientHeader } from '@/components/composite/GradientHeader';
import { colors, spacing } from '@/theme';
import { useLanguages, useLanguage } from '../hooks/useLanguages';
import type { DoctorLanguage } from '@/types/profile';
import type { ProfileStackParamList } from '@/navigation/types';

type LanguagesScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'Languages'>;

// Mor tema (deneyim ile değiştirildi)
const THEME = {
  background: '#FAF5FF', // purple-50
  emptyIconColor: '#9333EA', // purple-600
};

export const LanguagesScreen = () => {
  const navigation = useNavigation<LanguagesScreenNavigationProp>();
  const alert = useAlertHelpers();
  
  const { data: languages = [], isLoading, error, refetch, isRefetching } = useLanguages();
  const languageMutations = useLanguage();

  const handleAddLanguage = () => {
    navigation.navigate('LanguageFormModal', { language: undefined });
  };

  const handleEditLanguage = (language: DoctorLanguage) => {
    navigation.navigate('LanguageFormModal', { language });
  };

  const handleDeleteLanguage = (id: number) => {
    alert.confirmDestructive(
      'Dil Sil',
      'Bu dil kaydını silmek istediğinizden emin misiniz?',
      () => languageMutations.delete.mutate(id)
    );
  };

  return (
    <Screen scrollable={false} style={styles.screen}>
      {/* Header - Sabit (FlatList dışında, unmount olmaz) */}
      <View style={styles.headerSection}>
        <GradientHeader
          title="Dil Bilgileri"
          subtitle="Yabancı dil bilgilerinizi yönetin"
          icon={<Ionicons name="language" size={28} color="#FFFFFF" />}
          variant="profile"
          iconColorPreset="purple"
          showBackButton={true}
          onBackPress={() => navigation.goBack()}
        />
      </View>

      {/* Liste - flex:1 container içinde (KRİTİK!) */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={THEME.emptyIconColor} />
          <Typography variant="body" style={styles.loadingText}>
            Diller yükleniyor...
          </Typography>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="alert-circle" size={48} color={colors.error[500]} />
          </View>
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
        <View style={{ flex: 1 }}>
          <FlatList
            data={languages}
            keyExtractor={(item) => `language-${item.id}`}
            renderItem={({ item }) => {
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
                <View style={styles.emptyIconContainer}>
                  <Ionicons name="language" size={48} color={THEME.emptyIconColor} />
                </View>
                <Typography variant="h3" style={styles.emptyTitle}>
                  Henüz dil eklenmemiş
                </Typography>
                <Typography variant="body" style={styles.emptyText}>
                  Yabancı dil bilgilerinizi ekleyerek profilinizi güçlendirin
                </Typography>
              </View>
            }
          />
        </View>
      )}

      {/* FAB */}
      <FAB
        icon={<Ionicons name="add" size={24} color={colors.background.primary} />}
        onPress={handleAddLanguage}
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
    backgroundColor: '#F3E8FF', // purple-100
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
