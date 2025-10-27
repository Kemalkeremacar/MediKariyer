/**
 * @file securityConfig.js
 * @description Uygulamanın güvenlik katmanıyla ilgili tüm yapılandırmaları merkezi bir yerde toplar.
 * CORS, Helmet (güvenlik başlıkları), Rate Limiting (istek sınırlama), JWT ve şifreleme (Bcrypt)
 * ayarları bu dosyada yönetilir.
 */

'use strict';

// 1. CORS (Cross-Origin Resource Sharing) Yapılandırması
// Tarayıcıların, farklı bir domain, port veya protokolden gelen kaynaklara (API gibi)
// erişimini kontrol eden bir güvenlik mekanizmasıdır.
const CORS_OPTIONS = {
  // 'origin' fonksiyonu, gelen isteğin kaynağını (origin) kontrol eder ve izin verilip verilmeyeceğine karar verir.
  origin: function (origin, callback) {
    // İzin verilen kaynakların (frontend adresleri) listesi. .env dosyasından okunur.
    const allowedOrigins = [
      process.env.CORS_ORIGIN || 'http://localhost:5000',
      'http://localhost:5000', // Frontend - Vite dev server
      'http://localhost:3000',
      'http://127.0.0.1:5000',
      'http://127.0.0.1:3000',
      'http://192.168.1.198:5000', // Network IP - Frontend
      'http://192.168.1.198:3000'  // Network IP - Backend
    ];
    
    // Kaynağı olmayan isteklere (mobil uygulamalar, Postman gibi araçlar) izin ver.
    if (!origin) return callback(null, true);
    
    // Gelen isteğin kaynağı izin verilenler listesinde varsa, isteğe izin ver.
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // Listede yoksa, CORS hatası fırlat.
      callback(new Error('Bu kaynağa CORS politikası tarafından izin verilmiyor.'));
    }
  },
  credentials: true, // Frontend'in cookie gibi kimlik bilgilerini API'ye göndermesine izin ver.
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // İzin verilen HTTP metodları.
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With', 
    'x-request-id', 
    'X-Request-ID',
    'x-client-version',
    'X-Client-Version'
  ], // İzin verilen HTTP başlıkları.
  exposedHeaders: ['X-Total-Count', 'X-Total-Pages'] // Frontend'in erişebileceği özel başlıklar (örn: sayfalama bilgisi).
};

// 2. Helmet (Güvenlik Başlıkları) Yapılandırması
// Express uygulamalarına çeşitli HTTP başlıkları ekleyerek bilinen web zafiyetlerine karşı koruma sağlar.
const SECURITY_HEADERS = {
  // Content Security Policy (CSP): XSS gibi saldırıları önlemek için hangi kaynakların yüklenebileceğini kısıtlar.
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"], // Varsayılan olarak sadece kendi domain'imizden kaynak yükle.
      styleSrc: ["'self'", "'unsafe-inline'"], // Stil dosyaları için inline stil kullanımına izin ver.
      scriptSrc: ["'self'"], // Script'ler sadece kendi domain'imizden yüklensin.
      imgSrc: ["'self'", "data:", "https:"], // Resimler kendi domain'imizden, data URI'lerinden veya https üzerinden yüklenebilir.
      connectSrc: ["'self'"], // API istekleri sadece kendi domain'imize yapılsın.
      fontSrc: ["'self'"], // Fontlar sadece kendi domain'imizden yüklensin.
      objectSrc: ["'none'"], // <object> elementi kullanımını engelle.
      mediaSrc: ["'self'"], // Medya (video, ses) sadece kendi domain'imizden yüklensin.
      frameSrc: ["'none'"] // <iframe> kullanımını engelle (clickjacking'e karşı koruma).
    }
  },
  crossOriginEmbedderPolicy: false, // Kaynakların çapraz kökenli gömülme politikasını gevşetir.
  // HTTP Strict Transport Security (HSTS): Tarayıcıyı sadece HTTPS üzerinden iletişim kurmaya zorlar.
  hsts: {
    maxAge: 31536000, // Politikanın ne kadar süreyle (saniye cinsinden) geçerli olacağı (1 yıl).
    includeSubDomains: true, // Politikayı tüm alt domain'lere uygula.
    preload: true // Siteyi HSTS preload listesine dahil etme isteği.
  }
};

// 3. JWT (JSON Web Token) Yapılandırması
// Kullanıcıların kimliğini doğrulamak ve yetkilendirmek için kullanılır.
const JWT_CONFIG = {
  ACCESS_TOKEN_SECRET: process.env.JWT_SECRET, // Erişim token'ını imzalamak için kullanılan gizli anahtar.
  REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_SECRET, // Yenileme token'ını imzalamak için kullanılan gizli anahtar.
  ACCESS_TOKEN_EXPIRY: process.env.JWT_EXPIRES_IN || '15m', // Erişim token'ının geçerlilik süresi.
  REFRESH_TOKEN_EXPIRY: process.env.JWT_REFRESH_EXPIRES_IN || '7d', // Yenileme token'ının geçerlilik süresi.
  ISSUER: 'medikariyer-api', // Token'ı kimin oluşturduğunu belirtir.
  AUDIENCE: 'medikariyer-client' // Token'ın kimin için oluşturulduğunu belirtir.
};

// 5. Bcrypt (Şifreleme) Yapılandırması
// Kullanıcı şifrelerini güvenli bir şekilde hash'lemek için kullanılır.
const BCRYPT_CONFIG = {
  // 'ROUNDS' değeri, hash'leme işleminin ne kadar karmaşık (ve yavaş) olacağını belirler.
  // Değer ne kadar yüksek olursa, brute-force saldırılarına karşı o kadar güvenli olur.
  // 12, güncel donanımlar için iyi bir denge noktasıdır.
  ROUNDS: parseInt(process.env.BCRYPT_ROUNDS) || 12
};

// Tüm güvenlik yapılandırmalarını dışa aktar.
module.exports = {
  CORS_OPTIONS,
  SECURITY_HEADERS,
  JWT_CONFIG,
  BCRYPT_CONFIG
};
