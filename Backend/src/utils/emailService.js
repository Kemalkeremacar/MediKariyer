'use strict';

/**
 * @file emailService.js
 * @description SMTP üzerinden e-posta gönderimi için yardımcı servis.
 * 
 * Özellikler:
 * - HTML template desteği (base + content templates)
 * - Retry mekanizması (3 deneme, exponential backoff)
 * - Simülasyon modu (SMTP yoksa)
 * - Şifre sıfırlama, hoşgeldin emaili desteği
 * 
 * @author MediKariyer Development Team
 * @version 2.0.0
 */

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

// ============================================================================
// CONFIGURATION
// ============================================================================

const EMAIL_CONFIG = {
  // Retry ayarları
  maxRetries: 3,
  retryDelayMs: 1000, // İlk retry için bekleme (ms)
  retryMultiplier: 2, // Her retry'da çarpan (exponential backoff)
  
  // Template dizini
  templateDir: path.join(__dirname, '../templates/email'),
  
  // Varsayılan değerler
  defaults: {
    websiteUrl: process.env.APP_WEB_URL || process.env.FRONTEND_URL || 'https://medikariyer.com',
    year: new Date().getFullYear()
  }
};

// ============================================================================
// TRANSPORTER
// ============================================================================

let transporter = null;

const createTransporter = () => {
  if (transporter) {
    return transporter;
  }

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  
  // Port 465 = implicit TLS (secure: true)
  // Port 587 = STARTTLS (secure: false)
  const secure = port === 465;

  if (!host || !port) {
    logger.warn('SMTP bilgileri tanımlanmadı. E-posta gönderimi simüle edilecek.');
    transporter = null;
    return transporter;
  }

  if (!user || !pass) {
    logger.error('SMTP authentication bilgileri eksik!');
    transporter = null;
    return transporter;
  }

  const config = {
    host,
    port,
    secure, // Port 587 için false olacak
    auth: { user, pass },
    
    // Port 587 için STARTTLS zorunlu
    requireTLS: port === 587,
    
    // TLS ayarları
    tls: {
      // Sertifika kontrolü bypass (çoğu durumda gerekli)
      // Sebep: Mail sunucusu genellikle self-signed veya eksik zincirli sertifika kullanır
      // SMTP zaten username/password ile korunuyor, güvenlik riski minimal
      rejectUnauthorized: false,
      
      // Sertifika hostname kontrolü
      servername: host,
      
      // Minimum TLS versiyonu
      minVersion: 'TLSv1.2'
    },
    
    // Connection timeout ayarları
    connectionTimeout: 10000, // 10 saniye
    greetingTimeout: 5000,    // 5 saniye
    socketTimeout: 15000,     // 15 saniye
    
    // Pool yerine her seferinde yeni connection (daha güvenilir)
    pool: false,
    
    // Debug modu (development'ta)
    debug: process.env.NODE_ENV === 'development',
    logger: process.env.NODE_ENV === 'development'
  };

  logger.info('SMTP transporter oluşturuluyor', {
    host,
    port,
    secure,
    requireTLS: config.requireTLS,
    user,
    env: process.env.NODE_ENV
  });

  transporter = nodemailer.createTransport(config);

  // Connection test (opsiyonel ama önerilen)
  // SMTP bağlantı hatası durumunda retry mekanizması ile test et
  const testConnection = async (retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        await new Promise((resolve, reject) => {
          transporter.verify((error, success) => {
            if (error) {
              reject(error);
            } else {
              resolve(success);
            }
          });
        });
        
        logger.info('SMTP sunucuya bağlantı başarılı');
        return true;
      } catch (error) {
        logger.warn(`SMTP connection test başarısız (${i + 1}/${retries})`, { 
          error: error.message,
          attempt: i + 1
        });
        
        if (i === retries - 1) {
          logger.error('SMTP bağlantısı kurulamadı, simüle moda geçiliyor');
          // Son denemede başarısız olursa transporter'ı null yap
          transporter = null;
          return false;
        } else {
          // Exponential backoff ile bekle
          await new Promise(resolve => setTimeout(resolve, 2000 * Math.pow(2, i)));
        }
      }
    }
    return false;
  };

  // Async olarak connection test et (blocking olmayan)
  setImmediate(() => {
    testConnection().catch(error => {
      logger.error('SMTP connection test failed completely:', error);
    });
  });

  return transporter;
};

// ============================================================================
// TEMPLATE ENGINE (Basit Handlebars-benzeri)
// ============================================================================

/**
 * Template cache (performans için)
 */
const templateCache = new Map();

/**
 * Template dosyasını okur (cache'li)
 */
const loadTemplate = (templateName) => {
  if (templateCache.has(templateName)) {
    return templateCache.get(templateName);
  }

  const templatePath = path.join(EMAIL_CONFIG.templateDir, `${templateName}.html`);
  
  if (!fs.existsSync(templatePath)) {
    logger.warn(`Email template bulunamadı: ${templateName}`);
    return null;
  }

  const template = fs.readFileSync(templatePath, 'utf8');
  templateCache.set(templateName, template);
  return template;
};

/**
 * Basit template engine - {{variable}} ve {{#if}}...{{/if}} destekler
 */
const renderTemplate = (template, data) => {
  if (!template) return '';

  let result = template;

  // {{#if condition}}...{{/if}} blokları
  result = result.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, condition, content) => {
    return data[condition] ? content : '';
  });

  // {{#unless condition}}...{{/unless}} blokları
  result = result.replace(/\{\{#unless\s+(\w+)\}\}([\s\S]*?)\{\{\/unless\}\}/g, (match, condition, content) => {
    return !data[condition] ? content : '';
  });

  // {{variable}} değişkenleri
  result = result.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] !== undefined ? data[key] : '';
  });

  return result;
};

/**
 * Base template ile content template'i birleştirir
 */
const buildEmailHtml = (contentTemplate, data) => {
  try {
    const baseTemplate = loadTemplate('base');
    const contentHtml = renderTemplate(loadTemplate(contentTemplate), data);

    if (!baseTemplate) {
      // Base template yoksa sadece content döndür
      return contentHtml || '';
    }

    const fullData = {
      ...EMAIL_CONFIG.defaults,
      ...data,
      content: contentHtml
    };

    return renderTemplate(baseTemplate, fullData);
  } catch (error) {
    logger.error('Email template rendering failed', { 
      contentTemplate, 
      error: error.message 
    });
    // Template hatası durumunda basit bir HTML döndür
    return `<html><body><p>${data.subject || 'Email'}</p></body></html>`;
  }
};

// ============================================================================
// RETRY MECHANISM
// ============================================================================

/**
 * Belirli süre bekler
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Hatanın retry edilebilir olup olmadığını kontrol eder
 */
const isRetryableError = (error) => {
  const retryableCodes = [
    'ETIMEDOUT',    // Connection timeout
    'ECONNRESET',   // Connection reset
    'ENOTFOUND',    // DNS geçici hatası
    'ECONNREFUSED', // Sunucu geçici kapalı
    'ESOCKET',      // Socket hatası
    'ETIMEOUT'      // Timeout
  ];
  
  const nonRetryableCodes = [
    'EAUTH',        // Authentication hatası - retry gereksiz
    'EENVELOPE',    // Email format hatası
    'EMESSAGE'      // Message format hatası
  ];
  
  // Kesinlikle retry yapılmaması gereken hatalar
  if (nonRetryableCodes.includes(error.code)) {
    return false;
  }
  
  // Retry edilebilir hatalar
  if (retryableCodes.includes(error.code)) {
    return true;
  }
  
  // 4xx hatalar (geçici) retry edilebilir, 5xx (kalıcı) edilemez
  if (error.responseCode) {
    return error.responseCode >= 400 && error.responseCode < 500;
  }
  
  // Bilinmeyen hatalar için retry yap
  return true;
};

/**
 * Retry ile email gönderir
 */
const sendMailWithRetry = async ({ to, subject, text, html }) => {
  const mailTransporter = createTransporter();
  const from = process.env.EMAIL_FROM || 'no-reply@medikariyer.com';

  // Simülasyon modu
  if (!mailTransporter) {
    logger.info('E-posta gönderimi simüle edildi', { to, subject });
    return { simulated: true, success: true };
  }

  let lastError = null;
  
  for (let attempt = 1; attempt <= EMAIL_CONFIG.maxRetries; attempt++) {
    try {
      const info = await mailTransporter.sendMail({ from, to, subject, text, html });
      
      if (attempt > 1) {
        logger.info(`E-posta gönderildi (${attempt}. denemede)`, { 
          to, 
          subject,
          messageId: info.messageId,
          response: info.response
        });
      } else {
        logger.info('E-posta gönderildi', {
          to,
          subject,
          messageId: info.messageId
        });
      }
      
      return { simulated: false, success: true, attempts: attempt, messageId: info.messageId };
    } catch (error) {
      lastError = error;
      
      // Hata detaylarını logla
      logger.error('E-posta gönderim hatası', {
        to,
        subject,
        attempt,
        errorCode: error.code,
        errorMessage: error.message,
        responseCode: error.responseCode,
        command: error.command
      });
      
      // Retry edilebilir mi kontrol et
      if (!isRetryableError(error)) {
        logger.error('Hata retry edilemez, vazgeçiliyor', {
          errorCode: error.code,
          errorMessage: error.message
        });
        throw error;
      }
      
      if (attempt < EMAIL_CONFIG.maxRetries) {
        const delay = EMAIL_CONFIG.retryDelayMs * Math.pow(EMAIL_CONFIG.retryMultiplier, attempt - 1);
        logger.warn(`E-posta gönderimi başarısız (${attempt}/${EMAIL_CONFIG.maxRetries}), ${delay}ms sonra tekrar denenecek`, {
          to,
          subject,
          error: error.message,
          errorCode: error.code
        });
        await sleep(delay);
      }
    }
  }

  // Tüm denemeler başarısız
  logger.error(`E-posta gönderilemedi (${EMAIL_CONFIG.maxRetries} deneme sonrası)`, {
    to,
    subject,
    errorCode: lastError?.code,
    errorMessage: lastError?.message,
    responseCode: lastError?.responseCode
  });
  
  throw lastError;
};

// ============================================================================
// LINK BUILDERS
// ============================================================================

const buildResetLink = (token) => {
  const defaultBase =
    process.env.FRONTEND_RESET_PASSWORD_URL ||
    `${EMAIL_CONFIG.defaults.websiteUrl}/reset-password`;

  if (defaultBase.includes('{token}')) {
    return defaultBase.replace('{token}', token);
  }

  const separator = defaultBase.includes('?') ? '&' : '?';
  return `${defaultBase}${separator}token=${token}`;
};

const buildMobileResetLink = (token) => {
  return `medikariyer://reset-password?token=${token}`;
};

// ============================================================================
// EMAIL FUNCTIONS
// ============================================================================

/**
 * Şifre sıfırlama e-postası gönderir
 * @param {Object} options
 * @param {string} options.to - Alıcı email
 * @param {string} options.token - Sıfırlama token'ı
 * @param {string} [options.name] - Kullanıcı adı (opsiyonel)
 * @param {Date} [options.expiresAt] - Token son kullanma tarihi
 * @param {string} [options.source='web'] - Kaynak (web/mobile)
 */
const sendPasswordResetEmail = async ({ to, token, name, expiresAt, source = 'web' }) => {
  const resetLink = source === 'mobile' 
    ? buildMobileResetLink(token) 
    : buildResetLink(token);
  
  const expiresInMinutes = Number(process.env.PASSWORD_RESET_EXPIRY_MINUTES || 60);
  const isMobile = source === 'mobile';

  const subject = 'MediKariyer | Şifre Sıfırlama Talebi';
  
  // Plain text versiyonu
  const text = [
    `Merhaba${name ? ' ' + name : ''},`,
    '',
    'Şifrenizi sıfırlamak için aşağıdaki bağlantıyı kullanabilirsiniz:',
    resetLink,
    '',
    `Bu bağlantı ${expiresInMinutes} dakika boyunca geçerlidir.`,
    '',
    'Eğer bu talebi siz oluşturmadıysanız lütfen bu e-postayı dikkate almayın.',
    '',
    'MediKariyer Destek Ekibi'
  ].join('\n');

  // HTML versiyonu (template ile)
  const html = buildEmailHtml('passwordReset', {
    name,
    resetLink,
    expiresInMinutes,
    isMobile,
    subject
  });

  try {
    const result = await sendMailWithRetry({ to, subject, text, html });
    logger.info('Şifre sıfırlama e-postası gönderildi', {
      to,
      simulated: result.simulated,
      attempts: result.attempts,
      expiresAt: expiresAt?.toISOString?.()
    });
    return result;
  } catch (error) {
    logger.error('Şifre sıfırlama e-postası gönderilemedi', { to, error: error.message });
    throw error;
  }
};

/**
 * Hoşgeldin e-postası gönderir
 * @param {Object} options
 * @param {string} options.to - Alıcı email
 * @param {string} options.name - Kullanıcı adı
 * @param {string} options.userType - Kullanıcı tipi (doctor/hospital)
 */
const sendWelcomeEmail = async ({ to, name, userType }) => {
  const subject = 'MediKariyer\'e Hoş Geldiniz! 🎉';
  const isDoctor = userType === 'doctor';
  const isHospital = userType === 'hospital';
  
  const loginUrl = `${EMAIL_CONFIG.defaults.websiteUrl}/login`;

  // Plain text versiyonu
  const text = [
    `Merhaba ${name},`,
    '',
    'MediKariyer ailesine katıldığınız için teşekkür ederiz!',
    '',
    isDoctor ? 'Doktor hesabınız onaylandı. Artık iş ilanlarına başvurabilirsiniz.' : '',
    isHospital ? 'Hastane hesabınız onaylandı. Artık iş ilanları yayınlayabilirsiniz.' : '',
    '',
    `Hesabınıza giriş yapmak için: ${loginUrl}`,
    '',
    'Saygılarımızla,',
    'MediKariyer Ekibi'
  ].filter(Boolean).join('\n');

  // HTML versiyonu (template ile)
  const templateData = {
    name,
    isDoctor: isDoctor ? 'true' : '', // String olarak gönder
    isHospital: isHospital ? 'true' : '', // String olarak gönder
    loginUrl,
    subject
  };

  const html = buildEmailHtml('welcome', templateData);

  try {
    const result = await sendMailWithRetry({ to, subject, text, html });
    logger.info('Hoşgeldin e-postası gönderildi', {
      to,
      userType,
      isDoctor,
      isHospital,
      simulated: result.simulated,
      attempts: result.attempts
    });
    return result;
  } catch (error) {
    // Hoşgeldin emaili kritik değil, hata fırlatma
    logger.error('Hoşgeldin e-postası gönderilemedi (kritik değil)', { 
      to, 
      userType,
      isDoctor,
      isHospital,
      error: error.message 
    });
    return { success: false, error: error.message };
  }
};

/**
 * Genel amaçlı e-posta gönderir
 * @param {Object} options
 * @param {string} options.to - Alıcı email
 * @param {string} options.subject - Konu
 * @param {string} options.text - Plain text içerik
 * @param {string} [options.html] - HTML içerik (opsiyonel)
 * @param {string} [options.template] - Template adı (opsiyonel)
 * @param {Object} [options.data] - Template verileri (opsiyonel)
 */
const sendEmail = async ({ to, subject, text, html, template, data }) => {
  // Template varsa HTML oluştur
  const finalHtml = template 
    ? buildEmailHtml(template, { ...data, subject })
    : html;

  try {
    const result = await sendMailWithRetry({ to, subject, text, html: finalHtml });
    logger.info('E-posta gönderildi', {
      to,
      subject,
      simulated: result.simulated,
      attempts: result.attempts
    });
    return result;
  } catch (error) {
    logger.error('E-posta gönderilemedi', { to, subject, error: error.message });
    throw error;
  }
};

/**
 * Template cache'ini temizler (development için)
 */
const clearTemplateCache = () => {
  templateCache.clear();
  logger.info('Email template cache temizlendi');
};

// ============================================================================
// MODULE EXPORTS
// ============================================================================

module.exports = {
  sendPasswordResetEmail,
  sendWelcomeEmail,
  sendEmail,
  clearTemplateCache
};
