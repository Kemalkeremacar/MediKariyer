/**
 * Lookup Service - Sistem lookup verileri için service
 * 
 * Bu servis sistem genelinde kullanılan lookup verilerini sağlar:
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

const { db } = require('../config/dbConfig');
const { AppError } = require('../utils/errorHandler');
const logger = require('../utils/logger');

/**
 * Tüm uzmanlık alanlarını getir
 * 
 * Doktor profillerinde ve iş ilanlarında kullanılan uzmanlık alanlarını döndürür.
 * Alfabetik sıraya göre sıralanır.
 * 
 * @returns {Promise<Array<Object>>} Uzmanlık alanları listesi
 * @returns {Promise<Array<{id: number, name: string, description: string|null}>>} Uzmanlık alanları
 * 
 * @example
 * const specialties = await getSpecialties();
 * // [
 * //   { id: 1, name: "Kardiyoloji", description: "Kalp ve damar hastalıkları" },
 * //   { id: 2, name: "Nöroloji", description: "Sinir sistemi hastalıkları" }
 * // ]
 * 
 * @throws {AppError} Veritabanı hatası durumunda
 */
const getSpecialties = async () => {
  try {
    logger.debug('Fetching specialties from database');
    
    const specialties = await db('specialties')
      .select('id', 'name', 'description')
      .orderBy('name', 'asc');
    
    logger.debug(`Found ${specialties.length} specialties`);
    return specialties;
  } catch (error) {
    logger.error('Error fetching specialties:', error);
    throw new AppError('Uzmanlık alanları getirilirken hata oluştu', 500);
  }
};

/**
 * Tüm şehirleri getir
 * 
 * Doktor profillerinde ve hastane profillerinde kullanılan şehirleri döndürür.
 * Alfabetik sıraya göre sıralanır.
 * 
 * @returns {Promise<Array<Object>>} Şehirler listesi
 * @returns {Promise<Array<{id: number, name: string, country: string|null}>>} Şehirler
 * 
 * @example
 * const cities = await getCities();
 * // [
 * //   { id: 1, name: "İstanbul", country: "Turkey" },
 * //   { id: 2, name: "Ankara", country: "Turkey" }
 * // ]
 * 
 * @throws {AppError} Veritabanı hatası durumunda
 */
const getCities = async () => {
  try {
    logger.debug('Fetching cities from database');
    
    const cities = await db('cities')
      .select('id', 'name', 'country')
      .orderBy('name', 'asc');
    
    logger.debug(`Found ${cities.length} cities`);
    return cities;
  } catch (error) {
    logger.error('Error fetching cities:', error);
    throw new AppError('Şehirler getirilirken hata oluştu', 500);
  }
};

/**
 * Tüm doktor eğitim türlerini getir
 * 
 * Doktor profillerinde eğitim bilgileri eklerken kullanılan eğitim türlerini döndürür.
 * Zorunlu olanlar önce, sonra alfabetik sıraya göre sıralanır.
 * 
 * @returns {Promise<Array<Object>>} Doktor eğitim türleri listesi
 * @returns {Promise<Array<{id: number, name: string, description: string|null, is_required: boolean}>>} Eğitim türleri
 * 
 * @example
 * const educationTypes = await getDoctorEducationTypes();
 * // [
 * //   { id: 1, name: "Tıp Fakültesi", description: "Lisans eğitimi", is_required: true },
 * //   { id: 2, name: "Uzmanlık", description: "Tıpta uzmanlık", is_required: false },
 * //   { id: 3, name: "Yüksek Lisans", description: "Master eğitimi", is_required: false },
 * //   { id: 4, name: "DİĞER", description: "Diğer eğitim türleri için özel alan", is_required: false }
 * // ]
 * 
 * @throws {AppError} Veritabanı hatası durumunda
 */
const getDoctorEducationTypes = async () => {
  try {
    logger.debug('Fetching doctor education types from database');
    
    const educationTypes = await db('doctor_education_types')
      .select('id', 'name', 'description', 'is_required')
      .orderBy('is_required', 'desc')
      .orderByRaw('CASE WHEN name = ? THEN 1 ELSE 0 END', ['DİĞER'])
      .orderBy('name', 'asc');
    
    logger.debug(`Found ${educationTypes.length} doctor education types`);
    return educationTypes;
  } catch (error) {
    logger.error('Error fetching doctor education types:', error);
    throw new AppError('Doktor eğitim türleri getirilirken hata oluştu', 500);
  }
};

/**
 * Tüm dil seviyelerini getir
 * 
 * Doktor profillerinde dil bilgileri eklerken kullanılan dil seviyelerini döndürür.
 * Alfabetik sıraya göre sıralanır.
 * 
 * @returns {Promise<Array<Object>>} Dil seviyeleri listesi
 * @returns {Promise<Array<{id: number, name: string, description: string|null}>>} Dil seviyeleri
 * 
 * @example
 * const languageLevels = await getLanguageLevels();
 * // [
 * //   { id: 1, name: "Başlangıç", description: "Temel seviye" },
 * //   { id: 2, name: "İleri", description: "İleri seviye" }
 * // ]
 * 
 * @throws {AppError} Veritabanı hatası durumunda
 */
const getLanguageLevels = async () => {
  try {
    logger.debug('Fetching language levels from database');
    
    const languageLevels = await db('language_levels')
      .select('id', 'name', 'description')
      .orderBy('name', 'asc');
    
    logger.debug(`Found ${languageLevels.length} language levels`);
    return languageLevels;
  } catch (error) {
    logger.error('Error fetching language levels:', error);
    throw new AppError('Dil seviyeleri getirilirken hata oluştu', 500);
  }
};

/**
 * Tüm dilleri getir
 * 
 * Doktor profillerinde dil bilgileri eklerken kullanılan dilleri döndürür.
 * Alfabetik sıraya göre sıralanır.
 * 
 * @returns {Promise<Array<Object>>} Diller listesi
 * @returns {Promise<Array<{id: number, name: string, code: string|null}>>} Diller
 * 
 * @example
 * const languages = await getLanguages();
 * // [
 * //   { id: 1, name: "Türkçe", code: "tr" },
 * //   { id: 2, name: "İngilizce", code: "en" }
 * // ]
 * 
 * @throws {AppError} Veritabanı hatası durumunda
 */
const getLanguages = async () => {
  try {
    logger.debug('Fetching languages from database');
    
    const languages = await db('languages')
      .select('id', 'name', 'code')
      .orderBy('name', 'asc');
    
    logger.debug(`Found ${languages.length} languages`);
    return languages;
  } catch (error) {
    logger.error('Error fetching languages:', error);
    throw new AppError('Diller getirilirken hata oluştu', 500);
  }
};

/**
 * Tüm sertifika türlerini getir
 * 
 * Doktor profillerinde sertifika bilgileri eklerken kullanılan sertifika türlerini döndürür.
 * Zorunlu olanlar önce, sonra alfabetik sıraya göre sıralanır.
 * 
 * @returns {Promise<Array<Object>>} Sertifika türleri listesi
 * @returns {Promise<Array<{id: number, name: string, description: string|null, is_required: boolean}>>} Sertifika türleri
 * 
 * @example
 * const certificateTypes = await getCertificateTypes();
 * // [
 * //   { id: 1, name: "Tıp Diploması", description: "Tıp fakültesi diploması", is_required: true },
 * //   { id: 2, name: "Uzmanlık Sertifikası", description: "Tıpta uzmanlık", is_required: false }
 * // ]
 * 
 * @throws {AppError} Veritabanı hatası durumunda
 */
const getCertificateTypes = async () => {
  try {
    logger.debug('getCertificateTypes called - returning empty array (certificate_types table removed)');
    
    // NOT: certificate_types tablosu kaldırıldı
    // Artık sertifika adları certificate_name olarak string saklanıyor
    // Geriye dönük uyumluluk için boş array döndür
    return [];
  } catch (error) {
    logger.error('Error in getCertificateTypes:', error);
    throw new AppError('Sertifika türleri getirilirken hata oluştu', 500);
  }
};

/**
 * Tüm iş durumlarını getir
 * 
 * İş ilanlarında ve admin sayfalarında kullanılan iş durumlarını döndürür.
 * ID sırasına göre sıralanır.
 * 
 * @returns {Promise<Array<Object>>} İş durumları listesi
 * @returns {Promise<Array<{id: number, name: string}>>} İş durumları
 * 
 * @example
 * const jobStatuses = await getJobStatuses();
 * // [
 * //   { id: 1, name: "Aktif" },
 * //   { id: 2, name: "Pasif" },
 * //   { id: 3, name: "Draft" }
 * // ]
 * 
 * @throws {AppError} Veritabanı hatası durumunda
 */
const getJobStatuses = async () => {
  try {
    logger.debug('Fetching job statuses from database');
    
    const jobStatuses = await db('job_statuses')
      .select('id', 'name')
      .orderBy('id', 'asc');
    
    logger.debug(`Found ${jobStatuses.length} job statuses`);
    return jobStatuses;
  } catch (error) {
    logger.error('Error fetching job statuses:', error);
    throw new AppError('İş durumları getirilirken hata oluştu', 500);
  }
};

/**
 * Tüm başvuru durumlarını getir
 * 
 * Doktor başvurularında ve admin sayfalarında kullanılan başvuru durumlarını döndürür.
 * ID sırasına göre sıralanır.
 * 
 * @returns {Promise<Array<Object>>} Başvuru durumları listesi
 * @returns {Promise<Array<{id: number, name: string}>>} Başvuru durumları
 * 
 * @example
 * const applicationStatuses = await getApplicationStatuses();
 * // [
 * //   { id: 1, name: "Beklemede" },
 * //   { id: 2, name: "İnceleniyor" },
 * //   { id: 3, name: "Kabul Edildi" },
 * //   { id: 4, name: "Reddedildi" }
 * // ]
 * 
 * @throws {AppError} Veritabanı hatası durumunda
 */
const getApplicationStatuses = async () => {
  try {
    logger.debug('Fetching application statuses from database');
    
    const applicationStatuses = await db('application_statuses')
      .select('id', 'name')
      .orderBy('id', 'asc');
    
    logger.debug(`Found ${applicationStatuses.length} application statuses`);
    return applicationStatuses;
  } catch (error) {
    logger.error('Error fetching application statuses:', error);
    throw new AppError('Başvuru durumları getirilirken hata oluştu', 500);
  }
};

/**
 * Tüm yan dal alanlarını getir
 * 
 * @param {number} specialtyId - Uzmanlık alanı ID'si (opsiyonel)
 * @returns {Promise<Array<Object>>} Yan dal alanları listesi
 * 
 * @example
 * const subspecialties = await getSubspecialties();
 * const cardioSubspecialties = await getSubspecialties(1); // Kardiyoloji yan dalları
 * 
 * @throws {AppError} Veritabanı hatası durumunda
 */
const getSubspecialties = async (specialtyId = null) => {
  try {
    logger.debug('Fetching subspecialties from database', { specialtyId });
    
    let query = db('subspecialties')
      .select('id', 'specialty_id', 'name', 'description')
      .orderBy('name', 'asc');
    
    if (specialtyId) {
      query = query.where('specialty_id', specialtyId);
    }
    
    const subspecialties = await query;
    
    logger.debug(`Found ${subspecialties.length} subspecialties`);
    return subspecialties;
  } catch (error) {
    logger.error('Error fetching subspecialties:', error);
    throw new AppError('Yan dal alanları getirilirken hata oluştu', 500);
  }
};

/**
 * Lookup Service Module Exports
 * 
 * Bu modül aşağıdaki lookup fonksiyonlarını export eder:
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
