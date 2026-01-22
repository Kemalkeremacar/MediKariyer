# 🔍 Production Hazırlık - Kapsamlı Analiz ve Checklist

**Tarih:** 22 Ocak 2026  
**Proje:** MediKariyer Mobile App  
**Analiz Tipi:** Tüm Sistem İncelemesi + Store Submission Hazırlık

---

## 📊 EXECUTİVE SUMMARY

| Kategori | Toplam Kontrol | Gerçek Sorun | Yanlış Alarm | Aciliyet |
|----------|----------------|--------------|--------------|----------|
| **Teknik Sorunlar** | 49 | 13 | 36 | 🔴 P0 + 🟡 P1 |
| **Store Submission** | 13 | 13 | 0 | 🟡 P1 |
| **Ek Gereksinimler** | 8 | 8 | 0 | 🟡 P1 + 🟢 P2 |
| **TOPLAM** | **70** | **34** | **36** | - |

### 🎯 Kritik Özet:
- **13 Teknik Sorun** (P0: 5, P1: 8)
- **21 Store/Production Gereksinimi** (P0: 4, P1: 17)
- **Minimum Hazırlık Süresi:** 1 hafta
- **Önerilen Hazırlık Süresi:** 2 hafta
- **İdeal Hazırlık Süresi:** 1 ay

---

## 📋 İÇİNDEKİLER

1. [Teknik Sorunlar Analizi](#-teknik-sorunlar-analizi)
2. [Store Submission Gereksinimleri](#-store-submission-gereksinimleri)
3. [Ek Production Gereksinimleri](#-ek-production-gereksinimleri)
4. [Öncelik Matrisi](#-öncelik-matrisi)
5. [Zaman Planlaması](#-zaman-planlaması)
6. [Checklist](#-production-checklist)

---


# 🔧 TEKNİK SORUNLAR ANALİZİ

## 📊 Özet Durum

| Kategori | Kontrol | Gerçek Sorun | Yanlış Alarm | Aciliyet |
|----------|---------|--------------|--------------|----------|
| Platform Spesifik | 8 | 3 | 5 | 🔴 P0 |
| Native & Expo | 7 | 2 | 5 | 🔴 P0 |
| Crash Potansiyeli | 7 | 0 | 7 | ✅ OK |
| Build & Release | 8 | 4 | 4 | 🔴 P0 |
| Sistemsel Riskler | 7 | 2 | 5 | 🟡 P1 |
| Environment & Config | 4 | 2 | 2 | 🔴 P0 |
| Memory & Performance | 3 | 0 | 3 | ✅ OK |
| Security & Data | 3 | 0 | 3 | ✅ OK |
| Code Quality | 2 | 1 | 1 | 🟡 P1 |

**TOPLAM:** 49 kontrol → **13 gerçek sorun** (27%) + **36 yanlış alarm** (73%)

---

## 🔴 P0 - KRİTİK SORUNLAR (Build Blocker)

### 1. iOS Build Configuration Eksik
**Sorun:** iOS için temel build ayarları tanımlı değil  
**Etki:** iOS build alınamaz veya runtime crash  
**Süre:** 45 dakika

**Eksikler:**
- `bundleIdentifier` yok (örn: `com.medikariyer.mobile`)
- `buildNumber` yok (örn: `1`)
- `infoPlist` yok (permission strings için gerekli)

**Çözüm:**
```json
// mobile-app/app.json
"ios": {
  "supportsTablet": true,
  "bundleIdentifier": "com.medikariyer.mobile",
  "buildNumber": "1",
  "infoPlist": {
    "NSCameraUsageDescription": "Profil fotoğrafı çekmek için kamera erişimi gereklidir",
    "NSPhotoLibraryUsageDescription": "Profil fotoğrafı seçmek için galeri erişimi gereklidir"
  }
}
```

---

### 2. EAS Project ID Eksik
**Sorun:** Push notification için EAS projectId tanımlı değil  
**Etki:** Push notification çalışmaz  
**Süre:** 30 dakika

**Çözüm:**
```bash
# Terminal'de çalıştır
cd mobile-app
eas init
```

---

### 3. Expo Notifications Plugin Eksik
**Sorun:** Notification plugin app.json'da tanımlı değil  
**Etki:** Notification icon/sound çalışmaz  
**Süre:** 1 saat

**Çözüm:**
```json
// mobile-app/app.json
"plugins": [
  "expo-secure-store",
  "@react-native-community/datetimepicker",
  [
    "expo-notifications",
    {
      "icon": "./assets/notification-icon.png",
      "color": "#ffffff",
      "sounds": ["./assets/notification-sound.wav"]
    }
  ]
]
```

---

### 4. .env.production Dosyası Eksik
**Sorun:** Production environment variables tanımlı değil  
**Etki:** Production build'de local IP kullanılır, API çalışmaz  
**Süre:** 30 dakika

**Çözüm:**
```bash
# mobile-app/.env.production
EXPO_PUBLIC_API_BASE_URL=https://api.medikariyer.com/api/mobile
EXPO_PUBLIC_PRIMARY_API_BASE_URL=https://api.medikariyer.com/api
EXPO_PUBLIC_APP_ENV=production
EXPO_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

---

### 5. eas.json Configuration Eksik
**Sorun:** EAS build profilleri tanımlı değil  
**Etki:** Build profilleri ayrılamaz, env variables yönetilemez  
**Süre:** 30 dakika

**Çözüm:**
```json
// mobile-app/eas.json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_APP_ENV": "development"
      }
    },
    "preview": {
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_APP_ENV": "staging"
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_APP_ENV": "production"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

**P0 TOPLAM SÜRE:** 3-4 saat

---

## 🟡 P1 - ORTA VADELİ SORUNLAR

### 1. Android Permissions Explicit Declaration
**Sorun:** Android permissions array tanımlı değil  
**Etki:** Best practice değil, Expo otomatik ekler ama explicit olması daha iyi  
**Süre:** 30 dakika

---

### 2. Font Scaling Accessibility
**Sorun:** Font scaling global olarak kapalı  
**Etki:** Görme engelliler için erişilebilirlik sorunu  
**Süre:** 1 gün

---

### 3. Sentry DSN Configuration
**Sorun:** Sentry DSN .env'de yok  
**Etki:** Production crash tracking yok  
**Süre:** 1 saat

---

### 4. Console Log Cleanup
**Sorun:** Production'da console.log'lar temizlenmiyor  
**Etki:** Performance ve güvenlik  
**Süre:** 30 dakika

**Çözüm:**
```bash
npm install --save-dev babel-plugin-transform-remove-console
```

```javascript
// mobile-app/babel.config.js
module.exports = function (api) {
  api.cache(true);
  const plugins = ['react-native-reanimated/plugin'];
  
  if (process.env.EXPO_PUBLIC_APP_ENV === 'production') {
    plugins.push(['transform-remove-console', { exclude: ['error', 'warn'] }]);
  }
  
  return {
    presets: ['babel-preset-expo'],
    plugins,
  };
};
```

---

### 5. TypeScript Strict Mode
**Sorun:** Strict mode kontrolü yapılmamış  
**Etki:** Type safety eksik olabilir  
**Süre:** 30 dakika (kontrol) + düzeltmeler

---

### 6-8. Store Metadata, Privacy Policy, Beta Testing
*(Store Submission bölümünde detaylı)*

**P1 TOPLAM SÜRE:** 1-2 hafta

---

## ✅ SORUN YOK - DOĞRU ÇALIŞIYOR

### Güvenlik ✅
- Token encryption (SecureStore)
- Device fingerprint binding
- No hardcoded secrets
- Secure API communication

### Memory Management ✅
- Tüm timer'lar cleanup ediliyor
- useEffect cleanup fonksiyonları var
- No memory leaks

### Error Handling ✅
- Comprehensive try-catch
- React Query error handling
- Error boundary kapsayıcı

### Code Quality ✅
- Optional chaining kullanılıyor
- Null checks var
- Array operations güvenli

---


# 📱 STORE SUBMISSION GEREKSİNİMLERİ

## 1️⃣ Developer Accounts (ZORUNLU)

| Platform | Maliyet | Durum | Süre |
|----------|---------|-------|------|
| Apple Developer Account | $99/yıl | ❌ Oluşturulmalı | 1 gün |
| Google Play Developer | $25 (tek seferlik) | ❌ Oluşturulmalı | 1 gün |

**Not:** Account onayı 24-48 saat sürebilir.

---

## 2️⃣ App Metadata (ZORUNLU)

### app.json Düzeltmeleri
**Süre:** 10 dakika

```json
{
  "expo": {
    "name": "MediKariyer",  // ❌ Şu an: "mobile-app"
    "slug": "medikariyer",  // ❌ Şu an: "mobile-app"
    "description": "Sağlık profesyonelleri için iş bulma platformu",  // ❌ Eksik
    "primaryColor": "#007AFF",  // ❌ Eksik
    "owner": "medikariyer-team",  // ❌ Eksik
    
    "android": {
      "package": "com.medikariyer.mobile",  // ✅ OK
      "versionCode": 1  // ❌ Eksik
    }
  }
}
```

### Store Listing Metinleri
**Süre:** 1 gün

#### App Name
- **iOS:** MediKariyer (30 karakter max)
- **Android:** MediKariyer (50 karakter max)

#### Short Description (Google Play - 80 karakter)
```
Doktorlar için iş bulma ve kariyer yönetimi platformu
```

#### Full Description (4000 karakter max)
```
MediKariyer, sağlık profesyonellerinin kariyer hedeflerine ulaşmalarını sağlayan 
kapsamlı bir mobil platformdur.

ÖZELLİKLER:
• İş İlanları: Binlerce sağlık kurumundan güncel iş ilanları
• Hızlı Başvuru: Tek tıkla iş başvurusu yapın
• Profil Yönetimi: Dijital CV'nizi oluşturun ve yönetin
• Bildirimler: Yeni iş fırsatlarından anında haberdar olun
• Güvenli Platform: Verileriniz şifreli ve güvende

HEDEF KİTLE:
• Doktorlar
• Hemşireler
• Sağlık teknisyenleri
• Tıp öğrencileri

İLETİŞİM:
• Web: https://medikariyer.com
• E-posta: destek@medikariyer.com
• Telefon: +90 XXX XXX XX XX
```

#### Keywords (App Store - 100 karakter)
```
doktor,iş,kariyer,sağlık,hastane,hemşire,tıp,iş ilanı,başvuru
```

---

## 3️⃣ Görseller (ZORUNLU)

### App Icon ✅
- **1024x1024** (mevcut: `./assets/icon.png`)
- Transparent background olmamalı
- Alpha channel olmamalı

### Screenshots ❌
**Süre:** 2-3 gün

#### iOS Gereksinimleri:
- **6.7" (iPhone 14 Pro Max):** En az 3, max 10 screenshot
- **6.5" (iPhone 11 Pro Max):** En az 3, max 10 screenshot
- **5.5" (iPhone 8 Plus):** En az 3, max 10 screenshot
- **Boyut:** 1290x2796, 1242x2688, 1242x2208
- **Format:** PNG veya JPG

#### Android Gereksinimleri:
- **Phone:** En az 2, max 8 screenshot
- **Tablet (7"):** En az 2, max 8 screenshot (opsiyonel)
- **Tablet (10"):** En az 2, max 8 screenshot (opsiyonel)
- **Boyut:** Min 320px, Max 3840px
- **Format:** PNG veya JPG

#### Önerilen Screenshot'lar:
1. Onboarding/Welcome ekranı
2. Login ekranı
3. İş ilanları listesi
4. İş detay sayfası
5. Profil sayfası
6. Başvuru ekranı
7. Bildirimler
8. Ayarlar

### Feature Graphic (Google Play - ZORUNLU) ❌
**Süre:** 1 gün

- **Boyut:** 1024x500
- **Format:** PNG veya JPG
- **Kullanım:** Play Store'da banner olarak gösterilir

### Promo Video ⚠️
**Süre:** 2-3 gün (opsiyonel ama önerilen)

- **Süre:** 15-30 saniye
- **Format:** MP4
- **Boyut:** Max 100MB
- **İçerik:** App'in temel özelliklerini göster

---

## 4️⃣ Yasal Dökümanlar

### Mevcut ✅
- **Privacy Policy:** `https://medikariyer.com/gizlilik-politikasi`
- **Terms of Service:** `https://medikariyer.com/kullanim-kosullari`

### Eksik ❌
- **Support URL:** `https://medikariyer.com/destek` (oluşturulmalı)
- **Marketing URL:** `https://medikariyer.com` (opsiyonel)

**Süre:** 1 saat

---

## 5️⃣ App Store Specific (iOS)

### Category
- **Primary:** Medical
- **Secondary:** Business (opsiyonel)

### Age Rating
- **Önerilen:** 12+ (medical content nedeniyle)

### Copyright
```
© 2026 MediKariyer. Tüm hakları saklıdır.
```

### Contact Information
- **Email:** destek@medikariyer.com
- **Phone:** +90 XXX XXX XX XX
- **Website:** https://medikariyer.com

**Süre:** 30 dakika

---

## 6️⃣ Google Play Specific (Android)

### Content Rating Questionnaire
**Süre:** 1 saat

Sorular:
- App'te şiddet var mı? → Hayır
- App'te cinsel içerik var mı? → Hayır
- App'te küfür var mı? → Hayır
- App'te alkol/uyuşturucu referansı var mı? → Hayır
- App kullanıcı tarafından oluşturulan içerik paylaşıyor mu? → Hayır
- App konum bilgisi topluyor mu? → Hayır
- App kişisel bilgi topluyor mu? → Evet (email, telefon, CV)

### Target Audience
- **Hedef Yaş:** 18+
- **Hedef Kitle:** Sağlık profesyonelleri

### Data Safety Form
**Süre:** 1 saat

**Toplanan Veriler:**
- ✅ Kişisel Bilgiler (Ad, Soyad, Email, Telefon)
- ✅ Fotoğraflar (Profil fotoğrafı)
- ✅ Dosyalar (CV, sertifikalar)
- ✅ Konum (İş başvuruları için şehir bilgisi)
- ✅ Cihaz ID (Push notification için)

**Veri Kullanımı:**
- App functionality
- Analytics
- Communication

**Veri Paylaşımı:**
- İşverenlerle (başvuru yapıldığında)
- Üçüncü parti servisler (Sentry, Analytics)

**Güvenlik:**
- Data encrypted in transit (HTTPS)
- Data encrypted at rest (SecureStore)
- User can request data deletion

---

## 7️⃣ Test Hesapları

### Demo Accounts
**Süre:** 30 dakika

Reviewer'lar için test hesapları:

```
Doctor Account:
Email: test.doctor@medikariyer.com
Password: TestDoctor123!

Hospital Account:
Email: test.hospital@medikariyer.com
Password: TestHospital123!
```

**Not:** Bu hesaplar backend'de oluşturulmalı ve onaylanmalı durumda olmalı.

---

## 8️⃣ Backend Production Kontrolü

### Checklist
**Süre:** 1 saat

- [ ] Production API URL'leri hazır mı? (`https://api.medikariyer.com`)
- [ ] SSL sertifikası geçerli mi? (Let's Encrypt veya commercial)
- [ ] Rate limiting production için ayarlı mı?
- [ ] Database backup stratejisi var mı?
- [ ] Monitoring/alerting sistemi var mı? (Sentry, CloudWatch, vb.)
- [ ] Load balancing yapılandırılmış mı?
- [ ] CDN kullanılıyor mu? (görseller için)
- [ ] Error logging aktif mi?
- [ ] API documentation güncel mi?

---


# 🚀 EK PRODUCTION GEREKSİNİMLERİ

## 1️⃣ App Signing (ZORUNLU)

### Android Signing
**Süre:** 1 saat  
**Aciliyet:** 🔴 P0

**Gerekli:**
- Keystore oluşturulmalı (production signing için)
- Key alias ve password belirlenmeli
- Keystore güvenli bir yerde saklanmalı

**Komutlar:**
```bash
# Keystore oluştur
keytool -genkeypair -v -storetype PKCS12 \
  -keystore medikariyer-release.keystore \
  -alias medikariyer-key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# EAS'a ekle
eas credentials
```

**Önemli:**
- ❌ Keystore'u Git'e commit etme!
- ✅ Güvenli bir yerde yedekle (1Password, LastPass, vb.)
- ✅ Alias ve password'ü kaydet

---

### iOS Signing
**Süre:** 2 saat  
**Aciliyet:** 🔴 P0

**Gerekli:**
- Apple Developer Account
- Distribution Certificate
- Provisioning Profile
- App ID registration

**EAS ile otomatik:**
```bash
eas credentials
# EAS otomatik olarak certificate ve profile oluşturur
```

---

## 2️⃣ .gitignore Güvenlik Güncellemesi

### Eksik Entries
**Süre:** 5 dakika  
**Aciliyet:** 🔴 P0

```gitignore
# Environment
.env.production
.env.local
.env.*.local

# Signing
*.keystore
*.jks
*.p12
*.mobileprovision
google-services.json
GoogleService-Info.plist

# EAS
eas.json  # Eğer secret içeriyorsa

# Sentry
.sentryclirc
```

---

## 3️⃣ Universal Links / App Links Setup

### iOS Universal Links
**Süre:** 2 saat  
**Aciliyet:** 🟡 P1

**Gerekli:**
1. Associated Domains capability ekle
2. `.well-known/apple-app-site-association` dosyası oluştur
3. Domain'de host et

```json
// https://medikariyer.com/.well-known/apple-app-site-association
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAM_ID.com.medikariyer.mobile",
        "paths": [
          "/jobs/*",
          "/applications/*",
          "/profile/*"
        ]
      }
    ]
  }
}
```

```json
// mobile-app/app.json
"ios": {
  "associatedDomains": ["applinks:medikariyer.com"]
}
```

---

### Android App Links
**Süre:** 2 saat  
**Aciliyet:** 🟡 P1

**Gerekli:**
1. `.well-known/assetlinks.json` dosyası oluştur
2. Domain'de host et
3. Intent filters ekle

```json
// https://medikariyer.com/.well-known/assetlinks.json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.medikariyer.mobile",
    "sha256_cert_fingerprints": [
      "YOUR_SHA256_FINGERPRINT"
    ]
  }
}]
```

```json
// mobile-app/app.json
"android": {
  "intentFilters": [
    {
      "action": "VIEW",
      "autoVerify": true,
      "data": [
        {
          "scheme": "https",
          "host": "medikariyer.com",
          "pathPrefix": "/jobs"
        }
      ],
      "category": ["BROWSABLE", "DEFAULT"]
    }
  ]
}
```

---

## 4️⃣ OTA Updates (Expo Updates)

### Configuration
**Süre:** 1 saat  
**Aciliyet:** 🟡 P1

```json
// mobile-app/app.json
"updates": {
  "enabled": true,
  "checkAutomatically": "ON_LOAD",
  "fallbackToCacheTimeout": 0,
  "url": "https://u.expo.dev/YOUR_PROJECT_ID"
}
```

**Update Stratejisi:**
- **ON_LOAD:** App açıldığında kontrol et
- **ON_ERROR_RECOVERY:** Sadece crash sonrası kontrol et
- **NEVER:** Manuel kontrol

**Komutlar:**
```bash
# Update yayınla
eas update --branch production --message "Bug fixes"

# Rollback
eas update:rollback --branch production
```

---

## 5️⃣ Analytics & Monitoring

### Google Analytics / Firebase Analytics
**Süre:** 4 saat  
**Aciliyet:** 🟡 P1

**Kurulum:**
```bash
npm install @react-native-firebase/app @react-native-firebase/analytics
```

**Tracked Events:**
- Screen views
- Job applications
- Profile updates
- Search queries
- Button clicks

---

### Performance Monitoring
**Süre:** 2 saat  
**Aciliyet:** 🟡 P1

**Metrikler:**
- App startup time
- Screen render time
- API response time
- Network request failures
- Memory usage

**Tool:** Sentry Performance Monitoring (zaten kurulu, sadece DSN ekle)

---

## 6️⃣ Localization (i18n)

### Çoklu Dil Desteği
**Süre:** 1 hafta  
**Aciliyet:** 🟢 P2 (Optional)

**Şu an:** Sadece Türkçe  
**Potansiyel:** İngilizce, Arapça

**Kurulum:**
```bash
npm install i18next react-i18next
```

**Yapı:**
```
mobile-app/src/locales/
  ├── tr/
  │   ├── common.json
  │   ├── auth.json
  │   └── jobs.json
  └── en/
      ├── common.json
      ├── auth.json
      └── jobs.json
```

---

## 7️⃣ E2E Testing

### Test Framework
**Süre:** 2 hafta  
**Aciliyet:** 🟢 P2 (Optional)

**Önerilen:** Maestro (React Native için optimize)

```bash
# Kurulum
curl -Ls "https://get.maestro.mobile.dev" | bash

# Test yazma
maestro test flows/login.yaml
```

**Test Senaryoları:**
- Login flow
- Job application flow
- Profile update flow
- Search flow
- Notification flow

---

## 8️⃣ ASO (App Store Optimization)

### Keyword Research
**Süre:** 1 gün  
**Aciliyet:** 🟡 P1

**Tools:**
- App Annie
- Sensor Tower
- Mobile Action

**Hedef Keywords:**
- doktor iş ilanları
- sağlık kariyer
- hemşire iş bulma
- tıp iş başvuru
- hastane iş ilanı

---

### Competitor Analysis
**Süre:** 1 gün  
**Aciliyet:** 🟡 P1

**Analiz Edilecekler:**
- Rakip app'lerin keywords
- Screenshot stratejileri
- Description yapısı
- Rating ve review'lar
- Update frequency

---

### A/B Testing Strategy
**Süre:** Ongoing  
**Aciliyet:** 🟢 P2

**Test Edilecekler:**
- App icon variants
- Screenshot order
- Description variants
- Keyword combinations

---


# 📊 ÖNCELİK MATRİSİ

## Aciliyet Seviyeleri

| Seviye | Tanım | Etki | Süre |
|--------|-------|------|------|
| 🔴 P0 | Build Blocker | Build alınamaz veya kritik özellik çalışmaz | Hemen |
| 🟡 P1 | Yüksek Öncelik | Store submission veya production için gerekli | 1-2 hafta |
| 🟢 P2 | Orta Öncelik | İyileştirme, optional feature | 2+ hafta |
| ⚪ P3 | Düşük Öncelik | Nice to have | Backlog |

---

## 🔴 P0 - KRİTİK (Toplam: 9 madde, 6-7 saat)

| # | Madde | Kategori | Süre | Bağımlılık |
|---|-------|----------|------|------------|
| 1 | iOS bundleIdentifier | Build Config | 10 dk | - |
| 2 | iOS buildNumber | Build Config | 5 dk | - |
| 3 | iOS infoPlist | Build Config | 30 dk | - |
| 4 | EAS projectId | Push Notification | 30 dk | EAS account |
| 5 | Expo Notifications plugin | Push Notification | 1 saat | - |
| 6 | .env.production | Environment | 30 dk | Production URL'ler |
| 7 | eas.json | Build Config | 30 dk | - |
| 8 | Android Keystore | Signing | 1 saat | - |
| 9 | iOS Certificates | Signing | 2 saat | Apple Developer Account |

**Toplam:** 6-7 saat (1 iş günü)

---

## 🟡 P1 - YÜKSEK ÖNCELİK (Toplam: 25 madde, 2-3 hafta)

### Teknik (8 madde, 1 hafta)
| # | Madde | Süre |
|---|-------|------|
| 10 | Android permissions | 30 dk |
| 11 | Font scaling accessibility | 1 gün |
| 12 | Sentry DSN | 1 saat |
| 13 | Console log cleanup | 30 dk |
| 14 | TypeScript strict mode | 30 dk |
| 15 | .gitignore güvenlik | 5 dk |
| 16 | Universal Links (iOS) | 2 saat |
| 17 | App Links (Android) | 2 saat |

### Store Submission (13 madde, 1-2 hafta)
| # | Madde | Süre |
|---|-------|------|
| 18 | Developer accounts | 1 gün |
| 19 | App name & slug | 5 dk |
| 20 | Android versionCode | 2 dk |
| 21 | Description & metadata | 10 dk |
| 22 | Support URL | 1 saat |
| 23 | Store listing metinleri | 1 gün |
| 24 | Screenshots (iOS + Android) | 2-3 gün |
| 25 | Feature Graphic | 1 gün |
| 26 | Test hesapları | 30 dk |
| 27 | Data Safety forms | 2 saat |
| 28 | App category & age rating | 30 dk |
| 29 | Copyright bilgisi | 5 dk |
| 30 | Backend production kontrolü | 1 saat |

### Monitoring & Analytics (4 madde, 1 hafta)
| # | Madde | Süre |
|---|-------|------|
| 31 | OTA Updates config | 1 saat |
| 32 | Google Analytics | 4 saat |
| 33 | Performance monitoring | 2 saat |
| 34 | ASO keyword research | 1 gün |

**Toplam:** 2-3 hafta

---

## 🟢 P2 - ORTA ÖNCELİK (Toplam: 6 madde, 3-4 hafta)

| # | Madde | Kategori | Süre |
|---|-------|----------|------|
| 35 | React Query cache persistence | Feature | 2 saat |
| 36 | "Ayarlara Git" butonu | UX | 1 saat |
| 37 | Localization (i18n) | Feature | 1 hafta |
| 38 | E2E Testing | Quality | 2 hafta |
| 39 | A/B Testing | ASO | Ongoing |
| 40 | Promo Video | Marketing | 2-3 gün |

**Toplam:** 3-4 hafta

---


# ⏱️ ZAMAN PLANLAMASI

## Senaryo 1: Minimum (Store Submit Edilebilir)

### Hafta 1: P0 + Temel Store Hazırlık
**Gün 1-2:**
- [ ] iOS build configuration (45 dk)
- [ ] EAS projectId (30 dk)
- [ ] Expo Notifications plugin (1 saat)
- [ ] .env.production (30 dk)
- [ ] eas.json (30 dk)
- [ ] Android Keystore (1 saat)
- [ ] iOS Certificates (2 saat)
- [ ] .gitignore güvenlik (5 dk)
- [ ] App name & slug (5 dk)
- [ ] Android versionCode (2 dk)
- [ ] Description & metadata (10 dk)

**Gün 3:**
- [ ] Developer accounts oluştur (hesap onayı için bekle)
- [ ] Store listing metinleri yaz (1 gün)
- [ ] Support URL hazırla (1 saat)

**Gün 4-6:**
- [ ] Screenshots hazırla (iOS + Android) (2-3 gün)
- [ ] Feature Graphic hazırla (1 gün)

**Gün 7:**
- [ ] Test hesapları oluştur (30 dk)
- [ ] Data Safety forms doldur (2 saat)
- [ ] App category & age rating (30 dk)
- [ ] Copyright bilgisi (5 dk)
- [ ] Backend production kontrolü (1 saat)
- [ ] **İlk build al ve test et**

**TOPLAM:** ~1 hafta  
**SONUÇ:** Store'a submit edilebilir ama monitoring yok

---

## Senaryo 2: Güvenli Production (Önerilen)

### Hafta 1: P0 + Kritik P1
*(Senaryo 1 ile aynı)*

### Hafta 2: Monitoring + Teknik P1
**Gün 8-9:**
- [ ] Sentry DSN configuration (1 saat)
- [ ] Console log cleanup (30 dk)
- [ ] TypeScript strict mode (30 dk + düzeltmeler)
- [ ] Android permissions (30 dk)
- [ ] OTA Updates config (1 saat)

**Gün 10-11:**
- [ ] Google Analytics kurulum (4 saat)
- [ ] Performance monitoring (2 saat)
- [ ] Universal Links (iOS) (2 saat)
- [ ] App Links (Android) (2 saat)

**Gün 12-14:**
- [ ] Font scaling accessibility (1 gün)
- [ ] ASO keyword research (1 gün)
- [ ] Internal testing (1 gün)
- [ ] Bug fixes

**TOPLAM:** 2 hafta  
**SONUÇ:** Production ready + monitoring + crash tracking

---

## Senaryo 3: Tam Production Ready (İdeal)

### Hafta 1-2: P0 + P1
*(Senaryo 2 ile aynı)*

### Hafta 3: Beta Testing + İyileştirmeler
**Gün 15-17:**
- [ ] TestFlight (iOS) beta release
- [ ] Google Play Internal Testing
- [ ] Beta tester feedback toplama

**Gün 18-21:**
- [ ] Bug fixes
- [ ] Performance optimizations
- [ ] UX improvements

### Hafta 4: P2 + Final Polish
**Gün 22-24:**
- [ ] React Query cache persistence (2 saat)
- [ ] "Ayarlara Git" butonu (1 saat)
- [ ] Promo Video (2-3 gün)

**Gün 25-28:**
- [ ] Final testing
- [ ] Store submission
- [ ] Marketing materials

**TOPLAM:** 1 ay  
**SONUÇ:** Tam production ready + beta tested + marketing materials

---

## Gantt Chart

```
Hafta 1: [████████████████████] P0 + Store Basics
Hafta 2: [████████████████████] P1 Teknik + Monitoring
Hafta 3: [████████████████████] Beta Testing
Hafta 4: [████████████████████] P2 + Final Polish
```

---

## Kritik Yol (Critical Path)

```
Developer Accounts (Gün 1)
    ↓
iOS Certificates (Gün 1-2)
    ↓
Build Configuration (Gün 2)
    ↓
Screenshots (Gün 4-6)
    ↓
Store Submission (Gün 7)
    ↓
Review Process (7-14 gün)
    ↓
PRODUCTION RELEASE
```

**Not:** Apple review süreci 1-2 hafta, Google Play review 1-3 gün sürebilir.

---


# ✅ PRODUCTION CHECKLIST

## 🔴 P0 - KRİTİK (6-7 saat)

### Build Configuration
- [ ] iOS bundleIdentifier ekle (`com.medikariyer.mobile`)
- [ ] iOS buildNumber ekle (`1`)
- [ ] iOS infoPlist ekle (permission strings)
- [ ] Android versionCode ekle (`1`)
- [ ] App name düzelt (`MediKariyer`)
- [ ] App slug düzelt (`medikariyer`)
- [ ] Description ekle
- [ ] Primary color ekle

### Environment & Configuration
- [ ] .env.production oluştur
- [ ] Production API URL'leri ekle
- [ ] eas.json oluştur
- [ ] Build profilleri tanımla (development, preview, production)
- [ ] .gitignore güvenlik güncellemesi

### Push Notifications
- [ ] EAS projectId al (`eas init`)
- [ ] Expo Notifications plugin ekle
- [ ] Notification icon hazırla
- [ ] Notification sound hazırla (opsiyonel)

### App Signing
- [ ] Android Keystore oluştur
- [ ] Keystore'u güvenli yerde sakla
- [ ] iOS Distribution Certificate al
- [ ] iOS Provisioning Profile al

---

## 🟡 P1 - YÜKSEK ÖNCELİK (2-3 hafta)

### Teknik İyileştirmeler
- [ ] Android permissions explicit declaration
- [ ] Font scaling accessibility düzelt
- [ ] Sentry DSN ekle
- [ ] Console log cleanup (babel plugin)
- [ ] TypeScript strict mode kontrol
- [ ] Universal Links setup (iOS)
- [ ] App Links setup (Android)
- [ ] OTA Updates configuration

### Store Submission
- [ ] Apple Developer Account oluştur ($99/yıl)
- [ ] Google Play Developer Account oluştur ($25)
- [ ] Support URL hazırla
- [ ] Store listing metinleri yaz
- [ ] Screenshots hazırla (iOS: 3 boyut, Android: 2 boyut)
- [ ] Feature Graphic hazırla (1024x500)
- [ ] Test hesapları oluştur
- [ ] Data Safety Form doldur (Google Play)
- [ ] Content Rating Questionnaire doldur (Google Play)
- [ ] App category seç
- [ ] Age rating belirle
- [ ] Copyright bilgisi ekle

### Monitoring & Analytics
- [ ] Google Analytics / Firebase Analytics kurulum
- [ ] Performance monitoring aktif et
- [ ] Error tracking test et (Sentry)
- [ ] Crash reporting test et

### Backend Kontrolü
- [ ] Production API URL'leri çalışıyor mu?
- [ ] SSL sertifikası geçerli mi?
- [ ] Rate limiting ayarlı mı?
- [ ] Database backup stratejisi var mı?
- [ ] Monitoring/alerting sistemi var mı?

### ASO (App Store Optimization)
- [ ] Keyword research yap
- [ ] Competitor analysis yap
- [ ] Keywords optimize et

---

## 🟢 P2 - ORTA ÖNCELİK (3-4 hafta)

### Optional Features
- [ ] React Query cache persistence
- [ ] "Ayarlara Git" butonu ekle
- [ ] Promo Video hazırla (15-30 saniye)

### Quality Assurance
- [ ] E2E Testing framework kur (Maestro)
- [ ] Test senaryoları yaz
- [ ] Automated testing pipeline

### Localization
- [ ] i18n framework kur
- [ ] İngilizce çeviri
- [ ] Arapça çeviri (opsiyonel)

### Marketing
- [ ] A/B Testing stratejisi
- [ ] Social media assets
- [ ] Press kit

---

## 📱 STORE SUBMISSION CHECKLIST

### Pre-Submission
- [ ] Tüm P0 sorunlar çözüldü
- [ ] Development build test edildi
- [ ] Production build test edildi
- [ ] Tüm özellikler çalışıyor
- [ ] Crash yok
- [ ] Performance kabul edilebilir

### iOS App Store
- [ ] App Store Connect'te app oluşturuldu
- [ ] Screenshots yüklendi (3 boyut)
- [ ] App description yazıldı
- [ ] Keywords eklendi
- [ ] Privacy Policy URL eklendi
- [ ] Support URL eklendi
- [ ] Test account bilgileri eklendi
- [ ] Build yüklendi (TestFlight)
- [ ] Beta testing yapıldı
- [ ] Review için submit edildi

### Google Play Store
- [ ] Google Play Console'da app oluşturuldu
- [ ] Screenshots yüklendi
- [ ] Feature Graphic yüklendi
- [ ] App description yazıldı
- [ ] Privacy Policy URL eklendi
- [ ] Content Rating tamamlandı
- [ ] Data Safety Form tamamlandı
- [ ] Test account bilgileri eklendi
- [ ] Internal testing yapıldı
- [ ] Production'a promote edildi

---

## 🧪 TESTING CHECKLIST

### Functional Testing
- [ ] Login/Logout çalışıyor
- [ ] Registration çalışıyor
- [ ] Password reset çalışıyor
- [ ] Job listing çalışıyor
- [ ] Job detail çalışıyor
- [ ] Job application çalışıyor
- [ ] Profile view çalışıyor
- [ ] Profile edit çalışıyor
- [ ] Photo upload çalışıyor
- [ ] Notifications çalışıyor
- [ ] Search çalışıyor
- [ ] Filters çalışıyor

### Platform Testing
- [ ] iOS test edildi (iPhone 12+)
- [ ] iOS test edildi (iPad)
- [ ] Android test edildi (Pixel, Samsung)
- [ ] Android test edildi (Tablet)

### Network Testing
- [ ] Offline mode çalışıyor
- [ ] Slow network çalışıyor
- [ ] Network error handling çalışıyor
- [ ] Retry mechanism çalışıyor

### Permission Testing
- [ ] Camera permission çalışıyor
- [ ] Photo library permission çalışıyor
- [ ] Notification permission çalışıyor
- [ ] Permission denial handle ediliyor

### Edge Cases
- [ ] Empty states çalışıyor
- [ ] Error states çalışıyor
- [ ] Loading states çalışıyor
- [ ] Long text handling
- [ ] Special characters handling

---

## 📊 PROGRESS TRACKING

### Completion Status

| Kategori | Toplam | Tamamlanan | Kalan | Progress |
|----------|--------|------------|-------|----------|
| P0 Kritik | 9 | 0 | 9 | ░░░░░░░░░░ 0% |
| P1 Teknik | 8 | 0 | 8 | ░░░░░░░░░░ 0% |
| P1 Store | 13 | 0 | 13 | ░░░░░░░░░░ 0% |
| P1 Monitoring | 4 | 0 | 4 | ░░░░░░░░░░ 0% |
| P2 Optional | 6 | 0 | 6 | ░░░░░░░░░░ 0% |
| **TOPLAM** | **40** | **0** | **40** | ░░░░░░░░░░ **0%** |

---

## 🎯 MILESTONE'LAR

### Milestone 1: Build Alınabilir (Gün 1-2)
- ✅ P0 sorunlar çözüldü
- ✅ Development build alındı
- ✅ Internal testing başladı

### Milestone 2: Store Submit Edilebilir (Gün 7)
- ✅ Tüm store materyalleri hazır
- ✅ Screenshots hazır
- ✅ Test hesapları hazır
- ✅ Production build alındı

### Milestone 3: Monitoring Aktif (Gün 14)
- ✅ Sentry aktif
- ✅ Analytics aktif
- ✅ Performance monitoring aktif
- ✅ Crash tracking test edildi

### Milestone 4: Store'da Yayında (Gün 21-28)
- ✅ iOS App Store'da yayında
- ✅ Google Play Store'da yayında
- ✅ Marketing başladı
- ✅ User feedback toplama başladı

---

## 📞 DESTEK VE KAYNAKLAR

### Dokümantasyon
- [Expo Documentation](https://docs.expo.dev/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policy](https://play.google.com/about/developer-content-policy/)

### Tools
- [EAS CLI](https://github.com/expo/eas-cli)
- [Maestro Testing](https://maestro.mobile.dev/)
- [Sentry](https://sentry.io/)
- [Firebase](https://firebase.google.com/)

### Community
- [Expo Discord](https://chat.expo.dev/)
- [React Native Community](https://reactnative.dev/community/overview)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/expo)

---

## 🎉 SONUÇ

### Özet
- **Toplam Kontrol:** 70 madde
- **Gerçek Sorun:** 34 madde (49%)
- **Yanlış Alarm:** 36 madde (51%)

### Minimum Hazırlık
- **Süre:** 1 hafta
- **Sonuç:** Store'a submit edilebilir
- **Risk:** Monitoring yok, beta test yok

### Önerilen Hazırlık
- **Süre:** 2 hafta
- **Sonuç:** Production ready + monitoring
- **Risk:** Minimal, beta test yapılabilir

### İdeal Hazırlık
- **Süre:** 1 ay
- **Sonuç:** Tam production ready + beta tested
- **Risk:** Yok, kapsamlı test edilmiş

### Tavsiye
**2 haftalık "Güvenli Production" senaryosu önerilir:**
- P0 sorunlar çözülür (1 hafta)
- Monitoring + Store submission (1 hafta)
- Beta testing paralel yapılabilir
- Crash tracking ve analytics aktif
- Production'da sorun çıkma riski minimal

---

**Son Güncelleme:** 22 Ocak 2026  
**Versiyon:** 2.0  
**Hazırlayan:** MediKariyer Development Team
