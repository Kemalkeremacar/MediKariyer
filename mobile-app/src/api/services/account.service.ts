/**
 * Account Service
 * Hesap yönetimi işlemleri (hesap kapatma vb.)
 * 
 * Not: Mobile kendi backend'ini kullanıyor (/api/mobile/doctor/account/...)
 */

import { apiClient } from '../client';
import { endpoints } from '../endpoints';
import { ApiResponse } from '@/types/api';

export const accountService = {
  /**
   * Hesabı pasifleştirir (kapatır)
   * Bu işlem geri alınamaz ve tüm oturumları sonlandırır.
   */
  async deactivateAccount(): Promise<void> {
    await apiClient.post<ApiResponse<null>>(endpoints.doctor.deactivateAccount);
  },
};
