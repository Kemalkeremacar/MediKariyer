import { forwardRef, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { Picker } from '@react-native-picker/picker';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { colors, spacing, borderRadius } from '@/constants/theme';
import type { ApplicationStatus } from '@/types/lookup';

type ApplicationFilterSheetProps = {
  statuses: ApplicationStatus[];
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  onApply: () => void;
  onReset: () => void;
  snapPoints?: string[];
};

export const ApplicationFilterSheet = forwardRef<
  BottomSheetModal,
  ApplicationFilterSheetProps
>(
  (
    {
      statuses,
      selectedStatus,
      onStatusChange,
      onApply,
      onReset,
      snapPoints,
    },
    ref,
  ) => {
    const sheetPoints = useMemo(() => snapPoints ?? ['35%'], [snapPoints]);

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={sheetPoints}
        enablePanDownToClose
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <BottomSheetView style={styles.content}>
          <Typography variant="title">Başvuru Durumu</Typography>

          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedStatus}
              onValueChange={onStatusChange}
              dropdownIconColor={colors.text.primary}
            >
              <Picker.Item label="Tüm Durumlar" value="" />
              {statuses.map((status) => (
                <Picker.Item
                  key={status.id}
                  label={status.name}
                  value={status.name}
                />
              ))}
            </Picker>
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

ApplicationFilterSheet.displayName = 'ApplicationFilterSheet';

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


