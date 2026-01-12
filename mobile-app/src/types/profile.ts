/**
 * @file profile.ts
 * @description Profil tip tanımları - Backend Mobile API endpoint'lerinden dönen profil yanıtları için
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 * 
 * **Endpoint'ler:**
 * - GET /api/mobile/doctor/profile
 * - GET /api/mobile/doctor/profile/completion
 */

// ============================================================================
// PROFILE TYPES
// ============================================================================

/**
 * Doktor profil bilgileri
 * Veritabanı yapısına göre
 */
export interface DoctorProfile {
  /** Profil ID */
  id: number;
  /** Kullanıcı ID */
  user_id: number;
  /** İsim */
  first_name: string | null;
  /** Soyisim */
  last_name: string | null;
  /** Ünvan */
  title: string | null;
  /** Branş ID */
  specialty_id: number | null;
  /** Branş adı */
  specialty_name: string | null;
  /** Alt branş ID */
  subspecialty_id: number | null;
  /** Alt branş adı */
  subspecialty_name: string | null;
  /** Doğum tarihi */
  dob: string | null;
  /** Telefon numarası */
  phone: string | null;
  /** Profil fotoğrafı URL */
  profile_photo: string | null;
  /** Doğum yeri ID */
  birth_place_id: number | null;
  /** Doğum yeri adı */
  birth_place_name?: string | null;
  /** İkamet şehri ID */
  residence_city_id: number | null;
  /** İkamet şehri adı */
  residence_city_name?: string | null;
  /** Profil tamamlanma yüzdesi */
  completion_percent?: number | null;
  /** Oluşturulma tarihi */
  created_at?: string | null;
  /** Güncellenme tarihi */
  updated_at?: string | null;
}

/**
 * Doktor eğitim bilgisi
 */
export interface DoctorEducation {
  /** Eğitim ID */
  id: number;
  /** Eğitim tipi ID */
  education_type_id: number | null;
  /** Eğitim tipi adı */
  education_type_name?: string | null;
  /** Eğitim tipi (alternatif field) */
  education_type?: string | null;
  /** Eğitim kurumu */
  education_institution: string | null;
  /** Alan/Bölüm */
  field: string | null;
  /** Mezuniyet yılı */
  graduation_year: number | null;
  /** Oluşturulma tarihi */
  created_at?: string | null;
  /** Güncellenme tarihi */
  updated_at?: string | null;
}

/**
 * Doktor deneyim bilgisi
 */
export interface DoctorExperience {
  /** Deneyim ID */
  id: number;
  /** Kurum/Organizasyon */
  organization: string | null;
  /** Pozisyon/Ünvan */
  role_title: string | null;
  /** Branş ID */
  specialty_id: number | null;
  /** Branş adı */
  specialty_name?: string | null;
  /** Alt branş ID */
  subspecialty_id: number | null;
  /** Alt branş adı */
  subspecialty_name?: string | null;
  /** Başlangıç tarihi */
  start_date: string | null;
  /** Bitiş tarihi */
  end_date: string | null;
  /** Halen devam ediyor mu? */
  is_current: boolean;
  /** Açıklama */
  description: string | null;
  /** Oluşturulma tarihi */
  created_at?: string | null;
  /** Güncellenme tarihi */
  updated_at?: string | null;
}

/**
 * Doktor sertifika bilgisi
 */
export interface DoctorCertificate {
  /** Sertifika ID */
  id: number;
  /** Doktor profil ID */
  doctor_profile_id: number | null;
  /** Sertifika adı */
  certificate_name: string | null;
  /** Veren kurum */
  institution: string | null;
  /** Sertifika yılı */
  certificate_year: number | null;
  /** Oluşturulma tarihi */
  created_at?: string | null;
  /** Güncellenme tarihi */
  updated_at?: string | null;
  /** Silinme tarihi (soft delete) */
  deleted_at?: string | null;
}

/**
 * Doktor dil bilgisi
 */
export interface DoctorLanguage {
  /** Dil bilgisi ID */
  id: number;
  /** Dil ID */
  language_id: number | null;
  /** Dil adı */
  language?: string | null;
  /** Seviye ID */
  level_id: number | null;
  /** Seviye adı */
  level?: string | null;
  /** Oluşturulma tarihi */
  created_at?: string | null;
  /** Güncellenme tarihi */
  updated_at?: string | null;
}

/**
 * Tam profil bilgileri
 * Profil + tüm ilişkili veriler
 */
export interface CompleteProfile extends DoctorProfile {
  /** Eğitim bilgileri listesi */
  educations: DoctorEducation[];
  /** Deneyim bilgileri listesi */
  experiences: DoctorExperience[];
  /** Sertifika listesi */
  certificates: DoctorCertificate[];
  /** Dil bilgileri listesi */
  languages: DoctorLanguage[];
}

// ============================================================================
// PROFILE COMPLETION
// ============================================================================

/**
 * Profil Tamamlanma Yanıtı (Backend'den)
 * GET /api/mobile/doctor/profile/completion
 * 
 * **Backend Yanıt Formatı:**
 * ```json
 * {
 *   "success": true,
 *   "data": {
 *     "completion_percentage": number,
 *     "details": {
 *       "personal": { "completed": number, "total": number }
 *     },
 *     "missing_fields": string[]
 *   }
 * }
 * ```
 */
export interface ProfileCompletionResponse {
  /** Tamamlanma yüzdesi */
  completion_percentage: number;
  /** Detaylı bilgiler */
  details?: {
    /** Kişisel bilgiler tamamlanma durumu */
    personal?: { completed: number; total: number };
  };
  /** Eksik alanlar listesi */
  missing_fields?: string[];
}

/**
 * Profil Tamamlanma (Frontend için normalize edilmiş)
 * Backend'den gelen ProfileCompletionResponse'u normalize eder
 */
export interface ProfileCompletion {
  /** Tamamlanma yüzdesi (Backend'den completion_percentage olarak gelir) */
  completion_percent: number;
  /** Doldurulmuş alan sayısı */
  filled_fields: number;
  /** Toplam alan sayısı */
  total_fields: number;
  /** Eksik alanlar listesi */
  missing_fields: string[];
}

// ============================================================================
// PHOTO REQUEST
// ============================================================================

/**
 * Fotoğraf değişiklik talebi
 */
export interface PhotoRequest {
  /** Talep ID */
  id: number;
  /** Doktor profil ID */
  doctor_profile_id: number;
  /** Yeni fotoğraf URL */
  file_url: string;
  /** Talep durumu */
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  /** Red/İptal nedeni */
  reason: string | null;
  /** Oluşturulma tarihi */
  created_at: string;
  /** İncelenme tarihi */
  reviewed_at: string | null;
  /** İnceleyen admin ID */
  reviewed_by: number | null;
  /** Eski fotoğraf URL */
  old_photo: string | null;
}

// ============================================================================
// FORM PAYLOAD TYPES
// ============================================================================

/**
 * Kişisel bilgi güncelleme payload'ı
 * PUT /api/mobile/doctor/profile
 */
export interface UpdatePersonalInfoPayload {
  /** İsim */
  first_name: string;
  /** Soyisim */
  last_name: string;
  /** Ünvan */
  title?: string;
  /** Doğum tarihi */
  dob?: string | null;
  /** Telefon numarası */
  phone?: string | null;
  /** Doğum yeri ID */
  birth_place_id?: number | null;
  /** İkamet şehri ID */
  residence_city_id?: number | null;
  /** Branş ID */
  specialty_id: number;
  /** Alt branş ID */
  subspecialty_id?: number | null;
}

/**
 * Eğitim ekleme payload'ı
 * POST /api/mobile/doctor/educations
 */
export interface CreateEducationPayload {
  /** Eğitim tipi ID */
  education_type_id: number;
  /** Eğitim kurumu */
  education_institution: string;
  /** Alan/Bölüm */
  field: string;
  /** Mezuniyet yılı */
  graduation_year: number;
  /** Eğitim tipi (alternatif field) */
  education_type?: string | null;
}

/**
 * Eğitim güncelleme payload'ı
 * PUT /api/mobile/doctor/educations/:id
 */
export interface UpdateEducationPayload {
  /** Eğitim tipi ID */
  education_type_id?: number;
  /** Eğitim kurumu */
  education_institution?: string;
  /** Alan/Bölüm */
  field?: string;
  /** Mezuniyet yılı */
  graduation_year?: number;
  /** Eğitim tipi (alternatif field) */
  education_type?: string | null;
}

/**
 * Deneyim ekleme payload'ı
 * POST /api/mobile/doctor/experiences
 */
export interface CreateExperiencePayload {
  /** Kurum/Organizasyon */
  organization: string;
  /** Pozisyon/Ünvan */
  role_title: string;
  /** Başlangıç tarihi */
  start_date: string;
  /** Bitiş tarihi */
  end_date?: string | null;
  /** Halen devam ediyor mu? */
  is_current: boolean;
  /** Açıklama */
  description?: string | null;
  /** Branş ID */
  specialty_id: number;
  /** Alt branş ID */
  subspecialty_id?: number | null;
}

/**
 * Deneyim güncelleme payload'ı
 * PUT /api/mobile/doctor/experiences/:id
 */
export interface UpdateExperiencePayload {
  /** Kurum/Organizasyon */
  organization?: string;
  /** Pozisyon/Ünvan */
  role_title?: string;
  /** Başlangıç tarihi */
  start_date?: string;
  /** Bitiş tarihi */
  end_date?: string | null;
  /** Halen devam ediyor mu? */
  is_current?: boolean;
  /** Açıklama */
  description?: string | null;
  /** Branş ID */
  specialty_id?: number;
  /** Alt branş ID */
  subspecialty_id?: number | null;
}

/**
 * Sertifika ekleme payload'ı
 * POST /api/mobile/doctor/certificates
 */
export interface CreateCertificatePayload {
  /** Sertifika adı */
  certificate_name: string;
  /** Veren kurum */
  institution: string;
  /** Sertifika yılı */
  certificate_year: number;
}

/**
 * Sertifika güncelleme payload'ı
 * PUT /api/mobile/doctor/certificates/:id
 */
export interface UpdateCertificatePayload {
  /** Sertifika adı */
  certificate_name?: string;
  /** Veren kurum */
  institution?: string;
  /** Sertifika yılı */
  certificate_year?: number | null;
}

/**
 * Dil ekleme payload'ı
 * POST /api/mobile/doctor/languages
 */
export interface CreateLanguagePayload {
  /** Dil ID */
  language_id: number;
  /** Seviye ID */
  level_id: number;
}

/**
 * Dil güncelleme payload'ı
 * PUT /api/mobile/doctor/languages/:id
 */
export interface UpdateLanguagePayload {
  /** Dil ID */
  language_id?: number;
  /** Seviye ID */
  level_id?: number;
}

/**
 * Fotoğraf yükleme payload'ı
 * POST /api/mobile/doctor/profile/photo
 */
export interface UploadPhotoPayload {
  /** Fotoğraf URL */
  file_url: string;
}

/**
 * Fotoğraf yükleme yanıtı
 */
export interface PhotoUploadResponse {
  /** Oluşturulan fotoğraf talebi */
  request?: PhotoRequest;
}

/**
 * Fotoğraf durum yanıtı
 * GET /api/mobile/doctor/profile/photo/status
 */
export interface PhotoStatusResponse {
  /** Mevcut talep durumu */
  status?: PhotoRequest;
  /** Geçmiş talepler */
  history?: PhotoRequest[];
}
