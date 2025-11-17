/**
 * About Page - Hakkımızda sayfası
 * Public feature modülü
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FiTarget,
  FiEye,
  FiHeart,
  FiShield,
  FiZap,
  FiArrowRight,
  FiUsers,
  FiAward,
  FiStar,
  FiClock,
  FiCheckCircle,
} from 'react-icons/fi';
import { ROUTE_CONFIG } from '@config/routes.js';
import useAuthStore from '@/store/authStore';

const introParagraphs = [
  'MEDİKARİYER, sadece hekimler için tasarlanmış özel bir kariyer ve iş bulma platformudur. Sağlık sektöründeki profesyonellerin güvenli, hızlı ve verimli bir şekilde doğru kurumlarla buluşmasını hedefler. Halka açık ilan sitelerinden farklı olarak, MEDİKARİYER kapalı devre bir sistemde çalışır — yalnızca doğrulanmış sağlık kurumları ve lisanslı hekimler platforma erişebilir. Bu sayede, hem kurumların hem de hekimlerin kişisel verileri titizlikle korunur, güvenli bir dijital kariyer ortamı sağlanır.',
  'Yeni nesil yapay zeka algoritmaları sayesinde, sistem her hekime alanına, deneyimine ve tercih ettiği çalışma koşullarına en uygun fırsatları akıllı eşleştirme yöntemiyle sunar. MEDİKARİYER, geleceğin sağlık insan kaynağı planlamasında dijital dönüşümün merkezinde olmayı hedefler.',
];

const stats = [
  { icon: FiAward, value: '2,500+', label: 'Aktif Doktor' },
  { icon: FiStar, value: '150+', label: 'Hastane Ortağı' },
  { icon: FiUsers, value: '5,000+', label: 'Başarılı Eşleşme' },
  { icon: FiClock, value: '%95', label: 'Başarı Oranı' },
];

const missionItems = [
  'Hekimlerin kariyer yolculuklarını güvenli, kolay ve kişisel hale getirmek,',
  'Sağlık kurumlarının doğru hekimlerle hızlı ve etkili biçimde buluşmasını sağlamak,',
  'Kişisel verilerin korunmasına ve etik değerlere öncelik veren bir dijital iş ekosistemi oluşturmak,',
  'Yapay zekâ destekli eşleştirme ile sağlıkta verimliliği ve memnuniyeti artırmak,',
  'Türkiye’nin sağlıkta dijital dönüşümüne katkı sunmak.',
];

const missionIcons = [FiHeart, FiShield, FiZap, FiTarget, FiUsers];

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
    <div
      className="w-full overflow-x-hidden bg-white text-slate-900"
      style={{ userSelect: 'text', WebkitUserSelect: 'text', MozUserSelect: 'text', msUserSelect: 'text' }}
    >
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50/30 py-20 lg:py-32">
        <div className="absolute inset-0">
          <div className="absolute top-[-14rem] right-[-8rem] h-[26rem] w-[26rem] rounded-full bg-blue-300/40 blur-3xl" />
          <div className="absolute bottom-[-10rem] left-[-10rem] h-[24rem] w-[24rem] rounded-full bg-cyan-300/30 blur-3xl" />
          <div className="absolute inset-0 opacity-20" style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232563eb' fill-opacity='0.2'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} />
        </div>

        <div className="relative z-10 container mx-auto px-4">
          <div className="grid items-start gap-16 lg:grid-cols-[1.15fr,0.85fr]">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }}>
              <span className="inline-flex items-center rounded-full bg-blue-100 px-4 py-1 text-sm font-semibold uppercase tracking-wider text-blue-700">
                🩺 MEDİKARİYER
              </span>
              <h1 className="mt-6 text-5xl font-extrabold leading-tight text-blue-900 sm:text-6xl xl:text-[4rem]">Hakkımızda</h1>
              <div className="mt-8 space-y-6 text-lg leading-relaxed text-slate-700">
                {introParagraphs.map((paragraph, index) => (
                  <p key={index} className="text-justify">
                    {paragraph}
                  </p>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
              className="relative"
            >
              <div className="absolute inset-0 rounded-3xl bg-blue-100/70 blur-2xl" />
              <div className="relative rounded-3xl border border-blue-100 bg-white p-8 shadow-[0_25px_55px_-20px_rgba(30,64,175,0.35)]">
                <h2 className="text-2xl font-semibold text-blue-900">MEDİKARİYER</h2>
                <p className="mt-2 text-sm text-slate-500">Veriye dayalı eşleşmelerle sağlık sektörüne hız kazandırıyoruz.</p>

                <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {stats.map(({ icon: Icon, value, label }, index) => (
                    <motion.div
                      key={label}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 + index * 0.1, ease: 'easeOut' }}
                      className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-white p-5 shadow-sm transition-transform duration-300 hover:-translate-y-1"
                    >
                      <div className="flex items-center gap-4 text-slate-800">
                        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700 shadow-sm">
                          <Icon className="h-6 w-6" />
                        </span>
                        <div>
                          <div className="text-2xl font-bold text-blue-900">{value}</div>
                          <div className="text-sm font-medium uppercase tracking-widest text-slate-500">{label}</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="relative overflow-hidden bg-white py-20">
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at top, rgba(59,130,246,0.18), transparent 60%)' }} />
        <div className="absolute inset-y-0 left-0 hidden w-1/3 bg-gradient-to-r from-blue-100 via-white to-transparent lg:block" />
        <div className="relative z-10 container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="mx-auto max-w-3xl text-center"
          >
            <span className="rounded-full bg-blue-100 px-4 py-1 text-sm font-semibold uppercase tracking-[0.3em] text-blue-700">
              Misyonumuz &amp; Vizyonumuz
            </span>
            <h2 className="mt-5 text-3xl sm:text-5xl lg:text-6xl font-extrabold text-blue-900">
              Güvenli, akıllı ve etik bir hekim kariyer ekosistemi için çalışıyoruz.
            </h2>
          </motion.div>

          <div className="mt-16 grid gap-10 lg:grid-cols-[1.2fr,0.8fr]">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
              className="rounded-3xl border border-blue-100 bg-white p-10 shadow-[0_20px_45px_-18px_rgba(30,64,175,0.35)]"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                  <FiTarget className="h-9 w-9" />
                </div>
                <h3 className="text-3xl font-bold text-blue-900">🎯 Misyonumuz</h3>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {missionItems.map((item, index) => {
                  const Icon = missionIcons[index % missionIcons.length];
                  return (
                    <div key={item} className="group flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/80 p-5 transition-all duration-300 hover:border-blue-300 hover:bg-white">
                      <span className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 group-hover:bg-blue-200">
                        <Icon className="h-5 w-5" />
                      </span>
                      <p className="text-base leading-relaxed text-slate-700 group-hover:text-blue-900">{item}</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
              className="flex h-full flex-col justify-between rounded-3xl border border-cyan-100 bg-white p-10 shadow-[0_20px_45px_-18px_rgba(8,145,178,0.35)]"
            >
              <div>
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-600">
                    <FiEye className="h-9 w-9" />
                  </div>
                  <h3 className="text-3xl font-bold text-blue-900">🌍 Vizyonumuz</h3>
                </div>
                <p className="mt-8 text-lg leading-relaxed text-slate-700">
                  Türkiye’nin lider hekim kariyer platformu olmak; uzun vadede sağlıkta dijital dönüşümün merkezinde, yapay zekâ destekli çözümlerle istihdam süreçlerini yeniden tanımlayan bölgesel bir referans haline gelmek.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-white py-20">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(59,130,246,0.18) 0, transparent 55%)' }} />
        <div className="relative z-10 container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="mx-auto max-w-3xl text-center"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-blue-900">Bizimle İletişime Geçin</h2>
            <p className="mt-5 text-lg text-slate-600">
              Sağlık sektöründe kariyerinizi şekillendirmek için doğru yerdesiniz.
            </p>
          </motion.div>

          <div className="mt-12 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-center">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleContactClick}
              className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 px-10 py-4 text-lg font-semibold text-white shadow-[0_18px_35px_-14px_rgba(37,99,235,0.45)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-18px_rgba(37,99,235,0.55)]"
            >
              <FiArrowRight className="h-5 w-5 text-white transition-transform duration-300 group-hover:translate-x-1" />
              İletişime Geç
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleRegisterClick}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-white px-10 py-4 text-lg font-semibold text-blue-600 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-md"
            >
              <FiCheckCircle className="h-5 w-5" />
              Ücretsiz Kayıt Ol
            </motion.button>
          </div>

          <div className="mt-10 text-center text-sm text-slate-600">
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