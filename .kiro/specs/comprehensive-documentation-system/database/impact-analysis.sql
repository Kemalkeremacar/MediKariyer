-- ============================================================================
-- Etki Analizi ve Değişiklik Takibi Tabloları
-- MediKariyer Dokümantasyon Sistemi
-- SQL Server Uyumlu
-- ============================================================================

-- Değişiklik logları tablosu
CREATE TABLE change_logs (
    id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(200) NOT NULL,
    description NVARCHAR(2000) NOT NULL,
    change_type NVARCHAR(50) NOT NULL, -- ui, api, database, business_logic, configuration, infrastructure
    scope NVARCHAR(20) NOT NULL, -- minor, major, breaking, hotfix
    affected_component_id INT, -- Ana etkilenen bileşen
    change_category NVARCHAR(50), -- feature, bugfix, refactor, performance, security
    priority NVARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
    status NVARCHAR(50) NOT NULL DEFAULT 'planned', -- planned, in_progress, completed, cancelled, rolled_back
    planned_date DATETIME2,
    started_date DATETIME2,
    completed_date DATETIME2,
    rollback_date DATETIME2,
    rollback_reason NVARCHAR(1000),
    git_commit_hash NVARCHAR(40), -- Git commit referansı
    pull_request_url NVARCHAR(500),
    deployment_environment NVARCHAR(50), -- development, staging, production
    metadata NVARCHAR(MAX), -- JSON formatında ek bilgiler
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    created_by INT NOT NULL,
    updated_by INT,
    assigned_to INT, -- Sorumlu geliştirici
    reviewed_by INT, -- Code review yapan
    approved_by INT, -- Onaylayan
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
);

-- Etki analizi tablosu
CREATE TABLE impact_analysis (
    id INT IDENTITY(1,1) PRIMARY KEY,
    change_log_id INT NOT NULL,
    analysis_title NVARCHAR(200) NOT NULL,
    analysis_summary NVARCHAR(1000),
    risk_level NVARCHAR(20) NOT NULL, -- low, medium, high, critical
    confidence_score DECIMAL(3,2) DEFAULT 0.80, -- 0.00-1.00 arası güven skoru
    estimated_effort_hours INT, -- Tahmini iş yükü (saat)
    estimated_testing_hours INT, -- Tahmini test süresi
    breaking_changes_count INT DEFAULT 0,
    affected_components_count INT DEFAULT 0,
    affected_users_count INT DEFAULT 0,
    rollback_complexity NVARCHAR(20) DEFAULT 'medium', -- easy, medium, hard, impossible
    recommendations NVARCHAR(MAX), -- JSON formatında öneriler
    mitigation_strategies NVARCHAR(MAX), -- JSON formatında risk azaltma stratejileri
    testing_requirements NVARCHAR(MAX), -- JSON formatında test gereksinimleri
    deployment_notes NVARCHAR(2000),
    analysis_method NVARCHAR(50) DEFAULT 'manual', -- manual, automated, hybrid
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
);

-- Bileşen etkileri tablosu
CREATE TABLE component_impacts (
    id INT IDENTITY(1,1) PRIMARY KEY,
    impact_analysis_id INT NOT NULL,
    component_id INT NOT NULL,
    impact_type NVARCHAR(50) NOT NULL, -- direct, indirect, cascading
    impact_severity NVARCHAR(20) NOT NULL, -- minimal, moderate, significant, severe
    impact_description NVARCHAR(1000),
    requires_code_change BIT NOT NULL DEFAULT 0,
    requires_testing BIT NOT NULL DEFAULT 0,
    requires_documentation_update BIT NOT NULL DEFAULT 0,
    requires_deployment BIT NOT NULL DEFAULT 0,
    estimated_effort_hours INT DEFAULT 0,
    breaking_change BIT NOT NULL DEFAULT 0,
    backward_compatible BIT NOT NULL DEFAULT 1,
    migration_required BIT NOT NULL DEFAULT 0,
    migration_script NVARCHAR(MAX), -- Migration script veya talimatlar
    rollback_script NVARCHAR(MAX), -- Rollback script veya talimatlar
    testing_notes NVARCHAR(1000),
    deployment_notes NVARCHAR(1000),
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    created_by INT NOT NULL,
    
    CONSTRAINT FK_component_impacts_analysis FOREIGN KEY (impact_analysis_id) REFERENCES impact_analysis(id),
    CONSTRAINT FK_component_impacts_component FOREIGN KEY (component_id) REFERENCES components(id),
    CONSTRAINT FK_component_impacts_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT UQ_component_impacts UNIQUE (impact_analysis_id, component_id)
);

-- Etki analizi geçmişi tablosu
CREATE TABLE impact_analysis_history (
    id INT IDENTITY(1,1) PRIMARY KEY,
    impact_analysis_id INT NOT NULL,
    version_number INT NOT NULL,
    risk_level NVARCHAR(20) NOT NULL,
    confidence_score DECIMAL(3,2),
    analysis_summary NVARCHAR(1000),
    change_reason NVARCHAR(500), -- Neden güncellendi
    recommendations NVARCHAR(MAX),
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    created_by INT NOT NULL,
    
    CONSTRAINT FK_impact_analysis_history_analysis FOREIGN KEY (impact_analysis_id) REFERENCES impact_analysis(id),
    CONSTRAINT FK_impact_analysis_history_created_by FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Risk faktörleri tablosu
CREATE TABLE risk_factors (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL UNIQUE,
    description NVARCHAR(500),
    category NVARCHAR(50) NOT NULL, -- technical, business, security, performance, usability
    weight DECIMAL(3,2) NOT NULL DEFAULT 1.00, -- Risk ağırlığı (0.00-5.00)
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    created_by INT NOT NULL,
    
    CONSTRAINT FK_risk_factors_created_by FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Etki analizi-risk faktörleri ilişki tablosu
CREATE TABLE impact_risk_factors (
    id INT IDENTITY(1,1) PRIMARY KEY,
    impact_analysis_id INT NOT NULL,
    risk_factor_id INT NOT NULL,
    severity NVARCHAR(20) NOT NULL, -- low, medium, high, critical
    probability DECIMAL(3,2) NOT NULL, -- 0.00-1.00 arası olasılık
    impact_score DECIMAL(4,2) NOT NULL, -- Hesaplanan etki skoru
    mitigation_plan NVARCHAR(1000),
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    created_by INT NOT NULL,
    
    CONSTRAINT FK_impact_risk_factors_analysis FOREIGN KEY (impact_analysis_id) REFERENCES impact_analysis(id),
    CONSTRAINT FK_impact_risk_factors_risk FOREIGN KEY (risk_factor_id) REFERENCES risk_factors(id),
    CONSTRAINT FK_impact_risk_factors_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT UQ_impact_risk_factors UNIQUE (impact_analysis_id, risk_factor_id)
);