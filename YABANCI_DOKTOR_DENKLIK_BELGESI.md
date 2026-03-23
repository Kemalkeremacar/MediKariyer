# 🌍 YABANCI UYRUKLU DOKTORLAR İÇİN DENKLİK BELGESİ YÖNETİMİ

## 📋 GENEL BAKIŞ

Bu dokümantasyon, yabancı uyruklu doktorların sisteme kayıt olması ve denklik belgesi yükleme sürecini detaylı olarak açıklar.

### Amaç
- Yabancı uyruklu doktorların sisteme kayıt olabilmesi
- Denklik belgesi zorunluluğu ve onay süreci
- Mevcut doktorların geriye dönük uyumluluğu
- Admin onay ve takip sistemi

### Kapsam
- Database değişiklikleri
- Backend API geliştirmeleri
- Frontend (Web) değişiklikleri
- Mobile App değişiklikleri
- İş kuralları ve validasyonlar
- Bildirim sistemi entegrasyonu

---

## 🎯 İŞ KURALLARI

### 1. Kayıt Aşaması

**Türk Vatandaşı Doktorlar:**
- Uyruk: "Türkiye" (varsayılan)
- Denklik belgesi: Gerekli değil
- `is_foreign = false`
- `equivalence_document_status = NULL`

**Yabancı Uyruklu Doktorlar:**
- Uyruk: Ülke seçimi zorunlu
- Denklik belgesi: Zorunlu (PDF, JPG, PNG - Max 5MB)
- `is_foreign = true`
- `equivalence_document_status = 'pending'`
- Admin onayı bekler

### 2. Mevcut Doktorlar (Geriye Dönük Uyumluluk)

**Otomatik Güncelleme:**
- Tüm mevcut doktorlar → `nationality = 'Türkiye'`
- `is_foreign = false`
- `equivalence_document_status = NULL`
- Profilleri etkilenmez

**Manuel Güncelleme:**
- Doktor isterse uyruğunu değiştirebilir
- Yabancı uyruğa geçerse denklik belgesi zorunlu
- Admin onayı gerekir

### 3. Profil Tamamlama

**Türk Vatandaşı:**
- Standart profil tamamlama kuralları

**Yabancı Uyruklu:**
- Nationality zorunlu
- Denklik belgesi zorunlu
- Belge durumu kontrolü:
  - `pending`: Uyarı göster, başvuru yapamaz
  - `approved`: Normal kullanım, başvuru yapabilir
  - `rejected`: Yeniden yükleme gerekli, başvuru yapamaz
  - `NULL`: Belge yüklenmemiş, başvuru yapamaz

**Profil Tamamlama Hesaplaması:**
```javascript
// Backend/src/services/doctorService.js - getProfileCompletion fonksiyonu

// Yabancı uyruklu kontrolleri
if (profile.is_foreign) {
  // Denklik belgesi yüklenmemiş
  if (!profile.equivalence_document) {
    return {
      completion_percentage: 0,
      blocked: true,
      message: 'Denklik belgesi yüklemeniz gerekmektedir',
      missing_fields: ['equivalence_document']
    };
  }
  
  // Denklik belgesi reddedilmiş
  if (profile.equivalence_document_status === 'rejected') {
    return {
      completion_percentage: 0,
      blocked: true,
      message: 'Denklik belgeniz reddedildi. Lütfen yeniden yükleyin.',
      notes: profile.equivalence_document_notes
    };
  }
  
  // Denklik belgesi beklemede
  if (profile.equivalence_document_status === 'pending') {
    return {
      ...normalCompletion,
      warning: 'Denklik belgeniz inceleniyor. Onaylanana kadar başvuru yapamazsınız.'
    };
  }
}
```

### 4. Başvuru Sistemi

**Kontrol Noktası:**
```javascript
// Backend/src/services/doctorService.js - createApplication fonksiyonu
// Backend/src/services/mobile/mobileApplicationService.js - createApplication fonksiyonu

// İş ilanı başvurusu yapılmadan ÖNCE kontrol et
const profile = await db('doctor_profiles').where('user_id', userId).first();

if (profile.is_foreign && profile.equivalence_document_status !== 'approved') {
  throw new AppError('Denklik belgeniz onaylanmadan başvuru yapamazsınız', 403);
}
```

**İzin Verilen Durumlar:**
- Türk vatandaşı: Her zaman başvuru yapabilir
- Yabancı + approved: Başvuru yapabilir

**İzin Verilmeyen Durumlar:**
- Yabancı + pending: Başvuru yapamaz (uyarı göster)
- Yabancı + rejected: Başvuru yapamaz (yeni belge yükle)
- Yabancı + NULL: Başvuru yapamaz (belge yükle)



---

## 💾 DATABASE DEĞİŞİKLİKLERİ

### 1. doctor_profiles Tablosu

```sql
-- Yeni kolonlar ekle
ALTER TABLE doctor_profiles
ADD nationality NVARCHAR(100) NULL DEFAULT 'Türkiye',
ADD is_foreign BIT NULL DEFAULT 0,
ADD equivalence_document NVARCHAR(MAX) NULL,
ADD equivalence_document_status NVARCHAR(20) NULL,
ADD equivalence_document_notes NVARCHAR(500) NULL,
ADD equivalence_document_uploaded_at DATETIME2 NULL,
ADD equivalence_document_reviewed_at DATETIME2 NULL,
ADD equivalence_document_reviewed_by INT NULL;

-- Foreign key ekle
ALTER TABLE doctor_profiles
ADD CONSTRAINT FK_doctor_profiles_reviewed_by 
FOREIGN KEY (equivalence_document_reviewed_by) REFERENCES users(id);

-- Index'ler (performans için)
CREATE INDEX idx_doctor_profiles_is_foreign 
ON doctor_profiles(is_foreign);

CREATE INDEX idx_doctor_profiles_equivalence_status 
ON doctor_profiles(equivalence_document_status);

-- Mevcut kayıtları güncelle
UPDATE doctor_profiles 
SET nationality = 'Türkiye', 
    is_foreign = 0,
    equivalence_document_status = NULL
WHERE nationality IS NULL;
```

### 2. Kolon Açıklamaları

| Kolon | Tip | Açıklama |
|-------|-----|----------|
| `nationality` | NVARCHAR(100) | Doktorun uyruğu (Türkiye, Suriye, vb.) |
| `is_foreign` | BIT | Yabancı uyruklu mu? (0=Hayır, 1=Evet) |
| `equivalence_document` | NVARCHAR(MAX) | Denklik belgesi (Base64 veya dosya yolu) |
| `equivalence_document_status` | NVARCHAR(20) | Belge durumu (NULL, pending, approved, rejected) |
| `equivalence_document_notes` | NVARCHAR(500) | Admin notları (red sebebi vb.) |
| `equivalence_document_uploaded_at` | DATETIME2 | Belge yükleme tarihi |
| `equivalence_document_reviewed_at` | DATETIME2 | İnceleme tarihi |
| `equivalence_document_reviewed_by` | INT | İnceleyen admin user_id |

### 3. Durum Değerleri

**equivalence_document_status:**
- `NULL`: Türk vatandaşı (belge gerekmez)
- `pending`: Beklemede (inceleniyor)
- `approved`: Onaylandı
- `rejected`: Reddedildi

### 4. Opsiyonel: Ülkeler Tablosu

```sql
-- Ülkeler lookup tablosu
CREATE TABLE countries (
  id INT PRIMARY KEY IDENTITY(1,1),
  name NVARCHAR(100) NOT NULL,
  code NVARCHAR(3) NOT NULL,  -- ISO 3166-1 alpha-3
  is_active BIT DEFAULT 1,
  created_at DATETIME2 DEFAULT GETDATE()
);

-- Varsayılan ülkeler
INSERT INTO countries (name, code) VALUES 
('Türkiye', 'TUR'),
('Suriye', 'SYR'),
('Irak', 'IRQ'),
('İran', 'IRN'),
('Afganistan', 'AFG'),
('Pakistan', 'PAK'),
('Azerbaycan', 'AZE'),
('Özbekistan', 'UZB'),
('Türkmenistan', 'TKM'),
('Kazakistan', 'KAZ');
```

---

## 🔧 BACKEND DEĞİŞİKLİKLERİ

### 1. Validation Şemaları

#### A. authSchemas.js - Kayıt

```javascript
// Backend/src/validators/authSchemas.js

const registerDoctorSchema = Joi.object({
  // ... mevcut alanlar
  
  // Yeni alanlar
  nationality: Joi.string()
    .max(100)
    .default('Türkiye')
    .messages({
      'string.max': 'Uyruk en fazla 100 karakter olabilir'
    }),
    
  is_foreign: Joi.boolean()
    .default(false),
    
  equivalence_document: Joi.when('is_foreign', {
    is: true,
    then: Joi.string()
      .required()
      .messages({
        'any.required': 'Yabancı uyruklu doktorlar için denklik belgesi zorunludur',
        'string.base': 'Denklik belgesi geçerli bir dosya olmalıdır'
      }),
    otherwise: Joi.string().allow(null, '')
  })
});
```

#### B. doctorSchemas.js - Profil Güncelleme

```javascript
// Backend/src/validators/doctorSchemas.js

const updatePersonalInfoSchema = Joi.object({
  // ... mevcut alanlar
  
  nationality: Joi.string()
    .max(100)
    .optional()
    .messages({
      'string.max': 'Uyruk en fazla 100 karakter olabilir'
    }),
    
  is_foreign: Joi.boolean()
    .optional(),
    
  equivalence_document: Joi.when('is_foreign', {
    is: true,
    then: Joi.string()
      .when('$existing_is_foreign', {
        is: false,
        then: Joi.required().messages({
          'any.required': 'Yabancı uyruğa geçiş için denklik belgesi zorunludur'
        }),
        otherwise: Joi.optional()
      }),
    otherwise: Joi.string().allow(null, '')
  })
});

// Yeni şema: Denklik belgesi yükleme
const uploadEquivalenceDocumentSchema = Joi.object({
  equivalence_document: Joi.string()
    .required()
    .messages({
      'any.required': 'Denklik belgesi zorunludur',
      'string.base': 'Denklik belgesi geçerli bir dosya olmalıdır'
    }),
    
  nationality: Joi.string()
    .max(100)
    .optional()
});
```

#### C. adminSchemas.js - Admin Onay

```javascript
// Backend/src/validators/adminSchemas.js

// Yeni şema: Denklik belgesi inceleme
const reviewEquivalenceDocumentSchema = Joi.object({
  status: Joi.string()
    .valid('approved', 'rejected')
    .required()
    .messages({
      'any.only': 'Durum approved veya rejected olmalıdır',
      'any.required': 'Durum zorunludur'
    }),
    
  notes: Joi.string()
    .max(500)
    .allow('', null)
    .messages({
      'string.max': 'Notlar en fazla 500 karakter olabilir'
    })
});
```



### 2. Service Fonksiyonları

#### A. authService.js

```javascript
// Backend/src/services/authService.js

const registerDoctor = async (registrationData) => {
  const { 
    email, 
    password, 
    first_name, 
    last_name, 
    title, 
    specialty_id,
    subspecialty_id,
    profile_photo,
    nationality = 'Türkiye',  // Yeni
    is_foreign = false,        // Yeni
    equivalence_document       // Yeni
  } = registrationData;

  // ... mevcut kod

  // Doktor profilini oluştur
  const profileId = await createDoctorProfile(userId, { 
    first_name, 
    last_name, 
    title, 
    specialty_id, 
    subspecialty_id, 
    profile_photo,
    nationality,                                    // Yeni
    is_foreign,                                     // Yeni
    equivalence_document,                           // Yeni
    equivalence_document_status: is_foreign ? 'pending' : null,  // Yeni
    equivalence_document_uploaded_at: is_foreign ? db.fn.now() : null  // Yeni
  }, trx);

  // Yabancı uyruklu ise admin'e bildirim gönder
  if (is_foreign) {
    await notificationService.sendAdminSystemNotification({
      type: 'info',
      title: 'Yeni Yabancı Doktor Kaydı',
      body: `${first_name} ${last_name} (${nationality}) denklik belgesi yükledi. İnceleme bekliyor.`,
      data: {
        user_id: userId,
        doctor_profile_id: profileId,
        action: 'review_equivalence_document'
      }
    });
  }

  // ... mevcut kod
};
```

#### B. doctorService.js

```javascript
// Backend/src/services/doctorService.js

// Yeni fonksiyon: Denklik belgesi yükleme
const uploadEquivalenceDocument = async (userId, documentData) => {
  const { equivalence_document, nationality } = documentData;
  
  const profile = await db('doctor_profiles').where('user_id', userId).first();
  if (!profile) throw new AppError('Profil bulunamadı', 404);
  
  // Güncelleme
  await db('doctor_profiles')
    .where('user_id', userId)
    .update({
      equivalence_document,
      equivalence_document_status: 'pending',
      equivalence_document_uploaded_at: db.fn.now(),
      equivalence_document_reviewed_at: null,
      equivalence_document_reviewed_by: null,
      equivalence_document_notes: null,
      nationality: nationality || profile.nationality,
      is_foreign: true,
      updated_at: db.fn.now()
    });
  
  // Admin'e bildirim gönder
  await notificationService.sendAdminSystemNotification({
    type: 'info',
    title: 'Denklik Belgesi Yüklendi',
    body: `${profile.first_name} ${profile.last_name} denklik belgesi yükledi.`,
    data: {
      user_id: userId,
      doctor_profile_id: profile.id,
      action: 'review_equivalence_document'
    }
  });
  
  return await getProfile(userId);
};

// Yeni fonksiyon: Denklik belgesi durumu
const getEquivalenceDocumentStatus = async (userId) => {
  const profile = await db('doctor_profiles')
    .where('user_id', userId)
    .select(
      'is_foreign',
      'nationality',
      'equivalence_document_status',
      'equivalence_document_notes',
      'equivalence_document_uploaded_at',
      'equivalence_document_reviewed_at'
    )
    .first();
  
  if (!profile) throw new AppError('Profil bulunamadı', 404);
  
  return profile;
};

// Güncelleme: Profil tamamlama hesaplaması
const getProfileCompletion = async (userId) => {
  const profile = await db('doctor_profiles').where('user_id', userId).first();
  if (!profile) return { completion_percentage: 0, blocked: true };
  
  // ... mevcut hesaplamalar
  
  // Yabancı uyruklu kontrolleri
  if (profile.is_foreign) {
    // Denklik belgesi yüklenmemiş
    if (!profile.equivalence_document) {
      return {
        completion_percentage: 0,
        blocked: true,
        message: 'Denklik belgesi yüklemeniz gerekmektedir',
        missing_fields: ['equivalence_document']
      };
    }
    
    // Denklik belgesi reddedilmiş
    if (profile.equivalence_document_status === 'rejected') {
      return {
        completion_percentage: 0,
        blocked: true,
        message: 'Denklik belgeniz reddedildi. Lütfen yeniden yükleyin.',
        notes: profile.equivalence_document_notes
      };
    }
    
    // Denklik belgesi beklemede
    if (profile.equivalence_document_status === 'pending') {
      return {
        ...normalCompletion,
        warning: 'Denklik belgeniz inceleniyor'
      };
    }
  }
  
  // ... mevcut return
};

module.exports = {
  // ... mevcut exports
  uploadEquivalenceDocument,
  getEquivalenceDocumentStatus
};
```

#### C. adminService.js

```javascript
// Backend/src/services/adminService.js

// Yeni fonksiyon: Bekleyen denklik belgeleri
const getPendingEquivalenceDocuments = async (filters = {}) => {
  const { page = 1, limit = 20 } = filters;
  const offset = (page - 1) * limit;
  
  const query = db('doctor_profiles as dp')
    .join('users as u', 'dp.user_id', 'u.id')
    .leftJoin('specialties as s', 'dp.specialty_id', 's.id')
    .where('dp.is_foreign', true)
    .where('dp.equivalence_document_status', 'pending')
    .select(
      'dp.id',
      'dp.user_id',
      'dp.first_name',
      'dp.last_name',
      'dp.nationality',
      'dp.equivalence_document',
      'dp.equivalence_document_uploaded_at',
      's.name as specialty_name',
      'u.email'
    )
    .orderBy('dp.equivalence_document_uploaded_at', 'desc');
  
  const [total, documents] = await Promise.all([
    query.clone().count('* as count').first(),
    query.limit(limit).offset(offset)
  ]);
  
  return {
    documents,
    pagination: {
      current_page: page,
      per_page: limit,
      total: parseInt(total.count),
      total_pages: Math.ceil(parseInt(total.count) / limit)
    }
  };
};

// Yeni fonksiyon: Denklik belgesi inceleme
const reviewEquivalenceDocument = async (adminUserId, doctorProfileId, reviewData) => {
  const { status, notes } = reviewData;
  
  const profile = await db('doctor_profiles')
    .where('id', doctorProfileId)
    .first();
  
  if (!profile) throw new AppError('Profil bulunamadı', 404);
  
  // Güncelleme
  await db('doctor_profiles')
    .where('id', doctorProfileId)
    .update({
      equivalence_document_status: status,
      equivalence_document_notes: notes || null,
      equivalence_document_reviewed_at: db.fn.now(),
      equivalence_document_reviewed_by: adminUserId,
      updated_at: db.fn.now()
    });
  
  // Doktora bildirim gönder
  const notificationType = status === 'approved' ? 'success' : 'warning';
  const notificationTitle = status === 'approved' 
    ? 'Denklik Belgesi Onaylandı' 
    : 'Denklik Belgesi Reddedildi';
  const notificationBody = status === 'approved'
    ? 'Denklik belgeniz onaylandı. Artık iş ilanlarına başvuru yapabilirsiniz.'
    : `Denklik belgeniz reddedildi. ${notes ? 'Sebep: ' + notes : 'Lütfen yeniden yükleyin.'}`;
  
  await notificationService.sendNotification({
    user_id: profile.user_id,
    type: notificationType,
    title: notificationTitle,
    body: notificationBody,
    data: {
      action: 'equivalence_document_reviewed',
      status,
      notes
    }
  });
  
  return await db('doctor_profiles')
    .where('id', doctorProfileId)
    .first();
};

// Yeni fonksiyon: Denklik belgesi istatistikleri
const getEquivalenceDocumentStatistics = async () => {
  const stats = await db('doctor_profiles')
    .where('is_foreign', true)
    .select(
      db.raw('COUNT(*) as total'),
      db.raw("COUNT(CASE WHEN equivalence_document_status = 'pending' THEN 1 END) as pending"),
      db.raw("COUNT(CASE WHEN equivalence_document_status = 'approved' THEN 1 END) as approved"),
      db.raw("COUNT(CASE WHEN equivalence_document_status = 'rejected' THEN 1 END) as rejected")
    )
    .first();
  
  // Ülkelere göre dağılım
  const byCountry = await db('doctor_profiles')
    .where('is_foreign', true)
    .select('nationality')
    .count('* as count')
    .groupBy('nationality')
    .orderBy('count', 'desc');
  
  return {
    ...stats,
    by_country: byCountry
  };
};

module.exports = {
  // ... mevcut exports
  getPendingEquivalenceDocuments,
  reviewEquivalenceDocument,
  getEquivalenceDocumentStatistics
};
```



### 3. Routes (API Endpoints)

#### A. doctorRoutes.js

```javascript
// Backend/src/routes/doctorRoutes.js

const { 
  uploadEquivalenceDocumentSchema 
} = require('../validators/doctorSchemas');

// Denklik belgesi yükleme
router.post(
  '/profile/equivalence-document',
  authMiddleware,
  requireRole(['doctor']),
  validate(uploadEquivalenceDocumentSchema, 'body'),
  doctorController.uploadEquivalenceDocument
);

// Denklik belgesi durumu
router.get(
  '/profile/equivalence-document/status',
  authMiddleware,
  requireRole(['doctor']),
  doctorController.getEquivalenceDocumentStatus
);

// Denklik belgesi silme (yeniden yüklemek için)
router.delete(
  '/profile/equivalence-document',
  authMiddleware,
  requireRole(['doctor']),
  doctorController.deleteEquivalenceDocument
);
```

#### B. adminRoutes.js

```javascript
// Backend/src/routes/adminRoutes.js

const { 
  reviewEquivalenceDocumentSchema 
} = require('../validators/adminSchemas');

// Bekleyen denklik belgeleri listesi
router.get(
  '/equivalence-documents/pending',
  authMiddleware,
  requireRole(['admin']),
  adminController.getPendingEquivalenceDocuments
);

// Denklik belgesi detayı
router.get(
  '/equivalence-documents/:doctorProfileId',
  authMiddleware,
  requireRole(['admin']),
  adminController.getEquivalenceDocumentDetail
);

// Denklik belgesi inceleme (onay/red)
router.patch(
  '/equivalence-documents/:doctorProfileId/review',
  authMiddleware,
  requireRole(['admin']),
  validate(reviewEquivalenceDocumentSchema, 'body'),
  adminController.reviewEquivalenceDocument
);

// Denklik belgesi istatistikleri
router.get(
  '/equivalence-documents/statistics',
  authMiddleware,
  requireRole(['admin']),
  adminController.getEquivalenceDocumentStatistics
);
```

### 4. Controllers

#### A. doctorController.js

```javascript
// Backend/src/controllers/doctorController.js

const uploadEquivalenceDocument = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const documentData = req.body;
  
  const profile = await doctorService.uploadEquivalenceDocument(userId, documentData);
  
  return sendSuccess(res, 'Denklik belgesi başarıyla yüklendi. İnceleme süreci başlatıldı.', profile);
});

const getEquivalenceDocumentStatus = catchAsync(async (req, res) => {
  const userId = req.user.id;
  
  const status = await doctorService.getEquivalenceDocumentStatus(userId);
  
  return sendSuccess(res, 'Denklik belgesi durumu getirildi', status);
});

const deleteEquivalenceDocument = catchAsync(async (req, res) => {
  const userId = req.user.id;
  
  await doctorService.deleteEquivalenceDocument(userId);
  
  return sendSuccess(res, 'Denklik belgesi silindi. Yeni belge yükleyebilirsiniz.');
});

module.exports = {
  // ... mevcut exports
  uploadEquivalenceDocument,
  getEquivalenceDocumentStatus,
  deleteEquivalenceDocument
};
```

#### B. adminController.js

```javascript
// Backend/src/controllers/adminController.js

const getPendingEquivalenceDocuments = catchAsync(async (req, res) => {
  const filters = req.query;
  
  const result = await adminService.getPendingEquivalenceDocuments(filters);
  
  return sendSuccess(res, 'Bekleyen denklik belgeleri getirildi', result);
});

const getEquivalenceDocumentDetail = catchAsync(async (req, res) => {
  const { doctorProfileId } = req.params;
  
  const detail = await adminService.getEquivalenceDocumentDetail(doctorProfileId);
  
  return sendSuccess(res, 'Denklik belgesi detayı getirildi', detail);
});

const reviewEquivalenceDocument = catchAsync(async (req, res) => {
  const adminUserId = req.user.id;
  const { doctorProfileId } = req.params;
  const reviewData = req.body;
  
  const result = await adminService.reviewEquivalenceDocument(
    adminUserId, 
    doctorProfileId, 
    reviewData
  );
  
  const message = reviewData.status === 'approved' 
    ? 'Denklik belgesi onaylandı' 
    : 'Denklik belgesi reddedildi';
  
  return sendSuccess(res, message, result);
});

const getEquivalenceDocumentStatistics = catchAsync(async (req, res) => {
  const stats = await adminService.getEquivalenceDocumentStatistics();
  
  return sendSuccess(res, 'Denklik belgesi istatistikleri getirildi', stats);
});

module.exports = {
  // ... mevcut exports
  getPendingEquivalenceDocuments,
  getEquivalenceDocumentDetail,
  reviewEquivalenceDocument,
  getEquivalenceDocumentStatistics
};
```

---

## 🎨 FRONTEND (WEB) DEĞİŞİKLİKLERİ

### 1. Kayıt Sayfası

```jsx
// frontend/src/features/auth/pages/RegisterPage.jsx

const [nationality, setNationality] = useState('Türkiye');
const [isForeign, setIsForeign] = useState(false);
const [equivalenceDocument, setEquivalenceDocument] = useState(null);

// Uyruk seçimi
<FormField label="Uyruk" required>
  <Select
    value={nationality}
    onChange={(e) => {
      const value = e.target.value;
      setNationality(value);
      setIsForeign(value !== 'Türkiye');
    }}
  >
    <option value="Türkiye">Türkiye</option>
    <option value="other">Diğer Ülke</option>
  </Select>
</FormField>

{/* Yabancı uyruklu ise */}
{isForeign && (
  <>
    <FormField label="Ülke Adı" required>
      <Input
        value={nationality === 'other' ? '' : nationality}
        onChange={(e) => setNationality(e.target.value)}
        placeholder="Örn: Suriye, Irak, İran"
      />
    </FormField>
    
    <FormField 
      label="Denklik Belgesi" 
      required
      help="Türkiye'de çalışabilmek için denklik belgenizi yüklemeniz gerekmektedir."
    >
      <FileUpload
        accept=".pdf,.jpg,.jpeg,.png"
        maxSize={5 * 1024 * 1024} // 5MB
        onUpload={(file) => {
          // Base64'e çevir
          const reader = new FileReader();
          reader.onloadend = () => {
            setEquivalenceDocument(reader.result);
          };
          reader.readAsDataURL(file);
        }}
      />
      <small className="text-gray-500">
        PDF, JPG veya PNG formatında, maksimum 5MB
      </small>
    </FormField>
  </>
)}
```

### 2. Profil Sayfası

```jsx
// frontend/src/features/doctor/pages/ProfilePage.jsx

// Kişisel Bilgiler Sekmesi
<FormSection title="Uyruk Bilgileri">
  <FormField label="Uyruk">
    <Select
      value={profile.nationality || 'Türkiye'}
      onChange={(e) => handleNationalityChange(e.target.value)}
    >
      <option value="Türkiye">Türkiye</option>
      <option value="other">Diğer Ülke</option>
    </Select>
  </FormField>

  {profile.is_foreign && (
    <>
      {profile.nationality !== 'Türkiye' && (
        <FormField label="Ülke Adı">
          <Input value={profile.nationality} readOnly />
        </FormField>
      )}
      
      <FormField label="Denklik Belgesi Durumu">
        <EquivalenceDocumentStatus 
          status={profile.equivalence_document_status}
          notes={profile.equivalence_document_notes}
          uploadedAt={profile.equivalence_document_uploaded_at}
          reviewedAt={profile.equivalence_document_reviewed_at}
        />
      </FormField>
      
      {profile.equivalence_document_status === 'rejected' && (
        <FormField label="Yeni Belge Yükle">
          <FileUpload
            accept=".pdf,.jpg,.jpeg,.png"
            maxSize={5 * 1024 * 1024}
            onUpload={handleReupload}
          />
        </FormField>
      )}
    </>
  )}
</FormSection>
```

### 3. Yeni Komponent: EquivalenceDocumentStatus

```jsx
// frontend/src/features/doctor/components/EquivalenceDocumentStatus.jsx

export const EquivalenceDocumentStatus = ({ 
  status, 
  notes, 
  uploadedAt, 
  reviewedAt 
}) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending':
        return {
          color: 'warning',
          icon: 'clock',
          text: 'İnceleniyor',
          description: 'Denklik belgeniz inceleniyor. Onaylandığında bildirim alacaksınız.'
        };
      case 'approved':
        return {
          color: 'success',
          icon: 'check-circle',
          text: 'Onaylandı',
          description: 'Denklik belgeniz onaylandı. İş ilanlarına başvuru yapabilirsiniz.'
        };
      case 'rejected':
        return {
          color: 'error',
          icon: 'x-circle',
          text: 'Reddedildi',
          description: 'Denklik belgeniz reddedildi. Lütfen yeni belge yükleyin.'
        };
      default:
        return {
          color: 'gray',
          icon: 'alert-circle',
          text: 'Belge Yüklenmedi',
          description: 'Denklik belgesi yüklemeniz gerekmektedir.'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div className={`border-l-4 border-${config.color}-500 bg-${config.color}-50 p-4 rounded`}>
      <div className="flex items-start">
        <Icon name={config.icon} className={`text-${config.color}-600 mr-3`} />
        <div className="flex-1">
          <h4 className={`font-semibold text-${config.color}-800`}>
            {config.text}
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            {config.description}
          </p>
          
          {notes && (
            <div className="mt-2 p-2 bg-white rounded border border-gray-200">
              <p className="text-sm font-medium text-gray-700">Admin Notu:</p>
              <p className="text-sm text-gray-600">{notes}</p>
            </div>
          )}
          
          <div className="mt-2 text-xs text-gray-500">
            {uploadedAt && (
              <p>Yükleme: {formatDateTime(uploadedAt)}</p>
            )}
            {reviewedAt && (
              <p>İnceleme: {formatDateTime(reviewedAt)}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
```



### 4. Admin Panel - Denklik Belgeleri Sayfası

```jsx
// frontend/src/features/admin/pages/EquivalenceDocumentsPage.jsx

export const EquivalenceDocumentsPage = () => {
  const { data, isLoading } = usePendingEquivalenceDocuments();
  const reviewMutation = useReviewEquivalenceDocument();
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const handleReview = async (doctorProfileId, status, notes) => {
    await reviewMutation.mutateAsync({
      doctorProfileId,
      status,
      notes
    });
    setShowReviewModal(false);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Denklik Belgeleri</h1>
        <Badge color="warning">
          {data?.pagination?.total || 0} Bekleyen
        </Badge>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Toplam"
          value={stats?.total || 0}
          icon="users"
        />
        <StatCard
          title="Bekleyen"
          value={stats?.pending || 0}
          icon="clock"
          color="warning"
        />
        <StatCard
          title="Onaylanan"
          value={stats?.approved || 0}
          icon="check-circle"
          color="success"
        />
        <StatCard
          title="Reddedilen"
          value={stats?.rejected || 0}
          icon="x-circle"
          color="error"
        />
      </div>

      {/* Belgeler Tablosu */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Doktor</TableHead>
            <TableHead>Uyruk</TableHead>
            <TableHead>Branş</TableHead>
            <TableHead>Yükleme Tarihi</TableHead>
            <TableHead>Belge</TableHead>
            <TableHead>İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.documents?.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell>
                <div>
                  <p className="font-medium">
                    {doc.first_name} {doc.last_name}
                  </p>
                  <p className="text-sm text-gray-500">{doc.email}</p>
                </div>
              </TableCell>
              <TableCell>
                <Badge>{doc.nationality}</Badge>
              </TableCell>
              <TableCell>{doc.specialty_name}</TableCell>
              <TableCell>
                {formatDateTime(doc.equivalence_document_uploaded_at)}
              </TableCell>
              <TableCell>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => viewDocument(doc.equivalence_document)}
                >
                  <Icon name="eye" className="mr-1" />
                  Görüntüle
                </Button>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="success"
                    onClick={() => {
                      setSelectedDocument(doc);
                      setShowReviewModal(true);
                    }}
                  >
                    <Icon name="check" className="mr-1" />
                    Onayla
                  </Button>
                  <Button
                    size="sm"
                    variant="error"
                    onClick={() => {
                      setSelectedDocument(doc);
                      setShowReviewModal(true);
                    }}
                  >
                    <Icon name="x" className="mr-1" />
                    Reddet
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* İnceleme Modal */}
      {showReviewModal && (
        <ReviewModal
          document={selectedDocument}
          onClose={() => setShowReviewModal(false)}
          onReview={handleReview}
        />
      )}
    </div>
  );
};
```

### 5. API Hooks

```javascript
// frontend/src/features/doctor/api/useDoctor.js

export const useUploadEquivalenceDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data) => apiClient.uploadEquivalenceDocument(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['profile']);
      toast.success('Denklik belgesi yüklendi. İnceleme süreci başlatıldı.');
    },
    onError: (error) => {
      toast.error(error.message || 'Belge yüklenirken hata oluştu');
    }
  });
};

export const useEquivalenceDocumentStatus = () => {
  return useQuery({
    queryKey: ['equivalence-document-status'],
    queryFn: () => apiClient.getEquivalenceDocumentStatus()
  });
};

// frontend/src/features/admin/api/useAdmin.js

export const usePendingEquivalenceDocuments = (filters) => {
  return useQuery({
    queryKey: ['pending-equivalence-documents', filters],
    queryFn: () => apiClient.getPendingEquivalenceDocuments(filters)
  });
};

export const useReviewEquivalenceDocument = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ doctorProfileId, status, notes }) => 
      apiClient.reviewEquivalenceDocument(doctorProfileId, { status, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries(['pending-equivalence-documents']);
      toast.success('Denklik belgesi incelendi');
    }
  });
};

export const useEquivalenceDocumentStatistics = () => {
  return useQuery({
    queryKey: ['equivalence-document-statistics'],
    queryFn: () => apiClient.getEquivalenceDocumentStatistics()
  });
};
```

---

## 📱 MOBILE APP DEĞİŞİKLİKLERİ

### 1. Kayıt Ekranı

```typescript
// mobile-app/src/features/auth/screens/RegisterScreen.tsx

const [nationality, setNationality] = useState('Türkiye');
const [isForeign, setIsForeign] = useState(false);
const [equivalenceDocument, setEquivalenceDocument] = useState<string | null>(null);

// Uyruk seçimi
<FormField label="Uyruk" required>
  <Picker
    selectedValue={nationality}
    onValueChange={(value) => {
      setNationality(value);
      setIsForeign(value !== 'Türkiye');
    }}
  >
    <Picker.Item label="Türkiye" value="Türkiye" />
    <Picker.Item label="Diğer Ülke" value="other" />
  </Picker>
</FormField>

{/* Yabancı uyruklu ise */}
{isForeign && (
  <>
    <FormField label="Ülke Adı" required>
      <TextInput
        value={nationality === 'other' ? '' : nationality}
        onChangeText={setNationality}
        placeholder="Örn: Suriye, Irak, İran"
      />
    </FormField>
    
    <FormField 
      label="Denklik Belgesi" 
      required
      help="Türkiye'de çalışabilmek için denklik belgenizi yüklemeniz gerekmektedir."
    >
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={handleDocumentPick}
      >
        <Ionicons name="cloud-upload" size={24} color={colors.primary[600]} />
        <Typography variant="body" style={styles.uploadText}>
          {equivalenceDocument ? 'Belge Yüklendi ✓' : 'Belge Yükle'}
        </Typography>
      </TouchableOpacity>
      <Typography variant="caption" style={styles.helpText}>
        PDF, JPG veya PNG formatında, maksimum 5MB
      </Typography>
    </FormField>
  </>
)}

// Belge seçme fonksiyonu
const handleDocumentPick = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/jpeg', 'image/png'],
      copyToCacheDirectory: true
    });

    if (result.type === 'success') {
      // Dosya boyutu kontrolü (5MB)
      if (result.size > 5 * 1024 * 1024) {
        showToast('Dosya boyutu 5MB\'dan küçük olmalıdır', 'error');
        return;
      }

      // Base64'e çevir
      const base64 = await FileSystem.readAsStringAsync(result.uri, {
        encoding: FileSystem.EncodingType.Base64
      });
      
      const mimeType = result.mimeType || 'application/pdf';
      const base64String = `data:${mimeType};base64,${base64}`;
      
      setEquivalenceDocument(base64String);
      showToast('Belge yüklendi', 'success');
    }
  } catch (error) {
    showToast('Belge yüklenirken hata oluştu', 'error');
  }
};
```

### 2. Profil Ekranı - Denklik Belgesi Durumu

```typescript
// mobile-app/src/features/profile/screens/ProfileScreen.tsx

{profile.is_foreign && (
  <Card variant="outlined" padding="lg" style={styles.equivalenceCard}>
    <View style={styles.equivalenceHeader}>
      <Ionicons 
        name="document-text" 
        size={24} 
        color={colors.primary[600]} 
      />
      <Typography variant="h3" style={styles.equivalenceTitle}>
        Denklik Belgesi
      </Typography>
    </View>
    
    <EquivalenceDocumentStatus
      status={profile.equivalence_document_status}
      notes={profile.equivalence_document_notes}
      uploadedAt={profile.equivalence_document_uploaded_at}
      reviewedAt={profile.equivalence_document_reviewed_at}
    />
    
    {profile.equivalence_document_status === 'rejected' && (
      <Button
        label="Yeni Belge Yükle"
        variant="primary"
        onPress={() => navigation.navigate('UploadEquivalenceDocument')}
        style={styles.reuploadButton}
      />
    )}
  </Card>
)}
```

### 3. Yeni Komponent: EquivalenceDocumentStatus

```typescript
// mobile-app/src/components/composite/EquivalenceDocumentStatus.tsx

interface EquivalenceDocumentStatusProps {
  status: string | null;
  notes?: string | null;
  uploadedAt?: string | null;
  reviewedAt?: string | null;
}

export const EquivalenceDocumentStatus: React.FC<EquivalenceDocumentStatusProps> = ({
  status,
  notes,
  uploadedAt,
  reviewedAt
}) => {
  const getStatusConfig = (status: string | null) => {
    switch (status) {
      case 'pending':
        return {
          color: colors.warning[600],
          bgColor: colors.warning[50],
          icon: 'time' as const,
          text: 'İnceleniyor',
          description: 'Denklik belgeniz inceleniyor. Onaylandığında bildirim alacaksınız.'
        };
      case 'approved':
        return {
          color: colors.success[600],
          bgColor: colors.success[50],
          icon: 'checkmark-circle' as const,
          text: 'Onaylandı',
          description: 'Denklik belgeniz onaylandı. İş ilanlarına başvuru yapabilirsiniz.'
        };
      case 'rejected':
        return {
          color: colors.error[600],
          bgColor: colors.error[50],
          icon: 'close-circle' as const,
          text: 'Reddedildi',
          description: 'Denklik belgeniz reddedildi. Lütfen yeni belge yükleyin.'
        };
      default:
        return {
          color: colors.neutral[600],
          bgColor: colors.neutral[50],
          icon: 'alert-circle' as const,
          text: 'Belge Yüklenmedi',
          description: 'Denklik belgesi yüklemeniz gerekmektedir.'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <View style={[styles.container, { backgroundColor: config.bgColor }]}>
      <View style={styles.header}>
        <Ionicons name={config.icon} size={32} color={config.color} />
        <View style={styles.headerText}>
          <Typography variant="h3" style={[styles.statusText, { color: config.color }]}>
            {config.text}
          </Typography>
          <Typography variant="body" style={styles.description}>
            {config.description}
          </Typography>
        </View>
      </View>

      {notes && (
        <View style={styles.notesContainer}>
          <Typography variant="caption" style={styles.notesLabel}>
            Admin Notu:
          </Typography>
          <Typography variant="body" style={styles.notesText}>
            {notes}
          </Typography>
        </View>
      )}

      <View style={styles.dates}>
        {uploadedAt && (
          <Typography variant="caption" style={styles.dateText}>
            Yükleme: {formatDateTime(uploadedAt)}
          </Typography>
        )}
        {reviewedAt && (
          <Typography variant="caption" style={styles.dateText}>
            İnceleme: {formatDateTime(reviewedAt)}
          </Typography>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    borderRadius: 12,
    marginTop: spacing.md
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md
  },
  headerText: {
    flex: 1
  },
  statusText: {
    fontWeight: '700',
    marginBottom: spacing.xs
  },
  description: {
    color: colors.text.secondary,
    fontSize: 14
  },
  notesContainer: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background.primary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.neutral[200]
  },
  notesLabel: {
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs
  },
  notesText: {
    color: colors.text.secondary,
    fontSize: 13
  },
  dates: {
    marginTop: spacing.md,
    gap: spacing.xs
  },
  dateText: {
    color: colors.text.tertiary,
    fontSize: 11
  }
});
```



---

## 🚀 UYGULAMA AŞAMALARI

### Faz 1: Database & Backend Core (Öncelik: Yüksek)

**1.1 Database Migration**
```sql
-- Migration dosyası: migrations/YYYYMMDD_add_equivalence_document_fields.sql
ALTER TABLE doctor_profiles
ADD nationality NVARCHAR(100) NULL DEFAULT 'Türkiye',
ADD is_foreign BIT NULL DEFAULT 0,
ADD equivalence_document NVARCHAR(MAX) NULL,
ADD equivalence_document_status NVARCHAR(20) NULL,
ADD equivalence_document_notes NVARCHAR(500) NULL,
ADD equivalence_document_uploaded_at DATETIME2 NULL,
ADD equivalence_document_reviewed_at DATETIME2 NULL,
ADD equivalence_document_reviewed_by INT NULL;

-- Mevcut kayıtları güncelle
UPDATE doctor_profiles 
SET nationality = 'Türkiye', 
    is_foreign = 0,
    equivalence_document_status = NULL
WHERE nationality IS NULL;

-- Index'ler
CREATE INDEX idx_doctor_profiles_is_foreign ON doctor_profiles(is_foreign);
CREATE INDEX idx_doctor_profiles_equivalence_status ON doctor_profiles(equivalence_document_status);

-- Foreign key
ALTER TABLE doctor_profiles
ADD CONSTRAINT FK_doctor_profiles_reviewed_by 
FOREIGN KEY (equivalence_document_reviewed_by) REFERENCES users(id);
```

**1.2 Validation Schemas**
- `Backend/src/validators/authSchemas.js` - registerDoctorSchema güncelle
- `Backend/src/validators/doctorSchemas.js` - updatePersonalInfoSchema, uploadEquivalenceDocumentSchema ekle
- `Backend/src/validators/adminSchemas.js` - reviewEquivalenceDocumentSchema ekle
- `Backend/src/validators/mobileSchemas.js` - mobileRegisterDoctorSchema güncelle

**1.3 Service Functions**
- `Backend/src/services/authService.js` - registerDoctor güncelle
- `Backend/src/services/doctorService.js` - uploadEquivalenceDocument, getEquivalenceDocumentStatus, getProfileCompletion güncelle
- `Backend/src/services/mobile/mobileAuthService.js` - registerDoctor güncelle
- `Backend/src/services/mobile/mobileDoctorService.js` - getProfileCompletion güncelle
- `Backend/src/services/adminService.js` - getPendingEquivalenceDocuments, reviewEquivalenceDocument, getEquivalenceDocumentStatistics ekle

**1.4 Application Logic**
- `Backend/src/services/doctorService.js` - createApplication fonksiyonuna denklik belgesi kontrolü ekle
- `Backend/src/services/mobile/mobileApplicationService.js` - createApplication fonksiyonuna denklik belgesi kontrolü ekle

**Test:**
```bash
# Postman/Thunder Client ile test et
POST /api/auth/register/doctor
{
  "email": "foreign.doctor@test.com",
  "password": "Test123!",
  "first_name": "Ahmed",
  "last_name": "Hassan",
  "nationality": "Suriye",
  "is_foreign": true,
  "equivalence_document": "data:application/pdf;base64,..."
}

# Başvuru yapma testi (reddedilmeli)
POST /api/doctor/applications
{
  "jobId": 1,
  "coverLetter": "Test"
}
# Beklenen: 403 - "Denklik belgeniz onaylanmadan başvuru yapamazsınız"
```

---

### Faz 2: Admin Panel (Öncelik: Yüksek)

**2.1 Routes & Controllers**
- `Backend/src/routes/adminRoutes.js` - Denklik belgesi endpoint'leri ekle
- `Backend/src/controllers/adminController.js` - Controller fonksiyonları ekle

**2.2 Frontend Admin Pages**
- `frontend/src/features/admin/pages/EquivalenceDocumentsPage.jsx` - Yeni sayfa oluştur
- `frontend/src/features/admin/components/ReviewModal.jsx` - İnceleme modal'ı
- `frontend/src/features/admin/api/useAdmin.js` - API hooks ekle

**2.3 Navigation**
- Admin sidebar'a "Denklik Belgeleri" menüsü ekle
- Badge ile bekleyen belge sayısını göster

**Test:**
```bash
# Admin panelde bekleyen belgeleri görüntüle
GET /api/admin/equivalence-documents/pending

# Belge onaylama
PATCH /api/admin/equivalence-documents/:doctorProfileId/review
{
  "status": "approved",
  "notes": ""
}

# Belge reddetme
PATCH /api/admin/equivalence-documents/:doctorProfileId/review
{
  "status": "rejected",
  "notes": "Belge okunamıyor, lütfen daha net bir belge yükleyin"
}
```

---

### Faz 3: Web Frontend (Öncelik: Orta)

**3.1 Kayıt Sayfası**
- `frontend/src/features/auth/pages/RegisterPage.jsx` - Uyruk seçimi ve belge yükleme ekle
- Dosya yükleme komponenti (PDF, JPG, PNG - Max 5MB)
- Base64 encoding

**3.2 Profil Sayfası**
- `frontend/src/features/doctor/pages/ProfilePage.jsx` - Denklik belgesi bölümü ekle
- `frontend/src/features/doctor/components/EquivalenceDocumentStatus.jsx` - Durum komponenti
- Yeniden yükleme özelliği (rejected durumunda)

**3.3 API Integration**
- `frontend/src/features/doctor/api/useDoctor.js` - Hooks ekle
- `frontend/src/services/http/client.js` - API endpoints ekle

**Test:**
```bash
# Kayıt akışı
1. Kayıt sayfasında "Diğer Ülke" seç
2. Ülke adı gir (Suriye)
3. Denklik belgesi yükle (PDF)
4. Kayıt ol
5. Profil sayfasında "İnceleniyor" durumunu gör

# Profil sayfası
1. Denklik belgesi durumunu görüntüle
2. Admin reddettiğinde "Reddedildi" durumunu gör
3. Yeni belge yükle butonu ile yeniden yükle
```

---

### Faz 4: Mobile App (Öncelik: Orta)

**4.1 Kayıt Ekranı**
- `mobile-app/src/features/auth/screens/RegisterScreen.tsx` - Uyruk seçimi ekle
- DocumentPicker ile belge yükleme
- FileSystem ile Base64 encoding

**4.2 Profil Ekranı**
- `mobile-app/src/features/profile/screens/ProfileScreen.tsx` - Denklik belgesi bölümü
- `mobile-app/src/components/composite/EquivalenceDocumentStatus.tsx` - Durum komponenti
- Yeniden yükleme ekranı

**4.3 API Integration**
- `mobile-app/src/services/api/doctor.ts` - API fonksiyonları ekle
- `mobile-app/src/hooks/useDoctorProfile.ts` - Hooks güncelle

**Test:**
```bash
# Kayıt akışı (iOS/Android)
1. Kayıt ekranında "Diğer Ülke" seç
2. Ülke adı gir
3. "Belge Yükle" butonuna bas
4. Dosya seç (PDF/JPG/PNG)
5. Kayıt ol
6. Profil ekranında durumu gör

# Bildirim testi
1. Admin belgeyi onayla/reddet
2. Push notification al
3. Profil ekranında güncel durumu gör
```

---

### Faz 5: Business Rules & Notifications (Öncelik: Yüksek)

**5.1 Application Blocking**
- `Backend/src/services/doctorService.js` - createApplication kontrolü
- `Backend/src/services/mobile/mobileApplicationService.js` - createApplication kontrolü
- Frontend: Başvuru butonunu disable et (pending/rejected/null durumunda)
- Mobile: Başvuru butonunu disable et + uyarı göster

**5.2 Profile Completion**
- `Backend/src/services/doctorService.js` - getProfileCompletion güncelle
- `Backend/src/services/mobile/mobileDoctorService.js` - getProfileCompletion güncelle
- Denklik belgesi durumuna göre tamamlanma hesapla

**5.3 Notifications**
- Doktor kayıt olduğunda → Admin'e bildirim
- Doktor belge yüklediğinde → Admin'e bildirim
- Admin onayladığında → Doktor'a bildirim (web + mobile push)
- Admin reddeddiğinde → Doktor'a bildirim (web + mobile push)

**Test:**
```bash
# Başvuru engelleme testi
1. Yabancı doktor olarak kayıt ol
2. İş ilanına başvur (reddedilmeli)
3. Admin belgeyi onayla
4. İş ilanına başvur (başarılı olmalı)

# Bildirim testi
1. Yabancı doktor kayıt ol → Admin bildirim alsın
2. Admin belgeyi onayla → Doktor bildirim alsın
3. Admin belgeyi reddet → Doktor bildirim alsın
```

---

### Faz 6: Test & Deploy (Öncelik: Yüksek)

**6.1 Unit Tests**
```javascript
// Backend/tests/services/doctorService.test.js
describe('Equivalence Document', () => {
  it('should block application if document not approved', async () => {
    // Test implementation
  });
  
  it('should allow application if document approved', async () => {
    // Test implementation
  });
  
  it('should calculate profile completion correctly for foreign doctors', async () => {
    // Test implementation
  });
});

// Backend/tests/services/adminService.test.js
describe('Admin Equivalence Document Review', () => {
  it('should approve document and send notification', async () => {
    // Test implementation
  });
  
  it('should reject document with notes', async () => {
    // Test implementation
  });
});
```

**6.2 Integration Tests**
```javascript
// Backend/tests/integration/equivalenceDocument.test.js
describe('Equivalence Document Flow', () => {
  it('should complete full flow: register → upload → review → apply', async () => {
    // 1. Register foreign doctor
    // 2. Upload equivalence document
    // 3. Admin review (approve)
    // 4. Apply to job (should succeed)
  });
  
  it('should block application if document rejected', async () => {
    // 1. Register foreign doctor
    // 2. Upload equivalence document
    // 3. Admin review (reject)
    // 4. Apply to job (should fail)
  });
});
```

**6.3 E2E Tests**
```javascript
// frontend/cypress/e2e/equivalenceDocument.cy.js
describe('Foreign Doctor Registration', () => {
  it('should register with equivalence document', () => {
    cy.visit('/register');
    cy.get('[data-testid="nationality-select"]').select('Diğer Ülke');
    cy.get('[data-testid="nationality-input"]').type('Suriye');
    cy.get('[data-testid="document-upload"]').attachFile('equivalence.pdf');
    cy.get('[data-testid="register-button"]').click();
    cy.url().should('include', '/profile');
    cy.contains('İnceleniyor').should('be.visible');
  });
});

// mobile-app/e2e/equivalenceDocument.e2e.js
describe('Foreign Doctor Registration (Mobile)', () => {
  it('should register with equivalence document', async () => {
    // Test implementation with Detox
  });
});
```

**6.4 Manual Testing Checklist**
- [ ] Türk doktor kaydı (normal akış)
- [ ] Yabancı doktor kaydı (belge yükleme)
- [ ] Belge durumu görüntüleme (pending/approved/rejected)
- [ ] Admin belge onaylama
- [ ] Admin belge reddetme
- [ ] Başvuru engelleme (pending/rejected/null)
- [ ] Başvuru izin verme (approved)
- [ ] Profil tamamlama hesaplama
- [ ] Bildirimler (web + mobile)
- [ ] Yeniden belge yükleme (rejected durumunda)
- [ ] Mevcut doktorların geriye dönük uyumluluğu

**6.5 Deployment**
```bash
# 1. Database migration
npm run migrate:up

# 2. Backend deploy
npm run build
pm2 restart backend

# 3. Frontend deploy
npm run build
# Upload to hosting

# 4. Mobile app deploy
# iOS: TestFlight → App Store
# Android: Internal Testing → Production
```

---

## 📊 ETKİ ANALİZİ

### Etkilenen Sistemler

#### 1. Authentication System
- **Kayıt Akışı**: Yabancı doktor kaydında denklik belgesi zorunlu
- **Validation**: Yeni alanlar için validation şemaları
- **Database**: doctor_profiles tablosuna yeni kolonlar

#### 2. Profile System
- **Profil Tamamlama**: Denklik belgesi durumu hesaplamaya dahil
- **Profil Görüntüleme**: Yeni alanlar gösterilmeli
- **Profil Güncelleme**: Uyruk değişikliği ve belge yükleme

#### 3. Application System
- **Başvuru Oluşturma**: Denklik belgesi kontrolü eklenmeli
- **Başvuru Listeleme**: Etkilenmez
- **Başvuru Detay**: Etkilenmez

#### 4. Admin System
- **Yeni Sayfa**: Denklik belgeleri yönetimi
- **Dashboard**: Bekleyen belge sayısı gösterilmeli
- **Bildirimler**: Yeni doktor kaydı bildirimi

#### 5. Notification System
- **Yeni Bildirimler**: Belge yükleme, onay, red
- **Push Notifications**: Mobile için push notification

#### 6. Reporting System (Opsiyonel)
- **İstatistikler**: Yabancı doktor sayısı, ülkelere göre dağılım
- **Raporlar**: Denklik belgesi onay/red oranları

### Etkilenmeyen Sistemler

- **Job System**: İş ilanı CRUD işlemleri etkilenmez
- **Hospital System**: Hastane profil ve işlemleri etkilenmez
- **Search System**: Arama ve filtreleme etkilenmez
- **Payment System**: Ödeme sistemi etkilenmez (varsa)

---

## 🔒 GÜVENLİK KONTROLLERI

### 1. Dosya Yükleme Güvenliği

```javascript
// Backend/src/middleware/uploadMiddleware.js

const validateEquivalenceDocument = (file) => {
  // Dosya tipi kontrolü
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  if (!allowedTypes.includes(file.mimetype)) {
    throw new AppError('Sadece PDF, JPG ve PNG dosyaları yüklenebilir', 400);
  }
  
  // Dosya boyutu kontrolü (5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new AppError('Dosya boyutu 5MB\'dan küçük olmalıdır', 400);
  }
  
  // Dosya içeriği kontrolü (magic bytes)
  const buffer = file.buffer;
  const isPDF = buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46;
  const isJPEG = buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF;
  const isPNG = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47;
  
  if (!isPDF && !isJPEG && !isPNG) {
    throw new AppError('Geçersiz dosya formatı', 400);
  }
  
  return true;
};
```

### 2. Authorization Kontrolleri

```javascript
// Sadece doktor kendi belgesini yükleyebilir
if (req.user.role !== 'doctor') {
  throw new AppError('Bu işlem için yetkiniz yok', 403);
}

// Sadece admin belgeleri inceleyebilir
if (req.user.role !== 'admin') {
  throw new AppError('Bu işlem için yetkiniz yok', 403);
}
```

### 3. Rate Limiting

```javascript
// Backend/src/middleware/rateLimitMiddleware.js

// Belge yükleme için rate limit (5 yükleme / saat)
const equivalenceDocumentUploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 saat
  max: 5,
  message: 'Çok fazla belge yükleme denemesi. Lütfen 1 saat sonra tekrar deneyin.'
});
```

### 4. SQL Injection Prevention

```javascript
// Knex query builder kullanılıyor (parametreli sorgular)
await db('doctor_profiles')
  .where('user_id', userId) // Güvenli
  .update({ equivalence_document: document });

// RAW query kullanılmamalı
// await db.raw(`UPDATE doctor_profiles SET equivalence_document = '${document}'`); // UNSAFE!
```

---

## 📈 PERFORMANS OPTİMİZASYONU

### 1. Database Index'ler

```sql
-- Sık kullanılan sorgular için index'ler
CREATE INDEX idx_doctor_profiles_is_foreign ON doctor_profiles(is_foreign);
CREATE INDEX idx_doctor_profiles_equivalence_status ON doctor_profiles(equivalence_document_status);

-- Composite index (admin pending list için)
CREATE INDEX idx_doctor_profiles_foreign_pending 
ON doctor_profiles(is_foreign, equivalence_document_status)
WHERE is_foreign = 1 AND equivalence_document_status = 'pending';
```

### 2. Query Optimization

```javascript
// Kötü: N+1 problem
const doctors = await db('doctor_profiles').where('is_foreign', true);
for (const doctor of doctors) {
  const user = await db('users').where('id', doctor.user_id).first();
  // ...
}

// İyi: JOIN ile tek sorguda
const doctors = await db('doctor_profiles as dp')
  .join('users as u', 'dp.user_id', 'u.id')
  .where('dp.is_foreign', true)
  .select('dp.*', 'u.email', 'u.is_active');
```

### 3. Caching Strategy

```javascript
// Frontend: React Query cache
export const useEquivalenceDocumentStatus = () => {
  return useQuery({
    queryKey: ['equivalence-document-status'],
    queryFn: () => apiClient.getEquivalenceDocumentStatus(),
    staleTime: 5 * 60 * 1000, // 5 dakika
    cacheTime: 10 * 60 * 1000 // 10 dakika
  });
};

// Backend: Redis cache (opsiyonel)
const cachedStats = await redis.get('equivalence:stats');
if (cachedStats) return JSON.parse(cachedStats);

const stats = await getEquivalenceDocumentStatistics();
await redis.setex('equivalence:stats', 300, JSON.stringify(stats)); // 5 dakika
```

### 4. File Storage Optimization

```javascript
// Base64 yerine dosya sistemi kullanımı (opsiyonel)
// Avantaj: Database boyutu küçülür
// Dezavantaj: Dosya yönetimi gerekir

const uploadToFileSystem = async (base64Data, doctorProfileId) => {
  const buffer = Buffer.from(base64Data.split(',')[1], 'base64');
  const filename = `equivalence_${doctorProfileId}_${Date.now()}.pdf`;
  const filepath = path.join(__dirname, '../../uploads/equivalence', filename);
  
  await fs.promises.writeFile(filepath, buffer);
  return `/uploads/equivalence/${filename}`;
};
```

---

## 🐛 HATA SENARYOLARI VE ÇÖZÜMLER

### Senaryo 1: Belge Yüklenirken Hata

**Problem**: Dosya çok büyük veya format hatalı

**Çözüm**:
```javascript
try {
  await uploadEquivalenceDocument(data);
} catch (error) {
  if (error.message.includes('5MB')) {
    showToast('Dosya boyutu 5MB\'dan küçük olmalıdır', 'error');
  } else if (error.message.includes('format')) {
    showToast('Sadece PDF, JPG ve PNG dosyaları yüklenebilir', 'error');
  } else {
    showToast('Belge yüklenirken hata oluştu', 'error');
  }
}
```

### Senaryo 2: Admin Belgeyi Görüntüleyemiyor

**Problem**: Base64 string bozuk veya eksik

**Çözüm**:
```javascript
const viewDocument = (base64String) => {
  try {
    // Base64 format kontrolü
    if (!base64String.startsWith('data:')) {
      throw new Error('Geçersiz belge formatı');
    }
    
    // Yeni sekmede aç
    const win = window.open();
    win.document.write(`<iframe src="${base64String}" width="100%" height="100%"></iframe>`);
  } catch (error) {
    showToast('Belge görüntülenirken hata oluştu', 'error');
  }
};
```

### Senaryo 3: Başvuru Yapılamıyor

**Problem**: Denklik belgesi onaylanmış ama başvuru reddediliyor

**Çözüm**:
```javascript
// Backend kontrolü
const profile = await db('doctor_profiles').where('user_id', userId).first();

logger.info('Application check', {
  userId,
  is_foreign: profile.is_foreign,
  equivalence_status: profile.equivalence_document_status
});

if (profile.is_foreign && profile.equivalence_document_status !== 'approved') {
  throw new AppError('Denklik belgeniz onaylanmadan başvuru yapamazsınız', 403);
}
```

### Senaryo 4: Bildirim Gönderilmiyor

**Problem**: Notification service hatası

**Çözüm**:
```javascript
// Bildirim hatası işlemi engellemez (try-catch)
try {
  await notificationService.sendNotification({...});
} catch (notificationError) {
  logger.warn('Notification failed (non-critical):', notificationError);
  // İşlem devam eder
}
```

---

## 📝 NOTLAR VE ÖNERILER

### 1. Ülke Listesi Yönetimi

**Seçenek A: Hardcoded Liste**
```javascript
const COUNTRIES = [
  'Türkiye',
  'Suriye',
  'Irak',
  'İran',
  'Afganistan',
  // ...
];
```

**Seçenek B: Database Tablosu** (Önerilen)
```sql
CREATE TABLE countries (
  id INT PRIMARY KEY IDENTITY(1,1),
  name NVARCHAR(100) NOT NULL,
  code NVARCHAR(3) NOT NULL,
  is_active BIT DEFAULT 1
);
```

### 2. Belge Saklama Stratejisi

**Seçenek A: Base64 in Database** (Mevcut)
- Avantaj: Basit, backup kolay
- Dezavantaj: Database boyutu büyür

**Seçenek B: File System**
- Avantaj: Database küçük kalır
- Dezavantaj: Dosya yönetimi gerekir

**Seçenek C: Cloud Storage** (S3, Azure Blob)
- Avantaj: Ölçeklenebilir, CDN desteği
- Dezavantaj: Maliyet, karmaşıklık

### 3. Belge Geçerlilik Süresi

**Opsiyonel Özellik**: Denklik belgelerinin geçerlilik süresi
```sql
ALTER TABLE doctor_profiles
ADD equivalence_document_expiry_date DATE NULL;

-- Süresi dolmuş belgeleri kontrol et
SELECT * FROM doctor_profiles
WHERE is_foreign = 1
AND equivalence_document_status = 'approved'
AND equivalence_document_expiry_date < GETDATE();
```

### 4. Çoklu Belge Desteği

**Gelecek Geliştirme**: Birden fazla belge yükleme
```sql
CREATE TABLE doctor_equivalence_documents (
  id INT PRIMARY KEY IDENTITY(1,1),
  doctor_profile_id INT NOT NULL,
  document NVARCHAR(MAX) NOT NULL,
  document_type NVARCHAR(50) NOT NULL, -- 'equivalence', 'diploma', 'transcript'
  status NVARCHAR(20) NOT NULL,
  uploaded_at DATETIME2 DEFAULT GETDATE(),
  FOREIGN KEY (doctor_profile_id) REFERENCES doctor_profiles(id)
);
```

---

## ✅ TAMAMLANMA KONTROL LİSTESİ

### Database
- [ ] Migration dosyası oluşturuldu
- [ ] Kolonlar eklendi
- [ ] Index'ler oluşturuldu
- [ ] Foreign key eklendi
- [ ] Mevcut kayıtlar güncellendi

### Backend
- [ ] Validation şemaları güncellendi
- [ ] authService.registerDoctor güncellendi
- [ ] doctorService fonksiyonları eklendi
- [ ] adminService fonksiyonları eklendi
- [ ] mobileAuthService güncellendi
- [ ] mobileDoctorService güncellendi
- [ ] Routes eklendi
- [ ] Controllers eklendi
- [ ] Başvuru kontrolü eklendi
- [ ] Profil tamamlama güncellendi

### Frontend Web
- [ ] Kayıt sayfası güncellendi
- [ ] Profil sayfası güncellendi
- [ ] EquivalenceDocumentStatus komponenti oluşturuldu
- [ ] Admin denklik belgeleri sayfası oluşturuldu
- [ ] API hooks eklendi
- [ ] Navigation güncellendi

### Mobile App
- [ ] Kayıt ekranı güncellendi
- [ ] Profil ekranı güncellendi
- [ ] EquivalenceDocumentStatus komponenti oluşturuldu
- [ ] Belge yükleme fonksiyonu eklendi
- [ ] API fonksiyonları eklendi

### Testing
- [ ] Unit testler yazıldı
- [ ] Integration testler yazıldı
- [ ] E2E testler yazıldı
- [ ] Manuel test checklist tamamlandı

### Deployment
- [ ] Database migration çalıştırıldı
- [ ] Backend deploy edildi
- [ ] Frontend deploy edildi
- [ ] Mobile app deploy edildi
- [ ] Production test edildi

---

## 📞 DESTEK VE DOKÜMANTASYON

### İlgili Dosyalar
- Database: `migrations/YYYYMMDD_add_equivalence_document_fields.sql`
- Backend: `Backend/src/services/doctorService.js`, `Backend/src/services/adminService.js`
- Frontend: `frontend/src/features/doctor/pages/ProfilePage.jsx`, `frontend/src/features/admin/pages/EquivalenceDocumentsPage.jsx`
- Mobile: `mobile-app/src/features/auth/screens/RegisterScreen.tsx`, `mobile-app/src/features/profile/screens/ProfileScreen.tsx`

### API Endpoints
```
# Doctor
POST   /api/doctor/profile/equivalence-document
GET    /api/doctor/profile/equivalence-document/status
DELETE /api/doctor/profile/equivalence-document

# Admin
GET    /api/admin/equivalence-documents/pending
GET    /api/admin/equivalence-documents/:doctorProfileId
PATCH  /api/admin/equivalence-documents/:doctorProfileId/review
GET    /api/admin/equivalence-documents/statistics

# Mobile
POST   /api/mobile/doctor/profile/equivalence-document
GET    /api/mobile/doctor/profile/equivalence-document/status
```

### Sık Sorulan Sorular

**S: Mevcut doktorlar ne olacak?**
C: Otomatik olarak `nationality = 'Türkiye'`, `is_foreign = false` olarak ayarlanacak. Profilleri etkilenmeyecek.

**S: Yabancı doktor başvuru yapabilir mi?**
C: Sadece denklik belgesi onaylandıktan sonra başvuru yapabilir.

**S: Belge boyutu limiti nedir?**
C: Maksimum 5MB (PDF, JPG, PNG formatlarında).

**S: Admin belgeyi nasıl görüntüler?**
C: Admin panelde "Denklik Belgeleri" sayfasından "Görüntüle" butonuna tıklayarak.

**S: Belge reddedilirse ne olur?**
C: Doktor yeni belge yükleyebilir. Başvuru yapamaz.

---

**Son Güncelleme**: 2024
**Versiyon**: 1.0.0
**Hazırlayan**: MediKariyer Development Team
