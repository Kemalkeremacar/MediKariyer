/**
 * Format Utilities
 * Provides general formatting functions
 */

/**
 * Format currency (Turkish Lira)
 * @param amount - Amount to format
 * @param showSymbol - Whether to show currency symbol
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: number,
  showSymbol: boolean = true
): string => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return showSymbol ? '0 ₺' : '0';
  }

  const formatted = amount.toLocaleString('tr-TR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  return showSymbol ? `${formatted} ₺` : formatted;
};

/**
 * Format number with thousand separators
 * @param value - Number to format
 * @returns Formatted number string
 */
export const formatNumber = (value: number): string => {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0';
  }

  return value.toLocaleString('tr-TR');
};

/**
 * Format phone number (Turkish format)
 * @param phone - Phone number to format
 * @returns Formatted phone string
 */
export const formatPhone = (phone: string): string => {
  if (!phone || typeof phone !== 'string') {
    return '';
  }

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // Format as (5XX) XXX XX XX
  if (cleaned.length === 10 && cleaned.startsWith('5')) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8)}`;
  }

  // Format as 0(5XX) XXX XX XX
  if (cleaned.length === 11 && cleaned.startsWith('05')) {
    return `0(${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9)}`;
  }

  return phone;
};

/**
 * Format file size
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export const formatFileSize = (bytes: number): string => {
  if (typeof bytes !== 'number' || bytes < 0) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`;
};

/**
 * Format percentage
 * @param value - Value to format as percentage
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number, decimals: number = 0): string => {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0%';
  }

  return `${value.toFixed(decimals)}%`;
};

/**
 * Truncate text with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength)}...`;
};

/**
 * Capitalize first letter of each word
 * @param text - Text to capitalize
 * @returns Capitalized text
 */
export const capitalizeWords = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Capitalize first letter
 * @param text - Text to capitalize
 * @returns Capitalized text
 */
export const capitalizeFirst = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Format name (first name + last name)
 * @param firstName - First name
 * @param lastName - Last name
 * @returns Formatted full name
 */
export const formatFullName = (firstName?: string, lastName?: string): string => {
  const parts = [firstName, lastName].filter(Boolean);
  return parts.join(' ').trim();
};

/**
 * Format initials from name
 * @param firstName - First name
 * @param lastName - Last name
 * @returns Initials (e.g., "AB")
 */
export const formatInitials = (firstName?: string, lastName?: string): string => {
  const first = firstName?.charAt(0)?.toUpperCase() || '';
  const last = lastName?.charAt(0)?.toUpperCase() || '';
  return `${first}${last}`;
};

/**
 * Format address
 * @param address - Address object
 * @returns Formatted address string
 */
export const formatAddress = (address: {
  street?: string;
  district?: string;
  city?: string;
  country?: string;
}): string => {
  const parts = [
    address.street,
    address.district,
    address.city,
    address.country,
  ].filter(Boolean);

  return parts.join(', ');
};

/**
 * Format salary range
 * @param min - Minimum salary
 * @param max - Maximum salary
 * @returns Formatted salary range string
 */
export const formatSalaryRange = (min?: number, max?: number): string => {
  if (!min && !max) {
    return 'Belirtilmemiş';
  }

  if (min && max) {
    return `${formatCurrency(min)} - ${formatCurrency(max)}`;
  }

  if (min) {
    return `${formatCurrency(min)}+`;
  }

  return `${formatCurrency(max!)} 'e kadar`;
};

/**
 * Format list with commas and "and"
 * @param items - Array of items
 * @returns Formatted list string
 */
export const formatList = (items: string[]): string => {
  if (!items || items.length === 0) {
    return '';
  }

  if (items.length === 1) {
    return items[0];
  }

  if (items.length === 2) {
    return `${items[0]} ve ${items[1]}`;
  }

  const allButLast = items.slice(0, -1).join(', ');
  const last = items[items.length - 1];
  return `${allButLast} ve ${last}`;
};

/**
 * Remove Turkish characters for URL slugs
 * @param text - Text to convert
 * @returns URL-safe slug
 */
export const slugify = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  const turkishMap: Record<string, string> = {
    ç: 'c',
    ğ: 'g',
    ı: 'i',
    ö: 'o',
    ş: 's',
    ü: 'u',
    Ç: 'c',
    Ğ: 'g',
    İ: 'i',
    Ö: 'o',
    Ş: 's',
    Ü: 'u',
  };

  return text
    .split('')
    .map((char) => turkishMap[char] || char)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Mask sensitive data (e.g., email, phone)
 * @param value - Value to mask
 * @param type - Type of masking
 * @returns Masked value
 */
export const maskSensitiveData = (
  value: string,
  type: 'email' | 'phone' | 'card'
): string => {
  if (!value || typeof value !== 'string') {
    return '';
  }

  switch (type) {
    case 'email': {
      const [username, domain] = value.split('@');
      if (!username || !domain) return value;
      const maskedUsername =
        username.charAt(0) + '*'.repeat(username.length - 2) + username.charAt(username.length - 1);
      return `${maskedUsername}@${domain}`;
    }
    case 'phone': {
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length < 4) return value;
      return cleaned.slice(0, 3) + '*'.repeat(cleaned.length - 6) + cleaned.slice(-3);
    }
    case 'card': {
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length < 8) return value;
      return cleaned.slice(0, 4) + ' **** **** ' + cleaned.slice(-4);
    }
    default:
      return value;
  }
};
