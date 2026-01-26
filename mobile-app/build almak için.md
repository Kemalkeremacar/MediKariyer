
## 📱 Test Etme

### Yöntem 1: Expo Go ile (Geliştirme için - Hızlı)

```bash
cd mobile-app
npm start
```

- Telefonda Expo Go uygulamasını aç
- QR kodu tara
- Değişiklikleri anında gör

### Yöntem 2: APK ile (Gerçek Test)

**APK Konumu:**
```
mobile-app/android/app/build/outputs/apk/release/app-release.apk
```

**Nasıl Yüklenir:**
1. APK'yı WhatsApp ile kendine gönder
2. Telefonda aç
3. "Bilinmeyen kaynaklardan yükleme" izni ver
4. Yükle ve test et

---

## 🔄 Kod Değişikliği Yaptığında

### Küçük Değişiklikler (UI, text, vs.)
```bash
# Expo Go ile test et (hızlı)
npm start
```

### Büyük Değişiklikler (yeni özellik, vs.)
```bash
# Yeni build al
cd mobile-app/android

# APK için (test)
$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"; .\gradlew assembleRelease

# AAB için (store)
$env:JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"; .\gradlew bundleRelease
```

**Build süresi:** 10-15 dakika

---

## 📤 Google Play Store'a Yükleme

### Ön Hazırlık (Bir Kez)

1. **Google Play Console hesabı aç**
   - https://play.google.com/console/
   - $25 ödeme (bir kez)

2. **Uygulama oluştur**
   - App name: MediKariyer
   - Language: Turkish
   - Type: App
   - Free

3. **Store Listing doldur**
   - Kısa açıklama (80 karakter)
   - Uzun açıklama
   - Icon (512x512 PNG)
   - Screenshots (2-8 adet, 1080x1920)
   - Feature graphic (1024x500 PNG)

4. **Yasal dökümanlar**
   - Privacy Policy URL (hazırlanmalı)
   - Terms of Service URL (hazırlanmalı)

### AAB Yükleme

1. Play Console → Production → Create new release
2. AAB dosyasını yükle:
   ```
   mobile-app/android/app/build/outputs/bundle/release/app-release.aab
   ```
3. Release notes yaz
4. Submit for review
5. **Bekleme süresi:** 1-7 gün

---

## 🔐 Keystore - ÇOK ÖNEMLİ!

**Keystore Bilgileri:**
```
Dosya: mobile-app/android/app/my-upload-key.keystore
Şifre: medikariyer2024
Alias: my-key-alias
```

**⚠️ UYARI:**
- Bu dosyayı **ASLA** kaybetme!
- Git'e **ASLA** commit etme! (zaten .gitignore'da)
- Güvenli bir yere **YEDEKLE**:
  - Şifre yöneticisi
  - Şifreli USB
  - Güvenli cloud

**Neden önemli?**
- Keystore'u kaybedersen uygulama **güncelleyemezsin**!
- Yeni keystore = yeni uygulama (kullanıcılar kaybeder)

---

## 📊 Version Güncelleme

Her yeni build'de version'ı artır:

**Dosya: `mobile-app/app.json`**
```json
{
  "expo": {
    "version": "1.0.1",  // 1.0.0 → 1.0.1
    "android": {
      "versionCode": 2   // 1 → 2
    }
  }
}
```

**Semantic Versioning:**
- `1.0.0` → `1.0.1` (küçük düzeltme)
- `1.0.0` → `1.1.0` (yeni özellik)
- `1.0.0` → `2.0.0` (büyük değişiklik)

---
