/**
 * Auth Guard - Kimlik doğrulama koruması
 * Backend authMiddleware eşleniği
 */

import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { getAccessToken, isTokenValid } from '@/utils/tokenUtils';

/**
 * AuthGuard Component - Backend authMiddleware.js eşleniği
 * Kullanıcının giriş yapmış olmasını kontrol eder
 * Backend authMiddleware ile aynı kontrolleri yapar:
 * - Token geçerliliği
 * - Kullanıcı varlığı
 * - Hesap durumu (is_active, is_approved)
 * - Admin muafiyeti
 */
const AuthGuard = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, user, clearAuthState } = useAuthStore();

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

  // 1. Authorization kontrolü - Backend authMiddleware ile aynı
  if (!isAuthenticated || !user) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // 2. Hesap durumu kontrolü - Backend authMiddleware ile aynı
  // Admin için is_active kontrolü yapılmaz, diğer kullanıcılar için yapılır
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

  // 3. Onay durumu kontrolü - Backend authMiddleware ile aynı
  // Admin için is_approved kontrolü yapılmaz, diğer kullanıcılar için yapılır
  if (user.role !== 'admin' && !(user.is_approved === 1 || user.is_approved === true)) {
    return (
      <Navigate 
        to="/login" 
        state={{ pendingApproval: true }}
        replace 
      />
    );
  }

  return children;
};

/**
 * Guest Guard Component
 * Zaten giriş yapmış kullanıcıları dashboard'a yönlendirir
 */
export const GuestGuard = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  // Sadece gerçekten başarılı giriş yapmış kullanıcıları yönlendir
  // Token kontrolü ekle
  if (isAuthenticated && user && user.id) {
    // Admin onay gerektirmez
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    
    // Doctor/Hospital için approval kontrolü
    if (user.role === 'doctor' || user.role === 'hospital') {
      // Onaylanmamışsa login sayfasında kal (sonsuz döngüyü önle)
      if (!(user.is_approved === 1 || user.is_approved === true)) {
        // Login sayfasındaysak yönlendirme yapma, kalıcı toast göster
        if (location.pathname === '/login') {
          return children;
        }
        // Başka bir sayfadaysak login'e yönlendir
        return <Navigate to="/login" state={{ pendingApproval: true }} replace />;
      }
      
      // Onaylıysa kendi dashboard'ına git
      return <Navigate to={`/${user.role}`} replace />;
    }
    
    // Diğer roller için ana sayfa
    return <Navigate to="/" replace />;
  }

  return children;
};

/**
 * Optional Auth Guard
 * Kimlik doğrulama opsiyonel olan sayfalar için
 */
export const OptionalAuthGuard = ({ children }) => {
  const { isLoading } = useAuthStore();

  // Loading durumunda spinner göster
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Yükleniyor...</div>;
  }

  return children;
};

export default AuthGuard;
