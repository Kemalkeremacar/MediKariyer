/**
 * About Page - Hakkımızda sayfası
 * Public feature modülü
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTarget, FiEye, FiHeart, FiShield, FiZap, FiArrowRight, FiUsers, FiAward, FiStar, FiClock, FiCheckCircle } from 'react-icons/fi';
import { ROUTE_CONFIG } from '@config/routes.js';

const AboutPage = () => {
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate(ROUTE_CONFIG.PUBLIC.REGISTER);
  };

  const handleContactClick = () => {
    navigate(ROUTE_CONFIG.PUBLIC.CONTACT);
  };

  return (
    <div className="w-full homepage-bg overflow-x-hidden" style={{ userSelect: 'text', WebkitUserSelect: 'text', MozUserSelect: 'text', msUserSelect: 'text' }}>
      {/* Hero Section */}
      <section className="relative py-8 md:py-16 overflow-hidden bg-white">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="animate-fade-in-down">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-blue-900 mb-6 leading-relaxed py-6">
              Hakkımızda
            </h1>
            <p className="mt-6 text-lg md:text-xl text-blue-700 max-w-4xl mx-auto leading-relaxed animate-fade-in-up delay-200">
              MediKariyer, Türkiye'nin sağlık sektöründe doktor ve hastaneleri buluşturan 
              en güvenilir ve yenilikçi kariyer platformudur.
            </p>
            <div className="mt-10 animate-fade-in-up delay-400">
              <button
                onClick={handleRegisterClick}
                className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-8 py-4 rounded-xl text-lg font-medium hover:from-blue-700 hover:to-blue-900 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 hover:scale-105 inline-flex items-center group"
              >
                <FiUsers className="mr-2" />
                Hemen Başla
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 gray-section relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-pattern-dots"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 stagger-children">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiAward className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-blue-900 mb-2">2,500+</div>
              <div className="text-blue-700 text-sm">Aktif Doktor</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiStar className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-blue-900 mb-2">150+</div>
              <div className="text-blue-700 text-sm">Hastane Ortağı</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiUsers className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-blue-900 mb-2">5,000+</div>
              <div className="text-blue-700 text-sm">Başarılı Eşleşme</div>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiClock className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-blue-900 mb-2">%95</div>
              <div className="text-blue-700 text-sm">Başarı Oranı</div>
            </div>
          </div>
        </div>
      </section>

      {/* Misyon ve Vizyon Section */}
      <section className="py-20 white-section-striped relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-pattern-grid"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-blue-900 mb-4">
              Misyonumuz & Vizyonumuz
            </h2>
            <p className="text-xl text-blue-700 max-w-3xl mx-auto">
              Sağlık sektöründe daha iyi bir gelecek inşa etmek için çalışıyoruz
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center stagger-children">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4">
                  <FiTarget className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-blue-900">Misyonumuz</h3>
              </div>
              <p className="text-blue-700 leading-relaxed text-lg">
                Sağlık sektöründe çalışan profesyonellerin kariyerlerini geliştirmelerine 
                yardımcı olmak ve hastanelerin en uygun doktorları bulmalarını sağlamak.
              </p>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mr-4">
                  <FiEye className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-blue-900">Vizyonumuz</h3>
              </div>
              <p className="text-blue-700 leading-relaxed text-lg">
                Türkiye'nin ve bölgenin en büyük sağlık kariyer platformu olmak. 
                Sağlık sektöründe dijital dönüşümün öncüsü olarak çalışmak.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 gray-section relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-pattern-dots"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-blue-900 mb-4">
              Bizimle İletişime Geçin
            </h2>
            <p className="text-lg text-blue-700">
              Sağlık sektöründe kariyerinizi şekillendirmek için doğru yerdesiniz.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center max-w-2xl mx-auto">
            <button
              onClick={handleContactClick}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 text-blue-900 font-bold px-8 py-4 rounded-2xl hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 text-lg hover-lift inline-flex items-center justify-center"
            >
              <FiArrowRight className="mr-2" />
              İletişime Geç
            </button>
            <button
              onClick={handleRegisterClick}
              className="bg-white/10 backdrop-blur-sm border border-white/20 text-blue-900 font-bold px-8 py-4 rounded-2xl hover:bg-white/20 transition-all duration-300 text-lg hover-lift inline-flex items-center justify-center"
            >
              <FiCheckCircle className="mr-2" />
              Ücretsiz Kayıt Ol
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;