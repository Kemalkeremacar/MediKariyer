# 🏥 Tıbbi Kariyer Platformu - Proje Analizi

## 📋 Genel Bakış

Bu, **tıbbi kariyer ve iş bulma platformu** olan kapsamlı bir full-stack web uygulamasıdır. Doktorlar, hastaneler ve tıbbi personel için iş ilanları, başvurular ve profil yönetimi sağlar.

## 🛠️ Teknoloji Stack'i

### Backend
- **Node.js** + **Express.js** - Web framework
- **MySQL** - Veritabanı
- **JWT** - Authentication
- **Multer** - Dosya yükleme
- **Winston** - Logging
- **Joi** - Validation
- **Expo Push Notifications** - Mobile bildirimler

### Frontend
- **React.js** - UI framework
- **React Router** - Routing
- **React Query** - State management ve API calls
- **Tailwind CSS** - Styling
- **Vite** - Build tool

## 📁 Backend Yapısı Detayı

### 🔧 Konfigürasyon (`Backend/src/config/`)
- **appConstants.js**: Uygulama sabitleri ve enum değerleri
- **dbConfig.js**: MySQL veritabanı bağlantı ayarları
- **securityConfig.js**: Güvenlik konfigürasyonları

### 🎮 Controllers (`Backend/src/controllers/`)

#### Ana Controllers:
- **authController.js**: Giriş, kayıt, şifre sıfırlama
- **doctorController.js**: Doktor profil yönetimi
- **hospitalController.js**: Hastane yönetimi
- **adminController.js**: Admin panel işlemleri
- **notificationController.js**: Bildirim sistemi
- **contactController.js**: İletişim formu
- **logController.js**: Log yönetimi
- **lookupController.js**: Lookup tabloları
- **pdfController.js**: PDF işlemleri

#### Mobile Controllers (`Backend/src/controllers/mobile/`):
- **mobileAuthController.js**: Mobile authentication
- **mobileDoctorController.js**: Mobile doktor işlemleri
- **mobileJobController.js**: Mobile iş ilanları
- **mobileApplicationController.js**: Mobile başvurular
- **mobileNotificationController.js**: Mobile bildirimler
- **mobileLookupController.js**: Mobile lookup işlemleri
- **mobileUploadController.js**: Mobile dosya yükleme

### 🔒 Middleware (`Backend/src/middleware/`)
- **authMiddleware.js**: JWT token doğrulama
- **roleGuard.js**: Rol bazlı erişim kontrolü
- **rateLimitMiddleware.js**: Rate limiting
- **validationMiddleware.js**: Joi validation
- **uploadMiddleware.js**: Dosya yükleme
- **mobileErrorHandler.js**: Mobile hata yönetimi

### 🏢 Services (`Backend/src/services/`)

#### Ana Services:
- **authService.js**: Authentication business logic
- **doctorService.js**: Doktor işlemleri
- **hospitalService.js**: Hastane işlemleri
- **adminService.js**: Admin işlemleri
- **contactService.js**: İletişim işlemleri
- **logService.js**: Log işlemleri
- **lookupService.js**: Lookup tabloları (şehir, uzmanlık vb.)
- **notificationService.js**: Bildirim sistemi
- **pdfService.js**: PDF işlemleri

#### Mobile Services (`Backend/src/services/mobile/`):
- **mobileAuthService.js**: Mobile authentication logic
- **mobileDoctorService.js**: Mobile doktor işlemleri
- **mobileJobService.js**: Mobile iş ilanları
- **mobileJobSearchService.js**: Mobile iş arama
- **mobileApplicationService.js**: Mobile başvuru sistemi
- **mobileLookupService.js**: Mobile lookup işlemleri
- **mobileNotificationService.js**: Mobile bildirimler
- **expoPushService.js**: Expo push notification entegrasyonu

### 🔄 Transformers (`Backend/src/mobile/transformers/`)
- **applicationTransformer.js**: Başvuru verisi dönüştürme
- **jobTransformer.js**: İş ilanı verisi dönüştürme
- **notificationTransformer.js**: Bildirim verisi dönüştürme
- **profileTransformer.js**: Profil verisi dönüştürme
- **dateHelper.js**: Tarih yardımcı fonksiyonları

### 🔧 Utilities (`Backend/src/utils/`)
- **logger.js**: Winston logging sistemi
- **emailService.js**: Email gönderimi
- **jwtUtils.js**: JWT token işlemleri
- **errorHandler.js**: Global hata yönetimi
- **jobExpirationCron.js**: İş ilanı süre dolumu
- **logCleanupCron.js**: Log temizleme
- **sseManager.js**: Server-Sent Events
- **queryHelper.js**: SQL query yardımcıları
- **response.js**: Standart API yanıt formatı
- **softDeleteHelper.js**: Soft delete işlemleri
- **tokenCleanup.js**: Token temizleme
- **databaseTransport.js**: Veritabanı transport

### ✅ Validators (`Backend/src/validators/`)
- **authSchemas.js**: Authentication validation
- **doctorSchemas.js**: Doktor validation
- **hospitalSchemas.js**: Hastane validation
- **adminSchemas.js**: Admin validation
- **contactSchemas.js**: İletişim validation
- **logSchemas.js**: Log validation
- **lookupSchemas.js**: Lookup validation
- **notificationSchemas.js**: Bildirim validation
- **mobileSchemas.js**: Mobile API validation

### 📧 Email Templates (`Backend/src/templates/email/`)
- **base.html**: Temel email şablonu
- **passwordReset.html**: Şifre sıfırlama emaili
- **welcome.html**: Hoş geldin emaili

## 🎨 Frontend Yapısı Detayı

### 📱 Components (`frontend/src/components/`)

#### Layout Components (`frontend/src/components/layout/`):
- Header, Footer, Sidebar, Navigation bileşenleri

#### UI Components (`frontend/src/components/ui/`):
- **ConfirmationModal.jsx**: Onay modalları
- **LoadingSpinner.jsx**: Yükleme animasyonu
- **CustomToast.jsx**: Bildirim mesajları
- **GlobalModalManager.jsx**: Modal yönetimi
- **MedicalIllustration.jsx**: Tıbbi illüstrasyonlar
- **ModalContainer.jsx**: Modal container
- **TransitionWrapper.jsx**: Geçiş animasyonları

### ⚙️ Konfigürasyon (`frontend/src/config/`)
- **api.js**: API endpoint'leri
- **app.js**: Uygulama konfigürasyonu
- **routes.js**: Route tanımları
- **queryConfig.js**: React Query ayarları
- **validation.js**: Form validation kuralları
- **toast.js**: Toast konfigürasyonu

### 🔗 Hooks (`frontend/src/hooks/`)
- **useAuth.js**: Authentication hook
- **useApi.js**: API çağrıları
- **useLocalStorage.js**: Local storage yönetimi

### 📄 Pages (`frontend/src/pages/`)
- **Dashboard**: Ana kontrol paneli
- **Login/Register**: Giriş ve kayıt
- **Profile**: Profil yönetimi
- **Jobs**: İş ilanları
- **Applications**: Başvurular
- **Admin**: Admin paneli

### 🎯 Services (`frontend/src/services/`)
- **api.js**: Axios konfigürasyonu
- **auth.js**: Authentication servisleri
- **storage.js**: Local storage yönetimi

### 🎨 Assets (`frontend/src/assets/`)
- **logo.png**: Logo dosyası
- **DashboardLaptop.png**: Dashboard görseli
- **Doktor Profili.png**: Doktor profil görseli
- **Hastane.png**: Hastane görseli
- **Mobil Uygulama.png**: Mobil uygulama görseli
- **Medical_Career_Dashboard_Animation.mp4**: Dashboard animasyonu

## 🔐 Güvenlik Özellikleri

1. **JWT Authentication**: Token bazlı kimlik doğrulama
2. **Role-based Access Control**: Rol bazlı yetkilendirme (roleGuard.js)
3. **Rate Limiting**: API çağrı sınırlaması
4. **Input Validation**: Joi ile kapsamlı veri doğrulama
5. **SQL Injection Protection**: Parameterized queries
6. **File Upload Security**: Güvenli dosya yükleme (uploadMiddleware.js)
7. **Error Handling**: Kapsamlı hata yönetimi
8. **Logging**: Winston ile detaylı loglama

## 📱 Mobile API Özellikleri

1. **Separate Mobile Endpoints**: Ayrı mobile controller'lar ve servisler
2. **Push Notifications**: Expo ile bildirimler (expoPushService.js)
3. **Mobile-optimized Responses**: Transformer'lar ile optimize edilmiş yanıtlar
4. **Mobile Error Handling**: Özel mobile hata yönetimi
5. **Mobile Upload**: Ayrı mobile dosya yükleme sistemi
6. **Mobile Authentication**: Ayrı mobile auth sistemi

## 🗄️ Veritabanı Yapısı

MySQL veritabanı kullanılıyor. Ana tablalar:
- **Users**: Kullanıcılar
- **Doctors**: Doktorlar
- **Hospitals**: Hastaneler
- **Jobs**: İş İlanları
- **Applications**: Başvurular
- **Notifications**: Bildirimler
- **Lookup Tables**: Şehir, Uzmanlık, Pozisyon vb.
- **Logs**: Sistem logları

## 🚀 Ana İşlevsellikler

### 👤 Kullanıcı Yönetimi
- Kayıt ve giriş sistemi
- Profil yönetimi
- Şifre sıfırlama
- Email doğrulama

### 💼 İş İlanları
- İlan oluşturma ve düzenleme
- İlan listeleme ve arama
- İlan filtreleme
- İlan süre dolumu (cron job)

### 📝 Başvuru Sistemi
- İş başvuruları
- Başvuru takibi
- CV yükleme
- Başvuru durumu güncellemeleri

### 🔔 Bildirim Sistemi
- Email bildirimleri
- Push bildirimler (mobile)
- Real-time bildirimler (SSE)
- Bildirim geçmişi

### 👨‍⚕️ Doktor Profilleri
- Detaylı profil yönetimi
- Uzmanlık alanları
- Deneyim bilgileri
- Sertifikalar

### 🏥 Hastane Yönetimi
- Hastane profilleri
- İlan yönetimi
- Başvuru değerlendirme

### 🛡️ Admin Panel
- Kullanıcı yönetimi
- İçerik moderasyonu
- Sistem ayarları
- Log görüntüleme

### 📱 Mobile App Support
- Ayrı mobile API'ler
- Push notification desteği
- Mobile-optimized responses
- Offline hazırlık

## 🔄 Cron Jobs ve Otomasyonlar

- **jobExpirationCron.js**: İş ilanlarının otomatik süre dolumu
- **logCleanupCron.js**: Eski logların temizlenmesi
- **tokenCleanup.js**: Süresi dolmuş token'ların temizlenmesi

## 📊 Logging ve Monitoring

- **Winston Logger**: Kapsamlı loglama sistemi
- **Database Transport**: Logların veritabanında saklanması
- **Log Cleanup**: Otomatik log temizleme
- **Error Tracking**: Detaylı hata takibi

## 🌐 API Yapısı

### RESTful Endpoints
- `/api/auth/*` - Authentication
- `/api/doctors/*` - Doktor işlemleri
- `/api/hospitals/*` - Hastane işlemleri
- `/api/jobs/*` - İş ilanları
- `/api/applications/*` - Başvurular
- `/api/notifications/*` - Bildirimler
- `/api/admin/*` - Admin işlemleri
- `/api/mobile/*` - Mobile API'ler

### Real-time Features
- **Server-Sent Events (SSE)**: Real-time güncellemeler
- **Push Notifications**: Expo ile mobile bildirimler

## 📦 Deployment

### Backend
- Node.js server
- MySQL veritabanı
- Environment variables (.env)

### Frontend
- Vite build
- Static file serving
- Production optimizations

## 🔧 Development Tools

- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Nodemon**: Development server
- **Vite**: Frontend build tool

## 📈 Proje Durumu

Proje oldukça kapsamlı ve profesyonel bir yapıya sahip. Modern web development best practice'lerini takip ediyor ve ölçeklenebilir bir mimari kullanıyor. Hem web hem de mobile platformlar için hazırlanmış, güvenlik önlemleri alınmış ve production-ready durumda.

---

**Son Güncelleme**: 25 Mart 2026
**Proje Tipi**: Full-Stack Web Application + Mobile API
**Durum**: Production Ready