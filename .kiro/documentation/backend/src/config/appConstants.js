/**
 * @file appConstants.js
 * @description Dokümantasyon sistemi uygulama sabitleri
 */

'use strict';

/**
 * Genel listeleme ayarları (sayfalama)
 */
const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
};

/**
 * Kullanıcı rolleri (Ana sistemle uyumlu)
 */
const USER_ROLES = {
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  HOSPITAL: 'hospital'
};

/**
 * Dokümantasyon tipleri
 */
const DOCUMENTATION_TYPES = {
  ARCHITECTURE: 'architecture',
  API: 'api',
  FLOW: 'flow',
  COMPONENT: 'component',
  ROLE: 'role',
  STANDARD: 'standard'
};

/**
 * Değişiklik tipleri
 */
const CHANGE_TYPES = {
  UI: 'ui',
  API: 'api',
  DATABASE: 'database',
  BUSINESS_LOGIC: 'business-logic',
  CONFIGURATION: 'configuration'
};

/**
 * Risk seviyeleri
 */
const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * Bileşen tipleri
 */
const COMPONENT_TYPES = {
  BACKEND: 'backend',
  FRONTEND: 'frontend',
  MOBILE: 'mobile',
  SHARED: 'shared'
};

/**
 * Bağımlılık tipleri
 */
const DEPENDENCY_TYPES = {
  HARD: 'hard',
  SOFT: 'soft',
  OPTIONAL: 'optional'
};

module.exports = {
  PAGINATION,
  USER_ROLES,
  DOCUMENTATION_TYPES,
  CHANGE_TYPES,
  RISK_LEVELS,
  COMPONENT_TYPES,
  DEPENDENCY_TYPES
};