/**
 * @file main.jsx
 * @description Uygulama giriş noktası - React DOM render işlemi
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'sonner';
import App from './App.jsx';
import { getToastConfig } from './config/toast.js';

// React Query client - API çağrıları için cache ve state yönetimi
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 dakika - veri fresh kalma süresi
      cacheTime: 10 * 60 * 1000, // 10 dakika - cache'de kalma süresi
      retry: (failureCount, error) => {
        // Auth hatalarında retry yapma
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          return false;
        }
        return failureCount < 2; // Maksimum 2 retry
      },
      refetchOnWindowFocus: false, // Pencere focus'unda yeniden çekme
      refetchInterval: false, // Otomatik yenileme kapalı
    },
    mutations: {
      onError: (error) => {
        console.error('Mutation error:', error);
      },
    },
  },
});

// QueryClient'ı global olarak erişilebilir yap (auth store için)
if (typeof window !== 'undefined') {
  window.queryClient = queryClient;
}

// ✅ Toaster'ı body seviyesinde render et - Ayrı root ile
// Bu sayede overflow: hidden veya position: relative container'lardan etkilenmez
// Tema localStorage'dan okunur, değişiklikler için event listener ile güncellenir

// Tema'yı localStorage'dan oku (varsayılan: light)
let currentTheme = localStorage.getItem('theme') || 'light';

// Toaster container'ı oluştur
const toasterContainer = document.createElement('div');
toasterContainer.id = 'toaster-root';
document.body.appendChild(toasterContainer);

// Toaster root'unu oluştur
const toasterRoot = ReactDOM.createRoot(toasterContainer);

// Toaster'ı render et
function renderToaster(theme) {
  const toastConfig = getToastConfig(theme);
  toasterRoot.render(<Toaster {...toastConfig} />);
}

// İlk render
renderToaster(currentTheme);

// Tema değişikliğini dinle
window.addEventListener('theme-changed', (event) => {
  currentTheme = event.detail.theme;
  renderToaster(currentTheme);
});

// Toast pozisyonunu scroll pozisyonuna göre dinamik olarak ayarla
// Kullanıcı ekranın neresindeyse orada toast çıksın
function updateToastPosition() {
  const toaster = document.querySelector('[data-sonner-toaster]');
  if (!toaster) return;

  const scrollY = window.scrollY;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;
  const maxScroll = Math.max(0, documentHeight - windowHeight);
  
  // Viewport'un görünür alanını hesapla
  // Viewport'un üst kısmı: scrollY
  // Viewport'un alt kısmı: scrollY + windowHeight
  // Viewport'un ortası: scrollY + windowHeight / 2
  
  // Toast'u viewport'un görünür alanında göster
  // Scroll pozisyonuna göre dinamik pozisyon
  const minOffset = 20; // Minimum boşluk (px)
  const toastHeight = 80; // Tahmini toast yüksekliği (px)
  
  // Viewport'un görünür alanını hesapla
  const viewportTop = scrollY;
  const viewportBottom = scrollY + windowHeight;
  
  // Sayfanın toplam yüksekliği ve scroll edilebilir alan
  const scrollableHeight = Math.max(0, documentHeight - windowHeight);
  
  // Sayfanın üst kısmına ne kadar yakınız? (0-1 arası, 0 = en üstte, 1 = en altta)
  // Bu değer scroll pozisyonunun yüzdesini gösterir
  const scrollPercentage = scrollableHeight > 0 ? scrollY / scrollableHeight : 0;
  
  // Toast'u viewport'un görünür alanında göster
  // Scroll pozisyonuna göre dinamik pozisyon - daha akıcı geçiş
  // 0-0.15: Üstte, 0.15-0.85: Ortada, 0.85-1: Altta
  // Bu sayede kullanıcı sayfanın altında ama en altta değilse, toast ortada görünür
  
  // CSS'teki !important'i override etmek için setProperty kullan
  if (scrollPercentage < 0.15) {
    // Sayfanın üst kısmındayız - toast üstte
    toaster.style.setProperty('top', `${minOffset}px`, 'important');
    toaster.style.setProperty('bottom', 'auto', 'important');
  } else if (scrollPercentage > 0.85) {
    // Sayfanın alt kısmındayız (en alta yakın) - toast altta
    toaster.style.setProperty('bottom', `${minOffset}px`, 'important');
    toaster.style.setProperty('top', 'auto', 'important');
  } else {
    // Sayfanın ortasındayız - toast ortada (viewport'un ortasında)
    // Bu sayede kullanıcı sayfanın altında ama en altta değilse, toast ortada görünür
    const centerPosition = (windowHeight - toastHeight) / 2;
    toaster.style.setProperty('top', `${centerPosition}px`, 'important');
    toaster.style.setProperty('bottom', 'auto', 'important');
  }
}

// Scroll ve resize event'lerini dinle
let scrollTimeout;
const handleScroll = () => {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(updateToastPosition, 10); // Daha hızlı güncelleme
};

const handleResize = () => {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(updateToastPosition, 10);
};

window.addEventListener('scroll', handleScroll, { passive: true });
window.addEventListener('resize', handleResize, { passive: true });

// Toast container render edildikten sonra pozisyonu ayarla
// MutationObserver ile toast container'ın DOM'a eklenmesini bekliyoruz
const observer = new MutationObserver(() => {
  const toaster = document.querySelector('[data-sonner-toaster]');
  if (toaster) {
    updateToastPosition();
  }
});

// Body'de değişiklikleri izle
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// İlk pozisyonu ayarla - birkaç kez dene (toast container render edilene kadar)
let positionInitialized = false;
const initPosition = () => {
  const toaster = document.querySelector('[data-sonner-toaster]');
  if (toaster && !positionInitialized) {
    updateToastPosition();
    positionInitialized = true;
    
    // requestAnimationFrame ile sürekli güncelle (performanslı)
    const updateLoop = () => {
      const currentToaster = document.querySelector('[data-sonner-toaster]');
      if (currentToaster) {
        updateToastPosition();
      }
      requestAnimationFrame(updateLoop);
    };
    requestAnimationFrame(updateLoop);
  } else if (!toaster) {
    // Toast container henüz render edilmemiş, tekrar dene
    setTimeout(initPosition, 50);
  }
};

// İlk pozisyonu ayarla - daha sık kontrol et
setTimeout(initPosition, 50);
setTimeout(initPosition, 200);
setTimeout(initPosition, 500);

// Ana uygulama root'u
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
        {/* DevTools - sadece development modunda görünür */}
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
