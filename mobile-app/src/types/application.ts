export interface ApplicationListItem {
  id: number;
  job_id: number;
  job_title: string | null;
  hospital_name: string | null;
  status: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface ApplicationDetail extends ApplicationListItem {
  cover_letter: string | null;
  notes: string | null;
}

export interface ApplicationsPagination {
  current_page?: number;
  per_page?: number;
  total?: number;
  total_pages?: number;
  has_next?: boolean;
  has_prev?: boolean;
}

export interface ApplicationsResponse {
  data: ApplicationListItem[];
  pagination?: ApplicationsPagination;
}

