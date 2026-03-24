# iOS Build Rehberi - MediKariyer

## 📋 Ön Gereksinimler

### Mac'te Kurulması Gerekenler
```bash
# Homebrew (yoksa)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Node.js
brew install node

# Watchman
brew install watchman

# CocoaPods
sudo gem install cocoapods

# Xcode (App Store'dan indir)
# Xcode Command Line Tools
xcode-select --install
```

## 🔧 Proje Kurulumu

```bash
# Repo'yu çek
cd ~/Desktop
git clone https://github.com/Kemalkeremacar/MediKariyer.git
cd MediKariyer/mobile-app

# Dependencies yükle
npm install

# iOS pods yükle
cd ios
pod install
cd ..
```

## 📱 iOS Build Adımları

### 1. Xcode'da Aç
```bash
open ios/medikariyer.xcworkspace
```

### 2. Signing & Capabilities
- Xcode'da projeyi seç
- **Signing & Capabilities** sekmesi
- **Team:** Apple Developer hesabını seç
- **Bundle Identifier:** com.medikariyer.mobile

### 3. Version Güncelle
- **General** sekmesi
- **Version:** 1.0.4
- **Build:** 2 (veya daha yüksek)

### 4. Archive Oluştur
```
Xcode → Product → Archive
```

### 5. App Store'a Yükle
- Archive tamamlandığında **Distribute App**
- **App Store Connect** seç
- **Upload** tıkla

## 🔐 Apple Developer Gereksinimleri

### Gerekli Hesaplar
1. **Apple Developer Account** ($99/yıl)
   - https://developer.apple.com/

2. **App Store Connect**
   - https://appstoreconnect.apple.com/

### Sertifikalar
- **iOS Distribution Certificate**
- **Provisioning Profile**

## 📝 App Store Connect Ayarları

### Uygulama Bilgileri
- **App Name:** MediKariyer
- **Bundle ID:** com.medikariyer.mobile
- **Primary Language:** Turkish
- **Category:** Medical

### Store Listing
- **App Icon:** 1024x1024 PNG
- **Screenshots:** 
  - iPhone 6.7" (1290x2796) - 3-10 adet
  - iPhone 6.5" (1242x2688) - 3-10 adet
  - iPad Pro 12.9" (2048x2732) - 3-10 adet
- **Description:** Uygulama açıklaması
- **Keywords:** sağlık, doktor, kariyer, iş
- **Privacy Policy URL:** (hazırlanmalı)

## ⚙️ Mevcut Konfigürasyon

### app.json
```json
{
  "ios": {
    "supportsTablet": true,
    "bundleIdentifier": "com.medikariyer.mobile",
    "buildNumber": "2"
  }
}
```

### Permissions (Info.plist)
- ✅ NSPhotoLibraryUsageDescription
- ✅ NSCameraUsageDescription

## 🚀 Build Komutları

### Development Build
```bash
npx expo run:ios
```

### Release Build (Xcode gerekli)
```bash
# Xcode'da Archive oluştur
# Product → Archive
```

### EAS Build (Alternatif - Kolay)
```bash
# EAS CLI kur
npm install -g eas-cli

# Login
eas login

# Build
eas build --platform ios
```

## 📊 Version Bilgileri

- **Current Version:** 1.0.4
- **Build Number:** 2
- **Min iOS Version:** 13.4
- **Target iOS Version:** Latest

## ⚠️ Önemli Notlar

1. **Apple Developer hesabı gerekli** ($99/yıl)
2. **Mac bilgisayar şart** (iOS build için)
3. **Xcode en son sürüm** olmalı
4. **Provisioning Profile** doğru yapılandırılmalı
5. **TestFlight** ile önce test et
6. **App Store Review** 1-3 gün sürer

## 🔄 Android vs iOS Farkları

| Özellik | Android | iOS |
|---------|---------|-----|
| Build Süresi | 20-30 dk | 15-25 dk |
| Test | Internal Testing | TestFlight |
| Review | 1-7 gün | 1-3 gün |
| Maliyet | $25 (bir kez) | $99/yıl |
| Build Dosyası | AAB/APK | IPA |

## 📞 Yardım

Sorun olursa:
1. `npx expo doctor` çalıştır
2. `pod install --repo-update` dene
3. Xcode cache temizle: Cmd+Shift+K
