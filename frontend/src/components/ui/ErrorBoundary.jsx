/**
 * Error Boundary Component
 * 
 * React Error Boundary bileşeni - Uygulama hatalarını yakalar ve kullanıcı dostu hata sayfası gösterir
 * Hata durumlarında uygulamanın çökmesini önler
 * 
 * Özellikler:
 * - Hata yakalama ve loglama
 * - Kullanıcı dostu hata mesajları
 * - Sayfa yenileme seçeneği
 * - Glassmorphism dark theme
 */

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Hata durumunda state'i güncelle
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Hatayı logla
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Production'da hata raporlama servisi kullanılabilir
    if (process.env.NODE_ENV === 'production') {
      // Örnek: Sentry, LogRocket vb.
      // errorReportingService.captureException(error, { extra: errorInfo });
    }
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 p-8 max-w-2xl w-full text-center">
            {/* Error Icon */}
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-white" />
            </div>

            {/* Error Message */}
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-4">
              Bir Hata Oluştu
            </h1>
            <p className="text-gray-300 mb-8 leading-relaxed">
              Üzgünüz, beklenmeyen bir hata meydana geldi. Lütfen sayfayı yenileyin veya ana sayfaya dönün.
            </p>

            {/* Error Details (Development only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 text-left">
                <h3 className="text-red-300 font-semibold mb-2">Hata Detayları (Geliştirici Modu)</h3>
                <pre className="text-red-200 text-sm overflow-auto max-h-40">
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={this.handleRefresh}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-lg"
              >
                <RefreshCw className="w-4 h-4" />
                Sayfayı Yenile
              </button>
              <button
                onClick={this.handleGoHome}
                className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Home className="w-4 h-4" />
                Ana Sayfaya Dön
              </button>
            </div>

            {/* Help Text */}
            <p className="text-gray-400 text-sm mt-6">
              Sorun devam ederse, lütfen destek ekibiyle iletişime geçin.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
