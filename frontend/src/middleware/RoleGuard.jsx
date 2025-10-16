/**
 * Role Guard - Rol tabanlı erişim kontrolü
 * Backend roleGuard eşleniği
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';

/**
 * RoleGuard Component - Backend roleGuard.js eşleniği
 * Kullanıcının belirli rollere sahip olmasını kontrol eder
 * Backend roleGuard ile aynı kontrolleri yapar:
 * - Kullanıcı kimlik doğrulaması kontrolü
 * - Kullanıcı rolü kontrolü
 * - İzin verilen rollerle karşılaştırma
 * - Admin muafiyeti (admin her yere erişebilir)
 */
const RoleGuard = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated } = useAuthStore();

  // 1. Kullanıcı kimlik doğrulaması kontrolü - Backend roleGuard ile aynı
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Admin kontrolü - Backend roleGuard ile aynı (admin her şeye erişebilir)
  if (user.role === 'admin') {
    return children;
  }

  // 3. Rol kontrolü - Backend roleGuard ile aynı
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  if (allowedRoles.length > 0 && !roles.includes(user.role)) {
    // Yetki hatası - ana sayfaya yönlendir
    return <Navigate to="/" replace />;
  }

  return children;
};

export default RoleGuard;
