/**
 * @file doctorController.js
 * @description Doktor controller - Doktor profil yönetimi için HTTP request/response işlemlerini yönetir.
 * Bu controller, doctorRoutes tarafından kullanılan endpoint'leri içerir.
 * 
 * Ana İşlevler:
 * - Doktor profil yönetimi (GET, PUT, PATCH)
 * - Eğitim bilgileri CRUD işlemleri
 * - Deneyim bilgileri CRUD işlemleri
 * - Sertifika bilgileri CRUD işlemleri
 * - Dil bilgileri CRUD işlemleri
 * - Profil tamamlanma oranı
 * - Dashboard verileri (tek servis: doctorService)
 * 
 * Servis Ayrımı Mantığı:
 * - Tüm işlemler → doctorService (tek servis yaklaşımı)
 * - Dashboard → doctorService içindeki fonksiyonları kullanır
 * 
 * Endpoint'ler:
 * - GET /api/doctor/profile - Temel profil bilgileri
 * - PUT /api/doctor/profile - Profil güncelleme
 * - GET /api/doctor/profile/full - Tam profil bilgileri
 * - PATCH /api/doctor/profile/personal - Kişisel bilgi güncelleme
 * - GET/POST/PATCH/DELETE /api/doctor/educations - Eğitim CRUD
 * - GET/POST/PATCH/DELETE /api/doctor/experiences - Deneyim CRUD
 * - GET/POST/PATCH/DELETE /api/doctor/certificates - Sertifika CRUD
 * - GET/POST/PATCH/DELETE /api/doctor/languages - Dil CRUD
 * - GET /api/doctor/dashboard - Dashboard verileri (tek servis: doctorService)
 * - GET /api/doctor/profile/completion - Profil tamamlanma oranı
 * 
 * Not: Artık tek servis yaklaşımı kullanılıyor. Tüm işlemler doctorService üzerinden yapılır.
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

'use strict';

// ============================================================================
// DIŞ BAĞIMLILIKLAR
// ============================================================================

const doctorService = require('../services/doctorService');
const { AppError, catchAsync } = require('../utils/errorHandler');
const { sendSuccess } = require('../utils/response');
const logger = require('../utils/logger');

// Validation schemas import
const {
  doctorEducationSchema,
  doctorExperienceSchema,
  doctorCertificateSchema,
  doctorLanguageSchema
} = require('../validators/doctorSchemas');

// ============================================================================
// PROFİL YÖNETİMİ CONTROLLER'LARI
// ============================================================================

/**
 * Doktor profilini günceller (temel bilgiler)
 * @description Doktorun temel profil bilgilerini (ad, soyad, doğum tarihi, telefon vb.) günceller
 * @route PUT /api/doctor/profile
 * @access Private (Doctor)
 * @middleware authMiddleware, requireRole('doctor')
 * @param {Object} req.body - Güncellenecek profil verileri
 * @param {string} req.body.first_name - Doktorun adı
 * @param {string} req.body.last_name - Doktorun soyadı
 * @param {Date} req.body.dob - Doğum tarihi
 * @param {string} [req.body.birth_place] - Doğum yeri
 * @param {string} [req.body.residence_city] - İkamet şehri
 * @param {string} [req.body.phone] - Telefon numarası
 * @param {string} [req.body.title] - Ünvan (Dr, Uz.Dr, Dr.Öğr.Üyesi, Doç.Dr, Prof.Dr)
 * @param {string} [req.body.work_type] - Çalışma türü (tam_zamanli, yari_zamanli, nobet)
 * @param {string} [req.body.profile_photo] - Profil fotoğrafı URL'si (değiştirilirse admin onayına düşer)
 * @returns {Object} Güncellenmiş profil bilgileri
 * @throws {AppError} 400 - Geçersiz veri formatı
 * @throws {AppError} 404 - Profil bulunamadı
 * @throws {AppError} 500 - Sunucu hatası
 * 
 * @example
 * PUT /api/doctor/profile
 * {
 *   "first_name": "Ahmet",
 *   "last_name": "Yılmaz",
 *   "dob": "1990-01-01",
 *   "phone": "+905551234567",
 *   "title": "Uz.Dr",
 *   "work_type": "tam_zamanli"
 * }
 */
const updateProfile = catchAsync(async (req, res) => {
  const { first_name, last_name, dob, birth_place, residence_city, phone, title, specialty_id, subspecialty_id, profile_photo } = req.body;
  const userId = req.user.id;

  const updatedProfile = await doctorService.updatePersonalInfo(userId, {
    first_name,
    last_name,
    dob,
    birth_place,
    residence_city,
    phone,
    title,
    specialty_id,
    subspecialty_id,
    profile_photo
  });

  logger.info(`Doctor profile updated for user: ${req.user.email}`);

  return sendSuccess(res, 'Profil başarıyla güncellendi', {
    profile: updatedProfile
  });
});

/**
 * Doktor profilini getirir (temel bilgiler)
 * @description Doktorun temel profil bilgilerini getirir
 * @route GET /api/doctor/profile
 * @access Private (Doctor)
 * @middleware authMiddleware, requireRole('doctor')
 * @returns {Object} Doktor profil bilgileri
 * @throws {AppError} 404 - Profil bulunamadı
 * @throws {AppError} 500 - Sunucu hatası
 * 
 * @example
 * GET /api/doctor/profile
 */
const getProfile = catchAsync(async (req, res) => {
  const userId = req.user.id;

  const profile = await doctorService.getProfile(userId);

  if (!profile) {
    throw new AppError('Profil bulunamadı', 404);
  }

  // Email bilgisini users tablosundan ekle
  const profileWithEmail = {
    ...profile,
    email: req.user.email
  };

  return sendSuccess(res, 'Profil bilgileri getirildi', {
    profile: profileWithEmail
  });
});

/**
 * Doktorun kişisel bilgilerini günceller
 * @description Doktorun temel kişisel bilgilerini (ad, soyad, telefon, doğum tarihi vb.) günceller
 * @route PATCH /api/doctor/profile/personal
 * @access Private (Doctor)
 * @middleware authMiddleware, requireRole('doctor')
 * @param {Object} req.body - Güncellenecek kişisel bilgiler
 * @returns {Object} Güncellenmiş profil bilgileri
 * @throws {AppError} 400 - Geçersiz veri formatı
 * @throws {AppError} 404 - Profil bulunamadı
 * @throws {AppError} 500 - Sunucu hatası
 * 
 * @example
 * PATCH /api/doctor/profile/personal
 * {
 *   "first_name": "Ahmet",
 *   "last_name": "Yılmaz",
 *   "phone": "+905551234567"
 * }
 */
const updatePersonalInfo = catchAsync(async (req, res) => {
  const updatedProfile = await doctorService.updatePersonalInfo(req.user.id, req.body);
  logger.info(`Doctor personal info updated: ${req.user.email}`);
  return sendSuccess(res, 'Kişisel bilgiler güncellendi', { profile: updatedProfile });
});

/**
 * Doktor profilini getirir (tam profil - eğitim, deneyim, sertifika, dil dahil)
 * @description Doktorun tüm profil bilgilerini (eğitim, deneyim, sertifika, dil dahil) getirir
 * @route GET /api/doctor/me/doctor
 * @access Private (Doctor)
 * @middleware authMiddleware, requireRole('doctor')
 * @returns {Object} Tam doktor profil bilgileri
 * @throws {AppError} 404 - Profil bulunamadı
 * @throws {AppError} 500 - Sunucu hatası
 * 
 * @example
 * GET /api/doctor/me/doctor
 */
const getCompleteProfile = catchAsync(async (req, res) => {
  const userId = req.user.id;

  const profile = await doctorService.getCompleteProfile(userId);

  if (!profile) {
    throw new AppError('Profil bulunamadı', 404);
  }

  return sendSuccess(res, 'Profil bilgileri getirildi', {
    profile
  });
});

// ============================================================================
// EĞİTİM BİLGİLERİ CONTROLLER'LARI
// ============================================================================

/**
 * Doktorun eğitim bilgilerini getirir
 * @description Doktorun tüm eğitim kayıtlarını getirir
 * @route GET /api/doctor/educations
 * @access Private (Doctor)
 * @middleware authMiddleware, requireRole('doctor')
 * @returns {Array} Eğitim kayıtları listesi
 * @throws {AppError} 500 - Sunucu hatası
 * 
 * @example
 * GET /api/doctor/educations
 */
const getEducations = catchAsync(async (req, res) => {
  const educations = await doctorService.getEducations(req.user.id);
  return sendSuccess(res, 'Eğitim bilgileri getirildi', { educations });
});

/**
 * Doktor eğitim bilgisi ekler
 * @description Doktorun eğitim bilgilerini (üniversite, uzmanlık vb.) ekler
 * @route POST /api/doctor/educations
 * @access Private (Doctor)
 * @middleware authMiddleware, requireRole('doctor'), validate(doctorEducationSchema)
 * @param {Object} req.body - Eğitim bilgileri
 * @param {string} req.body.degree_type - Derece türü (Lisans, Yüksek Lisans, Doktora vb.)
 * @param {string} req.body.institution_name - Kurum adı
 * @param {string} req.body.field - Alan adı
 * @param {number} req.body.graduation_year - Mezuniyet yılı
 * @returns {Object} Eklenen eğitim kaydı
 * @throws {AppError} 400 - Geçersiz veri formatı
 * @throws {AppError} 404 - Profil bulunamadı
 * @throws {AppError} 500 - Sunucu hatası
 * 
 * @example
 * POST /api/doctor/educations
 * {
 *   "degree_type": "Tıp Fakültesi",
 *   "institution_name": "İstanbul Üniversitesi",
 *   "field": "Tıp",
 *   "graduation_year": 2015
 * }
 */
const addEducation = catchAsync(async (req, res) => {
  const education = await doctorService.addEducation(req.user.id, req.body);
  logger.info(`Education added: ${req.user.email}`);
  return sendSuccess(res, 'Eğitim bilgisi eklendi', { education }, 201);
});

/**
 * Doktor eğitim bilgisini günceller
 * @description Doktorun mevcut eğitim bilgilerini günceller
 * @route PATCH /api/doctor/educations/:id
 * @access Private (Doctor)
 * @middleware authMiddleware, requireRole('doctor'), validate(doctorEducationSchema)
 * @param {string} req.params.id - Güncellenecek eğitim kaydının ID'si
 * @param {Object} req.body - Güncellenecek eğitim bilgileri
 * @returns {Object} Güncellenmiş eğitim kaydı
 * @throws {AppError} 400 - Geçersiz veri formatı
 * @throws {AppError} 404 - Eğitim kaydı bulunamadı
 * @throws {AppError} 500 - Sunucu hatası
 * 
 * @example
 * PATCH /api/doctor/educations/123
 * {
 *   "degree_type": "Uzmanlık",
 *   "institution_name": "Ankara Üniversitesi"
 * }
 */
const updateEducation = catchAsync(async (req, res) => {
  const education = await doctorService.updateEducation(req.user.id, req.params.id, req.body);
  if (!education) throw new AppError('Eğitim kaydı bulunamadı', 404);
  logger.info(`Education updated: ${req.user.email}`);
  return sendSuccess(res, 'Eğitim bilgisi güncellendi', { education });
});

/**
 * Doktor eğitim bilgisini siler
 * @description Doktorun belirtilen eğitim kaydını siler
 * @route DELETE /api/doctor/educations/:id
 * @access Private (Doctor)
 * @middleware authMiddleware, requireRole('doctor')
 * @param {string} req.params.id - Silinecek eğitim kaydının ID'si
 * @returns {Object} Silme işleminin başarı durumu
 * @throws {AppError} 404 - Eğitim kaydı bulunamadı
 * @throws {AppError} 500 - Sunucu hatası
 * 
 * @example
 * DELETE /api/doctor/educations/123
 */
const deleteEducation = catchAsync(async (req, res) => {
  const deleted = await doctorService.deleteEducation(req.user.id, req.params.id);
  if (!deleted) throw new AppError('Eğitim kaydı bulunamadı', 404);
  logger.info(`Education deleted: ${req.user.email}`);
  return sendSuccess(res, 'Eğitim bilgisi silindi');
});

// ============================================================================
// DENEYİM BİLGİLERİ CONTROLLER'LARI
// ============================================================================

/**
 * Doktorun deneyim bilgilerini getirir
 * @description Doktorun tüm iş deneyimlerini getirir
 * @route GET /api/doctor/experiences
 * @access Private (Doctor)
 * @middleware authMiddleware, requireRole('doctor')
 * @returns {Array} Deneyim kayıtları listesi
 * @throws {AppError} 500 - Sunucu hatası
 * 
 * @example
 * GET /api/doctor/experiences
 */
const getExperiences = catchAsync(async (req, res) => {
  const experiences = await doctorService.getExperiences(req.user.id);
  return sendSuccess(res, 'Deneyim bilgileri getirildi', { experiences });
});

/**
 * Doktor deneyim bilgisi ekler
 * @description Doktorun iş deneyimlerini ekler
 * @route POST /api/doctor/experiences
 * @access Private (Doctor)
 * @middleware authMiddleware, requireRole('doctor'), validate(doctorExperienceSchema)
 * @param {Object} req.body - Deneyim bilgileri
 * @param {string} req.body.organization - Kurum adı
 * @param {string} req.body.role_title - Pozisyon adı
 * @param {string} [req.body.department] - Departman adı
 * @param {Date} req.body.start_date - Başlangıç tarihi
 * @param {Date} [req.body.end_date] - Bitiş tarihi
 * @param {boolean} [req.body.is_current] - Hala çalışıyor mu
 * @param {string} [req.body.description] - İş açıklaması
 * @returns {Object} Eklenen deneyim kaydı
 * @throws {AppError} 400 - Geçersiz veri formatı
 * @throws {AppError} 404 - Profil bulunamadı
 * @throws {AppError} 500 - Sunucu hatası
 * 
 * @example
 * POST /api/doctor/experiences
 * {
 *   "organization": "Acıbadem Hastanesi",
 *   "role_title": "Uzman Doktor",
 *   "department": "Kardiyoloji",
 *   "start_date": "2020-01-01",
 *   "is_current": true
 * }
 */
const addExperience = catchAsync(async (req, res) => {
  const experience = await doctorService.addExperience(req.user.id, req.body);
  logger.info(`Experience added: ${req.user.email}`);
  return sendSuccess(res, 'Deneyim bilgisi eklendi', { experience }, 201);
});

/**
 * Doktor deneyim bilgisini günceller
 * @description Doktorun mevcut deneyim bilgilerini günceller
 * @route PATCH /api/doctor/experiences/:id
 * @access Private (Doctor)
 * @middleware authMiddleware, requireRole('doctor'), validate(doctorExperienceSchema)
 * @param {string} req.params.id - Güncellenecek deneyim kaydının ID'si
 * @param {Object} req.body - Güncellenecek deneyim bilgileri
 * @returns {Object} Güncellenmiş deneyim kaydı
 * @throws {AppError} 400 - Geçersiz veri formatı
 * @throws {AppError} 404 - Deneyim kaydı bulunamadı
 * @throws {AppError} 500 - Sunucu hatası
 * 
 * @example
 * PATCH /api/doctor/experiences/123
 * {
 *   "organization": "Memorial Hastanesi",
 *   "role_title": "Başhekim"
 * }
 */
const updateExperience = catchAsync(async (req, res) => {
  const experience = await doctorService.updateExperience(req.user.id, req.params.id, req.body);
  if (!experience) throw new AppError('Deneyim kaydı bulunamadı', 404);
  logger.info(`Experience updated: ${req.user.email}`);
  return sendSuccess(res, 'Deneyim bilgisi güncellendi', { experience });
});

/**
 * Doktor deneyim bilgisini siler
 * @description Doktorun belirtilen deneyim kaydını siler
 * @route DELETE /api/doctor/experiences/:id
 * @access Private (Doctor)
 * @middleware authMiddleware, requireRole('doctor')
 * @param {string} req.params.id - Silinecek deneyim kaydının ID'si
 * @returns {Object} Silme işleminin başarı durumu
 * @throws {AppError} 404 - Deneyim kaydı bulunamadı
 * @throws {AppError} 500 - Sunucu hatası
 * 
 * @example
 * DELETE /api/doctor/experiences/123
 */
const deleteExperience = catchAsync(async (req, res) => {
  const deleted = await doctorService.deleteExperience(req.user.id, req.params.id);
  if (!deleted) throw new AppError('Deneyim kaydı bulunamadı', 404);
  logger.info(`Experience deleted: ${req.user.email}`);
  return sendSuccess(res, 'Deneyim bilgisi silindi');
});

// ============================================================================
// SERTİFİKA BİLGİLERİ CONTROLLER'LARI
// ============================================================================

/**
 * Doktorun sertifika bilgilerini getirir
 * @description Doktorun tüm sertifika kayıtlarını getirir
 * @route GET /api/doctor/certificates
 * @access Private (Doctor)
 * @middleware authMiddleware, requireRole('doctor')
 * @returns {Array} Sertifika kayıtları listesi
 * @throws {AppError} 500 - Sunucu hatası
 * 
 * @example
 * GET /api/doctor/certificates
 */
const getCertificates = catchAsync(async (req, res) => {
  const certificates = await doctorService.getCertificates(req.user.id);
  return sendSuccess(res, 'Sertifika bilgileri getirildi', { certificates });
});

/**
 * Doktor sertifika bilgisi ekler
 * @description Doktorun sertifika bilgilerini ekler
 * @route POST /api/doctor/certificates
 * @access Private (Doctor)
 * @middleware authMiddleware, requireRole('doctor'), validate(doctorCertificateSchema)
 * @param {Object} req.body - Sertifika bilgileri
 * @param {string} [req.body.title] - Sertifika adı (opsiyonel)
 * @param {string} req.body.institution - Kurum adı
 * @param {Date} req.body.issued_at - Alınış tarihi
 * @returns {Object} Eklenen sertifika kaydı
 * @throws {AppError} 400 - Geçersiz veri formatı
 * @throws {AppError} 404 - Profil bulunamadı
 * @throws {AppError} 500 - Sunucu hatası
 * 
 * @example
 * POST /api/doctor/certificates
 * {
 *   "title": "ACLS",
 *   "institution": "Amerikan Kalp Derneği",
 *   "issued_at": "2023-01-01"
 * }
 */
const addCertificate = catchAsync(async (req, res) => {
  try {
    const certificate = await doctorService.addCertificate(req.user.id, req.body);
    logger.info(`Certificate added: ${req.user.email}`);
    return sendSuccess(res, 'Sertifika eklendi', { certificate }, 201);
  } catch (error) {
    throw error;
  }
});

/**
 * Doktor sertifika bilgisini günceller
 * @description Doktorun mevcut sertifika bilgilerini günceller
 * @route PATCH /api/doctor/certificates/:id
 * @access Private (Doctor)
 * @middleware authMiddleware, requireRole('doctor'), validate(doctorCertificateSchema)
 * @param {string} req.params.id - Güncellenecek sertifika kaydının ID'si
 * @param {Object} req.body - Güncellenecek sertifika bilgileri
 * @param {string} [req.body.title] - Sertifika adı (opsiyonel)
 * @param {string} [req.body.institution] - Kurum adı
 * @param {Date} [req.body.issued_at] - Alınış tarihi
 * @returns {Object} Güncellenmiş sertifika kaydı
 * @throws {AppError} 400 - Geçersiz veri formatı
 * @throws {AppError} 404 - Sertifika kaydı bulunamadı
 * @throws {AppError} 500 - Sunucu hatası
 * 
 * @example
 * PATCH /api/doctor/certificates/123
 * {
 *   "title": "BLS Sertifikası",
 *   "institution": "Türk Kardiyoloji Derneği",
 *   "issued_at": "2024-01-01"
 * }
 */
const updateCertificate = catchAsync(async (req, res) => {
  try {
    const certificate = await doctorService.updateCertificate(req.user.id, req.params.id, req.body);
    if (!certificate) throw new AppError('Sertifika kaydı bulunamadı', 404);
    logger.info(`Certificate updated: ${req.user.email}`);
    return sendSuccess(res, 'Sertifika güncellendi', { certificate });
  } catch (error) {
    throw error;
  }
});

/**
 * Doktor sertifika bilgisini siler
 * @description Doktorun belirtilen sertifika kaydını siler
 * @route DELETE /api/doctor/certificates/:id
 * @access Private (Doctor)
 * @middleware authMiddleware, requireRole('doctor')
 * @param {string} req.params.id - Silinecek sertifika kaydının ID'si
 * @returns {Object} Silme işleminin başarı durumu
 * @throws {AppError} 404 - Sertifika kaydı bulunamadı
 * @throws {AppError} 500 - Sunucu hatası
 * 
 * @example
 * DELETE /api/doctor/certificates/123
 */
const deleteCertificate = catchAsync(async (req, res) => {
  const deleted = await doctorService.deleteCertificate(req.user.id, req.params.id);
  if (!deleted) throw new AppError('Sertifika kaydı bulunamadı', 404);
  logger.info(`Certificate deleted: ${req.user.email}`);
  return sendSuccess(res, 'Sertifika silindi');
});

// ============================================================================
// DİL BİLGİLERİ CONTROLLER'LARI
// ============================================================================

/**
 * Doktorun dil bilgilerini getirir
 * @description Doktorun tüm dil kayıtlarını getirir
 * @route GET /api/doctor/languages
 * @access Private (Doctor)
 * @middleware authMiddleware, requireRole('doctor')
 * @returns {Array} Dil kayıtları listesi
 * @throws {AppError} 500 - Sunucu hatası
 * 
 * @example
 * GET /api/doctor/languages
 */
const getLanguages = catchAsync(async (req, res) => {
  const languages = await doctorService.getLanguages(req.user.id);
  return sendSuccess(res, 'Dil bilgileri getirildi', { languages });
});

/**
 * Doktor dil bilgisi ekler
 * @description Doktorun dil bilgilerini ekler
 * @route POST /api/doctor/languages
 * @access Private (Doctor)
 * @middleware authMiddleware, requireRole('doctor'), validate(doctorLanguageSchema)
 * @param {Object} req.body - Dil bilgileri
 * @param {number} req.body.language_id - Dil ID'si (languages tablosundan)
 * @param {number} req.body.level_id - Dil seviyesi ID'si (language_levels tablosundan)
 * @returns {Object} Eklenen dil kaydı
 * @throws {AppError} 400 - Geçersiz veri formatı
 * @throws {AppError} 404 - Profil bulunamadı
 * @throws {AppError} 500 - Sunucu hatası
 * 
 * @example
 * POST /api/doctor/languages
 * {
 *   "language_id": 2,
 *   "level_id": 3
 * }
 */
const addLanguage = catchAsync(async (req, res) => {
  const language = await doctorService.addLanguage(req.user.id, req.body);
  logger.info(`Language added: ${req.user.email}`);
  return sendSuccess(res, 'Dil bilgisi eklendi', { language }, 201);
});

/**
 * Doktor dil bilgisini günceller
 * @description Doktorun mevcut dil bilgilerini günceller
 * @route PATCH /api/doctor/languages/:id
 * @access Private (Doctor)
 * @middleware authMiddleware, requireRole('doctor'), validate(doctorLanguageSchema)
 * @param {string} req.params.id - Güncellenecek dil kaydının ID'si
 * @param {Object} req.body - Güncellenecek dil bilgileri
 * @param {number} [req.body.language_id] - Dil ID'si (languages tablosundan)
 * @param {number} [req.body.level_id] - Dil seviyesi ID'si (language_levels tablosundan)
 * @returns {Object} Güncellenmiş dil kaydı
 * @throws {AppError} 400 - Geçersiz veri formatı
 * @throws {AppError} 404 - Dil kaydı bulunamadı
 * @throws {AppError} 500 - Sunucu hatası
 * 
 * @example
 * PATCH /api/doctor/languages/123
 * {
 *   "language_id": 3,
 *   "level_id": 2
 * }
 */
const updateLanguage = catchAsync(async (req, res) => {
  const language = await doctorService.updateLanguage(req.user.id, req.params.id, req.body);
  if (!language) throw new AppError('Dil kaydı bulunamadı', 404);
  logger.info(`Language updated: ${req.user.email}`);
  return sendSuccess(res, 'Dil bilgisi güncellendi', { language });
});

/**
 * Doktor dil bilgisini siler
 * @description Doktorun belirtilen dil kaydını siler
 * @route DELETE /api/doctor/languages/:id
 * @access Private (Doctor)
 * @middleware authMiddleware, requireRole('doctor')
 * @param {string} req.params.id - Silinecek dil kaydının ID'si
 * @returns {Object} Silme işleminin başarı durumu
 * @throws {AppError} 404 - Dil kaydı bulunamadı
 * @throws {AppError} 500 - Sunucu hatası
 * 
 * @example
 * DELETE /api/doctor/languages/123
 */
const deleteLanguage = catchAsync(async (req, res) => {
  const deleted = await doctorService.deleteLanguage(req.user.id, req.params.id);
  if (!deleted) throw new AppError('Dil kaydı bulunamadı', 404);
  logger.info(`Language deleted: ${req.user.email}`);
  return sendSuccess(res, 'Dil bilgisi silindi');
});

// ============================================================================
// PROFİL TAMAMLANMA VE DASHBOARD CONTROLLER'LARI
// ============================================================================

/**
 * Doktor profilinin tamamlanma yüzdesini getirir
 * @description Doktorun profil bilgilerinin ne kadarının doldurulduğunu hesaplar
 * @route GET /api/doctor/profile-completion
 * @access Private (Doctor)
 * @middleware authMiddleware, requireRole('doctor')
 * @returns {Object} Profil tamamlanma bilgileri (yüzde, eksik alanlar, sayılar)
 * @throws {AppError} 500 - Sunucu hatası
 * 
 * Response Yapısı:
 * {
 *   completion_percentage: 85,
 *   missing_fields: ['birth_place', 'certificates'],
 *   sections: { personal: 75, education: true, experience: true, certificates: false, languages: true },
 *   details: { ... }
 * }
 * 
 * @example
 * GET /api/doctor/profile-completion
 */
const getProfileCompletion = catchAsync(async (req, res) => {
  const userId = req.user.id;
  logger.info(`[Profile Completion] Request from user: ${userId}`);
  
  const completion = await doctorService.getProfileCompletion(userId);
  
  logger.info(`[Profile Completion] Result for user ${userId}:`, {
    completion_percentage: completion.completion_percentage,
    missing_fields: completion.missing_fields,
    sections: completion.sections
  });
  
  return sendSuccess(res, 'Profil tamamlanma oranı getirildi', completion);
});

/**
 * Doktor dashboard verilerini getirir
 * @description Doktorun profil tamamlanma durumu, başvuru istatistikleri, son başvurular ve bildirimlerini getirir
 * @route GET /api/doctor/dashboard
 * @access Private (Doctor)
 * @middleware authMiddleware, requireRole('doctor')
 * @returns {Object} Dashboard verileri (profil tamamlanma, başvuru istatistikleri, son başvurular, bildirimler)
 * @throws {AppError} 500 - Sunucu hatası
 * 
 * @example
 * GET /api/doctor/dashboard
 */
const getDashboard = catchAsync(async (req, res) => {
  const userId = req.user.id;
  
  // Önce doctor_profile_id'yi bul
  const profile = await doctorService.getProfile(userId);
  if (!profile) {
    throw new AppError('Profil bulunamadı', 404);
  }
  
  const doctorProfileId = profile.id;
  
  // Paralel olarak 4 servisten verileri al
  // Limit artırıldı: 5 → 100 (tüm başvurular ve ilanlar için)
  const [profileCompletion, applicationStats, recentApplications, recentJobs] = await Promise.all([
    doctorService.getProfileCompletion(userId),
    doctorService.getDoctorApplicationStats(doctorProfileId),
    doctorService.getDoctorRecentApplications(doctorProfileId, 100),
    doctorService.getDoctorRecentJobs(doctorProfileId, 100)
  ]);
  
  const dashboardData = {
    profile_completion: profileCompletion,
    application_stats: applicationStats,
    recent_applications: recentApplications,
    recent_jobs: recentJobs
  };
  
  return sendSuccess(res, 'Dashboard verileri getirildi', dashboardData);
});


// ============================================================================
// BAŞVURU FONKSİYONLARI (applicationService'den taşındı)
// ============================================================================

/**
 * Doktorlar için yeni başvuru oluştur
 * @description Doktorlar için iş ilanına başvuru oluşturur.
 * @param {Object} req - Express request nesnesi
 * @param {Object} res - Express response nesnesi
 * @returns {Promise<void>} Oluşturulan başvuru
 * @throws {AppError} İlan bulunamadı, başvuruya kapalı, daha önce başvuru yapılmış
 * 
 * @example
 * POST /api/doctor/applications
 * Body: { jobId: 123, coverLetter: "Bu pozisyon için çok uygun olduğumu düşünüyorum..." }
 */
const createApplication = catchAsync(async (req, res) => {
  const userId = req.user.id;
  
  // Doktor profilini al
  const profile = await doctorService.getProfile(userId);
  if (!profile) {
    throw new AppError('Profil bulunamadı', 404);
  }
  
  const application = await doctorService.createApplication(profile.id, req.body);
  
  return sendSuccess(res, 'Başvuru başarıyla oluşturuldu', application, 201);
});

/**
 * Doktorlar için kendi başvurularını getir
 * @description Doktorun kendi başvurularını filtreleme ve sayfalama ile getirir.
 * @param {Object} req - Express request nesnesi
 * @param {Object} res - Express response nesnesi
 * @returns {Promise<void>} Başvurular listesi
 * @throws {AppError} Veritabanı hatası durumunda
 * 
 * @example
 * GET /api/doctor/applications/me?status=pending&page=1&limit=10
 */
const getMyApplications = catchAsync(async (req, res) => {
  const userId = req.user.id;
  
  // Doktor profilini al
  const profile = await doctorService.getProfile(userId);
  if (!profile) {
    throw new AppError('Profil bulunamadı', 404);
  }
  
  const result = await doctorService.getMyApplications(profile.id, req.query);
  
  return sendSuccess(res, 'Başvurular getirildi', result);
});

/**
 * Doktorlar için tek başvuru detayını getir
 * @description Doktorlar için belirli bir başvurunun detaylarını getirir.
 * @param {Object} req - Express request nesnesi
 * @param {Object} res - Express response nesnesi
 * @returns {Promise<void>} Başvuru detayları
 * @throws {AppError} Başvuru bulunamadı veya sahiplik hatası
 * 
 * @example
 * GET /api/doctor/applications/123
 */
const getApplicationById = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  
  // Doktor profilini al
  const profile = await doctorService.getProfile(userId);
  if (!profile) {
    throw new AppError('Profil bulunamadı', 404);
  }
  
  const application = await doctorService.getApplicationById(id, profile.id);
  
  return sendSuccess(res, 'Başvuru detayları getirildi', application);
});

/**
 * Doktorlar için başvuruyu geri çek
 * @description Doktorlar için başvuruyu geri çeker.
 * @param {Object} req - Express request nesnesi
 * @param {Object} res - Express response nesnesi
 * @returns {Promise<void>} Güncellenmiş başvuru
 * @throws {AppError} Başvuru bulunamadı, sahiplik hatası, zaten geri çekilmiş
 * 
 * @example
 * PATCH /api/doctor/applications/123/withdraw
 * Body: { reason: "Başka bir pozisyon buldum" }
 */
const withdrawApplication = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { reason } = req.body;
  
  // Doktor profilini al
  const profile = await doctorService.getProfile(userId);
  if (!profile) {
    throw new AppError('Profil bulunamadı', 404);
  }
  
  const application = await doctorService.withdrawApplication(id, profile.id, reason);
  
  return sendSuccess(res, 'Başvuru başarıyla geri çekildi', application);
});

/**
 * Doktorlar için başvuruyu kalıcı olarak sil
 * @description Doktorlar için başvuruyu kalıcı olarak siler.
 * @param {Object} req - Express request nesnesi
 * @param {Object} res - Express response nesnesi
 * @returns {Promise<void>} Silme sonucu
 * 
 * @example
 * DELETE /api/doctor/applications/123
 */
const deleteApplication = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  
  // Doktor profilini al
  const profile = await doctorService.getProfile(userId);
  if (!profile) {
    throw new AppError('Profil bulunamadı', 404);
  }
  
  const result = await doctorService.deleteApplication(id, profile.id);
  
  return sendSuccess(res, 'Başvuru kalıcı olarak silindi', result);
});

/**
 * Doktorlar için geri çekilen başvuruya yeniden başvuru yap
 * @description Geri çekilen başvuruyu silip yeni başvuru oluşturur.
 * @param {Object} req - Express request nesnesi
 * @param {Object} res - Express response nesnesi
 * @returns {Promise<void>} Yeni başvuru
 * 
 * @example
 * POST /api/doctor/applications/123/reapply
 * Body: { coverLetter: "Yeni ön yazı" }
 */
const reapplyToJob = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { coverLetter } = req.body;
  
  // Doktor profilini al
  const profile = await doctorService.getProfile(userId);
  if (!profile) {
    throw new AppError('Profil bulunamadı', 404);
  }
  
  const application = await doctorService.reapplyToJob(id, profile.id, coverLetter);
  
  return sendSuccess(res, 'Başvuru başarıyla yeniden yapıldı', application);
});

/**
 * Doktorlar için iş ilanlarını getir
 * @description Doktorlar için aktif iş ilanlarını filtreleme ve arama ile getirir.
 * @param {Object} req - Express request nesnesi
 * @param {Object} res - Express response nesnesi
 * @returns {Promise<void>} İş ilanları listesi
 * @throws {AppError} Veritabanı hatası durumunda
 * 
 * @example
 * GET /api/jobs?specialty=Kardiyoloji&city=İstanbul&page=1&limit=10
 */
const getJobs = catchAsync(async (req, res) => {
  const filters = req.query;
  
  const result = await doctorService.getJobs(filters);
  
  return sendSuccess(res, 'İş ilanları getirildi', result);
});

/**
 * Doktorlar için tek iş ilanı detayını getir
 * @description Doktorlar için belirli bir iş ilanının detaylarını getirir.
 * @param {Object} req - Express request nesnesi
 * @param {Object} res - Express response nesnesi
 * @returns {Promise<void>} İş ilanı detayları
 * @throws {AppError} İş ilanı bulunamadı veya aktif değil
 * 
 * @example
 * GET /api/jobs/123
 */
const getJobById = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  const job = await doctorService.getJobById(id);
  
  return sendSuccess(res, 'İş ilanı detayları getirildi', job);
});

// ============================================================================
// FOTOĞRAF ONAY SİSTEMİ
// ============================================================================

/**
 * Profil fotoğrafı değişiklik talebi oluştur
 * @description Doktor yeni profil fotoğrafı yükler, admin onayına gönderir
 * @route POST /api/doctor/profile/photo
 * @access Private (Doctor)
 */
const requestPhotoChange = catchAsync(async (req, res) => {
  const { file_url } = req.body;
  
  if (!file_url) {
    throw new AppError('Fotoğraf URL\'si gereklidir', 400);
  }
  
  // Base64 data-url veya HTTP URL kontrolü
  if (!file_url.startsWith('data:image/') && !file_url.startsWith('http')) {
    throw new AppError('Geçersiz fotoğraf formatı', 400);
  }
  
  const request = await doctorService.requestProfilePhotoChange(req.user.id, file_url);
  
  sendSuccess(res, {
    message: 'Fotoğraf değişiklik talebi oluşturuldu. Admin onayı bekleniyor.',
    data: { request }
  }, 201);
});

/**
 * Fotoğraf talep durumunu getir
 * @description Doktorun son fotoğraf talep durumunu getirir
 * @route GET /api/doctor/profile/photo/status
 * @access Private (Doctor)
 */
const getPhotoRequestStatus = catchAsync(async (req, res) => {
  const status = await doctorService.getMyPhotoRequestStatus(req.user.id);
  
  sendSuccess(res, 'Fotoğraf talep durumu getirildi', { status });
});

/**
 * Fotoğraf talebini iptal et
 * @description Doktor bekleyen fotoğraf talebini iptal eder
 * @route DELETE /api/doctor/profile/photo/request
 * @access Private (Doctor)
 */
const cancelPhotoRequest = catchAsync(async (req, res) => {
  const cancelled = await doctorService.cancelPhotoRequest(req.user.id);
  
  if (!cancelled) {
    throw new AppError('İptal edilecek bekleyen talep bulunamadı', 404);
  }
  
  sendSuccess(res, {
    message: 'Fotoğraf talebi iptal edildi'
  });
});

// ============================================================================
// MODULE EXPORTS
// ============================================================================

/**
 * Profil güncelleme bildirimi gönder (Doktor için)
 * @description Doktor profili güncellendiğinde kendisine bildirim gönderir
 * @param {Object} req - Express request objesi
 * @param {Object} req.body - Bildirim verileri
 * @param {string} req.body.updateType - Güncelleme türü (personal_info, education, experience, certificate, language)
 * @param {string} req.body.updateDescription - Güncelleme açıklaması
 * @param {Object} req.user - Authenticated user bilgileri
 * @param {string} req.user.role - Kullanıcı rolü ('doctor')
 * @param {Object} res - Express response objesi
 * @returns {Promise<void>} Gönderilen bildirim bilgisi
 * @throws {AppError} Veritabanı hatası durumunda
 * 
 * @example
 * POST /api/doctor/profile/notify-update
 * Body: { updateType: "education", updateDescription: "Yeni eğitim bilgisi eklendi" }
 * Response: { notification: {...} }
 */
const sendProfileUpdateNotification = catchAsync(async (req, res) => {
  const { updateType, updateDescription } = req.body;
  const userId = req.user.id;

  const notification = await doctorService.sendProfileUpdateNotification(userId, updateType, updateDescription);
  
  logger.info(`Profile update notification sent for doctor user ${req.user.id}`);
  return sendSuccess(res, 'Profil güncelleme bildirimi gönderildi', { notification });
});

module.exports = {
  // Profil yönetimi
  updateProfile,
  getProfile,
  getCompleteProfile,
  updatePersonalInfo,
  
  // Eğitim bilgileri
  getEducations,
  addEducation,
  updateEducation,
  deleteEducation,
  
  // Deneyim bilgileri
  getExperiences,
  addExperience,
  updateExperience,
  deleteExperience,
  
  // Sertifika bilgileri
  getCertificates,
  addCertificate,
  updateCertificate,
  deleteCertificate,
  
  // Dil bilgileri
  getLanguages,
  addLanguage,
  updateLanguage,
  deleteLanguage,
  
  // Profil tamamlanma ve dashboard
  getProfileCompletion,
  getDashboard,
  
  // Profil güncelleme bildirimleri
  sendProfileUpdateNotification,
  
  // Başvuru fonksiyonları (applicationService'den taşındı)
  createApplication,
  getMyApplications,
  getApplicationById,
  withdrawApplication,
  deleteApplication,
  reapplyToJob,
  
  // İş ilanı fonksiyonları (jobService'den taşındı)
  getJobs,
  getJobById,
  
  // Fotoğraf onay sistemi
  requestPhotoChange,
  getPhotoRequestStatus,
  cancelPhotoRequest
};
