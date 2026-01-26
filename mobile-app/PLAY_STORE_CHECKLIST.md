# 📋 Play Store Yükleme Kontrol Listesi

## ✅ Teknik Gereksinimler

### Build Dosyaları
- [x] AAB dosyası oluşturuldu (`app-release.aab`)
- [x] Keystore ile imzalandı (`my-upload-key.keystore`)
- [x] versionCode: 1
- [x] versionName: 1.0.0
- [x] Package name: `com.medikariyer.mobile`

### Permissions
- [x] INTERNET
- [x] POST_NOTIFICATIONS (Android 13+)
- [x] READ_EXTERNAL_STORAGE
- [x] WRITE_EXTERNAL_STORAGE
- [x] CAMERA
- [x] VIBRATE

### Firebase
- [x] google-services.json eklendi
- [x] Firebase Cloud Messaging API aktif

---

## 📱 Play Store Console Gereksinimleri

### 1. Uygulama Detayları
- [ ] **Uygulama Adı:** MediKariyer
- [ ] **Kısa Açıklama:** (80 karakter max)
  ```
  Doktorlar için iş bulma ve kariyer geliştirme platformu
  ```
- [ ] **Tam Açıklama:** (4000 karakter max)
  ```
  MediKariyer, sağlık sektöründe çalışan doktorların iş bulmasını ve kariyerlerini geliştirmesini kolaylaştıran bir mobil platformdur.

  ÖZELLİKLER:
  • İş İlanları: Branşınıza ve konumunuza uygun iş ilanlarını keşfedin
  • Hızlı Başvuru: Tek tıkla iş ilanlarına başvurun
  • Profil Yönetimi: Dijital CV'nizi oluşturun ve güncelleyin
  • Başvuru Takibi: Başvurularınızın durumunu anlık takip edin
  • Bildirimler: Yeni fırsatlar için anlık bildirimler alın
  • Güvenli Platform: Verileriniz güvenli bir şekilde saklanır

  DOKTORLAR İÇİN:
  - Uzmanlık alanınıza göre filtrelenmiş iş ilanları
  - Eğitim ve deneyim bilgilerinizi ekleyin
  - Sertifikalarınızı yükleyin
  - Dil becerilerinizi belirtin
  - Profil tamamlama yüzdesi ile öne çıkın

  GÜVENLİK:
  - Kişisel verileriniz şifrelenir
  - KVKK uyumlu veri işleme
  - Güvenli kimlik doğrulama

  MediKariyer ile kariyerinizi bir üst seviyeye taşıyın!
  ```

### 2. Grafikler (Gerekli)
- [ ] **Uygulama İkonu:** 512x512 px (PNG, 32-bit)
- [ ] **Feature Graphic:** 1024x500 px (JPG veya PNG)
- [ ] **Ekran Görüntüleri:** En az 2, en fazla 8 adet
  - Telefon: 16:9 veya 9:16 oran
  - Minimum: 320px
  - Maximum: 3840px

### 3. Kategori ve Etiketler
- [ ] **Kategori:** Tıp (Medical)
- [ ] **Etiketler:** doktor, iş, kariyer, sağlık, hastane

### 4. İletişim Bilgileri
- [ ] **E-posta:** support@medikariyer.com (veya geçerli e-posta)
- [ ] **Telefon:** (Opsiyonel)
- [ ] **Web Sitesi:** https://mk.monassist.com

### 5. Gizlilik Politikası (ZORUNLU)
- [ ] **URL:** https://mk.monassist.com/privacy-policy
- [ ] Gizlilik politikası sayfası yayında olmalı
- [ ] Türkçe ve İngilizce versiyonlar

### 6. Yaş Derecelendirmesi
- [ ] **Hedef Kitle:** 18+ (Profesyonel uygulama)
- [ ] İçerik derecelendirme anketi doldurulmalı

---

## 📄 Gerekli Dokümanlar

### Gizlilik Politikası İçeriği (Minimum)
```
1. Toplanan Veriler:
   - Kişisel bilgiler (ad, soyad, e-posta, telefon)
   - Profesyonel bilgiler (uzmanlık, deneyim, eğitim)
   - Cihaz bilgileri (push notification için)
   - Konum bilgisi (iş arama için)

2. Veri Kullanımı:
   - İş eşleştirme
   - Bildirim gönderme
   - Uygulama iyileştirme

3. Veri Güvenliği:
   - Şifreli veri saklama
   - Güvenli API iletişimi
   - KVKK uyumlu işleme

4. Kullanıcı Hakları:
   - Veri silme talebi
   - Veri inceleme talebi
   - İletişim: support@medikariyer.com
```

### Kullanım Koşulları İçeriği (Minimum)
```
1. Hizmet Tanımı
2. Kullanıcı Sorumlulukları
3. Hesap Güvenliği
4. İçerik Politikası
5. Hizmet Değişiklikleri
6. Sorumluluk Reddi
7. İletişim Bilgileri
```

---

## 🚀 Yükleme Adımları

### 1. Play Console'a Giriş
1. https://play.google.com/console adresine git
2. Google hesabı ile giriş yap
3. "Uygulama oluştur" butonuna tıkla

### 2. Uygulama Bilgilerini Doldur
1. Uygulama adı: MediKariyer
2. Varsayılan dil: Türkçe
3. Uygulama türü: Uygulama
4. Ücretsiz/Ücretli: Ücretsiz

### 3. AAB Dosyasını Yükle
1. Sol menü → "Yayın" → "Üretim"
2. "Yeni sürüm oluştur"
3. AAB dosyasını yükle: `app-release.aab`
4. Sürüm notları ekle:
   ```
   İlk sürüm:
   - İş ilanlarını görüntüleme ve başvuru
   - Profil yönetimi
   - Başvuru takibi
   - Push notification desteği
   ```

### 4. İçerik Derecelendirmesi
1. Sol menü → "İçerik derecelendirmesi"
2. Anketi doldur
3. Kategori: Tıp/Sağlık
4. Hedef kitle: 18+

### 5. Hedef Kitle ve İçerik
1. Sol menü → "Hedef kitle ve içerik"
2. Hedef yaş grubu: 18+
3. Reklam içeriği: Hayır (şimdilik)

### 6. Fiyatlandırma ve Dağıtım
1. Sol menü → "Fiyatlandırma ve dağıtım"
2. Ülkeler: Türkiye (veya tüm ülkeler)
3. Fiyat: Ücretsiz

### 7. İncelemeye Gönder
1. Tüm gerekli alanları doldur
2. "İncelemeye gönder" butonuna tıkla
3. Google incelemesi: 1-7 gün

---

## ⚠️ Önemli Notlar

### Keystore Güvenliği
- ✅ Keystore dosyasını güvenli yerde sakla
- ✅ Şifreleri kaydet: `keystore-info.txt`
- ⚠️ Keystore kaybedilirse uygulama güncellenemez!

### Versiyon Yönetimi
- Her güncelleme için `versionCode` artırılmalı
- `versionName` kullanıcıya gösterilen versiyon

### Test Süreci
- İlk yükleme: 1-7 gün inceleme süresi
- Güncellemeler: 1-3 gün inceleme süresi
- Red durumunda: Düzeltme yap ve tekrar gönder

---

## 📞 Destek

Sorun yaşarsan:
- Play Console Yardım: https://support.google.com/googleplay/android-developer
- Firebase Destek: https://firebase.google.com/support
