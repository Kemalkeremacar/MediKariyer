/**
 * @file congress.service.ts
 * @description Congress service - Kongre işlemleri için API servisi
 * 
 * Ana İşlevler:
 * - List congresses (kongre listesi - pagination, filters)
 * - Get congress detail (kongre detayı)
 * 
 * Endpoint'ler: /api/mobile/congresses/*
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 */

import apiClient from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { ApiResponse, PaginationMeta } from '@/types/api';
import { CongressDetail, CongressesResponse, CongressListItem } from '@/types/congress';
import { validatePaginatedResponse, validateSingleItemResponse } from '@/utils/apiValidator';

export interface CongressListParams {
  page?: number;
  limit?: number;
  keyword?: string;
  search?: string;
  city_id?: number | string;
  specialty_id?: number | string;
  subspecialty_id?: number;
  country?: string;
  city?: string;
}

export const congressService = {
  /**
   * Kongre listesini getirir (pagination ve filters ile)
   * @param {CongressListParams} params - Filtreleme ve pagination parametreleri
   * @returns {Promise<CongressesResponse>} Kongre listesi ve pagination bilgisi
   */
  async listCongresses(params: CongressListParams = {}): Promise<CongressesResponse> {
    const response = await apiClient.get<
      ApiResponse<CongressListItem[]> & { pagination?: PaginationMeta }
    >(endpoints.congresses.list, {
      params,
    });
    
    return validatePaginatedResponse<CongressListItem>(response.data, endpoints.congresses.list);
  },

  /**
   * Kongre detayını getirir
   * @param {number} id - Kongre ID'si
   * @returns {Promise<CongressDetail>} Kongre detayı
   */
  async getCongressDetail(id: number): Promise<CongressDetail> {
    const response = await apiClient.get<ApiResponse<CongressDetail>>(
      endpoints.congresses.detail(id),
    );
    
    return validateSingleItemResponse<CongressDetail>(response.data, endpoints.congresses.detail(id));
  },
};
