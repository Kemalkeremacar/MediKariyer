/**
 * @file cn.js
 * @description Class Name Utility - Tailwind CSS class birleştirme
 * 
 * Bu dosya, Tailwind CSS class'larını birleştirmek için utility fonksiyon sağlar.
 * clsx ve tailwind-merge kütüphanelerini kullanarak class'ları birleştirir ve
 * çakışmaları çözer.
 * 
 * Ana Özellikler:
 * - Class birleştirme: Birden fazla class'ı birleştirir
 * - Tailwind çakışma çözümü: Aynı utility için çakışan class'ları çözer
 * - Koşullu class'lar: clsx ile koşullu class desteği
 * - Array/Object desteği: Array ve object formatında class desteği
 * 
 * Kullanılan Kütüphaneler:
 * - clsx: Class birleştirme ve koşullu class desteği
 * - tailwind-merge: Tailwind CSS class çakışmalarını çözme
 * 
 * Kullanım:
 * ```javascript
 * import { cn } from '@/utils/cn';
 * 
 * // Basit birleştirme
 * const className = cn('px-4', 'py-2', 'bg-blue-500');
 * 
 * // Koşullu class'lar
 * const className = cn('px-4', {
 *   'bg-blue-500': isActive,
 *   'bg-gray-500': !isActive
 * });
 * 
 * // Tailwind çakışma çözümü
 * const className = cn('px-4', 'px-8'); // Sonuç: 'px-8'
 * ```
 * 
 * Tailwind Merge Avantajları:
 * - Aynı utility için çakışan class'lar otomatik çözülür
 * - Son eklenen class önceliklidir
 * - Örnek: 'px-4' ve 'px-8' birlikte kullanılırsa sadece 'px-8' kalır
 * 
 * @author MediKariyer Development Team
 * @version 2.0.0
 * @since 2024
 */

/**
 * ============================================================================
 * IMPORTS - Kütüphane import'ları
 * ============================================================================
 */

/**
 * clsx kütüphanesi
 * 
 * Class birleştirme ve koşullu class desteği sağlar
 * Birden fazla class'ı birleştirir, array ve object desteği sunar
 */
import { clsx } from 'clsx';

/**
 * tailwind-merge kütüphanesi
 * 
 * Tailwind CSS class çakışmalarını çözer
 * Aynı utility için çakışan class'ları otomatik olarak birleştirir
 * Örnek: 'px-4' ve 'px-8' → sadece 'px-8' kalır
 */
import { twMerge } from 'tailwind-merge';

// ============================================================================
// CLASS NAME UTILITY - Tailwind CSS class birleştirme fonksiyonu
// ============================================================================

/**
 * Class name birleştirme fonksiyonu
 * 
 * Birden fazla class'ı birleştirir ve Tailwind CSS çakışmalarını çözer.
 * clsx ile koşullu class desteği sağlar, tailwind-merge ile çakışmaları çözer.
 * 
 * İşlem Adımları:
 * 1. clsx ile tüm class'ları birleştirir (string, array, object desteği)
 * 2. twMerge ile Tailwind CSS çakışmalarını çözer
 * 
 * @param {...(string|object|array)} inputs - Birleştirilecek class'lar
 * @returns {string} Birleştirilmiş ve çözülmüş class string'i
 * 
 * @example
 * // Basit birleştirme
 * cn('px-4', 'py-2', 'bg-blue-500')
 * // Returns: 'px-4 py-2 bg-blue-500'
 * 
 * @example
 * // Koşullu class'lar (object)
 * cn('px-4', { 'bg-blue-500': isActive })
 * // Returns: 'px-4 bg-blue-500' (if isActive is true)
 * 
 * @example
 * // Array desteği
 * cn(['px-4', 'py-2'], 'bg-blue-500')
 * // Returns: 'px-4 py-2 bg-blue-500'
 * 
 * @example
 * // Tailwind çakışma çözümü
 * cn('px-4', 'px-8')
 * // Returns: 'px-8' (px-4 çakışma nedeniyle kaldırılır)
 * 
 * @example
 * // Karmaşık kullanım
 * cn('base-class', {
 *   'active-class': isActive,
 *   'disabled-class': isDisabled
 * }, condition && 'conditional-class')
 * // Returns: Birleştirilmiş class string'i
 */
export function cn(...inputs) {
  /**
   * clsx ile birleştir
   * 
   * Tüm input'ları (string, array, object) birleştirir
   * Koşullu class'ları işler (object key'leri true ise eklenir)
   */
  const merged = clsx(inputs);
  
  /**
   * tailwind-merge ile çakışmaları çöz
   * 
   * Aynı utility için çakışan class'ları çözer
   * Son eklenen class önceliklidir
   * 
   * Örnek:
   * - Input: 'px-4 bg-blue-500 px-8'
   * - Output: 'bg-blue-500 px-8' (px-4 kaldırılır)
   */
  return twMerge(merged);
}
