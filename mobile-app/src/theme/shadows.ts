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
 * - Merkezi config'den renk alır
 */

import { SHADOW_PRESETS } from './config';

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
    shadowColor: SHADOW_PRESETS.color, // Merkezi config'den
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: SHADOW_PRESETS.opacity.sm,
    shadowRadius: 8,
    elevation: 1,
  },
  /** Orta gölge - standart kartlar için */
  md: {
    shadowColor: SHADOW_PRESETS.color, // Merkezi config'den
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: SHADOW_PRESETS.opacity.md,
    shadowRadius: 16,
    elevation: 2,
  },
  /** Büyük gölge - önemli elementler için */
  lg: {
    shadowColor: SHADOW_PRESETS.color, // Merkezi config'den
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: SHADOW_PRESETS.opacity.lg,
    shadowRadius: 20,
    elevation: 3,
  },
  /** Ekstra büyük gölge - modal ve overlay'ler için */
  xl: {
    shadowColor: SHADOW_PRESETS.color, // Merkezi config'den
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: SHADOW_PRESETS.opacity.xl,
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
