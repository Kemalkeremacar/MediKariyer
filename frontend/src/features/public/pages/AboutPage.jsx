/**
 * About Page - Hakkımızda sayfası
 * Public feature modülü
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiTarget, FiEye, FiHeart, FiShield, FiZap, FiArrowRight, FiUsers, FiAward, FiStar, FiClock, FiCheckCircle } from 'react-icons/fi';
import { ROUTE_CONFIG } from '@config/routes.js';
import useAuthStore from '@/store/authStore';

const AboutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

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
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-blue-900 mb-2 leading-relaxed pt-6">
              🩺 Hakkımızda
            </h1>
            <div className="mt-6 max-w-6xl md:max-w-[64rem] mx-auto animate-fade-in-up delay-200">
              <div className="rounded-2xl bg-white shadow-xl border border-blue-100/60 p-6 md:p-8">
                <div className="text-lg md:text-xl text-blue-700 leading-relaxed space-y-4">
                  <p className="text-justify">
                    Medikariyer.net, sadece hekimler için tasarlanmış özel bir kariyer ve iş bulma platformudur. Sağlık sektöründeki profesyonellerin güvenli, hızlı ve verimli bir şekilde doğru kurumlarla buluşmasını hedefler. Halka açık ilan sitelerinden farklı olarak, Medikariyer.net kapalı devre bir sistemde çalışır — yalnızca doğrulanmış sağlık kurumları ve lisanslı hekimler platforma erişebilir. Bu sayede, hem kurumların hem de hekimlerin kişisel verileri titizlikle korunur, güvenli bir dijital kariyer ortamı sağlanır.
                  </p>
                  <p className="text-justify">
                    Yeni nesil yapay zeka algoritmaları sayesinde, sistem her hekime alanına, deneyimine ve tercih ettiği çalışma koşullarına en uygun fırsatları akıllı eşleştirme yöntemiyle sunar. Medikariyer.net, geleceğin sağlık insan kaynağı planlamasında dijital dönüşümün merkezinde olmayı hedefler.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
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

      {/* Misyon ve Vizyon Section (Geliştirilmiş pencereler) */}
      <section className="py-20 white-section-striped relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-pattern-grid"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-blue-900 mb-3">Misyonumuz & Vizyonumuz</h2>
            <p className="text-lg text-blue-700 max-w-3xl mx-auto">Güvenli, akıllı ve etik bir hekim kariyer ekosistemi için çalışıyoruz.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8 items-stretch">
            {/* Misyon (pencere) */}
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }} className="rounded-2xl p-8 bg-white shadow-xl border border-blue-100/60">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                  <FiTarget className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-blue-900">🎯 Misyonumuz</h3>
              </div>
              <ul className="text-blue-800 leading-relaxed text-base md:text-lg list-disc pl-6 space-y-2">
                <li>Hekimlerin kariyer yolculuklarını güvenli, kolay ve kişisel hale getirmek,</li>
                <li>Sağlık kurumlarının doğru hekimlerle hızlı ve etkili biçimde buluşmasını sağlamak,</li>
                <li>Kişisel verilerin korunmasına ve etik değerlere öncelik veren bir dijital iş ekosistemi oluşturmak,</li>
                <li>Yapay zekâ destekli eşleştirme ile sağlıkta verimliliği ve memnuniyeti artırmak,</li>
                <li>Türkiye’nin sağlıkta dijital dönüşümüne katkı sunmak.</li>
              </ul>
            </motion.div>

            {/* Vizyon (pencere) */}
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }} className="rounded-2xl p-8 bg-white shadow-xl border border-blue-100/60">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                  <FiEye className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-blue-900">🌍 Vizyonumuz</h3>
              </div>
              <p className="text-blue-800 leading-relaxed text-base md:text-lg">
                Türkiye’nin lider hekim kariyer platformu olmak; uzun vadede sağlıkta dijital dönüşümün merkezinde, yapay zekâ destekli çözümlerle istihdam süreçlerini yeniden tanımlayan bölgesel bir referans haline gelmek.
              </p>
            </motion.div>
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

          {/* Rol bazlı kısa CTA */}
          <div className="mt-6 text-center text-blue-800">
            {user?.role === 'doctor' && (
              <p>Uzmanlığınıza uygun iş ilanlarını keşfedin. Profilinizi tamamlayın, akıllı eşleştirme sizi bulsun.</p>
            )}
            {user?.role === 'hospital' && (
              <p>Doğru hekimlerle tanışın. Kurum profilinizi güçlendirin, ihtiyaçlarınıza uygun doktorlarla eşleşin.</p>
            )}
            {user?.role === 'admin' && (
              <p>Platform performansını yönetin. Güven ve gizlilik ilkeleriyle süreçleri optimize edin.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;