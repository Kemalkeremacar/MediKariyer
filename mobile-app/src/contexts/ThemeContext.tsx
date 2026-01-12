/**
 * @file ThemeContext.tsx
 * @description Theme Context - tema değerleri ve dark mode desteği sağlar
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 * 
 * **Özellikler:**
 * - Light/Dark/System tema modları
 * - AsyncStorage ile tema tercihini kalıcı saklama
 * - useTheme hook'u ile kolay erişim
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme, type Theme } from '../theme';
import { STORAGE_KEYS } from '@/config/constants';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/** Tema modu seçenekleri */
type ThemeMode = 'light' | 'dark' | 'system';

/** Theme Context değer tipi */
interface ThemeContextValue {
  /** Aktif tema objesi */
  theme: Theme;
  /** Seçili tema modu */
  themeMode: ThemeMode;
  /** Dark mode aktif mi? */
  isDark: boolean;
  /** Tema modunu değiştir */
  setThemeMode: (mode: ThemeMode) => void;
  /** Light/Dark arasında geçiş yap */
  toggleTheme: () => void;
}

// ============================================================================
// CONTEXT CREATION
// ============================================================================

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// ============================================================================
// HOOK
// ============================================================================

/**
 * Theme Context'e erişim için hook
 * ThemeProvider içinde kullanılmalıdır
 * 
 * @throws Error ThemeProvider dışında kullanılırsa hata fırlatır
 * @returns Theme değerleri ve fonksiyonları
 * 
 * @example
 * ```tsx
 * const { theme, isDark, toggleTheme } = useTheme();
 * 
 * <View style={{ backgroundColor: theme.colors.background.primary }}>
 *   <Button onPress={toggleTheme}>
 *     {isDark ? 'Light Mode' : 'Dark Mode'}
 *   </Button>
 * </View>
 * ```
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// ============================================================================
// PROVIDER
// ============================================================================

interface ThemeProviderProps {
  children: React.ReactNode;
}

/**
 * Theme Provider - uygulamaya tema desteği sağlar
 * 
 * @param props - Provider props
 * @param props.children - Alt bileşenler
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');

  // ============================================================================
  // EFFECTS
  // ============================================================================

  /**
   * Mount sırasında kaydedilmiş tema modunu yükle
   */
  useEffect(() => {
    loadThemeMode();
  }, []);

  // ============================================================================
  // FUNCTIONS
  // ============================================================================

  /**
   * AsyncStorage'dan tema modunu yükle
   */
  const loadThemeMode = async () => {
    try {
      const savedMode = await AsyncStorage.getItem(STORAGE_KEYS.THEME_MODE);
      if (savedMode && (savedMode === 'light' || savedMode === 'dark' || savedMode === 'system')) {
        setThemeModeState(savedMode as ThemeMode);
      }
    } catch (error) {
      console.error('Failed to load theme mode:', error);
    }
  };

  /**
   * Tema modunu değiştir ve AsyncStorage'a kaydet
   * 
   * @param mode - Yeni tema modu
   */
  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME_MODE, mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error('Failed to save theme mode:', error);
    }
  }, []);

  /**
   * Light/Dark arasında geçiş yap
   */
  const toggleTheme = useCallback(() => {
    const newMode = isDark ? 'light' : 'dark';
    setThemeMode(newMode);
  }, [isDark, setThemeMode]);

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  /**
   * Dark mode aktif mi?
   * System modundaysa sistem tercihine göre, değilse seçili moda göre
   */
  const isDark = useMemo(
    () => themeMode === 'dark' || (themeMode === 'system' && systemColorScheme === 'dark'),
    [themeMode, systemColorScheme]
  );

  /**
   * Aktif tema objesi
   * Dark mode'a göre light veya dark theme seç
   */
  const currentTheme = useMemo(
    () => (isDark ? darkTheme : lightTheme),
    [isDark]
  );

  /**
   * Context değeri
   */
  const value: ThemeContextValue = useMemo(
    () => ({
      theme: currentTheme,
      themeMode,
      isDark,
      setThemeMode,
      toggleTheme,
    }),
    [currentTheme, themeMode, isDark, setThemeMode, toggleTheme]
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
