-- ============================================================================
-- Akış Haritaları ve Kullanıcı Yolculukları Tabloları
-- MediKariyer Dokümantasyon Sistemi
-- SQL Server Uyumlu
-- ============================================================================

-- Kullanıcı akışları tablosu
CREATE TABLE user_flows (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(200) NOT NULL,
    display_name NVARCHAR(250) NOT NULL,
    description NVARCHAR(1000),
    flow_type NVARCHAR(50) NOT NULL, -- user_journey, business_process, system_flow, error_flow
    target_role NVARCHAR(50), -- admin, doctor, hospital, public (hangi rol için)
    platform NVARCHAR(50), -- web, mobile, api, all
    priority NVARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
    complexity_score INT DEFAULT 1, -- 1-10 arası karmaşıklık skoru
    estimated_duration_minutes INT, -- Tahmini tamamlanma süresi
    success_criteria NVARCHAR(1000), -- Başarı kriterleri
    entry_points NVARCHAR(MAX), -- JSON formatında giriş noktaları
    exit_points NVARCHAR(MAX), -- JSON formatında çıkış noktaları
    prerequisites NVARCHAR(1000), -- Ön koşullar
    business_value NVARCHAR(500), -- İş değeri açıklaması
    usage_frequency NVARCHAR(20), -- daily, weekly, monthly, rarely
    last_reviewed_at DATETIME2,
    reviewed_by INT,
    is_active BIT NOT NULL DEFAULT 1,
    is_critical BIT NOT NULL DEFAULT 0, -- Kritik iş akışı mı
    is_documented BIT NOT NULL DEFAULT 0, -- Dokümantasyonu tamamlandı mı
    version NVARCHAR(20) DEFAULT '1.0.0',
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
);

-- Akış adımları tablosu
CREATE TABLE flow_steps (
    id INT IDENTITY(1,1) PRIMARY KEY,
    flow_id INT NOT NULL,
    step_number INT NOT NULL,
    step_name NVARCHAR(200) NOT NULL,
    step_description NVARCHAR(1000),
    step_type NVARCHAR(50) NOT NULL, -- action, decision, input, output, validation, navigation
    screen_name NVARCHAR(200), -- Hangi ekranda gerçekleşiyor
    component_id INT, -- İlgili bileşen
    user_action NVARCHAR(500), -- Kullanıcının yapması gereken eylem
    system_response NVARCHAR(500), -- Sistemin verdiği yanıt
    validation_rules NVARCHAR(MAX), -- JSON formatında doğrulama kuralları
    error_scenarios NVARCHAR(MAX), -- JSON formatında hata senaryoları
    success_conditions NVARCHAR(500), -- Başarı koşulları
    failure_conditions NVARCHAR(500), -- Başarısızlık koşulları
    estimated_duration_seconds INT, -- Tahmini adım süresi
    is_optional BIT NOT NULL DEFAULT 0, -- Opsiyonel adım mı
    is_critical BIT NOT NULL DEFAULT 0, -- Kritik adım mı
    requires_authentication BIT NOT NULL DEFAULT 0,
    requires_authorization BIT NOT NULL DEFAULT 0,
    required_permissions NVARCHAR(500), -- Gerekli izinler
    notes NVARCHAR(1000), -- Ek notlar
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
);

-- Ekran geçişleri tablosu
CREATE TABLE screen_transitions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    flow_id INT NOT NULL,
    from_screen NVARCHAR(200) NOT NULL,
    to_screen NVARCHAR(200) NOT NULL,
    trigger_event NVARCHAR(200) NOT NULL, -- button_click, form_submit, api_response, timer, etc.
    trigger_element NVARCHAR(200), -- Tetikleyici UI elementi
    transition_type NVARCHAR(50) NOT NULL, -- navigation, modal, redirect, ajax, popup
    conditions NVARCHAR(MAX), -- JSON formatında geçiş koşulları
    parameters NVARCHAR(MAX), -- JSON formatında geçirilen parametreler
    animation_type NVARCHAR(50), -- slide, fade, none, custom
    estimated_duration_ms INT DEFAULT 300, -- Geçiş süresi (milisaniye)
    is_conditional BIT NOT NULL DEFAULT 0, -- Koşullu geçiş mi
    is_reversible BIT NOT NULL DEFAULT 1, -- Geri dönülebilir mi
    success_rate DECIMAL(5,2), -- Başarı oranı (istatistik)
    error_scenarios NVARCHAR(MAX), -- JSON formatında hata senaryoları
    fallback_screen NVARCHAR(200), -- Hata durumunda gidilecek ekran
    notes NVARCHAR(1000),
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    created_by INT NOT NULL,
    updated_by INT,
    is_deleted BIT NOT NULL DEFAULT 0,
    deleted_at DATETIME2 NULL,
    deleted_by INT NULL,
    
    CONSTRAINT FK_screen_transitions_flow FOREIGN KEY (flow_id) REFERENCES user_flows(id),
    CONSTRAINT FK_screen_transitions_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT FK_screen_transitions_updated_by FOREIGN KEY (updated_by) REFERENCES users(id),
    CONSTRAINT FK_screen_transitions_deleted_by FOREIGN KEY (deleted_by) REFERENCES users(id)
);

-- Akış bağımlılıkları tablosu (akışlar arası ilişkiler)
CREATE TABLE flow_dependencies (
    id INT IDENTITY(1,1) PRIMARY KEY,
    source_flow_id INT NOT NULL,
    target_flow_id INT NOT NULL,
    dependency_type NVARCHAR(50) NOT NULL, -- prerequisite, triggers, includes, extends
    description NVARCHAR(500),
    is_required BIT NOT NULL DEFAULT 1, -- Zorunlu bağımlılık mı
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    created_by INT NOT NULL,
    
    CONSTRAINT FK_flow_dependencies_source FOREIGN KEY (source_flow_id) REFERENCES user_flows(id),
    CONSTRAINT FK_flow_dependencies_target FOREIGN KEY (target_flow_id) REFERENCES user_flows(id),
    CONSTRAINT FK_flow_dependencies_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT UQ_flow_dependencies UNIQUE (source_flow_id, target_flow_id, dependency_type),
    CONSTRAINT CHK_flow_dependencies_not_self CHECK (source_flow_id != target_flow_id)
);

-- Akış metrikleri tablosu (performans ve kullanım istatistikleri)
CREATE TABLE flow_metrics (
    id INT IDENTITY(1,1) PRIMARY KEY,
    flow_id INT NOT NULL,
    metric_date DATE NOT NULL,
    total_executions INT DEFAULT 0, -- Toplam çalıştırılma sayısı
    successful_executions INT DEFAULT 0, -- Başarılı tamamlanan
    failed_executions INT DEFAULT 0, -- Başarısız olan
    abandoned_executions INT DEFAULT 0, -- Yarıda bırakılan
    average_duration_seconds INT, -- Ortalama tamamlanma süresi
    median_duration_seconds INT, -- Medyan tamamlanma süresi
    bounce_rate DECIMAL(5,2), -- Hemen çıkma oranı
    conversion_rate DECIMAL(5,2), -- Dönüşüm oranı
    error_rate DECIMAL(5,2), -- Hata oranı
    most_common_exit_step INT, -- En çok çıkılan adım
    bottleneck_step INT, -- Darboğaz adım
    user_satisfaction_score DECIMAL(3,2), -- Kullanıcı memnuniyet skoru
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    
    CONSTRAINT FK_flow_metrics_flow FOREIGN KEY (flow_id) REFERENCES user_flows(id),
    CONSTRAINT FK_flow_metrics_exit_step FOREIGN KEY (most_common_exit_step) REFERENCES flow_steps(id),
    CONSTRAINT FK_flow_metrics_bottleneck_step FOREIGN KEY (bottleneck_step) REFERENCES flow_steps(id),
    CONSTRAINT UQ_flow_metrics UNIQUE (flow_id, metric_date)
);