/**
 * Not Found Page - 404 sayfası
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiSearch, FiArrowLeft } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300">404</h1>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Sayfa Bulunamadı
          </h2>
          <p className="text-gray-600 mb-8">
            Aradığınız sayfa mevcut değil veya taşınmış olabilir.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            to="/"
            className="w-full bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 flex items-center justify-center font-medium"
          >
            <FiHome className="h-5 w-5 mr-2" />
            Ana Sayfaya Dön
          </Link>
          
          <Link
            to="/jobs"
            className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-300 flex items-center justify-center font-medium"
          >
            <FiSearch className="h-5 w-5 mr-2" />
            İş İlanlarını Görüntüle
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="w-full text-gray-600 hover:text-gray-800 px-6 py-3 flex items-center justify-center"
          >
            <FiArrowLeft className="h-5 w-5 mr-2" />
            Geri Dön
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
