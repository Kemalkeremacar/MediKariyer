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
  const profile = await db('doctor_profiles as dp')
    .join('users as u', 'dp.user_id', 'u.id')
    .where('dp.user_id', userId)
    .select([
      'dp.*',
      'u.email'
    ])
    .first();
  
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

  // Paralel olarak tüm ilişkili verileri al
  const [educations, experiences, certificates, languages] = await Promise.all([
    db('doctor_educations').where('doctor_profile_id', profile.id).orderBy('graduation_year', 'desc'),
    db('doctor_experiences').where('doctor_profile_id', profile.id).orderBy('start_date', 'desc'),
    db('doctor_certificates').where('doctor_profile_id', profile.id).orderBy('certificate_year', 'desc'),
    db('doctor_languages').where('doctor_profile_id', profile.id).orderBy('level_id', 'desc')
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
  console.log('🔍 updatePersonalInfo called:', { userId, personalInfo });
  
  // validatedData'dan gelen değerleri doğrudan kullan
  const updateData = {
    ...personalInfo,
    updated_at: db.fn.now()
  };
  
  console.log('📝 Updating with data:', updateData);
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
 * @param {string} [educationData.education_type] - Eğitim türü (DİĞER seçildiğinde manuel giriş)
 * @param {string} educationData.education_institution - Eğitim kurumu
 * @param {string} [educationData.certificate_name] - Sertifika türü (opsiyonel, elle yazılır)
 * @param {number} [educationData.certificate_year] - Sertifika yılı (opsiyonel, sadece yıl)
 * @param {string} educationData.field - Alan adı
 * @param {number} educationData.graduation_year - Mezuniyet yılı
 * @returns {Promise<Object>} Eklenen eğitim kaydı
 * @throws {AppError} Profil bulunamadığında veya veritabanı hatası durumunda
 * 
 * @example
 * const education = await addEducation(123, {
 *   education_type_id: 1,
 *   education_institution: 'İstanbul Üniversitesi',
 *   education_type: 'Tıp Fakültesi',
 *   certificate_name: 'Tıp Doktoru Diploması',
 *   certificate_year: 2015,
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
    certificate_name: educationData.certificate_name,
    certificate_year: educationData.certificate_year,
    created_at: db.fn.now()
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
 * @example
 * const updatedEducation = await updateEducation(123, 456, {
 *   education_type_id: 2,
 *   education_institution: 'Ankara Üniversitesi',
 *   education_type: 'Uzmanlık',
 *   certificate_name: 'Kardiyoloji Uzmanlık Belgesi',
 *   certificate_year: 2020
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
    certificate_name: educationData.certificate_name,
    certificate_year: educationData.certificate_year
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
 * @param {string} experienceData.role_title - Pozisyon adı
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
    created_at: db.fn.now(),
    updated_at: db.fn.now()
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
    created_at: db.fn.now(),
    updated_at: db.fn.now()
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
 * Doktor sertifika bilgisini siler
 * @description Doktorun belirtilen sertifika kaydını ve varsa dosyasını siler
 * @param {number} userId - Kullanıcının ID'si (users.id)
 * @param {number} certificateId - Silinecek sertifika kaydının ID'si
 * @returns {Promise<boolean>} Silme işleminin başarı durumu
 * @throws {AppError} Profil bulunamadığında veya veritabanı hatası durumunda
 * 
 * @note Schema'ya göre file_path kolonu kullanılır, file_url değil
 */
const deleteCertificate = async (userId, certificateId) => {
  const profile = await db('doctor_profiles').where('user_id', userId).first();
  if (!profile) throw new AppError('Profil bulunamadı', 404);
  
  const certificate = await db('doctor_certificates').where({ id: certificateId, doctor_profile_id: profile.id }).first();
  if (!certificate) return false;

  // Schema'da sadece sertifika bilgileri (title, institution, issued_at) saklanıyor
  // Dosya yönetimi ayrı bir sistem ile yapılmalı (S3, Azure Blob vb.)
  
  const deleted = await db('doctor_certificates').where({ id: certificateId, doctor_profile_id: profile.id }).del();
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
    created_at: db.fn.now(),
    updated_at: db.fn.now()
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
 * Doktor dil bilgisini siler
 * @description Doktorun belirtilen dil kaydını siler
 * @param {number} userId - Kullanıcının ID'si (users.id)
 * @param {number} languageId - Silinecek dil kaydının ID'si
 * @returns {Promise<boolean>} Silme işleminin başarı durumu
 * @throws {AppError} Profil bulunamadığında veya veritabanı hatası durumunda
 */
const deleteLanguage = async (userId, languageId) => {
  const profile = await db('doctor_profiles').where('user_id', userId).first();
  if (!profile) throw new AppError('Profil bulunamadı', 404);
  
  const deleted = await db('doctor_languages').where({ id: languageId, doctor_profile_id: profile.id }).del();
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

  // Eğitim/Deneyim/Sertifika/Dil sayılarını al
  const counts = await Promise.all([
    db('doctor_educations').where('doctor_profile_id', profile.id).count('* as count').first(),
    db('doctor_experiences').where('doctor_profile_id', profile.id).count('* as count').first(),
    db('doctor_certificates').where('doctor_profile_id', profile.id).count('* as count').first(),
    db('doctor_languages').where('doctor_profile_id', profile.id).count('* as count').first()
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
    .orderBy('ll.name', 'desc');
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

  // İlan varlık ve durum kontrolü
  const jobs = await db('jobs')
    .select('*')
    .where('id', jobId);

  if (!jobs || jobs.length === 0) {
    throw new AppError(`jobs.id=${jobId} bulunamadı`, 400);
  }

  const job = jobs[0];

  // Status kontrolü için job_statuses tablosundan kontrol edelim
  if (job.status_id) {
    const statuses = await db('job_statuses')
      .select('name')
      .where('id', job.status_id);
    
    if (statuses && statuses.length > 0) {
      const statusName = statuses[0].name;
      if (statusName === 'Pasif') {
        throw new AppError('İlan durumu başvuruya kapalı', 400);
      }
    }
  }

  // Aynı doktorun aynı ilana daha önce başvurup başvurmadığını kontrol et
  const existingApplications = await db('applications')
    .where({
      doctor_profile_id: doctorProfileId,
      job_id: jobId
    });
  
  const existingApplication = existingApplications[0];

  if (existingApplication) {
    throw new AppError('Bu ilana daha önce başvuru yapılmış', 400);
  }

  // "Başvuruldu" durumunu al
  const pendingStatuses = await db('application_statuses')
    .where('name', 'Başvuruldu');
  
  const pendingStatus = pendingStatuses[0];

  if (!pendingStatus) {
    throw new AppError('application_statuses.name="Başvuruldu" bulunamadı', 500);
  }

  // Başvuru oluştur - SQL Server için OUTPUT clause kullan
  const insertedApplications = await db('applications')
    .insert({
      job_id: jobId,
      doctor_profile_id: doctorProfileId,
      status_id: pendingStatus.id,
      notes: coverLetter || null
    })
    .returning('id');

  const applicationId = insertedApplications[0].id;

  // Oluşturulan başvuruyu getir
  const application = await getApplicationById(applicationId, doctorProfileId);
  
  logger.info(`Application created: ${applicationId} for job ${jobId} by doctor ${doctorProfileId}`);
  
  return application;
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
      'c.name as job_city',
      'hp.institution_name as hospital_name',
      's.name as specialty_name'
    )
    .leftJoin('application_statuses as ast', 'a.status_id', 'ast.id')
    .leftJoin('jobs as j', 'a.job_id', 'j.id')
    .leftJoin('cities as c', 'j.city_id', 'c.id')
    .leftJoin('hospital_profiles as hp', 'j.hospital_id', 'hp.id')
    .leftJoin('specialties as s', 'j.specialty_id', 's.id')
    .where('a.doctor_profile_id', doctorProfileId);

  // Status filtresi
  if (status) {
    const statusId = await resolveApplicationStatusId(status);
    if (statusId) {
      query = query.where('a.status_id', statusId);
    }
  }

  // Toplam sayı için count query (aynı filtreleri kullan)
  let countQuery = db('applications as a')
    .where('a.doctor_profile_id', doctorProfileId);

  if (status) {
    const statusId = await resolveApplicationStatusId(status);
    if (statusId) {
      countQuery = countQuery.where('a.status_id', statusId);
    }
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

    // Job bilgilerini çekelim
    if (application.job_id) {
      const jobs = await db('jobs')
        .select([
          'id', 'title', 'description', 'city_id', 'employment_type',
          'min_experience_years', 'created_at', 'updated_at', 'hospital_id', 'specialty_id'
        ])
        .where('id', application.job_id);
    
      if (jobs && jobs.length > 0) {
        const job = jobs[0];
        Object.assign(application, {
          job_id: job.id,
          title: job.title,
          description: job.description,
          city_id: job.city_id,
          employment_type: job.employment_type,
          min_experience_years: job.min_experience_years,
          created_at: job.created_at,
          updated_at: job.updated_at
        });

        // City bilgisini almak için cities tablosuna join yapalım
        if (job.city_id) {
          const cities = await db('cities')
            .select('name')
            .where('id', job.city_id);
          
          if (cities && cities.length > 0) {
            application.city = cities[0].name;
          }
        }

      // Hospital bilgilerini çekelim
      if (job.hospital_id) {
        const hospitals = await db('hospital_profiles as hp')
          .select([
            'hp.institution_name',
            'c.name as city',
            'hp.address',
            'hp.phone',
            'hp.email'
          ])
          .leftJoin('cities as c', 'hp.city_id', 'c.id')
          .where('hp.id', job.hospital_id);
        
        if (hospitals && hospitals.length > 0) {
          const hospital = hospitals[0];
          Object.assign(application, {
            hospital_name: hospital.institution_name,
            hospital_city: hospital.city,
            hospital_address: hospital.address,
            hospital_phone: hospital.phone,
            hospital_email: hospital.email
          });
        }
      }

      // Specialty bilgisini çekelim
      if (job.specialty_id) {
        const specialties = await db('specialties')
          .select('name')
          .where('id', job.specialty_id);
        
        if (specialties && specialties.length > 0) {
          application.specialty_name = specialties[0].name;
        }
      }
    }
  }

  // Status bilgisini çekelim
  if (application.status_id) {
    const statuses = await db('application_statuses')
      .select('name')
      .where('id', application.status_id);
    
    if (statuses && statuses.length > 0) {
      application.status_name = statuses[0].name;
      application.status = statuses[0].name; // Frontend için
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
  // Başvuru varlık ve sahiplik kontrolü
  const application = await db('applications')
    .where('id', applicationId)
    .where('doctor_profile_id', doctorProfileId)
    .first();

  logger.info(`Application query result:`, { application, applicationId, doctorProfileId });

  if (!application) {
    // Debug için tüm başvuruları kontrol et
    const allApplications = await db('applications').select('*');
    logger.info(`All applications in database:`, allApplications);
    
    // Bu doktorun tüm başvurularını kontrol et
    const doctorApplications = await db('applications')
      .where('doctor_profile_id', doctorProfileId)
      .select('*');
    logger.info(`Doctor's applications:`, doctorApplications);
    
    throw new AppError('Başvuru bulunamadı', 404);
  }

  // Zaten geri çekilmiş mi kontrol et
  const withdrawnStatus = await db('application_statuses')
    .where('name', 'Geri Çekildi')
    .first();

  if (!withdrawnStatus) {
    throw new AppError('application_statuses.name="Geri Çekildi" bulunamadı', 500);
  }

  if (application.status_id === withdrawnStatus.id) {
    throw new AppError('Başvuru zaten geri çekilmiş', 400);
  }

  // Başvuruyu geri çek
  await db('applications')
    .where('id', applicationId)
    .update({
      status_id: withdrawnStatus.id,
      notes: reason ? `${application.notes || ''}\n\nGeri çekme sebebi: ${reason}`.trim() : application.notes
    });

  // Güncellenmiş başvuruyu getir
  const updatedApplication = await getApplicationById(applicationId, doctorProfileId);
  
  logger.info(`Application withdrawn: ${applicationId} by doctor ${doctorProfileId}`);
  
  return updatedApplication;
};

/**
 * Doktorlar için başvuruyu kalıcı olarak sil
 * @description Doktorlar için başvuruyu kalıcı olarak siler.
 * @param {number} applicationId - Başvuru kimliği
 * @param {number} doctorProfileId - Doktor profili kimliği
 * @returns {Promise<Object>} Silme sonucu
 * @throws {AppError} Başvuru bulunamadı, sahiplik hatası
 * 
 * @example
 * const result = await deleteApplication(123, 456);
 */
const deleteApplication = async (applicationId, doctorProfileId) => {
  // Başvuru varlık ve sahiplik kontrolü
  const application = await db('applications')
    .where('id', applicationId)
    .where('doctor_profile_id', doctorProfileId)
    .first();

  if (!application) {
    throw new AppError('Başvuru bulunamadı veya bu başvuruya erişim yetkiniz yok', 404);
  }

  // Başvuruyu kalıcı olarak sil
  await db('applications')
    .where('id', applicationId)
    .where('doctor_profile_id', doctorProfileId)
    .del();
  
  return { success: true, message: 'Başvuru kalıcı olarak silindi' };
};

/**
 * Doktorlar için geri çekilen başvuruya yeniden başvuru yap
 * @description Geri çekilen başvuruyu silip yeni başvuru oluşturur.
 * @param {number} applicationId - Mevcut başvuru kimliği
 * @param {number} doctorProfileId - Doktor profili kimliği
 * @param {string} [coverLetter] - Yeni ön yazı
 * @returns {Promise<Object>} Yeni başvuru
 * @throws {AppError} Başvuru bulunamadı, sahiplik hatası, geri çekilmemiş başvuru
 * 
 * @example
 * const application = await reapplyToJob(123, 456, 'Yeni ön yazı');
 */
const reapplyToJob = async (applicationId, doctorProfileId, coverLetter = '') => {
  // Mevcut başvuruyu kontrol et
  const existingApplication = await db('applications')
    .where('id', applicationId)
    .where('doctor_profile_id', doctorProfileId)
    .first();

  if (!existingApplication) {
    throw new AppError('Başvuru bulunamadı veya bu başvuruya erişim yetkiniz yok', 404);
  }

  // Sadece geri çekilen başvurular için yeniden başvuru yapılabilir
  const withdrawnStatus = await db('application_statuses')
    .where('name', 'Geri Çekildi')
    .first();

  if (!withdrawnStatus || existingApplication.status_id !== withdrawnStatus.id) {
    throw new AppError('Sadece geri çekilen başvurular için yeniden başvuru yapılabilir', 400);
  }

  // Geri çekilen başvuruyu sil
  await db('applications')
    .where('id', applicationId)
    .where('doctor_profile_id', doctorProfileId)
    .del();

  // Yeni başvuru oluştur
  const newApplication = await createApplication(doctorProfileId, {
    jobId: existingApplication.job_id,
    coverLetter: coverLetter
  });

  logger.info(`Application reapplied: ${applicationId} -> ${newApplication.id} by doctor ${doctorProfileId}`);
  
  return newApplication;
};

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
    .where('a.doctor_profile_id', doctorProfileId)
    .groupBy('as.name');

  const totalApplications = await db('applications')
    .where('doctor_profile_id', doctorProfileId)
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
  // Önce sadece applications tablosundan veri çekelim
  const applications = await db('applications')
    .select('*')
    .where('doctor_profile_id', doctorProfileId)
    .orderBy('applied_at', 'desc');

  // JavaScript'te limit uygulayalım
  const limitedApplications = applications.slice(0, limit);

  // Her application için ek bilgileri çekelim
  const enrichedApplications = await Promise.all(
    limitedApplications.map(async (app) => {
      const enrichedApp = { ...app };

      // Job bilgilerini çekelim
      if (app.job_id) {
        const jobs = await db('jobs')
          .select(['title', 'hospital_id'])
          .where('id', app.job_id);
        
        if (jobs && jobs.length > 0) {
          const job = jobs[0];
          enrichedApp.job_title = job.title;

          // Hospital bilgilerini çekelim
          if (job.hospital_id) {
            const hospitals = await db('hospital_profiles')
              .select('institution_name')
              .where('id', job.hospital_id);
            
            if (hospitals && hospitals.length > 0) {
              enrichedApp.hospital_name = hospitals[0].institution_name;
            }
          }
        }
      }

      // Status bilgisini çekelim
      if (app.status_id) {
        const statuses = await db('application_statuses')
          .select('name')
          .where('id', app.status_id);
        
        if (statuses && statuses.length > 0) {
          enrichedApp.status = statuses[0].name;
        }
      }

      // Frontend için created_at'i applied_at olarak ayarlayalım
      enrichedApp.created_at = enrichedApp.applied_at;

      return enrichedApp;
    })
  );
    
  return enrichedApplications;
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
    specialty,
    city,
    hospital,
    search,
    page = 1,
    limit = 10
  } = filters;

  // Sayfalama hesaplamaları
  const offset = (page - 1) * limit;

  // Base query - sadece aktif ilanlar (status_id = 1) ve silinmemiş ilanlar
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
    .leftJoin('cities as hc', 'hp.city_id', 'hc.id')
    .leftJoin('specialties as s', 'j.specialty_id', 's.id')
    .leftJoin('subspecialties as ss', 'j.subspecialty_id', 'ss.id')
    .leftJoin('cities as c', 'j.city_id', 'c.id')
    .leftJoin('job_statuses as js', 'j.status_id', 'js.id')
    .where('j.status_id', 1) // Sadece aktif ilanları getir
    .whereNull('j.deleted_at'); // Silinmemiş ilanları getir

  // Filtreleme
  if (specialty) {
    const specialtyId = await resolveSpecialtyId(specialty);
    if (specialtyId) {
      query = query.where('j.specialty_id', specialtyId);
    }
  }

  if (city) {
    query = query.where('c.name', 'like', `%${city}%`);
  }

  if (hospital) {
    const hospitalId = await resolveHospitalId(hospital);
    if (hospitalId) {
      query = query.where('j.hospital_id', hospitalId);
    }
  }

  if (search) {
    query = query.where(function() {
      this.where('j.title', 'like', `%${search}%`)
          .orWhere('j.description', 'like', `%${search}%`)
          .orWhere('hp.institution_name', 'like', `%${search}%`);
    });
  }

  // Toplam kayıt sayısı - ayrı query ile
  const countQuery = db('jobs as j')
    .leftJoin('hospital_profiles as hp', 'j.hospital_id', 'hp.id')
    .leftJoin('specialties as s', 'j.specialty_id', 's.id')
    .leftJoin('cities as c', 'j.city_id', 'c.id')
    .leftJoin('job_statuses as js', 'j.status_id', 'js.id')
    .where('j.status_id', 1) // Sadece aktif ilanları getir
    .whereNull('j.deleted_at'); // Silinmemiş ilanları getir

  // Filtreleme - count query için de aynı filtreler
  if (specialty) {
    const specialtyId = await resolveSpecialtyId(specialty);
    if (specialtyId) {
      countQuery.where('j.specialty_id', specialtyId);
    }
  }

  if (city) {
    countQuery.where('c.name', 'like', `%${city}%`);
  }

  if (hospital) {
    const hospitalId = await resolveHospitalId(hospital);
    if (hospitalId) {
      countQuery.where('j.hospital_id', hospitalId);
    }
  }

  if (search) {
    countQuery.where(function() {
      this.where('j.title', 'like', `%${search}%`)
          .orWhere('j.description', 'like', `%${search}%`)
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
const getJobById = async (id) => {
  // Önce sadece jobs tablosundan veri çekelim - aktif ve silinmemiş ilanlar
  const jobs = await db('jobs')
    .select('*')
    .where('id', id)
    .where('status_id', 1) // Sadece aktif ilanlar
    .whereNull('deleted_at'); // Silinmemiş ilanlar

  if (!jobs || jobs.length === 0) {
    throw new AppError('İş ilanı bulunamadı', 404);
  }

  const job = jobs[0];

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
      .where('hp.id', job.hospital_id);
    
    if (hospitals && hospitals.length > 0) {
      Object.assign(job, hospitals[0]);
    }
  }

  // Eğer specialty_id varsa specialty bilgisini çekelim
  if (job.specialty_id) {
    const specialties = await db('specialties')
      .select('name as specialty_name')
      .where('id', job.specialty_id);
    
    if (specialties && specialties.length > 0) {
      job.specialty_name = specialties[0].specialty_name;
    }
  }

  // Eğer subspecialty_id varsa subspecialty bilgisini çekelim
  if (job.subspecialty_id) {
    const subspecialties = await db('subspecialties')
      .select('name as subspecialty_name')
      .where('id', job.subspecialty_id);
    
    if (subspecialties && subspecialties.length > 0) {
      job.subspecialty_name = subspecialties[0].subspecialty_name;
    }
  }

  // Eğer status_id varsa status bilgisini çekelim
  if (job.status_id) {
    const statuses = await db('job_statuses')
      .select('name as status_name')
      .where('id', job.status_id);
    
    if (statuses && statuses.length > 0) {
      job.status_name = statuses[0].status_name;
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
      'c.name as hospital_city',
      's.name as specialty_name',
      'js.name as status_name'
    ])
    .leftJoin('hospital_profiles as hp', 'j.hospital_id', 'hp.id')
    .leftJoin('cities as c', 'hp.city_id', 'c.id')
    .leftJoin('specialties as s', 'j.specialty_id', 's.id')
    .leftJoin('job_statuses as js', 'j.status_id', 'js.id')
    .where('js.name', 'Aktif') // Sadece aktif ilanları getir
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
  return await db('doctor_profile_photo_requests')
    .where('doctor_profile_id', profile.id)
    .orderBy('created_at', 'desc')
    .first();
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
  deleteApplication,
  reapplyToJob,
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
  cancelPhotoRequest
};
