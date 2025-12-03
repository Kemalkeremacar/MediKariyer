/**
 * Dashboard Feature Types
 */

export interface DashboardStats {
  unread_notifications_count: number;
  active_applications_count: number;
  recommended_jobs_count: number;
  profile_completion_percent: number;
}

export interface RecentApplication {
  id: number;
  job_title: string;
  hospital_name: string;
  status_label: string;
  created_at: string;
}

export interface RecommendedJob {
  id: number;
  title: string;
  hospital_name: string;
  city_name: string;
  specialty_name: string;
  is_applied: boolean;
}

export interface DashboardData {
  stats: DashboardStats;
  recent_applications: RecentApplication[];
  recommended_jobs: RecommendedJob[];
}
