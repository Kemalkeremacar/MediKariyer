/**
 * @file response.js
 * @description Dokümantasyon sistemi standart API yanıt formatları
 * Ana MediKariyer sistemine uygun yanıt yapısı
 */

'use strict';

/**
 * Başarılı yanıt formatı
 */
const successResponse = (res, data = null, message = 'İşlem başarılı', statusCode = 200) => {
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
 * Hata yanıt formatı
 */
const errorResponse = (res, message = 'Bir hata oluştu', statusCode = 500, errorCode = null) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString()
  };

  if (errorCode) {
    response.errorCode = errorCode;
  }

  return res.status(statusCode).json(response);
};

/**
 * Sayfalama ile birlikte başarılı yanıt
 */
const paginatedResponse = (res, data, pagination, message = 'İşlem başarılı') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      currentPage: pagination.page,
      totalPages: pagination.totalPages,
      totalItems: pagination.totalItems,
      itemsPerPage: pagination.limit,
      hasNextPage: pagination.page < pagination.totalPages,
      hasPrevPage: pagination.page > 1
    },
    timestamp: new Date().toISOString()
  });
};

/**
 * Oluşturma işlemi başarılı yanıt
 */
const createdResponse = (res, data, message = 'Kayıt başarıyla oluşturuldu') => {
  return successResponse(res, data, message, 201);
};

/**
 * Güncelleme işlemi başarılı yanıt
 */
const updatedResponse = (res, data = null, message = 'Kayıt başarıyla güncellendi') => {
  return successResponse(res, data, message, 200);
};

/**
 * Silme işlemi başarılı yanıt
 */
const deletedResponse = (res, message = 'Kayıt başarıyla silindi') => {
  return successResponse(res, null, message, 200);
};

/**
 * Bulunamadı yanıt
 */
const notFoundResponse = (res, message = 'Kayıt bulunamadı') => {
  return errorResponse(res, message, 404, 'NOT_FOUND');
};

/**
 * Validation hatası yanıt
 */
const validationErrorResponse = (res, errors, message = 'Doğrulama hatası') => {
  return res.status(400).json({
    success: false,
    message,
    errors,
    timestamp: new Date().toISOString()
  });
};

/**
 * Yetkilendirme hatası yanıt
 */
const unauthorizedResponse = (res, message = 'Bu işlem için yetkiniz yok') => {
  return errorResponse(res, message, 403, 'UNAUTHORIZED');
};

module.exports = {
  successResponse,
  errorResponse,
  paginatedResponse,
  createdResponse,
  updatedResponse,
  deletedResponse,
  notFoundResponse,
  validationErrorResponse,
  unauthorizedResponse
};