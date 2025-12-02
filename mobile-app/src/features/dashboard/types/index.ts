/**
 * Dashboard Types
 */

export interface DashboardApplication {
  id: number;
  job_id: number;
  job_title: string | null;
  hospital_name: string | null;
  status: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface DashboardJob {
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

export interface DashboardSummary {
  unread_notifications_count: number;
  profile_completion_percent: number;
  recent_applications: DashboardApplication[];
  recommended_jobs: DashboardJob[];
}
