# 📊 MediKariyer Bildirim Sistemi Analizi

## 📋 Genel Bakış

Bu dokümanda doktorların ve hastanelerin hangi durumlarda bildirim aldıkları detaylı olarak analiz edilmiştir.

---

## 👨‍⚕️ DOKTORLAR İÇİN BİLDİRİMLER

### 1. 📝 Başvuru Durumu Değişiklikleri

**Fonksiyon:** `notificationService.sendDoctorNotification()`

#### 1.1. Başvuru Onaylandı (Accepted)
- **Durum:** `status = 'accepted'` veya `status_id = 3`
- **Bildirim Türü:** `success`
- **Başlık:** "Başvurunuz Onaylandı"
- **İçerik:** `{hospital_name} hastanesindeki {job_title} pozisyonu için başvurunuz onaylandı.`
- **Gönderen Yerler:**
  - `hospitalService.updateApplicationStatus()` - Hastane başvuru durumunu değiştirdiğinde
  - `adminService.updateApplicationStatus()` - Admin başvuru durumunu değiştirdiğinde
- **Ek Veriler:**
  - `application_id`
  - `job_title`
  - `hospital_name`
  - `status`
  - `notes` (varsa)

#### 1.2. Başvuru Reddedildi (Rejected)
- **Durum:** `status = 'rejected'` veya `status_id = 4`
- **Bildirim Türü:** `error`
- **Başlık:** "Başvurunuz Reddedildi"
- **İçerik:** `{hospital_name} hastanesindeki {job_title} pozisyonu için başvurunuz reddedildi.`
- **Gönderen Yerler:**
  - `hospitalService.updateApplicationStatus()` - Hastane başvuru durumunu değiştirdiğinde
  - `adminService.updateApplicationStatus()` - Admin başvuru durumunu değiştirdiğinde
- **Ek Veriler:**
  - `application_id`
  - `job_title`
  - `hospital_name`
  - `status`
  - `notes` (varsa)

#### 1.3. Başvuru Beklemede/İnceleniyor (Pending/Reviewing)
- **Durum:** `status = 'pending'` veya `status_id = 1` veya `status_id = 2`
- **Bildirim Türü:** `info`
- **Başlık:** "Başvurunuz İnceleniyor"
- **İçerik:** `{hospital_name} hastanesindeki {job_title} pozisyonu için başvurunuz inceleniyor.`
- **Gönderen Yerler:**
  - `hospitalService.updateApplicationStatus()` - Hastane başvuru durumunu değiştirdiğinde
  - `adminService.updateApplicationStatus()` - Admin başvuru durumunu değiştirdiğinde

### 2. 💼 İş İlanı Durumu Değişiklikleri

**Fonksiyon:** `notificationService.sendJobStatusNotification()`

#### 2.1. İlan Kapatıldı (Closed)
- **Durum:** `jobStatus = 'closed'`
- **Bildirim Türü:** `warning`
- **Başlık:** "İlan Kapatıldı"
- **İçerik:** `{hospital_name} hastanesindeki {job_title} pozisyonu için ilan kapatıldı.`
- **Ek Veriler:**
  - `job_id`
  - `job_title`
  - `hospital_name`
  - `status`

#### 2.2. İlan Arşivlendi (Archived)
- **Durum:** `jobStatus = 'archived'`
- **Bildirim Türü:** `info`
- **Başlık:** "İlan Arşivlendi"
- **İçerik:** `{hospital_name} hastanesindeki {job_title} pozisyonu için ilan arşivlendi.`

#### 2.3. İlan Aktif Edildi (Active)
- **Durum:** `jobStatus = 'active'`
- **Bildirim Türü:** `success`
- **Başlık:** "İlan Aktif Edildi"
- **İçerik:** `{hospital_name} hastanesindeki {job_title} pozisyonu için ilan aktif edildi.`

#### 2.4. İlan Durumu Değişti (Genel)
- **Fonksiyon:** `notificationService.sendNotification()` (doğrudan)
- **Gönderen Yerler:**
  - `hospitalService.updateJobStatus()` - Hastane ilan durumunu değiştirdiğinde
    - Tüm başvuru yapan doktorlara gönderilir
    - Durum: "Aktif" → "Pasif" veya diğer durum değişiklikleri
  - `adminService.updateJobStatus()` - Admin ilan durumunu değiştirdiğinde
    - Tüm başvuru yapan doktorlara gönderilir
    - Durumlar: "Pasif", "Reddedildi", "Revizyon Gerekli", vb.
- **Bildirim Türü:** Duruma göre değişir
  - `warning` - Pasif
  - `error` - Reddedildi
  - `warning` - Revizyon Gerekli
  - `info` - Diğer durumlar
- **Başlık:** "İlan Durumu Değişti"
- **İçerik:** `{hospital_name} hastanesindeki {job_title} pozisyonu için ilan durumu "{oldStatus}" → "{newStatus}" olarak değiştirildi.`
- **Ek Veriler:**
  - `job_id`
  - `job_title`
  - `hospital_name`
  - `old_status`
  - `new_status`
  - `changed_by` (admin ise)

### 3. 📸 Profil Fotoğrafı Onay/Red

**Fonksiyon:** `notificationService.sendNotification()` (doğrudan)

#### 3.1. Fotoğraf Onaylandı
- **Gönderen:** `adminService.reviewPhotoRequest()`
- **Bildirim Türü:** `success`
- **Başlık:** "Profil Fotoğrafınız Onaylandı"
- **İçerik:** "Profil fotoğrafınız admin tarafından onaylandı ve profilinizde güncellendi."
- **Ek Veriler:**
  - `request_id`
  - `action: 'approve'`

#### 3.2. Fotoğraf Reddedildi
- **Gönderen:** `adminService.reviewPhotoRequest()`
- **Bildirim Türü:** `warning`
- **Başlık:** "Profil Fotoğrafınız Reddedildi"
- **İçerik:** `Profil fotoğrafınız reddedildi. {reason ? 'Sebep: ' + reason : ''}`
- **Ek Veriler:**
  - `request_id`
  - `action: 'reject'`

### 4. ✅ Profil Güncellemeleri

**Fonksiyon:** `notificationService.sendNotification()` (doğrudan)

#### 4.1. Profil Bilgileri Güncellendi
- **Gönderen:** `doctorService.updateProfile()`
- **Bildirim Türü:** `success`
- **Başlık:** Güncellenen alana göre değişir:
  - "Kişisel Bilgiler Güncellendi"
  - "İletişim Bilgileri Güncellendi"
  - "Eğitim Bilgileri Güncellendi"
  - "Deneyim Bilgileri Güncellendi"
  - "Sertifika Bilgileri Güncellendi"
  - "Dil Bilgileri Güncellendi"
- **İçerik:** `Profilinizde {updateDescription} işlemi başarıyla gerçekleştirildi.`
- **Ek Veriler:**
  - `update_type`
  - `update_description`
  - `timestamp`

### 5. 🔔 Sistem Bildirimleri

**Fonksiyon:** `notificationService.sendUserStatusNotification()`

#### 5.1. Hesap Onaylandı
- **Gönderen:** `adminService.approveUser()`
- **Bildirim Türü:** `success`
- **Başlık:** "Hesabınız Onaylandı"
- **İçerik:** Hesap onaylandı mesajı

#### 5.2. Hesap Reddedildi
- **Gönderen:** `adminService.rejectUser()`
- **Bildirim Türü:** `error`
- **Başlık:** "Hesabınız Reddedildi"
- **İçerik:** Red sebebi ile birlikte

#### 5.3. Hesap Aktif Edildi
- **Gönderen:** `adminService.activateUser()`
- **Bildirim Türü:** `success`
- **Başlık:** "Hesabınız Aktif Edildi"

#### 5.4. Hesap Pasif Edildi
- **Gönderen:** `adminService.deactivateUser()`
- **Bildirim Türü:** `warning`
- **Başlık:** "Hesabınız Pasif Edildi"

---

## 🏥 HASTANELER İÇİN BİLDİRİMLER

### 1. 📥 Yeni Başvuru Bildirimi

**Fonksiyon:** `notificationService.sendNotification()` (doğrudan)

#### 1.1. Doktor Başvuru Yaptı
- **Gönderen:** `doctorService.createApplication()`
- **Bildirim Türü:** `info`
- **Başlık:** "Yeni Başvuru Aldınız"
- **İçerik:** `"{job_title}" pozisyonu için {doctor_name} doktorundan yeni bir başvuru aldınız.`
- **Ek Veriler:**
  - `application_id`
  - `job_id`
  - `job_title`
  - `doctor_name`
  - `doctor_profile_id`

### 2. ⚠️ Başvuru Geri Çekme Bildirimi

**Fonksiyon:** `notificationService.sendNotification()` (doğrudan)

#### 2.1. Doktor Başvurusunu Geri Çekti
- **Gönderen:** `doctorService.withdrawApplication()`
- **Bildirim Türü:** `warning`
- **Başlık:** "Başvuru Geri Çekildi"
- **İçerik:** `{doctor_name} doktoru "{job_title}" pozisyonu için başvurusunu geri çekti.{reason ? ' Sebep: ' + reason : ''}`
- **Ek Veriler:**
  - `application_id`
  - `job_id`
  - `job_title`
  - `doctor_name`
  - `doctor_profile_id`
  - `reason` (varsa)

### 3. 📋 İlan Durumu Değişiklikleri (Admin Tarafından)

**Fonksiyon:** `notificationService.sendNotification()` (doğrudan)

#### 3.1. İlan Onaylandı
- **Gönderen:** `adminService.approveJob()`
- **Bildirim Türü:** `success`
- **Başlık:** "İlan Onaylandı"
- **İçerik:** `{institution_name} hastanesindeki "{job_title}" ilanı onaylandı ve yayına alındı.`
- **Ek Veriler:**
  - `job_id`
  - `job_title`
  - `status: 'approved'`

#### 3.2. İlan Revizyon Gerektiriyor
- **Gönderen:** `adminService.requestJobRevision()`
- **Bildirim Türü:** `warning`
- **Başlık:** "İlan Revizyon Gerektiriyor"
- **İçerik:** `{institution_name} hastanesindeki "{job_title}" ilanı için revizyon talebi var.`
- **Ek Veriler:**
  - `job_id`
  - `job_title`
  - `revision_note`
  - `status: 'needs_revision'`

#### 3.3. İlan Reddedildi
- **Gönderen:** `adminService.rejectJob()`
- **Bildirim Türü:** `error`
- **Başlık:** "İlan Reddedildi"
- **İçerik:** `{institution_name} hastanesindeki "{job_title}" ilanı reddedildi.{rejectionReason ? ' Sebep: ' + rejectionReason : ''}`
- **Ek Veriler:**
  - `job_id`
  - `job_title`
  - `rejection_reason`
  - `status: 'rejected'`

### 4. ⏰ İlan Süresi Doldu

**Fonksiyon:** `notificationService.sendNotification()` (doğrudan)

#### 4.1. Otomatik Pasif Edilen İlanlar
- **Gönderen:** `jobExpirationCron.checkExpiredJobs()` (Cron Job - Her gün 00:00)
- **Bildirim Türü:** `warning`
- **Başlık:** "İlan Süresi Doldu"
- **İçerik:** `"{job_title}" ilanınızın süresi doldu. İlanı yenilemek için güncelleyebilirsiniz.`
- **Ek Veriler:**
  - `job_id`
  - `job_title`
  - `expired_at`
- **Not:** İlan `published_at + 30 gün` geçtiğinde otomatik olarak pasif edilir ve bildirim gönderilir.

---

## 📊 BİLDİRİM TÜRLERİ ÖZETİ

### Doktorlar İçin:
1. ✅ Başvuru durumu değişiklikleri (onaylandı, reddedildi, inceleniyor)
2. 💼 İş ilanı durumu değişiklikleri (kapatıldı, arşivlendi, aktif edildi)
3. 📸 Profil fotoğrafı onay/red
4. ✅ Profil güncellemeleri
5. 🔔 Sistem bildirimleri (hesap onay/red, aktif/pasif)

### Hastaneler İçin:
1. 📥 Yeni başvuru bildirimi
2. ⚠️ Başvuru geri çekme bildirimi
3. 📋 İlan durumu değişiklikleri (admin tarafından: onaylandı, revizyon, reddedildi)
4. ⏰ İlan süresi doldu bildirimi (otomatik)

---

## 🔍 BİLDİRİM GÖNDEREN SERVİSLER

### 1. `notificationService.js`
- `sendNotification()` - Genel bildirim gönderme
- `sendDoctorNotification()` - Doktor için özel bildirim
- `sendHospitalNotification()` - Hastane için özel bildirim
- `sendUserStatusNotification()` - Kullanıcı durumu bildirimi

### 2. `doctorService.js`
- Profil güncellemeleri
- Yeni başvuru oluşturma (hastaneye bildirim)
- Başvuru geri çekme (hastaneye bildirim)

### 3. `hospitalService.js`
- Başvuru durumu güncelleme (doktora bildirim)
- İlan durumu güncelleme (başvuru yapan doktorlara bildirim)

### 4. `adminService.js`
- Başvuru durumu güncelleme (doktora bildirim)
- İlan durumu güncelleme (başvuru yapan doktorlara bildirim)
- İlan onay/revizyon/red (hastaneye bildirim)
- Profil fotoğrafı onay/red (doktora bildirim)
- Kullanıcı durumu değişiklikleri (onay/red, aktif/pasif)

### 5. `jobExpirationCron.js`
- İlan süresi doldu (hastaneye bildirim - otomatik)

---

## 👨‍💼 ADMİN İÇİN BİLDİRİMLER

### 1. 📧 Yeni İletişim Mesajı Bildirimi

**Fonksiyon:** `notificationService.sendSystemNotification()`

#### 1.1. İletişim Formu Mesajı Geldi
- **Gönderen:** `contactService.createContactMessage()`
- **Bildirim Türü:** `info`
- **Başlık:** "Yeni İletişim Mesajı"
- **İçerik:** `{name} ({email}) adlı kullanıcıdan yeni bir iletişim mesajı aldınız.`
- **Hedef:** Tüm admin kullanıcıları (`targetRole: 'admin'`)
- **Ek Veriler:**
  - `contact_message_id`
  - `sender_name`
  - `sender_email`
  - `subject`
- **Not:** Kullanıcılar iletişim formu üzerinden mesaj gönderdiğinde tüm aktif ve onaylı admin'lere bildirim gönderilir.

### 2. 🔔 Sistem Bildirimleri (Admin Tarafından Gönderilen)

**Fonksiyon:** `notificationService.sendAdminNotification()` veya `notificationService.sendSystemNotification()`

#### 2.1. Admin Tarafından Toplu Bildirim Gönderme
- **Gönderen:** `notificationController.sendNotification()` (Admin endpoint)
- **Bildirim Türü:** Admin tarafından belirlenir (`info`, `warning`, `success`, `error`)
- **Hedef:** 
  - `targetRole: 'doctor'` - Tüm doktorlara
  - `targetRole: 'hospital'` - Tüm hastanelere
  - `targetRole: 'admin'` - Tüm admin'lere
  - `targetRole: 'all'` - Tüm kullanıcılara
- **Not:** Admin, sistem genelinde duyuru yapmak için bu özelliği kullanabilir.

---

## 📊 BİLDİRİM TÜRLERİ ÖZETİ (GÜNCELLENMİŞ)

### Doktorlar İçin:
1. ✅ Başvuru durumu değişiklikleri (onaylandı, reddedildi, inceleniyor)
2. 💼 İş ilanı durumu değişiklikleri (kapatıldı, arşivlendi, aktif edildi)
3. 📸 Profil fotoğrafı onay/red
4. ✅ Profil güncellemeleri
5. 🔔 Sistem bildirimleri (hesap onay/red, aktif/pasif)
6. 📢 Admin tarafından gönderilen toplu bildirimler

### Hastaneler İçin:
1. 📥 Yeni başvuru bildirimi
2. ⚠️ Başvuru geri çekme bildirimi
3. 📋 İlan durumu değişiklikleri (admin tarafından: onaylandı, revizyon, reddedildi)
4. ⏰ İlan süresi doldu bildirimi (otomatik)
5. 📢 Admin tarafından gönderilen toplu bildirimler

### Adminler İçin:
1. 📧 Yeni iletişim mesajı bildirimi
2. 📢 Admin tarafından gönderilen toplu bildirimler (diğer admin'lere)

---

## 📝 NOTLAR

1. **Bildirim Türleri:**
   - `info` - Bilgilendirme
   - `success` - Başarılı işlem
   - `warning` - Uyarı
   - `error` - Hata/Red

2. **Bildirim Kanalı:**
   - Varsayılan: `inapp` (uygulama içi)
   - Gelecekte: `email`, `push` desteği eklenebilir

3. **Bildirim Verileri:**
   - Tüm bildirimler `data_json` alanında ek veriler içerir
   - Bu veriler yönlendirme için kullanılır (application_id, job_id, vb.)

4. **SSE (Server-Sent Events):**
   - Bildirimler gerçek zamanlı olarak SSE ile gönderilir
   - `sseManager.js` üzerinden yönetilir

---

## 🎯 SONUÇ

Bu analiz, doktorların, hastanelerin ve adminlerin hangi durumlarda bildirim aldıklarını detaylı olarak göstermektedir. Sistem, kullanıcıların önemli işlemlerden haberdar olmalarını sağlamak için kapsamlı bir bildirim altyapısı sunmaktadır.

### Özet:
- **Doktorlar:** Başvuru durumları, iş ilanı değişiklikleri, profil güncellemeleri ve sistem bildirimleri alır.
- **Hastaneler:** Yeni başvurular, başvuru geri çekmeleri, ilan durumu değişiklikleri ve sistem bildirimleri alır.
- **Adminler:** Yeni iletişim mesajları ve diğer admin'lerden gönderilen toplu bildirimler alır.

