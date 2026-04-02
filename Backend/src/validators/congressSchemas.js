'use strict';

const Joi = require('joi');

/**
 * Kongre oluşturma validation şeması
 */
const createCongressSchema = Joi.object({
  title: Joi.string().min(3).max(200).required()
    .messages({
      'string.empty': 'Kongre başlığı gereklidir',
      'string.min': 'Kongre başlığı en az 3 karakter olmalıdır',
      'string.max': 'Kongre başlığı en fazla 200 karakter olmalıdır',
      'any.required': 'Kongre başlığı gereklidir'
    }),
  description: Joi.string().max(2000).allow('', null)
    .messages({
      'string.max': 'Açıklama en fazla 2000 karakter olmalıdır'
    }),
  location: Joi.string().max(200).required()
    .messages({
      'string.empty': 'Konum gereklidir',
      'string.max': 'Konum en fazla 200 karakter olmalıdır',
      'any.required': 'Konum gereklidir'
    }),
  city: Joi.string().max(100).allow('', null)
    .messages({
      'string.max': 'Şehir en fazla 100 karakter olmalıdır'
    }),
  country: Joi.string().max(100).required()
    .messages({
      'string.empty': 'Ülke gereklidir',
      'string.max': 'Ülke en fazla 100 karakter olmalıdır',
      'any.required': 'Ülke gereklidir'
    }),
  start_date: Joi.date().iso().required()
    .messages({
      'date.base': 'Geçerli bir başlangıç tarihi giriniz',
      'any.required': 'Başlangıç tarihi gereklidir'
    }),
  end_date: Joi.date().iso().min(Joi.ref('start_date')).required()
    .messages({
      'date.base': 'Geçerli bir bitiş tarihi giriniz',
      'date.min': 'Bitiş tarihi başlangıç tarihinden önce olamaz',
      'any.required': 'Bitiş tarihi gereklidir'
    }),
  website_url: Joi.string().uri().max(500).allow('', null)
    .messages({
      'string.uri': 'Geçerli bir URL giriniz',
      'string.max': 'Website URL en fazla 500 karakter olmalıdır'
    }),
  registration_url: Joi.string().uri().max(500).allow('', null)
    .messages({
      'string.uri': 'Geçerli bir URL giriniz',
      'string.max': 'Kayıt URL en fazla 500 karakter olmalıdır'
    }),
  organizer: Joi.string().max(200).allow('', null)
    .messages({
      'string.max': 'Organizatör en fazla 200 karakter olmalıdır'
    }),
  specialty_id: Joi.number().integer().positive().allow(null)
    .messages({
      'number.base': 'Uzmanlık alanı geçerli bir ID olmalıdır'
    }),
  subspecialty_id: Joi.number().integer().positive().allow(null)
    .messages({
      'number.base': 'Yan dal geçerli bir ID olmalıdır'
    }),
  image_url: Joi.string().allow('', null),
  poster_image_url: Joi.string().allow('', null),
  is_active: Joi.boolean().default(true)
});

/**
 * Kongre güncelleme validation şeması
 */
const updateCongressSchema = Joi.object({
  title: Joi.string().min(3).max(200)
    .messages({
      'string.min': 'Kongre başlığı en az 3 karakter olmalıdır',
      'string.max': 'Kongre başlığı en fazla 200 karakter olmalıdır'
    }),
  description: Joi.string().max(2000).allow('', null)
    .messages({
      'string.max': 'Açıklama en fazla 2000 karakter olmalıdır'
    }),
  location: Joi.string().max(200)
    .messages({
      'string.max': 'Konum en fazla 200 karakter olmalıdır'
    }),
  city: Joi.string().max(100).allow('', null)
    .messages({
      'string.max': 'Şehir en fazla 100 karakter olmalıdır'
    }),
  country: Joi.string().max(100)
    .messages({
      'string.max': 'Ülke en fazla 100 karakter olmalıdır'
    }),
  start_date: Joi.date().iso()
    .messages({
      'date.base': 'Geçerli bir başlangıç tarihi giriniz'
    }),
  end_date: Joi.date().iso().min(Joi.ref('start_date'))
    .messages({
      'date.base': 'Geçerli bir bitiş tarihi giriniz',
      'date.min': 'Bitiş tarihi başlangıç tarihinden önce olamaz'
    }),
  website_url: Joi.string().uri().max(500).allow('', null)
    .messages({
      'string.uri': 'Geçerli bir URL giriniz',
      'string.max': 'Website URL en fazla 500 karakter olmalıdır'
    }),
  registration_url: Joi.string().uri().max(500).allow('', null)
    .messages({
      'string.uri': 'Geçerli bir URL giriniz',
      'string.max': 'Kayıt URL en fazla 500 karakter olmalıdır'
    }),
  organizer: Joi.string().max(200).allow('', null)
    .messages({
      'string.max': 'Organizatör en fazla 200 karakter olmalıdır'
    }),
  specialty_id: Joi.number().integer().positive().allow(null),
  subspecialty_id: Joi.number().integer().positive().allow(null),
  image_url: Joi.string().allow('', null),
  poster_image_url: Joi.string().allow('', null),
  is_active: Joi.boolean()
}).min(1);

/**
 * Kongre listeleme query validation şeması
 */
const listCongressQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  search: Joi.string().max(200).allow(''),
  specialty_id: Joi.number().integer().positive(),
  subspecialty_id: Joi.number().integer().positive(),
  country: Joi.string().max(100).allow(''),
  city: Joi.string().max(100).allow(''),
  start_date_from: Joi.date().iso(),
  start_date_to: Joi.date().iso(),
  is_active: Joi.boolean(),
  sort_by: Joi.string().valid('start_date', 'end_date', 'title', 'created_at').default('start_date'),
  sort_order: Joi.string().valid('asc', 'desc').default('asc')
});

module.exports = {
  createCongressSchema,
  updateCongressSchema,
  listCongressQuerySchema
};
