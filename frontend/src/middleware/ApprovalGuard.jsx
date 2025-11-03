/**
 * @file ApprovalGuard.jsx
 * @description Approval Guard - Kullanıcı onay durumu kontrolü middleware'i
 * 
 * Bu component, kullanıcının admin tarafından onaylanmış olup olmadığını kontrol eder.
 * Backend authMiddleware.js ile birebir uyumlu çalışır ve aynı mantığı uygular.
 * 
 * Ana Özellikler:
 * - Onay durumu kontrolü: Kullanıcının is_approved durumunu kontrol eder
 * - Admin muafiyeti: Admin rolü için onay kontrolü yapılmaz (otomatik erişim)
 * - Redirect yönetimi: Onaylanmamış kullanıcıları login sayfasına yönlendirir
 * - React Router entegrasyonu: Navigate component ile yönlendirme
 * - Auth store entegrasyonu: useAuthStore ile kullanıcı bilgilerine erişim
 * 
 * Backend Uyumluluk:
 * - Backend authMiddleware.js ile aynı mantık
 * - Admin muafiyeti: Backend'deki gibi admin için is_approved kontrolü yapılmaz
 * - Onay kontrolü: is_approved === 1 || is_approved === true kontrolü
 * 
 * Kontrol Akışı:
 * 1. Kimlik doğrulama kontrolü: Kullanıcı authenticate değilse login'e yönlendir
 * 2. Admin muafiyeti: Admin rolü için doğrudan erişim ver (onay kontrolü yok)
 * 3. Onay durumu kontrolü: Diğer kullanıcılar için is_approved kontrolü yap
 * 4. Onaylanmamış kullanıcılar: Login sayfasına yönlendir (pendingApproval state ile)
 * 5. Onaylı kullanıcılar: İçeriğe erişim ver
 * 
 * Kullanım:
 * ```jsx
 * import ApprovalGuard from '@/middleware/ApprovalGuard';
 * 
 * <Route path="/doctor" element={
 *   <AuthGuard>
 *     <ApprovalGuard>
 *       <DoctorPage />
 *     </ApprovalGuard>
 *   </AuthGuard>
 * } />
 * ```
 * 
 * Not: Bu guard genellikle AuthGuard'dan sonra kullanılır. Önce kullanıcının
 * authenticate olduğu kontrol edilmeli, sonra onay durumu kontrol edilmelidir.
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
 * APPROVAL GUARD COMPONENT
 * ============================================================================
 * 
 * Kullanıcının admin tarafından onaylanmış olmasını kontrol eden guard component
 * Backend authMiddleware.js ile aynı mantığı uygular
 * 
 * Parametreler:
 * @param {React.ReactNode} children - Korunacak component/route içeriği
 * 
 * Dönüş:
 * @returns {React.ReactNode} Onaylı kullanıcılar için children, onaylanmamış kullanıcılar için Navigate
 */
const ApprovalGuard = ({ children }) => {
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
   * Kullanıcı authenticate değilse veya user bilgisi yoksa
   * login sayfasına yönlendir
   */
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  /**
   * 2. Admin muafiyeti kontrolü
   * 
   * Backend authMiddleware ile aynı mantık: Admin rolü için
   * is_approved kontrolü yapılmaz, doğrudan erişim verilir
   * 
   * Backend Uyumluluk:
   * - Backend authMiddleware.js'deki admin muafiyeti ile aynı
   * - Admin her zaman erişebilir, onay kontrolü yok
   */
  if (user.role === 'admin') {
    return children;
  }

  /**
   * 3. Onay durumu kontrolü
   * 
   * Backend authMiddleware ile aynı mantık: Diğer kullanıcılar için
   * is_approved durumu kontrol edilir
   * 
   * Onay Kontrolü:
   * - is_approved === 1 (integer) veya is_approved === true (boolean)
   * - Her iki format da kabul edilir (backend uyumluluk için)
   * 
   * Backend Uyumluluk:
   * - Backend authMiddleware.js'deki is_approved kontrolü ile aynı
   * - is_approved !== 1 && is_approved !== true ise erişim reddedilir
   */
  if (!(user.is_approved === 1 || user.is_approved === true)) {
    return <Navigate to="/login" state={{ pendingApproval: true }} replace />;
  }

  /**
   * 4. Onaylı kullanıcı erişimi
   * 
   * Tüm kontroller geçildi, kullanıcı onaylı ve erişim izni var
   * İçeriğe erişim verilir
   */
  return children;
};

export default ApprovalGuard;
