import { useQuery } from '@tanstack/react-query';
import { doctorService } from '@/api/services/doctor.service';

export const useDoctorDashboard = () =>
  useQuery({
    queryKey: ['doctor', 'dashboard'],
    queryFn: doctorService.getDashboard,
    staleTime: 60 * 1000,
  });

