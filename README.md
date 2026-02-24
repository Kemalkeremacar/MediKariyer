<div align="center">

# 🏥 MediKariyer

### Sağlık Sektörü Kariyer Platformu

*Doktorlar ve hastaneleri buluşturan modern, full-stack kariyer çözümü*

[![Web](https://img.shields.io/badge/Web-Live-success?style=for-the-badge)](https://medikariyer.net)
[![Backend](https://img.shields.io/badge/Backend-v2.0.0-blue?style=for-the-badge)]()
[![Mobile](https://img.shields.io/badge/Mobile-v1.0.2-green?style=for-the-badge)]()
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)]()
[![Node](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)]()
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)]()
[![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB?style=for-the-badge&logo=react&logoColor=black)]()

[🌐 Demo](https://medikariyer.net) • [📱 Mobil Build](mobile-app/build%20almak%20için.md) • [📖 API Docs](#-api-endpoints) • [🚀 Deployment](#-deployment)

</div>

---

## 💡 Proje Hakkında

**MediKariyer**, sağlık sektöründe çalışan doktorlar ile hastaneleri bir araya getiren, modern teknolojilerle geliştirilmiş enterprise-grade kariyer platformudur. Platform, iş bulma sürecini dijitalleştirerek hem doktorların kariyer gelişimini hem de hastanelerin nitelikli personel bulma sürecini optimize eder.

### 🎯 Platform Mimarisi

**3 ana bileşen** üzerinde çalışan mikroservis benzeri yapı:

- 🌐 **Web Uygulaması** - Hastaneler ve admin yönetimi için tam özellikli SPA (Single Page Application)
  - React 18 + Vite ile yüksek performanslı UI
  - Responsive design ile tüm cihazlarda sorunsuz çalışma
  - Real-time bildirimler ve SSE (Server-Sent Events) desteği

- 📱 **Mobil Uygulama** - Doktorlar için native iOS ve Android deneyimi
  - React Native + Expo ile cross-platform geliştirme
  - TypeScript ile tip güvenli kod
  - Offline-first yaklaşım ve push notification desteği

- 🔧 **REST API** - Güvenli, ölçeklenebilir ve dokümante edilmiş backend
  - Node.js + Express.js ile yüksek performanslı API
  - JWT tabanlı authentication ve role-based authorization
  - Rate limiting, request validation ve comprehensive logging

### 👥 Kullanıcı Rolleri

Platform, **3 farklı kullanıcı rolü** ile granular erişim kontrolü sağlar:

- **👨‍⚕️ Doktor** - İş arama, başvuru yapma, profil yönetimi (Mobil)
- **🏥 Hastane** - İlan yayınlama, başvuru değerlendirme, aday yönetimi (Web)
- **👨‍💼 Admin** - Sistem yönetimi, kullanıcı onaylama, içerik moderasyonu (Web)

---

## ✨ Özellikler

<table>
<tr>
<td width="33%">

### 👨‍⚕️ Doktorlar İçin

**Mobil Uygulama (iOS & Android)**

- 🔍 **Akıllı İş Arama**
  - Uzmanlık, şehir, pozisyon filtreleme
  - Gelişmiş arama ve sıralama
  - Favori ilanlar
  
- 👤 **Dijital Profil & CV**
  - Eğitim, deneyim, sertifika yönetimi
  - Dil becerileri
  - Fotoğraf yükleme ve onay sistemi
  - PDF CV oluşturma
  
- 📝 **Başvuru Yönetimi**
  - Tek tıkla başvuru
  - Başvuru durumu takibi
  - Başvuru geri çekme
  
- 🔔 **Bildirimler**
  - Push notification
  - Anlık başvuru güncellemeleri
  - Yeni iş fırsatları
  
- 🌐 **Çoklu Dil**
  - Türkçe / İngilizce

</td>
<td width="33%">

### 🏥 Hastaneler İçin

**Web Paneli**

- 📢 **İlan Yönetimi**
  - İlan oluşturma ve düzenleme
  - Durum yönetimi (aktif/pasif)
  - Otomatik 30 gün sonra pasifleştirme
  - Detaylı iş tanımları
  
- 👥 **Başvuru Yönetimi**
  - Başvuruları görüntüleme ve filtreleme
  - Durum güncelleme (değerlendiriliyor, kabul, red)
  - Doktor profillerini inceleme
  - CV görüntüleme ve indirme
  
- 📊 **Dashboard & Raporlama**
  - İlan istatistikleri
  - Başvuru analitiği
  - Görsel grafikler
  
- 🏢 **Kurum Profili**
  - Hastane bilgileri
  - Logo yönetimi
  - İletişim bilgileri
  
- 🔔 **Bildirim Sistemi**
  - Yeni başvuru bildirimleri
  - Anlık güncellemeler

</td>
<td width="33%">

### 👨‍💼 Admin İçin

**Yönetim Paneli**

- 👥 **Kullanıcı Yönetimi**
  - Doktor onaylama/reddetme
  - Hastane onaylama
  - Kullanıcı aktif/pasif yapma
  - Detaylı kullanıcı profilleri
  
- 📸 **Fotoğraf Onay Sistemi**
  - Doktor fotoğraflarını onaylama
  - Uygunsuz içerik kontrolü
  
- 💼 **İş İlanı Kontrolü**
  - Tüm ilanları görüntüleme
  - İlan düzenleme ve silme
  - İstatistikler
  
- 📋 **Başvuru Takibi**
  - Tüm başvuruları görüntüleme
  - Sistem geneli raporlar
  
- 🔔 **Bildirim Gönderimi**
  - Toplu bildirim gönderme
  - Rol bazlı bildirimler
  - Özel kullanıcı bildirimleri
  
- 📧 **İletişim Mesajları**
  - Contact form mesajlarını yönetme
  
- 📊 **Sistem Logları**
  - Detaylı log görüntüleme
  - Hata takibi

</td>
</tr>
</table>

---

## 🚀 Hızlı Başlangıç

### 📋 Gereksinimler

Projeyi çalıştırmak için aşağıdaki yazılımların sisteminizde kurulu olması gerekmektedir:

| Yazılım | Minimum Versiyon | Önerilen | Açıklama |
|---------|------------------|----------|----------|
| **Node.js** | 18.0.0 | 20.x LTS | JavaScript runtime |
| **npm** | 9.0.0 | 10.x | Paket yöneticisi |
| **MSSQL Server** | 2019 | 2022 | Veritabanı sunucusu |
| **Git** | 2.30+ | Latest | Versiyon kontrol |

**Opsiyonel (Mobil Geliştirme için):**
- Android Studio (Android development)
- Xcode (iOS development - macOS only)
- Java JDK 17+ (Android build için)

### 1️⃣ Backend API Kurulumu

```bash
# Proje dizinine git
cd Backend

# Bağımlılıkları yükle
npm install

# Environment dosyasını oluştur
cp .env.example .env

# .env dosyasını düzenle (veritabanı bilgileri, JWT secret vb.)
# Gerekli değişkenler için aşağıdaki Environment Variables bölümüne bakın

# Geliştirme modunda başlat (hot-reload ile)
npm run dev

# VEYA Production modunda başlat
npm start
```

**API Endpoint:** `http://localhost:3100/api`

**Sunucu Durumu Kontrolü:**
```bash
curl http://localhost:3100/api/health
```

### 2️⃣ Web Uygulaması Kurulumu

```bash
# Frontend dizinine git
cd frontend

# Bağımlılıkları yükle
npm install

# Environment dosyasını oluştur
cp .env.example .env

# .env dosyasını düzenle
# VITE_API_BASE_URL=http://localhost:3100/api

# Geliştirme sunucusunu başlat
npm run dev
```

**Web Uygulaması:** `http://localhost:5000`

**Production Build:**
```bash
npm run build
# Build çıktısı: frontend/dist/
```

### 3️⃣ Mobil Uygulama Kurulumu

```bash
# Mobil uygulama dizinine git
cd mobile-app

# Bağımlılıkları yükle
npm install

# Environment dosyasını oluştur
cp .env.example .env

# .env dosyasını düzenle
# API_BASE_URL=http://10.0.2.2:3100/api (Android emulator için)
# API_BASE_URL=http://localhost:3100/api (iOS simulator için)

# Expo development server'ı başlat
npm start

# Platform seçenekleri
npm run android    # Android emulator/device
npm run ios        # iOS simulator (macOS only)
npm run web        # Web browser
```

**Detaylı build talimatları:** [`mobile-app/build almak için.md`](mobile-app/build%20almak%20için.md)

### 🔧 Veritabanı Kurulumu

1. MSSQL Server'ı kurun ve çalıştırın
2. Yeni bir veritabanı oluşturun (örn: `MEDIKARIYER_DEV`)
3. Backend `.env` dosyasında veritabanı bilgilerini güncelleyin
4. Uygulama ilk çalıştırıldığında gerekli tablolar otomatik oluşturulacaktır

**Not:** Migration scriptleri için `Backend/migrations/` klasörünü kontrol edin.

---

## 🏗️ Proje Yapısı

```
MediKariyer/
│
├── 🔧 Backend/                 # Express.js REST API
│   ├── src/
│   │   ├── config/            # Veritabanı, güvenlik yapılandırması
│   │   ├── controllers/       # İş mantığı kontrolörleri
│   │   │   └── mobile/        # Mobil-specific endpoint'ler
│   │   ├── middleware/        # Auth, validation, rate limiting
│   │   ├── routes/            # API route tanımları
│   │   ├── services/          # Business logic katmanı
│   │   │   └── mobile/        # Mobil servisler
│   │   ├── utils/             # Yardımcı fonksiyonlar
│   │   ├── validators/        # Joi validation şemaları
│   │   └── templates/         # Email şablonları
│   ├── server.js              # Ana sunucu dosyası
│   └── expressLoader.js       # Express yapılandırması
│
├── 🌐 frontend/               # React Web Uygulaması
│   ├── src/
│   │   ├── components/        # Yeniden kullanılabilir bileşenler
│   │   │   ├── layout/        # Header, Footer, Sidebar
│   │   │   └── ui/            # Button, Modal, Input vb.
│   │   ├── features/          # Feature-based organizasyon
│   │   │   ├── admin/         # Admin paneli
│   │   │   ├── auth/          # Kimlik doğrulama
│   │   │   ├── doctor/        # Doktor paneli
│   │   │   ├── hospital/      # Hastane paneli
│   │   │   └── public/        # Public sayfalar
│   │   ├── config/            # Uygulama yapılandırması
│   │   ├── hooks/             # Custom React hooks
│   │   ├── middleware/        # Route guards
│   │   ├── services/          # API client
│   │   ├── store/             # Zustand state management
│   │   └── utils/             # Yardımcı fonksiyonlar
│   └── vite.config.js         # Vite yapılandırması
│
└── 📱 mobile-app/             # React Native Mobil Uygulama
    ├── src/
    │   ├── api/               # API client ve servisler
    │   │   └── services/      # Feature-based servisler
    │   ├── components/        # UI bileşenleri
    │   │   ├── composite/     # Karmaşık bileşenler
    │   │   ├── feedback/      # Loading, Error states
    │   │   └── ui/            # Temel UI bileşenleri
    │   ├── features/          # Feature modülleri
    │   │   ├── auth/          # Kimlik doğrulama
    │   │   ├── jobs/          # İş ilanları
    │   │   ├── applications/  # Başvurular
    │   │   ├── profile/       # Profil yönetimi
    │   │   └── notifications/ # Bildirimler
    │   ├── navigation/        # React Navigation
    │   ├── hooks/             # Custom hooks
    │   ├── store/             # Zustand state
    │   ├── theme/             # Tema ve stil sistemi
    │   ├── types/             # TypeScript tipleri
    │   ├── utils/             # Yardımcı fonksiyonlar
    │   └── locales/           # i18n çevirileri
    ├── android/               # Android native kod
    └── app.json               # Expo yapılandırması
```

---

## 🛠️ Teknoloji Stack

### Backend Architecture

<table>
<tr>
<td width="50%">

**Core Technologies**
- **Runtime:** Node.js 18+ (LTS)
- **Framework:** Express.js 4.19
- **Database:** Microsoft SQL Server
- **Query Builder:** Knex.js 3.1
- **Language:** JavaScript (ES6+)

**Authentication & Security**
- **JWT:** jsonwebtoken 9.0
- **Password Hashing:** bcryptjs 2.4
- **Security Headers:** Helmet 8.1
- **CORS:** cors 2.8
- **Rate Limiting:** express-rate-limit 7.1

**Validation & Error Handling**
- **Schema Validation:** Joi 17.9
- **Error Logging:** Winston 3.11
- **Log Rotation:** winston-daily-rotate-file 5.0
- **Request Logging:** Morgan 1.10

</td>
<td width="50%">

**Additional Services**
- **Email Service:** Nodemailer 6.9
- **PDF Generation:** Puppeteer 24.32
- **File Upload:** Multer 2.0
- **Cron Jobs:** node-cron 3.0
- **UUID Generation:** uuid 9.0
- **Compression:** compression 1.7

**Development Tools**
- **Hot Reload:** nodemon 3.0
- **Code Quality:** ESLint 8.57
- **Process Manager:** PM2 (production)
- **Environment:** dotenv 16.4

**API Features**
- RESTful API design
- JWT-based authentication
- Role-based authorization (RBAC)
- Request validation & sanitization
- Comprehensive error handling
- Structured logging
- Rate limiting & DDoS protection

</td>
</tr>
</table>

### Frontend (Web) Architecture

<table>
<tr>
<td width="50%">

**Core Technologies**
- **Framework:** React 18.2
- **Build Tool:** Vite 5.2
- **Language:** JavaScript (JSX)
- **Styling:** Tailwind CSS 3.4
- **Routing:** React Router v6.23

**State Management**
- **Global State:** Zustand 4.4
- **Server State:** TanStack Query 5.86
- **Form State:** React Hook Form 7.62

**UI Components & Styling**
- **Component Library:** Headless UI 2.2, Radix UI
- **Icons:** Lucide React 0.542, Heroicons 2.2
- **Animations:** Framer Motion 12.23
- **Utilities:** clsx, tailwind-merge

</td>
<td width="50%">

**Data & Validation**
- **HTTP Client:** Axios 1.11
- **Schema Validation:** Zod 3.22
- **Form Validation:** @hookform/resolvers 5.2
- **JWT Decode:** jwt-decode 4.0

**UI/UX Features**
- **Notifications:** React Toastify 11.0, Sonner 2.0
- **Charts:** Recharts 3.2
- **PDF Export:** jsPDF 3.0, html2canvas 1.4
- **Floating UI:** @floating-ui/react 0.27
- **Icons:** React Icons 5.5

**Development Tools**
- **Dev Server:** Vite (HMR)
- **Testing:** Jest, Testing Library, Cypress
- **Code Quality:** ESLint
- **Fonts:** @fontsource/poppins

</td>
</tr>
</table>

### Mobile (React Native) Architecture

<table>
<tr>
<td width="50%">

**Core Technologies**
- **Framework:** React Native 0.81
- **Platform:** Expo 54.0
- **Language:** TypeScript 5.3
- **Runtime:** Hermes JS Engine
- **Architecture:** New Architecture Enabled

**State Management**
- **Global State:** Zustand 5.0
- **Server State:** TanStack Query 5.62
- **Form State:** React Hook Form 7.54
- **Persistent Storage:** AsyncStorage 2.2

**Navigation**
- **Library:** React Navigation 7.0
- **Stack Navigation:** Native Stack 7.2
- **Tab Navigation:** Bottom Tabs 7.2
- **Gestures:** React Native Gesture Handler 2.28
- **Animations:** React Native Reanimated 4.1

</td>
<td width="50%">

**Expo Modules**
- **Notifications:** expo-notifications 0.32
- **Image Handling:** expo-image 3.0, expo-image-picker 17.0
- **Secure Storage:** expo-secure-store 15.0
- **Device Info:** expo-device 8.0, expo-application 7.0
- **Haptics:** expo-haptics 15.0
- **Linking:** expo-linking 8.0
- **Localization:** expo-localization 17.0
- **UI Components:** expo-blur 15.0, expo-linear-gradient 15.0

**Additional Features**
- **HTTP Client:** Axios 1.7
- **Validation:** Zod 3.24
- **Date Handling:** date-fns 4.1
- **i18n:** i18next 25.8, react-i18next 16.5
- **JWT:** jwt-decode 4.0
- **Error Tracking:** Sentry 7.2
- **Performance:** @shopify/flash-list 2.0
- **Bottom Sheet:** @gorhom/bottom-sheet 5.2
- **Network Info:** @react-native-community/netinfo 11.4

</td>
</tr>
</table>

### DevOps & Infrastructure

- **Version Control:** Git
- **Package Manager:** npm
- **Process Manager:** PM2 (production)
- **Environment Management:** dotenv
- **Code Quality:** ESLint
- **API Testing:** Postman, Thunder Client
- **Monitoring:** Winston logs, Sentry (mobile)
- **Deployment:** Manual deployment, CI/CD ready

---

## 🔐 Güvenlik Özellikleri

MediKariyer, enterprise-grade güvenlik standartlarını karşılayan kapsamlı güvenlik önlemleri içerir:

### Authentication & Authorization
- 🔒 **JWT Authentication** - Stateless authentication with access & refresh token mechanism
  - Access token: 15 dakika (kısa ömürlü, güvenli)
  - Refresh token: 7 gün (uzun ömürlü, güvenli storage)
  - Token rotation ve automatic renewal
- � **Role-Based Access Control (RBAC)** - Granular permission system
  - 3 farklı rol: Admin, Hastane, Doktor
  - Route-level ve resource-level authorization
  - Middleware-based access control
- ✅ **Account Approval System** - Admin onayı ile kullanıcı aktivasyonu
- 🔐 **Password Security** - bcryptjs ile salt + hash (10 rounds)

### API Security
- 🛡️ **Rate Limiting** - Endpoint bazlı istek sınırlama
  - Login: 5 deneme / 15 dakika
  - API endpoints: 100 istek / 15 dakika
  - DDoS ve brute-force attack koruması
- ✅ **Input Validation** - Multi-layer validation
  - Server-side: Joi schema validation
  - Client-side: Zod schema validation
  - SQL injection prevention
  - XSS attack prevention
- 🔒 **Helmet.js** - HTTP security headers
  - Content Security Policy (CSP)
  - X-Frame-Options (clickjacking protection)
  - X-Content-Type-Options
  - Strict-Transport-Security (HSTS)
- 🌐 **CORS Configuration** - Whitelist-based origin control

### Data Security
- 🔐 **Secure Storage** - Platform-specific secure storage
  - Web: HttpOnly cookies (XSS protection)
  - Mobile: Expo Secure Store (encrypted keychain/keystore)
- 🗄️ **SQL Injection Protection** - Parametreli sorgular (Knex.js)
- 🔄 **Soft Delete Pattern** - Veri bütünlüğü ve audit trail
- 📝 **Comprehensive Logging** - Winston ile detaylı log kaydı
  - Request/response logging
  - Error tracking
  - Security event logging
  - Daily log rotation (14 gün saklama)

### Application Security
- 🔄 **Token Cleanup** - Otomatik expired token temizleme (günlük cron)
- ⚠️ **Error Handling** - Güvenli hata mesajları
  - Production'da detay gizleme
  - User-friendly error messages
  - Stack trace sanitization
- 📊 **Error Tracking** - Sentry entegrasyonu (mobile)
- 🔍 **Request Sanitization** - Malicious input filtering
- 🚫 **File Upload Security** - Multer ile güvenli dosya yükleme
  - File type validation
  - File size limits
  - Secure file naming

### Network Security
- 🔒 **HTTPS Enforcement** - Production'da zorunlu HTTPS
- 🌐 **Network State Detection** - Offline/online durumu kontrolü (mobile)
- 📡 **API Endpoint Protection** - Environment-based URL configuration

---

## 📱 Mobil Uygulama Özellikleri

### Platform Desteği
- ✅ **Android** - APK ve AAB build desteği
- ✅ **iOS** - IPA build desteği (yakında)

### Teknik Özellikler
- 📱 **Native Performance** - Expo managed workflow
- 🌐 **Offline Support** - Network durumu kontrolü
- 🔔 **Push Notifications** - Expo Notifications
- 📸 **Image Upload** - Expo Image Picker
- 🎨 **Custom Theme System** - Dark/Light mode hazır
- 🌍 **Internationalization** - TR/EN dil desteği
- ♿ **Accessibility** - WCAG uyumlu
- 📊 **Performance Monitoring** - Sentry entegrasyonu
- 🔄 **Auto Updates** - OTA (Over-The-Air) güncellemeler

### Build & Deployment
- 📦 **APK Build** - Test için local build
- 📦 **AAB Build** - Google Play Store için
- 🔑 **Keystore Management** - Güvenli imzalama
- 📝 **Version Management** - Semantic versioning

**Detaylı build rehberi:** [`mobile-app/build almak için.md`](mobile-app/build%20almak%20için.md)

---

## 🎯 Öne Çıkan Özellikler

### Backend
- ✅ **RESTful API** - Clean architecture ve best practices
- ✅ **Cron Jobs** - Otomatik token temizleme ve ilan süresi kontrolü
- ✅ **Email Service** - Nodemailer ile hoş geldin ve şifre sıfırlama mailleri
- ✅ **PDF Generation** - Puppeteer ile CV oluşturma
- ✅ **File Upload** - Multer ile güvenli dosya yükleme
- ✅ **SSE (Server-Sent Events)** - Gerçek zamanlı bildirimler
- ✅ **Soft Delete** - Veri bütünlüğü için soft delete pattern
- ✅ **Query Helpers** - Dinamik filtreleme, sıralama, pagination
- ✅ **Error Handling** - Merkezi hata yönetimi ve logging

### Frontend
- ✅ **Feature-Based Architecture** - Modüler ve ölçeklenebilir yapı
- ✅ **Responsive Design** - Mobil, tablet, desktop uyumlu
- ✅ **Dark Mode Ready** - Tema sistemi hazır (aktif değil)
- ✅ **Optimistic Updates** - React Query ile hızlı UI güncellemeleri
- ✅ **Form Validation** - React Hook Form + Zod ile tip güvenli validasyon
- ✅ **Route Guards** - AuthGuard, RoleGuard, ApprovalGuard
- ✅ **Error Boundary** - Hata yakalama ve kullanıcı dostu mesajlar
- ✅ **Toast Notifications** - Başarı/hata bildirimleri
- ✅ **Modal System** - Global modal yönetimi
- ✅ **PDF Export** - CV ve raporları PDF olarak indirme

### Mobile
- ✅ **TypeScript** - Tip güvenli kod
- ✅ **Custom Component Library** - Yeniden kullanılabilir UI bileşenleri
- ✅ **Navigation System** - Stack, Tab, Drawer navigation
- ✅ **Form Management** - React Hook Form + Zod
- ✅ **Image Optimization** - Expo Image ile performanslı görsel yükleme
- ✅ **Offline Detection** - Network durumu kontrolü ve kullanıcı bildirimi
- ✅ **Error Handling** - Global error boundary ve user-friendly mesajlar
- ✅ **Loading States** - Skeleton screens ve loading indicators
- ✅ **Empty States** - Boş durum tasarımları
- ✅ **Pull to Refresh** - Liste yenileme

---

## 📊 API Endpoints

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| POST | `/register` | Yeni kullanıcı kaydı (Doktor/Hastane) | ❌ |
| POST | `/login` | Kullanıcı girişi (JWT token) | ❌ |
| POST | `/refresh` | Access token yenileme | ✅ Refresh Token |
| POST | `/logout` | Çıkış yapma (token invalidation) | ✅ |
| POST | `/forgot-password` | Şifre sıfırlama isteği (email) | ❌ |
| POST | `/reset-password` | Şifre sıfırlama (token ile) | ❌ |
| GET | `/verify-token` | Token doğrulama | ✅ |

### 👨‍⚕️ Doctor (`/api/doctor`)
| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| GET | `/profile` | Profil bilgilerini getir | ✅ Doctor |
| PUT | `/profile` | Profil güncelle | ✅ Doctor |
| POST | `/profile/photo` | Profil fotoğrafı yükle | ✅ Doctor |
| GET | `/jobs` | İş ilanları listesi (filtreleme, pagination) | ✅ Doctor |
| GET | `/jobs/:id` | İlan detayı | ✅ Doctor |
| POST | `/applications` | İlana başvur | ✅ Doctor |
| GET | `/applications` | Başvurularım | ✅ Doctor |
| GET | `/applications/:id` | Başvuru detayı | ✅ Doctor |
| DELETE | `/applications/:id` | Başvuru geri çek | ✅ Doctor |
| GET | `/cv/generate` | PDF CV oluştur | ✅ Doctor |

### 🏥 Hospital (`/api/hospital`)
| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| GET | `/profile` | Hastane profili | ✅ Hospital |
| PUT | `/profile` | Profil güncelle | ✅ Hospital |
| POST | `/profile/logo` | Logo yükle | ✅ Hospital |
| GET | `/jobs` | İlanlarım (pagination, filter) | ✅ Hospital |
| POST | `/jobs` | Yeni ilan oluştur | ✅ Hospital |
| GET | `/jobs/:id` | İlan detayı | ✅ Hospital |
| PUT | `/jobs/:id` | İlan güncelle | ✅ Hospital |
| DELETE | `/jobs/:id` | İlan sil (soft delete) | ✅ Hospital |
| PATCH | `/jobs/:id/status` | İlan durumu değiştir (aktif/pasif) | ✅ Hospital |
| GET | `/applications` | Başvurular (filtreleme, sıralama) | ✅ Hospital |
| GET | `/applications/:id` | Başvuru detayı | ✅ Hospital |
| PUT | `/applications/:id/status` | Başvuru durumu güncelle | ✅ Hospital |
| GET | `/dashboard/stats` | Dashboard istatistikleri | ✅ Hospital |

### 👨‍💼 Admin (`/api/admin`)
| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| GET | `/users` | Tüm kullanıcılar (pagination, filter) | ✅ Admin |
| GET | `/users/:id` | Kullanıcı detayı | ✅ Admin |
| PUT | `/users/:id/approve` | Kullanıcı onayla | ✅ Admin |
| PUT | `/users/:id/reject` | Kullanıcı reddet | ✅ Admin |
| PATCH | `/users/:id/status` | Kullanıcı durumu (aktif/pasif) | ✅ Admin |
| GET | `/doctors` | Doktor listesi | ✅ Admin |
| GET | `/hospitals` | Hastane listesi | ✅ Admin |
| GET | `/jobs` | Tüm ilanlar | ✅ Admin |
| PUT | `/jobs/:id` | İlan düzenle | ✅ Admin |
| DELETE | `/jobs/:id` | İlan sil | ✅ Admin |
| GET | `/applications` | Tüm başvurular | ✅ Admin |
| GET | `/photo-approvals` | Fotoğraf onay bekleyenler | ✅ Admin |
| PUT | `/photo-approvals/:id/approve` | Fotoğraf onayla | ✅ Admin |
| PUT | `/photo-approvals/:id/reject` | Fotoğraf reddet | ✅ Admin |
| POST | `/notifications/send` | Toplu bildirim gönder | ✅ Admin |
| GET | `/dashboard/stats` | Sistem istatistikleri | ✅ Admin |

### 🔔 Notifications (`/api/notifications`)
| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| GET | `/` | Bildirimler listesi (pagination) | ✅ |
| GET | `/unread-count` | Okunmamış bildirim sayısı | ✅ |
| GET | `/:id` | Bildirim detayı | ✅ |
| PUT | `/:id/read` | Okundu işaretle | ✅ |
| PUT | `/mark-all-read` | Tümünü okundu işaretle | ✅ |
| DELETE | `/:id` | Bildirim sil | ✅ |
| DELETE | `/clear-all` | Tüm bildirimleri temizle | ✅ |
| GET | `/stream` | SSE stream (real-time) | ✅ |

### 📋 Lookups (`/api/lookup`)
| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| GET | `/specialties` | Uzmanlık alanları | ❌ |
| GET | `/cities` | Şehirler | ❌ |
| GET | `/languages` | Diller | ❌ |
| GET | `/certificate-types` | Sertifika tipleri | ❌ |
| GET | `/degree-types` | Eğitim dereceleri | ❌ |
| GET | `/position-types` | Pozisyon tipleri | ❌ |

### 📧 Contact (`/api/contact`)
| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| POST | `/` | İletişim formu gönder | ❌ |
| GET | `/` | Mesajlar listesi | ✅ Admin |
| GET | `/:id` | Mesaj detayı | ✅ Admin |
| PUT | `/:id/read` | Okundu işaretle | ✅ Admin |
| DELETE | `/:id` | Mesaj sil | ✅ Admin |

### 📝 Logs (`/api/logs`)
| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| GET | `/` | Sistem logları (pagination, filter) | ✅ Admin |
| GET | `/:id` | Log detayı | ✅ Admin |
| DELETE | `/clear` | Eski logları temizle | ✅ Admin |

### 📄 PDF (`/api/pdf`)
| Method | Endpoint | Açıklama | Auth |
|--------|----------|----------|------|
| POST | `/generate-cv` | CV PDF oluştur | ✅ Doctor |
| GET | `/download/:filename` | PDF indir | ✅ |

### 📱 Mobile Specific (`/api/mobile`)
Mobil uygulama için optimize edilmiş endpoint'ler (response transformers ile):
- `/mobile/auth/*` - Mobil auth endpoints
- `/mobile/jobs/*` - Mobil iş ilanları
- `/mobile/applications/*` - Mobil başvurular
- `/mobile/profile/*` - Mobil profil
- `/mobile/notifications/*` - Mobil bildirimler
- `/mobile/lookup/*` - Mobil lookup data

**Not:** Tüm endpoint'ler JSON formatında response döner. Hata durumlarında standart error format kullanılır.

---

## 🚀 Deployment

### Backend Deployment (Production)

#### PM2 ile Production Deployment

```bash
# Production dizinine git
cd Backend

# Production bağımlılıklarını yükle
npm install --production

# Environment dosyasını yapılandır
cp .env.example .env.production
# .env.production dosyasını düzenle

# PM2 ile başlat
npm run pm2:start

# PM2 Yönetim Komutları
npm run pm2:stop      # Sunucuyu durdur
npm run pm2:restart   # Sunucuyu yeniden başlat
npm run pm2:logs      # Logları görüntüle
npm run pm2:delete    # PM2'den kaldır

# PM2 monitoring
pm2 monit             # Real-time monitoring
pm2 status            # Durum kontrolü
pm2 list              # Tüm process'leri listele
```

#### Manuel Production Deployment

```bash
cd Backend
NODE_ENV=production npm start
```

#### Environment Variables (Production)

```env
NODE_ENV=production
PORT=3100

# Database (Production)
DB_HOST=your_production_db_host
DB_NAME=MEDIKARIYER_PROD
DB_USER=prod_user
DB_PASSWORD=strong_password

# JWT (Production - Güçlü secret'lar kullanın)
JWT_SECRET=your_very_strong_jwt_secret_here
JWT_REFRESH_SECRET=your_very_strong_refresh_secret_here

# SMTP (Production)
SMTP_HOST=your_smtp_host
SMTP_USER=your_email
SMTP_PASS=your_password

# Frontend URL
FRONTEND_URL=https://yourdomain.com
```

#### Nginx Configuration (Reverse Proxy)

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3100;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Frontend Deployment (Production)

#### Build & Deploy

```bash
cd frontend

# Production bağımlılıklarını yükle
npm install

# Environment dosyasını yapılandır
cp .env.example .env.production

# Production build
npm run build

# Build çıktısı: frontend/dist/
# Bu klasörü static hosting servisine deploy edin
```

#### Nginx Configuration (Static Hosting)

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/medikariyer/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Deployment Options

- **Vercel** - Zero-config deployment
  ```bash
  npm install -g vercel
  vercel --prod
  ```

- **Netlify** - Drag & drop or CLI
  ```bash
  npm install -g netlify-cli
  netlify deploy --prod --dir=dist
  ```

- **AWS S3 + CloudFront** - Scalable static hosting
- **DigitalOcean App Platform** - Managed hosting
- **Traditional VPS** - Nginx + manual deployment

### Mobile Deployment (Store)

#### Android APK (Test/Internal Distribution)

```bash
cd mobile-app/android

# Java Home ayarla (Windows)
$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"

# Release APK oluştur
.\gradlew assembleRelease

# APK konumu:
# android/app/build/outputs/apk/release/app-release.apk
```

#### Android AAB (Google Play Store)

```bash
cd mobile-app/android

# Java Home ayarla
$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"

# Release AAB oluştur
.\gradlew bundleRelease

# AAB konumu:
# android/app/build/outputs/bundle/release/app-release.aab
```

#### iOS IPA (App Store)

```bash
# macOS gereklidir
cd mobile-app

# EAS Build kullanarak
eas build --platform ios --profile production

# Veya Xcode ile manuel build
# 1. Xcode'da projeyi aç
# 2. Product > Archive
# 3. Distribute App > App Store Connect
```

#### Keystore Management (Android)

```bash
# Yeni keystore oluştur
keytool -genkeypair -v -storetype PKCS12 -keystore medikariyer-release.keystore -alias medikariyer -keyalg RSA -keysize 2048 -validity 10000

# Keystore bilgilerini gradle.properties'e ekle
MYAPP_RELEASE_STORE_FILE=medikariyer-release.keystore
MYAPP_RELEASE_KEY_ALIAS=medikariyer
MYAPP_RELEASE_STORE_PASSWORD=your_store_password
MYAPP_RELEASE_KEY_PASSWORD=your_key_password
```

**Detaylı build rehberi:** [`mobile-app/build almak için.md`](mobile-app/build%20almak%20için.md)

### Database Migration (Production)

```bash
# Backup oluştur
sqlcmd -S server -U user -P password -Q "BACKUP DATABASE MEDIKARIYER_PROD TO DISK='backup.bak'"

# Migration scriptlerini çalıştır
cd Backend/migrations
# SQL scriptlerini sırayla çalıştır
```

### Monitoring & Maintenance

#### Log Management

```bash
# Winston logs konumu
Backend/logs/
├── application-YYYY-MM-DD.log  # Genel loglar
├── error-YYYY-MM-DD.log        # Hata logları
└── combined-YYYY-MM-DD.log     # Tüm loglar

# Log rotation: 14 gün otomatik temizleme
# Max file size: 20MB
```

#### Health Check

```bash
# API health check
curl https://api.yourdomain.com/api/health

# Database connection check
curl https://api.yourdomain.com/api/health/db
```

#### Performance Monitoring

- **Backend:** PM2 monitoring, Winston logs
- **Frontend:** Browser DevTools, Lighthouse
- **Mobile:** Sentry error tracking, Expo analytics

### CI/CD Pipeline (Örnek)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy Backend
        run: |
          cd Backend
          npm install --production
          pm2 restart medikariyer-api

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build & Deploy Frontend
        run: |
          cd frontend
          npm install
          npm run build
          # Deploy to hosting service
```

---

## 🧪 Testing

### Backend Testing

```bash
cd Backend

# Unit tests çalıştır
npm test

# Test coverage raporu
npm run test:coverage

# Specific test file
npm test -- authController.test.js

# Watch mode (development)
npm run test:watch
```

**Test Yapısı:**
```
Backend/
├── __tests__/
│   ├── unit/
│   │   ├── controllers/
│   │   ├── services/
│   │   └── utils/
│   ├── integration/
│   │   └── api/
│   └── fixtures/
│       └── testData.js
```

### Frontend Testing

```bash
cd frontend

# Unit & Integration tests
npm test

# E2E tests (Cypress)
npm run test:e2e

# Test coverage
npm run test:coverage

# Component tests
npm run test:component
```

**Test Araçları:**
- **Unit Testing:** Jest, Testing Library
- **E2E Testing:** Cypress
- **Component Testing:** React Testing Library
- **Mocking:** MSW (Mock Service Worker)

### Mobile Testing

```bash
cd mobile-app

# Jest tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

**Test Yapısı:**
```
mobile-app/
├── __tests__/
│   ├── components/
│   ├── screens/
│   ├── hooks/
│   └── utils/
```

### API Testing

**Postman Collection:**
- Import: `docs/postman/MediKariyer-API.postman_collection.json`
- Environment: `docs/postman/MediKariyer-ENV.postman_environment.json`

**Thunder Client:**
- Collection: `docs/thunder-client/`

**Manual Testing:**
```bash
# Health check
curl http://localhost:3100/api/health

# Login test
curl -X POST http://localhost:3100/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

### Load Testing

```bash
# Apache Bench
ab -n 1000 -c 10 http://localhost:3100/api/health

# Artillery
artillery quick --count 10 --num 100 http://localhost:3100/api/health
```

---

## 📝 Environment Variables

### Backend Environment Variables

**Development (.env):**
```env
# ============================
# APPLICATION
# ============================
NODE_ENV=development
PORT=3100
API_PREFIX=/api

# ============================
# DATABASE
# ============================
DB_HOST=localhost
DB_PORT=1433
DB_NAME=MEDIKARIYER_DEV
DB_USER=sa
DB_PASSWORD=your_password
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true

# ============================
# JWT AUTHENTICATION
# ============================
JWT_SECRET=your_jwt_secret_key_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_key_min_32_chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ============================
# DEFAULT ADMIN ACCOUNT
# ============================
ADMIN_EMAIL=admin@medikariyer.com
ADMIN_PASSWORD=Admin123!

# ============================
# EMAIL SERVICE (SMTP)
# ============================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EMAIL_FROM="MediKariyer <noreply@medikariyer.com>"

# ============================
# PASSWORD RESET
# ============================
PASSWORD_RESET_EXPIRY_MINUTES=60
FRONTEND_RESET_PASSWORD_URL=http://localhost:5000/reset-password?token={token}

# ============================
# FRONTEND URL
# ============================
FRONTEND_URL=http://localhost:5000

# ============================
# LOGGING
# ============================
LOG_LEVEL=debug
ENABLE_DB_LOGGING=true
DB_LOG_LEVEL=info
LOG_MAX_SIZE=20m
LOG_MAX_FILES=14d

# ============================
# FILE UPLOAD
# ============================
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/jpg,application/pdf

# ============================
# RATE LIMITING
# ============================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOGIN_RATE_LIMIT_MAX=5

# ============================
# CORS
# ============================
CORS_ORIGIN=http://localhost:5000,http://localhost:19006
```

**Production (.env.production):**
```env
NODE_ENV=production
PORT=3100

# Production database
DB_HOST=your_production_db_host
DB_NAME=MEDIKARIYER_PROD
DB_USER=prod_user
DB_PASSWORD=strong_production_password

# Strong JWT secrets (use random generators)
JWT_SECRET=your_very_strong_production_jwt_secret_min_64_chars
JWT_REFRESH_SECRET=your_very_strong_production_refresh_secret_min_64_chars

# Production SMTP
SMTP_HOST=smtp.yourdomain.com
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=strong_smtp_password

# Production URLs
FRONTEND_URL=https://yourdomain.com
FRONTEND_RESET_PASSWORD_URL=https://yourdomain.com/reset-password?token={token}

# Production logging
LOG_LEVEL=info
ENABLE_DB_LOGGING=true

# Production CORS
CORS_ORIGIN=https://yourdomain.com
```

### Frontend Environment Variables

**Development (.env):**
```env
# API Base URL
VITE_API_BASE_URL=http://localhost:3100/api

# Application
VITE_APP_NAME=MediKariyer
VITE_APP_ENV=development

# Features
VITE_ENABLE_DEVTOOLS=true
VITE_ENABLE_MOCK_API=false
```

**Production (.env.production):**
```env
# API Base URL
VITE_API_BASE_URL=https://api.yourdomain.com/api

# Application
VITE_APP_NAME=MediKariyer
VITE_APP_ENV=production

# Features
VITE_ENABLE_DEVTOOLS=false
VITE_ENABLE_MOCK_API=false
```

### Mobile Environment Variables

**Development (.env):**
```env
# API Configuration
API_BASE_URL=http://10.0.2.2:3100/api
# 10.0.2.2 = Android emulator localhost
# localhost = iOS simulator
# Your IP = Physical device

# Application
APP_ENV=development
APP_NAME=MediKariyer

# Features
ENABLE_PUSH_NOTIFICATIONS=true
ENABLE_SENTRY=false

# Sentry (Error Tracking)
SENTRY_DSN=your_sentry_dsn_here
```

**Production (.env.production):**
```env
# API Configuration
API_BASE_URL=https://api.yourdomain.com/api

# Application
APP_ENV=production
APP_NAME=MediKariyer

# Features
ENABLE_PUSH_NOTIFICATIONS=true
ENABLE_SENTRY=true

# Sentry
SENTRY_DSN=your_production_sentry_dsn
```

**app.json (Expo Config):**
```json
{
  "expo": {
    "extra": {
      "EXPO_PUBLIC_API_BASE_URL": "https://api.yourdomain.com/api/mobile",
      "EXPO_PUBLIC_PRIMARY_API_BASE_URL": "https://api.yourdomain.com/api",
      "EXPO_PUBLIC_APP_ENV": "production",
      "EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS": "true",
      "EXPO_PUBLIC_SENTRY_DSN": "your_sentry_dsn"
    }
  }
}
```

### Environment Variable Security

**🔒 Güvenlik Önerileri:**

1. **Asla commit etmeyin:** `.env` dosyalarını `.gitignore`'a ekleyin
2. **Güçlü secret'lar:** Minimum 32 karakter, random generated
3. **Production secrets:** Production'da farklı ve güçlü secret'lar kullanın
4. **Secret rotation:** Periyodik olarak secret'ları değiştirin
5. **Environment separation:** Dev, staging, production için ayrı environment'lar

**Secret Generation:**
```bash
# Node.js ile random secret oluşturma
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# OpenSSL ile
openssl rand -hex 64
```

---

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakınız.

```
MIT License

Copyright (c) 2024 MediKariyer

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Projeye katkıda bulunmak için:

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: Add some AmazingFeature'`)
4. Branch'inizi push edin (`git push origin feature/AmazingFeature`)
5. Pull Request açın

**Commit Convention:** [Conventional Commits](https://www.conventionalcommits.org/)
- `feat:` Yeni özellik
- `fix:` Bug fix
- `docs:` Dokümantasyon
- `style:` Code style değişiklikleri
- `refactor:` Code refactoring
- `test:` Test ekleme/düzenleme
- `chore:` Build, dependencies vb.

---

## 📚 Dokümantasyon

- **API Documentation:** [Postman Collection](docs/postman/)
- **Architecture:** [Architecture.md](docs/ARCHITECTURE.md)
- **Database Schema:** [Database.md](docs/DATABASE.md)
- **Mobile Build Guide:** [mobile-app/build almak için.md](mobile-app/build%20almak%20için.md)
- **Changelog:** [CHANGELOG.md](CHANGELOG.md)

---

## 🐛 Bilinen Sorunlar & Roadmap

### Bilinen Sorunlar
- [ ] iOS build testi yapılmadı (macOS gerekli)
- [ ] Dark mode implementasyonu tamamlanmadı
- [ ] Email template'leri responsive değil

### Roadmap
- [ ] **v2.1.0**
  - [ ] Dark mode desteği
  - [ ] Advanced search filters
  - [ ] Email notification preferences
  - [ ] Export data (CSV, Excel)
  
- [ ] **v2.2.0**
  - [ ] Video interview integration
  - [ ] Chat system (doctor-hospital)
  - [ ] Calendar integration
  - [ ] Advanced analytics dashboard
  
- [ ] **v3.0.0**
  - [ ] AI-powered job matching
  - [ ] Resume parser
  - [ ] Multi-language support (EN, DE, FR)
  - [ ] Mobile web version

---

## 👨‍💻 Geliştirici

**Kemal Kerem Acar**

Full-Stack Developer | React | React Native | Node.js

- 🌐 Website: [medikariyer.net](https://medikariyer.net)
- 📧 Email: info@medikariyer.net
- 💼 LinkedIn: [linkedin.com/in/kemalkeremacar](https://linkedin.com/in/kemalkeremacar)
- 🐙 GitHub: [@kemalkeremacar](https://github.com/kemalkeremacar)

---

## 📧 İletişim & Destek

Sorularınız, önerileriniz veya hata bildirimleri için:

- 📧 **Email:** info@medikariyer.net
- 🐛 **Bug Report:** [GitHub Issues](https://github.com/yourusername/medikariyer/issues)
- 💬 **Discussions:** [GitHub Discussions](https://github.com/yourusername/medikariyer/discussions)
- 🌐 **Website:** [medikariyer.net](https://medikariyer.net)

---

## 🙏 Teşekkürler

Bu proje aşağıdaki açık kaynak projeleri kullanmaktadır:

- [Node.js](https://nodejs.org/) - JavaScript runtime
- [React](https://react.dev/) - UI library
- [React Native](https://reactnative.dev/) - Mobile framework
- [Expo](https://expo.dev/) - React Native platform
- [Express.js](https://expressjs.com/) - Web framework
- [Vite](https://vitejs.dev/) - Build tool
- [TanStack Query](https://tanstack.com/query) - Data fetching
- [Zustand](https://zustand-demo.pmnd.rs/) - State management
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- Ve daha fazlası...

---

<div align="center">

**Made with ❤️ for the healthcare community**

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!

[⬆ Başa Dön](#-medikariyer)

---

**© 2024 MediKariyer. All rights reserved.**

</div>
