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
      'http://localhost:8081', // Expo web (metro port)
      'http://127.0.0.1:8081',
      'http://127.0.0.1:5000',
      'http://127.0.0.1:3000',
      'http://192.168.1.198:5000', // Network IP - Frontend (eski)
      'http://192.168.1.198:3100',  // Network IP - Backend (eski)
      'http://192.168.1.198:8081',
      'http://192.168.1.134:5000', // Network IP - Frontend (güncel Wi-Fi IP)
      'http://192.168.1.134:3100',  // Network IP - Backend (güncel Wi-Fi IP)
      'http://192.168.1.134:8081',
      'https://mk.monassist.com', // Production Frontend Domain
      'https://medikariyer.net', // Production Frontend Domain (yeni)
      'https://www.medikariyer.net' // Production Frontend Domain (www ile)
    ];
    
    // Kaynağı olmayan isteklere (mobil uygulamalar, Postman gibi araçlar) izin ver.
    // Mobile app'ler origin header'ı göndermez, bu yüzden her zaman izin ver.
    if (!origin) {
      return callback(null, true);
    }
    
    // VPN IP range kontrolü (10.8.0.0/24) - OpenVPN için
    // VPN IP'lerinden gelen isteklere otomatik izin ver
    const vpnIpPattern = /^https?:\/\/10\.8\.0\.\d{1,3}(:\d+)?$/;
    if (vpnIpPattern.test(origin)) {
      return callback(null, true);
    }
    
    // Local network IP range kontrolü (192.168.1.0/24) - Wi-Fi network için
    // Local network IP'lerinden gelen isteklere otomatik izin ver
    const localNetworkPattern = /^https?:\/\/192\.168\.1\.\d{1,3}(:\d+)?$/;
    if (localNetworkPattern.test(origin)) {
      return callback(null, true);
    }
    
    // Gelen isteğin kaynağı izin verilenler listesinde varsa, isteğe izin ver.
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Regex pattern kontrolü (array içindeki regex'ler için)
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });
    
    if (isAllowed) {
      return callback(null, true);
    }
    
    // Listede yoksa, CORS hatası fırlat.
    // Production'da logger kullan (console.error yerine)
    if (process.env.NODE_ENV === 'production') {
      // Logger import edilmediği için sadece callback ile hata döndür
      // CORS hataları zaten HTTP loglarında görünür
    }
    callback(new Error('Bu kaynağa CORS politikası tarafından izin verilmiyor.'));
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
  exposedHeaders: ['X-Total-Count', 'X-Total-Pages'], // Frontend'in erişebileceği özel başlıklar (örn: sayfalama bilgisi).
  preflightContinue: false, // Preflight request'leri otomatik handle et
  optionsSuccessStatus: 204 // Eski tarayıcılar için OPTIONS response status
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
