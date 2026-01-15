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
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === 'true' || Number(port) === 465;
  const ignoreTLS = process.env.SMTP_IGNORE_TLS !== undefined 
    ? process.env.SMTP_IGNORE_TLS === 'true'
    : true;

  if (!host || !port) {
    logger.warn('SMTP bilgileri tanımlanmadı. E-posta gönderimi simüle edilecek.');
    transporter = null;
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host,
    port: Number(port),
    secure,
    auth: user && pass ? { user, pass } : undefined,
    tls: {
      rejectUnauthorized: !ignoreTLS,
      servername: host
    },
    // Connection pool for better performance
    pool: true,
    maxConnections: 5,
    maxMessages: 100
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
  const baseTemplate = loadTemplate('base');
  const contentHtml = renderTemplate(loadTemplate(contentTemplate), data);

  if (!baseTemplate) {
    // Base template yoksa sadece content döndür
    return contentHtml;
  }

  const fullData = {
    ...EMAIL_CONFIG.defaults,
    ...data,
    content: contentHtml
  };

  return renderTemplate(baseTemplate, fullData);
};

// ============================================================================
// RETRY MECHANISM
// ============================================================================

/**
 * Belirli süre bekler
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
      await mailTransporter.sendMail({ from, to, subject, text, html });
      
      if (attempt > 1) {
        logger.info(`E-posta gönderildi (${attempt}. denemede)`, { to, subject });
      }
      
      return { simulated: false, success: true, attempts: attempt };
    } catch (error) {
      lastError = error;
      
      if (attempt < EMAIL_CONFIG.maxRetries) {
        const delay = EMAIL_CONFIG.retryDelayMs * Math.pow(EMAIL_CONFIG.retryMultiplier, attempt - 1);
        logger.warn(`E-posta gönderimi başarısız (${attempt}/${EMAIL_CONFIG.maxRetries}), ${delay}ms sonra tekrar denenecek`, {
          to,
          subject,
          error: error.message
        });
        await sleep(delay);
      }
    }
  }

  // Tüm denemeler başarısız
  logger.error(`E-posta gönderilemedi (${EMAIL_CONFIG.maxRetries} deneme sonrası)`, {
    to,
    subject,
    error: lastError?.message
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
  const html = buildEmailHtml('welcome', {
    name,
    isDoctor,
    isHospital,
    loginUrl,
    subject
  });

  try {
    const result = await sendMailWithRetry({ to, subject, text, html });
    logger.info('Hoşgeldin e-postası gönderildi', {
      to,
      userType,
      simulated: result.simulated,
      attempts: result.attempts
    });
    return result;
  } catch (error) {
    // Hoşgeldin emaili kritik değil, hata fırlatma
    logger.error('Hoşgeldin e-postası gönderilemedi (kritik değil)', { 
      to, 
      userType,
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
