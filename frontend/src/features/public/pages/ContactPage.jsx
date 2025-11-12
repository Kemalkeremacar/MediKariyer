/**
 * ContactPage - İletişim sayfası
 * İletişim formu ve bilgileri
 */

import React, { useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiClock, FiSend } from 'react-icons/fi';
import { showToast } from '@/utils/toastUtils';
import { useSendMessage } from '../../contact/useContactMessages';
import { contactMessageSchema } from '@config/validation.js';

const ContactPage = () => {
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
    <div className="w-full homepage-bg overflow-x-hidden" style={{ userSelect: 'text', WebkitUserSelect: 'text', MozUserSelect: 'text', msUserSelect: 'text' }}>
      {/* Header Section */}
      <section className="relative py-4 sm:py-8 lg:py-12 overflow-hidden white-section">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-blue-900 mb-6 leading-relaxed py-6 text-center">
              <span className="text-blue-900">
                İletişime Geçin
              </span>
            </h1>
            <p className="modern-text-primary text-center max-w-4xl mx-auto">
              Projeleriniz için profesyonel destek, danışmanlık ve çözüm önerilerimiz hakkında 
              detaylı bilgi almak için bizimle iletişime geçin.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form and Info Section */}
      <section className="py-16 sm:py-20 relative gray-section">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-pattern-dots"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
            {/* Contact Info */}
            <div className="modern-card p-8 h-full flex flex-col">
              <h2 className="modern-heading-secondary mb-6">İletişim Bilgileri</h2>
              <div className="space-y-6">
                <div className="modern-card p-6 hover-scale transition-transform duration-300">
                  <div className="flex items-start">
                    <div className="modern-icon-container">
                      <FiMapPin className="modern-icon" />
                    </div>
                    <div>
                      <h4 className="modern-heading-tertiary">Adres</h4>
                      <p className="modern-text-primary">Atatürk Mah. Turgut Özal Bulv. Gardenya 1 Plaza<br />İş Merkezi, D:42/B Kat:5 Ataşehir-İstanbul</p>
                    </div>
                  </div>
                </div>
                
                <div className="modern-card p-6 hover-scale transition-transform duration-300">
                  <div className="flex items-start">
                    <div className="modern-icon-container">
                      <FiMail className="modern-icon" />
                    </div>
                    <div>
                      <h4 className="modern-heading-tertiary">E-posta</h4>
                      <p className="modern-text-primary">info@medikariyer.com</p>
                    </div>
                  </div>
                </div>
                
                <div className="modern-card p-6 hover-scale transition-transform duration-300">
                  <div className="flex items-start">
                    <div className="modern-icon-container">
                      <FiPhone className="modern-icon" />
                    </div>
                    <div>
                      <h4 className="modern-heading-tertiary">Telefon</h4>
                      <p className="modern-text-primary">+90 212 227 80 20</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="modern-card p-6 mt-8">
                <div className="flex items-center mb-4">
                  <div className="modern-icon-container">
                    <FiClock className="modern-icon" />
                  </div>
                  <h3 className="modern-heading-tertiary">Çalışma Saatleri</h3>
                </div>
                <p className="modern-text-primary">Hafta içi: 09:00 - 18:00</p>
                <p className="modern-text-primary">Hafta sonu: Kapalı</p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="modern-card p-8 h-full flex flex-col">
              <h2 className="modern-heading-secondary mb-6">Mesaj Gönderin</h2>
              <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
                <div className="flex-1 space-y-6">
                  <div>
                    <label htmlFor="name" className="modern-form-label">Adınız Soyadınız</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="modern-form-input"
                      placeholder="Adınızı ve soyadınızı girin"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="modern-form-label">E-posta Adresiniz</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="modern-form-input"
                      placeholder="E-posta adresinizi girin"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="modern-form-label">Konu</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="modern-form-input"
                      placeholder="Mesaj konusunu girin"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="modern-form-label">Mesajınız</label>
                    <textarea
                      id="message"
                      name="message"
                      rows="4"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="modern-form-input resize-none flex-1"
                      placeholder="Mesajınızı buraya yazın..."
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={sendMessage.isPending}
                  className="w-full modern-btn-primary text-base inline-flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendMessage.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Gönderiliyor...
                    </>
                  ) : (
                    <>
                      <FiSend className="mr-2" />
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

// Helper Components
const ContactInfo = ({ icon, title, text }) => (
  <div className="flex items-start hover-scale transition-transform duration-300">
    <div className="flex-shrink-0 mt-1">{icon}</div>
    <div className="ml-4">
      <h4 className="text-lg font-semibold text-blue-900">{title}</h4>
      <p className="text-blue-800">{text}</p>
    </div>
  </div>
);

const InputField = ({ id, label, type = 'text', value, onChange, required }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-blue-800 mb-2">{label}</label>
    <input
      type={type}
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      required={required}
      className="modern-input w-full"
    />
  </div>
);

const TextAreaField = ({ id, label, value, onChange, required }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-blue-800 mb-2">{label}</label>
    <textarea
      id={id}
      name={id}
      rows="4"
      value={value}
      onChange={onChange}
      required={required}
      className="modern-input w-full resize-none"
    />
  </div>
);

export default ContactPage;
