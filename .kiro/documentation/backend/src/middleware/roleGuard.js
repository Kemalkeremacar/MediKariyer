/**
 * @file roleGuard.js
 * @description Dokümantasyon sistemi rol bazlı erişim kontrolü
 * Ana MediKariyer rol sistemine uygun
 */

'use strict';

const { USER_ROLES } = require('../config/appConstants');
const { AppError } = require('../utils/errorHandler');

/**
 * Belirli rollere erişim izni veren middleware
 * @param {...string} allowedRoles İzin verilen roller
 */
const requireRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // Kullanıcı kimlik doğrulaması yapılmış mı kontrol et
    if (!req.user) {
      return next(new AppError('Kimlik doğrulama gerekli', 401, 'AUTHENTICATION_REQUIRED'));
    }

    // Kullanıcının rolü izin verilen roller arasında mı kontrol et
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError('Bu işlem için yetkiniz yok', 403, 'INSUFFICIENT_PERMISSIONS'));
    }

    next();
  };
};

/**
 * Sadece admin erişimi
 */
const requireAdmin = requireRoles(USER_ROLES.ADMIN);

/**
 * Admin veya doktor erişimi
 */
const requireAdminOrDoctor = requireRoles(USER_ROLES.ADMIN, USER_ROLES.DOCTOR);

/**
 * Admin veya hastane erişimi
 */
const requireAdminOrHospital = requireRoles(USER_ROLES.ADMIN, USER_ROLES.HOSPITAL);

/**
 * Tüm roller için erişim (kimlik doğrulaması yeterli)
 */
const requireAuth = requireRoles(USER_ROLES.ADMIN, USER_ROLES.DOCTOR, USER_ROLES.HOSPITAL);

/**
 * Kullanıcının kendi kaydına erişim kontrolü
 * @param {string} userIdParam Request parametresindeki kullanıcı ID alanı adı
 */
const requireOwnershipOrAdmin = (userIdParam = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Kimlik doğrulama gerekli', 401, 'AUTHENTICATION_REQUIRED'));
    }

    const targetUserId = req.params[userIdParam];
    
    // Admin her şeye erişebilir veya kullanıcı kendi kaydına erişiyorsa
    if (req.user.role === USER_ROLES.ADMIN || req.user.id.toString() === targetUserId) {
      return next();
    }

    return next(new AppError('Bu kaynağa erişim yetkiniz yok', 403, 'ACCESS_DENIED'));
  };
};

/**
 * Dokümantasyon yazma yetkisi kontrolü
 * Admin: Tüm dokümantasyonları yazabilir
 * Doktor/Hastane: Sadece kendi alanlarıyla ilgili dokümantasyon yazabilir
 */
const requireDocumentationWriteAccess = (req, res, next) => {
  if (!req.user) {
    return next(new AppError('Kimlik doğrulama gerekli', 401, 'AUTHENTICATION_REQUIRED'));
  }

  // Admin her şeyi yazabilir
  if (req.user.role === USER_ROLES.ADMIN) {
    return next();
  }

  // Doktor ve hastane kullanıcıları sadece belirli dokümantasyon tiplerini yazabilir
  const allowedTypes = {
    [USER_ROLES.DOCTOR]: ['flow', 'api', 'component'],
    [USER_ROLES.HOSPITAL]: ['flow', 'component']
  };

  const userAllowedTypes = allowedTypes[req.user.role] || [];
  const documentationType = req.body.type || req.params.type;

  if (!userAllowedTypes.includes(documentationType)) {
    return next(new AppError('Bu dokümantasyon tipini oluşturma yetkiniz yok', 403, 'DOCUMENTATION_ACCESS_DENIED'));
  }

  next();
};

module.exports = {
  requireRoles,
  requireAdmin,
  requireAdminOrDoctor,
  requireAdminOrHospital,
  requireAuth,
  requireOwnershipOrAdmin,
  requireDocumentationWriteAccess
};