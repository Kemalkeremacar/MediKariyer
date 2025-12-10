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
const { authMiddleware } = require('../../middleware/authMiddleware');
const { requireDoctor } = require('../../middleware/roleGuard');
const { mobileErrorHandler, mobileErrorBoundary } = require('../../middleware/mobileErrorHandler');
const { validateBody } = require('../../middleware/validationMiddleware');
const Joi = require('joi');
const mobileUploadController = require('../../controllers/mobile/mobileUploadController');

// Base64 photo upload schema
const uploadPhotoSchema = Joi.object({
  photo: Joi.string().required().messages({
    'any.required': 'Fotoğraf verisi zorunludur',
    'string.base': 'Fotoğraf verisi string olmalıdır'
  })
});

router.use(mobileErrorHandler);
router.use(authMiddleware);
router.use(requireDoctor);

/**
 * @route   POST /api/mobile/upload/profile-photo
 * @desc    Profil fotoğrafı yükleme (Base64 format)
 * @access  Private (Doctor)
 */
router.post('/profile-photo', validateBody(uploadPhotoSchema), mobileUploadController.uploadProfilePhoto);

router.use(mobileErrorBoundary);

module.exports = router;
