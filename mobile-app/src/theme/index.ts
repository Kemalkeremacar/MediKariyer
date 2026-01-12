/**
 * @file index.ts
 * @description Theme sistem merkezi export dosyası
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 * 
 * **Özellikler:**
 * - Tüm theme modüllerini tek noktadan export etme
 * - Light ve dark theme tanımları
 * - TypeScript tip desteği
 */

import { lightColors, darkColors } from './colors';
import { spacing, borderRadius } from './spacing';
import { typography, textVariants } from './typography';
import { shadows } from './shadows';
import { zIndex, getZIndex } from './zIndex';

// ============================================================================
// EXPORTS
// ============================================================================

export { lightColors, darkColors, spacing, borderRadius, typography, textVariants, shadows, zIndex, getZIndex };

// ============================================================================
// THEME TYPE DEFINITION
// ============================================================================

/**
 * Theme tip tanımı
 * Light ve dark theme'ler için ortak yapı
 */
export type Theme = {
  colors: typeof lightColors | typeof darkColors;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  typography: typeof typography;
  textVariants: typeof textVariants;
  shadows: typeof shadows;
  zIndex: typeof zIndex;
};

// ============================================================================
// THEME OBJECTS
// ============================================================================

/**
 * Light theme objesi
 * useTheme hook'u için kullanılır
 */
export const lightTheme: Theme = {
  colors: lightColors,
  spacing,
  borderRadius,
  typography,
  textVariants,
  shadows,
  zIndex,
};

/**
 * Dark theme objesi
 * useTheme hook'u için kullanılır
 */
export const darkTheme: Theme = {
  colors: darkColors,
  spacing,
  borderRadius,
  typography,
  textVariants,
  shadows,
  zIndex,
};

// ============================================================================
// BACKWARD COMPATIBILITY
// ============================================================================

/**
 * Geriye dönük uyumluluk için default export
 * @deprecated lightColors veya darkColors kullanın
 */
export const colors = lightColors;
