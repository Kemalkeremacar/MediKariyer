import apiClient, { rootApiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { ApiResponse } from '@/types/api';
import {
  AuthResponsePayload,
  LoginPayload,
  DoctorRegistrationPayload,
  DoctorRegistrationResponse,
} from '@/types/auth';

const normalizeAuthResponse = (payload: any): AuthResponsePayload => {
  const accessToken =
    payload?.accessToken ??
    payload?.token ??
    payload?.tokens?.accessToken ??
    payload?.tokens?.token;
  const refreshToken =
    payload?.refreshToken ??
    payload?.tokens?.refreshToken ??
    payload?.tokens?.refresh_token;
  const user = payload?.user;
  const profile = payload?.profile ?? null;

  if (!accessToken || !refreshToken || !user) {
    throw new Error('Sunucudan geçerli kimlik bilgisi alınamadı.');
  }

  return {
    accessToken,
    refreshToken,
    user,
    profile,
  };
};

export const authService = {
  async login(payload: LoginPayload) {
    const response = await apiClient.post<ApiResponse<any>>(
      endpoints.auth.login,
      payload,
    );
    return normalizeAuthResponse(response.data.data);
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

