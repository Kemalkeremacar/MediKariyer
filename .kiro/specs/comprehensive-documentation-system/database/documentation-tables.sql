-- ============================================================================
-- Dokümantasyon Tabloları
-- MediKariyer Dokümantasyon Sistemi
-- SQL Server Uyumlu
-- ============================================================================

-- Dokümantasyon bölümleri tablosu (hiyerarşik yapı)
CREATE TABLE documentation_sections (
    id INT IDENTITY(1,1) PRIMARY KEY,
    parent_id INT NULL, -- Hiyerarşik yapı için
    title NVARCHAR(200) NOT NULL,
    slug NVARCHAR(200) NOT NULL, -- URL-friendly identifier
    description NVARCHAR(1000),
    section_type NVARCHAR(50) NOT NULL, -- architecture, roles, flows, api, standards, impact
    display_order INT NOT NULL DEFAULT 0,
    icon NVARCHAR(50), -- UI için ikon adı
    is_system_section BIT NOT NULL DEFAULT 0, -- Sistem tarafından oluşturulan bölümler
    is_active BIT NOT NULL DEFAULT 1,
    is_public BIT NOT NULL DEFAULT 0, -- Herkese açık mı
    required_role NVARCHAR(50), -- Erişim için gerekli minimum rol
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
);

-- Dokümantasyon içerikleri tablosu
CREATE TABLE documentation_content (
    id INT IDENTITY(1,1) PRIMARY KEY,
    section_id INT NOT NULL,
    title NVARCHAR(300) NOT NULL,
    content NVARCHAR(MAX) NOT NULL, -- Markdown formatında içerik
    content_type NVARCHAR(50) NOT NULL DEFAULT 'markdown', -- markdown, html, json
    summary NVARCHAR(500), -- Kısa özet
    tags NVARCHAR(500), -- Virgülle ayrılmış etiketler
    metadata NVARCHAR(MAX), -- JSON formatında ek bilgiler
    version_number NVARCHAR(20) NOT NULL DEFAULT '1.0.0', -- Semantic versioning
    is_published BIT NOT NULL DEFAULT 0,
    is_featured BIT NOT NULL DEFAULT 0, -- Öne çıkarılan içerikler
    view_count INT NOT NULL DEFAULT 0,
    last_viewed_at DATETIME2 NULL,
    search_keywords NVARCHAR(1000), -- Arama için optimize edilmiş anahtar kelimeler
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
);

-- Dokümantasyon versiyon geçmişi tablosu
CREATE TABLE documentation_versions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    content_id INT NOT NULL,
    version_number NVARCHAR(20) NOT NULL,
    title NVARCHAR(300) NOT NULL,
    content NVARCHAR(MAX) NOT NULL,
    content_type NVARCHAR(50) NOT NULL DEFAULT 'markdown',
    summary NVARCHAR(500),
    change_description NVARCHAR(1000), -- Bu versiyonda yapılan değişiklikler
    change_type NVARCHAR(50) NOT NULL, -- major, minor, patch, hotfix
    is_current BIT NOT NULL DEFAULT 0, -- Mevcut aktif versiyon
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    created_by INT NOT NULL,
    
    CONSTRAINT FK_documentation_versions_content FOREIGN KEY (content_id) REFERENCES documentation_content(id),
    CONSTRAINT FK_documentation_versions_created_by FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Dokümantasyon yorumları tablosu
CREATE TABLE documentation_comments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    content_id INT NOT NULL,
    parent_comment_id INT NULL, -- Yanıt yapısı için
    comment_text NVARCHAR(2000) NOT NULL,
    is_resolved BIT NOT NULL DEFAULT 0, -- Geri bildirim çözüldü mü
    resolved_at DATETIME2 NULL,
    resolved_by INT NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    updated_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    created_by INT NOT NULL,
    updated_by INT,
    is_deleted BIT NOT NULL DEFAULT 0,
    deleted_at DATETIME2 NULL,
    deleted_by INT NULL,
    
    CONSTRAINT FK_documentation_comments_content FOREIGN KEY (content_id) REFERENCES documentation_content(id),
    CONSTRAINT FK_documentation_comments_parent FOREIGN KEY (parent_comment_id) REFERENCES documentation_comments(id),
    CONSTRAINT FK_documentation_comments_created_by FOREIGN KEY (created_by) REFERENCES users(id),
    CONSTRAINT FK_documentation_comments_updated_by FOREIGN KEY (updated_by) REFERENCES users(id),
    CONSTRAINT FK_documentation_comments_resolved_by FOREIGN KEY (resolved_by) REFERENCES users(id),
    CONSTRAINT FK_documentation_comments_deleted_by FOREIGN KEY (deleted_by) REFERENCES users(id)
);