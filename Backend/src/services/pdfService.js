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
    
    .header {
      background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
      color: white;
      padding: 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-radius: 8px 8px 0 0;
    }
    
    .header-left {
      flex: 1;
    }
    
    .logo {
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    
    .hospital-info {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-top: 10px;
    }
    
    .hospital-logo {
      width: 60px;
      height: 60px;
      background: white;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      color: #2563eb;
    }
    
    .header-right {
      text-align: right;
    }
    
    .job-id {
      font-size: 14px;
      opacity: 0.9;
      margin-bottom: 5px;
    }
    
    .created-date {
      font-size: 12px;
      opacity: 0.8;
    }
    
    .content {
      padding: 30px;
    }
    
    .section {
      margin-bottom: 30px;
    }
    
    .section-title {
      font-size: 20px;
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
      padding: 12px 15px;
    }
    
    .info-table td:first-child {
      font-weight: 600;
      color: #1a1a1a;
      width: 200px;
      background: #f8f9fa;
    }
    
    .info-table td:last-child {
      color: #1a1a1a;
      font-weight: 500;
    }
    
    .status-badge {
      display: inline-block;
      padding: 5px 15px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
    }
    
    .status-active {
      background: #d4edda;
      color: #155724;
    }
    
    .status-pending {
      background: #fff3cd;
      color: #856404;
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
      font-size: 16px;
      font-weight: bold;
    }
    
    .detail-box p, .detail-box ul {
      color: #1a1a1a;
      font-size: 14px;
      line-height: 1.8;
    }
    
    .detail-box ul {
      margin-left: 20px;
      margin-top: 10px;
    }
    
    .detail-box li {
      margin-bottom: 5px;
    }
    
    .contact-section {
      background: #dbeafe;
      padding: 20px;
      border-radius: 8px;
      margin-top: 20px;
    }
    
    .contact-item {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
      font-size: 14px;
    }
    
    .contact-label {
      font-weight: 600;
      width: 120px;
      color: #1a1a1a;
    }
    
    .contact-item span:last-child {
      color: #1a1a1a;
    }
    
    .footer {
      background: #f8f9fa;
      padding: 20px;
      text-align: center;
      border-radius: 0 0 8px 8px;
      margin-top: 30px;
      border-top: 2px solid #e0e0e0;
    }
    
    .footer p {
      font-size: 12px;
      color: #666;
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-left">
      <div class="logo">🏥 MediKariyer</div>
      <div class="hospital-info">
        ${hospitalLogo && hospitalLogo.startsWith('data:image') ? `<img src="${hospitalLogo}" alt="Hospital Logo" style="width: 60px; height: 60px; border-radius: 8px; background: white; object-fit: contain; padding: 5px;">` : `<div class="hospital-logo">${hospitalName.charAt(0)}</div>`}
        <div>
          <div style="font-size: 18px; font-weight: 600;">${hospitalName}</div>
        </div>
      </div>
    </div>
    <div class="header-right">
      <div class="job-id">İlan ID: ${jobId}</div>
      <div class="created-date">Oluşturulma: ${new Date(createdAt).toLocaleDateString('tr-TR')}</div>
    </div>
  </div>

  <div class="content">
    <div class="section">
      <h2 class="section-title">📋 Pozisyon Özeti</h2>
      <table class="info-table">
        <tr>
          <td>İlan Başlığı</td>
          <td><strong>${jobTitle}</strong></td>
        </tr>
        <tr>
          <td>Uzmanlık</td>
          <td><strong>${specialty}</strong>${subSpecialty ? ` / ${subSpecialty}` : ''}</td>
        </tr>
        <tr>
          <td>Çalışma Türü</td>
          <td>${workType}</td>
        </tr>
        <tr>
          <td>Bölge</td>
          <td>${region}</td>
        </tr>
        <tr>
          <td>İlan Durumu</td>
          <td><span class="status-badge ${status === 'Onaylandı' || status === 'Aktif' || status === 'active' ? 'status-active' : 'status-pending'}">${status}</span></td>
        </tr>
      </table>
    </div>

    <div class="section">
      <h2 class="section-title">🔍 Detay Bilgileri</h2>
      
      ${minExperience !== null && minExperience !== undefined ? `
      <div class="detail-box">
        <h4>Minimum Deneyim</h4>
        <p><strong>${minExperience} yıl</strong></p>
      </div>
      ` : ''}
      
      ${requirements ? `
      <div class="detail-box">
        <h4>Aranan Nitelikler</h4>
        <p>${requirements}</p>
      </div>
      ` : ''}
      
      ${description ? `
      <div class="detail-box">
        <h4>İlan Açıklaması</h4>
        <p>${description}</p>
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

    <div class="section">
      <h2 class="section-title">📞 İletişim Bilgileri</h2>
      <div class="contact-section">
        ${hospitalCity ? `
        <div class="contact-item">
          <span class="contact-label">Şehir:</span>
          <span>${hospitalCity}</span>
        </div>
        ` : ''}
        ${hospitalAddress ? `
        <div class="contact-item">
          <span class="contact-label">Adres:</span>
          <span>${hospitalAddress}</span>
        </div>
        ` : ''}
        ${hospitalPhone ? `
        <div class="contact-item">
          <span class="contact-label">Telefon:</span>
          <span>${hospitalPhone}</span>
        </div>
        ` : ''}
        ${hospitalEmail ? `
        <div class="contact-item">
          <span class="contact-label">E-posta:</span>
          <span>${hospitalEmail}</span>
        </div>
        ` : ''}
        ${hospitalWebsite ? `
        <div class="contact-item">
          <span class="contact-label">Website:</span>
          <span>${hospitalWebsite}</span>
        </div>
        ` : ''}
      </div>
    </div>
  </div>

  <div class="footer">
    <p>Bu belge MediKariyer sistemi tarafından otomatik olarak üretilmiştir.</p>
    <p>Oluşturulma Zamanı: ${new Date().toLocaleString('tr-TR')}</p>
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
      hospitalName,
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
    
    .header {
      background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
      color: white;
      padding: 30px;
      border-radius: 8px 8px 0 0;
    }
    
    .logo {
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    
    .application-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 15px;
    }
    
    .application-id {
      font-size: 16px;
    }
    
    .job-title {
      font-size: 14px;
      opacity: 0.9;
    }
    
    .content {
      padding: 30px;
    }
    
    .section {
      margin-bottom: 30px;
    }
    
    .section-title {
      font-size: 20px;
      font-weight: bold;
      color: #1e40af;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #2563eb;
    }
    
    .doctor-profile {
      display: flex;
      gap: 25px;
      background: #f8f9fa;
      padding: 25px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .doctor-photo {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 48px;
      font-weight: bold;
      flex-shrink: 0;
    }
    
    .doctor-info {
      flex: 1;
    }
    
    .doctor-name {
      font-size: 24px;
      font-weight: bold;
      color: #1a1a1a;
      margin-bottom: 10px;
    }
    
    .doctor-specialty {
      font-size: 16px;
      color: #2563eb;
      font-weight: 600;
      margin-bottom: 15px;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
    
    .info-item {
      font-size: 14px;
    }
    
    .info-label {
      font-weight: 600;
      color: #1a1a1a;
    }
    
    .info-item {
      color: #1a1a1a;
    }
    
    .cv-section {
      background: white;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }
    
    .cv-section h3 {
      color: #1e40af;
      font-size: 18px;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #2563eb;
      font-weight: bold;
    }
    
    .cv-item {
      margin-bottom: 15px;
      padding-left: 15px;
      border-left: 3px solid #2563eb;
    }
    
    .cv-item-title {
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 5px;
      font-size: 15px;
    }
    
    .cv-item-detail {
      font-size: 14px;
      color: #1a1a1a;
      line-height: 1.6;
    }
    
    .application-status {
      background: #dbeafe;
      padding: 20px;
      border-radius: 8px;
      margin-top: 20px;
    }
    
    .status-badge {
      display: inline-block;
      padding: 8px 20px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 10px;
    }
    
    .status-pending {
      background: #fff3cd;
      color: #856404;
    }
    
    .status-reviewed {
      background: #cce5ff;
      color: #004085;
    }
    
    .status-accepted {
      background: #d4edda;
      color: #155724;
    }
    
    .status-rejected {
      background: #f8d7da;
      color: #721c24;
    }
    
    .note-box {
      background: #fff9e6;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin-top: 15px;
      border-radius: 4px;
    }
    
    .note-box h4 {
      color: #856404;
      margin-bottom: 8px;
      font-size: 14px;
    }
    
    .note-box p {
      color: #1a1a1a;
      font-size: 14px;
      line-height: 1.6;
    }
    
    .footer {
      background: #f8f9fa;
      padding: 20px;
      text-align: center;
      border-radius: 0 0 8px 8px;
      margin-top: 30px;
      border-top: 2px solid #e0e0e0;
    }
    
    .footer p {
      font-size: 12px;
      color: #666;
    }
    
    .security-code {
      font-family: monospace;
      font-size: 10px;
      color: #999;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">🏥 MediKariyer</div>
    <div class="application-info">
      <div>
        <div class="application-id">Başvuru ID: ${applicationId}</div>
        <div class="job-title">İlan: ${jobTitle} - ${hospitalName}</div>
      </div>
    </div>
  </div>

  <div class="content">
    <div class="section">
      <h2 class="section-title">👨‍⚕️ Doktor Bilgileri</h2>
      <div class="doctor-profile">
        <div class="doctor-photo">
          ${doctor.profilePhoto && doctor.profilePhoto.startsWith('data:image') ? `<img src="${doctor.profilePhoto}" alt="Profile" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">` : doctor.fullName.charAt(0)}
        </div>
        <div class="doctor-info">
          <div class="doctor-name">${doctor.fullName}</div>
          <div class="doctor-specialty">${doctor.specialty}${doctor.subSpecialty ? ` / ${doctor.subSpecialty}` : ''}</div>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Telefon:</span> ${doctor.phone}
            </div>
            <div class="info-item">
              <span class="info-label">E-posta:</span> ${doctor.email}
            </div>
            <div class="info-item">
              <span class="info-label">Doğum Tarihi:</span> ${doctor.birthDate ? new Date(doctor.birthDate).toLocaleDateString('tr-TR') : '-'}
            </div>
            <div class="info-item">
              <span class="info-label">Şehir:</span> ${doctor.city || '-'}
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">📄 Doktor CV</h2>
      
      ${doctor.education && doctor.education.length > 0 ? `
      <div class="cv-section">
        <h3>🎓 Eğitim</h3>
        ${doctor.education.map(edu => `
          <div class="cv-item">
            <div class="cv-item-title">${edu.education_institution || 'Belirtilmemiş'}</div>
            <div class="cv-item-detail">${edu.education_type_name || ''} ${edu.field ? `- ${edu.field}` : ''}</div>
            ${edu.graduation_year ? `<div class="cv-item-detail">Mezuniyet: ${edu.graduation_year}</div>` : ''}
          </div>
        `).join('')}
      </div>
      ` : ''}
      
      ${doctor.experience && doctor.experience.length > 0 ? `
      <div class="cv-section">
        <h3>💼 Deneyim</h3>
        ${doctor.experience.map(exp => `
          <div class="cv-item">
            <div class="cv-item-title">${exp.role_title || 'Belirtilmemiş'} - ${exp.organization || 'Belirtilmemiş'}</div>
            <div class="cv-item-detail">${exp.start_date ? new Date(exp.start_date).toLocaleDateString('tr-TR') : ''} - ${exp.end_date ? new Date(exp.end_date).toLocaleDateString('tr-TR') : 'Devam Ediyor'}</div>
            ${exp.specialty_name ? `<div class="cv-item-detail" style="margin-top: 3px;">Uzmanlık: ${exp.specialty_name}${exp.subspecialty_name ? ` / ${exp.subspecialty_name}` : ''}</div>` : ''}
            ${exp.description ? `<div class="cv-item-detail" style="margin-top: 5px;">${exp.description}</div>` : ''}
          </div>
        `).join('')}
      </div>
      ` : ''}
      
      ${doctor.certificates && doctor.certificates.length > 0 ? `
      <div class="cv-section">
        <h3>📜 Sertifikalar</h3>
        ${doctor.certificates.map(cert => `
          <div class="cv-item">
            <div class="cv-item-title">${cert.certificate_name || 'Belirtilmemiş'}</div>
            ${cert.institution || cert.certificate_year ? `<div class="cv-item-detail">${cert.institution || ''} ${cert.certificate_year ? `| ${cert.certificate_year}` : ''}</div>` : ''}
          </div>
        `).join('')}
      </div>
      ` : ''}
      
      ${doctor.languages && doctor.languages.length > 0 ? `
      <div class="cv-section">
        <h3>🌍 Diller</h3>
        ${doctor.languages.map(lang => `
          <div class="cv-item">
            <div class="cv-item-title">${lang.language_name || 'Belirtilmemiş'}</div>
            <div class="cv-item-detail">Seviye: ${lang.level_name || 'Belirtilmemiş'}</div>
          </div>
        `).join('')}
      </div>
      ` : ''}
    </div>

    <div class="section">
      <h2 class="section-title">📋 Başvuru Bilgileri</h2>
      <div class="application-status">
        <div style="color: #1a1a1a;">
          <strong>Başvuru Tarihi:</strong> ${new Date(applicationDate).toLocaleString('tr-TR')}
        </div>
        <div style="margin-top: 10px; color: #1a1a1a;">
          <strong>Durum:</strong> 
          <span class="status-badge status-${status.toLowerCase()}">
            ${status}
          </span>
        </div>
        
        ${doctorNote ? `
        <div class="note-box">
          <h4>📝 Doktor Notu</h4>
          <p>${doctorNote}</p>
        </div>
        ` : ''}
      </div>
    </div>
  </div>

  <div class="footer">
    <p>Bu belge MediKariyer sistemi tarafından dijital olarak üretilmiştir.</p>
    <p>Oluşturulma Zamanı: ${new Date().toLocaleString('tr-TR')}</p>
    <div class="security-code">Güvenlik Kodu: ${applicationId}-${Date.now().toString(36).toUpperCase()}</div>
  </div>
</body>
</html>
    `;
  }
}

module.exports = new PDFService();
