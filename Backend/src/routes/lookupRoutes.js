/**
 * Lookup Routes - Sistem lookup verileri için routes
 * 
 * Bu route dosyası sistem genelinde kullanılan lookup verilerini sağlar:
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

const express = require('express');
const lookupController = require('../controllers/lookupController');

const router = express.Router();

/**
 * Uzmanlık alanları endpoint'i
 * 
 * Doktor profillerinde ve iş ilanlarında kullanılan uzmanlık alanlarını döndürür.
 * Alfabetik sıraya göre sıralanır.
 * 
 * @route GET /api/lookup/specialties
 * @desc Tüm uzmanlık alanlarını getir
 * @access Public
 * @returns {Object} JSON response with specialties array
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
router.get('/specialties', lookupController.getSpecialties);

/**
 * Yan dal alanları endpoint'i
 * 
 * @route GET /api/lookup/subspecialties
 * @route GET /api/lookup/subspecialties/:specialtyId
 * @desc Tüm yan dal alanlarını veya belirli bir branşa ait yan dalları getir
 * @access Public
 * @returns {Object} JSON response with subspecialties array
 */
router.get('/subspecialties/:specialtyId?', lookupController.getSubspecialties);

/**
 * Şehirler endpoint'i
 * 
 * Doktor profillerinde ve hastane profillerinde kullanılan şehirleri döndürür.
 * İlk 6 şehir (ID 1-6) en üstte, sonra diğerleri alfabetik sıraya göre sıralanır.
 * 
 * @route GET /api/lookup/cities
 * @desc Tüm şehirleri getir
 * @access Public
 * @returns {Object} JSON response with cities array
 * 
 * @example
 * GET /api/lookup/cities
 * Response: {
 *   "success": true,
 *   "data": [
 *     { "id": 1, "name": "İstanbul (Avrupa)", "country": "Turkey" },
 *     { "id": 2, "name": "İstanbul (Anadolu)", "country": "Turkey" },
 *     { "id": 3, "name": "Ankara", "country": "Turkey" },
 *     ...
 *   ],
 *   "message": "Şehirler başarıyla getirildi"
 * }
 */
router.get('/cities', lookupController.getCities);

/**
 * Doktor eğitim türleri endpoint'i
 * 
 * Doktor profillerinde eğitim bilgileri eklerken kullanılan eğitim türlerini döndürür.
 * Zorunlu olanlar önce, sonra alfabetik sıraya göre sıralanır.
 * 
 * @route GET /api/lookup/doctor-education-types
 * @desc Tüm doktor eğitim türlerini getir
 * @access Public
 * @returns {Object} JSON response with education types array
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
router.get('/doctor-education-types', lookupController.getDoctorEducationTypes);

/**
 * Dil seviyeleri endpoint'i
 * 
 * Doktor profillerinde dil bilgileri eklerken kullanılan dil seviyelerini döndürür.
 * Alfabetik sıraya göre sıralanır.
 * 
 * @route GET /api/lookup/language-levels
 * @desc Tüm dil seviyelerini getir
 * @access Public
 * @returns {Object} JSON response with language levels array
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
router.get('/language-levels', lookupController.getLanguageLevels);

/**
 * Diller endpoint'i
 * 
 * Doktor profillerinde dil bilgileri eklerken kullanılan dilleri döndürür.
 * Alfabetik sıraya göre sıralanır.
 * 
 * @route GET /api/lookup/languages
 * @desc Tüm dilleri getir
 * @access Public
 * @returns {Object} JSON response with languages array
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
router.get('/languages', lookupController.getLanguages);

/**
 * Sertifika türleri endpoint'i
 * 
 * Doktor profillerinde sertifika bilgileri eklerken kullanılan sertifika türlerini döndürür.
 * Zorunlu olanlar önce, sonra alfabetik sıraya göre sıralanır.
 * 
 * @route GET /api/lookup/certificate-types
 * @desc Tüm sertifika türlerini getir
 * @access Public
 * @returns {Object} JSON response with certificate types array
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
router.get('/certificate-types', lookupController.getCertificateTypes);

/**
 * İş durumları endpoint'i
 * 
 * İş ilanlarında ve admin sayfalarında kullanılan iş durumlarını döndürür.
 * ID sırasına göre sıralanır.
 * 
 * @route GET /api/lookup/job-statuses
 * @desc Tüm iş durumlarını getir
 * @access Public
 * @returns {Object} JSON response with job statuses array
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
router.get('/job-statuses', lookupController.getJobStatuses);

/**
 * Başvuru durumları endpoint'i
 * 
 * Doktor başvurularında ve admin sayfalarında kullanılan başvuru durumlarını döndürür.
 * ID sırasına göre sıralanır.
 * 
 * @route GET /api/lookup/application-statuses
 * @desc Tüm başvuru durumlarını getir
 * @access Public
 * @returns {Object} JSON response with application statuses array
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
router.get('/application-statuses', lookupController.getApplicationStatuses);

/**
 * Lookup Routes Module Export
 * 
 * Bu modül aşağıdaki lookup endpoint'lerini export eder:
 * - GET /specialties: Uzmanlık alanları
 * - GET /cities: Şehirler
 * - GET /doctor-education-types: Doktor eğitim türleri
 * - GET /language-levels: Dil seviyeleri
 * - GET /languages: Diller
 * - GET /certificate-types: Sertifika türleri
 * - GET /job-statuses: İş durumları
 * - GET /application-statuses: Başvuru durumları
 * 
 * Tüm endpoint'ler public erişime açıktır ve JSON formatında veri döndürür.
 */
module.exports = router;
