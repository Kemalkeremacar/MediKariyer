# MediKariyer - Kapsamlı Proje Analizi ve İyileştirme Planı

> **Analiz Tarihi:** 18 Aralık 2024  
> **Son Güncelleme:** 18 Aralık 2024  
> **Analiz Kapsamı:** Backend (Node.js/Express) + Mobile App (React Native/TypeScript)  
> **Analiz Eden:** Senior Fullstack Yazılım Mimarı & React Native Uzmanı

---

## Değişiklik Geçmişi

| Tarih | Değişiklik | Durum |
|-------|------------|-------|
| 18.12.2024 | TD-001: JobsScreen useJobs hook entegrasyonu | ✅ Tamamlandı |
| 18.12.2024 | TD-002: ApplicationDetailModal ayrıldı (544 satır azalma) | ✅ Tamamlandı |
| 18.12.2024 | TD-003: Generic useCRUDMutation hook (4 CRUD hook basitleştirildi) | ✅ Tamamlandı |
| 18.12.2024 | TD-004: TypeScript any kullanımları düzeltildi (2 dosya) | ✅ Tamamlandı |
| 18.12.2024 | TD-005: Button prop tutarsızlığı düzeltildi (2 dosya) | ✅ Tamamlandı |
| 18.12.2024 | TD-006: Backend array indexing güvenliği | ✅ Tamamlandı |
| 18.12.2024 | TD-007: Console.log production cleanup (devLog/devError) | ✅ Tamamlandı |
| 18.12.2024 | TD-008: Magic numbers → constants | ✅ Tamamlandı |
| 18.12.2024 | TD-009: @ts-ignore temizliği (navigation typing) | ✅ Tamamlandı |
| 18.12.2024 | TD-010: Silinen dosya referansları kontrol edildi | ✅ Tamamlandı |
| 18.12.2024 | TD-011: i18n hazırlık - strings.ts oluşturuldu | ✅ Tamamlandı |
| 18.12.2024 | TD-012: Accessibility labels (Button component) | ✅ Tamamlandı |
| 18.12.2024 | TD-014: sharedStyles.ts oluşturuldu | ✅ Tamamlandı |
| 18.12.2024 | TD-015: React Query cache config standardizasyonu | ✅ Tamamlandı |

---

## İçindekiler

1. [Current Architecture Overview](#1-current-architecture-overview)
2. [Data Life Cycle](#2-data-life-cycle)
3. [Strengths & Weaknesses](#3-strengths--weaknesses)
4. [Technical Debt Inventory](#4-technical-debt-inventory)
5. [Refactoring & Improvement Roadmap](#5-refactoring--improvement-roadmap)

---

## 1. Current Architecture Overview

### 1.1 Backend Mimarisi (Node.js/Express)

```
Backend/
├── src/
│   ├── controllers/
│   │   ├── mobile/                    # Mobile API Controllers
│   │   │   ├── mobileJobController.js
│   │   │   ├── mobileAuthController.js
│   │   │   └── ...
│   │   └── [web controllers]
│   ├── services/
│   │   ├── mobile/                    # Mobile Business Logic
│   │   │   ├── mobileJobService.js
│   │   │   └── ...
│   │   └── [web services]
│   ├── mobile/
│   │   └── transformers/              # Data Transformers
│   │       ├── jobTransformer.js
│   │       ├── profileTransformer.js
│   │       └── ...
│   ├── middleware/
│   │   ├── authMiddleware.js          # JWT Authentication
│   │   ├── mobileErrorHandler.js      # Mobile-specific error handling
│   │   ├── validationMiddleware.js    # Request validation
│   │   └── ...
│   ├── utils/
│   │   ├── errorHandler.js            # Global error management
│   │   ├── response.js                # Standardized responses
│   │   └── ...
│   └── routes/
│       └── mobile/                    # Mobile API Routes
```

**Katmanlı Mimari Akışı:**
```
Request → Route → Middleware → Controller → Service → Database
                                    ↓
                              Transformer
                                    ↓
                            Response Utils → JSON Response
```

**Temel Özellikler:**
- **Layered Architecture:** Controller → Service → Repository pattern
- **Transformer Pattern:** DB verilerini mobile-optimized JSON'a dönüştürme
- **Centralized Error Handling:** `AppError` sınıfı + `globalErrorHandler`
- **catchAsync Wrapper:** Async/await hataları için otomatik catch

### 1.2 Mobile App Mimarisi (React Native)

```
mobile-app/
├── src/
│   ├── api/
│   │   ├── client.ts                  # Axios instance + interceptors
│   │   ├── endpoints.ts               # API endpoint definitions
│   │   └── services/                  # API service functions
│   │       ├── job.service.ts
│   │       ├── profile.service.ts
│   │       └── ...
│   ├── features/                      # Feature-based modules
│   │   ├── auth/
│   │   │   ├── hooks/
│   │   │   └── screens/
│   │   ├── jobs/
│   │   │   ├── hooks/
│   │   │   └── screens/
│   │   ├── applications/
│   │   ├── profile/
│   │   └── settings/
│   ├── components/
│   │   ├── ui/                        # Atomic components (Button, Input, etc.)
│   │   ├── composite/                 # Complex components (JobCard, etc.)
│   │   ├── feedback/                  # Loading, Error states
│   │   └── layout/                    # Screen wrapper
│   ├── navigation/
│   │   ├── RootNavigator.tsx          # Auth/App routing
│   │   ├── TabNavigator.tsx           # Bottom tabs
│   │   └── [Stack navigators]
│   ├── store/
│   │   └── authStore.ts               # Zustand auth state
│   ├── types/                         # TypeScript interfaces
│   └── utils/                         # Helper functions
```

**State Management:**
- **Server State:** TanStack Query (React Query)
- **Client State:** Zustand (only for auth)
- **Navigation State:** React Navigation

**Navigation Yapısı:**
```
RootNavigator
├── AuthNavigator (unauthenticated)
│   ├── LoginScreen
│   ├── RegisterScreen
│   └── PendingApprovalScreen
└── AppNavigator (authenticated)
    └── TabNavigator
        ├── ProfileTab → ProfileStackNavigator
        ├── JobsTab → JobsStackNavigator
        ├── Applications (direct screen)
        └── SettingsTab → SettingsStackNavigator
```

---

## 2. Data Life Cycle

### 2.1 End-to-End Data Flow: İş İlanları Örneği

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           MOBILE APP                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  JobsScreen.tsx                                                          │
│       │                                                                  │
│       ▼                                                                  │
│  useInfiniteQuery({                                                      │
│    queryKey: ['jobs', filters],                                          │
│    queryFn: () => jobService.listJobs(params)                           │
│  })                                                                      │
│       │                                                                  │
│       ▼                                                                  │
│  job.service.ts                                                          │
│  ─────────────────                                                       │
│  apiClient.get<ApiResponse<JobListItem[]>>(endpoints.jobs.list)         │
│       │                                                                  │
│       ▼                                                                  │
│  client.ts (Axios Interceptor)                                           │
│  ────────────────────────────                                            │
│  - Token ekleme (Authorization header)                                   │
│  - Token refresh kontrolü                                                │
│  - Error transformation                                                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP GET /api/mobile/jobs?page=1&limit=10
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            BACKEND                                       │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  mobileJobRoutes.js                                                      │
│       │                                                                  │
│       ▼                                                                  │
│  authMiddleware.js (JWT verification)                                    │
│       │                                                                  │
│       ▼                                                                  │
│  mobileJobController.js                                                  │
│  ──────────────────────                                                  │
│  const result = await mobileJobService.listJobs(req.user.id, options)   │
│       │                                                                  │
│       ▼                                                                  │
│  mobileJobService.js                                                     │
│  ───────────────────                                                     │
│  - buildJobsBaseQuery() → Knex query builder                            │
│  - Filter application (city_id, specialty_id, keyword)                   │
│  - Pagination (LIMIT, OFFSET)                                            │
│  - Application check (is_applied)                                        │
│       │                                                                  │
│       ▼                                                                  │
│  jobTransformer.js                                                       │
│  ─────────────────                                                       │
│  toListItem(row) → {                                                     │
│    id, title, city_name, specialty, salary_range,                        │
│    work_type, is_applied, hospital_name                                  │
│  }                                                                       │
│       │                                                                  │
│       ▼                                                                  │
│  response.js → sendPaginated()                                           │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP 200 OK
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          RESPONSE FORMAT                                 │
├─────────────────────────────────────────────────────────────────────────┤
│  {                                                                       │
│    "success": true,                                                      │
│    "message": "İlanlar listelendi",                                      │
│    "data": [                                                             │
│      {                                                                   │
│        "id": 1,                                                          │
│        "title": "Dahiliye Uzmanı",                                       │
│        "city_name": "İstanbul",                                          │
│        "specialty": "Dahiliye",                                          │
│        "salary_range": "50.000 - 80.000 TRY",                           │
│        "work_type": "Tam Zamanlı",                                       │
│        "is_applied": false,                                              │
│        "hospital_name": "Özel Hastane A"                                 │
│      }                                                                   │
│    ],                                                                    │
│    "pagination": {                                                       │
│      "current_page": 1,                                                  │
│      "per_page": 10,                                                     │
│      "total": 47,                                                        │
│      "total_pages": 5,                                                   │
│      "has_next": true,                                                   │
│      "has_prev": false                                                   │
│    },                                                                    │
│    "timestamp": "2024-12-18T10:30:00.000Z"                               │
│  }                                                                       │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 TypeScript Interface Mapping

**Backend Transformer → Mobile Interface:**

| Backend (jobTransformer.js) | Mobile (job.ts) | Eşleşme |
|---|---|---|
| `id` | `id: number` | ✅ |
| `title` | `title: string \| null` | ✅ |
| `city_name \|\| city` | `city_name: string \| null` | ✅ |
| `specialty_name \|\| specialty` | `specialty: string \| null` | ✅ |
| `salary_range` | `salary_range: string \| null` | ✅ |
| `work_type \|\| employment_type` | `work_type: string \| null` | ✅ |
| `is_applied` | `is_applied: boolean` | ✅ |
| `hospital_name` | `hospital_name: string \| null` | ✅ |

### 2.3 React Query Cache Mekanizması

```typescript
// Cache key hierarchy
['jobs']                           // Base key
['jobs', { city_id: 1 }]          // With filters
['jobs', { city_id: 1, page: 2 }] // Pagination included in infinite query

// Cache invalidation on apply
queryClient.invalidateQueries({ queryKey: ['jobs'] });
queryClient.invalidateQueries({ queryKey: ['jobDetail', jobId] });
```

**Cache Configuration:**
- `staleTime: 5 * 60 * 1000` (5 dakika) - Veri "taze" kabul ediliyor
- `gcTime: 10 * 60 * 1000` (10 dakika) - Kullanılmayan cache temizleniyor

---

## 3. Strengths & Weaknesses

### 3.1 Güçlü Yönler (Strengths)

#### Backend
| # | Güçlü Yön | Detay |
|---|---|---|
| 1 | **Tutarlı Response Format** | `sendSuccess`, `sendPaginated`, `sendError` - Tüm API'ler aynı format |
| 2 | **Transformer Pattern** | DB model → API response dönüşümü izole edilmiş |
| 3 | **Centralized Error Handling** | `AppError` class + `catchAsync` wrapper + `globalErrorHandler` |
| 4 | **Mobile-Specific Error Handler** | `mobileErrorHandler.js` - HTML yerine her zaman JSON döner |
| 5 | **Detaylı JSDoc** | Tüm servisler ve controller'lar belgelenmiş |
| 6 | **Soft Delete Pattern** | `deleted_at` ile veri korunuyor |

#### Mobile App
| # | Güçlü Yön | Detay |
|---|---|---|
| 1 | **Feature-Based Architecture** | `/features/auth`, `/features/jobs` - İzole modüller |
| 2 | **React Query for Server State** | Caching, background refetch, optimistic updates |
| 3 | **Zustand for Client State** | Minimal, sadece auth için - over-engineering yok |
| 4 | **Token Refresh Interceptor** | Otomatik refresh, queue mekanizması |
| 5 | **Reusable UI Components** | `Skeleton`, `LoadingSpinner`, `ErrorState`, `Screen` |
| 6 | **TypeScript Strict Mode** | Type safety across the codebase |
| 7 | **Haptic Feedback** | Tab navigation'da haptic feedback |

### 3.2 Zayıf Yönler (Weaknesses)

#### Backend
| # | Zayıf Yön | Etki | Dosya |
|---|---|---|---|
| 1 | Array indexing without null check | Potential runtime error | `mobileJobService.js:189` |
| 2 | Hardcoded status values | Maintenance difficulty | `status_id = 3` |
| 3 | No request rate limiting per user | Security risk | Global only |

#### Mobile App
| # | Zayıf Yön | Etki | Dosya |
|---|---|---|---|
| 1 | Large screen components | Hard to maintain | `ApplicationsScreen.tsx` (920+ lines) |
| 2 | Duplicated query logic | DRY violation | `JobsScreen` vs `useJobs` |
| 3 | Repetitive CRUD hooks | Code bloat | `useProfile.ts` |
| 4 | `any` type usage | Type safety loss | Multiple files |
| 5 | Console.logs in production | Performance/Security | `client.ts` |
| 6 | No i18n support | Limited to Turkish | All screens |

---

## 4. Technical Debt Inventory

### 4.1 Kritik Seviye (P0 - Immediate)

#### TD-001: DRY İhlali - useJobs Hook Duplikasyonu ✅ TAMAMLANDI (18.12.2024)
- **Dosyalar:** `mobile-app/src/features/jobs/hooks/useJobs.ts`, `mobile-app/src/features/jobs/screens/JobsScreen.tsx`
- **Sorun:** ~~`useJobs.ts` hook'u mevcut ama `JobsScreen.tsx` kendi `useInfiniteQuery` tanımını yapıyor~~
- **Etki:** ~~Kod tekrarı, bakım zorluğu, tutarsızlık riski~~
- **Çözüm:** ~~JobsScreen'de mevcut useJobs hook'unu kullan~~

**Yapılan Değişiklikler:**
- `useInfiniteQuery` ve `jobService` import'ları kaldırıldı
- `useJobs` hook'u import edildi
- ~17 satırlık inline query tanımı → 6 satırlık hook çağrısına indirildi
- Cache tutarlılığı sağlandı (hook'un staleTime/gcTime ayarları kullanılıyor)

```typescript
// JobsScreen.tsx - ESKİ (Refactor öncesi)
const { data, isLoading, ... } = useInfiniteQuery({
  queryKey: ['jobs', debouncedSearchQuery, filters],
  queryFn: ({ pageParam = 1 }) => jobService.listJobs({...}),
  // ... configuration
});

// JobsScreen.tsx - YENİ (Refactor sonrası)
const { data, isLoading, ... } = useJobs({
  keyword: debouncedSearchQuery,
  ...filters
}, true);
```

#### TD-002: Büyük Bileşen - ApplicationsScreen ✅ TAMAMLANDI (18.12.2024)
- **Dosya:** `mobile-app/src/features/applications/screens/ApplicationsScreen.tsx`
- **Sorun:** ~~920+ satır, `DetailsModal` component'i aynı dosyada~~
- **Etki:** ~~Test edilemezlik, bakım zorluğu~~
- **Çözüm:** ~~`ApplicationDetailModal.tsx` olarak ayır~~

**Yapılan Değişiklikler:**
- `ApplicationDetailModal.tsx` bileşeni oluşturuldu (~380 satır)
- `ApplicationsScreen.tsx` 921 satırdan 377 satıra düşürüldü (~544 satır azalma)
- Import'lar ve gereksiz stiller temizlendi
- Modüler ve test edilebilir yapı sağlandı

```
features/applications/
├── components/
│   └── ApplicationDetailModal.tsx  # ✅ OLUŞTURULDU
├── hooks/
└── screens/
    └── ApplicationsScreen.tsx      # ~500 satıra düşer
```

#### TD-003: Tekrar Eden CRUD Hook Pattern ✅ TAMAMLANDI (18.12.2024)
- **Dosya:** `mobile-app/src/features/profile/hooks/useProfile.ts`
- **Sorun:** ~~`useEducation`, `useExperience`, `useCertificate`, `useLanguage` neredeyse aynı~~
- **Etki:** ~~300+ satır tekrar eden kod~~
- **Çözüm:** ~~Generic `useCRUDMutation` hook oluştur~~

**Yapılan Değişiklikler:**
- `useCRUDMutation.ts` generic hook oluşturuldu (107 satır)
- 4 CRUD hook basitleştirildi (~48 satır → ~12 satır her biri)
- `useProfile.ts` 374 satırdan 240 satıra düşürüldü
- TypeScript generics ile tam tip güvenliği sağlandı
- Yeni hook `src/hooks/useCRUDMutation.ts` konumunda

```typescript
// Generic CRUD Hook - YENİ
function useCRUDMutation<TCreate, TUpdate, TItem>(
  config: CRUDConfig<TCreate, TUpdate, TItem>
): CRUDMutationResult<TCreate, TUpdate, TItem>

// Kullanım - REFACTOR SONRASI
const educationMutation = useCRUDMutation('Eğitim', profileService.education, ['profile', 'educations']);
```

### 4.2 Orta Seviye (P1 - Planned)

#### TD-004: TypeScript `any` Kullanımı ✅ TAMAMLANDI (18.12.2024)
| Dosya | Satır | Eski | Yeni |
|---|---|---|---|
| `Screen.tsx` | 107 | ~~`theme: any`~~ | `theme: Theme` |
| `JobDetailScreen.tsx` | 59 | ~~`error: any`~~ | `error: Error` |

**Yapılan Değişiklikler:**
- `Screen.tsx`: `Theme` tipi `@/theme`'den import edildi
- `JobDetailScreen.tsx`: Standart `Error` tipi kullanıldı
- Tip güvenliği sağlandı

#### TD-005: Button Prop Tutarsızlığı ✅ TAMAMLANDI (18.12.2024)
- **Sorun:** ~~`ErrorState.tsx` ve `Screen.tsx` Button'a children olarak text veriyor~~
- **Dosyalar:** `components/feedback/ErrorState.tsx`, `components/layout/Screen.tsx`

**Yapılan Değişiklikler:**
- `ErrorState.tsx`: `<Button>{retryText}</Button>` → `<Button label={retryText} />`
- `Screen.tsx`: `<Button>Tekrar Dene</Button>` → `<Button label="Tekrar Dene" />`
- Tutarlı API kullanımı sağlandı

```typescript
// Yanlış kullanım
<Button onPress={onRetry}>Tekrar Dene</Button>

// Doğru kullanım
<Button label="Tekrar Dene" onPress={onRetry} />
```

#### TD-006: Backend Array Indexing
- **Dosya:** `Backend/src/services/mobile/mobileJobService.js:189`
- **Kod:** `const job = jobs[0];`
- **Risk:** `jobs` boş array ise undefined error

```javascript
// Mevcut
const job = jobs[0];

// İyileştirilmiş
const job = jobs[0];
if (!job) {
  throw new AppError('İlan bulunamadı', 404);
}
```

#### TD-007: Console.log Production'da
- **Dosya:** `mobile-app/src/api/client.ts`
- **Satırlar:** 32, 78, 84-85
- **Çözüm:** `__DEV__` kontrolü veya babel plugin ile strip

```typescript
// Mevcut
console.log('📤 API Request:', config.method, config.url);

// İyileştirilmiş
if (__DEV__) {
  console.log('📤 API Request:', config.method, config.url);
}
```

#### TD-008: Magic Numbers
| Değer | Lokasyon | Açıklama |
|---|---|---|
| `10` | `JobsScreen.tsx:55` | Pagination limit |
| `20` | `mobileJobService.js:53` | Default limit |
| `50` | `mobileJobService.js:53` | Max limit |
| `500` | `JobsScreen.tsx:39` | Debounce delay |

**Çözüm:** `constants.ts` dosyasında tanımla

```typescript
// mobile-app/src/config/constants.ts
export const PAGINATION = {
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 50,
};

export const DEBOUNCE = {
  SEARCH: 500,
};
```

#### TD-009: @ts-ignore Kullanımı
- **Dosya:** `JobsScreen.tsx:91-92`
- **Kod:** `// @ts-ignore - Navigation type issue`
- **Çözüm:** Proper navigation typing

```typescript
// Yanlış
// @ts-ignore
navigation.navigate('JobDetail', { id: item.id });

// Doğru
import { useNavigation } from '@react-navigation/native';
import type { JobsStackNavigationProp } from '@/navigation/types';

const navigation = useNavigation<JobsStackNavigationProp>();
navigation.navigate('JobDetail', { id: item.id });
```

#### TD-010: Silinen Dosyalara Referanslar
Git status'ta silinen ama olası referansları olan dosyalar:
- `BiometricSettingsScreen.tsx`
- `useBiometricAuth.ts`
- `useBiometricLogin.ts`
- `biometricAuth.ts`

**Kontrol edilmesi gereken:** Navigation types, SettingsScreen imports

### 4.3 Düşük Seviye (P2 - Future)

#### TD-011: Hardcoded Türkçe Stringler (i18n)
- **Etki:** Sadece Türkçe kullanıcılar için
- **Örnek dosyalar:** Tüm ekranlar
- **Çözüm:** `i18next` veya `react-intl` entegrasyonu

#### TD-012: Accessibility Eksiklikleri
- **Sorun:** `accessibilityLabel`, `accessibilityRole` eksik
- **Etki:** Screen reader kullanıcıları için kötü UX
- **Öncelikli:** Button, Input, Card components

#### TD-013: Test Coverage Eksikliği
- **Mevcut:** Test dosyası yok
- **Öneri:**
  - Unit tests: Services, Hooks, Utils
  - Integration tests: API calls
  - E2E tests: Critical flows (login, apply to job)

#### TD-014: Duplicate StyleSheet Tanımları
- **Dosyalar:** `ApplicationsScreen.tsx`, `JobsScreen.tsx`, `JobDetailScreen.tsx`
- **Tekrar eden:** `emptyState`, `footer`, `searchContainer` styles
- **Çözüm:** Shared styles dosyası

```typescript
// shared/styles/listStyles.ts
export const listStyles = StyleSheet.create({
  emptyState: {...},
  footer: {...},
  searchContainer: {...},
});
```

#### TD-015: React Query Cache Tutarsızlığı
| Hook | staleTime | gcTime |
|---|---|---|
| `useJobs` | 5 min | 10 min |
| `useJobDetail` | default | default |
| `useProfile` | default | default |
| `useLanguages` | 0 | default |

**Çözüm:** Merkezi cache configuration

#### TD-016: ErrorBoundary Yetersiz Kullanımı
- **Mevcut:** `ErrorBoundary.tsx` var ama sadece genel catch
- **Eksik:** Feature-level error boundaries
- **Öneri:** Her Stack Navigator için ayrı boundary

#### TD-017: Memoization Eksiklikleri
- **Dosyalar:** Liste ekranları
- **Sorun:** `renderItem` fonksiyonları her render'da yeniden oluşuyor
- **Çözüm:** `useCallback` ile wrap et (bazı yerlerde var, bazılarında yok)

### 4.4 Mimari İyileştirmeler

#### ARCH-001: Dual API Client
- **Mevcut:** `apiClient` + `rootApiClient`
- **Sorun:** İki ayrı base URL yönetimi karmaşık
- **Öneri:** Tek client + endpoint prefix'leri

#### ARCH-002: Profile Service Boyutu
- **Dosya:** `profile.service.ts` (400+ satır)
- **Öneri:** Domain'e göre split
  - `education.service.ts`
  - `experience.service.ts`
  - `certificate.service.ts`
  - `language.service.ts`
  - `photo.service.ts`

#### ARCH-003: Query Key Factory Pattern
- **Mevcut:** Hardcoded query keys
- **Öneri:**

```typescript
// queryKeys.ts
export const queryKeys = {
  jobs: {
    all: ['jobs'] as const,
    list: (filters: JobFilters) => [...queryKeys.jobs.all, filters] as const,
    detail: (id: number) => [...queryKeys.jobs.all, 'detail', id] as const,
  },
  profile: {
    all: ['profile'] as const,
    complete: () => [...queryKeys.profile.all, 'complete'] as const,
    educations: () => [...queryKeys.profile.all, 'educations'] as const,
  },
};
```

---

## 5. Refactoring & Improvement Roadmap

### Faz 1: Kritik Technical Debt (1-2 Hafta)

| Sıra | Task | Tahmini Süre | Dosyalar |
|---|---|---|---|
| 1.1 | JobsScreen useJobs hook entegrasyonu | 2 saat | `JobsScreen.tsx` |
| 1.2 | ApplicationDetailModal ayırma | 4 saat | `ApplicationsScreen.tsx` |
| 1.3 | Generic CRUD hook oluşturma | 6 saat | `useProfile.ts`, yeni hook |
| 1.4 | @ts-ignore kaldırma + navigation typing | 2 saat | `JobsScreen.tsx`, `types.ts` |

### Faz 2: Kod Kalitesi (1 Hafta)

| Sıra | Task | Tahmini Süre | Dosyalar |
|---|---|---|---|
| 2.1 | `any` type eliminasyonu | 3 saat | `Screen.tsx`, `JobDetailScreen.tsx` |
| 2.2 | Button prop standardizasyonu | 1 saat | `ErrorState.tsx`, `Screen.tsx` |
| 2.3 | Console.log cleanup | 1 saat | `client.ts` |
| 2.4 | Constants dosyası oluşturma | 2 saat | Yeni dosya + refactor |
| 2.5 | Biometric referansları temizleme | 1 saat | Navigation, imports |

### Faz 3: Performans & Optimizasyon (1 Hafta)

| Sıra | Task | Tahmini Süre | Dosyalar |
|---|---|---|---|
| 3.1 | React Query cache strategy | 3 saat | Tüm hooks |
| 3.2 | Query key factory pattern | 4 saat | Yeni dosya + tüm hooks |
| 3.3 | Memoization audit | 4 saat | Liste ekranları |
| 3.4 | Shared styles extraction | 3 saat | Yeni dosya + ekranlar |

### Faz 4: Mimari İyileştirmeler (2 Hafta)

| Sıra | Task | Tahmini Süre | Dosyalar |
|---|---|---|---|
| 4.1 | Profile service split | 6 saat | `profile.service.ts` → 5 dosya |
| 4.2 | API client consolidation | 4 saat | `client.ts`, `endpoints.ts` |
| 4.3 | Error boundary per feature | 4 saat | Navigation files |
| 4.4 | Backend null check audit | 4 saat | Service files |

### Faz 5: Gelecek (Opsiyonel)

| Sıra | Task | Öncelik |
|---|---|---|
| 5.1 | i18n entegrasyonu | Düşük |
| 5.2 | Accessibility audit | Orta |
| 5.3 | Test coverage | Yüksek |
| 5.4 | Performance monitoring | Orta |

---

## Appendix A: Dosya Referans Listesi

### Backend Kritik Dosyalar
- `Backend/src/controllers/mobile/mobileJobController.js`
- `Backend/src/services/mobile/mobileJobService.js`
- `Backend/src/mobile/transformers/jobTransformer.js`
- `Backend/src/utils/errorHandler.js`
- `Backend/src/utils/response.js`
- `Backend/src/middleware/mobileErrorHandler.js`

### Mobile App Kritik Dosyalar
- `mobile-app/src/api/client.ts`
- `mobile-app/src/api/services/job.service.ts`
- `mobile-app/src/api/services/profile.service.ts`
- `mobile-app/src/features/jobs/hooks/useJobs.ts`
- `mobile-app/src/features/jobs/screens/JobsScreen.tsx`
- `mobile-app/src/features/applications/screens/ApplicationsScreen.tsx`
- `mobile-app/src/features/profile/hooks/useProfile.ts`
- `mobile-app/src/navigation/RootNavigator.tsx`
- `mobile-app/src/store/authStore.ts`
- `mobile-app/src/utils/errorHandler.ts`

---

## Appendix B: Hata Akışı Diyagramı

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ERROR FLOW                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  BACKEND                                                             │
│  ────────                                                            │
│  1. Service throws AppError or Error                                 │
│  2. catchAsync catches → next(error)                                 │
│  3. mobileErrorBoundary catches                                      │ 
│  4. globalErrorHandler formats response                              │
│                                                                      │
│  Response:                                                           │
│  {                                                                   │
│    success: false,                                                   │
│    message: "User-friendly message",                                 │
│    error: "ERROR_CODE",                                              │
│    timestamp: "..."                                                  │
│  }                                                                   │
│                                                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  MOBILE APP                                                          │
│  ──────────                                                          │
│  1. Axios interceptor catches response error                         │
│  2. Extract backend message or create friendly message               │
│  3. errorLogger.logApiError() for debugging                          │
│  4. Reject with formatted Error                                      │
│                                                                      │
│  5. React Query catches in onError                                   │
│  6. handleApiError() shows toast                                     │
│  7. UI shows ErrorState component                                    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

> **Not:** Bu döküman, projenin mevcut durumunun bir snapshot'ıdır. İyileştirmeler yapıldıkça güncellenmelidir.
