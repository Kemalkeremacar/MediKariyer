# MediKariyer Mobile App - Changelog

## Version 1.0.4 (24 Mart 2026)

### 🔄 Güncellemeler
- **Paket Güncellemeleri:**
  - @react-navigation/bottom-tabs: 7.9.0 → 7.15.7
  - @react-navigation/native: 7.1.26 → 7.2.0
  - @react-navigation/native-stack: 7.9.0 → 7.14.7
  - @tanstack/react-query: 5.90.12 → 5.95.2
  - axios: 1.13.2 → 1.13.6
  - react-hook-form: 7.69.0 → 7.72.0
  - react-i18next: 16.5.3 → 16.6.2
  - i18next: 25.8.0 → 25.10.5
  - zustand: 5.0.9 → 5.0.12
  - @types/react: 19.1.17 → 19.2.14
  - babel-preset-expo: 54.0.10 → 55.0.8

### 🔧 Build Konfigürasyonu
- Android compileSdkVersion: 35 → 36 (androidx.activity:1.11.0 uyumluluğu için)
- Gradle memory ayarları optimize edildi (4GB RAM, 1GB Metaspace)
- Lint kontrolü release build'lerde devre dışı bırakıldı

### 📦 Build Bilgileri
- Version: 1.0.4
- Version Code: 10
- Build Type: Release (AAB)
- Signed: ✅
- Size: ~75 MB

---

## Version 1.0.3
- Önceki sürüm

---

## Build Notları

### Gereksinimler
- Node.js 18+
- JDK 17+
- Android SDK 36
- Gradle 9.0.0

### Build Komutları

**AAB (Google Play Store):**
```bash
cd android
.\gradlew bundleRelease
```

**APK (Test):**
```bash
cd android
.\gradlew assembleRelease
```

### Keystore Bilgileri
- Dosya: `android/app/my-upload-key.keystore`
- Alias: `my-key-alias`
- Şifre: Güvenli yerde saklanıyor

### Önemli Notlar
- New Architecture (Fabric) enabled
- Hermes JS Engine enabled
- Expo Go ile çalışmaz (custom native modules)
- Development için: `npx expo run:android`
