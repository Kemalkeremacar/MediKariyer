/**
 * @file AuthGuard.jsx
 * @description Auth Guard - Kimlik doğrulama ve yetkilendirme middleware'leri
 * 
 * Bu dosya, uygulama genelinde kullanılan kimlik doğrulama ve yetkilendirme
 * guard component'lerini içerir. Backend authMiddleware.js ile birebir uyumlu
 * çalışır ve aynı mantığı uygular.
 * 
 * Guard Component'ler:
 * 1. AuthGuard: Temel kimlik doğrulama ve hesap durumu kontrolü
 * 2. GuestGuard: Zaten giriş yapmış kullanıcıları dashboard'a yönlendirme
 * 3. OptionalAuthGuard: Opsiyonel kimlik doğrulama (public sayfalar için)
 * 
 * Ana Özellikler (AuthGuard):
 * - Token geçerliliği kontrolü: JWT token'ın geçerliliğini kontrol eder
 * - Kullanıcı varlığı kontrolü: Auth store'da kullanıcı bilgisi kontrolü
 * - Hesap durumu kontrolü: is_active ve is_approved durumu kontrolü
 * - Admin muafiyeti: Admin rolü için bazı kontroller atlanır
 * - Otomatik token kontrolü: useEffect ile token geçerliliği kontrolü
 * - Redirect yönetimi: Login sayfasına yönlendirme ve state geçişi
 * 
 * Backend Uyumluluk:
 * - Backend authMiddleware.js ile aynı mantık
 * - Token geçerliliği kontrolü
 * - is_active kontrolü (admin hariç)
 * - is_approved kontrolü (admin hariç)
 * - Admin muafiyeti (admin için is_active ve is_approved kontrolü yok)
 * 
 * Kullanım Örnekleri:
 * ```jsx
 * import AuthGuard, { GuestGuard, OptionalAuthGuard } from '@/middleware/AuthGuard';
 * 
 * // Protected route
 * <Route path="/doctor" element={
 *   <AuthGuard>
 *     <DoctorPage />
 *   </AuthGuard>
 * } />
 * 
 * // Guest only route
 * <Route path="/login" element={
 *   <GuestGuard>
 *     <LoginPage />
 *   </GuestGuard>
 * } />
 * 
 * // Optional auth route
 * <Route path="/public" element={
 *   <OptionalAuthGuard>
 *     <PublicPage />
 *   </OptionalAuthGuard>
 * } />
 * ```
 * 
 * Guard Sıralaması:
 * Genellikle guard'lar şu sırayla kullanılır:
 * 1. AuthGuard: Kimlik doğrulama kontrolü
 * 2. ApprovalGuard: Onay durumu kontrolü (AuthGuard'dan sonra)
 * 3. RoleGuard: Rol bazlı erişim kontrolü (AuthGuard ve ApprovalGuard'dan sonra)
 * 
 * @author MediKariyer Development Team
 * @version 2.0.0
 * @since 2024
 */

import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { getAccessToken, isTokenValid } from '@/utils/tokenUtils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

/**
 * ============================================================================
 * AUTH GUARD COMPONENT - Temel kimlik doğrulama guard'ı
 * ============================================================================
 * 
 * Kullanıcının giriş yapmış olmasını ve hesap durumunu kontrol eden guard component
 * Backend authMiddleware.js ile aynı mantığı uygular
 * 
 * Parametreler:
 * @param {React.ReactNode} children - Korunacak component/route içeriği
 * 
 * Dönüş:
 * @returns {React.ReactNode} Authenticate kullanıcılar için children, 
 *                            authenticate olmayan kullanıcılar için Navigate
 * 
 * Kontrol Akışı:
 * 1. Token geçerliliği kontrolü (useEffect ile otomatik)
 * 2. Kimlik doğrulama kontrolü: isAuthenticated ve user kontrolü
 * 3. Hesap durumu kontrolü: is_active kontrolü (admin hariç)
 * 4. Onay durumu kontrolü: is_approved kontrolü (admin hariç)
 * 5. Erişim izni: Tüm kontroller geçildiyse içeriğe erişim ver
 */
const AuthGuard = ({ children }) => {
  /**
   * ============================================================================
   * STATE VE HOOKS
   * ============================================================================
   */
  
  /**
   * Current location bilgisi (redirect için)
   */
  const location = useLocation();
  
  /**
   * Auth store'dan kullanıcı bilgileri ve authentication durumu
   */
  const { isAuthenticated, user, clearAuthState } = useAuthStore();

  // ============================================================================
  // EFFECTS - Side effect'ler
  // ============================================================================

  /**
   * Token geçerliliği kontrolü
   * 
   * Kullanıcı authenticate olduğunda token'ın geçerliliğini kontrol eder
   * Geçersiz token varsa auth state'i temizler
   * 
   * Teknik Detaylar:
   * - Sadece isAuthenticated === true olduğunda çalışır
   * - getAccessToken() ile token alınır
   * - isTokenValid() ile token geçerliliği kontrol edilir
   * - Geçersiz token varsa clearAuthState() çağrılır
   */
  useEffect(() => {
    // Token geçerliliğini kontrol et - sadece isAuthenticated değiştiğinde
    const checkToken = async () => {
      // Sadece authenticated ise kontrol et
      if (!isAuthenticated) return;
      
      const token = getAccessToken();
      
      if (token && !isTokenValid(token)) {
        // Token geçersizse state'i temizle ve anasayfaya yönlendir
        clearAuthState();
      }
    };
    
    // Sadece bir kez çalıştır
    checkToken();
  }, [isAuthenticated, clearAuthState]);

  // ============================================================================
  // GUARD LOGIC - Guard mantığı
  // ============================================================================

  /**
   * 1. Authorization kontrolü
   * 
   * Backend authMiddleware ile aynı mantık: Kullanıcının authenticate olup
   * olmadığını ve user bilgisinin varlığını kontrol eder
   * 
   * Kontrol:
   * - isAuthenticated === true olmalı
   * - user objesi mevcut olmalı
   * 
   * Redirect:
   * - Authenticate olmayan kullanıcılar login sayfasına yönlendirilir
   * - from state ile geri dönüş için location bilgisi gönderilir
   */
  if (!isAuthenticated || !user) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  /**
   * 2. Hesap durumu kontrolü (is_active)
   * 
   * Backend authMiddleware ile aynı mantık: Kullanıcının hesabının aktif
   * olup olmadığını kontrol eder
   * 
   * Admin Muafiyeti:
   * - Admin rolü için is_active kontrolü yapılmaz (backend ile aynı)
   * - Admin her zaman erişebilir
   * 
   * Kontrol:
   * - is_active === 1 (integer) veya is_active === true (boolean)
   * - Her iki format da kabul edilir (backend uyumluluk için)
   * 
   * Pasif Kullanıcı:
   * - Auth state temizlenir (güvenlik için)
   * - Login sayfasına yönlendirilir
   * - Mesaj gösterilir: "Hesabınız pasifleştirilmiş."
   * 
   * Backend Uyumluluk:
   * - Backend authMiddleware.js'deki is_active kontrolü ile aynı
   */
  if (user.role !== 'admin' && !(user.is_active === 1 || user.is_active === true)) {
    // Pasif kullanıcıları state'i temizle ve anasayfaya yönlendir
    clearAuthState();
    return (
      <Navigate 
        to="/login" 
        state={{ message: 'Hesabınız pasifleştirilmiş.' }}
        replace 
      />
    );
  }

  /**
   * 3. Onay durumu kontrolü (is_approved)
   * 
   * Backend authMiddleware ile aynı mantık: Kullanıcının admin tarafından
   * onaylanmış olup olmadığını kontrol eder
   * 
   * Admin Muafiyeti:
   * - Admin rolü için is_approved kontrolü yapılmaz (backend ile aynı)
   * - Admin her zaman erişebilir
   * 
   * Kontrol:
   * - is_approved === 1 (integer) veya is_approved === true (boolean)
   * - Her iki format da kabul edilir (backend uyumluluk için)
   * 
   * Onaylanmamış Kullanıcı:
   * - Login sayfasına yönlendirilir
   * - pendingApproval state ile login sayfasında uyarı gösterilir
   * 
   * Backend Uyumluluk:
   * - Backend authMiddleware.js'deki is_approved kontrolü ile aynı
   * - ApprovalGuard component'i ile aynı mantık
   */
  if (user.role !== 'admin' && !(user.is_approved === 1 || user.is_approved === true)) {
    return (
      <Navigate 
        to="/login" 
        state={{ pendingApproval: true }}
        replace 
      />
    );
  }

  /**
   * 4. Erişim izni verildi
   * 
   * Tüm kontroller geçildi:
   * - Kullanıcı authenticate
   * - Hesap aktif (admin hariç)
   * - Hesap onaylı (admin hariç)
   * 
   * İçeriğe erişim verilir
   */
  return children;
};

/**
 * ============================================================================
 * GUEST GUARD COMPONENT - Misafir kullanıcılar için guard
 * ============================================================================
 * 
 * Zaten giriş yapmış kullanıcıları login/register sayfalarından dashboard'a
 * yönlendiren guard component. Public sayfaların sadece misafir kullanıcılar
 * tarafından görüntülenmesini sağlar.
 * 
 * Ana Özellikler:
 * - Authenticate kontrolü: Giriş yapmış kullanıcıları tespit eder
 * - Rol bazlı yönlendirme: Her rol için kendi dashboard'ına yönlendirme
 * - Onay kontrolü: Doctor/Hospital için onay durumu kontrolü
 * - Sonsuz döngü önleme: Login sayfasında kalıcı toast gösterimi
 * - Admin erişimi: Admin doğrudan admin dashboard'a yönlendirilir
 * 
 * Yönlendirme Mantığı:
 * - Admin: /admin dashboard'ına
 * - Doctor/Hospital (Onaylı): /doctor veya /hospital dashboard'ına
 * - Doctor/Hospital (Onaylanmamış): Login sayfasında kal (pendingApproval state)
 * - Diğer roller: Ana sayfaya (/)
 * 
 * Kullanım:
 * ```jsx
 * import { GuestGuard } from '@/middleware/AuthGuard';
 * 
 * <Route path="/login" element={
 *   <GuestGuard>
 *     <LoginPage />
 *   </GuestGuard>
 * } />
 * ```
 * 
 * Parametreler:
 * @param {React.ReactNode} children - Korunacak component/route içeriği (genellikle Login/Register sayfaları)
 * 
 * Dönüş:
 * @returns {React.ReactNode} Misafir kullanıcılar için children, 
 *                            authenticate kullanıcılar için Navigate (dashboard'a)
 */
export const GuestGuard = ({ children }) => {
  /**
   * ============================================================================
   * STATE VE HOOKS
   * ============================================================================
   */
  
  /**
   * Auth store'dan kullanıcı bilgileri ve authentication durumu
   */
  const { isAuthenticated, user } = useAuthStore();
  
  /**
   * Current location bilgisi (sonsuz döngü önleme için)
   */
  const location = useLocation();

  // ============================================================================
  // GUARD LOGIC - Guard mantığı
  // ============================================================================

  /**
   * Authenticate kullanıcı kontrolü
   * 
   * Kullanıcı authenticate ise ve user bilgisi mevcutsa dashboard'a yönlendir
   * Token kontrolü de yapılır (user.id varlığı ile)
   */
  if (isAuthenticated && user && user.id) {
    /**
     * Admin yönlendirme
     * 
     * Admin rolü için onay kontrolü yapılmaz, doğrudan admin dashboard'a yönlendirilir
     */
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    
    /**
     * Doctor/Hospital yönlendirme
     * 
     * Doctor ve Hospital rolleri için onay durumu kontrolü yapılır
     * Onaylı ise kendi dashboard'larına, onaylı değilse login sayfasında kalır
     */
    if (user.role === 'doctor' || user.role === 'hospital') {
      // Onaylanmamış kullanıcı kontrolü
      if (!(user.is_approved === 1 || user.is_approved === true)) {
        /**
         * Sonsuz döngü önleme
         * 
         * Login sayfasındaysak yönlendirme yapılmaz, children render edilir
         * Bu sayede login sayfasında kalıcı toast gösterilebilir
         * Başka bir sayfadaysak login'e yönlendirilir
         */
        if (location.pathname === '/login') {
          return children;
        }
        // Başka bir sayfadaysak login'e yönlendir
        return <Navigate to="/login" state={{ pendingApproval: true }} replace />;
      }
      
      // Onaylı kullanıcı: Kendi dashboard'ına yönlendir
      return <Navigate to={`/${user.role}`} replace />;
    }
    
    /**
     * Diğer roller için ana sayfa yönlendirme
     * 
     * Tanımlı olmayan roller için ana sayfaya yönlendirilir
     */
    return <Navigate to="/" replace />;
  }

  /**
   * Misafir kullanıcı erişimi
   * 
   * Kullanıcı authenticate değilse veya user bilgisi yoksa
   * Public sayfaya (login/register) erişim verilir
   */
  return children;
};

/**
 * ============================================================================
 * OPTIONAL AUTH GUARD COMPONENT - Opsiyonel kimlik doğrulama guard'ı
 * ============================================================================
 * 
 * Kimlik doğrulama opsiyonel olan sayfalar için kullanılan guard component.
 * Public sayfaların hem authenticate hem de misafir kullanıcılar tarafından
 * görüntülenmesini sağlar, ancak loading durumunu yönetir.
 * 
 * Ana Özellikler:
 * - Loading yönetimi: Auth store'da loading durumu varsa spinner gösterir
 * - Opsiyonel auth: Authenticate veya misafir kullanıcılar erişebilir
 * - Basit yapı: Sadece loading kontrolü yapar, redirect yapmaz
 * 
 * Kullanım:
 * ```jsx
 * import { OptionalAuthGuard } from '@/middleware/AuthGuard';
 * 
 * <Route path="/about" element={
 *   <OptionalAuthGuard>
 *     <AboutPage />
 *   </OptionalAuthGuard>
 * } />
 * ```
 * 
 * Not: Bu guard sadece loading yönetimi yapar. Authenticate kontrolü için
 * AuthGuard, misafir kontrolü için GuestGuard kullanılmalıdır.
 * 
 * Parametreler:
 * @param {React.ReactNode} children - Korunacak component/route içeriği
 * 
 * Dönüş:
 * @returns {React.ReactNode} Loading durumunda spinner, 
 *                            normal durumda children
 */
export const OptionalAuthGuard = ({ children }) => {
  /**
   * ============================================================================
   * STATE VE HOOKS
   * ============================================================================
   */
  
  /**
   * Auth store'dan loading durumu
   */
  const { isLoading } = useAuthStore();

  // ============================================================================
  // GUARD LOGIC - Guard mantığı
  // ============================================================================

  /**
   * Loading durumu kontrolü
   * 
   * Auth store'da loading durumu varsa kullanıcıya loading spinner gösterilir
   * Bu, auth state'in hazırlanması sırasında sayfanın render edilmesini önler
   */
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-blue-600">
        <LoadingSpinner size="xl" color="white" />
      </div>
    );
  }

  /**
   * Normal durum
   * 
   * Loading durumu yoksa içeriğe erişim verilir
   * Authenticate veya misafir kullanıcılar erişebilir
   */
  return children;
};

export default AuthGuard;
