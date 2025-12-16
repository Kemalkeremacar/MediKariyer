/**
 * @file dateHelper.js
 * @description Tarih dönüşüm helper'ı
 * SQL Server Türkiye saatinde kaydediyor ama Z ekliyor, bu yüzden UTC'ye çevirmemiz gerekiyor
 */

'use strict';

/**
 * Türkiye saatinde kaydedilen tarihi UTC'ye çevir (3 saat çıkar)
 * @param {Date|string} date - Dönüştürülecek tarih
 * @returns {string|null} ISO formatında UTC tarih
 */
const toUTC = (date) => {
  if (!date) return null;
  const d = new Date(date);
  if (isNaN(d.getTime())) return null;
  // 3 saat çıkar (Türkiye UTC+3)
  d.setHours(d.getHours() - 3);
  return d.toISOString();
};

module.exports = { toUTC };
