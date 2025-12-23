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
  
  // Normalize path - handle different formats:
  // - "/uploads/logo.png" -> "/uploads/logo.png"
  // - "uploads/logo.png" -> "/uploads/logo.png"
  // - "logo.png" -> "/uploads/logo.png" (if no uploads prefix)
  let normalizedPath = path.trim();
  
  // If path doesn't start with /, add it
  if (!normalizedPath.startsWith('/')) {
    normalizedPath = `/${normalizedPath}`;
  }
  
  // If path doesn't include 'uploads' prefix, add it
  // Backend'den gelen path'ler genelde "logo22.png" formatında geliyor (uploads prefix'i yok)
  if (!normalizedPath.includes('uploads') && !normalizedPath.startsWith('/api')) {
    // Eğer extension varsa (resim dosyası gibi görünüyorsa), /uploads/ ekle
    // Bu, backend'den gelen "logo22.png" -> "/uploads/logo22.png" dönüşümünü yapar
    if (normalizedPath.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      normalizedPath = `/uploads${normalizedPath}`;
    } else if (normalizedPath.match(/^\/[^\/]+$/)) {
      // Tek seviye path (sadece dosya adı, extension olmasa bile) -> /uploads/ ekle
      normalizedPath = `/uploads${normalizedPath}`;
    }
  }
  
  const fullUrl = `${baseUrl}${normalizedPath}`;
  
  return fullUrl;
};
