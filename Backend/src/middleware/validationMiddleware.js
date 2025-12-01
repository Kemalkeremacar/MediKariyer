/**
 * @file validationMiddleware.js
 * @description Joi kütüphanesini kullanarak gelen istek verilerini (`body`, `query`, `params`) doğrulamak için
 * yeniden kullanılabilir middleware'ler sağlar. Bu, veri bütünlüğünü sağlar ve hatalı verilerin
 * iş mantığı katmanına ulaşmasını engeller.
 */

const { AppError } = require('../utils/errorHandler');
const logger = require('../utils/logger');

/**
 * Gelen isteğin belirtilen bir kaynağını (body, query, params) verilen Joi şemasına göre doğrulayan bir HOC (Higher-Order Component) middleware.
 * @param {object} schema - Doğrulama için kullanılacak Joi şeması.
 * @param {string} [source='body'] - Doğrulanacak verinin kaynağı. 'body', 'query', veya 'params' olabilir.
 * @returns {function} Express middleware fonksiyonu.
 *
 * @property {object} options - Joi doğrulama seçenekleri:
 * @property {boolean} options.abortEarly - `false` olarak ayarlandığında, ilk hatada durmak yerine tüm hataları toplar.
 * @property {boolean} options.stripUnknown - `true` ise, şemada tanımlanmamış alanları veriden temizler. Bu bir güvenlik önlemidir.
 * @property {boolean} options.convert - `true` ise, Joi'nin veri tiplerini şemaya uygun olarak dönüştürmeye çalışmasına izin verir (örn. string "123" -> number 123).
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const dataToValidate = req[source];
      
      const { error, value } = schema.validate(dataToValidate, {
        abortEarly: false, // Tüm hataları göster
        stripUnknown: true, // Bilinmeyen alanları kaldır
        convert: true // Tip dönüşümü yap
      });

      if (error) {
        const errorMessages = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        }));

        const errorDetails = errorMessages.map(e => `${e.field}: ${e.message}${e.value !== undefined ? ` (value: ${e.value})` : ''}`).join(', ');
        logger.warn(`Validation failed for ${source}:`, JSON.stringify(errorMessages, null, 2));
        logger.warn(`Validation failed details - Source: ${source}, Fields: ${errorDetails}`);
        logger.debug(`Request ${source}:`, JSON.stringify(dataToValidate, null, 2));
        
        throw new AppError('Validasyon hatası', 400, errorMessages);
      }

            // Doğrulama başarılı olduğunda, `stripUnknown` ve `convert` seçenekleri sayesinde temizlenmiş ve dönüştürülmüş
      // veri, `req` nesnesindeki orijinal verinin üzerine yazılır. Bu, sonraki middleware/controller'ların
      // her zaman temizlenmiş veriyle çalışmasını sağlar.
      req[source] = value;
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * `req.body` verisini doğrulamak için `validate` fonksiyonunu kullanan bir kısayol middleware'i.
 * @param {object} schema - `req.body` için kullanılacak Joi şeması.
 * @returns {function} Express middleware fonksiyonu.
 */
const validateBody = (schema) => validate(schema, 'body');

/**
 * `req.query` verisini doğrulamak için `validate` fonksiyonunu kullanan bir kısayol middleware'i.
 * @param {object} schema - `req.query` için kullanılacak Joi şeması.
 * @returns {function} Express middleware fonksiyonu.
 */
const validateQuery = (schema) => validate(schema, 'query');

/**
 * `req.params` verisini doğrulamak için `validate` fonksiyonunu kullanan bir kısayol middleware'i.
 * @param {object} schema - `req.params` için kullanılacak Joi şeması.
 * @returns {function} Express middleware fonksiyonu.
 */
const validateParams = (schema) => validate(schema, 'params');

/**
 * Bir isteğin birden fazla parçasını (body, query, params) tek bir middleware'de doğrulamak için kullanılır.
 * Her bir parça için ayrı Joi şemaları alır.
 * @param {object} schemas - `body`, `query`, ve `params` anahtarlarını içerebilen ve değer olarak Joi şemalarını tutan bir nesne.
 * @example
 * validateMultiple({ 
 *   body: userSchema, 
 *   params: idSchema 
 * })
 * @returns {function} Express middleware fonksiyonu.
 */
const validateMultiple = (schemas) => {
  return (req, res, next) => {
    try {
      const errors = [];

      // Body validasyonu
      if (schemas.body) {
        const { error } = schemas.body.validate(req.body, {
          abortEarly: false,
          stripUnknown: true,
          convert: true
        });
        
        if (error) {
          errors.push(...error.details.map(detail => ({
            source: 'body',
            field: detail.path.join('.'),
            message: detail.message,
            value: detail.context?.value
          })));
        }
      }

      // Params validasyonu
      if (schemas.params) {
        const { error } = schemas.params.validate(req.params, {
          abortEarly: false,
          stripUnknown: true,
          convert: true
        });
        
        if (error) {
          errors.push(...error.details.map(detail => ({
            source: 'params',
            field: detail.path.join('.'),
            message: detail.message,
            value: detail.context?.value
          })));
        }
      }

      // Query validasyonu
      if (schemas.query) {
        const { error } = schemas.query.validate(req.query, {
          abortEarly: false,
          stripUnknown: true,
          convert: true
        });
        
        if (error) {
          errors.push(...error.details.map(detail => ({
            source: 'query',
            field: detail.path.join('.'),
            message: detail.message,
            value: detail.context?.value
          })));
        }
      }

      if (errors.length > 0) {
        logger.warn('Multiple validation failed:', errors);
        throw new AppError('Validasyon hatası', 400, errors);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  validate,
  validateBody,
  validateQuery,
  validateParams,
  validateMultiple
};
