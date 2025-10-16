import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';

/**
 * Approval Guard - Backend authMiddleware.js onay kontrolü eşleniği
 * Kullanıcının admin tarafından onaylanmış olmasını kontrol eder
 * Backend authMiddleware ile aynı kontrolleri yapar:
 * - Admin muafiyeti (admin için onay kontrolü yapılmaz)
 * - Diğer kullanıcılar için is_approved kontrolü
 */
const ApprovalGuard = ({ children }) => {
  const { user, isAuthenticated } = useAuthStore();


  // 1. Kullanıcı kimlik doğrulaması kontrolü
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Admin muafiyeti - Backend authMiddleware ile aynı
  // Admin için is_approved kontrolü yapılmaz
  if (user.role === 'admin') {
    return children;
  }

  // 3. Onay durumu kontrolü - Backend authMiddleware ile aynı
  // Diğer kullanıcılar için is_approved kontrolü yapılır
  if (!(user.is_approved === 1 || user.is_approved === true)) {
    return <Navigate to="/login" state={{ pendingApproval: true }} replace />;
  }

  // 4. Onaylı kullanıcı, devam edebilir
  return children;
};

export default ApprovalGuard;
