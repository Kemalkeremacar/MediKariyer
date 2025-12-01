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
  async listApplications(params: ApplicationListParams = {}) {
    // Backend sendPaginated response formatı:
    // { success, message, data: [...], pagination: {...}, timestamp }
    const response = await apiClient.get<
      ApiResponse<ApplicationListItem[]> & { pagination?: PaginationMeta }
    >(endpoints.applications.list, {
      params,
    });
    const responseData = response.data;
    return {
      data: responseData.data || [],
      meta: responseData.pagination || responseData.meta, // Backend'den pagination olarak geliyor, meta olarak map ediyoruz
    };
  },

  async getApplicationDetail(id: number) {
    const response = await apiClient.get<ApiResponse<ApplicationDetail>>(
      endpoints.applications.detail(id),
    );
    return response.data.data;
  },

  async withdraw(applicationId: number, reason?: string) {
    await apiClient.post<ApiResponse<null>>(
      endpoints.applications.withdraw(applicationId),
      { reason },
    );
  },
};


