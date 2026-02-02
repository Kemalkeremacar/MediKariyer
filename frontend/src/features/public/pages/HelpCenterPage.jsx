/**
 * @file HelpCenterPage.jsx
 * @description Yardım Merkezi ve SSS Sayfası
 */

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Mail, MessageCircle, Info, User, Briefcase, FileText } from 'lucide-react';

const FAQ_DATA = [
  {
    id: '1',
    question: 'Nasıl iş başvurusu yapabilirim?',
    answer: 'İş İlanları sayfasından ilgilendiğiniz ilanı seçin ve "Başvur" butonuna tıklayın. Profilinizin eksiksiz olduğundan emin olun.',
    category: 'jobs',
  },
  {
    id: '2',
    question: 'Başvurularımı nasıl takip edebilirim?',
    answer: 'Başvurular sayfasından tüm başvurularınızı ve durumlarını görebilirsiniz. Durum değişikliklerinde e-posta bildirimi alırsınız.',
    category: 'applications',
  },
  {
    id: '3',
    question: 'Profilimi nasıl güncellerim?',
    answer: 'Profil sayfasından "Profili Düzenle" butonuna tıklayarak kişisel bilgilerinizi, eğitim ve deneyimlerinizi güncelleyebilirsiniz.',
    category: 'account',
  },
  {
    id: '4',
    question: 'Şifremi unuttum, ne yapmalıyım?',
    answer: 'Giriş ekranında "Şifremi Unuttum" linkine tıklayın. E-posta adresinize şifre sıfırlama linki gönderilecektir.',
    category: 'account',
  },
  {
    id: '5',
    question: 'Bildirimler nasıl çalışır?',
    answer: 'Yeni iş ilanları, başvuru güncellemeleri ve mesajlar için e-posta bildirimi alırsınız. Ayarlar sayfasından tercihlerinizi değiştirebilirsiniz.',
    category: 'general',
  },
  {
    id: '6',
    question: 'Hesabımı nasıl kapatırım?',
    answer: 'Ayarlar sayfasından hesabınızı pasifleştirebilir veya kalıcı olarak silebilirsiniz. Silme işlemi geri alınamaz.',
    category: 'account',
  },
  {
    id: '7',
    question: 'Hangi branşlar için iş ilanı var?',
    answer: 'Tüm tıp branşları için iş ilanları bulunmaktadır. Filtreleme yaparak branşınıza uygun ilanları görebilirsiniz.',
    category: 'jobs',
  },
  {
    id: '8',
    question: 'Başvurumu geri çekebilir miyim?',
    answer: 'Evet, başvuru detay sayfasından "Başvuruyu Geri Çek" butonuna tıklayarak başvurunuzu iptal edebilirsiniz.',
    category: 'applications',
  },
  {
    id: '9',
    question: 'Hesap onayı ne kadar sürer?',
    answer: 'Hesap onay süreci genellikle 1-2 iş günü içinde tamamlanır. Onay durumunuz hakkında e-posta ile bilgilendirilirsiniz.',
    category: 'account',
  },
  {
    id: '10',
    question: 'CV\'mi nasıl yüklerim?',
    answer: 'Profil sayfasından CV bölümüne giderek PDF formatında CV\'nizi yükleyebilirsiniz. Maksimum dosya boyutu 5MB\'dir.',
    category: 'general',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'Tümü', icon: Info },
  { id: 'general', label: 'Genel', icon: Info },
  { id: 'account', label: 'Hesap', icon: User },
  { id: 'jobs', label: 'İş İlanları', icon: Briefcase },
  { id: 'applications', label: 'Başvurular', icon: FileText },
];

const HelpCenterPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const filteredFAQ = selectedCategory === 'all'
    ? FAQ_DATA
    : FAQ_DATA.filter(item => item.category === selectedCategory);

  const handleContactSupport = () => {
    window.location.href = 'mailto:info@medikariyer.net?subject=Geri Bildirim ve Şikayet';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl mb-6 shadow-lg">
            <HelpCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Yardım Merkezi
          </h1>
          <p className="text-gray-600 text-lg">
            Sık sorulan sorular ve destek
          </p>
        </div>

        {/* Kategori Filtreleri */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {CATEGORIES.map(category => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`
                  flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all
                  ${selectedCategory === category.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{category.label}</span>
              </button>
            );
          })}
        </div>

        {/* SSS Listesi */}
        <div className="space-y-4 mb-12">
          {filteredFAQ.map(item => (
            <div
              key={item.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-md"
            >
              <button
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                className="w-full flex items-center justify-between p-6 text-left"
              >
                <h3 className="text-lg font-semibold text-gray-900 pr-4">
                  {item.question}
                </h3>
                {expandedId === item.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>
              {expandedId === item.id && (
                <div className="px-6 pb-6 pt-0">
                  <div className="border-t border-gray-100 pt-4">
                    <p className="text-gray-600 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* İletişim Kartı */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200 p-8">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="w-7 h-7 text-blue-600" />
            <h2 className="text-2xl font-bold text-blue-900">
              Hala Yardıma mı İhtiyacınız Var?
            </h2>
          </div>
          <p className="text-blue-700 mb-6 text-lg">
            Sorunuz burada yanıtlanmadıysa, destek ekibimizle iletişime geçebilirsiniz.
          </p>
          <button
            onClick={handleContactSupport}
            className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors shadow-lg shadow-blue-200"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Destek Ekibiyle İletişime Geç</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpCenterPage;
