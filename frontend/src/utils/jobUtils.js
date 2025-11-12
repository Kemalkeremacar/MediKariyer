/**
 * @file jobUtils.js
 * @description İş ilanı ile ilgili yardımcı fonksiyonlar
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

/**
 * Revision note'u çeşitli kaynaklardan çözer
 * @description Job history, revision_history, status_history gibi kaynaklardan revision note'u bulur
 * @param {Object} entry - History entry veya job object
 * @returns {string} Revision note veya boş string
 * 
 * @example
 * const note = resolveRevisionNote(historyEntry);
 * if (note) {
 *   console.log('Revision note:', note);
 * }
 */
export const resolveRevisionNote = (entry) => {
  if (!entry) return '';
  
  const candidates = [];
  const tryPush = (val) => {
    if (typeof val === 'string' && val.trim()) {
      candidates.push(val.trim());
    }
  };
  
  tryPush(entry.note);
  tryPush(entry.revision_note);
  
  // entry.details içinde kontrol et
  if (entry.details) {
    const details = typeof entry.details === 'string' ? (() => {
      try {
        return JSON.parse(entry.details);
      } catch (error) {
        return null;
      }
    })() : entry.details;
    if (details) {
      tryPush(details.revision_note);
      tryPush(details.note);
    }
  }
  
  // entry.data içinde kontrol et
  if (entry.data) {
    const dataBlock = typeof entry.data === 'string' ? (() => {
      try {
        return JSON.parse(entry.data);
      } catch (error) {
        return null;
      }
    })() : entry.data;
    if (dataBlock) {
      tryPush(dataBlock.revision_note);
      tryPush(dataBlock.note);
    }
  }
  
  // entry.metadata içinde kontrol et
  if (entry.metadata) {
    tryPush(entry.metadata.revision_note);
    tryPush(entry.metadata.note);
  }
  
  return candidates.length > 0 ? candidates[0] : '';
};

/**
 * Job status'ünü Türkçe isme çevirir
 * @param {string} status - İngilizce status
 * @returns {string} Türkçe status
 */
export const getTurkishStatusName = (status) => {
  const statusMap = {
    'Onay Bekliyor': 'Onay Bekliyor',
    'Pending Approval': 'Onay Bekliyor',
    'Revizyon Gerekli': 'Revizyon Gerekli',
    'Needs Revision': 'Revizyon Gerekli',
    'Onaylandı': 'Onaylandı',
    'Approved': 'Onaylandı',
    'Pasif': 'Pasif',
    'Inactive': 'Pasif',
    'Reddedildi': 'Reddedildi',
    'Rejected': 'Reddedildi'
  };
  
  return statusMap[status] || status;
};

