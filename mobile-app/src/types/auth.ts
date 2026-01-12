/**
 * @file auth.ts
 * @description Kimlik doğrulama (authentication) tip tanımlamaları
 * 
 * Bu dosya authentication işlemleri için kullanılan tüm TypeScript tip tanımlamalarını içerir.
 * 
 * Ana Tipler:
 * - AuthStatus: Kimlik doğrulama durumu ('idle' | 'authenticated' | 'unauthenticated')
 * - AuthUser: Kullanıcı bilgileri (id, email, first_name, last_name, role, vb.)
 * - AuthResponsePayload: Login/register sonrası dönen veri yapısı
 * - LoginPayload: Login isteği için gerekli veriler
 * - DoctorRegistrationPayload: Doktor kayıt isteği için gerekli veriler
 * - AuthState: Zustand store'da tutulan authentication state yapısı
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import type { DoctorProfile } from './profile';

/**
 * Kimlik doğrulama durumu
 * - idle: Başlangıç durumu (henüz kontrol edilmedi)
 * - authenticated: Kullanıcı giriş yapmış
 * - unauthenticated: Kullanıcı giriş yapmamış
 */
export type AuthStatus = 'idle' | 'authenticated' | 'unauthenticated';

/**
 * Kullanıcı bilgileri
 * Backend'den dönen user objesi
 */
export interface AuthUser {
  /** Kullanıcı ID'si */
  id: number;
  /** E-posta adresi */
  email: string;
  /** Ad */
  first_name?: string;
  /** Soyad */
  last_name?: string;
  /** Kullanıcı rolü (doctor, admin, vb.) */
  role?: string;
  /** Hesap onay durumu (admin tarafından onaylanmış mı?) */
  is_approved?: boolean | number | string;
  /** Hesap aktif mi? (devre dışı bırakılmış mı?) */
  is_active?: boolean | number;
  /** Onboarding görüldü mü? (tanıtım ekranları tamamlandı mı?) */
  is_onboarding_seen?: boolean | number | string;
  /** Telefon numarası */
  phone?: string;
  /** Unvan (Dr., Prof. Dr., vb.) */
  title?: string;
  /** Uzmanlık alanı adı */
  specialty_name?: string;
  /** İkamet şehri adı */
  residence_city_name?: string;
  /** Profil tamamlanma yüzdesi */
  completion_percent?: number;
}

/**
 * Login/Register sonrası backend'den dönen response payload
 */
export interface AuthResponsePayload {
  /** Kullanıcı bilgileri */
  user: AuthUser;
  /** Access token (JWT) */
  accessToken: string;
  /** Refresh token */
  refreshToken: string;
  /** Doktor profil bilgileri (opsiyonel) */
  profile?: DoctorProfile | null;
}

/**
 * Login isteği için gerekli veriler
 */
export interface LoginPayload {
  /** E-posta adresi */
  email: string;
  /** Şifre */
  password: string;
}

/**
 * Doktor kayıt isteği için gerekli veriler
 */
export interface DoctorRegistrationPayload {
  /** E-posta adresi */
  email: string;
  /** Şifre */
  password: string;
  /** Şifre tekrarı */
  password_confirmation: string;
  /** Ad */
  first_name: string;
  /** Soyad */
  last_name: string;
  /** Telefon numarası */
  phone: string;
  /** Unvan (opsiyonel) */
  title?: string;
  /** Uzmanlık alanı ID'si (opsiyonel) */
  specialty_id?: number;
  /** Yan dal ID'si (opsiyonel) */
  subspecialty_id?: number;
  /** İkamet şehri ID'si (opsiyonel) */
  residence_city_id?: number;
  /** Profil fotoğrafı (Base64 string, opsiyonel) */
  profile_photo?: string;
}

/**
 * Doktor kayıt sonrası backend'den dönen response
 */
export interface DoctorRegistrationResponse {
  /** Başarı mesajı */
  message: string;
  /** Oluşturulan kullanıcı bilgileri */
  user: AuthUser;
}

/**
 * Zustand store'da tutulan authentication state yapısı
 */
export interface AuthState {
  /** Mevcut kullanıcı bilgileri (null ise giriş yapılmamış) */
  user: AuthUser | null;
  /** Access token (JWT) */
  accessToken: string | null;
  /** Refresh token */
  refreshToken: string | null;
  /** Kimlik doğrulama durumu */
  authStatus: AuthStatus;
  /** AsyncStorage'dan veri yüklenirken true */
  isHydrating: boolean;
}

