/**
 * @file job.ts
 * @description İş ilanı tip tanımları
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 * 
 * **Özellikler:**
 * - İş ilanı listesi öğeleri
 * - İş ilanı detay bilgileri
 * - Backend API yanıt yapıları
 */

// ============================================================================
// JOB LIST
// ============================================================================

/**
 * İş ilanı listesi öğesi
 * Liste ekranında gösterilen temel iş ilanı bilgileri
 */
export interface JobListItem {
  /** İş ilanı ID */
  id: number;
  /** İş ilanı başlığı */
  title: string | null;
  /** Şehir adı */
  city_name: string | null;
  /** Branş */
  specialty: string | null;
  /** Alt branş adı */
  subspecialty_name: string | null;
  /** Maaş aralığı */
  salary_range: string | null;
  /** Çalışma tipi */
  work_type: string | null;
  /** Oluşturulma tarihi */
  created_at: string | null;
  /** Başvuru yapılmış mı? */
  is_applied: boolean;
  /** Hastane adı */
  hospital_name: string | null;
  /** Hastane logosu */
  hospital_logo: string | null;
}

// ============================================================================
// JOB DETAIL
// ============================================================================

/**
 * İş ilanı detay bilgileri
 * Detay ekranında gösterilen tüm iş ilanı bilgileri
 */
export interface JobDetail extends JobListItem {
  /** İş tanımı */
  description: string | null;
  /** Gereksinimler */
  requirements: string | null;
  /** Yan haklar */
  benefits: string | null;
  /** Başvuru son tarihi */
  application_deadline: string | null;
  /** Minimum deneyim yılı */
  min_experience_years: number | null;
  /** Alt branş adı */
  subspecialty_name: string | null;
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
 * İş ilanları API yanıtı
 * GET /api/mobile/jobs
 */
export interface JobsResponse {
  /** İş ilanı listesi */
  data: JobListItem[];
  /** Pagination bilgisi (opsiyonel) */
  pagination?: import('./api').PaginationMeta;
}
