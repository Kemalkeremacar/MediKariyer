import { forwardRef, useMemo } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { Picker } from '@react-native-picker/picker';
import { useQuery } from '@tanstack/react-query';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { colors, spacing, borderRadius } from '@/theme';
import { lookupService } from '@/api/services/lookup.service';

type JobFilterSheetProps = {
  selectedSpecialtyId?: number;
  selectedCityId?: number;
  selectedWorkType?: string;
  onSpecialtyChange: (value: number | undefined) => void;
  onCityChange: (value: number | undefined) => void;
  onWorkTypeChange: (value: string | undefined) => void;
  onApply: () => void;
  onReset: () => void;
  snapPoints?: string[];
};

export const JobFilterSheet = forwardRef<BottomSheetModal, JobFilterSheetProps>(
  (
    {
      selectedSpecialtyId,
      selectedCityId,
      selectedWorkType,
      onSpecialtyChange,
      onCityChange,
      onWorkTypeChange,
      onApply,
      onReset,
      snapPoints,
    },
    ref,
  ) => {
    const sheetPoints = useMemo(() => snapPoints ?? ['60%'], [snapPoints]);

    const { data: specialties = [] } = useQuery({
      queryKey: ['lookup', 'specialties'],
      queryFn: lookupService.getSpecialties,
    });

    const { data: cities = [] } = useQuery({
      queryKey: ['lookup', 'cities'],
      queryFn: lookupService.getCities,
    });

    const workTypes = [
      { id: 'tam_zamanli', name: 'Tam Zamanlı' },
      { id: 'yari_zamanli', name: 'Yarı Zamanlı' },
      { id: 'nobet', name: 'Nöbet Usulü' },
    ];

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={sheetPoints}
        enablePanDownToClose
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <BottomSheetView style={styles.content}>
          <Typography variant="h3" style={styles.title}>
            Filtreler
          </Typography>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Branş Filtresi */}
            <View style={styles.filterSection}>
              <Typography variant="body" style={styles.label}>
                Branş
              </Typography>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={selectedSpecialtyId}
                  onValueChange={(value) =>
                    onSpecialtyChange(value === 0 ? undefined : value)
                  }
                  dropdownIconColor={colors.text.primary}
                >
                  <Picker.Item label="Tüm Branşlar" value={0} key="specialty-all" />
                  {specialties.map((specialty) => (
                    <Picker.Item
                      key={`specialty-${specialty.id}`}
                      label={specialty.name}
                      value={specialty.id}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Şehir Filtresi */}
            <View style={styles.filterSection}>
              <Typography variant="body" style={styles.label}>
                Şehir
              </Typography>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={selectedCityId}
                  onValueChange={(value) =>
                    onCityChange(value === 0 ? undefined : value)
                  }
                  dropdownIconColor={colors.text.primary}
                >
                  <Picker.Item label="Tüm Şehirler" value={0} key="city-all" />
                  {cities.map((city) => (
                    <Picker.Item
                      key={`city-${city.id}`}
                      label={city.name}
                      value={city.id}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Çalışma Şekli Filtresi */}
            <View style={styles.filterSection}>
              <Typography variant="body" style={styles.label}>
                Çalışma Şekli
              </Typography>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={selectedWorkType}
                  onValueChange={(value) =>
                    onWorkTypeChange(value === '' ? undefined : value)
                  }
                  dropdownIconColor={colors.text.primary}
                >
                  <Picker.Item label="Tümü" value="" key="worktype-all" />
                  {workTypes.map((type) => (
                    <Picker.Item
                      key={`worktype-${type.id}`}
                      label={type.name}
                      value={type.id}
                    />
                  ))}
                </Picker>
              </View>
            </View>
          </ScrollView>

          <View style={styles.actionRow}>
            <Button label="Temizle" variant="ghost" fullWidth onPress={onReset} />
            <Button label="Uygula" fullWidth onPress={onApply} />
          </View>
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
    flex: 1,
    padding: spacing.lg,
  },
  title: {
    marginBottom: spacing.lg,
  },
  filterSection: {
    marginBottom: spacing.lg,
  },
  label: {
    marginBottom: spacing.sm,
    fontWeight: '600',
    color: colors.text.primary,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.background.secondary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
});
