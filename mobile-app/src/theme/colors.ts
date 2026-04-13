/**
 * @file colors.ts
 * @description Renk Paleti - Modern, sağlık odaklı renk sistemi
 * 
 * Özellikler:
 * - Light ve dark tema desteği
 * - Web ile tam uyumlu renk paleti (#2563a8 - primary-color)
 * - Tailwind CSS benzeri renk skalası (50-900)
 * - Gradient renkleri (header, button, vb. için)
 * 
 * Kullanım:
 * ```typescript
 * import { colors } from '@/theme';
 * 
 * <View style={{ backgroundColor: colors.primary[600] }} />
 * <Text style={{ color: colors.text.primary }} />
 * ```
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

/**
 * @file colors.ts
 * @description Renk Paleti - Modern, sağlık odaklı renk sistemi
 * 
 * Özellikler:
 * - Light ve dark tema desteği
 * - Web ile tam uyumlu renk paleti (merkezi config'den)
 * - Tailwind CSS benzeri renk skalası (50-900)
 * - Gradient renkleri (header, button, vb. için)
 * 
 * Kullanım:
 * ```typescript
 * import { colors } from '@/theme';
 * 
 * <View style={{ backgroundColor: colors.primary[600] }} />
 * <Text style={{ color: colors.text.primary }} />
 * ```
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import { BRAND_COLORS, THEME_TOKENS } from './config';

export const lightColors = {
  // Merkezi config'den alınan renkler - Web ile tam uyumlu
  primary: BRAND_COLORS.blue, // Web'deki blue paleti
  secondary: {
    50: '#f5f3ff',
    100: '#ede9fe',
    200: '#ddd6fe',
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#764ba2',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
    900: '#4c1d95',
  },
  accent: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
    900: '#581c87',
  },
  success: BRAND_COLORS.success,
  warning: BRAND_COLORS.warning,
  error: BRAND_COLORS.error,
  neutral: BRAND_COLORS.gray,
  background: {
    primary: THEME_TOKENS.BACKGROUND,
    secondary: '#ffffff',
    tertiary: THEME_TOKENS.SURFACE,
    overlay: 'rgba(0, 0, 0, 0.5)',
    card: '#ffffff',
    gradient: 'linear-gradient(135deg, #6096B4 0%, #93BFCF 100%)',
  },
  // Brand gradient colors (used in headers, buttons)
  // Merkezi config'den alınır - Web ile tam uyumlu
  gradient: {
    primary: THEME_TOKENS.PRIMARY_GRADIENT,
    secondary: [BRAND_COLORS.blue[400], THEME_TOKENS.PRIMARY] as const,
    header: THEME_TOKENS.HEADER_GRADIENT,
  },
  text: {
    primary: THEME_TOKENS.TEXT_PRIMARY,
    secondary: THEME_TOKENS.TEXT_SECONDARY,
    tertiary: '#9ca3af',
    inverse: '#ffffff',
    disabled: '#d1d5db',
    muted: '#6b7280',
  },
  border: {
    light: '#f3f4f6',
    medium: THEME_TOKENS.BORDER,
    dark: '#d1d5db',
  },
} as const;

export const darkColors = {
  primary: {
    50: '#1e3a8a',
    100: '#1e40af',
    200: '#1d4ed8',
    300: '#2563eb',
    400: '#3b82f6',
    500: '#60a5fa',
    600: '#93c5fd',
    700: '#bfdbfe',
    800: '#dbeafe',
    900: '#eff6ff',
  },
  secondary: {
    50: '#0f172a',
    100: '#1e293b',
    200: '#334155',
    300: '#475569',
    400: '#64748b',
    500: '#94a3b8',
    600: '#cbd5e1',
    700: '#e2e8f0',
    800: '#f1f5f9',
    900: '#f8fafc',
  },
  accent: {
    50: '#581c87',
    100: '#6b21a8',
    200: '#7e22ce',
    300: '#9333ea',
    400: '#a855f7',
    500: '#c084fc',
    600: '#d8b4fe',
    700: '#e9d5ff',
    800: '#f3e8ff',
    900: '#faf5ff',
  },
  success: {
    50: '#14532d',
    100: '#166534',
    200: '#15803d',
    300: '#16a34a',
    400: '#22c55e',
    500: '#4ade80',
    600: '#86efac',
    700: '#bbf7d0',
    800: '#dcfce7',
    900: '#f0fdf4',
  },
  warning: {
    50: '#78350f',
    100: '#92400e',
    200: '#b45309',
    300: '#d97706',
    400: '#f59e0b',
    500: '#fbbf24',
    600: '#fcd34d',
    700: '#fde68a',
    800: '#fef3c7',
    900: '#fffbeb',
  },
  error: {
    50: '#7f1d1d',
    100: '#991b1b',
    200: '#b91c1c',
    300: '#dc2626',
    400: '#ef4444',
    500: '#f87171',
    600: '#fca5a5',
    700: '#fecaca',
    800: '#fee2e2',
    900: '#fef2f2',
  },
  neutral: {
    50: '#0f172a',
    100: '#1e293b',
    200: '#334155',
    300: '#475569',
    400: '#64748b',
    500: '#94a3b8',
    600: '#cbd5e1',
    700: '#e2e8f0',
    800: '#f1f5f9',
    900: '#f8fafc',
  },
  background: {
    primary: '#0f172a',
    secondary: '#1e293b',
    tertiary: '#334155',
    overlay: 'rgba(0, 0, 0, 0.7)',
    card: '#1e293b',
    gradient: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)',
  },
  // Brand gradient colors (used in headers, buttons)
  gradient: {
    primary: ['#2E5C8A', '#1e3a8a'],
    secondary: ['#1e40af', '#1e3a8a'],
  },
  text: {
    primary: '#f8fafc',
    secondary: '#cbd5e1',
    tertiary: '#94a3b8',
    inverse: '#0f172a',
    disabled: '#475569',
    muted: '#94a3b8',
  },
  border: {
    light: '#334155',
    medium: '#475569',
    dark: '#64748b',
  },
} as const;

// Default export for backward compatibility
export const colors = lightColors;

// Color type definition (flexible to support both light and dark)
export interface Colors {
  primary: Record<50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900, string>;
  secondary: Record<50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900, string>;
  accent: Record<50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900, string>;
  success: Record<50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900, string>;
  warning: Record<50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900, string>;
  error: Record<50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900, string>;
  neutral: Record<50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900, string>;
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    overlay: string;
    card: string;
    gradient: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
    disabled: string;
    muted: string;
  };
  border: {
    light: string;
    medium: string;
    dark: string;
  };
}
