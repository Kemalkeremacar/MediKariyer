/**
 * @file useScrollToTop.js
 * @description useScrollToTop Hook - Sayfa değişikliğinde otomatik scroll yönetimi
 * 
 * Bu hook, React Router ile sayfa değişikliklerinde otomatik olarak sayfanın
 * en üstüne smooth scroll yapar. Kullanıcı deneyimini iyileştirmek için
 * her sayfa geçişinde scroll pozisyonunu sıfırlar.
 * 
 * Ana Özellikler:
 * - Otomatik scroll: Sayfa değişikliğinde otomatik en üste scroll
 * - Smooth animasyon: Smooth scroll behavior ile yumuşak geçiş
 * - React Router entegrasyonu: useLocation ile route değişikliklerini takip eder
 * - Performance: Sadece pathname değiştiğinde çalışır
 * 
 * Kullanım:
 * ```jsx
 * import useScrollToTop from '@/hooks/useScrollToTop';
 * 
 * function MyComponent() {
 *   useScrollToTop();
 *   return <div>Content</div>;
 * }
 * ```
 * 
 * Teknik Detaylar:
 * - useLocation hook'u ile location.pathname değişikliklerini takip eder
 * - useEffect ile sayfa değişikliğinde window.scrollTo çağrılır
 * - Smooth scroll behavior ile animasyonlu scroll
 * 
 * Not: Bazı sayfalarda scroll pozisyonu korunması gerekirse (örn: detay sayfasından
 * geri dönüş), bu hook o sayfalarda kullanılmamalı veya özelleştirilmelidir.
 * 
 * @author MediKariyer Development Team
 * @version 2.0.0
 * @since 2024
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ============================================================================
 * USE SCROLL TO TOP HOOK
 * ============================================================================
 * 
 * Sayfa değişikliğinde otomatik olarak sayfanın en üstüne scroll yapan hook
 * 
 * Dönüş:
 * @returns {void} Bu hook herhangi bir değer döndürmez, side effect olarak çalışır
 */
const useScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    // Sayfa değiştiğinde en üste scroll
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  }, [location.pathname]);
};

export default useScrollToTop;
