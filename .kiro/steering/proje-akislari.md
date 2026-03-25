---
inclusion: auto
---

# 🔄 MediKariyer Proje Akışları - Kapsamlı Analiz

## 📋 Genel Bakış

Bu dokümantasyon, MediKariyer projesindeki tüm iş akışlarını, modül etkileşimlerini ve data flow'ları detaylı olarak açıklar. Her akış için başlangıç noktası, adımlar, decision points, error handling ve success/failure paths belirtilmiştir.

## 🏗️ Sistem Mimarisi

### Backend Yapısı
- **Framework**: Node.js + Express.js
- **Database**: MySQL
- **Authentication**: JWT (Access + Refresh Token)
- **File Upload**: Multer
- **Logging**: Winston
- **Validation**: Joi
- **Push Notifications**: Expo

### Frontend Yapısı
- **Framework**: React.js + Vite
- **Routing**: React Router
- **State Management**: React Query + Zustand
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios

### Mobile API
- **Separate Endpoints**: `/api/mobile/*`
- **Optimized Responses**: Transformer'lar ile
- **Push Notifications**: Expo entegrasyonu

## 🔐 1. AUTHENTICATION AKIŞLARI

### 1.1 Doktor Kayıt Akışı

**Başlangıç**: `POST /api/auth/registerDoctor`

**Adımlar**:
1. **Frontend Validation** → `registerDoctorSchema` (Joi)
2. **Email Kontrolü** → `authService.isEmailRegistered()`
3. **Password Hash** → `bcrypt.hash(password, 12)`
4. **Database Transaction**:
   - `users` tablosuna kayıt (`is_approved: false`)
   - `doctor_profiles` tablosuna profil oluşturma
5. **Audit Log** → `LogService.createAuditLog()`
6. **Security Log** → `LogService.createSecurityLog()`

**Success Path**: 201 Created + Profil bilgileri
**Error Paths**: 
- Email zaten kayıtlı → 400 Bad Request
- Validation hatası → 400 Bad Request
- Database hatası → 500 Internal Server Error

**Etkilenen Modüller**:
- `authController.js` → `authService.js` → `LogService.js`
- Frontend: Registration form → Success page

### 1.2 Hastane Kayıt Akışı

**Başlangıç**: `POST /api/auth/registerHospital`

**Adımlar**:
1. **Frontend Validation** → `registerHospitalSchema` (Joi)
2. **Email Kontrolü** → `authService.isEmailRegistered()`
3. **Password Hash** → `bcrypt.hash(password, 12)`
4. **Database Transaction**:
   - `users` tablosuna kayıt (`is_approved: false`)
   - `hospital_profiles` tablosuna profil oluşturma
5. **Audit + Security Logs**

**Success Path**: 201 Created + Profil bilgileri
**Error Paths**: Email duplicate, validation, database errors

### 1.3 Unified Login Akışı

**Başlangıç**: `POST /api/auth/login`

**Adımlar**:
1. **Validation** → `loginSchema`
2. **Credential Check** → `authService.validateCredentials()`
   - Email normalize (lowercase + trim)
   - Password bcrypt compare
   - Account status check (`is_active`, `is_approved`)
3. **Token Generation**:
   - Access Token (15 min) → `jwtUtils.generateAccessToken()`
   - Refresh Token (7 days) → `jwtUtils.generateRefreshToken()`
4. **Token Storage** → `refresh_tokens` tablosuna kayıt
5. **Last Login Update** → `users.last_login`
6. **Profile Data** → Role'e göre profil bilgileri

**Success Path**: 200 OK + User + Tokens + Profile
**Error Paths**:
- Invalid credentials → 401 Unauthorized
- Account inactive → 403 Forbidden
- Account not approved → 403 Forbidden

**Mobile Farkı**: 
- Endpoint: `POST /api/mobile/auth/login`
- Optimized response payload
- Mobile-specific error handling

### 1.4 Token Refresh Akışı

**Başlangıç**: `POST /api/auth/refresh`

**Adımlar**:
1. **Token Validation** → `jwtUtils.verifyRefreshTokenRecord()`
2. **User Status Check** → Active + Approved kontrolü
3. **New Access Token** → `jwtUtils.generateAccessToken()`

**Success Path**: 200 OK + New Access Token
**Error Paths**: Invalid token → 401, User inactive → 403

### 1.5 Logout Akışları

#### Single Device Logout
**Başlangıç**: `POST /api/auth/logout`
**Adım**: Specific refresh token'ı sil

#### All Devices Logout
**Başlangıç**: `POST /api/auth/logout-all`
**Adım**: User'ın tüm refresh token'larını sil

### 1.6 Password Management

#### Change Password
**Başlangıç**: `POST /api/auth/change-password`
**Adımlar**:
1. Current password verify
2. New password hash
3. Database update
4. Other sessions terminate (security)

#### Forgot Password
**Başlangıç**: `POST /api/auth/forgot-password`
**Adımlar**:
1. Email validation
2. Reset token generation
3. Email sending
4. Token storage with expiry

#### Reset Password
**Başlangıç**: `POST /api/auth/reset-password`
**Adımlar**:
1. Token validation
2. Password hash
3. Database update
4. Token cleanup

## 👨‍⚕️ 2. DOKTOR AKIŞLARI

### 2.1 Profil Yönetimi Akışı

**Temel Profil Güncelleme**: `PUT /api/doctor/profile`

**Adımlar**:
1. **Authentication** → `authMiddleware` + `requireRole(['doctor'])`
2. **Validation** → `doctorPersonalInfoSchema`
3. **Photo Status Check** → Fotoğraf değişirse `photo_status: 'pending'`
4. **Database Update** → `doctor_profiles` tablosu
5. **Response** → Updated profile with specialty/city names

**Etkilenen Tablolar**: `doctor_profiles`, `specialties`, `subspecialties`, `cities`

### 2.2 Eğitim Bilgileri CRUD Akışı

#### Eğitim Ekleme: `POST /api/doctor/educations`
**Adımlar**:
1. **Profile Check** → `doctor_profiles` varlık kontrolü
2. **Education Type Validation** → "DİĞER" seçilirse `education_type` zorunlu
3. **Database Insert** → `doctor_educations` tablosu
4. **Response** → Join ile education type name

#### Eğitim Güncelleme: `PATCH /api/doctor/educations/:id`
**Adımlar**:
1. **Ownership Check** → `doctor_profile_id` kontrolü
2. **Education Type Logic** → "DİĞER" kuralı
3. **Database Update**
4. **Response** → Updated record with joins

#### Eğitim Silme: `DELETE /api/doctor/educations/:id`
**Adım**: **Soft Delete** → `deleted_at` set et

### 2.3 Deneyim Bilgileri CRUD Akışı

#### Deneyim Ekleme: `POST /api/doctor/experiences`
**Adımlar**:
1. **Profile Check**
2. **Current Job Logic** → `is_current: true` ise `end_date: null`
3. **Database Insert** → `doctor_experiences`
4. **Response** → Specialty/subspecialty names ile

#### Deneyim Güncelleme/Silme: Eğitim ile aynı pattern

### 2.4 Sertifika Bilgileri CRUD Akışı

#### Sertifika Ekleme: `POST /api/doctor/certificates`
**Adımlar**:
1. **Profile Check**
2. **Certificate Name Validation** → Zorunlu alan
3. **Database Insert** → `doctor_certificates`

**Not**: Lookup table kullanılmıyor, direkt text olarak saklanıyor

### 2.5 Dil Bilgileri CRUD Akışı

#### Dil Ekleme: `POST /api/doctor/languages`
**Adımlar**:
1. **Profile Check**
2. **Database Insert** → `doctor_languages`
3. **Response** → Language ve level names ile join

### 2.6 Profil Tamamlanma Hesaplama

**Endpoint**: `GET /api/doctor/profile/completion`

**Hesaplama Mantığı**:
1. **Profil Alanları** → Personal info, education, experience, certificates, languages
2. **Dolu Alan Sayısı** → Null olmayan ve boş string olmayan alanlar
3. **Yüzde Hesaplama** → `(completedFields / totalFields) * 100`
4. **Eksik Alanlar** → Missing fields listesi

### 2.7 Dashboard Akışı

**Endpoint**: `GET /api/doctor/dashboard`

**Paralel Data Fetching**:
1. **Recent Applications** → Son 100 başvuru
2. **Recent Jobs** → Son 100 iş ilanı

**Response**: Dashboard data object

## 🏥 3. HASTANE AKIŞLARI

### 3.1 Profil Yönetimi

**Profil Getirme**: `GET /api/hospital/profile`
**Adımlar**:
1. **Join Query** → `hospital_profiles` + `users` + `cities`
2. **Response** → Complete profile with city name

**Profil Güncelleme**: `PUT /api/hospital/profile`
**Adımlar**:
1. **Existence Check** → Profile var mı?
2. **Database Update** → `updated_at` otomatik
3. **Response** → Updated profile

### 3.2 İş İlanı Yönetimi Akışı

#### İş İlanı Oluşturma: `POST /api/hospital/jobs`

**Adımlar**:
1. **Hospital Profile Check** → `hospital_profiles` ID al
2. **Status Override** → `status_id: 1` (Onay Bekliyor) - HER ZAMAN
3. **Database Insert** → `jobs` tablosu
4. **Admin Notification** → Yeni ilan bildirimi
5. **Response** → Created job with joins

**Önemli**: Hastane status_id gönderemez, her zaman 1 (Pending Approval)

#### İş İlanı Güncelleme: `PUT /api/hospital/jobs/:id`

**Adımlar**:
1. **Ownership Check** → `hospital_id` kontrolü
2. **Status Check** → Sadece "Revizyon Gerekli" (status_id: 2) güncellenebilir
3. **Database Update** → `status_id` değiştirilemez
4. **Response** → Updated job

#### İş İlanı Resubmit: `POST /api/hospital/jobs/:id/resubmit`

**Adımlar**:
1. **Status Check** → Sadece "Revizyon Gerekli" (2) resubmit edilebilir
2. **Status Update** → `status_id: 1` (Onay Bekliyor)
3. **Revision Note Clear** → `revision_note: null`
4. **Job History** → Status change kaydı

#### İş İlanı Status Güncelleme: `PATCH /api/hospital/jobs/:id/status`

**Geçiş Kuralları**:
- Onaylandı (3) ↔ Pasif (4) ✓
- Diğer durumlardan geçiş ✗

**Adımlar**:
1. **Transition Validation** → Geçerli geçiş mi?
2. **Status Update**
3. **Published Date** → Pasif'ten Aktif'e geçişte güncelle
4. **Notification** → Başvuru yapan doktorlara bildirim

### 3.3 Başvuru Yönetimi Akışı

#### Başvuru Listeleme: `GET /api/hospital/applications`

**Adımlar**:
1. **Hospital Jobs** → Hastanenin ilanları
2. **Applications Filter** → Job ID'lere göre filtrele
3. **Pagination** → Sayfalama
4. **Response** → Applications with doctor info

#### Başvuru Status Güncelleme: `PUT /api/hospital/applications/:id/status`

**Adımlar**:
1. **Ownership Check** → Hastane bu başvuruya sahip mi?
2. **Status Update** → `applications.status_id`
3. **Notification** → Doktora bildirim gönder
4. **Response** → Updated application

### 3.4 Dashboard Akışı

**Endpoint**: `GET /api/hospital/dashboard`

**Paralel Data Fetching**:
1. **Recent Applications** → Son 100 başvuru
2. **Recent Jobs** → Son 100 iş ilanı

## 👑 4. ADMIN AKIŞLARI

### 4.1 Kullanıcı Yönetimi Akışı

#### Kullanıcı Onaylama: `PATCH /api/admin/users/:id/approval`

**Adımlar**:
1. **User Update** → `is_approved` değiştir
2. **Notification** → Kullanıcıya bildirim
3. **Audit Log** → Admin action kaydı
4. **Response** → Success message

#### Kullanıcı Aktiflik: `PATCH /api/admin/users/:id/status`

**Adımlar**:
1. **Field Validation** → `is_active` veya `is_approved`
2. **Database Update**
3. **Audit Log**
4. **Response** → Success message

### 4.2 İş İlanı Yönetimi Akışı

#### İş İlanı Onaylama: `POST /api/admin/jobs/:id/approve`

**Adımlar**:
1. **Status Update** → `status_id: 3` (Onaylandı)
2. **Published Date** → `published_at: now()`
3. **Job History** → Status change kaydı
4. **Notification** → Hastaneye bildirim
5. **Audit Log** → Admin action

#### İş İlanı Revizyon Talebi: `POST /api/admin/jobs/:id/revision`

**Adımlar**:
1. **Status Update** → `status_id: 2` (Revizyon Gerekli)
2. **Revision Note** → Admin'in notu kaydet
3. **Job History** → Status change
4. **Notification** → Hastaneye revizyon bildirimi
5. **Audit Log**

#### İş İlanı Reddetme: `POST /api/admin/jobs/:id/reject`

**Adımlar**:
1. **Status Update** → `status_id: 5` (Reddedildi)
2. **Rejection Reason** → Red sebebi kaydet
3. **Job History**
4. **Notification** → Hastaneye red bildirimi
5. **Audit Log**

### 4.3 Başvuru Yönetimi Akışı

#### Başvuru Status Güncelleme: `PUT /api/admin/applications/:id/status`

**Adımlar**:
1. **Status Update** → `applications.status_id`
2. **Audit Log** → Old/new values
3. **Notification** → Doktora bildirim
4. **Response** → Updated application

### 4.4 Fotoğraf Onay Sistemi

#### Fotoğraf Onaylama: `PATCH /api/admin/photo-requests/:id`

**Adımlar**:
1. **Action Validation** → 'approve' veya 'reject'
2. **Approve Path**:
   - `doctor_profiles.profile_photo` güncelle
   - `photo_status: 'approved'`
   - Request'i complete et
3. **Reject Path**:
   - `photo_status: 'rejected'`
   - Rejection reason kaydet
4. **Notification** → Doktora bildirim
5. **Audit Log**

## 📱 5. MOBILE API AKIŞLARI

### 5.1 Mobile Authentication

**Endpoint Pattern**: `/api/mobile/auth/*`

**Özellikler**:
- Optimized response payloads
- Mobile-specific error handling
- Same business logic as web

#### Mobile Login: `POST /api/mobile/auth/login`

**Adımlar**:
1. **Validation** → Mobile schemas
2. **Auth Logic** → Same as web (`mobileAuthService`)
3. **Response** → Mobile-optimized format

### 5.2 Mobile Job Listing

**Endpoint**: `GET /api/mobile/jobs`

**Adımlar**:
1. **Authentication** → Mobile auth middleware
2. **Filtering** → City, specialty, hospital, keyword
3. **Pagination** → Mobile-optimized
4. **Response** → `sendPaginated` format

### 5.3 Mobile Applications

**Endpoint Pattern**: `/api/mobile/applications/*`

**Özellikler**:
- Same CRUD operations as web
- Mobile-optimized responses
- Transformer'lar ile data formatting

### 5.4 Mobile Transformers

**Dosyalar**: `Backend/src/mobile/transformers/`

**İşlev**: Web API response'larını mobile için optimize et
- **applicationTransformer.js** → Başvuru data formatting
- **jobTransformer.js** → İş ilanı data formatting
- **notificationTransformer.js** → Bildirim formatting
- **profileTransformer.js** → Profil data formatting

## 🔔 6. NOTIFICATION AKIŞLARI

### 6.1 Bildirim Gönderme Akışı

**Service**: `notificationService.sendNotification()`

**Adımlar**:
1. **Database Insert** → `notifications` tablosu
2. **Push Notification** → Expo push service (mobile)
3. **SSE Broadcast** → Real-time web notification
4. **Email** → Kritik bildirimler için (opsiyonel)

### 6.2 Real-time Notification Stream

**Endpoint**: `GET /api/notifications/stream` (SSE)

**Adımlar**:
1. **SSE Connection** → Server-Sent Events
2. **User Filter** → Sadece kullanıcının bildirimleri
3. **Real-time Push** → Yeni bildirimler anında gönderilir

### 6.3 Push Notification Akışı

**Mobile için Expo Push Service**:

**Adımlar**:
1. **Device Token Registration** → `POST /api/mobile/device-token`
2. **Token Storage** → Database'de sakla
3. **Notification Send** → Expo API'ye gönder
4. **Delivery Tracking** → Success/failure tracking

## 📧 7. EMAIL AKIŞLARI

### 7.1 Email Service

**Service**: `emailService.js`

**Template'ler**:
- **base.html** → Temel email layout
- **welcome.html** → Hoş geldin emaili
- **passwordReset.html** → Şifre sıfırlama

**Adımlar**:
1. **Template Selection** → Email türüne göre
2. **Data Injection** → Template'e veri enjekte et
3. **SMTP Send** → Email gönderimi
4. **Error Handling** → Gönderim hatası yönetimi

### 7.2 Password Reset Email Flow

**Trigger**: `POST /api/auth/forgot-password`

**Adımlar**:
1. **User Check** → Email kayıtlı mı?
2. **Token Generation** → Crypto random token
3. **Token Storage** → Database'de expiry ile
4. **Email Send** → Reset link ile email
5. **Response** → Generic success message (security)

## 📊 8. LOGGING VE MONITORING AKIŞLARI

### 8.1 Audit Logging

**Service**: `LogService.createAuditLog()`

**Kayıt Edilen Aksiyonlar**:
- User registration, login, logout
- Profile updates
- Job creation, status changes
- Application submissions, status changes
- Admin actions

**Log Fields**:
- Actor (kim yaptı)
- Action (ne yaptı)
- Resource (neyi etkiledi)
- Old/New values
- IP, User Agent
- Timestamp

### 8.2 Security Logging

**Service**: `LogService.createSecurityLog()`

**Kayıt Edilen Olaylar**:
- Failed login attempts
- Suspicious activities
- Permission violations
- Token issues

### 8.3 Winston Logger

**Levels**: error, warn, info, debug

**Transports**:
- Console (development)
- File (production)
- Database (audit logs)

## 🔄 9. CRON JOB AKIŞLARI

### 9.1 Job Expiration Cron

**Dosya**: `jobExpirationCron.js`

**İşlev**: Süresi dolmuş iş ilanlarını otomatik pasifleştir

**Adımlar**:
1. **Expired Jobs Query** → `expires_at < now()`
2. **Status Update** → `status_id: 4` (Pasif)
3. **Notification** → Hastane + başvuru yapan doktorlara
4. **Logging** → İşlem kaydı

### 9.2 Log Cleanup Cron

**Dosya**: `logCleanupCron.js`

**İşlev**: Eski logları temizle

**Adımlar**:
1. **Old Logs Query** → 90 gün öncesi
2. **Delete** → Eski kayıtları sil
3. **Logging** → Temizlik raporu

### 9.3 Token Cleanup

**Dosya**: `tokenCleanup.js`

**İşlev**: Süresi dolmuş refresh token'ları temizle

**Adımlar**:
1. **Expired Tokens Query**
2. **Delete** → Süresi dolmuş token'lar
3. **Logging** → Temizlik raporu

## 🔒 10. SECURITY AKIŞLARI

### 10.1 Rate Limiting

**Middleware**: `rateLimitMiddleware.js`

**Kurallar**:
- Auth endpoints: 5 req/min
- General endpoints: 100 req/15min
- IP bazlı limiting

### 10.2 Input Validation

**Middleware**: `validationMiddleware.js`

**Schemas**: Joi ile tanımlı validation schemas
- Request body validation
- Query parameter validation
- URL parameter validation

### 10.3 File Upload Security

**Middleware**: `uploadMiddleware.js`

**Güvenlik Kontrolleri**:
- File type validation
- File size limits
- Malicious file detection
- Secure file naming

## 🌐 11. FRONTEND AKIŞLARI

### 11.1 Authentication Flow

**Store**: `authStore.js` (Zustand)

**Adımlar**:
1. **Login** → API call + token storage
2. **Token Refresh** → Otomatik yenileme
3. **Route Protection** → Private route guards
4. **Logout** → Token cleanup + redirect

### 11.2 API Integration

**Config**: `api.js`

**Özellikler**:
- Centralized endpoint definitions
- Axios interceptors
- Error handling
- Loading states

### 11.3 State Management

**Tools**:
- **React Query** → Server state
- **Zustand** → Client state
- **Local Storage** → Persistence

### 11.4 Real-time Updates

**Implementation**:
- **SSE Connection** → Server-Sent Events
- **Notification Stream** → Real-time notifications
- **Auto Refresh** → Data synchronization

## 🔄 12. DATA FLOW PATTERNS

### 12.1 Request/Response Pattern

```
Frontend → API Call → Controller → Service → Database
Database → Service → Controller → Response → Frontend
```

### 12.2 Authentication Pattern

```
Login → JWT Generation → Token Storage → Request Headers → Middleware Validation
```

### 12.3 Notification Pattern

```
Action Trigger → Service Call → Database Insert → Push/SSE → Frontend Update
```

### 12.4 File Upload Pattern

```
Frontend → Multer Middleware → File Validation → Storage → Database URL → Response
```

## 🚨 13. ERROR HANDLING PATTERNS

### 13.1 Backend Error Handling

**Global Handler**: `errorHandler.js`

**Error Types**:
- **AppError** → Custom application errors
- **ValidationError** → Joi validation errors
- **DatabaseError** → SQL errors
- **AuthError** → Authentication errors

### 13.2 Frontend Error Handling

**Error Boundary**: React Error Boundary
**API Errors**: Axios interceptors
**User Feedback**: Toast notifications

### 13.3 Mobile Error Handling

**Middleware**: `mobileErrorHandler.js`
**Format**: Mobile-optimized error responses

## 📈 14. PERFORMANCE OPTIMIZATIONS

### 14.1 Database Optimizations

- **Indexes** → Frequently queried columns
- **Joins** → Reduce N+1 queries
- **Pagination** → Large datasets
- **Soft Deletes** → Data integrity

### 14.2 API Optimizations

- **Response Caching** → Static data
- **Compression** → Gzip responses
- **Rate Limiting** → Resource protection
- **Pagination** → Large datasets

### 14.3 Frontend Optimizations

- **Lazy Loading** → Code splitting
- **React Query** → Caching + background updates
- **Memoization** → Expensive calculations
- **Virtual Scrolling** → Large lists

## 🔧 15. DEPLOYMENT AKIŞLARI

### 15.1 Backend Deployment

**Steps**:
1. **Environment Setup** → `.env` configuration
2. **Database Migration** → Schema updates
3. **Dependency Install** → `npm install`
4. **Process Start** → PM2 or similar
5. **Health Check** → `/api/health` endpoint

### 15.2 Frontend Deployment

**Steps**:
1. **Build** → `npm run build`
2. **Static Files** → Serve via nginx/CDN
3. **Environment Config** → API URLs
4. **Cache Headers** → Browser caching

### 15.3 Database Migration

**Pattern**:
1. **Backup** → Current database
2. **Migration Scripts** → Schema changes
3. **Data Migration** → If needed
4. **Validation** → Data integrity check
5. **Rollback Plan** → If issues occur

---

## 📝 ÖZET

Bu dokümantasyon, MediKariyer projesindeki tüm major akışları kapsar:

- **15 Ana Akış Kategorisi**
- **50+ Detaylı Alt Akış**
- **100+ Endpoint Analizi**
- **Cross-Module Dependencies**
- **Error Handling Strategies**
- **Performance Considerations**

Her akış için başlangıç noktası, adımlar, decision points, error paths ve success paths detaylandırılmıştır. Bu dokümantasyon, yeni geliştirmelerde referans olarak kullanılabilir ve sistem anlayışını derinleştirir.

**Son Güncelleme**: 25 Mart 2026
**Kapsam**: Full-Stack + Mobile API + Admin Panel
**Durum**: Comprehensive Analysis Complete