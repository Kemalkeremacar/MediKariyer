/**
 * Spacing Scale
 * 8px base system for consistent spacing
 */

export const spacing = {
  xs: 4,   // Exception: micro-spacing (half of base unit)
  sm: 8,
  md: 16,  // Updated from 12 to comply with 8px grid
  lg: 24,  // Updated from 16 to maintain scale
  xl: 32,  // Updated from 20 to comply with 8px grid
  '2xl': 40,  // Updated from 24 to maintain scale
  '3xl': 48,  // Updated from 32 to maintain scale
  '4xl': 56,  // Updated from 40 to maintain scale
  '5xl': 64,  // Updated from 48 to maintain scale
  '6xl': 72,  // Updated from 64 to maintain scale
} as const;

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
