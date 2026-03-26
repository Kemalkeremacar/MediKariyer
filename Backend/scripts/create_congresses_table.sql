-- Kongre Takvimi Tablosu
-- Bu tablo tıbbi kongre ve etkinlikleri saklar

-- Tablo varsa sil (geliştirme ortamı için)
IF OBJECT_ID('congresses', 'U') IS NOT NULL
  DROP TABLE congresses;
GO

CREATE TABLE congresses (
  id INT IDENTITY(1,1) PRIMARY KEY,
  
  -- Temel Bilgiler
  title NVARCHAR(200) NOT NULL,
  description NVARCHAR(MAX) NULL,
  
  -- Konum Bilgileri
  location NVARCHAR(200) NOT NULL,
  city NVARCHAR(100) NULL,
  country NVARCHAR(100) NOT NULL,
  
  -- Tarih Bilgileri
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  -- İletişim ve Kayıt
  website_url NVARCHAR(500) NULL,
  registration_url NVARCHAR(500) NULL,
  organizer NVARCHAR(200) NULL,
  
  -- Kategorizasyon
  specialty NVARCHAR(100) NULL,
  
  -- Durum
  is_active BIT DEFAULT 1 NOT NULL,
  
  -- Audit Alanları
  created_by INT NULL,
  updated_by INT NULL,
  deleted_by INT NULL,
  created_at DATETIME2 DEFAULT GETDATE() NOT NULL,
  updated_at DATETIME2 DEFAULT GETDATE() NOT NULL,
  deleted_at DATETIME2 NULL,
  
  -- Constraints
  CONSTRAINT chk_dates CHECK (end_date >= start_date),
  
  -- Foreign Keys
  CONSTRAINT fk_congresses_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_congresses_updated_by FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE NO ACTION,
  CONSTRAINT fk_congresses_deleted_by FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE NO ACTION
);
GO

-- İndeksler
CREATE INDEX idx_congresses_start_date ON congresses(start_date);
CREATE INDEX idx_congresses_end_date ON congresses(end_date);
CREATE INDEX idx_congresses_country ON congresses(country);
CREATE INDEX idx_congresses_city ON congresses(city);
CREATE INDEX idx_congresses_specialty ON congresses(specialty);
CREATE INDEX idx_congresses_is_active ON congresses(is_active);
CREATE INDEX idx_congresses_created_at ON congresses(created_at);
GO

-- Örnek veri ekle
INSERT INTO congresses (
  title, 
  description, 
  location, 
  city, 
  country, 
  start_date, 
  end_date, 
  website_url, 
  organizer, 
  specialty,
  created_by
) VALUES 
(
  N'Türk Kardiyoloji Derneği 39. Ulusal Kongresi',
  N'Kardiyoloji alanındaki en son gelişmelerin paylaşılacağı ulusal kongre',
  N'Hilton İstanbul Bomonti',
  N'İstanbul',
  N'Türkiye',
  '2026-10-15',
  '2026-10-18',
  'https://www.tkd.org.tr',
  N'Türk Kardiyoloji Derneği',
  N'Kardiyoloji',
  1
),
(
  N'Avrupa Nöroloji Kongresi 2026',
  N'Avrupa çapında nöroloji uzmanlarının buluşma noktası',
  N'Vienna International Centre',
  N'Viyana',
  N'Avusturya',
  '2026-06-20',
  '2026-06-23',
  'https://www.ean.org',
  N'European Academy of Neurology',
  N'Nöroloji',
  1
),
(
  N'Türk Ortopedi ve Travmatoloji Kongresi',
  N'Ortopedi ve travmatoloji alanındaki yenilikler',
  N'Antalya Kongre Merkezi',
  N'Antalya',
  N'Türkiye',
  '2026-11-05',
  '2026-11-08',
  'https://www.totbid.org.tr',
  N'Türk Ortopedi ve Travmatoloji Birliği Derneği',
  N'Ortopedi',
  1
);
GO
