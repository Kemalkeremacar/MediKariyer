import apiClient, { rootApiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { ApiResponse } from '@/types/api';
import {
  AuthResponsePayload,
  LoginPayload,
  DoctorRegistrationPayload,
  DoctorRegistrationResponse,
} from '@/types/auth';

export const authService = {
  async login(payload: LoginPayload) {
    const response = await apiClient.post<ApiResponse<AuthResponsePayload>>(
      endpoints.auth.login,
      payload,
    );
    return response.data.data;
  },

  async registerDoctor(payload: DoctorRegistrationPayload) {
    const response =
      await rootApiClient.post<ApiResponse<DoctorRegistrationResponse>>(
        endpoints.auth.registerDoctor,
        payload,
      );
    return response.data.data;
  },

  async logout() {
    await apiClient.post<ApiResponse<null>>(endpoints.auth.logout);
  },
};

