/**
 * Error Logger Utility
 * Centralized error logging for debugging and monitoring
 */

interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  [key: string]: any;
}

class ErrorLogger {
  private isDevelopment = __DEV__;

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

    // In production, you would send this to a logging service
    // Example: Sentry, LogRocket, Firebase Crashlytics, etc.
    // this.sendToLoggingService(errorInfo);
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

    // In production, send to logging service
    // this.sendToLoggingService(warningInfo);
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

    // In production, send to logging service if needed
    // this.sendToLoggingService(infoLog);
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
   * Log an unhandled error
   */
  logUnhandledError(error: Error, isFatal: boolean = false): void {
    this.logError(error, {
      type: 'unhandled',
      isFatal,
    });
  }

  /**
   * Private method to send logs to external service
   * Implement this based on your logging service
   */
  private sendToLoggingService(logData: any): void {
    // Example implementation:
    // Sentry.captureException(logData);
    // or
    // fetch('https://your-logging-service.com/logs', {
    //   method: 'POST',
    //   body: JSON.stringify(logData),
    // });
  }
}

export const errorLogger = new ErrorLogger();
