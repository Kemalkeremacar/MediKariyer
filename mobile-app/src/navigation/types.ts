/**
 * @file types.ts
 * @description Navigation tip tanımları - tüm navigator'lar için merkezi tip tanımları
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 * 
 * **ÖNEMLİ:** Ekran isimlendirme kuralları:
 * - Normal ekranlar: Açıklayıcı isimler kullanın (örn: ProfileMain, Education)
 * - Form ekranları: Geriye dönük uyumluluk için *FormModal isimli, ancak bunlar
 *   aslında slide_from_bottom animasyonlu navigation ekranlarıdır, gerçek modal DEĞİL.
 *   Root-level BottomSheetModalProvider'ı Select bileşenleri için kullanırlar.
 */

import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

// ============================================================================
// ROOT STACK - En üst seviye navigator
// ============================================================================

/**
 * Root Stack - Kimlik doğrulamalı ve doğrulanmamış akışlar arasında yönlendirme
 */
export type RootStackParamList = {
  /** Kimlik doğrulama akışı (Login, Register) */
  Auth: undefined;
  /** Ana uygulama akışı (Tab Navigator) */
  App: undefined;
  /** Hesap devre dışı ekranı */
  AccountDisabled: undefined;
};

// ============================================================================
// AUTH STACK - Kimlik doğrulama akışı
// ============================================================================

/**
 * Auth Stack - Giriş ve kayıt ekranları
 */
export type AuthStackParamList = {
  /** Giriş ekranı */
  Login: undefined;
  /** Kayıt ekranı */
  Register: undefined;
  /** Onay bekliyor ekranı */
  PendingApproval: undefined;
  /** Onboarding tanıtım ekranları */
  Onboarding: undefined;
  /** Şifremi unuttum ekranı */
  ForgotPassword: undefined;
  /** Şifre sıfırlama ekranı */
  ResetPassword: { token: string } | undefined;
};

// ============================================================================
// JOBS STACK - İş ilanları akışı
// ============================================================================

/**
 * Jobs Stack - İş ilanları gezinme ve detayları
 * Jobs tab içinde nested
 */
export type JobsStackParamList = {
  /** İş ilanları listesi */
  JobsList: undefined;
  /** İş ilanı detay sayfası */
  JobDetail: { id: number };
};

// ============================================================================
// PROFILE STACK - Profil yönetimi akışı
// ============================================================================

/**
 * Profile Stack - Profil yönetimi ekranları
 * Profile tab içinde nested
 * 
 * **NOT:** *FormModal ekranları navigation ekranlarıdır (gerçek modal DEĞİL).
 * slide_from_bottom animasyonu kullanırlar ve root-level
 * BottomSheetModalProvider'a güvenirler (Select bileşenleri için).
 */
export type ProfileStackParamList = {
  /** Ana profil/dashboard ekranı */
  ProfileMain: undefined;
  /** Profil düzenleme ekranı */
  ProfileEdit: undefined;
  /** Fotoğraf yönetimi ekranı */
  PhotoManagement: undefined;
  /** Eğitim bilgileri listesi */
  Education: undefined;
  /** Deneyim bilgileri listesi */
  Experience: undefined;
  /** Sertifika listesi */
  Certificates: undefined;
  /** Dil bilgileri listesi */
  Languages: undefined;
  /** Bildirimler ekranı */
  Notifications: undefined;
  
  // Form Ekranları - Geriye dönük uyumluluk için *FormModal isimli
  // Bunlar slide_from_bottom animasyonlu navigation ekranlarıdır
  /** Eğitim ekleme/düzenleme formu */
  EducationFormModal: { education?: any } | undefined;
  /** Deneyim ekleme/düzenleme formu */
  ExperienceFormModal: { experience?: any } | undefined;
  /** Dil ekleme/düzenleme formu */
  LanguageFormModal: { language?: any } | undefined;
  /** Sertifika ekleme/düzenleme formu */
  CertificateFormModal: { certificate?: any } | undefined;
};

// ============================================================================
// APPLICATIONS STACK - Başvurular akışı
// ============================================================================

/**
 * Applications Stack - Başvurular listesi ve detay
 * ApplicationsTab içinde nested
 */
export type ApplicationsStackParamList = {
  /** Başvurular listesi */
  ApplicationsList: undefined;
  /** Başvuru detay sayfası */
  ApplicationDetail: { applicationId: number };
};

// ============================================================================
// SETTINGS STACK - Ayarlar akışı
// ============================================================================

/**
 * Settings Stack - Hesap ayarları
 * Settings tab içinde nested
 */
export type SettingsStackParamList = {
  /** Ana ayarlar ekranı */
  SettingsMain: undefined;
  /** Şifre değiştirme ekranı */
  ChangePassword: undefined;
  /** Bildirim ayarları ekranı */
  NotificationSettings: undefined;
  /** Hesap silme ekranı */
  DeleteAccount: undefined;
  /** Yardım merkezi ekranı */
  HelpCenter: undefined;
  /** Gizlilik politikası ekranı */
  PrivacyPolicy: undefined;
  /** Kullanım koşulları ekranı */
  TermsOfService: undefined;
};

// ============================================================================
// APP TAB - Ana kimlik doğrulamalı gezinme
// ============================================================================

/**
 * App Tab - Ana uygulama özellikleri için bottom tab navigator
 */
export type AppTabParamList = {
  /** Profil tab'ı (Anasayfa) */
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
  /** İş ilanları tab'ı */
  JobsTab: NavigatorScreenParams<JobsStackParamList>;
  /** Başvurular tab'ı */
  ApplicationsTab: NavigatorScreenParams<ApplicationsStackParamList>;
  /** Ayarlar tab'ı */
  SettingsTab: NavigatorScreenParams<SettingsStackParamList>;
};

// ============================================================================
// COMBINED NAVIGATION - Programatik gezinme için
// ============================================================================

/**
 * Tüm navigator'lar için birleştirilmiş navigation param listesi
 * Tüm olası route'ları içerir
 */
export type RootNavigationParamList = RootStackParamList &
  AuthStackParamList &
  AppTabParamList &
  JobsStackParamList &
  ProfileStackParamList &
  SettingsStackParamList;

// ============================================================================
// NAVIGATION PROP TYPES - Tip güvenli gezinme için
// ============================================================================

/** Root Stack navigation prop tipi */
export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;

/** Auth Stack navigation prop tipi */
export type AuthStackNavigationProp = NativeStackNavigationProp<AuthStackParamList>;

/** App Tab navigation prop tipi */
export type AppTabNavigationProp = BottomTabNavigationProp<AppTabParamList>;

/** Jobs Stack navigation prop tipi */
export type JobsStackNavigationProp = NativeStackNavigationProp<JobsStackParamList>;

/** Profile Stack navigation prop tipi */
export type ProfileStackNavigationProp = NativeStackNavigationProp<ProfileStackParamList>;

/** Settings Stack navigation prop tipi */
export type SettingsStackNavigationProp = NativeStackNavigationProp<SettingsStackParamList>;
