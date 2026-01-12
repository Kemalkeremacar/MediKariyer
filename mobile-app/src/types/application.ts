/**
 * @file application.ts
 * @description Başvuru tip tanımları
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 * 
 * **Özellikler:**
 * - Başvuru listesi öğeleri
 * - Başvuru detay bilgileri
 * - Backend API yanıt yapıları
 */

// ============================================================================
// APPLICATION LIST
// ============================================================================

/**
 * Başvuru listesi öğesi
 * Liste ekranında gösterilen temel başvuru bilgileri
 */
export interface ApplicationListItem {
  /** Başvuru ID */
  id: number;
  /** İş ilanı ID */
  job_id: number;
  /** İş ilanı başlığı */
  job_title: string | null;
  /** Hastane adı */
  hospital_name: string | null;
  /** Başvuru durumu (Türkçe) */
  status: string | null;
  /** Başvuru durum ID */
  status_id: number | null;
  /** Oluşturulma tarihi */
  created_at: string;
  /** Güncellenme tarihi */
  updated_at: string | null;
  
  // Web ile uyumlu ek alanlar
  /** Şehir */
  city: string | null;
  /** İş ilanı durumu */
  job_status: string | null;
  /** İş ilanı silinmiş mi? */
  is_job_deleted: boolean;
  /** Hastane aktif mi? */
  is_hospital_active: boolean;
}

// ============================================================================
// APPLICATION DETAIL
// ============================================================================

/**
 * Başvuru detay bilgileri
 * Detay ekranında gösterilen tüm başvuru bilgileri
 */
export interface ApplicationDetail extends ApplicationListItem {
  /** Ön yazı */
  cover_letter: string | null;
  /** Notlar */
  notes: string | null;
  
  // İş ilanı detayları
  /** İş tanımı */
  description: string | null;
  /** Gereksinimler */
  requirements: string | null;
  /** Yan haklar */
  benefits: string | null;
  /** İstihdam tipi */
  employment_type: string | null;
  /** Minimum deneyim yılı */
  min_experience_years: number | null;
  /** Şehir adı */
  city_name: string | null;
  /** Branş adı */
  specialty_name: string | null;
  /** Alt branş adı */
  subspecialty_name: string | null;
  
  // Hastane detayları
  /** Hastane adresi */
  hospital_address: string | null;
  /** Hastane telefonu */
  hospital_phone: string | null;
  /** Hastane e-posta */
  hospital_email: string | null;
  /** Hastane web sitesi */
  hospital_website: string | null;
  /** Hastane hakkında */
  hospital_about: string | null;
}

// ============================================================================
// API RESPONSES
// ============================================================================

/**
 * Başvurular API yanıtı
 * GET /api/mobile/doctor/applications
 */
export interface ApplicationsResponse {
  /** Başvuru listesi */
  data: ApplicationListItem[];
  /** Pagination bilgisi (opsiyonel) */
  pagination?: import('./api').PaginationMeta;
}
