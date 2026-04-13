/**
 * @file imageOptimizer.ts
 * @description Fotoğraf optimizasyon yardımcıları
 * 
 * Özellikler:
 * - Fotoğraf boyutunu küçültme
 * - Kalite optimizasyonu
 * - Base64 boyut kontrolü
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { MAX_FILE_SIZE } from '@/config/constants';

// ============================================================================
// TİPLER
// ============================================================================

export interface ImageOptimizationOptions {
  /** Maksimum genişlik (px) */
  maxWidth?: number;
  /** Maksimum yükseklik (px) */
  maxHeight?: number;
  /** Kalite (0-1) */
  quality?: number;
  /** Maksimum dosya boyutu (bytes) */
  maxFileSize?: number;
}

export interface OptimizationResult {
  /** Optimize edilmiş fotoğraf URI'si */
  uri: string;
  /** Base64 string */
  base64: string;
  /** Dosya boyutu (bytes) */
  size: number;
  /** Genişlik (px) */
  width: number;
  /** Yükseklik (px) */
  height: number;
}

// ============================================================================
// YARDIMCI FONKSİYONLAR
// ============================================================================

/**
 * Base64 string'in boyutunu hesaplar
 */
const getBase64Size = (base64: string): number => {
  // Base64 padding'i kaldır ve gerçek boyutu hesapla
  const withoutPrefix = base64.replace(/^data:image\/[a-z]+;base64,/, '');
  const withoutPadding = withoutPrefix.replace(/=/g, '');
  return Math.floor((withoutPadding.length * 3) / 4);
};

/**
 * Kalite değerini hesaplar (dosya boyutuna göre)
 */
const calculateQuality = (currentSize: number, targetSize: number, currentQuality: number): number => {
  if (currentSize <= targetSize) return currentQuality;
  
  // Boyut oranına göre kaliteyi azalt
  const ratio = targetSize / currentSize;
  const newQuality = currentQuality * Math.sqrt(ratio);
  
  // Minimum kalite %20
  return Math.max(0.2, Math.min(1, newQuality));
};

// ============================================================================
// ANA FONKSİYONLAR
// ============================================================================

/**
 * Fotoğrafı optimize eder (boyut, kalite, dosya boyutu)
 * 
 * @param uri - Fotoğraf URI'si
 * @param options - Optimizasyon seçenekleri
 * @returns Optimize edilmiş fotoğraf bilgileri
 */
export const optimizeImage = async (
  uri: string,
  options: ImageOptimizationOptions = {}
): Promise<OptimizationResult> => {
  const {
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.8,
    maxFileSize = MAX_FILE_SIZE * 0.75, // Base64 overhead için %75'i kullan
  } = options;

  let currentQuality = quality;
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    try {
      // Fotoğrafı manipüle et
      const result = await manipulateAsync(
        uri,
        [
          {
            resize: {
              width: maxWidth,
              height: maxHeight,
            },
          },
        ],
        {
          compress: currentQuality,
          format: SaveFormat.JPEG,
          base64: true,
        }
      );

      if (!result.base64) {
        throw new Error('Base64 oluşturulamadı');
      }

      // Dosya boyutunu kontrol et
      const base64Size = getBase64Size(result.base64);
      
      if (base64Size <= maxFileSize || attempts === maxAttempts - 1) {
        // Boyut uygun veya son deneme
        return {
          uri: result.uri,
          base64: result.base64,
          size: base64Size,
          width: result.width,
          height: result.height,
        };
      }

      // Kaliteyi azalt ve tekrar dene
      currentQuality = calculateQuality(base64Size, maxFileSize, currentQuality);
      attempts++;
      
    } catch (error) {
      throw new Error(`Fotoğraf optimizasyonu başarısız: ${error}`);
    }
  }

  throw new Error('Fotoğraf boyutu çok büyük, optimize edilemiyor');
};

/**
 * Fotoğraf boyutunu kontrol eder
 * 
 * @param base64 - Base64 string
 * @returns Boyut uygun mu?
 */
export const validateImageSize = (base64: string): boolean => {
  const size = getBase64Size(base64);
  return size <= MAX_FILE_SIZE * 0.75; // Base64 overhead için %75
};

/**
 * Dosya boyutunu human-readable formata çevirir
 * 
 * @param bytes - Byte cinsinden boyut
 * @returns Formatlanmış boyut string'i
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

/**
 * Hızlı fotoğraf optimizasyonu (kayıt için)
 * Daha agresif sıkıştırma uygular
 */
export const optimizeForRegistration = async (uri: string): Promise<OptimizationResult> => {
  return optimizeImage(uri, {
    maxWidth: 600,
    maxHeight: 600,
    quality: 0.7,
    maxFileSize: MAX_FILE_SIZE * 0.6, // Daha küçük boyut
  });
};

/**
 * Profil fotoğrafı optimizasyonu
 * Daha yüksek kalite korur
 */
export const optimizeForProfile = async (uri: string): Promise<OptimizationResult> => {
  return optimizeImage(uri, {
    maxWidth: 800,
    maxHeight: 800,
    quality: 0.85,
    maxFileSize: MAX_FILE_SIZE * 0.75,
  });
};