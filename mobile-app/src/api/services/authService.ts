/**
 * @file authService.ts
 * @description Authentication service - Kimlik doğrulama işlemleri için API servisi
 * 
 * Ana İşlevler:
 * - Login (email + password)
 * - Register (doktor kaydı)
 * - Refresh token (token yenileme)
 * - Logout (çıkış)
 * - Get me (kullanıcı bilgisi)
 * - Change password (şifre değiştirme)
 * 
 * Endpoint'ler: /api/mobile/auth/*
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

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
  // Backend'den gelen format: { tokens: { accessToken, refreshToken }, user, profile }
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
    console.error('Auth response normalization failed:', {
      hasAccessToken: !!accessToken,
      hasRefreshToken: !!refreshToken,
      hasUser: !!user,
      payloadKeys: payload ? Object.keys(payload) : 'null',
      tokensKeys: payload?.tokens ? Object.keys(payload.tokens) : 'null',
    });
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
    try {
      console.log('🔐 Login attempt:', { email: payload.email, endpoint: endpoints.auth.login });
      const response = await apiClient.post<ApiResponse<any>>(
        endpoints.auth.login,
        payload,
      );
      console.log('✅ Login response received:', {
        hasData: !!response.data,
        hasDataData: !!response.data?.data,
        dataKeys: response.data?.data ? Object.keys(response.data.data) : 'null',
      });
      return normalizeAuthResponse(response.data.data);
    } catch (error: any) {
      console.error('❌ Login error:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        url: error?.config?.url,
      });
      throw error;
    }
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
    await apiClient.post<ApiResponse<null>>(
      endpoints.auth.changePassword,
      payload,
    );
  },
};
