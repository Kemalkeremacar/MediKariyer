-- ============================================================================
-- Kullanıcı Rolleri ve Yetkileri Tabloları
-- MediKariyer Dokümantasyon Sistemi
-- SQL Server Uyumlu
-- ============================================================================

-- Dokümantasyon rolleri tablosu
-- Mevcut users.role (admin, doctor, hospital) ile mapping yapılacak
CREATE TABLE documentation_roles (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(50) NOT NULL UNIQUE,
    display_name NVARCHAR(100) NOT NULL,
    description NVARCHAR(500),
    is_system_role BIT NOT NULL DEFAULT 0, -- Sistem tarafından tanımlı roller
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
);

-- Dokümantasyon izinleri tablosu
CREATE TABLE documentation_permissions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL UNIQUE,
    display_name NVARCHAR(150) NOT NULL,
    description NVARCHAR(500),
    resource NVARCHAR(100) NOT NULL, -- hangi kaynak (documentation, components, flows, etc.)
    action NVARCHAR(50) NOT NULL, -- hangi eylem (create, read, update, delete, analyze)
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
);

-- Rol-izin ilişki tablosu (many-to-many)
CREATE TABLE role_permissions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    is_granted BIT NOT NULL DEFAULT 1,
    conditions NVARCHAR(MAX), -- JSON format koşullar (örn: sadece kendi oluşturduğu içerik)
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
);

-- Kullanıcı-dokümantasyon rolleri atama tablosu
CREATE TABLE user_documentation_roles (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    is_active BIT NOT NULL DEFAULT 1,
    assigned_at DATETIME2 NOT NULL DEFAULT GETDATE(),
    expires_at DATETIME2 NULL, -- Geçici rol atamaları için
    assigned_by INT NOT NULL,
    revoked_at DATETIME2 NULL,
    revoked_by INT NULL,
    revoke_reason NVARCHAR(500) NULL,
    is_deleted BIT NOT NULL DEFAULT 0,
    deleted_at DATETIME2 NULL,
    deleted_by INT NULL,
    
    CONSTRAINT FK_user_documentation_roles_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT FK_user_documentation_roles_role FOREIGN KEY (role_id) REFERENCES documentation_roles(id),
    CONSTRAINT FK_user_documentation_roles_assigned_by FOREIGN KEY (assigned_by) REFERENCES users(id),
    CONSTRAINT FK_user_documentation_roles_revoked_by FOREIGN KEY (revoked_by) REFERENCES users(id),
    CONSTRAINT FK_user_documentation_roles_deleted_by FOREIGN KEY (deleted_by) REFERENCES users(id),
    CONSTRAINT UQ_user_documentation_roles UNIQUE (user_id, role_id)
);