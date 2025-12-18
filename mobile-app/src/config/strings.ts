/**
 * Centralized String Constants
 * TD-011: i18n hazırlığı - Tüm hardcoded stringler buraya taşınabilir
 * 
 * Bu dosya gelecekte i18n (react-i18next) entegrasyonu için hazırlık niteliğindedir.
 * Şimdilik en çok kullanılan stringler burada tutulur.
 */

export const STRINGS = {
  // Common
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

  // Error Messages
  errors: {
    generic: 'Bir hata oluştu. Lütfen tekrar deneyin.',
    network: 'İnternet bağlantınızı kontrol edin.',
    timeout: 'İstek zaman aşımına uğradı.',
    notFound: 'Aradığınız içerik bulunamadı.',
    unauthorized: 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.',
    forbidden: 'Bu işlem için yetkiniz yok.',
    validation: 'Lütfen tüm alanları doğru doldurun.',
  },

  // Success Messages
  success: {
    saved: 'Başarıyla kaydedildi.',
    deleted: 'Başarıyla silindi.',
    updated: 'Başarıyla güncellendi.',
    sent: 'Başarıyla gönderildi.',
  },

  // Auth
  auth: {
    login: 'Giriş Yap',
    logout: 'Çıkış Yap',
    register: 'Kayıt Ol',
    forgotPassword: 'Şifremi Unuttum',
    email: 'E-posta',
    password: 'Şifre',
    confirmPassword: 'Şifre Tekrar',
  },

  // Jobs
  jobs: {
    title: 'İş İlanları',
    detail: 'İlan Detayı',
    apply: 'Başvur',
    applied: 'Başvuruldu',
    noJobs: 'Henüz ilan bulunamadı.',
    searchPlaceholder: 'İlan ara...',
  },

  // Applications
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

  // Profile
  profile: {
    title: 'Profilim',
    completion: 'Profil Tamamlama',
    education: 'Eğitim Bilgileri',
    experience: 'Deneyim',
    certificates: 'Sertifikalar',
    languages: 'Dil Bilgisi',
    photo: 'Profil Fotoğrafı',
  },

  // Settings
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

  // Empty States
  empty: {
    noData: 'Gösterilecek veri yok.',
    noResults: 'Sonuç bulunamadı.',
    noNotifications: 'Bildiriminiz yok.',
  },
} as const;

// Type export for autocomplete
export type StringKeys = typeof STRINGS;
