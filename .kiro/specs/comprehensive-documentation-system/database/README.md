# Dokümantasyon Sistemi Veritabanı Şeması

Bu klasör, MediKariyer Kapsamlı Dokümantasyon Sistemi için tasarlanan SQL Server veritabanı şemasını içerir.

## Dosya Yapısı

### 📋 Tasarım Dokümantasyonu
- **`er-diagram.md`** - Entity-Relationship diyagramı ve tablo ilişkileri
- **`README.md`** - Bu dosya, genel bakış ve kullanım kılavuzu

### 🗃️ Tablo Tanımları
- **`user-roles-permissions.sql`** - Kullanıcı rolleri ve yetkileri tabloları
- **`documentation-tables.sql`** - Dokümantasyon içerik tabloları
- **`components-dependencies.sql`** - Bileşen ve bağımlılık tabloları
- **`impact-analysis.sql`** - Etki analizi ve değişiklik takibi tabloları
- **`user-flows.sql`** - Kullanıcı akışları ve ekran geçişleri tabloları

### 🚀 Kurulum ve Optimizasyon
- **`migration-scripts.sql`** - Aşamalı migration scriptleri
- **`indexes-and-constraints.sql`** - Performans indeksleri ve veri bütünlüğü kısıtlamaları
- **`seed-data.sql`** - Başlangıç verileri (roller, izinler, örnek veriler)

## Kurulum Sırası

Veritabanı kurulumu için aşağıdaki sırayı takip edin:

```sql
-- 1. Migration scriptlerini çalıştır (otomatik tablo oluşturma)
EXEC sp_executesql @sql = 'migration-scripts.sql'

-- 2. İndeksler ve kısıtlamaları ekle
EXEC sp_executesql @sql = 'indexes-and-constraints.sql'

-- 3. Başlangıç verilerini yükle
EXEC sp_executesql @sql = 'seed-data.sql'
```

## Ana Tablo Grupları

### 1. 👥 Kullanıcı Yönetimi
- `documentation_roles` - Dokümantasyon rolleri
- `documentation_permissions` - İzin tanımları
- `role_permissions` - Rol-izin ilişkileri
- `user_documentation_roles` - Kullanıcı-rol atamaları

### 2. 📚 Dokümantasyon İçeriği
- `documentation_sections` - Hiyerarşik bölüm yapısı
- `documentation_content` - Ana içerik tablosu
- `documentation_versions` - Versiyon kontrolü
- `documentation_comments` - Yorum ve geri bildirimler

### 3. 🔧 Bileşen Yönetimi
- `components` - Sistem bileşenleri
- `component_dependencies` - Bileşen bağımlılıkları
- `component_interfaces` - Bileşen arayüzleri
- `component_tags` - Etiketleme sistemi

### 4. 📊 Etki Analizi
- `change_logs` - Değişiklik kayıtları
- `impact_analysis` - Etki analizi sonuçları
- `component_impacts` - Bileşen bazlı etkiler
- `risk_factors` - Risk faktörleri

### 5. 🔄 Kullanıcı Akışları
- `user_flows` - Kullanıcı yolculukları
- `flow_steps` - Akış adımları
- `screen_transitions` - Ekran geçişleri
- `flow_metrics` - Performans metrikleri

## Mevcut Sistem Entegrasyonu

Bu şema, mevcut MediKariyer sistemine uyumlu olarak tasarlanmıştır:

### ✅ Uyumlu Özellikler
- **Naming Convention**: snake_case tablo ve kolon isimleri
- **Foreign Keys**: Mevcut `users` tablosu ile entegrasyon
- **Audit Fields**: `created_at`, `updated_at`, `created_by` alanları
- **Soft Delete**: `is_deleted`, `deleted_at` pattern'i
- **SQL Server**: Native SQL Server veri tipleri ve özellikler

### 🔗 Entegrasyon Noktaları
- Tüm `created_by`, `updated_by` alanları → `users.id`
- Mevcut rol sistemi (`users.role`) ile mapping
- JWT token sistemi ile uyumlu yetkilendirme
- Mevcut audit log yapısı ile uyumlu

## Performans Optimizasyonu

### 📈 İndeks Stratejisi
- **Composite Indexes**: Sık kullanılan sorgu kombinasyonları için
- **Covering Indexes**: SELECT sorgularını optimize etmek için
- **Full-Text Search**: Dokümantasyon içerik arama için
- **Filtered Indexes**: Soft delete pattern'i için optimize edilmiş

### 🎯 Sorgu Optimizasyonu
- Partition-friendly tasarım (tarih bazlı)
- Efficient JOIN patterns
- Minimal locking strategies
- Statistics auto-update

## Güvenlik Özellikleri

### 🔒 Veri Güvenliği
- Row-level security için hazır yapı
- Audit trail tüm değişiklikler için
- Sensitive data masking desteği
- Encryption-ready column design

### 🛡️ Erişim Kontrolü
- Granular permission system
- Role-based access control (RBAC)
- Conditional permissions
- Time-based access (expires_at)

## Bakım ve İzleme

### 📊 İstatistikler
- Auto-update statistics enabled
- Query performance insights
- Index usage monitoring
- Fragmentation tracking

### 🔧 Bakım Görevleri
```sql
-- İstatistik güncelleme
EXEC sp_updatestats;

-- İndeks yeniden düzenleme
ALTER INDEX ALL ON [table_name] REORGANIZE;

-- Full-text catalog yenileme
ALTER FULLTEXT CATALOG DocumentationCatalog REBUILD;
```

## Sık Kullanılan Sorgular

### 📋 Dokümantasyon Listesi
```sql
SELECT dc.title, ds.display_name as section, dc.created_at
FROM documentation_content dc
JOIN documentation_sections ds ON dc.section_id = ds.id
WHERE dc.is_published = 1 AND dc.is_deleted = 0
ORDER BY dc.created_at DESC;
```

### 🔍 Bileşen Bağımlılık Analizi
```sql
SELECT 
    c1.name as source_component,
    c2.name as target_component,
    cd.dependency_type,
    cd.is_critical
FROM component_dependencies cd
JOIN components c1 ON cd.source_component_id = c1.id
JOIN components c2 ON cd.target_component_id = c2.id
WHERE cd.is_deleted = 0;
```

### 📊 Etki Analizi Raporu
```sql
SELECT 
    cl.title as change_title,
    ia.risk_level,
    ia.affected_components_count,
    ia.confidence_score
FROM impact_analysis ia
JOIN change_logs cl ON ia.change_log_id = cl.id
WHERE ia.is_approved = 1
ORDER BY ia.analyzed_at DESC;
```

## Sorun Giderme

### ❗ Yaygın Sorunlar
1. **Foreign Key Hatası**: `users` tablosunun mevcut olduğundan emin olun
2. **Permission Denied**: SQL Server'da yeterli yetkiye sahip olduğunuzu kontrol edin
3. **Index Fragmentation**: Düzenli bakım scriptlerini çalıştırın
4. **Full-Text Search**: Catalog'un düzgün yapılandırıldığından emin olun

### 🔧 Çözüm Adımları
```sql
-- Tablo varlığını kontrol et
SELECT name FROM sys.tables WHERE name = 'users';

-- İndeks durumunu kontrol et
SELECT * FROM sys.dm_db_index_physical_stats(DB_ID(), NULL, NULL, NULL, 'DETAILED');

-- Full-text catalog durumu
SELECT * FROM sys.fulltext_catalogs;
```

## Destek ve İletişim

Bu veritabanı şeması hakkında sorularınız için:
- 📧 Geliştirici ekibi ile iletişime geçin
- 📋 GitHub Issues kullanın
- 📖 Dokümantasyon wiki'sini kontrol edin