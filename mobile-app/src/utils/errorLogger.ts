/**
 * Error Logger Utility
 * Centralized error logging for debugging and monitoring
 * Integrated with Sentry for production error tracking
 */

import * as Sentry from '@sentry/react-native';

interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  [key: string]: any;
}

interface SentryConfig {
  dsn: string;
  environment?: string;
  debug?: boolean;
  tracesSampleRate?: number;
}

class ErrorLogger {
  private isDevelopment = __DEV__;
  private isInitialized = false;

  /**
   * Initialize Sentry SDK
   * Call this in App.tsx before any other code
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
        // Only send errors in production
        enabled: !this.isDevelopment,
        // Attach user info if available
        beforeSend: (event) => {
          // Filter out development errors
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
   * Set user context for Sentry
   */
  setUser(userId: string, email?: string, username?: string): void {
    Sentry.setUser({
      id: userId,
      email,
      username,
    });
  }

  /**
   * Clear user context (on logout)
   */
  clearUser(): void {
    Sentry.setUser(null);
  }

  /**
   * Log an error with context
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

    // Send to Sentry in production
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
   * Log a warning
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

    // Send to Sentry in production
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
   * Log an info message
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

    // Info logs typically not sent to Sentry to reduce noise
    // Only log critical info in production if needed
  }

  /**
   * Log a network error
   */
  logNetworkError(error: Error, endpoint?: string): void {
    this.logError(error, {
      type: 'network',
      endpoint,
    });
  }

  /**
   * Log an API error
   */
  logApiError(error: Error, endpoint?: string, statusCode?: number): void {
    this.logError(error, {
      type: 'api',
      endpoint,
      statusCode,
    });
  }

  /**
   * Log an unhandled error (for global error boundary)
   */
  logUnhandledError(error: Error, isFatal: boolean = false): void {
    this.logError(error, {
      type: 'unhandled',
      isFatal,
    });

    // For fatal crashes, ensure Sentry captures it immediately
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
   * Add breadcrumb for better error context
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
   * Capture a custom event/message
   */
  captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): void {
    if (this.isDevelopment) {
      console.log(`📝 [${level}] ${message}`);
      return;
    }
    
    Sentry.captureMessage(message, level);
  }
}

export const errorLogger = new ErrorLogger();
