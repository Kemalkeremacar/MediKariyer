'use strict';

/**
 * Genel listeleme ayarları (sayfalama)
 */
const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
};

/**
 * Auth validation kuralları (authSchemas.js için)
 */
const VALIDATION = {
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 128,
  PHONE_REGEX: /^(\+90|0)?[5][0-9]{9}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50
};

/**
 * Kullanıcı rolleri (roleGuard.js için)
 */
const USER_ROLES = {
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  HOSPITAL: 'hospital'
};
module.exports = {
  PAGINATION,
  VALIDATION,
  USER_ROLES
};