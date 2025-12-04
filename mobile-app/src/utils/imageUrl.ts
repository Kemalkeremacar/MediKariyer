/**
 * Image URL utility functions
 * Converts relative image paths to full URLs
 */

import { env } from '@/config/env';

/**
 * Converts a relative image path to a full URL
 * @param path - Relative path (e.g., "/uploads/profiles/photo.jpg") or base64 string
 * @returns Full URL, base64 string, or null if path is invalid
 */
export const getFullImageUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  
  // If it's a base64 string (data:image/...), return as is
  if (path.startsWith('data:image/')) {
    return path;
  }
  
  // If already a full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Remove /api/mobile or /api from base URL to get server root
  const baseUrl = env.PRIMARY_API_BASE_URL.replace(/\/api.*$/, '');
  
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${baseUrl}${normalizedPath}`;
};
