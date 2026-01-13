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
  status_id?: number;
  keyword?: string;
}

export interface ApplicationsListResponse {
  data: ApplicationListItem[];
  pagination: PaginationMeta;
}

export const applicationService = {
  /**
   * Başvuru listesini getirir (pagination ve status filter ile)
   * @param {ApplicationListParams} params - Filtreleme ve pagination parametreleri
   * @returns {Promise<ApplicationsListResponse>} Başvuru listesi ve pagination bilgisi
   */
  async listApplications(params: ApplicationListParams = {}): Promise<ApplicationsListResponse> {
    const queryParams: Record<string, any> = {
      page: params.page,
      limit: params.limit,
      keyword: params.keyword,
    };
    
    // Backend expects status_id (number)
    if (params.status_id) {
      queryParams.status_id = params.status_id;
    }
    
    const response = await apiClient.get<
      ApiResponse<ApplicationListItem[]> & { pagination?: PaginationMeta }
    >(endpoints.applications.list, {
      params: queryParams,
    });
    const responseData = response.data;
    const pagination = responseData.pagination;
    
    if (!pagination) {
      throw new Error('Pagination bilgisi alınamadı');
    }
    
    return {
      data: responseData.data || [],
      pagination,
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
   * @returns {Promise<void>}
   */
  async withdraw(applicationId: number): Promise<void> {
    await apiClient.patch<ApiResponse<null>>(
      endpoints.applications.withdraw(applicationId),
      {},
    );
  },
};


