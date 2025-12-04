import apiClient from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { ApiResponse } from '@/types/api';
import type {
  AuthResponsePayload,
  LoginPayload,
  DoctorRegistrationPayload,
  DoctorRegistrationResponse,
} from '@/types/auth';

/**
 * Normalizes auth response from various API response formats
 */
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

/**
 * Auth service for authentication-related API calls
 */
export const authService = {
  /**
   * Login with email and password
   */
  async login(payload: LoginPayload): Promise<AuthResponsePayload> {
    const response = await apiClient.post<ApiResponse<any>>(
      endpoints.auth.login,
      payload,
    );
    return normalizeAuthResponse(response.data.data);
  },

  /**
   * Register a new doctor account
   */
  async registerDoctor(
    payload: DoctorRegistrationPayload,
  ): Promise<DoctorRegistrationResponse> {
    const response = await apiClient.post<
      ApiResponse<DoctorRegistrationResponse>
    >(endpoints.auth.registerDoctor, payload);
    return response.data.data;
  },

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponsePayload> {
    const response = await apiClient.post<ApiResponse<any>>(
      endpoints.auth.refreshToken,
      { refreshToken },
    );
    return normalizeAuthResponse(response.data.data);
  },

  /**
   * Logout and invalidate refresh token
   */
  async logout(refreshToken: string): Promise<void> {
    await apiClient.post<ApiResponse<null>>(endpoints.auth.logout, {
      refreshToken,
    });
  },

  /**
   * Get current authenticated user data
   */
  async getMe() {
    const response = await apiClient.get<ApiResponse<any>>(endpoints.auth.me);
    return response.data.data.user;
  },

  /**
   * Change password for authenticated user
   */
  async changePassword(payload: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<void> {
    const response = await apiClient.post<ApiResponse<null>>(
      endpoints.auth.changePassword,
      payload,
    );
    return response.data.data;
  },
};
