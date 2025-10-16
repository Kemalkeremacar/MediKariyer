/**
 * Rate Limiting Middleware
 * 
 * Bu middleware dosyası farklı endpoint'ler için rate limiting
 * koruması sağlar. Brute force saldırılarına karşı koruma.
 * 
 * @author MediKariyer Team
 * @version 2.0.0
 */

const rateLimit = require('express-rate-limit');

/**
 * Authentication Rate Limiter
 * Login ve register endpoint'leri için brute force koruması
 */
const authLimiter = rateLimit({
  windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 dakika
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS) || 1000, // Test için 1000 deneme
  message: {
    error: 'Çok fazla giriş denemesi yaptınız. Lütfen 15 dakika sonra tekrar deneyin.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Başarılı istekleri de say
  skipFailedRequests: false, // Başarısız istekleri de say
  keyGenerator: (req) => {
    // IP + User-Agent kombinasyonu ile daha güvenli
    return req.ip + req.get('User-Agent');
  }
});

/**
 * General API Rate Limiter
 * Genel API endpoint'leri için orta seviye koruma
 */
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.API_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 dakika
  max: parseInt(process.env.API_RATE_LIMIT_MAX_REQUESTS) || 100, // 100 istek
  message: {
    error: 'Çok fazla API isteği yaptınız. Lütfen biraz sonra tekrar deneyin.',
    code: 'API_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Başarılı istekleri sayma
  skipFailedRequests: false
});

/**
 * Strict Rate Limiter
 * Hassas işlemler için sıkı koruma (şifre değiştirme, profil güncelleme)
 */
const strictLimiter = rateLimit({
  windowMs: parseInt(process.env.STRICT_RATE_LIMIT_WINDOW_MS) || 5 * 60 * 1000, // 5 dakika
  max: parseInt(process.env.STRICT_RATE_LIMIT_MAX_REQUESTS) || 3, // 3 deneme
  message: {
    error: 'Çok fazla hassas işlem denemesi yaptınız. Lütfen 5 dakika sonra tekrar deneyin.',
    code: 'STRICT_RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skipFailedRequests: false
});

module.exports = {
  authLimiter,
  apiLimiter,
  strictLimiter
};
