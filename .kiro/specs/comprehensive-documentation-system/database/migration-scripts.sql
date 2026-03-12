-- ============================================================================
-- Migration Scripts - Dokümantasyon Sistemi
-- MediKariyer SQL Server Veritabanı
-- Mevcut sistem ile uyumlu migration stratejisi
-- ============================================================================

-- Migration 001: Temel Tablo Yapıları
-- Tarih: 2024-01-01
-- Açıklama: Dokümantasyon sistemi için temel tabloları oluşturur

BEGIN TRANSACTION Migration_001;

BEGIN TRY
    PRINT 'Migration 001 başlatılıyor: Temel tablo yapıları...';
    
    -- 1. Dokümantasyon rolleri tablosu
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'documentation_roles')
    BEGIN
        EXEC('
        CREATE TABLE documentation_roles (
            id INT IDENTITY(1,1) PRIMARY KEY,
            name NVARCHAR(50) NOT NULL UNIQUE,
            display_name NVARCHAR(100) NOT NULL,
            description NVARCHAR(500),
            is_system_role BIT NOT NULL DEFAULT 0,
            is_active BIT NOT NULL DEFAULT 1,
            created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
            updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
            created_by INT NOT NULL,
            updated_by INT,
            is_deleted BIT NOT NULL DEFAULT 0,
            deleted_at DATETIME2 NULL,
            deleted_by INT NULL,
            
            CONSTRAINT FK_documentation_roles_created_by FOREIGN KEY (created_by) REFERENCES users(id),
            CONSTRAINT FK_documentation_roles_updated_by FOREIGN KEY (updated_by) REFERENCES users(id),
            CONSTRAINT FK_documentation_roles_deleted_by FOREIGN KEY (deleted_by) REFERENCES users(id)
        )');
        PRINT '✓ documentation_roles tablosu oluşturuldu';
    END
    ELSE
        PRINT '- documentation_roles tablosu zaten mevcut';

    -- 2. Dokümantasyon izinleri tablosu
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'documentation_permissions')
    BEGIN
        EXEC('
        CREATE TABLE documentation_permissions (
            id INT IDENTITY(1,1) PRIMARY KEY,
            name NVARCHAR(100) NOT NULL UNIQUE,
            display_name NVARCHAR(150) NOT NULL,
            description NVARCHAR(500),
            resource NVARCHAR(100) NOT NULL,
            action NVARCHAR(50) NOT NULL,
            is_system_permission BIT NOT NULL DEFAULT 0,
            is_active BIT NOT NULL DEFAULT 1,
            created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
            updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
            created_by INT NOT NULL,
            updated_by INT,
            is_deleted BIT NOT NULL DEFAULT 0,
            deleted_at DATETIME2 NULL,
            deleted_by INT NULL,
            
            CONSTRAINT FK_documentation_permissions_created_by FOREIGN KEY (created_by) REFERENCES users(id),
            CONSTRAINT FK_documentation_permissions_updated_by FOREIGN KEY (updated_by) REFERENCES users(id),
            CONSTRAINT FK_documentation_permissions_deleted_by FOREIGN KEY (deleted_by) REFERENCES users(id)
        )');
        PRINT '✓ documentation_permissions tablosu oluşturuldu';
    END
    ELSE
        PRINT '- documentation_permissions tablosu zaten mevcut';

    -- 3. Rol-izin ilişki tablosu
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'role_permissions')
    BEGIN
        EXEC('
        CREATE TABLE role_permissions (
            id INT IDENTITY(1,1) PRIMARY KEY,
            role_id INT NOT NULL,
            permission_id INT NOT NULL,
            is_granted BIT NOT NULL DEFAULT 1,
            conditions NVARCHAR(MAX),
            created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
            created_by INT NOT NULL,
            is_deleted BIT NOT NULL DEFAULT 0,
            deleted_at DATETIME2 NULL,
            deleted_by INT NULL,
            
            CONSTRAINT FK_role_permissions_role FOREIGN KEY (role_id) REFERENCES documentation_roles(id),
            CONSTRAINT FK_role_permissions_permission FOREIGN KEY (permission_id) REFERENCES documentation_permissions(id),
            CONSTRAINT FK_role_permissions_created_by FOREIGN KEY (created_by) REFERENCES users(id),
            CONSTRAINT FK_role_permissions_deleted_by FOREIGN KEY (deleted_by) REFERENCES users(id),
            CONSTRAINT UQ_role_permissions UNIQUE (role_id, permission_id)
        )');
        PRINT '✓ role_permissions tablosu oluşturuldu';
    END
    ELSE
        PRINT '- role_permissions tablosu zaten mevcut';

    PRINT 'Migration 001 başarıyla tamamlandı!';
    COMMIT TRANSACTION Migration_001;
    
END TRY
BEGIN CATCH
    PRINT 'Migration 001 HATA: ' + ERROR_MESSAGE();
    ROLLBACK TRANSACTION Migration_001;
    THROW;
END CATCH;

GO

-- Migration 002: Dokümantasyon İçerik Tabloları
-- Tarih: 2024-01-02
-- Açıklama: Dokümantasyon içerik yönetimi tabloları

BEGIN TRANSACTION Migration_002;

BEGIN TRY
    PRINT 'Migration 002 başlatılıyor: Dokümantasyon içerik tabloları...';
    
    -- 1. Dokümantasyon bölümleri
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'documentation_sections')
    BEGIN
        EXEC('
        CREATE TABLE documentation_sections (
            id INT IDENTITY(1,1) PRIMARY KEY,
            parent_id INT NULL,
            title NVARCHAR(200) NOT NULL,
            slug NVARCHAR(200) NOT NULL,
            description NVARCHAR(1000),
            section_type NVARCHAR(50) NOT NULL,
            display_order INT NOT NULL DEFAULT 0,
            icon NVARCHAR(50),
            is_system_section BIT NOT NULL DEFAULT 0,
            is_active BIT NOT NULL DEFAULT 1,
            is_public BIT NOT NULL DEFAULT 0,
            required_role NVARCHAR(50),
            created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
            updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
            created_by INT NOT NULL,
            updated_by INT,
            is_deleted BIT NOT NULL DEFAULT 0,
            deleted_at DATETIME2 NULL,
            deleted_by INT NULL,
            
            CONSTRAINT FK_documentation_sections_parent FOREIGN KEY (parent_id) REFERENCES documentation_sections(id),
            CONSTRAINT FK_documentation_sections_created_by FOREIGN KEY (created_by) REFERENCES users(id),
            CONSTRAINT FK_documentation_sections_updated_by FOREIGN KEY (updated_by) REFERENCES users(id),
            CONSTRAINT FK_documentation_sections_deleted_by FOREIGN KEY (deleted_by) REFERENCES users(id),
            CONSTRAINT UQ_documentation_sections_slug UNIQUE (slug)
        )');
        PRINT '✓ documentation_sections tablosu oluşturuldu';
    END;

    -- 2. Dokümantasyon içerikleri
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'documentation_content')
    BEGIN
        EXEC('
        CREATE TABLE documentation_content (
            id INT IDENTITY(1,1) PRIMARY KEY,
            section_id INT NOT NULL,
            title NVARCHAR(300) NOT NULL,
            content NVARCHAR(MAX) NOT NULL,
            content_type NVARCHAR(50) NOT NULL DEFAULT ''markdown'',
            summary NVARCHAR(500),
            tags NVARCHAR(500),
            metadata NVARCHAR(MAX),
            version_number NVARCHAR(20) NOT NULL DEFAULT ''1.0.0'',
            is_published BIT NOT NULL DEFAULT 0,
            is_featured BIT NOT NULL DEFAULT 0,
            view_count INT NOT NULL DEFAULT 0,
            last_viewed_at DATETIME2 NULL,
            search_keywords NVARCHAR(1000),
            created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
            updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
            published_at DATETIME2 NULL,
            created_by INT NOT NULL,
            updated_by INT,
            published_by INT,
            is_deleted BIT NOT NULL DEFAULT 0,
            deleted_at DATETIME2 NULL,
            deleted_by INT NULL,
            
            CONSTRAINT FK_documentation_content_section FOREIGN KEY (section_id) REFERENCES documentation_sections(id),
            CONSTRAINT FK_documentation_content_created_by FOREIGN KEY (created_by) REFERENCES users(id),
            CONSTRAINT FK_documentation_content_updated_by FOREIGN KEY (updated_by) REFERENCES users(id),
            CONSTRAINT FK_documentation_content_published_by FOREIGN KEY (published_by) REFERENCES users(id),
            CONSTRAINT FK_documentation_content_deleted_by FOREIGN KEY (deleted_by) REFERENCES users(id)
        )');
        PRINT '✓ documentation_content tablosu oluşturuldu';
    END;

    PRINT 'Migration 002 başarıyla tamamlandı!';
    COMMIT TRANSACTION Migration_002;
    
END TRY
BEGIN CATCH
    PRINT 'Migration 002 HATA: ' + ERROR_MESSAGE();
    ROLLBACK TRANSACTION Migration_002;
    THROW;
END CATCH;

GO
-- Migration 003: Bileşen ve Bağımlılık Tabloları
-- Tarih: 2024-01-03
-- Açıklama: Sistem bileşenleri ve bağımlılık analizi tabloları

BEGIN TRANSACTION Migration_003;

BEGIN TRY
    PRINT 'Migration 003 başlatılıyor: Bileşen tabloları...';
    
    -- 1. Bileşenler tablosu
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'components')
    BEGIN
        EXEC('
        CREATE TABLE components (
            id INT IDENTITY(1,1) PRIMARY KEY,
            name NVARCHAR(200) NOT NULL,
            display_name NVARCHAR(250) NOT NULL,
            description NVARCHAR(1000),
            component_type NVARCHAR(50) NOT NULL,
            layer NVARCHAR(50) NOT NULL,
            file_path NVARCHAR(500),
            namespace NVARCHAR(200),
            version NVARCHAR(20),
            status NVARCHAR(50) NOT NULL DEFAULT ''active'',
            complexity_score INT DEFAULT 0,
            maintainer_id INT,
            documentation_url NVARCHAR(500),
            repository_url NVARCHAR(500),
            last_analyzed_at DATETIME2,
            metadata NVARCHAR(MAX),
            created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
            updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
            created_by INT NOT NULL,
            updated_by INT,
            is_deleted BIT NOT NULL DEFAULT 0,
            deleted_at DATETIME2 NULL,
            deleted_by INT NULL,
            
            CONSTRAINT FK_components_maintainer FOREIGN KEY (maintainer_id) REFERENCES users(id),
            CONSTRAINT FK_components_created_by FOREIGN KEY (created_by) REFERENCES users(id),
            CONSTRAINT FK_components_updated_by FOREIGN KEY (updated_by) REFERENCES users(id),
            CONSTRAINT FK_components_deleted_by FOREIGN KEY (deleted_by) REFERENCES users(id),
            CONSTRAINT UQ_components_name_type UNIQUE (name, component_type)
        )');
        PRINT '✓ components tablosu oluşturuldu';
    END;

    -- 2. Bileşen bağımlılıkları
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'component_dependencies')
    BEGIN
        EXEC('
        CREATE TABLE component_dependencies (
            id INT IDENTITY(1,1) PRIMARY KEY,
            source_component_id INT NOT NULL,
            target_component_id INT NOT NULL,
            dependency_type NVARCHAR(50) NOT NULL,
            relationship_type NVARCHAR(50) NOT NULL,
            description NVARCHAR(500),
            is_critical BIT NOT NULL DEFAULT 0,
            strength NVARCHAR(20) DEFAULT ''medium'',
            detected_method NVARCHAR(50),
            confidence_score DECIMAL(3,2) DEFAULT 1.00,
            last_verified_at DATETIME2,
            created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
            updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
            created_by INT NOT NULL,
            updated_by INT,
            is_deleted BIT NOT NULL DEFAULT 0,
            deleted_at DATETIME2 NULL,
            deleted_by INT NULL,
            
            CONSTRAINT FK_component_dependencies_source FOREIGN KEY (source_component_id) REFERENCES components(id),
            CONSTRAINT FK_component_dependencies_target FOREIGN KEY (target_component_id) REFERENCES components(id),
            CONSTRAINT FK_component_dependencies_created_by FOREIGN KEY (created_by) REFERENCES users(id),
            CONSTRAINT FK_component_dependencies_updated_by FOREIGN KEY (updated_by) REFERENCES users(id),
            CONSTRAINT FK_component_dependencies_deleted_by FOREIGN KEY (deleted_by) REFERENCES users(id),
            CONSTRAINT UQ_component_dependencies UNIQUE (source_component_id, target_component_id, dependency_type),
            CONSTRAINT CHK_component_dependencies_not_self CHECK (source_component_id != target_component_id)
        )');
        PRINT '✓ component_dependencies tablosu oluşturuldu';
    END;

    PRINT 'Migration 003 başarıyla tamamlandı!';
    COMMIT TRANSACTION Migration_003;
    
END TRY
BEGIN CATCH
    PRINT 'Migration 003 HATA: ' + ERROR_MESSAGE();
    ROLLBACK TRANSACTION Migration_003;
    THROW;
END CATCH;

GO

-- Migration 004: Etki Analizi Tabloları
-- Tarih: 2024-01-04
-- Açıklama: Değişiklik takibi ve etki analizi tabloları

BEGIN TRANSACTION Migration_004;

BEGIN TRY
    PRINT 'Migration 004 başlatılıyor: Etki analizi tabloları...';
    
    -- 1. Değişiklik logları
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'change_logs')
    BEGIN
        EXEC('
        CREATE TABLE change_logs (
            id INT IDENTITY(1,1) PRIMARY KEY,
            title NVARCHAR(200) NOT NULL,
            description NVARCHAR(2000) NOT NULL,
            change_type NVARCHAR(50) NOT NULL,
            scope NVARCHAR(20) NOT NULL,
            affected_component_id INT,
            change_category NVARCHAR(50),
            priority NVARCHAR(20) DEFAULT ''medium'',
            status NVARCHAR(50) NOT NULL DEFAULT ''planned'',
            planned_date DATETIME2,
            started_date DATETIME2,
            completed_date DATETIME2,
            rollback_date DATETIME2,
            rollback_reason NVARCHAR(1000),
            git_commit_hash NVARCHAR(40),
            pull_request_url NVARCHAR(500),
            deployment_environment NVARCHAR(50),
            metadata NVARCHAR(MAX),
            created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
            updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
            created_by INT NOT NULL,
            updated_by INT,
            assigned_to INT,
            reviewed_by INT,
            approved_by INT,
            is_deleted BIT NOT NULL DEFAULT 0,
            deleted_at DATETIME2 NULL,
            deleted_by INT NULL,
            
            CONSTRAINT FK_change_logs_affected_component FOREIGN KEY (affected_component_id) REFERENCES components(id),
            CONSTRAINT FK_change_logs_created_by FOREIGN KEY (created_by) REFERENCES users(id),
            CONSTRAINT FK_change_logs_updated_by FOREIGN KEY (updated_by) REFERENCES users(id),
            CONSTRAINT FK_change_logs_assigned_to FOREIGN KEY (assigned_to) REFERENCES users(id),
            CONSTRAINT FK_change_logs_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES users(id),
            CONSTRAINT FK_change_logs_approved_by FOREIGN KEY (approved_by) REFERENCES users(id),
            CONSTRAINT FK_change_logs_deleted_by FOREIGN KEY (deleted_by) REFERENCES users(id)
        )');
        PRINT '✓ change_logs tablosu oluşturuldu';
    END;

    -- 2. Etki analizi
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'impact_analysis')
    BEGIN
        EXEC('
        CREATE TABLE impact_analysis (
            id INT IDENTITY(1,1) PRIMARY KEY,
            change_log_id INT NOT NULL,
            analysis_title NVARCHAR(200) NOT NULL,
            analysis_summary NVARCHAR(1000),
            risk_level NVARCHAR(20) NOT NULL,
            confidence_score DECIMAL(3,2) DEFAULT 0.80,
            estimated_effort_hours INT,
            estimated_testing_hours INT,
            breaking_changes_count INT DEFAULT 0,
            affected_components_count INT DEFAULT 0,
            affected_users_count INT DEFAULT 0,
            rollback_complexity NVARCHAR(20) DEFAULT ''medium'',
            recommendations NVARCHAR(MAX),
            mitigation_strategies NVARCHAR(MAX),
            testing_requirements NVARCHAR(MAX),
            deployment_notes NVARCHAR(2000),
            analysis_method NVARCHAR(50) DEFAULT ''manual'',
            analyzed_at DATETIME2 NOT NULL DEFAULT GETDATE(),
            analyzed_by INT NOT NULL,
            reviewed_at DATETIME2,
            reviewed_by INT,
            approved_at DATETIME2,
            approved_by INT,
            is_approved BIT NOT NULL DEFAULT 0,
            created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
            updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
            
            CONSTRAINT FK_impact_analysis_change_log FOREIGN KEY (change_log_id) REFERENCES change_logs(id),
            CONSTRAINT FK_impact_analysis_analyzed_by FOREIGN KEY (analyzed_by) REFERENCES users(id),
            CONSTRAINT FK_impact_analysis_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES users(id),
            CONSTRAINT FK_impact_analysis_approved_by FOREIGN KEY (approved_by) REFERENCES users(id),
            CONSTRAINT UQ_impact_analysis_change_log UNIQUE (change_log_id)
        )');
        PRINT '✓ impact_analysis tablosu oluşturuldu';
    END;

    PRINT 'Migration 004 başarıyla tamamlandı!';
    COMMIT TRANSACTION Migration_004;
    
END TRY
BEGIN CATCH
    PRINT 'Migration 004 HATA: ' + ERROR_MESSAGE();
    ROLLBACK TRANSACTION Migration_004;
    THROW;
END CATCH;

GO

-- Migration 005: Kullanıcı Akışları Tabloları
-- Tarih: 2024-01-05
-- Açıklama: Kullanıcı akışları ve ekran geçişleri tabloları

BEGIN TRANSACTION Migration_005;

BEGIN TRY
    PRINT 'Migration 005 başlatılıyor: Kullanıcı akışları tabloları...';
    
    -- 1. Kullanıcı akışları
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'user_flows')
    BEGIN
        EXEC('
        CREATE TABLE user_flows (
            id INT IDENTITY(1,1) PRIMARY KEY,
            name NVARCHAR(200) NOT NULL,
            display_name NVARCHAR(250) NOT NULL,
            description NVARCHAR(1000),
            flow_type NVARCHAR(50) NOT NULL,
            target_role NVARCHAR(50),
            platform NVARCHAR(50),
            priority NVARCHAR(20) DEFAULT ''medium'',
            complexity_score INT DEFAULT 1,
            estimated_duration_minutes INT,
            success_criteria NVARCHAR(1000),
            entry_points NVARCHAR(MAX),
            exit_points NVARCHAR(MAX),
            prerequisites NVARCHAR(1000),
            business_value NVARCHAR(500),
            usage_frequency NVARCHAR(20),
            last_reviewed_at DATETIME2,
            reviewed_by INT,
            is_active BIT NOT NULL DEFAULT 1,
            is_critical BIT NOT NULL DEFAULT 0,
            is_documented BIT NOT NULL DEFAULT 0,
            version NVARCHAR(20) DEFAULT ''1.0.0'',
            created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
            updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
            created_by INT NOT NULL,
            updated_by INT,
            is_deleted BIT NOT NULL DEFAULT 0,
            deleted_at DATETIME2 NULL,
            deleted_by INT NULL,
            
            CONSTRAINT FK_user_flows_created_by FOREIGN KEY (created_by) REFERENCES users(id),
            CONSTRAINT FK_user_flows_updated_by FOREIGN KEY (updated_by) REFERENCES users(id),
            CONSTRAINT FK_user_flows_reviewed_by FOREIGN KEY (reviewed_by) REFERENCES users(id),
            CONSTRAINT FK_user_flows_deleted_by FOREIGN KEY (deleted_by) REFERENCES users(id),
            CONSTRAINT UQ_user_flows_name UNIQUE (name)
        )');
        PRINT '✓ user_flows tablosu oluşturuldu';
    END;

    -- 2. Akış adımları
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'flow_steps')
    BEGIN
        EXEC('
        CREATE TABLE flow_steps (
            id INT IDENTITY(1,1) PRIMARY KEY,
            flow_id INT NOT NULL,
            step_number INT NOT NULL,
            step_name NVARCHAR(200) NOT NULL,
            step_description NVARCHAR(1000),
            step_type NVARCHAR(50) NOT NULL,
            screen_name NVARCHAR(200),
            component_id INT,
            user_action NVARCHAR(500),
            system_response NVARCHAR(500),
            validation_rules NVARCHAR(MAX),
            error_scenarios NVARCHAR(MAX),
            success_conditions NVARCHAR(500),
            failure_conditions NVARCHAR(500),
            estimated_duration_seconds INT,
            is_optional BIT NOT NULL DEFAULT 0,
            is_critical BIT NOT NULL DEFAULT 0,
            requires_authentication BIT NOT NULL DEFAULT 0,
            requires_authorization BIT NOT NULL DEFAULT 0,
            required_permissions NVARCHAR(500),
            notes NVARCHAR(1000),
            created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
            updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
            created_by INT NOT NULL,
            updated_by INT,
            is_deleted BIT NOT NULL DEFAULT 0,
            deleted_at DATETIME2 NULL,
            deleted_by INT NULL,
            
            CONSTRAINT FK_flow_steps_flow FOREIGN KEY (flow_id) REFERENCES user_flows(id),
            CONSTRAINT FK_flow_steps_component FOREIGN KEY (component_id) REFERENCES components(id),
            CONSTRAINT FK_flow_steps_created_by FOREIGN KEY (created_by) REFERENCES users(id),
            CONSTRAINT FK_flow_steps_updated_by FOREIGN KEY (updated_by) REFERENCES users(id),
            CONSTRAINT FK_flow_steps_deleted_by FOREIGN KEY (deleted_by) REFERENCES users(id),
            CONSTRAINT UQ_flow_steps UNIQUE (flow_id, step_number)
        )');
        PRINT '✓ flow_steps tablosu oluşturuldu';
    END;

    PRINT 'Migration 005 başarıyla tamamlandı!';
    COMMIT TRANSACTION Migration_005;
    
END TRY
BEGIN CATCH
    PRINT 'Migration 005 HATA: ' + ERROR_MESSAGE();
    ROLLBACK TRANSACTION Migration_005;
    THROW;
END CATCH;

GO

-- ============================================================================
-- İNDEKSLER VE PERFORMANS OPTİMİZASYONU
-- ============================================================================

PRINT 'Performans indeksleri oluşturuluyor...';

-- Dokümantasyon tabloları için indeksler
CREATE NONCLUSTERED INDEX IX_documentation_content_section_published 
ON documentation_content (section_id, is_published, created_at DESC);

CREATE NONCLUSTERED INDEX IX_documentation_content_search 
ON documentation_content (search_keywords, is_published);

-- Bileşen tabloları için indeksler
CREATE NONCLUSTERED INDEX IX_components_type_status 
ON components (component_type, status, is_deleted);

CREATE NONCLUSTERED INDEX IX_component_dependencies_source 
ON component_dependencies (source_component_id, is_deleted);

CREATE NONCLUSTERED INDEX IX_component_dependencies_target 
ON component_dependencies (target_component_id, is_deleted);

-- Etki analizi tabloları için indeksler
CREATE NONCLUSTERED INDEX IX_change_logs_status_date 
ON change_logs (status, created_at DESC, is_deleted);

CREATE NONCLUSTERED INDEX IX_impact_analysis_risk_date 
ON impact_analysis (risk_level, analyzed_at DESC);

-- Kullanıcı akışları için indeksler
CREATE NONCLUSTERED INDEX IX_user_flows_role_platform 
ON user_flows (target_role, platform, is_active);

CREATE NONCLUSTERED INDEX IX_flow_steps_flow_number 
ON flow_steps (flow_id, step_number, is_deleted);

PRINT '✓ Tüm indeksler başarıyla oluşturuldu!';

-- ============================================================================
-- BAŞLANGIÇ VERİLERİ (SEED DATA)
-- ============================================================================

PRINT 'Başlangıç verileri ekleniyor...';

-- Sistem admin kullanıcısını bul (varsayılan olarak id=1)
DECLARE @SystemAdminId INT = 1;

-- Temel dokümantasyon rolleri
INSERT INTO documentation_roles (name, display_name, description, is_system_role, created_by)
VALUES 
    ('documentation_admin', 'Dokümantasyon Yöneticisi', 'Tüm dokümantasyon işlemlerini yönetebilir', 1, @SystemAdminId),
    ('documentation_editor', 'Dokümantasyon Editörü', 'Dokümantasyon içeriklerini düzenleyebilir', 1, @SystemAdminId),
    ('documentation_viewer', 'Dokümantasyon Görüntüleyici', 'Dokümantasyonu sadece görüntüleyebilir', 1, @SystemAdminId),
    ('developer', 'Geliştirici', 'Teknik dokümantasyon erişimi', 1, @SystemAdminId),
    ('architect', 'Sistem Mimarı', 'Mimari dokümantasyon yönetimi', 1, @SystemAdminId);

-- Temel dokümantasyon izinleri
INSERT INTO documentation_permissions (name, display_name, description, resource, action, is_system_permission, created_by)
VALUES 
    ('documentation.create', 'Dokümantasyon Oluşturma', 'Yeni dokümantasyon oluşturabilir', 'documentation', 'create', 1, @SystemAdminId),
    ('documentation.read', 'Dokümantasyon Okuma', 'Dokümantasyonu görüntüleyebilir', 'documentation', 'read', 1, @SystemAdminId),
    ('documentation.update', 'Dokümantasyon Güncelleme', 'Dokümantasyonu güncelleyebilir', 'documentation', 'update', 1, @SystemAdminId),
    ('documentation.delete', 'Dokümantasyon Silme', 'Dokümantasyonu silebilir', 'documentation', 'delete', 1, @SystemAdminId),
    ('components.analyze', 'Bileşen Analizi', 'Bileşen analizi yapabilir', 'components', 'analyze', 1, @SystemAdminId),
    ('impact.analyze', 'Etki Analizi', 'Etki analizi yapabilir', 'impact', 'analyze', 1, @SystemAdminId),
    ('flows.manage', 'Akış Yönetimi', 'Kullanıcı akışlarını yönetebilir', 'flows', 'manage', 1, @SystemAdminId);

-- Temel dokümantasyon bölümleri
INSERT INTO documentation_sections (title, slug, description, section_type, display_order, is_system_section, created_by)
VALUES 
    ('Proje Mimarisi', 'architecture', 'Sistem mimarisi ve bileşen dokümantasyonu', 'architecture', 1, 1, @SystemAdminId),
    ('Kullanıcı Rolleri', 'roles', 'Kullanıcı rolleri ve yetkileri dokümantasyonu', 'roles', 2, 1, @SystemAdminId),
    ('Ekran Akışları', 'flows', 'Kullanıcı akışları ve ekran geçişleri', 'flows', 3, 1, @SystemAdminId),
    ('API Dokümantasyonu', 'api', 'REST API endpoint dokümantasyonu', 'api', 4, 1, @SystemAdminId),
    ('Kod Standartları', 'standards', 'Kod yazım standartları ve best practices', 'standards', 5, 1, @SystemAdminId),
    ('Etki Analizi', 'impact', 'Değişiklik etki analizi raporları', 'impact', 6, 1, @SystemAdminId);

PRINT '✓ Başlangıç verileri başarıyla eklendi!';
PRINT '✓ Dokümantasyon sistemi veritabanı kurulumu tamamlandı!';