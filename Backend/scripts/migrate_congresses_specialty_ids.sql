-- Migration: congresses tablosuna specialty_id + subspecialty_id ekle
-- Amaç: Kongreleri lookup tablolarına normalize etmek (Option B)
-- Güvenli: Kolonlar zaten varsa tekrar eklemez.

SET NOCOUNT ON;

IF OBJECT_ID('dbo.congresses', 'U') IS NULL
BEGIN
  RAISERROR('dbo.congresses tablosu bulunamadı.', 16, 1);
  RETURN;
END

-- 1) Kolonları ekle
IF COL_LENGTH('dbo.congresses', 'specialty_id') IS NULL
BEGIN
  ALTER TABLE dbo.congresses ADD specialty_id INT NULL;
END

IF COL_LENGTH('dbo.congresses', 'subspecialty_id') IS NULL
BEGIN
  ALTER TABLE dbo.congresses ADD subspecialty_id INT NULL;
END

-- 2) Backfill (mevcut string specialty alanından)
IF COL_LENGTH('dbo.congresses', 'specialty') IS NOT NULL
BEGIN
  -- Not: SQL Server aynı batch içinde yeni kolon referansını compile aşamasında tanımaz.
  -- Bu yüzden dynamic SQL ile çalıştırıyoruz.
  EXEC sys.sp_executesql N'
    UPDATE c
      SET c.specialty_id = s.id
    FROM dbo.congresses c
    INNER JOIN dbo.specialties s ON s.name = c.specialty
    WHERE c.specialty_id IS NULL AND c.specialty IS NOT NULL;
  ';
END

-- 3) Foreign key'ler (varsa geç)
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fk_congresses_specialty_id')
BEGIN
  EXEC sys.sp_executesql N'
    ALTER TABLE dbo.congresses
      ADD CONSTRAINT fk_congresses_specialty_id
        FOREIGN KEY (specialty_id) REFERENCES dbo.specialties(id)
        ON DELETE SET NULL;
  ';
END

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'fk_congresses_subspecialty_id')
BEGIN
  EXEC sys.sp_executesql N'
    ALTER TABLE dbo.congresses
      ADD CONSTRAINT fk_congresses_subspecialty_id
        FOREIGN KEY (subspecialty_id) REFERENCES dbo.subspecialties(id)
        ON DELETE SET NULL;
  ';
END

-- 4) Index'ler
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_congresses_specialty_id' AND object_id = OBJECT_ID('dbo.congresses'))
BEGIN
  EXEC sys.sp_executesql N'
    CREATE INDEX idx_congresses_specialty_id ON dbo.congresses(specialty_id);
  ';
END

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'idx_congresses_subspecialty_id' AND object_id = OBJECT_ID('dbo.congresses'))
BEGIN
  EXEC sys.sp_executesql N'
    CREATE INDEX idx_congresses_subspecialty_id ON dbo.congresses(subspecialty_id);
  ';
END

DECLARE @BackfilledSpecialty INT = 0;
DECLARE @BackfilledSubspecialty INT = 0;

IF COL_LENGTH('dbo.congresses', 'specialty_id') IS NOT NULL
BEGIN
  EXEC sys.sp_executesql
    N'SELECT @out = COUNT(*) FROM dbo.congresses WHERE specialty_id IS NOT NULL;',
    N'@out INT OUTPUT',
    @out = @BackfilledSpecialty OUTPUT;
END

IF COL_LENGTH('dbo.congresses', 'subspecialty_id') IS NOT NULL
BEGIN
  EXEC sys.sp_executesql
    N'SELECT @out = COUNT(*) FROM dbo.congresses WHERE subspecialty_id IS NOT NULL;',
    N'@out INT OUTPUT',
    @out = @BackfilledSubspecialty OUTPUT;
END

SELECT
  AddedColumns = 1,
  BackfilledSpecialty = @BackfilledSpecialty,
  BackfilledSubspecialty = @BackfilledSubspecialty;

