/**
 * @file useCongressDetail.ts
 * @description Kongre detay hook'u
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 */

import { useQuery } from '@tanstack/react-query';
import { congressService } from '@/api/services/congress.service';
import { queryKeys } from '@/api/queryKeys';

/**
 * Kongre detay hook'u
 * 
 * @param id - Kongre ID'si
 * @param enabled - Query'nin aktif olup olmadığı
 * @returns Kongre detay bilgisi
 */
export const useCongressDetail = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.congresses.detail(id),
    queryFn: () => congressService.getCongressDetail(id),
    enabled: enabled && id > 0,
    staleTime: 1000 * 60 * 5, // 5 dakika
    gcTime: 1000 * 60 * 10, // 10 dakika
  });
};
