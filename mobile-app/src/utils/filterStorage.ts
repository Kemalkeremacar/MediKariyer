/**
 * @file filterStorage.ts
 * @description Filter persistence - Kullanıcının filter tercihlerini sakla
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const FILTER_STORAGE_KEY = '@medikariyer_filters';

export interface StoredFilters {
  jobs?: {
    specialtyId?: number;
    cityId?: number;
    employmentType?: string;
  };
  applications?: {
    status?: string;
  };
}

export const filterStorage = {
  /**
   * Filtreleri kaydet
   */
  async saveFilters(filters: StoredFilters): Promise<void> {
    try {
      await AsyncStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
    } catch (error) {
      console.error('Filter kaydetme hatası:', error);
    }
  },

  /**
   * Filtreleri yükle
   */
  async loadFilters(): Promise<StoredFilters | null> {
    try {
      const stored = await AsyncStorage.getItem(FILTER_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Filter yükleme hatası:', error);
      return null;
    }
  },

  /**
   * Filtreleri temizle
   */
  async clearFilters(): Promise<void> {
    try {
      await AsyncStorage.removeItem(FILTER_STORAGE_KEY);
    } catch (error) {
      console.error('Filter temizleme hatası:', error);
    }
  },

  /**
   * Sadece job filtrelerini kaydet
   */
  async saveJobFilters(jobFilters: StoredFilters['jobs']): Promise<void> {
    const current = await this.loadFilters();
    await this.saveFilters({
      ...current,
      jobs: jobFilters,
    });
  },

  /**
   * Sadece application filtrelerini kaydet
   */
  async saveApplicationFilters(appFilters: StoredFilters['applications']): Promise<void> {
    const current = await this.loadFilters();
    await this.saveFilters({
      ...current,
      applications: appFilters,
    });
  },
};
