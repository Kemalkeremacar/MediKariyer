/**
 * @file errorLogger.ts
 * @description Hata loglama utility - Debugging ve monitoring için merkezi hata loglama
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 * 
 * **Özellikler:**
 * - Production'da Sentry entegrasyonu
 * - Development'ta console loglama
 * - Kullanıcı context yönetimi
 * - Breadcrumb desteği
 */

import * as Sentry from '@sentry/react-native';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Hata context bilgileri
 */
interface ErrorContext {
  /** Component adı */
  component?: string;
  /** İşlem/aksiyon adı */
  action?: string;
  /** Kullanıcı ID */
  userId?: string;
  /** Diğer context bilgileri */
  [key: string]: any;
}

/**
 * Sentry konfigürasyon ayarları
 */
interface SentryConfig {
  /** Sentry DSN */
  dsn: string;
  /** Environment (development/production) */
  environment?: string;
  /** Debug modu */
  debug?: boolean;
  /** Trace sample rate (0.0 - 1.0) */
  tracesSampleRate?: number;
}

// ============================================================================
// ERROR LOGGER CLASS
// ============================================================================

/**
 * Error Logger sınıfı
 * Merkezi hata loglama ve Sentry entegrasyonu
 */
class ErrorLogger {
  private isDevelopment = __DEV__;
  private isInitialized = false;

  /**
   * Sentry SDK'yı başlat
   * App.tsx'te diğer kodlardan önce çağrılmalıdır
   * 
   * @param config - Sentry konfigürasyon ayarları
   */
  initSentry(config: SentryConfig): void {
    if (this.isInitialized) {
      console.warn('Sentry is already initialized');
      return;
    }

    try {
      Sentry.init({
        dsn: config.dsn,
        environment: config.environment || (this.isDevelopment ? 'development' : 'production'),
        debug: config.debug ?? this.isDevelopment,
        tracesSampleRate: config.tracesSampleRate ?? (this.isDevelopment ? 1.0 : 0.2),
        // Sadece production'da hata gönder
        enabled: !this.isDevelopment,
        // Kullanıcı bilgisi varsa ekle
        beforeSend: (event) => {
          // Development hatalarını filtrele
          if (this.isDevelopment) {
            return null;
          }
          return event;
        },
      });
      this.isInitialized = true;
      
      if (this.isDevelopment) {
        console.log('✅ Sentry initialized (disabled in development)');
      }
    } catch (error) {
      console.error('Failed to initialize Sentry:', error);
    }
  }

  /**
   * Kullanıcı context'ini ayarla
   * 
   * @param userId - Kullanıcı ID
   * @param email - E-posta (opsiyonel)
   * @param username - Kullanıcı adı (opsiyonel)
   */
  setUser(userId: string, email?: string, username?: string): void {
    Sentry.setUser({
      id: userId,
      email,
      username,
    });
  }

  /**
   * Kullanıcı context'ini temizle (logout'ta)
   */
  clearUser(): void {
    Sentry.setUser(null);
  }

  /**
   * Context ile hata logla
   * 
   * @param error - Hata objesi
   * @param context - Ek context bilgileri
   */
  logError(error: Error, context?: ErrorContext): void {
    const timestamp = new Date().toISOString();
    const errorInfo = {
      timestamp,
      message: error.message,
      name: error.name,
      stack: error.stack,
      context,
    };

    if (this.isDevelopment) {
      console.error('🔴 Error logged:', errorInfo);
    }

    // Production'da Sentry'ye gönder
    if (!this.isDevelopment) {
      Sentry.withScope((scope) => {
        if (context) {
          scope.setExtras(context);
          if (context.component) scope.setTag('component', context.component);
          if (context.action) scope.setTag('action', context.action);
        }
        Sentry.captureException(error);
      });
    }
  }

  /**
   * Uyarı logla
   * 
   * @param message - Uyarı mesajı
   * @param context - Ek context bilgileri
   */
  logWarning(message: string, context?: ErrorContext): void {
    const timestamp = new Date().toISOString();
    const warningInfo = {
      timestamp,
      message,
      context,
    };

    if (this.isDevelopment) {
      console.warn('⚠️ Warning logged:', warningInfo);
    }

    // Production'da Sentry'ye gönder
    if (!this.isDevelopment) {
      Sentry.withScope((scope) => {
        scope.setLevel('warning');
        if (context) {
          scope.setExtras(context);
        }
        Sentry.captureMessage(message);
      });
    }
  }

  /**
   * Bilgi mesajı logla
   * 
   * @param message - Bilgi mesajı
   * @param context - Ek context bilgileri
   * 
   * **NOT:** Info logları genellikle Sentry'ye gönderilmez (gürültüyü azaltmak için)
   */
  logInfo(message: string, context?: ErrorContext): void {
    const timestamp = new Date().toISOString();
    const infoLog = {
      timestamp,
      message,
      context,
    };

    if (this.isDevelopment) {
      console.log('ℹ️ Info logged:', infoLog);
    }

    // Info logları genellikle Sentry'ye gönderilmez
    // Sadece kritik info'lar production'da loglanabilir
  }

  /**
   * Network hatası logla
   * 
   * @param error - Hata objesi
   * @param endpoint - API endpoint (opsiyonel)
   */
  logNetworkError(error: Error, endpoint?: string): void {
    this.logError(error, {
      type: 'network',
      endpoint,
    });
  }

  /**
   * API hatası logla
   * 
   * @param error - Hata objesi
   * @param endpoint - API endpoint (opsiyonel)
   * @param statusCode - HTTP status code (opsiyonel)
   */
  logApiError(error: Error, endpoint?: string, statusCode?: number): void {
    this.logError(error, {
      type: 'api',
      endpoint,
      statusCode,
    });
  }

  /**
   * İşlenmemiş hata logla (global error boundary için)
   * 
   * @param error - Hata objesi
   * @param isFatal - Fatal crash mi?
   */
  logUnhandledError(error: Error, isFatal: boolean = false): void {
    this.logError(error, {
      type: 'unhandled',
      isFatal,
    });

    // Fatal crash'ler için Sentry'ye hemen gönder
    if (isFatal && !this.isDevelopment) {
      Sentry.captureException(error, {
        level: 'fatal',
        tags: {
          fatal: 'true',
        },
      });
    }
  }

  /**
   * Daha iyi hata context'i için breadcrumb ekle
   * 
   * @param message - Breadcrumb mesajı
   * @param category - Kategori (varsayılan: 'app')
   * @param data - Ek veri
   */
  addBreadcrumb(message: string, category?: string, data?: Record<string, any>): void {
    Sentry.addBreadcrumb({
      message,
      category: category || 'app',
      data,
      level: 'info',
    });
  }

  /**
   * Özel event/mesaj yakala
   * 
   * @param message - Mesaj
   * @param level - Severity level (varsayılan: 'info')
   */
  captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): void {
    if (this.isDevelopment) {
      console.log(`📝 [${level}] ${message}`);
      return;
    }
    
    Sentry.captureMessage(message, level);
  }
}

// ============================================================================
// EXPORT
// ============================================================================

/**
 * Error Logger instance
 * Uygulama genelinde kullanılacak singleton instance
 */
export const errorLogger = new ErrorLogger();
