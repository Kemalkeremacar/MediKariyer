/**
 * @file contactRoutes.js
 * @description İletişim formu route'ları - İletişim mesajları için endpoint'leri tanımlar.
 * Bu route dosyası, sadece public iletişim formu işlemleri için gerekli endpoint'leri içerir.
 * 
 * Ana Endpoint'ler:
 * - POST /api/contact - İletişim mesajı gönder (public - giriş yapmadan)
 * 
 * Not: Admin mesaj yönetimi endpoint'leri adminRoutes.js dosyasında tanımlanmıştır.
 * Kullanıcılar giriş yaptıktan sonra mesaj gönderme özelliği kullanılamaz.
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

'use strict';

const express = require('express');
const { createContactMessage } = require('../controllers/contactController');
const { validateBody } = require('../middleware/validationMiddleware');
const { contactSchema } = require('../validators/contactSchemas');

const router = express.Router();

// ============================================================================
// PUBLIC İLETİŞİM ROUTES
// ============================================================================

/**
 * @route POST /api/contact
 * @description İletişim mesajı gönder (anasayfadan, giriş yapmadan)
 * @access Public - Herkese açık, authentication gerektirmez
 */
router.post('/',
  validateBody(contactSchema),
  createContactMessage
);

module.exports = router;
