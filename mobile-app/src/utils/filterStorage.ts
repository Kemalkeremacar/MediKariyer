/**
 * @file filterStorage.ts
 * @description Kullanıcının filtre tercihlerini kalıcı olarak saklama
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 * 
 * **Özellikler:**
 * - İş ilanı filtrelerini kaydetme/yükleme
 * - Başvuru filtrelerini kaydetme/yükleme
 * - Tüm filtreleri temizleme
 * - AsyncStorage kullanarak kalıcı saklama
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { devLog } from './devLogger';

// ============================================================================
// CONSTANTS
// ============================================================================

/** AsyncStorage'da filtrelerin saklandığı key */
const FILTER_STORAGE_KEY = '@medikariyer_filters';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Saklanan filtre yapısı
 */
export interface StoredFilters {
  /** İş ilanı filtreleri */
  jobs?: {
    specialtyId?: number;
    cityId?: number;
    employmentType?: string;
  };
  /** Başvuru filtreleri */
  applications?: {
    status?: string;
  };
}

// ============================================================================
// FILTER STORAGE API
// ============================================================================

export const filterStorage = {
  /**
   * Filtreleri kaydet
   * 
   * @param filters - Kaydedilecek filtreler
   */
  async saveFilters(filters: StoredFilters): Promise<void> {
    try {
      await AsyncStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
    } catch (error) {
      devLog.error('Filter kaydetme hatası:', error);
    }
  },

  /**
   * Filtreleri yükle
   * 
   * @returns Kaydedilmiş filtreler veya null
   */
  async loadFilters(): Promise<StoredFilters | null> {
    try {
      const stored = await AsyncStorage.getItem(FILTER_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      devLog.error('Filter yükleme hatası:', error);
      return null;
    }
  },

  /**
   * Tüm filtreleri temizle
   */
  async clearFilters(): Promise<void> {
    try {
      await AsyncStorage.removeItem(FILTER_STORAGE_KEY);
    } catch (error) {
      devLog.error('Filter temizleme hatası:', error);
    }
  },

  /**
   * Sadece iş ilanı filtrelerini kaydet
   * Mevcut filtreleri koruyarak sadece jobs kısmını günceller
   * 
   * @param jobFilters - İş ilanı filtreleri
   */
  async saveJobFilters(jobFilters: StoredFilters['jobs']): Promise<void> {
    const current = await this.loadFilters();
    await this.saveFilters({
      ...current,
      jobs: jobFilters,
    });
  },

  /**
   * Sadece başvuru filtrelerini kaydet
   * Mevcut filtreleri koruyarak sadece applications kısmını günceller
   * 
   * @param appFilters - Başvuru filtreleri
   */
  async saveApplicationFilters(appFilters: StoredFilters['applications']): Promise<void> {
    const current = await this.loadFilters();
    await this.saveFilters({
      ...current,
      applications: appFilters,
    });
  },
};
