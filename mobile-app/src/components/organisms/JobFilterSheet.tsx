import { forwardRef, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { Picker } from '@react-native-picker/picker';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import type { City, Specialty } from '@/types/lookup';
import { colors, spacing, borderRadius } from '@/constants/theme';

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
    const sheetPoints = useMemo(() => snapPoints ?? ['45%', '75%'], [snapPoints]);

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={sheetPoints}
        enablePanDownToClose
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <BottomSheetView style={styles.content}>
          <Typography variant="title">Filtreler</Typography>

          <View style={styles.field}>
            <Typography variant="subtitle">Şehir</Typography>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={cityId}
                onValueChange={onCityChange}
                dropdownIconColor={colors.text.primary}
              >
                <Picker.Item label="Tümü" value="" />
                {cities.map((city) => (
                  <Picker.Item label={city.name} value={String(city.id)} key={city.id} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.field}>
            <Typography variant="subtitle">Branş</Typography>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={specialtyId}
                onValueChange={onSpecialtyChange}
                dropdownIconColor={colors.text.primary}
              >
                <Picker.Item label="Tümü" value="" />
                {specialties.map((item) => (
                  <Picker.Item label={item.name} value={String(item.id)} key={item.id} />
                ))}
              </Picker>
            </View>
          </View>

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
    padding: spacing.lg,
    gap: spacing.lg,
  },
  field: {
    gap: spacing.sm,
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
  },
});


