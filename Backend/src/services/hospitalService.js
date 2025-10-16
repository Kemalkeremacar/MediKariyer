/**
 * @file hospitalService.js
 * @description Hastane servisi - Hastane profili, departmanlar, iletişim, iş ilanları ve başvuru yönetimi işlemlerini yönetir.
 * Bu servis, hospitalController tarafından kullanılan tüm hastane işlemlerini içerir.
 * 
 * Ana İşlevler:
 * - Hastane profil yönetimi (CRUD)
 * - Departman yönetimi (CRUD)
 * - İletişim bilgisi yönetimi (CRUD)
 * - İş ilanı yönetimi (CRUD) - jobService'den taşındı
 * - Başvuru yönetimi (gelen başvurular, durum güncelleme) - applicationService'den taşındı
 * - Dashboard verileri (istatistikler, son başvurular)
 * - Profil tamamlanma hesaplama
 * 
 * Servis Ayrımı Mantığı:
 * - Bu servis HASTANE için HER ŞEYİ yapar (tek servis yaklaşımı)
 * - Doktor servisleri → çoklu servis yaklaşımı (doctorService + applicationService + jobService)
 * - Hastane servisi → tek servis yaklaşımı (hospitalService içinde her şey)
 * 
 * Veritabanı Tabloları:
 * - hospital_profiles: Hastane profil bilgileri
 * - hospital_departments: Hastane departman bilgileri
 * - hospital_contacts: Hastane iletişim bilgileri
 * - jobs: İş ilanı bilgileri
 * - applications: Başvuru bilgileri
 * - doctor_profiles: Doktor profilleri
 * - users: Kullanıcı bilgileri
 * 
 * @author MediKariyer Development Team
 * @version 2.0.0
 * @since 2024
 */

'use strict';

// ============================================================================
// DIŞ BAĞIMLILIKLAR
// ============================================================================

const db = require('../config/dbConfig').db;
const { AppError } = require('../utils/errorHandler');
const logger = require('../utils/logger');
const notificationService = require('./notificationService');

// ============================================================================
// PROFİL YÖNETİMİ
// ============================================================================

/**
 * Hastane profilini getirir
 * @description Hastane kullanıcısının profil bilgilerini users tablosu ile join ederek getirir
 * @param {number} userId - JWT token'dan gelen kullanıcı ID'si (users.id)
 * @returns {Promise<Object>} Hastane profil bilgileri (hospital_profiles + users bilgileri)
 * @throws {AppError} 404 - Hastane profili bulunamadı
 * @throws {Error} Veritabanı hatası durumunda
 * 
 * @example
 * const profile = await getProfile(123);
 * // Returns: { 
 * //   id: 1, 
 * //   institution_name: "ABC Hastanesi", 
 * //   city: "İstanbul", 
 * //   email: "admin@abchastanesi.com",
 * //   is_active: true,
 * //   is_approved: true
 * // }
 * 
 * @since 1.0.0
 */
const getProfile = async (userId) => {
  try {
    // hospital_profiles ve users tablolarını join ederek tam profil bilgisini getir
    const profile = await db('hospital_profiles')
      .join('users', 'hospital_profiles.user_id', 'users.id')
      .select(
        'hospital_profiles.*',           // Hastane profil bilgileri
        'users.email',                   // Kullanıcı email'i
        'users.is_active',               // Kullanıcı aktiflik durumu
        'users.is_approved',              // Admin onay durumu
        'users.created_at as user_created_at'  // Kullanıcı oluşturulma tarihi
      )
      .where('hospital_profiles.user_id', userId)
      .first();

    // Profil bulunamazsa hata fırlat
    if (!profile) throw new AppError('Hastane profili bulunamadı', 404);

    return profile;
  } catch (error) {
    logger.error('Get hospital profile error:', error);
    throw error;
  }
};

/**
 * Hastane profilini günceller
 * @description Hastane kullanıcısının profil bilgilerini günceller ve güncellenmiş profili döndürür
 * @param {number} userId - JWT token'dan gelen kullanıcı ID'si (users.id)
 * @param {Object} profileData - Güncellenecek profil verileri
 * @param {string} profileData.institution_name - Kurum adı
 * @param {string} profileData.city - Şehir
 * @param {string} profileData.address - Adres
 * @param {string} [profileData.phone] - Telefon numarası
 * @param {string} [profileData.email] - E-posta adresi
 * @param {string} [profileData.website] - Web sitesi URL'si
 * @param {string} [profileData.about] - Kurum hakkında bilgi
 * @param {string} [profileData.logo] - Sağlık kuruluşu logosu
 * @returns {Promise<Object>} Güncellenmiş hastane profil bilgileri
 * @throws {AppError} 404 - Hastane profili bulunamadı
 * @throws {Error} Veritabanı hatası durumunda
 * 
 * @example
 * const updatedProfile = await updateProfile(123, { 
 *   institution_name: "Yeni Sağlık Kuruluşu Adı",
 *   city: "Ankara",
 *   address: "Yeni Adres",
 *   logo: "/uploads/logo.png"
 * });
 * 
 * @since 1.0.0
 */
const updateProfile = async (userId, profileData) => {
  try {
    // Önce mevcut profili kontrol et
    const existingProfile = await db('hospital_profiles')
      .where('user_id', userId)
      .first();

    // Profil bulunamazsa hata fırlat
    if (!existingProfile) {
      throw new AppError('Sağlık kuruluşu profili bulunamadı', 404);
    }

    // Profil bilgilerini güncelle (updated_at otomatik olarak güncellenir)
    await db('hospital_profiles')
      .where('user_id', userId)
      .update({
        ...profileData,
        updated_at: db.fn.now()  // Güncelleme tarihini otomatik ayarla
      });

    // Güncellenmiş profili getir ve döndür
    return await getProfile(userId);
  } catch (error) {
    logger.error('Update hospital profile error:', error);
    throw error;
  }
};

// ============================================================================
// PROFİL TAMAMLANMA HESAPLAMA
// ============================================================================

/**
 * Hastane profilinin tamamlanma yüzdesini hesaplar
 * @description Hastane profil bilgilerinin ne kadarının doldurulduğunu hesaplar
 * @param {number} userId - Kullanıcının ID'si
 * @returns {Promise<Object>} Profil tamamlanma bilgileri
 * @throws {AppError} Veritabanı hatası durumunda
 * 
 * @example
 * const completion = await getProfileCompletion(123);
 * console.log('Profil tamamlanma:', completion.percentage + '%');
 */
const getProfileCompletion = async (userId) => {
  try {
    const profile = await getProfile(userId);
    if (!profile) return { percentage: 0, completedFields: 0, totalFields: 0, missingFields: [] };

    const fields = [
      { key: 'institution_name', name: 'Kurum Adı', value: profile.institution_name },
      { key: 'city', name: 'Şehir', value: profile.city },
      { key: 'address', name: 'Adres', value: profile.address },
      { key: 'phone', name: 'Telefon', value: profile.phone },
      { key: 'email', name: 'E-posta', value: profile.email },
      { key: 'website', name: 'Web Sitesi', value: profile.website },
      { key: 'about', name: 'Hakkında', value: profile.about },
      { key: 'logo', name: 'Logo', value: profile.logo }
    ];

    const completedFields = fields.filter(field => {
      if (!field.value) return false;
      // String olmayan değerleri string'e çevir
      const value = typeof field.value === 'string' ? field.value : String(field.value);
      return value.trim() !== '';
    }).length;
    
    const totalFields = fields.length;
    const percentage = Math.round((completedFields / totalFields) * 100);
    
    const missingFields = fields.filter(field => {
      if (!field.value) return true;
      // String olmayan değerleri string'e çevir
      const value = typeof field.value === 'string' ? field.value : String(field.value);
      return value.trim() === '';
    }).map(field => field.name);

    return {
      percentage,
      completedFields,
      totalFields,
      missingFields
    };
  } catch (error) {
    logger.error('Get hospital profile completion error:', error);
    throw error;
  }
};

// ============================================================================
// MODULE EXPORTS
// ============================================================================

/**
 * Hastane departmanlarını getirir
 * @description Hastanenin tüm departmanlarını alfabetik sırada getirir
 * @param {number} userId - JWT token'dan gelen kullanıcı ID'si (users.id)
 * @returns {Promise<Array>} Departmanlar listesi
 * @throws {AppError} 404 - Hastane profili bulunamadı
 * @throws {Error} Veritabanı hatası durumunda
 * 
 * @example
 * const departments = await getDepartments(123);
 * console.log('Departman sayısı:', departments.length);
 * 
 * @since 1.0.0
 */
const getDepartments = async (userId) => {
  try {
    const hospitalProfile = await db('hospital_profiles')
      .where('user_id', userId)
      .select('id')
      .first();

    if (!hospitalProfile) {
      throw new AppError('Hastane profili bulunamadı', 404);
    }

    const departments = await db('hospital_departments')
      .where('hospital_id', hospitalProfile.id)
      .orderBy('department_name', 'asc');

    return departments;
  } catch (error) {
    logger.error('Get hospital departments error:', error);
    throw error;
  }
};

/**
 * Hastane departmanı ekler
 * @description Hastaneye yeni departman ekler
 * @param {number} userId - JWT token'dan gelen kullanıcı ID'si (users.id)
 * @param {Object} departmentData - Departman verileri
 * @param {string} departmentData.department_name - Departman adı
 * @param {string} [departmentData.description] - Departman açıklaması
 * @param {string} [departmentData.head_doctor] - Başhekim adı
 * @returns {Promise<Object>} Oluşturulan departman bilgileri
 * @throws {AppError} 404 - Hastane profili bulunamadı
 * @throws {Error} Veritabanı hatası durumunda
 * 
 * @example
 * const department = await addDepartment(123, {
 *   department_name: 'Kardiyoloji',
 *   description: 'Kalp ve damar hastalıkları'
 * });
 * 
 * @since 1.0.0
 */
const addDepartment = async (userId, departmentData) => {
  try {
    const hospitalProfile = await db('hospital_profiles')
      .where('user_id', userId)
      .select('id')
      .first();

    if (!hospitalProfile) {
      throw new AppError('Hastane profili bulunamadı', 404);
    }

    const [departmentId] = await db('hospital_departments').insert({
      ...departmentData,
      hospital_id: hospitalProfile.id
    });

    return await db('hospital_departments')
      .where('id', departmentId)
      .first();
  } catch (error) {
    logger.error('Add hospital department error:', error);
    throw error;
  }
};

/**
 * Hastane departmanını günceller
 * @description Mevcut departman bilgilerini günceller
 * @param {number} userId - JWT token'dan gelen kullanıcı ID'si (users.id)
 * @param {number} departmentId - Güncellenecek departman ID'si
 * @param {Object} departmentData - Güncellenecek departman verileri
 * @param {string} [departmentData.department_name] - Departman adı
 * @param {string} [departmentData.description] - Departman açıklaması
 * @param {string} [departmentData.head_doctor] - Başhekim adı
 * @returns {Promise<Object|null>} Güncellenmiş departman bilgileri veya null (bulunamazsa)
 * @throws {AppError} 404 - Hastane profili bulunamadı
 * @throws {Error} Veritabanı hatası durumunda
 * 
 * @example
 * const updatedDepartment = await updateDepartment(123, 456, {
 *   department_name: 'Güncellenmiş Kardiyoloji'
 * });
 * 
 * @since 1.0.0
 */
const updateDepartment = async (userId, departmentId, departmentData) => {
  try {
    const hospitalProfile = await db('hospital_profiles')
      .where('user_id', userId)
      .select('id')
      .first();

    if (!hospitalProfile) {
      throw new AppError('Hastane profili bulunamadı', 404);
    }

    const existingDepartment = await db('hospital_departments')
      .where('id', departmentId)
      .where('hospital_id', hospitalProfile.id)
      .first();

    if (!existingDepartment) return null;

    await db('hospital_departments')
      .where('id', departmentId)
      .update(departmentData);

    return await db('hospital_departments')
      .where('id', departmentId)
      .first();
  } catch (error) {
    logger.error('Update hospital department error:', error);
    throw error;
  }
};

/**
 * Hastane departmanını siler
 * @description Departmanı siler (şu anda iş ilanı kontrolü yapılmıyor)
 * @param {number} userId - JWT token'dan gelen kullanıcı ID'si (users.id)
 * @param {number} departmentId - Silinecek departman ID'si
 * @returns {Promise<boolean>} Silme işleminin başarı durumu
 * @throws {AppError} 404 - Hastane profili bulunamadı
 * @throws {Error} Veritabanı hatası durumunda
 * 
 * @example
 * const deleted = await deleteDepartment(123, 456);
 * if (deleted) {
 *   console.log('Departman başarıyla silindi');
 * }
 * 
 * @since 1.0.0
 */
const deleteDepartment = async (userId, departmentId) => {
  try {
    const hospitalProfile = await db('hospital_profiles')
      .where('user_id', userId)
      .select('id')
      .first();

    if (!hospitalProfile) {
      throw new AppError('Hastane profili bulunamadı', 404);
    }

    const existingDepartment = await db('hospital_departments')
      .where('id', departmentId)
      .where('hospital_id', hospitalProfile.id)
      .first();

    if (!existingDepartment) return false;

    // Bu departmana ait iş ilanları var mı kontrol et
    // Not: Schema'da jobs tablosunda department_id kolonu yok, bu kontrol şimdilik kaldırıldı
    // İleride jobs tablosuna department_id kolonu eklenirse bu kontrol aktif edilebilir
    /*
    const jobCount = await db('jobs')
      .where('department_id', departmentId)
      .count('* as count')
      .first();
    
    if (jobCount.count > 0) {
      throw new AppError('Bu departmana ait iş ilanları bulunduğu için silinemez', 400);
    }
    */

    await db('hospital_departments').where('id', departmentId).del();
    return true;
  } catch (error) {
    logger.error('Delete hospital department error:', error);
    throw error;
  }
};

/**
 * Hastane iletişim bilgilerini getirir
 * @description Hastanenin tüm ek iletişim bilgilerini getirir
 * @param {number} userId - JWT token'dan gelen kullanıcı ID'si (users.id)
 * @returns {Promise<Array>} İletişim bilgileri listesi
 * @throws {AppError} 404 - Hastane profili bulunamadı
 * @throws {Error} Veritabanı hatası durumunda
 * 
 * @example
 * const contacts = await getContacts(123);
 * console.log('İletişim bilgisi sayısı:', contacts.length);
 * 
 * @since 1.0.0
 */
const getContacts = async (userId) => {
  try {
    const hospitalProfile = await db('hospital_profiles')
      .where('user_id', userId)
      .select('id')
      .first();

    if (!hospitalProfile) {
      throw new AppError('Hastane profili bulunamadı', 404);
    }

    const contacts = await db('hospital_contacts')
      .where('hospital_id', hospitalProfile.id)
      .orderBy('id', 'asc');

    return contacts;
  } catch (error) {
    logger.error('Get hospital contacts error:', error);
    throw error;
  }
};

/**
 * Hastane ek iletişim bilgisi ekler
 * @description Hastaneye yeni iletişim bilgisi ekler
 * @param {number} userId - JWT token'dan gelen kullanıcı ID'si (users.id)
 * @param {Object} contactData - İletişim verileri
 * @param {string} [contactData.phone] - Telefon numarası
 * @param {string} [contactData.email] - E-posta adresi
 * @returns {Promise<Object>} Oluşturulan iletişim bilgileri
 * @throws {AppError} 404 - Hastane profili bulunamadı
 * @throws {Error} Veritabanı hatası durumunda
 * 
 * @note Schema'da hospital_contacts tablosunda sadece phone ve email field'ları var
 * 
 * @example
 * const contact = await addContact(123, {
 *   phone: '+905551234567',
 *   email: 'info@hospital.com'
 * });
 * 
 * @since 1.0.0
 */
const addContact = async (userId, contactData) => {
  try {
    const hospitalProfile = await db('hospital_profiles')
      .where('user_id', userId)
      .select('id')
      .first();

    if (!hospitalProfile) {
      throw new AppError('Hastane profili bulunamadı', 404);
    }

    const [contactId] = await db('hospital_contacts').insert({
      hospital_id: hospitalProfile.id,
      phone: contactData.phone || null,
      email: contactData.email || null
    });

    return await db('hospital_contacts')
      .where('id', contactId)
      .first();
  } catch (error) {
    logger.error('Add hospital contact error:', error);
    throw error;
  }
};

/**
 * Hastane ek iletişim bilgisi günceller
 * @description Mevcut iletişim bilgisini günceller
 * @param {number} userId - JWT token'dan gelen kullanıcı ID'si (users.id)
 * @param {number} contactId - Güncellenecek iletişim ID'si
 * @param {Object} contactData - Güncellenecek iletişim verileri
 * @param {string} [contactData.phone] - Telefon numarası
 * @param {string} [contactData.email] - E-posta adresi
 * @returns {Promise<Object|null>} Güncellenmiş iletişim bilgileri veya null (bulunamazsa)
 * @throws {AppError} 404 - Hastane profili bulunamadı
 * @throws {Error} Veritabanı hatası durumunda
 * 
 * @note Schema'da hospital_contacts tablosunda sadece phone ve email field'ları var
 * 
 * @example
 * const updatedContact = await updateContact(123, 456, {
 *   phone: '+905559876543',
 *   email: 'newemail@hospital.com'
 * });
 * 
 * @since 1.0.0
 */
const updateContact = async (userId, contactId, contactData) => {
  try {
    const hospitalProfile = await db('hospital_profiles')
      .where('user_id', userId)
      .select('id')
      .first();

    if (!hospitalProfile) {
      throw new AppError('Hastane profili bulunamadı', 404);
    }

    const existingContact = await db('hospital_contacts')
      .where('id', contactId)
      .where('hospital_id', hospitalProfile.id)
      .first();

    if (!existingContact) return null;

    const updateData = {};
    if (contactData.phone !== undefined) updateData.phone = contactData.phone;
    if (contactData.email !== undefined) updateData.email = contactData.email;

    await db('hospital_contacts')
      .where('id', contactId)
      .update(updateData);

    return await db('hospital_contacts')
      .where('id', contactId)
      .first();
  } catch (error) {
    logger.error('Update hospital contact error:', error);
    throw error;
  }
};

/**
 * Hastane ek iletişim bilgisi siler
 * @description İletişim bilgisini siler
 * @param {number} userId - JWT token'dan gelen kullanıcı ID'si (users.id)
 * @param {number} contactId - Silinecek iletişim ID'si
 * @returns {Promise<boolean>} Silme işleminin başarı durumu
 * @throws {AppError} 404 - Hastane profili bulunamadı
 * @throws {Error} Veritabanı hatası durumunda
 * 
 * @example
 * const deleted = await deleteContact(123, 456);
 * if (deleted) {
 *   console.log('İletişim bilgisi başarıyla silindi');
 * }
 * 
 * @since 1.0.0
 */
const deleteContact = async (userId, contactId) => {
  try {
    const hospitalProfile = await db('hospital_profiles')
      .where('user_id', userId)
      .select('id')
      .first();

    if (!hospitalProfile) {
      throw new AppError('Hastane profili bulunamadı', 404);
    }

    const existingContact = await db('hospital_contacts')
      .where('id', contactId)
      .where('hospital_id', hospitalProfile.id)
      .first();

    if (!existingContact) return false;

    await db('hospital_contacts').where('id', contactId).del();
    return true;
  } catch (error) {
    logger.error('Delete hospital contact error:', error);
    throw error;
  }
};

// ============================================================================
// İŞ İLANI YÖNETİMİ (jobService'den taşındı)
// ============================================================================

/**
 * Hastane iş ilanlarını listeler
 * @description Hastanenin tüm iş ilanlarını filtreleme ve sayfalama ile getirir
 * @param {number} userId - Hastane kullanıcı ID'si
 * @param {Object} params - Filtreleme parametreleri
 * @param {number} [params.page=1] - Sayfa numarası
 * @param {number} [params.limit=20] - Sayfa başına kayıt sayısı
 * @param {string} [params.status] - İlan durumu
 * @param {string} [params.search] - Genel arama terimi
 * @param {string} [params.title_search] - İş ilanı başlığı arama terimi
 * @param {string} [params.specialty_search] - Uzmanlık alanı arama terimi
 * @returns {Promise<Object>} İş ilanları ve sayfalama bilgisi
 * @throws {AppError} Hastane profili bulunamadığında
 */
const getJobs = async (userId, params = {}) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      search,
      title_search,
      specialty_search
    } = params;

    // Hastane profil ID'sini al
    const hospitalProfile = await db('hospital_profiles')
      .where('user_id', userId)
      .select('id')
      .first();

    if (!hospitalProfile) {
      throw new AppError('Hastane profili bulunamadı', 404);
    }

    // Base query - hastane kendi ilanlarının hepsini görür (Aktif, Pasif, Silinmiş)
    let query = db('jobs as j')
      .join('job_statuses as js', 'j.status_id', 'js.id')
      .join('specialties as s', 'j.specialty_id', 's.id')
      .leftJoin('cities as c', 'j.city_id', 'c.id')
      .where('j.hospital_id', hospitalProfile.id)
      .select(
        'j.*',
        'js.name as status',
        's.name as specialty',
        'c.name as city'
      );

    // Status filtresi - hastane istediği durumu filtreleyebilir
    if (status) {
      query = query.where('js.name', status);
    }

    // Genel arama sorgusu
    if (search) {
      query = query.where(function() {
        this.where('j.title', 'like', `%${search}%`)
          .orWhere('j.description', 'like', `%${search}%`)
          .orWhere('s.name', 'like', `%${search}%`);
      });
    }

    // Başlık arama - sadece iş ilanı başlığında
    if (title_search) {
      query = query.where('j.title', 'like', `%${title_search}%`);
    }

    // Uzmanlık arama - sadece uzmanlık alanında
    if (specialty_search) {
      query = query.where('s.name', 'like', `%${specialty_search}%`);
    }

    // Sayfalama - SQL Server için OFFSET/FETCH kullan
    const offset = (page - 1) * limit;
    const jobs = await query
      .orderBy('j.created_at', 'desc')
      .offset(offset)
      .limit(limit);

    // Application count'ları ayrı query ile al
    if (jobs.length > 0) {
      const jobIds = jobs.map(job => job.id);
      const applicationCounts = await db('applications as a')
        .whereIn('a.job_id', jobIds)
        .select('a.job_id', db.raw('COUNT(a.id) as application_count'))
        .groupBy('a.job_id');

      // Application count'ları job'lara ekle
      jobs.forEach(job => {
        const appCount = applicationCounts.find(ac => ac.job_id === job.id);
        job.application_count = appCount ? parseInt(appCount.application_count) : 0;
      });
    }

    // Toplam sayı
    const totalQuery = db('jobs as j')
      .join('job_statuses as js', 'j.status_id', 'js.id')
      .join('specialties as s', 'j.specialty_id', 's.id')
      .where('j.hospital_id', hospitalProfile.id);

    if (status) {
      totalQuery.where('js.name', status);
    }

    // Genel arama sorgusu
    if (search) {
      totalQuery.where(function() {
        this.where('j.title', 'like', `%${search}%`)
          .orWhere('j.description', 'like', `%${search}%`)
          .orWhere('s.name', 'like', `%${search}%`);
      });
    }

    // Başlık arama - sadece iş ilanı başlığında
    if (title_search) {
      totalQuery.where('j.title', 'like', `%${title_search}%`);
    }

    // Uzmanlık arama - sadece uzmanlık alanında
    if (specialty_search) {
      totalQuery.where('s.name', 'like', `%${specialty_search}%`);
    }

    const [{ count }] = await totalQuery.count('* as count');

    return {
      jobs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(count),
        pages: Math.ceil(count / limit)
      }
    };
  } catch (error) {
    logger.error('Get hospital jobs error:', error);
    throw error;
  }
};

/**
 * Hastane iş ilanı oluşturur
 * @description Hastane için yeni iş ilanı oluşturur
 * @param {number} userId - Hastane kullanıcı ID'si
 * @param {Object} jobData - İş ilanı verileri
 * @returns {Promise<Object>} Oluşturulan iş ilanı
 * @throws {AppError} Hastane profili bulunamadığında
 */
const createJob = async (userId, jobData) => {
  try {
    // Hastane profil ID'sini al
    const hospitalProfile = await db('hospital_profiles')
      .where('user_id', userId)
      .select('id')
      .first();

    if (!hospitalProfile) {
      throw new AppError('Hastane profili bulunamadı', 404);
    }

    // İş ilanını oluştur - database'de city_id nullable
    const insertData = {
      ...jobData,
      hospital_id: hospitalProfile.id,
      status_id: 1, // active (job_statuses tablosunda 1 = Aktif)
      created_at: db.fn.now(),
      updated_at: db.fn.now()
    };

    const [jobId] = await db('jobs').insert(insertData);

    logger.info(`Job created with ID: ${jobId}, status_id: 1 (Aktif)`);

    // Oluşturulan iş ilanını ID ile getir
    const job = await db('jobs as j')
      .join('job_statuses as js', 'j.status_id', 'js.id')
      .join('specialties as s', 'j.specialty_id', 's.id')
      .leftJoin('cities as c', 'j.city_id', 'c.id')
      .where('j.id', jobId)
      .select('j.*', 'js.name as status', 's.name as specialty', 'c.name as city')
      .first();

    if (!job) {
      throw new AppError('İş ilanı oluşturuldu ancak getirilemedi', 500);
    }

    // Application count ekle
    job.application_count = 0;

    return job;
  } catch (error) {
    logger.error('Create hospital job error:', error);
    throw error;
  }
};

/**
 * Hastane iş ilanını günceller
 * @description Mevcut iş ilanını günceller
 * @param {number} userId - Hastane kullanıcı ID'si
 * @param {number} jobId - İş ilanı ID'si
 * @param {Object} jobData - Güncellenecek veriler
 * @returns {Promise<Object>} Güncellenmiş iş ilanı
 * @throws {AppError} İlan bulunamadığında veya sahiplik yetkisi yoksa
 */
const updateJob = async (userId, jobId, jobData) => {
  try {
    // Hastane profil ID'sini al
    const hospitalProfile = await db('hospital_profiles')
      .where('user_id', userId)
      .select('id')
      .first();

    if (!hospitalProfile) {
      throw new AppError('Hastane profili bulunamadı', 404);
    }

    // İş ilanının sahipliğini kontrol et
    const existingJob = await db('jobs')
      .where({ id: jobId, hospital_id: hospitalProfile.id })
      .first();

    if (!existingJob) {
      throw new AppError('İş ilanı bulunamadı veya yetkiniz yok', 404);
    }

    // Eski durumu kaydet
    const oldStatus = existingJob.status_id;
    
    // İş ilanını güncelle
    await db('jobs')
      .where('id', jobId)
      .update({
        ...jobData,
        updated_at: db.fn.now()
      });

    // Güncellenmiş iş ilanını getir
    const job = await db('jobs as j')
      .join('job_statuses as js', 'j.status_id', 'js.id')
      .join('specialties as s', 'j.specialty_id', 's.id')
      .leftJoin('cities as c', 'j.city_id', 'c.id')
      .where('j.id', jobId)
      .select('j.*', 'js.name as status', 's.name as specialty', 'c.name as city')
      .first();

    // İlan durumu değiştiyse bildirim gönder
    if (jobData.status_id && jobData.status_id !== oldStatus) {
      try {
        const oldStatusName = await db('job_statuses').where('id', oldStatus).select('name').first();
        await sendJobStatusChangeNotification(jobId, job.status, oldStatusName?.name || 'unknown');
      } catch (notificationError) {
        logger.warn('Job status change notification failed:', notificationError);
      }
    }

    return job;
  } catch (error) {
    logger.error('Update hospital job error:', error);
    throw error;
  }
};

// ============================================================================
// İŞ İLANI BİLDİRİM FONKSİYONLARI (jobService'den taşındı)
// ============================================================================

/**
 * İş ilanı durumu değişikliği bildirimi gönder
 * @description İş ilanı durumu değiştiğinde başvuru yapan doktorlara bildirim gönderir.
 * @param {number} jobId - İş ilanı kimliği
 * @param {string} newStatus - Yeni durum
 * @param {string} oldStatus - Eski durum
 * @returns {Promise<Object>} Gönderilen bildirim sayısı
 * @throws {AppError} Veritabanı hatası durumunda
 * 
 * @example
 * await sendJobStatusChangeNotification(123, 'Pasif', 'Aktif');
 */
const sendJobStatusChangeNotification = async (jobId, newStatus, oldStatus) => {
  try {
    // İlan bilgilerini al
    const job = await db('jobs as j')
      .join('hospital_profiles as hp', 'j.hospital_id', 'hp.id')
      .where('j.id', jobId)
      .select('j.title as job_title', 'hp.institution_name as hospital_name')
      .first();
    
    if (!job) {
      logger.warn(`Job ${jobId} not found for status change notification`);
      return { sent_count: 0 };
    }

    // Bu ilana başvuru yapan doktorları al
    const applications = await db('applications as a')
      .join('doctor_profiles as dp', 'a.doctor_profile_id', 'dp.id')
      .join('users as u', 'dp.user_id', 'u.id')
      .where('a.job_id', jobId)
      .where('a.status_id', '!=', 5) // withdrawn değil
      .select('u.id as user_id', 'dp.first_name', 'dp.last_name');

    if (applications.length === 0) {
      logger.info(`No applications found for job ${jobId} status change notification`);
      return { sent_count: 0 };
    }

    // Her doktora bildirim gönder
    let sentCount = 0;
    for (const application of applications) {
      try {
        await notificationService.sendNotification({
          user_id: application.user_id,
          type: newStatus === 'Pasif' ? 'warning' : 'info',
          title: 'İlan Durumu Değişti',
          body: `${job.hospital_name} hastanesindeki ${job.job_title} pozisyonu için ilan durumu "${oldStatus}" → "${newStatus}" olarak değiştirildi.`,
          data: {
            job_id: jobId,
            job_title: job.job_title,
            hospital_name: job.hospital_name,
            old_status: oldStatus,
            new_status: newStatus
          }
        });
        sentCount++;
      } catch (error) {
        logger.warn(`Failed to send notification to user ${application.user_id}:`, error);
      }
    }

    logger.info(`Job status change notifications sent: ${sentCount} for job ${jobId}`);
    return { sent_count: sentCount };
  } catch (error) {
    logger.error('Error sending job status change notifications:', error);
    throw error;
  }
};

/**
 * Hastane iş ilanını getirir (tek ilan)
 * @description Belirli bir iş ilanının detaylarını getirir
 * @param {number} userId - Hastane kullanıcı ID'si
 * @param {number} jobId - İş ilanı ID'si
 * @returns {Promise<Object>} İş ilanı detayları
 * @throws {AppError} İlan bulunamadığında veya sahiplik yetkisi yoksa
 */
const getJobById = async (userId, jobId) => {
  try {
    // Hastane profil ID'sini al
    const hospitalProfile = await db('hospital_profiles')
      .where('user_id', userId)
      .select('id')
      .first();

    if (!hospitalProfile) {
      throw new AppError('Hastane profili bulunamadı', 404);
    }

    // İş ilanını getir
    const job = await db('jobs as j')
      .join('job_statuses as js', 'j.status_id', 'js.id')
      .join('specialties as s', 'j.specialty_id', 's.id')
      .leftJoin('cities as c', 'j.city_id', 'c.id')
      .where({ 'j.id': jobId, 'j.hospital_id': hospitalProfile.id })
      .select(
        'j.*',
        'js.name as status',
        's.name as specialty',
        'c.name as city'
      )
      .first();

    if (!job) {
      throw new AppError('İş ilanı bulunamadı veya yetkiniz yok', 404);
    }

    // Başvuru sayısını al (Geri çekilenler hariç)
    const [{ count }] = await db('applications')
      .where('job_id', jobId)
      .where('status_id', '!=', 5) // Geri çekilen başvuruları sayma
      .count('* as count');
    
    job.application_count = parseInt(count) || 0;

    return job;
  } catch (error) {
    logger.error('Get hospital job by id error:', error);
    throw error;
  }
};

/**
 * Hastane iş ilanını siler
 * @description İş ilanını soft delete yapar (status_id = 3 = deleted)
 * @param {number} userId - Hastane kullanıcı ID'si
 * @param {number} jobId - İş ilanı ID'si
 * @returns {Promise<boolean>} Silme işleminin başarı durumu
 * @throws {AppError} İlan bulunamadığında veya sahiplik yetkisi yoksa
 * 
 * @note Status Enum:
 * - 1: active (aktif)
 * - 2: closed (kapatılmış)
 * - 3: deleted (silinmiş)
 * - İleride archive, draft gibi durumlar eklenebilir
 */
const deleteJob = async (userId, jobId) => {
  try {
    // Hastane profil ID'sini al
    const hospitalProfile = await db('hospital_profiles')
      .where('user_id', userId)
      .select('id')
      .first();

    if (!hospitalProfile) {
      throw new AppError('Hastane profili bulunamadı', 404);
    }

    // İş ilanının sahipliğini kontrol et
    const existingJob = await db('jobs')
      .where({ id: jobId, hospital_id: hospitalProfile.id })
      .first();

    if (!existingJob) {
      throw new AppError('İş ilanı bulunamadı veya yetkiniz yok', 404);
    }

    // Soft delete yap (status_id = 3 = deleted)
    // Not: job_statuses tablosunda 3 = 'Silinmiş' olmalı
    const deleted = await db('jobs')
      .where('id', jobId)
      .update({
        status_id: 3, // deleted (job_statuses tablosunda 3 = Silinmiş)
        updated_at: db.fn.now()
      });

    return deleted > 0;
  } catch (error) {
    logger.error('Delete hospital job error:', error);
    throw error;
  }
};


// ============================================================================
// BAŞVURU YÖNETİMİ (applicationService'den taşındı)
// ============================================================================

/**
 * Hastane iş ilanı başvurularını getirir
 * @description Belirli bir iş ilanına gelen başvuruları getirir
 * @param {number} userId - Hastane kullanıcı ID'si
 * @param {number} jobId - İş ilanı ID'si
 * @param {Object} params - Filtreleme parametreleri
 * @returns {Promise<Object>} Başvurular ve sayfalama bilgisi
 * @throws {AppError} Hastane profili bulunamadığında
 */
const getApplications = async (userId, jobId, params = {}) => {
  try {
    const { page = 1, limit = 10, status } = params;

    // Hastane profil ID'sini al
    const hospitalProfile = await db('hospital_profiles')
      .where('user_id', userId)
      .select('id')
      .first();

    if (!hospitalProfile) {
      throw new AppError('Hastane profili bulunamadı', 404);
    }

    // İş ilanının sahipliğini kontrol et
    const job = await db('jobs')
      .where({ id: jobId, hospital_id: hospitalProfile.id })
      .first();

    if (!job) {
      throw new AppError('İş ilanı bulunamadı veya yetkiniz yok', 404);
    }

    // Base query - "Geri Çekildi" (status_id=5) başvurularını gösterme
    let query = db('applications as a')
      .join('doctor_profiles as dp', 'a.doctor_profile_id', 'dp.id')
      .join('users as u', 'dp.user_id', 'u.id')
      .join('application_statuses as ast', 'a.status_id', 'ast.id')
      .join('jobs as j', 'a.job_id', 'j.id')
      .where('a.job_id', jobId)
      .where('a.status_id', '!=', 5) // Geri çekilen başvuruları gösterme
      .select(
        'a.*',
        'dp.first_name',
        'dp.last_name',
        'dp.phone',
        'dp.profile_photo',
        'dp.specialty_id',
        'u.email',
        'ast.name as status',
        'j.title as job_title'
      );

    // Filtreler
    if (status) {
      query = query.where('ast.name', status);
    }

    // Sayfalama
    const offset = (page - 1) * limit;
    const applications = await query
      .orderBy('a.applied_at', 'desc')
      .limit(limit)
      .offset(offset);

    // Toplam sayı
    const totalQuery = db('applications as a')
      .join('application_statuses as ast', 'a.status_id', 'ast.id')
      .where('a.job_id', jobId);

    if (status) {
      totalQuery.where('ast.name', status);
    }

    const [{ count }] = await totalQuery.count('* as count');

    return {
      job: {
        id: job.id,
        title: job.title,
        hospital_id: job.hospital_id
      },
      applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(count),
        pages: Math.ceil(count / limit)
      }
    };
  } catch (error) {
    logger.error('Get job applications error:', error);
    throw error;
  }
};

/**
 * Hastane tüm başvurularını getirir
 * @description Hastanenin tüm iş ilanlarına gelen başvuruları getirir
 * @param {number} userId - Hastane kullanıcı ID'si
 * @param {Object} params - Filtreleme parametreleri
 * @param {number} [params.page=1] - Sayfa numarası
 * @param {number} [params.limit=20] - Sayfa başına kayıt sayısı
 * @param {string} [params.status] - Başvuru durumu
 * @param {string} [params.search] - Genel arama terimi
 * @param {string} [params.doctor_search] - Doktor adı arama terimi
 * @param {string} [params.job_search] - İş ilanı başlığı arama terimi
 * @returns {Promise<Object>} Başvurular ve sayfalama bilgisi
 * @throws {AppError} Hastane profili bulunamadığında
 */
const getAllApplications = async (userId, params = {}) => {
  try {
    const { page = 1, limit = 20, status, search, doctor_search, job_search } = params;

    // Hastane profil ID'sini al
    const hospitalProfile = await db('hospital_profiles')
      .where('user_id', userId)
      .select('id')
      .first();

    if (!hospitalProfile) {
      throw new AppError('Hastane profili bulunamadı', 404);
    }

    // Base query - "Geri Çekildi" (status_id=5) başvurularını gösterme
    let query = db('applications as a')
      .join('doctor_profiles as dp', 'a.doctor_profile_id', 'dp.id')
      .join('users as u', 'dp.user_id', 'u.id')
      .join('application_statuses as ast', 'a.status_id', 'ast.id')
      .join('jobs as j', 'a.job_id', 'j.id')
      .where('j.hospital_id', hospitalProfile.id)
      .where('a.status_id', '!=', 5) // Geri çekilen başvuruları gösterme
      .select(
        'a.*',
        'dp.first_name',
        'dp.last_name',
        'dp.phone',
        'dp.profile_photo',
        'dp.specialty_id',
        'u.email',
        'ast.name as status',
        'j.title as job_title',
        'j.id as job_id'
      );

    // Filtreler
    if (status) {
      query = query.where('ast.name', status);
    }

    // Genel arama sorgusu
    if (search) {
      query = query.where(function() {
        this.where('dp.first_name', 'like', `%${search}%`)
          .orWhere('dp.last_name', 'like', `%${search}%`)
          .orWhere('j.title', 'like', `%${search}%`);
      });
    }

    // Doktor arama - sadece doktor adında
    if (doctor_search) {
      query = query.where(function() {
        this.where('dp.first_name', 'like', `%${doctor_search}%`)
          .orWhere('dp.last_name', 'like', `%${doctor_search}%`);
      });
    }

    // İş ilanı arama - sadece iş ilanı başlığında
    if (job_search) {
      query = query.where('j.title', 'like', `%${job_search}%`);
    }

    // Sayfalama
    const offset = (page - 1) * limit;
    const applications = await query
      .orderBy('a.applied_at', 'desc')
      .limit(limit)
      .offset(offset);

    // Toplam sayı - Geri çekilen başvurular hariç
    const totalQuery = db('applications as a')
      .join('application_statuses as ast', 'a.status_id', 'ast.id')
      .join('jobs as j', 'a.job_id', 'j.id')
      .where('j.hospital_id', hospitalProfile.id)
      .where('a.status_id', '!=', 5); // Geri çekilen başvuruları gösterme

    if (status) {
      totalQuery.where('ast.name', status);
    }

    // Genel arama sorgusu
    if (search) {
      totalQuery.join('doctor_profiles as dp', 'a.doctor_profile_id', 'dp.id')
        .where(function() {
          this.where('dp.first_name', 'like', `%${search}%`)
            .orWhere('dp.last_name', 'like', `%${search}%`)
            .orWhere('j.title', 'like', `%${search}%`);
        });
    }

    // Doktor arama - sadece doktor adında
    if (doctor_search) {
      totalQuery.join('doctor_profiles as dp', 'a.doctor_profile_id', 'dp.id')
        .where(function() {
          this.where('dp.first_name', 'like', `%${doctor_search}%`)
            .orWhere('dp.last_name', 'like', `%${doctor_search}%`);
        });
    }

    // İş ilanı arama - sadece iş ilanı başlığında
    if (job_search) {
      totalQuery.where('j.title', 'like', `%${job_search}%`);
    }

    const [{ count }] = await totalQuery.count('* as count');

    return {
      applications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(count),
        pages: Math.ceil(count / limit)
      }
    };
  } catch (error) {
    logger.error('Get all hospital applications error:', error);
    throw error;
  }
};
/**
 * Hastane başvuru durumunu günceller
 * @description Başvuru durumunu günceller ve bildirim gönderir
 * Admin modülüyle uyumlu olması için status_id kullanılır
 * @param {number} userId - Hastane kullanıcı ID'si
 * @param {number} applicationId - Başvuru ID'si
 * @param {number} statusId - Yeni durum ID'si (application_statuses.id)
 * @param {string} [notes=null] - Değerlendirme notları
 * @returns {Promise<Object>} Güncellenmiş başvuru
 * @throws {AppError} Başvuru bulunamadığında veya sahiplik yetkisi yoksa
 */
const updateApplicationStatus = async (userId, applicationId, statusId, notes = null) => {
  try {
    // Hastane profil ID'sini al
    const hospitalProfile = await db('hospital_profiles')
      .where('user_id', userId)
      .select('id')
      .first();

    if (!hospitalProfile) {
      throw new AppError('Hastane profili bulunamadı', 404);
    }

    // Başvurunun sahipliğini kontrol et
    const application = await db('applications as a')
      .join('jobs as j', 'a.job_id', 'j.id')
      .where({ 'a.id': applicationId, 'j.hospital_id': hospitalProfile.id })
      .select('a.*', 'j.title as job_title', 'j.hospital_id')
      .first();

    if (!application) {
      throw new AppError('Başvuru bulunamadı veya yetkiniz yok', 404);
    }

    // Başvuru durumunu güncelle (direkt status_id kullan - string desteği kaldırıldı)
    await db('applications')
      .where('id', applicationId)
      .update({
        status_id: statusId,
        notes: notes,
        updated_at: db.fn.now()
      });

    // Güncellenmiş başvuruyu getir
    const updatedApplication = await db('applications as a')
      .join('doctor_profiles as dp', 'a.doctor_profile_id', 'dp.id')
      .join('users as u', 'dp.user_id', 'u.id')
      .join('application_statuses as ast', 'a.status_id', 'ast.id')
      .join('jobs as j', 'a.job_id', 'j.id')
      .where('a.id', applicationId)
      .select(
        'a.*',
        'dp.first_name',
        'dp.last_name',
        'u.email',
        'ast.name as status',
        'j.title as job_title'
      )
      .first();

    // Bildirim gönder
    try {
      // doctor_profile_id'den user_id'yi al
      const doctorUser = await db('doctor_profiles')
        .join('users', 'doctor_profiles.user_id', 'users.id')
        .where('doctor_profiles.id', application.doctor_profile_id)
        .select('users.id as user_id')
        .first();

      if (doctorUser) {
        await notificationService.sendDoctorNotification(doctorUser.user_id, statusId, {
          application_id: applicationId,
          job_title: application.job_title,
          hospital_name: application.hospital || 'Hastane',
          notes: notes
        });
      }
    } catch (notificationError) {
      logger.warn('Notification creation failed:', notificationError);
    }

    return updatedApplication;
  } catch (error) {
    logger.error('Update application status error:', error);
    throw error;
  }
};

/**
 * Hastane son başvurularını getirir (dashboard için)
 * @description Hastanenin son başvurularını getirir
 * @param {number} userId - Hastane kullanıcı ID'si
 * @param {number} limit - Maksimum başvuru sayısı
 * @returns {Promise<Array>} Son başvurular
 * @throws {AppError} Hastane profili bulunamadığında
 */
const getRecentApplications = async (userId, limit = 5) => {
  try {
    // Hastane profil ID'sini al
    const hospitalProfile = await db('hospital_profiles')
      .where('user_id', userId)
      .select('id')
      .first();

    if (!hospitalProfile) {
      throw new AppError('Hastane profili bulunamadı', 404);
    }

    // Son başvuruları getir
    const applications = await db('applications as a')
      .join('doctor_profiles as dp', 'a.doctor_profile_id', 'dp.id')
      .join('users as u', 'dp.user_id', 'u.id')
      .join('application_statuses as ast', 'a.status_id', 'ast.id')
      .join('jobs as j', 'a.job_id', 'j.id')
      .where('j.hospital_id', hospitalProfile.id)
      .select(
        'a.id',
        'a.applied_at',
        'dp.first_name',
        'dp.last_name',
        'u.email',
        'ast.name as status',
        'j.title as job_title'
      )
      .orderBy('a.applied_at', 'desc')
      .limit(limit);

    return applications;
  } catch (error) {
    logger.error('Get hospital recent applications error:', error);
    throw error;
  }
};

/**
 * Hastane iş ilanlarını getirir (dashboard için)
 * @description Hastanenin son iş ilanlarını getirir
 * @param {number} userId - Hastane kullanıcı ID'si
 * @param {number} limit - Maksimum iş ilanı sayısı
 * @returns {Promise<Array>} Son iş ilanları
 * @throws {AppError} Hastane profili bulunamadığında
 */
const getRecentJobs = async (userId, limit = 5) => {
  try {
    // Hastane profil ID'sini al
    const hospitalProfile = await db('hospital_profiles')
      .where('user_id', userId)
      .select('id')
      .first();

    if (!hospitalProfile) {
      throw new AppError('Hastane profili bulunamadı', 404);
    }

    // Son iş ilanlarını getir
    const jobs = await db('jobs as j')
      .join('job_statuses as js', 'j.status_id', 'js.id')
      .join('specialties as s', 'j.specialty_id', 's.id')
      .leftJoin('cities as c', 'j.city_id', 'c.id')
      .where('j.hospital_id', hospitalProfile.id)
      .select(
        'j.id',
        'j.title',
        'j.created_at',
        'js.name as status',
        's.name as specialty',
        'c.name as city'
      )
      .orderBy('j.created_at', 'desc')
      .limit(limit);

    return jobs;
  } catch (error) {
    logger.error('Get hospital recent jobs error:', error);
    throw error;
  }
};


// ============================================================================
// DOKTOR PROFİL GÖRÜNTÜLEME FONKSİYONLARI
// ============================================================================

/**
 * Hastane tarafından doktor profillerini listeleme
 * @param {number} hospitalUserId - Hastane kullanıcı ID'si
 * @param {Object} params - Filtreleme parametreleri
 * @param {number} [params.page=1] - Sayfa numarası
 * @param {number} [params.limit=20] - Sayfa başına kayıt sayısı
 * @param {string} [params.search] - Doktor adı arama terimi
 * @param {string} [params.specialty] - Uzmanlık alanı filtresi
 * @param {string} [params.city] - Şehir filtresi
 * @returns {Promise<Object>} Doktor profilleri listesi ve sayfalama bilgileri
 * @throws {AppError} Hastane profili bulunamadığında veya veritabanı hatası durumunda
 * 
 * @example
 * const doctors = await getDoctorProfiles(123, { page: 1, limit: 10, search: 'Ahmet' });
 * console.log('Doktorlar:', doctors.doctors);
 * console.log('Toplam:', doctors.total);
 */
const getDoctorProfiles = async (hospitalUserId, params = {}) => {
  try {
    const { page = 1, limit = 20, search, specialty, city } = params;
    const offset = (page - 1) * limit;

    // Hastane profilini kontrol et
    const hospitalProfile = await db('hospital_profiles')
      .where('user_id', hospitalUserId)
      .first();

    if (!hospitalProfile) {
      throw new AppError('Hastane profili bulunamadı', 404);
    }

    // Doktor profillerini getir
    let query = db('doctor_profiles as dp')
      .join('users as u', 'dp.user_id', 'u.id')
      .leftJoin('specialties as s', 'dp.specialty_id', 's.id')
      .leftJoin('subspecialties as ss', 'dp.subspecialty_id', 'ss.id')
      .select(
        'dp.id',
        'dp.first_name',
        'dp.last_name',
        'dp.dob',
        'dp.birth_place',
        'dp.residence_city',
        'dp.phone',
        'dp.title',
        'dp.work_type',
        'dp.profile_photo',
        'dp.photo_status',
        'dp.region',
        's.name as specialty_name',
        'ss.name as subspecialty_name',
        'u.email',
        'u.is_approved',
        'u.is_active',
        'u.created_at'
      )
      .where('u.is_approved', true)
      .where('u.is_active', true);

    // Arama filtresi
    if (search) {
      query = query.where(function() {
        this.where('dp.first_name', 'like', `%${search}%`)
          .orWhere('dp.last_name', 'like', `%${search}%`)
          .orWhere('u.email', 'like', `%${search}%`);
      });
    }

    // Uzmanlık filtresi - specialty_id ile
    if (specialty) {
      query = query.where('dp.specialty_id', specialty);
    }

    // Şehir filtresi
    if (city) {
      query = query.where('dp.residence_city', 'like', `%${city}%`);
    }

    // Sayfalama
    const doctors = await query
      .limit(limit)
      .offset(offset)
      .orderBy('dp.created_at', 'desc');

    // Toplam sayı
    let totalQuery = db('doctor_profiles as dp')
      .join('users as u', 'dp.user_id', 'u.id')
      .where('u.is_approved', true)
      .where('u.is_active', true);

    if (search) {
      totalQuery = totalQuery.where(function() {
        this.where('dp.first_name', 'like', `%${search}%`)
          .orWhere('dp.last_name', 'like', `%${search}%`)
          .orWhere('u.email', 'like', `%${search}%`);
      });
    }

    if (specialty) {
      totalQuery = totalQuery.where('dp.specialty_id', specialty);
    }

    if (city) {
      totalQuery = totalQuery.where('dp.residence_city', 'like', `%${city}%`);
    }

    const totalResult = await totalQuery.count('dp.id as count').first();
    const total = parseInt(totalResult.count);

    return {
      doctors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    logger.error('Get doctor profiles error:', error);
    throw error;
  }
};

/**
 * Hastane tarafından tek doktor profilini detaylı görüntüleme
 * @param {number} hospitalUserId - Hastane kullanıcı ID'si
 * @param {number} doctorProfileId - Doktor profil ID'si
 * @returns {Promise<Object>} Doktor profil detayları
 * @throws {AppError} Hastane profili veya doktor profili bulunamadığında
 * 
 * @example
 * const doctor = await getDoctorProfileDetail(123, 456);
 * console.log('Doktor detayı:', doctor);
 */
const getDoctorProfileDetail = async (hospitalUserId, doctorProfileId) => {
  try {
    // Hastane profilini kontrol et
    const hospitalProfile = await db('hospital_profiles')
      .where('user_id', hospitalUserId)
      .first();

    if (!hospitalProfile) {
      throw new AppError('Hastane profili bulunamadı', 404);
    }

    // Doktor profilini getir - Lookup tablolarıyla join et
    const doctorProfile = await db('doctor_profiles as dp')
      .join('users as u', 'dp.user_id', 'u.id')
      .leftJoin('specialties as s', 'dp.specialty_id', 's.id')
      .leftJoin('subspecialties as ss', 'dp.subspecialty_id', 'ss.id')
      .select(
        'dp.*',
        'u.email',
        'u.is_approved',
        'u.is_active',
        'u.created_at as user_created_at',
        's.name as specialty_name',
        'ss.name as subspecialty_name'
      )
      .where('dp.id', doctorProfileId)
      .where('u.is_approved', true)
      .where('u.is_active', true)
      .first();

    if (!doctorProfile) {
      throw new AppError('Doktor profili bulunamadı', 404);
    }

    // Eğitim bilgilerini getir - Eğitim türü ile join
    const educations = await db('doctor_educations as de')
      .leftJoin('doctor_education_types as det', 'de.education_type_id', 'det.id')
      .where('de.doctor_profile_id', doctorProfileId)
      .select(
        'de.*',
        'det.name as education_type_name'
      )
      .orderBy('de.graduation_year', 'desc');

    // Deneyim bilgilerini getir - Uzmanlık ve yan dal ile join
    const experiences = await db('doctor_experiences as dex')
      .leftJoin('specialties as s', 'dex.specialty_id', 's.id')
      .leftJoin('subspecialties as ss', 'dex.subspecialty_id', 'ss.id')
      .where('dex.doctor_profile_id', doctorProfileId)
      .select(
        'dex.*',
        's.name as specialty_name',
        'ss.name as subspecialty_name'
      )
      .orderBy('dex.start_date', 'desc');

    // Sertifika bilgilerini getir - Sertifika türü ile join
    const certificates = await db('doctor_certificates as dc')
      .leftJoin('certificate_types as ct', 'dc.certificate_type_id', 'ct.id')
      .where('dc.doctor_profile_id', doctorProfileId)
      .select(
        'dc.*',
        'ct.name as certificate_type_name'
      )
      .orderBy('dc.issued_at', 'desc');

    // Dil bilgilerini getir - Dil ve seviye ile join
    const languages = await db('doctor_languages as dl')
      .join('languages as l', 'dl.language_id', 'l.id')
      .join('language_levels as ll', 'dl.level_id', 'll.id')
      .where('dl.doctor_profile_id', doctorProfileId)
      .select(
        'dl.*',
        'l.name as language_name',
        'll.name as level_name'
      );

    return {
      profile: doctorProfile,
      educations,
      experiences,
      certificates,
      languages
    };
  } catch (error) {
    logger.error('Get doctor profile detail error:', error);
    throw error;
  }
};

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = {
  // Profil yönetimi
  getProfile,
  updateProfile,
  getProfileCompletion,
  
  // Departman yönetimi
  getDepartments,
  addDepartment,
  updateDepartment,
  deleteDepartment,
  
  // İletişim bilgisi yönetimi
  getContacts,
  addContact,
  updateContact,
  deleteContact,
  
  // İş ilanı yönetimi (jobService'den taşındı)
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  
  // Başvuru yönetimi (applicationService'den taşındı)
  getApplications,
  getAllApplications,
  updateApplicationStatus,
  
  // Dashboard yönetimi
  getRecentApplications,
  getRecentJobs,
  
  // İş ilanı bildirimleri (jobService'den taşındı)
  sendJobStatusChangeNotification,
  
  // Doktor profil görüntüleme
  getDoctorProfiles,
  getDoctorProfileDetail
};
