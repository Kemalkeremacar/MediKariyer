/**
 * Spacing Scale
 * 8px base system for consistent spacing
 */

export const spacing = {
  xs: 4,   // Micro-spacing
  sm: 8,   // Small spacing
  md: 12,  // Kartlar arası (12-16px)
  lg: 16,  // İç padding (16-20px)
  xl: 20,  // İç padding (16-20px)
  '2xl': 24,  // Sayfa padding (24px)
  '3xl': 32,  // Large spacing
  '4xl': 40,  // Extra large spacing
  '5xl': 48,  // XXL spacing
  '6xl': 64,  // XXXL spacing
} as const;

export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,   // Kartlar için (12-16px)
  lg: 16,   // Kartlar için (12-16px)
  xl: 20,
  '2xl': 24,
  '3xl': 40, // Profil resimleri için (40px)
  header: 30, // Header bottom radius
  full: 9999,
} as const;

export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
