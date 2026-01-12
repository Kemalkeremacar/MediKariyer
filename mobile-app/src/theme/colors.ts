/**
 * @file colors.ts
 * @description Renk Paleti - Modern, sağlık odaklı renk sistemi
 * 
 * Özellikler:
 * - Light ve dark tema desteği
 * - Frontend ile uyumlu renk paleti (#3B82F6 - blue-600)
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

export const lightColors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3B82F6', // Modern blue (frontend ile aynı)
    600: '#2563eb', // blue-600 (frontend'de kullanılan ana renk)
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
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
  success: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#DC2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },
  neutral: {
    50: '#ffffff',
    100: '#f9fafb',
    200: '#f3f4f6',
    300: '#e5e7eb',
    400: '#d1d5db',
    500: '#9ca3af',
    600: '#6b7280',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  background: {
    primary: '#F8F9FE',
    secondary: '#ffffff',
    tertiary: '#f9fafb',
    overlay: 'rgba(0, 0, 0, 0.5)',
    card: '#ffffff',
    gradient: 'linear-gradient(135deg, #6096B4 0%, #93BFCF 100%)',
  },
  // Brand gradient colors (used in headers, buttons)
  // Frontend'deki mavi renklerle uyumlu (#3B82F6 - blue-600)
  gradient: {
    primary: ['#3B82F6', '#2563eb'], // blue-500 to blue-600 (frontend ile aynı)
    secondary: ['#60a5fa', '#3B82F6'], // blue-400 to blue-500
    header: ['#3B82F6', '#2563eb', '#1d4ed8'], // blue-500 to blue-600 to blue-700 (frontend ile uyumlu)
  },
  text: {
    primary: '#1F2937',
    secondary: '#6B7280',
    tertiary: '#9ca3af',
    inverse: '#ffffff',
    disabled: '#d1d5db',
    muted: '#6b7280',
  },
  border: {
    light: '#f3f4f6',
    medium: '#e5e7eb',
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
