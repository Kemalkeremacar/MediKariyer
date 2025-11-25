import apiClient from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { ApiResponse } from '@/types/api';
import {
  ApplicationDetail,
  ApplicationsResponse,
} from '@/types/application';

export interface ApplicationListParams {
  page?: number;
  limit?: number;
  status?: string;
}

export const applicationService = {
  async listApplications(params: ApplicationListParams = {}) {
    const response = await apiClient.get<ApiResponse<ApplicationsResponse>>(
      endpoints.applications.list,
      {
        params,
      },
    );
    return response.data.data;
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


