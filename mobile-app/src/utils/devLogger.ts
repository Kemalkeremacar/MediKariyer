/**
 * Development Logger
 * ARCH-001: Client'tan ayrılan development logging helper'ları
 * 
 * TD-007: Console.log'lar sadece development'ta çalışır
 */

/**
 * Development-only console.log
 */
export const devLog = (...args: unknown[]): void => {
  if (__DEV__) {
    console.log(...args);
  }
};

/**
 * Development-only console.warn
 */
export const devWarn = (...args: unknown[]): void => {
  if (__DEV__) {
    console.warn(...args);
  }
};

/**
 * Development-only console.error
 */
export const devError = (...args: unknown[]): void => {
  if (__DEV__) {
    console.error(...args);
  }
};
