/**
 * @file lookup.ts
 * @description Lookup (arama) tip tanımları - branş, şehir, dil vb.
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 * 
 * **Özellikler:**
 * - Branş ve alt branş tipleri
 * - Şehir tipleri
 * - Başvuru durumu tipleri
 * - Eğitim tipi tipleri
 * - Dil ve dil seviyesi tipleri
 */

// ============================================================================
// SPECIALTY TYPES
// ============================================================================

/**
 * Branş (Uzmanlık alanı)
 */
export interface Specialty {
  /** Branş ID */
  id: number;
  /** Branş adı */
  name: string;
  /** Açıklama */
  description?: string | null;
}

/**
 * Alt branş
 */
export interface Subspecialty {
  /** Alt branş ID */
  id: number;
  /** Alt branş adı */
  name: string;
  /** Bağlı olduğu branş ID */
  specialty_id: number;
  /** Açıklama */
  description?: string | null;
}

// ============================================================================
// LOCATION TYPES
// ============================================================================

/**
 * Şehir
 */
export interface City {
  /** Şehir ID */
  id: number;
  /** Şehir adı */
  name: string;
  /** Ülke */
  country?: string | null;
}

// ============================================================================
// APPLICATION STATUS TYPES
// ============================================================================

/**
 * Başvuru durumu
 */
export interface ApplicationStatus {
  /** Durum ID */
  id: number;
  /** Durum adı (Türkçe) */
  name: string;
  /** Backend API için İngilizce değer */
  value?: string;
}

// ============================================================================
// EDUCATION TYPES
// ============================================================================

/**
 * Eğitim tipi
 */
export interface EducationType {
  /** Eğitim tipi ID */
  id: number;
  /** Eğitim tipi adı */
  name: string;
  /** Açıklama */
  description?: string | null;
  /** Zorunlu mu? */
  is_required?: boolean;
}

// ============================================================================
// LANGUAGE TYPES
// ============================================================================

/**
 * Dil
 */
export interface Language {
  /** Dil ID */
  id: number;
  /** Dil adı */
  name: string;
  /** Dil kodu (örn: en, tr) */
  code?: string | null;
}

/**
 * Dil seviyesi
 */
export interface LanguageLevel {
  /** Seviye ID */
  id: number;
  /** Seviye adı (örn: Başlangıç, Orta, İleri) */
  name: string;
  /** Açıklama */
  description?: string | null;
}
