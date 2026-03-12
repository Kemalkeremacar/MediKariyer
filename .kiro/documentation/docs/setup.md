# Kurulum Kılavuzu

## Sistem Gereksinimleri

- Node.js 18.x veya üzeri
- SQL Server 2019 veya üzeri
- Git
- Docker (opsiyonel)

## Geliştirme Ortamı Kurulumu

### 1. Repository'yi Klonlayın

```bash
git clone <repository-url>
cd medikariyer-documentation-system
```

### 2. Backend Kurulumu

```bash
cd .kiro/documentation/backend

# Bağımlılıkları yükle
npm install

# Environment dosyasını oluştur
cp .env.example .env

# Veritabanı bağlantı bilgilerini düzenle
nano .env
```

### 3. Frontend Kurulumu

```bash
cd .kiro/documentation/frontend

# Bağımlılıkları yükle
npm install

# Environment dosyasını oluştur
cp .env.example .env
```

### 4. Veritabanı Kurulumu

```bash
# SQL Server'ı başlat
# Veritabanını oluştur
sqlcmd -S localhost -U sa -P YourPassword -Q "CREATE DATABASE medikariyer_docs"

# Migration'ları çalıştır
cd .kiro/documentation/backend
npm run migrate
```

### 5. Uygulamayı Başlat

```bash
# Backend'i başlat (terminal 1)
cd .kiro/documentation/backend
npm run dev

# Frontend'i başlat (terminal 2)
cd .kiro/documentation/frontend
npm run dev
```

## Docker ile Kurulum

### 1. Docker Compose ile Başlat

```bash
cd .kiro/documentation
docker-compose up -d
```

### 2. Veritabanı Migration'larını Çalıştır

```bash
docker-compose exec backend npm run migrate
```

### 3. Uygulamaya Erişim

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Dokümantasyonu: http://localhost:3001/api-docs

## Prodüksiyon Kurulumu

### 1. Environment Variables

```bash
# Backend .env
NODE_ENV=production
PORT=3001
DB_SERVER=your-sql-server
DB_NAME=medikariyer_docs
DB_USER=your-db-user
DB_PASSWORD=your-db-password
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=https://your-domain.com
```

### 2. Build ve Deploy

```bash
# Backend build
cd .kiro/documentation/backend
npm run build
npm start

# Frontend build
cd .kiro/documentation/frontend
npm run build
# Dist klasörünü web server'a deploy et
```

## Troubleshooting

### Yaygın Sorunlar

1. **Veritabanı bağlantı hatası**
   - SQL Server'ın çalıştığından emin olun
   - Bağlantı bilgilerini kontrol edin
   - Firewall ayarlarını kontrol edin

2. **Port çakışması**
   - 3000 ve 3001 portlarının boş olduğundan emin olun
   - Gerekirse port numaralarını değiştirin

3. **Node.js versiyon uyumsuzluğu**
   - Node.js 18.x veya üzeri kullanın
   - nvm ile doğru versiyonu yükleyin

### Log Dosyaları

- Backend logları: `backend/logs/app.log`
- Frontend build logları: `frontend/dist/`
- Docker logları: `docker-compose logs`