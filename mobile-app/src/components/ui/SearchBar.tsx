/**
 * @file SearchBar.tsx
 * @description Arama çubuğu bileşeni
 * 
 * Özellikler:
 * - Arama ikonu
 * - Temizleme butonu
 * - Yükleme göstergesi
 * - Focus durumu gösterimi
 * - Otomatik focus desteği
 * - Performans optimizasyonu (memo)
 * - Modern tasarım (yuvarlatılmış köşeler, gölge)
 * 
 * Kullanım:
 * ```tsx
 * <SearchBar
 *   value={searchQuery}
 *   onChangeText={setSearchQuery}
 *   placeholder="İş ara..."
 *   isSearching={isLoading}
 * />
 * ```
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@/theme';

/**
 * SearchBar bileşeni props interface'i
 */
export interface SearchBarProps {
  /** Arama metni */
  value: string;
  /** Metin değiştiğinde çağrılır */
  onChangeText: (text: string) => void;
  /** Placeholder metni */
  placeholder?: string;
  /** Temizleme fonksiyonu */
  onClear?: () => void;
  /** Focus olduğunda çağrılır */
  onFocus?: () => void;
  /** Blur olduğunda çağrılır */
  onBlur?: () => void;
  /** Otomatik focus */
  autoFocus?: boolean;
  /** Ek stil */
  style?: ViewStyle;
  /** Arama yapılıyor mu? (loading indicator için) */
  isSearching?: boolean;
}

/**
 * Arama Çubuğu Bileşeni
 * Performans optimizasyonu ile memo edilmiş
 */
export const SearchBar: React.FC<SearchBarProps> = React.memo(({
  value,
  onChangeText,
  placeholder = 'Ara...',
  onClear,
  onFocus,
  onBlur,
  autoFocus = false,
  style,
  isSearching = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = React.useCallback(() => {
    onChangeText('');
    onClear?.();
  }, [onChangeText, onClear]);

  const handleFocus = React.useCallback(() => {
    setIsFocused(true);
    onFocus?.();
  }, [onFocus]);

  const handleBlur = React.useCallback(() => {
    setIsFocused(false);
    onBlur?.();
  }, [onBlur]);

  const handleChangeText = React.useCallback((text: string) => {
    onChangeText(text);
  }, [onChangeText]);

  return (
    <View style={[styles.container, isFocused && styles.containerFocused, style]}>
      <Ionicons 
        name="search" 
        size={20} 
        color={isFocused ? colors.primary[600] : colors.neutral[400]} 
        style={styles.searchIcon} 
      />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.text.tertiary}
        onFocus={handleFocus}
        onBlur={handleBlur}
        autoFocus={autoFocus}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="never"
        textContentType="none"
        keyboardType="default"
      />
      <View style={styles.rightIcons}>
        {isSearching && (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingDot} />
          </View>
        )}
        {value.length > 0 && (
          <TouchableOpacity 
            onPress={handleClear} 
            style={styles.clearButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close-circle" size={20} color={colors.neutral[400]} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[50],
    borderRadius: 16,
    paddingHorizontal: spacing.lg,
    height: 52,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  containerFocused: {
    borderColor: colors.primary[400],
    backgroundColor: colors.background.primary,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text.primary,
    paddingVertical: 0,
    fontWeight: '400',
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginLeft: spacing.xs,
  },
  loadingContainer: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary[600],
    opacity: 0.6,
  },
  clearButton: {
    padding: spacing.xs,
  },
});
