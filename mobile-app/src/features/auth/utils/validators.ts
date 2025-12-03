import { z } from 'zod';

/**
 * Email validation schema
 */
export const emailSchema = z.string().email('Geçerli bir e-posta girin');

/**
 * Password validation schema
 */
export const passwordSchema = z
  .string()
  .min(6, 'Şifre en az 6 karakter olmalı');

/**
 * Name validation schema
 */
export const nameSchema = z.string().min(2, 'En az 2 karakter olmalı');

/**
 * Login form validation schema
 */
export const loginValidationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

/**
 * Registration form validation schema
 */
export const registrationValidationSchema = z
  .object({
    first_name: nameSchema,
    last_name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: passwordSchema,
    title: z.enum(['Dr', 'Uz.Dr', 'Dr.Öğr.Üyesi', 'Doç.Dr', 'Prof.Dr']),
    region: z.enum([
      'ist_avrupa',
      'ist_anadolu',
      'ankara',
      'izmir',
      'diger',
      'yurtdisi',
    ]),
    specialty_id: z.string().min(1, 'Lütfen branş seçin'),
    subspecialty_id: z.string().optional(),
    profile_photo: z.string().min(1, 'Profil fotoğrafı yüklemelisiniz'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Şifreler eşleşmiyor',
    path: ['confirmPassword'],
  });

/**
 * Validates email format
 */
export const isValidEmail = (email: string): boolean => {
  return emailSchema.safeParse(email).success;
};

/**
 * Validates password strength
 */
export const isValidPassword = (password: string): boolean => {
  return passwordSchema.safeParse(password).success;
};

/**
 * Validates name format
 */
export const isValidName = (name: string): boolean => {
  return nameSchema.safeParse(name).success;
};
