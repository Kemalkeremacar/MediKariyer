/**
 * Date Formatting Utilities
 * Provides consistent date formatting across the application
 */

/**
 * Format a date to Turkish locale string
 * @param date - Date to format
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions
): string => {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Geçersiz tarih';
  }

  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Europe/Istanbul',
    ...options,
  };

  return dateObj.toLocaleDateString('tr-TR', defaultOptions);
};

/**
 * Format a date to short format (DD.MM.YYYY)
 * @param date - Date to format
 * @returns Formatted date string
 */
export const formatDateShort = (date: Date | string | number): string => {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Geçersiz tarih';
  }

  return dateObj.toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Europe/Istanbul',
  });
};

/**
 * Format a date with time
 * @param date - Date to format
 * @returns Formatted date and time string
 */
export const formatDateTime = (date: Date | string | number): string => {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Geçersiz tarih';
  }

  return dateObj.toLocaleString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Istanbul',
  });
};

/**
 * Format a date to relative time (e.g., "2 saat önce", "3 gün önce")
 * @param date - Date to format
 * @returns Relative time string
 */
export const formatRelativeTime = (date: Date | string | number): string => {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Geçersiz tarih';
  }

  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 60) {
    return 'Az önce';
  } else if (diffMin < 60) {
    return `${diffMin} dakika önce`;
  } else if (diffHour < 24) {
    return `${diffHour} saat önce`;
  } else if (diffDay < 7) {
    return `${diffDay} gün önce`;
  } else if (diffWeek < 4) {
    return `${diffWeek} hafta önce`;
  } else if (diffMonth < 12) {
    return `${diffMonth} ay önce`;
  } else {
    return `${diffYear} yıl önce`;
  }
};

/**
 * Check if a date is in the past
 * @param date - Date to check
 * @returns True if date is in the past
 */
export const isPast = (date: Date | string | number): boolean => {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return false;
  }

  return dateObj.getTime() < Date.now();
};

/**
 * Check if a date is in the future
 * @param date - Date to check
 * @returns True if date is in the future
 */
export const isFuture = (date: Date | string | number): boolean => {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return false;
  }

  return dateObj.getTime() > Date.now();
};

/**
 * Check if a date is today
 * @param date - Date to check
 * @returns True if date is today
 */
export const isToday = (date: Date | string | number): boolean => {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return false;
  }

  const today = new Date();
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
};

/**
 * Get the number of days between two dates
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Number of days between dates
 */
export const daysBetween = (
  date1: Date | string | number,
  date2: Date | string | number
): number => {
  const dateObj1 = typeof date1 === 'string' || typeof date1 === 'number' ? new Date(date1) : date1;
  const dateObj2 = typeof date2 === 'string' || typeof date2 === 'number' ? new Date(date2) : date2;
  
  if (isNaN(dateObj1.getTime()) || isNaN(dateObj2.getTime())) {
    return 0;
  }

  const diffMs = Math.abs(dateObj2.getTime() - dateObj1.getTime());
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
};

/**
 * Add days to a date
 * @param date - Date to add days to
 * @param days - Number of days to add
 * @returns New date with added days
 */
export const addDays = (date: Date | string | number, days: number): Date => {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return new Date();
  }

  const result = new Date(dateObj);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * Format time only (HH:MM)
 * @param date - Date to format
 * @returns Formatted time string
 */
export const formatTime = (date: Date | string | number): string => {
  const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Geçersiz saat';
  }

  return dateObj.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  });
};
