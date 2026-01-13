/**
 * @file CertificatesScreen.tsx
 * @description Sertifika listesi ekranı - Web ile uyumlu modern tasarım
 * @author MediKariyer Development Team
 * @version 2.0.0
 * 
 * **ÖZELLİKLER:**
 * - Sertifika listesi görüntüleme
 * - Yeni sertifika ekleme (FAB butonu)
 * - Sertifika düzenleme ve silme
 * - Pull-to-refresh desteği
 * - Empty state gösterimi
 * - Sarı tema (web ile uyumlu)
 * 
 * **KULLANIM AKIŞI:**
 * 1. Sertifikalar listelenir
 * 2. FAB butonu ile yeni sertifika eklenir
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
import { CertificateCard } from '@/components/composite/CertificateCard';
import { GradientHeader } from '@/components/composite/GradientHeader';
import { colors, spacing } from '@/theme';
import { useCertificates, useCertificate } from '../hooks/useCertificates';
import type { DoctorCertificate } from '@/types/profile';
import type { ProfileStackParamList } from '@/navigation/types';

type CertificatesScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'Certificates'>;

// Sarı tema (web ile uyumlu)
const THEME = {
  background: '#FFFBEB', // yellow-50
  emptyIconColor: '#D97706', // yellow-600
};

export const CertificatesScreen = () => {
  const navigation = useNavigation<CertificatesScreenNavigationProp>();
  const alert = useAlertHelpers();
  
  const { data: certificates = [], refetch, isRefetching } = useCertificates();
  const certificateMutations = useCertificate();

  const handleAddCertificate = () => {
    navigation.navigate('CertificateFormModal', { certificate: undefined });
  };

  const handleEditCertificate = (certificate: DoctorCertificate) => {
    navigation.navigate('CertificateFormModal', { certificate });
  };

  const handleDeleteCertificate = (id: number) => {
    alert.confirmDestructive(
      'Sertifika Sil',
      'Bu sertifika kaydını silmek istediğinizden emin misiniz?',
      () => certificateMutations.delete.mutate(id)
    );
  };

  return (
    <Screen scrollable={false} style={styles.screen}>
      {/* Modern Gradient Header with Back Button */}
      <GradientHeader
        title="Sertifikalar ve Kurslar"
        subtitle={`${certificates.length} sertifika`}
        icon={<Ionicons name="ribbon" size={28} color="#FFFFFF" />}
        variant="profile"
        iconColorPreset="orange"
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      {/* Certificates List */}
      <FlatList
        data={certificates}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <CertificateCard
            name={item.certificate_name || 'Sertifika'}
            issuer={item.institution || 'Kurum'}
            issueDate={item.certificate_year?.toString() || ''}
            onEdit={() => handleEditCertificate(item)}
            onDelete={() => handleDeleteCertificate(item.id)}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="ribbon" size={48} color={THEME.emptyIconColor} />
            </View>
            <Typography variant="h3" style={styles.emptyTitle}>
              Henüz sertifika eklenmemiş
            </Typography>
            <Typography variant="body" style={styles.emptyText}>
              Sertifikalarınızı ekleyerek profilinizi güçlendirin
            </Typography>
          </View>
        }
      />

      {/* FAB */}
      <FAB
        icon={<Ionicons name="add" size={24} color={colors.background.primary} />}
        onPress={handleAddCertificate}
        position="bottom-right"
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: {
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
    backgroundColor: '#FEF3C7', // yellow-100
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
