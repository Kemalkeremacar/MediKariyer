/**
 * @file authMiddleware.js
 * @description JWT tabanlı kimlik doğrulama (authentication) middleware'lerini içerir.
 * Bu middleware'ler, gelen isteklerin `Authorization` başlığını kontrol ederek, token'ı doğrular,
 * kullanıcıyı veritabanından getirir ve kullanıcı bilgilerini `req` nesnesine ekler.
 * 
 * Ana Middleware'ler:
 * - authenticateToken: Ana kimlik doğrulama middleware'i
 * - optionalAuth: Opsiyonel kimlik doğrulama middleware'i
 * - authMiddleware: authenticateToken için alias
 * 
 * Güvenlik Özellikleri:
 * - JWT token doğrulama
 * - Kullanıcı durumu kontrolü (is_active, is_approved)
 * - Admin muafiyeti (admin için durum kontrolleri yapılmaz)
 * - Token süresi kontrolü
 * - Veritabanı güncel durum kontrolü
 * 
 * İşlem Adımları:
 * 1. Authorization header kontrolü
 * 2. Bearer token çıkarma
 * 3. JWT token doğrulama
 * 4. Kullanıcıyı veritabanından getirme
 * 5. Hesap durumu kontrolü (is_active, is_approved)
 * 6. req.user nesnesine kullanıcı bilgilerini ekleme
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

// ==================== DEPENDENCIES ====================
const { verifyAccessToken } = require('../utils/jwtUtils');
const { AppError } = require('../utils/errorHandler');
const logger = require('../utils/logger');
const db = require('../config/dbConfig').db;
// ==================== END DEPENDENCIES ====================

// ==================== MAIN AUTHENTICATION MIDDLEWARE ====================

/**
 * Ana kimlik doğrulama middleware'i
 * @description Gelen istekteki JWT (Access Token) token'ını doğrular ve kullanıcıyı `req` nesnesine ekler
 * @param {object} req - Express istek nesnesi
 * @param {object} res - Express yanıt nesnesi
 * @param {function} next - Bir sonraki middleware'e geçiş fonksiyonu
 * @returns {Promise<void>} Middleware işlemi
 * @throws {AppError} Token bulunamadı, geçersiz token, kullanıcı bulunamadı, hesap durumu
 * 
 * İşlem Adımları:
 * 1. Authorization header kontrolü
 * 2. Bearer token çıkarma
 * 3. JWT token doğrulama
 * 4. Kullanıcıyı veritabanından getirme
 * 5. Hesap durumu kontrolü (is_active, is_approved)
 * 6. req.user nesnesine kullanıcı bilgilerini ekleme
 * 
 * Güvenlik Kontrolleri:
 * - Admin için is_active kontrolü yapılmaz
 * - Admin için is_approved kontrolü yapılmaz
 * - Diğer kullanıcılar için hem is_active hem is_approved kontrolü yapılır
 * 
 * @example
 * // Route'da kullanım
 * router.get('/protected', authMiddleware, (req, res) => {
 *   console.log(req.user.id); // Kullanıcı ID'si
 *   console.log(req.user.role); // Kullanıcı rolü
 * });
 */
const authenticateToken = async (req, res, next) => {
  try {
    // 1. Authorization header kontrolü
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      throw new AppError('Authorization header bulunamadı', 401);
    }

    // 2. Bearer token çıkarma
    const token = authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      throw new AppError('Token bulunamadı', 401);
    }

    // 3. JWT token doğrulama
    const decoded = verifyAccessToken(token);
    
    if (!decoded) {
      throw new AppError('Geçersiz token', 401);
    }

    // Bazı eski token'larda payload 'id' ya da 'sub' alanında olabilir
    const userId = decoded.userId ?? decoded.id ?? decoded.sub;
    if (!userId) {
      throw new AppError('Geçersiz token payload', 401);
    }

    // 4. Kullanıcıyı veritabanından getirme
    // Token payload'ına güvenmek yerine, kullanıcının en güncel durumunu kontrol etmek için
    // her istekte veritabanı sorgusu yapılır. Bu, güvenliği artırır.
    const user = await db('users')
      .where('id', userId)
      .first();

    if (!user) {
      throw new AppError('Kullanıcı bulunamadı', 401);
    }

    // 5. Hesap durumu kontrolü
    // Admin için is_active kontrolü yapılmaz, diğer kullanıcılar için yapılır
    if (user.role !== 'admin' && !user.is_active) {
      throw new AppError('Hesabınız pasif durumda. Lütfen yöneticinizle iletişime geçin.', 403);
    }

    // Güvenlik politikası: Admin rolü dışındaki (doktor, hastane) kullanıcıların, sistemdeki
    // korumalı kaynaklara erişebilmesi için yönetici tarafından onaylanmış olması zorunludur.
    if (user.role !== 'admin' && !user.is_approved) {
      throw new AppError('Hesabınız admin onayını bekliyor', 403);
    }

    // 6. req.user nesnesine kullanıcı bilgilerini ekleme
    // Sonraki middleware ve controller'ların kullanabilmesi için gerekli kullanıcı bilgileri
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      isApproved: user.is_approved,
      isActive: user.is_active
    };

    // Log'u sadece ilk authentication'da at (çok fazla log'u önlemek için)
    // Her request'te log atmak yerine, sadece session başlangıcında log at
    if (!req.user._logged) {
      logger.info(`User authenticated: ${user.email} (${user.role})`);
      req.user._logged = true;
    }
    
    next();
  } catch (error) {
    // Authentication hataları kullanıcıya gösterilmeli, server loglarına yazılmamalı
    
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Token süresi dolmuş', 401));
    }
    
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Geçersiz token', 401));
    }
    
    next(error);
  }
};
// ==================== END MAIN AUTHENTICATION MIDDLEWARE ====================

// ==================== OPTIONAL AUTHENTICATION MIDDLEWARE ====================

/**
 * Opsiyonel kimlik doğrulama middleware'i
 * @description Herkese açık olan ancak kullanıcı giriş yapmışsa farklı içerik gösterebilecek endpoint'ler için kullanılır
 * @param {object} req - Express istek nesnesi
 * @param {object} res - Express yanıt nesnesi
 * @param {function} next - Bir sonraki middleware'e geçiş fonksiyonu
 * @returns {Promise<void>} Middleware işlemi
 * 
 * Özellikler:
 * - Eğer geçerli bir token varsa, kullanıcı bilgilerini `req.user` nesnesine ekler
 * - Eğer token yoksa veya geçersizse, hata fırlatmaz, sadece `req.user` nesnesini boş bırakır
 * - Performans için veritabanı sorgusu yapmaz, sadece token içerisindeki bilgilere güvenir
 * 
 * Kullanım Alanları:
 * - Ana sayfa (giriş yapmış kullanıcı için farklı içerik)
 * - İlan listesi (giriş yapmış kullanıcı için favoriler)
 * - Genel sayfalar (opsiyonel kullanıcı bilgileri)
 * 
 * @example
 * // Route'da kullanım
 * router.get('/public', optionalAuth, (req, res) => {
 *   if (req.user) {
 *     // Giriş yapmış kullanıcı için özel içerik
 *     res.json({ message: `Hoş geldin ${req.user.email}` });
 *   } else {
 *     // Misafir kullanıcı için genel içerik
 *     res.json({ message: 'Hoş geldin misafir' });
 *   }
 * });
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return next();
    }

    const decoded = verifyAccessToken(token);
    
    if (decoded) {
      req.user = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        isApproved: decoded.isApproved
      };
    }

    next();
  } catch (error) {
    // Opsiyonel kimlik doğrulama olduğu için, token doğrulama hatası durumunda
    // akışı kesmek yerine kullanıcı misafir olarak devam eder
    next();
  }
};
// ==================== END OPTIONAL AUTHENTICATION MIDDLEWARE ====================

// ==================== ALIASES & EXPORTS ====================

/**
 * Ana kimlik doğrulama middleware'i için alias
 * @description Geriye dönük uyumluluk ve daha yaygın bir isimlendirme standardı için
 */
const authMiddleware = authenticateToken;

/**
 * AuthMiddleware modülü export'ları
 * @description Tüm authentication middleware'lerini dışa aktarır
 */
module.exports = {
  // Main Authentication Middleware
  authenticateToken,
  authMiddleware,
  
  // Optional Authentication Middleware
  optionalAuth
};
// ==================== END ALIASES & EXPORTS ====================
