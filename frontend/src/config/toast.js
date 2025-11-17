/**
 * @file toast.js
 * @description Toast Mesaj Şablonları - Merkezi mesaj yönetimi
 * 
 * Custom toast sistemi kullanılıyor (Sonner yerine)
 * Tüm toast mesajları burada merkezi olarak yönetilir
 * 
 * @author MediKariyer Development Team
 * @version 4.0.0 (Custom Toast System)
 * @since 2024
 */

// ============================================================================
// TOAST MESAJ ŞABLONLARI - Merkezi mesaj yönetimi
// ============================================================================

/**
 * Toast mesaj şablonları
 * 
 * Her kategori için success, error, warning, info mesajları
 * Merkezi bir yerden yönetilir, tutarlılık sağlar
 */
export const toastMessages = {
  // PROFİL MESAJLARI
  profile: {
    updateSuccess: 'Profil başarıyla güncellendi',
    updateError: 'Profil güncellenemedi',
    personalInfoUpdateSuccess: 'Kişisel bilgiler güncellendi',
    personalInfoUpdateError: 'Kişisel bilgiler güncellenemedi',
    completionUpdateSuccess: 'Profil tamamlanma oranı güncellendi',
    completionUpdateError: 'Profil tamamlanma oranı güncellenemedi',
  },

  // İŞ İLANI MESAJLARI
  job: {
    createSuccess: 'İş ilanı başarıyla oluşturuldu',
    createError: 'İş ilanı oluşturulamadı',
    updateSuccess: 'İş ilanı başarıyla güncellendi',
    updateError: 'İş ilanı güncellenemedi',
    deleteSuccess: 'İş ilanı başarıyla silindi',
    deleteError: 'İş ilanı silinemedi',
    statusUpdateSuccess: 'İş ilanı durumu başarıyla güncellendi',
    statusUpdateError: 'İş ilanı durumu güncellenemedi',
    resubmitSuccess: 'İş ilanı başarıyla tekrar gönderildi',
    resubmitError: 'İş ilanı tekrar gönderilemedi',
    approveSuccess: 'İş ilanı onaylandı',
    approveError: 'İş ilanı onaylanırken bir hata oluştu',
    rejectSuccess: 'İş ilanı reddedildi',
    rejectError: 'İş ilanı reddedilirken bir hata oluştu',
    revisionRequestSuccess: 'Revizyon talebi gönderildi',
    revisionRequestError: 'Revizyon talebi gönderilirken bir hata oluştu',
    revisionNoteRequired: 'Revizyon notu zorunludur',
    revisionNoteMinLength: 'Revizyon notu en az 10 karakter olmalıdır',
    revisionNoteMaxLength: 'Revizyon notu en fazla 1000 karakter olabilir',
    rejectReasonRequired: 'Red sebebi gereklidir',
    rejectReasonMinLength: 'Red sebebi en az 5 karakter olmalıdır',
    rejectReasonMaxLength: 'Red sebebi en fazla 500 karakter olabilir',
    activateSuccess: 'İlan aktif edildi',
    deactivateSuccess: 'İlan pasif hale getirildi',
    statusUpdateSuccessGeneric: 'Durum başarıyla güncellendi',
  },

  // BAŞVURU MESAJLARI
  application: {
    createSuccess: 'Başvurunuz başarıyla gönderildi!',
    createError: 'Başvuru yapılırken bir hata oluştu. Lütfen tekrar deneyin.',
    createErrorGeneric: 'Başvuru gönderilemedi',
    alreadyExists: 'Bu ilana zaten aktif bir başvurunuz bulunuyor. Başvurularım sayfasına yönlendiriliyorsunuz; mevcut başvurunuzu kontrol edip gerekirse geri çekebilirsiniz.',
    updateStatusSuccess: 'Başvuru durumu güncellendi',
    updateStatusError: 'Başvuru durumu güncellenemedi',
    updateNoteSuccess: 'Not güncellendi',
    updateNoteError: 'Not güncellenemedi',
    withdrawSuccess: 'Başvuru geri çekildi',
    withdrawError: 'Başvuru geri çekilemedi',
    deleteSuccess: 'Başvuru kalıcı olarak silindi',
    deleteError: 'Başvuru silinemedi',
  },

  // EĞİTİM MESAJLARI
  education: {
    createSuccess: 'Eğitim eklendi',
    createError: 'Eğitim eklenemedi',
    updateSuccess: 'Eğitim güncellendi',
    updateError: 'Eğitim güncellenemedi',
    deleteSuccess: 'Eğitim silindi',
    deleteError: 'Eğitim silinemedi',
  },

  // DENEYİM MESAJLARI
  experience: {
    createSuccess: 'Deneyim eklendi',
    createError: 'Deneyim eklenemedi',
    updateSuccess: 'Deneyim güncellendi',
    updateError: 'Deneyim güncellenemedi',
    deleteSuccess: 'Deneyim silindi',
    deleteError: 'Deneyim silinemedi',
  },

  // SERTİFİKA MESAJLARI
  certificate: {
    createSuccess: 'Sertifika eklendi',
    createError: 'Sertifika eklenemedi',
    updateSuccess: 'Sertifika güncellendi',
    updateError: 'Sertifika güncellenemedi',
    deleteSuccess: 'Sertifika silindi',
    deleteError: 'Sertifika silinemedi',
  },

  // DİL MESAJLARI
  language: {
    createSuccess: 'Dil eklendi',
    createError: 'Dil eklenemedi',
    updateSuccess: 'Dil güncellendi',
    updateError: 'Dil güncellenemedi',
    deleteSuccess: 'Dil silindi',
    deleteError: 'Dil silinemedi',
  },

  // DEPARTMAN MESAJLARI
  department: {
    createSuccess: 'Departman başarıyla eklendi',
    createError: 'Departman eklenemedi',
    updateSuccess: 'Departman başarıyla güncellendi',
    updateError: 'Departman güncellenemedi',
    deleteSuccess: 'Departman başarıyla silindi',
    deleteError: 'Departman silinemedi',
  },

  // İLETİŞİM MESAJLARI
  contact: {
    createSuccess: 'İletişim bilgisi başarıyla eklendi',
    createError: 'İletişim bilgisi eklenemedi',
    updateSuccess: 'İletişim bilgisi başarıyla güncellendi',
    updateError: 'İletişim bilgisi güncellenemedi',
    deleteSuccess: 'İletişim bilgisi başarıyla silindi',
    deleteError: 'İletişim bilgisi silinemedi',
  },

  // KULLANICI MESAJLARI
  user: {
    approveSuccess: 'Kullanıcı onaylandı',
    approveRemoved: 'Kullanıcı onayı kaldırıldı',
    approveError: 'Onay durumu güncellenirken hata oluştu',
    activateSuccess: 'Kullanıcı aktifleştirildi',
    deactivateSuccess: 'Kullanıcı pasifleştirildi',
    statusUpdateError: 'Durum güncellenirken hata oluştu',
  },

  // FOTOĞRAF MESAJLARI
  photo: {
    uploadSuccess: 'Fotoğraf yüklendi! Admin onayı bekleniyor.',
    uploadError: 'Fotoğraf yükleme başarısız',
    cancelRequestSuccess: 'Fotoğraf talebi iptal edildi',
    cancelRequestError: 'Fotoğraf talebi iptal edilemedi',
    fileSizeError: 'Dosya boyutu 5MB\'dan küçük olmalıdır',
    fileFormatError: 'Sadece JPEG, PNG ve WebP formatları desteklenir',
  },

  // HESAP MESAJLARI
  account: {
    deactivateSuccess: 'Hesabınız silindi',
    deactivateError: 'Hesap kapatma işlemi sırasında bir hata oluştu',
  },

  // GENEL MESAJLAR
  general: {
    loading: 'İşlem devam ediyor, lütfen bekleyin...',
    success: 'İşlem başarılı',
    error: 'Bir hata oluştu',
    updateSuccess: 'Güncelleme başarılı',
    updateError: 'Güncelleme başarısız',
    deleteSuccess: 'Öğe silindi',
    deleteError: 'Silme başarısız',
    addSuccess: 'Ekleme başarılı',
    addError: 'Ekleme başarısız',
    operationSuccess: 'İşlem başarılı',
    operationError: 'İşlem başarısız',
    validationError: 'Lütfen tüm alanları doğru şekilde doldurun',
    networkError: 'Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.',
    unauthorizedError: 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.',
    forbiddenError: 'Bu işlem için yetkiniz bulunmuyor.',
    notFoundError: 'Aradığınız kayıt bulunamadı.',
    serverError: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.',
    noDataToExport: 'Export edilecek veri bulunamadı',
    exportSuccess: 'Veriler export edildi',
  },

  // VALİDASYON MESAJLARI
  validation: {
    required: 'Bu alan zorunludur',
    minLength: (min) => `En az ${min} karakter olmalıdır`,
    maxLength: (max) => `En fazla ${max} karakter olabilir`,
    email: 'Geçerli bir e-posta adresi giriniz',
    phone: 'Geçerli bir telefon numarası giriniz',
    url: 'Geçerli bir URL giriniz',
    number: 'Geçerli bir sayı giriniz',
    date: 'Geçerli bir tarih giriniz',
    fileSize: (maxMB) => `Dosya boyutu ${maxMB}MB'dan küçük olmalıdır`,
    fileFormat: (formats) => `Sadece ${formats} formatları desteklenir`,
    fileSizeError: 'Fotoğraf boyutu 5MB\'dan küçük olmalıdır',
    fileFormatError: 'Sadece resim dosyaları yüklenebilir',
  },

  // LOG MESAJLARI
  log: {
    exportSuccess: 'Loglar export edildi',
    exportNoData: 'Export edilecek log bulunamadı',
    clearSuccess: 'Log temizleme işlemi başlatıldı',
    loadError: 'Log detayı yüklenirken hata oluştu',
  },

  // MESAJ MESAJLARI (Contact Messages)
  message: {
    sendSuccess: 'Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.',
    sendError: 'Mesaj gönderilemedi. Lütfen tekrar deneyin.',
    updateStatusSuccess: 'Mesaj durumu güncellendi',
    updateStatusError: 'Mesaj durumu güncellenemedi',
    replySuccess: 'Yanıt başarıyla gönderildi',
    replyError: 'Yanıt gönderilemedi',
    deleteSuccess: 'Mesaj silindi',
    deleteError: 'Mesaj silinemedi',
    bulkUpdateError: 'Toplu durum güncelleme başarısız',
    bulkDeleteError: 'Toplu mesaj silme başarısız',
  },

  // BİLDİRİM MESAJLARI (Notifications)
  notification: {
    updateError: 'Bildirim güncellenirken hata oluştu',
    markAllReadSuccess: 'Tüm bildirimler okundu olarak işaretlendi',
    markAllReadError: 'Bildirimler işaretlenirken hata oluştu',
    markReadError: 'Bildirim okundu olarak işaretlenemedi',
    markAllReadErrorGeneric: 'Tüm bildirimler okundu olarak işaretlenemedi',
    deleteSuccess: 'Bildirim silindi',
    deleteError: 'Bildirim silinirken hata oluştu',
  },

  // FOTOĞRAF ONAY MESAJLARI
  photoApproval: {
    rejectReasonRequired: 'Red nedeni gereklidir',
  },

  // FOTOĞRAF YÖNETİMİ MESAJLARI
  photoManagement: {
    fileFormatError: 'Lütfen JPG veya PNG formatında bir dosya seçiniz.',
    fileSizeError: 'Dosya boyutu en fazla 10MB olabilir.',
    requestSuccess: 'Fotoğraf talebi gönderildi!',
    uploadError: 'Fotoğraf yüklenemedi.',
    cancelSuccess: 'Değişiklik talebiniz iptal edildi.',
    cancelError: 'İptal işlemi başarısız.',
  },
};

/**
 * Hata mesajı formatlama fonksiyonu
 * 
 * Backend'den gelen hata mesajlarını daha okunabilir hale getirir
 * 
 * @param {Error|string} error - Hata objesi veya mesaj
 * @param {string} defaultMessage - Varsayılan mesaj
 * @returns {string} Formatlanmış hata mesajı
 */
export const formatErrorMessage = (error, defaultMessage = 'Bir hata oluştu') => {
  if (typeof error === 'string') {
    return error;
  }

  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.message) {
    return error.message;
  }

  return defaultMessage;
};

/**
 * İşlem tipine göre mesaj oluşturma
 * 
 * @param {string} type - İşlem tipi (create, update, delete)
 * @param {string} entity - Varlık adı (job, application, profile, vb.)
 * @param {boolean} success - Başarılı mı?
 * @returns {string} Mesaj
 */
export const getOperationMessage = (type, entity, success = true) => {
  const actionMap = {
    create: success ? 'eklendi' : 'eklenemedi',
    update: success ? 'güncellendi' : 'güncellenemedi',
    delete: success ? 'silindi' : 'silinemedi',
    approve: success ? 'onaylandı' : 'onaylanamadı',
    reject: success ? 'reddedildi' : 'reddedilemedi',
  };

  const action = actionMap[type] || (success ? 'başarılı' : 'başarısız');
  const prefix = success ? 'Başarıyla' : '';

  return `${entity} ${prefix ? prefix + ' ' : ''}${action}`;
};
