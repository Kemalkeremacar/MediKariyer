/**
 * @file congress.ts
 * @description Kongre ile ilgili TypeScript type tanımları
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 */

import { PaginationMeta } from './api';

/**
 * Kongre liste item'ı (liste görünümü için)
 */
export interface CongressListItem {
  id: number;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  location?: string;
  city?: string;
  country?: string;
  organizer?: string;
  specialty_name?: string;
  subspecialty_name?: string;
  specialties?: Array<{
    id: number;
    name: string;
  }>;
  image_url?: string;
  poster_image_url?: string;
  website_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Kongre detay bilgisi
 */
export interface CongressDetail {
  id: number;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  location?: string;
  city?: string;
  country?: string;
  organizer?: string;
  specialty_id?: number;
  specialty_name?: string;
  subspecialty_id?: number;
  subspecialty_name?: string;
  specialties?: Array<{
    id: number;
    name: string;
  }>;
  image_url?: string;
  poster_image_url?: string;
  website_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Kongre listesi API yanıtı
 */
export interface CongressesResponse {
  data: CongressListItem[];
  pagination?: PaginationMeta;
}
