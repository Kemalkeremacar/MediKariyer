/**
 * @file mobileUploadRoutes.js
 * @description Mobile upload routes - Mobil uygulama için dosya yükleme endpoint'leri
 * 
 * Ana Endpoint'ler:
 * - POST /api/mobile/upload/profile-photo - Profil fotoğrafı yükleme
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

'use strict';

const express = require('express');
const router = express.Router();
const { catchAsync } = require('../../utils/errorHandler');
const { sendSuccess } = require('../../utils/response');

// Test route
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Upload route is loaded!' });
});

/**
 * @route   POST /api/mobile/upload/profile-photo
 * @desc    Profil fotoğrafı yükleme (Base64 format)
 * @access  Public
 */
router.post('/profile-photo', catchAsync(async (req, res) => {
  const { photo } = req.body;
  
  if (!photo) {
    return res.status(400).json({
      success: false,
      message: 'Fotoğraf verisi bulunamadı'
    });
  }

  // Base64 string'i olduğu gibi döndür
  // Frontend'de zaten base64 olarak gönderilecek
  return sendSuccess(res, 'Fotoğraf başarıyla yüklendi', {
    url: photo, // Base64 string'i URL olarak döndür
    size: photo.length
  });
}));

module.exports = router;
