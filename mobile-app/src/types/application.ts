export interface ApplicationListItem {
  id: number;
  job_id: number;
  job_title: string | null;
  hospital_name: string | null;
  status: string | null;
  created_at: string;
  updated_at: string | null;
  // Web ile uyumlu ek alanlar
  city: string | null;
  job_status: string | null;
  is_job_deleted: boolean;
  is_hospital_active: boolean;
}

export interface ApplicationDetail extends ApplicationListItem {
  cover_letter: string | null;
  notes: string | null;
  // Job details
  description: string | null;
  requirements: string | null;
  benefits: string | null;
  employment_type: string | null;
  min_experience_years: number | null;
  city_name: string | null;
  specialty_name: string | null;
  subspecialty_name: string | null;
  // Hospital details
  hospital_address: string | null;
  hospital_phone: string | null;
  hospital_email: string | null;
  hospital_website: string | null;
  hospital_about: string | null;
}

export interface ApplicationsResponse {
  data: ApplicationListItem[];
  pagination?: import('./api').PaginationMeta;
}

