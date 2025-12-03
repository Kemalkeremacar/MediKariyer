/**
 * Dashboard Feature Hook
 */

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/api/client';
import type { DashboardData, RecentApplication, RecommendedJob } from '../types/dashboard.types';

/**
 * Normalize array values from backend
 * Backend sometimes returns values as arrays [value, value]
 */
const normalizeValue = <T>(value: T | T[]): T => {
  return Array.isArray(value) ? value[0] : value;
};

/**
 * Parse and normalize dashboard data from backend
 */
const parseDashboardData = (rawData: any): DashboardData => {
  // Parse recent applications
  const recent_applications: RecentApplication[] = (rawData.recent_applications || []).map((app: any) => ({
    id: normalizeValue(app.id),
    job_title: normalizeValue(app.job_title),
    hospital_name: normalizeValue(app.hospital_name),
    status_label: normalizeValue(app.status),
    created_at: normalizeValue(app.created_at),
  }));

  // Parse recommended jobs and remove duplicates
  const jobsMap = new Map<number, RecommendedJob>();
  (rawData.recommended_jobs || []).forEach((job: any) => {
    const id = normalizeValue(job.id);
    if (!jobsMap.has(id)) {
      jobsMap.set(id, {
        id,
        title: normalizeValue(job.title),
        hospital_name: normalizeValue(job.hospital_name),
        city_name: normalizeValue(job.city_name),
        specialty_name: normalizeValue(job.specialty),
        is_applied: normalizeValue(job.is_applied),
      });
    }
  });
  const recommended_jobs = Array.from(jobsMap.values());

  return {
    stats: rawData.stats || {
      unread_notifications_count: 0,
      active_applications_count: 0,
      recommended_jobs_count: 0,
      profile_completion_percent: 0,
    },
    recent_applications,
    recommended_jobs,
  };
};

export const useDashboard = () => {
  return useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await apiClient.get('/doctor/dashboard');
      return parseDashboardData(response.data.data);
    },
    retry: 2,
    retryDelay: 1000,
  });
};
