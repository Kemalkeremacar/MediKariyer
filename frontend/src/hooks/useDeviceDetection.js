/**
 * @file useDeviceDetection.js
 * @description Cihaz tipi tespit hook'u - Mobil/Desktop/Tablet tespiti
 * 
 * Bu hook, kullanıcının hangi cihaz tipinden erişim yaptığını tespit eder.
 * User Agent string'i ve ekran boyutlarını analiz ederek cihaz tipini belirler.
 * 
 * Tespit Edilen Cihaz Tipleri:
 * - isMobile: Mobil telefon (iOS/Android)
 * - isTablet: Tablet (iPad/Android Tablet)
 * - isDesktop: Masaüstü/Laptop
 * - isMobileDevice: Mobil telefon veya tablet (mobil cihaz genel)
 * 
 * Kullanım Alanları:
 * - Responsive component davranışları
 * - Mobil-specific özellikler (sidebar gizleme vb.)
 * - Touch vs mouse etkileşim optimizasyonları
 * - Performance optimizasyonları
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import { useState, useEffect } from 'react';

/**
 * Cihaz tipi tespit hook'u
 * @returns {Object} Cihaz tipi bilgileri
 */
export const useDeviceDetection = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isMobileDevice: false, // Mobile phone or tablet
  });

  useEffect(() => {
    const detectDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const screenWidth = window.innerWidth;
      
      // Mobil telefon tespiti
      const mobileRegex = /android|webos|iphone|ipod|blackberry|iemobile|opera mini/i;
      const isMobilePhone = mobileRegex.test(userAgent) && screenWidth < 768;
      
      // Tablet tespiti
      const tabletRegex = /ipad|android(?!.*mobile)|tablet/i;
      const isTabletDevice = tabletRegex.test(userAgent) || 
                            (screenWidth >= 768 && screenWidth <= 1024 && 'ontouchstart' in window);
      
      // Desktop tespiti
      const isDesktopDevice = !isMobilePhone && !isTabletDevice;
      
      // Genel mobil cihaz tespiti (telefon + tablet)
      const isMobileDevice = isMobilePhone || isTabletDevice;

      setDeviceInfo({
        isMobile: isMobilePhone,
        isTablet: isTabletDevice,
        isDesktop: isDesktopDevice,
        isMobileDevice: isMobileDevice,
      });
    };

    // İlk tespit
    detectDevice();

    // Ekran boyutu değiştiğinde yeniden tespit et
    const handleResize = () => {
      detectDevice();
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return deviceInfo;
};

export default useDeviceDetection;