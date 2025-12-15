import React, { useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Screen } from '@/components/layout/Screen';
import { Typography } from '@/components/ui/Typography';
import { BackButton } from '@/components/ui/BackButton';
import { FAB } from '@/components/ui/FAB';
import { CertificateCard } from '@/components/composite/CertificateCard';
import { CertificateFormModal } from '../components/CertificateFormModal';
import { colors, spacing } from '@/theme';
import { useCertificates, useCertificate } from '../hooks/useProfile';
import type { DoctorCertificate, CreateCertificatePayload, UpdateCertificatePayload } from '@/types/profile';

export const CertificatesScreen = () => {
  const navigation = useNavigation();
  const [selectedCertificate, setSelectedCertificate] = useState<DoctorCertificate | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  const { data: certificates = [], isLoading, error, refetch, isRefetching } = useCertificates();
  const certificateMutations = useCertificate();

  const handleAddCertificate = () => {
    setSelectedCertificate(null);
    setModalVisible(true);
  };

  const handleEditCertificate = (certificate: DoctorCertificate) => {
    setSelectedCertificate(certificate);
    setModalVisible(true);
  };

  const handleDeleteCertificate = (id: number) => {
    Alert.alert(
      'Sertifika Sil',
      'Bu sertifika kaydını silmek istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: () => certificateMutations.delete.mutate(id),
        },
      ]
    );
  };

  const handleSubmitCertificate = (data: CreateCertificatePayload | UpdateCertificatePayload) => {
    if (selectedCertificate) {
      certificateMutations.update.mutate(
        { id: selectedCertificate.id, data },
        {
          onSuccess: () => {
            setModalVisible(false);
            setSelectedCertificate(null);
          },
        }
      );
    } else {
      certificateMutations.create.mutate(data as CreateCertificatePayload, {
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
            <Ionicons name="ribbon" size={28} color={colors.warning[600]} />
          </View>
          <View style={styles.headerText}>
            <Typography variant="h2" style={styles.headerTitle}>
              Sertifikalar
            </Typography>
            <Typography variant="caption" style={styles.headerSubtitle}>
              {certificates.length} sertifika
            </Typography>
          </View>
        </View>
      </View>

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

      {/* Certificate Form Modal */}
      <CertificateFormModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setSelectedCertificate(null);
        }}
        onSubmit={handleSubmitCertificate}
        certificate={selectedCertificate}
        isLoading={certificateMutations.create.isPending || certificateMutations.update.isPending}
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
    backgroundColor: colors.warning[50],
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
