# MediKariyer Dokümantasyon Sistemi - Backend

MediKariyer sağlık sektörü platformu için kapsamlı dokümantasyon sistemi backend API'si.

## 🚀 Özellikler

- **Proje Mimarisi Dokümantasyonu**: Backend, frontend ve mobile katmanlarının otomatik analizi
- **Kullanıcı Rolleri Yönetimi**: Admin, Doktor ve Hastane rollerinin yetki matrisi
- **Ekran Akışları**: Kullanıcı yolculuklarının görsel haritalanması
- **Etki Analizi**: Değişikliklerin sistem genelindeki etkilerinin otomatik analizi
- **API Dokümantasyonu**: Otomatik endpoint keşfi ve dokümantasyon
- **Gerçek Zamanlı Bildirimler**: WebSocket tabanlı anlık güncellemeler

## 🛠 Teknoloji Stack

- **Runtime**: Node.js (>=18.0.0)
- **Framework**: Express.js
- **Veritabanı**: SQL Server (Ana MediKariyer veritabanı)
- **Kimlik Doğrulama**: JWT (Ana sistemle entegre)
- **Validation**: Joi
- **Logging**: Winston
- **Rate Limiting**: express-rate-limit
- **Güvenlik**: Helmet, CORS

## 📁 Proje Yapısı

```
src/
├── config/           # Konfigürasyon dosyaları
│   ├── appConstants.js
│   ├── dbConfig.js
│   └── securityConfig.js
├── controllers/      # Route handler'ları
├── middleware/       # Express middleware'leri
│   ├── authMiddleware.js
│   ├── rateLimitMiddleware.js
│   ├── roleGuard.js
│   └── validationMiddleware.js
├── routes/          # API route tanımları
├── services/        # İş mantığı katmanı
├── utils/           # Yardımcı fonksiyonlar
│   ├── errorHandler.js
│   ├── logger.js
│   └── response.js
└── validators/      # Joi validation şemaları
```

## 🔧 Kurulum

1. **Bağımlılıkları yükle:**
   ```bash
   npm install
   ```

2. **Environment dosyasını oluştur:**
   ```bash
   cp .env.example .env
   ```

3. **Environment değişkenlerini düzenle:**
   - Ana MediKariyer veritabanı bilgilerini gir
   - JWT secret'larını ana sistemle aynı yap
   - Port ve CORS ayarlarını yapılandır

4. **Sunucuyu başlat:**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 🔐 Kimlik Doğrulama

Sistem, ana MediKariyer JWT sistemini kullanır:

```javascript
// Authorization header
Authorization: Bearer <jwt_token>

// Desteklenen roller
- admin: Tüm dokümantasyon işlemleri
- doctor: Sınırlı dokümantasyon erişimi
- hospital: Sınırlı dokümantasyon erişimi
```

## 📊 API Endpoints

### Genel
- `GET /health` - Sistem sağlık kontrolü
- `GET /api/info` - API bilgileri
- `GET /api/test` - Test endpoint'i

### Dokümantasyon (Planlanan)
- `GET /api/documentation` - Dokümantasyon listesi
- `POST /api/documentation` - Yeni dokümantasyon
- `PUT /api/documentation/:id` - Dokümantasyon güncelle
- `DELETE /api/documentation/:id` - Dokümantasyon sil

### Mimari Analiz (Planlanan)
- `GET /api/architecture/analyze` - Proje mimarisi analizi
- `GET /api/architecture/components` - Bileşen listesi
- `GET /api/architecture/dependencies` - Bağımlılık haritası

### Etki Analizi (Planlanan)
- `POST /api/impact/analyze` - Değişiklik etki analizi
- `GET /api/impact/history` - Analiz geçmişi

## 🔒 Güvenlik

- **Rate Limiting**: IP bazlı istek sınırlaması
- **CORS**: Güvenli cross-origin istekler
- **Helmet**: Güvenlik header'ları
- **JWT**: Token tabanlı kimlik doğrulama
- **Input Validation**: Joi ile veri doğrulama
- **SQL Injection**: Knex.js ile parametreli sorgular

## 📝 Logging

Winston ile kapsamlı loglama:
- **Console**: Development için renkli loglar
- **File**: Günlük rotate edilen log dosyaları
- **Error**: Ayrı error log dosyası
- **HTTP**: Morgan ile HTTP istek logları

## 🧪 Test

```bash
# Unit testler
npm test

# Test coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## 🚀 Deployment

```bash
# Production build
npm run start:prod

# PM2 ile deployment (opsiyonel)
npm run pm2:start
npm run pm2:stop
npm run pm2:restart
```

## 🔧 Development

```bash
# Linting
npm run lint
npm run lint:fix

# Development server (nodemon)
npm run dev
```

## 📋 Environment Variables

```env
# Server
NODE_ENV=development
PORT=3200

# Database (Ana MediKariyer DB)
DB_HOST=localhost
DB_NAME=MEDIKARIYER
DB_USER=tstSqlUser
DB_PASSWORD=your_password

# JWT (Ana sistemle aynı)
JWT_SECRET=your_secret
JWT_REFRESH_SECRET=your_refresh_secret

# CORS
CORS_ORIGIN=http://localhost:5000
```

## 🤝 Ana Sistem Entegrasyonu

Bu dokümantasyon sistemi, mevcut MediKariyer backend'i ile entegre çalışır:

- **Veritabanı**: Aynı SQL Server instance'ını kullanır
- **Kimlik Doğrulama**: Aynı JWT secret'ları ve kullanıcı tablosunu kullanır
- **Roller**: Mevcut admin/doctor/hospital rol sistemini kullanır
- **Middleware**: Ana sistemdeki middleware yapısını takip eder

## 📞 Destek

Teknik destek için MediKariyer geliştirici ekibi ile iletişime geçin.

## 📄 Lisans

MIT License - MediKariyer Team