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
 * Upload Profile Photo
 * @route POST /api/mobile/upload/profile-photo
 * @access Private (Doctor)
 */
const uploadProfilePhoto = catchAsync(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'Dosya yüklenmedi'
    });
  }

  // File URL oluştur
  const fileUrl = `/uploads/profiles/${req.file.filename}`;
  
  logger.info(`Profile photo uploaded | User: ${req.user.userId} | File: ${req.file.filename}`);

  return sendSuccess(res, 'Fotoğraf başarıyla yüklendi', {
    url: fileUrl,
    filename: req.file.filename,
    size: req.file.size
  });
});

module.exports = {
  uploadProfilePhoto
};
