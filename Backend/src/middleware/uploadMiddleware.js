/**
 * @file uploadMiddleware.js
 * @description File upload middleware - Multer ile dosya yükleme işlemlerini yönetir
 * 
 * Özellikler:
 * - Profil fotoğrafı yükleme (max 5MB)
 * - Sadece image formatları kabul edilir (jpg, jpeg, png)
 * - Dosya adı unique olarak oluşturulur
 * - uploads/profiles klasörüne kaydedilir
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

'use strict';

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { AppError } = require('../utils/errorHandler');

// Uploads klasörünü oluştur
const uploadsDir = path.join(__dirname, '../../uploads');
const profilesDir = path.join(uploadsDir, 'profiles');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(profilesDir)) {
  fs.mkdirSync(profilesDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profilesDir);
  },
  filename: (req, file, cb) => {
    // Unique filename: timestamp_random.ext
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    const ext = path.extname(file.originalname);
    cb(null, `profile_${timestamp}_${random}${ext}`);
  }
});

// File filter - sadece image dosyaları
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Sadece JPG, JPEG ve PNG formatları kabul edilir', 400), false);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: fileFilter
});

// Error handler for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Dosya boyutu çok büyük (maksimum 5MB)'
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload hatası: ${err.message}`
    });
  }
  next(err);
};

module.exports = {
  uploadProfilePhoto: upload.single('photo'),
  handleMulterError
};
