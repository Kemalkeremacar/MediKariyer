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
import { devLog } from '@/utils/devLogger';
import type {
  AuthResponsePayload,
  LoginPayload,
  DoctorRegistrationPayload,
  DoctorRegistrationResponse,
} from '@/types/auth';

/**
 * Çeşitli API yanıt formatlarından auth yanıtını normalize eder
 * @description Backend'den farklı formatlarda gelebilen auth yanıtlarını standart formata çevirir
 * @param payload - API'den gelen ham veri
 * @returns Normalize edilmiş auth yanıtı
 * @throws Token veya kullanıcı bilgisi eksikse hata fırlatır
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
    devLog.error('Auth yanıtı normalize edilemedi:', {
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
 * Kimlik doğrulama servisi
 * @description Auth ile ilgili tüm API çağrılarını yönetir
 */
export const authService = {
  /**
   * Email ve şifre ile giriş yap
   * @param payload - Login bilgileri (email, password)
   * @returns Auth yanıtı (tokens, user, profile)
   * @throws API hatası veya network hatası
   */
  async login(payload: LoginPayload): Promise<AuthResponsePayload> {
    try {
      devLog.log('🔐 Login denemesi:', { email: payload.email, endpoint: endpoints.auth.login });
      const response = await apiClient.post<ApiResponse<any>>(
        endpoints.auth.login,
        payload,
      );
      devLog.log('✅ Login yanıtı alındı:', {
        hasData: !!response.data,
        hasDataData: !!response.data?.data,
        dataKeys: response.data?.data ? Object.keys(response.data.data) : 'null',
      });
      return normalizeAuthResponse(response.data.data);
    } catch (error: any) {
      devLog.error('❌ Login hatası:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        url: error?.config?.url,
      });
      throw error;
    }
  },

  /**
   * Yeni doktor hesabı kaydı
   * @param payload - Doktor kayıt bilgileri
   * @returns Kayıt yanıtı (user, profile)
   * @throws API hatası veya validasyon hatası
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
   * Refresh token kullanarak access token yenile
   * @param refreshToken - Refresh token
   * @returns Yeni auth yanıtı (tokens, user)
   * @throws Token geçersizse veya süresi dolmuşsa hata
   */
  async refreshToken(refreshToken: string): Promise<AuthResponsePayload> {
    const response = await apiClient.post<ApiResponse<any>>(
      endpoints.auth.refreshToken,
      { refreshToken },
    );
    return normalizeAuthResponse(response.data.data);
  },

  /**
   * Çıkış yap ve refresh token'ı geçersiz kıl
   * @param refreshToken - Geçersiz kılınacak refresh token
   * @returns void
   */
  async logout(refreshToken: string): Promise<void> {
    await apiClient.post<ApiResponse<null>>(endpoints.auth.logout, {
      refreshToken,
    });
  },

  /**
   * Mevcut authenticated kullanıcı verisini getir
   * @returns Kullanıcı verisi
   * @throws Auth hatası (401) veya network hatası
   */
  async getMe() {
    const response = await apiClient.get<ApiResponse<any>>(endpoints.auth.me);
    return response.data.data.user;
  },

  /**
   * Authenticated kullanıcı için şifre değiştir
   * @param payload - Şifre değiştirme bilgileri (currentPassword, newPassword, confirmPassword)
   * @returns void
   * @throws Mevcut şifre yanlışsa veya validasyon hatası
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

  /**
   * Şifre sıfırlama talebi - email'e sıfırlama linki gönderir
   * @param email - Kullanıcı email adresi
   * @returns Başarı durumu ve mesaj
   * @throws Email bulunamazsa veya network hatası
   */
  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<ApiResponse<{ success: boolean; message: string }>>(
      endpoints.auth.forgotPassword,
      { email },
    );
    // Backend'den data field'ı geliyorsa onu kullan, yoksa message'dan oluştur
    if (response.data.data) {
      return response.data.data;
    }
    // Fallback: Eğer data yoksa, response'dan message al
    return {
      success: response.data.success,
      message: response.data.message || 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.',
    };
  },

  /**
   * Token ile şifre sıfırla - email'den gelen token ile şifre değiştirir
   * @param token - Email'den gelen sıfırlama token'ı
   * @param password - Yeni şifre
   * @returns Başarı durumu ve mesaj
   * @throws Token geçersizse veya süresi dolmuşsa hata
   */
  async resetPassword(token: string, password: string): Promise<{ success: boolean; message: string }> {
    // Mobile endpoint kullanıyoruz - POST /api/mobile/auth/reset-password
    const response = await apiClient.post<ApiResponse<{ success: boolean; message: string }>>(
      endpoints.auth.resetPassword,
      { token, new_password: password, confirm_password: password },
    );
    // Backend'den data field'ı geliyorsa onu kullan, yoksa message'dan oluştur
    if (response.data.data) {
      return response.data.data;
    }
    // Fallback: Eğer data yoksa, response'dan message al
    return {
      success: response.data.success,
      message: response.data.message || 'Şifre başarıyla değiştirildi.',
    };
  },

  /**
   * Onboarding tamamlandı olarak işaretle
   * @description Kullanıcının onboarding slides'ını gördüğünü backend'e bildirir
   * @returns void
   * @throws API hatası veya network hatası
   */
  async markOnboardingCompleted(): Promise<void> {
    try {
      await apiClient.post<ApiResponse<null>>(
        endpoints.auth.markOnboardingCompleted,
        {},
        {
          timeout: 10000, // 10 saniye timeout
        }
      );
    } catch (error: any) {
      devLog.error('❌ Onboarding completion failed:', {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });
      throw error;
    }
  },
};
