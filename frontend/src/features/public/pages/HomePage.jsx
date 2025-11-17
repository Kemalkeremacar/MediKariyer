/**
 * @file HomePage.jsx
 * @description Ana Sayfa - Platform tanıtım sayfası ve giriş noktası
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight, FiUsers, FiShield, FiTrendingUp, FiCheckCircle, FiPlay, FiHeart } from 'react-icons/fi';
import { ROUTE_CONFIG } from '@config/routes.js';
import { useAuthStore } from '@/store/authStore';
import doctorImg from '@/assets/doktor.png';
import heroBg from '@/assets/hero-bg.jpg';

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  // Eğer kullanıcı giriş yapmışsa, rolüne göre dashboard'a yönlendir
  useEffect(() => {
    if (isAuthenticated && user) {
      switch (user.role) {
        case 'admin':
          navigate(ROUTE_CONFIG.ADMIN.DASHBOARD, { replace: true });
          break;
        case 'doctor':
          navigate(ROUTE_CONFIG.DOCTOR.DASHBOARD, { replace: true });
          break;
        case 'hospital':
          navigate(ROUTE_CONFIG.HOSPITAL.DASHBOARD, { replace: true });
          break;
        default:
          // Bilinmeyen rol için login sayfasına yönlendir
          navigate(ROUTE_CONFIG.PUBLIC.LOGIN, { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleRegisterClick = () => {
    navigate(ROUTE_CONFIG.PUBLIC.REGISTER);
  };

  const handleContactClick = () => {
    navigate(ROUTE_CONFIG.PUBLIC.CONTACT);
  };

  const handleAboutClick = () => {
    navigate(ROUTE_CONFIG.PUBLIC.ABOUT);
  };


  return (
    <div className="w-full overflow-x-hidden" style={{ userSelect: 'text', WebkitUserSelect: 'text', MozUserSelect: 'text', msUserSelect: 'text' }}>
      {/* Full-Screen Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroBg}
            alt="MediKariyer Hero"
            className="w-full h-full object-cover"
          />
          {/* Gradient Overlay - Multiple layers for depth */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/85 via-blue-800/75 to-cyan-900/70"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
          
          {/* Animated Pattern Overlay */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        {/* Content Container */}
        <div className="container mx-auto px-4 py-16 md:py-20 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Main Heading */}
            <div className="mb-8 space-y-4">
              <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-white leading-[1.05] tracking-tight drop-shadow-2xl">
                MediKariyer
              </h1>
              <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white/95 leading-tight drop-shadow-lg">
                Türkiye'nin En Büyük
              </p>
              <p className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text text-transparent drop-shadow-lg pb-2 leading-relaxed">
                Hekimlere Özel Kariyer Platformu
              </p>
            </div>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed drop-shadow-md">
              Binlerce sağlık profesyoneli ve kurumu MediKariyer'i tercih ediyor. 
              Kariyerinize uygun fırsatları keşfedin, başvurunuzu yapın.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <button
                onClick={handleRegisterClick}
                className="bg-white text-blue-900 px-10 py-5 rounded-2xl text-lg sm:text-xl font-bold hover:bg-blue-50 transition-all duration-300 shadow-2xl hover:shadow-white/25 hover:scale-105 inline-flex items-center justify-center group"
              >
                Ücretsiz Kayıt Ol
                <FiArrowRight className="ml-3 group-hover:translate-x-1 transition-transform text-xl" />
              </button>
              <button
                onClick={handleAboutClick}
                className="bg-white/10 backdrop-blur-md border-2 border-white/30 text-white px-10 py-5 rounded-2xl text-lg sm:text-xl font-bold hover:bg-white/20 transition-all duration-300 inline-flex items-center justify-center group"
              >
                <FiPlay className="mr-3 group-hover:scale-110 transition-transform text-xl" />
                Nasıl Çalışır?
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">2,500+</div>
                <div className="text-white/90 text-sm md:text-base">Aktif Doktor</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">150+</div>
                <div className="text-white/90 text-sm md:text-base">Sağlık Kurumu</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">5,000+</div>
                <div className="text-white/90 text-sm md:text-base">Başarılı Eşleşme</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">98%</div>
                <div className="text-white/90 text-sm md:text-base">Memnuniyet</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative bg-gradient-to-b from-white via-blue-50/30 to-white">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232563eb' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <span className="inline-block px-4 py-2 mb-4 text-sm font-semibold text-blue-600 bg-blue-100 rounded-full">
              Özelliklerimiz
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-blue-900 mb-6">
              Neden MediKariyer?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
              Sağlık sektöründe kariyerinizi ileriye taşıyacak modern çözümler ve güvenilir hizmetler
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 group border border-blue-100 hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                <FiUsers className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Geniş İş Ağı</h3>
              <p className="text-gray-600 leading-relaxed text-base">
                Türkiye'nin dört bir yanından binlerce sağlık kurumu ve doktor ile bağlantı kurun. 
                Kariyerinize uygun fırsatları keşfedin.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 group border border-blue-100 hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                <FiShield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Güvenli Platform</h3>
              <p className="text-gray-600 leading-relaxed text-base">
                Kişisel bilgileriniz ve profesyonel verileriniz en yüksek güvenlik standartları 
                ile korunur. Güvenle başvuru yapın.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 group border border-blue-100 hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                <FiTrendingUp className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Kariyer Gelişimi</h3>
              <p className="text-gray-600 leading-relaxed text-base">
                Profesyonel gelişiminizi destekleyen araçlar ve kaynaklar ile kariyerinizi 
                bir üst seviyeye taşıyın.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden bg-gray-50">
        {/* Diagonal Lines Pattern - Gri çizgiler (daha belirgin) */}
        <div className="absolute inset-0 opacity-[0.15]" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            #94a3b8,
            #94a3b8 2px,
            transparent 2px,
            transparent 20px
          )`
        }}></div>
        <div className="absolute inset-0 opacity-[0.15]" style={{
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            #94a3b8,
            #94a3b8 2px,
            transparent 2px,
            transparent 20px
          )`
        }}></div>
        
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-transparent to-white/80"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <span className="inline-block px-4 py-2 mb-6 text-sm font-semibold text-blue-600 bg-blue-100 rounded-full">
              Ücretsiz Üyelik
            </span>
            
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-blue-900 mb-6 leading-tight">
              Kariyerinizi Bugün{' '}
              <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mt-2">
                Başlatın
              </span>
            </h2>
            
            <p className="text-xl sm:text-2xl text-gray-600 mb-12 leading-relaxed max-w-2xl mx-auto">
              Binlerce sağlık profesyoneli ve kurumu MediKariyer'i tercih ediyor. 
              Siz de bu büyük ailenin bir parçası olun.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={handleRegisterClick}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-12 py-5 rounded-2xl text-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 inline-flex items-center justify-center group"
              >
                Ücretsiz Kayıt Ol
                <FiArrowRight className="ml-3 group-hover:translate-x-1 transition-transform text-xl" />
              </button>
              <button
                onClick={handleContactClick}
                className="bg-white border-2 border-gray-200 text-gray-700 px-12 py-5 rounded-2xl text-xl font-bold hover:border-blue-600 hover:text-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl inline-flex items-center justify-center group"
              >
                <FiHeart className="mr-3 group-hover:scale-110 transition-transform text-xl" />
                İletişime Geç
              </button>
            </div>
            
            <div className="flex flex-wrap justify-center items-center gap-8 text-gray-600">
              <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-full border border-gray-200 shadow-sm">
                <FiCheckCircle className="text-green-600 text-xl" />
                <span className="font-medium">Ücretsiz Kayıt</span>
              </div>
              <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-full border border-gray-200 shadow-sm">
                <FiCheckCircle className="text-green-600 text-xl" />
                <span className="font-medium">Anında Onay</span>
              </div>
              <div className="flex items-center gap-3 bg-white px-5 py-3 rounded-full border border-gray-200 shadow-sm">
                <FiCheckCircle className="text-green-600 text-xl" />
                <span className="font-medium">7/24 Destek</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;