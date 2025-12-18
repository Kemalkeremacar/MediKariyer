/**
 * Application Constants
 * Centralized constant values used throughout the app
 */

// API Configuration
export const REQUEST_TIMEOUT_MS = 30000; // 30 seconds
export const MAX_RETRY_ATTEMPTS = 2;

// Cache Configuration
export const CACHE_STALE_TIME = 5 * 60 * 1000; // 5 minutes
export const CACHE_TIME = 10 * 60 * 1000; // 10 minutes

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// File Upload
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword'];

// Validation
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;
export const MIN_NAME_LENGTH = 2;
export const MAX_NAME_LENGTH = 50;

// UI
export const TOAST_DURATION = 3000; // 3 seconds
export const DEBOUNCE_DELAY = 300; // 300ms
export const SEARCH_DEBOUNCE_DELAY = 500; // 500ms - search için daha uzun
export const ANIMATION_DURATION = 200; // 200ms

// TD-008: Pagination constants
export const PAGINATION = {
  JOBS_PAGE_SIZE: 10,
  APPLICATIONS_PAGE_SIZE: 10,
  NOTIFICATIONS_PAGE_SIZE: 20,
} as const;

// Cache durations (milliseconds)
export const CACHE_DURATIONS = {
  JOBS: 5 * 60 * 1000, // 5 minutes
  PROFILE: 10 * 60 * 1000, // 10 minutes
  NOTIFICATIONS: 2 * 60 * 1000, // 2 minutes
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  THEME_MODE: 'theme_mode',
  LANGUAGE: 'language',
  ONBOARDING_COMPLETED: 'onboarding_completed',
} as const;

// Application Status
export const APPROVAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  DISABLED: 'disabled',
} as const;

// User Roles
export const USER_ROLES = {
  DOCTOR: 'doctor',
  HOSPITAL: 'hospital',
  ADMIN: 'admin',
} as const;

// Application Status
export const APPLICATION_STATUS = {
  PENDING: 'pending',
  REVIEWED: 'reviewed',
  SHORTLISTED: 'shortlisted',
  REJECTED: 'rejected',
  ACCEPTED: 'accepted',
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  APPLICATION_STATUS: 'application_status',
  NEW_JOB: 'new_job',
  MESSAGE: 'message',
  SYSTEM: 'system',
} as const;
