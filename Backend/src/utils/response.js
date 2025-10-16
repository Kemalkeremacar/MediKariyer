/**
 * @file response.js
 * @description API yanıtlarını standartlaştırmak için kullanılan yardımcı fonksiyonlar modülü.
 * Bu modül, controller'lar içinde tekrar tekrar aynı yanıt yapısını kurma zahmetini ortadan kaldırır.
 * Tüm başarılı ve hatalı yanıtların belirli bir formatta (`{ success, message, data?, errors?, pagination?, timestamp }`)
 * olmasını garanti eder, bu da API'nin tutarlılığını ve öngörülebilirliğini artırır.
 */

'use strict';

/**
 * Genel bir başarılı işlem yanıtı gönderir.
 * @param {object} res - Express'in response nesnesi.
 * @param {string} [message='İşlem başarılı'] - İstemciye gösterilecek başarı mesajı.
 * @param {object|null} [data=null] - Yanıtla birlikte gönderilecek veri.
 * @param {number} [statusCode=200] - HTTP durum kodu.
 * @returns {object} - Gönderilen JSON yanıtı.
 */
const sendSuccess = (res, message = 'İşlem başarılı', data = null, statusCode = 200) => {
  const response = {
    success: true,
    message,
    timestamp: new Date().toISOString()
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Yeni bir kaynak oluşturulduğunda kullanılan özel bir başarılı yanıt (201 Created) gönderir.
 * @param {object} res - Express'in response nesnesi.
 * @param {string} [message='Kayıt başarıyla oluşturuldu'] - Başarı mesajı.
 * @param {object|null} [data=null] - Oluşturulan kaynağın verisi.
 * @returns {object} - Gönderilen JSON yanıtı.
 */
const sendCreated = (res, message = 'Kayıt başarıyla oluşturuldu', data = null) => {
  return sendSuccess(res, message, data, 201);
};

/**
 * Genel bir hata yanıtı gönderir.
 * @param {object} res - Express'in response nesnesi.
 * @param {string} [message='Bir hata oluştu'] - İstemciye gösterilecek hata mesajı.
 * @param {object|null} [errors=null] - Hatanın detaylarını (örn: validasyon hataları) içeren nesne.
 * @param {number} [statusCode=500] - HTTP durum kodu.
 * @returns {object} - Gönderilen JSON yanıtı.
 */
const sendError = (res, message = 'Bir hata oluştu', errors = null, statusCode = 500) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString()
  };

  if (errors !== null) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Geçersiz istek (400 Bad Request) yanıtı gönderir. Genellikle validasyon hataları için kullanılır.
 * @param {object} res - Express'in response nesnesi.
 * @param {string} [message='Geçersiz istek'] - Hata mesajı.
 * @param {object|null} [errors=null] - Validasyon hatalarının detayları.
 * @returns {object} - Gönderilen JSON yanıtı.
 */
const sendBadRequest = (res, message = 'Geçersiz istek', errors = null) => {
  return sendError(res, message, errors, 400);
};

/**
 * Kimlik doğrulama hatası (401 Unauthorized) yanıtı gönderir. Kullanıcının giriş yapmadığı veya token'ının geçersiz olduğu durumlar için kullanılır.
 * @param {object} res - Express'in response nesnesi.
 * @param {string} [message='Kimlik doğrulama gerekli'] - Hata mesajı.
 * @returns {object} - Gönderilen JSON yanıtı.
 */
const sendUnauthorized = (res, message = 'Kimlik doğrulama gerekli') => {
  return sendError(res, message, null, 401);
};

/**
 * Yetki hatası (403 Forbidden) yanıtı gönderir. Kullanıcının kimliği doğrulanmış ancak istenen işleme yetkisi yoksa kullanılır.
 * @param {object} res - Express'in response nesnesi.
 * @param {string} [message='Bu işlem için yetkiniz bulunmamaktadır'] - Hata mesajı.
 * @returns {object} - Gönderilen JSON yanıtı.
 */
const sendForbidden = (res, message = 'Bu işlem için yetkiniz bulunmamaktadır') => {
  return sendError(res, message, null, 403);
};

/**
 * Kaynak bulunamadı (404 Not Found) yanıtı gönderir. İstenen kaynağın (örn: kullanıcı, ilan) veritabanında olmaması durumunda kullanılır.
 * @param {object} res - Express'in response nesnesi.
 * @param {string} [message='Kayıt bulunamadı'] - Hata mesajı.
 * @returns {object} - Gönderilen JSON yanıtı.
 */
const sendNotFound = (res, message = 'Kayıt bulunamadı') => {
  return sendError(res, message, null, 404);
};

/**
 * Çakışma (409 Conflict) yanıtı gönderir. Genellikle benzersiz olması gereken bir alanın (örn: e-posta) tekrar kaydedilmeye çalışılması durumunda kullanılır.
 * @param {object} res - Express'in response nesnesi.
 * @param {string} [message='Kayıt zaten mevcut'] - Hata mesajı.
 * @returns {object} - Gönderilen JSON yanıtı.
 */
const sendConflict = (res, message = 'Kayıt zaten mevcut') => {
  return sendError(res, message, null, 409);
};

/**
 * Genel sunucu hatası (500 Internal Server Error) yanıtı gönderir. Beklenmedik veya programatik hatalar için kullanılır.
 * @param {object} res - Express'in response nesnesi.
 * @param {string} [message='Sunucu hatası'] - Hata mesajı.
 * @returns {object} - Gönderilen JSON yanıtı.
 */
const sendServerError = (res, message = 'Sunucu hatası') => {
  return sendError(res, message, null, 500);
};

/**
 * Sayfalanmış veri seti için standart bir başarılı yanıt gönderir.
 * Yanıt, veri dizisinin yanı sıra sayfalama bilgilerini (`pagination` nesnesi) de içerir.
 * @param {object} res - Express'in response nesnesi.
 * @param {string} [message='Veriler başarıyla getirildi'] - Başarı mesajı.
 * @param {Array} [data=[]] - İstenen sayfadaki veri dizisi.
 * @param {object} [pagination={}] - Sayfalama bilgileri (mevcut sayfa, toplam sayfa, toplam kayıt vb.).
 * @returns {object} - Gönderilen JSON yanıtı.
 */
const sendPaginated = (res, message = 'Veriler başarıyla getirildi', data = [], pagination = {}) => {
  const response = {
    success: true,
    message,
    data,
    pagination: {
      current_page: pagination.current_page || 1,
      per_page: pagination.per_page || 10,
      total: pagination.total || 0,
      total_pages: pagination.total_pages || 0,
      has_next: pagination.has_next || false,
      has_prev: pagination.has_prev || false
    },
    timestamp: new Date().toISOString()
  };

  return res.status(200).json(response);
};

/**
 * Başarılı yanıt için standart format döndürür (res nesnesi olmadan)
 * @param {object|null} [data=null] - Yanıtla birlikte gönderilecek veri.
 * @param {string} [message='İşlem başarılı'] - İstemciye gösterilecek başarı mesajı.
 * @returns {object} - Standart başarı yanıtı.
 */
const successResponse = (data = null, message = 'İşlem başarılı') => {
  const response = {
    success: true,
    message,
    timestamp: new Date().toISOString()
  };

  if (data !== null) {
    response.data = data;
  }

  return response;
};

/**
 * Hata yanıtı için standart format döndürür (res nesnesi olmadan)
 * @param {string} [message='Bir hata oluştu'] - İstemciye gösterilecek hata mesajı.
 * @param {object|null} [errors=null] - Hatanın detaylarını içeren nesne.
 * @returns {object} - Standart hata yanıtı.
 */
const errorResponse = (message = 'Bir hata oluştu', errors = null) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString()
  };

  if (errors !== null) {
    response.errors = errors;
  }

  return response;
};

module.exports = {
  sendSuccess,
  sendCreated,
  sendError,
  sendBadRequest,
  sendUnauthorized,
  sendForbidden,
  sendNotFound,
  sendConflict,
  sendServerError,
  sendPaginated,
  successResponse,
  errorResponse
};
