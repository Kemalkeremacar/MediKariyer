# 🔔 MEDİKARİYER BİLDİRİM SİSTEMİ - KAPSAMLI ANALİZ RAPORU

## 📋 İÇİNDEKİLER
1. [Sistem Genel Bakış](#sistem-genel-bakış)
2. [Bildirim Türleri ve Kategorileri](#bildirim-türleri-ve-kategorileri)
3. [Rol Bazlı Bildirim Senaryoları](#rol-bazlı-bildirim-senaryoları)
4. [Bildirim Tetikleyicileri (Detaylı)](#bildirim-tetikleyicileri-detaylı)
5. [Bildirim Görüntüleme ve Yönetimi](#bildirim-görüntüleme-ve-yönetimi)
6. [Mevcut Eksiklikler ve Sorunlar](#mevcut-eksiklikler-ve-sorunlar)
7. [Geliştirme Önerileri](#geliştirme-önerileri)

---

## 🏗️ SİSTEM GENEL BAKIŞ

### Mimari Yapı

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────┤
│  • NotificationsPage.jsx (Kullanıcı bildirim sayfası)      │
│  • AdminNotificationsPage.jsx (Admin bildirim sayfası)      │
│  • NavbarNotificationBell.jsx (Navbar bildirim zili)        │
│  • NotificationCard.jsx (Tek bildirim kartı)               │
│  • useNotifications.js (React Query hooks)                 │
└─────────────────────────────────────────────────────────────┘
                            ↕️ HTTP API
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js/Express)               │
├─────────────────────────────────────────────────────────────┤
│  Routes: notificationRoutes.js                               │
│    ↓                                                        │
│  Controllers: notificationController.js                     │
│    ↓                                                        │
│  Services: notificationService.js                            │
│    ↓                                                        │
│  Database: notifications table (SQL Server)                 │
└─────────────────────────────────────────────────────────────┘
```

### Database Schema

**notifications tablosu:**
```sql
- id (int, PK, Identity)
- user_id (int, FK → users.id)
- type (nvarchar(100)) - 'info', 'warning', 'success', 'error'
- title (nvarchar(255)) - Bildirim başlığı
- body (nvarchar(max)) - Bildirim içeriği
- data_json (nvarchar(max)) - JSON formatında ek veriler
- channel (nvarchar(100)) - 'inapp' (şu an sadece bu)
- read_at (datetime2) - Okunma tarihi (null = okunmamış)
- created_at (datetime2) - Oluşturulma tarihi
```

### Bildirim Kanalı
- **Şu an sadece:** `inapp` (in-app notification)
- **Eksik:** Email, Push notification, SMS

---

## 📊 BİLDİRİM TÜRLERİ VE KATEGORİLERİ

### Bildirim Type Değerleri
1. **`info`** - Bilgilendirme (mavi)
2. **`success`** - Başarı (yeşil)
3. **`warning`** - Uyarı (sarı/turuncu)
4. **`error`** - Hata (kırmızı)

### Bildirim Kategorileri (data_json içinde)
- **Application Status** - Başvuru durumu değişiklikleri
- **Job Status** - İş ilanı durumu değişiklikleri
- **System Announcement** - Sistem duyuruları
- **Contact Message** - İletişim mesajları
- **Photo Approval** - Fotoğraf onay/red işlemleri
- **User Approval** - Kullanıcı onay işlemleri

---

## 👥 ROL BAZLI BİLDİRİM SENARYOLARI

### 1. DOKTOR (doctor) - Bildirim Alır

#### 1.1 Başvuru Durumu Değişiklikleri
**Tetikleyici:** Hastane başvuru durumunu günceller
**Fonksiyon:** `hospitalService.updateApplicationStatus()`
**Bildirim Gönderen:** `notificationService.sendDoctorNotification()`

**Senaryolar:**
- ✅ **Başvuru Onaylandı** (`status_id = 2` - "Kabul Edildi")
  - Type: `success`
  - Title: "Başvurunuz Onaylandı"
  - Body: "{hospital_name} hastanesindeki {job_title} pozisyonu için başvurunuz onaylandı."
  - Data: `{ application_id, job_title, hospital_name, status: 'accepted' }`

- ⚠️ **Başvuru Reddedildi** (`status_id = 3` - "Reddedildi")
  - Type: `warning`
  - Title: "Başvurunuz Reddedildi"
  - Body: "{hospital_name} hastanesindeki {job_title} pozisyonu için başvurunuz reddedildi."
  - Data: `{ application_id, job_title, hospital_name, status: 'rejected' }`

- ℹ️ **Başvuru Beklemede** (`status_id = 1` - "Beklemede")
  - Type: `info`
  - Title: "Başvuru Durumu Güncellendi"
  - Body: "{hospital_name} hastanesindeki {job_title} pozisyonu için başvurunuz inceleme aşamasına alındı."
  - Data: `{ application_id, job_title, hospital_name, status: 'pending' }`

**Kod Konumu:**
```javascript
// Backend/src/services/hospitalService.js:1291
await notificationService.sendDoctorNotification(doctorUser.user_id, statusId, {
  application_id: applicationId,
  job_title: application.job_title,
  hospital_name: application.hospital || 'Hastane',
  notes: notes
});
```

#### 1.2 İş İlanı Durumu Değişiklikleri
**Tetikleyici:** Admin veya Hastane iş ilanı durumunu değiştirir
**Fonksiyon:** `hospitalService.sendJobStatusChangeNotification()` veya `adminService.sendJobStatusChangeNotification()`

**Senaryolar:**
- ⚠️ **İlan Pasif Edildi** (status: "Pasif")
  - Type: `warning`
  - Title: "İlan Durumu Değişti"
  - Body: "{hospital_name} hastanesindeki {job_title} pozisyonu için ilan durumu "{oldStatus}" → "{newStatus}" olarak değiştirildi."
  - Alıcı: Bu ilana başvuru yapan TÜM doktorlar (status_id != 5 - withdrawn değil)

- ✅ **İlan Aktif Edildi** (status: "Onaylandı")
  - Type: `info`
  - Title: "İlan Durumu Değişti"
  - Body: "{hospital_name} hastanesindeki {job_title} pozisyonu için ilan durumu "{oldStatus}" → "{newStatus}" olarak değiştirildi."

- ⚠️ **İlan Revizyon Gerektiriyor** (status: "Revizyon Gerekli")
  - Type: `warning`
  - Title: "İlan Durumu Değişti"
  - Body: "{hospital_name} hastanesindeki {job_title} pozisyonu için ilan durumu "{oldStatus}" → "{newStatus}" olarak değiştirildi."

- ❌ **İlan Reddedildi** (status: "Reddedildi")
  - Type: `error`
  - Title: "İlan Durumu Değişti"
  - Body: "{hospital_name} hastanesindeki {job_title} pozisyonu için ilan durumu "{oldStatus}" → "{newStatus}" olarak değiştirildi."

**Kod Konumu:**
```javascript
// Backend/src/services/hospitalService.js:644
// Backend/src/services/adminService.js:1513
```

#### 1.3 Profil Fotoğrafı Onay/Red
**Tetikleyici:** Admin doktor fotoğraf talebini onaylar/reddeder
**Fonksiyon:** `adminService.reviewPhotoRequest()`

**Senaryolar:**
- ✅ **Fotoğraf Onaylandı** (action: 'approve')
  - Type: `success`
  - Title: "Profil Fotoğrafı Onaylandı"
  - Body: "Profil fotoğrafınız admin tarafından onaylandı ve profilinizde güncellendi."
  - Data: `{ request_id, action: 'approve' }`

- ⚠️ **Fotoğraf Reddedildi** (action: 'reject')
  - Type: `warning`
  - Title: "Profil Fotoğrafı Reddedildi"
  - Body: "Profil fotoğrafınız reddedildi. {reason}"
  - Data: `{ request_id, action: 'reject' }`

**Kod Konumu:**
```javascript
// Backend/src/services/adminService.js:1775
```

#### 1.4 Profil Güncellemeleri (Opsiyonel)
**Tetikleyici:** Doktor profil bilgilerini günceller
**Fonksiyon:** `doctorService.updateProfile()` (eğitim, deneyim, sertifika ekleme/güncelleme)

**Senaryolar:**
- ✅ **Profil Güncellendi**
  - Type: `success`
  - Title: "Profil Güncellendi"
  - Body: "Profilinizde {update_description} işlemi başarıyla gerçekleştirildi."
  - Data: `{ update_type, update_description, timestamp }`

**Kod Konumu:**
```javascript
// Backend/src/services/doctorService.js:1130
```

**NOT:** Bu bildirim şu an sadece bazı profil güncellemelerinde gönderiliyor, tüm güncellemelerde değil.

---

### 2. HASTANE (hospital) - Bildirim Alır

#### 2.1 Yeni Başvuru Bildirimi
**Tetikleyici:** ❌ **EKSİK!** Doktor başvuru yaptığında hastaneye bildirim GÖNDERİLMİYOR!

**Mevcut Durum:**
- `doctorService.createApplication()` fonksiyonu başvuru oluşturuyor
- Ancak hastaneye bildirim gönderme kodu YOK
- **SORUN:** Hastane yeni başvurudan haberdar olamıyor

**Olması Gereken:**
```javascript
// Backend/src/services/doctorService.js:createApplication() içinde
// Başvuru oluşturulduktan sonra:
await notificationService.sendHospitalNotification(hospitalUserId, {
  application_id: applicationId,
  job_title: job.title,
  doctor_name: `${doctorProfile.first_name} ${doctorProfile.last_name}`
});
```

**Beklenen Bildirim:**
- Type: `info`
- Title: "Yeni Başvuru Aldınız"
- Body: "{job_title} pozisyonu için {doctor_name} doktorundan yeni bir başvuru aldınız."
- Data: `{ application_id, job_title, doctor_name }`

#### 2.2 Başvuru Geri Çekme Bildirimi
**Tetikleyici:** Doktor başvurusunu geri çeker
**Fonksiyon:** `doctorService.withdrawApplication()`

**Mevcut Durum:**
- ❌ **EKSİK!** `withdrawApplication()` fonksiyonunda bildirim gönderme kodu YOK

**Olması Gereken:**
```javascript
// Backend/src/services/doctorService.js:withdrawApplication() içinde
await notificationService.sendHospitalWithdrawalNotification(hospitalUserId, {
  application_id: applicationId,
  job_title: job.title,
  doctor_name: `${doctorProfile.first_name} ${doctorProfile.last_name}`,
  reason: reason || 'Belirtilmedi'
});
```

**Beklenen Bildirim:**
- Type: `warning`
- Title: "Başvuru Geri Çekildi"
- Body: "{doctor_name} doktoru {job_title} pozisyonu için başvurusunu geri çekti."
- Data: `{ application_id, job_title, doctor_name, reason }`

#### 2.3 İş İlanı Onay/Red/Revizyon Bildirimleri
**Tetikleyici:** Admin iş ilanını onaylar/reddeder/revizyon ister
**Fonksiyon:** `adminService.approveJob()`, `adminService.rejectJob()`, `adminService.requestRevision()`

**Senaryolar:**
- ✅ **İlan Onaylandı** (`approveJob()`)
  - Type: `success`
  - Title: "İlan Onaylandı"
  - Body: "{institution_name} hastanesindeki "{title}" ilanı onaylandı ve yayına alındı."
  - Data: `{ job_id, job_title, status: 'approved' }`

- ⚠️ **İlan Revizyon Gerektiriyor** (`requestRevision()`)
  - Type: `warning`
  - Title: "İlan Revizyon Gerektiriyor"
  - Body: "{institution_name} hastanesindeki "{title}" ilanı için revizyon talebi var."
  - Data: `{ job_id, job_title, revision_note, status: 'needs_revision' }`

- ❌ **İlan Reddedildi** (`rejectJob()`)
  - Type: `error`
  - Title: "İlan Reddedildi"
  - Body: "{institution_name} hastanesindeki "{title}" ilanı reddedildi. {rejectionReason}"
  - Data: `{ job_id, job_title, rejection_reason, status: 'rejected' }`

**Kod Konumu:**
```javascript
// Backend/src/services/adminService.js:1057, 1126, 1190
```

---

### 3. ADMIN (admin) - Bildirim Alır ve Gönderir

#### 3.1 Bildirim Alır

**3.1.1 Yeni İletişim Mesajı**
**Tetikleyici:** Kullanıcı iletişim formu gönderir
**Fonksiyon:** `contactService.createContactMessage()`

**Senaryo:**
- Type: `info`
- Title: "Yeni İletişim Mesajı"
- Body: "{name} ({email}) adlı kullanıcıdan yeni bir iletişim mesajı aldınız."
- Alıcı: Tüm admin kullanıcıları (`targetRole: 'admin'`)
- Data: `{ contact_message_id, sender_name, sender_email, subject }`

**Kod Konumu:**
```javascript
// Backend/src/services/contactService.js:87
```

**3.1.2 Sistem Bildirimleri**
- Admin manuel olarak sistem bildirimi gönderebilir
- Tüm kullanıcılara veya belirli role sahip kullanıcılara gönderebilir

#### 3.2 Bildirim Gönderir

**3.2.1 Manuel Bildirim Gönderme**
**Endpoint:** `POST /api/notifications/send`
**Fonksiyon:** `notificationController.sendNotification()`

**Parametreler:**
- `title` (string, required) - Bildirim başlığı
- `message` (string, required) - Bildirim mesajı
- `type` (string, optional) - 'info', 'warning', 'success', 'error'
- `user_ids` (array, optional) - Belirli kullanıcılara gönder
- `role` (string, optional) - Belirli role sahip kullanıcılara gönder ('doctor', 'hospital', 'admin', 'all')
- `data` (object, optional) - Ek veriler

**Kod Konumu:**
```javascript
// Backend/src/controllers/notificationController.js:222
// Backend/src/services/notificationService.js:sendSystemNotification()
```

---

## 🎯 BİLDİRİM TETİKLEYİCİLERİ (DETAYLI)

### DOKTOR İŞLEMLERİ → BİLDİRİM

| İşlem | Tetikleyici Fonksiyon | Alıcı | Bildirim Türü | Durum |
|-------|----------------------|-------|---------------|-------|
| Başvuru yapma | `doctorService.createApplication()` | ❌ Hastane | `info` | **EKSİK!** |
| Başvuru geri çekme | `doctorService.withdrawApplication()` | ❌ Hastane | `warning` | **EKSİK!** |
| Profil güncelleme | `doctorService.updateProfile()` | ✅ Doktor | `success` | Mevcut |
| Fotoğraf yükleme | `doctorService.requestProfilePhotoChange()` | - | - | Bildirim yok |

### HASTANE İŞLEMLERİ → BİLDİRİM

| İşlem | Tetikleyici Fonksiyon | Alıcı | Bildirim Türü | Durum |
|-------|----------------------|-------|---------------|-------|
| İş ilanı oluşturma | `hospitalService.createJob()` | - | - | Bildirim yok (normal) |
| İş ilanı güncelleme | `hospitalService.updateJob()` | - | - | Bildirim yok (normal) |
| İş ilanı durumu değiştirme | `hospitalService.updateJobStatus()` | ✅ Doktorlar | `warning/info` | Mevcut |
| Başvuru durumu güncelleme | `hospitalService.updateApplicationStatus()` | ✅ Doktor | `success/warning/info` | Mevcut |

### ADMIN İŞLEMLERİ → BİLDİRİM

| İşlem | Tetikleyici Fonksiyon | Alıcı | Bildirim Türü | Durum |
|-------|----------------------|-------|---------------|-------|
| İş ilanı onaylama | `adminService.approveJob()` | ✅ Hastane | `success` | Mevcut |
| İş ilanı reddetme | `adminService.rejectJob()` | ✅ Hastane | `error` | Mevcut |
| İş ilanı revizyon isteme | `adminService.requestRevision()` | ✅ Hastane | `warning` | Mevcut |
| İş ilanı durumu değiştirme | `adminService.updateJobStatus()` | ✅ Doktorlar | `warning/info/error` | Mevcut |
| Kullanıcı onaylama | `adminService.updateUserApproval()` | ❌ Kullanıcı | `success` | **EKSİK!** |
| Kullanıcı aktifleştirme | `adminService.activateUser()` | ❌ Kullanıcı | `info` | **EKSİK!** |
| Kullanıcı pasifleştirme | `adminService.deactivateUser()` | ❌ Kullanıcı | `warning` | **EKSİK!** |
| Fotoğraf onaylama | `adminService.reviewPhotoRequest()` | ✅ Doktor | `success` | Mevcut |
| Fotoğraf reddetme | `adminService.reviewPhotoRequest()` | ✅ Doktor | `warning` | Mevcut |
| İletişim mesajı alma | `contactService.createContactMessage()` | ✅ Admin | `info` | Mevcut |
| Manuel bildirim gönderme | `notificationController.sendNotification()` | ✅ Seçilen kullanıcılar | Değişken | Mevcut |

### SİSTEM OLAYLARI → BİLDİRİM

| Olay | Tetikleyici | Alıcı | Bildirim Türü | Durum |
|------|-------------|-------|---------------|-------|
| İş ilanı süresi dolma | `jobExpirationCron.js` | ❌ Hastane | `warning` | **EKSİK!** (TODO var) |

---

## 📱 BİLDİRİM GÖRÜNTÜLEME VE YÖNETİMİ

### Frontend Görüntüleme Noktaları

#### 1. Navbar Notification Bell
**Dosya:** `frontend/src/features/notifications/components/NavbarNotificationBell.jsx`

**Özellikler:**
- Okunmamış bildirim sayısı gösterir (badge)
- Dropdown menü ile hızlı erişim
- Admin için hızlı erişim linkleri
- Her 60 saniyede bir otomatik yenileme (`refetchInterval: 60 * 1000`)

**Görüntüleme:**
- Okunmamış sayı: Kırmızı badge üzerinde sayı
- Dropdown: "Yeni bildiriminiz yok" veya "Tümünü Gör →" linki

#### 2. NotificationsPage (Kullanıcı)
**Dosya:** `frontend/src/features/notifications/pages/NotificationsPage.jsx`

**Özellikler:**
- Tüm bildirimleri listeler
- Filtreleme: Durum (okunmuş/okunmamış), Tür
- Sayfalama: 20 bildirim/sayfa
- Tümünü okundu işaretle butonu
- Tek bildirim silme

**Görüntüleme:**
- NotificationCard component'i ile her bildirim kart olarak gösterilir
- Okunmamış bildirimler: Mavi border, "unread" class
- Okunmuş bildirimler: Gri border, soluk görünüm

#### 3. AdminNotificationsPage (Admin)
**Dosya:** `frontend/src/features/admin/pages/AdminNotificationsPage.jsx`

**Özellikler:**
- Sadece admin'e gelen bildirimleri gösterir
- Sayfalama: 10 bildirim/sayfa
- Tümünü okundu işaretle
- Tek bildirim silme
- Type bazlı icon gösterimi (info, success, warning, error)

**Görüntüleme:**
- Type'a göre renkli border (mavi, yeşil, sarı, kırmızı)
- Okunmamış bildirimler: Mavi border, shadow, "Yeni" badge
- Okunmuş bildirimler: Gri border, soluk görünüm

### NotificationCard Component
**Dosya:** `frontend/src/features/notifications/components/NotificationCard.jsx`

**Özellikler:**
- Type'a göre emoji icon gösterimi
- Tarih formatlama (Türkçe locale)
- Okunmamış bildirimler: Mavi nokta göstergesi
- Silme butonu
- Tıklanabilir (okunmamış ise okundu işaretler)

**Sorunlar:**
- ❌ `notification.isRead` kullanıyor ama backend `read_at` gönderiyor
- ❌ `notification.createdAt` kullanıyor ama backend `created_at` gönderiyor
- ❌ `notification.message` kullanıyor ama backend `body` gönderiyor
- ❌ Type mapping eksik (backend: 'info', frontend: 'application_status')

---

## ❌ MEVCUT EKSİKLİKLER VE SORUNLAR

### 1. Eksik Bildirim Senaryoları

#### 1.1 Doktor Başvuru Yaptığında → Hastane Bildirimi YOK
**Sorun:** `doctorService.createApplication()` fonksiyonunda hastaneye bildirim gönderilmiyor.

**Etki:** Hastane yeni başvurulardan haberdar olamıyor.

**Çözüm Gereksinimi:**
```javascript
// Backend/src/services/doctorService.js:createApplication() içine eklenmeli
// Başvuru oluşturulduktan sonra:
const job = await db('jobs').where('id', jobId).first();
const hospitalProfile = await db('hospital_profiles').where('id', job.hospital_id).first();
const doctorProfile = await db('doctor_profiles').where('id', doctorProfileId).first();

await notificationService.sendHospitalNotification(hospitalProfile.user_id, {
  application_id: applicationId,
  job_title: job.title,
  doctor_name: `${doctorProfile.first_name} ${doctorProfile.last_name}`
});
```

#### 1.2 Doktor Başvuru Geri Çektiğinde → Hastane Bildirimi YOK
**Sorun:** `doctorService.withdrawApplication()` fonksiyonunda hastaneye bildirim gönderilmiyor.

**Etki:** Hastane başvuru geri çekilmesinden haberdar olamıyor.

**Çözüm Gereksinimi:**
```javascript
// Backend/src/services/doctorService.js:withdrawApplication() içine eklenmeli
const job = await db('jobs').where('id', application.job_id).first();
const hospitalProfile = await db('hospital_profiles').where('id', job.hospital_id).first();
const doctorProfile = await db('doctor_profiles').where('id', doctorProfileId).first();

await notificationService.sendHospitalWithdrawalNotification(hospitalProfile.user_id, {
  application_id: applicationId,
  job_title: job.title,
  doctor_name: `${doctorProfile.first_name} ${doctorProfile.last_name}`,
  reason: reason || 'Belirtilmedi'
});
```

#### 1.3 Admin Kullanıcı Onayladığında → Kullanıcı Bildirimi YOK
**Sorun:** `adminService.updateUserApproval()` fonksiyonunda kullanıcıya bildirim gönderilmiyor.

**Etki:** Kullanıcı onay durumundan haberdar olamıyor.

**Çözüm Gereksinimi:**
```javascript
// Backend/src/services/adminService.js:updateUserApproval() içine eklenmeli
if (approved) {
  await notificationService.sendNotification({
    user_id: userId,
    type: 'success',
    title: 'Hesabınız Onaylandı',
    body: 'Hesabınız admin tarafından onaylandı. Artık tüm özellikleri kullanabilirsiniz.',
    data: { action: 'approved', timestamp: new Date().toISOString() }
  });
} else {
  await notificationService.sendNotification({
    user_id: userId,
    type: 'warning',
    title: 'Hesap Onayı Kaldırıldı',
    body: 'Hesabınızın onayı kaldırıldı. Lütfen admin ile iletişime geçin.',
    data: { action: 'approval_removed', timestamp: new Date().toISOString() }
  });
}
```

#### 1.4 Admin Kullanıcı Aktifleştirdiğinde → Kullanıcı Bildirimi YOK
**Sorun:** `adminService.activateUser()` ve `adminService.deactivateUser()` fonksiyonlarında kullanıcıya bildirim gönderilmiyor.

**Etki:** Kullanıcı aktiflik durumundan haberdar olamıyor.

**Çözüm Gereksinimi:**
```javascript
// Backend/src/services/adminService.js:activateUser() içine eklenmeli
await notificationService.sendNotification({
  user_id: userId,
  type: 'success',
  title: 'Hesabınız Aktifleştirildi',
  body: 'Hesabınız admin tarafından aktifleştirildi.',
  data: { action: 'activated', timestamp: new Date().toISOString() }
});

// Backend/src/services/adminService.js:deactivateUser() içine eklenmeli
await notificationService.sendNotification({
  user_id: userId,
  type: 'warning',
  title: 'Hesabınız Pasifleştirildi',
  body: 'Hesabınız admin tarafından pasifleştirildi. Lütfen admin ile iletişime geçin.',
  data: { action: 'deactivated', timestamp: new Date().toISOString() }
});
```

#### 1.5 İş İlanı Süresi Dolduğunda → Hastane Bildirimi YOK
**Sorun:** `jobExpirationCron.js` dosyasında TODO var ama bildirim gönderilmiyor.

**Etki:** Hastane ilan süresinin dolduğundan haberdar olamıyor.

**Çözüm Gereksinimi:**
```javascript
// Backend/src/utils/jobExpirationCron.js içine eklenmeli
await notificationService.sendNotification({
  user_id: hospitalProfile.user_id,
  type: 'warning',
  title: 'İlan Süresi Doldu',
  body: `"${job.title}" ilanınızın süresi doldu. İlanı yenilemek için güncelleyebilirsiniz.`,
  data: { job_id: job.id, job_title: job.title, expired_at: new Date().toISOString() }
});
```

### 2. Frontend-Backend Uyumsuzlukları

#### 2.1 NotificationCard Component Field Mapping
**Sorun:** Frontend ve backend field isimleri uyuşmuyor.

**Backend Gönderiyor:**
```javascript
{
  id: 1,
  title: "Başvurunuz Onaylandı",
  body: "Mesaj içeriği...",
  type: "success",
  read_at: null, // veya Date
  created_at: "2024-01-01T10:00:00Z",
  data: { application_id: 123 }
}
```

**Frontend Bekliyor:**
```javascript
{
  id: 1,
  title: "Başvurunuz Onaylandı",
  message: "Mesaj içeriği...", // ❌ body yerine message
  type: "application_status", // ❌ success yerine application_status
  isRead: false, // ❌ read_at yerine isRead
  createdAt: "2024-01-01T10:00:00Z", // ❌ created_at yerine createdAt
  actionUrl: "...", // ❌ Yok
  actionText: "Görüntüle" // ❌ Yok
}
```

**Çözüm:** Backend response'u normalize etmek veya frontend'i backend'e uygun hale getirmek.

#### 2.2 Notification Type Mapping
**Sorun:** Backend type değerleri (`info`, `success`, `warning`, `error`) ile frontend type değerleri (`application_status`, `interview_scheduled`, vb.) uyuşmuyor.

**Backend Type Değerleri:**
- `info` - Bilgilendirme
- `success` - Başarı
- `warning` - Uyarı
- `error` - Hata

**Frontend Type Değerleri (NotificationCard.jsx):**
- `application_status` - Başvuru durumu
- `interview_scheduled` - Mülakat
- `job_match` - İş eşleşmesi
- `message` - Mesaj
- `system` - Sistem
- `reminder` - Hatırlatma

**Çözüm:** Type mapping yapılmalı veya backend'den `category` field'ı eklenmeli.

### 3. Real-Time Bildirim Eksikliği

**Sorun:** Bildirimler sadece sayfa yenilendiğinde veya manuel refresh ile görünüyor.

**Mevcut Durum:**
- React Query `refetchInterval: 60 * 1000` (60 saniye) ile polling yapıyor
- Bu yeterli değil, kullanıcı deneyimi kötü

**Çözüm:** WebSocket veya Server-Sent Events (SSE) ile real-time bildirim.

### 4. Bildirim Ayarları Eksikliği

**Sorun:** Kullanıcılar hangi bildirimleri almak istediklerini seçemiyor.

**Eksik Özellikler:**
- Bildirim türü tercihleri (sadece önemli bildirimler, tüm bildirimler)
- Email bildirim tercihleri
- Push notification tercihleri
- Bildirim sessiz saatleri

### 5. Bildirim Gruplama Eksikliği

**Sorun:** Aynı türden birden fazla bildirim ayrı ayrı gösteriliyor.

**Örnek:** 10 doktor aynı ilana başvurduğunda hastane 10 ayrı bildirim alıyor.

**Çözüm:** Bildirim gruplama sistemi (örn: "10 yeni başvuru aldınız").

### 6. Bildirim Önceliklendirme Eksikliği

**Sorun:** Tüm bildirimler aynı öncelikte gösteriliyor.

**Eksik Özellikler:**
- Urgent (acil) bildirimler
- Normal bildirimler
- Low priority (düşük öncelik) bildirimler

### 7. Bildirim Geçmişi/Arşivleme Eksikliği

**Sorun:** Eski bildirimler sadece silinebiliyor, arşivlenemiyor.

**Eksik Özellikler:**
- Bildirim arşivleme
- Bildirim geçmişi görüntüleme
- Bildirim arama

### 8. Email/Push Notification Eksikliği

**Sorun:** Sadece in-app bildirim var, email veya push notification yok.

**Eksik Özellikler:**
- Email bildirimleri (önemli bildirimler için)
- Push notification (tarayıcı push API)
- SMS bildirimleri (opsiyonel)

---

## 🚀 GELİŞTİRME ÖNERİLERİ

### Öncelik 1: Eksik Bildirim Senaryolarını Tamamla

#### 1.1 Doktor Başvuru Yaptığında Hastane Bildirimi
**Dosya:** `Backend/src/services/doctorService.js`
**Fonksiyon:** `createApplication()`
**Satır:** ~1250 (başvuru oluşturulduktan sonra)

**Eklenmesi Gereken Kod:**
```javascript
// Başvuru oluşturulduktan sonra hastaneye bildirim gönder
try {
  const job = await db('jobs as j')
    .join('hospital_profiles as hp', 'j.hospital_id', 'hp.id')
    .where('j.id', jobId)
    .select('hp.user_id', 'j.title as job_title')
    .first();
  
  const doctorProfile = await db('doctor_profiles')
    .where('id', doctorProfileId)
    .select('first_name', 'last_name')
    .first();
  
  if (job && doctorProfile) {
    await notificationService.sendHospitalNotification(job.user_id, {
      application_id: applicationId,
      job_title: job.job_title,
      doctor_name: `${doctorProfile.first_name} ${doctorProfile.last_name}`
    });
  }
} catch (notificationError) {
  logger.warn('Hospital notification failed:', notificationError);
  // Bildirim hatası işlemi durdurmasın
}
```

#### 1.2 Doktor Başvuru Geri Çektiğinde Hastane Bildirimi
**Dosya:** `Backend/src/services/doctorService.js`
**Fonksiyon:** `withdrawApplication()`
**Satır:** ~1530 (başvuru geri çekildikten sonra)

**Eklenmesi Gereken Kod:**
```javascript
// Başvuru geri çekildikten sonra hastaneye bildirim gönder
try {
  const job = await db('jobs as j')
    .join('hospital_profiles as hp', 'j.hospital_id', 'hp.id')
    .where('j.id', application.job_id)
    .select('hp.user_id', 'j.title as job_title')
    .first();
  
  const doctorProfile = await db('doctor_profiles')
    .where('id', doctorProfileId)
    .select('first_name', 'last_name')
    .first();
  
  if (job && doctorProfile) {
    await notificationService.sendHospitalWithdrawalNotification(job.user_id, {
      application_id: applicationId,
      job_title: job.job_title,
      doctor_name: `${doctorProfile.first_name} ${doctorProfile.last_name}`,
      reason: reason || 'Belirtilmedi'
    });
  }
} catch (notificationError) {
  logger.warn('Hospital withdrawal notification failed:', notificationError);
}
```

#### 1.3 Kullanıcı Onay/Aktiflik Bildirimleri
**Dosya:** `Backend/src/services/adminService.js`
**Fonksiyonlar:** `updateUserApproval()`, `activateUser()`, `deactivateUser()`

**Eklenmesi Gereken Kod:**
```javascript
// updateUserApproval() içine
if (approved) {
  await notificationService.sendNotification({
    user_id: userId,
    type: 'success',
    title: 'Hesabınız Onaylandı',
    body: 'Hesabınız admin tarafından onaylandı. Artık tüm özellikleri kullanabilirsiniz.',
    data: { action: 'approved', timestamp: new Date().toISOString() }
  });
} else {
  await notificationService.sendNotification({
    user_id: userId,
    type: 'warning',
    title: 'Hesap Onayı Kaldırıldı',
    body: 'Hesabınızın onayı kaldırıldı. Lütfen admin ile iletişime geçin.',
    data: { action: 'approval_removed', timestamp: new Date().toISOString() }
  });
}

// activateUser() içine
await notificationService.sendNotification({
  user_id: userId,
  type: 'success',
  title: 'Hesabınız Aktifleştirildi',
  body: 'Hesabınız admin tarafından aktifleştirildi.',
  data: { action: 'activated', timestamp: new Date().toISOString() }
});

// deactivateUser() içine
await notificationService.sendNotification({
  user_id: userId,
  type: 'warning',
  title: 'Hesabınız Pasifleştirildi',
  body: 'Hesabınız admin tarafından pasifleştirildi. Lütfen admin ile iletişime geçin.',
  data: { action: 'deactivated', timestamp: new Date().toISOString() }
});
```

### Öncelik 2: Frontend-Backend Uyumluluğu

#### 2.1 NotificationCard Component Düzeltmesi
**Dosya:** `frontend/src/features/notifications/components/NotificationCard.jsx`

**Değişiklikler:**
```javascript
// Mevcut (YANLIŞ):
notification.isRead
notification.createdAt
notification.message
notification.type // 'application_status' gibi

// Olması Gereken (DOĞRU):
notification.read_at ? false : true // veya !notification.read_at
notification.created_at
notification.body
notification.type // 'info', 'success', 'warning', 'error'
```

#### 2.2 Backend Response Normalizasyonu
**Alternatif Çözüm:** Backend'den response'u normalize etmek.

**Dosya:** `Backend/src/controllers/notificationController.js`

**Eklenmesi Gereken:**
```javascript
// getNotifications() fonksiyonunda response'u normalize et
const normalizedNotifications = notifications.map(notification => ({
  ...notification,
  isRead: notification.read_at !== null,
  createdAt: notification.created_at,
  message: notification.body,
  // Type mapping (opsiyonel)
  category: getNotificationCategory(notification.type, notification.data)
}));
```

### Öncelik 3: Real-Time Bildirimler

#### 3.1 WebSocket veya SSE Entegrasyonu
**Önerilen:** Server-Sent Events (SSE) - Daha basit, HTTP üzerinden çalışır.

**Backend:**
```javascript
// Backend/src/routes/notificationRoutes.js
router.get('/stream', authMiddleware, async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Kullanıcıya yeni bildirim geldiğinde gönder
  // notificationService'de event emitter kullan
});
```

**Frontend:**
```javascript
// frontend/src/features/notifications/api/useNotifications.js
export const useNotificationStream = (userId) => {
  useEffect(() => {
    const eventSource = new EventSource(`/api/notifications/stream`);
    
    eventSource.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      // React Query cache'i güncelle
      queryClient.setQueryData(['notifications'], (old) => ({
        ...old,
        data: [notification, ...old.data]
      }));
    };
    
    return () => eventSource.close();
  }, [userId]);
};
```

### Öncelik 4: Bildirim Ayarları Sistemi

#### 4.1 Database Schema
```sql
CREATE TABLE notification_settings (
  id INT IDENTITY(1,1) PRIMARY KEY,
  user_id INT NOT NULL FOREIGN KEY REFERENCES users(id),
  notification_type VARCHAR(50) NOT NULL, -- 'application_status', 'job_status', vb.
  inapp_enabled BIT DEFAULT 1,
  email_enabled BIT DEFAULT 0,
  push_enabled BIT DEFAULT 0,
  created_at DATETIME2 DEFAULT GETDATE(),
  updated_at DATETIME2 DEFAULT GETDATE()
);
```

#### 4.2 API Endpoints
- `GET /api/notifications/settings` - Kullanıcı ayarlarını getir
- `PUT /api/notifications/settings` - Kullanıcı ayarlarını güncelle

#### 4.3 Frontend UI
- Bildirim ayarları sayfası
- Toggle switch'ler (in-app, email, push)
- Bildirim türü bazlı ayarlar

### Öncelik 5: Bildirim Gruplama

#### 5.1 Gruplama Mantığı
**Örnek Senaryo:** 10 doktor aynı ilana başvurdu

**Mevcut:** 10 ayrı bildirim
```
1. Yeni Başvuru Aldınız - Dr. Ahmet Yılmaz
2. Yeni Başvuru Aldınız - Dr. Mehmet Demir
3. Yeni Başvuru Aldınız - Dr. Ayşe Kaya
...
```

**Olması Gereken:** 1 gruplanmış bildirim
```
1. 10 Yeni Başvuru Aldınız - Kardiyoloji Uzmanı pozisyonu için
   [Görüntüle] → Başvurular sayfasına yönlendir
```

**Çözüm:**
```javascript
// Backend/src/services/notificationService.js
const groupNotifications = (notifications) => {
  const grouped = {};
  
  notifications.forEach(notification => {
    const key = `${notification.type}_${notification.data?.job_id || notification.data?.application_id}`;
    if (!grouped[key]) {
      grouped[key] = {
        ...notification,
        count: 1,
        grouped_items: [notification]
      };
    } else {
      grouped[key].count++;
      grouped[key].grouped_items.push(notification);
    }
  });
  
  return Object.values(grouped);
};
```

### Öncelik 6: Email Bildirimleri

#### 6.1 Email Service Entegrasyonu
**Dosya:** `Backend/src/utils/emailService.js` (mevcut)

**Kullanım:**
```javascript
// notificationService.js içinde
if (userSettings.email_enabled && notification.priority === 'high') {
  await emailService.sendNotificationEmail({
    to: user.email,
    subject: notification.title,
    body: notification.body,
    template: 'notification'
  });
}
```

### Öncelik 7: Bildirim Önceliklendirme

#### 7.1 Database Schema
```sql
ALTER TABLE notifications ADD priority VARCHAR(20) DEFAULT 'normal';
-- 'urgent', 'high', 'normal', 'low'
```

#### 7.2 Öncelik Kuralları
- **Urgent:** Kullanıcı hesap durumu değişiklikleri (onay, aktiflik)
- **High:** Başvuru onay/red, iş ilanı onay/red
- **Normal:** Başvuru durumu güncellemeleri, yeni başvuru
- **Low:** Profil güncellemeleri, sistem duyuruları

---

## 📈 BİLDİRİM AKIŞ ŞEMASI

### Doktor Başvuru Yapma Akışı
```
1. Doktor başvuru yapar
   ↓
2. doctorService.createApplication() çağrılır
   ↓
3. Başvuru veritabanına kaydedilir
   ↓
4. ❌ EKSİK: Hastaneye bildirim gönderilmiyor
   ↓
5. Doktor başarı mesajı alır (toast)
```

**Olması Gereken:**
```
1. Doktor başvuru yapar
   ↓
2. doctorService.createApplication() çağrılır
   ↓
3. Başvuru veritabanına kaydedilir
   ↓
4. ✅ Hastaneye bildirim gönderilir
   ↓
5. Doktor başarı mesajı alır (toast)
   ↓
6. Hastane navbar'da bildirim badge'i görür
   ↓
7. Hastane bildirim sayfasında yeni başvuruyu görür
```

### Hastane Başvuru Durumu Güncelleme Akışı
```
1. Hastane başvuru durumunu günceller
   ↓
2. hospitalService.updateApplicationStatus() çağrılır
   ↓
3. Başvuru durumu güncellenir
   ↓
4. ✅ Doktora bildirim gönderilir (sendDoctorNotification)
   ↓
5. Doktor navbar'da bildirim badge'i görür
   ↓
6. Doktor bildirim sayfasında durum değişikliğini görür
```

### Admin İş İlanı Onaylama Akışı
```
1. Admin iş ilanını onaylar
   ↓
2. adminService.approveJob() çağrılır
   ↓
3. İş ilanı durumu güncellenir
   ↓
4. ✅ Hastaneye bildirim gönderilir
   ↓
5. ✅ İlana başvuru yapan doktorlara bildirim gönderilir (eğer durum değiştiyse)
   ↓
6. Hastane ve doktorlar bildirimlerini görür
```

---

## 🔍 BİLDİRİM GÖRÜNTÜLEME DETAYLARI

### Navbar Notification Bell
- **Konum:** Header component içinde
- **Görüntüleme:** Sağ üst köşe, bell icon + badge
- **Badge:** Okunmamış sayı (kırmızı)
- **Dropdown:** Tıklanınca açılır, "Tümünü Gör" linki
- **Yenileme:** 60 saniyede bir otomatik

### NotificationsPage (Kullanıcı)
- **Route:** `/{role}/notifications`
- **Görüntüleme:** Liste formatında, kart bazlı
- **Filtreleme:** Durum (okunmuş/okunmamış), Tür
- **Sayfalama:** 20 bildirim/sayfa
- **İşlemler:** Okundu işaretle, Sil, Tümünü okundu işaretle

### AdminNotificationsPage (Admin)
- **Route:** `/admin/notifications`
- **Görüntüleme:** Liste formatında, renkli border'lı kartlar
- **Sayfalama:** 10 bildirim/sayfa
- **İşlemler:** Okundu işaretle, Sil, Tümünü okundu işaretle

---

## 🎨 BİLDİRİM GÖRSELLERİ

### Type Bazlı Renkler
- **info:** Mavi (#3b82f6)
- **success:** Yeşil (#10b981)
- **warning:** Sarı/Turuncu (#f59e0b)
- **error:** Kırmızı (#ef4444)

### Okunmamış Bildirim Görünümü
- Mavi border (sol tarafta)
- Shadow efekti
- "Yeni" badge (mavi, pulse animasyonu)
- Mavi nokta göstergesi

### Okunmuş Bildirim Görünümü
- Gri border
- Soluk arka plan
- Shadow yok
- Badge yok

---

## 📝 ÖZET: EKSİK BİLDİRİM SENARYOLARI

| Senaryo | Tetikleyici | Alıcı | Durum | Öncelik |
|---------|-------------|-------|-------|---------|
| Doktor başvuru yaptı | `createApplication()` | Hastane | ❌ EKSİK | 🔴 YÜKSEK |
| Doktor başvuru geri çekti | `withdrawApplication()` | Hastane | ❌ EKSİK | 🔴 YÜKSEK |
| Admin kullanıcı onayladı | `updateUserApproval()` | Kullanıcı | ❌ EKSİK | 🟡 ORTA |
| Admin kullanıcı aktifleştirdi | `activateUser()` | Kullanıcı | ❌ EKSİK | 🟡 ORTA |
| Admin kullanıcı pasifleştirdi | `deactivateUser()` | Kullanıcı | ❌ EKSİK | 🟡 ORTA |
| İş ilanı süresi doldu | `jobExpirationCron.js` | Hastane | ❌ EKSİK | 🟢 DÜŞÜK |

---

## 🎯 ÖNERİLEN GELİŞTİRME SIRASI

### Faz 1: Kritik Eksiklikler (Hemen)
1. ✅ Doktor başvuru yaptığında hastane bildirimi
2. ✅ Doktor başvuru geri çektiğinde hastane bildirimi
3. ✅ Frontend-Backend field mapping düzeltmesi

### Faz 2: Önemli İyileştirmeler (Kısa Vadede)
4. ✅ Kullanıcı onay/aktiflik bildirimleri
5. ✅ Real-time bildirimler (SSE veya WebSocket)
6. ✅ Bildirim ayarları sistemi

### Faz 3: Gelişmiş Özellikler (Orta Vadede)
7. ✅ Email bildirimleri
8. ✅ Bildirim gruplama
9. ✅ Bildirim önceliklendirme
10. ✅ Push notification

### Faz 4: İleri Seviye (Uzun Vadede)
11. ✅ Bildirim şablonları
12. ✅ Bildirim analytics
13. ✅ Bildirim geçmişi/arşivleme
14. ✅ SMS bildirimleri

---

## 📚 TEKNİK NOTLAR

### Bildirim Gönderme Pattern'i
```javascript
// Try-catch ile hata yönetimi
try {
  await notificationService.sendNotification({...});
} catch (notificationError) {
  logger.warn('Notification failed:', notificationError);
  // Bildirim hatası ana işlemi durdurmamalı
}
```

### Bildirim Data Yapısı
```javascript
{
  // Zorunlu alanlar
  user_id: number,
  type: 'info' | 'success' | 'warning' | 'error',
  title: string,
  body: string,
  
  // Opsiyonel alanlar
  data: {
    // Context-specific data
    application_id?: number,
    job_id?: number,
    contact_message_id?: number,
    request_id?: number,
    // ... diğer context verileri
  },
  channel: 'inapp' | 'email' | 'push' // Şu an sadece 'inapp'
}
```

### Bildirim Type Mapping
```javascript
// Backend type → Frontend category mapping
const typeToCategory = {
  'info': 'system',
  'success': 'application_status',
  'warning': 'application_status',
  'error': 'application_status'
};

// Veya backend'den category field'ı eklenmeli
```

---

## 🔧 HIZLI DÜZELTME LİSTESİ

### Backend Düzeltmeleri
- [ ] `doctorService.createApplication()` - Hastane bildirimi ekle
- [ ] `doctorService.withdrawApplication()` - Hastane bildirimi ekle
- [ ] `adminService.updateUserApproval()` - Kullanıcı bildirimi ekle
- [ ] `adminService.activateUser()` - Kullanıcı bildirimi ekle
- [ ] `adminService.deactivateUser()` - Kullanıcı bildirimi ekle
- [ ] `jobExpirationCron.js` - Hastane bildirimi ekle
- [ ] `notificationController.getNotifications()` - Response normalize et

### Frontend Düzeltmeleri
- [ ] `NotificationCard.jsx` - Field mapping düzelt (read_at → isRead, body → message, vb.)
- [ ] `NotificationsPage.jsx` - Backend response format'ına uygun hale getir
- [ ] `useNotifications.js` - Response transform ekle

---

## 📊 BİLDİRİM İSTATİSTİKLERİ

### Mevcut Bildirim Sayıları (Tahmini)
- **Günlük Bildirim:** ~50-100 (tahmin)
- **Bildirim Türleri:** 4 (info, success, warning, error)
- **Aktif Kullanıcı:** ~100-500 (tahmin)
- **Bildirim Kanalı:** 1 (inapp)

### Bildirim Performansı
- **Ortalama Bildirim Gönderme Süresi:** <100ms (tahmin)
- **Bildirim Okunma Oranı:** Bilinmiyor (analytics yok)
- **Bildirim Tıklama Oranı:** Bilinmiyor (analytics yok)

---

## 🎓 SONUÇ

MediKariyer bildirim sistemi temel yapıya sahip ancak önemli eksiklikler var:

1. **Kritik Eksiklikler:** Doktor başvuru yaptığında/geri çektiğinde hastane bildirimi yok
2. **Frontend-Backend Uyumsuzluğu:** Field isimleri ve type mapping uyuşmuyor
3. **Real-Time Eksikliği:** Polling kullanılıyor, WebSocket/SSE yok
4. **Ayarlar Eksikliği:** Kullanıcı bildirim tercihlerini yönetemiyor
5. **Gelişmiş Özellikler:** Email, push, gruplama, önceliklendirme yok

**Önerilen Yaklaşım:**
1. Önce kritik eksiklikleri tamamla (Faz 1)
2. Sonra frontend-backend uyumluluğunu sağla
3. Real-time bildirimleri ekle
4. Gelişmiş özellikleri adım adım ekle

Bu analiz, yapay zeka sistemlerinin projeyi anlaması ve öneriler sunması için yeterli detayda hazırlanmıştır.

