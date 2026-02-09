/**
 * @file PrivacyPolicyPage.jsx
 * @description Gizlilik Politikası Sayfası
 */

import React from 'react';
import { Shield, User, School, Smartphone, BarChart3, Mail } from 'lucide-react';

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mb-6 shadow-lg">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Gizlilik Politikası
          </h1>
          <p className="text-gray-600">
            Son güncelleme: 2 Şubat 2025
          </p>
        </div>

        {/* Giriş */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
          <p className="text-gray-700 leading-relaxed">
            MediKariyer olarak, kişisel verilerinizin güvenliği bizim için son derece önemlidir. 
            Yalnızca hekimlere odaklanan kapalı devre sistemimizde, doğrulanmış sağlık kurumları ve 
            lisanslı hekimlerin kişisel verileri en yüksek güvenlik standartları ile korunur. 
            Bu gizlilik politikası, platformumuzu kullanırken toplanan, işlenen ve saklanan 
            kişisel verileriniz hakkında sizi bilgilendirmek amacıyla hazırlanmıştır.
          </p>
        </div>

        {/* Toplanan Bilgiler */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wider mb-4">
            1. TOPLANAN BİLGİLER
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Kişisel Bilgiler
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Ad, soyad, e-posta adresi, telefon numarası, TC kimlik numarası, doğum tarihi
                </p>
              </div>
            </div>

            <div className="h-px bg-gray-200"></div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <School className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Mesleki Bilgiler
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Eğitim geçmişi, iş deneyimi, sertifikalar, uzmanlık alanı, dil becerileri
                </p>
              </div>
            </div>

            <div className="h-px bg-gray-200"></div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Cihaz Bilgileri
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Tarayıcı türü, işletim sistemi, IP adresi, çerez bilgileri
                </p>
              </div>
            </div>

            <div className="h-px bg-gray-200"></div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Kullanım Bilgileri
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Platform kullanım istatistikleri, görüntülenen sayfalar, tıklama verileri
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bilgilerin Kullanımı */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wider mb-4">
            2. BİLGİLERİN KULLANIMI
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
          <p className="text-gray-700 mb-4">
            Toplanan bilgiler aşağıdaki amaçlarla kullanılır:
          </p>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Yapay zeka destekli eşleşme ile size özel iş fırsatları önerme</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Uzmanlık alanı, deneyim ve lokasyon tercihlerinize göre akıllı eşleştirme</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Başvurularınızı işleme ve takip etme</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Hesap güvenliğinizi sağlama ve kapalı sistem erişim kontrolü</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Platform performansını iyileştirme</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Bilimsel etkinlikler ve kariyer gelişimi bildirimleri gönderme</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Yasal yükümlülükleri yerine getirme</span>
            </li>
          </ul>
        </div>

        {/* Veri Güvenliği */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wider mb-4">
            3. VERİ GÜVENLİĞİ
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
          <p className="text-gray-700 mb-4">
            Kişisel verilerinizin güvenliğini sağlamak için endüstri standardı güvenlik 
            önlemleri kullanıyoruz:
          </p>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>SSL/TLS şifreleme ile veri iletimi</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Güvenli sunucularda veri saklama</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Düzenli güvenlik denetimleri</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Erişim kontrolü ve yetkilendirme</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Şifre hashleme ve token tabanlı kimlik doğrulama</span>
            </li>
          </ul>
        </div>

        {/* Veri Paylaşımı */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wider mb-4">
            4. VERİ PAYLAŞIMI
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
          <p className="text-gray-700 mb-4">
            Kişisel verileriniz yalnızca aşağıdaki durumlarda üçüncü taraflarla paylaşılır:
          </p>
          <ul className="space-y-2 text-gray-600 mb-4">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>İş başvurusu yaptığınız doğrulanmış sağlık kuruluşları ile</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Yasal zorunluluklar gereği yetkili makamlarla</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Hizmet sağlayıcılarımız ile (hosting, analitik vb.)</span>
            </li>
          </ul>
          <p className="text-sm text-blue-700 italic">
            Not: Kapalı sistem yapımız sayesinde verileriniz yalnızca doğrulanmış kullanıcılarla paylaşılır ve hiçbir zaman pazarlama amaçlı üçüncü taraflara satılmaz.
          </p>
        </div>

        {/* Haklarınız */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wider mb-4">
            5. HAKLARINIZ
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
          <p className="text-gray-700 mb-4">
            KVKK kapsamında aşağıdaki haklara sahipsiniz:
          </p>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Kişisel verilerinizin işlenip işlenmediğini öğrenme</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>İşlenmişse buna ilişkin bilgi talep etme</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Verilerin işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Verilerin eksik veya yanlış işlenmiş olması halinde düzeltilmesini isteme</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Verilerin silinmesini veya yok edilmesini isteme</span>
            </li>
          </ul>
        </div>

        {/* Çerezler */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wider mb-4">
            6. ÇEREZLER VE TAKİP TEKNOLOJİLERİ
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
          <p className="text-gray-700 mb-4">
            Platformumuz, kullanıcı deneyimini iyileştirmek için aşağıdaki teknolojileri kullanır:
          </p>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Oturum yönetimi için güvenli token'lar</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Kullanıcı tercihlerini saklamak için çerezler</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Platform performansını izlemek için analitik araçlar</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Hata raporlama ve düzeltme için izleme sistemleri</span>
            </li>
          </ul>
        </div>

        {/* Değişiklikler */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wider mb-4">
            7. POLİTİKA DEĞİŞİKLİKLERİ
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
          <p className="text-gray-700">
            Bu gizlilik politikası zaman zaman güncellenebilir. Önemli değişiklikler olduğunda 
            sizi e-posta yoluyla bilgilendireceğiz. Politikayı düzenli olarak gözden geçirmenizi 
            öneririz.
          </p>
        </div>

        {/* İletişim */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 p-8">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">
              İletişim
            </h3>
          </div>
          <p className="text-blue-700 mb-3">
            Gizlilik politikamız hakkında sorularınız için:
          </p>
          <div className="space-y-2 text-blue-700">
            <p>📧 info@medikariyer.net</p>
            <p>🌐 www.medikariyer.net</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
