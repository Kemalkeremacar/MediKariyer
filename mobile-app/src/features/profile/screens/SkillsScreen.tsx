import React, { useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Zap, Plus } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen } from '@/components/layout/Screen';
import { Typography } from '@/components/ui/Typography';
import { BackButton } from '@/components/ui/BackButton';
import { FAB } from '@/components/ui/FAB';
import { SkillChip } from '@/components/composite/SkillChip';
import { Card } from '@/components/ui/Card';
import { colors, spacing } from '@/theme';

// Mock data
const mockSkills = [
  { id: 1, name: 'Ekokardiyografi', level: 'expert' as const },
  { id: 2, name: 'Koroner Anjiyografi', level: 'advanced' as const },
  { id: 3, name: 'Pacemaker İmplantasyonu', level: 'advanced' as const },
  { id: 4, name: 'Elektrokardiyografi (EKG)', level: 'expert' as const },
  { id: 5, name: 'Holter Monitörizasyonu', level: 'intermediate' as const },
  { id: 6, name: 'Stres Testi', level: 'expert' as const },
  { id: 7, name: 'Kardiyak MR Yorumlama', level: 'intermediate' as const },
  { id: 8, name: 'Acil Kardiyoloji', level: 'advanced' as const },
];

export const SkillsScreen = () => {
  const navigation = useNavigation();
  const [skills, setSkills] = useState(mockSkills);

  const handleAddSkill = () => {
    console.log('Add skill');
    // TODO: Navigate to add skill screen
  };

  const handleRemoveSkill = (id: number) => {
    setSkills(skills.filter(skill => skill.id !== id));
  };

  const handleSkillPress = (id: number) => {
    console.log('Edit skill', id);
    // TODO: Navigate to edit skill screen
  };

  const groupedSkills = {
    expert: skills.filter(s => s.level === 'expert'),
    advanced: skills.filter(s => s.level === 'advanced'),
    intermediate: skills.filter(s => s.level === 'intermediate'),
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
            <Zap size={28} color={colors.warning[600]} />
          </View>
          <View style={styles.headerText}>
            <Typography variant="h2" style={styles.headerTitle}>
              Yetenekler
            </Typography>
            <Typography variant="caption" style={styles.headerSubtitle}>
              {skills.length} yetenek
            </Typography>
          </View>
        </View>
      </View>

      <FlatList
        data={Object.entries(groupedSkills).filter(([_, items]) => items.length > 0)}
        keyExtractor={([level]) => level}
        renderItem={({ item: [level, items] }) => (
          <View style={styles.section}>
            <Card variant="outlined" padding="lg">
              <Typography variant="h4" style={styles.sectionTitle}>
                {level === 'expert' && 'Uzman Seviye'}
                {level === 'advanced' && 'İleri Seviye'}
                {level === 'intermediate' && 'Orta Seviye'}
              </Typography>
              <View style={styles.skillsGrid}>
                {items.map((skill) => (
                  <SkillChip
                    key={skill.id}
                    label={skill.name}
                    level={skill.level}
                    onPress={() => handleSkillPress(skill.id)}
                    onRemove={() => handleRemoveSkill(skill.id)}
                  />
                ))}
              </View>
            </Card>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Zap size={64} color={colors.neutral[300]} />
            <Typography variant="h3" style={styles.emptyTitle}>
              Yetenek Yok
            </Typography>
            <Typography variant="body" style={styles.emptyText}>
              Yeteneklerinizi ekleyerek profilinizi güçlendirin
            </Typography>
          </View>
        }
      />

      {/* FAB */}
      <FAB
        icon={<Plus size={24} color={colors.background.primary} />}
        onPress={handleAddSkill}
        position="bottom-right"
        color="secondary"
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
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
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
