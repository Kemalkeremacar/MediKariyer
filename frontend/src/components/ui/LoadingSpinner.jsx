/**
 * @file LoadingSpinner.jsx
 * @description Loading Spinner Bileşeni - Yükleme durumu göstergeleri koleksiyonu
 * 
 * Bu dosya, uygulama genelinde kullanılan tüm yükleme göstergesi bileşenlerini içerir.
 * Farklı durumlar ve kullanım senaryoları için özelleştirilmiş spinner varyantları sunar.
 * 
 * Bileşenler:
 * 1. LoadingSpinner: Temel spinner bileşeni (farklı boyut ve renkler)
 * 2. SkeletonLoader: İçerik placeholder'ı için skeleton yükleme
 * 3. ButtonSpinner: Buton içinde kullanılan küçük spinner
 * 4. PageLoader: Tam sayfa yükleme göstergesi
 * 5. TableLoader: Tablo yükleme göstergesi
 * 6. InlineLoader: Satır içi yükleme göstergesi
 * 
 * Özellikler:
 * - Çoklu boyut desteği: xs, sm, md, lg, xl, 2xl
 * - Çoklu renk desteği: primary, secondary, white, gray, blue, red
 * - Overlay mode: Arka plan üzerinde yükleme göstergesi
 * - Full screen mode: Tam ekran yükleme ekranı
 * - Text desteği: Spinner yanında metin gösterme
 * - Skeleton loading: İçerik placeholder'ı
 * - Responsive: Mobil ve desktop uyumlu
 * 
 * Kullanım Örnekleri:
 * ```jsx
 * // Basit spinner
 * <LoadingSpinner size="md" color="primary" />
 * 
 * // Overlay ile
 * <LoadingSpinner overlay text="Yükleniyor..." />
 * 
 * // Skeleton loader
 * <SkeletonLoader rows={3} width="w-full" />
 * ```
 * 
 * @author MediKariyer Development Team
 * @version 2.0.0
 * @since 2024
 */

import React from 'react';

/**
 * ============================================================================
 * LOADING SPINNER - Temel yükleme göstergesi bileşeni
 * ============================================================================
 * 
 * SVG tabanlı animasyonlu spinner bileşeni
 * 
 * Parametreler:
 * @param {string} size - Spinner boyutu (xs, sm, md, lg, xl, 2xl)
 * @param {string} color - Spinner rengi (primary, secondary, white, gray, blue, red)
 * @param {string} className - Ek CSS sınıfları
 * @param {string} text - Spinner yanında gösterilecek metin
 * @param {boolean} overlay - Arka plan overlay'i göster (varsayılan: false)
 * @param {boolean} fullScreen - Tam ekran modu (varsayılan: false)
 */
const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary', 
  className = '',
  text = null,
  overlay = false,
  fullScreen = false
}) => {
  // Size variants
  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4', 
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
    '2xl': 'w-16 h-16'
  };

  // Color variants
  const colorClasses = {
    primary: 'text-emerald-600',
    secondary: 'text-teal-600',
    white: 'text-white',
    gray: 'text-gray-400',
    blue: 'text-blue-600',
    red: 'text-red-600'
  };

  // Text size based on spinner size
  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl'
  };

  const spinnerClasses = `
    animate-spin 
    ${sizeClasses[size]} 
    ${colorClasses[color]} 
    ${className}
  `.trim();

  const Spinner = () => (
    <svg 
      className={spinnerClasses}
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  const SpinnerWithText = () => (
    <div className="flex flex-col items-center space-y-2">
      <Spinner />
      {text && (
        <p className={`${textSizeClasses[size]} ${colorClasses[color]} font-medium animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  );

  // Overlay wrapper
  if (overlay || fullScreen) {
    const overlayClasses = fullScreen 
      ? 'fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm'
      : 'absolute inset-0 bg-white bg-opacity-75 backdrop-blur-sm z-10';

    return (
      <div className={overlayClasses}>
        <div className="flex items-center justify-center h-full">
          <SpinnerWithText />
        </div>
      </div>
    );
  }

  return text ? <SpinnerWithText /> : <Spinner />;
};

/**
 * ============================================================================
 * SKELETON LOADER - İçerik placeholder yükleme göstergesi
 * ============================================================================
 * 
 * İçerik yüklenirken gösterilen placeholder bileşeni
 * Pulse animasyonu ile içerik yapısını gösterir
 * 
 * Parametreler:
 * @param {string} width - Genişlik (Tailwind class, varsayılan: 'w-full')
 * @param {string} height - Yükseklik (Tailwind class, varsayılan: 'h-4')
 * @param {string} className - Ek CSS sınıfları
 * @param {number} rows - Gösterilecek satır sayısı (varsayılan: 1)
 * @param {boolean} avatar - Avatar placeholder göster (varsayılan: false)
 * @param {boolean} card - Kart placeholder göster (varsayılan: false)
 */
export const SkeletonLoader = ({ 
  width = 'w-full', 
  height = 'h-4', 
  className = '',
  rows = 1,
  avatar = false,
  card = false
}) => {
  if (card) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="bg-gray-200 rounded-lg p-6 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-300 rounded w-1/4"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6"></div>
            <div className="h-4 bg-gray-300 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`animate-pulse ${className}`}>
      {avatar && (
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        {Array.from({ length: rows }, (_, index) => (
          <div 
            key={index}
            className={`bg-gray-300 rounded ${height} ${
              index === rows - 1 ? 'w-2/3' : width
            }`}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * ============================================================================
 * BUTTON SPINNER - Buton içinde kullanılan küçük spinner
 * ============================================================================
 * 
 * Buton içinde gösterilen küçük yükleme göstergesi
 * Genellikle form submit sırasında kullanılır
 * 
 * Parametreler:
 * @param {string} size - Spinner boyutu (varsayılan: 'sm')
 * @param {string} className - Ek CSS sınıfları
 */
export const ButtonSpinner = ({ size = 'sm', className = '' }) => (
  <LoadingSpinner 
    size={size} 
    color="white" 
    className={`mr-2 ${className}`}
  />
);

/**
 * ============================================================================
 * PAGE LOADER - Tam sayfa yükleme göstergesi
 * ============================================================================
 * 
 * Tam sayfa yükleme ekranı için kullanılan bileşen
 * Genellikle sayfa ilk yüklenirken veya büyük veri yüklenirken kullanılır
 * 
 * Parametreler:
 * @param {string} text - Gösterilecek yükleme mesajı (varsayılan: 'Yükleniyor...')
 */
export const PageLoader = ({ text = 'Yükleniyor...' }) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <LoadingSpinner size="xl" color="primary" />
      <p className="mt-4 text-lg text-gray-600 font-medium">{text}</p>
    </div>
  </div>
);

/**
 * ============================================================================
 * TABLE LOADER - Tablo yükleme göstergesi
 * ============================================================================
 * 
 * Tablo verileri yüklenirken gösterilen skeleton placeholder
 * Grid yapısında satır ve sütun gösterir
 * 
 * Parametreler:
 * @param {number} rows - Gösterilecek satır sayısı (varsayılan: 5)
 * @param {number} columns - Gösterilecek sütun sayısı (varsayılan: 4)
 */
export const TableLoader = ({ rows = 5, columns = 4 }) => (
  <div className="animate-pulse">
    <div className="space-y-3">
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }, (_, colIndex) => (
            <div key={colIndex} className="h-4 bg-gray-200 rounded"></div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

/**
 * ============================================================================
 * INLINE LOADER - Satır içi yükleme göstergesi
 * ============================================================================
 * 
 * Metin içinde veya satır içinde kullanılan küçük yükleme göstergesi
 * Genellikle küçük veri yüklemelerinde kullanılır
 * 
 * Parametreler:
 * @param {string} text - Gösterilecek yükleme metni (varsayılan: 'Yükleniyor')
 */
export const InlineLoader = ({ text = 'Yükleniyor' }) => (
  <div className="flex items-center space-x-2 text-gray-600">
    <LoadingSpinner size="sm" color="gray" />
    <span className="text-sm">{text}</span>
  </div>
);

export default LoadingSpinner;