/**
 * @file roleGuard.js
 * @description Rol Tabanlı Erişim Kontrolü (RBAC) ve sahiplik (ownership) denetimi yapan middleware'leri içerir.
 * Bu guard'lar, `authMiddleware`'den sonra çalışarak, kimliği doğrulanmış bir kullanıcının
 * belirli bir endpoint'e erişmek için gerekli role veya sahiplik hakkına sahip olup olmadığını kontrol eder.
 * 
 * Ana Middleware'ler:
 * - requireRole: Belirli rollere sahip kullanıcıların erişimine izin veren HOC
 * - requireAdmin: Sadece admin rolüne sahip kullanıcılar için
 * - requireDoctor: Sadece doctor rolüne sahip kullanıcılar için
 * - requireHospital: Sadece hospital rolüne sahip kullanıcılar için
 * - requireDoctorOrHospital: Doctor veya hospital rolleri için
 * - requireUser: Standart kullanıcı rolleri için (doctor, hospital)
 * - requireOwnership: Sahiplik kontrolü (kullanıcı sadece kendi kaynaklarına erişebilir)
 * 
 * Güvenlik Özellikleri:
 * - Role-based access control (RBAC)
 * - Ownership validation
 * - Admin privilege (admin her şeye erişebilir)
 * - Resource-specific access control
 * - URL parameter validation
 * 
 * İşlem Adımları:
 * 1. Kullanıcı kimlik doğrulaması kontrolü
 * 2. Kullanıcı rolü kontrolü
 * 3. İzin verilen rollerle karşılaştırma
 * 4. Sahiplik kontrolü (gerekirse)
 * 5. Erişim izni verme veya reddetme
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

// ==================== DEPENDENCIES ====================
const { AppError } = require('../utils/errorHandler');
const { USER_ROLES } = require('../config/appConstants');
const logger = require('../utils/logger');
// ==================== END DEPENDENCIES ====================

// ==================== ROLE-BASED ACCESS CONTROL (RBAC) ====================

/**
 * Role-based access control middleware factory
 * @description Belirli rollere sahip kullanıcıların erişimine izin veren bir middleware oluşturan HOC
 * @param {string|string[]} allowedRoles - Erişime izin verilen roller
 * @returns {function} Express middleware fonksiyonu
 * @throws {AppError} Kullanıcı kimlik doğrulaması gerekli, yetki yok
 * 
 * İşlem Adımları:
 * 1. Kullanıcı kimlik doğrulaması kontrolü
 * 2. Kullanıcı rolü kontrolü
 * 3. İzin verilen rollerle karşılaştırma
 * 4. Erişim izni verme veya reddetme
 * 
 * @example
 * // Tek rol için
 * const requireAdmin = requireRole('admin');
 * 
 * // Birden fazla rol için
 * const requireDoctorOrHospital = requireRole(['doctor', 'hospital']);
 * 
 * // Route'da kullanım
 * router.get('/admin-only', requireAdmin, (req, res) => {
 *   // Sadece admin erişebilir
 * });
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // 1. Kullanıcı kimlik doğrulaması kontrolü
      if (!req.user) {
        throw new AppError('Kullanıcı kimlik doğrulaması gerekli', 401);
      }

      // 2. Kullanıcı rolü kontrolü
      const userRole = req.user.role;
      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

      // 3. İzin verilen rollerle karşılaştırma
      if (!roles.includes(userRole)) {
        // Yetki hatası kullanıcıya gösterilmeli, server loglarına yazılmamalı
        throw new AppError('Bu işlem için yetkiniz bulunmuyor', 403);
      }

      // 4. Erişim izni verme
      // Sadece hata durumunda log at (başarılı durumda gereksiz log'u önle)
      // logger.info(`Role check passed for user ${req.user.email} with role ${userRole}`);
      next();
    } catch (error) {
      next(error);
    }
  };
};
// ==================== END ROLE-BASED ACCESS CONTROL (RBAC) ====================

// ==================== PREDEFINED ROLE GUARDS ====================

/**
 * Admin rolü kontrolü
 * @description Yalnızca 'admin' rolüne sahip kullanıcıların erişimine izin verir
 * @returns {function} Express middleware fonksiyonu
 * 
 * @example
 * router.get('/admin/dashboard', requireAdmin, (req, res) => {
 *   // Sadece admin erişebilir
 * });
 */
const requireAdmin = requireRole(USER_ROLES.ADMIN);

/**
 * Doctor rolü kontrolü
 * @description Yalnızca 'doctor' rolüne sahip kullanıcıların erişimine izin verir
 * @returns {function} Express middleware fonksiyonu
 * 
 * @example
 * router.get('/doctor/profile', requireDoctor, (req, res) => {
 *   // Sadece doktor erişebilir
 * });
 */
const requireDoctor = requireRole(USER_ROLES.DOCTOR);

/**
 * Hospital rolü kontrolü
 * @description Yalnızca 'hospital' rolüne sahip kullanıcıların erişimine izin verir
 * @returns {function} Express middleware fonksiyonu
 * 
 * @example
 * router.get('/hospital/profile', requireHospital, (req, res) => {
 *   // Sadece hastane erişebilir
 * });
 */
const requireHospital = requireRole(USER_ROLES.HOSPITAL);

/**
 * Doctor veya Hospital rolü kontrolü
 * @description 'doctor' veya 'hospital' rollerinden birine sahip kullanıcıların erişimine izin verir
 * @returns {function} Express middleware fonksiyonu
 * 
 * @example
 * router.get('/user/dashboard', requireDoctorOrHospital, (req, res) => {
 *   // Doktor veya hastane erişebilir
 * });
 */
const requireDoctorOrHospital = requireRole([USER_ROLES.DOCTOR, USER_ROLES.HOSPITAL]);

/**
 * Standart kullanıcı rolü kontrolü
 * @description Standart kullanıcı rollerine ('doctor', 'hospital') sahip kullanıcıların erişimine izin verir
 * Genellikle admin'lerin erişmemesi gereken kullanıcıya özel sayfalar için kullanılır
 * @returns {function} Express middleware fonksiyonu
 * 
 * @example
 * router.get('/user/settings', requireUser, (req, res) => {
 *   // Doktor veya hastane erişebilir, admin erişemez
 * });
 */
const requireUser = requireRole([USER_ROLES.DOCTOR, USER_ROLES.HOSPITAL]);
// ==================== END PREDEFINED ROLE GUARDS ====================

// ==================== OWNERSHIP VALIDATION ====================

/**
 * Sahiplik kontrolü middleware'i
 * @description Bir kullanıcının yalnızca kendi kaynağına erişebilmesini sağlayan HOC
 * @param {string} [paramName='id'] - URL parametreleri içinde kaynağın ID'sini tutan alanın adı
 * @returns {function} Express middleware fonksiyonu
 * @throws {AppError} Kullanıcı kimlik doğrulaması gerekli, kaynak erişim yetkisi yok
 * 
 * Özellikler:
 * - Admin rolündeki kullanıcılar bu kontrolden muaftır ve tüm kaynaklara erişebilir
 * - Diğer roller için, `req.user.id` ile URL'deki kaynak ID'sini karşılaştırır
 * - URL parametrelerinden kaynak ID'sini alır
 * 
 * İşlem Adımları:
 * 1. Kullanıcı kimlik doğrulaması kontrolü
 * 2. Admin kontrolü (admin her şeye erişebilir)
 * 3. Kaynak ID'si kontrolü
 * 4. Sahiplik kontrolü
 * 5. Erişim izni verme veya reddetme
 * 
 * @example
 * // Varsayılan 'id' parametresi ile
 * router.get('/users/:id', requireOwnership(), (req, res) => {
 *   // Kullanıcı sadece kendi profilini görebilir
 * });
 * 
 * // Özel parametre adı ile
 * router.get('/orders/:orderId', requireOwnership('orderId'), (req, res) => {
 *   // Kullanıcı sadece kendi siparişini görebilir
 * });
 */
const requireOwnership = (paramName = 'id') => {
  return (req, res, next) => {
    try {
      // 1. Kullanıcı kimlik doğrulaması kontrolü
      if (!req.user) {
        throw new AppError('Kullanıcı kimlik doğrulaması gerekli', 401);
      }

      // 2. Kaynak ID'si kontrolü
      const resourceId = req.params[paramName];
      const userId = req.user.id;

      // 3. Admin kontrolü (admin her şeye erişebilir)
      if (req.user.role === USER_ROLES.ADMIN) {
        return next();
      }

      // 4. Sahiplik kontrolü
      // Kullanıcı sadece kendi kaynağına erişebilir
      if (parseInt(resourceId) !== parseInt(userId)) {
        logger.warn(`Ownership check failed for user ${req.user.email}. Trying to access resource ${resourceId}`);
        throw new AppError('Bu kaynağa erişim yetkiniz bulunmuyor', 403);
      }

      // 5. Erişim izni verme
      next();
    } catch (error) {
      next(error);
    }
  };
};
// ==================== END OWNERSHIP VALIDATION ====================

// ==================== MODULE EXPORTS ====================
/**
 * RoleGuard modülü export'ları
 * @description Tüm role-based access control ve ownership middleware'lerini dışa aktarır
 */
module.exports = {
  // Role-based Access Control
  requireRole,
  requireAdmin,
  requireDoctor,
  requireHospital,
  requireDoctorOrHospital,
  requireUser,
  
  // Ownership Validation
  requireOwnership
};
// ==================== END MODULE EXPORTS ====================
