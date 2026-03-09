/**
 * @file logSchemas.js
 * @description Log endpoint'leri için Joi validation schemas
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 */

'use strict';

const Joi = require('joi');

/**
 * Application logs query parametreleri
 */
const applicationLogsQuerySchema = Joi.object({
  level: Joi.string().valid('error', 'warn', 'info', 'http', 'debug'),
  category: Joi.string().max(50),
  platform: Joi.string().valid('web', 'mobile-ios', 'mobile-android'),
  userId: Joi.number().integer().positive(),
  requestId: Joi.string().max(100),
  search: Joi.string().max(200),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(50)
});

/**
 * Audit logs query parametreleri
 */
const auditLogsQuerySchema = Joi.object({
  actorId: Joi.number().integer().positive(),
  action: Joi.string().max(100),
  resourceType: Joi.string().max(50),
  resourceId: Joi.number().integer().positive(),
  search: Joi.string().max(200),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(50)
});

/**
 * Security logs query parametreleri
 */
const securityLogsQuerySchema = Joi.object({
  eventType: Joi.string().max(50),
  severity: Joi.string().valid('low', 'medium', 'high', 'critical'),
  ipAddress: Joi.string().max(45),
  search: Joi.string().max(200),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(50)
});

/**
 * Log statistics query parametreleri
 */
const logStatisticsQuerySchema = Joi.object({
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().min(Joi.ref('startDate'))
});

/**
 * Log cleanup parametreleri
 */
const logCleanupSchema = Joi.object({
  retentionDays: Joi.number().integer().min(1).max(365).default(90)
});

module.exports = {
  applicationLogsQuerySchema,
  auditLogsQuerySchema,
  securityLogsQuerySchema,
  logStatisticsQuerySchema,
  logCleanupSchema
};

