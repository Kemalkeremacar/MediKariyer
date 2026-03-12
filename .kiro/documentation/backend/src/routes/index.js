/**
 * @file routes/index.js
 * @description Dokümantasyon sistemi ana route dosyası
 * Tüm API endpoint'lerini organize eder
 */

'use strict';

const express = require('express');
const { generalLimiter } = require('../middleware/rateLimitMiddleware');

const router = express.Router();

// Genel rate limiting uygula
router.use(generalLimiter);

// Route grupları
// router.use('/auth', require('./authRoutes'));
// router.use('/documentation', require('./documentationRoutes'));
// router.use('/architecture', require('./architectureRoutes'));
// router.use('/roles', require('./roleRoutes'));
// router.use('/flows', require('./flowRoutes'));
// router.use('/impact', require('./impactRoutes'));
// router.use('/search', require('./searchRoutes'));

// Geçici test endpoint'i
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'MediKariyer Dokümantasyon API çalışıyor',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API bilgi endpoint'i
router.get('/info', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'MediKariyer Dokümantasyon API',
      version: '1.0.0',
      description: 'Kapsamlı dokümantasyon sistemi backend API',
      endpoints: {
        // auth: '/api/auth',
        // documentation: '/api/documentation',
        // architecture: '/api/architecture',
        // roles: '/api/roles',
        // flows: '/api/flows',
        // impact: '/api/impact',
        // search: '/api/search'
      }
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;