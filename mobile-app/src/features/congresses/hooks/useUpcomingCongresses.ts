/**
 * @file useUpcomingCongresses.ts
 * @description Yaklaşan kongreler hook'u
 * 
 * Dashboard için yaklaşan kongreleri getiren hook.
 * Sadece gelecekteki kongreleri döndürür.
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 */

import { useQuery } from '@tanstack/react-query';
import { congressService } from '@/api/services/congress.service';
import { queryKeys } from '@/api/queryKeys';

/**
 * Yaklaşan kongreler hook'u
 * 
 * Dashboard için optimize edilmiş, sadece yaklaşan kongreleri getirir.
 * 
 * @param limit - Kaç kongre getirileceği (default: 3)
 * @returns Yaklaşan kongreler
 */
export const useUpcomingCongresses = (limit: number = 3) => {
  return useQuery({
    queryKey: queryKeys.congresses.list({ limit }),
    queryFn: () => congressService.listCongresses({ limit, page: 1 }),
    staleTime: 1000 * 60 * 5, // 5 dakika
    gcTime: 1000 * 60 * 10, // 10 dakika
    select: (data) => {
      // Sadece gelecekteki kongreleri filtrele
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      
      const upcomingCongresses = data.data.filter((congress) => {
        const endDate = new Date(congress.end_date);
        endDate.setHours(0, 0, 0, 0);
        return endDate >= now;
      });
      
      return upcomingCongresses.slice(0, limit);
    },
  });
};
