/**
 * @file validators.ts
 * @description Validasyon utility fonksiyonları ve Zod şemaları
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 * 
 * **Özellikler:**
 * - Input validasyon fonksiyonları
 * - Zod validation şemaları
 * - Form validasyon şemaları
 */

import { z } from 'zod';
import {
  MIN_PASSWORD_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_NAME_LENGTH,
  MAX_NAME_LENGTH,
} from '@/config/constants';

// ============================================================================
// EMAIL VALIDATION
// ============================================================================

/**
 * Spam domain listesi (geçici e-posta servisleri)
 */
const SPAM_DOMAINS = ['tempmail.com', '10minutemail.com', 'guerrillamail.com'];

/**
 * E-posta formatını doğrula
 * 
 * @param email - Doğrulanacak e-posta
 * @returns E-posta geçerli mi?
 */
export const isValidEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * E-posta spam domain kontrolü
 * 
 * @param email - Kontrol edilecek e-posta
 * @returns Spam domain mi?
 */
export const isSpamDomain = (email: string): boolean => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const domain = email.toLowerCase().split('@')[1];
  return SPAM_DOMAINS.includes(domain);
};

/**
 * E-posta validasyonu (tam kontrol)
 * 
 * @param email - Doğrulanacak e-posta
 * @returns Validasyon sonucu ve mesaj
 * 
 * **Kontroller:**
 * - Format kontrolü
 * - Ardışık nokta kontrolü
 * - Başlangıç/bitiş nokta kontrolü
 * - Spam domain kontrolü
 */
export const validateEmail = (
  email: string
): { isValid: boolean; message?: string } => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, message: 'E-posta adresi gereklidir' };
  }

  const trimmedEmail = email.trim().toLowerCase();

  // Format kontrolü
  if (!isValidEmail(trimmedEmail)) {
    return { isValid: false, message: 'Geçerli bir e-posta adresi giriniz' };
  }

  // Ardışık nokta kontrolü
  if (trimmedEmail.includes('..')) {
    return { isValid: false, message: 'E-posta adresi ardışık nokta içeremez' };
  }

  // Başlangıç/bitiş nokta kontrolü
  const localPart = trimmedEmail.split('@')[0];
  if (localPart.startsWith('.') || localPart.endsWith('.')) {
    return { isValid: false, message: 'E-posta adresi nokta ile başlayamaz veya bitemez' };
  }

  // Spam domain kontrolü
  if (isSpamDomain(trimmedEmail)) {
    return { isValid: false, message: 'Geçici e-posta servisleri kullanılamaz' };
  }

  return { isValid: true };
};

// ============================================================================
// PASSWORD VALIDATION
// ============================================================================

/**
 * Şifre gücünü doğrula
 * 
 * @param password - Doğrulanacak şifre
 * @returns Validasyon sonucu ve mesaj
 * 
 * **Gereksinimler:**
 * - Minimum uzunluk: MIN_PASSWORD_LENGTH (6)
 * - Maksimum uzunluk: MAX_PASSWORD_LENGTH (128)
 * - En az bir büyük harf
 * - En az bir küçük harf
 * - En az bir rakam
 * - En az bir özel karakter (@$!%*?&)
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

  // En az bir büyük harf kontrolü
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: 'Şifre en az bir büyük harf içermelidir',
    };
  }

  // En az bir küçük harf kontrolü
  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: 'Şifre en az bir küçük harf içermelidir',
    };
  }

  // En az bir rakam kontrolü
  if (!/\d/.test(password)) {
    return {
      isValid: false,
      message: 'Şifre en az bir rakam içermelidir',
    };
  }

  // En az bir özel karakter kontrolü
  if (!/[@$!%*?&]/.test(password)) {
    return {
      isValid: false,
      message: 'Şifre en az bir özel karakter içermelidir (@$!%*?&)',
    };
  }

  return { isValid: true };
};

// ============================================================================
// NAME VALIDATION
// ============================================================================

/**
 * İsim doğrula (ad veya soyad)
 * 
 * @param name - Doğrulanacak isim
 * @returns Validasyon sonucu ve mesaj
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

  // Geçerli karakterler kontrolü (harfler, boşluklar, Türkçe karakterler)
  const nameRegex = /^[a-zA-ZğüşıöçĞÜŞİÖÇ\s]+$/;
  if (!nameRegex.test(trimmedName)) {
    return {
      isValid: false,
      message: 'İsim sadece harf içermelidir',
    };
  }

  return { isValid: true };
};

// ============================================================================
// PHONE VALIDATION
// ============================================================================

/**
 * Telefon numarası doğrula (Türk cep telefonu formatı)
 * 
 * @param phone - Doğrulanacak telefon numarası
 * @returns Telefon geçerli mi?
 * 
 * **Desteklenen Formatlar:**
 * - +905XXXXXXXXX
 * - 05XXXXXXXXX
 * - 5XXXXXXXXX
 * 
 * **Not:** Sadece cep telefonu numaraları kabul edilir (5 ile başlayan)
 */
export const isValidPhone = (phone: string): boolean => {
  if (!phone || typeof phone !== 'string') {
    return false;
  }

  // Boşluk, tire ve parantezleri kaldır
  const cleanPhone = phone.replace(/[\s\-()]/g, '');

  // Türk cep telefonu formatı: +905XXXXXXXXX veya 05XXXXXXXXX veya 5XXXXXXXXX
  // Backend ile uyumlu: sadece 5 ile başlayan cep numaraları
  const phoneRegex = /^(\+90|0)?[5][0-9]{9}$/;
  return phoneRegex.test(cleanPhone);
};

// ============================================================================
// REQUIRED FIELD VALIDATION
// ============================================================================

/**
 * Zorunlu alan doğrula
 * 
 * @param value - Doğrulanacak değer
 * @returns Değer boş değil mi?
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

// ============================================================================
// URL VALIDATION
// ============================================================================

/**
 * URL formatını doğrula
 * 
 * @param url - Doğrulanacak URL
 * @returns URL geçerli mi?
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

// ============================================================================
// NUMBER RANGE VALIDATION
// ============================================================================

/**
 * Sayı aralığı doğrula
 * 
 * @param value - Doğrulanacak sayı
 * @param min - Minimum değer
 * @param max - Maksimum değer
 * @returns Sayı aralıkta mı?
 */
export const isInRange = (value: number, min: number, max: number): boolean => {
  if (typeof value !== 'number' || isNaN(value)) {
    return false;
  }

  return value >= min && value <= max;
};

// ============================================================================
// FILE VALIDATION
// ============================================================================

/**
 * Dosya boyutu doğrula
 * 
 * @param sizeInBytes - Dosya boyutu (byte)
 * @param maxSizeInBytes - Maksimum izin verilen boyut (byte)
 * @returns Dosya boyutu limit içinde mi?
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
 * Dosya tipi doğrula
 * 
 * @param fileType - Dosya MIME tipi
 * @param allowedTypes - İzin verilen MIME tipleri
 * @returns Dosya tipi izinli mi?
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

// ============================================================================
// TURKISH ID VALIDATION
// ============================================================================

/**
 * TC Kimlik No doğrula
 * 
 * @param idNumber - Doğrulanacak TC Kimlik No
 * @returns TC Kimlik No geçerli mi?
 * 
 * **Kurallar:**
 * - 11 haneli olmalı
 * - İlk hane 0 olamaz
 * - 10. hane kontrol hanesi
 * - 11. hane kontrol hanesi
 */
export const isValidTurkishId = (idNumber: string): boolean => {
  if (!idNumber || typeof idNumber !== 'string') {
    return false;
  }

  // Boşlukları kaldır
  const cleanId = idNumber.replace(/\s/g, '');

  // 11 haneli olmalı
  if (!/^\d{11}$/.test(cleanId)) {
    return false;
  }

  // İlk hane 0 olamaz
  if (cleanId[0] === '0') {
    return false;
  }

  // Checksum hesapla
  const digits = cleanId.split('').map(Number);
  
  // 10. hane kontrolü
  const sum1 = (digits[0] + digits[2] + digits[4] + digits[6] + digits[8]) * 7;
  const sum2 = digits[1] + digits[3] + digits[5] + digits[7];
  const digit10 = (sum1 - sum2) % 10;
  
  if (digit10 !== digits[9]) {
    return false;
  }

  // 11. hane kontrolü
  const sum3 = digits.slice(0, 10).reduce((acc, digit) => acc + digit, 0);
  const digit11 = sum3 % 10;
  
  return digit11 === digits[10];
};

// ============================================================================
// STRING LENGTH VALIDATION
// ============================================================================

/**
 * Minimum uzunluk doğrula
 * 
 * @param value - Doğrulanacak string
 * @param minLength - Minimum uzunluk
 * @returns String minimum uzunluğu karşılıyor mu?
 */
export const hasMinLength = (value: string, minLength: number): boolean => {
  if (!value || typeof value !== 'string') {
    return false;
  }

  return value.trim().length >= minLength;
};

/**
 * Maksimum uzunluk doğrula
 * 
 * @param value - Doğrulanacak string
 * @param maxLength - Maksimum uzunluk
 * @returns String maksimum uzunluk içinde mi?
 */
export const hasMaxLength = (value: string, maxLength: number): boolean => {
  if (!value || typeof value !== 'string') {
    return true; // Boş string maksimum uzunluk için geçerli
  }

  return value.trim().length <= maxLength;
};

// ============================================================================
// STRING SANITIZATION
// ============================================================================

/**
 * String input'u temizle (özel karakterleri kaldır)
 * 
 * @param value - Temizlenecek string
 * @returns Temizlenmiş string
 */
export const sanitizeString = (value: string): string => {
  if (!value || typeof value !== 'string') {
    return '';
  }

  // HTML tag'lerini ve özel karakterleri kaldır
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/[<>'"]/g, '')
    .trim();
};

// ============================================================================
// ZOD VALIDATION SCHEMAS
// ============================================================================

/**
 * E-posta validasyon şeması (Zod)
 * Backend ile uyumlu: spam domain kontrolü dahil
 */
export const emailSchema = z
  .string()
  .email('Geçerli bir e-posta girin')
  .max(255, 'E-posta adresi en fazla 255 karakter olabilir')
  .transform((val) => val.toLowerCase().trim())
  .refine((val) => !val.includes('..'), 'E-posta adresi ardışık nokta içeremez')
  .refine((val) => {
    const localPart = val.split('@')[0];
    return !localPart.startsWith('.') && !localPart.endsWith('.');
  }, 'E-posta adresi nokta ile başlayamaz veya bitemez')
  .refine((val) => {
    const spamDomains = ['tempmail.com', '10minutemail.com', 'guerrillamail.com'];
    const domain = val.split('@')[1];
    return !spamDomains.includes(domain);
  }, 'Geçici e-posta servisleri kullanılamaz');

/**
 * Şifre validasyon şeması (Zod)
 * Backend ile uyumlu: min 6, max 128, büyük/küçük harf, rakam, özel karakter
 */
export const passwordSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH, `Şifre en az ${MIN_PASSWORD_LENGTH} karakter olmalı`)
  .max(MAX_PASSWORD_LENGTH, `Şifre en fazla ${MAX_PASSWORD_LENGTH} karakter olabilir`)
  .refine((val) => /[A-Z]/.test(val), 'Şifre en az bir büyük harf içermelidir')
  .refine((val) => /[a-z]/.test(val), 'Şifre en az bir küçük harf içermelidir')
  .refine((val) => /\d/.test(val), 'Şifre en az bir rakam içermelidir')
  .refine((val) => /[@$!%*?&]/.test(val), 'Şifre en az bir özel karakter içermelidir (@$!%*?&)');

/**
 * İsim validasyon şeması (Zod)
 */
export const nameSchema = z
  .string()
  .min(MIN_NAME_LENGTH, `En az ${MIN_NAME_LENGTH} karakter olmalı`)
  .max(MAX_NAME_LENGTH, `En fazla ${MAX_NAME_LENGTH} karakter olabilir`);

/**
 * Login form validasyon şeması (Zod)
 */
export const loginValidationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

/**
 * Kayıt form validasyon şeması (Zod)
 */
export const registrationValidationSchema = z
  .object({
    first_name: nameSchema,
    last_name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
    title: z.enum(['Dr.', 'Uz. Dr.', 'Dr. Öğr. Üyesi', 'Doç. Dr.', 'Prof. Dr.'], {
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
 * Şifre değiştirme validasyon şeması (Zod)
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
