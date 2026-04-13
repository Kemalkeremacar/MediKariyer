/**
 * @file SmartAppBanner.jsx
 * @description Mobil tarayıcılarda "Uygulamada Aç" banner'ı gösterir
 * 
 * Özellikler:
 * - iOS Safari ve Android Chrome desteği
 * - Kullanıcı deneyimi odaklı (kapatılabilir, hatırlanır)
 * - App Store ve Google Play Store linkleri
 * - Modern tasarım
 */

import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';

const SmartAppBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [platform, setPlatform] = useState(null);

  // .env dosyasından App Store bilgileri
  const appInfo = {
    ios: {
      appId: '6758999976', // App Store URL'den çıkarıldı
      storeUrl: import.meta.env.VITE_APP_STORE_URL || 'https://apps.apple.com/tr/app/medikariyer/id6758999976?l=tr',
      name: 'MediKariyer',
      developer: 'MediKariyer',
    },
    android: {
      packageName: 'com.medikariyer.mobile', // Play Store URL'den çıkarıldı
      storeUrl: import.meta.env.VITE_PLAY_STORE_URL || 'https://play.google.com/store/apps/details?id=com.medikariyer.mobile',
      name: 'MediKariyer',
      developer: 'MediKariyer',
    }
  };

  useEffect(() => {
    // Sadece production'da ve mobil cihazlarda göster
    const isProduction = import.meta.env.PROD || window.location.hostname === 'medikariyer.net';
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (!isMobile || !isProduction) return;

    // Platform tespiti
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    if (isIOS) {
      setPlatform('ios');
    } else if (isAndroid) {
      setPlatform('android');
    } else {
      return; // Desteklenmeyen platform
    }

    // Daha önce kapatılmış mı kontrol et
    const bannerDismissed = localStorage.getItem('app-banner-dismissed');
    const dismissedDate = bannerDismissed ? new Date(bannerDismissed) : null;
    const now = new Date();
    
    // 7 gün sonra tekrar göster
    if (dismissedDate && (now - dismissedDate) < 7 * 24 * 60 * 60 * 1000) {
      return;
    }

    // Uygulama zaten yüklü mü kontrol et (iOS için)
    if (isIOS && window.navigator.standalone) {
      return; // PWA olarak çalışıyor, banner gösterme
    }

    // Banner'ı göster
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('app-banner-dismissed', new Date().toISOString());
  };

  const handleOpenApp = () => {
    const info = appInfo[platform];
    if (!info) return;

    // Deep link dene, başarısızsa store'a yönlendir
    const deepLink = platform === 'ios' 
      ? `medikariyer://open` // iOS URL Scheme
      : `intent://medikariyer.net#Intent;scheme=https;package=${info.packageName};end`; // Android Intent

    // Önce deep link'i dene
    window.location.href = deepLink;

    // 1.5 saniye sonra store'a yönlendir (deep link başarısızsa)
    setTimeout(() => {
      window.open(info.storeUrl, '_blank');
    }, 1500);

    handleClose();
  };

  if (!isVisible || !platform) return null;

  const info = appInfo[platform];
  const isIOS = platform === 'ios';

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-lg">
      <div className="flex items-center justify-between p-3 max-w-md mx-auto">
        {/* App Icon */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          
          {/* App Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm truncate">
              {info.name}
            </h3>
            <p className="text-xs text-gray-600 truncate">
              {info.developer}
            </p>
            <p className="text-xs text-gray-500">
              {isIOS ? 'App Store' : 'Google Play'} - Ücretsiz
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenApp}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
          >
            <Download className="w-4 h-4" />
            {isIOS ? 'Aç' : 'Yükle'}
          </button>
          
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmartAppBanner;