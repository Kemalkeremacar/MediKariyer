import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowRight, FiUsers, FiShield, FiTrendingUp, FiCheckCircle, FiPlay, FiHeart } from 'react-icons/fi';
import { ROUTE_CONFIG } from '@config/routes.js';

const HomePage = () => {
  const navigate = useNavigate();

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
    <div className="w-full homepage-bg overflow-x-hidden" style={{ userSelect: 'text', WebkitUserSelect: 'text', MozUserSelect: 'text', msUserSelect: 'text' }}>
      {/* Hero Section */}
      <section className="relative py-8 sm:py-12 lg:py-16 bg-white">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-16">
              {/* Sol Taraf - Fotoğraf */}
              <div className="order-2 lg:order-1">
                <div className="relative">
                  {/* Ana Fotoğraf Container */}
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                    <img 
                      src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=2070&auto=format&fit=crop"
                      alt="Sağlık Profesyonelleri"
                      className="w-full h-[400px] sm:h-[500px] lg:h-[600px] object-cover"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/20 to-transparent"></div>
                  </div>
                  
                  {/* Dekoratif Elementler */}
                  <div className="absolute -top-4 -left-4 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl"></div>
                  <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl"></div>
                </div>
              </div>

              {/* Sağ Taraf - Hoşgeldiniz Metni */}
              <div className="order-1 lg:order-2 text-center lg:text-left">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-blue-900 leading-tight mb-6">
                  <div className="block">Sağlık Kariyerinizi</div>
                  <div className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600 turkish-text py-2">
                    Şekillendirin
                  </div>
                </h1>
                <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-8" style={{ userSelect: 'text', WebkitUserSelect: 'text', MozUserSelect: 'text', msUserSelect: 'text' }}>
                  Türkiye'nin en kapsamlı sağlık kariyer platformu. Doktorlar ve sağlık kurumlarını 
                  bir araya getiren modern çözümlerle kariyerinizi ileriye taşıyın.
                </p>
                
                <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-4 mb-8">
                  <button
                    onClick={handleRegisterClick}
                    className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-8 py-4 rounded-xl text-base font-medium hover:from-blue-700 hover:to-blue-900 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 hover:scale-105 inline-flex items-center justify-center group"
                  >
                    Hemen Başla
                    <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button
                    onClick={handleAboutClick}
                    className="bg-blue-100 backdrop-blur-sm border-2 border-blue-200 text-blue-800 px-8 py-4 rounded-xl text-base font-medium hover:bg-blue-200 transition-all duration-300 inline-flex items-center justify-center group"
                  >
                    <FiPlay className="mr-2 group-hover:scale-110 transition-transform" />
                    Nasıl Çalışır?
                  </button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div className="bg-blue-100 backdrop-blur-sm rounded-2xl p-6 border border-blue-200">
                <div className="text-4xl font-bold text-blue-600 mb-2">2,500+</div>
                <div className="text-blue-800">Aktif Doktor</div>
              </div>
              <div className="bg-blue-100 backdrop-blur-sm rounded-2xl p-6 border border-blue-200">
                <div className="text-4xl font-bold text-blue-600 mb-2">150+</div>
                <div className="text-blue-800">Sağlık Kurumu</div>
              </div>
              <div className="bg-blue-100 backdrop-blur-sm rounded-2xl p-6 border border-blue-200">
                <div className="text-4xl font-bold text-blue-700 mb-2">5,000+</div>
                <div className="text-blue-800">Başarılı Eşleşme</div>
              </div>
              <div className="bg-blue-100 backdrop-blur-sm rounded-2xl p-6 border border-blue-200">
                <div className="text-4xl font-bold text-blue-800 mb-2">98%</div>
                <div className="text-blue-800">Memnuniyet</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative gray-section">
        <div className="absolute inset-0">
          <div className="medical-particles opacity-30"></div>
        </div>
        
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-4">
              Neden MediKariyer?
            </h2>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Sağlık sektöründe kariyerinizi ileriye taşıyacak modern çözümler
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-blue-100 backdrop-blur-sm rounded-3xl p-8 border border-blue-200 elite-card-hover group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FiUsers className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">Geniş İş Ağı</h3>
              <p className="text-blue-800 leading-relaxed text-sm">
                Türkiye'nin dört bir yanından binlerce sağlık kurumu ve doktor ile bağlantı kurun. 
                Kariyerinize uygun fırsatları keşfedin.
              </p>
            </div>

            <div className="bg-blue-100 backdrop-blur-sm rounded-3xl p-8 border border-blue-200 elite-card-hover group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FiShield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">Güvenli Platform</h3>
              <p className="text-blue-800 leading-relaxed text-sm">
                Kişisel bilgileriniz ve profesyonel verileriniz en yüksek güvenlik standartları 
                ile korunur. Güvenle başvuru yapın.
              </p>
            </div>

            <div className="bg-blue-100 backdrop-blur-sm rounded-3xl p-8 border border-blue-200 elite-card-hover group">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FiTrendingUp className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-blue-900 mb-3">Kariyer Gelişimi</h3>
              <p className="text-blue-800 leading-relaxed text-sm">
                Profesyonel gelişiminizi destekleyen araçlar ve kaynaklar ile kariyerinizi 
                bir üst seviyeye taşıyın.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-4">
              Kariyerinizi Bugün
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-800 mt-1">
                Başlatın
              </span>
            </h2>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              Binlerce sağlık profesyoneli ve kurumu MediKariyer'i tercih ediyor. 
              Siz de bu büyük ailenin bir parçası olun.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8 relative z-10">
              <button
                onClick={handleRegisterClick}
                className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-10 py-5 rounded-2xl text-xl font-bold hover:from-blue-700 hover:to-blue-900 transition-all duration-300 shadow-2xl hover:shadow-blue-500/25 hover:scale-105 inline-flex items-center group cursor-pointer transform active:scale-95"
                style={{ pointerEvents: 'auto', userSelect: 'text' }}
              >
                Ücretsiz Kayıt Ol
                <FiArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={handleContactClick}
                className="bg-blue-100 backdrop-blur-sm border-2 border-blue-200 text-blue-800 px-10 py-5 rounded-2xl text-xl font-bold hover:bg-blue-200 transition-all duration-300 inline-flex items-center group cursor-pointer transform active:scale-95"
                style={{ pointerEvents: 'auto', userSelect: 'text' }}
              >
                <FiHeart className="mr-3 group-hover:scale-110 transition-transform" />
                İletişime Geç
              </button>
            </div>
            
            <div className="flex flex-wrap justify-center items-center gap-8 text-blue-700">
              <div className="flex items-center gap-2">
                <FiCheckCircle className="text-green-600" />
                <span>Ücretsiz Kayıt</span>
              </div>
              <div className="flex items-center gap-2">
                <FiCheckCircle className="text-green-600" />
                <span>Anında Onay</span>
              </div>
              <div className="flex items-center gap-2">
                <FiCheckCircle className="text-green-600" />
                <span>7/24 Destek</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;