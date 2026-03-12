-- ============================================================================
-- Başlangıç Verileri (Seed Data)
-- MediKariyer Dokümantasyon Sistemi
-- Sistem kurulumu için gerekli temel veriler
-- ============================================================================

-- Sistem admin kullanıcısını bul (varsayılan olarak id=1)
DECLARE @SystemAdminId INT = 1;

PRINT 'Başlangıç verileri ekleniyor...';

-- ============================================================================
-- DOKÜMANTASYON ROLLERİ
-- ============================================================================

INSERT INTO documentation_roles (name, display_name, description, is_system_role, created_by)
VALUES 
    ('documentation_admin', 'Dokümantasyon Yöneticisi', 'Tüm dokümantasyon işlemlerini yönetebilir', 1, @SystemAdminId),
    ('documentation_editor', 'Dokümantasyon Editörü', 'Dokümantasyon içeriklerini düzenleyebilir', 1, @SystemAdminId),
    ('documentation_viewer', 'Dokümantasyon Görüntüleyici', 'Dokümantasyonu sadece görüntüleyebilir', 1, @SystemAdminId),
    ('developer', 'Geliştirici', 'Teknik dokümantasyon erişimi', 1, @SystemAdminId),
    ('architect', 'Sistem Mimarı', 'Mimari dokümantasyon yönetimi', 1, @SystemAdminId),
    ('qa_engineer', 'QA Mühendisi', 'Test dokümantasyonu erişimi', 1, @SystemAdminId),
    ('project_manager', 'Proje Yöneticisi', 'Proje dokümantasyonu görüntüleme', 1, @SystemAdminId);

PRINT '✓ Dokümantasyon rolleri eklendi';

-- ============================================================================
-- DOKÜMANTASYON İZİNLERİ
-- ============================================================================

INSERT INTO documentation_permissions (name, display_name, description, resource, action, is_system_permission, created_by)
VALUES 
    -- Dokümantasyon izinleri
    ('documentation.create', 'Dokümantasyon Oluşturma', 'Yeni dokümantasyon oluşturabilir', 'documentation', 'create', 1, @SystemAdminId),
    ('documentation.read', 'Dokümantasyon Okuma', 'Dokümantasyonu görüntüleyebilir', 'documentation', 'read', 1, @SystemAdminId),
    ('documentation.update', 'Dokümantasyon Güncelleme', 'Dokümantasyonu güncelleyebilir', 'documentation', 'update', 1, @SystemAdminId),
    ('documentation.delete', 'Dokümantasyon Silme', 'Dokümantasyonu silebilir', 'documentation', 'delete', 1, @SystemAdminId),
    ('documentation.publish', 'Dokümantasyon Yayınlama', 'Dokümantasyonu yayınlayabilir', 'documentation', 'publish', 1, @SystemAdminId),
    
    -- Bileşen izinleri
    ('components.create', 'Bileşen Oluşturma', 'Yeni bileşen tanımlayabilir', 'components', 'create', 1, @SystemAdminId),
    ('components.read', 'Bileşen Okuma', 'Bileşenleri görüntüleyebilir', 'components', 'read', 1, @SystemAdminId),
    ('components.update', 'Bileşen Güncelleme', 'Bileşenleri güncelleyebilir', 'components', 'update', 1, @SystemAdminId),
    ('components.analyze', 'Bileşen Analizi', 'Bileşen analizi yapabilir', 'components', 'analyze', 1, @SystemAdminId),
    
    -- Etki analizi izinleri
    ('impact.create', 'Etki Analizi Oluşturma', 'Yeni etki analizi oluşturabilir', 'impact', 'create', 1, @SystemAdminId),
    ('impact.read', 'Etki Analizi Okuma', 'Etki analizlerini görüntüleyebilir', 'impact', 'read', 1, @SystemAdminId),
    ('impact.analyze', 'Etki Analizi Yapma', 'Etki analizi yapabilir', 'impact', 'analyze', 1, @SystemAdminId),
    ('impact.approve', 'Etki Analizi Onaylama', 'Etki analizlerini onaylayabilir', 'impact', 'approve', 1, @SystemAdminId),
    
    -- Akış yönetimi izinleri
    ('flows.create', 'Akış Oluşturma', 'Yeni kullanıcı akışı oluşturabilir', 'flows', 'create', 1, @SystemAdminId),
    ('flows.read', 'Akış Okuma', 'Kullanıcı akışlarını görüntüleyebilir', 'flows', 'read', 1, @SystemAdminId),
    ('flows.update', 'Akış Güncelleme', 'Kullanıcı akışlarını güncelleyebilir', 'flows', 'update', 1, @SystemAdminId),
    ('flows.manage', 'Akış Yönetimi', 'Kullanıcı akışlarını yönetebilir', 'flows', 'manage', 1, @SystemAdminId),
    
    -- Sistem yönetimi izinleri
    ('system.admin', 'Sistem Yönetimi', 'Sistem ayarlarını yönetebilir', 'system', 'admin', 1, @SystemAdminId),
    ('system.config', 'Sistem Konfigürasyonu', 'Sistem konfigürasyonunu değiştirebilir', 'system', 'config', 1, @SystemAdminId);

PRINT '✓ Dokümantasyon izinleri eklendi';
-- ============================================================================
-- ROL-İZİN İLİŞKİLERİ
-- ============================================================================

-- Dokümantasyon Yöneticisi - Tüm izinler
INSERT INTO role_permissions (role_id, permission_id, created_by)
SELECT dr.id, dp.id, @SystemAdminId
FROM documentation_roles dr
CROSS JOIN documentation_permissions dp
WHERE dr.name = 'documentation_admin';

-- Dokümantasyon Editörü - Okuma, yazma, güncelleme
INSERT INTO role_permissions (role_id, permission_id, created_by)
SELECT dr.id, dp.id, @SystemAdminId
FROM documentation_roles dr
CROSS JOIN documentation_permissions dp
WHERE dr.name = 'documentation_editor'
AND dp.name IN ('documentation.create', 'documentation.read', 'documentation.update', 'documentation.publish',
                'components.read', 'components.update', 'flows.read', 'flows.update', 'impact.read');

-- Dokümantasyon Görüntüleyici - Sadece okuma
INSERT INTO role_permissions (role_id, permission_id, created_by)
SELECT dr.id, dp.id, @SystemAdminId
FROM documentation_roles dr
CROSS JOIN documentation_permissions dp
WHERE dr.name = 'documentation_viewer'
AND dp.name IN ('documentation.read', 'components.read', 'flows.read', 'impact.read');

-- Geliştirici - Teknik dokümantasyon ve bileşen yönetimi
INSERT INTO role_permissions (role_id, permission_id, created_by)
SELECT dr.id, dp.id, @SystemAdminId
FROM documentation_roles dr
CROSS JOIN documentation_permissions dp
WHERE dr.name = 'developer'
AND dp.name IN ('documentation.read', 'documentation.create', 'documentation.update',
                'components.read', 'components.create', 'components.update', 'components.analyze',
                'flows.read', 'impact.read', 'impact.create');

-- Sistem Mimarı - Mimari dokümantasyon ve etki analizi
INSERT INTO role_permissions (role_id, permission_id, created_by)
SELECT dr.id, dp.id, @SystemAdminId
FROM documentation_roles dr
CROSS JOIN documentation_permissions dp
WHERE dr.name = 'architect'
AND dp.name IN ('documentation.read', 'documentation.create', 'documentation.update', 'documentation.publish',
                'components.read', 'components.create', 'components.update', 'components.analyze',
                'flows.read', 'flows.create', 'flows.update', 'flows.manage',
                'impact.read', 'impact.create', 'impact.analyze', 'impact.approve');

PRINT '✓ Rol-izin ilişkileri eklendi';

-- ============================================================================
-- DOKÜMANTASYON BÖLÜMLERİ
-- ============================================================================

INSERT INTO documentation_sections (title, slug, description, section_type, display_order, is_system_section, is_public, created_by)
VALUES 
    ('Proje Mimarisi', 'architecture', 'Sistem mimarisi ve bileşen dokümantasyonu', 'architecture', 1, 1, 0, @SystemAdminId),
    ('Backend Mimarisi', 'backend-architecture', 'Node.js/Express backend mimarisi', 'architecture', 11, 1, 0, @SystemAdminId),
    ('Frontend Mimarisi', 'frontend-architecture', 'React frontend mimarisi', 'architecture', 12, 1, 0, @SystemAdminId),
    ('Mobile Mimarisi', 'mobile-architecture', 'React Native mobile mimarisi', 'architecture', 13, 1, 0, @SystemAdminId),
    
    ('Kullanıcı Rolleri', 'roles', 'Kullanıcı rolleri ve yetkileri dokümantasyonu', 'roles', 2, 1, 0, @SystemAdminId),
    ('Admin Rolleri', 'admin-roles', 'Yönetici rolleri ve yetkileri', 'roles', 21, 1, 0, @SystemAdminId),
    ('Doktor Rolleri', 'doctor-roles', 'Doktor rolleri ve yetkileri', 'roles', 22, 1, 0, @SystemAdminId),
    ('Hastane Rolleri', 'hospital-roles', 'Hastane rolleri ve yetkileri', 'roles', 23, 1, 0, @SystemAdminId),
    
    ('Ekran Akışları', 'flows', 'Kullanıcı akışları ve ekran geçişleri', 'flows', 3, 1, 0, @SystemAdminId),
    ('Web Akışları', 'web-flows', 'Web uygulaması kullanıcı akışları', 'flows', 31, 1, 0, @SystemAdminId),
    ('Mobile Akışları', 'mobile-flows', 'Mobile uygulama kullanıcı akışları', 'flows', 32, 1, 0, @SystemAdminId),
    
    ('API Dokümantasyonu', 'api', 'REST API endpoint dokümantasyonu', 'api', 4, 1, 0, @SystemAdminId),
    ('Authentication API', 'auth-api', 'Kimlik doğrulama API\'leri', 'api', 41, 1, 0, @SystemAdminId),
    ('User Management API', 'user-api', 'Kullanıcı yönetimi API\'leri', 'api', 42, 1, 0, @SystemAdminId),
    ('Job Management API', 'job-api', 'İş ilanı yönetimi API\'leri', 'api', 43, 1, 0, @SystemAdminId),
    
    ('Kod Standartları', 'standards', 'Kod yazım standartları ve best practices', 'standards', 5, 1, 1, @SystemAdminId),
    ('JavaScript Standartları', 'js-standards', 'JavaScript/TypeScript kod standartları', 'standards', 51, 1, 1, @SystemAdminId),
    ('React Standartları', 'react-standards', 'React bileşen standartları', 'standards', 52, 1, 1, @SystemAdminId),
    ('Database Standartları', 'db-standards', 'Veritabanı tasarım standartları', 'standards', 53, 1, 1, @SystemAdminId),
    
    ('Etki Analizi', 'impact', 'Değişiklik etki analizi raporları', 'impact', 6, 1, 0, @SystemAdminId);

-- Parent-child ilişkilerini güncelle
UPDATE documentation_sections SET parent_id = (SELECT id FROM documentation_sections WHERE slug = 'architecture') WHERE slug IN ('backend-architecture', 'frontend-architecture', 'mobile-architecture');
UPDATE documentation_sections SET parent_id = (SELECT id FROM documentation_sections WHERE slug = 'roles') WHERE slug IN ('admin-roles', 'doctor-roles', 'hospital-roles');
UPDATE documentation_sections SET parent_id = (SELECT id FROM documentation_sections WHERE slug = 'flows') WHERE slug IN ('web-flows', 'mobile-flows');
UPDATE documentation_sections SET parent_id = (SELECT id FROM documentation_sections WHERE slug = 'api') WHERE slug IN ('auth-api', 'user-api', 'job-api');
UPDATE documentation_sections SET parent_id = (SELECT id FROM documentation_sections WHERE slug = 'standards') WHERE slug IN ('js-standards', 'react-standards', 'db-standards');

PRINT '✓ Dokümantasyon bölümleri eklendi';

-- ============================================================================
-- BİLEŞEN ETİKETLERİ
-- ============================================================================

INSERT INTO component_tags (name, display_name, color, description, created_by)
VALUES 
    ('backend', 'Backend', '#28a745', 'Backend bileşenleri', @SystemAdminId),
    ('frontend', 'Frontend', '#007bff', 'Frontend bileşenleri', @SystemAdminId),
    ('mobile', 'Mobile', '#6f42c1', 'Mobile bileşenleri', @SystemAdminId),
    ('api', 'API', '#fd7e14', 'API endpoint\'leri', @SystemAdminId),
    ('database', 'Database', '#20c997', 'Veritabanı bileşenleri', @SystemAdminId),
    ('auth', 'Authentication', '#dc3545', 'Kimlik doğrulama', @SystemAdminId),
    ('security', 'Security', '#e83e8c', 'Güvenlik bileşenleri', @SystemAdminId),
    ('ui', 'User Interface', '#17a2b8', 'Kullanıcı arayüzü', @SystemAdminId),
    ('business-logic', 'Business Logic', '#ffc107', 'İş mantığı', @SystemAdminId),
    ('utility', 'Utility', '#6c757d', 'Yardımcı fonksiyonlar', @SystemAdminId),
    ('deprecated', 'Deprecated', '#dc3545', 'Kullanımdan kaldırılan', @SystemAdminId),
    ('critical', 'Critical', '#dc3545', 'Kritik bileşenler', @SystemAdminId);

PRINT '✓ Bileşen etiketleri eklendi';

-- ============================================================================
-- RİSK FAKTÖRLERİ
-- ============================================================================

INSERT INTO risk_factors (name, description, category, weight, created_by)
VALUES 
    ('breaking_change', 'Geriye uyumluluk bozucu değişiklik', 'technical', 4.00, @SystemAdminId),
    ('database_schema_change', 'Veritabanı şema değişikliği', 'technical', 3.50, @SystemAdminId),
    ('api_interface_change', 'API arayüz değişikliği', 'technical', 3.00, @SystemAdminId),
    ('authentication_change', 'Kimlik doğrulama değişikliği', 'security', 4.50, @SystemAdminId),
    ('authorization_change', 'Yetkilendirme değişikliği', 'security', 4.00, @SystemAdminId),
    ('performance_impact', 'Performans etkisi', 'performance', 2.50, @SystemAdminId),
    ('user_experience_change', 'Kullanıcı deneyimi değişikliği', 'usability', 2.00, @SystemAdminId),
    ('business_logic_change', 'İş mantığı değişikliği', 'business', 3.50, @SystemAdminId),
    ('data_migration_required', 'Veri migrasyonu gerekli', 'technical', 3.00, @SystemAdminId),
    ('third_party_dependency', 'Üçüncü parti bağımlılık', 'technical', 2.00, @SystemAdminId),
    ('production_deployment', 'Prodüksiyon dağıtımı', 'business', 2.50, @SystemAdminId),
    ('rollback_complexity', 'Geri alma karmaşıklığı', 'technical', 2.00, @SystemAdminId);

PRINT '✓ Risk faktörleri eklendi';

-- ============================================================================
-- ÖRNEK BİLEŞENLER
-- ============================================================================

INSERT INTO components (name, display_name, description, component_type, layer, file_path, namespace, status, complexity_score, created_by)
VALUES 
    -- Backend bileşenleri
    ('authController', 'Authentication Controller', 'Kimlik doğrulama controller\'ı', 'backend', 'presentation', 'Backend/src/controllers/authController.js', 'controllers', 'active', 7, @SystemAdminId),
    ('authService', 'Authentication Service', 'Kimlik doğrulama servisi', 'backend', 'business', 'Backend/src/services/authService.js', 'services', 'active', 8, @SystemAdminId),
    ('authMiddleware', 'Authentication Middleware', 'Kimlik doğrulama middleware\'i', 'backend', 'infrastructure', 'Backend/src/middleware/authMiddleware.js', 'middleware', 'active', 6, @SystemAdminId),
    ('dbConfig', 'Database Configuration', 'Veritabanı konfigürasyonu', 'backend', 'infrastructure', 'Backend/src/config/dbConfig.js', 'config', 'active', 5, @SystemAdminId),
    
    -- Frontend bileşenleri
    ('LoginForm', 'Login Form Component', 'Giriş formu bileşeni', 'frontend', 'presentation', 'frontend/src/components/auth/LoginForm.jsx', 'components.auth', 'active', 4, @SystemAdminId),
    ('Dashboard', 'Dashboard Component', 'Ana dashboard bileşeni', 'frontend', 'presentation', 'frontend/src/components/dashboard/Dashboard.jsx', 'components.dashboard', 'active', 6, @SystemAdminId),
    ('AuthProvider', 'Authentication Provider', 'Kimlik doğrulama context provider\'ı', 'frontend', 'business', 'frontend/src/contexts/AuthContext.jsx', 'contexts', 'active', 5, @SystemAdminId),
    
    -- Mobile bileşenleri
    ('LoginScreen', 'Login Screen', 'Mobile giriş ekranı', 'mobile', 'presentation', 'mobile/src/screens/auth/LoginScreen.tsx', 'screens.auth', 'active', 4, @SystemAdminId),
    ('NavigationContainer', 'Navigation Container', 'Ana navigasyon container\'ı', 'mobile', 'infrastructure', 'mobile/src/navigation/NavigationContainer.tsx', 'navigation', 'active', 7, @SystemAdminId),
    
    -- Shared bileşenleri
    ('jwtUtils', 'JWT Utilities', 'JWT yardımcı fonksiyonları', 'shared', 'infrastructure', 'Backend/src/utils/jwtUtils.js', 'utils', 'active', 3, @SystemAdminId),
    ('apiClient', 'API Client', 'HTTP API istemcisi', 'shared', 'infrastructure', 'shared/src/api/apiClient.js', 'api', 'active', 5, @SystemAdminId);

PRINT '✓ Örnek bileşenler eklendi';

PRINT '✓ Tüm başlangıç verileri başarıyla eklendi!';
PRINT '✓ Dokümantasyon sistemi kurulumu tamamlandı!';