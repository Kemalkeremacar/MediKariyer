const puppeteer = require('puppeteer');

class PDFService {
  constructor() {
    this.browser = null;
  }

  async initBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }
    return this.browser;
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Generate Job Posting PDF
   */
  async generateJobPostingPDF(jobData) {
    try {
      console.log('Starting PDF generation for job:', jobData.jobId);
      const browser = await this.initBrowser();
      const page = await browser.newPage();

      // Logo URL'sini kısalt (sadece ilk 100 karakter)
      if (jobData.hospitalLogo && jobData.hospitalLogo.length > 100) {
        console.log('Hospital logo URL length:', jobData.hospitalLogo.length, 'chars (truncated in log)');
      }

      const html = this.generateJobPostingHTML(jobData);
      console.log('HTML generated, length:', html.length);
      
      // Base64 görseller için load event'ini bekle
      await page.setContent(html, { 
        waitUntil: 'load',
        timeout: 30000 
      });
      console.log('HTML content set in page');
      
      // Görsellerin render olması için bekleme
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        }
      });

      console.log('PDF generated, size:', pdf.length, 'bytes');
      await page.close();
      
      return pdf;
    } catch (error) {
      console.error('PDF generation error:', error);
      throw error;
    }
  }

  /**
   * Generate Application PDF (Job + Doctor Profile)
   */
  async generateApplicationPDF(applicationData) {
    try {
      console.log('Starting PDF generation for application:', applicationData.applicationId);
      const browser = await this.initBrowser();
      const page = await browser.newPage();

      // Profil fotoğrafı URL'sini kısalt (sadece ilk 100 karakter)
      if (applicationData.doctor?.profilePhoto && applicationData.doctor.profilePhoto.length > 100) {
        console.log('Profile photo URL length:', applicationData.doctor.profilePhoto.length, 'chars (truncated in log)');
      }

      const html = this.generateApplicationHTML(applicationData);
      console.log('HTML generated, length:', html.length);
      
      // Base64 görseller için load event'ini bekle
      await page.setContent(html, { 
        waitUntil: 'load',
        timeout: 30000 
      });
      console.log('HTML content set in page');
      
      // Görsellerin render olması için bekleme
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        }
      });

      console.log('PDF generated, size:', pdf.length, 'bytes');
      await page.close();
      
      return pdf;
    } catch (error) {
      console.error('PDF generation error:', error);
      throw error;
    }
  }

  /**
   * Generate HTML for Job Posting PDF
   */
  generateJobPostingHTML(jobData) {
    const {
      jobId,
      hospitalName,
      hospitalLogo,
      hospitalCity,
      hospitalAddress,
      hospitalPhone,
      hospitalEmail,
      hospitalWebsite,
      jobTitle,
      workType,
      region,
      status,
      specialty,
      subSpecialty,
      minExperience,
      requirements,
      description,
      workingHours,
      benefits,
      createdAt
    } = jobData;

    return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>İlan Detayı - ${jobId}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #333;
      line-height: 1.6;
    }
    
    .page-title {
      text-align: center;
      font-size: 20px;
      font-weight: bold;
      color: #1e40af;
      padding: 15px 0;
      margin-bottom: 10px;
    }
    
    .header {
      background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
      color: white;
      padding: 30px;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 8px;
    }
    
    .hospital-info {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    
    .hospital-logo-container {
      width: 80px;
      height: 80px;
      background: white;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .hospital-logo-img {
      width: 100%;
      height: 100%;
      border-radius: 8px;
      object-fit: contain;
      padding: 8px;
    }
    
    .hospital-logo-text {
      font-size: 32px;
      font-weight: bold;
      color: #2563eb;
    }
    
    .hospital-name {
      font-size: 24px;
      font-weight: 700;
      color: white;
    }
    
    .content {
      padding: 30px;
    }
    
    .section {
      margin-bottom: 25px;
    }
    
    .section-title {
      font-size: 18px;
      font-weight: bold;
      color: #1e40af;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #2563eb;
    }
    
    .info-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    
    .info-table tr {
      border-bottom: 1px solid #e0e0e0;
    }
    
    .info-table td {
      padding: 10px 15px;
      font-size: 14px;
    }
    
    .info-table td:first-child {
      font-weight: 600;
      color: #1a1a1a;
      width: 180px;
      background: #f8f9fa;
    }
    
    .info-table td:last-child {
      color: #1a1a1a;
      font-weight: 500;
    }
    
    .detail-box {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 15px;
      border-left: 4px solid #2563eb;
    }
    
    .detail-box h4 {
      color: #1e40af;
      margin-bottom: 10px;
      font-size: 15px;
      font-weight: bold;
    }
    
    .detail-box p {
      color: #1a1a1a;
      font-size: 14px;
      line-height: 1.8;
      white-space: pre-wrap;
    }
    
    .page-break {
      page-break-before: always;
    }
    
    .hospital-info-section {
      background: #dbeafe;
      padding: 20px;
      border-radius: 8px;
      margin-top: 20px;
    }
    
    .hospital-info-item {
      display: flex;
      margin-bottom: 10px;
      font-size: 14px;
    }
    
    .hospital-info-label {
      font-weight: 600;
      width: 120px;
      color: #1a1a1a;
    }
    
    .hospital-info-item span:last-child {
      color: #1a1a1a;
      flex: 1;
    }
    
    .footer {
      background: #f8f9fa;
      padding: 15px 20px;
      text-align: center;
      border-radius: 8px;
      margin-top: 30px;
      border-top: 2px solid #e0e0e0;
    }
    
    .footer p {
      font-size: 11px;
      color: #666;
      margin: 3px 0;
    }
  </style>
</head>
<body>
  <div class="page-title">MediKariyer.net İş İlanı</div>
  
  <div class="header">
    <div class="hospital-info">
      <div class="hospital-logo-container">
        ${hospitalLogo && hospitalLogo.startsWith('data:image') 
          ? `<img src="${hospitalLogo}" alt="Hospital Logo" class="hospital-logo-img">` 
          : `<div class="hospital-logo-text">${hospitalName.charAt(0)}</div>`}
      </div>
      <div class="hospital-name">${hospitalName}</div>
    </div>
  </div>

  <div class="content">
    <div class="section">
      <h2 class="section-title">İlan Detayları</h2>
      <table class="info-table">
        <tr>
          <td>İlan Başlığı</td>
          <td><strong>${jobTitle}</strong></td>
        </tr>
        <tr>
          <td>İlan Tarihi</td>
          <td>${new Date(createdAt).toLocaleDateString('tr-TR')}</td>
        </tr>
        <tr>
          <td>Uzmanlık</td>
          <td><strong>${specialty}</strong></td>
        </tr>
        <tr>
          <td>Yan Dal Uzmanlığı</td>
          <td>${subSpecialty || '-'}</td>
        </tr>
        <tr>
          <td>Çalışma Türü</td>
          <td>${workType}</td>
        </tr>
        <tr>
          <td>Şehir</td>
          <td>${region}</td>
        </tr>
        ${minExperience !== null && minExperience !== undefined ? `
        <tr>
          <td>Minimum Deneyim</td>
          <td><strong>${minExperience} yıl</strong></td>
        </tr>
        ` : ''}
      </table>
    </div>

    ${description ? `
    <div class="section">
      <h2 class="section-title">İlan Açıklaması</h2>
      <div class="detail-box">
        <p>${description}</p>
      </div>
    </div>
    ` : ''}
    
    ${requirements || workingHours || benefits ? `
    <div class="section">
      <h2 class="section-title">Detay Bilgileri</h2>
      
      ${requirements ? `
      <div class="detail-box">
        <h4>Aranan Nitelikler</h4>
        <p>${requirements}</p>
      </div>
      ` : ''}
      
      ${workingHours ? `
      <div class="detail-box">
        <h4>Çalışma Saatleri</h4>
        <p>${workingHours}</p>
      </div>
      ` : ''}
      
      ${benefits ? `
      <div class="detail-box">
        <h4>Sağlanan İmkanlar</h4>
        <p>${benefits}</p>
      </div>
      ` : ''}
    </div>
    ` : ''}
  </div>

  <div class="page-break"></div>

  <div class="content">
    <div class="section">
      <h2 class="section-title">HASTANE BİLGİLERİ</h2>
      <div class="hospital-info-section">
        <div class="hospital-info-item">
          <span class="hospital-info-label">Hastane Adı:</span>
          <span>${hospitalName}</span>
        </div>
        ${hospitalCity ? `
        <div class="hospital-info-item">
          <span class="hospital-info-label">Şehir:</span>
          <span>${hospitalCity}</span>
        </div>
        ` : ''}
        ${hospitalAddress ? `
        <div class="hospital-info-item">
          <span class="hospital-info-label">Adres:</span>
          <span>${hospitalAddress}</span>
        </div>
        ` : ''}
        ${hospitalPhone ? `
        <div class="hospital-info-item">
          <span class="hospital-info-label">Telefon:</span>
          <span>${hospitalPhone}</span>
        </div>
        ` : ''}
        ${hospitalEmail ? `
        <div class="hospital-info-item">
          <span class="hospital-info-label">E-posta:</span>
          <span>${hospitalEmail}</span>
        </div>
        ` : ''}
        ${hospitalWebsite ? `
        <div class="hospital-info-item">
          <span class="hospital-info-label">Web Site:</span>
          <span>${hospitalWebsite}</span>
        </div>
        ` : ''}
      </div>
    </div>
  </div>

  <div class="footer">
    <p>Bu belge MediKariyer.net sistemi tarafından otomatik olarak üretilmiştir.</p>
    <p>Oluşturulma Zamanı: ${new Date().toLocaleString('tr-TR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    })}</p>
  </div>
</body>
</html>
    `;
  }

  /**
   * Generate HTML for Application PDF
   */
  generateApplicationHTML(applicationData) {
    const {
      applicationId,
      jobTitle,
      jobDescription,
      employmentType,
      hospitalName,
      hospitalLogo,
      hospitalCity,
      hospitalAddress,
      hospitalPhone,
      hospitalEmail,
      hospitalWebsite,
      doctor,
      applicationDate,
      status,
      doctorNote
    } = applicationData;

    return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Başvuru Detayı - ${applicationId}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #333;
      line-height: 1.6;
    }
    
    .page-title {
      text-align: center;
      font-size: 20px;
      font-weight: bold;
      color: #1e40af;
      padding: 15px 0;
      margin-bottom: 10px;
    }
    
    .header {
      background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
      color: white;
      padding: 30px;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 8px;
    }
    
    .hospital-info {
      display: flex;
      align-items: center;
      gap: 20px;
    }
    
    .hospital-logo-container {
      width: 80px;
      height: 80px;
      background: white;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    
    .hospital-logo-img {
      width: 100%;
      height: 100%;
      border-radius: 8px;
      object-fit: contain;
      padding: 8px;
    }
    
    .hospital-logo-text {
      font-size: 32px;
      font-weight: bold;
      color: #2563eb;
    }
    
    .hospital-name {
      font-size: 24px;
      font-weight: 700;
      color: white;
    }
    
    .content {
      padding: 30px;
    }
    
    .section {
      margin-bottom: 25px;
    }
    
    .section-title {
      font-size: 18px;
      font-weight: bold;
      color: #1e40af;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #2563eb;
    }
    
    .info-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    
    .info-table tr {
      border-bottom: 1px solid #e0e0e0;
    }
    
    .info-table td {
      padding: 10px 15px;
      font-size: 14px;
    }
    
    .info-table td:first-child {
      font-weight: 600;
      color: #1a1a1a;
      width: 180px;
      background: #f8f9fa;
    }
    
    .info-table td:last-child {
      color: #1a1a1a;
      font-weight: 500;
    }
    
    .detail-box {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 15px;
      border-left: 4px solid #2563eb;
    }
    
    .detail-box h4 {
      color: #1e40af;
      margin-bottom: 10px;
      font-size: 15px;
      font-weight: bold;
    }
    
    .detail-box p {
      color: #1a1a1a;
      font-size: 14px;
      line-height: 1.8;
      white-space: pre-wrap;
    }
    
    .page-break {
      page-break-before: always;
    }
    
    .hospital-info-section {
      background: #dbeafe;
      padding: 20px;
      border-radius: 8px;
      margin-top: 20px;
    }
    
    .hospital-info-item {
      display: flex;
      margin-bottom: 10px;
      font-size: 14px;
    }
    
    .hospital-info-label {
      font-weight: 600;
      width: 120px;
      color: #1a1a1a;
    }
    
    .hospital-info-item span:last-child {
      color: #1a1a1a;
      flex: 1;
    }
    
    .footer {
      background: #f8f9fa;
      padding: 15px 20px;
      text-align: center;
      border-radius: 8px;
      margin-top: 30px;
      border-top: 2px solid #e0e0e0;
    }
    
    .footer p {
      font-size: 11px;
      color: #666;
      margin: 3px 0;
    }
  </style>
</head>
<body>
  <div class="page-title">MediKariyer.net Başvuru Belgesi</div>
  
  <div class="header">
    <div class="hospital-info">
      <div class="hospital-logo-container">
        ${hospitalLogo && hospitalLogo.startsWith('data:image') 
          ? `<img src="${hospitalLogo}" alt="Hospital Logo" class="hospital-logo-img">` 
          : `<div class="hospital-logo-text">${hospitalName.charAt(0)}</div>`}
      </div>
      <div class="hospital-name">${hospitalName}</div>
    </div>
  </div>

  <div class="content">
    <div class="section">
      <h2 class="section-title">Doktor Bilgileri</h2>
      <table class="info-table">
        <tr>
          <td>Ad Soyad</td>
          <td><strong>${doctor.fullName}</strong></td>
        </tr>
        <tr>
          <td>Uzmanlık</td>
          <td><strong>${doctor.specialty}</strong></td>
        </tr>
        <tr>
          <td>Yan Dal Uzmanlığı</td>
          <td>${doctor.subSpecialty || '-'}</td>
        </tr>
        <tr>
          <td>E-posta</td>
          <td>${doctor.email}</td>
        </tr>
        <tr>
          <td>Telefon</td>
          <td>${doctor.phone}</td>
        </tr>
        <tr>
          <td>Şehir</td>
          <td>${doctor.city || '-'}</td>
        </tr>
        ${doctor.birthDate ? `
        <tr>
          <td>Doğum Tarihi</td>
          <td>${new Date(doctor.birthDate).toLocaleDateString('tr-TR')}</td>
        </tr>
        ` : ''}
      </table>
    </div>

    ${doctor.education && doctor.education.length > 0 ? `
    <div class="section">
      <h2 class="section-title">Eğitim Bilgileri</h2>
      ${doctor.education.map(edu => `
        <div class="detail-box">
          <h4>${edu.education_institution || 'Belirtilmemiş'}</h4>
          <p>${edu.education_type_name || ''} ${edu.field ? `- ${edu.field}` : ''}
${edu.graduation_year ? `Mezuniyet: ${edu.graduation_year}` : ''}</p>
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${doctor.experience && doctor.experience.length > 0 ? `
    <div class="section">
      <h2 class="section-title">Deneyim Bilgileri</h2>
      ${doctor.experience.map(exp => `
        <div class="detail-box">
          <h4>${exp.role_title || 'Belirtilmemiş'} - ${exp.organization || 'Belirtilmemiş'}</h4>
          <p>${exp.start_date ? new Date(exp.start_date).toLocaleDateString('tr-TR') : ''} - ${exp.end_date ? new Date(exp.end_date).toLocaleDateString('tr-TR') : 'Devam Ediyor'}
${exp.specialty_name ? `Uzmanlık: ${exp.specialty_name}${exp.subspecialty_name ? ` / ${exp.subspecialty_name}` : ''}` : ''}
${exp.description ? `\n${exp.description}` : ''}</p>
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${doctor.certificates && doctor.certificates.length > 0 ? `
    <div class="section">
      <h2 class="section-title">Sertifikalar</h2>
      ${doctor.certificates.map(cert => `
        <div class="detail-box">
          <h4>${cert.certificate_name || 'Belirtilmemiş'}</h4>
          <p>${cert.institution || ''} ${cert.certificate_year ? `| ${cert.certificate_year}` : ''}</p>
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${doctor.languages && doctor.languages.length > 0 ? `
    <div class="section">
      <h2 class="section-title">Dil Bilgileri</h2>
      ${doctor.languages.map(lang => `
        <div class="detail-box">
          <h4>${lang.language_name || 'Belirtilmemiş'}</h4>
          <p>Seviye: ${lang.level_name || 'Belirtilmemiş'}</p>
        </div>
      `).join('')}
    </div>
    ` : ''}
  </div>

  <div class="page-break"></div>

  <div class="content">
    <div class="section">
      <h2 class="section-title">Başvuru Bilgileri</h2>
      <table class="info-table">
        <tr>
          <td>Başvuru ID</td>
          <td><strong>${applicationId}</strong></td>
        </tr>
        <tr>
          <td>İlan Başlığı</td>
          <td><strong>${jobTitle}</strong></td>
        </tr>
        <tr>
          <td>Çalışma Türü</td>
          <td>${employmentType || '-'}</td>
        </tr>
        <tr>
          <td>Başvuru Tarihi</td>
          <td>${new Date(applicationDate).toLocaleDateString('tr-TR')}</td>
        </tr>
        <tr>
          <td>Durum</td>
          <td><strong>${status}</strong></td>
        </tr>
      </table>
    </div>

    ${doctorNote ? `
    <div class="section">
      <h2 class="section-title">Doktor Notu</h2>
      <div class="detail-box">
        <p>${doctorNote}</p>
      </div>
    </div>
    ` : ''}

    ${jobDescription ? `
    <div class="section">
      <h2 class="section-title">İlan Açıklaması</h2>
      <div class="detail-box">
        <p>${jobDescription}</p>
      </div>
    </div>
    ` : ''}

    <div class="section">
      <h2 class="section-title">HASTANE BİLGİLERİ</h2>
      <div class="hospital-info-section">
        <div class="hospital-info-item">
          <span class="hospital-info-label">Hastane Adı:</span>
          <span>${hospitalName}</span>
        </div>
        ${hospitalCity ? `
        <div class="hospital-info-item">
          <span class="hospital-info-label">Şehir:</span>
          <span>${hospitalCity}</span>
        </div>
        ` : ''}
        ${hospitalAddress ? `
        <div class="hospital-info-item">
          <span class="hospital-info-label">Adres:</span>
          <span>${hospitalAddress}</span>
        </div>
        ` : ''}
        ${hospitalPhone ? `
        <div class="hospital-info-item">
          <span class="hospital-info-label">Telefon:</span>
          <span>${hospitalPhone}</span>
        </div>
        ` : ''}
        ${hospitalEmail ? `
        <div class="hospital-info-item">
          <span class="hospital-info-label">E-posta:</span>
          <span>${hospitalEmail}</span>
        </div>
        ` : ''}
        ${hospitalWebsite ? `
        <div class="hospital-info-item">
          <span class="hospital-info-label">Web Site:</span>
          <span>${hospitalWebsite}</span>
        </div>
        ` : ''}
      </div>
    </div>
  </div>

  <div class="footer">
    <p>Bu belge MediKariyer.net sistemi tarafından otomatik olarak üretilmiştir.</p>
    <p>Oluşturulma Zamanı: ${new Date().toLocaleString('tr-TR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    })}</p>
  </div>
</body>
</html>
    `;
  }
}

module.exports = new PDFService();
