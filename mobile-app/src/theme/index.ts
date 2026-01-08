import { lightColors, darkColors } from './colors';
import { spacing, borderRadius } from './spacing';
import { typography, textVariants } from './typography';
import { shadows } from './shadows';
import { zIndex, getZIndex } from './zIndex';

export { lightColors, darkColors, spacing, borderRadius, typography, textVariants, shadows, zIndex, getZIndex };

// Theme type definition
export type Theme = {
  colors: typeof lightColors | typeof darkColors;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  typography: typeof typography;
  textVariants: typeof textVariants;
  shadows: typeof shadows;
  zIndex: typeof zIndex;
};

// Theme object for useTheme hook
export const lightTheme: Theme = {
  colors: lightColors,
  spacing,
  borderRadius,
  typography,
  textVariants,
  shadows,
  zIndex,
};

export const darkTheme: Theme = {
  colors: darkColors,
  spacing,
  borderRadius,
  typography,
  textVariants,
  shadows,
  zIndex,
};

// Default export for backward compatibility
export const colors = lightColors;
