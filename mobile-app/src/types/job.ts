export interface JobListItem {
  id: number;
  title: string | null;
  city_name: string | null;
  specialty: string | null;
  salary_range: string | null;
  work_type: string | null;
  created_at: string | null;
  is_applied: boolean;
  hospital_name: string | null;
  hospital_logo: string | null;
}

export interface JobDetail extends JobListItem {
  description: string | null;
  requirements: string | null;
  benefits: string | null;
  application_deadline: string | null;
  min_experience_years: number | null;
  subspecialty_name: string | null;
  hospital_address: string | null;
  hospital_phone: string | null;
  hospital_email: string | null;
  hospital_website: string | null;
  hospital_about: string | null;
}

export interface JobsResponse {
  data: JobListItem[];
  pagination?: import('./api').PaginationMeta;
}

