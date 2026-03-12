-- ============================================================================
-- Bileşen İlişkileri ve Bağımlılık Tabloları
-- MediKariyer Dokümantasyon Sistemi
-- SQL Server Uyumlu
-- ============================================================================

-- Sistem bileşenleri tablosu
CREATE TABLE components (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(200) NOT NULL,
    display_name NVARCHAR(250) NOT NULL,
    description NVARCHAR(1000),
    component_type NVARCHAR(50) NOT NULL, -- backend, frontend, mobile, shared, database, external
    layer NVARCHAR(50) NOT NULL, -- presentation, business, data, infrastructure
    file_path NVARCHAR(500), -- Dosya yolu (varsa)
    namespace NVARCHAR(200), -- Namespace veya module adı
    version NVARCHAR(20), -- Bileşen versiyonu
    status NVARCHAR(50) NOT NULL DEFAULT 'active', -- active, deprecated, planned, removed
    complexity_score INT DEFAULT 0, -- 1-10 arası karmaşıklık skoru
    maintainer_id INT, -- Sorumlu geliştirici
    documentation_url NVARCHAR(500), -- Bileşene özel dokümantasyon linki
    repository_url NVARCHAR(500), -- Kaynak kod repository linki
    last_analyzed_at DATETIME2, -- Son analiz tarihi
    metadata NVARCHAR(MAX), -- JSON formatında ek bilgiler
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
);

-- Bileşen bağımlılıkları tablosu
CREATE TABLE component_dependencies (
    id INT IDENTITY(1,1) PRIMARY KEY,
    source_component_id INT NOT NULL, -- Bağımlılığı olan bileşen
    target_component_id INT NOT NULL, -- Bağımlılık hedefi
    dependency_type NVARCHAR(50) NOT NULL, -- hard, soft, optional, dev, runtime
    relationship_type NVARCHAR(50) NOT NULL, -- uses, extends, implements, imports, calls
    description NVARCHAR(500),
    is_critical BIT NOT NULL DEFAULT 0, -- Kritik bağımlılık mı
    strength NVARCHAR(20) DEFAULT 'medium', -- weak, medium, strong
    detected_method NVARCHAR(50), -- manual, static_analysis, runtime_analysis
    confidence_score DECIMAL(3,2) DEFAULT 1.00, -- 0.00-1.00 arası güven skoru
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
);

-- Bileşen arayüzleri tablosu
CREATE TABLE component_interfaces (
    id INT IDENTITY(1,1) PRIMARY KEY,
    component_id INT NOT NULL,
    interface_name NVARCHAR(200) NOT NULL,
    interface_type NVARCHAR(50) NOT NULL, -- api, function, class, event, database
    method NVARCHAR(20), -- GET, POST, PUT, DELETE (API için)
    endpoint NVARCHAR(500), -- API endpoint veya function signature
    parameters NVARCHAR(MAX), -- JSON formatında parametre bilgileri
    return_type NVARCHAR(200), -- Dönüş tipi
    description NVARCHAR(1000),
    is_public BIT NOT NULL DEFAULT 1, -- Dış kullanım için açık mı
    is_deprecated BIT NOT NULL DEFAULT 0,
    deprecated_since NVARCHAR(20), -- Hangi versiyondan itibaren deprecated
    replacement_interface NVARCHAR(200), -- Yerine kullanılacak arayüz
    usage_count INT DEFAULT 0, -- Kaç yerde kullanıldığı
    last_used_at DATETIME2,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    created_by INT NOT NULL,
    updated_by INT,
    is_deleted BIT NOT NULL DEFAULT 0,
    deleted_at DATETIME2 NULL,
    deleted_by INT NULL,
    
    CONSTRAINT FK_component_interfaces_component FOREIGN KEY (component_id) REFERENCES components(id),
    CONSTRAINT FK_component_interfaces_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT FK_component_interfaces_updated_by FOREIGN KEY (updated_by) REFERENCES users(id),
    CONSTRAINT FK_component_interfaces_deleted_by FOREIGN KEY (deleted_by) REFERENCES users(id),
    CONSTRAINT UQ_component_interfaces UNIQUE (component_id, interface_name, interface_type)
);

-- Bileşen etiketleri tablosu (many-to-many için)
CREATE TABLE component_tags (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(50) NOT NULL UNIQUE,
    display_name NVARCHAR(100) NOT NULL,
    color NVARCHAR(7), -- Hex color code
    description NVARCHAR(200),
    is_system_tag BIT NOT NULL DEFAULT 0,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    created_by INT NOT NULL,
    
    CONSTRAINT FK_component_tags_created_by FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Bileşen-etiket ilişki tablosu
CREATE TABLE component_tag_relations (
    id INT IDENTITY(1,1) PRIMARY KEY,
    component_id INT NOT NULL,
    tag_id INT NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    created_by INT NOT NULL,
    
    CONSTRAINT FK_component_tag_relations_component FOREIGN KEY (component_id) REFERENCES components(id),
    CONSTRAINT FK_component_tag_relations_tag FOREIGN KEY (tag_id) REFERENCES component_tags(id),
    CONSTRAINT FK_component_tag_relations_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT UQ_component_tag_relations UNIQUE (component_id, tag_id)
);