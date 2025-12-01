import { forwardRef, useMemo, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView } from 'react-native';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { Picker } from '@react-native-picker/picker';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import type { City, Specialty } from '@/types/lookup';
import { colors, spacing, borderRadius } from '@/constants/theme';
import {
  Box,
  HStack,
  VStack,
  Icon,
} from '@gluestack-ui/themed';
import { Check, ChevronRight } from 'lucide-react-native';
import { Card } from '@/components/ui/Card';

type JobFilterSheetProps = {
  cities: City[];
  specialties: Specialty[];
  cityId: string;
  specialtyId: string;
  onCityChange: (value: string) => void;
  onSpecialtyChange: (value: string) => void;
  onApply: () => void;
  onReset: () => void;
  snapPoints?: string[];
};

type SortOption = 'recommended' | 'newest' | 'oldest';

const SortOptionItem = ({
  label,
  value,
  selected,
  onPress,
}: {
  label: string;
  value: SortOption;
  selected: boolean;
  onPress: () => void;
}) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
    <HStack
      justifyContent="space-between"
      alignItems="center"
      py="$3"
      px="$4"
    >
      <Typography
        variant="body"
        style={[styles.sortLabel, selected && styles.sortLabelActive]}
      >
        {label}
      </Typography>
      {selected && (
        <Icon as={Check} size="sm" color={colors.primary[600]} />
      )}
    </HStack>
  </TouchableOpacity>
);

const FilterRow = ({
  label,
  value,
  onPress,
}: {
  label: string;
  value: string;
  onPress: () => void;
}) => (
  <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
    <HStack
      justifyContent="space-between"
      alignItems="center"
      py="$3"
      px="$4"
    >
      <VStack space="xs">
        <Typography variant="caption" style={styles.filterLabel}>
          {label}
        </Typography>
        <Typography
          variant="body"
          style={[
            styles.filterValue,
            value !== 'Tümü' && styles.filterValueActive,
          ]}
        >
          {value}
        </Typography>
      </VStack>
      <Icon as={ChevronRight} size="sm" color={colors.neutral[400]} />
    </HStack>
  </TouchableOpacity>
);

export const JobFilterSheet = forwardRef<BottomSheetModal, JobFilterSheetProps>(
  (
    {
      cities,
      specialties,
      cityId,
      specialtyId,
      onCityChange,
      onSpecialtyChange,
      onApply,
      onReset,
      snapPoints,
    },
    ref,
  ) => {
    const sheetPoints = useMemo(() => snapPoints ?? ['75%', '90%'], [snapPoints]);
    const [sortOption, setSortOption] = useState<SortOption>('recommended');
    const [activeFiltersCount, setActiveFiltersCount] = useState(0);

    useMemo(() => {
      let count = 0;
      if (cityId) count++;
      if (specialtyId) count++;
      if (sortOption !== 'recommended') count++;
      setActiveFiltersCount(count);
    }, [cityId, specialtyId, sortOption]);

    const selectedCity = cities.find((c) => c.id.toString() === cityId);
    const selectedSpecialty = specialties.find(
      (s) => s.id.toString() === specialtyId,
    );

    const handleReset = () => {
      onReset();
      setSortOption('recommended');
    };

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={sheetPoints}
        enablePanDownToClose
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <BottomSheetView style={styles.content}>
          {/* Header */}
          <HStack justifyContent="space-between" alignItems="center" mb="$4">
            <Typography variant="heading">Filtreler</Typography>
            <HStack space="md" alignItems="center">
              {activeFiltersCount > 0 && (
                <Button
                  label={`Sıfırla (${activeFiltersCount})`}
                  variant="ghost"
                  onPress={handleReset}
                />
              )}
              <Button
                label="Vazgeç"
                variant="ghost"
                onPress={() => {
                  if (ref && 'current' in ref && ref.current) {
                    ref.current.dismiss();
                  }
                }}
              />
            </HStack>
          </HStack>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Sıralama */}
            <Box mb="$4">
              <Typography variant="caption" style={styles.sectionHeader}>
                SIRALAMA
              </Typography>
              <Card variant="outlined" style={styles.sortCard}>
                <SortOptionItem
                  label="Önerilen"
                  value="recommended"
                  selected={sortOption === 'recommended'}
                  onPress={() => setSortOption('recommended')}
                />
                <Box h={1} bg="$coolGray100" />
                <SortOptionItem
                  label="Yeniden eskiye"
                  value="newest"
                  selected={sortOption === 'newest'}
                  onPress={() => setSortOption('newest')}
                />
                <Box h={1} bg="$coolGray100" />
                <SortOptionItem
                  label="Eskiden yeniye"
                  value="oldest"
                  selected={sortOption === 'oldest'}
                  onPress={() => setSortOption('oldest')}
                />
              </Card>
            </Box>

            {/* Tüm Filtreler */}
            <Box mb="$4">
              <Typography variant="caption" style={styles.sectionHeader}>
                TÜM FİLTRELER
              </Typography>
              <Card variant="outlined" style={styles.filterCard}>
                <FilterRow
                  label="Ülke / Şehir / İlçe"
                  value={
                    selectedCity
                      ? `Türkiye / ${selectedCity.name} / Tümü`
                      : 'Türkiye / Tümü / Tümü'
                  }
                  onPress={() => {
                    // TODO: Open city picker
                  }}
                />
                <Box h={1} bg="$coolGray100" />
                <FilterRow
                  label="Çalışma Tercihi"
                  value="Tümü"
                  onPress={() => {
                    // TODO: Open work preference picker
                  }}
                />
                <Box h={1} bg="$coolGray100" />
                <FilterRow
                  label="Tarih"
                  value="Tümü"
                  onPress={() => {
                    // TODO: Open date picker
                  }}
                />
                <Box h={1} bg="$coolGray100" />
                <FilterRow
                  label="İlan Özellikleri"
                  value={
                    selectedSpecialty
                      ? 'Sana Uygun İlanlar'
                      : 'Tümü'
                  }
                  onPress={() => {
                    // TODO: Open job features picker
                  }}
                />
                <Box h={1} bg="$coolGray100" />
                <FilterRow
                  label="Sektör"
                  value="Tümü"
                  onPress={() => {
                    // TODO: Open sector picker
                  }}
                />
                <Box h={1} bg="$coolGray100" />
                <FilterRow
                  label="Pozisyon Seviyesi"
                  value="Tümü"
                  onPress={() => {
                    // TODO: Open position level picker
                  }}
                />
              </Card>
            </Box>
          </ScrollView>

          {/* Sticky Apply Button */}
          <Box
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            bg="$white"
            p="$4"
            borderTopWidth={1}
            borderTopColor="$coolGray200"
            style={styles.stickyFooter}
          >
            <Button
              label="Filtreleri Uygula"
              variant="primary"
              fullWidth
              onPress={onApply}
            />
          </Box>
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

JobFilterSheet.displayName = 'JobFilterSheet';

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius['2xl'],
  },
  handleIndicator: {
    backgroundColor: colors.border.medium,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: 100, // Space for sticky button
    flex: 1,
  },
  sectionHeader: {
    color: colors.neutral[500],
    fontWeight: '600',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sortCard: {
    marginTop: spacing.sm,
  },
  sortLabel: {
    color: colors.text.primary,
  },
  sortLabelActive: {
    color: colors.primary[600],
    fontWeight: '600',
  },
  filterCard: {
    marginTop: spacing.sm,
  },
  filterLabel: {
    color: colors.neutral[500],
    textTransform: 'uppercase',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  filterValue: {
    color: colors.neutral[500],
  },
  filterValueActive: {
    color: colors.primary[600],
    fontWeight: '500',
  },
  stickyFooter: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
});


