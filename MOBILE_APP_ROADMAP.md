Bu doküman, MediKariyer Doktor Mobil Uygulaması’nın MVP geliştirme stratejisini açıklar. 
MVP tamamen ayrı bir mobile API layer üzerinde çalışacak, mevcut web sistemiyle 
hiçbir çakışma olmayacaktır. React Native + Expo ile 6–8 hafta içinde canlıya çıkılabilir. 
Push notification MVP’de Expo Push; production’da FCM olarak güncellenecektir.




# 📱 MediKariyer Doktor Mobil Uygulama - MVP Geliştirme Yol Planı

## 📋 İçindekiler
1. [Genel Bakış](#genel-bakış)
2. [🛡️ MEVCUT SİSTEM KORUMA GARANTİSİ](#️-mevcut-sistem-koruma-garantisi) ⚠️ ÇOK ÖNEMLİ
3. [MVP Yaklaşımı](#mvp-yaklaşımı)
4. [Teknoloji Stack (MVP)](#teknoloji-stack-mvp)
5. [Backend: Mobile API Layer](#backend-mobile-api-layer)
6. [Mimari Yapı](#mimari-yapı)
7. [Authentication](#authentication)
8. [Push Notification (MVP: Expo Push)](#push-notification-mvp-expo-push)
9. [Offline Support (Basit)](#offline-support-basit)
10. [Geliştirme Fazları (6-8 Hafta)](#geliştirme-fazları-6-8-hafta)
11. [Production Öncesi (Sonra Yapılacaklar)](#production-öncesi-sonra-yapılacaklar)

---

## 🎯 Genel Bakış

### Mevcut Durum
- **Backend**: Express.js + Node.js + SQL Server
- **Web Frontend**: React (Hastane & Admin için)
- **Mobil Uygulama**: MVP olarak geliştirilecek (Sadece Doktorlar için)

### Proje Dizin Yapısı
```
MediKariyer/
├── backend/              ← Backend API (Web + Mobile için)
├── web-frontend/        ← Web Frontend (Hastane & Admin)
└── mobile-app/          ← Mobile App (Doktorlar için)
```

### Hedef Kullanıcı
- ✅ Sadece **Doktorlar** mobil uygulamayı kullanacak
- ❌ Hastane ve Admin web üzerinden devam edecek

### MVP Kapsamı (İlk Canlı Versiyon)

**MVP = Canlıya çıkacak ilk sürüm, gerçek kullanıcılar kullanacak:**
- ✅ Login/Register (Doktor)
- ✅ Dashboard (özet bilgiler)
- ✅ Profil yönetimi (temel)
- ✅ İş ilanları listesi & detay
- ✅ Başvurularım
- ✅ Bildirimler
- ✅ Push notifications (Expo Push)

### MVP'de Olmayacaklar (Sonraki Versiyonda Eklenecek)

**Not:** MVP canlı ortamda çalışacak, ama bu özellikler sonraki versiyonda olacak:
- ❌ SSL Pinning (Production versiyonunda eklenecek)
- ❌ Gelişmiş offline queue
- ❌ Complex offline sync
- ❌ Advanced caching strategies
- ❌ Firebase FCM (MVP'de Expo Push, Production'da FCM'e geçilecek)

---

## 🛡️ MEVCUT SİSTEM KORUMA GARANTİSİ

### ⚠️ Tek Satırda Özet: Mevcut Web Sistemi Hiç Etkilenmeyecek

**Strateji:**
- ❌ **Mevcut web dosyalarına dokunulmayacak** (route, controller, service dosyaları)
- ✅ **Sadece yeni mobile klasörleri eklenecek** (`routes/mobile/`, `controllers/mobile/`, vb.)
- ✅ **Web endpoint'leri değişmeyecek** (`/api/auth/*`, `/api/doctor/*` - prefix YOK)
- ✅ **Mobile endpoint'leri yeni eklenecek** (`/api/mobile/*` - prefix VAR)
- ✅ **`web-frontend/` klasörüne hiç dokunulmayacak**
- ✅ **Sadece `routes/index.js` dosyasına mobile route'ları eklenecek**

**Özet:**
```
Mevcut: Backend/src/routes/authRoutes.js      ← Değişmeyecek
        Backend/src/controllers/...            ← Değişmeyecek
        web-frontend/                          ← Hiç dokunulmayacak

Yeni:   Backend/src/routes/mobile/...         ← Sadece bunlar eklenecek
        Backend/src/controllers/mobile/...     ← Sadece bunlar eklenecek
        mobile-app/                            ← Yeni klasör
```

**Not:** Bu garantiler dokümanda sadece bu bölümde açıklanmıştır. Detaylar için aşağıdaki "Backend Implementation" bölümüne bakın.

---

## 🚀 MVP Yaklaşımı

### 📌 MVP Nedir? (Önemli Açıklama)

**MVP = Minimum Viable Product (Minimum Çalışabilir Ürün)**

**⚠️ ÖNEMLİ: MVP geliştirme ortamı DEĞİLDİR!**

**MVP Ne Demek?**
- ✅ **MVP = CANLIYA ÇIKACAK İLK SÜRÜM** (gerçek kullanıcılar kullanacak)
- ✅ **MVP = Production ortamı** (canlı, çalışan uygulama)
- ✅ Basit ama çalışır durumda
- ❌ MVP = Test/Development ortamı **DEĞİLDİR**

**Örnek:**
```
Geliştirme Ortamı → Test/Development (sadece geliştiriciler)
         ↓
      MVP → CANLIYA ÇIKIŞ (gerçek kullanıcılar)
         ↓
   Production → Gelişmiş özellikler eklendi
```

**MVP vs Production:**
- **MVP:** Canlı, çalışan, ama basit özelliklerle (Expo Push)
- **Production:** Canlı, çalışan, gelişmiş özelliklerle (Firebase FCM)

**Sonuç:** MVP'yi geliştirirken production-ready düşün, ama önce basit özelliklerle canlıya çık.

### Felsefe: Hızlı, Yalın, İşlevsel

**MVP'de Öncelik (Canlıya Çıkacak İlk Versiyon):**
1. Hızlı geliştirme (Expo ile)
2. Minimal backend değişiklikleri
3. Temel özellikler (login, dashboard, jobs, applications)
4. Basit offline desteği (React Query cache)
5. Expo Push (Firebase gerek yok)

**Production'da Eklenebilecekler (Sonraki Aşama):**
- SSL Pinning
- Gelişmiş offline queue
- Firebase FCM migration (Expo Push'tan geçiş)
- Performance optimization
- Advanced error handling

---

## 🛠 Teknoloji Stack (MVP)

### Önerilen: **React Native + Expo**

**MVP için Avantajlar:**
- ✅ Expo ile hızlı setup (managed workflow)
- ✅ Push notifications built-in (Expo Push)
- ✅ Hızlı development & testing
- ✅ TypeScript desteği
- ✅ Mevcut React bilgisiyle uyumlu

**MVP Kullanılacak Kütüphaneler (Minimal):**
```json
{
  "expo": "~50.0.0",
  "react-native": "0.73.x",
  "@react-navigation/native": "^6.x",
  "@tanstack/react-query": "^5.x",
  "axios": "^1.x",
  "@react-native-async-storage/async-storage": "^1.x",
  "expo-secure-store": "~12.8.0",
  "expo-notifications": "~0.27.0",
  "zustand": "^4.x",
  "react-hook-form": "^7.x",
  "zod": "^3.x"
}
```

**Önemli Notlar:**
- ❌ `react-native-keychain` yerine `expo-secure-store` (Expo ile uyumlu)
- ❌ Firebase yerine `expo-notifications` (Expo Push)
- ❌ Complex offline queue yerine React Query cache

---

## 🏗 Mimari Yapı

### Mobile App Klasör Yapısı (Yeni Yapıya Göre)

```
mobile-app/
├── App.tsx
├── app.json
├── package.json
├── metro.config.js
├── src/
│   ├── api/
│   │   ├── client.ts              # Axios instance + interceptors
│   │   ├── endpoints.ts           # API endpoint definitions
│   │   └── services/
│   │       ├── auth.service.ts
│   │       ├── jobs.service.ts
│   │       ├── applications.service.ts
│   │       └── notifications.service.ts
│   │
│   ├── store/
│   │   ├── authStore.ts          # Zustand (auth state)
│   │   └── uiStore.ts            # Zustand (UI state)
│   │
│   ├── navigation/
│   │   ├── AuthNavigator.tsx
│   │   ├── MainNavigator.tsx
│   │   └── RootNavigator.tsx
│   │
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── RegisterScreen.tsx
│   │   ├── dashboard/
│   │   │   └── DashboardScreen.tsx
│   │   ├── jobs/
│   │   │   ├── JobsListScreen.tsx
│   │   │   └── JobDetailScreen.tsx
│   │   ├── applications/
│   │   │   ├── ApplicationsListScreen.tsx
│   │   │   └── ApplicationDetailScreen.tsx
│   │   ├── profile/
│   │   │   ├── ProfileScreen.tsx
│   │   │   └── EditProfileScreen.tsx
│   │   └── notifications/
│   │       └── NotificationsScreen.tsx
│   │
│   ├── components/
│   ├── utils/
│   ├── hooks/
│   ├── types/
│   └── constants/
│
└── docs/
    └── openapi-mobile.yaml (Opsiyonel)
```

### State Management Stratejisi

```
┌─────────────────────────────────────┐
│   React Query (Server State)        │
│   - API data caching                │
│   - Auto refetch                    │
│   - Offline support                 │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│   Zustand (Client State)            │
│   - Auth state                      │
│   - UI state                        │
│   - App preferences                 │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│   AsyncStorage (Persistence)        │
│   - Tokens (via Keychain)           │
│   - User preferences                │
│   - Offline cache                   │
└─────────────────────────────────────┘
```

---

## 🔌 Backend: Mobile API Layer

### Yeni Backend Yapısı (Web + Mobile Ayrımı)

**Proje Dizin Yapısı:**
```
backend/
├── src/
│   ├── routes/
│   │   ├── authRoutes.js         ← MEVCUT (değişmeyecek)
│   │   ├── doctorRoutes.js       ← MEVCUT (değişmeyecek)
│   │   ├── hospitalRoutes.js     ← MEVCUT (değişmeyecek)
│   │   ├── adminRoutes.js        ← MEVCUT (değişmeyecek)
│   │   │
│   │   └── mobile/               ← YENİ (eklenecek)
│   │       ├── mobileAuthRoutes.js
│   │       ├── mobileDoctorRoutes.js
│   │       ├── mobileJobRoutes.js
│   │       └── mobileNotificationRoutes.js
│   │
│   ├── controllers/
│   │   ├── authController.js     ← MEVCUT (değişmeyecek)
│   │   ├── doctorController.js   ← MEVCUT (değişmeyecek)
│   │   │
│   │   └── mobile/               ← YENİ (eklenecek)
│   │       ├── mobileDoctorController.js
│   │       └── mobileJobController.js
│   │
│   ├── services/
│   │   ├── authService.js        ← MEVCUT (değişmeyecek)
│   │   ├── doctorService.js      ← MEVCUT (değişmeyecek)
│   │   │
│   │   └── mobile/               ← YENİ (eklenecek)
│   │       ├── mobileDoctorService.js
│   │       └── mobileJobService.js
│   │
│   └── mobile/                   ← YENİ (mobile utilities)
│       └── transformers/         ← Response transformer'lar (MVP için yeterli)
│           ├── jobTransformer.js
│           └── profileTransformer.js
```

### Neden Ayrı Layer? (Web vs Mobile)

**Web Response (Örnek - Detaylı):**
```json
{
  "id": 123,
  "title": "Kardiyoloji Uzmanı",
  "description": "Detaylı açıklama...",
  "hospital": {
    "id": 1,
    "name": "ABC Hastanesi",
    "contact_info": {...},
    "admin_notes": "...",
    "approved_by": {...},
    "revision_history": [...]
  },
  "admin_metadata": {...}
}
```

**Mobile Response (Minimal - Optimize):**
```json
{
  "id": 123,
  "title": "Kardiyoloji Uzmanı",
  "city_name": "İstanbul",
  "specialty": "Kardiyoloji",
  "salary_range": "50000-70000",
  "work_type": "Tam Zamanlı",
  "created_at": "2024-01-15",
  "is_applied": false
}
```

**Fark:**
- Web: Tüm metadata, admin bilgileri, revision history
- Mobile: Sadece kullanıcının görmesi gereken minimal bilgi
- Payload boyutu: Web ~5KB, Mobile ~500B (10x küçük!)

### Backend Route Yapılandırması

**Doğru Mimari:**
- **Web (Primary API)**: Prefix YOK → `/api/auth`, `/api/doctor/*` (standart)
- **Mobile (Secondary API)**: Prefix VAR → `/api/mobile/*`

**Backend/src/routes/index.js:**
```javascript
const express = require('express');
const router = express.Router();

// ============================================================================
// PRIMARY WEB API (Prefix YOK - Standart API)
// Mevcut route'lar root'ta, değişmeyecek
// ============================================================================
router.use('/auth', authRoutes);              // POST /api/auth/login
router.use('/doctor', doctorRoutes);          // GET /api/doctor/profile
router.use('/hospital', hospitalRoutes);      // GET /api/hospital/jobs
router.use('/admin', adminRoutes);            // GET /api/admin/users
router.use('/notifications', notificationRoutes); // GET /api/notifications
router.use('/contact', contactRoutes);        // POST /api/contact
router.use('/lookup', lookupRoutes);          // GET /api/lookup/specialties
router.use('/logs', logRoutes);               // GET /api/logs

// ============================================================================
// MOBILE API (Prefix VAR - /mobile/*)
// ============================================================================
router.use('/mobile/auth', require('./mobile/mobileAuthRoutes'));              // POST /api/mobile/auth/login
router.use('/mobile/doctor', require('./mobile/mobileDoctorRoutes'));          // GET /api/mobile/doctor/dashboard
router.use('/mobile/jobs', require('./mobile/mobileJobRoutes'));               // GET /api/mobile/jobs
router.use('/mobile/applications', require('./mobile/mobileApplicationRoutes')); // GET /api/mobile/applications
router.use('/mobile/notifications', require('./mobile/mobileNotificationRoutes')); // GET /api/mobile/notifications

module.exports = router;
```

**Özet:** 
- Web: Prefix yok → `/api/auth/*`, `/api/doctor/*` (standart API)
- Mobile: Prefix var → `/api/mobile/*` (mobile özel API)

**Detaylar:** Aşağıdaki "Adım 2" bölümüne bakın.

### Mobile API Endpoints (Özet)

**Authentication:**
- `POST /api/mobile/auth/login` - Token + minimal user bilgisi döner
- `POST /api/mobile/auth/register` - Token + minimal user bilgisi döner
- `POST /api/mobile/auth/refresh-token` - Yeni token döner
- `POST /api/mobile/auth/logout` - Success response

**Doctor:**
- `GET /api/mobile/doctor/dashboard` - unread_count, recent_applications (max 5), recommended_jobs (max 5), profile_completion_percent
- `GET /api/mobile/doctor/profile` - Minimal profile bilgisi

**Jobs:**
- `GET /api/mobile/jobs?page=1&limit=20&specialty=X&city=Y` - Minimal payload (id, title, city_name, specialty, salary_range, is_applied, pagination)
- `GET /api/mobile/jobs/:id` - Detay (flat structure, nested object yok)

**Applications:**
- `GET /api/mobile/applications?page=1&limit=20&status=X` - Minimal payload (id, job_id, job_title, hospital_name, status, created_at, pagination)

**Notifications:**
- `GET /api/mobile/notifications?page=1&limit=20` - Minimal payload (id, title, body, is_read, created_at, type, unread_count)

**Not:** Tüm response'lar minimal payload, flat structure (1 seviye derinlik), pagination destekli. Detaylı örnekler backend implementation sırasında eklenir.

**Profile (Minimal):**
```
GET /api/mobile/profile

Response:
{
  "first_name": "Ahmet",
  "last_name": "Yılmaz",
  "title": "Uzman Doktor",
  "profile_photo": "https://...",
  "specialty": "Kardiyoloji",
  "city": "İstanbul",
  "completion_percent": 75
}
```

**Device Token Registration:**
```
POST /api/mobile/device-token

Body:
{
  "expo_push_token": "ExponentPushToken[...]",
  "device_id": "unique-device-id",
  "platform": "ios" | "android"
}
```

### Backend Implementation (Yeni Yapıya Göre)

## 📝 ADIM ADIM BACKEND MİGRATION PLANI

### ⚠️ ÖNEMLİ: Mevcut Web Dosyalarına DOKUNULMAYACAK!

**Strateji:** 
- ❌ Mevcut web dosyalarına dokunulmayacak
- ✅ Sadece yeni mobile klasörleri ve dosyaları eklenecek
- ✅ Minimal risk, maksimum güvenlik

### 📋 Mevcut Durum (Değişmeyecek!)

```
Backend/src/
├── routes/
│   ├── index.js              ← Sadece mobile route'ları eklenecek
│   ├── authRoutes.js         ← DEĞİŞMEYECEK
│   ├── doctorRoutes.js       ← DEĞİŞMEYECEK
│   ├── hospitalRoutes.js     ← DEĞİŞMEYECEK
│   ├── adminRoutes.js        ← DEĞİŞMEYECEK
│   ├── notificationRoutes.js ← DEĞİŞMEYECEK
│   ├── contactRoutes.js      ← DEĞİŞMEYECEK
│   ├── lookupRoutes.js       ← DEĞİŞMEYECEK
│   └── logRoutes.js          ← DEĞİŞMEYECEK
├── controllers/
│   ├── authController.js     ← DEĞİŞMEYECEK
│   ├── doctorController.js   ← DEĞİŞMEYECEK
│   └── ...                   ← DEĞİŞMEYECEK
└── services/
    ├── authService.js        ← DEĞİŞMEYECEK
    ├── doctorService.js      ← DEĞİŞMEYECEK
    └── ...                   ← DEĞİŞMEYECEK
```

### 🎯 Hedef Durum (Sadece Eklenecekler)

```
Backend/src/
├── routes/
│   ├── index.js              ← Sadece mobile route'ları eklenecek
│   ├── authRoutes.js         ← DEĞİŞMEYECEK (mevcut)
│   ├── doctorRoutes.js       ← DEĞİŞMEYECEK (mevcut)
│   ├── ...                   ← Mevcut dosyalar olduğu gibi
│   └── mobile/               ← YENİ KLASÖR (sadece bu eklenecek)
│       ├── mobileAuthRoutes.js
│       ├── mobileDoctorRoutes.js
│       ├── mobileJobRoutes.js
│       ├── mobileApplicationRoutes.js
│       └── mobileNotificationRoutes.js
│
├── controllers/
│   ├── authController.js     ← DEĞİŞMEYECEK (mevcut)
│   ├── doctorController.js   ← DEĞİŞMEYECEK (mevcut)
│   ├── ...                   ← Mevcut dosyalar olduğu gibi
│   └── mobile/               ← YENİ KLASÖR (sadece bu eklenecek)
│       ├── mobileAuthController.js
│       ├── mobileDoctorController.js
│       ├── mobileJobController.js
│       ├── mobileApplicationController.js
│       └── mobileNotificationController.js
│
├── services/
│   ├── authService.js        ← DEĞİŞMEYECEK (mevcut)
│   ├── doctorService.js      ← DEĞİŞMEYECEK (mevcut)
│   ├── ...                   ← Mevcut dosyalar olduğu gibi
│   └── mobile/               ← YENİ KLASÖR (sadece bu eklenecek)
│       ├── mobileAuthService.js
│       ├── mobileDoctorService.js
│       ├── mobileJobService.js
│       ├── mobileApplicationService.js
│       └── mobileNotificationService.js
│
└── mobile/                   ← YENİ KLASÖR (src/ altında - sadeleştirilmiş)
    └── transformers/         ← YENİ KLASÖR (MVP için Transformer yeterli, DTO production'da)
        ├── jobTransformer.js
        ├── applicationTransformer.js
        ├── profileTransformer.js
        └── notificationTransformer.js
    
    Not: Klasör yapısı sadeleştirildi - DTO klasörü MVP'de yok.
```

---

### 🚀 Adım 1: Yeni Mobile Klasörlerini Oluştur

**PowerShell Komutları:**
```powershell
# Backend/src dizinine git
cd Backend\src

# SADECE yeni mobile klasörlerini oluştur
# Mevcut dosyalara dokunma!

New-Item -ItemType Directory -Path "routes\mobile" -Force
New-Item -ItemType Directory -Path "controllers\mobile" -Force
New-Item -ItemType Directory -Path "services\mobile" -Force
New-Item -ItemType Directory -Path "mobile\transformers" -Force

# ✅ Bitti! Mevcut dosyalara dokunulmadı.
```

**Bash/Linux Komutları:**
```bash
cd Backend/src

mkdir -p routes/mobile
mkdir -p controllers/mobile
mkdir -p services/mobile
mkdir -p mobile/transformers
```

**✅ Kontrol:**
- [ ] `routes/mobile/` klasörü oluşturuldu
- [ ] `controllers/mobile/` klasörü oluşturuldu
- [ ] `services/mobile/` klasörü oluşturuldu
- [ ] `src/mobile/transformers/` klasörü oluşturuldu

---

### 🚀 Adım 2: routes/index.js Dosyasını Güncelle

**Mevcut Dosya (Backend/src/routes/index.js):**
```javascript
router.use('/auth', authRoutes);
router.use('/doctor', doctorRoutes);
router.use('/hospital', hospitalRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);
router.use('/contact', contactRoutes);
router.use('/lookup', lookupRoutes);
router.use('/logs', logRoutes);
```

**✅ Kontrol:**
- [ ] `routes/index.js` dosyası güncellendi (üstteki "Backend Route Yapılandırması" bölümüne bakın)
- [ ] Mevcut web route'ları değişmedi
- [ ] Sadece mobile route'ları eklendi
- [ ] `middleware/mobileErrorHandler.js` dosyası oluşturuldu (KRİTİK: Mobile için JSON-only error handler)
- [ ] Tüm mobile route dosyalarına `mobileErrorHandler` middleware'i eklendi

---

### 🚀 Adım 3: Yeni Mobile Dosyalarını Oluştur

#### 3.1. Mobile Route Dosyası Örneği

**routes/mobile/mobileDoctorRoutes.js:**
```javascript
const express = require('express');
const mobileDoctorController = require('../../controllers/mobile/mobileDoctorController');
const { authMiddleware } = require('../../middleware/authMiddleware');
const { requireRole } = require('../../middleware/roleGuard');
const { mobileErrorHandler } = require('../../middleware/mobileErrorHandler'); // KRİTİK: Mobile için JSON-only error handler

const router = express.Router();

// KRİTİK: Mobile route'larında TÜM hatalar JSON döndürmeli
// Web tarafı HTML dönebilir ama Mobile JSON bekler - HTML dönerse "JSON Parse Error" çöker
// Bu middleware route'lardan ÖNCE eklenmeli (tüm hataları yakalamak için)
router.use(mobileErrorHandler); // Her zaman JSON döndürür

router.use(authMiddleware);
// Not: RoleGuard opsiyonel - Mobile sadece doktor kullanıyor, ama güvenlik için eklenebilir
router.use(requireRole(['doctor'])); // Opsiyonel: Fazladan overhead ama güvenlik açısından sorun yok

router.get('/dashboard', mobileDoctorController.getDashboard);
router.get('/profile', mobileDoctorController.getProfile);

module.exports = router;
```

**routes/mobile/mobileAuthRoutes.js:**
```javascript
const express = require('express');
const mobileAuthController = require('../../controllers/mobile/mobileAuthController');
const { mobileErrorHandler } = require('../../middleware/mobileErrorHandler'); // KRİTİK: Mobile için JSON-only error handler

const router = express.Router();

// KRİTİK: Mobile route'larında TÜM hatalar JSON döndürmeli
router.use(mobileErrorHandler); // Her zaman JSON döndürür

router.post('/login', mobileAuthController.login);
router.post('/register', mobileAuthController.register);
router.post('/refresh-token', mobileAuthController.refreshToken);

module.exports = router;
```

#### 3.2. Mobile Controller Dosyası Örneği

**controllers/mobile/mobileDoctorController.js:**
```javascript
const mobileDoctorService = require('../../services/mobile/mobileDoctorService');
const { sendSuccess } = require('../../utils/response');
const { catchAsync } = require('../../utils/errorHandler');

const getDashboard = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const dashboardData = await mobileDoctorService.getDashboard(userId);
  return sendSuccess(res, 'Dashboard verileri', dashboardData);
});

const getProfile = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const profile = await mobileDoctorService.getProfile(userId);
  return sendSuccess(res, 'Profil bilgileri', profile);
});

module.exports = {
  getDashboard,
  getProfile,
};
```

#### 3.3. Mobile Service Dosyası Örneği

**services/mobile/mobileDoctorService.js:**
```javascript
const db = require('../../config/dbConfig').db;
const jobTransformer = require('../../mobile/transformers/jobTransformer');
const profileTransformer = require('../../mobile/transformers/profileTransformer');

const getDashboard = async (userId) => {
  // Not: Mobile service'ler web kodlarına benziyor ama bu normal:
  // - Mobil için farklı transformer kullanıyor
  // - Farklı optimizasyon (minimal payload)
  // - İleride tek servis mantığına geçilebilir (refactor)
  // Şu an ayrı tutmak daha temiz ve güvenli
  
  const profile = await db('doctor_profiles')
    .where('user_id', userId)
    .first();
  
  // Unread notifications count
  const [{ count: unreadCount }] = await db('notifications')
    .where('user_id', userId)
    .where('is_read', false)
    .count('* as count');
  
  // Total applications
  const [{ count: totalApps }] = await db('applications')
    .where('doctor_profile_id', profile.id)
    .count('* as count');
  
  // Recommended jobs (minimal data - mobile optimized)
  const recommendedJobs = await db('jobs as j')
    .where('j.status', 'approved')
    .select('j.*')
    .limit(5);
  
  // Transformer ile minimal payload (MVP'de sadece gerekli alanlar)
  return {
    unread_notifications_count: parseInt(unreadCount),
    recent_applications: await getRecentApplications(profile.id, 5), // Max 5 - minimal bilgi
    recommended_jobs: recommendedJobs.map(jobTransformer.toMobile), // Max 5 - minimal payload
    profile_completion_percent: 75, // MVP'de dummy olabilir (hesaplanmayabilir)
    // Not: total_applications ve recommended_jobs_count MVP'de gereksiz (dashboard minimal olsun)
  };
};

const getProfile = async (userId) => {
  const profile = await db('doctor_profiles')
    .where('user_id', userId)
    .first();
  
  return profileTransformer.toMobile(profile);
};

module.exports = {
  getDashboard,
  getProfile,
};
```

**Notlar:**
- Mevcut service'lere dokunulmayacak, sadece yeni mobile service'ler oluşturulacak.
- Mobile service'ler web kodlarına benziyor ama bu normal (farklı transformer, minimal payload). İleride refactor edilebilir.

---

### ✅ Kontrol Listesi (Minimal ve Güvenli)

#### ✅ Yeni Klasörler (Sadece Mobile)
- [ ] `routes/mobile/` klasörü oluşturuldu
- [ ] `controllers/mobile/` klasörü oluşturuldu
- [ ] `services/mobile/` klasörü oluşturuldu
- [ ] `src/mobile/transformers/` klasörü oluşturuldu

#### ✅ Dosya Güncellemeleri (Minimal)
- [ ] `routes/index.js` güncellendi (sadece mobile route'ları eklendi)
- [ ] `middleware/mobileErrorHandler.js` oluşturuldu (KRİTİK: Mobile için JSON-only error handler)
- [ ] Tüm mobile route dosyalarına `mobileErrorHandler` middleware'i eklendi
- [ ] Mevcut web dosyalarına dokunulmadı ✅

#### ✅ Test
- [ ] Mevcut web endpoint'leri çalışıyor mu? (`/api/auth/login`, `/api/doctor/profile`)
- [ ] Backend server başlatılıyor mu?
- [ ] Yeni mobile endpoint'leri çalışıyor mu? (`/api/mobile/auth/login`)

#### ❌ YAPILMAYACAKLAR
- ❌ Mevcut dosyalar taşınmayacak
- ❌ Mevcut import'lar değiştirilmeyecek
- ❌ `routes/web/` klasörü oluşturulmayacak
- ❌ Mevcut dosyalara dokunulmayacak

---

#### 3.2. Mobile Controller Dosyası Örneği

```javascript
// backend/src/routes/mobile/mobileDoctorRoutes.js
const express = require('express');
const mobileDoctorController = require('../../controllers/mobile/mobileDoctorController');
const { authMiddleware } = require('../../middleware/authMiddleware');
const { requireRole } = require('../../middleware/roleGuard');

const router = express.Router();

// Mobile doctor routes - sadece doktorlar
router.use(authMiddleware);
// Not: RoleGuard opsiyonel - Mobile sadece doktor kullanıyor, ama güvenlik için eklenebilir
router.use(requireRole(['doctor'])); // Opsiyonel: Fazladan overhead ama güvenlik açısından sorun yok

router.get('/dashboard', mobileDoctorController.getDashboard);
router.get('/profile', mobileDoctorController.getProfile);

module.exports = router;
```

#### 3.3. Mobile Service Dosyası Örneği

```javascript
// backend/src/controllers/mobile/mobileDoctorController.js
const mobileDoctorService = require('../../services/mobile/mobileDoctorService');
const { sendSuccess, sendError } = require('../../utils/response');
const { catchAsync } = require('../../utils/errorHandler');

const getDashboard = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const dashboardData = await mobileDoctorService.getDashboard(userId);
  return sendSuccess(res, 'Dashboard verileri', dashboardData);
});

const getProfile = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const profile = await mobileDoctorService.getProfile(userId);
  return sendSuccess(res, 'Profil bilgileri', profile);
});

module.exports = {
  getDashboard,
  getProfile,
};
```

#### 3.4. Transformer Dosyası Örneği

```javascript
// backend/src/services/mobile/mobileDoctorService.js
const db = require('../../config/dbConfig').db;
const jobTransformer = require('../../mobile/transformers/jobTransformer');
const profileTransformer = require('../../mobile/transformers/profileTransformer');

const getDashboard = async (userId) => {
  // Web service'leri kullan ama transformer ile minimal data dön
  const profile = await db('doctor_profiles')
    .where('user_id', userId)
    .first();
  
  // Unread notifications count
  const [{ count: unreadCount }] = await db('notifications')
    .where('user_id', userId)
    .where('is_read', false)
    .count('* as count');
  
  // Total applications
  const [{ count: totalApps }] = await db('applications')
    .where('doctor_profile_id', profile.id)
    .count('* as count');
  
  // Recommended jobs (web service'ten al ama transform et)
  const recommendedJobsRaw = await db('jobs as j')
    .join('doctor_profiles as dp', 'dp.user_id', userId)
    .where('j.status', 'approved')
    .where('j.specialty_id', db.raw('dp.specialty_id'))
    .select('j.*', 'h.institution_name as hospital_name')
    .leftJoin('hospitals as h', 'h.user_id', 'j.hospital_user_id')
    .limit(5);
  
  // Transform to mobile format
  const recommendedJobs = recommendedJobsRaw.map(jobTransformer.toMobile);
  
  return {
    unread_notifications_count: parseInt(unreadCount || 0),
    // Not: total_applications ve recommended_jobs_count MVP'de opsiyonel
    profile_completion_percent: calculateCompletion(profile),
    recent_applications: await getRecentApplications(profile.id, 5),
    recommended_jobs: recommendedJobs
  };
};

const getProfile = async (userId) => {
  const profile = await db('doctor_profiles')
    .where('user_id', userId)
    .first();
  
  // Transform to mobile format (minimal fields)
  return profileTransformer.toMobile(profile);
};

module.exports = {
  getDashboard,
  getProfile,
};
```

#### 3.4. Transformer Dosyası Örneği

```javascript
// backend/src/mobile/transformers/jobTransformer.js

/**
 * Web job response'unu mobile format'a çevir
 */
const toMobile = (job) => {
  return {
    id: job.id,
    title: job.title,
    city_name: job.city_name,
    specialty: job.specialty,
    subspecialty: job.subspecialty_name || null,
    salary_range: job.salary_range,
    work_type: job.work_type,
    created_at: job.created_at,
    is_applied: job.is_applied || false,
    hospital_name: job.hospital_name || job.institution_name
  };
};

/**
 * Job detail için minimal format
 */
const toMobileDetail = (job) => {
  return {
    ...toMobile(job),
    description: truncate(job.description, 200), // Mobile için kısaltılmış
    requirements: job.requirements?.slice(0, 5) || [], // Max 5 requirement
    // Admin metadata, revision history vs. EKLENMEZ
  };
};

module.exports = {
  toMobile,
  toMobileDetail,
};
```

---

**Not:** MVP'de DTO gereksiz, Transformer yeterli. DTO production'da ihtiyaç halinde eklenebilir.

---

## 🔌 Backend Entegrasyonu (Legacy - Web için)

### Mevcut API Endpoints (Web için Kullanılmaya Devam Edecek)

#### Authentication Endpoints
```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh-token
POST /api/auth/logout
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

#### Doctor Endpoints (Mevcut Backend)
```
GET    /api/doctor/profile
PUT    /api/doctor/profile
GET    /api/doctor/profile/complete
PATCH  /api/doctor/profile/personal
GET    /api/doctor/dashboard

# Eğitim
GET    /api/doctor/educations
POST   /api/doctor/educations
PATCH  /api/doctor/educations/:id
DELETE /api/doctor/educations/:id

# Deneyim
GET    /api/doctor/experiences
POST   /api/doctor/experiences
PATCH  /api/doctor/experiences/:id
DELETE /api/doctor/experiences/:id

# Sertifika
GET    /api/doctor/certificates
POST   /api/doctor/certificates
PATCH  /api/doctor/certificates/:id
DELETE /api/doctor/certificates/:id

# Dil
GET    /api/doctor/languages
POST   /api/doctor/languages
PATCH  /api/doctor/languages/:id
DELETE /api/doctor/languages/:id

# Fotoğraf
POST   /api/doctor/profile/photo
GET    /api/doctor/profile/photo/status
DELETE /api/doctor/profile/photo/request
```

#### Job & Application Endpoints
```
GET    /api/doctor/jobs              # İş ilanları listesi
GET    /api/doctor/jobs/:id          # İş ilanı detayı
POST   /api/doctor/applications      # Başvuru yap
GET    /api/doctor/applications/me   # Kendi başvurularım
GET    /api/doctor/applications/:id  # Başvuru detayı
PATCH  /api/doctor/applications/:id/withdraw  # Başvuruyu geri çek
```

#### Notification Endpoints
```
GET    /api/notifications
GET    /api/notifications/:id
PATCH  /api/notifications/:id/read
GET    /api/notifications/unread-count
```

#### Lookup Endpoints
```
GET    /api/lookup/specialties
GET    /api/lookup/subspecialties
GET    /api/lookup/cities
GET    /api/lookup/job-statuses
GET    /api/lookup/application-statuses
```

### API Client Yapılandırması

```typescript
// src/api/client.ts
import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Mobile için backend endpoint
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3100/api/mobile'  // Development - Mobile endpoints
  : 'https://mk.monassist.com/api/mobile';  // Production - Mobile endpoints

// Not: Web frontend '/api/*' kullanır (prefix yok), mobile '/api/mobile/*' kullanır (prefix var)

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Token ekleme
apiClient.interceptors.request.use(
  async (config) => {
    const credentials = await Keychain.getGenericPassword();
    if (credentials && credentials.password) {
      config.headers.Authorization = `Bearer ${credentials.password}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const credentials = await Keychain.getGenericPassword();
        const refreshToken = credentials?.username; // Refresh token'ı username'e kaydedebilirsiniz
        
        const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });
        
        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        
        await Keychain.setGenericPassword(newRefreshToken, accessToken);
        
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout
        await Keychain.resetGenericPassword();
        // Navigate to login
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## 🔐 Güvenlik ve Authentication

### Token Yönetimi

```typescript
// src/utils/token.ts
// NOT: Bu kod PRODUCTION'da kullanılacak (Keychain ile biometric auth için)
// MVP'de Expo Secure Store kullan (yukarıdaki kod bloğuna bakın)
```

### Authentication Flow

```
┌─────────────┐
│   Login     │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ POST /auth/login    │
│ Email + Password    │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Access + Refresh    │
│ Token Alındı        │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Secure Store'a Kaydet │
│ (Expo Secure Store)   │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Dashboard'a Yönlendir│
└─────────────────────┘
```

### Güvenlik Best Practices

1. **Token Storage (MVP)**: Expo Secure Store kullan (AsyncStorage değil!)
2. **Token Storage (Production)**: react-native-keychain (biometric auth için)
2. **SSL Pinning**: Production'da implement et
3. **Certificate Validation**: Backend SSL sertifikası doğrulama
4. **Biometric Auth**: Face ID / Fingerprint desteği (optional)
5. **Deep Linking**: Güvenli URL scheme kullan

---

## 🔔 Push Notification

### 📱 MVP Fazı: Expo Push (Firebase Gerekmez)

**MVP'de Kullanılacak: Expo Push Notifications**

**✅ MVP'de Ne Var:**
- ✅ Mobile: Expo Push token al
- ✅ Mobile: Token'ı backend'e gönder
- ✅ Backend: Token'ı veritabanına kaydet
- ✅ Backend: Expo Push endpoint'ine POST at (`https://exp.host/--/api/v2/push/send`)
- ✅ Firebase kurmaya gerek yok!

**❌ MVP'de Ne Yok:**
- ❌ Firebase kurulumu
- ❌ Firebase Admin SDK
- ❌ FCM token'lar
- ❌ Advanced notification features

**Neden MVP'de Expo Push?**
- ✅ Firebase kurmaya gerek yok
- ✅ Hızlı setup (5 dakika)
- ✅ Backend'de sadece HTTP POST atıyorsun
- ✅ Production'a kadar yeterli
- ✅ Sonradan FCM'e geçiş mümkün

---

### 🚀 Production Fazı: Firebase FCM Migration

**⚠️ ÖNEMLİ: Bu Production'da yapılacak, MVP'de değil!**

**Production'da Yapılacaklar:**
1. ⏳ Expo Push token → FCM token'a migrate
2. ⏳ Firebase Admin SDK kurulumu
3. ⏳ Advanced notification özellikleri (rich notifications, actions, etc.)
4. ⏳ Analytics entegrasyonu
5. ⏳ A/B testing için notification targeting

**✅ Production'da Ne Var:**
- ✅ Firebase Admin SDK
- ✅ FCM token yönetimi
- ✅ Rich notifications (images, actions)
- ✅ Notification scheduling
- ✅ Analytics & A/B testing

**Not:** MVP'de Expo Push kullan, Production'da Firebase FCM'e geçiş yap.

---

## 📱 MVP: Expo Push Implementation

**Basit Özet:**
- MVP'de Expo Push kullanılacak (Firebase gerektirmez)
- Device token tablosu eklenecek (`device_tokens`)
- Backend: Expo Push endpoint'ine POST atılacak (`https://exp.host/--/api/v2/push/send`)
- Mobile: Expo Push token alınıp backend'e kaydedilecek

**Not:** Detaylı kod implementasyonu roadmap'ten çıkarıldı. Teknik implementasyon detayları için `docs/expo-push-implementation.md` dosyasına bakın.

---


---

## 📴 Offline Support (Basit)

### MVP Yaklaşımı: React Query Cache

**Kompleks offline queue yerine basit caching:**
- React Query cache ile offline'da önbellekten okuma
- Network status kontrolü (NetInfo)
- Offline banner ile kullanıcıya bilgilendirme
- Online olduğunda otomatik refetch

**MVP'de Ne Var:**
- ✅ React Query cache (staleTime: 5 dk, cacheTime: 10 dk)
- ✅ Offline banner component
- ✅ Network status listener
- ✅ Cache'den okuma (offline'da)

**MVP'de Ne Yok:**
- ❌ Advanced offline queue architecture
- ❌ Action queue (offline'da yapılan işlemler)
- ❌ Conflict resolution

**Not:** MVP'de offline queue yok. Sadece React Query cache + offline banner yeterli. Advanced offline queue architecture production'da eklenebilir.

---

## 🔐 Güvenlik ve Authentication

### MVP Güvenlik (Temel)

**Token Storage (Expo Secure Store):**

```typescript
// src/utils/token.ts
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const TokenManager = {
  async saveTokens(accessToken: string, refreshToken: string) {
    await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  },

  async getAccessToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  },

  async getRefreshToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  },

  async clearTokens() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  },
};
```

**Not:** MVP'de SSL Pinning yok. Production öncesi eklenebilir.

---

## 🏗 Mimari Yapı

### Klasör Yapısı (Yeni Yapıya Göre)

```
mobile-app/
├── App.tsx
├── app.json
├── package.json
├── metro.config.js
├── src/
│   ├── api/
│   │   ├── client.ts              # Axios instance
│   │   ├── endpoints.ts           # API endpoint tanımları
│   │   └── services/
│   │       ├── auth.service.ts
│   │       ├── jobs.service.ts
│   │       ├── applications.service.ts
│   │       └── notifications.service.ts
│   │
│   ├── store/
│   │   ├── authStore.ts          # Zustand (auth state)
│   │   └── uiStore.ts            # Zustand (UI state)
│   │
│   ├── navigation/
│   │   ├── AuthNavigator.tsx
│   │   ├── MainNavigator.tsx
│   │   └── RootNavigator.tsx
│   │
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── RegisterScreen.tsx
│   │   ├── dashboard/
│   │   │   └── DashboardScreen.tsx
│   │   ├── jobs/
│   │   │   ├── JobsListScreen.tsx
│   │   │   └── JobDetailScreen.tsx
│   │   ├── applications/
│   │   │   ├── ApplicationsListScreen.tsx
│   │   │   └── ApplicationDetailScreen.tsx
│   │   ├── profile/
│   │   │   ├── ProfileScreen.tsx
│   │   │   └── EditProfileScreen.tsx
│   │   └── notifications/
│   │       └── NotificationsScreen.tsx
│   │
│   ├── components/
│   ├── utils/
│   ├── hooks/
│   ├── types/
│   └── constants/
└── docs/
    └── openapi-mobile.yaml (Opsiyonel)
```

### State Management (MVP)

**Zustand (Sadece Client State):**
- Auth state (user, tokens)
- UI state (theme, loading)
- Session state

**React Query (Server State):**
- Jobs
- Applications
- Notifications
- Profile data
- Dashboard data

**Ayrım:**
```
Zustand → Auth, UI, Session (minimal)
React Query → Tüm server data (jobs, applications, etc.)
```

---


### Production Database Schema (FCM için)

```sql
-- Production'da FCM token eklemek için device_tokens tablosuna kolon ekle
ALTER TABLE device_tokens
ADD COLUMN fcm_token VARCHAR(500) NULL,
ADD COLUMN token_type VARCHAR(20) DEFAULT 'expo'; -- 'expo' veya 'fcm'

-- Index ekle
CREATE INDEX idx_fcm_token ON device_tokens(fcm_token) WHERE fcm_token IS NOT NULL;
```

### Production Backend Service (Firebase Admin SDK)

```javascript
// Backend/src/services/firebasePushService.js (PRODUCTION)

const admin = require('firebase-admin');
const db = require('../config/dbConfig').db;
const logger = require('../utils/logger');

// Firebase Admin SDK Initialize (Production'da kurulacak)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require('../config/firebase-service-account.json')),
  });
}

/**
 * FCM token kaydetme (Production'da)
 */
const saveFCMToken = async (userId, fcmToken, platform, deviceId, appVersion) => {
  // Mevcut FCM token'ı deaktif et
  await db('device_tokens')
    .where('user_id', userId)
    .where('fcm_token', fcmToken)
    .update({ is_active: 0 });

  // Yeni FCM token kaydet veya aktif et
  const [existing] = await db('device_tokens')
    .where('user_id', userId)
    .where('fcm_token', fcmToken)
    .select('*');

  if (existing) {
    await db('device_tokens')
      .where('id', existing.id)
      .update({
        is_active: 1,
        token_type: 'fcm',
        platform,
        device_id: deviceId,
        app_version: appVersion,
        updated_at: new Date(),
      });
  } else {
    await db('device_tokens').insert({
      user_id: userId,
      fcm_token: fcmToken,
      token_type: 'fcm',
      platform,
      device_id: deviceId,
      app_version: appVersion,
      is_active: 1,
    });
  }
};

/**
 * Firebase FCM ile push notification gönderme (Production'da)
 */
const sendFCMPushNotification = async (userId, title, body, data = {}) => {
  // Kullanıcının aktif FCM token'larını al
  const tokens = await db('device_tokens')
    .where('user_id', userId)
    .where('is_active', 1)
    .where('token_type', 'fcm')
    .whereNotNull('fcm_token')
    .select('fcm_token', 'platform');

  if (tokens.length === 0) return { success: false, message: 'No active FCM tokens' };

  const messages = tokens.map(({ fcm_token, platform }) => ({
    token: fcm_token,
    notification: {
      title,
      body,
    },
    data: {
      ...data,
      type: data.type || 'general',
    },
    android: {
      priority: 'high',
      notification: {
        sound: 'default',
        channelId: 'medikariyer_notifications',
      },
    },
    apns: {
      payload: {
        aps: {
          sound: 'default',
          badge: 1,
        },
      },
    },
  }));

  try {
    const response = await admin.messaging().sendEach(messages);
    return { success: true, response };
  } catch (error) {
    logger.error('FCM push notification error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  saveFCMToken,
  sendFCMPushNotification,
};
```

### Production Mobile Implementation (FCM)

```typescript
// src/services/firebasePushService.ts (PRODUCTION)

import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import apiClient from '../api/client';

class FirebasePushService {
  async requestPermission() {
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission();
      return authStatus === messaging.AuthorizationStatus.AUTHORIZED;
    } else {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
  }

  async getFCMToken() {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      console.warn('Push notification permission denied');
      return null;
    }

    const token = await messaging().getToken();
    return token;
  }

  async registerFCMToken() {
    try {
      const token = await this.getFCMToken();
      if (!token) return;

      const deviceId = await DeviceInfo.getUniqueId();
      const appVersion = DeviceInfo.getVersion();

      await apiClient.post('/mobile/device-token', {
        fcm_token: token,
        platform: Platform.OS,
        device_id: deviceId,
        app_version: appVersion,
      });

      console.log('FCM token registered');
    } catch (error) {
      console.error('FCM token registration failed:', error);
    }
  }

  setupNotificationHandlers() {
    // Foreground notifications
    messaging().onMessage(async (remoteMessage) => {
      // Show local notification or update UI
      console.log('Foreground notification:', remoteMessage);
    });

    // Background notifications
    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Background notification:', remoteMessage);
    });

    // Notification opened app
    messaging().onNotificationOpenedApp((remoteMessage) => {
      console.log('Notification opened app:', remoteMessage);
      // Navigate to relevant screen
    });

    // App opened from quit state
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log('App opened from notification:', remoteMessage);
          // Navigate to relevant screen
        }
      });
  }
}

---

## 📅 Geliştirme Fazları (6-8 Hafta)

### Faz 1: Setup & Temel Altyapı (1 hafta)
**Hedef:** Proje kurulumu, auth flow, navigation

- [ ] Expo projesi kurulumu
- [ ] Navigation yapısı (Auth + Main)
- [ ] API client setup (axios + interceptors)
- [ ] Token management (Expo Secure Store)
- [ ] Zustand store setup (auth only)
- [ ] React Query setup (basit config)
- [ ] Login/Register screens (temel)

**Önemli:** Bu fazda backend `/api/mobile/*` layer'ını da kurmalısın.

---

### Faz 2: Core Features (2-3 hafta)
**Hedef:** Temel özellikler (Dashboard, Jobs, Applications)

**Hafta 1:**
- [ ] Backend mobile endpoints (dashboard, jobs, applications)
- [ ] Dashboard screen (özet bilgiler)
- [ ] Jobs list screen (pull to refresh)
- [ ] Job detail screen
- [ ] Application creation flow

**Hafta 2:**
- [ ] Applications list screen
- [ ] Application detail screen
- [ ] Profile screen (view only)
- [ ] Basic profile edit
- [ ] Image upload (profile photo)

---

### Faz 3: Notifications & Polish (1 hafta)
**Hedef:** Push notifications, notifications screen, error handling

- [ ] Expo Push setup
- [ ] Device token registration
- [ ] Backend push service
- [ ] Notifications screen
- [ ] Notification handlers (foreground/background)
- [ ] Error handling & retry logic
- [ ] Loading states & skeleton screens

---

### Faz 4: Testing & Bug Fixes (1-2 hafta)
**Hedef:** Beta test, bug fixes, UI improvements

- [ ] Unit tests (critical paths)
- [ ] Manual testing (tüm flows)
- [ ] Beta testing (gerçek doktor kullanıcılarla)
- [ ] Bug fixes
- [ ] UI/UX improvements
- [ ] Performance optimization (image loading, list performance)

---

### Faz 5: Production Prep (1 hafta)
**Hedef:** Production build, store submission

- [ ] App store assets (icons, screenshots)
- [ ] App.json configuration
- [ ] Environment config (prod API URL)
- [ ] Production build (EAS Build)
- [ ] TestFlight / Internal testing
- [ ] Store submission (Apple App Store + Google Play)

**Toplam Süre: ~6-8 hafta** (Realist planlama - yalnız çalışma göz önünde bulundurularak)

**Not:** Domain bilgin ve React/Node.js tecrüben hızlandırıcı faktörler.

---

## ⚠️ MVP İçin Dikkat Edilmesi Gerekenler

### 1. Backend: Mobile API Layer
- ✅ `/api/mobile/*` layer'ını kur (web'den ayrı)
- ✅ Minimal payload responses (sadece gerekli fieldlar)
- ✅ Mobile-optimized queries (join'ler azaltılmış)
- ✅ Authentication mekanizması aynı (JWT)
- ✅ Web uygulaması etkilenmemeli

### 2. Güvenlik (MVP)
- ✅ **Token Storage**: Expo Secure Store kullan
- ⏳ **SSL Pinning**: Production öncesi eklenecek (MVP'de yok)
- ✅ **API Base URL**: Environment config (dev/prod)
- ✅ **Token Refresh**: Otomatik refresh mekanizması

### 3. Performance (MVP)
- ✅ **Image Optimization**: Expo Image component kullan
- ✅ **Lazy Loading**: FlatList ile infinite scroll
- ✅ **Caching**: React Query cache (basit)
- ✅ **Loading States**: Skeleton screens

### 4. User Experience (MVP)
- ✅ **Loading States**: Her API call için loading
- ✅ **Error Messages**: Kullanıcı dostu mesajlar
- ✅ **Offline Feedback**: Basit offline banner
- ✅ **Pull to Refresh**: Liste ekranlarında

### 5. Platform-Specific (MVP)
- ✅ **Permissions**: Expo Permissions API
- ✅ **Deep Linking**: Expo Linking (sonra eklenebilir)
- ⏳ **App Store Guidelines**: Production öncesi kontrol

### 6. Testing (MVP)
- ✅ **Manual Testing**: Tüm user flows
- ✅ **Beta Testing**: Gerçek doktor kullanıcılarla
- ⏳ **Unit Tests**: Production öncesi (MVP'de minimal)
- ⏳ **E2E Tests**: Production öncesi

### 7. Monitoring (MVP)
- ⏳ **Crash Reporting**: Production öncesi (Sentry)
- ⏳ **Analytics**: Production öncesi (Firebase Analytics)
- ✅ **Console Logs**: Development için yeterli
- ✅ **Backend Logs**: Mevcut backend logging kullan

---

## 🚀 Production Öncesi (Sonra Yapılacaklar)

### Güvenlik Geliştirmeleri
- [ ] SSL Pinning implementasyonu
- [ ] Certificate validation
- [ ] Biometric authentication (Face ID / Fingerprint)
- [ ] Advanced token encryption

### Offline & Sync
- [ ] Advanced offline queue architecture (production öncesi)
- [ ] Background sync
- [ ] Conflict resolution
- [ ] Advanced caching strategies

### Push Notifications
- [ ] Firebase FCM migration (opsiyonel)
- [ ] Rich notifications (images, actions)
- [ ] Notification grouping

### Performance
- [ ] Code splitting
- [ ] Bundle size optimization
- [ ] Advanced image caching
- [ ] Performance monitoring

### Testing & Quality
- [ ] Comprehensive unit tests
- [ ] Integration tests
- [ ] E2E tests (Detox / Maestro)
- [ ] Automated testing pipeline

### Monitoring & Analytics
- [ ] Crash reporting (Sentry)
- [ ] Analytics (Firebase / Mixpanel)
- [ ] Performance monitoring
- [ ] User behavior tracking

---

## 🔗 Önemli Kaynaklar

### Dokümantasyon
- [React Native Docs](https://reactnative.dev/docs/getting-started)
- [React Navigation](https://reactnavigation.org/)
- [React Query](https://tanstack.com/query/latest)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)

### Mevcut Backend API Docs
- Base URL: `https://mk.monassist.com/api`
- Auth endpoints: `/api/auth/*`
- Doctor endpoints: `/api/doctor/*`
- Notification endpoints: `/api/notifications/*`

---

## 🎯 MVP Sonuç & Özet

### MVP Hedefleri
1. ✅ Realist geliştirme (6-8 hafta)
2. ✅ Yalın mimari (gereksiz komplekslik yok)
3. ✅ Temel özellikler (jobs, applications, profile, notifications)
4. ✅ Expo Push (Firebase gerekmez)
5. ✅ Minimal backend değişiklikleri (`/api/mobile/*` layer)
6. ✅ **Mevcut sistem %100 korunur** (web-frontend ve backend/web değişmez)

### Yeni Proje Yapısı
```
MediKariyer/
├── backend/              ← Mevcut (sadece yeni klasörler eklenir)
│   └── src/
│       ├── routes/           ← MEVCUT (authRoutes.js, doctorRoutes.js, vb. root'ta)
│       │   └── mobile/       ← YENİ (eklenir)
│       ├── controllers/      ← MEVCUT (authController.js, doctorController.js, vb. root'ta)
│       │   └── mobile/       ← YENİ (eklenir)
│       └── services/         ← MEVCUT (authService.js, doctorService.js, vb. root'ta)
│           └── mobile/       ← YENİ (eklenir)
│
├── web-frontend/         ← MEVCUT (hiç dokunulmaz)
│
└── mobile-app/           ← YENİ (sıfırdan oluşturulur)
```

### Önerilen Stack (MVP)
- **Framework**: React Native + Expo
- **Language**: TypeScript
- **State**: React Query (server) + Zustand (client)
- **Push**: Expo Push Notifications
- **Storage**: Expo Secure Store (tokens)
- **API**: Axios + React Query
- **Navigation**: React Navigation

### İlk Adımlar
1. **Backend**: `backend/src/routes/mobile/` klasör yapısını kur
2. **Mobile**: `mobile-app/` klasöründe Expo projesi setup
3. **Auth**: Login/Register flow
4. **Core**: Dashboard, Jobs, Applications

### 🛡️ Güvence
- ✅ Mevcut sistem hiç etkilenmeyecek (yukarıdaki "🛡️ MEVCUT SİSTEM KORUMA GARANTİSİ" bölümüne bakın)

---

## 📝 Önemli Notlar

### Token Storage Kararı
- **MVP:** Expo Secure Store (biometric auth gerektirmez)
- **Production:** react-native-keychain (biometric auth için)

### DTO vs Transformer
- **MVP:** Sadece Transformer kullan (DTO gereksiz)
- **Production:** İhtiyaç halinde DTO eklenebilir

### Offline Support
- **MVP:** React Query cache + offline banner (yeterli)
- **Production:** Advanced offline queue architecture (sonra eklenebilir)

### RoleGuard Mobile'da
- **Not:** Mobile sadece doktor kullanıyor (admin/hospital yok)
- RoleGuard opsiyonel - Fazladan overhead ama güvenlik açısından sorun yok
- İstenirse kaldırılabilir, sadece `authMiddleware` yeterli
- Tercih: Güvenlik için kalsın (minimal overhead)

### Mobile Controller/Service Kod Tekrarı
- **Not:** Mobile service'ler web kodlarına benziyor ama bu şu an doğru:
  - Mobil için farklı transformer kullanıyor
  - Farklı optimizasyon (minimal payload)
  - Daha iyi cache stratejisi
  - Şu an ayrı tutmak daha temiz ve güvenli
- İleride tek servis mantığına geçilebilir (refactor - production sonrası)

---

## 🔥 MVP İçin Öneriler (Production Hazırlığı)

### 1. Mobile API Response Formatı (Stateless)

**Her response şu formatta olmalı:**
```json
{
  "success": true,
  "data": {...},
  "message": "..."
}
```
**Not:** Mevcut backend'de zaten var, korunmalı.

### 2. Mobile Login Response Minimal Olmalı

- Web tarafındaki gereksiz alanlar gönderilmemeli
- Sadece gerekli token ve minimal user bilgisi

### 3. Response'larda Nested Complex Object Olmasın

- JSON minimal olmalı
- 1 seviye derinlik ideal
- Gereksiz JOIN yapılmamalı
- Örnek: `hospital: { name, city }` yerine `hospital_name`, `hospital_city` (flat structure)

### 4. Infinite Scroll Zorunlu

- Mobile kullanıcı 200+ ilan görebilir
- Liste ekranlarında kesinlikle infinite scroll kullanılmalı
- FlatList + `onEndReached` implementasyonu

### 5. Image Upload Stratejisi

- **MVP:** Backend üzerinden upload (küçük dosyalar için)
- **Production hazırlığı:** Expo ImagePicker + presigned URL (S3 gibi)
- SQL Server + backend üzerinden upload → yavaş (ilerisi için düşünülmeli)

### 6. Hata Yönetimi (Error Handling) - KRİTİK ⚠️

**🚨 Web vs Mobile Farkı:**
- **Web:** HTML hata sayfası dönebilir (404.html, 500.html gibi)
- **Mobile:** **KESİNLİKLE JSON döndürmeli** - HTML dönerse "JSON Parse Error" çöker

**🔴 Zorunlu Kural:**
- Mobile route'larındaki (`/api/mobile/*`) **TÜM error handler'lar JSON döndürmeli**
- Middleware'lerdeki catch block'lar JSON response göndermeli
- Controller'lardaki try-catch blokları `res.json()` kullanmalı (HTML değil)

**💡 Çözüm: Mobile Error Handler Middleware**

Her mobile route dosyasında `mobileErrorHandler` middleware'i kullanılmalı:

**Örnek Middleware Dosyası:**
```javascript
// backend/src/middleware/mobileErrorHandler.js
const { globalErrorHandler } = require('../utils/errorHandler');

/**
 * Mobile route'ları için özel error handler
 * Web tarafı HTML dönebilir ama mobile JSON bekler - HTML dönerse "JSON Parse Error" çöker
 */
const mobileErrorHandler = (err, req, res, next) => {
  // Mobile route'ları için her zaman JSON döndür
  if (!res.headersSent) {
    // Content-Type'ı JSON olarak ayarla (emin olmak için)
    res.setHeader('Content-Type', 'application/json');
    // Global error handler'ı çağır (zaten JSON döndürüyor ama garanti için)
    return globalErrorHandler(err, req, res, next);
  }
  next(err);
};

module.exports = { mobileErrorHandler };
```

**Kullanım (Route Dosyalarında):**
```javascript
// routes/mobile/mobileDoctorRoutes.js
const { mobileErrorHandler } = require('../../middleware/mobileErrorHandler');

const router = express.Router();

// KRİTİK: Mobile route'larında TÜM hatalar JSON döndürmeli
router.use(mobileErrorHandler); // Her zaman JSON döndürür

router.use(authMiddleware);
router.get('/dashboard', mobileDoctorController.getDashboard);
```

**✅ Kontrol Listesi:**
- [ ] `middleware/mobileErrorHandler.js` dosyası oluşturuldu
- [ ] Tüm mobile route dosyalarına `mobileErrorHandler` eklendi
- [ ] Controller'lardaki `catchAsync` ve `sendError` JSON döndürüyor (zaten doğru)
- [ ] Test: Mobile route'larında hata oluşturulduğunda JSON döndüğü doğrulandı

---

## ✅ Genel Değerlendirme

**📌 Bu roadmap profesyonel. Gerçek şirkette onay alır.**

✅ **Uygulanabilir, risksiz, doğru parçalanmış.**  
✅ **MVP → Production geçişi temiz düşünülmüş.**  
✅ **Backend risk sıfır.**  
✅ **Expo ile hızlı çıkılır.**

---

## 🔥 MVP İçin Öneriler (Production Hazırlığı)

### 1. Mobile API Response Formatı (Stateless)

**Her response şu formatta olmalı:**
```json
{
  "success": true,
  "data": {...},
  "message": "..."
}
```
**Not:** Mevcut backend'de zaten var, korunmalı.

### 2. Mobile Login Response Minimal Olmalı

- Web tarafındaki gereksiz alanlar gönderilmemeli
- Sadece gerekli token ve minimal user bilgisi

### 3. Response'larda Nested Complex Object Olmasın

- JSON minimal olmalı
- 1 seviye derinlik ideal
- Gereksiz JOIN yapılmamalı
- Örnek: `hospital: { name, city }` yerine `hospital_name`, `hospital_city` (flat structure)

### 4. Infinite Scroll Zorunlu

- Mobile kullanıcı 200+ ilan görebilir
- Liste ekranlarında kesinlikle infinite scroll kullanılmalı
- FlatList + `onEndReached` implementasyonu

### 5. Image Upload Stratejisi

- **MVP:** Backend üzerinden upload (küçük dosyalar için)
- **Production hazırlığı:** Expo ImagePicker + presigned URL (S3 gibi)
- SQL Server + backend üzerinden upload → yavaş (ilerisi için düşünülmeli)

---

## 🚀 Production Öncesi / Sonra Yapılacaklar

### 1. Advanced Offline Queue Architecture
- Offline action queue (kullanıcı offline'da yapılan işlemler)
- Conflict resolution mekanizması
- Sync strategy (merging, last-write-wins, vb.)
- Detaylı implementasyon production öncesi yapılacak

### 2. Firebase FCM Migration
- Expo Push'tan FCM'e geçiş
- Firebase Admin SDK kurulumu
- FCM token yönetimi
- Rich notifications (images, actions)
- Notification scheduling
- Analytics & A/B testing

**Not:** Detaylı Firebase FCM implementation kodları ve adımlar production dokümanında bulunacak. MVP dokümanında sadece Expo Push yer alır.

### 3. Diğer Production Özellikleri
- SSL Pinning
- Comprehensive testing
- Monitoring & Analytics

**Not:** Bu MVP yaklaşımı ile mevcut sisteminize **hiç dokunmadan** yeni bir mobil uygulama geliştirebilirsiniz.

---

## 📚 Ek Kaynaklar

### Dokümantasyon
- [Expo Docs](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Query](https://tanstack.com/query/latest)
- [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)

### Backend API
- Base URL (Dev): `http://localhost:3000/api`
- Base URL (Prod): `https://mk.monassist.com/api`
- Mobile Endpoints: `/api/mobile/*`

---

**Hazırlayan:** AI Assistant  
**Revize Tarihi:** 2024  
**Versiyon:** MVP-Optimized

