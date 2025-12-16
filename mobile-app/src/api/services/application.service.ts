/**
 * @file application.service.ts
 * @description Application service - Başvuru işlemleri için API servisi
 * 
 * Ana İşlevler:
 * - List applications (başvuru listesi - pagination, status filter)
 * - Get application detail (başvuru detayı)
 * - Withdraw application (başvuru geri çekme)
 * 
 * Endpoint'ler: /api/mobile/applications/*
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import apiClient from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { ApiResponse, PaginationMeta } from '@/types/api';
import {
  ApplicationDetail,
  ApplicationListItem,
} from '@/types/application';

export interface ApplicationListParams {
  page?: number;
  limit?: number;
  status?: string;
}

export interface ApplicationsListResponse {
  data: ApplicationListItem[];
  meta: PaginationMeta;
}

export const applicationService = {
  /**
   * Başvuru listesini getirir (pagination ve status filter ile)
   * @param {ApplicationListParams} params - Filtreleme ve pagination parametreleri
   * @returns {Promise<ApplicationsListResponse>} Başvuru listesi ve pagination bilgisi
   */
  async listApplications(params: ApplicationListParams = {}): Promise<ApplicationsListResponse> {
    const response = await apiClient.get<
      ApiResponse<ApplicationListItem[]> & { pagination?: PaginationMeta }
    >(endpoints.applications.list, {
      params,
    });
    const responseData = response.data;
    const meta = responseData.pagination || responseData.meta;
    
    if (!meta) {
      throw new Error('Pagination bilgisi alınamadı');
    }
    
    return {
      data: responseData.data || [],
      meta,
    };
  },

  /**
   * Başvuru detayını getirir
   * @param {number} id - Başvuru ID'si
   * @returns {Promise<ApplicationDetail>} Başvuru detayı
   */
  async getApplicationDetail(id: number): Promise<ApplicationDetail> {
    const response = await apiClient.get<ApiResponse<ApplicationDetail>>(
      endpoints.applications.detail(id),
    );
    return response.data.data;
  },

  /**
   * Başvuruyu geri çeker
   * @param {number} applicationId - Başvuru ID'si
   * @param {string} [reason] - Geri çekme nedeni (opsiyonel)
   * @returns {Promise<void>}
   */
  async withdraw(applicationId: number, reason?: string): Promise<void> {
    await apiClient.patch<ApiResponse<null>>(
      endpoints.applications.withdraw(applicationId),
      { reason: reason || '' },
    );
  },
};


