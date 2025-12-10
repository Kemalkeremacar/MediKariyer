/**
 * Validation Utilities
 * Provides input validation functions and Zod schemas
 */

import { z } from 'zod';
import {
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_NAME_LENGTH,
  MAX_NAME_LENGTH,
} from '@/config/constants';

/**
 * Validate email format
 * @param email - Email to validate
 * @returns True if email is valid
 */
export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validate password strength
 * @param password - Password to validate
 * @returns Object with validation result and message
 */
export const validatePassword = (
  password: string
): { isValid: boolean; message?: string } => {
  if (!password || typeof password !== 'string') {
    return { isValid: false, message: 'Şifre gereklidir' };
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return {
      isValid: false,
      message: `Şifre en az ${MIN_PASSWORD_LENGTH} karakter olmalıdır`,
    };
  }

  if (password.length > MAX_PASSWORD_LENGTH) {
    return {
      isValid: false,
      message: `Şifre en fazla ${MAX_PASSWORD_LENGTH} karakter olmalıdır`,
    };
  }

  // Check for at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: 'Şifre en az bir büyük harf içermelidir',
    };
  }

  // Check for at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: 'Şifre en az bir küçük harf içermelidir',
    };
  }

  // Check for at least one number
  if (!/\d/.test(password)) {
    return {
      isValid: false,
      message: 'Şifre en az bir rakam içermelidir',
    };
  }

  return { isValid: true };
};

/**
 * Validate name (first name or last name)
 * @param name - Name to validate
 * @returns Object with validation result and message
 */
export const validateName = (
  name: string
): { isValid: boolean; message?: string } => {
  if (!name || typeof name !== 'string') {
    return { isValid: false, message: 'İsim gereklidir' };
  }

  const trimmedName = name.trim();

  if (trimmedName.length < MIN_NAME_LENGTH) {
    return {
      isValid: false,
      message: `İsim en az ${MIN_NAME_LENGTH} karakter olmalıdır`,
    };
  }

  if (trimmedName.length > MAX_NAME_LENGTH) {
    return {
      isValid: false,
      message: `İsim en fazla ${MAX_NAME_LENGTH} karakter olmalıdır`,
    };
  }

  // Check for valid characters (letters, spaces, Turkish characters)
  const nameRegex = /^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/;
  if (!nameRegex.test(trimmedName)) {
    return {
      isValid: false,
      message: 'İsim sadece harf içermelidir',
    };
  }

  return { isValid: true };
};

/**
 * Validate phone number (Turkish format)
 * @param phone - Phone number to validate
 * @returns True if phone is valid
 */
export const isValidPhone = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') {
    return false;
  }

  // Remove spaces, dashes, and parentheses
  const cleanPhone = phone.replace(/[\s\-()]/g, '');

  // Turkish phone number format: +90XXXXXXXXXX or 0XXXXXXXXXX
  const phoneRegex = /^(\+90|0)?[1-9]\d{9}$/;
  return phoneRegex.test(cleanPhone);
};

/**
 * Validate required field
 * @param value - Value to validate
 * @returns True if value is not empty
 */
export const isRequired = (value: any): boolean => {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return true;
};

/**
 * Validate URL format
 * @param url - URL to validate
 * @returns True if URL is valid
 */
export const isValidUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') {
    return false;
  }

  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate number range
 * @param value - Number to validate
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns True if number is within range
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  if (typeof value !== 'number' || isNaN(value)) {
    return false;
  }

  return value >= min && value <= max;
};

/**
 * Validate file size
 * @param sizeInBytes - File size in bytes
 * @param maxSizeInBytes - Maximum allowed size in bytes
 * @returns True if file size is within limit
 */
export const isValidFileSize = (
  sizeInBytes: number,
  maxSizeInBytes: number
): boolean => {
  if (typeof sizeInBytes !== 'number' || sizeInBytes < 0) {
    return false;
  }

  return sizeInBytes <= maxSizeInBytes;
};

/**
 * Validate file type
 * @param fileType - File MIME type
 * @param allowedTypes - Array of allowed MIME types
 * @returns True if file type is allowed
 */
export const isValidFileType = (
  fileType: string,
  allowedTypes: string[]
): boolean => {
  if (!fileType || typeof fileType !== 'string') {
    return false;
  }

  return allowedTypes.includes(fileType.toLowerCase());
};

/**
 * Validate Turkish ID number (TC Kimlik No)
 * @param idNumber - ID number to validate
 * @returns True if ID number is valid
 */
export const isValidTurkishId = (idNumber: string): boolean => {
  if (!idNumber || typeof idNumber !== 'string') {
    return false;
  }

  // Remove spaces
  const cleanId = idNumber.replace(/\s/g, '');

  // Must be 11 digits
  if (!/^\d{11}$/.test(cleanId)) {
    return false;
  }

  // First digit cannot be 0
  if (cleanId[0] === '0') {
    return false;
  }

  // Calculate checksum
  const digits = cleanId.split('').map(Number);
  
  // 10th digit check
  const sum1 = (digits[0] + digits[2] + digits[4] + digits[6] + digits[8]) * 7;
  const sum2 = digits[1] + digits[3] + digits[5] + digits[7];
  const digit10 = (sum1 - sum2) % 10;
  
  if (digit10 !== digits[9]) {
    return false;
  }

  // 11th digit check
  const sum3 = digits.slice(0, 10).reduce((acc, digit) => acc + digit, 0);
  const digit11 = sum3 % 10;
  
  return digit11 === digits[10];
};

/**
 * Validate minimum length
 * @param value - String to validate
 * @param minLength - Minimum length
 * @returns True if string meets minimum length
 */
export const hasMinLength = (value: string, minLength: number): boolean => {
  if (!value || typeof value !== 'string') {
    return false;
  }

  return value.trim().length >= minLength;
};

/**
 * Validate maximum length
 * @param value - String to validate
 * @param maxLength - Maximum length
 * @returns True if string is within maximum length
 */
export const hasMaxLength = (value: string, maxLength: number): boolean => {
  if (!value || typeof value !== 'string') {
    return true; // Empty string is valid for max length
  }

  return value.trim().length <= maxLength;
};

/**
 * Sanitize string input (remove special characters)
 * @param value - String to sanitize
 * @returns Sanitized string
 */
export const sanitizeString = (value: string): string => {
  if (!value || typeof value !== 'string') {
    return '';
  }

  // Remove HTML tags and special characters
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/[<>'"]/g, '')
    .trim();
};

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

/**
 * Email validation schema (Zod)
 */
export const emailSchema = z.string().email('Geçerli bir e-posta girin');

/**
 * Password validation schema (Zod)
 */
export const passwordSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH, `Şifre en az ${MIN_PASSWORD_LENGTH} karakter olmalı`)
  .max(MAX_PASSWORD_LENGTH, `Şifre en fazla ${MAX_PASSWORD_LENGTH} karakter olabilir`);

/**
 * Name validation schema (Zod)
 */
export const nameSchema = z
  .string()
  .min(MIN_NAME_LENGTH, `En az ${MIN_NAME_LENGTH} karakter olmalı`)
  .max(MAX_NAME_LENGTH, `En fazla ${MAX_NAME_LENGTH} karakter olabilir`);

/**
 * Login form validation schema (Zod)
 */
export const loginValidationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

/**
 * Registration form validation schema (Zod)
 */
export const registrationValidationSchema = z
  .object({
    first_name: nameSchema,
    last_name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
    title: z.enum(['Dr', 'Uz.Dr', 'Dr.Öğr.Üyesi', 'Doç.Dr', 'Prof.Dr'], {
      message: 'Lütfen ünvan seçin',
    }),
    specialty_id: z.string().min(1, 'Lütfen branş seçin'),
    subspecialty_id: z.string().optional(),
    profile_photo: z.string().min(1, 'Profil fotoğrafı yüklemelisiniz'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Şifreler eşleşmiyor',
    path: ['confirmPassword'],
  });

/**
 * Change password validation schema (Zod)
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Mevcut şifre gereklidir'),
    newPassword: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Şifreler eşleşmiyor',
    path: ['confirmPassword'],
  });
