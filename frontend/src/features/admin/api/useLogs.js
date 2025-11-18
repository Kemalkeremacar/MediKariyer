/**
 * @file useLogs.js
 * @description Log yönetimi için React Query hooks
 * 
 * Cache Stratejisi:
 * - SEMI_REALTIME: Loglar → 30s cache (log sayfaları için yeterli)
 * 
 * @author MediKariyer Development Team
 * @version 1.1.0
 */

import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import http from '@/services/http/client';
import { showToast } from '@/utils/toastUtils';
import { toastMessages } from '@/config/toast';
import { listQueryConfig } from '@/config/queryConfig.js';

// Mock data for testing
const mockApplicationLogs = {
  logs: [
    {
      id: 1,
      timestamp: new Date().toISOString(),
      level: 'error',
      category: 'api',
      message: 'API çağrısı başarısız oldu',
      user_id: 1,
      ip_address: '192.168.1.1',
      url: '/api/users',
      method: 'GET',
      status_code: 500,
      duration_ms: 2500
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      level: 'warn',
      category: 'auth',
      message: 'Başarısız giriş denemesi',
      user_id: null,
      ip_address: '192.168.1.2',
      url: '/api/auth/login',
      method: 'POST',
      status_code: 401,
      duration_ms: 150
    }
  ],
  total: 2,
  page: 1,
  limit: 50,
  totalPages: 1
};

const mockAuditLogs = {
  logs: [
    {
      id: 1,
      timestamp: new Date().toISOString(),
      actor_id: 1,
      actor_role: 'admin',
      action: 'user.approve',
      resource_type: 'user',
      resource_id: 2,
      actor_name: 'Admin User',
      actor_email: 'admin@medikariyer.com',
      ip_address: '192.168.1.1'
    }
  ],
  total: 1,
  page: 1,
  limit: 50,
  totalPages: 1
};

const mockSecurityLogs = {
  logs: [
    {
      id: 1,
      timestamp: new Date().toISOString(),
      event_type: 'login_failed',
      severity: 'medium',
      message: 'Başarısız giriş denemesi: test@example.com',
      user_id: null,
      email: 'test@example.com',
      ip_address: '192.168.1.3'
    }
  ],
  total: 1,
  page: 1,
  limit: 50,
  totalPages: 1
};

const mockStatistics = {
  period: {
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date().toISOString()
  },
  totals: {
    applicationLogs: 150,
    auditLogs: 25,
    securityLogs: 8
  },
  applicationLogs: {
    byLevel: [
      { level: 'error', count: 5 },
      { level: 'warn', count: 12 },
      { level: 'info', count: 120 },
      { level: 'http', count: 13 }
    ],
    byCategory: [
      { category: 'api', count: 80 },
      { category: 'auth', count: 30 },
      { category: 'database', count: 25 },
      { category: 'business', count: 15 }
    ]
  },
  securityLogs: {
    bySeverity: [
      { severity: 'low', count: 3 },
      { severity: 'medium', count: 4 },
      { severity: 'high', count: 1 }
    ]
  },
  auditLogs: {
    topActions: [
      { action: 'user.approve', count: 8 },
      { action: 'user.login', count: 12 },
      { action: 'job.create', count: 5 }
    ]
  }
};

/**
 * Application loglarını getir
 */
export const useApplicationLogs = (filters = {}, enabled = true) => {
  // Query key için stabil filter objesi oluştur
  const stableFilters = useMemo(() => ({
    level: filters.level || '',
    category: filters.category || '',
    startDate: filters.startDate || '',
    endDate: filters.endDate || '',
    page: filters.page || 1,
    limit: filters.limit || 20
  }), [
    filters.level,
    filters.category,
    filters.startDate,
    filters.endDate,
    filters.page,
    filters.limit
  ]);

  return useQuery({
    queryKey: ['logs', 'application', stableFilters],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        
        Object.entries(stableFilters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value);
          }
        });
        
        const { data } = await http.get(`/logs/application?${params.toString()}`);
        return data.data;
      } catch (error) {
        console.warn('Log API hatası:', error.message);
        // Development modda mock data döndür, production'da hata fırlat
        if (import.meta.env.DEV) {
          console.info('Development mode: Mock data kullanılıyor');
          return mockApplicationLogs;
        }
        throw error;
      }
    },
    ...listQueryConfig({ enabled }), // SEMI_REALTIME: Loglar
  });
};

/**
 * Audit loglarını getir
 */
export const useAuditLogs = (filters = {}, enabled = true) => {
  // Query key için stabil filter objesi oluştur
  const stableFilters = useMemo(() => ({
    action: filters.action || '',
    resourceType: filters.resourceType || '',
    startDate: filters.startDate || '',
    endDate: filters.endDate || '',
    page: filters.page || 1,
    limit: filters.limit || 20
  }), [
    filters.action,
    filters.resourceType,
    filters.startDate,
    filters.endDate,
    filters.page,
    filters.limit
  ]);

  return useQuery({
    queryKey: ['logs', 'audit', stableFilters],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        
        Object.entries(stableFilters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value);
          }
        });
        
        const { data } = await http.get(`/logs/audit?${params.toString()}`);
        return data.data;
      } catch (error) {
        console.warn('Log API hatası:', error.message);
        // Development modda mock data döndür, production'da hata fırlat
        if (import.meta.env.DEV) {
          console.info('Development mode: Mock data kullanılıyor');
          return mockAuditLogs;
        }
        throw error;
      }
    },
    ...listQueryConfig({ enabled }), // SEMI_REALTIME: Audit loglar
  });
};

/**
 * Security loglarını getir
 */
export const useSecurityLogs = (filters = {}, enabled = true) => {
  // Query key için stabil filter objesi oluştur
  const stableFilters = useMemo(() => ({
    eventType: filters.eventType || '',
    severity: filters.severity || '',
    startDate: filters.startDate || '',
    endDate: filters.endDate || '',
    page: filters.page || 1,
    limit: filters.limit || 20
  }), [
    filters.eventType,
    filters.severity,
    filters.startDate,
    filters.endDate,
    filters.page,
    filters.limit
  ]);

  return useQuery({
    queryKey: ['logs', 'security', stableFilters],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        
        Object.entries(stableFilters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, value);
          }
        });
        
        const { data } = await http.get(`/logs/security?${params.toString()}`);
        return data.data;
      } catch (error) {
        console.warn('Log API hatası:', error.message);
        // Development modda mock data döndür, production'da hata fırlat
        if (import.meta.env.DEV) {
          console.info('Development mode: Mock data kullanılıyor');
          return mockSecurityLogs;
        }
        throw error;
      }
    },
    ...listQueryConfig({ enabled }), // SEMI_REALTIME: Audit loglar
  });
};

/**
 * Log istatistiklerini getir
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
      try {
        const params = new URLSearchParams();
        
        if (stableOptions.startDate) params.append('startDate', stableOptions.startDate);
        if (stableOptions.endDate) params.append('endDate', stableOptions.endDate);
        
        const { data } = await http.get(`/logs/statistics?${params.toString()}`);
        return data.data;
      } catch (error) {
        console.warn('Log API hatası:', error.message);
        // Development modda mock data döndür, production'da hata fırlat
        if (import.meta.env.DEV) {
          console.info('Development mode: Mock data kullanılıyor');
          return mockStatistics;
        }
        throw error;
      }
    },
    ...listQueryConfig({ enabled }), // SEMI_REALTIME: İstatistikler
  });
};

/**
 * Log temizleme mutation
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

