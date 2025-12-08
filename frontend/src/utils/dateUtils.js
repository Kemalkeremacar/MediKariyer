/**
 * @file dateUtils.js
 * @description Tarih formatlama ve işleme fonksiyonları
 * 
 * Tüm projede tutarlı tarih gösterimi için merkezi utility fonksiyonları.
 * Timezone sorunlarını önler ve Türkçe tarih formatlarını sağlar.
 */

/**
 * Tarih değerini normalize eder (string, Date object, timestamp)
 * @param {string|Date|number} dateValue - Tarih değeri
 * @returns {Date|null} - Date objesi veya null
 */
export const normalizeDateValue = (dateValue) => {
  if (!dateValue) return null;
  
  try {
    // Eğer zaten Date objesi ise
    if (dateValue instanceof Date) {
      return isNaN(dateValue.getTime()) ? null : dateValue;
    }
    
    // String veya number ise
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? null : date;
  } catch (error) {
    console.error('Date normalization error:', error);
    return null;
  }
};

/**
 * Tarihi Türkçe formatta gösterir (Gün Ay Yıl)
 * Örnek: 15 Ocak 2024
 * 
 * @param {string|Date|number} dateValue - Tarih değeri
 * @returns {string} - Formatlanmış tarih
 */
export const formatDate = (dateValue) => {
  const date = normalizeDateValue(dateValue);
  if (!date) return 'Belirtilmemiş';
  
  try {
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Europe/Istanbul'
    }).format(date);
  } catch (error) {
    console.error('Date formatting error:', error);
    return date.toLocaleDateString('tr-TR');
  }
};

/**
 * Tarihi kısa formatta gösterir (GG.AA.YYYY)
 * Örnek: 15.01.2024
 * 
 * @param {string|Date|number} dateValue - Tarih değeri
 * @returns {string} - Formatlanmış tarih
 */
export const formatDateShort = (dateValue) => {
  const date = normalizeDateValue(dateValue);
  if (!date) return '';
  
  try {
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'Europe/Istanbul'
    }).format(date);
  } catch (error) {
    console.error('Date formatting error:', error);
    return date.toLocaleDateString('tr-TR');
  }
};

/**
 * Tarihi saat ile birlikte gösterir
 * Örnek: 15 Ocak 2024 14:30
 * 
 * @param {string|Date|number} dateValue - Tarih değeri
 * @returns {string} - Formatlanmış tarih ve saat
 */
export const formatDateTime = (dateValue) => {
  const date = normalizeDateValue(dateValue);
  if (!date) return 'Belirtilmemiş';
  
  try {
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Istanbul',
      hour12: false
    }).format(date);
  } catch (error) {
    console.error('DateTime formatting error:', error);
    return date.toLocaleString('tr-TR');
  }
};

/**
 * Tarihi kısa saat ile birlikte gösterir
 * Örnek: 15.01.2024 14:30
 * 
 * @param {string|Date|number} dateValue - Tarih değeri
 * @returns {string} - Formatlanmış tarih ve saat
 */
export const formatDateTimeShort = (dateValue) => {
  const date = normalizeDateValue(dateValue);
  if (!date) return '';
  
  try {
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Istanbul',
      hour12: false
    }).format(date);
  } catch (error) {
    console.error('DateTime formatting error:', error);
    return date.toLocaleString('tr-TR');
  }
};

/**
 * Sadece saati gösterir
 * Örnek: 14:30
 * 
 * @param {string|Date|number} dateValue - Tarih değeri
 * @returns {string} - Formatlanmış saat
 */
export const formatTime = (dateValue) => {
  const date = normalizeDateValue(dateValue);
  if (!date) return '';
  
  try {
    return new Intl.DateTimeFormat('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Istanbul',
      hour12: false
    }).format(date);
  } catch (error) {
    console.error('Time formatting error:', error);
    return date.toLocaleTimeString('tr-TR');
  }
};

/**
 * Göreceli zaman gösterir (X dakika önce, X saat önce, vb.)
 * 
 * @param {string|Date|number} dateValue - Tarih değeri
 * @returns {string} - Göreceli zaman
 */
export const formatRelativeTime = (dateValue) => {
  const date = normalizeDateValue(dateValue);
  if (!date) return '';
  
  try {
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    const diffWeek = Math.floor(diffDay / 7);
    const diffMonth = Math.floor(diffDay / 30);
    const diffYear = Math.floor(diffDay / 365);
    
    if (diffSec < 60) return 'Az önce';
    if (diffMin < 60) return `${diffMin} dakika önce`;
    if (diffHour < 24) return `${diffHour} saat önce`;
    if (diffDay < 7) return `${diffDay} gün önce`;
    if (diffWeek < 4) return `${diffWeek} hafta önce`;
    if (diffMonth < 12) return `${diffMonth} ay önce`;
    return `${diffYear} yıl önce`;
  } catch (error) {
    console.error('Relative time formatting error:', error);
    return formatDate(dateValue);
  }
};

/**
 * Ay ve yıl formatında gösterir
 * Örnek: Ocak 2024
 * 
 * @param {string|Date|number} dateValue - Tarih değeri
 * @returns {string} - Formatlanmış ay ve yıl
 */
export const formatMonthYear = (dateValue) => {
  const date = normalizeDateValue(dateValue);
  if (!date) return '';
  
  try {
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'long',
      timeZone: 'Europe/Istanbul'
    }).format(date);
  } catch (error) {
    console.error('Month/Year formatting error:', error);
    return date.toLocaleDateString('tr-TR');
  }
};

/**
 * Kısa ay formatında gösterir
 * Örnek: Oca 2024
 * 
 * @param {string|Date|number} dateValue - Tarih değeri
 * @returns {string} - Formatlanmış kısa ay
 */
export const formatMonthYearShort = (dateValue) => {
  const date = normalizeDateValue(dateValue);
  if (!date) return '';
  
  try {
    return new Intl.DateTimeFormat('tr-TR', {
      year: 'numeric',
      month: 'short',
      timeZone: 'Europe/Istanbul'
    }).format(date);
  } catch (error) {
    console.error('Month/Year short formatting error:', error);
    return date.toLocaleDateString('tr-TR');
  }
};

/**
 * API için tarih formatı (YYYY-MM-DD)
 * 
 * @param {string|Date|number} dateValue - Tarih değeri
 * @returns {string} - API formatında tarih
 */
export const formatDateForAPI = (dateValue) => {
  const date = normalizeDateValue(dateValue);
  if (!date) return '';
  
  try {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('API date formatting error:', error);
    return '';
  }
};

/**
 * Input field için tarih formatı (YYYY-MM-DD)
 * 
 * @param {string|Date|number} dateValue - Tarih değeri
 * @returns {string} - Input formatında tarih
 */
export const formatDateForInput = (dateValue) => {
  return formatDateForAPI(dateValue);
};

/**
 * İki tarih arasındaki farkı hesaplar
 * 
 * @param {string|Date|number} startDate - Başlangıç tarihi
 * @param {string|Date|number} endDate - Bitiş tarihi
 * @returns {Object} - {years, months, days, totalDays}
 */
export const getDateDifference = (startDate, endDate) => {
  const start = normalizeDateValue(startDate);
  const end = normalizeDateValue(endDate);
  
  if (!start || !end) return null;
  
  try {
    const diffMs = end - start;
    const totalDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const years = Math.floor(totalDays / 365);
    const months = Math.floor((totalDays % 365) / 30);
    const days = Math.floor((totalDays % 365) % 30);
    
    return { years, months, days, totalDays };
  } catch (error) {
    console.error('Date difference calculation error:', error);
    return null;
  }
};

/**
 * Tarihin geçerli olup olmadığını kontrol eder
 * 
 * @param {string|Date|number} dateValue - Tarih değeri
 * @returns {boolean} - Geçerli mi?
 */
export const isValidDate = (dateValue) => {
  return normalizeDateValue(dateValue) !== null;
};

/**
 * Bugünün tarihini döndürür
 * 
 * @returns {Date} - Bugünün tarihi
 */
export const getToday = () => {
  return new Date();
};

/**
 * Yarının tarihini döndürür
 * 
 * @returns {Date} - Yarının tarihi
 */
export const getTomorrow = () => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
};

/**
 * Dünün tarihini döndürür
 * 
 * @returns {Date} - Dünün tarihi
 */
export const getYesterday = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday;
};
