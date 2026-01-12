/**
 * @file account.service.ts
 * @description Account Service - Hesap yönetimi işlemleri için API servisi
 * 
 * Ana İşlevler:
 * - Hesap pasifleştirme (deactivate account)
 * 
 * Endpoint'ler: /api/mobile/doctor/account/*
 * 
 * ⚠️ ÖNEMLİ: Hesap pasifleştirme işlemi geri alınamaz!
 * - Kullanıcı artık giriş yapamaz
 * - Tüm oturumlar sonlandırılır
 * - Profil ve veriler saklanır (GDPR uyumlu)
 * - Yeniden aktifleştirme için admin desteği gerekir
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import { apiClient } from '../client';
import { endpoints } from '../endpoints';
import { ApiResponse } from '@/types/api';

// ============================================================================
// ACCOUNT SERVİSİ
// ============================================================================

export const accountService = {
  /**
   * Hesabı pasifleştirir (kapatır)
   * 
   * ⚠️ DİKKAT: Bu işlem geri alınamaz!
   * - Kullanıcının is_active değeri false yapılır
   * - Tüm refresh token'lar geçersiz kılınır
   * - Kullanıcı artık giriş yapamaz
   * - Profil ve veriler saklanır (silinmez)
   * 
   * @returns {Promise<void>}
   * @throws API hatası veya auth hatası
   * 
   * @example
   * try {
   *   await accountService.deactivateAccount();
   *   // Başarılı - kullanıcıyı logout ekranına yönlendir
   * } catch (error) {
   *   // Hata durumunda kullanıcıya bilgi ver
   * }
   */
  async deactivateAccount(): Promise<void> {
    await apiClient.post<ApiResponse<null>>(endpoints.doctor.deactivateAccount);
  },
};
