import { forwardRef, useMemo } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { colors, spacing, borderRadius } from '@/theme';
import { Check } from 'lucide-react-native';
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
    const sheetPoints = useMemo(() => snapPoints ?? ['50%'], [snapPoints]);

    // Türkçe status'ları İngilizce API değerlerine çevir (veritabanındaki değerlerle eşleşmeli)
    const statusToApiValue = (turkishName: string): string => {
      const mapping: Record<string, string> = {
        'Başvuruldu': 'pending',
        'İnceleniyor': 'reviewing',
        'Kabul Edildi': 'approved',
        'Red Edildi': 'rejected',
        'Geri Çekildi': 'withdrawn',
      };
      return mapping[turkishName] || turkishName;
    };

    const allStatuses = [
      { id: 0, name: 'Tüm Durumlar', value: '' },
      ...statuses.map(s => ({ 
        ...s, 
        value: statusToApiValue(s.name)
      })),
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
          {/* Header */}
          <View style={styles.header}>
            <Typography variant="h3" style={styles.headerTitle}>
              Başvuru Durumu
            </Typography>
            <Typography variant="caption" style={styles.headerSubtitle}>
              Başvurularını duruma göre filtrele
            </Typography>
          </View>

          {/* Status Options */}
          <View style={styles.optionsContainer}>
            {allStatuses.map((status) => {
              const isSelected = selectedStatus === status.value;
              return (
                <TouchableOpacity
                  key={`status-${status.id}`}
                  style={[styles.optionItem, isSelected && styles.optionItemSelected]}
                  onPress={() => onStatusChange(status.value)}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionContent}>
                    <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                      {isSelected && (
                        <View style={styles.radioInner} />
                      )}
                    </View>
                    <Typography 
                      variant="body" 
                      style={isSelected ? styles.optionLabelSelected : styles.optionLabel}
                    >
                      {status.name}
                    </Typography>
                  </View>
                  {isSelected && (
                    <Check size={20} color={colors.primary[600]} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Actions */}
          <View style={styles.actionRow}>
            <Button 
              label="Temizle" 
              variant="outline" 
              fullWidth 
              onPress={onReset}
              size="lg"
            />
            <Button 
              label="Uygula" 
              fullWidth 
              onPress={onApply}
              size="lg"
            />
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
    backgroundColor: colors.neutral[300],
    width: 40,
    height: 4,
  },
  content: {
    padding: spacing.xl,
    gap: spacing.xl,
  },
  header: {
    gap: spacing.xs,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  headerSubtitle: {
    color: colors.text.secondary,
    fontSize: 13,
  },
  optionsContainer: {
    gap: spacing.sm,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    borderColor: colors.neutral[200],
  },
  optionItemSelected: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[600],
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.neutral[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: colors.primary[600],
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary[600],
  },
  optionLabel: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: '500',
  },
  optionLabelSelected: {
    color: colors.primary[700],
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
});
