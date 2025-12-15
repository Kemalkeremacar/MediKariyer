import { lightColors, darkColors } from './colors';
import { spacing, borderRadius } from './spacing';
import { typography, textVariants } from './typography';
import { shadows } from './shadows';

export { lightColors, darkColors, spacing, borderRadius, typography, textVariants, shadows };

// Theme type definition
export type Theme = {
  colors: typeof lightColors | typeof darkColors;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  typography: typeof typography;
  textVariants: typeof textVariants;
  shadows: typeof shadows;
};

// Theme object for useTheme hook
export const lightTheme: Theme = {
  colors: lightColors,
  spacing,
  borderRadius,
  typography,
  textVariants,
  shadows,
};

export const darkTheme: Theme = {
  colors: darkColors,
  spacing,
  borderRadius,
  typography,
  textVariants,
  shadows,
};

// Default export for backward compatibility
export const colors = lightColors;
