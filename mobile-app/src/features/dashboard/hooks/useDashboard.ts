/**
 * useDashboard Hook - Fetches dashboard data for the authenticated doctor
 */

import { useQuery } from '@tanstack/react-query';
import { doctorService } from '@/api/services/doctor.service';

export const useDashboard = () =>
  useQuery({
    queryKey: ['doctor', 'dashboard'],
    queryFn: doctorService.getDashboard,
    staleTime: 60 * 1000, // 1 minute
  });
