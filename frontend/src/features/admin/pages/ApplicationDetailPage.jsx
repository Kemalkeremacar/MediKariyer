/**
 * Admin Application Detail Page
 * - Başvuru, Hastane ve Doktor detayları sekmeli yapı
 * - Sağ kolon: durum güncelleme aksiyonları
 * - Hastane versiyonuna benzer yapıda, dinamik ve kapsamlı
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText, User, Calendar, ArrowLeft, CheckCircle, XCircle,
  Clock, Briefcase, Eye, AlertCircle, MessageSquare,
  Mail, Phone, MapPin, Building, ExternalLink, Settings, Target, Trash2, Download
} from 'lucide-react';
import { useApplicationById, useUpdateApplicationStatus, useUserById, useDeleteApplication } from '../api/useAdmin';
import { useApplicationStatuses } from '@/hooks/useLookup';
import { showToast } from '@/utils/toastUtils';
import { toastMessages } from '@/config/toast';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';
import { ModalContainer } from '@/components/ui/ModalContainer';
import { formatDateTime, formatDate as formatDateUtil, formatDateShort } from '@/utils/dateUtils';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const AdminApplicationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('application');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [notes, setNotes] = useState('');

  const { data: applicationData, isLoading, error, refetch } = useApplicationById(id);
  const updateStatusMutation = useUpdateApplicationStatus();
  const deleteApplicationMutation = useDeleteApplication();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Backend'den gelen veriyi parse et
  const rawApplication = (
    applicationData?.data?.data?.application ||
    applicationData?.data?.application ||
    applicationData?.data ||
    {}
  );

  // Application verisini normalize et
  const application = rawApplication || {};

  const isDoctorInactive = application.doctor_is_active === false;

  // Doktor profil detayını al
  const doctorUserId = application.user_id;
  const shouldFetchDoctor = !!doctorUserId && !isDoctorInactive;
  const { data: doctorData, isLoading: doctorLoading, error: doctorError } = useUserById(shouldFetchDoctor ? doctorUserId : null);
  
  // Debug: Application ve doctor data'yı kontrol et
  useEffect(() => {
    console.log('📋 Application:', application);
    console.log('👤 Doctor User ID:', doctorUserId);
    console.log('👤 Doctor Data:', doctorData);
    console.log('👤 Doctor Loading:', doctorLoading);
    console.log('👤 Doctor Error:', doctorError);
  }, [application, doctorUserId, doctorData, doctorLoading, doctorError]);

  // Status options
  const { data: applicationStatuses } = useApplicationStatuses();
  const statusOptions = applicationStatuses?.length > 0 
    ? applicationStatuses.filter(s => s.value !== 5) // Geri Çekildi hariç
    : [
        { value: 1, label: 'Başvuruldu', name: 'Başvuruldu' },
        { value: 2, label: 'İnceleniyor', name: 'İnceleniyor' },
        { value: 3, label: 'Kabul Edildi', name: 'Kabul Edildi' },
        { value: 4, label: 'Reddedildi', name: 'Reddedildi' }
      ];

  // Application değiştiğinde state'i güncelle
  useEffect(() => {
    if (application.status_id) {
      setSelectedStatus(application.status_id.toString());
      setNotes(application.notes || '');
    }
  }, [application]);


  const handleStatusUpdate = async () => {
    if (!selectedStatus) return;
    
    try {
      await updateStatusMutation.mutateAsync({
        applicationId: parseInt(id),
        status_id: parseInt(selectedStatus),
        reason: notes || null
      });
      showToast.success(toastMessages.application.updateStatusSuccess);
      setNotes('');
      refetch();
    } catch (error) {
      console.error('Başvuru durumu güncelleme hatası:', error);
      showToast.error(error, { defaultMessage: toastMessages.application.updateStatusError });
    }
  };

  const handleNoteOnlyUpdate = async () => {
    try {
      await updateStatusMutation.mutateAsync({
        applicationId: parseInt(id),
        status_id: application.status_id,
        reason: notes || null
      });
      showToast.success(toastMessages.application.updateNoteSuccess);
      refetch();
    } catch (error) {
      console.error('Not güncelleme hatası:', error);
      showToast.error(error, { defaultMessage: toastMessages.application.updateNoteError });
    }
  };

  const handleDeleteApplication = async () => {
    try {
      await deleteApplicationMutation.mutateAsync(id);
      showToast.success(toastMessages.application.deleteSuccess || 'Başvuru başarıyla silindi');
      setIsDeleteModalOpen(false);
      navigate('/admin/applications');
    } catch (error) {
      console.error('Başvuru silme hatası:', error);
      showToast.error(error, { defaultMessage: toastMessages.application.deleteError || 'Başvuru silinirken bir hata oluştu' });
    }
  };

  // Export başvuru fonksiyonu (PDF - HTML tabanlı, Türkçe karakter desteği ile)
  const handleExportApplication = async () => {
    if (!application || !application.id) {
      showToast.warning('Başvuru verisi bulunamadı');
      return;
    }

    // formatDate artık utility'den geliyor, burada local tanımlama kaldırıldı

    const doctorProfile = doctorData?.user?.profile || doctorData?.profile || {};
    const doctorName = `${application.first_name || ''} ${application.last_name || ''}`.trim() || 'Belirtilmemiş';
    const doctorTitle = doctorProfile.title || '';
    const fullDoctorName = doctorTitle ? `${doctorTitle} ${doctorName}` : doctorName;
    const hospitalName = application.institution_name || application.hospital_name || 'Belirtilmemiş';
    const jobTitle = application.job_title || 'Belirtilmemiş';
    const doctorPhoto = doctorProfile.profile_photo || application.profile_photo || null;
    const doctorEducations = doctorProfile.educations || [];
    const doctorExperiences = doctorProfile.experiences || [];
    const doctorCertificates = doctorProfile.certificates || [];
    const doctorLanguages = doctorProfile.languages || [];

    // HTML escape fonksiyonu
    const escapeHtml = (text) => {
      if (!text) return '';
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    };

    // formatDateShort artık utility'den geliyor, burada local tanımlama kaldırıldı

    // Geçici HTML elementi oluştur
    const printWindow = document.createElement('div');
    printWindow.style.position = 'absolute';
    printWindow.style.left = '-9999px';
    printWindow.style.width = '210mm'; // A4 genişliği
    printWindow.style.padding = '20mm';
    printWindow.style.fontFamily = 'Arial, sans-serif';
    printWindow.style.backgroundColor = '#ffffff';
    printWindow.style.color = '#000000';
    
    // Fotoğraf için base64 veya URL kontrolü
    const photoHtml = doctorPhoto 
      ? `<img src="${doctorPhoto}" alt="Profil Fotoğrafı" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 3px solid #3b82f6;" />`
      : '<div style="width: 120px; height: 120px; border-radius: 50%; background: #e5e7eb; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 12px; border: 3px solid #3b82f6;">Fotoğraf Yok</div>';

    printWindow.innerHTML = `
      <div style="max-width: 800px; margin: 0 auto; background: white; padding: 30px; font-family: 'Segoe UI', Arial, sans-serif;">
        <!-- DOKTOR PROFİLİ - En Üstte -->
        <div style="margin-bottom: 30px; page-break-inside: avoid; border-bottom: 3px solid #10b981; padding-bottom: 20px;">
          <h1 style="color: #1e40af; font-size: 20px; font-weight: bold; margin-bottom: 20px; text-transform: uppercase; border-bottom: 2px solid #10b981; padding-bottom: 8px;">
            👤 DOKTOR PROFİLİ
          </h1>
          
          <!-- Doktor Header - Fotoğraf ve Temel Bilgiler (Popover Formatına Benzer) -->
          <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #10b981; page-break-inside: avoid;">
            <div style="display: flex; gap: 20px; margin-bottom: 20px;">
              <div>
                ${photoHtml}
              </div>
              <div style="flex: 1;">
                <h2 style="color: #111827; font-size: 20px; font-weight: bold; margin: 0 0 8px 0;">${escapeHtml(fullDoctorName)}</h2>
                ${doctorProfile.specialty_name || application.specialty_name ? `
                  <p style="color: #6b7280; font-size: 14px; margin: 0 0 4px 0;">${escapeHtml(doctorProfile.specialty_name || application.specialty_name)}</p>
                ` : ''}
                ${doctorProfile.subspecialty_name || application.subspecialty_name ? `
                  <p style="color: #9ca3af; font-size: 12px; margin: 0;">Yan Dal: ${escapeHtml(doctorProfile.subspecialty_name || application.subspecialty_name)}</p>
                ` : ''}
              </div>
            </div>
            
            <!-- Kişisel ve İletişim Bilgileri - Grid Format -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; font-size: 11px;">
              <div>
                <span style="color: #6b7280; display: block; margin-bottom: 4px;">Ad Soyad</span>
                <p style="color: #111827; font-weight: 600; margin: 0;">${escapeHtml(fullDoctorName)}</p>
              </div>
              <div>
                <span style="color: #6b7280; display: block; margin-bottom: 4px;">Telefon</span>
                <p style="color: #111827; margin: 0;">${escapeHtml(doctorProfile.phone || application.phone || 'Belirtilmemiş')}</p>
              </div>
              <div>
                <span style="color: #6b7280; display: block; margin-bottom: 4px;">E-posta</span>
                <p style="color: #111827; margin: 0;">${escapeHtml(doctorProfile.email || application.email || 'Belirtilmemiş')}</p>
              </div>
              ${doctorProfile.birth_date || doctorProfile.dob ? `
                <div>
                  <span style="color: #6b7280; display: block; margin-bottom: 4px;">Doğum Tarihi</span>
                  <p style="color: #111827; margin: 0;">${escapeHtml(formatDate(doctorProfile.birth_date || doctorProfile.dob))}</p>
                </div>
              ` : ''}
              ${doctorProfile.birth_place_name ? `
                <div>
                  <span style="color: #6b7280; display: block; margin-bottom: 4px;">Doğum Yeri</span>
                  <p style="color: #111827; margin: 0;">${escapeHtml(doctorProfile.birth_place_name)}</p>
                </div>
              ` : ''}
              ${doctorProfile.residence_city_name || application.residence_city_name ? `
                <div>
                  <span style="color: #6b7280; display: block; margin-bottom: 4px;">İkamet Şehri</span>
                  <p style="color: #111827; margin: 0;">${escapeHtml(doctorProfile.residence_city_name || application.residence_city_name)}</p>
                </div>
              ` : ''}
              ${doctorProfile.specialty_name || application.specialty_name ? `
                <div>
                  <span style="color: #6b7280; display: block; margin-bottom: 4px;">Uzmanlık Alanı</span>
                  <p style="color: #111827; margin: 0;">${escapeHtml(doctorProfile.specialty_name || application.specialty_name)}</p>
                </div>
              ` : ''}
              ${doctorProfile.subspecialty_name || application.subspecialty_name ? `
                <div>
                  <span style="color: #6b7280; display: block; margin-bottom: 4px;">Yan Dal</span>
                  <p style="color: #111827; margin: 0;">${escapeHtml(doctorProfile.subspecialty_name || application.subspecialty_name)}</p>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Eğitim -->
          ${doctorEducations.length > 0 ? `
          <div style="margin-bottom: 20px; page-break-inside: avoid;">
            <h3 style="color: #1e40af; font-size: 14px; font-weight: bold; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 2px solid #3b82f6; text-transform: uppercase;">
              🎓 Eğitim
            </h3>
            ${doctorEducations.map(edu => `
              <div style="margin-bottom: 12px; padding: 10px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #3b82f6; font-size: 11px;">
                <div style="font-weight: 600; color: #111827; margin-bottom: 4px;">${escapeHtml(edu.institution_name || 'Belirtilmemiş')}</div>
                <div style="color: #6b7280; font-size: 10px;">
                  ${edu.education_type_name ? escapeHtml(edu.education_type_name) : ''} 
                  ${edu.graduation_year ? ` • ${escapeHtml(String(edu.graduation_year))}` : ''}
                  ${edu.specialty_name ? ` • ${escapeHtml(edu.specialty_name)}` : ''}
                </div>
                ${edu.description ? `<div style="margin-top: 4px; color: #374151; font-size: 10px;">${escapeHtml(edu.description)}</div>` : ''}
              </div>
            `).join('')}
          </div>
          ` : ''}

          <!-- Deneyim -->
          ${doctorExperiences.length > 0 ? `
          <div style="margin-bottom: 20px; page-break-inside: avoid;">
            <h3 style="color: #1e40af; font-size: 14px; font-weight: bold; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 2px solid #10b981; text-transform: uppercase;">
              💼 Deneyim
            </h3>
            ${doctorExperiences.map(exp => `
              <div style="margin-bottom: 12px; padding: 10px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #10b981; font-size: 11px;">
                <div style="font-weight: 600; color: #111827; margin-bottom: 4px;">${escapeHtml(exp.institution_name || 'Belirtilmemiş')}</div>
                <div style="color: #6b7280; font-size: 10px;">
                  ${exp.start_date ? formatDateShort(exp.start_date) : ''} 
                  ${exp.is_current ? '- Devam Ediyor' : (exp.end_date ? ` - ${formatDateShort(exp.end_date)}` : '')}
                  ${exp.position ? ` • ${escapeHtml(exp.position)}` : ''}
                </div>
                ${exp.description ? `<div style="margin-top: 4px; color: #374151; font-size: 10px;">${escapeHtml(exp.description)}</div>` : ''}
              </div>
            `).join('')}
          </div>
          ` : ''}

          <!-- Sertifikalar -->
          ${doctorCertificates.length > 0 ? `
          <div style="margin-bottom: 20px; page-break-inside: avoid;">
            <h3 style="color: #1e40af; font-size: 14px; font-weight: bold; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 2px solid #f59e0b; text-transform: uppercase;">
              🏆 Sertifikalar
            </h3>
            ${doctorCertificates.map(cert => `
              <div style="margin-bottom: 12px; padding: 10px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #f59e0b; font-size: 11px;">
                <div style="font-weight: 600; color: #111827; margin-bottom: 4px;">${escapeHtml(cert.certificate_name || 'Belirtilmemiş')}</div>
                <div style="color: #6b7280; font-size: 10px;">
                  ${cert.certificate_year ? escapeHtml(String(cert.certificate_year)) : ''}
                  ${cert.issuing_organization ? ` • ${escapeHtml(cert.issuing_organization)}` : ''}
                </div>
                ${cert.description ? `<div style="margin-top: 4px; color: #374151; font-size: 10px;">${escapeHtml(cert.description)}</div>` : ''}
              </div>
            `).join('')}
          </div>
          ` : ''}

          <!-- Diller -->
          ${doctorLanguages.length > 0 ? `
          <div style="margin-bottom: 20px; page-break-inside: avoid;">
            <h3 style="color: #1e40af; font-size: 14px; font-weight: bold; margin-bottom: 10px; padding-bottom: 5px; border-bottom: 2px solid #8b5cf6; text-transform: uppercase;">
              🌐 Diller
            </h3>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; font-size: 11px;">
              ${doctorLanguages.map(lang => `
                <div style="padding: 8px; background: #f8fafc; border-radius: 6px; border-left: 3px solid #8b5cf6;">
                  <div style="font-weight: 600; color: #111827;">${escapeHtml(lang.language_name || 'Belirtilmemiş')}</div>
                  <div style="color: #6b7280; font-size: 10px;">${escapeHtml(lang.level_name || '')}</div>
                </div>
              `).join('')}
            </div>
          </div>
          ` : ''}
        </div>

        <!-- İLAN BİLGİLERİ - Ortada -->
        <div style="margin-bottom: 30px; page-break-inside: avoid; border-bottom: 3px solid #f59e0b; padding-bottom: 20px;">
          <h1 style="color: #1e40af; font-size: 20px; font-weight: bold; margin-bottom: 15px; text-transform: uppercase; border-bottom: 2px solid #f59e0b; padding-bottom: 8px;">
            📋 İLAN BİLGİLERİ
          </h1>
          <div style="background: #f8fafc; border-radius: 8px; padding: 20px; border-left: 4px solid #f59e0b;">
            <div style="margin-bottom: 15px;">
              <h2 style="color: #111827; font-size: 18px; font-weight: bold; margin: 0 0 10px 0;">${escapeHtml(jobTitle)}</h2>
              <p style="color: #6b7280; font-size: 14px; margin: 0;">${escapeHtml(hospitalName)}</p>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; font-size: 11px; margin-bottom: 15px;">
              ${application.job_specialty_name || application.specialty_name ? `
                <div>
                  <span style="color: #6b7280; display: block; margin-bottom: 4px;">Uzmanlık Alanı</span>
                  <p style="color: #111827; margin: 0;">${escapeHtml(application.job_specialty_name || application.specialty_name)}</p>
                </div>
              ` : ''}
              ${application.job_subspecialty_name || application.subspecialty_name ? `
                <div>
                  <span style="color: #6b7280; display: block; margin-bottom: 4px;">Yan Dal</span>
                  <p style="color: #111827; margin: 0;">${escapeHtml(application.job_subspecialty_name || application.subspecialty_name)}</p>
                </div>
              ` : ''}
              ${application.job_city_name || application.job_city ? `
                <div>
                  <span style="color: #6b7280; display: block; margin-bottom: 4px;">Şehir</span>
                  <p style="color: #111827; margin: 0;">${escapeHtml(application.job_city_name || application.job_city)}</p>
                </div>
              ` : ''}
              ${application.employment_type ? `
                <div>
                  <span style="color: #6b7280; display: block; margin-bottom: 4px;">Çalışma Şekli</span>
                  <p style="color: #111827; margin: 0;">${escapeHtml(application.employment_type)}</p>
                </div>
              ` : ''}
              ${application.min_experience_years ? `
                <div>
                  <span style="color: #6b7280; display: block; margin-bottom: 4px;">Deneyim</span>
                  <p style="color: #111827; margin: 0;">${escapeHtml(String(application.min_experience_years))}+ yıl</p>
                </div>
              ` : ''}
            </div>
            
            ${application.job_description ? `
              <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
                <h3 style="color: #111827; font-size: 14px; font-weight: bold; margin: 0 0 10px 0;">İlan Açıklaması</h3>
                <div style="color: #374151; font-size: 11px; line-height: 1.7; white-space: pre-wrap; word-wrap: break-word; background: white; padding: 12px; border-radius: 6px;">
                  ${escapeHtml(application.job_description).replace(/\n/g, '<br>')}
                </div>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- BAŞVURU BİLGİLERİ - En Altta -->
        <div style="border-bottom: 3px solid #3b82f6; padding-bottom: 20px;">
          <h1 style="color: #1e40af; font-size: 20px; font-weight: bold; margin-bottom: 15px; text-transform: uppercase; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; page-break-after: avoid;">
            📝 BAŞVURU BİLGİLERİ
          </h1>
          <div style="background: #f8fafc; border-radius: 8px; padding: 20px; border-left: 4px solid #3b82f6;">
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; font-size: 11px; margin-bottom: 15px; page-break-inside: avoid;">
              <div>
                <span style="color: #6b7280; display: block; margin-bottom: 4px;">Başvuru ID</span>
                <p style="color: #111827; font-weight: 600; margin: 0;">${escapeHtml(String(application.id || 'Belirtilmemiş'))}</p>
              </div>
              <div>
                <span style="color: #6b7280; display: block; margin-bottom: 4px;">Başvuru Durumu</span>
                <p style="color: #111827; margin: 0;">${escapeHtml(application.status || application.status_name || 'Belirtilmemiş')}</p>
              </div>
              <div>
                <span style="color: #6b7280; display: block; margin-bottom: 4px;">Başvuru Tarihi</span>
                <p style="color: #111827; margin: 0;">${escapeHtml(formatDate(application.applied_at || application.created_at))}</p>
              </div>
              <div>
                <span style="color: #6b7280; display: block; margin-bottom: 4px;">Son Güncelleme</span>
                <p style="color: #111827; margin: 0;">${escapeHtml(formatDate(application.updated_at))}</p>
              </div>
            </div>
            
            ${application.cover_letter ? `
              <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb; page-break-inside: avoid;">
                <h3 style="color: #111827; font-size: 14px; font-weight: bold; margin: 0 0 10px 0;">Doktor Ön Yazısı</h3>
                <div style="color: #374151; font-size: 11px; line-height: 1.7; white-space: pre-wrap; word-wrap: break-word; background: white; padding: 12px; border-radius: 6px;">
                  ${escapeHtml(application.cover_letter).replace(/\n/g, '<br>')}
                </div>
              </div>
            ` : ''}
            
            ${application.notes ? `
              <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #e5e7eb; page-break-inside: avoid;">
                <h3 style="color: #111827; font-size: 14px; font-weight: bold; margin: 0 0 10px 0;">Hastane Notu</h3>
                <div style="color: #374151; font-size: 11px; line-height: 1.7; white-space: pre-wrap; word-wrap: break-word; background: white; padding: 12px; border-radius: 6px;">
                  ${escapeHtml(application.notes).replace(/\n/g, '<br>')}
                </div>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Footer -->
        <div style="margin-top: 30px; padding-top: 15px; border-top: 2px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 10px; page-break-inside: avoid;">
          <p style="margin: 0;">Rapor Oluşturulma Tarihi: ${new Date().toLocaleString('tr-TR')}</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(printWindow);
    
    try {
      // HTML'i canvas'a çevir
      const canvas = await html2canvas(printWindow, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      // Canvas'ı PDF'e çevir
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 genişliği (mm)
      const pageHeight = 297; // A4 yüksekliği (mm)
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Dosya adı: {isim} {soyisim} - {ilan başlığı}
      const cleanDoctorName = doctorName.replace(/[<>:"/\\|?*]/g, '');
      const cleanJobTitle = jobTitle.replace(/[<>:"/\\|?*]/g, '');
      const fileName = `${cleanDoctorName.toUpperCase()} - ${cleanJobTitle.toUpperCase()}.pdf`;
      pdf.save(fileName);
      
      document.body.removeChild(printWindow);
      showToast.success('Başvuru başarıyla indirildi');
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      document.body.removeChild(printWindow);
      showToast.error('PDF oluşturulurken bir hata oluştu');
    }
  };

  const getStatusConfig = (status) => {
    const statusConfig = {
      1: { key: 1, text: 'Başvuruldu', icon: Clock, color: 'bg-blue-100 text-blue-800 border-blue-200' },
      2: { key: 2, text: 'İnceleniyor', icon: Eye, color: 'bg-purple-100 text-purple-800 border-purple-200' },
      3: { key: 3, text: 'Kabul Edildi', icon: CheckCircle, color: 'bg-green-100 text-green-800 border-green-200' },
      4: { key: 4, text: 'Reddedildi', icon: XCircle, color: 'bg-red-100 text-red-800 border-red-200' },
      5: { key: 5, text: 'Geri Çekildi', icon: ArrowLeft, color: 'bg-gray-100 text-gray-800 border-gray-200' }
    };
    if (typeof status === 'number') return statusConfig[status] || statusConfig[1];
    // String fallback
    const map = { 'Başvuruldu': 1, 'İnceleniyor': 2, 'Kabul Edildi': 3, 'Reddedildi': 4, 'Geri Çekildi': 5 };
    return statusConfig[map[status]] || statusConfig[1];
  };

  const StatusBadge = ({ status_id, statusName }) => {
    const cfg = getStatusConfig(status_id);
    const Icon = cfg.icon;
    return (
      <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-sm font-medium border gap-2 w-[140px] ${cfg.color}`}>
        <Icon className="w-4 h-4 flex-shrink-0" />
        <span className="text-center truncate">{statusName || cfg.text}</span>
      </span>
    );
  };

  const isStatusChanged = parseInt(selectedStatus) !== (application.status_id || 0);
  const isNotesChanged = notes !== (application.notes || '');
  const isWithdrawn = application.status_id === 5;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          <SkeletonLoader className="h-12 w-80 bg-gray-200 rounded-lg mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SkeletonLoader className="h-96 bg-gray-200 rounded-xl" />
            </div>
            <div>
              <SkeletonLoader className="h-64 bg-gray-200 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !application.id) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="p-6 flex-1 flex flex-col justify-center">
          <div className="text-center bg-white rounded-xl shadow-lg p-10 border border-gray-200 max-w-2xl mx-auto">
            <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Başvuru Bulunamadı</h2>
            <p className="text-gray-600 mb-6">Aradığınız başvuru bulunamadı veya silinmiş olabilir.</p>
            <button
              onClick={() => navigate('/admin/applications')}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Başvuru Listesine Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isDoctorInactive) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="p-6 flex-1 flex flex-col justify-center">
          <div className="mb-6">
            <button
              onClick={() => navigate('/admin/applications')}
              className="flex items-center px-4 py-2 bg-gray-600 text-white border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Başvuru Listesine Dön
            </button>
          </div>

          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 p-10 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Doktor Hesabı Silinmiş</h2>
            <p className="text-gray-600 max-w-xl mx-auto mb-6">
              Bu başvuruyu yapan doktor hesabını sildiği için profil detaylarına erişilemiyor. Başvuru kaydı arşiv amaçlı olarak listede tutulmaya devam eder.
            </p>
            <div className="mt-6 space-y-4">
              <div className="inline-flex flex-col items-center gap-2 bg-gray-100 rounded-xl px-6 py-4">
                <span className="text-sm font-medium text-gray-700">Başvuru</span>
                <span className="text-lg font-semibold text-gray-900">
                  {application.first_name} {application.last_name} - {application.job_title}
                </span>
              </div>
              
              {/* Doktor Profil Linki */}
              {application.user_id && (
                <div className="pt-4">
                  <button
                    onClick={() => navigate(`/admin/users/${application.user_id}`)}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors font-medium shadow-md"
                  >
                    <User className="w-4 h-4" />
                    Doktor Profilini Görüntüle
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Backend response format: { success: true, data: { user: { profile: {...} } } }
  // useUserById returns response.data, so doctorData = { user: { profile: {...} } }
  const doctorProfile = doctorData?.user?.profile || doctorData?.profile || {};
  const doctorEducations = doctorProfile.educations || [];
  const doctorExperiences = doctorProfile.experiences || [];
  const doctorCertificates = doctorProfile.certificates || [];
  const doctorLanguages = doctorProfile.languages || [];

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <div className="p-6 w-full min-w-0">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/applications')}
                className="flex items-center px-4 py-2 bg-gray-600 text-white border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Geri Dön
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {application.first_name} {application.last_name} - {application.job_title}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleExportApplication}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md hover:shadow-lg"
                title="Başvuruyu indir"
              >
                <Download className="w-4 h-4 mr-2" />
                İndir
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md hover:shadow-lg"
                disabled={deleteApplicationMutation.isPending}
                title="Başvuruyu kalıcı olarak siler (deleted_at set eder)"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Sil
              </button>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left - Tabs */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg min-w-0">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                {[
                  { id: 'application', name: 'Başvuru', icon: FileText },
                  { id: 'hospital', name: 'Hastane', icon: Building },
                  { id: 'doctor', name: 'Doktor', icon: User }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* Başvuru Sekmesi */}
              {activeTab === 'application' && (
                <div className="space-y-6">
                  {/* Başvuru Tarihi */}
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Başvuru Tarihi</span>
                    </div>
                    <span className="text-sm text-gray-900 font-medium">
                      {application.applied_at 
                        ? formatDateTime(application.applied_at)
                        : 'Bilinmiyor'}
                    </span>
                  </div>

                  {/* İş İlanı Detayları */}
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-blue-600" />
                      İş İlanı Detayları
                    </h2>
                    
                    <div className="space-y-4">
                      {/* İlan Başlığı */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {application.job_title || 'Belirtilmemiş'}
                          </h3>
                          {application.job_id && (
                            <button
                              onClick={() => navigate(`/admin/jobs/${application.job_id}`)}
                              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                            >
                              İlan detaylarını görüntüle
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Temel Bilgiler */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                        {application.job_specialty_name && (
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Uzmanlık Alanı</p>
                            <p className="text-sm text-gray-900">{application.job_specialty_name}</p>
                          </div>
                        )}
                        {application.job_subspecialty_name && (
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Yan Dal</p>
                            <p className="text-sm text-gray-900">{application.job_subspecialty_name}</p>
                          </div>
                        )}
                        {application.job_city_name && (
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Şehir</p>
                            <p className="text-sm text-gray-900">{application.job_city_name}</p>
                          </div>
                        )}
                        {application.employment_type && (
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Çalışma Şekli</p>
                            <p className="text-sm text-gray-900">{application.employment_type}</p>
                          </div>
                        )}
                        {application.min_experience_years && (
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Deneyim</p>
                            <p className="text-sm text-gray-900">
                              {application.min_experience_years}+ yıl
                            </p>
                          </div>
                        )}
                      </div>

                      {/* İlan Açıklaması */}
                      {application.job_description && (
                        <div className="pt-4 border-t border-gray-200">
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">İlan Açıklaması</h4>
                          <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed bg-gray-50 rounded-lg p-4">
                            {application.job_description}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Doktor Ön Yazısı */}
                  {application.cover_letter ? (
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-green-600" />
                        Doktor Ön Yazısı
                      </h3>
                      <div className="bg-white rounded-lg p-4 border border-gray-200">
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {application.cover_letter}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 text-center">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">Ön Yazı Bulunamadı</h3>
                      <p className="text-gray-500 text-sm">
                        Bu başvuru için doktor ön yazısı eklenmemiş.
                      </p>
                    </div>
                  )}

                  {/* Notlar */}
                  {application.notes && (
                    <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-yellow-600" />
                        Hastane Notları
                      </h3>
                      <div className="bg-white rounded-lg p-4 border border-yellow-200">
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {application.notes}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Hastane Sekmesi */}
              {activeTab === 'hospital' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Building className="w-5 h-5 text-green-600" />
                      Hastane Bilgileri
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">Hastane Adı</p>
                        <p className="text-sm text-gray-900 font-semibold">
                          {application.institution_name || 'Belirtilmemiş'}
                        </p>
                      </div>
                      {application.hospital_city_name && (
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">Şehir</p>
                          <p className="text-sm text-gray-900">{application.hospital_city_name}</p>
                        </div>
                      )}
                      {application.hospital_email && (
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">E-posta</p>
                          <p className="text-sm text-gray-900">{application.hospital_email}</p>
                        </div>
                      )}
                      {application.hospital_phone && (
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">Telefon</p>
                          <p className="text-sm text-gray-900">{application.hospital_phone}</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Hastane Profil Butonu */}
                    {application.hospital_user_id && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <button
                          onClick={() => navigate(`/admin/users/${application.hospital_user_id}`)}
                          className="flex items-center justify-center px-6 py-3 rounded-lg transition-colors bg-green-500 text-white hover:bg-green-600 w-full md:w-auto"
                        >
                          <Building className="w-4 h-4 mr-2" />
                          Hastane Profilini Görüntüle
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Doktor Sekmesi */}
              {activeTab === 'doctor' && (
                <div className="space-y-6">
                  {doctorLoading ? (
                    <SkeletonLoader count={3} />
                  ) : (doctorProfile.first_name || application.first_name) ? (
                    <>
                      {/* Doktor Temel Bilgileri */}
                      <div className="bg-white rounded-lg border border-gray-200 p-6">
                        <div className="flex items-start gap-4">
                          {(doctorProfile.profile_photo || application.profile_photo) ? (
                            <img
                              src={doctorProfile.profile_photo || application.profile_photo}
                              alt={`${doctorProfile.first_name || application.first_name} ${doctorProfile.last_name || application.last_name}`}
                              className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                            />
                          ) : (
                            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                              {(doctorProfile.first_name || application.first_name)?.[0]}{(doctorProfile.last_name || application.last_name)?.[0]}
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900">
                              {(doctorProfile.title || application.title || 'Dr.')} {doctorProfile.first_name || application.first_name} {doctorProfile.last_name || application.last_name}
                            </h3>
                            <p className="text-gray-600 text-sm mt-1">
                              {doctorProfile.specialty_name || application.specialty_name || 'Uzmanlık Belirtilmemiş'}
                            </p>
                            {(doctorProfile.subspecialty_name || application.subspecialty_name) && (
                              <p className="text-gray-500 text-xs mt-1">
                                Yan Dal: {doctorProfile.subspecialty_name || application.subspecialty_name}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">Telefon</p>
                            <p className="text-sm text-gray-900">{application.phone || doctorProfile.phone || 'Belirtilmemiş'}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-1">E-posta</p>
                            <p className="text-sm text-gray-900">{application.email || doctorProfile.email || 'Belirtilmemiş'}</p>
                          </div>
                          {(doctorProfile.residence_city_name || application.residence_city_name) && (
                            <div>
                              <p className="text-sm font-medium text-gray-600 mb-1">İkamet Şehri</p>
                              <p className="text-sm text-gray-900">{doctorProfile.residence_city_name || application.residence_city_name}</p>
                            </div>
                          )}
                          {(doctorProfile.birth_place_name || application.birth_place_name) && (
                            <div>
                              <p className="text-sm font-medium text-gray-600 mb-1">Doğum Yeri</p>
                              <p className="text-sm text-gray-900">{doctorProfile.birth_place_name || application.birth_place_name}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Doktor Profil Butonu */}
                      {application.user_id && (
                        <div>
                          <button
                            onClick={() => navigate(`/admin/users/${application.user_id}`)}
                            className="flex items-center justify-center px-6 py-3 rounded-lg transition-colors bg-indigo-500 text-white hover:bg-indigo-600 w-full md:w-auto"
                          >
                            <User className="w-4 h-4 mr-2" />
                            Doktor Profilini Görüntüle
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="bg-white rounded-lg p-6 border border-gray-200 text-center">
                      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Doktor Profili Bulunamadı</h3>
                      <p className="text-gray-600 text-sm mb-2">
                        Bu başvuruya ait doktor profili bulunamadı veya pasif durumda.
                      </p>
                      {!application.user_id && (
                        <p className="text-yellow-600 text-xs mt-2">
                          Uyarı: User ID bulunamadı (user_id: {String(application.user_id)})
                        </p>
                      )}
                      {doctorError && (
                        <p className="text-red-500 text-xs mt-2">
                          Hata: {doctorError.message || JSON.stringify(doctorError)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right - Status Management */}
          <div className="lg:col-span-1 min-w-0">
            <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-full overflow-hidden">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-600" />
                Durum Yönetimi
              </h3>

              {/* Mevcut Durum */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    Mevcut Durum
                  </h4>
                  <div className="text-right flex-shrink-0 whitespace-nowrap">
                    <span className="text-xs text-gray-500 block">Son Güncelleme</span>
                    <span className="text-sm text-gray-700">
                      {application.updated_at
                        ? new Date(application.updated_at).toLocaleDateString('tr-TR')
                        : 'Bilinmiyor'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status_id={application.status_id} statusName={application.status} />
                </div>
                {isWithdrawn && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-yellow-600 text-xs">
                      <AlertCircle className="w-4 h-4" />
                      <span>Geri çekilen başvurularda durum güncelleme yapılamaz.</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Başvuru Tarihi */}
              <div className="mb-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-xs text-gray-600">Başvuru Tarihi</span>
                  </div>
                  <span className="text-sm text-gray-900 font-medium">
                    {application.applied_at
                      ? new Date(application.applied_at).toLocaleDateString('tr-TR')
                      : 'Bilinmiyor'}
                  </span>
                </div>
              </div>

              {/* Durum Seçimi */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Target className="w-4 h-4 text-green-600" />
                  Yeni Durum
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  disabled={isWithdrawn}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {statusOptions.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Not Alanı */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-orange-600" />
                  Admin Notu
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Değerlendirme notları ekleyin..."
                  rows={4}
                  disabled={isWithdrawn}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none transition-all duration-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Mevcut Not Gösterimi */}
              {application.notes && (
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-yellow-600" />
                    Mevcut Not
                  </label>
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-sm">
                      {application.notes}
                    </p>
                  </div>
                </div>
              )}

              {/* Butonlar */}
              {!isWithdrawn ? (
                <div className="flex flex-col gap-3 pt-4 border-t border-gray-200 min-h-[80px]">
                  {/* Sadece Not Güncelle */}
                  {!isStatusChanged && isNotesChanged && (
                    <button
                      onClick={handleNoteOnlyUpdate}
                      disabled={updateStatusMutation.isPending}
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-lg hover:from-orange-600 hover:to-red-600 transition-all duration-300 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed break-words"
                    >
                      {updateStatusMutation.isPending ? 'Güncelleniyor...' : 'Notu Güncelle'}
                    </button>
                  )}

                  {/* Durum ve Not Güncelle */}
                  {isStatusChanged && (
                    <button
                      onClick={handleStatusUpdate}
                      disabled={updateStatusMutation.isPending}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-300 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed break-words"
                    >
                      {updateStatusMutation.isPending ? 'Güncelleniyor...' : 'Durum ve Notu Güncelle'}
                    </button>
                  )}

                  {/* Değişiklik yoksa */}
                  {!isStatusChanged && !isNotesChanged && (
                    <p className="text-xs text-gray-500 text-center py-3">
                      Değişiklik yapmak için yukarıdaki alanları düzenleyin
                    </p>
                  )}
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-200 min-h-[80px]">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-yellow-800 text-sm font-medium mb-1">
                          Durum Güncelleme Devre Dışı
                        </p>
                        <p className="text-yellow-700 text-xs">
                          Geri çekilen başvurularda durum veya not güncellemesi yapılamaz.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <ModalContainer
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Başvuruyu Sil"
          size="small"
          maxHeight="80vh"
          align="center"
          backdropClassName="bg-black/40 backdrop-blur-sm"
        >
          <div className="space-y-6">
            <section className="bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-white/70 border border-rose-200 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-rose-600" />
                </div>
                <div className="flex-1">
                  <p className="text-base font-semibold text-gray-900 mb-2">
                    Başvuruyu kalıcı olarak silmek üzeresiniz
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    "{application.first_name} {application.last_name} - {application.job_title}" başvurusu tamamen silinecek ve bu işlem geri alınamaz.
                  </p>
                </div>
              </div>
            </section>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors font-semibold"
              >
                Vazgeç
              </button>
              <button
                onClick={handleDeleteApplication}
                disabled={deleteApplicationMutation.isPending}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 transition-all font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteApplicationMutation.isPending ? 'Siliniyor...' : 'Evet, Sil'}
              </button>
            </div>
          </div>
        </ModalContainer>
      )}
    </div>
  );
};

export default AdminApplicationDetailPage;
