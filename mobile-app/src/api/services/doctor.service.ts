import apiClient from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { ApiResponse } from '@/types/api';
import { DashboardSummary } from '@/types/dashboard';

export const doctorService = {
  async getDashboard() {
    const response = await apiClient.get<ApiResponse<DashboardSummary>>(
      endpoints.doctor.dashboard,
    );
    return response.data.data;
  },
};

