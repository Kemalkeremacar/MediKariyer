'use strict';

/**
 * @file emailService.js
 * @description SMTP üzerinden e-posta gönderimi için yardımcı servis.
 * Şifre sıfırlama gibi transactional e-postaları gönderir.
 */

const nodemailer = require('nodemailer');
const logger = require('./logger');

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
  // TLS sertifika doğrulamasını atla (self-signed veya uyumsuz sertifikalar için)
  const ignoreTLS = process.env.SMTP_IGNORE_TLS !== undefined 
    ? process.env.SMTP_IGNORE_TLS === 'true'
    : true; // Varsayılan olarak true (güvenli olmayan ama çalışır)

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
      // Sertifika doğrulamasını atla (uyumsuz sertifikalar için gerekli)
      rejectUnauthorized: !ignoreTLS,
      // Server name indication için hostname kullan
      servername: host
    }
  });

  return transporter;
};

const buildResetLink = (token) => {
  const defaultBase =
    process.env.FRONTEND_RESET_PASSWORD_URL ||
    `${(process.env.APP_WEB_URL || process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '')}/reset-password`;

  if (defaultBase.includes('{token}')) {
    return defaultBase.replace('{token}', token);
  }

  const separator = defaultBase.includes('?') ? '&' : '?';
  return `${defaultBase}${separator}token=${token}`;
};

const sendMail = async ({ to, subject, text, html }) => {
  const mailTransporter = createTransporter();
  const from = process.env.EMAIL_FROM || 'no-reply@medikariyer.com';

  if (!mailTransporter) {
    logger.info('E-posta gönderimi simüle edildi', { to, subject });
    return { simulated: true };
  }

  await mailTransporter.sendMail({
    from,
    to,
    subject,
    text,
    html
  });

  return { simulated: false };
};

const sendPasswordResetEmail = async ({ to, token, expiresAt }) => {
  const resetLink = buildResetLink(token);
  const expiresInMinutes = Number(process.env.PASSWORD_RESET_EXPIRY_MINUTES || 60);

  const subject = 'MediKariyer | Şifre Sıfırlama Talebi';
  const text = [
    'Merhaba,',
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

  const html = `
    <p>Merhaba,</p>
    <p>Şifrenizi sıfırlamak için aşağıdaki butona tıklayabilirsiniz:</p>
    <p style="margin: 24px 0;">
      <a
        href="${resetLink}"
        target="_blank"
        rel="noopener noreferrer"
        style="
          display: inline-block;
          padding: 12px 28px;
          background-color: #2563eb;
          color: #ffffff;
          text-decoration: none;
          border-radius: 10px;
          font-weight: 600;
          font-family: Arial, sans-serif;
          letter-spacing: 0.5px;
        "
      >
        Şifreyi Sıfırla
      </a>
    </p>
    <p>Bu buton <strong>${expiresInMinutes} dakika</strong> boyunca geçerlidir.</p>
    <p>Eğer bu talebi siz oluşturmadıysanız lütfen bu e-postayı dikkate almayın.</p>
    <p>MediKariyer Destek Ekibi</p>
  `;

  try {
    const result = await sendMail({ to, subject, text, html });
    logger.info('Şifre sıfırlama e-postası gönderildi', {
      to,
      simulated: result.simulated,
      expiresAt: expiresAt?.toISOString?.()
    });
  } catch (error) {
    logger.error('Şifre sıfırlama e-postası gönderilemedi', { to, error: error.message });
    throw error;
  }
};

module.exports = {
  sendPasswordResetEmail
};

