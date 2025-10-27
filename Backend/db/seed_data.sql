USE [MEDIKARIYER]
GO

-- ==================== SEED DATA - LOOKUP TABLES ====================
-- Bu dosya, sistem için gerekli temel lookup verilerini içerir
-- SSMS'de çalıştırarak veritabanını hazır hale getirebilirsiniz

-- ==================== MEVCUT VERİLERİ TEMİZLE ====================
-- Önce mevcut lookup verilerini temizliyoruz
DELETE FROM [dbo].[subspecialties];
DELETE FROM [dbo].[languages];
DELETE FROM [dbo].[language_levels];
DELETE FROM [dbo].[doctor_education_types];
DELETE FROM [dbo].[job_statuses];
DELETE FROM [dbo].[application_statuses];
DELETE FROM [dbo].[specialties];
DELETE FROM [dbo].[cities];
GO

PRINT '🗑️ Mevcut lookup verileri temizlendi.'
GO

-- ==================== 1. CITIES (ŞEHİRLER) ====================
INSERT INTO [dbo].[cities] ([name], [country], [created_at], [updated_at])
VALUES
    (N'İstanbul', N'Türkiye', GETDATE(), GETDATE()),
    (N'Ankara', N'Türkiye', GETDATE(), GETDATE()),
    (N'İzmir', N'Türkiye', GETDATE(), GETDATE()),
    (N'Bursa', N'Türkiye', GETDATE(), GETDATE()),
    (N'Antalya', N'Türkiye', GETDATE(), GETDATE()),
    (N'Adana', N'Türkiye', GETDATE(), GETDATE()),
    (N'Gaziantep', N'Türkiye', GETDATE(), GETDATE()),
    (N'Konya', N'Türkiye', GETDATE(), GETDATE()),
    (N'Mersin', N'Türkiye', GETDATE(), GETDATE()),
    (N'Diyarbakır', N'Türkiye', GETDATE(), GETDATE());
GO

-- ==================== 2. SPECIALTIES (UZMANLIK ALANLARI) ====================
INSERT INTO [dbo].[specialties] ([code], [name], [description], [created_at])
VALUES
    (1, N'Kardiyoloji', N'Kalp ve damar hastalıkları', GETDATE()),
    (2, N'Genel Cerrahi', N'Genel cerrahi işlemleri', GETDATE()),
    (3, N'İç Hastalıkları', N'Dahiliye', GETDATE()),
    (4, N'Ortopedi', N'Kemik ve eklem hastalıkları', GETDATE()),
    (5, N'Nöroloji', N'Sinir sistemi hastalıkları', GETDATE()),
    (6, N'Üroloji', N'Üriner sistem hastalıkları', GETDATE()),
    (7, N'Gastroenteroloji', N'Sindirim sistemi hastalıkları', GETDATE()),
    (8, N'Onkoloji', N'Kanser tedavisi', GETDATE()),
    (9, N'Göğüs Hastalıkları', N'Akciğer hastalıkları', GETDATE()),
    (10, N'Kulak Burun Boğaz', N'KBB hastalıkları', GETDATE()),
    (11, N'Göz Hastalıkları', N'Göz hastalıkları ve cerrahisi', GETDATE()),
    (12, N'Dermatoloji', N'Cilt hastalıkları', GETDATE()),
    (13, N'Psikiyatri', N'Ruh sağlığı', GETDATE()),
    (14, N'Çocuk Hastalıkları', N'Pediatri', GETDATE()),
    (15, N'Acil Tıp', N'Acil servis', GETDATE());
GO

-- ==================== 3. APPLICATION STATUSES (BAŞVURU DURUMLARI) ====================
INSERT INTO [dbo].[application_statuses] ([name])
VALUES
    (N'Beklemede'),
    (N'İnceleniyor'),
    (N'Kabul Edildi'),
    (N'Red Edildi'),
    (N'Geri Çekildi');
GO

-- ==================== 4. JOB STATUSES (İŞ DURUMLARI) ====================
INSERT INTO [dbo].[job_statuses] ([name])
VALUES
    (N'Taslak'),
    (N'Aktif'),
    (N'Duraklatıldı'),
    (N'Kapatıldı'),
    (N'Süresi Doldu');
GO

-- ==================== 5. DOCTOR EDUCATION TYPES (DOKTOR EĞİTİM TÜRLERİ) ====================
INSERT INTO [dbo].[doctor_education_types] ([name])
VALUES
    (N'Tıp Fakültesi'),
    (N'Tıpta Uzmanlık'),
    (N'Yüksek Lisans'),
    (N'Doktora'),
    (N'Yan Dal Uzmanlığı');
GO

-- ==================== 6. LANGUAGE LEVELS (DİL SEVİYELERİ) ====================
INSERT INTO [dbo].[language_levels] ([name], [description])
VALUES
    (N'Başlangıç', N'A1 - Başlangıç seviyesi'),
    (N'Temel', N'A2 - Temel seviye'),
    (N'Orta', N'B1 - Orta seviye'),
    (N'Orta Üstü', N'B2 - Orta üstü seviye'),
    (N'İleri', N'C1 - İleri seviye'),
    (N'Ana Dil', N'C2 - Ana dil seviyesi');
GO

-- ==================== 7. LANGUAGES (DİLLER) ====================
INSERT INTO [dbo].[languages] ([name])
VALUES
    (N'Türkçe'),
    (N'İngilizce'),
    (N'Almanca'),
    (N'Fransızca'),
    (N'Arapça'),
    (N'İspanyolca'),
    (N'Rusça'),
    (N'Japonca');
GO

-- ==================== 8. SUBS PECIALTIES (YAN DAL ALANLARI) ====================
-- Yan dal alanları specialty_id'ye bağlı
INSERT INTO [dbo].[subspecialties] ([specialty_id], [name])
VALUES
    -- Kardiyoloji Yan Dalları (ID: 1)
    (1, N'Kardiyak Aritmi'),
    (1, N'Koroner Anjiografi'),
    (1, N'Kalp Transplantasyonu'),
    
    -- Genel Cerrahi Yan Dalları (ID: 2)
    (2, N'Laparoskopik Cerrahi'),
    (2, N'Vasküler Cerrahi'),
    (2, N'Trauma Cerrahisi'),
    
    -- İç Hastalıkları Yan Dalları (ID: 3)
    (3, N'Nefroloji'),
    (3, N'Romatoloji'),
    (3, N'Endokrinoloji'),
    
    -- Ortopedi Yan Dalları (ID: 4)
    (4, N'Omurga Cerrahisi'),
    (4, N'Artroplasti'),
    (4, N'El Cerrahisi'),
    
    -- Nöroloji Yan Dalları (ID: 5)
    (5, N'Epilepsi'),
    (5, N'Beyin Damar Hastalıkları'),
    (5, N'Nöromusküler Hastalıklar');
GO

PRINT '✅ Tüm lookup verileri başarıyla eklendi!'
GO

