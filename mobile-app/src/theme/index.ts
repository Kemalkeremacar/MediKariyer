/**
 * Theme System
 * Unified export of all theme tokens with light and dark variants
 */

import { lightColors, darkColors, colors, type Colors } from './colors';
import { spacing, borderRadius, type Spacing, type BorderRadius } from './spacing';
import { typography, textVariants, type Typography, type TextVariants } from './typography';
import { shadows, type Shadows } from './shadows';

// Re-export individual modules
export { lightColors, darkColors, colors } from './colors';
export { spacing, borderRadius } from './spacing';
export { typography, textVariants } from './typography';
export { shadows } from './shadows';

// Re-export types
export type { Colors } from './colors';
export type { Spacing, BorderRadius } from './spacing';
export type { Typography, TextVariants } from './typography';
export type { Shadows } from './shadows';

// Theme type definition (flexible to support both light and dark)
export interface Theme {
  colors: Colors;
  spacing: Spacing;
  borderRadius: BorderRadius;
  typography: Typography;
  textVariants: TextVariants;
  shadows: Shadows;
}

// Light theme object
export const lightTheme: Theme = {
  colors: lightColors,
  spacing,
  borderRadius,
  typography,
  textVariants,
  shadows,
};

// Dark theme object
export const darkTheme: Theme = {
  colors: darkColors,
  spacing,
  borderRadius,
  typography,
  textVariants,
  shadows,
};

// Default theme (light)
export const theme = lightTheme;
