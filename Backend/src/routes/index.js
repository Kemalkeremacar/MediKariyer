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

module.exports = router;
