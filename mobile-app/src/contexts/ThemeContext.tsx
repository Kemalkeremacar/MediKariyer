/**
 * @file ThemeContext.tsx
 * @description Theme Context - tema değerleri sağlar
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 * 
 * **Özellikler:**
 * - Light theme desteği
 * - useTheme hook'u ile kolay erişim
 */

import React, { createContext, useContext, useMemo } from 'react';
import { lightTheme, type Theme } from '../theme';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/** Theme Context değer tipi */
interface ThemeContextValue {
  /** Aktif tema objesi */
  theme: Theme;
  /** Dark mode aktif mi? (her zaman false) */
  isDark: boolean;
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
 * @returns Theme değerleri
 * 
 * @example
 * ```tsx
 * const { theme, isDark } = useTheme();
 * 
 * <View style={{ backgroundColor: theme.colors.background.primary }}>
 *   <Text>Current theme: {isDark ? 'Dark' : 'Light'}</Text>
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
  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  /**
   * Context değeri - her zaman light theme döndürür
   */
  const value: ThemeContextValue = useMemo(
    () => ({
      theme: lightTheme,
      isDark: false,
    }),
    []
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};
