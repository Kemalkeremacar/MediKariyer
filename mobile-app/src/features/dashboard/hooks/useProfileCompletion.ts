import { useQuery } from '@tanstack/react-query';
import { profileService } from '@/api/services/profile.service';

export const useProfileCompletion = () => {
  const { data: completionData, isLoading, error } = useQuery({
    queryKey: ['profile-completion'],
    queryFn: profileService.getProfileCompletion,
  });

  return {
    completionPercentage: completionData?.completion_percent ?? 0,
    sectionStatuses: {
      personalInfo: (completionData?.completion_percent ?? 0) > 0,
      education: false,
      experience: false,
      certificates: false,
      languages: false,
    },
    isLoading,
    error,
  };
};
