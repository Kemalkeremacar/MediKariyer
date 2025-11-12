/**
 * @file PendingApprovalPage.jsx
 * @description Onay Bekleme Sayfası - Admin onayı bekleyen kullanıcılar için bilgilendirme sayfası
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTE_CONFIG } from '@config/routes.js';
import { Clock, Mail, Phone, AlertCircle } from 'lucide-react';

const PendingApprovalPage = () => {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-xl p-8 max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Onayı Bekleniyor</h2>
          <p className="text-gray-600">
            Hesabınız başarıyla oluşturuldu. Admin onayı sonrası sisteme giriş yapabilirsiniz.
          </p>
        </div>

        {/* Bilgi Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <Mail className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-blue-900">E-posta Doğrulama</h3>
                <p className="text-sm text-blue-700">E-posta adresiniz doğrulandı</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-yellow-900">Admin Onayı</h3>
                <p className="text-sm text-yellow-700">Onay bekleniyor</p>
              </div>
            </div>
          </div>
        </div>

        {/* Süreç Açıklaması */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Onay Süreci</h3>
          <div className="space-y-3">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-green-600 text-sm font-bold">1</span>
              </div>
              <span className="text-gray-700">Hesap oluşturuldu ve e-posta doğrulandı</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-yellow-600 text-sm font-bold">2</span>
              </div>
              <span className="text-gray-700">Onay bekleniyor</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-gray-600 text-sm font-bold">3</span>
              </div>
              <span className="text-gray-500">Onay sonrası profil tamamlama</span>
            </div>
          </div>
        </div>

        {/* İletişim Bilgileri */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-8">
          <div className="flex items-center">
            <Phone className="h-5 w-5 text-indigo-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-indigo-900">Sorularınız mı var?</h3>
              <p className="text-sm text-indigo-700">
                Onay süreci hakkında bilgi almak için bizimle iletişime geçin.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            to={ROUTE_CONFIG.PUBLIC.LOGIN}
            className="block w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-center"
          >
            Giriş Sayfasına Dön
          </Link>
          <Link
            to={ROUTE_CONFIG.PUBLIC.HOME}
            className="block w-full py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium text-center"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PendingApprovalPage;
