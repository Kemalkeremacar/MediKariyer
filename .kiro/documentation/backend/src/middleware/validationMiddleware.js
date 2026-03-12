/**
 * @file validationMiddleware.js
 * @description Dokümantasyon sistemi validation middleware'i
 * Joi tabanlı doğrulama sistemi
 */

'use strict';

const _Joi = require('joi');
const { validationErrorResponse } = require('../utils/response');
const logger = require('../utils/logger');

/**
 * Request body validation middleware'i
 * @param {Joi.Schema} schema Joi validation şeması
 */
const validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Tüm hataları göster
      stripUnknown: true, // Bilinmeyen alanları kaldır
      convert: true // Tip dönüşümü yap
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      logger.warn('Validation hatası:', { errors, body: req.body });
      
      return validationErrorResponse(res, errors, 'Gönderilen veriler geçerli değil');
    }

    // Doğrulanmış ve temizlenmiş veriyi request'e ata
    req.body = value;
    next();
  };
};

/**
 * Request params validation middleware'i
 * @param {Joi.Schema} schema Joi validation şeması
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      logger.warn('Params validation hatası:', { errors, params: req.params });
      
      return validationErrorResponse(res, errors, 'URL parametreleri geçerli değil');
    }

    req.params = value;
    next();
  };
};

/**
 * Request query validation middleware'i
 * @param {Joi.Schema} schema Joi validation şeması
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      logger.warn('Query validation hatası:', { errors, query: req.query });
      
      return validationErrorResponse(res, errors, 'Sorgu parametreleri geçerli değil');
    }

    req.query = value;
    next();
  };
};

/**
 * Genel validation middleware'i (body, params, query)
 * @param {Object} schemas Validation şemaları
 * @param {Joi.Schema} schemas.body Body şeması
 * @param {Joi.Schema} schemas.params Params şeması
 * @param {Joi.Schema} schemas.query Query şeması
 */
const validate = (schemas) => {
  return (req, res, next) => {
    const errors = [];

    // Body validation
    if (schemas.body) {
      const { error } = schemas.body.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
        convert: true
      });

      if (error) {
        errors.push(...error.details.map(detail => ({
          type: 'body',
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        })));
      }
    }

    // Params validation
    if (schemas.params) {
      const { error } = schemas.params.validate(req.params, {
        abortEarly: false,
        stripUnknown: true,
        convert: true
      });

      if (error) {
        errors.push(...error.details.map(detail => ({
          type: 'params',
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        })));
      }
    }

    // Query validation
    if (schemas.query) {
      const { error } = schemas.query.validate(req.query, {
        abortEarly: false,
        stripUnknown: true,
        convert: true
      });

      if (error) {
        errors.push(...error.details.map(detail => ({
          type: 'query',
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        })));
      }
    }

    if (errors.length > 0) {
      logger.warn('Validation hataları:', { errors });
      return validationErrorResponse(res, errors, 'Gönderilen veriler geçerli değil');
    }

    next();
  };
};

module.exports = {
  validateBody,
  validateParams,
  validateQuery,
  validate
};