/**
 * @file TermsOfServicePage.jsx
 * @description Kullanım Koşulları Sayfası
 */

import React from 'react';
import { FileText, UserPlus, ShieldCheck, CheckCircle2, Mail } from 'lucide-react';

const TermsOfServicePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mb-6 shadow-lg">
            <FileText className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Kullanım Koşulları
          </h1>
          <p className="text-gray-600">
            Son güncelleme: 2 Şubat 2025
          </p>
        </div>

        {/* Giriş */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
          <p className="text-gray-700 leading-relaxed">
            MediKariyer platformunu kullanarak aşağıdaki kullanım koşullarını kabul 
            etmiş sayılırsınız. Platformumuz yalnızca hekimlere özel, kapalı devre bir sistem olup, 
            doğrulanmış sağlık kurumları ve lisanslı hekimler tarafından kullanılabilir. 
            Lütfen platformu kullanmadan önce bu koşulları dikkatlice okuyunuz.
          </p>
        </div>

        {/* Hizmet Tanımı */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wider mb-4">
            1. HİZMET TANIMI
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
          <p className="text-gray-700 mb-4">
            MediKariyer, yalnızca hekimler için tasarlanmış kapalı devre bir kariyer platformudur. 
            Platform aşağıdaki hizmetleri sunar:
          </p>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Yapay zeka destekli akıllı iş eşleştirme</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>İş ilanlarını görüntüleme ve arama</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>İş başvurusu yapma ve takip etme</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Profesyonel profil oluşturma</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Bilimsel etkinlikler ve kongre duyuruları</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Kariyer gelişimi ve mesleki bilgi paylaşımları</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Doğrulanmış sağlık kuruluşları ile güvenli iletişim</span>
            </li>
          </ul>
        </div>

        {/* Kullanıcı Yükümlülükleri */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wider mb-4">
            2. KULLANICI YÜKÜMLÜLÜKLERİ
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
          <p className="text-gray-700 mb-4">
            Platformu kullanırken aşağıdaki kurallara uymayı kabul edersiniz:
          </p>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Doğru ve güncel bilgiler sağlamak</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Hesap güvenliğinizi korumak ve şifrenizi paylaşmamak</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Başkalarının haklarına saygı göstermek</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Yasalara ve etik kurallara uymak</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Spam veya zararlı içerik paylaşmamak</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Sistemi manipüle etmeye çalışmamak</span>
            </li>
          </ul>
        </div>

        {/* Hesap Oluşturma */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wider mb-4">
            3. HESAP OLUŞTURMA VE GÜVENLİK
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Hesap Oluşturma
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Platformu kullanmak için geçerli bir hekim hesabı oluşturmanız gerekmektedir. 
                  Kayıt sırasında verdiğiniz bilgilerin doğru ve eksiksiz olması zorunludur. 
                  Hesabınız doğrulama sürecinden geçecektir.
                </p>
              </div>
            </div>

            <div className="h-px bg-gray-200"></div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Hesap Güvenliği
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Hesabınızın güvenliğinden siz sorumlusunuz. Şifrenizi güvenli tutmalı ve 
                  kimseyle paylaşmamalısınız. Yetkisiz erişim fark ederseniz derhal bize bildirin.
                </p>
              </div>
            </div>

            <div className="h-px bg-gray-200"></div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Hesap Onayı
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Hesabınız yönetici onayından sonra aktif hale gelir. Onay süreci 1-2 iş günü 
                  sürebilir. Onay durumunuz hakkında e-posta ile bilgilendirileceksiniz.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* İçerik ve Sorumluluk */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wider mb-4">
            4. İÇERİK VE SORUMLULUK
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
          <p className="text-gray-700 mb-4">
            Platforma yüklediğiniz içeriklerden (CV, sertifikalar, fotoğraflar vb.) siz 
            sorumlusunuz. İçeriklerinizin:
          </p>
          <ul className="space-y-2 text-gray-600 mb-4">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Doğru ve güncel olması</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Telif haklarına uygun olması</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Yasalara aykırı olmaması</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Başkalarının haklarını ihlal etmemesi</span>
            </li>
          </ul>
          <p className="text-sm text-amber-700 italic">
            Not: Uygunsuz içerikler uyarı yapılmaksızın kaldırılabilir ve hesabınız askıya alınabilir.
          </p>
        </div>

        {/* Fikri Mülkiyet */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wider mb-4">
            5. FİKRİ MÜLKİYET HAKLARI
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
          <p className="text-gray-700 mb-4">
            MediKariyer platformu, logosu, tasarımı ve içeriği MediKariyer'e aittir ve 
            fikri mülkiyet yasaları ile korunmaktadır. Aşağıdaki eylemler yasaktır:
          </p>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Platformu kopyalamak veya tersine mühendislik yapmak</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>İçerikleri izinsiz kullanmak veya dağıtmak</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Logoyu veya marka unsurlarını izinsiz kullanmak</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Otomatik sistemlerle veri toplamak (scraping)</span>
            </li>
          </ul>
        </div>

        {/* Hizmet Değişiklikleri */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wider mb-4">
            6. HİZMET DEĞİŞİKLİKLERİ VE SONLANDIRMA
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
          <p className="text-gray-700 mb-4">
            MediKariyer, hizmeti geliştirmek veya değiştirmek hakkını saklı tutar:
          </p>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Özellikler eklenebilir veya kaldırılabilir</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Kullanım koşulları güncellenebilir</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Hizmet geçici olarak askıya alınabilir (bakım vb.)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Kural ihlali durumunda hesaplar kapatılabilir</span>
            </li>
          </ul>
        </div>

        {/* Sorumluluk Reddi */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wider mb-4">
            7. SORUMLULUK REDDİ
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
          <p className="text-gray-700 mb-4">
            MediKariyer aşağıdaki konularda sorumluluk kabul etmez:
          </p>
          <ul className="space-y-2 text-gray-600 mb-4">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>İş ilanlarının doğruluğu ve güncelliği</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>İşe alım süreçlerinin sonuçları</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Kullanıcılar arası iletişim ve anlaşmazlıklar</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Üçüncü taraf hizmetlerden kaynaklanan sorunlar</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Teknik aksaklıklar veya veri kayıpları</span>
            </li>
          </ul>
          <p className="text-sm text-amber-700 italic">
            Hizmet "olduğu gibi" sunulmaktadır. Kesintisiz veya hatasız çalışma garantisi verilmez.
          </p>
        </div>

        {/* Uyuşmazlık Çözümü */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wider mb-4">
            8. UYUŞMAZLIK ÇÖZÜMÜ
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
          <p className="text-gray-700">
            Bu kullanım koşullarından doğan uyuşmazlıklar Türkiye Cumhuriyeti yasalarına tabidir. 
            Uyuşmazlıkların çözümünde İstanbul mahkemeleri ve icra daireleri yetkilidir.
          </p>
        </div>

        {/* Değişiklikler */}
        <div className="mb-8">
          <h2 className="text-sm font-bold text-blue-700 uppercase tracking-wider mb-4">
            9. KOŞUL DEĞİŞİKLİKLERİ
          </h2>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-6">
          <p className="text-gray-700">
            Bu kullanım koşulları zaman zaman güncellenebilir. Önemli değişiklikler olduğunda 
            sizi bilgilendireceğiz. Güncellemelerden sonra platformu kullanmaya devam ederseniz, 
            yeni koşulları kabul etmiş sayılırsınız.
          </p>
        </div>

        {/* Kabul */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-8 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle2 className="w-7 h-7 text-green-600" />
            <h3 className="text-lg font-semibold text-green-900">
              Koşulların Kabulü
            </h3>
          </div>
          <p className="text-green-700 leading-relaxed">
            MediKariyer platformunu kullanarak bu kullanım koşullarını okuduğunuzu, 
            anladığınızı ve kabul ettiğinizi beyan edersiniz.
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
            Kullanım koşulları hakkında sorularınız için:
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

export default TermsOfServicePage;
