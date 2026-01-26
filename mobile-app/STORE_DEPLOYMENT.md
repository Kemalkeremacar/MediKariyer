# 🚀 MediKariyer Mobile - Store Deployment Rehberi

Bu rehber, uygulamanın App Store ve Google Play Store'a yüklenmesi için gereken tüm adımları içerir.

---

## 📋 Genel Bakış

**Mevcut Durum:**
- ✅ Uygulama development'ta çalışıyor
- ✅ Sentry entegrasyonu mevcut
- ✅ Push notification altyapısı hazır
- ❌ Production build yapılandırması yok
- ❌ Store assets eksik
- ❌ EAS Build setup yapılmamış

---

## 🔴 YAPILMASI GEREKENLER

### 1️⃣ EAS Build Yapılandırması

**Dosya: `mobile-app/eas.json` (YENİ DOSYA)**

```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

**Ne işe yarar:** EAS Build için profil tanımları. Preview = test, Production = store.

---







### 2️⃣ Production Environment Dosyası

**Dosya: `mobile-app/.env.production` (YENİ DOSYA)**

```env
EXPO_PUBLIC_API_BASE_URL=https://your-production-api.com/api/mobile
EXPO_PUBLIC_PRIMARY_API_BASE_URL=https://your-production-api.com/api
EXPO_PUBLIC_APP_ENV=production
EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=true
EXPO_PUBLIC_SENTRY_DSN=your-sentry-dsn-here
```

**Yapılacak:** 
- Production API URL'lerini gerçek URL'lerle değiştir
- Sentry DSN'i ekle (Sentry dashboard'dan alınacak)

---









### 3️⃣ App.json Güncellemeleri

**Dosya: `mobile-app/app.json` (MEVCUT - GÜNCELLENECEK)**

Şu anki hali:
```json
{
  "expo": {
    "name": "mobile-app",
    "slug": "mobile-app",
    ...
  }
}
```

Olması gereken:
```json
{
  "expo": {
    "name": "MediKariyer",
    "slug": "medikariyer",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "newArchEnabled": true,
    "jsEngine": "hermes",
    "privacy": "public",
    "description": "Sağlık sektörü profesyonelleri için kariyer platformu. Doktorlar iş fırsatlarını keşfedebilir, hastaneler doğru adayları bulabilir.",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "bundleIdentifier": "com.medikariyer.mobile",
      "buildNumber": "1",
      "supportsTablet": true,
      "infoPlist": {
        "NSPhotoLibraryUsageDescription": "Profil fotoğrafı ve belge yüklemek için fotoğraf galerinize erişim gereklidir.",
        "NSCameraUsageDescription": "Profil fotoğrafı çekmek için kamera erişimi gereklidir.",
        "NSPhotoLibraryAddUsageDescription": "Fotoğrafları kaydetmek için galeri erişimi gereklidir."
      }
    },
    "android": {
      "package": "com.medikariyer.mobile",
      "versionCode": 1,
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "READ_MEDIA_IMAGES"
      ],
      "adaptiveIcon": {
        "foregroundImage": "./assets/logo.jpg",
        "backgroundColor": "#ffffff"
      },
      "edgeToEdgeEnabled": false,
      "predictiveBackGestureEnabled": false,
      "softwareKeyboardLayoutMode": "pan"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "scheme": "medikariyer",
    "plugins": [
      "expo-secure-store",
      "@react-native-community/datetimepicker",
      [
        "expo-notifications",
        {
          "icon": "./assets/icon.png",
          "color": "#ffffff"
        }
      ]
    ],
    "extra": {
      "eas": {
        "projectId": "BURAYA_EAS_PROJECT_ID_GELECEK"
      }
    },
    "owner": "BURAYA_EXPO_USERNAME_GELECEK"
  }
}
```

**Değişiklikler:**
- `name`: "mobile-app" → "MediKariyer"
- `privacy`: "public" eklendi
- `description`: Store açıklaması eklendi
- `ios.bundleIdentifier`: Eklendi
- `ios.buildNumber`: Eklendi
- `ios.infoPlist`: Permission açıklamaları eklendi
- `android.versionCode`: Eklendi
- `android.permissions`: Detaylandırıldı
- `plugins`: expo-notifications config eklendi
- `extra.eas.projectId`: Eklendi (EAS build:configure sonrası doldurulacak)
- `owner`: Eklendi (Expo username'inle değiştirilecek)

---
















### 4️⃣ Babel Config - Console.log Temizleme

**Dosya: `mobile-app/babel.config.js` (MEVCUT - GÜNCELLENECEK)**

Şu anki hali:
```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],
  };
};
```

Olması gereken:
```javascript
module.exports = function (api) {
  api.cache(true);
  
  const plugins = ['react-native-reanimated/plugin'];
  
  // Production build'de console.log'ları temizle
  if (process.env.EXPO_PUBLIC_APP_ENV === 'production') {
    plugins.unshift(['transform-remove-console', { exclude: ['error', 'warn'] }]);
  }
  
  return {
    presets: ['babel-preset-expo'],
    plugins,
  };
};
```

**Ne işe yarar:** Production build'de console.log'lar otomatik temizlenir, sadece error ve warn kalır.

**Not:** `babel-plugin-transform-remove-console` zaten package.json'da mevcut.

---

















### 5️⃣ Package.json Script'leri

**Dosya: `mobile-app/package.json` (MEVCUT - GÜNCELLENECEK)**

Mevcut scripts'e eklenecekler:
```json
{
  "scripts": {
    "start": "expo start --localhost",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "test": "jest",
    "test:watch": "jest --watch",
    
    // YENİ EKLENECEKLER:
    "build:android:preview": "eas build --platform android --profile preview",
    "build:android:production": "eas build --platform android --profile production",
    "build:ios:preview": "eas build --platform ios --profile preview",
    "build:ios:production": "eas build --platform ios --profile production",
    "build:all:production": "eas build --platform all --profile production",
    "submit:android": "eas submit --platform android",
    "submit:ios": "eas submit --platform ios"
  }
}
```

---











### 6️⃣ .gitignore Güncellemesi

**Dosya: `mobile-app/.gitignore` (YENİ DOSYA veya GÜNCELLEME)**

```gitignore
# Expo
.expo/
dist/
web-build/

# Native
*.orig.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision

# Metro
.metro-health-check*

# Debug
npm-debug.*
yarn-debug.*
yarn-error.*

# macOS
.DS_Store
*.pem

# Local env files
.env*.local

# Typescript
*.tsbuildinfo

# Node
node_modules/

# EAS - Hassas dosyalar
google-play-service-account.json
google-services.json
GoogleService-Info.plist

# IDE
.vscode/
.idea/
*.swp
*.swo
*~
```

---














## 🎨 Store Assets Hazırlığı

### App Icon
- **Boyut:** 1024x1024 PNG
- **Dosya:** `mobile-app/assets/icon.png`
- **Gereksinim:** Şeffaf olmayan arka plan, köşeler yuvarlatılmamış
- **Durum:** ✅ Mevcut (kontrol edilmeli)

### Splash Screen
- **Boyut:** 1284x2778 PNG (iPhone 13 Pro Max)
- **Dosya:** `mobile-app/assets/splash-icon.png`
- **Durum:** ✅ Mevcut (kontrol edilmeli)

### Screenshots (HAZIRLANACAK)

**iOS Screenshots:**
- 6.7" (iPhone 14 Pro Max): 1290 x 2796
- 6.5" (iPhone 11 Pro Max): 1242 x 2688
- 5.5" (iPhone 8 Plus): 1242 x 2208
- **Adet:** 5-8 screenshot

**Android Screenshots:**
- Boyut: 1080 x 1920 (9:16 oran önerilir)
- **Adet:** 2-8 screenshot

**Önerilen Screenshot İçerikleri:**
1. Ana ekran / Dashboard
2. İş ilanları listesi
3. İş detay sayfası
4. Profil sayfası
5. Başvurular sayfası
6. Bildirimler

**Android Feature Graphic:**
- Boyut: 1024 x 500 PNG
- Google Play Store'da banner olarak görünür

---













## 📝 Store Listing Bilgileri

### Uygulama Açıklaması

**Kısa Açıklama (Google Play - 80 karakter):**
```
Doktorlar için iş bulma platformu. İş fırsatlarını keşfet, başvur!
```

**Uzun Açıklama (Her iki platform):**
```
🏥 MediKariyer - Sağlık Sektörü Kariyer Platformu

Doktorlar ve sağlık profesyonelleri için özel olarak tasarlanmış kariyer platformu. İş fırsatlarını keşfedin, başvurun ve kariyerinizi ilerletin!

✨ ÖZELLİKLER

📋 İş İlanları
• Binlerce iş fırsatını keşfedin
• Uzmanlık alanına göre filtrele
• Şehir, hastane ve pozisyon bazlı arama
• Favori ilanlarını kaydet

📝 Kolay Başvuru
• Tek tıkla başvuru yap
• Başvuru durumunu takip et
• Anlık bildirimler al

👤 Profesyonel Profil
• Detaylı CV oluştur
• Eğitim ve deneyimlerini ekle
• Sertifikalarını paylaş
• Dil becerilerini belirt

🔔 Anlık Bildirimler
• Yeni iş ilanları
• Başvuru güncellemeleri
• Önemli duyurular

🔒 Güvenli ve Gizli
• Verileriniz güvende
• Gizlilik odaklı tasarım
• Güvenli iletişim

MediKariyer ile kariyerinizde bir sonraki adımı atın!
```

**Anahtar Kelimeler (App Store - 100 karakter):**
```
doktor,iş,kariyer,hastane,sağlık,iş ilanı,başvuru,tıp,hekim,uzman
```

**Kategori:**
- Primary: Medical / Health & Fitness
- Secondary: Business

**Yaş Sınırı:** 4+ (Herkes için uygun)

---












## 🔐 Yasal Dökümanlar (HAZIRLANACAK)

### Privacy Policy (Gizlilik Politikası)
- **URL:** https://medikariyer.com/privacy (veya benzeri)
- **Durum:** ❌ Hazırlanmalı
- **İçermesi gerekenler:**
  - Toplanan veriler
  - Veri kullanım amaçları
  - Üçüncü taraf servisler (Sentry, Expo Push)
  - Veri saklama süresi
  - Kullanıcı hakları (KVKK uyumlu)

### Terms of Service (Kullanım Şartları)
- **URL:** https://medikariyer.com/terms (veya benzeri)
- **Durum:** ❌ Hazırlanmalı

### Support URL
- **URL:** https://medikariyer.com/support (veya benzeri)
- **Durum:** ❌ Hazırlanmalı
- **İçermesi gerekenler:**
  - İletişim bilgileri
  - SSS
  - Destek formu

---











## 🔥 Firebase / Push Notifications Setup

### Android (Google Services)

1. **Firebase Console:**
   - https://console.firebase.google.com/
   - Yeni proje oluştur: "MediKariyer"
   - Android app ekle
   - Package name: `com.medikariyer.mobile`

2. **google-services.json:**
   - Firebase'den indir
   - `mobile-app/google-services.json` olarak kaydet
   - ❌ .gitignore'da (commit edilmemeli)

3. **FCM Server Key:**
   - Firebase Console → Project Settings → Cloud Messaging
   - Server Key'i kopyala
   - Backend'e ekle (push notification göndermek için)

### iOS (APNs)

1. **Apple Developer:**
   - Certificates, Identifiers & Profiles
   - Keys → + (Yeni key oluştur)
   - Apple Push Notifications service (APNs) seç
   - .p8 dosyasını indir

2. **Firebase'e Yükle:**
   - Firebase Console → Project Settings → Cloud Messaging
   - APNs Authentication Key yükle
   - Key ID ve Team ID gir

3. **Expo Credentials:**
   - `eas credentials` komutuyla yönetilebilir
   - Veya otomatik olarak EAS tarafından yönetilir

---

## 🛠️ Deployment Adımları

### Ön Hazırlık (Bir Kez Yapılır)

```bash
# 1. EAS CLI kur
npm install -g eas-cli

# 2. Expo'ya giriş yap
eas login

# 3. Proje klasörüne git
cd mobile-app

# 4. EAS build yapılandırması
eas build:configure
# Bu komut:
# - Expo hesabına bağlanır
# - Project ID oluşturur
# - app.json'a otomatik ekler
```

### Environment Güncelleme

1. `.env.production` dosyasını aç
2. Production API URL'lerini güncelle:
   ```env
   EXPO_PUBLIC_API_BASE_URL=https://api.medikariyer.com/api/mobile
   EXPO_PUBLIC_PRIMARY_API_BASE_URL=https://api.medikariyer.com/api
   ```

### Preview Build (Test İçin)

```bash
# Android APK (hızlı test için)
npm run build:android:preview

# Build tamamlandığında QR kod ile indir ve test et
```

### Production Build

```bash
# Her iki platform
npm run build:all:production

# Sadece Android
npm run build:android:production

# Sadece iOS
npm run build:ios:production
```

**Build süresi:** ~15-20 dakika (platform başına)

**Build durumunu takip:**
```bash
eas build:list
# veya
# https://expo.dev/
```

---

## 📱 Google Play Store Yükleme

### 1. Google Play Console Setup

1. https://play.google.com/console/ → Create app
2. **App details:**
   - App name: MediKariyer
   - Default language: Turkish (Türkçe)
   - App or game: App
   - Free or paid: Free

### 2. Store Listing

- **App name:** MediKariyer
- **Short description:** (Yukarıdaki kısa açıklamayı kullan)
- **Full description:** (Yukarıdaki uzun açıklamayı kullan)
- **App icon:** 512x512 PNG
- **Feature graphic:** 1024x500 PNG
- **Screenshots:** 2-8 adet (1080x1920)
- **App category:** Medical
- **Contact details:** Email, phone, website

### 3. Content Rating

- Questionnaire doldur
- Hedef kitle: 18+
- İçerik: Sağlık/Tıbbi bilgi

### 4. App Content

- **Privacy policy:** URL ekle
- **Ads:** No
- **In-app purchases:** No
- **Target audience:** Adults

### 5. Release

**Internal Testing → Closed Testing → Production**

```bash
# Build'i yükle
npm run submit:android

# veya manuel:
# Play Console → Production → Create new release
# Build'i yükle (AAB dosyası)
```

### 6. Review

- Release notes yaz
- Submit for review
- **Review süresi:** 1-7 gün

---










## 🍎 Apple App Store Yükleme

### 1. App Store Connect Setup

1. https://appstoreconnect.apple.com/ → My Apps → +
2. **New App:**
   - Platform: iOS
   - Name: MediKariyer
   - Primary Language: Turkish
   - Bundle ID: com.medikariyer.mobile
   - SKU: medikariyer-mobile

### 2. App Information

- **Subtitle:** Sağlık Sektörü Kariyer Platformu
- **Category:** Medical / Business
- **Privacy Policy URL:** (Hazırladığın URL)
- **Support URL:** (Hazırladığın URL)

### 3. Pricing and Availability

- **Price:** Free
- **Availability:** All countries

### 4. Prepare for Submission

- **Screenshots:** (Her cihaz boyutu için)
- **App Preview:** (Opsiyonel video)
- **Promotional Text:** Kısa tanıtım
- **Description:** (Yukarıdaki uzun açıklamayı kullan)
- **Keywords:** (Yukarıdaki anahtar kelimeleri kullan)
- **Support URL:** https://medikariyer.com/support
- **Marketing URL:** https://medikariyer.com

### 5. Build Upload

```bash
# Build oluştur
npm run build:ios:production

# Submit
npm run submit:ios
```

### 6. App Review Information

- **Contact Information:** İletişim bilgileri
- **Demo Account:** Test için kullanıcı adı/şifre
  ```
  Email: test@medikariyer.com
  Password: Test123!
  ```
- **Notes:** "Bu uygulama doktorlar için iş bulma platformudur. Test hesabı ile tüm özellikleri deneyebilirsiniz."

### 7. Submit for Review

- **Version Release:** Manual release (onaylandıktan sonra sen yayınla)
- Submit

**Review süresi:** 1-3 gün

---









## 🔄 Update Yayınlama

### Version Bump

**app.json'da güncelle:**
```json
{
  "expo": {
    "version": "1.0.1",  // Semantic versioning: major.minor.patch
    "ios": {
      "buildNumber": "2"  // Her build'de +1 artır
    },
    "android": {
      "versionCode": 2  // Her build'de +1 artır
    }
  }
}
```

### Build ve Yayınla

```bash
npm run build:all:production
npm run submit:android
npm run submit:ios
```

---

## ✅ Final Checklist

### Teknik
- [ ] `eas.json` oluşturuldu
- [ ] `.env.production` oluşturuldu ve API URL'leri güncellendi
- [ ] `.env.production`'a Sentry DSN eklendi
- [ ] `app.json` güncellendi (name, bundleIdentifier, permissions, etc.)
- [ ] `babel.config.js` güncellendi (console.log temizleme)
- [ ] `package.json` script'leri eklendi
- [ ] `.gitignore` güncellendi
- [ ] EAS build:configure çalıştırıldı
- [ ] Preview build test edildi

### Assets
- [ ] App icon kontrol edildi (1024x1024)
- [ ] Splash screen kontrol edildi
- [ ] Screenshots hazırlandı (iOS: 3 boyut, Android: 1080x1920)
- [ ] Feature graphic hazırlandı (Android: 1024x500)

### Yasal
- [ ] Privacy policy hazırlandı ve yayınlandı
- [ ] Terms of service hazırlandı ve yayınlandı
- [ ] Support page hazırlandı

### Firebase
- [ ] Firebase projesi oluşturuldu
- [ ] google-services.json indirildi (Android)
- [ ] APNs key yüklendi (iOS)
- [ ] FCM Server Key backend'e eklendi

### Store
- [ ] Google Play Developer hesabı ($25)
- [ ] Apple Developer hesabı ($99/yıl)
- [ ] Store listing bilgileri hazırlandı
- [ ] Test kullanıcı hesabı hazırlandı

### Test
- [ ] Tüm akışlar test edildi
- [ ] Push notifications test edildi
- [ ] Offline durumu test edildi
- [ ] Farklı cihazlarda test edildi

---

## 🐛 Sık Karşılaşılan Sorunlar

### "Invalid bundle identifier"
- `app.json`'da `ios.bundleIdentifier` ve `android.package` kontrol et
- Her ikisi de `com.medikariyer.mobile` olmalı

### "Missing credentials"
```bash
eas credentials
# Credentials'ları yeniden oluştur
```

### "Build failed"
```bash
eas build:list
# Build ID'ye tıkla → Logs'u incele
```

### "google-services.json not found"
- Firebase'den indir
- `mobile-app/` klasörüne kopyala
- `.gitignore`'da olduğundan emin ol

---

## 📞 Yardım ve Kaynaklar

### Dokümantasyon
- [Expo EAS Build](https://docs.expo.dev/build/introduction/)
- [Expo Submit](https://docs.expo.dev/submit/introduction/)
- [App Store Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policies](https://play.google.com/about/developer-content-policy/)

### Destek
- Expo Discord: https://chat.expo.dev/
- Expo Forums: https://forums.expo.dev/

---

## 🎯 Hızlı Başlangıç (TL;DR)

```bash
# 1. EAS Setup
npm install -g eas-cli
eas login
cd mobile-app
eas build:configure

# 2. Dosyaları oluştur/güncelle
# - eas.json
# - .env.production
# - app.json
# - babel.config.js
# - package.json
# - .gitignore

# 3. Preview build test et
npm run build:android:preview

# 4. Production build
npm run build:all:production

# 5. Submit
npm run submit:android
npm run submit:ios
```

---

**Son Güncelleme:** 2024  
**Versiyon:** 1.0.0  
**Proje:** MediKariyer Mobile
