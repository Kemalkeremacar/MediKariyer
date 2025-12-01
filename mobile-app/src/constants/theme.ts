/**
 * Modern, kullanıcı dostu renk paleti
 * Tailwind CSS renk sistemine dayalı, tutarlı ve erişilebilir
 */

export const colors = {
  // Primary - Ana marka rengi (Kariyer.net benzeri modern mavi tonları)
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // Modern parlak mavi (Kariyer.net tonlarına yakın)
    600: '#0284c7', // Hover/Active
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },

  // Secondary - İkincil renk (Cyan tonları)
  secondary: {
    50: '#ecfeff',
    100: '#cffafe',
    200: '#a5f3fc',
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
    900: '#164e63',
  },

  // Success - Başarı durumları
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  // Warning - Uyarı durumları
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

  // Error - Hata durumları
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  // Neutral - Gri tonları (Modern, ferah görünüm için)
  neutral: {
    50: '#f8fafc', // Arka plan için çok açık gri (Bembeyaz değil)
    100: '#f1f5f9',
    200: '#e2e8f0', // Border rengi
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b', // İkincil metinler
    600: '#475569',
    700: '#334155',
    800: '#1e293b', // Ana metinler
    900: '#0f172a',
  },

  // Background
  background: {
    primary: '#ffffff',
    secondary: '#f8fafc', // Modern, ferah arka plan
    tertiary: '#f1f5f9',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  // Text
  text: {
    primary: '#111827',
    secondary: '#6b7280',
    tertiary: '#9ca3af',
    inverse: '#ffffff',
    disabled: '#d1d5db',
  },

  // Border
  border: {
    light: '#e5e7eb',
    medium: '#d1d5db',
    dark: '#9ca3af',
  },
} as const;

// Gradient renkleri
export const gradients = {
  primary: ['#2563eb', '#1d4ed8'],
  secondary: ['#06b6d4', '#0891b2'],
  success: ['#22c55e', '#16a34a'],
  warning: ['#f59e0b', '#d97706'],
  error: ['#ef4444', '#dc2626'],
  neutral: ['#6b7280', '#4b5563'],
} as const;

// Shadow stilleri (Yumuşak gölgeler - Modern görünüm)
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, // Biraz daha belirgin
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// Spacing sistemi (8px base)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 48,
} as const;

// Border radius
export const borderRadius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999,
} as const;

// Typography
export const typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
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

