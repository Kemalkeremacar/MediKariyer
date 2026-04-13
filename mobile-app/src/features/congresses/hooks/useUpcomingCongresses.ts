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
      // Backend artık doğru filtreliyor, sadece limit uygula
      return data.data.slice(0, limit);
    },
  });
};
