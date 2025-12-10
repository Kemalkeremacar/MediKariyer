import React from 'react';
import { View, FlatList, StyleSheet, RefreshControl, Alert } from 'react-native';
import { GraduationCap, Plus } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '@/components/layout/Screen';
import { Typography } from '@/components/ui/Typography';
import { BackButton } from '@/components/ui/BackButton';
import { FAB } from '@/components/ui/FAB';
import { EducationCard } from '@/components/composite/EducationCard';
import { colors, spacing } from '@/theme';
import { profileService } from '@/api/services/profile.service';

export const EducationScreen = () => {
  const navigation = useNavigation();
  
  const { data: educations = [], isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['educations'],
    queryFn: () => profileService.getEducations(),
  });

  const handleAddEducation = () => {
    // TODO: Navigate to add education screen or open modal
    console.log('Add education');
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
            <GraduationCap size={28} color={colors.primary[600]} />
          </View>
          <View style={styles.headerText}>
            <Typography variant="h2" style={styles.headerTitle}>
              Eğitim Bilgileri
            </Typography>
            <Typography variant="caption" style={styles.headerSubtitle}>
              {educations.length} eğitim kaydı
            </Typography>
          </View>
        </View>
      </View>

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
            endDate={item.graduation_year?.toString() || ''}
            current={false}
            onPress={() => Alert.alert('Yakında', 'Eğitim düzenleme özelliği yakında eklenecek')}
          />
        )}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <GraduationCap size={64} color={colors.neutral[300]} />
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
        icon={<Plus size={24} color={colors.background.primary} />}
        onPress={handleAddEducation}
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
