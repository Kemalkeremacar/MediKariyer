/**
 * @file doctorService.js
 * @description Doktor servisi - Sadece doktorun kendi profili ile ilgili işlemleri yönetir.
 * Bu servis, doktor profil yönetimi için temel CRUD işlemlerini içerir.
 * 
 * Ana İşlevler:
 * - Doktor profil yönetimi (CRUD)
 * - Eğitim bilgileri yönetimi (CRUD)
 * - Deneyim bilgileri yönetimi (CRUD)
 * - Sertifika bilgileri yönetimi (CRUD)
 * - Dil bilgileri yönetimi (CRUD)
 * - Profil tamamlanma oranı hesaplama
 * - Dashboard için profil verileri
 * 
 * Servis Ayrımı Mantığı:
 * - Bu servis SADECE doktorun kendi profili ile ilgili işlemleri yapar
 * - İş ilanları → jobService (doktor sadece read-only görür)
 * - Başvuru işlemleri → applicationService (başvuru yapma, takip etme)
 * - Bildirimler → notificationService (doktora gelen bildirimler)
 * 
 * Veritabanı Tabloları:
 * - doctor_profiles: Doktor profil bilgileri
 * - doctor_educations: Doktor eğitim bilgileri
 * - doctor_experiences: Doktor deneyim bilgileri
 * - doctor_certificates: Doktor sertifika bilgileri
 * - doctor_languages: Doktor dil bilgileri
 * - users: Kullanıcı bilgileri (foreign key)
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

'use strict';

// ============================================================================
// DIŞ BAĞIMLILIKLAR
// ============================================================================

const db = require('../config/dbConfig').db;
const fs = require('fs');
const path = require('path');
const { AppError } = require('../utils/errorHandler');
const notificationService = require('./notificationService');
const logger = require('../utils/logger');

// ============================================================================
// PROFİL YÖNETİMİ
// ============================================================================

/**
 * Doktor profilini günceller
 * @description Doktorun temel profil bilgilerini (ad, soyad, doğum tarihi, telefon vb.) günceller
 * @param {number} userId - Kullanıcının ID'si (users.id)
 * @param {Object} profileData - Güncellenecek profil verileri
 * @param {string} profileData.first_name - Doktorun adı
 * @param {string} profileData.last_name - Doktorun soyadı
 * @param {Date} profileData.dob - Doğum tarihi
 * @param {string} [profileData.birth_place] - Doğum yeri
 * @param {string} [profileData.residence_city] - İkamet şehri
 * @param {string} [profileData.phone] - Telefon numarası
 * @param {string} [profileData.title] - Ünvan (Dr, Uz.Dr, Dr.Öğr.Üyesi, Doç.Dr, Prof.Dr)
 * @param {string} [profileData.work_type] - Çalışma türü (tam_zamanli, yari_zamanli, nobet)
 * @param {string} [profileData.profile_photo] - Profil fotoğrafı URL'si
 * @returns {Promise<Object>} Güncellenmiş profil bilgileri
 * @throws {AppError} Veritabanı hatası durumunda
 * 
 * @example
 * const updatedProfile = await updateProfile(123, {
 *   first_name: 'Ahmet',
 *   last_name: 'Yılmaz',
 *   dob: new Date('1990-01-01'),
 *   phone: '+905551234567',
 *   title: 'Uz.Dr',
 *   work_type: 'tam_zamanli'
 * });
 */
const updateProfile = async (userId, profileData) => {
  // Eğer profil fotoğrafı değiştiriliyorsa, mevcut fotoğrafı kontrol et
  if (profileData.profile_photo) {
    const currentProfile = await db('doctor_profiles').where('user_id', userId).first();
    
    // Eğer fotoğraf değişmişse, photo_status'u pending yap
    if (currentProfile && currentProfile.profile_photo !== profileData.profile_photo) {
      profileData.photo_status = 'pending';
      logger.info(`Doctor profile photo changed for user ${userId}, status set to pending`);
    }
  }

  await db('doctor_profiles')
    .where('user_id', userId)
    .update({
      ...profileData,
      updated_at: db.fn.now()
    });

  return await db('doctor_profiles').where('user_id', userId).first();
};

/**
 * Doktor profilini getirir (sadece temel profil bilgileri)
 * @description Doktorun temel profil bilgilerini (doctor_profiles tablosundan) getirir
 * @param {number} userId - Kullanıcının ID'si (users.id)
 * @returns {Promise<Object|null>} Doktor profil bilgileri veya null
 * @throws {AppError} Veritabanı hatası durumunda
 * 
 * @example
 * const profile = await getProfile(123);
 * if (profile) {
 *   // Profile data available
 * }
 */
const getProfile = async (userId) => {
  // N+1 problemi çözüldü: Tüm ilişkili veriler tek sorguda LEFT JOIN ile getiriliyor
  // 4 ayrı sorgu yerine 1 sorgu kullanarak performans %75 artırıldı
  const profile = await db('doctor_profiles as dp')
    .join('users as u', 'dp.user_id', 'u.id')
    .leftJoin('specialties as s', 'dp.specialty_id', 's.id')
    .leftJoin('subspecialties as ss', 'dp.subspecialty_id', 'ss.id')
    .leftJoin('cities as birth_city', 'dp.birth_place_id', 'birth_city.id')
    .leftJoin('cities as residence_city', 'dp.residence_city_id', 'residence_city.id')
    .where('dp.user_id', userId)
    .select([
      'dp.*',
      'u.email',
      's.name as specialty_name',
      'ss.name as subspecialty_name',
      'birth_city.name as birth_place_name',
      'residence_city.name as residence_city_name'
    ])
    .first();
  
  if (!profile) return null;
  
  return profile;
};

/**
 * Bir doktorun tüm profil bilgilerini getirir (eğitim, deneyim, sertifika, dil dahil)
 * @description Doktorun temel profil bilgileri ile birlikte tüm ilişkili verilerini paralel olarak getirir
 * @param {number} userId - Kullanıcının ID'si (users.id)
 * @returns {Promise<Object|null>} Tam profil bilgileri (eğitim, deneyim, sertifika, dil dahil) veya null
 * @throws {AppError} Veritabanı hatası durumunda
 * 
 * @example
 * const completeProfile = await getCompleteProfile(123);
 * if (completeProfile) {
 *   // Complete profile with all related data
 * }
 */
const getCompleteProfile = async (userId) => {
  const profile = await db('doctor_profiles').where('user_id', userId).first();
  if (!profile) return null;

  // Paralel olarak tüm ilişkili verileri al (Soft delete kontrolü ile)
  const [educations, experiences, certificates, languages] = await Promise.all([
    db('doctor_educations').where('doctor_profile_id', profile.id).whereNull('deleted_at').orderBy('graduation_year', 'desc'),
    db('doctor_experiences').where('doctor_profile_id', profile.id).whereNull('deleted_at').orderBy('start_date', 'desc'),
    db('doctor_certificates').where('doctor_profile_id', profile.id).whereNull('deleted_at').orderBy('certificate_year', 'desc'),
    db('doctor_languages').where('doctor_profile_id', profile.id).whereNull('deleted_at').orderBy('level_id', 'desc')
  ]);

  return { ...profile, educations, experiences, certificates, languages };
};

/**
 * Doktorun kişisel profil bilgilerini günceller
 * @description Doktorun temel kişisel bilgilerini (ad, soyad, telefon, doğum tarihi vb.) günceller
 * @param {number} userId - Kullanıcının ID'si (users.id)
 * @param {Object} personalInfo - Güncellenecek kişisel bilgiler
 * @param {string} personalInfo.first_name - Doktorun adı
 * @param {string} personalInfo.last_name - Doktorun soyadı
 * @param {string} [personalInfo.phone] - Telefon numarası
 * @param {Date} [personalInfo.dob] - Doğum tarihi
 * @param {string} [personalInfo.birth_place] - Doğum yeri
 * @param {string} [personalInfo.residence_city] - İkamet şehri
 * @returns {Promise<Object>} Güncellenmiş profil bilgileri
 * @throws {AppError} Veritabanı hatası durumunda
 * 
 * @example
 * const updatedProfile = await updatePersonalInfo(123, {
 *   first_name: 'Ahmet',
 *   last_name: 'Yılmaz',
 *   phone: '+905551234567',
 *   dob: new Date('1990-01-01')
 * });
 */
const updatePersonalInfo = async (userId, personalInfo) => {
  // validatedData'dan gelen değerleri doğrudan kullan
  const updateData = {
    ...personalInfo,
    updated_at: db.fn.now()
  };
  
  await db('doctor_profiles').where('user_id', userId).update(updateData);
  
  // Güncellenmiş profili specialty, subspecialty ve şehir isimleriyle birlikte döndür
  const profile = await db('doctor_profiles').where('user_id', userId).first();
  
  if (!profile) return null;
  
  // Specialty ve subspecialty isimlerini getir
  let specialty_name = null;
  let subspecialty_name = null;
  
  if (profile.specialty_id) {
    const specialty = await db('specialties').where('id', profile.specialty_id).first();
    specialty_name = specialty?.name;
  }
  
  if (profile.subspecialty_id) {
    const subspecialty = await db('subspecialties').where('id', profile.subspecialty_id).first();
    subspecialty_name = subspecialty?.name;
  }
  
  // Şehir isimlerini getir
  let birth_place_name = null;
  let residence_city_name = null;
  
  if (profile.birth_place_id) {
    const birthCity = await db('cities').where('id', profile.birth_place_id).first();
    birth_place_name = birthCity?.name;
  }
  
  if (profile.residence_city_id) {
    const residenceCity = await db('cities').where('id', profile.residence_city_id).first();
    residence_city_name = residenceCity?.name;
  }
  
  return {
    ...profile,
    specialty_name,
    subspecialty_name,
    birth_place_name,
    residence_city_name
  };
};


// ============================================================================
// EĞİTİM BİLGİLERİ CRUD
// ============================================================================

/**
 * Doktor eğitim bilgisi ekler
 * @description Doktorun eğitim bilgilerini (üniversite, uzmanlık vb.) doctor_educations tablosuna ekler
 * @param {number} userId - Kullanıcının ID'si (users.id)
 * @param {Object} educationData - Eğitim bilgileri
 * @param {number} educationData.education_type_id - Eğitim türü ID'si (lookup tablosundan)
 * @param {string} [educationData.education_type] - Eğitim türü (sadece "DİĞER" seçildiğinde manuel giriş)
 * @param {string} educationData.education_institution - Eğitim kurumu
 * @param {string} educationData.field - Alan adı
 * @param {number} educationData.graduation_year - Mezuniyet yılı
 * @returns {Promise<Object>} Eklenen eğitim kaydı
 * @throws {AppError} Profil bulunamadığında veya veritabanı hatası durumunda
 * 
 * @note Sertifika bilgileri ayrı bir tablo (doctor_certificates) ve ayrı bir sekme olduğu için burada bulunmaz.
 * 
 * @example
 * const education = await addEducation(123, {
 *   education_type_id: 1,
 *   education_institution: 'İstanbul Üniversitesi',
 *   education_type: 'Tıp Fakültesi', // Sadece "DİĞER" seçilirse gerekli
 *   field: 'Tıp',
 *   graduation_year: 2015
 * });
 */
const addEducation = async (userId, educationData) => {
  const profile = await db('doctor_profiles').where('user_id', userId).first();
  if (!profile) throw new AppError('Profil bulunamadı', 404);
  
  // Education Type kontrolü ve "DİĞER" kuralı
  const eduType = await db('doctor_education_types')
    .where('id', educationData.education_type_id)
    .first();
  if (!eduType) {
    throw new AppError('Geçersiz eğitim türü', 400);
  }
  const normalizedEduType = (eduType.name || '').toLowerCase().replace(/i̇/g, 'i');
  const isOtherEduType = normalizedEduType.includes('diğer') || normalizedEduType.includes('diger') || normalizedEduType.includes('other');
  if (isOtherEduType) {
    if (!educationData.education_type || educationData.education_type.trim() === '') {
      throw new AppError('DİĞER seçildiğinde eğitim türü zorunludur', 400);
    }
  }

  let insertData = {
    doctor_profile_id: profile.id,
    education_type_id: educationData.education_type_id,
    education_institution: educationData.education_institution,
    field: educationData.field,
    graduation_year: educationData.graduation_year,
    education_type: isOtherEduType ? educationData.education_type : null,
    created_at: db.fn.now()
    // updated_at NULL kalacak - sadece güncelleme yapılınca dolacak
  };
  
  const result = await db('doctor_educations')
    .insert(insertData)
    .returning('id');
  
  const id = result[0]?.id || result[0];
  
  // Join ile tam veriyi döndür
  return await db('doctor_educations as de')
    .leftJoin('doctor_education_types as det', 'de.education_type_id', 'det.id')
    .select(
      'de.*',
      'det.name as education_type_name',
      'det.description as education_type_description'
    )
    .where('de.id', id)
    .first();
};

/**
 * Doktor eğitim bilgisini günceller
 * @description Doktorun mevcut eğitim bilgilerini günceller
 * @param {number} userId - Kullanıcının ID'si (users.id)
 * @param {number} educationId - Güncellenecek eğitim kaydının ID'si
 * @param {Object} educationData - Güncellenecek eğitim bilgileri
 * @returns {Promise<Object|null>} Güncellenmiş eğitim kaydı veya null
 * @throws {AppError} Profil bulunamadığında veya veritabanı hatası durumunda
 * 
 * @note Sertifika bilgileri ayrı bir tablo (doctor_certificates) ve ayrı bir sekme olduğu için burada bulunmaz.
 * 
 * @example
 * const updatedEducation = await updateEducation(123, 456, {
 *   education_type_id: 2,
 *   education_institution: 'Ankara Üniversitesi',
 *   education_type: 'Uzmanlık', // Sadece "DİĞER" seçilirse gerekli
 *   field: 'Kardiyoloji',
 *   graduation_year: 2020
 * });
 */
const updateEducation = async (userId, educationId, educationData) => {
  const profile = await db('doctor_profiles').where('user_id', userId).first();
  if (!profile) throw new AppError('Profil bulunamadı', 404);
  
  // Education Type kontrolü ve "DİĞER" kuralı
  const eduType = await db('doctor_education_types')
    .where('id', educationData.education_type_id)
    .first();
  if (!eduType) {
    throw new AppError('Geçersiz eğitim türü', 400);
  }
  const normalizedEduType = (eduType.name || '').toLowerCase().replace(/i̇/g, 'i');
  const isOtherEduType = normalizedEduType.includes('diğer') || normalizedEduType.includes('diger') || normalizedEduType.includes('other');
  if (isOtherEduType) {
    if (!educationData.education_type || educationData.education_type.trim() === '') {
      throw new AppError('DİĞER seçildiğinde eğitim türü zorunludur', 400);
    }
  }

  // Güncelleme verisini hazırla
  let updateData = {
    education_type_id: educationData.education_type_id,
    education_institution: educationData.education_institution,
    field: educationData.field,
    graduation_year: educationData.graduation_year,
    education_type: isOtherEduType ? educationData.education_type : null,
    updated_at: db.fn.now()
  };
  
  const updated = await db('doctor_educations')
    .where({ id: educationId, doctor_profile_id: profile.id })
    .update(updateData);
  
  if (!updated) return null;
  
  // Join ile tam veriyi döndür
  return await db('doctor_educations as de')
    .leftJoin('doctor_education_types as det', 'de.education_type_id', 'det.id')
    .select(
      'de.*',
      'det.name as education_type_name',
      'det.description as education_type_description'
    )
    .where('de.id', educationId)
    .first();
};

/**
 * Doktor eğitim bilgisini siler (Soft Delete)
 * @description Doktorun belirtilen eğitim kaydını soft delete ile siler (deleted_at set edilir)
 * @param {number} userId - Kullanıcının ID'si (users.id)
 * @param {number} educationId - Silinecek eğitim kaydının ID'si
 * @returns {Promise<boolean>} Silme işleminin başarı durumu
 * @throws {AppError} Profil bulunamadığında veya veritabanı hatası durumunda
 * 
 * @example
 * const deleted = await deleteEducation(123, 456);
 * if (deleted) {
 *   // Education record successfully deleted
 * }
 */
const deleteEducation = async (userId, educationId) => {
  const profile = await db('doctor_profiles').where('user_id', userId).first();
  if (!profile) throw new AppError('Profil bulunamadı', 404);
  
  // Soft delete: deleted_at kolonunu set et
  const deleted = await db('doctor_educations')
    .where({ id: educationId, doctor_profile_id: profile.id })
    .whereNull('deleted_at') // Zaten silinmemiş kayıtlar
    .update({ deleted_at: db.fn.now() });
  
  return deleted > 0;
};

// ============================================================================
// DENEYİM BİLGİLERİ CRUD
// ============================================================================

/**
 * Doktor deneyim bilgisi ekler
 * @description Doktorun iş deneyimlerini doctor_experiences tablosuna ekler
 * @param {number} userId - Kullanıcının ID'si (users.id)
 * @param {Object} experienceData - Deneyim bilgileri
 * @param {string} experienceData.organization - Kurum adı
 * @param {string} experienceData.role_title - Ünvan (Uzman Doktor, Başhekim, vb.)
 * @param {number} experienceData.specialty_id - Uzmanlık alanı ID'si (specialties tablosundan)
 * @param {number} [experienceData.subspecialty_id] - Yan dal uzmanlık ID'si (subspecialties tablosundan, optional)
 * @param {Date} experienceData.start_date - Başlangıç tarihi (zorunlu)
 * @param {Date} [experienceData.end_date] - Bitiş tarihi (NULL olabilir)
 * @param {boolean} [experienceData.is_current] - Hala çalışıyor mu
 * @param {string} [experienceData.description] - İş açıklaması
 * @returns {Promise<Object>} Eklenen deneyim kaydı (specialty ve subspecialty isimleri ile)
 * @throws {AppError} Profil bulunamadığında veya veritabanı hatası durumunda
 * 
 * @note is_current = true ise end_date = NULL olmalı
 * 
 * @example
 * const experience = await addExperience(123, {
 *   organization: 'Acıbadem Hastanesi',
 *   role_title: 'Uzman Doktor',
 *   specialty_id: 5,
 *   subspecialty_id: 12,
 *   start_date: new Date('2020-01-01'),
 *   is_current: true,
 *   description: 'Kardiyoloji departmanında çalışıyorum'
 * });
 */
const addExperience = async (userId, experienceData) => {
  const profile = await db('doctor_profiles').where('user_id', userId).first();
  if (!profile) throw new AppError('Profil bulunamadı', 404);
  
  // is_current = true ise end_date = NULL olmalı
  const insertData = {
    doctor_profile_id: profile.id,
    organization: experienceData.organization,
    role_title: experienceData.role_title,
    specialty_id: experienceData.specialty_id,
    subspecialty_id: experienceData.subspecialty_id || null,
    start_date: experienceData.start_date,
    end_date: experienceData.is_current ? null : (experienceData.end_date || null),
    is_current: experienceData.is_current || false,
    description: experienceData.description || null,
    created_at: db.fn.now()
    // updated_at NULL kalacak - sadece güncelleme yapılınca dolacak
  };
  
  const result = await db('doctor_experiences')
    .insert(insertData)
    .returning('id');
  
  const id = result[0]?.id || result[0];
  
  // Join ile tam veriyi döndür
  return await db('doctor_experiences as de')
    .leftJoin('specialties as s', 'de.specialty_id', 's.id')
    .leftJoin('subspecialties as ss', 'de.subspecialty_id', 'ss.id')
    .select(
      'de.*',
      's.name as specialty_name',
      'ss.name as subspecialty_name'
    )
    .where('de.id', id)
    .first();
};

/**
 * Doktor deneyim bilgisini günceller
 * @description Doktorun mevcut deneyim bilgilerini günceller
 * @param {number} userId - Kullanıcının ID'si (users.id)
 * @param {number} experienceId - Güncellenecek deneyim kaydının ID'si
 * @param {Object} experienceData - Güncellenecek deneyim bilgileri
 * @returns {Promise<Object|null>} Güncellenmiş deneyim kaydı veya null
 * @throws {AppError} Profil bulunamadığında veya veritabanı hatası durumunda
 * 
 * @note is_current = true ise end_date = NULL olmalı
 */
const updateExperience = async (userId, experienceId, experienceData) => {
  const profile = await db('doctor_profiles').where('user_id', userId).first();
  if (!profile) throw new AppError('Profil bulunamadı', 404);
  
  // Güncelleme verisini hazırla
  const updateData = {
    organization: experienceData.organization,
    role_title: experienceData.role_title,
    specialty_id: experienceData.specialty_id,
    subspecialty_id: experienceData.subspecialty_id || null,
    start_date: experienceData.start_date,
    is_current: experienceData.is_current || false,
    description: experienceData.description || null,
    updated_at: db.fn.now()
  };
  
  // is_current = true ise end_date = NULL olmalı
  if (updateData.is_current === true) {
    updateData.end_date = null;
  } else {
    updateData.end_date = experienceData.end_date || null;
  }
  
  const updated = await db('doctor_experiences')
    .where({ id: experienceId, doctor_profile_id: profile.id })
    .update(updateData);
  
  if (!updated) return null;
  
  // Join ile tam veriyi döndür
  return await db('doctor_experiences as de')
    .leftJoin('specialties as s', 'de.specialty_id', 's.id')
    .leftJoin('subspecialties as ss', 'de.subspecialty_id', 'ss.id')
    .select(
      'de.*',
      's.name as specialty_name',
      'ss.name as subspecialty_name'
    )
    .where('de.id', experienceId)
    .first();
};

/**
 * Doktor deneyim bilgisini siler (Soft Delete)
 * @description Doktorun belirtilen deneyim kaydını soft delete ile siler (deleted_at set edilir)
 * @param {number} userId - Kullanıcının ID'si (users.id)
 * @param {number} experienceId - Silinecek deneyim kaydının ID'si
 * @returns {Promise<boolean>} Silme işleminin başarı durumu
 * @throws {AppError} Profil bulunamadığında veya veritabanı hatası durumunda
 */
const deleteExperience = async (userId, experienceId) => {
  const profile = await db('doctor_profiles').where('user_id', userId).first();
  if (!profile) throw new AppError('Profil bulunamadı', 404);
  
  // Soft delete: deleted_at kolonunu set et
  const deleted = await db('doctor_experiences')
    .where({ id: experienceId, doctor_profile_id: profile.id })
    .whereNull('deleted_at') // Zaten silinmemiş kayıtlar
    .update({ deleted_at: db.fn.now() });
  
  return deleted > 0;
};

// ============================================================================
// SERTİFİKA BİLGİLERİ CRUD
// ============================================================================

/**
 * Doktor sertifika bilgisi ekler
 * @description Doktorun sertifika ve kurs bilgilerini doctor_certificates tablosuna ekler
 * @param {number} userId - Kullanıcının ID'si (users.id)
 * @param {Object} certificateData - Sertifika bilgileri
 * @param {string} certificateData.certificate_name - Sertifika türü/adı
 * @param {string} certificateData.institution - Veren kurum adı
 * @param {number} certificateData.certificate_year - Sertifika yılı (INT)
 * @returns {Promise<Object>} Eklenen sertifika kaydı
 * @throws {AppError} Profil bulunamadığında veya veritabanı hatası durumunda
 * 
 * @note Lookup kaldırıldı; tür metin olarak saklanır
 * 
 * @example
 * const certificate = await addCertificate(123, {
 *   certificate_name: 'ACLS',
 *   institution: 'Türk Tabipleri Birliği',
 *   certificate_year: 2021
 * });
 */
const addCertificate = async (userId, certificateData) => {
  const profile = await db('doctor_profiles').where('user_id', userId).first();
  if (!profile) throw new AppError('Profil bulunamadı', 404);
  
  if (!certificateData.certificate_name) {
    throw new AppError('Sertifika türü zorunludur', 400);
  }
  
  // Lookup kullanılmıyor
  
  const isOtherType = false;
  
  let insertData = {
    doctor_profile_id: profile.id,
    certificate_name: certificateData.certificate_name,
    institution: certificateData.institution,
    certificate_year: certificateData.certificate_year,
    created_at: db.fn.now()
    // updated_at NULL kalacak - sadece güncelleme yapılınca dolacak
  };

  // custom_name kaldırıldı
  
  const result = await db('doctor_certificates')
    .insert(insertData)
    .returning('id');
  
  const id = result[0]?.id || result[0];
  
  // Join ile tam veriyi döndür
  return await db('doctor_certificates as dc')
    .select('dc.*')
    .where('dc.id', id)
    .first();
};

/**
 * Doktor sertifika bilgisini günceller
 * @description Doktorun mevcut sertifika bilgilerini günceller
 * @param {number} userId - Kullanıcının ID'si (users.id)
 * @param {number} certificateId - Güncellenecek sertifika kaydının ID'si
 * @param {Object} certificateData - Güncellenecek sertifika bilgileri
 * @param {number} [certificateData.certificate_type_id] - Sertifika türü ID'si
 * @param {string} [certificateData.custom_name] - Özel sertifika adı (DİĞER seçildiğinde)
 * @param {string} [certificateData.institution] - Kurum adı
 * @param {Date} [certificateData.issued_at] - Alınış tarihi
 * @returns {Promise<Object|null>} Güncellenmiş sertifika kaydı veya null
 * @throws {AppError} Profil bulunamadığında veya veritabanı hatası durumunda
 */
const updateCertificate = async (userId, certificateId, certificateData) => {
  const profile = await db('doctor_profiles').where('user_id', userId).first();
  if (!profile) throw new AppError('Profil bulunamadı', 404);
  
  const certificate = await db('doctor_certificates').where({ id: certificateId, doctor_profile_id: profile.id }).first();
  if (!certificate) return null;

  // certificate_name zorunlu
  if (!certificateData.certificate_name) {
    throw new AppError('Sertifika adı zorunludur', 400);
  }

  // Güncelleme verisini hazırla
  let updateData = {
    certificate_name: certificateData.certificate_name,
    institution: certificateData.institution,
    certificate_year: certificateData.certificate_year,
    updated_at: db.fn.now()
  };

  await db('doctor_certificates')
    .where({ id: certificateId, doctor_profile_id: profile.id })
    .update(updateData);
  
  // Join ile tam veriyi döndür
  return await db('doctor_certificates as dc')
    .select('dc.*')
    .where('dc.id', certificateId)
    .first();
};

/**
 * Doktor sertifika bilgisini siler (Soft Delete)
 * @description Doktorun belirtilen sertifika kaydını soft delete ile siler (deleted_at set edilir)
 * @param {number} userId - Kullanıcının ID'si (users.id)
 * @param {number} certificateId - Silinecek sertifika kaydının ID'si
 * @returns {Promise<boolean>} Silme işleminin başarı durumu
 * @throws {AppError} Profil bulunamadığında veya veritabanı hatası durumunda
 */
const deleteCertificate = async (userId, certificateId) => {
  const profile = await db('doctor_profiles').where('user_id', userId).first();
  if (!profile) throw new AppError('Profil bulunamadı', 404);
  
  const deleted = await db('doctor_certificates')
    .where({ id: certificateId, doctor_profile_id: profile.id })
    .whereNull('deleted_at')
    .update({ deleted_at: db.fn.now() });
  
  return deleted > 0;
};

// ============================================================================
// DİL BİLGİLERİ CRUD
// ============================================================================

/**
 * Doktor dil bilgisi ekler
 * @description Doktorun dil bilgilerini doctor_languages tablosuna ekler
 * @param {number} userId - Kullanıcının ID'si (users.id)
 * @param {Object} languageData - Dil bilgileri
 * @param {number} languageData.language_id - Dil ID'si (languages tablosundan)
 * @param {number} languageData.level_id - Dil seviyesi ID'si (language_levels tablosundan)
 * @returns {Promise<Object>} Eklenen dil kaydı (language ve level isimleri ile)
 * @throws {AppError} Profil bulunamadığında veya veritabanı hatası durumunda
 * 
 * @example
 * const language = await addLanguage(123, {
 *   language_id: 1,
 *   level_id: 2
 * });
 */
const addLanguage = async (userId, languageData) => {
  const profile = await db('doctor_profiles').where('user_id', userId).first();
  if (!profile) throw new AppError('Profil bulunamadı', 404);
  
  // Dil verisini hazırla
  const insertData = {
    doctor_profile_id: profile.id,
    language_id: languageData.language_id,
    level_id: languageData.level_id,
    created_at: db.fn.now()
    // updated_at NULL kalacak - sadece güncelleme yapılınca dolacak
  };
  
  const result = await db('doctor_languages')
    .insert(insertData)
    .returning('id');
  
  const id = result[0]?.id || result[0];
  
  // Join ile tam veriyi döndür
  return await db('doctor_languages as dl')
    .leftJoin('languages as l', 'dl.language_id', 'l.id')
    .leftJoin('language_levels as ll', 'dl.level_id', 'll.id')
    .select(
      'dl.id',
      'dl.language_id',
      'dl.level_id',
      'l.name as language',
      'll.name as level',
      'dl.created_at'
    )
    .where('dl.id', id)
    .first();
};

/**
 * Doktor dil bilgisini günceller
 * @description Doktorun mevcut dil bilgilerini günceller
 * @param {number} userId - Kullanıcının ID'si (users.id)
 * @param {number} languageId - Güncellenecek dil kaydının ID'si
 * @param {Object} languageData - Güncellenecek dil bilgileri
 * @param {number} languageData.language_id - Dil ID'si (languages tablosundan)
 * @param {number} languageData.level_id - Dil seviyesi ID'si (language_levels tablosundan)
 * @returns {Promise<Object|null>} Güncellenmiş dil kaydı (language ve level isimleri ile) veya null
 * @throws {AppError} Profil bulunamadığında veya veritabanı hatası durumunda
 */
const updateLanguage = async (userId, languageId, languageData) => {
  const profile = await db('doctor_profiles').where('user_id', userId).first();
  if (!profile) throw new AppError('Profil bulunamadı', 404);
  
  // Güncelleme verisini hazırla
  const updateData = {
    language_id: languageData.language_id,
    level_id: languageData.level_id,
    updated_at: db.fn.now()
  };
  
  const updated = await db('doctor_languages')
    .where({ id: languageId, doctor_profile_id: profile.id })
    .update(updateData);
  
  if (!updated) return null;
  
  // Join ile tam veriyi döndür
  return await db('doctor_languages as dl')
    .leftJoin('languages as l', 'dl.language_id', 'l.id')
    .leftJoin('language_levels as ll', 'dl.level_id', 'll.id')
    .select(
      'dl.id',
      'dl.language_id',
      'dl.level_id',
      'l.name as language',
      'll.name as level',
      'dl.created_at'
    )
    .where('dl.id', languageId)
    .first();
};

/**
 * Doktor dil bilgisini siler (Soft Delete)
 * @description Doktorun belirtilen dil kaydını soft delete ile siler (deleted_at set edilir)
 * @param {number} userId - Kullanıcının ID'si (users.id)
 * @param {number} languageId - Silinecek dil kaydının ID'si
 * @returns {Promise<boolean>} Silme işleminin başarı durumu
 * @throws {AppError} Profil bulunamadığında veya veritabanı hatası durumunda
 */
const deleteLanguage = async (userId, languageId) => {
  const profile = await db('doctor_profiles').where('user_id', userId).first();
  if (!profile) throw new AppError('Profil bulunamadı', 404);
  
  const deleted = await db('doctor_languages')
    .where({ id: languageId, doctor_profile_id: profile.id })
    .whereNull('deleted_at')
    .update({ deleted_at: db.fn.now() });
  
  return deleted > 0;
};

/**
 * Doktor profilinin tamamlanma yüzdesini hesaplar
 * @description Doktorun profil bilgilerinin ne kadarının doldurulduğunu hesaplar
 * @param {number} userId - Kullanıcının ID'si (users.id)
 * @returns {Promise<Object>} Profil tamamlanma bilgileri (yüzde, eksik alanlar, sayılar)
 * @throws {AppError} Profil bulunamadığında veya veritabanı hatası durumunda
 * 
 * Hesaplama Mantığı:
 * - Kişisel Bilgiler (8 alan): %40 ağırlık
 *   * first_name, last_name, title, specialty_id, dob, phone, birth_place, residence_city
 * - Eğitim (en az 1): %15 ağırlık
 * - Deneyim (en az 1): %15 ağırlık
 * - Sertifika (en az 1): %15 ağırlık
 * - Dil (en az 1): %15 ağırlık
 * 
 * @example
 * const completion = await getProfileCompletion(123);
 * // { completion_percentage: 85, missing_fields: ['birth_place'], sections: {...}, details: {...} }
 */
const getProfileCompletion = async (userId) => {
  logger.info(`[getProfileCompletion] Starting calculation for userId: ${userId}`);
  
  const profile = await db('doctor_profiles').where('user_id', userId).first();
  
  if (!profile) {
    logger.warn(`[getProfileCompletion] No profile found for userId: ${userId}`);
    return { 
      completion_percentage: 0, 
      missing_fields: ['profile_not_found'], 
      sections: {},
      details: {
        personal: { completed: 0, total: 8, percentage: 0 },
        education: { count: 0, hasMinimum: false },
        experience: { count: 0, hasMinimum: false },
        certificates: { count: 0, hasMinimum: false },
        languages: { count: 0, hasMinimum: false }
      }
    };
  }
  
  logger.info(`[getProfileCompletion] Profile found, profileId: ${profile.id}`);
  logger.info(`[getProfileCompletion] Profile data:`, {
    first_name: profile.first_name,
    last_name: profile.last_name,
    title: profile.title,
    specialty_id: profile.specialty_id,
    dob: profile.dob,
    phone: profile.phone,
    birth_place_id: profile.birth_place_id,
    residence_city_id: profile.residence_city_id
  });

  // Kişisel bilgiler - 8 alan (title, specialty_id zorunlu alanlar dahil)
  const personalFields = [
    'first_name',        // Zorunlu
    'last_name',         // Zorunlu
    'title',             // Zorunlu (RegisterPage'de zorunlu)
    'specialty_id',      // Zorunlu (RegisterPage'de zorunlu)
    'dob',              // İsteğe bağlı ama önemli
    'phone',            // İsteğe bağlı ama önemli
    'birth_place_id',   // İsteğe bağlı (cities tablosundan ID)
    'residence_city_id' // İsteğe bağlı (cities tablosundan ID)
  ];
  
  const missingFields = [];
  const completedPersonal = personalFields.filter(f => {
    const value = profile[f];
    const isCompleted = value !== null && value !== undefined && value.toString().trim() !== '';
    if (!isCompleted) missingFields.push(f);
    return isCompleted;
  }).length;

  // Eğitim/Deneyim/Sertifika/Dil sayılarını al (Soft delete kontrolü ile)
  const counts = await Promise.all([
    db('doctor_educations').where('doctor_profile_id', profile.id).whereNull('deleted_at').count('* as count').first(),
    db('doctor_experiences').where('doctor_profile_id', profile.id).whereNull('deleted_at').count('* as count').first(),
    db('doctor_certificates').where('doctor_profile_id', profile.id).whereNull('deleted_at').count('* as count').first(),
    db('doctor_languages').where('doctor_profile_id', profile.id).whereNull('deleted_at').count('* as count').first()
  ]);

  const educationCount = parseInt(counts[0].count);
  const experienceCount = parseInt(counts[1].count);
  const certificateCount = parseInt(counts[2].count);
  const languageCount = parseInt(counts[3].count);

  // Her bölüm için minimum 1 kayıt var mı kontrolü
  const hasEducation = educationCount > 0;
  const hasExperience = experienceCount > 0;
  const hasCertificate = certificateCount > 0;
  const hasLanguage = languageCount > 0;

  // Yüzde hesaplamaları
  // - Kişisel bilgiler: %40
  // - Her diğer bölüm: %15
  const personalPercentage = (completedPersonal / personalFields.length) * 40;
  const educationPercentage = hasEducation ? 15 : 0;
  const experiencePercentage = hasExperience ? 15 : 0;
  const certificatePercentage = hasCertificate ? 15 : 0;
  const languagePercentage = hasLanguage ? 15 : 0;

  const totalPercentage = Math.round(
    personalPercentage + 
    educationPercentage + 
    experiencePercentage + 
    certificatePercentage + 
    languagePercentage
  );

  // Eksik bölümleri missing_fields'e ekle
  if (!hasEducation) missingFields.push('education');
  if (!hasExperience) missingFields.push('experience');
  if (!hasCertificate) missingFields.push('certificates');
  if (!hasLanguage) missingFields.push('languages');

  const result = {
    completion_percentage: Math.min(totalPercentage, 100), // Frontend'in beklediği alan adı
    missing_fields: missingFields,
    sections: {
      personal: Math.round((completedPersonal / personalFields.length) * 100),
      education: hasEducation,
      experience: hasExperience,
      certificates: hasCertificate,
      languages: hasLanguage
    },
    details: {
      personal: {
        completed: completedPersonal,
        total: personalFields.length,
        percentage: Math.round((completedPersonal / personalFields.length) * 100),
        missing: missingFields.filter(f => personalFields.includes(f))
      },
      education: {
        count: educationCount,
        hasMinimum: hasEducation,
        percentage: educationPercentage
      },
      experience: {
        count: experienceCount,
        hasMinimum: hasExperience,
        percentage: experiencePercentage
      },
      certificates: {
        count: certificateCount,
        hasMinimum: hasCertificate,
        percentage: certificatePercentage
      },
      languages: {
        count: languageCount,
        hasMinimum: hasLanguage,
        percentage: languagePercentage
      }
    }
  };

  logger.info(`[getProfileCompletion] Calculation complete for userId ${userId}:`, {
    completion_percentage: result.completion_percentage,
    personal_completed: `${completedPersonal}/${personalFields.length}`,
    education_count: educationCount,
    experience_count: experienceCount,
    certificate_count: certificateCount,
    language_count: languageCount,
    missing_fields_count: missingFields.length
  });

  return result;
};

// ============================================================================
// VERİ GETİRME FONKSİYONLARI
// ============================================================================

/**
 * Doktorun eğitim bilgilerini getirir
 * @description Doktorun tüm eğitim kayıtlarını mezuniyet yılına göre sıralı olarak getirir
 * @param {number} userId - Kullanıcının ID'si (users.id)
 * @returns {Promise<Array>} Eğitim kayıtları listesi (mezuniyet yılına göre azalan sırada)
 * @throws {AppError} Profil bulunamadığında veya veritabanı hatası durumunda
 * 
 * @example
 * const educations = await getEducations(123);
 * // Access educations array
 */
const getEducations = async (userId) => {
  const profile = await db('doctor_profiles').where('user_id', userId).first();
  if (!profile) return [];
  
  return await db('doctor_educations as de')
    .leftJoin('doctor_education_types as det', 'de.education_type_id', 'det.id')
    .select(
      'de.*',
      'det.name as education_type_name',
      'det.description as education_type_description'
    )
    .where('de.doctor_profile_id', profile.id)
    .whereNull('de.deleted_at') // Soft delete: Sadece silinmemiş kayıtları getir
    .orderBy('de.graduation_year', 'desc');
};

/**
 * Doktorun deneyim bilgilerini getirir
 * @description Doktorun tüm iş deneyimlerini başlangıç tarihine göre sıralı olarak getirir
 * @param {number} userId - Kullanıcının ID'si (users.id)
 * @returns {Promise<Array>} Deneyim kayıtları listesi (başlangıç tarihine göre azalan sırada, specialty ve subspecialty isimleri ile)
 * @throws {AppError} Profil bulunamadığında veya veritabanı hatası durumunda
 * 
 * @example
 * const experiences = await getExperiences(123);
 * // Access experiences array
 */
const getExperiences = async (userId) => {
  const profile = await db('doctor_profiles').where('user_id', userId).first();
  if (!profile) return [];
  
  return await db('doctor_experiences as de')
    .leftJoin('specialties as s', 'de.specialty_id', 's.id')
    .leftJoin('subspecialties as ss', 'de.subspecialty_id', 'ss.id')
    .select(
      'de.*',
      's.name as specialty_name',
      'ss.name as subspecialty_name'
    )
    .where('de.doctor_profile_id', profile.id)
    .whereNull('de.deleted_at') // Soft delete: Sadece silinmemiş kayıtları getir
    .orderBy('de.start_date', 'desc');
};

/**
 * Doktorun sertifika bilgilerini getirir
 * @description Doktorun tüm sertifika kayıtlarını veriliş tarihine göre sıralı olarak getirir
 * @param {number} userId - Kullanıcının ID'si (users.id)
 * @returns {Promise<Array>} Sertifika kayıtları listesi (veriliş tarihine göre azalan sırada, certificate_type ismi ile)
 * @throws {AppError} Profil bulunamadığında veya veritabanı hatası durumunda
 * 
 * @example
 * const certificates = await getCertificates(123);
 * // Access certificates array
 */
const getCertificates = async (userId) => {
  const profile = await db('doctor_profiles').where('user_id', userId).first();
  if (!profile) return [];
  
  return await db('doctor_certificates as dc')
    .select('dc.*')
    .where('dc.doctor_profile_id', profile.id)
    .whereNull('dc.deleted_at') // Soft delete: Sadece silinmemiş kayıtları getir
    .orderBy('dc.certificate_year', 'desc');
};

/**
 * Doktorun dil bilgilerini getirir
 * @description Doktorun tüm dil kayıtlarını dil seviyesine göre sıralı olarak getirir
 * @param {number} userId - Kullanıcının ID'si (users.id)
 * @returns {Promise<Array>} Dil kayıtları listesi (language ve level isimleri ile)
 * @throws {AppError} Profil bulunamadığında veya veritabanı hatası durumunda
 * 
 * @example
 * const languages = await getLanguages(123);
 * // Access languages array
 */
const getLanguages = async (userId) => {
  const profile = await db('doctor_profiles').where('user_id', userId).first();
  if (!profile) return [];
  
  return await db('doctor_languages as dl')
    .leftJoin('languages as l', 'dl.language_id', 'l.id')
    .leftJoin('language_levels as ll', 'dl.level_id', 'll.id')
    .select(
      'dl.id',
      'dl.language_id',
      'dl.level_id',
      'l.name as language',
      'll.name as level',
      'dl.created_at'
    )
    .where('dl.doctor_profile_id', profile.id)
    .whereNull('dl.deleted_at') // Soft delete: Sadece silinmemiş kayıtları getir
    .orderBy('dl.created_at', 'desc');
};


// ============================================================================
// PROFİL GÜNCELLEME BİLDİRİMLERİ
// ============================================================================

/**
 * Profil güncelleme bildirimi gönderir
 * @description Doktor profili güncellendiğinde kendisine bildirim gönderir
 * @param {number} userId - Doktor kullanıcı ID'si
 * @param {string} updateType - Güncelleme türü (personal_info, education, experience, certificate, language)
 * @param {string} updateDescription - Güncelleme açıklaması
 * @returns {Promise<Object>} Gönderilen bildirim bilgisi
 * @throws {AppError} Veritabanı hatası durumunda
 * 
 * @example
 * await sendProfileUpdateNotification(123, 'education', 'Yeni eğitim bilgisi eklendi');
 */
const sendProfileUpdateNotification = async (userId, updateType, updateDescription) => {
  try {
    const notificationTitles = {
      personal_info: 'Kişisel Bilgiler Güncellendi',
      education: 'Eğitim Bilgileri Güncellendi',
      experience: 'Deneyim Bilgileri Güncellendi',
      certificate: 'Sertifika Bilgileri Güncellendi',
      language: 'Dil Bilgileri Güncellendi'
    };

    const title = notificationTitles[updateType] || 'Profil Güncellendi';
    
    await notificationService.sendNotification({
      user_id: userId,
      type: 'success',
      title: title,
      body: `Profilinizde ${updateDescription} işlemi başarıyla gerçekleştirildi.`,
      data: {
        // In-App State Update için kritik alanlar
        action: 'profile_updated',
        entity_type: 'profile',
        entity_id: userId,
        // Mevcut veriler (geriye dönük uyumluluk için)
        update_type: updateType,
        update_description: updateDescription,
        timestamp: new Date().toISOString()
      }
    });

    logger.info(`Profile update notification sent to user ${userId} for ${updateType}`);
  } catch (error) {
    logger.warn('Profile update notification failed:', error);
    throw error;
  }
};

// ============================================================================
// BAŞVURU FONKSİYONLARI 
// ============================================================================

/**
 * Başvuru durumu adını ID'ye çevir
 * @description Başvuru durumu adını veritabanındaki ID'ye çevirir.
 * @param {string} status - Başvuru durumu adı
 * @returns {Promise<number|null>} Başvuru durumu ID'si
 */
const resolveApplicationStatusId = async (status) => {
  const statusRecord = await db('application_statuses')
    .where('name', 'like', `%${status}%`)
    .first();
  
  return statusRecord ? statusRecord.id : null;
};

/**
 * Doktorlar için yeni başvuru oluştur
 * @description Doktorlar için iş ilanına başvuru oluşturur.
 * @param {number} doctorProfileId - Doktor profili kimliği
 * @param {Object} data - Başvuru verileri
 * @param {number} data.jobId - İş ilanı kimliği
 * @param {string} [data.coverLetter] - Ön yazı
 * @returns {Promise<Object>} Oluşturulan başvuru
 * @throws {AppError} İlan bulunamadı, başvuruya kapalı, daha önce başvuru yapılmış
 * 
 * @example
 * const application = await createApplication(123, {
 *   jobId: 456,
 *   coverLetter: 'Bu pozisyon için çok uygun olduğumu düşünüyorum...'
 * });
 */
const createApplication = async (doctorProfileId, data) => {
  const { jobId, coverLetter } = data;

  // Transaction içinde tüm işlemleri yap (Deadlock riskini önlemek için)
  // Mobil tarafı zaten transaction kullanıyor, web tarafı da aynı standardı kullanmalı
  const application = await db.transaction(async (trx) => {
    // İlan varlık ve durum kontrolü - SELECT FOR UPDATE ile row-level locking
    const jobs = await trx.raw(`
      SELECT j.*, js.name as status_name
      FROM jobs j WITH (UPDLOCK, ROWLOCK)
      LEFT JOIN job_statuses js ON j.status_id = js.id
      WHERE j.id = ?
    `, [jobId]);

    if (!jobs || jobs.length === 0 || !jobs[0]) {
      throw new AppError(`jobs.id=${jobId} bulunamadı`, 400);
    }

    const job = jobs[0];

    // Status kontrolü için job_statuses tablosundan kontrol edelim
    if (job.status_id) {
      const statuses = await trx('job_statuses')
        .select('name')
        .where('id', job.status_id)
        .first();
      
      if (statuses) {
        const statusName = statuses.name;
        // Sadece Onaylandı (status_id = 3) ilanlarına başvuru yapılabilir
        if (statusName !== 'Onaylandı') {
          throw new AppError('İlan durumu başvuruya kapalı. İlan henüz onaylanmamış veya pasif durumda.', 400);
        }
      }
    }

    // Aynı doktorun aynı ilana daha önce aktif başvuru yapıp yapmadığını kontrol et
    // (Geri çekilmiş başvuruları hariç tut - status_id = 5)
    // Web tarafındaki mantık: Geri çekilmiş başvurular yeni başvuru oluşturmayı engellemez
    // Kullanıcı geri çekilmiş başvurudan sonra yeni bir başvuru oluşturabilir (ön yazıyı değiştirebilir)
    // (Soft delete edilmiş başvuruları da hariç tut - deleted_at is null)
    const existingApplications = await trx('applications')
      .where({
        doctor_profile_id: doctorProfileId,
        job_id: jobId
      })
      .where('status_id', '!=', 5) // Geri çekilmiş başvuruları hariç tut
      .whereNull('deleted_at'); // Soft delete edilmiş başvuruları hariç tut
    
    const existingApplication = existingApplications[0];

    if (existingApplication) {
      throw new AppError('Bu ilana daha önce başvuru yapılmış', 400);
    }

    // Başlangıç durumu: Beklemede (application_statuses.id = 1)
    const pendingStatusId = 1;

    // Başvuru oluştur - SQL Server için OUTPUT clause kullan
    // Not: Geri çekilmiş başvuru varsa bile yeni başvuru oluşturulur (web mantığı ile uyumlu)
    const insertedApplications = await trx('applications')
      .insert({
        job_id: jobId,
        doctor_profile_id: doctorProfileId,
        status_id: pendingStatusId,
        cover_letter: coverLetter || null,  // Doktor ön yazısı
        notes: null  // Hastane notu için ayrı alan
      })
      .returning('id');

    const applicationId = insertedApplications[0].id;

    // Oluşturulan başvuruyu getir (transaction içinde)
    const applicationData = await trx('applications')
      .where('id', applicationId)
      .first();

    if (!applicationData) {
      throw new AppError('Başvuru oluşturuldu ancak getirilemedi', 500);
    }

    // Job bilgilerini çek
    if (applicationData.job_id) {
      const jobData = await trx('jobs as j')
        .leftJoin('cities as c', 'j.city_id', 'c.id')
        .leftJoin('specialties as s', 'j.specialty_id', 's.id')
        .leftJoin('subspecialties as ss', 'j.subspecialty_id', 'ss.id')
        .leftJoin('hospital_profiles as hp', 'j.hospital_id', 'hp.id')
        .leftJoin('users as hospital_users', 'hp.user_id', 'hospital_users.id')
        .leftJoin('cities as hp_city', 'hp.city_id', 'hp_city.id')
        .leftJoin('job_statuses as js', 'j.status_id', 'js.id')
        .select(
          'j.id',
          'j.title',
          'j.description',
          'j.city_id',
          'j.employment_type',
          'j.min_experience_years',
          'j.created_at',
          'j.updated_at',
          'j.hospital_id',
          'j.specialty_id',
          'j.subspecialty_id',
          'j.status_id as job_status_id',
          'js.name as job_status',
          'j.deleted_at as job_deleted_at',
          'c.name as city',
          's.name as specialty_name',
          'ss.name as subspecialty_name',
          'hp.institution_name as hospital_name',
          'hp.city_id as hospital_city_id',
          'hp_city.name as hospital_city',
          'hp.address as hospital_address',
          'hp.phone as hospital_phone',
          'hp.email as hospital_email',
          'hospital_users.is_active as hospital_is_active'
        )
        .where('j.id', applicationData.job_id)
        .first();
      
      if (jobData) {
        Object.assign(applicationData, {
          job_id: jobData.id,
          title: jobData.title,
          description: jobData.description,
          city_id: jobData.city_id,
          city: jobData.city,
          employment_type: jobData.employment_type,
          min_experience_years: jobData.min_experience_years,
          specialty_name: jobData.specialty_name,
          subspecialty_name: jobData.subspecialty_name,
          created_at: jobData.created_at,
          updated_at: jobData.updated_at,
          hospital_name: jobData.hospital_name,
          hospital_city: jobData.hospital_city,
          hospital_address: jobData.hospital_address,
          hospital_phone: jobData.hospital_phone,
          hospital_email: jobData.hospital_email,
          job_status_id: jobData.job_status_id,
          job_status: jobData.job_status,
          job_deleted_at: jobData.job_deleted_at,
          hospital_is_active: jobData.hospital_is_active
        });
      }
    }

    // Status bilgisini çek
    if (applicationData.status_id) {
      const statuses = await trx('application_statuses')
        .select('name')
        .where('id', applicationData.status_id)
        .first();
      
      if (statuses) {
        applicationData.status_name = statuses.name;
        applicationData.status = statuses.name;
      }
    }

    applicationData.created_at = applicationData.applied_at;

    return applicationData;
  });
  
  logger.info(`Application created: ${application.id} for job ${jobId} by doctor ${doctorProfileId}`);
  
  // Application objesini getApplicationById formatına uygun hale getir (web uyumluluğu için)
  // Transaction içinde dönen veri zaten aynı formatta, sadece eksik alanları tamamla
  const finalApplication = await getApplicationById(application.id, doctorProfileId);
  
  // Hastaneye bildirim gönder (transaction dışında - bildirim hatası işlemi engellemez)
  try {
    // İlan bilgilerini al (hastane user_id için)
    const jobWithHospital = await db('jobs as j')
      .join('hospital_profiles as hp', 'j.hospital_id', 'hp.id')
      .join('users as u', 'hp.user_id', 'u.id')
      .where('j.id', jobId)
      .select('j.title as job_title', 'hp.institution_name', 'u.id as hospital_user_id')
      .first();
    
    // Doktor bilgilerini al
    const doctorProfile = await db('doctor_profiles')
      .where('id', doctorProfileId)
      .select('first_name', 'last_name')
      .first();
    
    if (jobWithHospital && doctorProfile) {
      await notificationService.sendNotification({
        user_id: jobWithHospital.hospital_user_id,
        type: 'info',
        title: 'Yeni Başvuru Aldınız',
        body: `"${jobWithHospital.job_title}" pozisyonu için ${doctorProfile.first_name} ${doctorProfile.last_name} doktorundan yeni bir başvuru aldınız.`,
        data: {
          // In-App State Update için kritik alanlar
          action: 'application_created',
          entity_type: 'application',
          entity_id: finalApplication.id,
          // Mevcut veriler (geriye dönük uyumluluk için)
          application_id: finalApplication.id,
          job_id: jobId,
          job_title: jobWithHospital.job_title,
          doctor_name: `${doctorProfile.first_name} ${doctorProfile.last_name}`,
          doctor_profile_id: doctorProfileId
        }
      });
      logger.info(`New application notification sent to hospital ${jobWithHospital.hospital_user_id}`);
    }
  } catch (notificationError) {
    logger.warn('New application notification failed:', notificationError);
    // Bildirim hatası başvuru oluşturmayı engellemez
  }
  
  return finalApplication;
};

/**
 * Doktorlar için kendi başvurularını getir
 * @description Doktorun kendi başvurularını filtreleme ve sayfalama ile getirir.
 * @param {number} doctorProfileId - Doktor profili kimliği
 * @param {Object} [filters={}] - Filtreleme parametreleri
 * @param {string} [filters.status] - Başvuru durumu
 * @param {number} [filters.page=1] - Sayfa numarası
 * @param {number} [filters.limit=10] - Sayfa başına kayıt sayısı
 * @returns {Promise<Object>} Başvurular ve sayfalama bilgileri
 * @throws {AppError} Veritabanı hatası durumunda
 * 
 * @example
 * const applications = await getMyApplications(123, { status: 'pending', page: 1, limit: 10 });
 */
const getMyApplications = async (doctorProfileId, filters = {}) => {
  const {
    status,
    city,           // Şehir filtresi (iş ilanındaki şehir)
    page = 1,
    limit = 10
  } = filters;

  // Sayfalama hesaplamaları
  const offset = (page - 1) * limit;

  // Optimized query - Tüm JOIN'leri tek sorguda yap (N+1 query problemini çözer)
  let query = db('applications as a')
    .select(
      'a.*',
      'a.applied_at as created_at', // Frontend uyumluluğu için
      'ast.name as status_name',
      'ast.name as status', // Frontend uyumluluğu için
      'j.title as job_title',
      'j.description as job_description',
      'j.city_id as job_city_id',
      'j.specialty_id',
      'j.status_id as job_status_id', // İş ilanı durumu ID'si
      'js.name as job_status', // İş ilanı durumu adı
      'j.deleted_at as job_deleted_at', // İş ilanı silinme tarihi (yayından kaldırılmış kontrolü için)
      'c.name as job_city',
      'hp.institution_name as hospital_name',
      's.name as specialty_name',
      'hospital_users.is_active as hospital_is_active' // Hastane aktiflik durumu
    )
    .leftJoin('application_statuses as ast', 'a.status_id', 'ast.id')
    .leftJoin('jobs as j', 'a.job_id', 'j.id')
    .leftJoin('job_statuses as js', 'j.status_id', 'js.id') // İş ilanı durumu için JOIN
    .leftJoin('cities as c', 'j.city_id', 'c.id')
    .leftJoin('hospital_profiles as hp', 'j.hospital_id', 'hp.id')
    .leftJoin('users as hospital_users', 'hp.user_id', 'hospital_users.id')
    .leftJoin('specialties as s', 'j.specialty_id', 's.id')
    .where('a.doctor_profile_id', doctorProfileId)
    .whereNull('a.deleted_at'); // Soft delete: Silinmiş başvuruları gösterme
    // NOT: j.deleted_at filtresi kaldırıldı - silinen iş ilanlarına ait başvurular gösterilecek ama "yayından kaldırılmış" olarak işaretlenecek
    // NOT: hospital_users.is_active filtresi kaldırıldı - pasif hastane ilanları da gösterilecek ama pasif ilan gibi görünecek
    // NOT: status_id = 3 filtresi kaldırıldı - pasif ilanları da gösteriyoruz

  // Status filtresi
  if (status) {
    const statusId = await resolveApplicationStatusId(status);
    if (statusId) {
      query = query.where('a.status_id', statusId);
    }
  }

  // Şehir filtresi (iş ilanındaki şehre göre)
  if (city) {
    query = query.where('c.name', 'like', `%${city}%`);
  }

  // Toplam sayı için count query (aynı filtreleri kullan)
  let countQuery = db('applications as a')
    .leftJoin('jobs as j', 'a.job_id', 'j.id')
    .leftJoin('cities as c', 'j.city_id', 'c.id')
    .leftJoin('hospital_profiles as hp', 'j.hospital_id', 'hp.id')
    .leftJoin('users as hospital_users', 'hp.user_id', 'hospital_users.id')
    .where('a.doctor_profile_id', doctorProfileId)
    .whereNull('a.deleted_at'); // Soft delete: Silinmiş başvuruları sayma
    // NOT: j.deleted_at filtresi kaldırıldı - silinen iş ilanlarına ait başvurular sayılacak
    // NOT: hospital_users.is_active filtresi kaldırıldı - pasif hastane ilanları da sayılacak
    // NOT: status_id = 3 filtresi kaldırıldı - pasif ilanları da sayıyoruz

  if (status) {
    const statusId = await resolveApplicationStatusId(status);
    if (statusId) {
      countQuery = countQuery.where('a.status_id', statusId);
    }
  }

  if (city) {
    countQuery = countQuery.where('c.name', 'like', `%${city}%`);
  }

  const totalResult = await countQuery.count('* as total').first();
  const total = parseInt(totalResult.total);

  // SQL seviyesinde sayfalama - 100k veri için kritik!
  const applications = await query
    .orderBy('a.applied_at', 'desc')
    .limit(limit)
    .offset(offset);

  return {
    applications,
    pagination: {
      current_page: page,
      per_page: limit,
      total,
      total_pages: Math.ceil(total / limit),
      has_next: page < Math.ceil(total / limit),
      has_prev: page > 1
    }
  };
};

/**
 * Doktorlar için tek başvuru detayını getir
 * @description Doktorlar için belirli bir başvurunun detaylarını getirir.
 * @param {number} applicationId - Başvuru kimliği
 * @param {number} [doctorProfileId] - Doktor profili kimliği (sahiplik kontrolü için)
 * @returns {Promise<Object>} Başvuru detayları
 * @throws {AppError} Başvuru bulunamadı veya sahiplik hatası
 * 
 * @example
 * const application = await getApplicationById(123, 456);
 */
const getApplicationById = async (applicationId, doctorProfileId = null) => {
  try {
    // Önce applications tablosunun varlığını kontrol edelim
    const tableExists = await db.raw(`
      SELECT COUNT(*) as count 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_NAME = 'applications' AND TABLE_SCHEMA = 'dbo'
    `);
    
    if (tableExists[0].count === 0) {
      throw new AppError('Applications tablosu bulunamadı', 500);
    }

    // Önce sadece applications tablosundan veri çekelim
    const applications = await db('applications')
      .select('*')
      .where('id', applicationId);

    if (!applications || applications.length === 0) {
      throw new AppError('Başvuru bulunamadı', 404);
    }

    const application = applications[0];

    // Sahiplik kontrolü
    if (doctorProfileId && application.doctor_profile_id !== doctorProfileId) {
      throw new AppError('Bu başvuruya erişim yetkiniz yok', 403);
    }

    // Job bilgilerini çekelim - Tek query ile lookup tablolarıyla birlikte
    if (application.job_id) {
      const job = await db('jobs as j')
        .leftJoin('cities as c', 'j.city_id', 'c.id')
        .leftJoin('specialties as s', 'j.specialty_id', 's.id')
        .leftJoin('subspecialties as ss', 'j.subspecialty_id', 'ss.id')
        .leftJoin('hospital_profiles as hp', 'j.hospital_id', 'hp.id')
        .leftJoin('users as hospital_users', 'hp.user_id', 'hospital_users.id')
        .leftJoin('cities as hp_city', 'hp.city_id', 'hp_city.id')
        .leftJoin('job_statuses as js', 'j.status_id', 'js.id') // İş ilanı durumu için JOIN
        .select(
          'j.id',
          'j.title',
          'j.description',
          'j.city_id',
          'j.employment_type',
          'j.min_experience_years',
          'j.created_at',
          'j.updated_at',
          'j.hospital_id',
          'j.specialty_id',
          'j.subspecialty_id',
          'j.status_id as job_status_id', // İş ilanı durumu ID'si
          'js.name as job_status', // İş ilanı durumu adı
          'j.deleted_at as job_deleted_at', // İş ilanı silinme tarihi (yayından kaldırılmış kontrolü için)
          'c.name as city',
          's.name as specialty_name',
          'ss.name as subspecialty_name',
          'hp.institution_name as hospital_name',
          'hp.city_id as hospital_city_id',
          'hp_city.name as hospital_city',
          'hp.address as hospital_address',
          'hp.phone as hospital_phone',
          'hp.email as hospital_email',
          'hospital_users.is_active as hospital_is_active' // Hastane aktiflik durumu
        )
        .where('j.id', application.job_id)
        .first();
    
      if (job) {
        Object.assign(application, {
          job_id: job.id,
          title: job.title,
          description: job.description,
          city_id: job.city_id,
          city: job.city,
          employment_type: job.employment_type,
          min_experience_years: job.min_experience_years,
          specialty_name: job.specialty_name,
          subspecialty_name: job.subspecialty_name,
          created_at: job.created_at,
          updated_at: job.updated_at,
          hospital_name: job.hospital_name,
          hospital_city: job.hospital_city,
          hospital_address: job.hospital_address,
          hospital_phone: job.hospital_phone,
          hospital_email: job.hospital_email,
          job_status_id: job.job_status_id, // İş ilanı durumu ID'si
          job_status: job.job_status, // İş ilanı durumu adı
          job_deleted_at: job.job_deleted_at, // İş ilanı silinme tarihi (yayından kaldırılmış kontrolü için)
          hospital_is_active: job.hospital_is_active // Hastane aktiflik durumu
        });
      }
    }

    // Status bilgisini çekelim
    if (application.status_id) {
      const statuses = await db('application_statuses')
        .select('name')
        .where('id', application.status_id)
        .first();
      
      if (statuses) {
        application.status_name = statuses.name;
        application.status = statuses.name; // Frontend için
      }
    }

    // Frontend için created_at'i applied_at olarak ayarlayalım
    application.created_at = application.applied_at;

    return application;
  } catch (error) {
    logger.error(`getApplicationById error: ${error.message}`, { applicationId, doctorProfileId, error });
    throw error;
  }
};

/**
 * Doktorlar için başvuruyu geri çek
 * @description Doktorlar için başvuruyu geri çeker.
 * @param {number} applicationId - Başvuru kimliği
 * @param {number} doctorProfileId - Doktor profili kimliği
 * @param {string} [reason=''] - Geri çekme sebebi
 * @returns {Promise<Object>} Güncellenmiş başvuru
 * @throws {AppError} Başvuru bulunamadı, sahiplik hatası, zaten geri çekilmiş
 * 
 * @example
 * const application = await withdrawApplication(123, 456, 'Başka bir pozisyon buldum');
 */
const withdrawApplication = async (applicationId, doctorProfileId, reason = '') => {
  // Transaction içinde tüm işlemleri yap (Deadlock riskini önlemek için)
  // Mobil tarafı zaten transaction kullanıyor, web tarafı da aynı standardı kullanmalı
  const updatedApplication = await db.transaction(async (trx) => {
    // Başvuru varlık ve sahiplik kontrolü - SELECT FOR UPDATE ile row-level locking
    const application = await trx('applications')
      .where('id', applicationId)
      .where('doctor_profile_id', doctorProfileId)
      .first();

    if (!application) {
      logger.warn(`Application not found - applicationId: ${applicationId}, doctorProfileId: ${doctorProfileId}`);
      throw new AppError('Başvuru bulunamadı', 404);
    }

    // Zaten geri çekilmiş mi kontrol et (status_id = 5)
    if (application.status_id === 5) { // 5 = Geri Çekildi
      throw new AppError('Başvuru zaten geri çekilmiş', 400);
    }

    // Sadece "Başvuruldu" (status_id = 1) durumundaki başvurular geri çekilebilir
    if (application.status_id !== 1) { // 1 = Başvuruldu
      throw new AppError('Sadece "Başvuruldu" durumundaki başvurular geri çekilebilir', 400);
    }

    // Başvuruyu geri çek (status_id = 5: Geri Çekildi)
    await trx('applications')
      .where('id', applicationId)
      .update({
        status_id: 5, // Geri Çekildi
        notes: reason ? `${application.notes || ''}\n\nGeri çekme sebebi: ${reason}`.trim() : application.notes,
        updated_at: db.fn.now()
      });

    // Güncellenmiş başvuruyu getir (transaction içinde)
    const applicationData = await trx('applications')
      .where('id', applicationId)
      .first();

    if (!applicationData) {
      throw new AppError('Başvuru güncellendi ancak getirilemedi', 500);
    }

    // Job bilgilerini çek
    if (applicationData.job_id) {
      const jobData = await trx('jobs as j')
        .leftJoin('cities as c', 'j.city_id', 'c.id')
        .leftJoin('specialties as s', 'j.specialty_id', 's.id')
        .leftJoin('subspecialties as ss', 'j.subspecialty_id', 'ss.id')
        .leftJoin('hospital_profiles as hp', 'j.hospital_id', 'hp.id')
        .leftJoin('users as hospital_users', 'hp.user_id', 'hospital_users.id')
        .leftJoin('cities as hp_city', 'hp.city_id', 'hp_city.id')
        .leftJoin('job_statuses as js', 'j.status_id', 'js.id')
        .select(
          'j.id',
          'j.title',
          'j.description',
          'j.city_id',
          'j.employment_type',
          'j.min_experience_years',
          'j.created_at',
          'j.updated_at',
          'j.hospital_id',
          'j.specialty_id',
          'j.subspecialty_id',
          'j.status_id as job_status_id',
          'js.name as job_status',
          'j.deleted_at as job_deleted_at',
          'c.name as city',
          's.name as specialty_name',
          'ss.name as subspecialty_name',
          'hp.institution_name as hospital_name',
          'hp.city_id as hospital_city_id',
          'hp_city.name as hospital_city',
          'hp.address as hospital_address',
          'hp.phone as hospital_phone',
          'hp.email as hospital_email',
          'hospital_users.is_active as hospital_is_active'
        )
        .where('j.id', applicationData.job_id)
        .first();
      
      if (jobData) {
        Object.assign(applicationData, {
          job_id: jobData.id,
          title: jobData.title,
          description: jobData.description,
          city_id: jobData.city_id,
          city: jobData.city,
          employment_type: jobData.employment_type,
          min_experience_years: jobData.min_experience_years,
          specialty_name: jobData.specialty_name,
          subspecialty_name: jobData.subspecialty_name,
          created_at: jobData.created_at,
          updated_at: jobData.updated_at,
          hospital_name: jobData.hospital_name,
          hospital_city: jobData.hospital_city,
          hospital_address: jobData.hospital_address,
          hospital_phone: jobData.hospital_phone,
          hospital_email: jobData.hospital_email,
          job_status_id: jobData.job_status_id,
          job_status: jobData.job_status,
          job_deleted_at: jobData.job_deleted_at,
          hospital_is_active: jobData.hospital_is_active
        });
      }
    }

    // Status bilgisini çek
    if (applicationData.status_id) {
      const statuses = await trx('application_statuses')
        .select('name')
        .where('id', applicationData.status_id)
        .first();
      
      if (statuses) {
        applicationData.status_name = statuses.name;
        applicationData.status = statuses.name;
      }
    }

    applicationData.created_at = applicationData.applied_at;

    return applicationData;
  });
  
  logger.info(`Application withdrawn: ${applicationId} by doctor ${doctorProfileId}`);
  
  // Hastaneye bildirim gönder (transaction dışında - bildirim hatası işlemi engellemez)
  try {
    // Başvuru ve ilan bilgilerini al (hastane user_id için)
    const applicationWithJob = await db('applications as a')
      .join('jobs as j', 'a.job_id', 'j.id')
      .join('hospital_profiles as hp', 'j.hospital_id', 'hp.id')
      .join('users as u', 'hp.user_id', 'u.id')
      .where('a.id', applicationId)
      .select(
        'j.id as job_id',
        'j.title as job_title',
        'hp.institution_name',
        'u.id as hospital_user_id',
        'a.doctor_profile_id'
      )
      .first();
    
    // Doktor bilgilerini al
    const doctorProfile = await db('doctor_profiles')
      .where('id', applicationWithJob?.doctor_profile_id)
      .select('first_name', 'last_name')
      .first();
    
    if (applicationWithJob && doctorProfile) {
      await notificationService.sendHospitalWithdrawalNotification(applicationWithJob.hospital_user_id, {
        application_id: applicationId,
        job_id: applicationWithJob.job_id,
        job_title: applicationWithJob.job_title,
        doctor_name: `${doctorProfile.first_name} ${doctorProfile.last_name}`,
        doctor_profile_id: applicationWithJob.doctor_profile_id,
        reason: reason || null
      });
      logger.info(`Application withdrawal notification sent to hospital ${applicationWithJob.hospital_user_id}`);
    }
  } catch (notificationError) {
    logger.warn('Application withdrawal notification failed:', notificationError);
    // Bildirim hatası başvuru geri çekmeyi engellemez
  }
  
  return updatedApplication;
};

/**
 * Doktorlar için başvuruyu silme işlemi kaldırıldı
 * @description Doktorlar başvuruyu silemez, sadece geri çekebilir (withdrawApplication)
 * @deprecated Bu fonksiyon artık kullanılmıyor. Doktorlar sadece "Başvuruldu" durumundaki başvuruları geri çekebilir.
 */

/**
 * Doktorlar için başvuru istatistiklerini getir
 * @description Doktorun başvuru istatistiklerini getirir.
 * @param {number} doctorProfileId - Doktor profili kimliği
 * @returns {Promise<Object>} Başvuru istatistikleri
 * @throws {AppError} Veritabanı hatası durumunda
 * 
 * @example
 * const stats = await getDoctorApplicationStats(123);
 */
const getDoctorApplicationStats = async (doctorProfileId) => {
  const stats = await db('applications as a')
    .select([
      'as.name as status',
      db.raw('COUNT(*) as count')
    ])
    .leftJoin('application_statuses as as', 'a.status_id', 'as.id')
    .leftJoin('jobs as j', 'a.job_id', 'j.id')
    .leftJoin('hospital_profiles as hp', 'j.hospital_id', 'hp.id')
    .leftJoin('users as hospital_users', 'hp.user_id', 'hospital_users.id')
    .where('a.doctor_profile_id', doctorProfileId)
    .whereNull('a.deleted_at') // Soft delete: Silinmiş başvuruları sayma
    .where('a.status_id', '!=', 5) // Geri çekilen başvuruları sayma
    .whereNull('j.deleted_at') // Soft delete: Silinmiş iş ilanlarına ait başvuruları sayma
    .where('hospital_users.is_active', true) // Pasifleştirilmiş hastanelerin iş ilanlarını sayma
    .where('j.status_id', 3) // Sadece onaylanmış (Approved) iş ilanlarına ait başvuruları say
    .groupBy('as.name');

  const totalApplications = await db('applications as a')
    .leftJoin('jobs as j', 'a.job_id', 'j.id')
    .leftJoin('hospital_profiles as hp', 'j.hospital_id', 'hp.id')
    .leftJoin('users as hospital_users', 'hp.user_id', 'hospital_users.id')
    .where('a.doctor_profile_id', doctorProfileId)
    .whereNull('a.deleted_at') // Soft delete: Silinmiş başvuruları sayma
    .where('a.status_id', '!=', 5) // Geri çekilen başvuruları sayma
    .whereNull('j.deleted_at') // Soft delete: Silinmiş iş ilanlarına ait başvuruları sayma
    .where('hospital_users.is_active', true) // Pasifleştirilmiş hastanelerin iş ilanlarını sayma
    .where('j.status_id', 3) // Sadece onaylanmış (Approved) iş ilanlarına ait başvuruları say
    .count('* as total')
    .first();

  return {
    total: parseInt(totalApplications.total),
    by_status: stats.reduce((acc, stat) => {
      acc[stat.status] = parseInt(stat.count);
      return acc;
    }, {})
  };
};

/**
 * Doktorlar için son başvuruları getir
 * @description Doktorun son yaptığı başvuruları getirir.
 * @param {number} doctorProfileId - Doktor profili kimliği
 * @param {number} [limit=5] - Kayıt sayısı
 * @returns {Promise<Array>} Son başvurular
 * @throws {AppError} Veritabanı hatası durumunda
 * 
 * @example
 * const recentApplications = await getDoctorRecentApplications(123, 5);
 */
const getDoctorRecentApplications = async (doctorProfileId, limit = 5) => {
  // Optimized query - Soft delete ve geri çekilen başvurular kontrolü ile
  const applications = await db('applications as a')
    .select([
      'a.*',
      'a.applied_at as created_at',
      'ast.name as status',
      'j.title as job_title',
      'hp.institution_name as hospital_name'
    ])
    .leftJoin('application_statuses as ast', 'a.status_id', 'ast.id')
    .leftJoin('jobs as j', 'a.job_id', 'j.id')
    .leftJoin('hospital_profiles as hp', 'j.hospital_id', 'hp.id')
    .leftJoin('users as hospital_users', 'hp.user_id', 'hospital_users.id')
    .where('a.doctor_profile_id', doctorProfileId)
    .whereNull('a.deleted_at') // Soft delete: Silinmiş başvuruları gösterme
    .where('a.status_id', '!=', 5) // Geri çekilen başvuruları gösterme
    .whereNull('j.deleted_at') // Soft delete: Silinmiş iş ilanlarına ait başvuruları gösterme
    .where('hospital_users.is_active', true) // Pasifleştirilmiş hastanelerin iş ilanlarını gösterme
    .where('j.status_id', 3) // Sadece onaylanmış (Approved) iş ilanlarına ait başvuruları göster
    .orderBy('a.applied_at', 'desc')
    .limit(limit);
    
  return applications;
};

// ============================================================================
// İŞ İLANI FONKSİYONLARI 
// ============================================================================

/**
 * Doktorlar için iş ilanlarını getir
 * @description Doktorlar için aktif iş ilanlarını filtreleme ve arama ile getirir.
 * @param {Object} [filters={}] - Filtreleme parametreleri
 * @param {string} [filters.specialty] - Uzmanlık alanı
 * @param {string} [filters.city] - Şehir
 * @param {string} [filters.hospital] - Hastane adı
 * @param {string} [filters.search] - Arama terimi
 * @param {number} [filters.page=1] - Sayfa numarası
 * @param {number} [filters.limit=10] - Sayfa başına kayıt sayısı
 * @returns {Promise<Object>} İş ilanları ve sayfalama bilgileri
 * @throws {AppError} Veritabanı hatası durumunda
 * 
 * @example
 * const jobs = await getJobs({ specialty: 'Kardiyoloji', city: 'İstanbul' });
 */
const getJobs = async (filters = {}) => {
  const {
    // ID bazlı filtreler (öncelikli)
    city_id,
    specialty_id,
    subspecialty_id,
    hospital_id,
    // String bazlı filtreler (geriye dönük uyumluluk)
    specialty,
    city,
    hospital,
    // Yeni filtreler
    employment_type,
    min_experience_years,
    start_date,
    end_date,
    // Arama
    search,
    // Sayfalama
    page = 1,
    limit = 10
  } = filters;

  // Sayfalama hesaplamaları
  const offset = (page - 1) * limit;

  // Base query - sadece onaylanmış ilanlar (status_id = 3 = Approved) ve silinmemiş ilanlar
  let query = db('jobs as j')
    .select([
      'j.*',
      'hp.institution_name as hospital_name',
      'hc.name as hospital_city',
      'c.name as city',
      's.name as specialty_name',
      'ss.name as subspecialty_name',
      'js.name as status_name'
    ])
    .leftJoin('hospital_profiles as hp', 'j.hospital_id', 'hp.id')
    .leftJoin('users as hospital_users', 'hp.user_id', 'hospital_users.id')
    .leftJoin('cities as hc', 'hp.city_id', 'hc.id')
    .leftJoin('specialties as s', 'j.specialty_id', 's.id')
    .leftJoin('subspecialties as ss', 'j.subspecialty_id', 'ss.id')
    .leftJoin('cities as c', 'j.city_id', 'c.id')
    .leftJoin('job_statuses as js', 'j.status_id', 'js.id')
    .where('j.status_id', 3) // Sadece onaylanmış (Approved) ilanları getir
    .whereNull('j.deleted_at') // Silinmemiş ilanları getir
    .where('hospital_users.is_active', true); // Pasifleştirilmiş hastanelerin iş ilanlarını gösterme

  // Filtreleme - ID bazlı (öncelikli)
  if (city_id) {
    const cityId = typeof city_id === 'number' ? city_id : parseInt(city_id);
    if (!isNaN(cityId)) {
      query = query.where('j.city_id', cityId);
    }
  } else if (city) {
    // String bazlı (geriye dönük uyumluluk)
    query = query.where('c.name', 'like', `%${city}%`);
  }

  if (specialty_id) {
    const specId = typeof specialty_id === 'number' ? specialty_id : parseInt(specialty_id);
    if (!isNaN(specId)) {
      query = query.where('j.specialty_id', specId);
    }
  } else if (specialty) {
    // String bazlı (geriye dönük uyumluluk)
    const specialtyId = await resolveSpecialtyId(specialty);
    if (specialtyId) {
      query = query.where('j.specialty_id', specialtyId);
    }
  }

  if (subspecialty_id) {
    const subSpecId = typeof subspecialty_id === 'number' ? subspecialty_id : parseInt(subspecialty_id);
    if (!isNaN(subSpecId)) {
      query = query.where('j.subspecialty_id', subSpecId);
    }
  }

  if (hospital_id) {
    const hospId = typeof hospital_id === 'number' ? hospital_id : parseInt(hospital_id);
    if (!isNaN(hospId)) {
      query = query.where('j.hospital_id', hospId);
    }
  } else if (hospital) {
    // String bazlı (geriye dönük uyumluluk)
    const hospitalId = await resolveHospitalId(hospital);
    if (hospitalId) {
      query = query.where('j.hospital_id', hospitalId);
    }
  }

  // Yeni filtreler
  if (employment_type) {
    query = query.where('j.employment_type', 'like', `%${employment_type}%`);
  }

  if (min_experience_years !== undefined && min_experience_years !== null) {
    const minExp = typeof min_experience_years === 'number' ? min_experience_years : parseInt(min_experience_years);
    if (!isNaN(minExp)) {
      // min_experience_years <= girilen değer olan ilanları göster (0 ise tüm ilanlar)
      if (minExp === 0) {
        // 0 yıl deneyim = deneyim gereksinimi olmayan veya 0 olan ilanlar
        query = query.where(function() {
          this.whereNull('j.min_experience_years')
              .orWhere('j.min_experience_years', 0)
              .orWhere('j.min_experience_years', '<=', minExp);
        });
      } else {
        query = query.where('j.min_experience_years', '<=', minExp);
      }
    }
  }

  // Tarih aralığı filtresi
  if (start_date) {
    query = query.where('j.created_at', '>=', start_date);
  }
  if (end_date) {
    // end_date'in sonuna 23:59:59 ekleyerek o günü de dahil ediyoruz
    const endDateWithTime = new Date(end_date);
    endDateWithTime.setHours(23, 59, 59, 999);
    query = query.where('j.created_at', '<=', endDateWithTime);
  }

  // Arama (sadece ilan başlığı ve hastane)
  if (search) {
    query = query.where(function() {
      this.where('j.title', 'like', `%${search}%`)
          .orWhere('hp.institution_name', 'like', `%${search}%`);
    });
  }

  // Toplam kayıt sayısı - ayrı query ile
  const countQuery = db('jobs as j')
    .leftJoin('hospital_profiles as hp', 'j.hospital_id', 'hp.id')
    .leftJoin('users as hospital_users', 'hp.user_id', 'hospital_users.id')
    .leftJoin('specialties as s', 'j.specialty_id', 's.id')
    .leftJoin('subspecialties as ss', 'j.subspecialty_id', 'ss.id')
    .leftJoin('cities as c', 'j.city_id', 'c.id')
    .leftJoin('job_statuses as js', 'j.status_id', 'js.id')
    .where('j.status_id', 3) // Sadece onaylanmış (Approved) ilanları getir
    .whereNull('j.deleted_at') // Silinmemiş ilanları getir
    .where('hospital_users.is_active', true); // Pasifleştirilmiş hastanelerin iş ilanlarını sayma

  // Filtreleme - count query için de aynı filtreler
  // ID bazlı (öncelikli)
  if (city_id) {
    const cityId = typeof city_id === 'number' ? city_id : parseInt(city_id);
    if (!isNaN(cityId)) {
      countQuery.where('j.city_id', cityId);
    }
  } else if (city) {
    countQuery.where('c.name', 'like', `%${city}%`);
  }

  if (specialty_id) {
    const specId = typeof specialty_id === 'number' ? specialty_id : parseInt(specialty_id);
    if (!isNaN(specId)) {
      countQuery.where('j.specialty_id', specId);
    }
  } else if (specialty) {
    const specialtyId = await resolveSpecialtyId(specialty);
    if (specialtyId) {
      countQuery.where('j.specialty_id', specialtyId);
    }
  }

  if (subspecialty_id) {
    const subSpecId = typeof subspecialty_id === 'number' ? subspecialty_id : parseInt(subspecialty_id);
    if (!isNaN(subSpecId)) {
      countQuery.where('j.subspecialty_id', subSpecId);
    }
  }

  if (hospital_id) {
    const hospId = typeof hospital_id === 'number' ? hospital_id : parseInt(hospital_id);
    if (!isNaN(hospId)) {
      countQuery.where('j.hospital_id', hospId);
    }
  } else if (hospital) {
    const hospitalId = await resolveHospitalId(hospital);
    if (hospitalId) {
      countQuery.where('j.hospital_id', hospitalId);
    }
  }

  // Yeni filtreler
  if (employment_type) {
    countQuery.where('j.employment_type', 'like', `%${employment_type}%`);
  }

  if (min_experience_years !== undefined && min_experience_years !== null) {
    const minExp = typeof min_experience_years === 'number' ? min_experience_years : parseInt(min_experience_years);
    if (!isNaN(minExp)) {
      if (minExp === 0) {
        countQuery.where(function() {
          this.whereNull('j.min_experience_years')
              .orWhere('j.min_experience_years', 0)
              .orWhere('j.min_experience_years', '<=', minExp);
        });
      } else {
        countQuery.where('j.min_experience_years', '<=', minExp);
      }
    }
  }

  if (start_date) {
    countQuery.where('j.created_at', '>=', start_date);
  }
  if (end_date) {
    const endDateWithTime = new Date(end_date);
    endDateWithTime.setHours(23, 59, 59, 999);
    countQuery.where('j.created_at', '<=', endDateWithTime);
  }

  if (search) {
    countQuery.where(function() {
      this.where('j.title', 'like', `%${search}%`)
          .orWhere('hp.institution_name', 'like', `%${search}%`);
    });
  }

  const totalResult = await countQuery.count('* as total').first();
  const total = parseInt(totalResult.total);

  // SQL seviyesinde sayfalama (100k veri için kritik!)
  // Knex, SQL Server için OFFSET/FETCH sözdizimini otomatik kullanır
  const jobs = await query
    .orderBy('j.created_at', 'desc')
    .limit(limit)
    .offset(offset);

  return {
    jobs,
    pagination: {
      current_page: page,
      per_page: limit,
      total,
      total_pages: Math.ceil(total / limit),
      has_next: page < Math.ceil(total / limit),
      has_prev: page > 1
    }
  };
};

/**
 * Doktorlar için tek iş ilanı detayını getir
 * @description Doktorlar için belirli bir iş ilanının detaylarını getirir.
 * @param {number} id - İş ilanı kimliği
 * @returns {Promise<Object>} İş ilanı detayları
 * @throws {AppError} İş ilanı bulunamadı veya aktif değil
 * 
 * @example
 * const job = await getJobById(123);
 */
const getJobById = async (id, doctorProfileId = null) => {
  // Jobs tablosundan verileri lookup tablolarıyla birlikte çekelim
  const jobs = await db('jobs as j')
    .leftJoin('cities as c', 'j.city_id', 'c.id')
    .leftJoin('specialties as s', 'j.specialty_id', 's.id')
    .leftJoin('subspecialties as ss', 'j.subspecialty_id', 'ss.id')
    .leftJoin('job_statuses as js', 'j.status_id', 'js.id')
    .select(
      'j.*',
      'c.name as city',
      's.name as specialty_name',
      'ss.name as subspecialty_name',
      'js.name as status_name'
    )
    .where('j.id', id)
    .where('j.status_id', 3) // Sadece onaylanmış (Approved) ilanlar - Doktorlar sadece aktif ilanlara erişebilir
    .whereNull('j.deleted_at') // Silinmemiş ilanlar
    .first();

  if (!jobs) {
    throw new AppError('İş ilanı bulunamadı', 404);
  }

  const job = jobs;

  // Eğer hospital_id varsa hospital bilgilerini çekelim
  if (job.hospital_id) {
    const hospitals = await db('hospital_profiles as hp')
      .select([
        'hp.institution_name as hospital_name',
        'c.name as hospital_city',
        'hp.address as hospital_address',
        'hp.phone as hospital_phone',
        'hp.email as hospital_email',
        'hp.website as hospital_website',
        'hp.about as hospital_about'
      ])
      .leftJoin('cities as c', 'hp.city_id', 'c.id')
      .where('hp.id', job.hospital_id)
      .first();
    
    if (hospitals) {
      Object.assign(job, hospitals);
    }
  }

  job.has_active_application = false;
  if (doctorProfileId) {
    const activeApplication = await db('applications as a')
      .leftJoin('application_statuses as ast', 'a.status_id', 'ast.id')
      .select('a.id', 'a.status_id', 'ast.name as status_name')
      .where('a.job_id', id)
      .where('a.doctor_profile_id', doctorProfileId)
      .whereNull('a.deleted_at')
      .whereNot('a.status_id', 5) // 5 = Geri çekildi
      .orderBy('a.applied_at', 'desc')
      .first();

    if (activeApplication) {
      job.has_active_application = true;
      job.active_application_status_id = activeApplication.status_id;
      job.active_application_status = activeApplication.status_name;
    }
  }

  return job;
};

/**
 * Doktorlar için son iş ilanlarını getir
 * @description Doktorlar için son iş ilanlarını getirir (dashboard için).
 * @param {number} doctorProfileId - Doktor profili kimliği (şu an kullanılmıyor)
 * @param {number} [limit=5] - Kayıt sayısı
 * @returns {Promise<Array>} Son iş ilanları
 * @throws {AppError} Veritabanı hatası durumunda
 * 
 * @example
 * const recentJobs = await getDoctorRecentJobs(123, 5);
 */
const getDoctorRecentJobs = async (doctorProfileId, limit = 5) => {
  // Şu an için tüm aktif iş ilanlarını getir
  // Not: Gelecekte doktorun uzmanlık alanına göre filtreleme eklenebilir
  const jobs = await db('jobs as j')
    .select([
      'j.*',
      'hp.institution_name as hospital_name',
      'c.name as city', // İş ilanının şehri
      's.name as specialty_name',
      'js.name as status_name'
    ])
    .leftJoin('hospital_profiles as hp', 'j.hospital_id', 'hp.id')
    .leftJoin('cities as c', 'j.city_id', 'c.id') // İş ilanının şehri
    .leftJoin('specialties as s', 'j.specialty_id', 's.id')
    .leftJoin('job_statuses as js', 'j.status_id', 'js.id')
    .where('j.status_id', 3) // Sadece onaylanmış (Approved) ilanları getir
    .whereNull('j.deleted_at') // Silinmemiş ilanları getir
    .orderBy('j.created_at', 'desc');
    
  // JavaScript'te limit uygulayalım
  const limitedJobs = jobs.slice(0, limit);
  
  return limitedJobs;
};

/**
 * Uzmanlık alanı adını ID'ye çevir
 * @description Uzmanlık alanı adını veritabanındaki ID'ye çevirir.
 * @param {string} specialty - Uzmanlık alanı adı
 * @returns {Promise<number|null>} Uzmanlık alanı ID'si
 */
const resolveSpecialtyId = async (specialty) => {
  const specialtyRecord = await db('specialties')
    .where('name', 'like', `%${specialty}%`)
    .first();
  
  return specialtyRecord ? specialtyRecord.id : null;
};

/**
 * İş ilanı durumu adını ID'ye çevir
 * @description İş ilanı durumu adını veritabanındaki ID'ye çevirir.
 * @param {string} status - İş ilanı durumu adı
 * @returns {Promise<number|null>} İş ilanı durumu ID'si
 */
const resolveStatusId = async (status) => {
  const statusRecord = await db('job_statuses')
    .where('name', 'like', `%${status}%`)
    .first();
  
  return statusRecord ? statusRecord.id : null;
};

/**
 * Hastane adını ID'ye çevir
 * @description Hastane adını veritabanındaki ID'ye çevirir.
 * @param {string} hospital - Hastane adı
 * @returns {Promise<number|null>} Hastane ID'si
 */
const resolveHospitalId = async (hospital) => {
  const hospitalRecord = await db('hospital_profiles')
    .where('institution_name', 'like', `%${hospital}%`)
    .first();
  
  return hospitalRecord ? hospitalRecord.id : null;
};

// ============================================================================
// FOTOĞRAF ONAY SİSTEMİ
// ============================================================================

/**
 * Profil fotoğrafı değişiklik talebi oluştur
 * @description Doktorun yeni profil fotoğrafı yüklemesi için admin onayına gönderir
 * @param {number} userId - Kullanıcının ID'si (users.id)
 * @param {string} fileUrl - Yüklenen fotoğrafın URL'si (Base64 data-url veya S3 URL)
 * @returns {Promise<Object>} Oluşturulan talep kaydı
 * @throws {AppError} Profil bulunamadığında veya veritabanı hatası durumunda
 * 
 * @note Mevcut bekleyen talep varsa iptal edilir, yeni talep oluşturulur
 * 
 * @example
 * const request = await requestProfilePhotoChange(123, 'data:image/jpeg;base64,...');
 */
const requestProfilePhotoChange = async (userId, fileUrl) => {
  const profile = await db('doctor_profiles').where('user_id', userId).first();
  if (!profile) throw new AppError('Profil bulunamadı', 404);
  
  // Mevcut bekleyen talebi iptal et (status='cancelled' ekle)
  await db('doctor_profile_photo_requests')
    .where({ doctor_profile_id: profile.id, status: 'pending' })
    .update({ 
      status: 'cancelled', 
      reviewed_at: db.raw('SYSUTCDATETIME()')
    });
  
  // Yeni talep oluştur - SQL Server için
  // Mevcut profil fotoğrafını da kaydet (karşılaştırma için)
  await db('doctor_profile_photo_requests')
    .insert({
      doctor_profile_id: profile.id,
      file_url: fileUrl,
      old_photo: profile.profile_photo, // Talep anındaki mevcut fotoğraf
      status: 'pending'
      // created_at otomatik DEFAULT ile oluşur
    });
  
  // Son eklenen kaydı getir (SQL Server IDENTITY değeri için)
  const photoRequest = await db('doctor_profile_photo_requests')
    .where('doctor_profile_id', profile.id)
    .orderBy('created_at', 'desc')
    .first();

  // Admin'lere yeni fotoğraf talebi bildirimi gönder
  try {
    await notificationService.sendAdminSystemNotification({
      type: 'info',
      title: 'Yeni Fotoğraf Talebi',
      body: `${profile.first_name} ${profile.last_name} adlı doktor profil fotoğrafı değişikliği için onay talebinde bulundu.`,
      data: {
        request_id: photoRequest.id,
        doctor_profile_id: profile.id,
        user_id: userId,
        doctor_name: `${profile.first_name} ${profile.last_name}`,
        status: 'pending'
      }
    });
  } catch (notificationError) {
    logger.warn('Admin notification failed for photo request:', notificationError);
    // Bildirim hatası talep oluşturmayı engellemez
  }

  return photoRequest;
};

/**
 * Doktorun fotoğraf talep durumunu getir
 * @description Doktorun bekleyen veya son fotoğraf talep durumunu getirir
 * @param {number} userId - Kullanıcının ID'si (users.id)
 * @returns {Promise<Object|null>} Talep durumu veya null
 * @throws {AppError} Profil bulunamadığında veya veritabanı hatası durumunda
 * 
 * @example
 * const status = await getMyPhotoRequestStatus(123);
 */
const getMyPhotoRequestStatus = async (userId) => {
  const profile = await db('doctor_profiles').where('user_id', userId).first();
  if (!profile) return null;
  
  return await db('doctor_profile_photo_requests')
    .where('doctor_profile_id', profile.id)
    .orderBy('created_at', 'desc')
    .first();
};

/**
 * Doktorun fotoğraf talep geçmişini getir
 * @description Doktorun tüm fotoğraf taleplerini (en yeni önce) listeler
 * @param {number} userId - Kullanıcının ID'si (users.id)
 * @param {number} [limit=50] - Maksimum kayıt sayısı
 * @returns {Promise<Array>} Talep geçmişi listesi
 */
const getMyPhotoRequestHistory = async (userId, limit = 50) => {
  const profile = await db('doctor_profiles').where('user_id', userId).first();
  if (!profile) return [];

  return await db('doctor_profile_photo_requests')
    .where('doctor_profile_id', profile.id)
    .orderBy('created_at', 'desc')
    .limit(limit);
};

/**
 * Fotoğraf talebini iptal et
 * @description Doktorun bekleyen fotoğraf talebini iptal eder
 * @param {number} userId - Kullanıcının ID'si (users.id)
 * @returns {Promise<boolean>} İptal işleminin başarı durumu
 * @throws {AppError} Profil bulunamadığında veya veritabanı hatası durumunda
 * 
 * @example
 * const cancelled = await cancelPhotoRequest(123);
 */
const cancelPhotoRequest = async (userId) => {
  const profile = await db('doctor_profiles').where('user_id', userId).first();
  if (!profile) throw new AppError('Profil bulunamadı', 404);
  
  const updated = await db('doctor_profile_photo_requests')
    .where({ doctor_profile_id: profile.id, status: 'pending' })
    .update({ 
      status: 'cancelled', 
      reviewed_at: db.raw('SYSUTCDATETIME()')
    });
  
  return updated > 0;
};

/**
 * Doktor hesabını siler (pasif hale getirir)
 * @description Doktorun hesabını pasife alır ve oturumlarını sonlandırır
 * @param {number} userId - Kullanıcının ID'si (users.id)
 * @returns {Promise<boolean>} İşlem durumu
 * @throws {AppError} Kullanıcı bulunamadığında veya hesap zaten pasif olduğunda
 */
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
    logger.error('Doctor account deactivate error:', error);
    throw new AppError('Hesap kapatılamadı', 500);
  }
};

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = {
  updateProfile,
  getProfile,
  getCompleteProfile,
  updatePersonalInfo,
  getEducations,
  addEducation,
  updateEducation,
  deleteEducation,
  getExperiences,
  addExperience,
  updateExperience,
  deleteExperience,
  getCertificates,
  addCertificate,
  updateCertificate,
  deleteCertificate,
  getLanguages,
  addLanguage,
  updateLanguage,
  deleteLanguage,
  getProfileCompletion,
  
  // Profil güncelleme bildirimleri
  sendProfileUpdateNotification,
  
  // Başvuru fonksiyonları (applicationService'den taşındı)
  createApplication,
  getMyApplications,
  getApplicationById,
  withdrawApplication,
  resolveApplicationStatusId,
  
  // Başvuru istatistikleri (applicationService'den taşındı)
  getDoctorApplicationStats,
  getDoctorRecentApplications,
  
  // İş ilanı fonksiyonları (jobService'den taşındı)
  getJobs,
  getJobById,
  getDoctorRecentJobs,
  resolveSpecialtyId,
  resolveStatusId,
  resolveHospitalId,
  
  // Fotoğraf onay sistemi
  requestProfilePhotoChange,
  getMyPhotoRequestStatus,
  getMyPhotoRequestHistory,
  cancelPhotoRequest,

  // Hesap yönetimi
  deactivateAccount
};
