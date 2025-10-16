/**
 * @file contactService.js
 * @description İletişim servisi - İletişim formu mesajlarını yönetir.
 * Bu servis, contactController tarafından kullanılan basit iletişim mesajı işlemlerini içerir.
 * 
 * Ana İşlevler:
 * - İletişim formu mesaj oluşturma
 * - Mesaj listeleme
 * - Mesaj görüntüleme
 * - Mesaj silme
 * 
 * Veritabanı Tabloları:
 * - contact_messages: İletişim mesajları (id, name, email, subject, message, created_at)
 * 
 * @author MediKariyer Development Team
 * @version 2.0.0
 * @since 2024
 */

'use strict';

const db = require('../config/dbConfig').db;
const { AppError } = require('../utils/errorHandler');
const logger = require('../utils/logger');
const notificationService = require('./notificationService');

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * @typedef {object} Pagination
 * @property {number} current_page - Mevcut sayfa numarası.
 * @property {number} per_page - Sayfa başına kayıt sayısı.
 * @property {number} total - Toplam kayıt sayısı.
 * @property {number} total_pages - Toplam sayfa sayısı.
 * @property {boolean} has_next - Sonraki sayfanın olup olmadığı.
 * @property {boolean} has_prev - Önceki sayfanın olup olmadığı.
 */

/**
 * @typedef {object} ContactMessage
 * @property {number} id - Mesajın benzersiz ID'si.
 * @property {string} name - Gönderenin adı soyadı.
 * @property {string} email - Gönderenin e-posta adresi.
 * @property {string} subject - Mesajın konusu.
 * @property {string} message - Mesajın içeriği.
 * @property {Date} created_at - Oluşturulma tarihi.
 */

// ============================================================================
// İLETİŞİM FORMU MESAJ İŞLEMLERİ
// ============================================================================

/**
 * Yeni bir iletişim formu mesajı oluşturur ve veritabanına kaydeder.
 * @description Kullanıcı tarafından gönderilen iletişim mesajını veritabanına kaydeder ve admin'lere bildirim gönderir
 * @param {object} messageData - Mesaj verileri
 * @param {string} messageData.name - Gönderenin adı soyadı
 * @param {string} messageData.email - Gönderenin e-posta adresi
 * @param {string} messageData.subject - Mesajın konusu
 * @param {string} messageData.message - Mesajın içeriği
 * @returns {Promise<number>} Oluşturulan mesajın ID'sini döndürür
 * @throws {AppError} Veritabanı hatası durumunda
 * 
 * @example
 * const messageId = await createContactMessage({
 *   name: 'Ahmet Yılmaz',
 *   email: 'ahmet@example.com',
 *   subject: 'Bilgi Talebi',
 *   message: 'Merhaba, size ulaşmak istiyorum.'
 * });
 */
const createContactMessage = async (messageData) => {
  const { name, email, subject, message } = messageData;

  const [contactMessageId] = await db('contact_messages').insert({
    name,
    email,
    subject,
    message,
    created_at: db.fn.now()
  });

  // Admin'lere yeni iletişim mesajı bildirimi gönder
  try {
    await notificationService.sendSystemNotification({
      type: 'info',
      title: 'Yeni İletişim Mesajı',
      body: `${name} (${email}) adlı kullanıcıdan yeni bir iletişim mesajı aldınız.`,
      targetRole: 'admin',
      data: {
        contact_message_id: contactMessageId,
        sender_name: name,
        sender_email: email,
        subject: subject
      }
    });
  } catch (notificationError) {
    logger.warn('Admin\'lere bildirim gönderilemedi:', notificationError.message);
    // Bildirim hatası işlemi durdurmasın
  }

  logger.info(`New contact message created: ${email} - ${subject}`);

  return contactMessageId;
};

/**
 * Tüm iletişim mesajlarını sıralama ve sayfalama seçenekleriyle getirir.
 * @param {object} [filters={}] - Sıralama ve sayfalama parametreleri.
 * @param {number} [filters.page=1] - Sayfa numarası.
 * @param {number} [filters.limit=100] - Sayfa başına mesaj sayısı.
 * @param {string} [filters.sort_by='created_at'] - Sıralama sütunu.
 * @param {'asc' | 'desc'} [filters.sort_order='desc'] - Sıralama yönü.
 * @returns {Promise<{data: ContactMessage[], pagination: Pagination}>} Mesaj listesi ve sayfalama bilgileri.
 */
const getContactMessages = async (filters = {}) => {
  const {
    page = 1,
    limit = 100,
    sort_by = 'created_at',
    sort_order = 'desc'
  } = filters;

  let query = db('contact_messages')
    .select('id', 'name', 'email', 'subject', 'message', 'created_at');

  // Get total count
  const totalQuery = query.clone().clearSelect().count('* as count').first();
  const { count: total } = await totalQuery;

  // Apply pagination and sorting
  const offset = (page - 1) * limit;
  const messages = await query
    .orderBy(sort_by, sort_order)
    .limit(limit)
    .offset(offset);

  return {
    data: messages,
    pagination: {
      current_page: parseInt(page),
      per_page: parseInt(limit),
      total: parseInt(total),
      total_pages: Math.ceil(total / limit),
      has_next: parseInt(page) < Math.ceil(total / limit),
      has_prev: parseInt(page) > 1
    }
  };
};

/**
 * Belirtilen ID'ye sahip iletişim mesajını getirir.
 * @param {number} messageId - Getirilecek mesajın ID'si.
 * @returns {Promise<ContactMessage>} Bulunan iletişim mesajı.
 * @throws {AppError} Mesaj bulunamazsa 404 hatası fırlatır.
 */
const getContactMessageById = async (messageId) => {
  const message = await db('contact_messages')
    .where('id', messageId)
    .select('id', 'name', 'email', 'subject', 'message', 'created_at')
    .first();

  if (!message) {
    throw new AppError('İletişim mesajı bulunamadı', 404);
  }

  return message;
};

/**
 * Bir iletişim mesajını veritabanından siler.
 * @param {number} messageId - Silinecek mesajın ID'si.
 * @returns {Promise<boolean>} Silme işlemi başarılıysa true döner.
 * @throws {AppError} Mesaj bulunamazsa 404 hatası fırlatır.
 */
const deleteContactMessage = async (messageId) => {
  const result = await db('contact_messages').where('id', messageId).del();
  
  if (result === 0) {
    throw new AppError('İletişim mesajı bulunamadı veya zaten silinmiş', 404);
  }

  logger.info(`Contact message ${messageId} deleted`);

  return true;
};

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = {
  // İletişim formu mesaj işlemleri
  createContactMessage,
  
  // Admin mesaj yönetimi
  getContactMessages,
  getContactMessageById,
  deleteContactMessage
};
