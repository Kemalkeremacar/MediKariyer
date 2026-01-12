/**
 * @file imageUrl.ts
 * @description Resim URL yardımcı fonksiyonları
 * 
 * Özellikler:
 * - Relative path'leri full URL'e çevirir
 * - Base64 string'leri olduğu gibi döndürür
 * - Backend'den gelen farklı formatları normalize eder
 * 
 * Kullanım:
 * ```typescript
 * import { getFullImageUrl } from '@/utils/imageUrl';
 * 
 * // Relative path -> Full URL
 * const url = getFullImageUrl('/uploads/logo.png');
 * // -> "http://10.0.2.2:3100/uploads/logo.png"
 * 
 * // Base64 -> Olduğu gibi
 * const base64Url = getFullImageUrl('data:image/jpeg;base64,...');
 * // -> "data:image/jpeg;base64,..."
 * ```
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import { env } from '@/config/env';

/**
 * Relative resim path'ini full URL'e çevirir
 * 
 * Desteklenen formatlar:
 * - Relative path: "/uploads/profiles/photo.jpg"
 * - Base64 string: "data:image/jpeg;base64,..."
 * - Full URL: "http://example.com/image.jpg"
 * - Dosya adı: "logo22.png" (otomatik olarak /uploads/ eklenir)
 * 
 * @param path - Relative path, base64 string veya full URL
 * @returns Full URL, base64 string veya null (path geçersizse)
 * 
 * @example
 * // Backend'den gelen farklı formatlar:
 * getFullImageUrl('/uploads/logo.png') // -> "http://10.0.2.2:3100/uploads/logo.png"
 * getFullImageUrl('logo22.png') // -> "http://10.0.2.2:3100/uploads/logo22.png"
 * getFullImageUrl('data:image/jpeg;base64,...') // -> "data:image/jpeg;base64,..."
 * getFullImageUrl('http://example.com/image.jpg') // -> "http://example.com/image.jpg"
 * getFullImageUrl(null) // -> null
 */
export const getFullImageUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  
  // Base64 string ise (data:image/...), olduğu gibi döndür
  if (path.startsWith('data:image/')) {
    return path;
  }
  
  // Zaten full URL ise, olduğu gibi döndür
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Base URL'den /api/mobile veya /api kısmını kaldır (server root'u al)
  const baseUrl = env.PRIMARY_API_BASE_URL.replace(/\/api.*$/, '');
  
  // Path'i normalize et - farklı formatları handle et:
  // - "/uploads/logo.png" -> "/uploads/logo.png"
  // - "uploads/logo.png" -> "/uploads/logo.png"
  // - "logo.png" -> "/uploads/logo.png" (uploads prefix'i yoksa)
  let normalizedPath = path.trim();
  
  // Path / ile başlamıyorsa, ekle
  if (!normalizedPath.startsWith('/')) {
    normalizedPath = `/${normalizedPath}`;
  }
  
  // Path'te 'uploads' prefix'i yoksa, ekle
  // Backend'den gelen path'ler genelde "logo22.png" formatında geliyor (uploads prefix'i yok)
  if (!normalizedPath.includes('uploads') && !normalizedPath.startsWith('/api')) {
    // Extension varsa (resim dosyası gibi görünüyorsa), /uploads/ ekle
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
