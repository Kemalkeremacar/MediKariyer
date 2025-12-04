/**
 * @file mobileAuthController.js
 * @description Mobile authentication controller - Mobil uygulama için kimlik doğrulama işlemlerini yönetir.
 * Bu controller, mobileAuthRoutes tarafından kullanılan endpoint'leri içerir.
 * 
 * Ana İşlevler:
 * - Mobil uygulama login işlemi
 * - Token yenileme (refresh token)
 * - Logout işlemi
 * 
 * Endpoint'ler:
 * - POST /api/mobile/auth/login - Mobil login
 * - POST /api/mobile/auth/refresh - Token yenileme
 * - POST /api/mobile/auth/logout - Çıkış
 * 
 * Özellikler:
 * - Sadece doktor rolü için erişim
 * - Minimal response payload (mobile optimized)
 * - JSON-only error handling
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

'use strict';

// ============================================================================
// DIŞ BAĞIMLILIKLAR
// ============================================================================

const { sendSuccess } = require('../../utils/response');
const { catchAsync } = require('../../utils/errorHandler');
const mobileAuthService = require('../../services/mobile/mobileAuthService');

const registerDoctor = catchAsync(async (req, res) => {
  const result = await mobileAuthService.registerDoctor(req.body, req);
  return sendSuccess(res, 'Kayıt başarılı, admin onayı bekleniyor', result, 201);
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const result = await mobileAuthService.login({ email, password }, req);
  return sendSuccess(res, 'Giriş başarılı', result);
});

const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken: token } = req.body;
  const result = await mobileAuthService.refresh(token);
  return sendSuccess(res, 'Token yenilendi', result);
});

const logout = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;
  await mobileAuthService.logout(refreshToken);
  return sendSuccess(res, 'Çıkış yapıldı', { success: true });
});

const getMe = catchAsync(async (req, res) => {
  const result = await mobileAuthService.getMe(req.user.id);
  return sendSuccess(res, 'Kullanıcı bilgileri getirildi', result);
});

const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await mobileAuthService.changePassword(req.user.id, { currentPassword, newPassword });
  return sendSuccess(res, 'Şifre başarıyla değiştirildi');
});

module.exports = {
  registerDoctor,
  login,
  refreshToken,
  logout,
  getMe,
  changePassword
};

