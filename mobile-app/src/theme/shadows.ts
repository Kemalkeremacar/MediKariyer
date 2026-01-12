/**
 * @file shadows.ts
 * @description Gölge stilleri - derinlik ve hiyerarşi için modern, yumuşak elevation sistemi
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 * 
 * **Özellikler:**
 * - Temiz, modern görünüm için düşük opacity'li pastel gölgeler
 * - 5 farklı gölge seviyesi (none, sm, md, lg, xl)
 * - iOS ve Android için uyumlu
 */

// ============================================================================
// SHADOW DEFINITIONS
// ============================================================================

export const shadows = {
  /** Gölge yok - şeffaf */
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  /** Küçük gölge - hafif yükselme */
  sm: {
    shadowColor: '#6366F1', // Yumuşak indigo tonu
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  /** Orta gölge - standart kartlar için */
  md: {
    shadowColor: '#6366F1', // Yumuşak indigo tonu
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  /** Büyük gölge - önemli elementler için */
  lg: {
    shadowColor: '#6366F1', // Yumuşak indigo tonu
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 3,
  },
  /** Ekstra büyük gölge - modal ve overlay'ler için */
  xl: {
    shadowColor: '#6366F1', // Yumuşak indigo tonu
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 4,
  },
} as const;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Shadows tip tanımı
 */
export type Shadows = typeof shadows;
