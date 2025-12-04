import { useQuery } from '@tanstack/react-query';
import { profileService } from '@/api/services/profile.service';
import { jobService } from '@/api/services/job.service';
import { useProfileCompletion } from './useProfileCompletion';

export const useDashboardData = () => {
  const { data: profileData, isLoading: profileLoading, error: profileError } = useQuery({
    queryKey: ['profile'],
    queryFn: profileService.getProfile,
  });

  const { data: statsData, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // Mock data - replace with actual API call
      return {
        activeJobsCount: 12,
        pendingApplicationsCount: 3,
        pendingChangesCount: 1,
      };
    },
  });

  const { data: recommendedJobs, isLoading: jobsLoading, error: jobsError } = useQuery({
    queryKey: ['recommended-jobs'],
    queryFn: async () => {
      const response = await jobService.listJobs({ page: 1, limit: 5 });
      return response.data;
    },
  });

  const { completionPercentage, sectionStatuses } = useProfileCompletion();

  return {
    profile: profileData,
    stats: statsData,
    recommendedJobs: recommendedJobs || [],
    completionPercentage,
    sectionStatuses,
    isLoading: profileLoading || statsLoading || jobsLoading,
    error: profileError || statsError || jobsError,
  };
};
