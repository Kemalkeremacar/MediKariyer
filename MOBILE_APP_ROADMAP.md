# 📱 MediKariyer Doktor Mobil Uygulama - MVP Geliştirme Yol Planı

## 📋 İçindekiler
1. [Genel Bakış](#genel-bakış)
2. [MVP Yaklaşımı](#mvp-yaklaşımı)
3. [Teknoloji Stack (MVP)](#teknoloji-stack-mvp)
4. [Backend: Mobile API Layer](#backend-mobile-api-layer)
5. [Mimari Yapı](#mimari-yapı)
6. [Authentication](#authentication)
7. [Push Notification (MVP: Expo Push)](#push-notification-mvp-expo-push)
8. [Offline Support (Basit)](#offline-support-basit)
9. [Geliştirme Fazları (5-6 Hafta)](#geliştirme-fazları-5-6-hafta)
10. [Production Öncesi (Sonra Yapılacaklar)](#production-öncesi-sonra-yapılacaklar)

---

## 🎯 Genel Bakış

### Mevcut Durum
- **Backend**: Express.js + Node.js + SQL Server (Mevcut)
- **Web Frontend**: React (Hastane & Admin için devam edecek)
- **Mobil Uygulama**: MVP olarak geliştirilecek (Sadece Doktorlar için)

### Hedef Kullanıcı
- ✅ Sadece **Doktorlar** mobil uygulamayı kullanacak
- ❌ Hastane ve Admin web üzerinden devam edecek

### MVP Kapsamı
- ✅ Login/Register (Doktor)
- ✅ Dashboard (özet bilgiler)
- ✅ Profil yönetimi (temel)
- ✅ İş ilanları listesi & detay
- ✅ Başvurularım
- ✅ Bildirimler
- ✅ Push notifications (Expo Push)

### MVP'de Olmayacaklar (Sonra Eklenecek)
- ❌ SSL Pinning (Production öncesi)
- ❌ Gelişmiş offline queue
- ❌ Complex offline sync
- ❌ Advanced caching strategies
- ❌ Firebase FCM (Expo Push kullanılacak)

---

## 🚀 MVP Yaklaşımı

### Felsefe: Hızlı, Yalın, İşlevsel

**MVP'de Öncelik:**
1. Hızlı geliştirme (Expo ile)
2. Minimal backend değişiklikleri
3. Temel özellikler (login, dashboard, jobs, applications)
4. Basit offline desteği (React Query cache)
5. Expo Push (Firebase gerek yok)

**Production Öncesi Yapılacaklar:**
- SSL Pinning
- Gelişmiş offline queue
- Firebase FCM migration (opsiyonel)
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

### Klasör Yapısı (React Native)

```
mobile-app/
├── src/
│   ├── api/
│   │   ├── client.ts              # Axios instance + interceptors
│   │   ├── endpoints.ts           # API endpoint definitions
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── profile.service.ts
│   │   │   ├── jobs.service.ts
│   │   │   ├── applications.service.ts
│   │   │   └── notifications.service.ts
│   │   └── hooks/
│   │       ├── useAuth.ts
│   │       ├── useProfile.ts
│   │       └── useJobs.ts
│   ├── store/
│   │   ├── authStore.ts          # Zustand store
│   │   └── appStore.ts
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── RegisterScreen.tsx
│   │   ├── dashboard/
│   │   │   └── DashboardScreen.tsx
│   │   ├── profile/
│   │   │   ├── ProfileScreen.tsx
│   │   │   ├── EditProfileScreen.tsx
│   │   │   └── PhotoManagementScreen.tsx
│   │   ├── jobs/
│   │   │   ├── JobsListScreen.tsx
│   │   │   └── JobDetailScreen.tsx
│   │   ├── applications/
│   │   │   ├── ApplicationsListScreen.tsx
│   │   │   └── ApplicationDetailScreen.tsx
│   │   └── notifications/
│   │       └── NotificationsScreen.tsx
│   ├── components/
│   │   ├── common/
│   │   ├── forms/
│   │   └── cards/
│   ├── navigation/
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── MainNavigator.tsx
│   ├── utils/
│   │   ├── storage.ts            # AsyncStorage wrapper
│   │   ├── token.ts              # Token management
│   │   └── validation.ts         # Zod schemas
│   ├── types/
│   │   └── index.ts              # TypeScript types
│   └── constants/
│       └── config.ts             # App config
├── App.tsx
└── package.json
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

### Önemli: Mobile için Özel Endpoint Layer

**Neden `/api/mobile/*` Layer Gerekli?**

Web ve Mobile ihtiyaçları farklı:

**Web Response (Örnek):**
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

**Mobile Response (Minimal):**
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

### Yeni Backend Yapısı

```
Backend/src/
├── routes/
│   ├── doctorRoutes.js       # Mevcut (Web için)
│   └── mobileRoutes.js       # YENİ (Mobile için)
├── controllers/
│   ├── doctorController.js   # Mevcut
│   └── mobileController.js   # YENİ
└── services/
    ├── doctorService.js      # Mevcut
    └── mobileService.js      # YENİ (Mobile-optimized)
```

### Mobile API Endpoints

#### Authentication (Mevcut Kullanılacak)
```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/refresh-token
POST /api/auth/logout
```

#### Mobile-Specific Endpoints (YENİ)

**Dashboard:**
```
GET /api/mobile/doctor/dashboard
Response:
{
  "unread_notifications_count": 5,
  "total_applications": 12,
  "recommended_jobs_count": 8,
  "profile_completion_percent": 75,
  "recent_applications": [...], // Max 5
  "recommended_jobs": [...]     // Max 5
}
```

**Jobs:**
```
GET /api/mobile/jobs?page=1&limit=20&specialty=Kardiyoloji&city=İstanbul

Response (Minimal Payload):
{
  "data": [
    {
      "id": 123,
      "title": "Kardiyoloji Uzmanı",
      "city_name": "İstanbul",
      "specialty": "Kardiyoloji",
      "subspecialty": null,
      "salary_range": "50000-70000",
      "work_type": "Tam Zamanlı",
      "created_at": "2024-01-15T10:00:00Z",
      "is_applied": false,
      "hospital_name": "ABC Hastanesi"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}

GET /api/mobile/jobs/:id

Response:
{
  "id": 123,
  "title": "Kardiyoloji Uzmanı",
  "city_name": "İstanbul",
  "specialty": "Kardiyoloji",
  "salary_range": "50000-70000",
  "work_type": "Tam Zamanlı",
  "description": "Kısa açıklama...", // Mobile için kısaltılmış
  "requirements": ["..."],
  "created_at": "2024-01-15T10:00:00Z",
  "is_applied": false,
  "application_id": null,
  "hospital": {
    "name": "ABC Hastanesi",
    "city": "İstanbul"
  }
}
```

**Applications:**
```
GET /api/mobile/applications?page=1&limit=20&status=pending

Response:
{
  "data": [
    {
      "id": 456,
      "job_id": 123,
      "job_title": "Kardiyoloji Uzmanı",
      "hospital_name": "ABC Hastanesi",
      "status": "pending",
      "status_label": "Onay Bekliyor",
      "created_at": "2024-01-10T10:00:00Z"
    }
  ],
  "pagination": {...}
}
```

**Notifications:**
```
GET /api/mobile/notifications?page=1&limit=20

Response:
{
  "data": [
    {
      "id": 789,
      "title": "Başvuru Durumu Güncellendi",
      "body": "ABC Hastanesi başvurunuzu değerlendiriyor",
      "is_read": false,
      "created_at": "2024-01-15T10:00:00Z",
      "type": "application_status"
    }
  ],
  "unread_count": 5
}
```

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

### Backend Implementation (Örnek)

```javascript
// Backend/src/routes/mobileRoutes.js
const express = require('express');
const mobileController = require('../controllers/mobileController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleGuard');

const router = express.Router();

// Mobile routes - sadece doktorlar
router.use(authMiddleware);
router.use(requireRole(['doctor']));

// Dashboard
router.get('/doctor/dashboard', mobileController.getDashboard);

// Jobs
router.get('/jobs', mobileController.getJobs);
router.get('/jobs/:id', mobileController.getJobById);

// Applications
router.get('/applications', mobileController.getApplications);
router.post('/applications', mobileController.createApplication);
router.get('/applications/:id', mobileController.getApplicationById);

// Notifications
router.get('/notifications', mobileController.getNotifications);
router.patch('/notifications/:id/read', mobileController.markAsRead);

// Profile
router.get('/profile', mobileController.getProfile);

// Device token
router.post('/device-token', mobileController.saveDeviceToken);

module.exports = router;

// Backend/src/routes/index.js içine ekle:
router.use('/mobile', mobileRoutes);
```

```javascript
// Backend/src/services/mobileService.js (Örnek)
const db = require('../config/dbConfig').db;

const getMobileDashboard = async (userId) => {
  // Minimal data için optimize edilmiş query
  const [profile] = await db('doctor_profiles')
    .where('user_id', userId)
    .select('id', 'first_name', 'last_name', 'profile_photo');
  
  const unreadCount = await db('notifications')
    .where('user_id', userId)
    .where('is_read', false)
    .count('* as count')
    .first();
  
  const totalApplications = await db('applications')
    .where('doctor_profile_id', profile.id)
    .count('* as count')
    .first();
  
  // Recommended jobs (basit algoritma)
  const recommendedJobs = await db('jobs as j')
    .join('doctor_profiles as dp', 'dp.user_id', userId)
    .where('j.status', 'approved')
    .where('j.specialty_id', db.raw('dp.specialty_id')) // Aynı uzmanlık
    .select('j.id', 'j.title', 'j.city_name', 'j.specialty')
    .limit(5);
  
  return {
    unread_notifications_count: parseInt(unreadCount?.count || 0),
    total_applications: parseInt(totalApplications?.count || 0),
    recommended_jobs_count: recommendedJobs.length,
    profile_completion_percent: 75, // Calculate from profile
    recent_applications: [...], // Last 5
    recommended_jobs: recommendedJobs
  };
};

const getMobileJobs = async (filters = {}) => {
  // Minimal fields için optimize query
  const query = db('jobs as j')
    .where('j.status', 'approved')
    .select(
      'j.id',
      'j.title',
      'j.city_name',
      'j.specialty',
      'j.salary_range',
      'j.work_type',
      'j.created_at',
      db.raw('h.institution_name as hospital_name')
    )
    .leftJoin('hospitals as h', 'h.user_id', 'j.hospital_user_id');
  
  // Filters
  if (filters.specialty) {
    query.where('j.specialty', filters.specialty);
  }
  if (filters.city) {
    query.where('j.city_name', filters.city);
  }
  
  // Pagination
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const offset = (page - 1) * limit;
  
  const jobs = await query.limit(limit).offset(offset);
  
  // Check if applied (for each job)
  const jobIds = jobs.map(j => j.id);
  const applications = await db('applications')
    .whereIn('job_id', jobIds)
    .select('job_id');
  
  const appliedJobIds = new Set(applications.map(a => a.job_id));
  
  const jobsWithApplied = jobs.map(job => ({
    ...job,
    is_applied: appliedJobIds.has(job.id)
  }));
  
  return {
    data: jobsWithApplied,
    pagination: {
      page,
      limit,
      total: await query.clone().count('* as count').first(),
      pages: Math.ceil(total / limit)
    }
  };
};

module.exports = {
  getMobileDashboard,
  getMobileJobs,
  // ... diğer fonksiyonlar
};
```

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
import * as Keychain from 'react-native-keychain';

const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api'  // Development
  : 'https://mk.monassist.com/api';  // Production

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
import * as Keychain from 'react-native-keychain';

export const TokenManager = {
  async saveTokens(accessToken: string, refreshToken: string) {
    // Refresh token'ı username, access token'ı password olarak kaydet
    await Keychain.setGenericPassword(refreshToken, accessToken, {
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      service: 'com.medikariyer.tokens',
    });
  },

  async getAccessToken(): Promise<string | null> {
    const credentials = await Keychain.getGenericPassword({
      service: 'com.medikariyer.tokens',
    });
    return credentials ? credentials.password : null;
  },

  async getRefreshToken(): Promise<string | null> {
    const credentials = await Keychain.getGenericPassword({
      service: 'com.medikariyer.tokens',
    });
    return credentials ? credentials.username : null;
  },

  async clearTokens() {
    await Keychain.resetGenericPassword({
      service: 'com.medikariyer.tokens',
    });
  },
};
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
│ Keychain'e Kaydet   │
│ (Secure Storage)    │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Dashboard'a Yönlendir│
└─────────────────────┘
```

### Güvenlik Best Practices

1. **Token Storage**: Keychain/Keystore kullan (AsyncStorage değil!)
2. **SSL Pinning**: Production'da implement et
3. **Certificate Validation**: Backend SSL sertifikası doğrulama
4. **Biometric Auth**: Face ID / Fingerprint desteği (optional)
5. **Deep Linking**: Güvenli URL scheme kullan

---

## 🔔 Push Notification (MVP: Expo Push)

### MVP Yaklaşımı: Expo Push Notifications

**Neden Expo Push?**
- ✅ Firebase gerekmez
- ✅ Hızlı setup
- ✅ Backend'de sadece HTTP POST
- ✅ Production'a kadar yeterli
- ✅ Sonradan FCM'e geçiş mümkün

### Expo Push Mimari

#### Mobile Tarafı

```typescript
// src/services/pushNotificationService.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import apiClient from '../api/client';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class ExpoPushService {
  async registerForPushNotifications() {
    if (!Device.isDevice) {
      console.warn('Push notifications only work on physical devices');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Failed to get push token for push notification');
      return null;
    }

    const token = (await Notifications.getExpoPushTokenAsync({
      projectId: 'your-expo-project-id', // expo.json'dan alınacak
    })).data;

    // Backend'e kaydet
    await this.sendTokenToBackend(token);

    // Notification listeners
    this.setupNotificationHandlers();

    return token;
  }

  async sendTokenToBackend(expoPushToken: string) {
    try {
      const deviceId = await Device.modelId;
      
      await apiClient.post('/mobile/device-token', {
        expo_push_token: expoPushToken,
        device_id: deviceId,
        platform: Platform.OS,
      });
    } catch (error) {
      console.error('Failed to register device token:', error);
    }
  }

  setupNotificationHandlers() {
    // Foreground notifications
    Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
      // Update UI or show in-app notification
    });

    // User tapped notification
    Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification tapped:', response);
      // Navigate to relevant screen
    });
  }
}

export default new ExpoPushService();
```

#### Backend Tarafı

**1. Database Schema:**

```sql
-- Device tokens tablosu
CREATE TABLE device_tokens (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL,
    expo_push_token VARCHAR(500) NOT NULL,
    device_id VARCHAR(200) NULL,
    platform VARCHAR(20) NOT NULL, -- 'ios' veya 'android'
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_token (user_id, expo_push_token)
);
```

**2. Backend Service:**

```javascript
// Backend/src/services/expoPushService.js
const axios = require('axios');
const db = require('../config/dbConfig').db;
const logger = require('../utils/logger');

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

/**
 * Device token kaydetme
 */
const saveDeviceToken = async (userId, expoPushToken, deviceId, platform) => {
  // Mevcut token'ı deaktif et
  await db('device_tokens')
    .where('user_id', userId)
    .where('expo_push_token', expoPushToken)
    .update({ is_active: 0 });

  // Yeni token kaydet veya aktif et
  const [existing] = await db('device_tokens')
    .where('user_id', userId)
    .where('expo_push_token', expoPushToken)
    .select('*');

  if (existing) {
    await db('device_tokens')
      .where('id', existing.id)
      .update({
        is_active: 1,
        platform,
        device_id: deviceId,
        updated_at: new Date(),
      });
  } else {
    await db('device_tokens').insert({
      user_id: userId,
      expo_push_token: expoPushToken,
      device_id: deviceId,
      platform,
      is_active: 1,
    });
  }
};

/**
 * Expo Push Notification gönderme
 */
const sendExpoPushNotification = async (expoPushTokens, title, body, data = {}) => {
  const messages = expoPushTokens.map(token => ({
    to: token,
    sound: 'default',
    title,
    body,
    data,
    badge: 1,
  }));

  try {
    const response = await axios.post(EXPO_PUSH_URL, messages, {
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
    });

    return { success: true, response: response.data };
  } catch (error) {
    logger.error('Expo push notification error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Kullanıcıya push notification gönder
 */
const sendPushToUser = async (userId, title, body, data = {}) => {
  // Kullanıcının aktif device token'larını al
  const tokens = await db('device_tokens')
    .where('user_id', userId)
    .where('is_active', 1)
    .select('expo_push_token');

  if (tokens.length === 0) {
    logger.warn(`No active device tokens for user ${userId}`);
    return { success: false, message: 'No active tokens' };
  }

  const expoPushTokens = tokens.map(t => t.expo_push_token);

  return await sendExpoPushNotification(expoPushTokens, title, body, data);
};

module.exports = {
  saveDeviceToken,
  sendExpoPushNotification,
  sendPushToUser,
};
```

**3. Notification Service Entegrasyonu:**

```javascript
// Backend/src/services/notificationService.js içine ekle
const expoPushService = require('./expoPushService');

// Mevcut sendNotification fonksiyonunu güncelle
const sendNotification = async (userId, title, body, data = {}) => {
  // In-app notification kaydet (mevcut kod)
  const [notification] = await db('notifications').insert({
    user_id: userId,
    title,
    body,
    data_json: JSON.stringify(data),
    created_at: new Date(),
  }).returning('*');

  // Expo Push notification gönder
  try {
    await expoPushService.sendPushToUser(userId, title, body, {
      ...data,
      notificationId: notification.id.toString(),
    });
  } catch (error) {
    logger.warn('Expo push notification failed:', error);
  }

  return notification;
};
```

**4. API Endpoint:**

```javascript
// Backend/src/controllers/mobileController.js
const expoPushService = require('../services/expoPushService');

const saveDeviceToken = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { expo_push_token, device_id, platform } = req.body;

  await expoPushService.saveDeviceToken(
    userId,
    expo_push_token,
    device_id,
    platform
  );

  return sendSuccess(res, 'Device token kaydedildi');
});
```

### Firebase FCM'e Geçiş (Sonra Yapılacak)

MVP sonrası isterseniz Firebase FCM'e geçiş yapabilirsiniz. Expo Push token'ları FCM token'lara migrate edebilirsiniz.

---

## 📴 Offline Support (Basit)

### MVP Yaklaşımı: React Query Cache

**Kompleks offline queue yerine basit caching:**

```typescript
// src/api/config.ts
import { QueryClient } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 dakika
      cacheTime: 10 * 60 * 1000, // 10 dakika
      retry: 2, // Basit retry
      networkMode: 'online', // MVP'de online-only (cache fallback ile)
    },
  },
});

// Network status listener
let isConnected = true;

NetInfo.addEventListener(state => {
  isConnected = state.isConnected;
  
  if (isConnected) {
    // Online olduğunda stale queries'i refetch et
    queryClient.refetchQueries({ stale: true });
  }
});

export { queryClient, isConnected };
```

**Offline Feedback:**

```typescript
// src/components/OfflineBanner.tsx
import { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

export const OfflineBanner = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
    });

    return () => unsubscribe();
  }, []);

  if (isOnline) return null;

  return (
    <View style={{ backgroundColor: '#ff4444', padding: 8 }}>
      <Text style={{ color: 'white', textAlign: 'center' }}>
        İnternet bağlantınız yok
      </Text>
    </View>
  );
};
```

**Not:** MVP'de kompleks offline queue yok. Sadece cache'den okuma ve kullanıcıya offline durumu bildirme.

### Gelişmiş Offline Queue (Production Öncesi)

MVP sonrası offline queue architecture eklenebilir. Şimdilik React Query cache yeterli.

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

### Klasör Yapısı (MVP - Sadeleştirilmiş)

```
mobile-app/
├── src/
│   ├── api/
│   │   ├── client.ts              # Axios instance
│   │   ├── endpoints.ts           # API endpoints
│   │   └── services/
│   │       ├── auth.service.ts
│   │       ├── jobs.service.ts
│   │       ├── applications.service.ts
│   │       └── notifications.service.ts
│   ├── store/
│   │   └── authStore.ts          # Zustand (sadece auth & minimal UI)
│   ├── screens/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── jobs/
│   │   ├── applications/
│   │   └── profile/
│   ├── navigation/
│   │   └── AppNavigator.tsx
│   ├── utils/
│   │   ├── token.ts
│   │   └── storage.ts
│   └── types/
│       └── index.ts
├── App.tsx
├── app.json
└── package.json
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

```sql
-- Mevcut notifications tablosuna device token ekleyelim
ALTER TABLE notifications 
ADD COLUMN device_token VARCHAR(500) NULL,
ADD COLUMN push_sent BIT DEFAULT 0,
ADD COLUMN push_sent_at DATETIME NULL;

-- Yeni device_tokens tablosu
CREATE TABLE device_tokens (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL,
    device_token VARCHAR(500) NOT NULL,
    platform VARCHAR(20) NOT NULL, -- 'ios' veya 'android'
    device_id VARCHAR(200) NULL,
    app_version VARCHAR(20) NULL,
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_device (user_id, device_token)
);
```

#### 2. Backend Service Eklemeleri

```javascript
// Backend/src/services/pushNotificationService.js

const admin = require('firebase-admin');

// Firebase Admin SDK Initialize
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require('../config/firebase-service-account.json')),
  });
}

/**
 * Device token kaydetme
 */
const saveDeviceToken = async (userId, deviceToken, platform, deviceId, appVersion) => {
  // Mevcut token'ı deaktif et
  await db('device_tokens')
    .where('user_id', userId)
    .where('device_token', deviceToken)
    .update({ is_active: 0 });

  // Yeni token kaydet veya aktif et
  const [existing] = await db('device_tokens')
    .where('user_id', userId)
    .where('device_token', deviceToken)
    .select('*');

  if (existing) {
    await db('device_tokens')
      .where('id', existing.id)
      .update({
        is_active: 1,
        platform,
        device_id: deviceId,
        app_version: appVersion,
        updated_at: new Date(),
      });
  } else {
    await db('device_tokens').insert({
      user_id: userId,
      device_token: deviceToken,
      platform,
      device_id: deviceId,
      app_version: appVersion,
      is_active: 1,
    });
  }
};

/**
 * Push notification gönderme
 */
const sendPushNotification = async (userId, title, body, data = {}) => {
  // Kullanıcının aktif device token'larını al
  const tokens = await db('device_tokens')
    .where('user_id', userId)
    .where('is_active', 1)
    .select('device_token', 'platform');

  if (tokens.length === 0) return { success: false, message: 'No active tokens' };

  const messages = tokens.map(({ device_token, platform }) => ({
    token: device_token,
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
    logger.error('Push notification error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  saveDeviceToken,
  sendPushNotification,
};
```

#### 3. Notification Service Entegrasyonu

```javascript
// Backend/src/services/notificationService.js içine ekle

const pushNotificationService = require('./pushNotificationService');

// Mevcut sendNotification fonksiyonunu güncelle
const sendNotification = async (userId, title, body, data = {}) => {
  // In-app notification kaydet (mevcut kod)
  const [notification] = await db('notifications').insert({
    user_id: userId,
    title,
    body,
    data_json: JSON.stringify(data),
    created_at: new Date(),
  }).returning('*');

  // Push notification gönder
  try {
    await pushNotificationService.sendPushNotification(userId, title, body, {
      ...data,
      notificationId: notification.id.toString(),
    });
    
    // Push gönderim durumunu güncelle
    await db('notifications')
      .where('id', notification.id)
      .update({
        push_sent: 1,
        push_sent_at: new Date(),
      });
  } catch (error) {
    logger.warn('Push notification failed:', error);
  }

  return notification;
};
```

#### 4. Yeni API Endpoint

```javascript
// Backend/src/routes/doctorRoutes.js içine ekle

/**
 * Device token kaydetme endpoint
 */
router.post('/device-token',
  validate(deviceTokenSchema, 'body'),
  doctorController.saveDeviceToken
);

// Backend/src/controllers/doctorController.js
const saveDeviceToken = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { deviceToken, platform, deviceId, appVersion } = req.body;

  await pushNotificationService.saveDeviceToken(
    userId,
    deviceToken,
    platform,
    deviceId,
    appVersion
  );

  return sendSuccess(res, 'Device token kaydedildi');
});
```

### Mobil Uygulama Tarafı

```typescript
// src/services/pushNotificationService.ts
import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import apiClient from '../api/client';

class PushNotificationService {
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

  async getToken() {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      console.warn('Push notification permission denied');
      return null;
    }

    const token = await messaging().getToken();
    return token;
  }

  async registerToken() {
    try {
      const token = await this.getToken();
      if (!token) return;

      const deviceId = await DeviceInfo.getUniqueId();
      const appVersion = DeviceInfo.getVersion();

      await apiClient.post('/doctor/device-token', {
        deviceToken: token,
        platform: Platform.OS,
        deviceId,
        appVersion,
      });

      console.log('Device token registered');
    } catch (error) {
      console.error('Device token registration failed:', error);
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

export default new PushNotificationService();
```

---

## 📴 Offline Capability

### React Query ile Offline Support

```typescript
// src/api/config.ts
import { QueryClient } from '@tanstack/react-query';
import NetInfo from '@react-native-community/netinfo';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 dakika
      cacheTime: 10 * 60 * 1000, // 10 dakika
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      networkMode: 'offlineFirst', // Offline mode
    },
  },
});

// Network status listener
NetInfo.addEventListener(state => {
  if (state.isConnected) {
    // Online olduğunda tüm stale queries'i refetch et
    queryClient.refetchQueries();
  }
});
```

### Offline Queue (Critical Actions)

```typescript
// src/utils/offlineQueue.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

class OfflineQueue {
  private queueKey = '@medikariyer:offline_queue';

  async addToQueue(action: {
    type: string;
    endpoint: string;
    method: string;
    data: any;
    timestamp: number;
  }) {
    const queue = await this.getQueue();
    queue.push(action);
    await AsyncStorage.setItem(this.queueKey, JSON.stringify(queue));
  }

  async processQueue() {
    const isConnected = (await NetInfo.fetch()).isConnected;
    if (!isConnected) return;

    const queue = await this.getQueue();
    if (queue.length === 0) return;

    const processed: any[] = [];
    const failed: any[] = [];

    for (const action of queue) {
      try {
        // Execute action
        await this.executeAction(action);
        processed.push(action);
      } catch (error) {
        failed.push(action);
      }
    }

    // Remove processed actions
    const remainingQueue = queue.filter(
      item => !processed.find(p => p.timestamp === item.timestamp)
    );
    await AsyncStorage.setItem(this.queueKey, JSON.stringify(remainingQueue));

    return { processed, failed };
  }

  private async executeAction(action: any) {
    // API call implementation
  }

  private async getQueue(): Promise<any[]> {
    const data = await AsyncStorage.getItem(this.queueKey);
    return data ? JSON.parse(data) : [];
  }
}

export default new OfflineQueue();
```

---

## 📅 Geliştirme Fazları (5-6 Hafta)

### Faz 1: Temel Altyapı (1 hafta)
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

### Faz 2: Core Features (2 hafta)
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

### Faz 4: Testing & Bug Fixes (1 hafta)
**Hedef:** Beta test, bug fixes, UI improvements

- [ ] Unit tests (critical paths)
- [ ] Manual testing (tüm flows)
- [ ] Beta testing (gerçek doktor kullanıcılarla)
- [ ] Bug fixes
- [ ] UI/UX improvements
- [ ] Performance optimization (image loading, list performance)

---

### Faz 5: Production Prep (3-5 gün)
**Hedef:** Production build, store submission

- [ ] App store assets (icons, screenshots)
- [ ] App.json configuration
- [ ] Environment config (prod API URL)
- [ ] Production build (EAS Build)
- [ ] TestFlight / Internal testing
- [ ] Store submission (Apple App Store + Google Play)

**Toplam Süre: ~5-6 hafta**

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
- [ ] Offline queue architecture
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
1. ✅ Hızlı geliştirme (5-6 hafta)
2. ✅ Yalın mimari (gereksiz komplekslik yok)
3. ✅ Temel özellikler (jobs, applications, profile, notifications)
4. ✅ Expo Push (Firebase gerekmez)
5. ✅ Minimal backend değişiklikleri (`/api/mobile/*` layer)

### Önerilen Stack (MVP)
- **Framework**: React Native + Expo
- **Language**: TypeScript
- **State**: React Query (server) + Zustand (client)
- **Push**: Expo Push Notifications
- **Storage**: Expo Secure Store (tokens)
- **API**: Axios + React Query
- **Navigation**: React Navigation

### İlk Adımlar
1. **Backend**: `/api/mobile/*` layer'ını kur
2. **Mobile**: Expo projesi setup
3. **Auth**: Login/Register flow
4. **Core**: Dashboard, Jobs, Applications

### Production Öncesi
- SSL Pinning
- Advanced offline support
- Firebase FCM migration (opsiyonel)
- Comprehensive testing
- Monitoring & Analytics

**Not:** Bu MVP yaklaşımı ile hızlı bir şekilde çalışan bir mobil uygulama geliştirebilir, sonra production-ready hale getirebilirsiniz.

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

