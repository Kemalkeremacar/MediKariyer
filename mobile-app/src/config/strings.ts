/**
 * @file strings.ts
 * @description Merkezi String Sabitleri
 * 
 * TD-011: i18n hazırlığı - Tüm hardcoded stringler buraya taşınabilir
 * 
 * Bu dosya gelecekte i18n (react-i18next) entegrasyonu için hazırlık niteliğindedir.
 * Şimdilik en çok kullanılan stringler burada tutulur.
 * 
 * Kullanım:
 * ```typescript
 * import { STRINGS } from '@/config/strings';
 * 
 * <Text>{STRINGS.common.loading}</Text>
 * <Button title={STRINGS.auth.login} />
 * ```
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

export const STRINGS = {
  // Genel
  common: {
    loading: 'Yükleniyor...',
    retry: 'Tekrar Dene',
    cancel: 'İptal',
    save: 'Kaydet',
    delete: 'Sil',
    edit: 'Düzenle',
    add: 'Ekle',
    confirm: 'Onayla',
    search: 'Ara',
    filter: 'Filtrele',
    clear: 'Temizle',
    close: 'Kapat',
    back: 'Geri',
    next: 'İleri',
    done: 'Tamam',
    yes: 'Evet',
    no: 'Hayır',
  },

  // Hata Mesajları
  errors: {
    generic: 'Bir hata oluştu. Lütfen tekrar deneyin.',
    network: 'İnternet bağlantınızı kontrol edin.',
    timeout: 'İstek zaman aşımına uğradı.',
    notFound: 'Aradığınız içerik bulunamadı.',
    unauthorized: 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.',
    forbidden: 'Bu işlem için yetkiniz yok.',
    validation: 'Lütfen tüm alanları doğru doldurun.',
  },

  // Başarı Mesajları
  success: {
    saved: 'Başarıyla kaydedildi.',
    deleted: 'Başarıyla silindi.',
    updated: 'Başarıyla güncellendi.',
    sent: 'Başarıyla gönderildi.',
  },

  // Kimlik Doğrulama
  auth: {
    login: 'Giriş Yap',
    logout: 'Çıkış Yap',
    register: 'Kayıt Ol',
    forgotPassword: 'Şifremi Unuttum',
    email: 'E-posta',
    password: 'Şifre',
    confirmPassword: 'Şifre Tekrar',
  },

  // İş İlanları
  jobs: {
    title: 'İş İlanları',
    detail: 'İlan Detayı',
    apply: 'Başvur',
    applied: 'Başvuruldu',
    noJobs: 'Henüz ilan bulunamadı.',
    searchPlaceholder: 'İlan ara...',
  },

  // Başvurular
  applications: {
    title: 'Başvurularım',
    status: {
      pending: 'Beklemede',
      reviewing: 'İnceleniyor',
      approved: 'Kabul Edildi',
      rejected: 'Reddedildi',
      withdrawn: 'Geri Çekildi',
    },
    noApplications: 'Henüz başvuru yapmadınız.',
    withdraw: 'Başvuruyu Geri Çek',
  },

  // Profil
  profile: {
    title: 'Profilim',
    completion: 'Profil Tamamlama',
    education: 'Eğitim Bilgileri',
    experience: 'Deneyim',
    certificates: 'Sertifikalar',
    languages: 'Dil Bilgisi',
    photo: 'Profil Fotoğrafı',
  },

  // Ayarlar
  settings: {
    title: 'Ayarlar',
    changePassword: 'Şifre Değiştir',
    notifications: 'Bildirimler',
    theme: 'Tema',
    language: 'Dil',
    about: 'Hakkında',
    privacy: 'Gizlilik Politikası',
    terms: 'Kullanım Koşulları',
  },

  // Boş Durumlar
  empty: {
    noData: 'Gösterilecek veri yok.',
    noResults: 'Sonuç bulunamadı.',
    noNotifications: 'Bildiriminiz yok.',
  },
} as const;

// Autocomplete için tip export'u
export type StringKeys = typeof STRINGS;
