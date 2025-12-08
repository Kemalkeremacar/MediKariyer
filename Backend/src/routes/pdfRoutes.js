const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');
const { authMiddleware } = require('../middleware/authMiddleware');

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
