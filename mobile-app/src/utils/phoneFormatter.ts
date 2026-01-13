/**
 * @file phoneFormatter.ts
 * @description Telefon numarası formatlama utility'si
 * 
 * Türk cep telefonu formatı: 0532 123 45 67
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 */

/**
 * Telefon numarasını formatlar
 * Input: 5321234567 veya 05321234567 veya +905321234567
 * Output: 0532 123 45 67
 * 
 * @param value - Ham telefon numarası
 * @returns Formatlanmış telefon numarası
 */
export const formatPhoneNumber = (value: string): string => {
  // Sadece rakamları al
  const digits = value.replace(/\D/g, '');
  
  // +90 veya 90 ile başlıyorsa kaldır
  let cleanDigits = digits;
  if (cleanDigits.startsWith('90') && cleanDigits.length > 10) {
    cleanDigits = cleanDigits.slice(2);
  }
  
  // 0 ile başlamıyorsa ve 10 haneli ise başına 0 ekle
  if (!cleanDigits.startsWith('0') && cleanDigits.length === 10) {
    cleanDigits = '0' + cleanDigits;
  }
  
  // Maksimum 11 hane (0 dahil)
  cleanDigits = cleanDigits.slice(0, 11);
  
  // Format: 0532 123 45 67
  let formatted = '';
  
  if (cleanDigits.length > 0) {
    formatted = cleanDigits.slice(0, 4); // 0532
  }
  if (cleanDigits.length > 4) {
    formatted += ' ' + cleanDigits.slice(4, 7); // 123
  }
  if (cleanDigits.length > 7) {
    formatted += ' ' + cleanDigits.slice(7, 9); // 45
  }
  if (cleanDigits.length > 9) {
    formatted += ' ' + cleanDigits.slice(9, 11); // 67
  }
  
  return formatted;
};

/**
 * Formatlanmış telefon numarasından sadece rakamları alır
 * Input: 0532 123 45 67
 * Output: 05321234567
 * 
 * @param formattedValue - Formatlanmış telefon numarası
 * @returns Sadece rakamlardan oluşan telefon numarası
 */
export const unformatPhoneNumber = (formattedValue: string): string => {
  return formattedValue.replace(/\D/g, '');
};

/**
 * Telefon numarasının geçerli olup olmadığını kontrol eder
 * Geçerli format: 05XXXXXXXXX (11 hane, 05 ile başlamalı)
 * 
 * @param phone - Telefon numarası (formatlanmış veya ham)
 * @returns Geçerli ise true
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const digits = phone.replace(/\D/g, '');
  
  // 11 hane olmalı ve 05 ile başlamalı
  if (digits.length !== 11) return false;
  if (!digits.startsWith('05')) return false;
  
  return true;
};
