/**
 * @file mobileUploadController.js
 * @description Mobile upload controller - Mobil uygulama için dosya yükleme işlemlerini yönetir
 * 
 * Ana İşlevler:
 * - Profil fotoğrafı yükleme
 * - Dosya URL'i döndürme
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

'use strict';

const { catchAsync } = require('../../utils/errorHandler');
const { sendSuccess } = require('../../utils/response');
const logger = require('../../utils/logger');

/**
 * Upload Profile Photo (Base64)
 * @route POST /api/mobile/upload/profile-photo
 * @access Private (Doctor)
 */
const uploadProfilePhoto = catchAsync(async (req, res) => {
  const { photo } = req.body;
  
  if (!photo) {
    return res.status(400).json({
      success: false,
      message: 'Fotoğraf verisi bulunamadı'
    });
  }

  // Base64 string'i olduğu gibi döndür (MVP için)
  // Production'da gerçek file upload implementasyonu yapılabilir
  logger.info(`Profile photo uploaded (base64) | User: ${req.user.id} | Size: ${photo.length}`);

  return sendSuccess(res, 'Fotoğraf başarıyla yüklendi', {
    url: photo, // Base64 string'i URL olarak döndür
    filename: `profile_${req.user.id}_${Date.now()}.jpg`,
    size: photo.length
  });
});

module.exports = {
  uploadProfilePhoto
};
