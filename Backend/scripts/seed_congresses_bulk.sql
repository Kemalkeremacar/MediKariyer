-- Kongre Takvimi - Bulk Seed Script (tekrar çalıştırılabilir)
-- Amaç: congresses tablosuna çok sayıda örnek kayıt eklemek.
-- Not: Aynı (title + start_date) kombinasyonu varsa insert edilmez.
--
-- Kullanım:
-- 1) SSMS/Azure Data Studio'da ilgili DB'ye bağlan
-- 2) Bu script'i çalıştır
--
-- Ayarlar:
DECLARE @RowsToInsert INT = 60;     -- kaç adet yeni kongre üretilecek
DECLARE @CreatedBy INT = 1;         -- users.id (nullable ama FK var)
DECLARE @StartFrom DATE = '2026-01-01';
DECLARE @EndTo DATE   = '2027-12-31';
DECLARE @SubspecialtyFillRate INT = 55; -- yüzde: kaç kayıtta subspecialty_id dolu olsun (0-100)

SET NOCOUNT ON;

IF OBJECT_ID('dbo.congresses', 'U') IS NULL
BEGIN
  RAISERROR('dbo.congresses tablosu bulunamadı. Önce create_congresses_table.sql çalıştırın.', 16, 1);
  RETURN;
END

IF NOT EXISTS (SELECT 1 FROM dbo.specialties)
BEGIN
  RAISERROR('dbo.specialties boş. Önce lookup seed işlemlerini çalıştırın.', 16, 1);
  RETURN;
END

DECLARE @Countries TABLE (country NVARCHAR(100), city NVARCHAR(100));
INSERT INTO @Countries(country, city) VALUES
  (N'Türkiye',   N'İstanbul'),
  (N'Türkiye',   N'Ankara'),
  (N'Türkiye',   N'İzmir'),
  (N'Türkiye',   N'Antalya'),
  (N'Almanya',   N'Berlin'),
  (N'Almanya',   N'Münih'),
  (N'İtalya',    N'Roma'),
  (N'İspanya',   N'Madrid'),
  (N'Fransa',    N'Paris'),
  (N'Hollanda',  N'Amsterdam'),
  (N'İngiltere', N'Londra'),
  (N'Avusturya', N'Viyana');

IF OBJECT_ID('dbo.specialties', 'U') IS NULL
BEGIN
  RAISERROR('dbo.specialties tablosu bulunamadı. Lookup tablolarını oluşturun.', 16, 1);
  RETURN;
END

IF OBJECT_ID('dbo.subspecialties', 'U') IS NULL
BEGIN
  RAISERROR('dbo.subspecialties tablosu bulunamadı. Lookup tablolarını oluşturun.', 16, 1);
  RETURN;
END

IF COL_LENGTH('dbo.congresses', 'specialty_id') IS NULL
BEGIN
  RAISERROR('dbo.congresses.specialty_id bulunamadı. Önce migrate_congresses_specialty_ids.sql çalıştırın.', 16, 1);
  RETURN;
END

IF COL_LENGTH('dbo.congresses', 'subspecialty_id') IS NULL
BEGIN
  RAISERROR('dbo.congresses.subspecialty_id bulunamadı. Önce migrate_congresses_specialty_ids.sql çalıştırın.', 16, 1);
  RETURN;
END

DECLARE @Venues TABLE (location NVARCHAR(200));
INSERT INTO @Venues(location) VALUES
  (N'Kongre Merkezi'),
  (N'Üniversite Kongre Salonu'),
  (N'Otel Konferans Salonu'),
  (N'Fuar ve Kongre Merkezi'),
  (N'Tıp Fakültesi Konferans Salonu'),
  (N'Kültür Merkezi');

DECLARE @Organizers TABLE (organizer NVARCHAR(200));
INSERT INTO @Organizers(organizer) VALUES
  (N'Ulusal Tıp Derneği'),
  (N'Uzmanlık Derneği'),
  (N'Akademik Kongre Organizasyonu'),
  (N'European Medical Society'),
  (N'International Congress Group'),
  (N'Tıp Fakültesi Dekanlığı');

DECLARE @i INT = 0;
DECLARE @Inserted INT = 0;

WHILE (@Inserted < @RowsToInsert) AND (@i < @RowsToInsert * 20)
BEGIN
  SET @i = @i + 1;

  -- Pseudo-random seçimler (NEWID() tabanlı)
  DECLARE @country NVARCHAR(100);
  DECLARE @city NVARCHAR(100);
  SELECT TOP 1 @country = country, @city = city
  FROM @Countries
  ORDER BY CHECKSUM(NEWID());

  DECLARE @specialty_id INT;
  DECLARE @specialty_name NVARCHAR(100);
  SELECT TOP 1
    @specialty_id = s.id,
    @specialty_name = s.name
  FROM dbo.specialties s
  ORDER BY CHECKSUM(NEWID());

  DECLARE @subspecialty_id INT = NULL;
  DECLARE @subspecialty_name NVARCHAR(200) = NULL;
  IF (ABS(CHECKSUM(NEWID())) % 100) < @SubspecialtyFillRate
  BEGIN
    SELECT TOP 1
      @subspecialty_id = ss.id,
      @subspecialty_name = ss.name
    FROM dbo.subspecialties ss
    WHERE ss.specialty_id = @specialty_id
    ORDER BY CHECKSUM(NEWID());
  END

  DECLARE @venue NVARCHAR(200);
  SELECT TOP 1 @venue = location
  FROM @Venues
  ORDER BY CHECKSUM(NEWID());

  DECLARE @org NVARCHAR(200);
  SELECT TOP 1 @org = organizer
  FROM @Organizers
  ORDER BY CHECKSUM(NEWID());

  -- Tarih üretimi
  DECLARE @rangeDays INT = DATEDIFF(DAY, @StartFrom, @EndTo);
  DECLARE @start DATE = DATEADD(DAY, ABS(CHECKSUM(NEWID())) % NULLIF(@rangeDays, 0), @StartFrom);
  DECLARE @duration INT = 1 + (ABS(CHECKSUM(NEWID())) % 4); -- 1-4 gün
  DECLARE @end DATE = DATEADD(DAY, @duration, @start);

  -- Başlık (deterministik ama farklı)
  DECLARE @year INT = YEAR(@start);
  DECLARE @seq INT = ABS(CHECKSUM(NEWID())) % 9000 + 1000;
  DECLARE @title NVARCHAR(200) =
    CONCAT(@specialty_name, N' Bilimsel Günleri ', @year, N' #', @seq);

  DECLARE @description NVARCHAR(MAX) =
    CONCAT(N'Güncel klinik uygulamalar, olgu sunumları ve workshop oturumları. ',
           N'Uzmanlık: ', @specialty_name,
           CASE WHEN @subspecialty_name IS NULL THEN N'' ELSE CONCAT(N' / ', @subspecialty_name) END,
           N'.');

  DECLARE @location NVARCHAR(200) =
    CONCAT(@city, N' ', @venue);

  DECLARE @website NVARCHAR(500) =
    CONCAT(N'https://congress.example/', LOWER(REPLACE(CONVERT(NVARCHAR(36), NEWID()), N'-', N'')));

  -- Mükerrer kontrolü: (title + start_date)
  IF NOT EXISTS (
    SELECT 1
    FROM dbo.congresses WITH (READPAST)
    WHERE title = @title AND start_date = @start
  )
  BEGIN
    INSERT INTO dbo.congresses (
      title,
      description,
      location,
      city,
      country,
      start_date,
      end_date,
      website_url,
      registration_url,
      organizer,
      specialty_id,
      subspecialty_id,
      is_active,
      created_by,
      updated_by
    ) VALUES (
      @title,
      @description,
      @location,
      @city,
      @country,
      @start,
      @end,
      @website,
      NULL,
      @org,
      @specialty_id,
      @subspecialty_id,
      1,
      @CreatedBy,
      @CreatedBy
    );

    SET @Inserted = @Inserted + 1;
  END
END

SELECT
  Inserted = @Inserted,
  Attempted = @i,
  TotalInTable = (SELECT COUNT(*) FROM dbo.congresses);

