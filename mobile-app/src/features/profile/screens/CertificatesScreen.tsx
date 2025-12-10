import React from 'react';
import { View, FlatList, StyleSheet, RefreshControl, Alert } from 'react-native';
import { Award, Plus } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '@/components/layout/Screen';
import { Typography } from '@/components/ui/Typography';
import { BackButton } from '@/components/ui/BackButton';
import { FAB } from '@/components/ui/FAB';
import { CertificateCard } from '@/components/composite/CertificateCard';
import { colors, spacing } from '@/theme';
import { profileService } from '@/api/services/profile.service';

export const CertificatesScreen = () => {
  const navigation = useNavigation();
  
  const { data: certificates = [], isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['certificates'],
    queryFn: () => profileService.getCertificates(),
  });

  const handleAddCertificate = () => {
    Alert.alert('Yakında', 'Sertifika ekleme özelliği yakında eklenecek');
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
            <Award size={28} color={colors.warning[600]} />
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
            onPress={() => Alert.alert('Yakında', 'Sertifika düzenleme özelliği yakında eklenecek')}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Award size={64} color={colors.neutral[300]} />
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
        icon={<Plus size={24} color={colors.background.primary} />}
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
