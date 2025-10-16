/**
 * Lookup Controller - Sistem lookup verileri için controller
 * 
 * Bu controller sistem genelinde kullanılan lookup verilerini sağlar:
 * - Uzmanlık alanları (specialties)
 * - Şehirler (cities) 
 * - Doktor eğitim türleri (doctor_education_types)
 * - Dil seviyeleri (language_levels)
 * - Diller (languages)
 * - Sertifika türleri (certificate_types)
 * - İş durumları (job_statuses)
 * - Başvuru durumları (application_statuses)
 * 
 * Bu veriler doktor/hastane profilleri oluştururken, iş ilanları oluştururken
 * ve admin sayfalarında dropdown/select bileşenleri için kullanılır.
 * 
 * @author MediKariyer Team
 * @version 1.0.0
 * @since 2024
 */

const lookupService = require('../services/lookupService');
const { successResponse, errorResponse } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Tüm uzmanlık alanlarını getir
 * 
 * Doktor profillerinde ve iş ilanlarında kullanılan uzmanlık alanlarını döndürür.
 * Alfabetik sıraya göre sıralanır.
 * 
 * @route GET /api/lookup/specialties
 * @access Public
 * @returns {Object} JSON response
 * @returns {boolean} success - İşlem başarılı mı
 * @returns {Array} data - Uzmanlık alanları listesi
 * @returns {string} message - Başarı mesajı
 * 
 * @example
 * GET /api/lookup/specialties
 * Response: {
 *   "success": true,
 *   "data": [
 *     { "id": 1, "name": "Kardiyoloji", "description": "Kalp ve damar hastalıkları" },
 *     { "id": 2, "name": "Nöroloji", "description": "Sinir sistemi hastalıkları" }
 *   ],
 *   "message": "Uzmanlık alanları başarıyla getirildi"
 * }
 */
const getSpecialties = async (req, res) => {
  try {
    logger.info('Lookup specialties request received');
    
    const specialties = await lookupService.getSpecialties();
    
    res.status(200).json(successResponse(
      specialties,
      'Uzmanlık alanları başarıyla getirildi'
    ));
  } catch (error) {
    logger.error('Error getting specialties:', error);
    res.status(500).json(errorResponse(
      'Uzmanlık alanları getirilirken hata oluştu',
      error.message
    ));
  }
};

/**
 * Tüm şehirleri getir
 * 
 * Doktor profillerinde ve hastane profillerinde kullanılan şehirleri döndürür.
 * Alfabetik sıraya göre sıralanır.
 * 
 * @route GET /api/lookup/cities
 * @access Public
 * @returns {Object} JSON response
 * @returns {boolean} success - İşlem başarılı mı
 * @returns {Array} data - Şehirler listesi
 * @returns {string} message - Başarı mesajı
 * 
 * @example
 * GET /api/lookup/cities
 * Response: {
 *   "success": true,
 *   "data": [
 *     { "id": 1, "name": "İstanbul", "country": "Turkey" },
 *     { "id": 2, "name": "Ankara", "country": "Turkey" }
 *   ],
 *   "message": "Şehirler başarıyla getirildi"
 * }
 */
const getCities = async (req, res) => {
  try {
    logger.info('Lookup cities request received');
    
    const cities = await lookupService.getCities();
    
    res.status(200).json(successResponse(
      cities,
      'Şehirler başarıyla getirildi'
    ));
  } catch (error) {
    logger.error('Error getting cities:', error);
    res.status(500).json(errorResponse(
      'Şehirler getirilirken hata oluştu',
      error.message
    ));
  }
};

/**
 * Tüm doktor eğitim türlerini getir
 * 
 * Doktor profillerinde eğitim bilgileri eklerken kullanılan eğitim türlerini döndürür.
 * Zorunlu olanlar önce, sonra alfabetik sıraya göre sıralanır.
 * 
 * @route GET /api/lookup/doctor-education-types
 * @access Public
 * @returns {Object} JSON response
 * @returns {boolean} success - İşlem başarılı mı
 * @returns {Array} data - Doktor eğitim türleri listesi
 * @returns {string} message - Başarı mesajı
 * 
 * @example
 * GET /api/lookup/doctor-education-types
 * Response: {
 *   "success": true,
 *   "data": [
 *     { "id": 1, "name": "Tıp Fakültesi", "description": "Lisans eğitimi", "is_required": true },
 *     { "id": 2, "name": "Uzmanlık", "description": "Tıpta uzmanlık", "is_required": false },
 *     { "id": 3, "name": "Yüksek Lisans", "description": "Master eğitimi", "is_required": false },
 *     { "id": 4, "name": "DİĞER", "description": "Diğer eğitim türleri için özel alan", "is_required": false }
 *   ],
 *   "message": "Doktor eğitim türleri başarıyla getirildi"
 * }
 */
const getDoctorEducationTypes = async (req, res) => {
  try {
    logger.info('Lookup doctor education types request received');
    
    const educationTypes = await lookupService.getDoctorEducationTypes();
    
    res.status(200).json(successResponse(
      educationTypes,
      'Doktor eğitim türleri başarıyla getirildi'
    ));
  } catch (error) {
    logger.error('Error getting doctor education types:', error);
    res.status(500).json(errorResponse(
      'Doktor eğitim türleri getirilirken hata oluştu',
      error.message
    ));
  }
};

/**
 * Tüm dil seviyelerini getir
 * 
 * Doktor profillerinde dil bilgileri eklerken kullanılan dil seviyelerini döndürür.
 * Alfabetik sıraya göre sıralanır.
 * 
 * @route GET /api/lookup/language-levels
 * @access Public
 * @returns {Object} JSON response
 * @returns {boolean} success - İşlem başarılı mı
 * @returns {Array} data - Dil seviyeleri listesi
 * @returns {string} message - Başarı mesajı
 * 
 * @example
 * GET /api/lookup/language-levels
 * Response: {
 *   "success": true,
 *   "data": [
 *     { "id": 1, "name": "Başlangıç", "description": "Temel seviye" },
 *     { "id": 2, "name": "İleri", "description": "İleri seviye" }
 *   ],
 *   "message": "Dil seviyeleri başarıyla getirildi"
 * }
 */
const getLanguageLevels = async (req, res) => {
  try {
    logger.info('Lookup language levels request received');
    
    const languageLevels = await lookupService.getLanguageLevels();
    
    res.status(200).json(successResponse(
      languageLevels,
      'Dil seviyeleri başarıyla getirildi'
    ));
  } catch (error) {
    logger.error('Error getting language levels:', error);
    res.status(500).json(errorResponse(
      'Dil seviyeleri getirilirken hata oluştu',
      error.message
    ));
  }
};

/**
 * Tüm dilleri getir
 * 
 * Doktor profillerinde dil bilgileri eklerken kullanılan dilleri döndürür.
 * Alfabetik sıraya göre sıralanır.
 * 
 * @route GET /api/lookup/languages
 * @access Public
 * @returns {Object} JSON response
 * @returns {boolean} success - İşlem başarılı mı
 * @returns {Array} data - Diller listesi
 * @returns {string} message - Başarı mesajı
 * 
 * @example
 * GET /api/lookup/languages
 * Response: {
 *   "success": true,
 *   "data": [
 *     { "id": 1, "name": "Türkçe", "code": "tr" },
 *     { "id": 2, "name": "İngilizce", "code": "en" }
 *   ],
 *   "message": "Diller başarıyla getirildi"
 * }
 */
const getLanguages = async (req, res) => {
  try {
    logger.info('Lookup languages request received');
    
    const languages = await lookupService.getLanguages();
    
    res.status(200).json(successResponse(
      languages,
      'Diller başarıyla getirildi'
    ));
  } catch (error) {
    logger.error('Error getting languages:', error);
    res.status(500).json(errorResponse(
      'Diller getirilirken hata oluştu',
      error.message
    ));
  }
};

/**
 * Tüm sertifika türlerini getir
 * 
 * Doktor profillerinde sertifika bilgileri eklerken kullanılan sertifika türlerini döndürür.
 * Zorunlu olanlar önce, sonra alfabetik sıraya göre sıralanır.
 * 
 * @route GET /api/lookup/certificate-types
 * @access Public
 * @returns {Object} JSON response
 * @returns {boolean} success - İşlem başarılı mı
 * @returns {Array} data - Sertifika türleri listesi
 * @returns {string} message - Başarı mesajı
 * 
 * @example
 * GET /api/lookup/certificate-types
 * Response: {
 *   "success": true,
 *   "data": [
 *     { "id": 1, "name": "Tıp Diploması", "description": "Tıp fakültesi diploması", "is_required": true },
 *     { "id": 2, "name": "Uzmanlık Sertifikası", "description": "Tıpta uzmanlık", "is_required": false }
 *   ],
 *   "message": "Sertifika türleri başarıyla getirildi"
 * }
 */
const getCertificateTypes = async (req, res) => {
  try {
    logger.info('Lookup certificate types request received');
    
    const certificateTypes = await lookupService.getCertificateTypes();
    
    res.status(200).json(successResponse(
      certificateTypes,
      'Sertifika türleri başarıyla getirildi'
    ));
  } catch (error) {
    logger.error('Error getting certificate types:', error);
    res.status(500).json(errorResponse(
      'Sertifika türleri getirilirken hata oluştu',
      error.message
    ));
  }
};

/**
 * Tüm iş durumlarını getir
 * 
 * İş ilanlarında ve admin sayfalarında kullanılan iş durumlarını döndürür.
 * ID sırasına göre sıralanır.
 * 
 * @route GET /api/lookup/job-statuses
 * @access Public
 * @returns {Object} JSON response
 * @returns {boolean} success - İşlem başarılı mı
 * @returns {Array} data - İş durumları listesi
 * @returns {string} message - Başarı mesajı
 * 
 * @example
 * GET /api/lookup/job-statuses
 * Response: {
 *   "success": true,
 *   "data": [
 *     { "id": 1, "name": "Aktif" },
 *     { "id": 2, "name": "Pasif" },
 *     { "id": 3, "name": "Draft" }
 *   ],
 *   "message": "İş durumları başarıyla getirildi"
 * }
 */
const getJobStatuses = async (req, res) => {
  try {
    logger.info('Lookup job statuses request received');
    
    const jobStatuses = await lookupService.getJobStatuses();
    
    res.status(200).json(successResponse(
      jobStatuses,
      'İş durumları başarıyla getirildi'
    ));
  } catch (error) {
    logger.error('Error getting job statuses:', error);
    res.status(500).json(errorResponse(
      'İş durumları getirilirken hata oluştu',
      error.message
    ));
  }
};

/**
 * Tüm başvuru durumlarını getir
 * 
 * Doktor başvurularında ve admin sayfalarında kullanılan başvuru durumlarını döndürür.
 * ID sırasına göre sıralanır.
 * 
 * @route GET /api/lookup/application-statuses
 * @access Public
 * @returns {Object} JSON response
 * @returns {boolean} success - İşlem başarılı mı
 * @returns {Array} data - Başvuru durumları listesi
 * @returns {string} message - Başarı mesajı
 * 
 * @example
 * GET /api/lookup/application-statuses
 * Response: {
 *   "success": true,
 *   "data": [
 *     { "id": 1, "name": "Beklemede" },
 *     { "id": 2, "name": "İnceleniyor" },
 *     { "id": 3, "name": "Kabul Edildi" },
 *     { "id": 4, "name": "Reddedildi" }
 *   ],
 *   "message": "Başvuru durumları başarıyla getirildi"
 * }
 */
const getApplicationStatuses = async (req, res) => {
  try {
    logger.info('Lookup application statuses request received');
    
    const applicationStatuses = await lookupService.getApplicationStatuses();
    
    res.status(200).json(successResponse(
      applicationStatuses,
      'Başvuru durumları başarıyla getirildi'
    ));
  } catch (error) {
    logger.error('Error getting application statuses:', error);
    res.status(500).json(errorResponse(
      'Başvuru durumları getirilirken hata oluştu',
      error.message
    ));
  }
};

/**
 * Tüm yan dal alanlarını getir
 * 
 * @route GET /api/lookup/subspecialties
 * @route GET /api/lookup/subspecialties/:specialtyId
 * @access Public
 * @returns {Object} JSON response
 */
const getSubspecialties = async (req, res) => {
  try {
    const { specialtyId } = req.params;
    logger.info('Lookup subspecialties request received', { specialtyId });
    
    const subspecialties = await lookupService.getSubspecialties(specialtyId ? parseInt(specialtyId) : null);
    
    res.status(200).json(successResponse(
      subspecialties,
      'Yan dal alanları başarıyla getirildi'
    ));
  } catch (error) {
    logger.error('Error getting subspecialties:', error);
    res.status(500).json(errorResponse(
      'Yan dal alanları getirilirken hata oluştu',
      error.message
    ));
  }
};

/**
 * Lookup Controller Module Exports
 * 
 * Bu modül aşağıdaki lookup controller fonksiyonlarını export eder:
 * - getSpecialties: Uzmanlık alanları
 * - getSubspecialties: Yan dal alanları
 * - getCities: Şehirler
 * - getDoctorEducationTypes: Doktor eğitim türleri
 * - getLanguageLevels: Dil seviyeleri
 * - getLanguages: Diller
 * - getCertificateTypes: Sertifika türleri
 * - getJobStatuses: İş durumları
 * - getApplicationStatuses: Başvuru durumları
 */
module.exports = {
  getSpecialties,
  getSubspecialties,
  getCities,
  getDoctorEducationTypes,
  getLanguageLevels,
  getLanguages,
  getCertificateTypes,
  getJobStatuses,
  getApplicationStatuses
};
