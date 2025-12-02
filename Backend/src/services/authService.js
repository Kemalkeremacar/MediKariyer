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
const crypto = require('crypto');
const db = require('../config/dbConfig').db;
const { AppError } = require('../utils/errorHandler');
const logger = require('../utils/logger');
const jwtUtils = require('../utils/jwtUtils');
const LogService = require('./logService');
const emailService = require('../utils/emailService');

const DAY_IN_MS = 24 * 60 * 60 * 1000;

/**
 * JWT refresh token süresini (gün cinsinden) ortam değişkenlerinden okur.
 * Ortam değişkeni tanımlı değilse veya format hatalıysa varsayılan olarak 7 gün kullanılır.
 * Desteklenen formatlar: "7d", "7", "30d" vb.
 */
const resolveRefreshTokenExpiryDays = () => {
  const rawValue = (process.env.JWT_REFRESH_EXPIRES_IN || '').trim();

  if (!rawValue) {
    return 7;
  }

  const daySuffixMatch = rawValue.match(/^(\d+)\s*d$/i);
  if (daySuffixMatch) {
    const parsed = parseInt(daySuffixMatch[1], 10);
    return Number.isNaN(parsed) ? 7 : parsed;
  }

  const numericValue = parseInt(rawValue, 10);
  return Number.isNaN(numericValue) ? 7 : numericValue;
};

const REFRESH_TOKEN_EXPIRY_DAYS = resolveRefreshTokenExpiryDays();
const REFRESH_TOKEN_EXPIRY_MS = REFRESH_TOKEN_EXPIRY_DAYS * DAY_IN_MS;

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
 * @property {number} city_id - Şehir ID (cities tablosundan FK) (zorunlu)
 * @property {string} address - Adres (zorunlu)
 * @property {string} [phone] - Telefon numarası (opsiyonel)
 * @property {string} [email] - Kurum e-posta adresi (opsiyonel)
 * @property {string} [website] - Web sitesi URL'si (opsiyonel)
 * @property {string} [about] - Kurum hakkında bilgi (opsiyonel)
 * @property {string} [logo] - Logo URL'si (opsiyonel)
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
    created_at: dbInstance.fn.now()
    // updated_at NULL kalacak - sadece profil güncellendiğinde dolacak
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
 * @param {number} profileData.city_id - Şehir ID (cities tablosundan FK) (zorunlu)
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
 *   city_id: 34,
 *   address: 'Kadıköy Mahallesi, Acıbadem Caddesi No:1',
 *   phone: '+905551234567',
 *   email: 'info@acibadem.com',
 *   website: 'https://www.acibadem.com',
 *   about: 'Modern sağlık hizmetleri sunan hastane'
 * });
 */
const createHospitalProfile = async (userId, { institution_name, city_id, address, phone, email, website, about, logo }) => {
  const [profileId] = await db('hospital_profiles').insert({
    user_id: userId,
    institution_name,
    city_id,
    address,
    phone,
    email,
    website,
    about,
    logo,
    created_at: db.fn.now()
    // updated_at NULL kalacak - sadece profil güncellendiğinde dolacak
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
  // Email'i normalize et (trim ve lowercase)
  const normalizedEmail = email ? email.trim().toLowerCase() : '';
  
  logger.info(`Login attempt: Searching for user with email`, {
    originalEmail: email,
    normalizedEmail: normalizedEmail,
    emailLength: email ? email.length : 0
  });

  // Case-insensitive email araması için LOWER() kullan
  const user = await db('users')
    .whereRaw('LOWER(email) = ?', [normalizedEmail])
    .first();

  if (!user) {
    // Benzer email'leri kontrol et (hata ayıklama için)
    let similarEmails = [];
    try {
      const emailPrefix = normalizedEmail.includes('@') 
        ? normalizedEmail.substring(0, normalizedEmail.indexOf('@'))
        : normalizedEmail.substring(0, 5);
      
      similarEmails = await db('users')
        .select('email')
        .whereRaw('LOWER(email) LIKE ?', [`%${emailPrefix}%`])
        .limit(5);
    } catch (error) {
      // Similar emails sorgusu başarısız olsa bile devam et
      logger.warn('Similar emails query failed', { error: error.message });
    }
    
    logger.warn(`Login attempt: User not found for email`, {
      originalEmail: email,
      normalizedEmail: normalizedEmail,
      similarEmailsFound: similarEmails.length,
      similarEmails: similarEmails.map(u => u.email)
    });
    return null;
  }
  
  logger.info(`Login attempt: User found for email: ${email}`, {
    userId: user.id,
    role: user.role,
    is_approved: user.is_approved,
    is_active: user.is_active,
    hasPasswordHash: !!user.password_hash,
    passwordHashLength: user.password_hash ? user.password_hash.length : 0
  });
  
  // DEBUG: Console.log ile kontrol
  console.log('🔍 DEBUG - User Status (RAW):', {
    email: email,
    userId: user.id,
    role: user.role,
    is_active_raw: user.is_active,
    is_active_type: typeof user.is_active,
    is_active_strict_false: user.is_active === false,
    is_active_loose_false: user.is_active == false,
    is_active_zero: user.is_active === 0,
    is_approved_raw: user.is_approved,
    is_approved_type: typeof user.is_approved
  });
  
  // SQL Server bit tipi 0/1 olarak geliyorsa boolean'a çevir
  const isActive = user.is_active === 1 || user.is_active === true;
  const isApproved = user.is_approved === 1 || user.is_approved === true;
  
  console.log('🔍 DEBUG - User Status (CONVERTED):', {
    isActive,
    isApproved
  });
  
  // Admin için is_active kontrolü yapılmaz, diğer kullanıcılar için yapılır
  if (user.role !== 'admin' && !isActive) {
    console.log('❌ DEBUG - User is INACTIVE, throwing error');
    throw new AppError('Hesabınız pasifleştirilmiştir. Lütfen sistem yöneticisi ile iletişime geçin.', 403);
  }
  
  console.log('✅ DEBUG - User is ACTIVE, continuing login');
  
  // Admin için is_approved kontrolü yapılmaz, diğer kullanıcılar için yapılır
  if (user.role !== 'admin' && !isApproved) {
    // Bu mesaj kullanıcıya gösterilmeli, server loglarına yazılmamalı
    console.log('❌ DEBUG - User is NOT APPROVED, throwing error');
    throw new AppError('Hesabınız admin onayını bekliyor. Onaylandıktan sonra giriş yapabilirsiniz.', 403);
  }

  // Şifre hash kontrolü
  if (!user.password_hash) {
    logger.error(`Login attempt: Password hash is missing for user: ${email} (userId: ${user.id})`);
    return null;
  }

  // Şifre hash format kontrolü (bcrypt hash'leri $2a$, $2b$ veya $2y$ ile başlar)
  if (!user.password_hash.startsWith('$2')) {
    logger.error(`Login attempt: Invalid password hash format for user: ${email} (userId: ${user.id})`, {
      hashPrefix: user.password_hash.substring(0, 10)
    });
    return null;
  }

  try {
    // SQL Server'dan gelen hash'in tipini ve encoding'ini kontrol et
    const hashType = typeof user.password_hash;
    const hashIsString = typeof user.password_hash === 'string';
    
    logger.info(`Login attempt: Password hash details for ${email}`, {
      userId: user.id,
      hashType: hashType,
      hashIsString: hashIsString,
      hashLength: user.password_hash ? user.password_hash.length : 0,
      hashFirstChars: user.password_hash ? user.password_hash.substring(0, 20) : 'null',
      passwordLength: password ? password.length : 0
    });

    // Hash'i string'e dönüştür (gerekirse)
    const passwordHashString = String(user.password_hash);
    
    const isPasswordValid = await bcrypt.compare(password, passwordHashString);
    logger.info(`Login attempt: Password validation result for ${email}`, {
      userId: user.id,
      isValid: isPasswordValid,
      hashUsed: passwordHashString.substring(0, 10)
    });
    return isPasswordValid ? user : null;
  } catch (error) {
    logger.error(`Login attempt: bcrypt.compare error for user: ${email}`, {
      userId: user.id,
      error: error.message,
      errorStack: error.stack,
      passwordHashType: typeof user.password_hash,
      passwordHashSample: user.password_hash ? user.password_hash.substring(0, 20) : 'null'
    });
    return null;
  }
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
const loginUnified = async (email, password, req = null) => {
  // Email'i normalize et (trim ve lowercase)
  const normalizedEmail = email ? email.trim().toLowerCase() : '';
  
  logger.info(`Login attempt started for: ${email}`, {
    originalEmail: email,
    normalizedEmail: normalizedEmail,
    hasPassword: !!password,
    passwordLength: password ? password.length : 0
  });

  let user;
  try {
    user = await validateCredentials(normalizedEmail, password);
  } catch (error) {
    // validateCredentials içinde is_active veya is_approved kontrolü başarısız oldu
    // Bu durumda hatayı yukarı fırlat
    logger.warn(`Login attempt failed (account status): ${email}`, {
      error: error.message,
      statusCode: error.statusCode
    });
    throw error;
  }

  if (!user) {
    // Kullanıcı bulunamadı veya şifre yanlış
    logger.warn(`Login attempt failed (invalid credentials): ${email}`, {
      email: email,
      ipAddress: req?.ip || null
    });
    
    // Başarısız giriş denemesini logla
    LogService.createSecurityLog({
      eventType: 'login_failed',
      severity: 'medium',
      message: `Başarısız giriş denemesi: ${email}`,
      email: email,
      ipAddress: req?.ip || null,
      userAgent: req?.get('user-agent') || null
    }).catch(err => logger.error('Security log kayıt hatası', { error: err.message }));
    
    throw new AppError('Geçersiz email veya şifre', 401);
  }
  
  // validateCredentials zaten onay kontrolü yapıyor, tekrar yapmaya gerek yok
  const loginInfo = await updateLastLogin(user.id);
  
  // Profil bilgilerini de getir (role parametresi ekli)
  const profile = await getUserProfile(user.id, user.role);
  
  return { 
    ...user, 
    isFirstLogin: loginInfo.isFirstLogin,
    profile: profile 
  };
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
  // Email'i normalize et (trim ve lowercase)
  const normalizedEmail = email ? email.trim().toLowerCase() : '';
  // OPTİMİZASYON: Email zaten unique index'e sahip, direkt email ile arama yap (LOWER() index'i bypass eder)
  // Email'ler zaten normalize edilerek kaydedildiği için direkt karşılaştırma yapabiliriz
  const user = await db('users')
    .where('email', normalizedEmail)
    .first();
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

  // Email'i normalize et (trim ve lowercase) - veritabanında tutarlılık için
  const normalizedEmail = email ? email.trim().toLowerCase() : '';
  
  logger.info(`Doctor registration started | Data: ${JSON.stringify({ originalEmail: email, normalizedEmail, title, specialty_id })}`);

  try {
    // E-posta kontrolü
    const existingUser = await isEmailRegistered(normalizedEmail);
    if (existingUser) {
      throw new AppError('Bu e-posta adresi zaten kayıtlı', 400);
    }

    // Şifreyi hash'le
    const password_hash = await bcrypt.hash(password, 12);
    logger.info(`Password hashed successfully for: ${email}`, {
      hashLength: password_hash.length,
      hashPrefix: password_hash.substring(0, 10),
      hashValid: password_hash.startsWith('$2')
    });

    // Transaction başlat
    const trx = await db.transaction();

    try {
      // Kullanıcıyı oluştur (normalize edilmiş email ile)
      await trx('users').insert({
        email: normalizedEmail,
        password_hash,
        role: 'doctor',
        is_approved: false,
        is_active: true,
        created_at: trx.fn.now(),
        updated_at: trx.fn.now()
      });

      // Oluşturulan kullanıcının ID'sini al
      const user = await trx('users').where('email', normalizedEmail).first();
      const userId = user.id;

      // Kaydedilen şifre hash'ini kontrol et
      logger.info(`User created, verifying password hash in database`, {
        userId: userId,
        storedHashLength: user.password_hash ? user.password_hash.length : 0,
        storedHashPrefix: user.password_hash ? user.password_hash.substring(0, 10) : 'null',
        hashMatches: user.password_hash === password_hash
      });

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

      // Admin'lere yeni doktor kaydı bildirimi gönder
      try {
        const notificationService = require('./notificationService');
        await notificationService.sendAdminSystemNotification({
          type: 'info',
          title: 'Yeni Doktor Kaydı',
          body: `${first_name} ${last_name} (${normalizedEmail}) adlı doktor sisteme kayıt oldu. Onay bekliyor.`,
          data: {
            user_id: userId,
            role: 'doctor',
            doctor_profile_id: profileId,
            name: `${first_name} ${last_name}`,
            email: normalizedEmail
          }
        });
      } catch (notificationError) {
        logger.warn('Admin notification failed for new doctor registration:', notificationError);
        // Bildirim hatası kayıt işlemini engellemez
      }

      // Şifre hash'ini doğrula (kayıt sonrası test)
      if (createdUser.password_hash) {
        try {
          const testPasswordMatch = await bcrypt.compare(password, createdUser.password_hash);
          logger.info(`Doctor registration: Password verification test for ${email}`, {
            userId: createdUser.id,
            passwordMatches: testPasswordMatch,
            storedHashLength: createdUser.password_hash.length,
            storedHashPrefix: createdUser.password_hash.substring(0, 10)
          });
          
          if (!testPasswordMatch) {
            logger.error(`Doctor registration: PASSWORD HASH MISMATCH DETECTED for ${email}!`, {
              userId: createdUser.id,
              originalHashPrefix: password_hash.substring(0, 10),
              storedHashPrefix: createdUser.password_hash.substring(0, 10),
              hashLengths: {
                original: password_hash.length,
                stored: createdUser.password_hash.length
              }
            });
          }
        } catch (verifyError) {
          logger.error(`Doctor registration: Password verification test failed for ${email}`, {
            userId: createdUser.id,
            error: verifyError.message
          });
        }
      } else {
        logger.error(`Doctor registration: Password hash is NULL after registration for ${email}`, {
          userId: createdUser.id
        });
      }

      logger.info(`Doctor registration completed for: ${email}`, {
        userId: createdUser.id,
        profileId: createdProfile.id,
        hasPasswordHash: !!createdUser.password_hash
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
 * users tablosuna sadece temel bilgiler (email, password, role) kaydedilir.
 * Tüm profil bilgileri hospital_profiles tablosuna kaydedilir.
 * 
 * @param {Object} registrationData - Kayıt verileri
 * @param {string} registrationData.email - E-posta adresi
 * @param {string} registrationData.password - Şifre (plain text)
 * @param {string} registrationData.institution_name - Kurum adı
 * @param {number} registrationData.city_id - Şehir ID (cities tablosu foreign key)
 * @param {string} registrationData.phone - Telefon numarası
 * @param {string} [registrationData.address] - Adres (opsiyonel)
 * @param {string} [registrationData.website] - Web sitesi URL'si (opsiyonel)
 * @param {string} [registrationData.about] - Kurum hakkında bilgi (opsiyonel)
 * @returns {Promise<{user: User, profile: HospitalProfile}>} Oluşturulan kullanıcı ve profil bilgileri
 * @throws {AppError} E-posta zaten kayıtlıysa veya veritabanı hatası
 * 
 * @example
 * const result = await registerHospital({
 *   email: 'hospital@example.com',
 *   password: 'password123',
 *   institution_name: 'Acıbadem Hastanesi',
 *   city_id: 34,
 *   phone: '+90 212 555 0123',
 *   address: 'Kadıköy Mahallesi, Acıbadem Caddesi No:1'
 * });
 */
const registerHospital = async (registrationData) => {
  const { email, password, institution_name, city_id, phone, address, website, about, logo } = registrationData;

  // Email'i normalize et (trim ve lowercase) - veritabanında tutarlılık için
  const normalizedEmail = email ? email.trim().toLowerCase() : '';

  // E-posta kontrolü
  if (await isEmailRegistered(normalizedEmail)) {
    throw new AppError('Bu e-posta adresi zaten kayıtlı', 409);
  }

  // Şifreyi hash'le
  const password_hash = await bcrypt.hash(password, 12);

  // Transaction ile güvenli kayıt
  const trx = await db.transaction();
  try {
    // Kullanıcı hesabı oluştur (normalize edilmiş email ile)
    await trx('users').insert({
      email: normalizedEmail,
      password_hash,
      role: 'hospital',
      is_approved: false, // Admin onayı bekler
      is_active: true,
      created_at: trx.fn.now(),
      updated_at: trx.fn.now()
    });

    // Oluşturulan kullanıcının ID'sini al
    const user = await trx('users').where('email', normalizedEmail).first();
    const userId = user.id;

    // Hastane profili oluştur (address, website, about opsiyonel - kayıtta girilmez)
    await trx('hospital_profiles').insert({
      user_id: userId,
      institution_name,
      city_id: city_id,
      address: address || null, // Kayıtta girilmez, profilde doldurulur
      phone: phone,
      email: normalizedEmail, // Kurum email'i için users tablosundaki email'i kullan (normalize edilmiş)
      website: website || null, // Kayıtta girilmez, profilde doldurulur
      about: about || null, // Kayıtta girilmez, profilde doldurulur
      logo: logo, // Logo zorunlu
      created_at: trx.fn.now(),
      updated_at: trx.fn.now()
    });

    // Oluşturulan profilin ID'sini al
    const profile = await trx('hospital_profiles').where('user_id', userId).first();
    const profileId = profile.id;

    // Oluşturulan verileri transaction içinde al (commit'ten önce)
    const createdUser = await trx('users').where('id', userId).first();
    const createdProfile = await trx('hospital_profiles').where('id', profileId).first();

    await trx.commit();

    // OPTİMİZASYON: Admin'lere yeni hastane kaydı bildirimi gönder (async, fire-and-forget)
    // Transaction commit'ten sonra yapılır, kayıt işlemini yavaşlatmaz
    setImmediate(async () => {
      try {
        const notificationService = require('./notificationService');
        await notificationService.sendAdminSystemNotification({
          type: 'info',
          title: 'Yeni Hastane Kaydı',
          body: `${institution_name} (${normalizedEmail}) adlı hastane sisteme kayıt oldu. Onay bekliyor.`,
          data: {
            user_id: userId,
            role: 'hospital',
            hospital_profile_id: profileId,
            institution_name: institution_name,
            email: normalizedEmail
          }
        });
      } catch (notificationError) {
        logger.warn('Admin notification failed for new hospital registration:', notificationError);
        // Bildirim hatası kayıt işlemini engellemez
      }
    });

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

  // Yeni access token oluştur
  const accessToken = jwtUtils.generateAccessToken({
    id: user.id,
    email: user.email,
    role: user.role
  });

  // Refresh token rotation - sadece gerektiğinde yeni token oluştur
  let newRefreshToken = refreshToken; // Varsayılan olarak aynı token'ı kullan
  
  // Token rotation kontrolü - sadece token'ın yarısı geçmişse yeni token oluştur
  const tokenAge = Date.now() - new Date(tokenRecord.created_at).getTime();
  const tokenMaxAge = REFRESH_TOKEN_EXPIRY_MS;
  
  if (tokenAge > tokenMaxAge / 2) {
    // Token'ın yarısı geçmişse yeni refresh token oluştur
    newRefreshToken = jwtUtils.generateRefreshToken({
      id: user.id,
      email: user.email,
      role: user.role
    });
    
    const newRefreshTokenHash = jwtUtils.hashRefreshToken(newRefreshToken);
    const expiryTime = REFRESH_TOKEN_EXPIRY_MS;
    
    await db.transaction(async (trx) => {
      await trx('refresh_tokens').where('id', tokenRecord.id).del();
      
      await trx('refresh_tokens').insert({
        user_id: user.id,
        token_hash: newRefreshTokenHash,
        expires_at: new Date(Date.now() + expiryTime),
        created_at: new Date()
      });
    });
  }

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

// ==================== PASSWORD RESET FUNCTIONS ====================

const PASSWORD_RESET_EXPIRY_MINUTES = Number(process.env.PASSWORD_RESET_EXPIRY_MINUTES || 60);

const hashResetToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

const requestPasswordReset = async ({ email, ipAddress, userAgent }) => {
  const normalizedEmail = email ? email.trim().toLowerCase() : '';

  if (!normalizedEmail) {
    return { success: true };
  }

  const user = await db('users')
    .whereRaw('LOWER(email) = ?', [normalizedEmail])
    .first();

  if (!user) {
    logger.warn('Password reset request for non-existing email', { email: normalizedEmail });
    await LogService.createSecurityLog({
      eventType: 'password_reset_requested',
      severity: 'medium',
      message: 'Var olmayan bir e-posta için şifre sıfırlama talebi',
      email: normalizedEmail,
      ipAddress,
      userAgent
    }).catch(() => {});

    return { success: true };
  }

  // Eski tokenları temizle
  await db('password_reset_tokens')
    .where('user_id', user.id)
    .whereNull('used_at')
    .del();

  const token = crypto.randomBytes(40).toString('hex');
  const tokenHash = hashResetToken(token);
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_EXPIRY_MINUTES * 60 * 1000);

  await db('password_reset_tokens').insert({
    user_id: user.id,
    token_hash: tokenHash,
    expires_at: expiresAt,
    ip_address: ipAddress ? ipAddress.substring(0, 100) : null,
    user_agent: userAgent ? userAgent.substring(0, 500) : null,
    created_at: db.fn.now(),
    updated_at: db.fn.now()
  });

  await LogService.createSecurityLog({
    eventType: 'password_reset_requested',
    severity: 'medium',
    message: 'Şifre sıfırlama talebi oluşturuldu',
    userId: user.id,
    email: user.email,
    ipAddress,
    userAgent,
    metadata: {
      expires_at: expiresAt.toISOString()
    }
  }).catch(() => {});

  await emailService.sendPasswordResetEmail({
    to: user.email,
    token,
    expiresAt
  });

  return { success: true };
};

const resetPasswordWithToken = async ({ token, newPassword, ipAddress, userAgent }) => {
  const tokenHash = hashResetToken(token);

  const resetRecord = await db('password_reset_tokens')
    .where('token_hash', tokenHash)
    .first();

  if (!resetRecord) {
    throw new AppError('Geçersiz veya süresi dolmuş şifre sıfırlama bağlantısı', 400);
  }

  if (resetRecord.used_at) {
    throw new AppError('Bu şifre sıfırlama bağlantısı zaten kullanılmış', 400);
  }

  if (new Date(resetRecord.expires_at) < new Date()) {
    throw new AppError('Şifre sıfırlama bağlantısının süresi dolmuş', 400);
  }

  const user = await db('users').where('id', resetRecord.user_id).first();

  if (!user) {
    throw new AppError('Kullanıcı bulunamadı', 404);
  }

  const password_hash = await bcrypt.hash(newPassword, 12);

  await db.transaction(async (trx) => {
    await trx('users')
      .where('id', user.id)
      .update({
        password_hash,
        updated_at: trx.fn.now()
      });

    await trx('password_reset_tokens')
      .where('id', resetRecord.id)
      .update({
        used_at: trx.fn.now(),
        updated_at: trx.fn.now()
      });

    // Tüm refresh tokenları geçersiz kıl
    await trx('refresh_tokens')
      .where('user_id', user.id)
      .del();
  });

  await LogService.createSecurityLog({
    eventType: 'password_reset_completed',
    severity: 'medium',
    message: 'Şifre sıfırlama işlemi başarıyla tamamlandı',
    userId: user.id,
    email: user.email,
    ipAddress,
    userAgent
  }).catch(() => {});

  return { success: true };
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
  requestPasswordReset,
  resetPasswordWithToken,
  
  // Token Cleanup Functions
  cleanupExpiredTokens
};
// ==================== END MODULE EXPORTS ====================
