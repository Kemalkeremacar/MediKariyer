/**
 * @file authService.js
 * @description Kimlik doğrulama (authentication) servisi - Kullanıcı kayıt, giriş, token yönetimi ve profil oluşturma işlemlerini yönetir.
 * Bu servis, authController tarafından kullanılan temel authentication işlemlerini içerir.
 * 
 * Ana İşlevler:
 * - Kullanıcı kayıt işlemleri (doctor/hospital profil oluşturma)
 * - Kimlik doğrulama (email/password kontrolü)
 * - Refresh token yönetimi
 * - Kullanıcı profil bilgileri
 * - Token temizleme işlemleri
 * 
 * Veritabanı Tabloları:
 * - users: Kullanıcı bilgileri
 * - doctor_profiles: Doktor profil bilgileri
 * - hospital_profiles: Hastane profil bilgileri
 * - refresh_tokens: Yenileme token'ları
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

'use strict';

const bcrypt = require('bcryptjs');
const db = require('../config/dbConfig').db;
const { AppError } = require('../utils/errorHandler');
const logger = require('../utils/logger');
const jwtUtils = require('../utils/jwtUtils');

// ==================== TYPE DEFINITIONS ====================
/**
 * @typedef {object} User
 * @description Users tablosundaki kullanıcı bilgilerini temsil eder
 * @property {number} id - Kullanıcının benzersiz ID'si (Primary Key)
 * @property {string} email - Kullanıcının e-posta adresi (Unique)
 * @property {string} password_hash - Kullanıcının bcrypt ile hashlenmiş şifresi
 * @property {'doctor' | 'hospital' | 'admin'} role - Kullanıcının rolü
 * @property {boolean} is_active - Hesabın aktif olup olmadığı (admin tarafından kontrol edilir)
 * @property {boolean} is_approved - Hesabın admin tarafından onaylanıp onaylanmadığı
 * @property {Date} [last_login] - Son giriş tarihi (ilk girişte null)
 * @property {Date} created_at - Kayıt oluşturulma tarihi
 * @property {Date} updated_at - Kayıt güncellenme tarihi
 */

/**
 * @typedef {object} DoctorProfile
 * @description Doctor_profiles tablosundaki doktor profil bilgilerini temsil eder
 * @property {number} id - Profil ID'si (Primary Key)
 * @property {number} user_id - Kullanıcı ID'si (Foreign Key to users.id)
 * @property {string} first_name - Doktorun adı
 * @property {string} last_name - Doktorun soyadı
 * @property {Date} [dob] - Doğum tarihi (opsiyonel)
 * @property {string} [birth_place] - Doğum yeri (opsiyonel)
 * @property {string} [residence_city] - İkamet şehri (opsiyonel)
 * @property {string} [phone] - Telefon numarası (opsiyonel)
 * @property {Date} created_at - Profil oluşturulma tarihi
 * @property {Date} updated_at - Profil güncellenme tarihi
 */

/**
 * @typedef {object} HospitalProfile
 * @description Hospital_profiles tablosundaki hastane profil bilgilerini temsil eder
 * @property {number} id - Profil ID'si (Primary Key)
 * @property {number} user_id - Kullanıcı ID'si (Foreign Key to users.id)
 * @property {string} institution_name - Kurum adı (zorunlu)
 * @property {string} city - Şehir (zorunlu)
 * @property {string} address - Adres (zorunlu)
 * @property {string} [phone] - Telefon numarası (opsiyonel)
 * @property {string} [email] - Kurum e-posta adresi (opsiyonel)
 * @property {string} [website] - Web sitesi URL'si (opsiyonel)
 * @property {string} [about] - Kurum hakkında bilgi (opsiyonel)
 * @property {Date} created_at - Profil oluşturulma tarihi
 * @property {Date} updated_at - Profil güncellenme tarihi
 */
// ==================== END TYPE DEFINITIONS ====================

// ==================== PROFILE CREATION FUNCTIONS ====================

/**
 * Doktor profili oluşturur
 * @description Yeni kayıt olan doktor kullanıcısı için doctor_profiles tablosunda profil kaydı oluşturur
 * @param {number} userId - Kullanıcının ID'si (users.id)
 * @param {object} profileData - Profil bilgileri
 * @param {string} profileData.first_name - Doktorun adı
 * @param {string} profileData.last_name - Doktorun soyadı
 * @param {string} profileData.title - Ünvan (Dr, Uz.Dr, Dr.Öğr.Üyesi, Doç.Dr, Prof.Dr)
 * @param {number} profileData.specialty_id - Branş (lookup'tan id)
 * @param {number} [profileData.subspecialty_id] - Yan dal (lookup'tan id)
 * @param {string} profileData.profile_photo - Profil fotoğrafı (zorunlu)
 * @returns {Promise<number>} Oluşturulan profil ID'si
 * @throws {AppError} Veritabanı hatası durumunda
 * 
 * @example
 * const profileId = await createDoctorProfile(123, {
 *   first_name: 'Ahmet',
 *   last_name: 'Yılmaz',
 *   title: 'Dr',
 *   specialty_id: 1,
 *   subspecialty_id: 2,
 *   profile_photo: '/uploads/photo.jpg'
 * });
 */
const createDoctorProfile = async (userId, { first_name, last_name, title, specialty_id, subspecialty_id, profile_photo }, trx = null) => {
  logger.info(`createDoctorProfile called with userId: ${userId}`, {
    userId,
    userIdType: typeof userId,
    first_name,
    last_name,
    title,
    specialty_id,
    subspecialty_id,
    profile_photo,
    hasTransaction: !!trx
  });

  const dbInstance = trx || db;
  
  const insertData = {
    user_id: userId,
    first_name,
    last_name,
    title: title || 'Dr', // Default 'Dr' if not provided
    specialty_id,
    subspecialty_id: subspecialty_id || null,
    profile_photo,
    created_at: dbInstance.fn.now(),
    updated_at: dbInstance.fn.now()
  };

  logger.info(`Inserting doctor profile with data:`, insertData);

  await dbInstance('doctor_profiles').insert(insertData);

  // Oluşturulan profilin ID'sini al
  const profile = await dbInstance('doctor_profiles').where('user_id', userId).first();
  const profileId = profile.id;

  logger.info(`Doctor profile inserted with ID: ${profileId}`);

  return profileId;
};

/**
 * Hastane profili oluşturur
 * @description Yeni kayıt olan hastane kullanıcısı için hospital_profiles tablosunda profil kaydı oluşturur
 * @param {number} userId - Kullanıcının ID'si (users.id)
 * @param {object} profileData - Profil bilgileri
 * @param {string} profileData.institution_name - Kurum adı (zorunlu)
 * @param {string} profileData.city - Şehir (zorunlu)
 * @param {string} profileData.address - Adres (zorunlu)
 * @param {string} [profileData.phone] - Telefon numarası (opsiyonel)
 * @param {string} [profileData.email] - Kurum e-posta adresi (opsiyonel)
 * @param {string} [profileData.website] - Web sitesi URL'si (opsiyonel)
 * @param {string} [profileData.about] - Kurum hakkında bilgi (opsiyonel)
 * @returns {Promise<number>} Oluşturulan profil ID'si
 * @throws {AppError} Veritabanı hatası durumunda
 * 
 * @example
 * const profileId = await createHospitalProfile(123, {
 *   institution_name: 'Acıbadem Hastanesi',
 *   city: 'İstanbul',
 *   address: 'Kadıköy Mahallesi, Acıbadem Caddesi No:1',
 *   phone: '+905551234567',
 *   email: 'info@acibadem.com',
 *   website: 'https://www.acibadem.com',
 *   about: 'Modern sağlık hizmetleri sunan hastane'
 * });
 */
const createHospitalProfile = async (userId, { institution_name, city, address, phone, email, website, about }) => {
  const [profileId] = await db('hospital_profiles').insert({
    user_id: userId,
    institution_name,
    city,
    address,
    phone,
    email,
    website,
    about,
    created_at: db.fn.now(),
    updated_at: db.fn.now()
  });

  return profileId;
};
// ==================== END PROFILE CREATION FUNCTIONS ====================

// ==================== REFRESH TOKEN FUNCTIONS ====================

/**
 * Refresh token'ı veritabanında arar (DEPRECATED - jwtUtils.verifyRefreshTokenRecord kullanın)
 * @deprecated Bu fonksiyon bcrypt compare yapmadığı için kullanılmamalı
 * @description Verilen token hash'ini refresh_tokens tablosunda arar ve geçerliliğini kontrol eder
 * @param {string} token - Aranacak token hash'i
 * @returns {Promise<object|null>} Token kaydı bulunursa obje, bulunamazsa null
 * 
 * @example
 * const tokenRecord = await findRefreshToken('hashed_token_string');
 * if (tokenRecord) {
 *   // Token geçerli
 * }
 */
const findRefreshToken = async (token) => {
  // ⚠️ BU FONKSİYON YANLIŞ! BCRYPT COMPARE YAPMIYOR!
  // jwtUtils.verifyRefreshTokenRecord kullanın
  return db('refresh_tokens')
    .where('token_hash', token)
    .where('expires_at', '>', db.fn.now())
    .first();
};
// ==================== END REFRESH TOKEN FUNCTIONS ====================


// ==================== CREDENTIALS & LOGIN FUNCTIONS ====================

/**
 * Kullanıcı kimlik bilgilerini doğrular
 * @description Email ve şifre ile kullanıcı girişi yapar, hesap durumunu kontrol eder
 * @param {string} email - Kullanıcının e-posta adresi
 * @param {string} password - Kullanıcının şifresi (plain text)
 * @returns {Promise<User|null>} Kimlik bilgileri doğruysa kullanıcı objesi, yanlışsa null
 * @throws {AppError} Hesap pasif veya onaylanmamış durumda
 * 
 * Güvenlik Kontrolleri:
 * - Admin için is_active kontrolü yapılmaz
 * - Admin için is_approved kontrolü yapılmaz
 * - Diğer kullanıcılar için hem is_active hem is_approved kontrolü yapılır
 * 
 * @example
 * const user = await validateCredentials('user@example.com', 'password123');
 * if (user) {
 *   // Giriş başarılı
 * }
 */
const validateCredentials = async (email, password) => {
  const user = await db('users')
    .where('email', email)
    .first();

  if (!user) return null;
  
  // Admin için is_active kontrolü yapılmaz, diğer kullanıcılar için yapılır
  if (user.role !== 'admin' && !user.is_active) {
    throw new AppError('Hesabınız admin tarafından pasifleştirilmiştir. Lütfen sistem yöneticisi ile iletişime geçin.', 403);
  }
  
  // Admin için is_approved kontrolü yapılmaz, diğer kullanıcılar için yapılır
  if (user.role !== 'admin' && !user.is_approved) {
    // Bu mesaj kullanıcıya gösterilmeli, server loglarına yazılmamalı
    throw new AppError('Hesabınız admin onayını bekliyor. Onaylandıktan sonra giriş yapabilirsiniz.', 403);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  return isPasswordValid ? user : null;
};

/**
 * Unified login - herhangi bir role ile giriş
 * @description Tüm kullanıcı rolleri için tek giriş fonksiyonu
 * @param {string} email - Kullanıcının e-posta adresi
 * @param {string} password - Kullanıcının şifresi
 * @returns {Promise<User>} Giriş yapan kullanıcı bilgileri (isFirstLogin flag'i ile)
 * @throws {AppError} Geçersiz kimlik bilgileri veya hesap durumu
 * 
 * @example
 * const user = await loginUnified('doctor@example.com', 'password123');
 * logger.info('İlk giriş:', user.isFirstLogin); // İlk giriş mi?
 */
const loginUnified = async (email, password) => {
  const user = await validateCredentials(email, password);
  if (!user) throw new AppError('Geçersiz email veya şifre', 401);
  
  // validateCredentials zaten onay kontrolü yapıyor, tekrar yapmaya gerek yok
  const loginInfo = await updateLastLogin(user.id);
  return { ...user, isFirstLogin: loginInfo.isFirstLogin };
};
// ==================== END CREDENTIALS & LOGIN FUNCTIONS ====================

// ==================== REFRESH TOKEN VALIDATION FUNCTIONS ====================

/**
 * Refresh token'ı doğrular ve kullanıcı bilgilerini döndürür
 * @description Refresh token'ın geçerliliğini kontrol eder ve kullanıcı durumunu doğrular
 * @param {string} refreshToken - Doğrulanacak refresh token
 * @returns {Promise<{user: User, tokenRecord: object}>} Kullanıcı ve token kaydı
 * @throws {AppError} Geçersiz token, kullanıcı bulunamadı veya hesap durumu
 * 
 * Güvenlik Kontrolleri:
 * - Token'ın varlığı ve süresi kontrol edilir (bcrypt compare ile)
 * - Kullanıcının varlığı kontrol edilir
 * - Admin olmayan kullanıcılar için is_active kontrolü yapılır
 * - Admin olmayan kullanıcılar için is_approved kontrolü yapılır
 * 
 * @example
 * const { user, tokenRecord } = await validateRefreshToken('refresh_token_string');
 * // Token geçerli, yeni access token oluşturulabilir
 */
const validateRefreshToken = async (refreshToken) => {
  // ✅ FIX: jwtUtils.verifyRefreshTokenRecord kullan (bcrypt compare yapıyor)
  const tokenRecord = await jwtUtils.verifyRefreshTokenRecord(refreshToken);
  if (!tokenRecord) throw new AppError('Geçersiz refresh token', 401);

  const user = await db('users')
    .where('id', tokenRecord.user_id)
    .first();

  if (!user) {
    await db('refresh_tokens').where('id', tokenRecord.id).del();
    throw new AppError('Kullanıcı bulunamadı', 401);
  }

  // Admin için is_active kontrolü yapılmaz, diğer kullanıcılar için yapılır
  if (user.role !== 'admin' && !user.is_active) {
    await db('refresh_tokens').where('user_id', user.id).del();
    throw new AppError('Hesabınız pasif durumda. Lütfen yöneticinizle iletişime geçin.', 403);
  }

  // Admin için onay kontrolü yok
  if (user.role !== 'admin' && !user.is_approved) {
    await db('refresh_tokens').where('user_id', user.id).del();
    throw new AppError('Hesabınız admin onayını bekliyor. Onaylandıktan sonra giriş yapabilirsiniz.', 403);
  }

  return { user, tokenRecord };
};
// ==================== END REFRESH TOKEN VALIDATION FUNCTIONS ====================

// ==================== PROFILE & USER HELPER FUNCTIONS ====================

/**
 * Kullanıcının profil bilgilerini getirir
 * @description Role'e göre ilgili profil tablosundan kullanıcı bilgilerini döndürür
 * @param {number} userId - Kullanıcının ID'si
 * @param {string} role - Kullanıcının rolü ('doctor' | 'hospital')
 * @returns {Promise<DoctorProfile|HospitalProfile|null>} Profil bilgileri veya null
 * 
 * @example
 * const profile = await getUserProfile(123, 'doctor');
 * if (profile) {
 *   console.log(profile.first_name, profile.last_name);
 * }
 */
const getUserProfile = async (userId, role) => {
  if (role === 'doctor') {
    return db('doctor_profiles').where('user_id', userId).first();
  } else if (role === 'hospital') {
    return db('hospital_profiles').where('user_id', userId).first();
  }
  return null;
};

/**
 * Kullanıcının son giriş tarihini günceller
 * @description Giriş yapan kullanıcının last_login alanını günceller ve ilk giriş kontrolü yapar
 * @param {number} userId - Kullanıcının ID'si
 * @returns {Promise<{isFirstLogin: boolean}>} İlk giriş olup olmadığı bilgisi
 * 
 * @example
 * const loginInfo = await updateLastLogin(123);
 * if (loginInfo.isFirstLogin) {
 *   // İlk giriş, hoş geldin mesajı göster
 * }
 */
const updateLastLogin = async (userId) => {
  // Kullanıcının mevcut last_login değerini al
  const user = await db('users').where('id', userId).select('last_login').first();
  const isFirstLogin = !user.last_login;
  
  // Last login'i güncelle
  await db('users')
    .where('id', userId)
    .update({ last_login: db.fn.now(), updated_at: db.fn.now() });
  
  return { isFirstLogin };
};

/**
 * E-posta adresinin kayıtlı olup olmadığını kontrol eder
 * @description Yeni kayıt işlemlerinde e-posta tekrarını önlemek için kullanılır
 * @param {string} email - Kontrol edilecek e-posta adresi
 * @returns {Promise<boolean>} E-posta kayıtlıysa true, değilse false
 * 
 * @example
 * const isRegistered = await isEmailRegistered('user@example.com');
 * if (isRegistered) {
 *   throw new AppError('Bu e-posta adresi zaten kayıtlı', 400);
 * }
 */
const isEmailRegistered = async (email) => {
  const user = await db('users').where('email', email).first();
  return !!user;
};

/**
 * Yeni kullanıcı hesabı oluşturur
 * @description Transaction kullanarak güvenli kullanıcı kaydı yapar
 * @param {object} userData - Kullanıcı bilgileri
 * @param {string} userData.email - E-posta adresi
 * @param {string} userData.password_hash - Hashlenmiş şifre
 * @param {string} userData.role - Kullanıcı rolü
 * @returns {Promise<User>} Oluşturulan kullanıcı bilgileri
 * @throws {AppError} Veritabanı hatası durumunda
 * 
 * @example
 * const user = await createUserAccount({
 *   email: 'user@example.com',
 *   password_hash: 'hashed_password',
 *   role: 'doctor'
 * });
 */
const createUserAccount = async (userData) => {
  const trx = await db.transaction();
  try {
    const [userId] = await trx('users').insert({
      ...userData,
      created_at: new Date(),
      updated_at: new Date()
    });

    await trx.commit();
    return db('users').where('id', userId).first();
  } catch (error) {
    await trx.rollback();
    throw error;
  }
};
// ==================== END PROFILE & USER HELPER FUNCTIONS ====================



// ==================== TOKEN CLEANUP FUNCTIONS ====================

/**
 * Süresi dolmuş refresh token'ları temizler
 * @description Sistem performansını artırmak için süresi dolmuş token'ları veritabanından siler
 * @returns {Promise<{refresh_tokens: number}>} Silinen token sayıları
 * 
 * Bu fonksiyon genellikle cron job veya scheduled task olarak çalıştırılır.
 * 
 * @example
 * const result = await cleanupExpiredTokens();
 * console.log(`${result.refresh_tokens} refresh token silindi`);
 */
const cleanupExpiredTokens = async () => {
  const now = db.fn.now();

  try {
    const deletedRefreshTokens = await db('refresh_tokens')
      .where('expires_at', '<', now)
      .del();

    logger.info(`Cleaned up ${deletedRefreshTokens} refresh tokens`);

    return {
      refresh_tokens: deletedRefreshTokens
    };
  } catch (error) {
    logger.warn('Token cleanup sırasında hata:', error.message);
    return { refresh_tokens: 0 };
  }
};
// ==================== END TOKEN CLEANUP FUNCTIONS ====================

// ==================== REGISTRATION FUNCTIONS ====================

/**
 * Doktor kayıt işlemi
 * @description Yeni doktor kullanıcısı kaydı yapar ve doctor_profiles tablosunda profil oluşturur
 * @param {Object} registrationData - Kayıt verileri
 * @param {string} registrationData.email - E-posta adresi
 * @param {string} registrationData.password - Şifre (plain text)
 * @param {string} registrationData.first_name - Doktorun adı
 * @param {string} registrationData.last_name - Doktorun soyadı
 * @param {string} registrationData.title - Ünvan (Dr, Uz.Dr, Dr.Öğr.Üyesi, Doç.Dr, Prof.Dr)
 * @param {number} registrationData.specialty_id - Branş (lookup'tan id)
 * @param {number} [registrationData.subspecialty_id] - Yan dal (lookup'tan id)
 * @param {string} registrationData.profile_photo - Profil fotoğrafı (zorunlu)
 * @returns {Promise<{user: User, profile: DoctorProfile}>} Oluşturulan kullanıcı ve profil bilgileri
 * @throws {AppError} E-posta zaten kayıtlıysa veya veritabanı hatası
 * 
 * @example
 * const result = await registerDoctor({
 *   email: 'doctor@example.com',
 *   password: 'password123',
 *   first_name: 'Ahmet',
 *   last_name: 'Yılmaz',
 *   title: 'Dr',
 *   specialty_id: 1,
 *   subspecialty_id: 2,
 *   profile_photo: '/uploads/photo.jpg'
 * });
 */
const registerDoctor = async (registrationData) => {
  const { email, password, first_name, last_name, title, specialty_id, subspecialty_id, profile_photo } = registrationData;

  logger.info(`Doctor registration started | Data: ${JSON.stringify({ email, title, specialty_id })}`);

  try {
    // E-posta kontrolü
    const existingUser = await isEmailRegistered(email);
    if (existingUser) {
      throw new AppError('Bu e-posta adresi zaten kayıtlı', 400);
    }

    // Şifreyi hash'le
    const password_hash = await bcrypt.hash(password, 12);
    logger.info(`Password hashed successfully for: ${email}`);

    // Transaction başlat
    const trx = await db.transaction();

    try {
      // Kullanıcıyı oluştur
      await trx('users').insert({
        email,
        password_hash,
        role: 'doctor',
        is_approved: false,
        is_active: true,
        created_at: trx.fn.now(),
        updated_at: trx.fn.now()
      });

      // Oluşturulan kullanıcının ID'sini al
      const user = await trx('users').where('email', email).first();
      const userId = user.id;

      logger.info(`User created with ID: ${userId} for email: ${email}`, {
        userId,
        userIdType: typeof userId,
        userIdValue: userId
      });

      // userId kontrolü
      if (!userId || userId === null || userId === undefined) {
        throw new AppError('User ID oluşturulamadı', 500);
      }

      // Doktor profilini oluştur
      logger.info(`Creating doctor profile for userId: ${userId}`, {
        userId,
        first_name,
        last_name,
        title,
        specialty_id,
        subspecialty_id,
        profile_photo
      });
      
      const profileId = await createDoctorProfile(userId, { 
        first_name, 
        last_name, 
        title, 
        specialty_id, 
        subspecialty_id, 
        profile_photo 
      }, trx);
      
      logger.info(`Doctor profile created with ID: ${profileId} for user: ${userId}`);

      // Transaction'ı commit et
      await trx.commit();

      // Oluşturulan kullanıcıyı getir
      const createdUser = await db('users').where('id', userId).first();
      const createdProfile = await db('doctor_profiles').where('id', profileId).first();

      logger.info(`Doctor registration completed for: ${email}`, {
        userId: createdUser.id,
        profileId: createdProfile.id
      });

      return { user: createdUser, profile: createdProfile };
    } catch (error) {
      // Transaction'ı rollback et
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    logger.error(`Doctor registration error | Data: ${JSON.stringify({ email, error: error.message })}`);
    throw error;
  }
};

/**
 * Hastane kayıt işlemi
 * @description Yeni hastane kullanıcısı kaydı yapar ve hospital_profiles tablosunda profil oluşturur
 * @param {Object} registrationData - Kayıt verileri
 * @param {string} registrationData.email - E-posta adresi
 * @param {string} registrationData.password - Şifre (plain text)
 * @param {string} registrationData.institution_name - Kurum adı
 * @param {string} registrationData.city - Şehir
 * @param {string} registrationData.address - Adres
 * @param {string} [registrationData.phone] - Telefon numarası
 * @param {string} [registrationData.website] - Web sitesi URL'si
 * @param {string} [registrationData.about] - Kurum hakkında bilgi
 * @returns {Promise<{user: User, profile: HospitalProfile}>} Oluşturulan kullanıcı ve profil bilgileri
 * @throws {AppError} E-posta zaten kayıtlıysa veya veritabanı hatası
 * 
 * @example
 * const result = await registerHospital({
 *   email: 'hospital@example.com',
 *   password: 'password123',
 *   institution_name: 'Acıbadem Hastanesi',
 *   city: 'İstanbul',
 *   address: 'Kadıköy Mahallesi, Acıbadem Caddesi No:1'
 * });
 */
const registerHospital = async (registrationData) => {
  const { email, password, institution_name } = registrationData;

  // E-posta kontrolü
  if (await isEmailRegistered(email)) {
    throw new AppError('Bu e-posta adresi zaten kayıtlı', 409);
  }

  // Şifreyi hash'le
  const password_hash = await bcrypt.hash(password, 12);

  // Transaction ile güvenli kayıt
  const trx = await db.transaction();
  try {
    // Kullanıcı hesabı oluştur
    await trx('users').insert({
      email,
      password_hash,
      role: 'hospital',
      is_approved: false, // Admin onayı bekler
      is_active: true,
      created_at: trx.fn.now(),
      updated_at: trx.fn.now()
    });

    // Oluşturulan kullanıcının ID'sini al
    const user = await trx('users').where('email', email).first();
    const userId = user.id;

    // Hastane profili oluştur (tüm gelen verilerle)
    await trx('hospital_profiles').insert({
      user_id: userId,
      institution_name,
      city: null,
      address: null,
      phone: null,
      email: email, // Kurum email'i için users tablosundaki email'i kullan
      website: null,
      about: null,
      created_at: trx.fn.now(),
      updated_at: trx.fn.now()
    });

    // Oluşturulan profilin ID'sini al
    const profile = await trx('hospital_profiles').where('user_id', userId).first();
    const profileId = profile.id;

    await trx.commit();

    // Oluşturulan verileri getir
    const createdUser = await db('users').where('id', userId).first();
    const createdProfile = await db('hospital_profiles').where('id', profileId).first();

    return { user: createdUser, profile: createdProfile };
  } catch (error) {
    await trx.rollback();
    throw new AppError(`Hastane kaydı oluşturulamadı: ${error.message}`, 500);
  }
};

// ==================== END REGISTRATION FUNCTIONS ====================

// ==================== TOKEN MANAGEMENT FUNCTIONS ====================

/**
 * Refresh token ile yeni access token oluşturur
 * @description Geçerli refresh token ile yeni access token üretir
 * @param {string} refreshToken - Geçerli refresh token
 * @returns {Promise<{accessToken: string, refreshToken: string, user: User}>} Yeni token'lar ve kullanıcı bilgileri
 * @throws {AppError} Geçersiz refresh token veya kullanıcı durumu
 * 
 * @example
 * const result = await refreshToken('valid_refresh_token');
 * console.log('Yeni access token:', result.accessToken);
 */
const refreshToken = async (refreshToken) => {
  const { user, tokenRecord } = await validateRefreshToken(refreshToken);

  // jwtUtils artık dosya başında import edildi
  const { DEFAULT_SYSTEM_SETTINGS } = require('../config/appConstants');
  
  // Yeni access token oluştur
  const accessToken = jwtUtils.generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role
  });

  // Yeni refresh token oluştur
  const newRefreshToken = jwtUtils.generateRefreshToken();
  const newRefreshTokenHash = jwtUtils.hashRefreshToken(newRefreshToken);

  // Eski refresh token'ı sil, yenisini ekle
  // Refresh token süresini appConstants'tan al
  const refreshTokenExpiry = DEFAULT_SYSTEM_SETTINGS.refresh_token_expiry || '7d';
  
  // Süreyi parse et (7d -> 7 gün)
  const days = parseInt(refreshTokenExpiry.replace('d', ''));
  const expiryTime = days * 24 * 60 * 60 * 1000; // milisaniye cinsinden
  
  await db.transaction(async (trx) => {
    await trx('refresh_tokens').where('id', tokenRecord.id).del();
    
    await trx('refresh_tokens').insert({
      user_id: user.id,
      token_hash: newRefreshTokenHash,
      expires_at: new Date(Date.now() + expiryTime),
      created_at: new Date()
    });
  });

  return {
    accessToken,
    refreshToken: newRefreshToken,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      is_approved: user.is_approved,
      is_active: user.is_active
    }
  };
};

/**
 * Çıkış yap (belirli refresh token ile)
 * @description Kullanıcının belirli bir refresh token'ını geçersiz kılar (tek cihaz çıkışı)
 * @param {string} refreshToken - Geçersiz kılınacak refresh token
 * @returns {Promise<boolean>} İşlem başarılıysa true
 * @throws {AppError} Token bulunamazsa veya veritabanı hatası
 * 
 * @example
 * const success = await logout('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
 * console.log('Tek cihaz çıkışı:', success);
 */
const logout = async (refreshToken) => {
  try {
    // Refresh token'ı hash'le
    const tokenHash = jwtUtils.hashRefreshToken(refreshToken);
    
    // Belirli refresh token'ı sil
    const deletedCount = await db('refresh_tokens')
      .where('token_hash', tokenHash)
      .del();

    if (deletedCount === 0) {
      throw new AppError('Refresh token bulunamadı', 404);
    }

    logger.info(`Refresh token deleted. Count: ${deletedCount}`);
    return true;
  } catch (error) {
    logger.error('Logout error:', error);
    throw new AppError('Çıkış işlemi başarısız', 500);
  }
};

/**
 * Tüm cihazlardan çıkış yap
 * @description Kullanıcının tüm refresh token'larını geçersiz kılar (tüm cihazlar çıkışı)
 * @param {number} userId - Kullanıcının ID'si
 * @returns {Promise<boolean>} İşlem başarılıysa true
 * @throws {AppError} Veritabanı hatası
 * 
 * @example
 * const success = await logoutAll(123);
 * console.log('Tüm cihazlar çıkışı:', success);
 */
const logoutAll = async (userId) => {
  try {
    // Kullanıcının tüm refresh token'larını sil
    const deletedCount = await db('refresh_tokens')
      .where('user_id', userId)
      .del();

    logger.info(`User ${userId} logged out from all devices. ${deletedCount} refresh tokens deleted.`);
    return true;
  } catch (error) {
    logger.error('Logout all error:', error);
    throw new AppError('Tüm cihazlardan çıkış işlemi başarısız', 500);
  }
};

// ==================== END TOKEN MANAGEMENT FUNCTIONS ====================

// ==================== MODULE EXPORTS ====================
/**
 * AuthService modülü export'ları
 * @description Tüm authentication fonksiyonlarını dışa aktarır
 */
module.exports = {
  // Profile Creation Functions
  createDoctorProfile,
  createHospitalProfile,
  
  // Registration Functions
  registerDoctor,
  registerHospital,
  
  // Refresh Token Functions
  findRefreshToken,
  refreshToken,
  
  // Credentials & Login Functions
  validateCredentials,
  loginUnified,
  
  // Refresh Token Validation Functions
  validateRefreshToken,
  
  // Profile & User Helper Functions
  getUserProfile,
  updateLastLogin,
  isEmailRegistered,
  createUserAccount,
  
  // Token Management Functions
  logout,
  logoutAll,
  
  // Token Cleanup Functions
  cleanupExpiredTokens
};
// ==================== END MODULE EXPORTS ====================
