/**
 * @file ErrorBoundary.jsx
 * @description Error Boundary - React hata yakalama ve yönetimi bileşeni
 * 
 * Bu component, React uygulamasında oluşan hataları yakalar ve uygulamanın
 * çökmesini önler. Kullanıcı dostu hata mesajları gösterir ve hata yönetimi
 * sağlar.
 * 
 * Ana Özellikler:
 * - Hata yakalama: React component hatalarını yakalar (componentDidCatch)
 * - Fallback UI: Hata durumunda özel hata sayfası gösterimi
 * - Hata bilgisi: Development modunda detaylı hata bilgisi
 * - Retry mekanizması: "Tekrar Dene" butonu ile hata durumunu sıfırlama
 * - Ana sayfa yönlendirme: "Ana Sayfa" butonu ile ana sayfaya dönüş
 * - Console logging: Hata detaylarını console'a yazdırma
 * - Error reporting: Gelecekte error reporting servisine entegrasyon için hazır
 * 
 * Yakalanan Hatalar:
 * - Render sırasında oluşan hatalar
 * - Lifecycle method'larında oluşan hatalar
 * - Constructor'larda oluşan hatalar
 * - Component tree içindeki hatalar
 * 
 * Yakalanmayan Hatalar:
 * - Event handler'lardaki hatalar (try-catch ile yakalanmalı)
 * - Async kod hataları (try-catch ile yakalanmalı)
 * - Server-side rendering hataları
 * 
 * React Error Boundary Lifecycle:
 * 1. getDerivedStateFromError: Hata yakalandığında state güncelleme
 * 2. componentDidCatch: Hata ve errorInfo ile hata yakalama
 * 3. Render: hasError === true ise fallback UI gösterimi
 * 
 * Kullanım:
 * ```jsx
 * import ErrorBoundary from '@/middleware/ErrorBoundary';
 * 
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 * ```
 * 
 * Development Mode:
 * - Development modunda detaylı hata bilgisi gösterilir
 * - Error stack trace ve component stack bilgisi gösterilir
 * - Production modunda sadece kullanıcı dostu mesaj gösterilir
 * 
 * Not: Error Boundary'ler sadece aşağıdaki durumlarda çalışır:
 * - Render metodlarında
 * - Lifecycle metodlarında
 * - Constructor'larda
 * Event handler'lar ve async kod için try-catch kullanılmalıdır.
 * 
 * @author MediKariyer Development Team
 * @version 2.0.0
 * @since 2024
 */

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * ============================================================================
 * ERROR BOUNDARY COMPONENT - React hata yakalama bileşeni
 * ============================================================================
 * 
 * React component tree'deki hataları yakalayan ve fallback UI gösteren
 * class component. React'in Error Boundary özelliğini kullanır.
 * 
 * Props:
 * @param {React.ReactNode} children - Korunacak component tree
 */
class ErrorBoundary extends React.Component {
  /**
   * ============================================================================
   * CONSTRUCTOR - Component başlatma
   * ============================================================================
   */
  
  constructor(props) {
    super(props);
    
    /**
     * Error Boundary state
     * - hasError: Hata yakalandı mı?
     * - error: Yakalanan hata objesi
     * - errorInfo: Hata bilgisi (component stack vb.)
     */
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  /**
   * ============================================================================
   * LIFECYCLE METHODS - React lifecycle metodları
   * ============================================================================
   */

  /**
   * getDerivedStateFromError - Static lifecycle method
   * 
   * Hata yakalandığında state'i günceller
   * Fallback UI'nın gösterilmesi için hasError state'ini true yapar
   * 
   * Parametreler:
   * @param {Error} error - Yakalanan hata objesi
   * 
   * Dönüş:
   * @returns {Object} State güncellemesi (hasError: true)
   * 
   * Not: Bu method render phase'de çalışır, side effect yapılamaz
   */
  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  /**
   * componentDidCatch - Error boundary lifecycle method
   * 
   * Hata yakalandığında çağrılır ve hata bilgilerini loglar
   * Error reporting servisine hata gönderilebilir
   * 
   * Parametreler:
   * @param {Error} error - Yakalanan hata objesi
   * @param {Object} errorInfo - Hata bilgisi (componentStack vb.)
   * 
   * Not: Bu method commit phase'de çalışır, side effect yapılabilir
   */
  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    /**
     * State güncelleme
     * 
     * Error ve errorInfo state'e kaydedilir
     * Bu bilgiler development modunda UI'da gösterilebilir
     */
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // You can also log the error to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  /**
   * ============================================================================
   * EVENT HANDLERS - Event handler metodları
   * ============================================================================
   */

  /**
   * handleRetry - Retry button click handler
   * 
   * Hata durumunu sıfırlar ve component'i tekrar render etmeye çalışır
   * Kullanıcı "Tekrar Dene" butonuna tıkladığında çağrılır
   * 
   * Mantık:
   * - hasError state'ini false yapar
   * - error ve errorInfo state'lerini temizler
   * - Component normal render moduna döner
   */
  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  /**
   * ============================================================================
   * RENDER METHOD - Component render
   * ============================================================================
   */

  render() {
    /**
     * Hata durumu kontrolü
     * 
     * hasError === true ise fallback UI gösterilir
     * hasError === false ise normal children render edilir
     */
    if (this.state.hasError) {
      // ============================================================================
      // FALLBACK UI - Hata durumu için özel UI
      // ============================================================================
      
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            {/* Hata başlığı ve mesajı */}
            <div className="mb-6">
              <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Bir Hata Oluştu
              </h1>
              <p className="text-gray-600">
                Üzgünüz, beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyin veya ana sayfaya dönün.
              </p>
            </div>

            {/* Development modunda detaylı hata bilgisi */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-left">
                <h3 className="text-sm font-medium text-red-800 mb-2">Hata Detayları:</h3>
                <pre className="text-xs text-red-700 overflow-auto max-h-32">
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}

            {/* Action butonları */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Retry butonu */}
              <button
                onClick={this.handleRetry}
                className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 flex items-center justify-center"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Tekrar Dene
              </button>
              
              {/* Ana sayfa butonu */}
              <Link
                to="/"
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 flex items-center justify-center"
              >
                <Home className="h-4 w-4 mr-2" />
                Ana Sayfa
              </Link>
            </div>
          </div>
        </div>
      );
    }

    /**
     * Normal durum
     * 
     * Hata yoksa children normal şekilde render edilir
     */
    return this.props.children;
  }
}

export default ErrorBoundary;
