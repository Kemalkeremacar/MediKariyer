-- ============================================================================
-- İndeksler ve Kısıtlamalar
-- MediKariyer Dokümantasyon Sistemi
-- Performans optimizasyonu ve veri bütünlüğü
-- ============================================================================

-- ============================================================================
-- PERFORMANS İNDEKSLERİ
-- ============================================================================

PRINT 'Performans indeksleri oluşturuluyor...';

-- Dokümantasyon Tabloları İndeksleri
-- ---------------------------------

-- Dokümantasyon içerik arama ve filtreleme
CREATE NONCLUSTERED INDEX IX_documentation_content_section_published 
ON documentation_content (section_id, is_published, created_at DESC)
INCLUDE (title, summary, view_count);

CREATE NONCLUSTERED INDEX IX_documentation_content_search_keywords 
ON documentation_content (search_keywords, is_published, is_deleted)
WHERE is_deleted = 0;

CREATE NONCLUSTERED INDEX IX_documentation_content_tags 
ON documentation_content (tags, is_published)
WHERE is_deleted = 0 AND tags IS NOT NULL;

CREATE NONCLUSTERED INDEX IX_documentation_content_author_date 
ON documentation_content (created_by, created_at DESC, is_published);

-- Dokümantasyon bölümleri hiyerarşi
CREATE NONCLUSTERED INDEX IX_documentation_sections_parent_order 
ON documentation_sections (parent_id, display_order, is_active)
WHERE is_deleted = 0;

CREATE NONCLUSTERED INDEX IX_documentation_sections_type_active 
ON documentation_sections (section_type, is_active, is_public);

-- Dokümantasyon versiyonları
CREATE NONCLUSTERED INDEX IX_documentation_versions_content_current 
ON documentation_versions (content_id, is_current, created_at DESC);

-- Bileşen Tabloları İndeksleri
-- ---------------------------

-- Bileşen arama ve filtreleme
CREATE NONCLUSTERED INDEX IX_components_type_status_layer 
ON components (component_type, status, layer, is_deleted)
INCLUDE (name, display_name, complexity_score);

CREATE NONCLUSTERED INDEX IX_components_maintainer_active 
ON components (maintainer_id, status, is_deleted)
WHERE maintainer_id IS NOT NULL;

CREATE NONCLUSTERED INDEX IX_components_last_analyzed 
ON components (last_analyzed_at DESC, status)
WHERE is_deleted = 0;

-- Bileşen bağımlılıkları performans
CREATE NONCLUSTERED INDEX IX_component_dependencies_source_type 
ON component_dependencies (source_component_id, dependency_type, is_critical, is_deleted)
INCLUDE (target_component_id, relationship_type);

CREATE NONCLUSTERED INDEX IX_component_dependencies_target_type 
ON component_dependencies (target_component_id, dependency_type, is_deleted)
INCLUDE (source_component_id, is_critical);

CREATE NONCLUSTERED INDEX IX_component_dependencies_critical 
ON component_dependencies (is_critical, confidence_score DESC, is_deleted)
WHERE is_critical = 1 AND is_deleted = 0;

-- Bileşen arayüzleri
CREATE NONCLUSTERED INDEX IX_component_interfaces_component_type 
ON component_interfaces (component_id, interface_type, is_public, is_deprecated)
WHERE is_deleted = 0;

CREATE NONCLUSTERED INDEX IX_component_interfaces_deprecated 
ON component_interfaces (is_deprecated, deprecated_since, replacement_interface)
WHERE is_deprecated = 1 AND is_deleted = 0;

-- Etki Analizi Tabloları İndeksleri
-- --------------------------------

-- Değişiklik logları
CREATE NONCLUSTERED INDEX IX_change_logs_status_priority_date 
ON change_logs (status, priority, created_at DESC, is_deleted)
INCLUDE (title, change_type, scope);

CREATE NONCLUSTERED INDEX IX_change_logs_assigned_status 
ON change_logs (assigned_to, status, planned_date)
WHERE assigned_to IS NOT NULL AND is_deleted = 0;

CREATE NONCLUSTERED INDEX IX_change_logs_component_type 
ON change_logs (affected_component_id, change_type, status)
WHERE affected_component_id IS NOT NULL;

CREATE NONCLUSTERED INDEX IX_change_logs_environment_date 
ON change_logs (deployment_environment, completed_date DESC)
WHERE deployment_environment IS NOT NULL;

-- Etki analizi
CREATE NONCLUSTERED INDEX IX_impact_analysis_risk_confidence 
ON impact_analysis (risk_level, confidence_score DESC, analyzed_at DESC)
INCLUDE (analysis_title, affected_components_count);

CREATE NONCLUSTERED INDEX IX_impact_analysis_analyst_date 
ON impact_analysis (analyzed_by, analyzed_at DESC, is_approved);

CREATE NONCLUSTERED INDEX IX_impact_analysis_approval_status 
ON impact_analysis (is_approved, approved_at DESC, approved_by)
WHERE is_approved = 1;

-- Bileşen etkileri
CREATE NONCLUSTERED INDEX IX_component_impacts_analysis_severity 
ON component_impacts (impact_analysis_id, impact_severity, breaking_change)
INCLUDE (component_id, impact_type);

CREATE NONCLUSTERED INDEX IX_component_impacts_component_breaking 
ON component_impacts (component_id, breaking_change, impact_severity)
WHERE breaking_change = 1;

-- Kullanıcı Akışları İndeksleri
-- ----------------------------

-- Kullanıcı akışları
CREATE NONCLUSTERED INDEX IX_user_flows_role_platform_active 
ON user_flows (target_role, platform, is_active, is_critical)
WHERE is_deleted = 0;

CREATE NONCLUSTERED INDEX IX_user_flows_priority_complexity 
ON user_flows (priority, complexity_score, is_active)
INCLUDE (name, display_name, usage_frequency);

CREATE NONCLUSTERED INDEX IX_user_flows_review_date 
ON user_flows (last_reviewed_at DESC, reviewed_by, is_documented)
WHERE is_active = 1;

-- Akış adımları
CREATE NONCLUSTERED INDEX IX_flow_steps_flow_step_number 
ON flow_steps (flow_id, step_number, is_deleted)
INCLUDE (step_name, step_type, is_critical);

CREATE NONCLUSTERED INDEX IX_flow_steps_component_critical 
ON flow_steps (component_id, is_critical, requires_authentication)
WHERE component_id IS NOT NULL AND is_deleted = 0;

-- Ekran geçişleri
CREATE NONCLUSTERED INDEX IX_screen_transitions_flow_from_screen 
ON screen_transitions (flow_id, from_screen, to_screen)
WHERE is_deleted = 0;

CREATE NONCLUSTERED INDEX IX_screen_transitions_conditional 
ON screen_transitions (is_conditional, success_rate DESC)
WHERE is_conditional = 1 AND is_deleted = 0;

-- Rol ve İzin Tabloları İndeksleri
-- -------------------------------

-- Kullanıcı dokümantasyon rolleri
CREATE NONCLUSTERED INDEX IX_user_documentation_roles_user_active 
ON user_documentation_roles (user_id, is_active, expires_at)
WHERE is_deleted = 0;

CREATE NONCLUSTERED INDEX IX_user_documentation_roles_role_active 
ON user_documentation_roles (role_id, is_active, assigned_at DESC);

-- Rol izinleri
CREATE NONCLUSTERED INDEX IX_role_permissions_role_granted 
ON role_permissions (role_id, is_granted, is_deleted)
INCLUDE (permission_id);

-- ============================================================================
-- FULL-TEXT SEARCH İNDEKSLERİ
-- ============================================================================

-- Dokümantasyon içerik arama için full-text catalog
IF NOT EXISTS (SELECT * FROM sys.fulltext_catalogs WHERE name = 'DocumentationCatalog')
BEGIN
    CREATE FULLTEXT CATALOG DocumentationCatalog AS DEFAULT;
    PRINT '✓ Full-text catalog oluşturuldu';
END

-- Dokümantasyon içeriği için full-text index
IF NOT EXISTS (SELECT * FROM sys.fulltext_indexes WHERE object_id = OBJECT_ID('documentation_content'))
BEGIN
    CREATE FULLTEXT INDEX ON documentation_content (
        title LANGUAGE 1055,  -- Turkish
        content LANGUAGE 1055,
        summary LANGUAGE 1055,
        search_keywords LANGUAGE 1055
    ) KEY INDEX PK__documentation_content
    ON DocumentationCatalog
    WITH CHANGE_TRACKING AUTO;
    PRINT '✓ Dokümantasyon full-text index oluşturuldu';
END

-- ============================================================================
-- VERİ BÜTÜNLÜĞÜ KISITLAMALARI
-- ============================================================================

PRINT 'Veri bütünlüğü kısıtlamaları ekleniyor...';

-- Dokümantasyon içerik kısıtlamaları
ALTER TABLE documentation_content 
ADD CONSTRAINT CHK_documentation_content_version_format 
CHECK (version_number LIKE '[0-9]%.[0-9]%.[0-9]%');

ALTER TABLE documentation_content 
ADD CONSTRAINT CHK_documentation_content_view_count_positive 
CHECK (view_count >= 0);

-- Bileşen kısıtlamaları
ALTER TABLE components 
ADD CONSTRAINT CHK_components_complexity_score_range 
CHECK (complexity_score BETWEEN 0 AND 10);

ALTER TABLE component_dependencies 
ADD CONSTRAINT CHK_component_dependencies_confidence_range 
CHECK (confidence_score BETWEEN 0.00 AND 1.00);

-- Etki analizi kısıtlamaları
ALTER TABLE impact_analysis 
ADD CONSTRAINT CHK_impact_analysis_confidence_range 
CHECK (confidence_score BETWEEN 0.00 AND 1.00);

ALTER TABLE impact_analysis 
ADD CONSTRAINT CHK_impact_analysis_effort_positive 
CHECK (estimated_effort_hours >= 0 AND estimated_testing_hours >= 0);

ALTER TABLE impact_analysis 
ADD CONSTRAINT CHK_impact_analysis_counts_positive 
CHECK (breaking_changes_count >= 0 AND affected_components_count >= 0 AND affected_users_count >= 0);

-- Kullanıcı akışları kısıtlamaları
ALTER TABLE user_flows 
ADD CONSTRAINT CHK_user_flows_complexity_range 
CHECK (complexity_score BETWEEN 1 AND 10);

ALTER TABLE user_flows 
ADD CONSTRAINT CHK_user_flows_duration_positive 
CHECK (estimated_duration_minutes > 0);

ALTER TABLE flow_steps 
ADD CONSTRAINT CHK_flow_steps_step_number_positive 
CHECK (step_number > 0);

ALTER TABLE flow_steps 
ADD CONSTRAINT CHK_flow_steps_duration_positive 
CHECK (estimated_duration_seconds >= 0);

-- Risk faktörleri kısıtlamaları
ALTER TABLE risk_factors 
ADD CONSTRAINT CHK_risk_factors_weight_range 
CHECK (weight BETWEEN 0.00 AND 5.00);

ALTER TABLE impact_risk_factors 
ADD CONSTRAINT CHK_impact_risk_factors_probability_range 
CHECK (probability BETWEEN 0.00 AND 1.00);

-- ============================================================================
-- TETİKLEYİCİLER (TRIGGERS)
-- ============================================================================

PRINT 'Tetikleyiciler oluşturuluyor...';

-- Dokümantasyon içerik güncelleme tetikleyicisi
CREATE OR ALTER TRIGGER TR_documentation_content_update_timestamp
ON documentation_content
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE documentation_content 
    SET updated_at = GETDATE()
    FROM documentation_content dc
    INNER JOIN inserted i ON dc.id = i.id;
END;

-- Bileşen son analiz tarihi güncelleme
CREATE OR ALTER TRIGGER TR_components_last_analyzed_update
ON component_dependencies
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    UPDATE components 
    SET last_analyzed_at = GETDATE()
    FROM components c
    INNER JOIN inserted i ON (c.id = i.source_component_id OR c.id = i.target_component_id);
END;

-- Etki analizi otomatik sayaç güncelleme
CREATE OR ALTER TRIGGER TR_impact_analysis_component_count_update
ON component_impacts
AFTER INSERT, DELETE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Eklenen kayıtlar için güncelleme
    IF EXISTS (SELECT 1 FROM inserted)
    BEGIN
        UPDATE impact_analysis 
        SET affected_components_count = (
            SELECT COUNT(*) 
            FROM component_impacts ci 
            WHERE ci.impact_analysis_id = ia.id
        )
        FROM impact_analysis ia
        INNER JOIN inserted i ON ia.id = i.impact_analysis_id;
    END
    
    -- Silinen kayıtlar için güncelleme
    IF EXISTS (SELECT 1 FROM deleted)
    BEGIN
        UPDATE impact_analysis 
        SET affected_components_count = (
            SELECT COUNT(*) 
            FROM component_impacts ci 
            WHERE ci.impact_analysis_id = ia.id
        )
        FROM impact_analysis ia
        INNER JOIN deleted d ON ia.id = d.impact_analysis_id;
    END
END;

-- Dokümantasyon görüntülenme sayısı güncelleme
CREATE OR ALTER TRIGGER TR_documentation_content_view_count_update
ON documentation_content
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Sadece last_viewed_at güncellendiğinde view_count'u artır
    UPDATE documentation_content 
    SET view_count = view_count + 1
    FROM documentation_content dc
    INNER JOIN inserted i ON dc.id = i.id
    INNER JOIN deleted d ON dc.id = d.id
    WHERE i.last_viewed_at != d.last_viewed_at 
       OR (i.last_viewed_at IS NOT NULL AND d.last_viewed_at IS NULL);
END;

PRINT '✓ Tüm indeksler, kısıtlamalar ve tetikleyiciler başarıyla oluşturuldu!';

-- ============================================================================
-- İSTATİSTİK GÜNCELLEMELERİ
-- ============================================================================

PRINT 'İstatistikler güncelleniyor...';

-- Tüm tablolar için istatistikleri güncelle
UPDATE STATISTICS documentation_roles;
UPDATE STATISTICS documentation_permissions;
UPDATE STATISTICS role_permissions;
UPDATE STATISTICS user_documentation_roles;
UPDATE STATISTICS documentation_sections;
UPDATE STATISTICS documentation_content;
UPDATE STATISTICS documentation_versions;
UPDATE STATISTICS documentation_comments;
UPDATE STATISTICS components;
UPDATE STATISTICS component_dependencies;
UPDATE STATISTICS component_interfaces;
UPDATE STATISTICS component_tags;
UPDATE STATISTICS component_tag_relations;
UPDATE STATISTICS change_logs;
UPDATE STATISTICS impact_analysis;
UPDATE STATISTICS component_impacts;
UPDATE STATISTICS impact_analysis_history;
UPDATE STATISTICS risk_factors;
UPDATE STATISTICS impact_risk_factors;
UPDATE STATISTICS user_flows;
UPDATE STATISTICS flow_steps;
UPDATE STATISTICS screen_transitions;
UPDATE STATISTICS flow_dependencies;
UPDATE STATISTICS flow_metrics;

PRINT '✓ Tüm istatistikler güncellendi!';
PRINT '✓ Veritabanı optimizasyonu tamamlandı!';