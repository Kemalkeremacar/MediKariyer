/**
 * @file spacing.ts
 * @description Boşluk Sistemi - 8px tabanlı tutarlı boşluk sistemi
 * 
 * Özellikler:
 * - 8px base sistem (xs: 4px, sm: 8px, md: 12px, vb.)
 * - Border radius değerleri
 * - Tutarlı spacing için merkezi değerler
 * 
 * Kullanım:
 * ```typescript
 * import { spacing, borderRadius } from '@/theme';
 * 
 * <View style={{ padding: spacing.lg, borderRadius: borderRadius.md }} />
 * ```
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

export const spacing = {
  xs: 4,      // Mikro boşluk
  sm: 8,      // Küçük boşluk
  md: 12,     // Kartlar arası (12-16px)
  lg: 16,     // İç padding (16-20px)
  xl: 20,     // İç padding (16-20px)
  '2xl': 24,  // Sayfa padding (24px)
  '3xl': 32,  // Büyük boşluk
  '4xl': 40,  // Ekstra büyük boşluk
  '5xl': 48,  // XXL boşluk
  '6xl': 64,  // XXXL boşluk
} as const;

export const borderRadius = {
  xs: 6,
  sm: 10,
  md: 14,      // Küçük bileşenler için
  lg: 18,      // Kartlar için (modern)
  xl: 22,
  '2xl': 28,   // Büyük kartlar için
  '3xl': 40,   // Profil resimleri için (40px)
  header: 32,  // Header bottom radius
  full: 9999,  // Tam yuvarlak
} as const;

export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
