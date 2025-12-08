/**
 * ContactSection - İletişim bölümü
 */

import React, { useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiClock, FiSend } from 'react-icons/fi';
import { showToast } from '@/utils/toastUtils';
import { useSendMessage } from '../../../contact/useContactMessages';
import { contactMessageSchema } from '@config/validation.js';
import { APP_CONFIG } from '@config/app.js';

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  
  const sendMessage = useSendMessage();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Validasyon
      const validatedData = contactMessageSchema.parse(formData);
      
      // API çağrısı
      await sendMessage.mutateAsync(validatedData);
      
      // Form'u temizle
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      if (error.errors) {
        // Zod validasyon hatası
        const firstError = error.errors[0];
        showToast.error(firstError.message);
      }
    }
  };

  return (
    <div className="w-full overflow-x-hidden bg-white" style={{ userSelect: 'text', WebkitUserSelect: 'text', MozUserSelect: 'text', msUserSelect: 'text' }}>
      {/* Header Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50/30">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute top-[-10rem] right-[-10rem] h-[24rem] w-[24rem] rounded-full bg-blue-300/30 blur-3xl" />
          <div className="absolute bottom-[-8rem] left-[-8rem] h-[20rem] w-[20rem] rounded-full bg-cyan-300/20 blur-3xl" />
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232563eb' fill-opacity='0.2'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <span className="inline-block px-4 py-2 mb-6 text-sm font-semibold text-blue-600 bg-blue-100 rounded-full">
              Bize Ulaşın
            </span>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-blue-900 mb-6 leading-tight">
              İletişime Geçin
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 leading-relaxed">
              Projeleriniz için profesyonel destek, danışmanlık ve çözüm önerilerimiz hakkında 
              detaylı bilgi almak için bizimle iletişime geçin.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form and Info Section */}
      <section className="py-20 sm:py-24 relative bg-white">
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch max-w-7xl mx-auto">
            {/* Contact Info */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50/30 rounded-3xl p-8 h-full flex flex-col border border-blue-100 shadow-xl">
              <h2 className="text-3xl font-bold text-blue-900 mb-8">İletişim Bilgileri</h2>
              <div className="space-y-4 flex-1">
                <div className="bg-white rounded-2xl p-6 hover:shadow-lg transition-all duration-300 border border-blue-100">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                      <FiMapPin className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-blue-900 mb-2">Adres</h4>
                      <p className="text-gray-600 leading-relaxed">
                        {APP_CONFIG.CONTACT_INFO.ADDRESS}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl p-6 hover:shadow-lg transition-all duration-300 border border-blue-100">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <FiMail className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-blue-900 mb-2">E-posta</h4>
                      <a href={`mailto:${APP_CONFIG.CONTACT_INFO.EMAIL}`} className="text-gray-600 hover:text-blue-600 transition-colors">
                        {APP_CONFIG.CONTACT_INFO.EMAIL}
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl p-6 hover:shadow-lg transition-all duration-300 border border-blue-100">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <FiPhone className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-blue-900 mb-2">Telefon</h4>
                      <a href={`tel:${APP_CONFIG.CONTACT_INFO.PHONE.replace(/\s/g, '')}`} className="text-gray-600 hover:text-blue-600 transition-colors">
                        {APP_CONFIG.CONTACT_INFO.PHONE_DISPLAY}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl p-6 mt-6 border border-blue-100 shadow-lg">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                    <FiClock className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-blue-900">Çalışma Saatleri</h3>
                </div>
                <div className="ml-16 space-y-1">
                  <p className="text-gray-600"><span className="font-medium text-gray-700">Hafta içi:</span> 09:00 - 18:00</p>
                  <p className="text-gray-600"><span className="font-medium text-gray-700">Hafta sonu:</span> Kapalı</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-3xl p-8 h-full flex flex-col border border-blue-100 shadow-xl">
              <h2 className="text-3xl font-bold text-blue-900 mb-8">Mesaj Gönderin</h2>
              <form onSubmit={handleSubmit} className="space-y-5 flex-1 flex flex-col">
                <div className="flex-1 space-y-5">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">Adınız Soyadınız</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-blue-900 placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                      placeholder="Adınızı ve soyadınızı girin"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">E-posta Adresiniz</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-blue-900 placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                      placeholder="ornek@email.com"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">Konu</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-blue-900 placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                      placeholder="Mesaj konusunu girin"
                    />
                  </div>
                  
                  <div className="flex-1 flex flex-col">
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">Mesajınız</label>
                    <textarea
                      id="message"
                      name="message"
                      rows="6"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-blue-900 placeholder:text-slate-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none resize-none flex-1"
                      placeholder="Mesajınızı buraya yazın..."
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={sendMessage.isPending}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {sendMessage.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Gönderiliyor...
                    </>
                  ) : (
                    <>
                      <FiSend className="mr-2 text-xl" />
                      Mesajı Gönder
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactSection;
