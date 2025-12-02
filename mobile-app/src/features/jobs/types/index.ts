/**
 * Job Feature Types
 * Type definitions specific to the jobs feature
 */

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
  hasMore?: boolean;
  page?: number;
}

export interface JobsResponse {
  data: JobListItem[];
  pagination?: JobsPagination;
}

export interface JobFilters {
  search?: string;
  city_id?: number;
  specialty_id?: number;
  subspecialty_id?: number;
}

export type JobSortOption = 'recommended' | 'newest' | 'oldest';

export interface JobFilterState extends JobFilters {
  sortBy?: JobSortOption;
}
