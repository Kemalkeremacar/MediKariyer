import { colors } from './colors';
import { spacing, borderRadius } from './spacing';
import { typography, textVariants } from './typography';
import { shadows } from './shadows';

export { colors, spacing, borderRadius, typography, textVariants, shadows };

// Theme object for useTheme hook
export const lightTheme = {
  colors,
  spacing,
  borderRadius,
  typography,
  textVariants,
  shadows,
};

export const darkTheme = lightTheme; // For now, same as light theme

export type Theme = typeof lightTheme;
