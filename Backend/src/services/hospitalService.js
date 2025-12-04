/**
 * @file hospitalService.js
 * @description Hastane servisi - Hastane profili, departmanlar, iletişim, iş ilanları ve başvuru yönetimi işlemlerini yönetir.
 * Bu servis, hospitalController tarafından kullanılan tüm hastane işlemlerini içerir.
 * 
 * Ana İşlevler:
 * - Hastane profil yönetimi (CRUD)
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
    // hospital_profiles, users ve cities tablolarını join ederek tam profil bilgisini getir
    const profile = await db('hospital_profiles as hp')
      .join('users as u', 'hp.user_id', 'u.id')
      .leftJoin('cities as c', 'hp.city_id', 'c.id')
      .select(
        'hp.*',                          // Hastane profil bilgileri (hp.email burada)
        'c.name as city',                // Şehir adı (cities tablosundan)
        'u.email as user_email',         // Çakışmayı önlemek için alias
        'u.is_active',                   // Kullanıcı aktiflik durumu
        'u.is_approved',                 // Admin onay durumu
        'u.created_at as user_created_at'  // Kullanıcı oluşturulma tarihi
      )
      .where('hp.user_id', userId)
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
 * @param {number} profileData.city_id - Şehir ID (cities tablosundan FK)
 * @param {string} [profileData.address] - Adres (opsiyonel)
 * @param {string} [profileData.phone] - Telefon numarası
 * @param {string} [profileData.email] - E-posta adresi (genelde users.email'den gelir, değiştirilemez)
 * @param {string} [profileData.website] - Web sitesi URL'si (opsiyonel)
 * @param {string} [profileData.about] - Kurum hakkında bilgi (opsiyonel)
 * @param {string} [profileData.logo] - Sağlık kuruluşu logosu (opsiyonel)
 * @returns {Promise<Object>} Güncellenmiş hastane profil bilgileri
 * @throws {AppError} 404 - Hastane profili bulunamadı
 * @throws {Error} Veritabanı hatası durumunda
 * 
 * @example
 * const updatedProfile = await updateProfile(123, { 
 *   institution_name: "Yeni Sağlık Kuruluşu Adı",
 *   city_id: 34,
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
      { key: 'institution_name', name: 'Kurum Adı', value: profile.institution_name, required: true },
      { key: 'city', name: 'Şehir', value: profile.city, required: true },
      { key: 'phone', name: 'Telefon', value: profile.phone, required: true },
      { key: 'address', name: 'Adres', value: profile.address, required: false },
      { key: 'email', name: 'E-posta', value: profile.email, required: false },
      { key: 'website', name: 'Web Sitesi', value: profile.website, required: false },
      { key: 'about', name: 'Hakkında', value: profile.about, required: false },
      { key: 'logo', name: 'Logo', value: profile.logo, required: true }
    ];

    // Dolu field'ları say (logo dahil)
    const completedFields = fields.filter(field => {
      if (!field.value) return false;
      const value = typeof field.value === 'string' ? field.value : String(field.value);
      return value.trim() !== '';
    }).length;
    
    const totalFields = fields.length;
    const percentage = Math.round((completedFields / totalFields) * 100);
    
    // Eksik field'ları bul (sadece boş olanlar)
    const missingFields = fields.filter(field => {
      if (!field.value) return true;
      const value = typeof field.value === 'string' ? field.value : String(field.value);
      return value.trim() === '';
    }).map(field => field.name);

    // Zorunlu field'ların durumu
    const requiredFields = fields.filter(f => f.required);
    const completedRequiredFields = requiredFields.filter(field => {
      if (!field.value) return false;
      const value = typeof field.value === 'string' ? field.value : String(field.value);
      return value.trim() !== '';
    }).length;

    return {
      percentage,
      completedFields,
      totalFields,
      missingFields,
      requiredCompleted: completedRequiredFields,
      requiredTotal: requiredFields.length
    };
  } catch (error) {
    logger.error('Get hospital profile completion error:', error);
    throw error;
  }
};

// ============================================================================
// MODULE EXPORTS
// ============================================================================

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
 * @param {number} [params.specialty_id] - Uzmanlık ID'si (filtreleme)
 * @param {number} [params.subspecialty_id] - Yan dal uzmanlığı ID'si (filtreleme)
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
      specialty_search,
      specialty_id,
      subspecialty_id
    } = params;

    // Hastane profil ID'sini al
    const hospitalProfile = await db('hospital_profiles')
      .where('user_id', userId)
      .select('id')
      .first();

    if (!hospitalProfile) {
      throw new AppError('Hastane profili bulunamadı', 404);
    }

    // Base query - hastane kendi ilanlarının hepsini görür (Aktif, Pasif) - Silinmiş olanlar hariç
    let query = db('jobs as j')
      .join('job_statuses as js', 'j.status_id', 'js.id')
      .join('specialties as s', 'j.specialty_id', 's.id')
      .leftJoin('cities as c', 'j.city_id', 'c.id')
      .leftJoin('subspecialties as ss', 'j.subspecialty_id', 'ss.id')
      .where('j.hospital_id', hospitalProfile.id)
      .whereNull('j.deleted_at') // Soft delete: Silinmiş iş ilanlarını gösterme
      .select(
        'j.*',
        'js.name as status',
        's.name as specialty',
        'c.name as city',
        'ss.name as subspecialty_name'
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

    // Uzmanlık ID filtresi
    if (specialty_id) {
      query = query.where('j.specialty_id', specialty_id);
    }

    // Yan dal uzmanlığı ID filtresi
    if (subspecialty_id) {
      query = query.where('j.subspecialty_id', subspecialty_id);
    }

    // Sayfalama - SQL Server için OFFSET/FETCH kullan
    const offset = (page - 1) * limit;
    const jobs = await query
      .orderBy('j.created_at', 'desc')
      .offset(offset)
      .limit(limit);

    // Application count'ları ayrı query ile al (silinmiş başvurular hariç)
    if (jobs.length > 0) {
      const jobIds = jobs.map(job => job.id);
      const applicationCounts = await db('applications as a')
        .whereIn('a.job_id', jobIds)
        .whereNull('a.deleted_at') // Soft delete: Silinmiş başvuruları sayma
        // NOT: Geri çekilen başvurular artık sayılıyor
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
      .where('j.hospital_id', hospitalProfile.id)
      .whereNull('j.deleted_at'); // Soft delete: Silinmiş iş ilanlarını sayma

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

    // Uzmanlık ID filtresi
    if (specialty_id) {
      totalQuery.where('j.specialty_id', specialty_id);
    }

    // Yan dal uzmanlığı ID filtresi
    if (subspecialty_id) {
      totalQuery.where('j.subspecialty_id', subspecialty_id);
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
    // ÖNEMLİ: status_id her zaman 1 (Onay Bekliyor) olarak ayarlanır
    // Hastane status_id gönderse bile göz ardı edilir ve 1 olarak ayarlanır
    const { status_id, ...cleanJobData } = jobData; // status_id'yi çıkar
    
    const insertData = {
      ...cleanJobData,
      hospital_id: hospitalProfile.id,
      status_id: 1, // Onay Bekliyor - Admin onayı bekliyor (HER ZAMAN)
      revision_count: 0,
      created_at: db.fn.now(),
      updated_at: db.fn.now()
    };

    const result = await db('jobs').insert(insertData).returning('id');
    const jobId = result[0].id;

    logger.info(`Job created with ID: ${jobId}, status_id: 1 (Onay Bekliyor)`);

    // Admin'lere yeni iş ilanı bildirimi gönder
    try {
      const hospitalInfo = await db('hospital_profiles')
        .where('id', hospitalProfile.id)
        .select('institution_name')
        .first();
      
      await notificationService.sendAdminSystemNotification({
        type: 'info',
        title: 'Yeni İş İlanı',
        body: `${hospitalInfo?.institution_name || 'Hastane'} tarafından yeni bir iş ilanı oluşturuldu. Onay bekliyor.`,
        data: {
          job_id: jobId,
          hospital_id: hospitalProfile.id,
          hospital_name: hospitalInfo?.institution_name || 'Hastane',
          job_title: jobData.title || 'İş İlanı',
          status: 'pending_approval'
        }
      });
    } catch (notificationError) {
      logger.warn('Admin notification failed for new job:', notificationError);
      // Bildirim hatası iş ilanı oluşturmayı engellemez
    }

    // Oluşturulan iş ilanını ID ile getir
    const job = await db('jobs as j')
      .join('job_statuses as js', 'j.status_id', 'js.id')
      .join('specialties as s', 'j.specialty_id', 's.id')
      .leftJoin('cities as c', 'j.city_id', 'c.id')
      .leftJoin('subspecialties as ss', 'j.subspecialty_id', 'ss.id')
      .where('j.id', jobId)
      .select('j.*', 'js.name as status', 's.name as specialty', 'c.name as city', 'ss.name as subspecialty_name')
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

    // Sadece Revizyon Gerekli (status_id = 2) durumundaki ilanları güncelleyebilir
    if (existingJob.status_id !== 2) {
      throw new AppError('Bu ilan sadece revizyon durumundayken güncellenebilir', 400);
    }

    // Eski durumu kaydet
    const oldStatus = existingJob.status_id;
    
    // status_id'yi jobData'dan çıkar (hastane status değiştiremez)
    const { status_id, ...updateData } = jobData;
    
    // İş ilanını güncelle
    await db('jobs')
      .where('id', jobId)
      .update({
        ...updateData,
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

    return job;
  } catch (error) {
    logger.error('Update hospital job error:', error);
    throw error;
  }
};

/**
 * Hastane iş ilanını tekrar gönderir (resubmit)
 * @description Revizyon Gerekli durumundaki ilanı tekrar Onay Bekliyor durumuna getirir
 * @param {number} userId - Hastane kullanıcı ID'si
 * @param {number} jobId - İş ilanı ID'si
 * @returns {Promise<Object>} Güncellenmiş iş ilanı
 * @throws {AppError} İlan bulunamadığında, sahiplik yetkisi yoksa veya status uygun değilse
 */
const resubmitJob = async (userId, jobId) => {
  try {
    // Hastane profil ID'sini al
    const hospitalProfile = await db('hospital_profiles')
      .where('user_id', userId)
      .select('id')
      .first();

    if (!hospitalProfile) {
      throw new AppError('Hastane profili bulunamadı', 404);
    }

    // İş ilanının sahipliğini ve durumunu kontrol et
    const existingJob = await db('jobs')
      .where({ id: jobId, hospital_id: hospitalProfile.id })
      .first();

    if (!existingJob) {
      throw new AppError('İş ilanı bulunamadı veya yetkiniz yok', 404);
    }

    // Sadece Revizyon Gerekli (status_id = 2) durumundaki ilanlar resubmit edilebilir
    if (existingJob.status_id !== 2) {
      throw new AppError('Bu ilan sadece revizyon durumundayken tekrar gönderilebilir', 400);
    }

    const oldStatusId = existingJob.status_id;

    // İlanı Pending Approval durumuna getir
    await db('jobs')
      .where('id', jobId)
      .update({
        status_id: 1, // Onay Bekliyor
        revision_note: null, // Revizyon notunu temizle
        updated_at: db.fn.now()
      });

    // Job history kaydı oluştur
    await db('job_history').insert({
      job_id: jobId,
      old_status_id: oldStatusId,
      new_status_id: 1,
      changed_by: userId,
      note: 'İlan revize edilerek tekrar gönderildi',
      changed_at: db.fn.now()
    });

    // Güncellenmiş iş ilanını getir
    const job = await db('jobs as j')
      .join('job_statuses as js', 'j.status_id', 'js.id')
      .join('specialties as s', 'j.specialty_id', 's.id')
      .leftJoin('cities as c', 'j.city_id', 'c.id')
      .leftJoin('subspecialties as ss', 'j.subspecialty_id', 'ss.id')
      .where('j.id', jobId)
      .select('j.*', 'js.name as status', 's.name as specialty', 'c.name as city', 'ss.name as subspecialty_name')
      .first();

    logger.info(`Job resubmitted: ${jobId} by user ${userId}`);
    return job;
  } catch (error) {
    logger.error('Resubmit hospital job error:', error);
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

    // İş ilanını getir (TÜM statuslerde - Pasif, Beklemede, Onaylandı, Reddedildi)
    const job = await db('jobs as j')
      .join('job_statuses as js', 'j.status_id', 'js.id')
      .join('specialties as s', 'j.specialty_id', 's.id')
      .leftJoin('cities as c', 'j.city_id', 'c.id')
      .leftJoin('subspecialties as ss', 'j.subspecialty_id', 'ss.id')
      .where({ 'j.id': jobId, 'j.hospital_id': hospitalProfile.id })
      .whereNull('j.deleted_at') // Sadece fiziksel silinmemiş ilanlar - Hastane tüm statuslerde görebilir
      .select(
        'j.*',
        'js.name as status',
        's.name as specialty',
        'c.name as city',
        'ss.name as subspecialty_name'
      )
      .first();

    if (!job) {
      throw new AppError('İş ilanı bulunamadı veya yetkiniz yok', 404);
    }

    // Başvuru sayısını al (Geri çekilenler dahil)
    const [{ count }] = await db('applications')
      .where('job_id', jobId)
      .whereNull('deleted_at') // Soft delete: Silinmiş başvuruları sayma
      .count('* as count');
    
    job.application_count = parseInt(count) || 0;

    return job;
  } catch (error) {
    logger.error('Get hospital job by id error:', error);
    throw error;
  }
};

/**
 * Hastane iş ilanı durumunu günceller
 * @description İş ilanının durumunu (Aktif/Pasif) günceller
 * @param {number} userId - Hastane kullanıcı ID'si
 * @param {number} jobId - İş ilanı ID'si
 * @param {number} statusId - Yeni durum ID'si (1: Aktif, 2: Pasif)
 * @param {string} reason - Durum değişikliği nedeni
 * @returns {Promise<Object>} Güncellenmiş iş ilanı
 * @throws {AppError} İlan bulunamadığında veya sahiplik yetkisi yoksa
 */
const updateJobStatus = async (userId, jobId, statusId, reason) => {
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
    
    // Durum geçiş kontrolü: Hastane sadece Onaylandı ↔ Pasif geçişini yapabilir
    // - Onaylandı (3) → Pasif (4) ✓
    // - Pasif (4) → Onaylandı (3) ✓
    // - Diğer durumlardan (1, 2, 5) geçiş yapılamaz ✗
    
    if (oldStatus === 3 && statusId !== 4) {
      throw new AppError('Onaylandı durumundaki ilanlar sadece Pasif durumuna geçirilebilir', 400);
    }
    
    if (oldStatus === 4 && statusId !== 3) {
      throw new AppError('Pasif durumundaki ilanlar sadece Onaylandı durumuna geçirilebilir', 400);
    }
    
    if (oldStatus !== 3 && oldStatus !== 4) {
      throw new AppError('Bu ilanın durumu değiştirilemez. Sadece Onaylandı veya Pasif durumundaki ilanların durumu değiştirilebilir', 400);
    }
    
    // İş ilanı durumunu güncelle
    const updateData = {
      status_id: statusId,
      updated_at: db.fn.now()
    };
    
    // Eğer Pasif'ten (4) Onaylandı'ya (3) geçiş yapılıyorsa
    // published_at'i güncelle (yeni yayın tarihi olarak)
    if (oldStatus === 4 && statusId === 3) {
      updateData.published_at = db.fn.now();
      logger.info(`Job ${jobId}: Pasif → Aktif geçişi, published_at güncellendi`);
    }
    
    await db('jobs')
      .where('id', jobId)
      .update(updateData);

    // Güncellenmiş iş ilanını getir
    const job = await db('jobs as j')
      .join('job_statuses as js', 'j.status_id', 'js.id')
      .join('specialties as s', 'j.specialty_id', 's.id')
      .leftJoin('cities as c', 'j.city_id', 'c.id')
      .where('j.id', jobId)
      .select('j.*', 'js.name as status', 's.name as specialty', 'c.name as city')
      .first();

    // İlan durumu değiştiyse bildirim gönder
    if (statusId !== oldStatus) {
      try {
        const oldStatusName = await db('job_statuses').where('id', oldStatus).select('name').first();
        await sendJobStatusChangeNotification(jobId, job.status, oldStatusName?.name || 'unknown');
      } catch (notificationError) {
        logger.warn('Job status change notification failed:', notificationError);
      }
    }

    logger.info(`Job status updated: ${jobId} from ${oldStatus} to ${statusId} by user ${userId}`);
    return job;
  } catch (error) {
    logger.error('Update hospital job status error:', error);
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

    // Base query - Silinmiş başvuruları gösterme
    let query = db('applications as a')
      .join('doctor_profiles as dp', 'a.doctor_profile_id', 'dp.id')
      .join('users as u', 'dp.user_id', 'u.id')
      .join('application_statuses as ast', 'a.status_id', 'ast.id')
      .join('jobs as j', 'a.job_id', 'j.id')
      .leftJoin('job_statuses as js', 'j.status_id', 'js.id')
      .leftJoin('cities as c', 'j.city_id', 'c.id')
      .leftJoin('specialties as s', 'j.specialty_id', 's.id')
      .where('a.job_id', jobId)
      .where('j.hospital_id', hospitalProfile.id) // GÜVENLİK: Sadece bu hastaneye ait ilanların başvuruları
      .whereNull('a.deleted_at') // Soft delete: Silinmiş başvuruları gösterme
      .whereNull('j.deleted_at') // Soft delete: Silinmiş iş ilanlarına ait başvuruları gösterme
      .select(
        // OPTİMİZASYON: a.* yerine sadece kullanılan alanları seç
        // cover_letter ve notes (nvarchar(max)) çok büyük olabilir - sadece detay sayfasında gösterilir
        'a.id',
        'a.job_id',
        'a.doctor_profile_id',
        'a.status_id',
        'a.applied_at',
        // Pasif doktorlar için bilgileri gizle (SQL Server bit tipi için güvenli kontrol)
        // Aktif edildiğinde (is_active = 1) bilgiler tekrar görünür olacak
        db.raw('CASE WHEN u.is_active = 0 OR u.is_active IS NULL THEN NULL ELSE dp.first_name END as first_name'),
        db.raw('CASE WHEN u.is_active = 0 OR u.is_active IS NULL THEN NULL ELSE dp.last_name END as last_name'),
        db.raw('CASE WHEN u.is_active = 0 OR u.is_active IS NULL THEN NULL ELSE dp.phone END as phone'),
        // OPTİMİZASYON: profile_photo ve specialty_id kaldırıldı - liste sayfasında gerekli değil
        db.raw('CASE WHEN u.is_active = 0 OR u.is_active IS NULL THEN NULL ELSE u.email END as email'),
        'u.is_active as doctor_is_active',
        'ast.name as status',
        'j.title as job_title',
        'j.created_at as job_created_at',
        // OPTİMİZASYON: Kullanılmayan iş ilanı alanları kaldırıldı
        'js.name as job_status'
      );

    // Filtreler
    if (status) {
      // Status parametresi sayı mı kontrol et
      // Eğer sayı ise ast.id ile, değilse ast.name ile karşılaştır
      const statusNum = parseInt(status, 10);
      if (!isNaN(statusNum)) {
        // Sayı geldiğinde ID ile karşılaştır
        query = query.where('ast.id', statusNum);
      } else {
        // String geldiğinde name ile karşılaştır (geriye uyumluluk)
        query = query.where('ast.name', status);
      }
    }

    // Sayfalama
    const offset = (page - 1) * limit;
    const applications = await query
      .orderBy('a.applied_at', 'desc')
      .limit(limit)
      .offset(offset);

    // JavaScript'te fallback hesaplama (job_status eksikse)
    if (applications.length > 0) {
      applications.forEach(app => {
        if (!app.job_status && app.job_status_id) {
          // Yeni status sistemine göre fallback (Türkçe)
          const statusMap = {
            1: 'Onay Bekliyor',
            2: 'Revizyon Gerekli',
            3: 'Onaylandı',
            4: 'Pasif',
            5: 'Reddedildi'
          };
          app.job_status_fallback = statusMap[app.job_status_id] || 'Bilinmiyor';
        }
      });
    }

    // Toplam sayı (Geri çekilenler dahil)
    const totalQuery = db('applications as a')
      .join('doctor_profiles as dp', 'a.doctor_profile_id', 'dp.id')
      .join('users as u', 'dp.user_id', 'u.id')
      .join('application_statuses as ast', 'a.status_id', 'ast.id')
      .join('jobs as j', 'a.job_id', 'j.id')
      .where('a.job_id', jobId)
      .whereNull('a.deleted_at') // Soft delete: Silinmiş başvuruları sayma
      .whereNull('j.deleted_at'); // Soft delete: Silinmiş iş ilanlarına ait başvuruları gösterme

    if (status) {
      // Status parametresi sayı mı kontrol et
      // Eğer sayı ise ast.id ile, değilse ast.name ile karşılaştır
      const statusNum = parseInt(status, 10);
      if (!isNaN(statusNum)) {
        // Sayı geldiğinde ID ile karşılaştır
        totalQuery.where('ast.id', statusNum);
      } else {
        // String geldiğinde name ile karşılaştır (geriye uyumluluk)
        totalQuery.where('ast.name', status);
      }
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
    const { page = 1, limit = 10, status, search, doctor_search, job_search, jobIds } = params;

    // Hastane profil ID'sini al
    const hospitalProfile = await db('hospital_profiles')
      .where('user_id', userId)
      .select('id')
      .first();

    if (!hospitalProfile) {
      throw new AppError('Hastane profili bulunamadı', 404);
    }

    // Base query - Silinmiş başvuruları gösterme
    let query = db('applications as a')
      .join('doctor_profiles as dp', 'a.doctor_profile_id', 'dp.id')
      .join('users as u', 'dp.user_id', 'u.id')
      .join('application_statuses as ast', 'a.status_id', 'ast.id')
      .join('jobs as j', 'a.job_id', 'j.id')
      .leftJoin('job_statuses as js', 'j.status_id', 'js.id')
      .leftJoin('cities as c', 'j.city_id', 'c.id')
      .leftJoin('specialties as s', 'j.specialty_id', 's.id')
      .where('j.hospital_id', hospitalProfile.id)
      .whereNull('a.deleted_at') // Soft delete: Silinmiş başvuruları gösterme
      .whereNull('j.deleted_at') // Soft delete: Silinmiş iş ilanlarına ait başvuruları gösterme
      .select(
        // OPTİMİZASYON: a.* yerine sadece kullanılan alanları seç
        // cover_letter ve notes (nvarchar(max)) çok büyük olabilir - sadece detay sayfasında gösterilir
        'a.id',
        'a.job_id',
        'a.doctor_profile_id',
        'a.status_id',
        'a.applied_at',
        // Pasif doktorlar için bilgileri gizle (SQL Server bit tipi için güvenli kontrol)
        // Aktif edildiğinde (is_active = 1) bilgiler tekrar görünür olacak
        db.raw('CASE WHEN u.is_active = 0 OR u.is_active IS NULL THEN NULL ELSE dp.first_name END as first_name'),
        db.raw('CASE WHEN u.is_active = 0 OR u.is_active IS NULL THEN NULL ELSE dp.last_name END as last_name'),
        db.raw('CASE WHEN u.is_active = 0 OR u.is_active IS NULL THEN NULL ELSE dp.phone END as phone'),
        // OPTİMİZASYON: profile_photo ve specialty_id kaldırıldı - liste sayfasında gerekli değil
        // 'dp.profile_photo' - base64 1-2 MB olabilir
        // 'dp.specialty_id' - kullanılmıyor
        db.raw('CASE WHEN u.is_active = 0 OR u.is_active IS NULL THEN NULL ELSE u.email END as email'),
        'u.is_active as doctor_is_active',
        'ast.name as status',
        'j.title as job_title',
        'j.created_at as job_created_at',
        // OPTİMİZASYON: Kullanılmayan iş ilanı alanları kaldırıldı
        // 'j.min_experience_years', 'j.employment_type', 'c.name as job_city', 's.name as specialty_name', 'j.status_id' kaldırıldı
        'js.name as job_status'
      );

    // İş ilanı ID filtresi - birden fazla job ID destekler (ÖNCE uygulanmalı)
    // GÜVENLİK: jobIds'lerin bu hastaneye ait olduğunu kontrol et
    // OPTİMİZASYON: Ekstra query yerine direkt WHERE ile kontrol et (JOIN zaten var)
    let validJobIds = null;
    if (jobIds) {
      // jobIds string veya array olabilir
      const jobIdArray = Array.isArray(jobIds) ? jobIds : (typeof jobIds === 'string' ? jobIds.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id)) : []);
      if (jobIdArray.length > 0) {
        // SQL Server için tek elemanlı array'lerde whereIn sorun çıkarabiliyor
        if (jobIdArray.length === 1) {
          query = query.where('j.id', jobIdArray[0]);
        } else {
          query = query.whereIn('j.id', jobIdArray);
        }
        validJobIds = jobIdArray; // totalQuery için sakla
      }
    }

    // Filtreler
    if (status) {
      // Status parametresi sayı mı kontrol et
      // Eğer sayı ise ast.id ile, değilse ast.name ile karşılaştır
      const statusNum = parseInt(status, 10);
      if (!isNaN(statusNum)) {
        // Sayı geldiğinde ID ile karşılaştır
        query = query.where('ast.id', statusNum);
      } else {
        // String geldiğinde name ile karşılaştır (geriye uyumluluk)
        query = query.where('ast.name', status);
      }
    }

    // Genel arama sorgusu
    if (search) {
      query = query.where(function() {
        // İsim ve soyisim ayrı ayrı kontrol
        this.where('dp.first_name', 'like', `%${search}%`)
          .orWhere('dp.last_name', 'like', `%${search}%`)
          // İsim ve soyisim birleşik kontrol (tam isim araması için) - SQL Server uyumlu, NULL-safe
          .orWhere(db.raw("ISNULL(dp.first_name, '') + ' ' + ISNULL(dp.last_name, '')"), 'like', `%${search}%`)
          // İş ilanı başlığı kontrolü
          .orWhere('j.title', 'like', `%${search}%`);
      });
    }

    // Doktor arama - sadece doktor adında
    if (doctor_search) {
      query = query.where(function() {
        // İsim ve soyisim ayrı ayrı kontrol
        this.where('dp.first_name', 'like', `%${doctor_search}%`)
          .orWhere('dp.last_name', 'like', `%${doctor_search}%`)
          // İsim ve soyisim birleşik kontrol (tam isim araması için) - SQL Server uyumlu, NULL-safe
          .orWhere(db.raw("ISNULL(dp.first_name, '') + ' ' + ISNULL(dp.last_name, '')"), 'like', `%${doctor_search}%`);
      });
    }

    // İş ilanı arama - sadece iş ilanı başlığında
    if (job_search) {
      query = query.where('j.title', 'like', `%${job_search}%`);
    }

    // Sayfalama
    const offset = (page - 1) * limit;
    
    // Toplam sayı - OPTİMİZASYON: Sadece count için minimal JOIN'ler
    // application_statuses JOIN'i kaldırıldı - sadece status_id'ye ihtiyacımız var (zaten applications tablosunda)
    const totalQuery = db('applications as a')
      .join('jobs as j', 'a.job_id', 'j.id')
      .where('j.hospital_id', hospitalProfile.id)
      .whereNull('a.deleted_at') // Soft delete: Silinmiş başvuruları gösterme
      .whereNull('j.deleted_at'); // Soft delete: Silinmiş iş ilanlarına ait başvuruları gösterme

    // Arama yapılıyorsa doctor_profiles JOIN'i gerekli
    if (search || doctor_search) {
      totalQuery.join('doctor_profiles as dp', 'a.doctor_profile_id', 'dp.id');
    }

    // İş ilanı ID filtresi - validJobIds varsa uygula
    if (validJobIds) {
      if (validJobIds.length === 1) {
        totalQuery.where('j.id', validJobIds[0]);
      } else {
        totalQuery.whereIn('j.id', validJobIds);
      }
    }

    // Status filtresi - OPTİMİZASYON: application_statuses JOIN'i yok, direkt status_id kullan
    if (status) {
      const statusNum = parseInt(status, 10);
      if (!isNaN(statusNum)) {
        totalQuery.where('a.status_id', statusNum);
      } else {
        // String geldiğinde application_statuses JOIN'i gerekli
        totalQuery.join('application_statuses as ast', 'a.status_id', 'ast.id');
        totalQuery.where('ast.name', status);
      }
    }

    // Genel arama sorgusu
    if (search) {
      totalQuery.where(function() {
        this.where('dp.first_name', 'like', `%${search}%`)
          .orWhere('dp.last_name', 'like', `%${search}%`)
          .orWhere(db.raw("ISNULL(dp.first_name, '') + ' ' + ISNULL(dp.last_name, '')"), 'like', `%${search}%`)
          .orWhere('j.title', 'like', `%${search}%`);
      });
    }

    // Doktor arama
    if (doctor_search) {
      totalQuery.where(function() {
        this.where('dp.first_name', 'like', `%${doctor_search}%`)
          .orWhere('dp.last_name', 'like', `%${doctor_search}%`)
          .orWhere(db.raw("ISNULL(dp.first_name, '') + ' ' + ISNULL(dp.last_name, '')"), 'like', `%${doctor_search}%`);
      });
    }

    // İş ilanı arama
    if (job_search) {
      totalQuery.where('j.title', 'like', `%${job_search}%`);
    }

    // OPTİMİZASYON: Applications ve count'u paralel çalıştır (daha hızlı)
    const [applications, countResult] = await Promise.all([
      query
        .orderBy('a.applied_at', 'desc')
        .limit(limit)
        .offset(offset),
      totalQuery.count('* as count').first()
    ]);
    
    const count = countResult?.count || 0;

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
      .join('application_statuses as ast', 'a.status_id', 'ast.id')
      .where({ 'a.id': applicationId, 'j.hospital_id': hospitalProfile.id })
      .select('a.*', 'j.title as job_title', 'j.hospital_id', 'ast.name as current_status')
      .first();

    if (!application) {
      throw new AppError('Başvuru bulunamadı veya yetkiniz yok', 404);
    }

    // Geri çekilen başvurular için durum değişikliği yapılamaz
    if (application.current_status === 'Geri Çekildi') {
      throw new AppError('Geri çekilen başvurular için durum değişikliği yapılamaz', 400);
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
        // Status ID'yi status string'ine çevir
        const statusMap = {
          1: 'pending',      // Beklemede
          2: 'pending',      // İnceleniyor
          3: 'accepted',     // Kabul Edildi
          4: 'rejected',     // Red Edildi
          5: 'withdrawn'     // Geri Çekildi
        };
        
        const statusString = statusMap[statusId] || 'pending';
        
        // Hastane adını al
        const hospitalInfo = await db('jobs as j')
          .join('hospital_profiles as hp', 'j.hospital_id', 'hp.id')
          .where('j.id', application.job_id)
          .select('hp.institution_name')
          .first();
        
        await notificationService.sendDoctorNotification(doctorUser.user_id, statusString, {
          application_id: applicationId,
          job_title: application.job_title,
          hospital_name: hospitalInfo?.institution_name || 'Hastane',
          notes: notes
        });
        
        logger.info(`Application status change notification sent to doctor ${doctorUser.user_id}`);
      }
    } catch (notificationError) {
      logger.warn('Application status change notification failed:', notificationError);
      // Bildirim hatası durum değişikliğini engellemez
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

    // Son başvuruları getir - Soft delete kontrolü ile (Geri çekilen başvurular dahil)
    const applications = await db('applications as a')
      .join('doctor_profiles as dp', 'a.doctor_profile_id', 'dp.id')
      .join('users as u', 'dp.user_id', 'u.id')
      .join('application_statuses as ast', 'a.status_id', 'ast.id')
      .join('jobs as j', 'a.job_id', 'j.id')
      .where('j.hospital_id', hospitalProfile.id)
      .whereNull('a.deleted_at') // Soft delete: Silinmiş başvuruları gösterme
      // NOT: Geri çekilen başvurular artık gösteriliyor
      .whereNull('j.deleted_at') // Soft delete: Silinmiş iş ilanlarına ait başvuruları gösterme
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
      .whereNull('j.deleted_at') // Silinmemiş ilanları getir
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
    const {
      page = 1,
      limit = 20,
      search,
      specialty,
      city,
      appliedOnly,
      applied_only
    } = params;

    const parsedLimit = parseInt(limit, 10);
    const safeLimit = Number.isNaN(parsedLimit) ? 20 : Math.min(Math.max(parsedLimit, 1), 100);
    const parsedPage = parseInt(page, 10);
    const safePage = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
    const offset = (safePage - 1) * safeLimit;

    const parseBooleanParam = (value) => {
      if (typeof value === 'boolean') return value;
      if (typeof value === 'number') return value === 1;
      if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
        if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
      }
      return false;
    };

    const showOnlyApplicants = parseBooleanParam(appliedOnly ?? applied_only ?? false);

    const isNumericFilter = (value) => {
      if (value === null || value === undefined) {
        return false;
      }

      if (typeof value === 'number') {
        return Number.isFinite(value);
      }

      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return false;
        return /^\d+$/.test(trimmed);
      }

      return false;
    };

    const normalizeText = (value) => {
      if (typeof value === 'string') {
        return value.trim();
      }
      return value;
    };

    // Hastane profilini kontrol et
    const hospitalProfile = await db('hospital_profiles')
      .where('user_id', hospitalUserId)
      .first();

    if (!hospitalProfile) {
      throw new AppError('Hastane profili bulunamadı', 404);
    }

    const buildFilterQuery = () => {
      let base = db('doctor_profiles as dp')
        .join('users as u', 'dp.user_id', 'u.id')
        .leftJoin('specialties as s', 'dp.specialty_id', 's.id')
        .leftJoin('subspecialties as ss', 'dp.subspecialty_id', 'ss.id')
        .leftJoin('cities as bp', 'dp.birth_place_id', 'bp.id')
        .leftJoin('cities as rc', 'dp.residence_city_id', 'rc.id')
        .where('u.is_approved', true)
        .where('u.is_active', true);

      if (showOnlyApplicants) {
        base = base.whereExists(function () {
          this.select(1)
            .from('applications as a')
            .join('jobs as j', 'a.job_id', 'j.id')
            .whereRaw('a.doctor_profile_id = dp.id')
            .where('j.hospital_id', hospitalProfile.id)
            .whereNull('a.deleted_at')
            .whereNull('j.deleted_at');
        });
      }

      const trimmedSearch = normalizeText(search);
      if (trimmedSearch) {
        base = base.where(function () {
          this.where('dp.first_name', 'like', `%${trimmedSearch}%`)
            .orWhere('dp.last_name', 'like', `%${trimmedSearch}%`)
            .orWhere('u.email', 'like', `%${trimmedSearch}%`);
        });
      }

      if (specialty) {
        if (isNumericFilter(specialty)) {
          base = base.where('dp.specialty_id', parseInt(specialty, 10));
        } else {
          const specialtyText = normalizeText(specialty);
          base = base.where(function () {
            this.where('s.name', 'like', `%${specialtyText}%`)
              .orWhere('ss.name', 'like', `%${specialtyText}%`);
          });
        }
      }

      if (city) {
        if (isNumericFilter(city)) {
          base = base.where('dp.residence_city_id', parseInt(city, 10));
        } else {
          const cityText = normalizeText(city);
          base = base.where('rc.name', 'like', `%${cityText}%`);
        }
      }

      return base;
    };

    const baseFilterQuery = buildFilterQuery();

    const totalResult = await baseFilterQuery
      .clone()
      .clearSelect()
      .countDistinct('dp.id as count');

    const total = parseInt(totalResult?.[0]?.count || 0, 10);

    const isMssql = db?.client?.config?.client === 'mssql';

    const doctorRowsQuery = baseFilterQuery
      .clone()
      .select(
        'dp.id',
        'dp.first_name',
        'dp.last_name',
        'dp.dob',
        'dp.birth_place_id',
        'dp.residence_city_id',
        'bp.name as birth_place_name',
        'rc.name as residence_city_name',
        'dp.phone',
        'dp.title',
        'dp.profile_photo',
        's.name as specialty_name',
        'ss.name as subspecialty_name',
        'u.email',
        'u.is_approved',
        'u.is_active',
        'u.created_at',
        'dp.created_at as created_at'
      )
      .orderBy('dp.created_at', 'desc');

    const doctorRowsRaw = isMssql
      ? await doctorRowsQuery
      : await doctorRowsQuery.offset(offset).limit(safeLimit);

    const doctorRows = isMssql
      ? doctorRowsRaw.slice(offset, offset + safeLimit)
      : doctorRowsRaw;

    let doctors = doctorRows.map((doctor) => ({
      ...doctor,
      specialties: doctor.specialty_name || null
    }));

    if (doctors.length > 0) {
      const doctorIds = doctors.map((doctor) => doctor.id);
      const appliedDoctors = await db('applications as a')
        .join('jobs as j', 'a.job_id', 'j.id')
        .whereIn('a.doctor_profile_id', doctorIds)
        .where('j.hospital_id', hospitalProfile.id)
        .whereNull('a.deleted_at')
        .whereNull('j.deleted_at')
        .distinct('a.doctor_profile_id');

      const appliedSet = new Set(appliedDoctors.map((row) => row.doctor_profile_id));

      doctors = doctors.map((doctor) => ({
        ...doctor,
        has_applied: appliedSet.has(doctor.id)
      }));
    }

    return {
      doctors,
      pagination: {
        page: safePage,
        limit: safeLimit,
        total,
        pages: total > 0 ? Math.ceil(total / safeLimit) : 0
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

    const doctorApplication = await db('applications as a')
      .join('jobs as j', 'a.job_id', 'j.id')
      .where('a.doctor_profile_id', doctorProfileId)
      .where('j.hospital_id', hospitalProfile.id)
      .whereNull('a.deleted_at')
      .whereNull('j.deleted_at')
      .first();

    const hasApplied = Boolean(doctorApplication);

    // Doktor için ek bilgileri getir - lookup tablolarıyla JOIN (Soft delete kontrolü ile)
    const educations = await db('doctor_educations as de')
      .leftJoin('doctor_education_types as det', 'de.education_type_id', 'det.id')
      .where('de.doctor_profile_id', doctorProfileId)
      .whereNull('de.deleted_at')
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
      .whereNull('dex.deleted_at')
      .select(
        'dex.*',
        's.name as specialty_name',
        'ss.name as subspecialty_name'
      )
      .orderBy('dex.start_date', 'desc');

    // Sertifika bilgilerini getir
    const certificates = await db('doctor_certificates as dc')
      .where('dc.doctor_profile_id', doctorProfileId)
      .whereNull('dc.deleted_at')
      .select('dc.*')
      .orderBy('dc.certificate_year', 'desc');

    // Dil bilgilerini getir - Dil ve seviye ile join
    const languages = await db('doctor_languages as dl')
      .join('languages as l', 'dl.language_id', 'l.id')
      .join('language_levels as ll', 'dl.level_id', 'll.id')
      .where('dl.doctor_profile_id', doctorProfileId)
      .whereNull('dl.deleted_at')
      .select(
        'dl.*',
        'l.name as language_name',
        'll.name as level_name'
      );

    return {
      profile: {
        ...doctorProfile,
        has_applied: hasApplied
      },
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

/**
 * Hesap kapatma (deactivate)
 * Kullanıcının hesabını pasif hale getirir ve refresh token'ları siler
 */
const getApplicationById = async (hospitalUserId, applicationId) => {
  try {
    const hospitalProfile = await db('hospital_profiles')
      .where('user_id', hospitalUserId)
      .first();

    if (!hospitalProfile) {
      throw new AppError('Hastane profili bulunamadı', 404);
    }

    // getAllApplications ile aynı JOIN sırası ve mantığı kullan
    const application = await db('applications as a')
      .join('doctor_profiles as dp', 'a.doctor_profile_id', 'dp.id')
      .join('users as u', 'dp.user_id', 'u.id')
      .join('application_statuses as ast', 'a.status_id', 'ast.id')
      .join('jobs as j', 'a.job_id', 'j.id')
      .leftJoin('job_statuses as js', 'j.status_id', 'js.id')
      .leftJoin('cities as c', 'j.city_id', 'c.id')
      .leftJoin('specialties as s', 'j.specialty_id', 's.id')
      .where('a.id', applicationId)
      .where('j.hospital_id', hospitalProfile.id)
      .whereNull('a.deleted_at') // Soft delete: Silinmiş başvuruları gösterme
      .whereNull('j.deleted_at') // Soft delete: Silinmiş iş ilanlarına ait başvuruları gösterme
      .select(
        'a.*',
        // Pasif doktorlar için bilgileri gizle (SQL Server bit tipi için güvenli kontrol)
        // Aktif edildiğinde (is_active = 1) bilgiler tekrar görünür olacak
        db.raw('CASE WHEN u.is_active = 0 OR u.is_active IS NULL THEN NULL ELSE dp.first_name END as first_name'),
        db.raw('CASE WHEN u.is_active = 0 OR u.is_active IS NULL THEN NULL ELSE dp.last_name END as last_name'),
        db.raw('CASE WHEN u.is_active = 0 OR u.is_active IS NULL THEN NULL ELSE dp.phone END as phone'),
        db.raw('CASE WHEN u.is_active = 0 OR u.is_active IS NULL THEN NULL ELSE dp.profile_photo END as profile_photo'),
        'dp.specialty_id',
        db.raw('CASE WHEN u.is_active = 0 OR u.is_active IS NULL THEN NULL ELSE u.email END as email'),
        'u.is_active as doctor_is_active',
        'ast.name as status',
        'j.title as job_title',
        'j.id as job_id',
        'j.min_experience_years',
        'j.employment_type',
        'j.created_at as job_created_at',
        'c.name as job_city',
        's.name as specialty_name',
        'j.status_id as job_status_id',
        'js.name as job_status'
      )
      .first();

    if (!application) {
      logger.warn(`Application not found: applicationId=${applicationId}, hospitalProfileId=${hospitalProfile.id}, hospitalUserId=${hospitalUserId}`);
      throw new AppError('Başvuru bulunamadı', 404);
    }
    
    logger.debug(`Application found: applicationId=${applicationId}, jobId=${application.job_id}, doctorProfileId=${application.doctor_profile_id}`);

    // job_status fallback ekle (getAllApplications ile tutarlılık için)
    if (!application.job_status && application.job_status_id) {
      const statusMap = {
        1: 'Onay Bekliyor',
        2: 'Revizyon Gerekli',
        3: 'Onaylandı',
        4: 'Pasif',
        5: 'Reddedildi'
      };
      application.job_status_fallback = statusMap[application.job_status_id] || 'Bilinmiyor';
    }

    return application;
  } catch (error) {
    logger.error('Get hospital application by id error:', error);
    throw error;
  }
};

const deactivateAccount = async (userId) => {
  try {
    await db.transaction(async (trx) => {
      const user = await trx('users').where('id', userId).first();
      if (!user) {
        throw new AppError('Kullanıcı bulunamadı', 404);
      }

      if (user.is_active === false) {
        throw new AppError('Hesabınız zaten pasif durumda', 400);
      }

      await trx('users')
        .where('id', userId)
        .update({
          is_active: false,
          updated_at: trx.fn.now()
        });

      await trx('refresh_tokens').where('user_id', userId).del();
    });

    return true;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    logger.error('Hospital account deactivate error:', error);
    throw new AppError('Hesap kapatılamadı', 500);
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
  
  
  // İş ilanı yönetimi (jobService'den taşındı)
  getJobs,
  getJobById,
  createJob,
  updateJob,
  resubmitJob,
  updateJobStatus,
  
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
  getDoctorProfileDetail,
  getApplicationById,
  
  // Hesap yönetimi
  deactivateAccount
};
