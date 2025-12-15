/**
 * Typography System
 * Font sizes, weights, and line heights
 */

export const typography = {
  fontFamily: {
    ios: '-apple-system',
    android: 'Roboto',
    default: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  fontSize: {
    xs: 12,      // Küçük Metin
    sm: 14,      // Küçük Metin
    base: 15,    // Normal Metin
    md: 16,      // Alt Başlık
    lg: 18,      // Büyük Metin
    xl: 20,      // Büyük Metin
    '2xl': 24,
    '3xl': 28,   // Başlık (Title)
    '4xl': 32,
    '5xl': 36,
  },
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export const textVariants = {
  title: {
    fontSize: typography.fontSize['3xl'], // 28px - Başlık (Title)
    fontWeight: typography.fontWeight.bold, // 700
    lineHeight: typography.lineHeight.tight,
  },
  subtitle: {
    fontSize: typography.fontSize.md, // 15-16px - Alt Başlık
    fontWeight: typography.fontWeight.normal, // 400
    lineHeight: typography.lineHeight.normal,
  },
  h1: {
    fontSize: typography.fontSize['2xl'], // 24pt - Bold for main headings
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight,
  },
  h2: {
    fontSize: typography.fontSize.xl, // 20pt - Bold for section headings
    fontWeight: typography.fontWeight.bold,
    lineHeight: typography.lineHeight.tight,
  },
  h3: {
    fontSize: typography.fontSize.lg, // 18pt - Büyük Metin
    fontWeight: typography.fontWeight.bold, // 700
    lineHeight: typography.lineHeight.tight,
  },
  body: {
    fontSize: typography.fontSize.base, // 15px - Normal Metin
    fontWeight: typography.fontWeight.normal, // 400-600
    lineHeight: typography.lineHeight.normal,
  },
  bodyMedium: {
    fontSize: typography.fontSize.base, // 15px - Normal Metin
    fontWeight: typography.fontWeight.medium, // 500
    lineHeight: typography.lineHeight.normal,
  },
  bodySemibold: {
    fontSize: typography.fontSize.base, // 15px - Normal Metin
    fontWeight: typography.fontWeight.semibold, // 600
    lineHeight: typography.lineHeight.normal,
  },
  bodyLarge: {
    fontSize: typography.fontSize.lg, // 18-20px - Büyük Metin
    fontWeight: typography.fontWeight.bold, // 700
    lineHeight: typography.lineHeight.normal,
  },
  bodySmall: {
    fontSize: typography.fontSize.sm, // 14px - Küçük Metin
    fontWeight: typography.fontWeight.normal, // 400
    lineHeight: typography.lineHeight.normal,
  },
  caption: {
    fontSize: typography.fontSize.xs, // 12px - Küçük Metin
    fontWeight: typography.fontWeight.normal, // 400
    lineHeight: typography.lineHeight.normal,
  },
} as const;

export type Typography = typeof typography;
export type TextVariants = typeof textVariants;
