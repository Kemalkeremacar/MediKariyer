/**
 * @file contactController.js
 * @description İletişim controller'ı - İletişim formu için HTTP isteklerini yönetir.
 * Bu controller, contactRoutes tarafından kullanılan public HTTP endpoint'lerini içerir.
 * 
 * Ana İşlevler:
 * - İletişim formu mesaj oluşturma (public)
 * - Error handling ve logging
 * 
 * HTTP Endpoint'leri:
 * - POST /api/contact - İletişim mesajı gönder (public - giriş yapmadan)
 * 
 * Not: Admin mesaj yönetimi işlemleri adminController.js dosyasında tanımlanmıştır.
 * Kullanıcılar giriş yaptıktan sonra mesaj gönderme özelliği kullanılamaz.
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

'use strict';

const contactService = require('../services/contactService');
const { sendSuccess, sendError } = require('../utils/response');
const { AppError, catchAsync } = require('../utils/errorHandler');
const logger = require('../utils/logger');

// ============================================================================
// İLETİŞİM FORMU İŞLEMLERİ
// ============================================================================

/**
 * Yeni iletişim mesajı oluştur
 * @description Kullanıcı tarafından iletişim formu ile mesaj gönderme
 * @param {Object} req - Express request nesnesi
 * @param {Object} res - Express response nesnesi
 * @param {Function} next - Express next fonksiyonu
 * @returns {Promise<void>} Oluşturulan mesaj bilgisi
 */
// ============================================================================
// ADMIN MESAJ YÖNETİMİ İŞLEMLERİ
// ============================================================================

/**
 * Admin tarafından tüm iletişim mesajlarını listele
 * @description Admin tarafından iletişim mesajlarını sayfalama seçenekleriyle getirir
 * @param {Object} req - Express request nesnesi
 * @param {Object} res - Express response nesnesi
 * @param {Function} next - Express next fonksiyonu
 * @returns {Promise<void>} Mesaj listesi ve sayfalama bilgisi
 */
const getContactMessages = catchAsync(async (req, res) => {
  const filters = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 100,
    sort_by: req.query.sort_by || 'created_at',
    sort_order: req.query.sort_order || 'desc'
  };

  const result = await contactService.getContactMessages(filters);

  logger.info(`Admin ${req.user.id} iletişim mesajlarını listeledi`);
  return sendSuccess(res, 'İletişim mesajları başarıyla getirildi', result.data, 200, result.pagination);
});

/**
 * Admin tarafından tek mesaj detayını getir
 * @description Admin tarafından belirli bir iletişim mesajının detayını getirir
 * @param {Object} req - Express request nesnesi
 * @param {Object} res - Express response nesnesi
 * @param {Function} next - Express next fonksiyonu
 * @returns {Promise<void>} Mesaj detayı
 */
const getContactMessageById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const message = await contactService.getContactMessageById(id);

  if (!message) {
    throw new AppError('İletişim mesajı bulunamadı', 404);
  }

  logger.info(`Admin ${req.user.id} mesaj ${id} detayını görüntüledi`);
  return sendSuccess(res, 'İletişim mesajı başarıyla getirildi', message);
});

/**
 * Admin tarafından mesaj sil
 * @description Admin tarafından iletişim mesajını siler
 * @param {Object} req - Express request nesnesi
 * @param {Object} res - Express response nesnesi
 * @param {Function} next - Express next fonksiyonu
 * @returns {Promise<void>} Silme işlemi sonucu
 */
const deleteContactMessage = catchAsync(async (req, res) => {
  const { id } = req.params;

  await contactService.deleteContactMessage(id);

  logger.info(`Admin ${req.user.id} mesaj ${id} sildi`);
  return sendSuccess(res, 'İletişim mesajı başarıyla silindi', { id, deleted: true });
});

// ============================================================================
// İLETİŞİM FORMU İŞLEMLERİ
// ============================================================================

const createContactMessage = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;

    const messageId = await contactService.createContactMessage({
      name,
      email,
      subject,
      message
    });

    logger.info(`İletişim mesajı oluşturuldu: ${email} - ID: ${messageId}`);

    return sendSuccess(res, {
      message: 'Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.',
      data: { id: messageId }
    }, 201);

  } catch (error) {
    logger.error('İletişim mesajı oluşturma hatası:', error);
    return sendError(res, error.message, error.statusCode || 500);
  }
};


// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = {
  // Public iletişim formu işlemi
  createContactMessage,
  
  // Admin mesaj yönetimi
  getContactMessages,
  getContactMessageById,
  deleteContactMessage
};
