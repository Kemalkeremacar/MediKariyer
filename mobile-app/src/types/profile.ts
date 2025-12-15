// Profil tipleri - Veritabanı yapısına göre

export interface DoctorProfile {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  title: string | null;
  specialty_id: number;
  specialty_name: string | null;
  subspecialty_id: number | null;
  subspecialty_name: string | null;
  dob: string | null;
  phone: string | null;
  profile_photo: string | null;
  birth_place_id: number | null;
  birth_place_name?: string | null;
  residence_city_id: number | null;
  residence_city_name?: string | null;
  completion_percent?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface DoctorEducation {
  id: number;
  education_type_id: number | null;
  education_type_name?: string | null;
  education_type?: string | null;
  education_institution: string | null;
  field: string | null;
  graduation_year: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface DoctorExperience {
  id: number;
  organization: string | null;
  role_title: string | null;
  specialty_id: number | null;
  specialty_name?: string | null;
  subspecialty_id: number | null;
  subspecialty_name?: string | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  description: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface DoctorCertificate {
  id: number;
  doctor_profile_id: number;
  certificate_name: string;
  institution: string;
  certificate_year: number;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
}

export interface DoctorLanguage {
  id: number;
  language_id: number | null;
  language?: string | null;
  level_id: number | null;
  level?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CompleteProfile extends DoctorProfile {
  educations: DoctorEducation[];
  experiences: DoctorExperience[];
  certificates: DoctorCertificate[];
  languages: DoctorLanguage[];
}

export interface ProfileCompletion {
  completion_percent: number;
  filled_fields: number;
  total_fields: number;
  missing_fields: string[];
}

export interface PhotoRequest {
  id: number;
  doctor_profile_id: number;
  file_url: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  reason: string | null;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: number | null;
  old_photo: string | null;
}

// Form payload tipleri
export interface UpdatePersonalInfoPayload {
  first_name: string;
  last_name: string;
  title?: string;
  dob?: string | null;
  phone?: string | null;
  birth_place_id?: number | null;
  residence_city_id?: number | null;
  specialty_id: number;
  subspecialty_id?: number | null;
}

export interface CreateEducationPayload {
  education_type_id: number;
  education_institution: string;
  field: string;
  graduation_year: number;
  education_type?: string | null;
}

export interface UpdateEducationPayload {
  education_type_id?: number;
  education_institution?: string;
  field?: string;
  graduation_year?: number;
  education_type?: string | null;
}

export interface CreateExperiencePayload {
  organization: string;
  role_title: string;
  start_date: string;
  end_date?: string | null;
  is_current: boolean;
  description?: string | null;
  specialty_id: number;
  subspecialty_id?: number | null;
}

export interface UpdateExperiencePayload {
  organization?: string;
  role_title?: string;
  start_date?: string;
  end_date?: string | null;
  is_current?: boolean;
  description?: string | null;
  specialty_id?: number;
  subspecialty_id?: number | null;
}

export interface CreateCertificatePayload {
  certificate_name: string;
  institution: string;
  certificate_year: number;
}

export interface UpdateCertificatePayload {
  certificate_name?: string;
  institution?: string;
  certificate_year?: number | null;
}

export interface CreateLanguagePayload {
  language_id: number;
  level_id: number;
}

export interface UpdateLanguagePayload {
  language_id?: number;
  level_id?: number;
}

export interface UploadPhotoPayload {
  file_url: string;
}

