const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');
const { authMiddleware } = require('../middleware/authMiddleware');

/**
 * @route   GET /api/pdf/test
 * @desc    Test PDF generation
 * @access  Public (for testing)
 */
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'PDF routes are working' });
});

/**
 * @route   GET /api/pdf/test-generate
 * @desc    Test PDF generation with puppeteer
 * @access  Public (for testing)
 */
router.get('/test-generate', async (req, res) => {
  try {
    const testData = {
      jobId: 999,
      hospitalName: 'Test Hospital',
      hospitalLogo: null,
      hospitalCity: 'Istanbul',
      hospitalAddress: 'Test Address',
      hospitalPhone: '0555 555 5555',
      hospitalEmail: 'test@test.com',
      hospitalWebsite: 'www.test.com',
      jobTitle: 'Test Job',
      workType: 'Full-time',
      region: 'Istanbul',
      status: 'Active',
      specialty: 'Cardiology',
      subSpecialty: null,
      minExperience: 2,
      requirements: 'Test requirements',
      description: 'Test description',
      workingHours: '9-5',
      benefits: 'Test benefits',
      createdAt: new Date()
    };
    
    const pdfBuffer = await pdfController.generateTestPDF(testData);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="test.pdf"');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.end(pdfBuffer, 'binary');
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'PDF test failed', 
      error: error.message,
      stack: error.stack 
    });
  }
});

/**
 * @route   GET /api/pdf/test-job/:jobId
 * @desc    Test real job PDF generation
 * @access  Public (for testing)
 */
router.get('/test-job/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Fetch job details (same as generateJobPDF)
    const { db } = require('../config/dbConfig');
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

    // Log the data for debugging (development only)
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Job data from DB:', {
        id: job.id,
        title: job.title,
        specialty: job.specialty,
        description: job.description ? job.description.substring(0, 50) + '...' : null,
        requirements: job.requirements ? job.requirements.substring(0, 50) + '...' : null,
        benefits: job.benefits ? job.benefits.substring(0, 50) + '...' : null,
        working_hours: job.working_hours ? job.working_hours.substring(0, 50) + '...' : null
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

    const pdfBuffer = await pdfController.generateTestPDF(pdfData);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="test-job-${jobId}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.end(pdfBuffer, 'binary');
  } catch (error) {
    logger.error('Test job PDF error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'PDF test failed', 
      error: error.message,
      stack: error.stack 
    });
  }
});

/**
 * @route   GET /api/pdf/job/:jobId
 * @desc    Download Job Posting PDF
 * @access  Private (Hospital)
 */
router.get('/job/:jobId', authMiddleware, pdfController.generateJobPDF);

/**
 * @route   GET /api/pdf/job/:jobId/preview
 * @desc    Preview Job Posting PDF in browser
 * @access  Private (Hospital)
 */
router.get('/job/:jobId/preview', authMiddleware, pdfController.previewJobPDF);

/**
 * @route   GET /api/pdf/application/:applicationId
 * @desc    Download Application PDF (Job + Doctor Profile)
 * @access  Private (Hospital)
 */
router.get('/application/:applicationId', authMiddleware, pdfController.generateApplicationPDF);

module.exports = router;
