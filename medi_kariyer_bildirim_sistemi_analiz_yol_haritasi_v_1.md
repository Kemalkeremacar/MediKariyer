# 🔔 MEDİKARİYER BİLDİRİM SİSTEMİ — KAPSAMLI ANALİZ + GELİŞTİRME YOL HARİTASI (v1.0)

**Sahip:** Kerem Acar  
**Tarih:** 12 Kasım 2025  
**Amaç:** Bildirim altyapısını yalnızca in‑app real‑time olmaktan çıkarıp, ölçeklenebilir, çok kanallı ve analitik destekli bir **event‑driven notification framework** hâline getirmek.

---

## 📋 İÇİNDEKİLER
1. [Sistem Genel Bakış](#sistem-genel-bakış)
2. [Bildirim Türleri ve Kategorileri](#bildirim-türleri-ve-kategorileri)
3. [Rol Bazlı Bildirim Senaryoları](#rol-bazlı-bildirim-senaryoları)
4. [Bildirim Tetikleyicileri (Detaylı)](#bildirim-tetikleyicileri-detaylı)
5. [Bildirim Görüntüleme ve Yönetimi](#bildirim-görüntüleme-ve-yönetimi)
6. [Mevcut Eksiklikler ve Sorunlar](#mevcut-eksiklikler-ve-sorunlar)
7. [Veri Modeli ve Migrasyonlar](#veri-modeli-ve-migrasyonlar)
8. [API Sözleşmesi (HTTP + SSE)](#api-sözleşmesi-http--sse)
9. [Queue Mimarisi (BullMQ)](#queue-mimarisi-bullmq)
10. [Güvenlik, Gizlilik, Yetkilendirme](#güvenlik-gizlilik-yetkilendirme)
11. [Analytics ve Raporlama](#analytics-ve-raporlama)
12. [Test Planı ve Kabul Kriterleri](#test-planı-ve-kabul-kriterleri)
13. [Aşamalı Geliştirme Planı (Fazlar + Prompts)](#aşamalı-geliştirme-planı-fazlar--prompts)
14. [Canlıya Alma ve Rollback Planı](#canlıya-alma-ve-rollback-planı)
15. [Değişiklik Günlüğü](#değişiklik-günlüğü)

---

## 🏗️ SİSTEM GENEL BAKIŞ

### Mimari Diyagram (Özet)
```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                         │
├─────────────────────────────────────────────────────────────┤
│  • NotificationsPage.jsx (kullanıcı)                        │
│    └─ NotificationCard (inline)                             │
│  • AdminNotificationsPage.jsx (admin)                       │
│  • NavbarNotificationBell.jsx (components/layout)           │
│  • useNotifications.js (React Query hooks + SSE)            │
│    └─ useNotificationStream() (SSE real-time)               │
└─────────────────────────────────────────────────────────────┘
                            ↕️ HTTP API + SSE
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js/Express)                │
├─────────────────────────────────────────────────────────────┤
│  Routes: notificationRoutes.js                              │
│    ├─ GET /notifications/stream (SSE endpoint)              │
│    └─ GET/POST/PUT/DELETE ...                               │
│  Controllers: notificationController.js                     │
│    ├─ streamNotifications() (SSE)                           │
│    └─ normalizeNotification()                               │
│  Services: notificationService.js                           │
│    ├─ sendNotification() (SSE + persist)                    │
│    ├─ sendDoctorNotification()                              │
│    └─ sendHospitalNotification()                            │
│  Utils: sseManager.js (SSE client yönetimi)                 │
│  Queue (ileride): BullMQ notificationQueue + worker         │
│  DB: SQL Server — notifications, notification_settings, ... │
└─────────────────────────────────────────────────────────────┘
```

### Mevcut `notifications` Şeması (Özet)
- `id` (PK, identity)
- `user_id` (FK → users.id)
- `type` (`info|success|warning|error`)
- `title` (nvarchar 255)
- `body` (nvarchar max)
- `data_json` (nvarchar max)
- `channel` (`inapp`)
- `read_at` (datetime2, null=okunmamış)
- `created_at` (datetime2)

**Kanal Durumu:** ✅ in‑app (SSE) • ❌ e‑posta • ❌ push • ❌ SMS

---

## 📊 BİLDİRİM TÜRLERİ VE KATEGORİLERİ
- **Type:** `info`, `success`, `warning`, `error`
- **Kategori (data_json türevi):** `application_status`, `job_status`, `system_announcement`, `contact_message`, `photo_approval`, `user_approval`

---

## 👥 ROL BAZLI BİLDİRİM SENARYOLARI
- **Doktor:** Başvuru durumu, ilan durumu, foto onay/red, (ops.) profil güncelleme
- **Hastane:** Yeni başvuru, başvuru geri çekme, ilan onay/red/revizyon, ilan süresi dolumu
- **Admin:** İletişim mesajı, manuel sistem bildirimi gönderme

> Kod konumları ve örnek payload’lar rapordaki senaryolarla uyumludur.

---

## 🎯 BİLDİRİM TETİKLEYİCİLERİ (DETAYLI)
Özet tablo mevcut rapordakiyle aynıdır; **tamamlananlar** ve **eksikler** net olarak işaretlenmiştir (bkz. [Kalan Eksiklikler](#mevcut-eksiklikler-ve-sorunlar)).

---

## 📱 BİLDİRİM GÖRÜNTÜLEME VE YÖNETİMİ
- **NavbarNotificationBell:** unread badge + dropdown (SSE ile anlık)
- **NotificationsPage:** filtreler (okunmuş/okunmamış, type), sayfalama, toplu okundu
- **AdminNotificationsPage:** admin’e gelenler, sayfalama, tip bazlı görsel durum
- **NotificationCard:** type icon, TR tarih formatı, okundu durum stil farkı

---

## ❌ MEVCUT EKSİKLİKLER VE SORUNLAR
1) **Admin → Kullanıcı:** onay/aktif/pasif bildirimleri eksik  
2) **Tercihler:** kullanıcı bazlı bildirim ayarları yok  
3) **Kanallar:** e‑posta/push yok  
4) **Gruplama & Öncelik:** yok  
5) **Analytics & Arşiv:** yok

---

## 🧱 VERİ MODELİ VE MİGRASYONLAR

### 1) `notifications` genişletme (öncelik, grupla, arşiv)
```sql
ALTER TABLE dbo.notifications
  ADD priority VARCHAR(20) NOT NULL DEFAULT 'normal',
      group_id NVARCHAR(100) NULL,
      is_archived BIT NOT NULL DEFAULT 0;
-- priority: 'urgent' | 'high' | 'normal' | 'low'
```

### 2) `notification_settings` (kullanıcı tercihleri)
```sql
CREATE TABLE dbo.notification_settings (
  id INT IDENTITY(1,1) PRIMARY KEY,
  user_id INT NOT NULL FOREIGN KEY REFERENCES dbo.users(id),
  notification_type VARCHAR(50) NOT NULL, -- application_status, job_status, ...
  inapp_enabled BIT NOT NULL DEFAULT 1,
  email_enabled BIT NOT NULL DEFAULT 0,
  push_enabled BIT NOT NULL DEFAULT 0,
  created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
  updated_at DATETIME2 NULL
);
CREATE INDEX IX_notification_settings_user_type
  ON dbo.notification_settings(user_id, notification_type);
```

### 3) `notification_reads` (okunma/etkileşim analitiği)
```sql
CREATE TABLE dbo.notification_reads (
  id INT IDENTITY(1,1) PRIMARY KEY,
  notification_id INT NOT NULL FOREIGN KEY REFERENCES dbo.notifications(id),
  user_id INT NOT NULL FOREIGN KEY REFERENCES dbo.users(id),
  read_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);
CREATE INDEX IX_notification_reads_user_time
  ON dbo.notification_reads(user_id, read_at DESC);
```

---

## 🔌 API SÖZLEŞMESİ (HTTP + SSE)

### HTTP Endpoints (öneri)
- `GET /api/notifications?status=unread|all&type=info|...&page=1&limit=20`
- `GET /api/notifications/unread-count`
- `POST /api/notifications/:id/read`
- `POST /api/notifications/read-all`
- `DELETE /api/notifications/:id`
- `GET /api/notifications/settings`
- `PUT /api/notifications/settings` (JSON body: type bazlı inapp/email/push)
- `POST /api/notifications/send` (admin manuel gönderim)

### SSE
- `GET /api/notifications/stream`  
**Event payload örneği:**
```json
{
  "id": 10293,
  "type": "info",
  "title": "Yeni Başvuru Aldınız",
  "body": "\"Kardiyoloji Uzmanı\" ilanı için ...",
  "data": {"application_id": 55, "job_id": 12},
  "created_at": "2025-11-12T14:21:01Z",
  "isRead": false
}
```

---

## 🧵 QUEUE MİMARİSİ (BullMQ)
- **Queues:** `notifications:send` (primary), `notifications:failed` (DLQ)
- **Retry & Backoff:** 5 deneme, exponential backoff (1000ms base)
- **Concurrency:** worker başına 5–10
- **Observability:** job lifecycle log (info), errors (warn), metrics (counts)

**Worker iskeleti:**
```js
// notificationWorker.js
queue.process('send', 10, async (job) => {
  const payload = job.data; // normalized notification
  await sendAndPersistNotification(payload);
});
```

---

## 🔐 GÜVENLİK, GİZLİLİK, YETKİLENDİRME
- **RBAC:** kullanıcı kendi bildirimini görür; admin kısıtlı query (role/tenant)
- **Veri asgariyet:** `data_json` içinde PII minimal
- **Rate limit:** send endpoint’leri için IP + user bazlı
- **Audit log:** admin manuel bildirimleri aksiyon log’una yazılır

---

## 📈 ANALYTICS VE RAPORLAMA
- **KPI’lar:** gönderim sayısı, okuma oranı, okuma süresi medyanı, tıklanma/verim
- **Kesitler:** role, type, kanal, priority, job_id/application_id bazlı
- **Admin Dashboard:** küçük kartlar + zaman serisi grafik (Recharts)

---

## 🧪 TEST PLANI VE KABUL KRİTERLERİ
- **Unit:** service/normalizer/mapper fonksiyonları
- **Integration:** SSE akışı, unread count güncellenmesi
- **E2E:** bir başvuru → hastane anlık bildirim; status update → doktora bildirim
- **Geriye uyumluluk:** normalize + fallback alanları (isRead/createdAt/message)

---

## 🚀 AŞAMALI GELİŞTİRME PLANı (FAZLAR + PROMPTS)

### ⚙️ FAZ 1 — Eksik Senaryoları Tamamlama
**Hedefler**
- Admin → Kullanıcı bildirimleri: `updateUserApproval`, `activateUser`, `deactivateUser`
- Hatalar `logger.warn` ile yakalansın; ana akış durmasın
- Bildirim log’ları: `user_id`, `action`, `timestamp`

**Kabul Kriterleri**
- [ ] Üç fonksiyonda uygun `type/title/body/data` ile bildirim gönderiliyor
- [ ] SSE ile gerçek zamanlı akış var
- [ ] Log’larda olay izi mevcut

**AI Prompt**
```text
notificationService içine admin işlemleri için `sendUserStatusNotification(userId, action)` fonksiyonu ekle.
`action` → `approved|approval_removed|activated|deactivated`.
`adminService.js` içinde `updateUserApproval/activateUser/deactivateUser` fonksiyonlarına try-catch ile entegre et.
Hata durumunda `logger.warn` çağır, ana işlem devam etsin.
Değişecek dosyalar: adminService.js, notificationService.js, logger.js.
```

---

### 🧩 FAZ 2 — Bildirim Ayarları ve Tercihler
**Hedefler**
- `notification_settings` tablosu
- `GET/PUT /api/notifications/settings`
- React’te `/settings/notifications` sayfası (toggle’lar)

**Kabul Kriterleri**
- [ ] Migration ve indeksler hazır
- [ ] API uçları yetkilendirmeli çalışıyor
- [ ] UI tercihleri kaydedip geri yüklüyor

**AI Prompt**
```text
`notification_settings` tablosunu oluştur (user_id + notification_type benzersiz indeks öner).
`notificationController` içine `getSettings` ve `updateSettings` endpointlerini ekle.
React’te `NotificationSettingsPage.jsx` oluştur;
`in-app`, `email`, `push` için üç toggle koy ve backend ile senkronize et.
```

---

### 🔔 FAZ 3 — Event Queue (Redis / BullMQ)
**Hedefler**
- Gönderimler async kuyruğa taşınsın; worker işlesin
- Retry/backoff ve DLQ tanımlı

**Kabul Kriterleri**
- [ ] `notificationQueue.add('send', payload)` çağrılıyor
- [ ] Worker başarıyla DB persist + SSE yapıyor
- [ ] Retry/backoff testleri geçti

**AI Prompt**
```text
BullMQ kur. `notificationQueue.js` ve `notificationWorker.js` dosyalarını ekle.
`sendNotification()` fonksiyonunu job üreticiye çevir; asıl gönderim worker’da olsun.
Retry=5, backoff=exponential 1000ms. Başarısız işler DLQ’ya.
Başlıca loglar `queueLogger.js`.
```

---

### 💌 FAZ 4 — E‑posta ve Push Entegrasyonu
**Hedefler**
- Önemli durumlar için e‑posta
- Tarayıcı Push (Web Push API, VAPID)
- Tercihlerle entegre (email_enabled / push_enabled)

**Kabul Kriterleri**
- [ ] `emailService.sendNotificationEmail()` çalışıyor (EJS şablon)
- [ ] `webpushService.js` VAPID ile push gönderiyor
- [ ] Tercihlere göre kanal seçimi yapılıyor

**AI Prompt**
```text
`emailService.js` içinde `sendNotificationEmail(to, subject, model, template)` ekle; şablonları `views/notifications/emailTemplates/` altından yükle.
`webpushService.js` ile VAPID keys `.env`’den gelsin, subscription kayıt & gönderim fonksiyonları eklensin.
`notificationService` kanal seçiminde kullanıcı tercihlerini oku.
```

---

### 📊 FAZ 5 — Analytics, Gruplama ve Arşivleme
**Hedefler**
- `notification_reads` ile okunma takibi
- `group_id` bazlı grupla; `is_archived` ile arşivle
- Admin mini dashboard (Recharts)

**Kabul Kriterleri**
- [ ] Okunma event’i kaydı
- [ ] Aynı iş/ilan için gruplanmış liste dönebilme
- [ ] Admin analytics endpoint + UI kartı

**AI Prompt**
```text
`notification_reads` tablosunu oluştur; `trackReadEvent(notificationId, userId)` ekle.
`groupNotifications(notifications)` ile aynı `type+job_id` anahtarı üzerinden grupla.
Admin için `/admin/analytics/notifications` endpointi ve `NotificationsAnalyticsCard` bileşeni yaz.
```

---

### 📈 FAZ 6 — Tam Otomatik Event‑Driven Framework
**Hedefler**
- `eventBus.js` (Node EventEmitter) global
- Servisler `eventBus.emit('application.created', payload)` kullanır
- `eventListeners/notificationListener.js` dinleyiciler bildirimi üretir

**Kabul Kriterleri**
- [ ] Doğrudan servis çağrıları yerine event yayını
- [ ] Bildirim oluşturma dinleyici tarafında
- [ ] Unit test’ler (emit/on) başarılı

**AI Prompt**
```text
`eventBus.js` singleton EventEmitter oluştur; tipli event isimleri: `application.created`, `user.approved`, `job.expired`.
Bildirim mantığını `eventListeners/notificationListener.js` dosyasına taşı.
Servislerde doğrudan `notificationService` çağırma; bunun yerine `eventBus.emit(eventName, data)`.
```

---

## 🚢 CANLIYA ALMA VE ROLLBACK PLANI
- **Blue/Green:** SSE endpoint ve yeni alanlar geriye dönük uyumlu
- **Feature flag:** email/push kapalı başlayıp aşamalı açılır
- **Rollback:** schema değişiklikleri `is_archived` gibi non‑breaking; queue devre dışı bırakılabilir

---

## 🗒️ DEĞİŞİKLİK GÜNLÜĞÜ
- **v1.0 (2025‑11‑12):** Analiz+Yol Haritası ilk sürüm; faz‑bazlı AI prompt’lar eklendi.

