/**
 * @file Select.tsx
 * @description BottomSheetModal kullanan dropdown select bileşeni
 * 
 * ⚠️ MİMARİ BAĞIMLILIK - KRİTİK
 * ═══════════════════════════════════════════════════════
 * Bu bileşen @gorhom/bottom-sheet'ten BottomSheetModal kullanır.
 * KÖK SEVİYEDE (App.tsx) BottomSheetModalProvider GEREKTİRİR.
 * 
 * BU BİLEŞENİ KULLANAN EKRANLAR İÇİN KURALLAR:
 * - Navigasyon seçeneklerinde `presentation: 'modal'` KULLANMAYIN
 * - Yerel BottomSheetModalProvider ile SARMAYIN
 * - Doğru z-index katmanlaması için `presentation: 'card'` KULLANMALISINIZ
 * 
 * NEDEN: BottomSheetModal en yakın provider'a göre render edilir.
 * Provider NavigationContainer içindeyse, modal ekranların ARKASINDA görünür.
 * 
 * Bakınız: Tam provider hiyerarşisi dokümantasyonu için ARCHITECTURE.md
 * ═══════════════════════════════════════════════════════
 * 
 * Özellikler:
 * - BottomSheetModal ile dropdown
 * - Arama desteği (opsiyonel)
 * - Snap points (%50, %90)
 * - Backdrop ile kapatma
 * - Modern tasarım
 * 
 * Kullanım:
 * ```tsx
 * <Select
 *   options={cities}
 *   value={selectedCity}
 *   onChange={setSelectedCity}
 *   placeholder="Şehir Seçin"
 *   searchable
 * />
 * ```
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetFlatList,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

/**
 * Select seçenek interface'i
 */
export interface SelectOption {
  /** Gösterilecek etiket */
  label: string;
  /** Seçenek değeri */
  value: string | number;
}

/**
 * Select bileşeni props interface'i
 */
interface SelectProps {
  /** Seçenek listesi */
  options: SelectOption[];
  /** Seçili değer */
  value?: string | number;
  /** Değer değiştiğinde çağrılır */
  onChange: (value: string | number) => void;
  /** Placeholder metni */
  placeholder?: string;
  /** Arama özelliği aktif mi? */
  searchable?: boolean;
  /** Devre dışı durumu */
  disabled?: boolean;
}

/**
 * Select (Dropdown) Bileşeni
 * BottomSheetModal ile modern dropdown
 */
export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Seçiniz',
  searchable = false,
  disabled = false,
}) => {
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Snap noktaları: Ekran yüksekliğinin %50 ve %90'ı
  const snapPoints = useMemo(() => ['50%', '90%'], []);

  const selectedOption = options.find((opt) => opt.value === value);
  
  // Aramaya göre seçenekleri filtrele
  const filteredOptions = useMemo(() => {
    if (!searchable || !searchQuery) return options;
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, searchQuery, searchable]);

  const handleOpen = useCallback(() => {
    if (!disabled) {
      bottomSheetModalRef.current?.present();
    }
  }, [disabled]);

  const handleSelect = useCallback((optionValue: string | number) => {
    onChange(optionValue);
    bottomSheetModalRef.current?.dismiss();
    setSearchQuery('');
  }, [onChange]);

  // Backdrop bileşeni
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
        pressBehavior="close"
      />
    ),
    []
  );

  return (
    <>
      {/* Tetikleyici Buton */}
      <TouchableOpacity
        style={[styles.selectButton, disabled && styles.selectButtonDisabled]}
        onPress={handleOpen}
        disabled={disabled}
      >
        <Text
          style={[
            styles.selectText,
            !selectedOption && styles.selectPlaceholder,
          ]}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Text style={styles.selectArrow}>▼</Text>
      </TouchableOpacity>

      {/* Bottom Sheet Modal */}
      <BottomSheetModal
        ref={bottomSheetModalRef}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
      >
        {/* Başlık */}
        <View style={styles.header}>
          <Text style={styles.title}>{placeholder}</Text>
        </View>

        {/* Arama Input'u (arama aktifse) */}
        {searchable && (
          <BottomSheetTextInput
            style={styles.searchInput}
            placeholder="Ara..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        )}

        {/* Seçenek Listesi */}
        <BottomSheetFlatList
          data={filteredOptions}
          keyExtractor={(item: SelectOption) => String(item.value)}
          renderItem={({ item }: { item: SelectOption }) => (
            <TouchableOpacity
              style={[
                styles.option,
                item.value === value && styles.optionSelected,
              ]}
              onPress={() => handleSelect(item.value)}
            >
              <Text
                style={[
                  styles.optionText,
                  item.value === value && styles.optionTextSelected,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Sonuç bulunamadı</Text>
            </View>
          }
        />
      </BottomSheetModal>
    </>
  );
};

const styles = StyleSheet.create({
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 52,
    borderWidth: 0,
    borderRadius: 16,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.neutral[100],
  },
  selectButtonDisabled: {
    backgroundColor: colors.neutral[100],
    opacity: 0.6,
  },
  selectText: {
    fontSize: 16,
    color: colors.text.primary,
    flex: 1,
  },
  selectPlaceholder: {
    color: colors.text.tertiary,
  },
  selectArrow: {
    fontSize: 12,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
  },
  bottomSheetBackground: {
    backgroundColor: colors.background.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  handleIndicator: {
    backgroundColor: colors.neutral[300],
    width: 40,
    height: 4,
  },
  header: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
  },
  searchInput: {
    height: 52,
    borderWidth: 0,
    borderRadius: 16,
    paddingHorizontal: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    fontSize: 16,
    backgroundColor: colors.neutral[100],
    color: colors.text.primary,
  },
  option: {
    padding: spacing.lg,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  optionSelected: {
    backgroundColor: colors.primary[50],
  },
  optionText: {
    fontSize: 16,
    color: colors.text.primary,
  },
  optionTextSelected: {
    color: colors.primary[600],
    fontWeight: '600',
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.text.tertiary,
  },
});
