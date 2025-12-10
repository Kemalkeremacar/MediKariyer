import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Radio } from '@/components/ui/Radio';
import { Divider } from '@/components/ui/Divider';
import { colors, spacing } from '@/theme';

interface JobFilterSheetProps {
  onApply: (filters: any) => void;
  onReset: () => void;
}

export const JobFilterSheet: React.FC<JobFilterSheetProps> = ({ onApply, onReset }) => {
  const [workTypes, setWorkTypes] = useState({
    fullTime: false,
    partTime: false,
    contract: false,
  });
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'salary'>('newest');

  const handleReset = () => {
    setWorkTypes({ fullTime: false, partTime: false, contract: false });
    setSortBy('newest');
    onReset();
  };

  const handleApply = () => {
    onApply({
      workTypes,
      sortBy,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Typography variant="h3" style={styles.title}>
        Filtrele
      </Typography>

      {/* Work Type Filters - Using Checkbox */}
      <View style={styles.section}>
        <Typography variant="h4" style={styles.sectionTitle}>
          Çalışma Tipi
        </Typography>
        <View style={styles.checkboxGroup}>
          <Checkbox
            checked={workTypes.fullTime}
            onPress={() => setWorkTypes(prev => ({ ...prev, fullTime: !prev.fullTime }))}
            label="Tam Zamanlı"
          />
          <Checkbox
            checked={workTypes.partTime}
            onPress={() => setWorkTypes(prev => ({ ...prev, partTime: !prev.partTime }))}
            label="Yarı Zamanlı"
          />
          <Checkbox
            checked={workTypes.contract}
            onPress={() => setWorkTypes(prev => ({ ...prev, contract: !prev.contract }))}
            label="Sözleşmeli"
          />
        </View>
      </View>

      <Divider spacing="lg" />

      {/* Sort Options - Using Radio */}
      <View style={styles.section}>
        <Typography variant="h4" style={styles.sectionTitle}>
          Sıralama
        </Typography>
        <View style={styles.radioGroup}>
          <Radio
            selected={sortBy === 'newest'}
            onPress={() => setSortBy('newest')}
            label="En Yeni"
          />
          <Radio
            selected={sortBy === 'oldest'}
            onPress={() => setSortBy('oldest')}
            label="En Eski"
          />
          <Radio
            selected={sortBy === 'salary'}
            onPress={() => setSortBy('salary')}
            label="Maaşa Göre"
          />
        </View>
      </View>

      <View style={styles.actions}>
        <Button variant="outline" onPress={handleReset} style={styles.button}>
          Temizle
        </Button>
        <Button onPress={handleApply} style={styles.button}>
          Uygula
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  title: {
    marginBottom: spacing.lg,
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  checkboxGroup: {
    gap: spacing.md,
  },
  radioGroup: {
    gap: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  button: {
    flex: 1,
  },
});
