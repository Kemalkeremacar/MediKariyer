/**
 * HomeSection - Ana sayfa bölümü
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight, FiPlay, FiCheckCircle, FiUsers, FiShield, FiTrendingUp, FiHeart } from 'react-icons/fi';
import { ROUTE_CONFIG } from '@config/routes.js';
import MedicalIllustration from '@/components/ui/MedicalIllustration';

const HomeSection = () => {
  const navigate = useNavigate();

  const handleRegisterClick = () => {
    navigate(ROUTE_CONFIG.PUBLIC.REGISTER);
  };

  const handleAboutClick = () => {
    // Smooth scroll to about section
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start'
      });
    }
  };

  const handleContactClick = () => {
    // Smooth scroll to contact section
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start'
      });
    }
  };

  return (
    <>
      {/* Hero Section - Modern Style */}
      <section className="relative min-h-screen flex items-start justify-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50/30 pt-32 pb-8">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232563eb' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>

        {/* Content Container */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            {/* Desktop: Left Side - All Content */}
            <div className="hidden lg:block text-left space-y-6 order-1 w-full">
              {/* Main Heading */}
              <div className="space-y-5">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl leading-tight" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif' }}>
                  <span className="font-bold text-[#2563a8]">Medikariyer</span>
                  <span className="font-normal text-[#5ba3d0]">.net</span>
                </h1>
                <p className="text-xl sm:text-2xl text-gray-600 leading-relaxed font-normal">
                  Hekimlere Özel Kariyer Platformu
                </p>
                <p className="text-lg sm:text-xl text-gray-500 leading-relaxed max-w-xl font-normal">
                  Medikariyer.net; yalnızca hekimlere odaklanan, iş fırsatlarını, kariyer gelişimini ve bilimsel etkinlikleri tek platformda bir araya getiren yeni nesil dijital kariyer ekosistemidir.
                </p>
                <p className="text-base sm:text-lg text-gray-500 leading-relaxed max-w-xl font-normal">
                  Binlerce hekim ve sağlık kurumu MediKariyer'i tercih ediyor. Kariyerinize uygun fırsatları keşfedin, güvenle başvurun ve profesyonel yolculuğunuzu bir üst seviyeye taşıyın.
                </p>
              </div>

              {/* CTA Button */}
              <div className="pt-3">
                <button
                  onClick={handleRegisterClick}
                  className="bg-blue-600 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 inline-flex items-center justify-center group"
                >
                  BAŞLAYALIM
                  <FiArrowRight className="ml-3 group-hover:translate-x-1 transition-transform text-xl" />
                </button>
              </div>

              {/* Stats - Minimal */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4">
                <div>
                  <div className="text-3xl font-bold text-blue-600">2,500+</div>
                  <div className="text-sm text-gray-600 mt-1">Aktif Hekim</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600">150+</div>
                  <div className="text-sm text-gray-600 mt-1">Sağlık Kurumu</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600">5,000+</div>
                  <div className="text-sm text-gray-600 mt-1">Başarılı Eşleşme</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600">98%</div>
                  <div className="text-sm text-gray-600 mt-1">Memnuniyet</div>
                </div>
              </div>
            </div>

            {/* Mobile: Main Heading First */}
            <div className="lg:hidden text-center space-y-4 order-1 w-full">
              <h1 className="text-5xl sm:text-6xl leading-tight" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif' }}>
                <span className="font-bold text-[#2563a8]">Medikariyer</span>
                <span className="font-normal text-[#5ba3d0]">.net</span>
              </h1>
              <p className="text-xl sm:text-2xl text-gray-600 leading-relaxed font-normal">
                Hekimlere Özel Kariyer Platformu
              </p>
            </div>

            {/* GIF - Desktop: Right Side, Mobile: Second */}
            <div className="relative flex items-center justify-center lg:justify-end w-full order-2">
              <div className="relative w-full max-w-md lg:max-w-2xl">
                {/* Decorative Background Elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-100/30 rounded-full blur-3xl"></div>
                
                {/* Animated SVG Illustration */}
                <div className="relative z-10">
                  <MedicalIllustration />
                </div>
              </div>
            </div>

            {/* Mobile: Rest of Content After GIF */}
            <div className="lg:hidden text-center space-y-6 order-3 w-full">
              {/* Description texts */}
              <div className="space-y-4">
                <p className="text-base sm:text-lg text-gray-500 leading-relaxed font-normal px-4">
                  Medikariyer.net; yalnızca hekimlere odaklanan, iş fırsatlarını, kariyer gelişimini ve bilimsel etkinlikleri tek platformda bir araya getiren yeni nesil dijital kariyer ekosistemidir.
                </p>
                <p className="text-sm sm:text-base text-gray-500 leading-relaxed font-normal px-4">
                  Binlerce hekim ve sağlık kurumu MediKariyer'i tercih ediyor. Kariyerinize uygun fırsatları keşfedin, güvenle başvurun ve profesyonel yolculuğunuzu bir üst seviyeye taşıyın.
                </p>
              </div>

              {/* CTA Button */}
              <div className="pt-3 flex justify-center px-4">
                <button
                  onClick={handleRegisterClick}
                  className="bg-blue-600 text-white px-8 sm:px-10 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 inline-flex items-center justify-center group w-full sm:w-auto max-w-xs"
                >
                  BAŞLAYALIM
                  <FiArrowRight className="ml-3 group-hover:translate-x-1 transition-transform text-xl" />
                </button>
              </div>

              {/* Stats - Minimal */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-4 px-4">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600">2,500+</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">Aktif Hekim</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600">150+</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">Sağlık Kurumu</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600">5,000+</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">Başarılı Eşleşme</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600">98%</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1">Memnuniyet</div>
                </div>
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
              Sağlık sektöründe kariyerinizi ileriye taşıyacak modern çözümler, güvenli altyapı ve akıllı eşleşme teknolojileri.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 group border border-blue-100 hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                <FiShield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Hekimlere Özel Kapalı Sistem</h3>
              <p className="text-gray-600 leading-relaxed text-base">
                MediKariyer, halka açık ilan sitelerinden farklı olarak yalnızca doğrulanmış sağlık kurumları ve lisanslı hekimlerin erişebildiği güvenli bir platformdur. Böylece profesyonel gizlilik korunur ve güvenli bir kariyer ortamı sağlanır.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 group border border-blue-100 hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                <FiUsers className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Geniş ve Güvenilir İş Ağı</h3>
              <p className="text-gray-600 leading-relaxed text-base">
                Türkiye'nin dört bir yanından sağlık kurumları ve hekimlerle bağlantı kurun. Uzmanlık alanınıza ve kariyer hedeflerinize uygun fırsatlara hızlıca ulaşın.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 group border border-blue-100 hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                <FiTrendingUp className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Kariyer Gelişimi ve Bilimsel Ekosistem</h3>
              <p className="text-gray-600 leading-relaxed text-base">
                İş ilanlarının ötesinde; mesleki bilgi paylaşımları, bilimsel toplantılar, kongre duyuruları ve sektörel gelişmelerle kariyerinizi sürekli destekleyin.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 group border border-blue-100 hover:-translate-y-2">
              <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg">
                <FiShield className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-blue-900 mb-4">Güvenli ve Gizlilik Odaklı</h3>
              <p className="text-gray-600 leading-relaxed text-base">
                Kişisel verileriniz ve profesyonel bilgileriniz yüksek güvenlik standartları ile korunur. Güvenle başvurun ve kariyerinizi kontrol altında tutun.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden bg-gray-50">
        {/* Diagonal Lines Pattern */}
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
              <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mt-2 pb-2" style={{ lineHeight: '1.3' }}>
                Başlatın
              </span>
            </h2>
            
            <p className="text-xl sm:text-2xl text-gray-600 mb-12 leading-relaxed max-w-2xl mx-auto">
              Binlerce sağlık profesyoneli ve kurum MediKariyer'i tercih ediyor. 
              Siz de hekimlere özel bu güçlü dijital kariyer ağının bir parçası olun.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={handleRegisterClick}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 sm:px-12 py-4 sm:py-5 rounded-2xl text-lg sm:text-xl font-bold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 inline-flex items-center justify-center group w-full sm:w-auto"
              >
                Ücretsiz Kayıt Ol
                <FiArrowRight className="ml-3 group-hover:translate-x-1 transition-transform text-xl" />
              </button>
              <button
                onClick={handleContactClick}
                className="bg-white border-2 border-gray-200 text-gray-700 px-8 sm:px-12 py-4 sm:py-5 rounded-2xl text-lg sm:text-xl font-bold hover:border-blue-600 hover:text-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl inline-flex items-center justify-center group w-full sm:w-auto"
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
    </>
  );
};

export default HomeSection;
