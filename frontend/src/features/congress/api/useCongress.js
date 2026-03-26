/**
 * useCongress.js - Kongre Takvimi React Query hooks
 * Backend congressService.js'e uygun olarak tasarlanmış
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../../services/http/client';
import { ENDPOINTS, buildEndpoint, buildQueryString } from '@config/api.js';
import { showToast } from '@/utils/toastUtils';
import { adminQueryConfig } from '@/config/queryConfig.js';

// Query Keys
export const QUERY_KEYS = {
  CONGRESSES: ['congresses'],
  CONGRESS_DETAIL: ['congress'],
  UPCOMING_CONGRESSES: ['congresses', 'upcoming'],
  ADMIN_CONGRESSES: ['admin', 'congresses'],
};

// ============================================================================
// DOCTOR / PUBLIC HOOKS
// ============================================================================

/**
 * Kongre listesini getirir (Doktor)
 * @param {Object} filters - Filtreleme parametreleri
 * @returns {Object} React Query result
 */
export function useCongresses(filters = {}) {
  return useQuery({
    queryKey: [QUERY_KEYS.CONGRESSES, filters],
    queryFn: () => {
      const queryString = buildQueryString(filters);
      return apiRequest.get(`${ENDPOINTS.CONGRESS.LIST}${queryString}`);
    },
    keepPreviousData: true,
  });
}

/**
 * Kongre detayını getirir
 * @param {string|number} congressId - Kongre ID'si
 * @returns {Object} React Query result
 */
export function useCongressById(congressId) {
  return useQuery({
    queryKey: [QUERY_KEYS.CONGRESS_DETAIL, congressId],
    queryFn: () => apiRequest.get(buildEndpoint(ENDPOINTS.CONGRESS.DETAIL, { id: congressId })),
    enabled: !!congressId,
  });
}

/**
 * Yaklaşan kongreleri getirir
 * @param {number} limit - Limit
 * @returns {Object} React Query result
 */
export function useUpcomingCongresses(limit = 10) {
  return useQuery({
    queryKey: [QUERY_KEYS.UPCOMING_CONGRESSES, limit],
    queryFn: () => {
      const queryString = buildQueryString({ limit });
      return apiRequest.get(`${ENDPOINTS.CONGRESS.UPCOMING}${queryString}`);
    },
  });
}

// ============================================================================
// ADMIN HOOKS
// ============================================================================

/**
 * Admin kongre listesini getirir
 * @param {Object} filters - Filtreleme parametreleri
 * @returns {Object} React Query result
 */
export function useAdminCongresses(filters = {}) {
  return useQuery({
    queryKey: [QUERY_KEYS.ADMIN_CONGRESSES, filters],
    queryFn: () => {
      const queryString = buildQueryString(filters);
      return apiRequest.get(`${ENDPOINTS.CONGRESS.LIST}${queryString}`);
    },
    ...adminQueryConfig({ keepPreviousData: true }),
  });
}

/**
 * Kongre oluşturur (Admin)
 * @returns {Object} React Query mutation
 */
export function useCreateCongress() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (congressData) => 
      apiRequest.post(ENDPOINTS.CONGRESS.CREATE, congressData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CONGRESSES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_CONGRESSES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.UPCOMING_CONGRESSES] });
      showToast.success('Kongre başarıyla oluşturuldu');
    },
    onError: (error) => {
      showToast.error(error, { defaultMessage: 'Kongre oluşturulurken hata oluştu' });
    },
  });
}

/**
 * Kongre günceller (Admin)
 * @returns {Object} React Query mutation
 */
export function useUpdateCongress() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => 
      apiRequest.put(buildEndpoint(ENDPOINTS.CONGRESS.UPDATE, { id }), data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CONGRESSES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_CONGRESSES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.UPCOMING_CONGRESSES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CONGRESS_DETAIL, variables.id] });
      showToast.success('Kongre başarıyla güncellendi');
    },
    onError: (error) => {
      showToast.error(error, { defaultMessage: 'Kongre güncellenirken hata oluştu' });
    },
  });
}

/**
 * Kongre siler (Admin)
 * @returns {Object} React Query mutation
 */
export function useDeleteCongress() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => 
      apiRequest.delete(buildEndpoint(ENDPOINTS.CONGRESS.DELETE, { id })),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CONGRESSES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ADMIN_CONGRESSES] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.UPCOMING_CONGRESSES] });
      showToast.success('Kongre başarıyla silindi');
    },
    onError: (error) => {
      showToast.error(error, { defaultMessage: 'Kongre silinirken hata oluştu' });
    },
  });
}
