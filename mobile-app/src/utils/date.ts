/**
 * MEDİKARİYER Mobile - Tarih ve Saat Yönetimi
 * 
 * Modern, TypeScript uyumlu, date-fns tabanlı merkezi tarih utility'si.
 * MSSQL datetime2/datetimeoffset/date formatları ile tam uyumlu.
 * 
 * ============================================================================
 * MSSQL TARİH TİPLERİ VE STRATEJİ
 * ============================================================================
 * 
 * 1. datetime2(7) - EN KRİTİK
 *    - Kullanım: applications.applied_at, jobs.created_at, users.created_at
 *    - Özellik: Yüksek hassasiyetli tarih+saat, TIMEZONE BİLGİSİ YOK
 *    - MSSQL: 2025-12-17 14:23:35.1234567
 *    - Backend: useUTC: true ayarı ile UTC olarak kaydediyor
 *    - Mobil: UTC olarak kabul et, gösterimde yerel saate çevir
 * 
 * 2. datetimeoffset(7)
 *    - Kullanım: application_logs, audit_logs
 *    - Özellik: Tarih + Saat + Timezone (+03:00)
 *    - MSSQL: 2025-12-17 14:23:35.1234567 +03:00
 *    - Node.js: ISO formatında gönderir (2025-12-17T11:23:35.123Z)
 *    - Risk: Düşük, timezone bilgisi mevcut
 * 
 * 3. date
 *    - Kullanım: doctor_profiles.dob (Doğum Tarihi)
 *    - Özellik: Sadece YYYY-MM-DD, saat yok
 *    - MSSQL: 2025-12-17
 *    - Risk: Timezone dönüşümü yaparsan gün kayabilir!
 *    - Çözüm: parseDateOnly() fonksiyonu ile saat dönüşümü YAPMA
 * 
 * ============================================================================
 * ALTIN KURAL
 * ============================================================================
 * - Backend: UTC formatında gönderir (useUTC: true)
 * - Frontend: Sadece gösterim anında yerel saat ve Türkçe formata çevirir
 * - date tipi: ASLA timezone dönüşümü yapma
 */

import {
  format,
  formatDistance,
  parseISO,
  isValid,
  isPast as dateFnsIsPast,
  isFuture as dateFnsIsFuture,
  isToday as dateFnsIsToday,
  isYesterday,
  isTomorrow,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInYears,
  addDays as dateFnsAddDays,
  addMonths,
  addYears,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  parse,
} from 'date-fns';
import { tr } from 'date-fns/locale';

// ============================================================================
// TÜRKIYE TIMEZONE SABITI
// ============================================================================

/** Türkiye saat dilimi (UTC+3) */
const TURKEY_TIMEZONE = 'Europe/Istanbul';
const TURKEY_UTC_OFFSET_MS = 3 * 60 * 60 * 1000; // +3 saat milisaniye cinsinden

// ============================================================================
// TYPES
// ============================================================================

/** Backend'den gelebilecek tarih formatları */
export type DateInput = Date | string | number | null | undefined;

/** Tarih formatlama seçenekleri */
export interface FormatOptions {
  /** Geçersiz tarih için gösterilecek fallback değer */
  fallback?: string;
  /** Boş tarih için gösterilecek değer */
  emptyValue?: string;
}

// ============================================================================
// CORE UTILITIES - MSSQL TARİH TİPLERİ İÇİN PARSER'LAR
// ============================================================================

/**
 * datetime2 ve datetimeoffset tiplerini parse eder.
 * Backend useUTC: true kullandığı için tarihler UTC olarak kabul edilir.
 * 
 * Desteklenen formatlar:
 * - ISO 8601: "2025-12-17T14:23:35.123Z"
 * - MSSQL datetime2: "2025-12-17 14:23:35.1234567" (UTC olarak kabul edilir)
 * - MSSQL datetimeoffset: "2025-12-17 14:23:35.1234567 +03:00"
 * 
 * @param input - Tarih inputu (string, Date, number, null, undefined)
 * @returns Geçerli Date objesi veya null
 */
export const toDate = (input: DateInput): Date | null => {
  if (input === null || input === undefined || input === '') {
    return null;
  }

  // Zaten Date objesi ise
  if (input instanceof Date) {
    return isValid(input) ? input : null;
  }

  // Number (timestamp) ise
  if (typeof input === 'number') {
    const date = new Date(input);
    return isValid(date) ? date : null;
  }

  // String ise - MSSQL formatlarını handle et
  if (typeof input === 'string') {
    let normalizedInput = input.trim();
    
    // Sadece tarih mi? (YYYY-MM-DD formatı, saat yok)
    // Bu durumda parseDateOnly kullanılmalı, ama backward compatibility için handle ediyoruz
    if (/^\d{4}-\d{2}-\d{2}$/.test(normalizedInput)) {
      // Sadece tarih - gün kayması olmaması için öğlen saatini ekle
      normalizedInput = `${normalizedInput}T12:00:00`;
    }
    
    // MSSQL datetimeoffset formatını ISO 8601'e çevir
    // "2025-11-25 14:23:35.0000000 +03:00" -> "2025-11-25T14:23:35.000+03:00"
    if (normalizedInput.includes(' ') && !normalizedInput.includes('T')) {
      // Milisaniye hassasiyetini düzelt (.0000000 -> .000)
      normalizedInput = normalizedInput.replace(/\.(\d{3})\d*/, '.$1');
      // Boşluklu formatı ISO formatına çevir
      normalizedInput = normalizedInput.replace(' ', 'T').replace(' +', '+').replace(' -', '-');
      
      // datetime2 ise (timezone bilgisi yok) - UTC olarak işaretle
      if (!normalizedInput.includes('+') && !normalizedInput.includes('Z')) {
        normalizedInput += 'Z';
      }
    }

    try {
      const date = parseISO(normalizedInput);
      return isValid(date) ? date : null;
    } catch {
      // parseISO başarısız olursa native Date dene
      const date = new Date(input);
      return isValid(date) ? date : null;
    }
  }

  return null;
};

/**
 * MSSQL date tipini parse eder (Doğum tarihi gibi sadece tarih içeren alanlar için).
 * 
 * ⚠️ ÖNEMLİ: Bu fonksiyon timezone dönüşümü YAPMAZ!
 * Böylece "1990-05-15" tarihi her zaman 15 Mayıs olarak kalır,
 * gece yarısı UTC dönüşümü yüzünden 14 Mayıs'a kaymaz.
 * 
 * @param input - Tarih stringi (YYYY-MM-DD formatında)
 * @returns Date objesi (yerel saat diliminde öğlen 12:00 olarak) veya null
 * 
 * @example
 * parseDateOnly("1990-05-15") // -> 15 Mayıs 1990, 12:00 (yerel saat)
 */
export const parseDateOnly = (input: DateInput): Date | null => {
  if (input === null || input === undefined || input === '') {
    return null;
  }

  if (input instanceof Date) {
    return isValid(input) ? input : null;
  }

  if (typeof input === 'string') {
    const trimmed = input.trim();
    
    // YYYY-MM-DD formatını parse et
    const dateMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (dateMatch) {
      const year = parseInt(dateMatch[1], 10);
      const month = parseInt(dateMatch[2], 10) - 1; // JavaScript ayları 0-indexed
      const day = parseInt(dateMatch[3], 10);
      
      // Yerel saat diliminde öğlen 12:00 olarak oluştur
      // Bu sayede timezone dönüşümlerinde gün kayması olmaz
      const date = new Date(year, month, day, 12, 0, 0);
      return isValid(date) ? date : null;
    }
  }

  return null;
};

/**
 * Tarihin geçerli olup olmadığını kontrol eder
 */
export const isValidDate = (input: DateInput): boolean => {
  return toDate(input) !== null;
};

/**
 * Yaş hesaplar (doğum tarihi için)
 * @param birthDate - Doğum tarihi
 * @returns Yaş (tam yıl olarak) veya null
 */
export const calculateAge = (birthDate: DateInput): number | null => {
  const date = parseDateOnly(birthDate);
  if (!date) return null;
  
  return differenceInYears(new Date(), date);
};

// ============================================================================
// FORMATTING FUNCTIONS
// ============================================================================

/**
 * Uzun tarih formatı: "17 Aralık 2025"
 */
export const formatDate = (input: DateInput, options?: FormatOptions): string => {
  const date = toDate(input);
  if (!date) return options?.fallback ?? options?.emptyValue ?? '';
  
  return format(date, 'd MMMM yyyy', { locale: tr });
};

/**
 * Kısa tarih formatı: "17.12.2025"
 */
export const formatDateShort = (input: DateInput, options?: FormatOptions): string => {
  const date = toDate(input);
  if (!date) return options?.fallback ?? options?.emptyValue ?? '';
  
  return format(date, 'dd.MM.yyyy', { locale: tr });
};

/**
 * Tarih ve saat formatı: "17 Aralık 2025, 14:30"
 */
export const formatDateTime = (input: DateInput, options?: FormatOptions): string => {
  const date = toDate(input);
  if (!date) return options?.fallback ?? options?.emptyValue ?? '';
  
  return format(date, 'd MMMM yyyy, HH:mm', { locale: tr });
};

/**
 * Kısa tarih ve saat formatı: "17.12.2025 14:30"
 */
export const formatDateTimeShort = (input: DateInput, options?: FormatOptions): string => {
  const date = toDate(input);
  if (!date) return options?.fallback ?? options?.emptyValue ?? '';
  
  return format(date, 'dd.MM.yyyy HH:mm', { locale: tr });
};

/**
 * Sadece saat formatı: "14:30"
 */
export const formatTime = (input: DateInput, options?: FormatOptions): string => {
  const date = toDate(input);
  if (!date) return options?.fallback ?? options?.emptyValue ?? '';
  
  return format(date, 'HH:mm', { locale: tr });
};

/**
 * Ay ve yıl formatı: "Aralık 2025"
 */
export const formatMonthYear = (input: DateInput, options?: FormatOptions): string => {
  const date = toDate(input);
  if (!date) return options?.fallback ?? options?.emptyValue ?? '';
  
  return format(date, 'MMMM yyyy', { locale: tr });
};

/**
 * Gün ve ay formatı: "17 Aralık"
 */
export const formatDayMonth = (input: DateInput, options?: FormatOptions): string => {
  const date = toDate(input);
  if (!date) return options?.fallback ?? options?.emptyValue ?? '';
  
  return format(date, 'd MMMM', { locale: tr });
};

/**
 * Sadece yıl formatı: "2025"
 */
export const formatYear = (input: DateInput, options?: FormatOptions): string => {
  const date = parseDateOnly(input) || toDate(input);
  if (!date) return options?.fallback ?? options?.emptyValue ?? '';
  
  return date.getFullYear().toString();
};

/**
 * Hafta günü ile birlikte: "Çarşamba, 17 Aralık 2025"
 */
export const formatDateWithDay = (input: DateInput, options?: FormatOptions): string => {
  const date = toDate(input);
  if (!date) return options?.fallback ?? options?.emptyValue ?? '';
  
  return format(date, 'EEEE, d MMMM yyyy', { locale: tr });
};

// ============================================================================
// RELATIVE TIME FUNCTIONS
// ============================================================================

/**
 * Göreli zaman formatı: "2 saat önce", "3 gün önce", "az önce"
 */
export const formatRelativeTime = (input: DateInput, options?: FormatOptions): string => {
  const date = toDate(input);
  if (!date) return options?.fallback ?? options?.emptyValue ?? '';
  
  const now = new Date();
  const diffMinutes = differenceInMinutes(now, date);
  const diffHours = differenceInHours(now, date);
  const diffDays = differenceInDays(now, date);

  // Gelecek tarihler için
  if (diffMinutes < 0) {
    return formatDistance(date, now, { locale: tr, addSuffix: true });
  }

  // Geçmiş tarihler için özel Türkçe formatlar
  if (diffMinutes < 1) {
    return 'Az önce';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} dakika önce`;
  } else if (diffHours < 24) {
    return `${diffHours} saat önce`;
  } else if (diffDays === 1) {
    return 'Dün';
  } else if (diffDays < 7) {
    return `${diffDays} gün önce`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks} hafta önce`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} ay önce`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years} yıl önce`;
  }
};

/**
 * Akıllı tarih formatı - yakın tarihlerde göreli, uzak tarihlerde mutlak
 * Örnek: "Dün, 14:30" veya "17 Aralık 2025"
 */
export const formatSmartDate = (input: DateInput, options?: FormatOptions): string => {
  const date = toDate(input);
  if (!date) return options?.fallback ?? options?.emptyValue ?? '';

  const now = new Date();
  const diffDays = differenceInDays(now, date);

  if (dateFnsIsToday(date)) {
    return `Bugün, ${format(date, 'HH:mm', { locale: tr })}`;
  } else if (isYesterday(date)) {
    return `Dün, ${format(date, 'HH:mm', { locale: tr })}`;
  } else if (isTomorrow(date)) {
    return `Yarın, ${format(date, 'HH:mm', { locale: tr })}`;
  } else if (Math.abs(diffDays) < 7) {
    return format(date, 'EEEE, HH:mm', { locale: tr });
  } else {
    return format(date, 'd MMMM yyyy', { locale: tr });
  }
};

// ============================================================================
// DATE COMPARISON FUNCTIONS
// ============================================================================

/**
 * Tarihin geçmişte olup olmadığını kontrol eder
 */
export const isPast = (input: DateInput): boolean => {
  const date = toDate(input);
  if (!date) return false;
  return dateFnsIsPast(date);
};

/**
 * Tarihin gelecekte olup olmadığını kontrol eder
 */
export const isFuture = (input: DateInput): boolean => {
  const date = toDate(input);
  if (!date) return false;
  return dateFnsIsFuture(date);
};

/**
 * Tarihin bugün olup olmadığını kontrol eder
 */
export const isToday = (input: DateInput): boolean => {
  const date = toDate(input);
  if (!date) return false;
  return dateFnsIsToday(date);
};

/**
 * Tarihin son X gün içinde olup olmadığını kontrol eder
 */
export const isWithinDays = (input: DateInput, days: number): boolean => {
  const date = toDate(input);
  if (!date) return false;
  
  const diffDays = differenceInDays(new Date(), date);
  return diffDays >= 0 && diffDays <= days;
};

/**
 * İki tarih arasındaki gün farkını hesaplar
 */
export const daysBetween = (input1: DateInput, input2: DateInput): number => {
  const date1 = toDate(input1);
  const date2 = toDate(input2);
  
  if (!date1 || !date2) return 0;
  return Math.abs(differenceInDays(date1, date2));
};

// ============================================================================
// DATE MANIPULATION FUNCTIONS
// ============================================================================

/**
 * Tarihe gün ekler
 */
export const addDays = (input: DateInput, days: number): Date | null => {
  const date = toDate(input);
  if (!date) return null;
  return dateFnsAddDays(date, days);
};

/**
 * Tarihe ay ekler
 */
export const addMonthsToDate = (input: DateInput, months: number): Date | null => {
  const date = toDate(input);
  if (!date) return null;
  return addMonths(date, months);
};

/**
 * Tarihe yıl ekler
 */
export const addYearsToDate = (input: DateInput, years: number): Date | null => {
  const date = toDate(input);
  if (!date) return null;
  return addYears(date, years);
};

/**
 * Günün başlangıcını alır (00:00:00)
 */
export const getStartOfDay = (input: DateInput): Date | null => {
  const date = toDate(input);
  if (!date) return null;
  return startOfDay(date);
};

/**
 * Günün sonunu alır (23:59:59)
 */
export const getEndOfDay = (input: DateInput): Date | null => {
  const date = toDate(input);
  if (!date) return null;
  return endOfDay(date);
};

/**
 * Ayın başlangıcını alır
 */
export const getStartOfMonth = (input: DateInput): Date | null => {
  const date = toDate(input);
  if (!date) return null;
  return startOfMonth(date);
};

/**
 * Ayın sonunu alır
 */
export const getEndOfMonth = (input: DateInput): Date | null => {
  const date = toDate(input);
  if (!date) return null;
  return endOfMonth(date);
};

// ============================================================================
// SPECIAL FORMATTERS
// ============================================================================

/**
 * İş ilanı için son başvuru tarihi formatı
 * Örnek: "Son 3 gün" veya "17 Aralık 2025"
 */
export const formatDeadline = (input: DateInput, options?: FormatOptions): string => {
  const date = toDate(input);
  if (!date) return options?.fallback ?? options?.emptyValue ?? '';

  if (dateFnsIsPast(date)) {
    return 'Süresi doldu';
  }

  const daysLeft = differenceInDays(date, new Date());
  
  if (daysLeft === 0) {
    return 'Son gün!';
  } else if (daysLeft === 1) {
    return 'Yarın son gün';
  } else if (daysLeft <= 7) {
    return `Son ${daysLeft} gün`;
  } else {
    return format(date, 'd MMMM yyyy', { locale: tr });
  }
};

/**
 * Deneyim süresi formatı (CV için)
 * Örnek: "Ocak 2020 - Aralık 2023" veya "Ocak 2020 - Devam ediyor"
 */
export const formatExperiencePeriod = (
  startDate: DateInput,
  endDate: DateInput,
  isCurrent?: boolean
): string => {
  const start = toDate(startDate);
  if (!start) return '';

  const startFormatted = format(start, 'MMMM yyyy', { locale: tr });
  
  if (isCurrent) {
    return `${startFormatted} - Devam ediyor`;
  }

  const end = toDate(endDate);
  if (!end) return `${startFormatted} - Devam ediyor`;

  const endFormatted = format(end, 'MMMM yyyy', { locale: tr });
  return `${startFormatted} - ${endFormatted}`;
};

/**
 * Yayınlanma tarihi formatı
 * Örnek: "3 gün önce yayınlandı" veya "17 Aralık 2025 tarihinde yayınlandı"
 */
export const formatPublishedDate = (input: DateInput, options?: FormatOptions): string => {
  const date = toDate(input);
  if (!date) return options?.fallback ?? options?.emptyValue ?? '';

  const diffDays = differenceInDays(new Date(), date);

  if (diffDays === 0) {
    return 'Bugün yayınlandı';
  } else if (diffDays === 1) {
    return 'Dün yayınlandı';
  } else if (diffDays < 7) {
    return `${diffDays} gün önce yayınlandı`;
  } else {
    return `${format(date, 'd MMMM yyyy', { locale: tr })} tarihinde yayınlandı`;
  }
};

// ============================================================================
// DOĞUM TARİHİ VE YAŞ FORMATLARI (MSSQL date tipi için)
// ============================================================================

/**
 * Doğum tarihi formatı (MSSQL date tipi için)
 * ⚠️ parseDateOnly kullanır - timezone dönüşümü YAPMAZ
 * 
 * @param input - Doğum tarihi (YYYY-MM-DD)
 * @param options - Format seçenekleri
 * @returns "15 Mayıs 1990" formatında string
 */
export const formatBirthDate = (input: DateInput, options?: FormatOptions): string => {
  const date = parseDateOnly(input);
  if (!date) return options?.fallback ?? options?.emptyValue ?? '';
  
  return format(date, 'd MMMM yyyy', { locale: tr });
};

/**
 * Doğum tarihi kısa formatı (MSSQL date tipi için)
 * ⚠️ parseDateOnly kullanır - timezone dönüşümü YAPMAZ
 * 
 * @param input - Doğum tarihi (YYYY-MM-DD)
 * @param options - Format seçenekleri
 * @returns "15.05.1990" formatında string
 */
export const formatBirthDateShort = (input: DateInput, options?: FormatOptions): string => {
  const date = parseDateOnly(input);
  if (!date) return options?.fallback ?? options?.emptyValue ?? '';
  
  return format(date, 'dd.MM.yyyy', { locale: tr });
};

/**
 * Yaş ile birlikte doğum tarihi formatı
 * 
 * @param input - Doğum tarihi (YYYY-MM-DD)
 * @param options - Format seçenekleri
 * @returns "15 Mayıs 1990 (34 yaşında)" formatında string
 */
export const formatBirthDateWithAge = (input: DateInput, options?: FormatOptions): string => {
  const date = parseDateOnly(input);
  if (!date) return options?.fallback ?? options?.emptyValue ?? '';
  
  const age = calculateAge(input);
  const formattedDate = format(date, 'd MMMM yyyy', { locale: tr });
  
  if (age !== null && age >= 0) {
    return `${formattedDate} (${age} yaşında)`;
  }
  
  return formattedDate;
};

// ============================================================================
// SAAT FORMATLARI
// ============================================================================

/**
 * Saat ve dakika formatı: "14:30"
 */
export const formatTimeShort = (input: DateInput, options?: FormatOptions): string => {
  const date = toDate(input);
  if (!date) return options?.fallback ?? options?.emptyValue ?? '';
  
  return format(date, 'HH:mm', { locale: tr });
};

/**
 * Saat, dakika ve saniye formatı: "14:30:45"
 */
export const formatTimeFull = (input: DateInput, options?: FormatOptions): string => {
  const date = toDate(input);
  if (!date) return options?.fallback ?? options?.emptyValue ?? '';
  
  return format(date, 'HH:mm:ss', { locale: tr });
};

/**
 * 12 saat formatı: "02:30 ÖS"
 */
export const formatTime12Hour = (input: DateInput, options?: FormatOptions): string => {
  const date = toDate(input);
  if (!date) return options?.fallback ?? options?.emptyValue ?? '';
  
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? 'ÖS' : 'ÖÖ';
  const hour12 = hours % 12 || 12;
  
  return `${hour12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
};

// ============================================================================
// BACKEND'E GÖNDERİM FORMATLARI (ISO 8601)
// ============================================================================

/**
 * Tarihi backend'e göndermek için ISO 8601 formatına çevirir
 * datetime2 alanları için kullanılır
 * 
 * @param input - Tarih
 * @returns ISO 8601 string (2025-12-17T14:30:00.000Z) veya null
 */
export const toISOString = (input: DateInput): string | null => {
  const date = toDate(input);
  if (!date) return null;
  
  return date.toISOString();
};

/**
 * Tarihi backend'e göndermek için sadece tarih formatına çevirir
 * MSSQL date alanları için kullanılır (doğum tarihi gibi)
 * 
 * @param input - Tarih
 * @returns YYYY-MM-DD formatında string veya null
 */
export const toDateString = (input: DateInput): string | null => {
  const date = parseDateOnly(input) || toDate(input);
  if (!date) return null;
  
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};
