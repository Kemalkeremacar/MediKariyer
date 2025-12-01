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
}

export interface JobDetail extends JobListItem {
  description: string | null;
  requirements: string[];
  benefits: string | null;
  application_deadline: string | null;
}

export interface JobsPagination {
  current_page: number;
  per_page: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface JobsResponse {
  data: JobListItem[];
  pagination?: JobsPagination;
}

