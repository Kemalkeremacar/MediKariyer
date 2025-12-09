const pdfService = require('../services/pdfService');
const { db } = require('../config/dbConfig');

class PDFController {
  /**
   * Generate Job Posting PDF
   * GET /api/pdf/job/:jobId
   */
  async generateJobPDF(req, res) {
    try {
      const { jobId } = req.params;

      // Fetch job details from database using Knex (doctorService pattern)
      const job = await db('jobs as j')
        .join('hospital_profiles as hp', 'j.hospital_id', 'hp.id')
        .join('job_statuses as js', 'j.status_id', 'js.id')
        .join('specialties as s', 'j.specialty_id', 's.id')
        .leftJoin('cities as c', 'j.city_id', 'c.id')
        .leftJoin('cities as hc', 'hp.city_id', 'hc.id')
        .leftJoin('subspecialties as ss', 'j.subspecialty_id', 'ss.id')
        .where('j.id', jobId)
        .whereNull('j.deleted_at')
        .select(
          'j.*',
          'js.name as status',
          's.name as specialty',
          'c.name as city',
          'ss.name as subspecialty_name',
          'hp.institution_name',
          'hp.logo',
          'hp.address as hospital_address',
          'hp.phone as hospital_phone',
          'hp.email as hospital_email',
          'hp.website as hospital_website',
          'hc.name as hospital_city'
        )
        .first();

      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'İlan bulunamadı'
        });
      }

      // Prepare data for PDF (doctorService pattern)
      const pdfData = {
        jobId: job.id,
        hospitalName: job.institution_name,
        hospitalLogo: job.logo,
        hospitalCity: job.hospital_city,
        hospitalAddress: job.hospital_address,
        hospitalPhone: job.hospital_phone,
        hospitalEmail: job.hospital_email,
        hospitalWebsite: job.hospital_website,
        jobTitle: job.title,
        workType: job.employment_type,
        region: job.city || 'Belirtilmemiş',
        status: job.status,
        specialty: job.specialty,
        subSpecialty: job.subspecialty_name,
        minExperience: job.min_experience_years,
        requirements: job.requirements,
        description: job.description,
        workingHours: job.working_hours,
        benefits: job.benefits,
        createdAt: job.created_at
      };

      // Generate PDF
      // Logo URL'sini loglamadan önce kısalt
      const logData = { ...pdfData };
      if (logData.hospitalLogo && logData.hospitalLogo.length > 100) {
        logData.hospitalLogo = `[Base64 Image: ${logData.hospitalLogo.length} chars]`;
      }
      console.log('PDF Data:', JSON.stringify(logData, null, 2));
      const pdfBuffer = await pdfService.generateJobPostingPDF(pdfData);
      console.log('PDF Buffer length:', pdfBuffer.length);

      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="ilan-${jobId}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.setHeader('Cache-Control', 'no-cache');

      // Send PDF as buffer (not string)
      res.end(pdfBuffer, 'binary');

    } catch (error) {
      console.error('Job PDF generation error:', error);
      res.status(500).json({
        success: false,
        message: 'PDF oluşturulurken bir hata oluştu',
        error: error.message
      });
    }
  }

  /**
   * Generate Application PDF (Job + Doctor Profile)
   * GET /api/pdf/application/:applicationId
   */
  async generateApplicationPDF(req, res) {
    try {
      const { applicationId } = req.params;

      // Fetch application details with doctor and job info using Knex (hospitalService pattern)
      const application = await db('applications as a')
        .join('doctor_profiles as dp', 'a.doctor_profile_id', 'dp.id')
        .join('users as u', 'dp.user_id', 'u.id')
        .join('application_statuses as ast', 'a.status_id', 'ast.id')
        .join('jobs as j', 'a.job_id', 'j.id')
        .join('hospital_profiles as hp', 'j.hospital_id', 'hp.id')
        .leftJoin('cities as rc', 'dp.residence_city_id', 'rc.id')
        .leftJoin('cities as hc', 'hp.city_id', 'hc.id')
        .leftJoin('specialties as s', 'dp.specialty_id', 's.id')
        .leftJoin('subspecialties as ss', 'dp.subspecialty_id', 'ss.id')
        .where('a.id', applicationId)
        .whereNull('a.deleted_at')
        .whereNull('j.deleted_at')
        .select(
          'a.*',
          'dp.first_name',
          'dp.last_name',
          'dp.phone',
          'dp.dob',
          'dp.profile_photo',
          'dp.title as doctor_title',
          'u.email',
          's.name as specialty_name',
          'ss.name as subspecialty_name',
          'rc.name as city_name',
          'j.title as job_title',
          'j.description as job_description',
          'j.employment_type',
          'hp.institution_name as hospital_name',
          'hp.logo as hospital_logo',
          'hp.address as hospital_address',
          'hp.phone as hospital_phone',
          'hp.email as hospital_email',
          'hp.website as hospital_website',
          'hc.name as hospital_city',
          'ast.name as status_name'
        )
        .first();

      if (!application) {
        return res.status(404).json({
          success: false,
          message: 'Başvuru bulunamadı'
        });
      }

      // Fetch doctor's education (hospitalService pattern - de.* kullan)
      const educationResult = await db('doctor_educations as de')
        .leftJoin('doctor_education_types as det', 'de.education_type_id', 'det.id')
        .where('de.doctor_profile_id', application.doctor_profile_id)
        .whereNull('de.deleted_at')
        .select(
          'de.*',
          'det.name as education_type_name'
        )
        .orderBy('de.graduation_year', 'desc');

      // Fetch doctor's experience (hospitalService pattern - dex.* kullan)
      const experienceResult = await db('doctor_experiences as dex')
        .leftJoin('specialties as s', 'dex.specialty_id', 's.id')
        .leftJoin('subspecialties as ss', 'dex.subspecialty_id', 'ss.id')
        .where('dex.doctor_profile_id', application.doctor_profile_id)
        .whereNull('dex.deleted_at')
        .select(
          'dex.*',
          's.name as specialty_name',
          'ss.name as subspecialty_name'
        )
        .orderBy('dex.start_date', 'desc');

      // Fetch doctor's certificates (hospitalService pattern - dc.* kullan)
      const certificatesResult = await db('doctor_certificates as dc')
        .where('dc.doctor_profile_id', application.doctor_profile_id)
        .whereNull('dc.deleted_at')
        .select('dc.*')
        .orderBy('dc.certificate_year', 'desc');

      // Fetch doctor's languages (hospitalService pattern - dl.* kullan)
      const languagesResult = await db('doctor_languages as dl')
        .join('languages as l', 'dl.language_id', 'l.id')
        .join('language_levels as ll', 'dl.level_id', 'll.id')
        .where('dl.doctor_profile_id', application.doctor_profile_id)
        .whereNull('dl.deleted_at')
        .select(
          'dl.*',
          'l.name as language_name',
          'll.name as level_name'
        );

      // Prepare data for PDF
      const pdfData = {
        applicationId: application.id,
        jobTitle: application.job_title,
        jobDescription: application.job_description,
        employmentType: application.employment_type,
        hospitalName: application.hospital_name,
        hospitalLogo: application.hospital_logo,
        hospitalCity: application.hospital_city,
        hospitalAddress: application.hospital_address,
        hospitalPhone: application.hospital_phone,
        hospitalEmail: application.hospital_email,
        hospitalWebsite: application.hospital_website,
        applicationDate: application.applied_at,
        status: application.status_name,
        doctorNote: application.cover_letter,
        doctor: {
          fullName: `${application.doctor_title || ''} ${application.first_name} ${application.last_name}`.trim(),
          email: application.email,
          phone: application.phone,
          birthDate: application.dob,
          city: application.city_name,
          specialty: application.specialty_name,
          subSpecialty: application.subspecialty_name,
          profilePhoto: application.profile_photo,
          education: educationResult || [],
          experience: experienceResult || [],
          certificates: certificatesResult || [],
          languages: languagesResult || []
        }
      };

      // Generate PDF
      const pdfBuffer = await pdfService.generateApplicationPDF(pdfData);

      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="basvuru-${applicationId}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.setHeader('Cache-Control', 'no-cache');

      // Send PDF as buffer (not string)
      res.end(pdfBuffer, 'binary');

    } catch (error) {
      console.error('Application PDF generation error:', error);
      res.status(500).json({
        success: false,
        message: 'PDF oluşturulurken bir hata oluştu',
        error: error.message
      });
    }
  }

  /**
   * Preview Job PDF in browser
   * GET /api/pdf/job/:jobId/preview
   */
  async previewJobPDF(req, res) {
    try {
      const { jobId } = req.params;

      // Same logic as generateJobPDF but with inline disposition using Knex
      const job = await db('jobs as j')
        .join('hospital_profiles as hp', 'j.hospital_id', 'hp.id')
        .join('job_statuses as js', 'j.status_id', 'js.id')
        .join('specialties as s', 'j.specialty_id', 's.id')
        .leftJoin('cities as c', 'j.city_id', 'c.id')
        .leftJoin('cities as hc', 'hp.city_id', 'hc.id')
        .leftJoin('subspecialties as ss', 'j.subspecialty_id', 'ss.id')
        .where('j.id', jobId)
        .whereNull('j.deleted_at')
        .select(
          'j.*',
          'js.name as status',
          's.name as specialty',
          'c.name as city',
          'ss.name as subspecialty_name',
          'hp.institution_name',
          'hp.logo',
          'hp.address as hospital_address',
          'hp.phone as hospital_phone',
          'hp.email as hospital_email',
          'hp.website as hospital_website',
          'hc.name as hospital_city'
        )
        .first();

      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'İlan bulunamadı'
        });
      }

      const pdfData = {
        jobId: job.id,
        hospitalName: job.institution_name,
        hospitalLogo: job.logo,
        hospitalCity: job.hospital_city,
        hospitalAddress: job.hospital_address,
        hospitalPhone: job.hospital_phone,
        hospitalEmail: job.hospital_email,
        hospitalWebsite: job.hospital_website,
        jobTitle: job.title,
        workType: job.employment_type,
        region: job.city || 'Belirtilmemiş',
        status: job.status,
        specialty: job.specialty,
        subSpecialty: job.subspecialty_name,
        minExperience: job.min_experience_years,
        requirements: job.requirements,
        description: job.description,
        workingHours: job.working_hours,
        benefits: job.benefits,
        createdAt: job.created_at
      };

      const pdfBuffer = await pdfService.generateJobPostingPDF(pdfData);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
      res.setHeader('Content-Length', pdfBuffer.length);
      res.setHeader('Cache-Control', 'no-cache');
      res.end(pdfBuffer, 'binary');

    } catch (error) {
      console.error('Job PDF preview error:', error);
      res.status(500).json({
        success: false,
        message: 'PDF önizlemesi oluşturulurken bir hata oluştu',
        error: error.message
      });
    }
  }
}

module.exports = new PDFController();
