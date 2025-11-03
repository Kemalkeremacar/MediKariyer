/**
 * @file RoleGuard.jsx
 * @description Role Guard - Rol tabanlı erişim kontrolü middleware'i
 * 
 * Bu component, kullanıcının belirli rollere sahip olup olmadığını kontrol eder
 * ve rol bazlı sayfa erişimini yönetir. Backend roleGuard.js ile birebir uyumlu
 * çalışır ve aynı mantığı uygular.
 * 
 * Ana Özellikler:
 * - Rol bazlı erişim kontrolü: Belirtilen rollere sahip kullanıcıların erişimini kontrol eder
 * - Admin muafiyeti: Admin rolü her yere erişebilir (tüm kontrolleri geçer)
 * - Esnek rol tanımları: Array veya tek rol string'i kabul eder
 * - Redirect yönetimi: Yetkisiz kullanıcıları ana sayfaya yönlendirir
 * - React Router entegrasyonu: Navigate component ile yönlendirme
 * - Auth store entegrasyonu: useAuthStore ile kullanıcı bilgilerine erişim
 * 
 * Backend Uyumluluk:
 * - Backend roleGuard.js ile aynı mantık
 * - Admin muafiyeti: Backend'deki gibi admin her şeye erişebilir
 * - Rol kontrolü: allowedRoles ile kullanıcı rolü karşılaştırması
 * - Kimlik doğrulama kontrolü: isAuthenticated ve user varlığı kontrolü
 * 
 * Kontrol Akışı:
 * 1. Kimlik doğrulama kontrolü: Kullanıcı authenticate değilse login'e yönlendir
 * 2. Admin kontrolü: Admin rolü için doğrudan erişim ver (muafiyet)
 * 3. Rol kontrolü: Kullanıcı rolü allowedRoles içinde mi kontrol et
 * 4. Yetkisiz erişim: Rol uyuşmazsa ana sayfaya yönlendir
 * 5. Yetkili erişim: Tüm kontroller geçildiyse içeriğe erişim ver
 * 
 * Kullanım:
 * ```jsx
 * import RoleGuard from '@/middleware/RoleGuard';
 * 
 * <Route path="/doctor" element={
 *   <AuthGuard>
 *     <ApprovalGuard>
 *       <RoleGuard allowedRoles={['doctor']}>
 *         <DoctorPage />
 *       </RoleGuard>
 *     </ApprovalGuard>
 *   </AuthGuard>
 * } />
 * 
 * // Birden fazla rol
 * <RoleGuard allowedRoles={['doctor', 'hospital']}>
 *   <SharedPage />
 * </RoleGuard>
 * ```
 * 
 * Guard Sıralaması:
 * RoleGuard genellikle şu sırayla kullanılır:
 * 1. AuthGuard: Kimlik doğrulama kontrolü
 * 2. ApprovalGuard: Onay durumu kontrolü
 * 3. RoleGuard: Rol bazlı erişim kontrolü (en son)
 * 
 * Not: RoleGuard, AuthGuard ve ApprovalGuard'dan sonra kullanılmalıdır.
 * Önce kullanıcının authenticate ve onaylı olduğu kontrol edilmeli, sonra
 * rol kontrolü yapılmalıdır.
 * 
 * @author MediKariyer Development Team
 * @version 2.0.0
 * @since 2024
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';

/**
 * ============================================================================
 * ROLE GUARD COMPONENT
 * ============================================================================
 * 
 * Kullanıcının belirli rollere sahip olmasını kontrol eden guard component
 * Backend roleGuard.js ile aynı mantığı uygular
 * 
 * Parametreler:
 * @param {React.ReactNode} children - Korunacak component/route içeriği
 * @param {Array<string>|string} allowedRoles - İzin verilen roller listesi veya tek rol
 *                                             Boş array ise sadece authenticate kontrolü yapılır
 *                                             Örnek: ['doctor'], ['doctor', 'hospital'], 'admin'
 * 
 * Dönüş:
 * @returns {React.ReactNode} Yetkili kullanıcılar için children, 
 *                            yetkisiz kullanıcılar için Navigate (ana sayfaya)
 */
const RoleGuard = ({ children, allowedRoles = [] }) => {
  /**
   * ============================================================================
   * STATE VE HOOKS
   * ============================================================================
   */
  
  /**
   * Auth store'dan kullanıcı bilgileri ve authentication durumu
   */
  const { user, isAuthenticated } = useAuthStore();

  // ============================================================================
  // GUARD LOGIC - Guard mantığı
  // ============================================================================

  /**
   * 1. Kullanıcı kimlik doğrulaması kontrolü
   * 
   * Backend roleGuard ile aynı mantık: Kullanıcının authenticate olup
   * olmadığını ve user bilgisinin varlığını kontrol eder
   * 
   * Kontrol:
   * - isAuthenticated === true olmalı
   * - user objesi mevcut olmalı
   * 
   * Redirect:
   * - Authenticate olmayan kullanıcılar login sayfasına yönlendirilir
   * 
   * Backend Uyumluluk:
   * - Backend roleGuard.js'deki kimlik doğrulama kontrolü ile aynı
   */
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  /**
   * 2. Admin muafiyeti kontrolü
   * 
   * Backend roleGuard ile aynı mantık: Admin rolü için rol kontrolü
   * yapılmaz, doğrudan erişim verilir
   * 
   * Admin Özellikleri:
   * - Admin her zaman tüm sayfalara erişebilir
   * - allowedRoles kontrolü atlanır
   * - Admin muafiyeti backend ile aynı şekilde uygulanır
   * 
   * Backend Uyumluluk:
   * - Backend roleGuard.js'deki admin muafiyeti ile aynı
   * - Admin her yere erişebilir, özel kontrol yapılmaz
   */
  if (user.role === 'admin') {
    return children;
  }

  /**
   * 3. Rol kontrolü
   * 
   * Backend roleGuard ile aynı mantık: Kullanıcı rolünün allowedRoles
   * içinde olup olmadığını kontrol eder
   * 
   * Rol Normalizasyonu:
   * - allowedRoles array ise direkt kullanılır
   * - allowedRoles string ise array'e dönüştürülür
   * - Boş array ise sadece authenticate kontrolü yapılmış olur
   * 
   * Kontrol:
   * - allowedRoles.length > 0 ise rol kontrolü yapılır
   * - allowedRoles.length === 0 ise sadece authenticate kontrolü yeterlidir
   * - user.role, roles array'inde var mı kontrol edilir
   * 
   * Backend Uyumluluk:
   * - Backend roleGuard.js'deki rol kontrolü ile aynı
   */
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  if (allowedRoles.length > 0 && !roles.includes(user.role)) {
    /**
     * Yetki hatası
     * 
     * Kullanıcının rolü allowedRoles içinde değilse erişim reddedilir
     * Ana sayfaya yönlendirilir (403 hatası yerine kullanıcı dostu yönlendirme)
     */
    return <Navigate to="/" replace />;
  }

  /**
   * 4. Yetkili erişim
   * 
   * Tüm kontroller geçildi:
   * - Kullanıcı authenticate
   * - Admin veya yetkili rol
   * 
   * İçeriğe erişim verilir
   */
  return children;
};

export default RoleGuard;
