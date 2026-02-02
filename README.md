<div align="center">

# 🏥 MediKariyer

### Sağlık Sektörü Kariyer Platformu

*Doktorlar ve hastaneleri buluşturan modern, full-stack kariyer çözümü*

[![Web](https://img.shields.io/badge/Web-Live-success?style=for-the-badge)](https://medikariyer.net)
[![Backend](https://img.shields.io/badge/Backend-v2.0.0-blue?style=for-the-badge)]()
[![Mobile](https://img.shields.io/badge/Mobile-v1.0.0-green?style=for-the-badge)]()
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)]()

[🌐 Demo](https://medikariyer.net) • [📱 Mobil Build](mobile-app/build%20almak%20için.md) • [📧 İletişim](#-iletişim)

</div>

---

## 💡 Proje Hakkında

**MediKariyer**, sağlık sektöründe çalışan doktorlar ile hastaneleri bir araya getiren, modern teknolojilerle geliştirilmiş kapsamlı bir kariyer platformudur. 

**3 ana platform** üzerinde çalışır:
- 🌐 **Web Uygulaması** - Hastaneler ve admin yönetimi için tam özellikli panel
- 📱 **Mobil Uygulama** - Doktorlar için iOS ve Android native deneyim
- 🔧 **REST API** - Güvenli, ölçeklenebilir backend altyapısı

Platform, **rol bazlı erişim kontrolü** (Admin, Hastane, Doktor) ile her kullanıcı tipine özel deneyim sunar.

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

### Gereksinimler

- **Node.js** >= 18.0.0
- **MSSQL Server** (veritabanı)
- **npm** veya **yarn**

### 1️⃣ Backend API

```bash
cd Backend
npm install

# .env dosyasını yapılandır
cp .env.example .env

# Sunucuyu başlat
npm run dev        # Geliştirme modu
npm start          # Production modu
```

**API Endpoint:** `http://localhost:3100/api`

### 2️⃣ Web Uygulaması

```bash
cd frontend
npm install

# .env dosyasını yapılandır
cp .env.example .env

# Geliştirme sunucusunu başlat
npm run dev        # http://localhost:5000
```

### 3️⃣ Mobil Uygulama

```bash
cd mobile-app
npm install

# .env dosyasını yapılandır
cp .env.example .env

# Expo ile başlat
npm start

# Platform seçenekleri
npm run android    # Android emulator
npm run ios        # iOS simulator
```

**Detaylı build talimatları:** [`mobile-app/build almak için.md`](mobile-app/build%20almak%20için.md)

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

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** Microsoft SQL Server (MSSQL)
- **ORM:** Knex.js
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** Joi
- **Security:** Helmet, CORS, bcryptjs
- **Rate Limiting:** express-rate-limit
- **Logging:** Winston (daily rotate file)
- **Email:** Nodemailer
- **PDF Generation:** Puppeteer
- **Cron Jobs:** node-cron
- **File Upload:** Multer

### Frontend (Web)
- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Data Fetching:** TanStack Query (React Query)
- **Routing:** React Router v6
- **Form Management:** React Hook Form + Zod
- **HTTP Client:** Axios
- **UI Components:** Headless UI, Radix UI
- **Icons:** Lucide React, Heroicons
- **Animations:** Framer Motion
- **Charts:** Recharts
- **Notifications:** React Toastify, Sonner
- **PDF Export:** jsPDF, html2canvas

### Mobile (React Native)
- **Framework:** React Native 0.81 + Expo 54
- **Language:** TypeScript
- **State Management:** Zustand
- **Data Fetching:** TanStack Query
- **Navigation:** React Navigation 7
- **Form Management:** React Hook Form + Zod
- **HTTP Client:** Axios
- **UI Components:** Custom component library
- **Animations:** React Native Reanimated
- **Gestures:** React Native Gesture Handler
- **Notifications:** Expo Notifications
- **Image Handling:** Expo Image, Expo Image Picker
- **Storage:** AsyncStorage, Expo Secure Store
- **Internationalization:** i18next, react-i18next
- **Error Tracking:** Sentry
- **Date Handling:** date-fns

### DevOps & Tools
- **Version Control:** Git
- **Package Manager:** npm
- **Process Manager:** PM2 (production)
- **Environment:** dotenv
- **Code Quality:** ESLint
- **Testing:** Jest, Testing Library
- **API Testing:** Postman/Thunder Client

---

## 🔐 Güvenlik Özellikleri

- 🔒 **JWT Authentication** - Access & refresh token mekanizması
- 👥 **Role-Based Access Control (RBAC)** - Admin, Hastane, Doktor rolleri
- 🛡️ **Rate Limiting** - API endpoint koruması ve DDoS önleme
- ✅ **Input Validation** - Joi ile server-side, Zod ile client-side validasyon
- 🔐 **Password Hashing** - bcryptjs ile güvenli şifre saklama
- 🚫 **SQL Injection Protection** - Parametreli sorgular
- 🔒 **Helmet.js** - HTTP header güvenliği
- 📝 **Request Logging** - Winston ile detaylı log kaydı
- 🔄 **Token Cleanup** - Otomatik expired token temizleme
- 📊 **Error Tracking** - Sentry entegrasyonu (mobile)
- 🔐 **Secure Storage** - Expo Secure Store (mobile)
- ⚠️ **Error Handling** - Global error handler ve user-friendly mesajlar

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

### Authentication
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/login` - Giriş yapma
- `POST /api/auth/refresh` - Token yenileme
- `POST /api/auth/logout` - Çıkış yapma
- `POST /api/auth/forgot-password` - Şifre sıfırlama isteği
- `POST /api/auth/reset-password` - Şifre sıfırlama

### Doctor (Web & Mobile)
- `GET /api/doctor/profile` - Profil bilgileri
- `PUT /api/doctor/profile` - Profil güncelleme
- `GET /api/doctor/jobs` - İş ilanları listesi
- `GET /api/doctor/jobs/:id` - İlan detayı
- `POST /api/doctor/applications` - Başvuru yapma
- `GET /api/doctor/applications` - Başvurularım
- `DELETE /api/doctor/applications/:id` - Başvuru geri çekme

### Hospital (Web)
- `GET /api/hospital/profile` - Hastane profili
- `PUT /api/hospital/profile` - Profil güncelleme
- `GET /api/hospital/jobs` - İlanlarım
- `POST /api/hospital/jobs` - İlan oluşturma
- `PUT /api/hospital/jobs/:id` - İlan güncelleme
- `DELETE /api/hospital/jobs/:id` - İlan silme
- `GET /api/hospital/applications` - Başvurular
- `PUT /api/hospital/applications/:id` - Başvuru durumu güncelleme

### Admin (Web)
- `GET /api/admin/users` - Kullanıcı listesi
- `PUT /api/admin/users/:id/approve` - Kullanıcı onaylama
- `GET /api/admin/jobs` - Tüm ilanlar
- `GET /api/admin/applications` - Tüm başvurular
- `GET /api/admin/photo-approvals` - Fotoğraf onayları
- `POST /api/admin/notifications/send` - Bildirim gönderme
- `GET /api/admin/logs` - Sistem logları

### Notifications
- `GET /api/notifications` - Bildirimler
- `GET /api/notifications/unread-count` - Okunmamış sayısı
- `PUT /api/notifications/:id/read` - Okundu işaretle
- `DELETE /api/notifications/:id` - Bildirim sil
- `GET /api/notifications/stream` - SSE stream

### Lookups
- `GET /api/lookup/specialties` - Uzmanlık alanları
- `GET /api/lookup/cities` - Şehirler
- `GET /api/lookup/languages` - Diller
- `GET /api/lookup/certificate-types` - Sertifika tipleri

---

## 🚀 Deployment

### Backend (Production)

```bash
# PM2 ile production deployment
cd Backend
npm install --production
npm run pm2:start

# PM2 komutları
npm run pm2:stop      # Durdur
npm run pm2:restart   # Yeniden başlat
npm run pm2:logs      # Logları görüntüle
```

### Frontend (Production)

```bash
cd frontend
npm install
npm run build

# Build çıktısı: frontend/dist/
# Nginx, Apache veya static hosting servisine deploy edilebilir
```

### Mobile (Store Deployment)

**Android APK (Test):**
```bash
cd mobile-app/android
$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"
.\gradlew assembleRelease
```

**Android AAB (Google Play):**
```bash
cd mobile-app/android
$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"
.\gradlew bundleRelease
```

**Detaylı rehber:** [`mobile-app/build almak için.md`](mobile-app/build%20almak%20için.md)

---

## 🧪 Testing

```bash
# Backend tests
cd Backend
npm test

# Frontend tests
cd frontend
npm test

# Mobile tests
cd mobile-app
npm test
```

---

## 📝 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=3100
API_PREFIX=/api

# Database
DB_SERVER=localhost
DB_NAME=medikariyer
DB_USER=sa
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password

# Frontend URL
FRONTEND_URL=https://medikariyer.net
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:3100/api
VITE_APP_NAME=MediKariyer
```

### Mobile (.env)
```env
API_BASE_URL=http://10.0.2.2:3100/api
APP_ENV=development
```

---

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

---

## 👨‍💻 Geliştirici

**Kemal Kerem Acar**

Full-Stack Developer

---

## 📧 İletişim

Sorularınız için issue açabilir veya iletişime geçebilirsiniz.

---

<div align="center">

**Made with ❤️ for the healthcare community**

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!

</div>
