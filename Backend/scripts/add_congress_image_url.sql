-- ============================================================
-- Congresses tablosuna image_url kolonu ekle
-- Guvenli: Kolon varsa eklemez.
-- Kullanim: SSMS'te dev ve canli DB'de calistir.
-- ============================================================

IF COL_LENGTH('dbo.congresses', 'image_url') IS NULL
BEGIN
  ALTER TABLE dbo.congresses ADD image_url NVARCHAR(MAX) NULL;
  PRINT 'image_url kolonu basariyla eklendi.';
END
ELSE
BEGIN
  PRINT 'image_url kolonu zaten mevcut. Islem yapilmadi.';
END
GO
