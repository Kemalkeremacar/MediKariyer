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
import { CertificateCard } from '@/components/composite/CertificateCard';
import { GradientHeader } from '@/components/composite/GradientHeader';
import { colors, spacing } from '@/theme';
import { useCertificates, useCertificate } from '../hooks/useCertificates';
import type { DoctorCertificate } from '@/types/profile';
import type { ProfileStackParamList } from '@/navigation/types';

type CertificatesScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'Certificates'>;

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
    <Screen scrollable={false}>
      {/* Back Button */}
      <View style={styles.backButton}>
        <BackButton onPress={() => navigation.goBack()} />
      </View>

      {/* Modern Gradient Header */}
      <GradientHeader
        title="Sertifikalar"
        subtitle={`${certificates.length} sertifika`}
        icon={<Ionicons name="ribbon" size={28} color="#FFFFFF" />}
        variant="profile"
        iconColorPreset="orange"
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
            <Ionicons name="ribbon" size={64} color={colors.neutral[300]} />
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
