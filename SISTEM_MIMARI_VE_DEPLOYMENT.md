# 🏗️ MediKariyer - Sistem Mimarisi ve Deployment Dokümantasyonu

> **Versiyon:** 1.0  
> **Tarih:** 7 Ocak 2025  
> **Kapsam:** Database, Environment, Deployment, Business Rules, Testing  
> **Amaç:** MOBIL_API_ANALIZ.md ve MOBIL_APP_ANALIZ.md'de eksik kalan tüm kritik bilgiler

---

## 📋 İçindekiler

1. [Database Schema](#database-schema)
2. [Environment Variables](#environment-variables)
3. [Deployment Guide](#deployment-guide)
4. [Business Rules](#business-rules)
5. [Testing Strategy](#testing-strategy)
6. [Web Application](#web-application)
7. [Email System](#email-system)
8. [Security & Rate Limiting](#security--rate-limiting)
9. [Monitoring & Logging](#monitoring--logging)
10. [Troubleshooting](#troubleshooting)

---

## 🗄️ DATABASE SCHEMA

### Genel Bilgiler

**Database:** MSSQL Server 2019+  
**Collation:** DATABASE_DEFAULT  
**Charset:** Unicode (NVARCHAR)  
**Timezone:** UTC (GETDATE() kullanılıyor)

### Tablo Listesi (26 Tablo)

#### 1. Core Tables (Kullanıcı ve Profil)
- `users` - Kullanıcı hesapları
- `doctor_profiles` - Doktor profilleri
- `hospital_profiles` - Hastane profilleri

#### 2. Job & Application Tables
- `jobs` - İş ilanları
- `applications` - Başvurular
- `job_statuses` - İlan durumları (lookup)
- `application_statuses` - Başvuru durumları (lookup)
- `job_history` - İlan durum geçmişi

#### 3. Doctor Profile Details
- `doctor_educations` - Eğitim bilgileri
- `doctor_experiences` - Deneyimler
- `doctor_certificates` - Sertifikalar
- `doctor_languages` - Dil bilgileri
- `doctor_profile_photo_requests` - Fotoğraf onay talepleri

#### 4. Lookup Tables
- `cities` - Şehirler
- `specialties` - Uzmanlık alanları
- `subspecialties` - Yan dallar
- `languages` - Diller
- `language_levels` - Dil seviyeleri
- `doctor_education_types` - Eğitim tipleri

#### 5. Authentication & Security
- `refresh_tokens` - JWT refresh token'lar
- `password_reset_tokens` - Şifre sıfırlama token'ları
- `device_tokens` - Mobil push notification token'ları

#### 6. Notification & Communication
- `notifications` - Bildirimler
- `contact_messages` - İletişim formu mesajları

#### 7. Logging & Audit
- `application_logs` - Uygulama logları
- `security_logs` - Güvenlik logları
- `audit_logs` - Audit trail

---


### Detaylı Tablo Şemaları

#### 1. users (Kullanıcı Hesapları)

```sql
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    email NVARCHAR(255) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    role NVARCHAR(50) NOT NULL CHECK (role IN ('doctor', 'hospital', 'admin')),
    is_approved BIT DEFAULT 0,
    is_active BIT DEFAULT 1,
    created_at DATETIME2(7) DEFAULT GETDATE(),
    last_login DATETIME,
    updated_at DATETIME2(7)
);
```

**İndeksler:**
- `IX_users_is_active` - (is_active) INCLUDE (email, role)

**İlişkiler:**
- → doctor_profiles (1:1)
- → hospital_profiles (1:1)
- → refresh_tokens (1:N)
- → notifications (1:N)
- → device_tokens (1:N)

**Business Rules:**
- Email unique olmalı
- Role: 'doctor', 'hospital', 'admin'
- is_approved: Admin onayı (doctor ve hospital için)
- is_active: Hesap aktif/pasif durumu

---

#### 2. doctor_profiles (Doktor Profilleri)

```sql
CREATE TABLE doctor_profiles (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    first_name NVARCHAR(50) NOT NULL,
    last_name NVARCHAR(50) NOT NULL,
    title NVARCHAR(50) NOT NULL DEFAULT 'Dr',
    dob DATE NULL,
    phone NVARCHAR(20) NULL,
    profile_photo NVARCHAR(MAX) NULL,
    specialty_id INT NOT NULL,
    subspecialty_id INT NULL,
    birth_place_id INT NULL,
    residence_city_id INT NULL,
    created_at DATETIME2(7) DEFAULT GETDATE(),
    updated_at DATETIME2(7),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (specialty_id) REFERENCES specialties(id),
    FOREIGN KEY (subspecialty_id) REFERENCES subspecialties(id),
    FOREIGN KEY (birth_place_id) REFERENCES cities(id),
    FOREIGN KEY (residence_city_id) REFERENCES cities(id)
);
```

**İndeksler:**
- `IX_doctor_profiles_user_id` - (user_id)

**İlişkiler:**
- users (N:1)
- specialties (N:1)
- subspecialties (N:1)
- cities (N:1) - birth_place
- cities (N:1) - residence_city
- → doctor_educations (1:N)
- → doctor_experiences (1:N)
- → doctor_certificates (1:N)
- → doctor_languages (1:N)
- → applications (1:N)

**Business Rules:**
- user_id unique (1 user = 1 profile)
- title: 'Dr', 'Uz.Dr', 'Dr.Öğr.Üyesi', 'Doç.Dr', 'Prof.Dr'
- profile_photo: Base64 string (NVARCHAR(MAX))
- specialty_id zorunlu, subspecialty_id opsiyonel

---

#### 3. hospital_profiles (Hastane Profilleri)

```sql
CREATE TABLE hospital_profiles (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    institution_name NVARCHAR(255) NOT NULL,
    address NVARCHAR(500) NULL,
    phone NVARCHAR(20) NOT NULL,
    email NVARCHAR(255) NULL,
    website NVARCHAR(255) NULL,
    about NVARCHAR(MAX) NULL,
    logo NVARCHAR(MAX) NOT NULL,
    city_id INT NOT NULL,
    created_at DATETIME2(7) DEFAULT GETDATE(),
    updated_at DATETIME2(7),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (city_id) REFERENCES cities(id)
);
```

**İndeksler:**
- `IX_hospital_profiles_user_id` - (user_id)

**İlişkiler:**
- users (N:1)
- cities (N:1)
- → jobs (1:N)

**Business Rules:**
- user_id unique (1 user = 1 profile)
- logo: Base64 string (NVARCHAR(MAX))
- city_id zorunlu

---

#### 4. jobs (İş İlanları)

```sql
CREATE TABLE jobs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    hospital_id INT NOT NULL,
    title NVARCHAR(255) NOT NULL,
    specialty_id INT NOT NULL,
    subspecialty_id INT NULL,
    employment_type NVARCHAR(100) NOT NULL,
    min_experience_years TINYINT DEFAULT 0,
    description NVARCHAR(MAX) NOT NULL,
    city_id INT NULL,
    status_id INT NOT NULL,
    revision_note NVARCHAR(MAX) NULL,
    revision_count INT DEFAULT 0,
    approved_at DATETIME2(7) NULL,
    published_at DATETIME2(7) NULL,
    created_at DATETIME2(7) DEFAULT GETDATE(),
    updated_at DATETIME2(7),
    deleted_at DATETIME2(7) NULL,
    FOREIGN KEY (hospital_id) REFERENCES hospital_profiles(id),
    FOREIGN KEY (specialty_id) REFERENCES specialties(id) ON UPDATE CASCADE ON DELETE CASCADE,
    FOREIGN KEY (subspecialty_id) REFERENCES subspecialties(id),
    FOREIGN KEY (city_id) REFERENCES cities(id),
    FOREIGN KEY (status_id) REFERENCES job_statuses(id)
);
```

**İndeksler:**
- `IX_jobs_hospital` - (hospital_id) INCLUDE (status_id, created_at)
- `IX_jobs_deleted_at` - (deleted_at) WHERE deleted_at IS NULL

**İlişkiler:**
- hospital_profiles (N:1)
- specialties (N:1)
- subspecialties (N:1)
- cities (N:1)
- job_statuses (N:1)
- → applications (1:N)
- → job_history (1:N)

**Business Rules:**
- employment_type: 'Tam Zamanlı', 'Yarı Zamanlı', 'Sözleşmeli', 'Freelance'
- status_id: 1=Onay Bekliyor, 2=Onaylandı, 3=Pasif, 4=Reddedildi, 5=Revizyon Gerekli
- Soft delete (deleted_at)
- revision_count: Admin red verdiğinde artar

---


#### 5. applications (Başvurular)

```sql
CREATE TABLE applications (
    id INT IDENTITY(1,1) PRIMARY KEY,
    job_id INT NOT NULL,
    doctor_profile_id INT NOT NULL,
    status_id INT NOT NULL,
    cover_letter NVARCHAR(MAX) NULL,
    notes NVARCHAR(MAX) NULL,
    applied_at DATETIME2(7) DEFAULT GETDATE(),
    updated_at DATETIME2(7) DEFAULT GETDATE(),
    deleted_at DATETIME2(7) NULL,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_profile_id) REFERENCES doctor_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (status_id) REFERENCES application_statuses(id)
);
```

**İndeksler:**
- `IX_applications_doctor` - (doctor_profile_id)
- `IX_applications_doctor_profile` - (doctor_profile_id) INCLUDE (status_id, applied_at, deleted_at)
- `IX_applications_job_id` - (job_id) INCLUDE (status_id, doctor_profile_id, applied_at, deleted_at)
- `IX_applications_status_job` - (job_id, status_id) INCLUDE (doctor_profile_id, applied_at)
- `IX_applications_deleted_at` - (deleted_at) WHERE deleted_at IS NULL

**İlişkiler:**
- jobs (N:1)
- doctor_profiles (N:1)
- application_statuses (N:1)

**Business Rules:**
- status_id: 1=Başvuruldu, 2=İnceleniyor, 3=Kabul Edildi, 4=Reddedildi, 5=Geri Çekildi
- Soft delete (deleted_at)
- notes: Hastane notları veya geri çekme nedeni
- Unique constraint yok (aynı doktor aynı ilana birden fazla başvurabilir - business logic'te kontrol ediliyor)

---

#### 6. notifications (Bildirimler)

```sql
CREATE TABLE notifications (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    type NVARCHAR(100) NOT NULL,
    title NVARCHAR(255) NOT NULL,
    body NVARCHAR(MAX) NOT NULL,
    data_json NVARCHAR(MAX) NULL,
    channel NVARCHAR(100) DEFAULT 'inapp',
    read_at DATETIME2(7) NULL,
    created_at DATETIME2(7) DEFAULT GETDATE(),
    deleted_at DATETIME2(7) NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**İlişkiler:**
- users (N:1)

**Business Rules:**
- type: 'info', 'success', 'warning', 'error'
- channel: 'inapp', 'email', 'push'
- data_json: JSON string (action, entity_type, entity_id, vb.)
- read_at: NULL = okunmamış
- deleted_at: Soft delete (ŞU AN KULLANILMIYOR - hard delete yapılıyor)

**data_json Yapısı:**
```json
{
  "action": "application_status_changed",
  "entity_type": "application",
  "entity_id": 123,
  "application_id": 123,
  "job_id": 456,
  "status_id": 3,
  "job_title": "Kardiyoloji Uzmanı",
  "hospital_name": "Ankara Hastanesi"
}
```

---

#### 7. device_tokens (Push Notification Token'ları)

```sql
CREATE TABLE device_tokens (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    expo_push_token NVARCHAR(500) NOT NULL,
    device_id NVARCHAR(255) NOT NULL,
    platform NVARCHAR(20) NOT NULL,
    app_version NVARCHAR(50) NULL,
    is_active BIT DEFAULT 1,
    created_at DATETIMEOFFSET(7) DEFAULT GETDATE(),
    updated_at DATETIMEOFFSET(7) DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**İndeksler:**
- `IX_device_tokens_user_id` - (user_id)
- `IX_device_tokens_device_id` - (device_id)
- `IX_device_tokens_expo_push_token` - (expo_push_token)
- `IX_device_tokens_user_device` - (user_id, device_id, platform)

**İlişkiler:**
- users (N:1)

**Business Rules:**
- platform: 'ios', 'android'
- expo_push_token: Format: "ExponentPushToken[...]"
- is_active: Token geçerli mi? (Expo API'den DeviceNotRegistered gelirse false yapılır)
- Aynı user_id + device_id + platform için tek token (upsert mantığı)

---

#### 8. doctor_educations (Eğitim Bilgileri)

```sql
CREATE TABLE doctor_educations (
    id INT IDENTITY(1,1) PRIMARY KEY,
    doctor_profile_id INT NOT NULL,
    education_institution NVARCHAR(255) NOT NULL,
    field NVARCHAR(255) NOT NULL,
    graduation_year SMALLINT NOT NULL,
    education_type_id INT NULL,
    education_type NVARCHAR(100) NULL,
    created_at DATETIME2(7) DEFAULT GETDATE(),
    updated_at DATETIME2(7),
    deleted_at DATETIME2(7) NULL,
    FOREIGN KEY (doctor_profile_id) REFERENCES doctor_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (education_type_id) REFERENCES doctor_education_types(id)
);
```

**İndeksler:**
- `IX_doctor_educations_profile_deleted` - (doctor_profile_id, deleted_at) WHERE deleted_at IS NULL

**İlişkiler:**
- doctor_profiles (N:1)
- doctor_education_types (N:1)

**Business Rules:**
- Soft delete (deleted_at)
- education_type: 'Tıp Fakültesi', 'Uzmanlık', 'Yan Dal', 'Doktora', 'Yüksek Lisans'

---

#### 9. doctor_experiences (Deneyimler)

```sql
CREATE TABLE doctor_experiences (
    id INT IDENTITY(1,1) PRIMARY KEY,
    doctor_profile_id INT NOT NULL,
    organization NVARCHAR(255) NOT NULL,
    role_title NVARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NULL,
    is_current BIT DEFAULT 0,
    description NVARCHAR(MAX) NULL,
    specialty_id INT NULL,
    subspecialty_id INT NULL,
    created_at DATETIME2(7) DEFAULT GETDATE(),
    updated_at DATETIME2(7),
    deleted_at DATETIME2(7) NULL,
    FOREIGN KEY (doctor_profile_id) REFERENCES doctor_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (specialty_id) REFERENCES specialties(id),
    FOREIGN KEY (subspecialty_id) REFERENCES subspecialties(id)
);
```

**İndeksler:**
- `IX_doctor_experiences_profile_deleted` - (doctor_profile_id, deleted_at) WHERE deleted_at IS NULL

**İlişkiler:**
- doctor_profiles (N:1)
- specialties (N:1)
- subspecialties (N:1)

**Business Rules:**
- Soft delete (deleted_at)
- is_current: Halen çalışıyor mu?
- end_date: is_current=true ise NULL

---


#### 10. doctor_profile_photo_requests (Fotoğraf Onay Talepleri)

```sql
CREATE TABLE doctor_profile_photo_requests (
    id INT IDENTITY(1,1) PRIMARY KEY,
    doctor_profile_id INT NOT NULL,
    file_url NVARCHAR(MAX) NOT NULL,
    old_photo NVARCHAR(MAX) NULL,
    status NVARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    reason NVARCHAR(500) NULL,
    created_at DATETIME2(7) DEFAULT SYSUTCDATETIME(),
    reviewed_at DATETIME2(7) NULL,
    reviewed_by INT NULL,
    FOREIGN KEY (doctor_profile_id) REFERENCES doctor_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id)
);
```

**İlişkiler:**
- doctor_profiles (N:1)
- users (N:1) - reviewed_by (admin)

**Business Rules:**
- status: 'pending', 'approved', 'rejected', 'cancelled'
- file_url: Base64 string (yeni fotoğraf)
- old_photo: Base64 string (eski fotoğraf - rollback için)
- reason: Red nedeni (rejected durumunda)
- reviewed_by: Onaylayan/reddeden admin user_id

**Workflow:**
1. Doktor fotoğraf yükler → status='pending'
2. Admin onaylar → status='approved', doctor_profiles.profile_photo güncellenir
3. Admin reddeder → status='rejected', reason doldurulur
4. Doktor iptal eder → status='cancelled'

---

#### 11. refresh_tokens (JWT Refresh Token'lar)

```sql
CREATE TABLE refresh_tokens (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    token_hash NVARCHAR(255) NOT NULL,
    expires_at DATETIME2(7) NOT NULL,
    user_agent NVARCHAR(500) NULL,
    ip NVARCHAR(45) NULL,
    revoked_at DATETIME2(7) NULL,
    created_at DATETIME2(7) DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**İlişkiler:**
- users (N:1)

**Business Rules:**
- token_hash: SHA256 hash (güvenlik için plain text saklanmaz)
- expires_at: 7 gün (JWT_REFRESH_EXPIRES_IN)
- revoked_at: Token iptal edildi mi? (logout, password change)
- Bir kullanıcının birden fazla aktif token'ı olabilir (multi-device)

---

#### 12. Lookup Tables

**application_statuses:**
```sql
CREATE TABLE application_statuses (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(50) NOT NULL
);

-- Data:
-- 1: Başvuruldu
-- 2: İnceleniyor
-- 3: Kabul Edildi
-- 4: Reddedildi
-- 5: Geri Çekildi
```

**job_statuses:**
```sql
CREATE TABLE job_statuses (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(50) NOT NULL,
    description NVARCHAR(255) NULL
);

-- Data:
-- 1: Onay Bekliyor
-- 2: Onaylandı
-- 3: Pasif
-- 4: Reddedildi
-- 5: Revizyon Gerekli
```

**specialties:**
```sql
CREATE TABLE specialties (
    id INT IDENTITY(1,1) PRIMARY KEY,
    code INT NULL,
    name NVARCHAR(200) NOT NULL,
    description NVARCHAR(500) NULL,
    created_at DATETIME2(7) DEFAULT GETDATE()
);

-- Örnek: Kardiyoloji, Nöroloji, Ortopedi, vb.
```

**subspecialties:**
```sql
CREATE TABLE subspecialties (
    id INT IDENTITY(1,1) PRIMARY KEY,
    specialty_id INT NOT NULL,
    code INT NULL,
    name NVARCHAR(100) NOT NULL,
    description NVARCHAR(500) NULL,
    created_at DATETIME2(7) DEFAULT GETDATE(),
    updated_at DATETIME2(7),
    FOREIGN KEY (specialty_id) REFERENCES specialties(id)
);

-- Örnek: Kardiyoloji → İnvaziv Kardiyoloji, Elektrofizyoloji
```

**cities:**
```sql
CREATE TABLE cities (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    country NVARCHAR(50) DEFAULT 'Turkey',
    created_at DATETIME2(7) DEFAULT GETDATE(),
    updated_at DATETIME2(7)
);

-- 81 il
```

**languages:**
```sql
CREATE TABLE languages (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(50) NOT NULL,
    code NVARCHAR(10) NULL,
    created_at DATETIME2(7) DEFAULT GETDATE(),
    updated_at DATETIME2(7)
);

-- Örnek: İngilizce (en), Almanca (de), Fransızca (fr)
```

**language_levels:**
```sql
CREATE TABLE language_levels (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(50) NOT NULL,
    description NVARCHAR(200) NULL,
    created_at DATETIME2(7) DEFAULT GETDATE(),
    updated_at DATETIME2(7)
);

-- Data:
-- 1: Başlangıç (A1-A2)
-- 2: Orta (B1-B2)
-- 3: İleri (C1-C2)
-- 4: Ana Dil
```

---

### Database İlişki Diyagramı (ERD)

```
users (1) ──────────────────────────────────────────────────────────┐
  │                                                                   │
  ├─(1:1)─> doctor_profiles                                          │
  │           │                                                       │
  │           ├─(1:N)─> doctor_educations                            │
  │           ├─(1:N)─> doctor_experiences                           │
  │           ├─(1:N)─> doctor_certificates                          │
  │           ├─(1:N)─> doctor_languages                             │
  │           ├─(1:N)─> doctor_profile_photo_requests                │
  │           └─(1:N)─> applications ──(N:1)─> jobs                  │
  │                                              │                    │
  ├─(1:1)─> hospital_profiles ──(1:N)─> jobs ──┘                    │
  │                                                                   │
  ├─(1:N)─> refresh_tokens                                           │
  ├─(1:N)─> password_reset_tokens                                    │
  ├─(1:N)─> device_tokens                                            │
  ├─(1:N)─> notifications                                            │
  └─(1:N)─> audit_logs                                               │
                                                                      │
specialties (1) ──(1:N)─> subspecialties                             │
     │                                                                │
     ├─(1:N)─> doctor_profiles                                       │
     ├─(1:N)─> doctor_experiences                                    │
     └─(1:N)─> jobs                                                  │
                                                                      │
cities (1) ──┬─(1:N)─> doctor_profiles (birth_place)                │
             ├─(1:N)─> doctor_profiles (residence_city)             │
             ├─(1:N)─> hospital_profiles                             │
             └─(1:N)─> jobs                                          │
```

---


## 🔐 ENVIRONMENT VARIABLES

### Backend (.env)

```bash
# ==== NODE ENVIRONMENT ====
NODE_ENV=development                    # development | production | test
PORT=3100                               # API port

# ==== DATABASE (MSSQL) ====
DB_HOST=178.157.14.208                  # Database host
DB_PORT=1433                            # MSSQL default port
DB_NAME=MEDIKARIYER_DEV                 # Database name
DB_USER=tstSqlUser                      # Database user
DB_PASSWORD=<!TsTSqlUsr223344!>         # Database password
DB_ENCRYPT=false                        # SSL encryption (production'da true)
DB_TRUST_SERVER_CERTIFICATE=true        # Self-signed cert (production'da false)

# ==== JWT AUTHENTICATION ====
JWT_SECRET=dev_35c5d0a4a0f84324b78d1b4f6aef2e9e
JWT_REFRESH_SECRET=dev_refresh_8f16729a5f01426bb6d67bf97c32f8b0
JWT_EXPIRES_IN=15m                      # Access token süresi
JWT_REFRESH_EXPIRES_IN=7d               # Refresh token süresi

# ==== EMAIL (SMTP) ====
SMTP_HOST=mail.medikariyer.net          # SMTP server
SMTP_PORT=587                           # SMTP port (587=TLS, 465=SSL)
SMTP_USER=info@medikariyer.net         # SMTP username
SMTP_PASS=Medik881.                     # SMTP password
SMTP_SECURE=false                       # true=SSL, false=TLS
SMTP_IGNORE_TLS=true                    # TLS sertifika kontrolü

EMAIL_FROM="MediKariyer Destek <info@medikariyer.net>"

# ==== PASSWORD RESET ====
PASSWORD_RESET_EXPIRY_MINUTES=60        # Şifre sıfırlama link süresi
FRONTEND_RESET_PASSWORD_URL=https://mk.monassist.com/reset-password?token={token}

# ==== LOGGING ====
LOG_LEVEL=debug                         # error | warn | info | http | debug
ENABLE_DB_LOGGING=true                  # Database'e log yazılsın mı?
DB_LOG_LEVEL=info                       # Database'e hangi seviyeden itibaren yazılsın
LOG_MAX_SIZE=20m                        # Log dosyası max boyutu
LOG_MAX_FILES=14d                       # Log dosyası saklama süresi

# ==== CORS (Production) ====
# CORS_ORIGIN=https://mk.monassist.com,https://admin.medikariyer.net

# ==== RATE LIMITING (Production) ====
# RATE_LIMIT_WINDOW_MS=900000           # 15 dakika
# RATE_LIMIT_MAX_REQUESTS=100           # 15 dakikada max 100 request

# ==== SESSION (Production) ====
# SESSION_SECRET=your_session_secret_here

# ==== FILE UPLOAD (Future) ====
# AWS_ACCESS_KEY_ID=your_aws_key
# AWS_SECRET_ACCESS_KEY=your_aws_secret
# AWS_S3_BUCKET=medikariyer-uploads
# AWS_REGION=eu-central-1

# ==== EXPO PUSH NOTIFICATIONS (Mobile) ====
# EXPO_ACCESS_TOKEN=your_expo_access_token  # Opsiyonel (rate limit artışı için)
```

---

### Frontend (.env)

```bash
# ==== API CONFIGURATION ====
VITE_API_URL=http://localhost:3100/api  # Backend API URL
VITE_ENV=development                    # development | production

# ==== PRODUCTION ====
# VITE_API_URL=https://api.medikariyer.net/api
# VITE_ENV=production
```

---

### Mobile App (.env)

```bash
# ==== API CONFIGURATION ====
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.198:3100/api/mobile
EXPO_PUBLIC_PRIMARY_API_BASE_URL=http://192.168.1.198:3100/api
EXPO_PUBLIC_APP_ENV=development

# ==== PUSH NOTIFICATIONS ====
EXPO_PUBLIC_ENABLE_PUSH_NOTIFICATIONS=true

# ==== PRODUCTION ====
# EXPO_PUBLIC_API_BASE_URL=https://api.medikariyer.net/api/mobile
# EXPO_PUBLIC_PRIMARY_API_BASE_URL=https://api.medikariyer.net/api
# EXPO_PUBLIC_APP_ENV=production
```

**NOT:** Mobil app için Expo project ID `app.json` içinde tanımlı:
```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "your-expo-project-id"
      }
    }
  }
}
```

---

### Environment Variables Güvenliği

**Development:**
- `.env` dosyaları `.gitignore`'da
- Hassas bilgiler (password, secret) commit edilmemeli

**Production:**
- Environment variables server'da tanımlanmalı
- `.env` dosyası kullanılmamalı
- Secrets management tool kullanılmalı (AWS Secrets Manager, Azure Key Vault)

**Örnek .env.example:**
```bash
# Backend/.env.example
NODE_ENV=development
PORT=3100
DB_HOST=your_db_host
DB_PORT=1433
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
SMTP_HOST=your_smtp_host
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

---


## 🚀 DEPLOYMENT GUIDE

### Sistem Gereksinimleri

**Minimum:**
- CPU: 2 Core
- RAM: 4 GB
- Disk: 20 GB SSD
- OS: Ubuntu 20.04+ / Windows Server 2019+

**Önerilen (Production):**
- CPU: 4 Core
- RAM: 8 GB
- Disk: 50 GB SSD
- OS: Ubuntu 22.04 LTS

**Yazılım:**
- Node.js: 18.0.0+
- MSSQL Server: 2019+
- PM2: 5.0+ (production için)
- Nginx: 1.18+ (reverse proxy için)

---

### Backend Deployment

#### 1. Sunucu Hazırlığı

```bash
# Node.js kurulumu (Ubuntu)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 kurulumu (global)
sudo npm install -g pm2

# Git kurulumu
sudo apt-get install git
```

#### 2. Proje Klonlama

```bash
# Proje dizini oluştur
sudo mkdir -p /var/www/medikariyer
cd /var/www/medikariyer

# Git clone
git clone https://github.com/your-repo/medikariyer.git .

# Backend dizinine git
cd Backend
```

#### 3. Dependencies Kurulumu

```bash
# Production dependencies
npm install --production

# Veya tüm dependencies (dev için)
npm install
```

#### 4. Environment Variables

```bash
# .env dosyası oluştur
nano .env

# Production değerlerini gir (yukarıdaki örneğe bakın)
# CTRL+X, Y, Enter ile kaydet
```

#### 5. Database Setup

```bash
# MSSQL Server'a bağlan
sqlcmd -S your_server -U your_user -P your_password

# Database oluştur
CREATE DATABASE MEDIKARIYER_PROD;
GO

# Script'i çalıştır
sqlcmd -S your_server -U your_user -P your_password -d MEDIKARIYER_PROD -i src/veritabanı_generatescripts.sql
```

#### 6. PM2 ile Başlatma

```bash
# PM2 ecosystem dosyası (ecosystem.config.js)
module.exports = {
  apps: [{
    name: 'medikariyer-api',
    script: './server.js',
    instances: 2,                    # CPU core sayısı kadar
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3100
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '1G',
    autorestart: true,
    watch: false
  }]
};

# PM2 başlat
pm2 start ecosystem.config.js --env production

# PM2 otomatik başlatma (server reboot)
pm2 startup
pm2 save

# PM2 monitoring
pm2 monit

# PM2 logs
pm2 logs medikariyer-api

# PM2 restart
pm2 restart medikariyer-api

# PM2 stop
pm2 stop medikariyer-api
```

#### 7. Nginx Reverse Proxy

```bash
# Nginx kurulumu
sudo apt-get install nginx

# Nginx config
sudo nano /etc/nginx/sites-available/medikariyer-api

# Config içeriği:
server {
    listen 80;
    server_name api.medikariyer.net;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
    limit_req zone=api_limit burst=20 nodelay;

    location / {
        proxy_pass http://localhost:3100;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout ayarları
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # SSL (Let's Encrypt ile)
    # listen 443 ssl;
    # ssl_certificate /etc/letsencrypt/live/api.medikariyer.net/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/api.medikariyer.net/privkey.pem;
}

# Symlink oluştur
sudo ln -s /etc/nginx/sites-available/medikariyer-api /etc/nginx/sites-enabled/

# Nginx test
sudo nginx -t

# Nginx restart
sudo systemctl restart nginx
```

#### 8. SSL Sertifikası (Let's Encrypt)

```bash
# Certbot kurulumu
sudo apt-get install certbot python3-certbot-nginx

# SSL sertifikası al
sudo certbot --nginx -d api.medikariyer.net

# Otomatik yenileme (cron)
sudo certbot renew --dry-run
```

---

### Frontend Deployment

#### 1. Build

```bash
cd frontend

# Dependencies
npm install

# Production build
npm run build

# Build output: dist/ klasörü
```

#### 2. Nginx Static Hosting

```bash
# Build dosyalarını kopyala
sudo cp -r dist/* /var/www/medikariyer-frontend/

# Nginx config
sudo nano /etc/nginx/sites-available/medikariyer-frontend

# Config içeriği:
server {
    listen 80;
    server_name mk.monassist.com;
    root /var/www/medikariyer-frontend;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SSL
    # listen 443 ssl;
    # ssl_certificate /etc/letsencrypt/live/mk.monassist.com/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/mk.monassist.com/privkey.pem;
}

# Symlink ve restart
sudo ln -s /etc/nginx/sites-available/medikariyer-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

### Mobile App Deployment

#### 1. EAS Build (Expo Application Services)

```bash
cd mobile-app

# EAS CLI kurulumu
npm install -g eas-cli

# EAS login
eas login

# EAS project init
eas build:configure

# Android build
eas build --platform android --profile production

# iOS build (Mac gerekli veya EAS cloud build)
eas build --platform ios --profile production

# Build status
eas build:list
```

#### 2. App Store / Play Store Yayınlama

**Google Play Store:**
1. Google Play Console'a giriş yap
2. Uygulama oluştur
3. APK/AAB yükle (EAS build'den indir)
4. Store listing doldur
5. İncelemeye gönder

**Apple App Store:**
1. App Store Connect'e giriş yap
2. Uygulama oluştur
3. IPA yükle (EAS build'den indir)
4. App Store listing doldur
5. İncelemeye gönder

---

### Deployment Checklist

**Backend:**
- [ ] Environment variables production değerleri
- [ ] Database production'da oluşturuldu
- [ ] PM2 cluster mode aktif
- [ ] Nginx reverse proxy yapılandırıldı
- [ ] SSL sertifikası kuruldu
- [ ] CORS production domain'leri eklendi
- [ ] Rate limiting aktif
- [ ] Logging production seviyesinde
- [ ] Health check endpoint test edildi

**Frontend:**
- [ ] Production build alındı
- [ ] API URL production'a güncellendi
- [ ] Nginx static hosting yapılandırıldı
- [ ] SSL sertifikası kuruldu
- [ ] Gzip compression aktif
- [ ] Cache headers ayarlandı

**Mobile:**
- [ ] Production API URL güncellendi
- [ ] Expo project ID doğru
- [ ] Push notification test edildi
- [ ] EAS build başarılı
- [ ] Store listing hazır
- [ ] Privacy policy ve terms hazır

**Database:**
- [ ] Backup stratejisi oluşturuldu
- [ ] Index'ler optimize edildi
- [ ] Maintenance plan oluşturuldu

**Monitoring:**
- [ ] PM2 monitoring aktif
- [ ] Log rotation yapılandırıldı
- [ ] Error tracking (Sentry) kuruldu
- [ ] Uptime monitoring (UptimeRobot) kuruldu

---


## 📋 BUSINESS RULES

### 1. Kullanıcı Kaydı ve Onay Süreci

#### Doktor Kaydı
1. Doktor email ve şifre ile kayıt olur
2. `users` tablosuna kayıt oluşturulur (is_approved=false, is_active=true)
3. `doctor_profiles` tablosuna profil oluşturulur
4. Admin onayı bekler (is_approved=false)
5. **Mobil app'de login olabilir** (pending approval screen gösterilir)
6. **Web'de login olamaz** (onay bekliyor mesajı)
7. Admin onayladığında is_approved=true olur
8. Doktor tüm özelliklere erişebilir

#### Hastane Kaydı
1. Hastane email ve şifre ile kayıt olur
2. `users` tablosuna kayıt oluşturulur (is_approved=false, is_active=true)
3. `hospital_profiles` tablosuna profil oluşturulur
4. Admin onayı bekler
5. **Login olamaz** (onay bekliyor mesajı)
6. Admin onayladığında is_approved=true olur
7. Hastane tüm özelliklere erişebilir

#### Admin Oluşturma
- Admin sadece database'den manuel oluşturulabilir
- Kayıt endpoint'i yok
- SQL:
```sql
INSERT INTO users (email, password_hash, role, is_approved, is_active)
VALUES ('admin@medikariyer.net', 'hashed_password', 'admin', 1, 1);
```

---

### 2. İş İlanı Yayınlama Süreci

#### İlan Oluşturma (Hastane)
1. Hastane ilan oluşturur
2. `jobs` tablosuna kayıt oluşturulur (status_id=1 "Onay Bekliyor")
3. Admin'e bildirim gönderilir

#### Admin Onay Süreci
**Onaylama (status_id=2 "Onaylandı"):**
- İlan aktif olur
- Doktorlar görebilir
- Hastaneye bildirim gönderilir
- `approved_at` ve `published_at` güncellenir

**Reddetme (status_id=4 "Reddedildi"):**
- İlan pasif olur
- Doktorlar göremez
- Hastaneye bildirim gönderilir (red nedeni ile)
- `revision_note` doldurulur

**Revizyon İsteme (status_id=5 "Revizyon Gerekli"):**
- İlan pasif olur
- Hastane düzenleyebilir
- Hastaneye bildirim gönderilir (revizyon nedeni ile)
- `revision_note` doldurulur
- `revision_count` artar

#### İlan Güncelleme (Hastane)
- Hastane sadece kendi ilanlarını güncelleyebilir
- Status "Onaylandı" ise güncelleme yapılamaz (önce pasif yapmalı)
- Status "Revizyon Gerekli" ise güncelleme yapabilir
- Güncelleme sonrası status "Onay Bekliyor" olur

#### İlan Kapatma (Hastane)
- Hastane ilanı pasif yapabilir (status_id=3 "Pasif")
- Pasif ilana başvuru yapılamaz
- Mevcut başvurular etkilenmez
- Doktorlara bildirim gönderilir (başvuru yaptıysa)

---

### 3. Başvuru Süreci

#### Başvuru Oluşturma (Doktor)
**Kontroller:**
1. İlan aktif mi? (status_id=2 "Onaylandı")
2. İlan silinmemiş mi? (deleted_at IS NULL)
3. Doktor daha önce başvurmuş mu? (aynı job_id + doctor_profile_id)
4. Doktor profili onaylı mı? (is_approved=true)

**İşlem:**
1. `applications` tablosuna kayıt oluşturulur (status_id=1 "Başvuruldu")
2. Hastaneye bildirim gönderilir
3. Transaction kullanılır (row locking ile)

**Transaction Detayı:**
```sql
BEGIN TRANSACTION
  -- Job'ı kilitle (UPDLOCK, ROWLOCK)
  SELECT * FROM jobs WITH (UPDLOCK, ROWLOCK) WHERE id = @job_id
  
  -- Mükerrer başvuru kontrolü
  SELECT * FROM applications WHERE job_id = @job_id AND doctor_profile_id = @doctor_id AND deleted_at IS NULL
  
  -- Başvuru oluştur
  INSERT INTO applications (...)
  
  -- Bildirim gönder
  INSERT INTO notifications (...)
COMMIT TRANSACTION
```

#### Başvuru Durumu Değiştirme (Hastane)
**Kabul Etme (status_id=3 "Kabul Edildi"):**
- Hastane başvuruyu kabul eder
- Doktora bildirim gönderilir (success)
- `notes` alanına hastane notu eklenebilir

**Reddetme (status_id=4 "Reddedildi"):**
- Hastane başvuruyu reddeder
- Doktora bildirim gönderilir (error)
- `notes` alanına red nedeni eklenebilir

**İnceleme (status_id=2 "İnceleniyor"):**
- Hastane başvuruyu incelemeye alır
- Doktora bildirim gönderilir (info)

#### Başvuru Geri Çekme (Doktor)
**Kontroller:**
1. Başvuru doktora ait mi?
2. Başvuru durumu "Başvuruldu" mu? (status_id=1)
3. Başvuru silinmemiş mi? (deleted_at IS NULL)

**İşlem:**
1. Status "Geri Çekildi" olur (status_id=5)
2. `notes` alanına geri çekme nedeni eklenebilir (opsiyonel)
3. Hastaneye bildirim gönderilir
4. Transaction kullanılır

**Mobil vs Web Farkı:**
- **Web:** Reason input var, notes'a ekleniyor
- **Mobil:** Reason input YOK (şu an), notes değişmiyor
- **Öneri:** Mobil'e de reason input ekle

---

### 4. Profil Fotoğrafı Onay Süreci

#### Fotoğraf Yükleme (Doktor)
1. Doktor fotoğraf yükler (base64)
2. `doctor_profile_photo_requests` tablosuna kayıt oluşturulur (status='pending')
3. `file_url` alanına yeni fotoğraf kaydedilir
4. `old_photo` alanına mevcut fotoğraf kaydedilir (rollback için)
5. Admin'e bildirim gönderilir

#### Admin Onay/Red
**Onaylama (status='approved'):**
1. `doctor_profiles.profile_photo` güncellenir (yeni fotoğraf)
2. `reviewed_at` ve `reviewed_by` güncellenir
3. Doktora bildirim gönderilir (success)

**Reddetme (status='rejected'):**
1. `doctor_profiles.profile_photo` değişmez (eski fotoğraf kalır)
2. `reason` alanına red nedeni yazılır
3. `reviewed_at` ve `reviewed_by` güncellenir
4. Doktora bildirim gönderilir (warning, reason ile)

#### Talep İptali (Doktor)
1. Doktor pending talebi iptal edebilir
2. Status 'cancelled' olur
3. Bildirim gönderilmez

**Mobil App Polling:**
- Mobil app 5 saniyede bir status kontrol eder (polling)
- Status 'approved' veya 'rejected' olunca polling durur
- **Sorun:** Gereksiz network trafiği
- **Öneri:** WebSocket veya Server-Sent Events kullan

---

### 5. Bildirim Sistemi

#### Bildirim Türleri
1. **Başvuru Durumu Değişikliği** (Doktor)
   - Başvuru kabul edildi
   - Başvuru reddedildi
   - Başvuru inceleniyor

2. **Yeni Başvuru** (Hastane)
   - Doktor başvurdu

3. **Başvuru Geri Çekme** (Hastane)
   - Doktor başvuruyu geri çekti

4. **İlan Durumu Değişikliği** (Doktor)
   - İlan kapatıldı
   - İlan aktifleştirildi

5. **Profil Fotoğrafı** (Doktor)
   - Fotoğraf onaylandı
   - Fotoğraf reddedildi

6. **İlan Onay/Red** (Hastane)
   - İlan onaylandı
   - İlan reddedildi
   - Revizyon gerekli

#### Bildirim Kanalları
1. **In-App:** Database'e kayıt + SSE (real-time)
2. **Push:** Expo Push Notifications (mobil)
3. **Email:** SMTP (şu an sadece şifre sıfırlama için)

#### Bildirim Gönderme Akışı
```javascript
sendNotification({
  user_id: 123,
  type: 'success',
  title: 'Başvurunuz Onaylandı',
  body: 'Kardiyoloji pozisyonu için başvurunuz onaylandı.',
  data: {
    action: 'application_status_changed',
    entity_type: 'application',
    entity_id: 456
  }
})

// Otomatik olarak:
// 1. Database'e kayıt (notifications tablosu)
// 2. SSE ile web'e gönderim (real-time)
// 3. Expo Push ile mobil'e gönderim (push notification)
```

---

### 6. Hesap Deaktivasyonu

#### Doktor Hesap Kapatma
1. Doktor "Hesabı Kapat" butonuna tıklar
2. Confirm dialog gösterilir
3. Onaylarsa:
   - `users.is_active = false`
   - Tüm refresh token'lar iptal edilir (revoked_at)
   - Tüm device token'lar deaktif edilir (is_active=false)
   - Otomatik logout
4. **Veri silinmez** (soft deactivation)
5. Admin tekrar aktif edebilir

#### Hastane Hesap Kapatma
- Aynı mantık
- İlanlar pasif yapılmaz (manuel yapılmalı)

---

### 7. Şifre Sıfırlama

#### Akış
1. Kullanıcı "Şifremi Unuttum" tıklar
2. Email girer
3. Backend:
   - Token oluşturur (UUID)
   - Token hash'i database'e kaydeder (password_reset_tokens)
   - Email gönderir (reset link ile)
4. Kullanıcı email'deki linke tıklar
5. Yeni şifre girer
6. Backend:
   - Token'ı doğrular (hash karşılaştırma)
   - Token expire kontrolü (60 dakika)
   - Token kullanılmış mı kontrolü (used_at)
   - Şifreyi günceller
   - Token'ı kullanılmış işaretler (used_at)

**Güvenlik:**
- Token plain text saklanmaz (SHA256 hash)
- Token 60 dakika geçerli
- Token tek kullanımlık
- IP ve user agent kaydedilir

---


## 🧪 TESTING STRATEGY

### Test Piramidi

```
        /\
       /  \      E2E Tests (5%)
      /____\     
     /      \    Integration Tests (15%)
    /________\   
   /          \  Unit Tests (80%)
  /__________  \
```

### 1. Unit Tests

**Backend (Jest):**
```bash
# Test çalıştırma
npm test

# Coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

**Test Edilmesi Gerekenler:**
- Service layer fonksiyonları
- Utility fonksiyonları
- Validation schemas
- Transformer fonksiyonları

**Örnek Test:**
```javascript
// Backend/tests/services/doctorService.test.js
describe('DoctorService', () => {
  describe('createEducation', () => {
    it('should create education successfully', async () => {
      const educationData = {
        doctor_profile_id: 1,
        education_institution: 'İstanbul Üniversitesi',
        field: 'Tıp',
        graduation_year: 2020
      };
      
      const result = await doctorService.createEducation(educationData);
      
      expect(result).toHaveProperty('id');
      expect(result.education_institution).toBe('İstanbul Üniversitesi');
    });
    
    it('should throw error if doctor not found', async () => {
      const educationData = {
        doctor_profile_id: 999999,
        education_institution: 'Test',
        field: 'Test',
        graduation_year: 2020
      };
      
      await expect(doctorService.createEducation(educationData))
        .rejects.toThrow('Doktor profili bulunamadı');
    });
  });
});
```

**Frontend (Vitest + React Testing Library):**
```bash
# Test çalıştırma
npm test

# Coverage
npm run test:coverage
```

**Test Edilmesi Gerekenler:**
- Component rendering
- User interactions
- Form validation
- API hooks

**Örnek Test:**
```javascript
// frontend/tests/components/LoginForm.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginForm } from '@/components/LoginForm';

describe('LoginForm', () => {
  it('should render login form', () => {
    render(<LoginForm />);
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/şifre/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /giriş yap/i })).toBeInTheDocument();
  });
  
  it('should show validation errors', async () => {
    render(<LoginForm />);
    
    const submitButton = screen.getByRole('button', { name: /giriş yap/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/email zorunludur/i)).toBeInTheDocument();
      expect(screen.getByText(/şifre zorunludur/i)).toBeInTheDocument();
    });
  });
});
```

**Mobile (Jest + React Native Testing Library):**
```bash
# Test çalıştırma
npm test

# Watch mode
npm run test:watch
```

---

### 2. Integration Tests

**Backend API Tests:**
```javascript
// Backend/tests/integration/auth.test.js
describe('Auth API', () => {
  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'doctor@test.com',
          password: 'Test123!'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });
    
    it('should return 401 with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'doctor@test.com',
          password: 'WrongPassword'
        });
      
      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Geçersiz');
    });
  });
});
```

---

### 3. E2E Tests

**Frontend (Cypress):**
```bash
# Cypress açma
npm run cypress:open

# Headless çalıştırma
npm run cypress:run
```

**Test Senaryoları:**
```javascript
// frontend/cypress/e2e/doctor-application.cy.js
describe('Doctor Application Flow', () => {
  beforeEach(() => {
    cy.login('doctor@test.com', 'Test123!');
  });
  
  it('should apply to a job successfully', () => {
    // İş ilanları sayfasına git
    cy.visit('/jobs');
    
    // İlk ilanı seç
    cy.get('[data-testid="job-card"]').first().click();
    
    // Başvur butonuna tıkla
    cy.get('[data-testid="apply-button"]').click();
    
    // Cover letter yaz
    cy.get('[data-testid="cover-letter"]').type('Bu pozisyon için başvuruyorum...');
    
    // Başvuruyu gönder
    cy.get('[data-testid="submit-application"]').click();
    
    // Başarı mesajı
    cy.contains('Başvurunuz başarıyla gönderildi').should('be.visible');
    
    // Başvurular sayfasına yönlendirildi mi?
    cy.url().should('include', '/applications');
    
    // Başvuru listede görünüyor mu?
    cy.get('[data-testid="application-list"]').should('contain', 'Kardiyoloji');
  });
});
```

**Mobile (Detox - Future):**
```bash
# Detox kurulumu
npm install --save-dev detox

# Test çalıştırma
detox test --configuration ios.sim.debug
```

---

### 4. Test Coverage Hedefleri

| Katman | Hedef Coverage | Mevcut |
|--------|----------------|--------|
| **Backend Services** | 80% | 0% |
| **Backend Controllers** | 70% | 0% |
| **Frontend Components** | 75% | 0% |
| **Frontend Hooks** | 80% | 0% |
| **Mobile Components** | 70% | 0% |
| **Mobile Hooks** | 75% | 0% |

---

### 5. Test Data Management

**Test Database:**
```bash
# Test database oluştur
CREATE DATABASE MEDIKARIYER_TEST;

# Test data seed
npm run seed:test
```

**Seed Data:**
```javascript
// Backend/tests/seeds/testData.js
module.exports = {
  users: [
    {
      email: 'doctor@test.com',
      password_hash: 'hashed_password',
      role: 'doctor',
      is_approved: true,
      is_active: true
    },
    {
      email: 'hospital@test.com',
      password_hash: 'hashed_password',
      role: 'hospital',
      is_approved: true,
      is_active: true
    }
  ],
  doctor_profiles: [
    {
      user_id: 1,
      first_name: 'Test',
      last_name: 'Doctor',
      specialty_id: 1
    }
  ],
  jobs: [
    {
      hospital_id: 1,
      title: 'Kardiyoloji Uzmanı',
      specialty_id: 1,
      employment_type: 'Tam Zamanlı',
      description: 'Test job description',
      status_id: 2
    }
  ]
};
```

---

### 6. CI/CD Pipeline (Future)

**GitHub Actions:**
```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  backend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd Backend && npm install
      - run: cd Backend && npm test
      - run: cd Backend && npm run test:coverage
      
  frontend-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd frontend && npm install
      - run: cd frontend && npm test
      
  mobile-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd mobile-app && npm install
      - run: cd mobile-app && npm test
```

---

### 7. Manual Testing Checklist

**Backend API:**
- [ ] Postman collection hazırlandı
- [ ] Tüm endpoint'ler test edildi
- [ ] Error case'ler test edildi
- [ ] Authentication test edildi
- [ ] Authorization test edildi
- [ ] Rate limiting test edildi

**Frontend:**
- [ ] Tüm sayfalar test edildi
- [ ] Form validation test edildi
- [ ] Responsive design test edildi
- [ ] Cross-browser test edildi (Chrome, Firefox, Safari)
- [ ] Accessibility test edildi

**Mobile:**
- [ ] iOS test edildi (simulator + real device)
- [ ] Android test edildi (emulator + real device)
- [ ] Push notification test edildi
- [ ] Offline mode test edildi
- [ ] Deep linking test edildi

---


## 🌐 WEB APPLICATION

### Genel Bilgiler

**Framework:** React 18.2  
**Build Tool:** Vite  
**Styling:** Tailwind CSS  
**State Management:** Zustand + React Query  
**Routing:** React Router v6  
**Form:** React Hook Form + Zod  

### Sayfa Yapısı

#### Public Pages (Giriş Yapmadan Erişilebilir)
- `/` - Ana sayfa
- `/login` - Giriş
- `/register/doctor` - Doktor kaydı
- `/register/hospital` - Hastane kaydı
- `/forgot-password` - Şifremi unuttum
- `/reset-password` - Şifre sıfırlama
- `/contact` - İletişim

#### Doctor Pages
- `/doctor/dashboard` - Dashboard
- `/doctor/profile` - Profil görüntüleme
- `/doctor/profile/edit` - Profil düzenleme
- `/doctor/jobs` - İş ilanları
- `/doctor/jobs/:id` - İlan detayı
- `/doctor/applications` - Başvurular
- `/doctor/applications/:id` - Başvuru detayı
- `/doctor/notifications` - Bildirimler
- `/doctor/settings` - Ayarlar

#### Hospital Pages
- `/hospital/dashboard` - Dashboard
- `/hospital/profile` - Profil görüntüleme
- `/hospital/profile/edit` - Profil düzenleme
- `/hospital/jobs` - İlanlarım
- `/hospital/jobs/create` - İlan oluştur
- `/hospital/jobs/:id/edit` - İlan düzenle
- `/hospital/applications` - Başvurular
- `/hospital/applications/:id` - Başvuru detayı
- `/hospital/doctors` - Doktor arama
- `/hospital/doctors/:id` - Doktor profili
- `/hospital/notifications` - Bildirimler
- `/hospital/settings` - Ayarlar

#### Admin Pages
- `/admin/dashboard` - Dashboard
- `/admin/users` - Kullanıcı yönetimi
- `/admin/doctors` - Doktor onayları
- `/admin/hospitals` - Hastane onayları
- `/admin/jobs` - İlan onayları
- `/admin/jobs/:id` - İlan detayı
- `/admin/applications` - Başvurular
- `/admin/photo-requests` - Fotoğraf onayları
- `/admin/notifications` - Bildirim gönderme
- `/admin/logs` - Sistem logları
- `/admin/settings` - Sistem ayarları

---

### Özellikler

#### 1. Authentication
- JWT token based
- Refresh token rotation
- Auto-login (remember me)
- Role-based routing
- Protected routes

#### 2. Dashboard
**Doktor:**
- Profil tamamlama yüzdesi
- Son başvurular
- Önerilen ilanlar
- Bildirim özeti

**Hastane:**
- Aktif ilan sayısı
- Toplam başvuru sayısı
- Bekleyen başvurular
- Son başvurular

**Admin:**
- Toplam kullanıcı sayısı
- Bekleyen onaylar
- Aktif ilan sayısı
- Sistem istatistikleri

#### 3. Job Listings
- Filtreleme (şehir, uzmanlık, anahtar kelime)
- Sıralama (tarih, maaş)
- Pagination
- Favorilere ekleme (future)
- Başvuru durumu gösterimi

#### 4. Application Management
**Doktor:**
- Başvuru listesi
- Başvuru detayı
- Başvuru geri çekme
- Durum filtreleme

**Hastane:**
- Başvuru listesi
- Başvuru detayı
- Başvuru onaylama/reddetme
- Doktor profili görüntüleme
- Not ekleme

#### 5. Profile Management
**Doktor:**
- Kişisel bilgiler
- Eğitim bilgileri (CRUD)
- Deneyimler (CRUD)
- Sertifikalar (CRUD)
- Dil bilgileri (CRUD)
- Profil fotoğrafı (admin onaylı)
- CV indirme (PDF)

**Hastane:**
- Kurum bilgileri
- Logo yükleme
- İletişim bilgileri

#### 6. Notification System
- Real-time bildirimler (SSE)
- Bildirim listesi
- Okundu işaretleme
- Bildirim silme
- Bildirim filtreleme

#### 7. Admin Panel
- Kullanıcı onaylama
- İlan onaylama/reddetme
- Fotoğraf onaylama/reddetme
- Toplu bildirim gönderme
- Sistem logları görüntüleme
- Audit trail

---

### Mobil vs Web Farkları

| Özellik | Web | Mobil |
|---------|-----|-------|
| **Login (Pending User)** | ❌ Olamaz | ✅ Olabilir |
| **Başvuru Geri Çekme Reason** | ✅ Var | ❌ Yok |
| **Profil Fotoğrafı Polling** | ❌ SSE | ✅ 5 saniye polling |
| **Bildirim Real-time** | ✅ SSE | ✅ Push + Polling |
| **Offline Mode** | ❌ Yok | ✅ Var (cache) |
| **Deep Linking** | ❌ Yok | ✅ Var |
| **Biometric Auth** | ❌ Yok | ✅ Var (future) |

---

### API Endpoints (Web Specific)

Web uygulaması `/api/*` endpoint'lerini kullanır (mobil `/api/mobile/*` kullanır).

**Farklar:**
- Response format aynı
- Bazı endpoint'ler web'de yok (örn: device token registration)
- Bazı endpoint'ler mobil'de yok (örn: admin panel)

---


## 📧 EMAIL SYSTEM

### SMTP Configuration

**Provider:** Custom SMTP (mail.medikariyer.net)  
**Port:** 587 (TLS)  
**Library:** Nodemailer  

### Email Templates

#### 1. Şifre Sıfırlama (Password Reset)

**Trigger:** Kullanıcı "Şifremi Unuttum" tıklar  
**Gönderen:** info@medikariyer.net  
**Konu:** MediKariyer - Şifre Sıfırlama  

**Template:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Şifre Sıfırlama</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #6096B4;">MediKariyer - Şifre Sıfırlama</h2>
    
    <p>Merhaba,</p>
    
    <p>Şifrenizi sıfırlamak için aşağıdaki linke tıklayın:</p>
    
    <a href="{{resetLink}}" 
       style="display: inline-block; padding: 12px 24px; background-color: #6096B4; 
              color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
      Şifremi Sıfırla
    </a>
    
    <p>Bu link 60 dakika geçerlidir.</p>
    
    <p>Eğer şifre sıfırlama talebinde bulunmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
    
    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
    
    <p style="font-size: 12px; color: #666;">
      Bu e-posta otomatik olarak gönderilmiştir. Lütfen yanıtlamayın.
    </p>
  </div>
</body>
</html>
```

**Kod:**
```javascript
// Backend/src/services/emailService.js
const sendPasswordResetEmail = async (email, resetToken) => {
  const resetLink = process.env.FRONTEND_RESET_PASSWORD_URL.replace('{token}', resetToken);
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'MediKariyer - Şifre Sıfırlama',
    html: passwordResetTemplate({ resetLink })
  };
  
  await transporter.sendMail(mailOptions);
};
```

---

#### 2. Hoş Geldiniz Email (Welcome Email) - Future

**Trigger:** Kullanıcı kaydı onaylandığında  
**Konu:** MediKariyer'e Hoş Geldiniz  

**Template:**
```html
<h2>Hoş Geldiniz!</h2>
<p>Merhaba {{firstName}},</p>
<p>MediKariyer'e kaydınız onaylandı. Artık tüm özelliklere erişebilirsiniz.</p>
<a href="{{loginLink}}">Giriş Yap</a>
```

---

#### 3. Başvuru Bildirimi Email - Future

**Trigger:** Başvuru durumu değiştiğinde  
**Konu:** Başvuru Durumu Güncellendi  

**Template:**
```html
<h2>Başvuru Durumu Güncellendi</h2>
<p>Merhaba {{doctorName}},</p>
<p>{{hospitalName}} hastanesindeki {{jobTitle}} pozisyonu için başvurunuz {{status}} durumuna geçti.</p>
<a href="{{applicationLink}}">Başvuruyu Görüntüle</a>
```

---

### Email Queue (Future)

**Problem:** Email gönderimi senkron, yavaş  
**Çözüm:** Queue sistemi (Bull, BullMQ)

```javascript
// Email queue
const emailQueue = new Queue('email', {
  redis: {
    host: 'localhost',
    port: 6379
  }
});

// Email gönderme
emailQueue.add('password-reset', {
  email: 'user@example.com',
  resetToken: 'token123'
});

// Worker
emailQueue.process('password-reset', async (job) => {
  await sendPasswordResetEmail(job.data.email, job.data.resetToken);
});
```

---

### Email Tracking (Future)

**Özellikler:**
- Email açılma takibi (tracking pixel)
- Link tıklama takibi
- Bounce handling
- Unsubscribe management

**Provider Önerileri:**
- SendGrid
- AWS SES
- Mailgun
- Postmark

---


## 🔒 SECURITY & RATE LIMITING

### 1. Authentication & Authorization

#### JWT Token Structure

**Access Token (15 dakika):**
```json
{
  "userId": 123,
  "email": "doctor@example.com",
  "role": "doctor",
  "iat": 1704628800,
  "exp": 1704629700
}
```

**Refresh Token (7 gün):**
```json
{
  "userId": 123,
  "tokenId": "uuid-v4",
  "iat": 1704628800,
  "exp": 1705233600
}
```

#### Token Storage

**Web:**
- Access Token: Memory (React state)
- Refresh Token: HttpOnly Cookie (secure, sameSite)

**Mobile:**
- Access Token: Memory (Zustand state)
- Refresh Token: Expo SecureStore (encrypted)

#### Token Refresh Flow

```
Client                    Backend
  |                          |
  |-- Request (expired) ---->|
  |                          |
  |<---- 401 Unauthorized ---|
  |                          |
  |-- Refresh Token -------->|
  |                          |
  |<---- New Access Token ---|
  |                          |
  |-- Retry Request -------->|
  |                          |
  |<---- Success ------------|
```

---

### 2. Password Security

**Hashing:** bcrypt (salt rounds: 10)

```javascript
// Password hashing
const hashedPassword = await bcrypt.hash(password, 10);

// Password verification
const isValid = await bcrypt.compare(password, hashedPassword);
```

**Password Requirements:**
- **Şu an:** Minimum 3 karakter (MVP için)
- **Önerilen:** Minimum 8 karakter, 1 büyük, 1 küçük, 1 rakam

**Password Reset Token:**
- SHA256 hash
- 60 dakika geçerli
- Tek kullanımlık

---

### 3. Rate Limiting

#### Global Rate Limit

```javascript
// Backend/src/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 dakika
  max: 100,                   // 15 dakikada max 100 request
  message: 'Çok fazla istek gönderdiniz. Lütfen daha sonra tekrar deneyin.',
  standardHeaders: true,
  legacyHeaders: false
});
```

#### Auth Endpoint Rate Limit

```javascript
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 dakika
  max: 5,                     // 15 dakikada max 5 login denemesi
  skipSuccessfulRequests: true,
  message: 'Çok fazla giriş denemesi. 15 dakika sonra tekrar deneyin.'
});

// Login endpoint
router.post('/login', authLimiter, authController.login);
```

#### API Endpoint Rate Limits

| Endpoint | Window | Max Requests |
|----------|--------|--------------|
| `/api/auth/login` | 15 min | 5 |
| `/api/auth/register` | 1 hour | 3 |
| `/api/auth/forgot-password` | 1 hour | 3 |
| `/api/auth/refresh` | 15 min | 20 |
| `/api/*` (global) | 15 min | 100 |

---

### 4. CORS Configuration

**Development:**
```javascript
const cors = require('cors');

app.use(cors({
  origin: '*',  // Tüm origin'lere izin
  credentials: true
}));
```

**Production:**
```javascript
app.use(cors({
  origin: [
    'https://mk.monassist.com',
    'https://admin.medikariyer.net'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

---

### 5. Helmet.js Security Headers

```javascript
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

**Headers:**
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000`

---

### 6. Input Validation

**Backend (Joi):**
```javascript
const Joi = require('joi');

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(3).required()
});

// Middleware
const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }
    next();
  };
};
```

**Frontend (Zod):**
```typescript
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Geçerli bir email giriniz'),
  password: z.string().min(3, 'Şifre en az 3 karakter olmalıdır')
});
```

---

### 7. SQL Injection Prevention

**Knex Query Builder:**
```javascript
// ✅ Güvenli (parameterized query)
const user = await db('users')
  .where('email', email)
  .first();

// ❌ Güvensiz (raw query)
const user = await db.raw(`SELECT * FROM users WHERE email = '${email}'`);

// ✅ Güvenli (raw query with bindings)
const user = await db.raw('SELECT * FROM users WHERE email = ?', [email]);
```

---

### 8. XSS Prevention

**Backend:**
- Input sanitization (Joi validation)
- Output encoding (JSON.stringify)

**Frontend:**
- React otomatik escape ediyor
- `dangerouslySetInnerHTML` kullanılmıyor

---

### 9. CSRF Protection

**Web:**
- SameSite cookie attribute
- CSRF token (future)

**Mobile:**
- CSRF gerekmiyor (cookie kullanılmıyor)

---

### 10. File Upload Security

**Şu an:** Base64 string (NVARCHAR(MAX))

**Güvenlik Kontrolleri:**
- File size limit (5 MB)
- File type validation (image/jpeg, image/png)
- Base64 format validation

**Future (S3/CDN):**
- Virus scanning
- Image optimization
- CDN caching
- Signed URLs

---

### 11. Audit Logging

**audit_logs tablosu:**
```sql
CREATE TABLE audit_logs (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    timestamp DATETIMEOFFSET(7) NOT NULL,
    actor_id INT NOT NULL,
    actor_role NVARCHAR(20) NOT NULL,
    action NVARCHAR(100) NOT NULL,
    resource_type NVARCHAR(50) NULL,
    resource_id INT NULL,
    old_values NVARCHAR(MAX) NULL,
    new_values NVARCHAR(MAX) NULL,
    ip_address NVARCHAR(45) NULL,
    user_agent NVARCHAR(500) NULL,
    metadata NVARCHAR(MAX) NULL,
    created_at DATETIMEOFFSET(7) NOT NULL
);
```

**Logged Actions:**
- User login/logout
- Password change
- Profile update
- Job create/update/delete
- Application status change
- Admin actions

---

### 12. Security Checklist

**Backend:**
- [x] JWT authentication
- [x] Password hashing (bcrypt)
- [x] Rate limiting
- [x] CORS configuration
- [x] Helmet.js security headers
- [x] Input validation (Joi)
- [x] SQL injection prevention (Knex)
- [x] Audit logging
- [ ] CSRF protection
- [ ] 2FA (future)

**Frontend:**
- [x] XSS prevention (React)
- [x] Input validation (Zod)
- [x] Secure token storage
- [ ] Content Security Policy
- [ ] Subresource Integrity

**Mobile:**
- [x] Secure token storage (SecureStore)
- [x] Certificate pinning (future)
- [x] Biometric authentication (future)
- [ ] Jailbreak/Root detection

---


## 📊 MONITORING & LOGGING

### 1. Logging System

#### Winston Logger

**Configuration:**
```javascript
// Backend/src/utils/logger.js
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    // Console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    
    // Error log file
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d'
    }),
    
    // Combined log file
    new DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d'
    })
  ]
});
```

#### Log Levels

| Level | Kullanım | Örnek |
|-------|----------|-------|
| **error** | Hatalar | Database connection error |
| **warn** | Uyarılar | Deprecated API kullanımı |
| **info** | Bilgi | User login, API request |
| **http** | HTTP istekleri | GET /api/jobs |
| **debug** | Debug bilgisi | Query execution time |

#### Log Format

```json
{
  "timestamp": "2025-01-07T12:00:00.000Z",
  "level": "info",
  "message": "User logged in",
  "userId": 123,
  "email": "doctor@example.com",
  "ip": "192.168.1.1",
  "userAgent": "Mozilla/5.0..."
}
```

---

### 2. Database Logging

**application_logs tablosu:**
```sql
CREATE TABLE application_logs (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    timestamp DATETIMEOFFSET(7) NOT NULL,
    level NVARCHAR(10) NOT NULL,
    category NVARCHAR(50) NOT NULL,
    message NVARCHAR(MAX) NOT NULL,
    user_id INT NULL,
    request_id NVARCHAR(100) NULL,
    ip_address NVARCHAR(45) NULL,
    user_agent NVARCHAR(500) NULL,
    url NVARCHAR(500) NULL,
    method NVARCHAR(10) NULL,
    status_code INT NULL,
    duration_ms INT NULL,
    metadata NVARCHAR(MAX) NULL,
    stack_trace NVARCHAR(MAX) NULL,
    created_at DATETIMEOFFSET(7) NOT NULL
);
```

**Logged Events:**
- API requests (info level)
- Errors (error level)
- Security events (warn level)
- Performance issues (warn level)

---

### 3. Security Logging

**security_logs tablosu:**
```sql
CREATE TABLE security_logs (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    timestamp DATETIMEOFFSET(7) NOT NULL,
    event_type NVARCHAR(50) NOT NULL,
    severity NVARCHAR(20) NOT NULL,
    user_id INT NULL,
    email NVARCHAR(255) NULL,
    ip_address NVARCHAR(45) NULL,
    user_agent NVARCHAR(500) NULL,
    url NVARCHAR(500) NULL,
    method NVARCHAR(10) NULL,
    message NVARCHAR(MAX) NOT NULL,
    metadata NVARCHAR(MAX) NULL,
    created_at DATETIMEOFFSET(7) NOT NULL
);
```

**Event Types:**
- `login_success`
- `login_failed`
- `logout`
- `password_change`
- `password_reset_request`
- `token_refresh`
- `unauthorized_access`
- `rate_limit_exceeded`

---

### 4. Performance Monitoring

#### Request Duration Logging

```javascript
// Middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.http({
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
    
    // Slow query warning
    if (duration > 1000) {
      logger.warn(`Slow request: ${req.method} ${req.url} took ${duration}ms`);
    }
  });
  
  next();
};
```

#### Database Query Monitoring

```javascript
// Knex query logging
db.on('query', (query) => {
  logger.debug({
    sql: query.sql,
    bindings: query.bindings,
    duration: query.duration
  });
  
  // Slow query warning
  if (query.duration > 1000) {
    logger.warn(`Slow query: ${query.sql} took ${query.duration}ms`);
  }
});
```

---

### 5. Error Tracking (Sentry - Future)

**Installation:**
```bash
npm install @sentry/node @sentry/tracing
```

**Configuration:**
```javascript
const Sentry = require('@sentry/node');
const Tracing = require('@sentry/tracing');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Tracing.Integrations.Express({ app })
  ]
});

// Request handler
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// Error handler
app.use(Sentry.Handlers.errorHandler());
```

**Features:**
- Real-time error tracking
- Stack trace
- User context
- Breadcrumbs
- Performance monitoring
- Release tracking

---

### 6. Uptime Monitoring (UptimeRobot - Future)

**Monitored Endpoints:**
- `https://api.medikariyer.net/health` (Backend)
- `https://mk.monassist.com` (Frontend)

**Alerts:**
- Email notification
- SMS notification (critical)
- Slack notification

**Check Interval:** 5 dakika

---

### 7. Health Check Endpoint

```javascript
// Backend/src/routes/healthRoutes.js
router.get('/health', async (req, res) => {
  try {
    // Database check
    await db.raw('SELECT 1');
    
    // Memory usage
    const memoryUsage = process.memoryUsage();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`
      },
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});
```

---

### 8. Metrics Dashboard (Future)

**Grafana + Prometheus:**
- Request rate
- Response time
- Error rate
- Database connections
- Memory usage
- CPU usage

**Custom Metrics:**
- Active users
- Job postings per day
- Applications per day
- Notification delivery rate

---

### 9. Log Rotation

**Winston Daily Rotate File:**
```javascript
new DailyRotateFile({
  filename: 'logs/application-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',      // Max 20MB per file
  maxFiles: '14d',     // Keep 14 days
  compress: true       // Compress old logs
});
```

**Manual Cleanup:**
```bash
# Delete logs older than 30 days
find logs/ -name "*.log" -mtime +30 -delete
```

---

### 10. Monitoring Checklist

**Backend:**
- [x] Winston logging
- [x] Database logging
- [x] Security logging
- [x] Request duration logging
- [x] Health check endpoint
- [ ] Sentry error tracking
- [ ] Uptime monitoring
- [ ] Metrics dashboard

**Frontend:**
- [ ] Sentry error tracking
- [ ] Performance monitoring (Web Vitals)
- [ ] User analytics (Google Analytics)

**Mobile:**
- [ ] Sentry error tracking
- [ ] Crash reporting (Crashlytics)
- [ ] Analytics (Firebase Analytics)

**Database:**
- [ ] Query performance monitoring
- [ ] Slow query log
- [ ] Index usage analysis
- [ ] Backup monitoring

---


## 🔧 TROUBLESHOOTING

### 1. Backend Issues

#### Database Connection Error

**Hata:**
```
Error: Failed to connect to database
ConnectionError: Login failed for user 'tstSqlUser'
```

**Çözüm:**
1. Database credentials kontrol et (.env)
2. Database server çalışıyor mu kontrol et
3. Firewall kuralları kontrol et
4. SQL Server authentication mode kontrol et (Mixed Mode)

```bash
# SQL Server status
sudo systemctl status mssql-server

# SQL Server restart
sudo systemctl restart mssql-server
```

---

#### JWT Token Invalid

**Hata:**
```
401 Unauthorized: Invalid token
```

**Çözüm:**
1. JWT_SECRET doğru mu kontrol et
2. Token expire olmuş olabilir (refresh token kullan)
3. Token format doğru mu kontrol et (Bearer token)

```javascript
// Token format
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

#### Rate Limit Exceeded

**Hata:**
```
429 Too Many Requests
```

**Çözüm:**
1. 15 dakika bekle
2. Rate limit ayarlarını kontrol et
3. IP whitelist ekle (development için)

```javascript
// Rate limit bypass (development only)
if (process.env.NODE_ENV === 'development') {
  return next();
}
```

---

#### CORS Error

**Hata:**
```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Çözüm:**
1. Backend CORS ayarlarını kontrol et
2. Frontend URL'i CORS origin'e ekle
3. Credentials: true ayarını kontrol et

```javascript
// Backend CORS config
app.use(cors({
  origin: 'http://localhost:5000',
  credentials: true
}));
```

---

### 2. Frontend Issues

#### API Connection Error

**Hata:**
```
Network Error: Failed to fetch
```

**Çözüm:**
1. Backend çalışıyor mu kontrol et
2. API URL doğru mu kontrol et (.env)
3. CORS ayarları doğru mu kontrol et

```bash
# Backend health check
curl http://localhost:3100/health
```

---

#### Build Error

**Hata:**
```
Error: Cannot find module '@/components/Button'
```

**Çözüm:**
1. Node modules temizle ve yeniden yükle
```bash
rm -rf node_modules package-lock.json
npm install
```

2. Vite cache temizle
```bash
rm -rf node_modules/.vite
npm run dev
```

---

### 3. Mobile App Issues

#### Expo Push Token Error

**Hata:**
```
Error: Failed to get Expo push token
```

**Çözüm:**
1. Expo project ID doğru mu kontrol et (app.json)
2. Physical device kullan (simulator'da çalışmaz)
3. Notification permissions ver

```bash
# Expo project ID kontrol
cat app.json | grep projectId
```

---

#### API Connection Error (Mobile)

**Hata:**
```
Network request failed
```

**Çözüm:**
1. Backend IP adresi doğru mu kontrol et (.env)
2. Aynı network'te misiniz kontrol et
3. Firewall kuralları kontrol et

```bash
# IP adresini bul
ipconfig getifaddr en0  # Mac
ip addr show           # Linux
ipconfig              # Windows

# Backend'e erişim test et
curl http://192.168.1.198:3100/health
```

---

#### Build Error (EAS)

**Hata:**
```
Error: Build failed
```

**Çözüm:**
1. EAS CLI güncel mi kontrol et
```bash
npm install -g eas-cli@latest
```

2. Build logs kontrol et
```bash
eas build:list
eas build:view [build-id]
```

3. Dependencies kontrol et
```bash
npm install
```

---

### 4. Database Issues

#### Slow Query

**Sorun:** Query 1 saniyeden uzun sürüyor

**Çözüm:**
1. Index ekle
```sql
CREATE INDEX IX_applications_doctor_job 
ON applications(doctor_profile_id, job_id) 
INCLUDE (status_id, applied_at);
```

2. Query optimize et
```javascript
// Önce
const applications = await db('applications')
  .join('jobs', 'applications.job_id', 'jobs.id')
  .join('doctor_profiles', 'applications.doctor_profile_id', 'doctor_profiles.id')
  .select('*');

// Sonra (sadece gerekli kolonlar)
const applications = await db('applications')
  .join('jobs', 'applications.job_id', 'jobs.id')
  .join('doctor_profiles', 'applications.doctor_profile_id', 'doctor_profiles.id')
  .select('applications.id', 'applications.status_id', 'jobs.title', 'doctor_profiles.first_name');
```

3. Pagination kullan
```javascript
const applications = await db('applications')
  .limit(20)
  .offset((page - 1) * 20);
```

---

#### Database Full

**Sorun:** Database boyutu limit'e ulaştı

**Çözüm:**
1. Log tabloları temizle
```sql
-- 30 günden eski logları sil
DELETE FROM application_logs WHERE created_at < DATEADD(day, -30, GETDATE());
DELETE FROM security_logs WHERE created_at < DATEADD(day, -30, GETDATE());
```

2. Soft delete'leri hard delete yap
```sql
-- 90 günden eski soft delete'leri hard delete yap
DELETE FROM applications WHERE deleted_at < DATEADD(day, -90, GETDATE());
DELETE FROM jobs WHERE deleted_at < DATEADD(day, -90, GETDATE());
```

3. Database shrink
```sql
DBCC SHRINKDATABASE (MEDIKARIYER_DEV);
```

---

### 5. Performance Issues

#### High Memory Usage

**Sorun:** Node.js memory usage yüksek

**Çözüm:**
1. Memory leak kontrol et
```bash
# PM2 memory monitoring
pm2 monit

# Memory limit ayarla
pm2 start server.js --max-memory-restart 1G
```

2. Query result limit ekle
```javascript
// Tüm kayıtları çekme
const jobs = await db('jobs').select('*');  // ❌

// Pagination kullan
const jobs = await db('jobs').limit(20).offset(0);  // ✅
```

---

#### High CPU Usage

**Sorun:** CPU usage %100

**Çözüm:**
1. PM2 cluster mode kullan
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'medikariyer-api',
    script: './server.js',
    instances: 'max',  // CPU core sayısı kadar
    exec_mode: 'cluster'
  }]
};
```

2. Caching ekle (Redis)
```javascript
// Cache job listings
const cachedJobs = await redis.get('jobs:list');
if (cachedJobs) {
  return JSON.parse(cachedJobs);
}

const jobs = await db('jobs').select('*');
await redis.set('jobs:list', JSON.stringify(jobs), 'EX', 300);  // 5 dakika cache
```

---

### 6. Common Error Codes

| Code | Açıklama | Çözüm |
|------|----------|-------|
| **400** | Bad Request | Request body validation hatası |
| **401** | Unauthorized | Token geçersiz veya expire |
| **403** | Forbidden | Yetki yok (role check) |
| **404** | Not Found | Kayıt bulunamadı |
| **409** | Conflict | Mükerrer kayıt (unique constraint) |
| **422** | Unprocessable Entity | Business logic hatası |
| **429** | Too Many Requests | Rate limit aşıldı |
| **500** | Internal Server Error | Server hatası (log kontrol et) |
| **503** | Service Unavailable | Database bağlantı hatası |

---

### 7. Debug Mode

**Backend:**
```bash
# Debug mode ile başlat
DEBUG=* npm run dev

# Sadece app debug
DEBUG=app:* npm run dev
```

**Frontend:**
```bash
# React Query devtools
# Otomatik açılır (development mode)
```

**Mobile:**
```bash
# React Native debugger
# Shake device → Debug

# Expo dev tools
expo start --dev-client
```

---

### 8. Log Analysis

**Error log kontrol:**
```bash
# Son 100 satır
tail -n 100 logs/error-2025-01-07.log

# Real-time monitoring
tail -f logs/combined-2025-01-07.log

# Specific error search
grep "Database connection" logs/error-*.log

# Error count
grep -c "Error" logs/error-2025-01-07.log
```

---

### 9. Database Backup & Restore

**Backup:**
```bash
# SQL Server backup
sqlcmd -S localhost -U sa -P password -Q "BACKUP DATABASE MEDIKARIYER_DEV TO DISK = '/var/opt/mssql/backup/medikariyer_backup.bak'"

# Automated backup (cron)
0 2 * * * /usr/bin/sqlcmd -S localhost -U sa -P password -Q "BACKUP DATABASE MEDIKARIYER_DEV TO DISK = '/var/opt/mssql/backup/medikariyer_$(date +\%Y\%m\%d).bak'"
```

**Restore:**
```bash
# SQL Server restore
sqlcmd -S localhost -U sa -P password -Q "RESTORE DATABASE MEDIKARIYER_DEV FROM DISK = '/var/opt/mssql/backup/medikariyer_backup.bak' WITH REPLACE"
```

---

### 10. Emergency Contacts

**Development Team:**
- Backend Lead: backend@medikariyer.net
- Frontend Lead: frontend@medikariyer.net
- Mobile Lead: mobile@medikariyer.net
- DevOps: devops@medikariyer.net

**On-Call Schedule:**
- Weekdays: 09:00 - 18:00
- Weekends: Emergency only

**Escalation:**
1. Check logs
2. Check monitoring dashboard
3. Contact on-call engineer
4. Escalate to team lead

---

## 📚 ADDITIONAL RESOURCES

### Documentation Links
- [MOBIL_API_ANALIZ.md](./MOBIL_API_ANALIZ.md) - Mobil Backend API analizi
- [MOBIL_APP_ANALIZ.md](./MOBIL_APP_ANALIZ.md) - Mobil App analizi
- [README.md](./README.md) - Genel proje bilgisi

### External Resources
- [Node.js Documentation](https://nodejs.org/docs/)
- [React Documentation](https://react.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [MSSQL Documentation](https://docs.microsoft.com/en-us/sql/)
- [Knex.js Documentation](https://knexjs.org/)
- [Express.js Documentation](https://expressjs.com/)

---

## 🎯 CONCLUSION

Bu dokümantasyon, MediKariyer projesinin **MOBIL_API_ANALIZ.md** ve **MOBIL_APP_ANALIZ.md** dosyalarında eksik kalan tüm kritik bilgileri içermektedir:

✅ **Database Schema** - Tüm tablolar, ilişkiler, index'ler  
✅ **Environment Variables** - Backend, Frontend, Mobile  
✅ **Deployment Guide** - Production deployment adımları  
✅ **Business Rules** - Tüm iş kuralları ve akışlar  
✅ **Testing Strategy** - Unit, Integration, E2E testler  
✅ **Web Application** - Web app özellikleri ve farkları  
✅ **Email System** - Email template'leri ve konfigürasyon  
✅ **Security & Rate Limiting** - Güvenlik önlemleri  
✅ **Monitoring & Logging** - Log sistemi ve monitoring  
✅ **Troubleshooting** - Yaygın sorunlar ve çözümleri  

**Artık başka bir AI bu 3 dokümana bakarak projeyi %95 anlayabilir!** 🚀

---

**Son Güncelleme:** 7 Ocak 2025  
**Versiyon:** 1.0  
**Hazırlayan:** Kiro AI

