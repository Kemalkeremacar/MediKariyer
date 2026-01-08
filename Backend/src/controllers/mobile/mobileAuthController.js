/**
 * @file mobileAuthController.js
 * @description Mobile authentication controller - Mobil uygulama için kimlik doğrulama işlemlerini yönetir.
 * Bu controller, mobileAuthRoutes tarafından kullanılan endpoint'leri içerir.
 * 
 * Ana İşlevler:
 * - Mobil uygulama login işlemi
 * - Token yenileme (refresh token)
 * - Logout işlemi
 * - Şifre sıfırlama talebi (forgot password)
 * 
 * Endpoint'ler:
 * - POST /api/mobile/auth/login - Mobil login
 * - POST /api/mobile/auth/refresh - Token yenileme
 * - POST /api/mobile/auth/logout - Çıkış
 * - POST /api/mobile/auth/forgot-password - Şifre sıfırlama talebi
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

/**
 * Şifre sıfırlama talebi - Web ile aynı mantık
 * Mail gönderme işi aynı, aynı doktor hem web'den hem mobile'dan şifremi unuttum diyebilir
 */
const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  const logger = require('../../utils/logger');
  
  logger.info('Mobile password reset request received', { email });
  
  await mobileAuthService.forgotPassword(email, req);
  
  // Web ile aynı mesaj - güvenlik için her zaman başarılı mesaj döner
  return sendSuccess(
    res,
    'Eğer kayıtlı bir hesabınız varsa, şifre sıfırlama bağlantısı e-posta adresinize gönderildi.',
    { success: true, message: 'Eğer kayıtlı bir hesabınız varsa, şifre sıfırlama bağlantısı e-posta adresinize gönderildi.' }
  );
});

/**
 * Reset password using reset token
 * Requirements: 10.1, 10.2, 10.3
 * POST /api/mobile/auth/reset-password
 */
const resetPassword = catchAsync(async (req, res) => {
  const { token, new_password } = req.body;
  
  await mobileAuthService.resetPassword(token, new_password);
  
  return sendSuccess(res, 'Şifre başarıyla sıfırlandı', { success: true });
});

/**
 * Logout from all devices
 * Requirements: 11.1, 11.2, 11.4
 * POST /api/mobile/auth/logout-all
 */
const logoutAll = catchAsync(async (req, res) => {
  const userId = req.user.id;
  
  const result = await mobileAuthService.logoutAll(userId);
  
  return sendSuccess(res, 'Tüm oturumlar sonlandırıldı', result);
});

module.exports = {
  registerDoctor,
  login,
  refreshToken,
  logout,
  getMe,
  changePassword,
  forgotPassword,
  resetPassword,
  logoutAll
};

