# 🏥 MediKariyer - Sağlık Sektörü Kariyer Platformu

Modern ve kullanıcı dostu bir sağlık sektörü kariyer platformu. Doktorlar iş ilanlarına başvurabilir, hastaneler iş ilanı oluşturabilir ve admin paneli üzerinden tüm sistem yönetilebilir.

## 📋 İçindekiler

- [Özellikler](#-özellikler)
- [Teknoloji Stack](#-teknoloji-stack)
- [Proje Yapısı](#-proje-yapısı)
- [Kurulum](#-kurulum)
- [Kullanım](#-kullanım)
- [API Dokümantasyonu](#-api-dokümantasyonu)
- [Katkıda Bulunma](#-katkıda-bulunma)
- [Lisans](#-lisans)

## ✨ Özellikler

### 👨‍⚕️ Doktor Özellikleri
- **Profil Yönetimi**: Kişisel bilgiler, eğitim, deneyim, sertifika ve dil bilgileri
- **İş İlanları**: Filtreleme, arama ve detaylı görüntüleme
- **Başvuru Yönetimi**: Başvuru oluşturma, takip etme ve geri çekme
- **Fotoğraf Yönetimi**: Profil fotoğrafı yükleme ve değiştirme (admin onaylı)
- **Dashboard**: Son başvurular ve önerilen iş ilanları

### 🏥 Hastane Özellikleri
- **Profil Yönetimi**: Hastane bilgileri, departmanlar ve iletişim bilgileri
- **İş İlanı Yönetimi**: İlan oluşturma, düzenleme, silme ve durum takibi
- **Başvuru Yönetimi**: Başvuruları görüntüleme, durum güncelleme ve not ekleme
- **Doktor Arama**: Doktor profillerini görüntüleme ve filtreleme
- **Dashboard**: İstatistikler ve son başvurular

### 👨‍💼 Admin Özellikleri
- **Kullanıcı Yönetimi**: Kullanıcı onaylama, aktifleştirme ve yönetimi
- **İş İlanı Yönetimi**: Tüm ilanları görüntüleme ve yönetme
- **Başvuru Yönetimi**: Tüm başvuruları görüntüleme ve takip etme
- **Fotoğraf Onayları**: Doktor fotoğraf değişiklik taleplerini onaylama/reddetme
- **Log Yönetimi**: Sistem loglarını görüntüleme ve filtreleme
- **İletişim Mesajları**: Kullanıcılardan gelen mesajları yönetme

### 🔔 Ortak Özellikler
- **Bildirim Sistemi**: Gerçek zamanlı bildirimler
- **Modern UI/UX**: Responsive tasarım ve kullanıcı dostu arayüz
- **Güvenlik**: JWT token tabanlı kimlik doğrulama ve yetkilendirme
- **Performans**: Optimize edilmiş API çağrıları ve cache yönetimi

## 🛠 Teknoloji Stack

### Frontend
- **React 18** - Modern UI kütüphanesi
- **React Router** - SPA routing
- **React Query (TanStack Query)** - Server state yönetimi
- **Zustand** - Client state yönetimi
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animasyon kütüphanesi
- **Axios** - HTTP client
- **Sonner** - Toast notification
- **Zod** - Schema validation
- **Vite** - Build tool ve dev server

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **SQL Server** - Veritabanı (Knex.js ile query builder)
- **JWT** - Token tabanlı kimlik doğrulama
- **Bcrypt** - Şifre hashleme
- **Joi** - Request validation
- **Winston** - Logging
- **Morgan** - HTTP request logger
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

## 📁 Proje Yapısı

```
MediKariyer/
├── Backend/                 # Backend API
│   ├── src/
│   │   ├── config/          # Konfigürasyon dosyaları
│   │   ├── controllers/     # Route handler'lar
│   │   ├── middleware/      # Auth, validation, rate limit
│   │   ├── routes/          # API route tanımları
│   │   ├── services/        # İş mantığı katmanı
│   │   ├── utils/           # Yardımcı fonksiyonlar
│   │   └── validators/      # Joi validation schemas
│   ├── db/
│   │   └── schema.sql       # Veritabanı şeması
│   └── server.js            # Ana server dosyası
│
└── frontend/                # Frontend React uygulaması
    ├── src/
    │   ├── components/      # UI bileşenleri
    │   │   ├── layout/     # Layout bileşenleri
    │   │   └── ui/         # Reusable UI bileşenleri
    │   ├── config/         # Konfigürasyon dosyaları
    │   ├── features/       # Feature bazlı modüller
    │   │   ├── admin/      # Admin modülü
    │   │   ├── auth/       # Authentication modülü
    │   │   ├── doctor/     # Doktor modülü
    │   │   ├── hospital/   # Hastane modülü
    │   │   ├── notifications/ # Bildirim modülü
    │   │   └── public/     # Public sayfalar
    │   ├── hooks/          # Custom React hooks
    │   ├── middleware/     # Route guards
    │   ├── routes/         # Route tanımları
    │   ├── services/       # HTTP client ve API servisleri
    │   ├── store/          # Zustand state management
    │   └── utils/          # Yardımcı fonksiyonlar
    └── package.json
```

## 🚀 Kurulum

### Gereksinimler
- Node.js >= 18.0.0
- SQL Server (SQL Server Express desteklenir)
- npm veya yarn

### Backend Kurulumu

1. **Backend klasörüne gidin:**
```bash
cd Backend
```

2. **Bağımlılıkları yükleyin:**
```bash
npm install
```

3. **Environment dosyasını oluşturun:**
```bash
cp env.example.txt .env
```

4. **`.env` dosyasını düzenleyin:**
```env
DB_HOST=localhost
DB_INSTANCE=SQLEXPRESS
DB_PORT=1433
DB_NAME=MEDIKARIYER
DB_USER=sa
DB_PASSWORD=YourSQLPassword123!

JWT_SECRET=YourJWTSecretKey
JWT_REFRESH_SECRET=YourRefreshSecretKey

PORT=3100
CORS_ORIGIN=http://localhost:5000
NODE_ENV=development
```

5. **Veritabanını oluşturun:**
```bash
# SQL Server Management Studio veya sqlcmd ile
# Backend/db/schema.sql dosyasını çalıştırın
```

6. **Backend'i başlatın:**
```bash
# Development modu
npm run dev

# Production modu
npm start
```

Backend şimdi `http://localhost:3100` adresinde çalışıyor.

### Frontend Kurulumu

1. **Frontend klasörüne gidin:**
```bash
cd frontend
```

2. **Bağımlılıkları yükleyin:**
```bash
npm install
```

3. **Environment dosyasını oluşturun:**
```bash
cp env.example.txt .env
```

4. **`.env` dosyasını düzenleyin:**
```env
VITE_API_URL=http://localhost:3100/api
```

5. **Frontend'i başlatın:**
```bash
npm run dev
```

Frontend şimdi `http://localhost:5000` adresinde çalışıyor.

## 💻 Kullanım

### İlk Kurulum Sonrası

1. **Admin Hesabı Oluşturma:**
   - Veritabanında manuel olarak admin kullanıcısı oluşturun
   - Veya backend'i ilk çalıştırdığınızda admin kullanıcısı otomatik oluşturulabilir

2. **Doktor/Hastane Kaydı:**
   - Ana sayfadan "Kayıt Ol" butonuna tıklayın
   - Doktor veya Hastane seçeneğini seçin
   - Gerekli bilgileri doldurun
   - Admin onayı bekleyin

3. **Giriş:**
   - Onaylanmış hesaplarla giriş yapabilirsiniz
   - Rollere göre dashboard'a yönlendirilirsiniz

### Roller ve Yetkiler

- **Admin**: Tüm sistem yönetimi, kullanıcı onaylama, log görüntüleme
- **Doctor**: Profil yönetimi, iş ilanlarına başvuru, başvuru takibi
- **Hospital**: Profil yönetimi, iş ilanı oluşturma, başvuru yönetimi

## 📚 API Dokümantasyonu

### Base URL
```
http://localhost:3100/api
```

### Ana Endpoint'ler

#### Authentication
- `POST /auth/login` - Giriş yap
- `POST /auth/registerDoctor` - Doktor kaydı
- `POST /auth/registerHospital` - Hastane kaydı
- `POST /auth/refresh` - Token yenileme

#### Doctor
- `GET /doctor/profile` - Profil bilgileri
- `PUT /doctor/profile` - Profil güncelleme
- `GET /doctor/jobs` - İş ilanları listesi
- `GET /doctor/jobs/:id` - İş ilanı detayı
- `POST /doctor/applications` - Başvuru oluştur
- `GET /doctor/applications` - Başvurularım

#### Hospital
- `GET /hospital/profile` - Profil bilgileri
- `PUT /hospital/profile` - Profil güncelleme
- `GET /hospital/jobs` - İş ilanları listesi
- `POST /hospital/jobs` - İş ilanı oluştur
- `PUT /hospital/jobs/:id` - İş ilanı güncelle
- `GET /hospital/applications` - Başvurular

#### Admin
- `GET /admin/users` - Kullanıcı listesi
- `PATCH /admin/users/:id/approval` - Kullanıcı onaylama
- `GET /admin/jobs` - Tüm iş ilanları
- `GET /admin/applications` - Tüm başvurular
- `GET /admin/logs` - Sistem logları

### Authentication
Tüm protected endpoint'ler için `Authorization: Bearer <token>` header'ı gereklidir.

## 🧪 Test

```bash
# Frontend test
cd frontend
npm run test

# Backend test
cd Backend
npm run test
```

## 📝 Kod Standartları

- **ESLint**: Kod kalitesi kontrolü
- **JSDoc**: Fonksiyon ve dosya yorumları
- **Prettier**: Kod formatlama (opsiyonel)
- **Git Hooks**: Commit öncesi kontrol

## 🔒 Güvenlik

- JWT token tabanlı authentication
- Bcrypt ile şifre hashleme
- Rate limiting (DoS koruması)
- Helmet.js ile security headers
- CORS yapılandırması
- SQL injection koruması (Knex parametrik sorgular)
- XSS koruması

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add some amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 👥 Geliştiriciler

MediKariyer Development Team

## 📞 İletişim

Proje hakkında sorularınız için issue açabilirsiniz.

## 🎯 Gelecek Özellikler

- [ ] Gerçek zamanlı chat sistemi
- [ ] Email bildirimleri
- [ ] Gelişmiş filtreleme seçenekleri
- [ ] CV/Özgeçmiş yükleme
- [ ] Video görüşme entegrasyonu
- [ ] Mobil uygulama (React Native)
- [ ] Analytics dashboard
- [ ] Export/Import özellikleri

---

**Not**: Bu proje aktif olarak geliştirilmektedir. Sorun veya önerileriniz için issue açabilirsiniz.

