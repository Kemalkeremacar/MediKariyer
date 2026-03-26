-- ============================================================
-- CANLI DB İÇİN - Congresses tablosu oluşturma
-- Güvenli: Tablo varsa OLUŞTURMAZ.
-- Kullanım: SSMS'te canlı DB'ye bağlan ve çalıştır.
-- ============================================================

-- 1) Ön kontrol: specialties ve subspecialties tabloları var mı?
IF OBJECT_ID('dbo.specialties', 'U') IS NULL
BEGIN
  RAISERROR('specialties tablosu bulunamadı! Önce lookup tablolarını oluşturun.', 16, 1);
  RETURN;
END

IF OBJECT_ID('dbo.subspecialties', 'U') IS NULL
BEGIN
  RAISERROR('subspecialties tablosu bulunamadı! Önce lookup tablolarını oluşturun.', 16, 1);
  RETURN;
END

-- 2) Tablo zaten varsa bilgi ver ve çık
IF OBJECT_ID('dbo.congresses', 'U') IS NOT NULL
BEGIN
  PRINT 'congresses tablosu zaten mevcut. İşlem yapılmadı.';
  RETURN;
END

-- 3) Tabloyu oluştur
CREATE TABLE congresses (
  id INT IDENTITY(1,1) PRIMARY KEY,
  
  title NVARCHAR(200) NOT NULL,
  description NVARCHAR(MAX) NULL,
  
  location NVARCHAR(200) NOT NULL,
  city NVARCHAR(100) NULL,
  country NVARCHAR(100) NOT NULL,
  
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  website_url NVARCHAR(500) NULL,
  registration_url NVARCHAR(500) NULL,
  organizer NVARCHAR(200) NULL,
  
  specialty_id INT NULL,
  subspecialty_id INT NULL,
  specialty NVARCHAR(100) NULL,
  
  image_url NVARCHAR(MAX) NULL,
  
  is_active BIT DEFAULT 1 NOT NULL,
  
  created_by INT NULL,
  updated_by INT NULL,
  deleted_by INT NULL,
  created_at DATETIME2 DEFAULT GETDATE() NOT NULL,
  updated_at DATETIME2 DEFAULT GETDATE() NOT NULL,
  deleted_at DATETIME2 NULL,
  
  CONSTRAINT chk_dates CHECK (end_date >= start_date),
  
  CONSTRAINT fk_congresses_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_congresses_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE NO ACTION,
  CONSTRAINT fk_congresses_deleted_by FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE NO ACTION,
  CONSTRAINT fk_congresses_specialty_id FOREIGN KEY (specialty_id) REFERENCES specialties(id) ON DELETE SET NULL,
  CONSTRAINT fk_congresses_subspecialty_id FOREIGN KEY (subspecialty_id) REFERENCES subspecialties(id) ON DELETE SET NULL
);
GO

-- 4) İndeksler
CREATE INDEX idx_congresses_start_date ON congresses(start_date);
CREATE INDEX idx_congresses_end_date ON congresses(end_date);
CREATE INDEX idx_congresses_country ON congresses(country);
CREATE INDEX idx_congresses_city ON congresses(city);
CREATE INDEX idx_congresses_specialty_id ON congresses(specialty_id);
CREATE INDEX idx_congresses_subspecialty_id ON congresses(subspecialty_id);
CREATE INDEX idx_congresses_is_active ON congresses(is_active);
CREATE INDEX idx_congresses_created_at ON congresses(created_at);
GO

-- 5) Sonuç
PRINT 'congresses tablosu basariyla olusturuldu.';
SELECT 
  'congresses' AS TableName,
  (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'congresses') AS ColumnCount,
  (SELECT COUNT(*) FROM sys.indexes WHERE object_id = OBJECT_ID('dbo.congresses') AND name LIKE 'idx_%') AS IndexCount,
  (SELECT COUNT(*) FROM sys.foreign_keys WHERE parent_object_id = OBJECT_ID('dbo.congresses')) AS ForeignKeyCount;
GO
