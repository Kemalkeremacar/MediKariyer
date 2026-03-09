/**
 * @file useLogs.js
 * @description Log Yönetimi React Query Hooks
 * 
 * Sistem logları için React Query tabanlı veri yönetimi hooks'ları.
 * Üç farklı log tipi için optimize edilmiş API çağrıları sağlar.
 * 
 * Desteklenen Log Tipleri:
 * - Application Logs: Sistem hataları, API çağrıları, performans logları
 * - Audit Logs: Kullanıcı aksiyonları, veri değişiklikleri (kim ne yaptı)
 * - Security Logs: Güvenlik olayları, başarısız giriş denemeleri, yetkisiz erişimler
 * 
 * Optimizasyonlar:
 * - keepPreviousData: Sayfa geçişlerinde smooth UX
 * - staleTime: 10 saniye cache süresi
 * - notifyOnChangeProps: Sadece data/error değişiminde notify
 * 
 * @author MediKariyer Development Team
 * @version 3.0.0
 */

import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import http from '@/services/http/client';
import { showToast } from '@/utils/toastUtils';
import { toastMessages } from '@/config/toast';
import { listQueryConfig } from '@/config/queryConfig.js';

/**
 * Application loglarını getiren hook
 * 
 * @param {Object} filters - Filtreleme parametreleri
 * @param {boolean} enabled - Hook'un aktif olup olmadığı
 * @returns {Object} React Query sonucu
 */
export const useApplicationLogs = (filters = {}, enabled = true) => {
  // Query key için stabil filter objesi oluştur
  const stableFilters = useMemo(() => ({
    level: filters.level || '',
    category: filters.category || '',
    platform: filters.platform || '',
    userId: filters.userId || '',
    requestId: filters.requestId || '',
    search: filters.search || '',
    startDate: filters.startDate || '',
    endDate: filters.endDate || '',
    page: filters.page || 1,
    limit: filters.limit || 20
  }), [
    filters.level,
    filters.category,
    filters.platform,
    filters.userId,
    filters.requestId,
    filters.search,
    filters.startDate,
    filters.endDate,
    filters.page,
    filters.limit
  ]);

  return useQuery({
    queryKey: ['logs', 'application', stableFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      Object.entries(stableFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });
      
      const { data } = await http.get(`/logs/application?${params.toString()}`);
      return data.data;
    },
    enabled: enabled,
    keepPreviousData: true,
    staleTime: 10000, // 10 saniye fresh - daha uzun
    cacheTime: 30000, // 30 saniye cache
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Mount'ta refetch yapma
    refetchInterval: false, // Interval refetch yapma
    notifyOnChangeProps: ['data', 'error'],
    ...listQueryConfig({ enabled }),
  });
};

/**
 * Audit loglarını getiren hook
 * 
 * @param {Object} filters - Filtreleme parametreleri
 * @param {boolean} enabled - Hook'un aktif olup olmadığı
 * @returns {Object} React Query sonucu
 */
export const useAuditLogs = (filters = {}, enabled = true) => {
  // Query key için stabil filter objesi oluştur
  const stableFilters = useMemo(() => ({
    actorId: filters.actorId || '',
    action: filters.action || '',
    resourceType: filters.resourceType || '',
    resourceId: filters.resourceId || '',
    search: filters.search || '',
    startDate: filters.startDate || '',
    endDate: filters.endDate || '',
    page: filters.page || 1,
    limit: filters.limit || 20
  }), [
    filters.actorId,
    filters.action,
    filters.resourceType,
    filters.resourceId,
    filters.search,
    filters.startDate,
    filters.endDate,
    filters.page,
    filters.limit
  ]);

  return useQuery({
    queryKey: ['logs', 'audit', stableFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      Object.entries(stableFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });
      
      const { data } = await http.get(`/logs/audit?${params.toString()}`);
      return data.data;
    },
    enabled: enabled,
    keepPreviousData: true,
    staleTime: 10000,
    cacheTime: 30000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    notifyOnChangeProps: ['data', 'error'],
    ...listQueryConfig({ enabled }),
  });
};

/**
 * Security loglarını getiren hook
 * 
 * @param {Object} filters - Filtreleme parametreleri
 * @param {boolean} enabled - Hook'un aktif olup olmadığı
 * @returns {Object} React Query sonucu
 */
export const useSecurityLogs = (filters = {}, enabled = true) => {
  // Query key için stabil filter objesi oluştur
  const stableFilters = useMemo(() => ({
    eventType: filters.eventType || '',
    severity: filters.severity || '',
    ipAddress: filters.ipAddress || '',
    search: filters.search || '',
    startDate: filters.startDate || '',
    endDate: filters.endDate || '',
    page: filters.page || 1,
    limit: filters.limit || 20
  }), [
    filters.eventType,
    filters.severity,
    filters.ipAddress,
    filters.search,
    filters.startDate,
    filters.endDate,
    filters.page,
    filters.limit
  ]);

  return useQuery({
    queryKey: ['logs', 'security', stableFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      Object.entries(stableFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value);
        }
      });
      
      const { data } = await http.get(`/logs/security?${params.toString()}`);
      return data.data;
    },
    enabled: enabled,
    keepPreviousData: true,
    staleTime: 10000,
    cacheTime: 30000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchInterval: false,
    notifyOnChangeProps: ['data', 'error'],
    ...listQueryConfig({ enabled }),
  });
};

/**
 * Log istatistiklerini getiren hook
 * 
 * @param {Object} options - İstatistik seçenekleri (tarih aralığı vb.)
 * @param {boolean} enabled - Hook'un aktif olup olmadığı
 * @returns {Object} React Query sonucu
 */
export const useLogStatistics = (options = {}, enabled = false) => {
  // Options'ı stabil hale getir (query key için)
  const stableOptions = useMemo(() => ({
    startDate: options.startDate || null,
    endDate: options.endDate || null
  }), [options.startDate, options.endDate]);

  return useQuery({
    queryKey: ['logs', 'statistics', stableOptions],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      if (stableOptions.startDate) params.append('startDate', stableOptions.startDate);
      if (stableOptions.endDate) params.append('endDate', stableOptions.endDate);
      
      const { data } = await http.get(`/logs/statistics?${params.toString()}`);
      return data.data;
    },
    ...listQueryConfig({ enabled }), // SEMI_REALTIME: İstatistikler
  });
};

/**
 * Log temizleme mutation hook'u
 * 
 * Belirtilen gün sayısından eski logları siler.
 * Başarılı işlem sonrası tüm log cache'lerini invalidate eder.
 * 
 * @returns {Object} React Query mutation objesi
 */
export const useCleanupLogs = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (retentionDays = 90) => {
      const { data } = await http.post('/logs/cleanup', { retentionDays });
      return data;
    },
    onSuccess: () => {
      showToast.success(toastMessages.log.clearSuccess);
      
      // Tüm log query'lerini invalidate et
      queryClient.invalidateQueries({ queryKey: ['logs'] });
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Log temizleme başarısız';
      showToast.error(message);
    }
  });
};

