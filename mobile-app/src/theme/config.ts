/**
 * @file config.ts
 * @description Merkezi Tema Konfigürasyonu - Web ile tam uyumlu renk sistemi
 * 
 * Bu dosya, web'deki Tailwind config'e benzer şekilde tüm renkleri merkezi olarak yönetir.
 * Web'deki blue.600 (#2563A8) ve diğer renklerle tam uyumlu.
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

// ============================================================================
// BRAND COLORS - Web ile tam uyumlu
// ============================================================================

/**
 * Ana marka renkleri - Web'deki Tailwind config ile birebir aynı
 */
export const BRAND_COLORS = {
  // Web'deki blue paleti (Tailwind override)
  blue: {
    50: '#F3F8FF',
    100: '#E2EFFF', 
    200: '#C2DEFF',
    300: '#93C5FF',
    400: '#5EA6FF',
    500: '#2F7FE6',
    600: '#2563A8', // Web ile birebir aynı - Ana marka rengi
    700: '#1F4F86', // Web ile birebir aynı - Koyu mavi
    800: '#1B3F6B',
    900: '#173558',
  },
  
  // Web'deki primary paleti
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE', 
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  // Sistem renkleri - Tam palet
  success: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
  },
  
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B', 
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  
  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },

  // Gri tonları
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
} as const;

// ============================================================================
// THEME TOKENS - Kullanım kolaylığı için
// ============================================================================

/**
 * Ana tema token'ları - Kolay erişim için
 */
export const THEME_TOKENS = {
  // Ana marka rengi (web'deki blue.600)
  PRIMARY: BRAND_COLORS.blue[600], // '#2563A8'
  PRIMARY_DARK: BRAND_COLORS.blue[700], // '#1F4F86'
  PRIMARY_LIGHT: BRAND_COLORS.blue[500], // '#2F7FE6'
  
  // Gradient kombinasyonları
  PRIMARY_GRADIENT: [BRAND_COLORS.blue[600], BRAND_COLORS.blue[700]],
  HEADER_GRADIENT: [BRAND_COLORS.blue[600], BRAND_COLORS.blue[700], BRAND_COLORS.blue[800]],
  
  // Sistem renkleri
  SUCCESS: BRAND_COLORS.success[500],
  WARNING: BRAND_COLORS.warning[500],
  ERROR: BRAND_COLORS.error[500],
  
  // Gri tonları
  TEXT_PRIMARY: BRAND_COLORS.gray[900],
  TEXT_SECONDARY: BRAND_COLORS.gray[600],
  BORDER: BRAND_COLORS.gray[200],
  BACKGROUND: '#FFFFFF',
  SURFACE: BRAND_COLORS.gray[50],
} as const;

// ============================================================================
// COMPONENT PRESETS - Bileşen özel ayarları
// ============================================================================

/**
 * Header presets - GradientHeader için
 */
export const HEADER_PRESETS = {
  primary: THEME_TOKENS.HEADER_GRADIENT,
  profile: THEME_TOKENS.HEADER_GRADIENT, // Aynı gradient
};

/**
 * Icon presets - İkon renkleri için
 */
export const ICON_PRESETS = {
  blue: THEME_TOKENS.PRIMARY_GRADIENT,
  primary: THEME_TOKENS.PRIMARY_GRADIENT,
  teal: THEME_TOKENS.PRIMARY_GRADIENT, // Teal de aynı mavi
  purple: [BRAND_COLORS.primary[600], BRAND_COLORS.primary[700]], // Purple preset eklendi
  green: [BRAND_COLORS.success[600], BRAND_COLORS.success[500]] as [string, string],
  orange: [BRAND_COLORS.warning[600], BRAND_COLORS.warning[500]] as [string, string],
  red: [BRAND_COLORS.error[600], BRAND_COLORS.error[500]] as [string, string],
};

/**
 * Button presets - Buton renkleri için
 */
export const BUTTON_PRESETS = {
  primary: {
    background: THEME_TOKENS.PRIMARY,
    gradient: THEME_TOKENS.PRIMARY_GRADIENT,
    shadow: THEME_TOKENS.PRIMARY,
    text: '#FFFFFF',
  },
  secondary: {
    background: THEME_TOKENS.PRIMARY,
    gradient: THEME_TOKENS.PRIMARY_GRADIENT,
    shadow: THEME_TOKENS.PRIMARY,
    text: '#FFFFFF',
  },
  outline: {
    border: THEME_TOKENS.PRIMARY,
    text: THEME_TOKENS.PRIMARY,
  },
  ghost: {
    text: THEME_TOKENS.PRIMARY,
  },
  destructive: {
    background: BRAND_COLORS.error[500],
    gradient: [BRAND_COLORS.error[500], BRAND_COLORS.error[600]],
    shadow: BRAND_COLORS.error[500],
    text: '#FFFFFF',
  },
};

/**
 * Shadow presets - Gölge renkleri için
 */
export const SHADOW_PRESETS = {
  color: THEME_TOKENS.PRIMARY, // Tüm gölgeler ana renk
  opacity: {
    sm: 0.04,
    md: 0.06,
    lg: 0.08,
    xl: 0.1,
  },
} as const;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type BrandColors = typeof BRAND_COLORS;
export type ThemeTokens = typeof THEME_TOKENS;
export type HeaderPresets = typeof HEADER_PRESETS;
export type IconPresets = typeof ICON_PRESETS;
export type ButtonPresets = typeof BUTTON_PRESETS;
export type ShadowPresets = typeof SHADOW_PRESETS;

// ============================================================================
// VALIDATION - Renklerin doğru olduğunu kontrol et
// ============================================================================

// Web ile uyumluluk kontrolü
const WEB_COLORS = {
  PRIMARY: '#2563A8', // Web'deki --primary-color
  PRIMARY_DARK: '#1F4F86', // Web'deki --primary-dark
} as const;

// Runtime kontrol (development'ta)
if (__DEV__) {
  if (THEME_TOKENS.PRIMARY !== WEB_COLORS.PRIMARY) {
    console.warn('🚨 PRIMARY renk web ile uyumsuz!', {
      mobile: THEME_TOKENS.PRIMARY,
      web: WEB_COLORS.PRIMARY,
    });
  }
  
  if (THEME_TOKENS.PRIMARY_DARK !== WEB_COLORS.PRIMARY_DARK) {
    console.warn('🚨 PRIMARY_DARK renk web ile uyumsuz!', {
      mobile: THEME_TOKENS.PRIMARY_DARK,
      web: WEB_COLORS.PRIMARY_DARK,
    });
  }
}

export default {
  BRAND_COLORS,
  THEME_TOKENS,
  HEADER_PRESETS,
  ICON_PRESETS,
  BUTTON_PRESETS,
  SHADOW_PRESETS,
};