/**
 * Development-only logger utility
 * Logs are only output when __DEV__ is true
 * 
 * Requirements:
 * - 9.3: Log lifecycle events in development mode
 * - 9.5: Ensure logs are stripped in production builds
 */

class DevLogger {
  private enabled: boolean;

  constructor() {
    this.enabled = __DEV__;
  }

  log(...args: any[]): void {
    if (this.enabled) {
      console.log('[DEV]', ...args);
    }
  }

  info(...args: any[]): void {
    if (this.enabled) {
      console.info('[DEV]', ...args);
    }
  }

  warn(...args: any[]): void {
    if (this.enabled) {
      console.warn('[DEV]', ...args);
    }
  }

  error(...args: any[]): void {
    if (this.enabled) {
      console.error('[DEV]', ...args);
    }
  }

  debug(...args: any[]): void {
    if (this.enabled) {
      console.debug('[DEV]', ...args);
    }
  }

  // Conditional logging with custom condition
  logIf(condition: boolean, ...args: any[]): void {
    if (this.enabled && condition) {
      console.log('[DEV]', ...args);
    }
  }
}

export const devLog = new DevLogger();

/**
 * Overlay System Development Logging Utilities
 * 
 * These utilities provide development-only logging for the overlay system
 * (Alert, Toast, Modal). They are designed to:
 * - Log lifecycle events (show, hide, callback execution)
 * - Be completely stripped in production builds
 * - Provide consistent formatting with system prefix
 * 
 * Requirements:
 * - 9.3: Log lifecycle events in development mode
 * - 9.5: Ensure logs are stripped in production builds
 */

/**
 * Development-only log function for overlay system
 * Logs informational messages with [Overlay System] prefix
 * 
 * @param message - The message to log
 * @param data - Optional data to include in the log
 */
export const overlayDevLog = (message: string, data?: unknown): void => {
  if (__DEV__) {
    if (data !== undefined) {
      console.log(`[Overlay System] ${message}`, data);
    } else {
      console.log(`[Overlay System] ${message}`);
    }
  }
};

/**
 * Development-only warning function for overlay system
 * Logs warning messages with [Overlay System] prefix
 * 
 * @param message - The warning message to log
 * @param data - Optional data to include in the log
 */
export const overlayDevWarn = (message: string, data?: unknown): void => {
  if (__DEV__) {
    if (data !== undefined) {
      console.warn(`[Overlay System] ${message}`, data);
    } else {
      console.warn(`[Overlay System] ${message}`);
    }
  }
};

/**
 * Development-only error function for overlay system
 * Logs error messages with [Overlay System] prefix
 * 
 * @param message - The error message to log
 * @param error - Optional error object to include
 */
export const overlayDevError = (message: string, error?: unknown): void => {
  if (__DEV__) {
    if (error !== undefined) {
      console.error(`[Overlay System] ${message}`, error);
    } else {
      console.error(`[Overlay System] ${message}`);
    }
  }
};
