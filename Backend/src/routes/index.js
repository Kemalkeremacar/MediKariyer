'use strict';

const express = require('express');
const authRoutes = require('./authRoutes');
const doctorRoutes = require('./doctorRoutes');
const hospitalRoutes = require('./hospitalRoutes');
const adminRoutes = require('./adminRoutes');
const notificationRoutes = require('./notificationRoutes');
const contactRoutes = require('./contactRoutes');
const lookupRoutes = require('./lookupRoutes');
const logRoutes = require('./logRoutes');
const pdfRoutes = require('./pdfRoutes');

const router = express.Router();

// Sistem durumu kontrol noktası
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MediKariyer API çalışıyor',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API bilgi noktası
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MediKariyer Backend API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      doctor: '/api/doctor',
      hospital: '/api/hospital',
      admin: '/api/admin',
      jobs: '/api/jobs',
      applications: '/api/applications',
      notifications: '/api/notifications',
      contact: '/api/contact',
      users: '/api/users',
      logs: '/api/logs',
      pdf: '/api/pdf',
    },
    documentation: '/api/docs',
    timestamp: new Date().toISOString()
  });
});

// Rota modüllerini bağla
router.use('/auth', authRoutes);
router.use('/doctor', doctorRoutes);
router.use('/hospital', hospitalRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);
router.use('/contact', contactRoutes);
router.use('/lookup', lookupRoutes);
router.use('/logs', logRoutes);
router.use('/pdf', pdfRoutes);
router.use('/mobile/auth', require('./mobile/mobileAuthRoutes'));
router.use('/mobile/doctor', require('./mobile/mobileDoctorRoutes'));
router.use('/mobile/jobs', require('./mobile/mobileJobRoutes'));
router.use('/mobile/applications', require('./mobile/mobileApplicationRoutes'));
router.use('/mobile/notifications', require('./mobile/mobileNotificationRoutes'));
router.use('/mobile/upload', require('./mobile/mobileUploadRoutes'));
router.use('/mobile/lookup', require('./mobile/mobileLookupRoutes'));

// Device Token endpoint (push notification için)
// Not: Notification routes ile ilgili ama ayrı endpoint olarak eklendi
const { authMiddleware } = require('../middleware/authMiddleware');
const { requireDoctor } = require('../middleware/roleGuard');
const { mobileErrorHandler, mobileErrorBoundary } = require('../middleware/mobileErrorHandler');
const { validateBody } = require('../middleware/validationMiddleware');
const { mobileDeviceTokenSchema } = require('../validators/mobileSchemas');
const mobileNotificationController = require('../controllers/mobile/mobileNotificationController');

const deviceTokenRouter = express.Router();
deviceTokenRouter.use(mobileErrorHandler);
deviceTokenRouter.use(authMiddleware);
deviceTokenRouter.use(requireDoctor);
deviceTokenRouter.post('/', validateBody(mobileDeviceTokenSchema), mobileNotificationController.registerDeviceToken);
deviceTokenRouter.use(mobileErrorBoundary);
router.use('/mobile/device-token', deviceTokenRouter);

module.exports = router;
