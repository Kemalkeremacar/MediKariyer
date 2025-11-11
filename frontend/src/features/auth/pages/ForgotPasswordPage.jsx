/**
 * @file ForgotPasswordPage.jsx
 * @description Şifremi Unuttum Sayfası - Kullanıcıların şifre sıfırlama isteği göndermesi için form
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiSend, FiCheckCircle, FiInfo } from 'react-icons/fi';
import { useForgotPassword } from '../api/useAuth';
import { ROUTE_CONFIG } from '@config/routes.js';
import { ButtonSpinner } from '@/components/ui/LoadingSpinner';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const forgotPasswordMutation = useForgotPassword();

  const handleSubmit = (e) => {
    e.preventDefault();

    setFormError('');
    setSuccessMessage('');

    forgotPasswordMutation.mutate(
      { email },
      {
        onSuccess: (res) => {
          setSuccessMessage(res?.message || 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi. Lütfen gelen kutunuzu ve spam klasörünü kontrol edin.');
          setEmail('');
        },
        onError: (error) => {
          const message =
            error?.response?.data?.message ||
            error?.message ||
            'Şifre sıfırlama talebi gönderilirken bir hata oluştu. Lütfen tekrar deneyin.';
          setFormError(message);
        }
      }
    );
  };

  return (
    <div
      className="w-full min-h-screen flex items-center justify-center p-6 bg-white overflow-hidden"
      style={{
        userSelect: 'text',
        WebkitUserSelect: 'text',
        MozUserSelect: 'text',
        msUserSelect: 'text'
      }}
    >
      <div className="max-w-5xl mx-auto w-full space-y-10">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-900">
            Şifrenizi mi Unuttunuz?
          </h1>
          <p className="text-base md:text-lg text-blue-600">
            Kayıtlı e-posta adresinizi girin, size güvenli bir şifre sıfırlama bağlantısı gönderelim.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          {/* Form alanı */}
          <div className="rounded-3xl bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 shadow-2xl border border-blue-400/40 p-8 md:p-10 text-white space-y-8">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.2em] text-blue-100/70 font-semibold">
                Hesap Erişimi
              </p>
              <h2 className="text-2xl font-bold">
                Şifre sıfırlama bağlantısı için e-postanızı girin
              </h2>
              <p className="text-blue-100/80 text-sm leading-relaxed">
                Bağlantı kısa süreliğine geçerli olacak. E-postayı aldıktan sonra bağlantıya tıklayıp yeni şifrenizi belirleyebilirsiniz.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold uppercase tracking-wide text-blue-100/85 mb-3">
                  E-posta Adresi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="h-5 w-5 text-blue-50/80" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (formError) setFormError('');
                      if (successMessage) setSuccessMessage('');
                    }}
                    placeholder="ornek@email.com"
                    className="w-full rounded-2xl border border-white/30 bg-white/15 py-3 pl-11 pr-4 text-white placeholder-blue-50/70 focus:border-white focus:bg-white/25 focus:outline-none focus:ring-2 focus:ring-white/60 transition"
                    disabled={forgotPasswordMutation.isLoading}
                    required
                  />
                </div>
              </div>

              {formError && (
                <div className="bg-red-500/25 border border-red-200/50 rounded-2xl p-4 backdrop-blur-sm text-sm">
                  <div className="flex items-start gap-3">
                    <FiInfo className="h-5 w-5 text-red-50 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-red-50">Hata oluştu</p>
                      <p className="text-red-50/90 mt-1 leading-relaxed">{formError}</p>
                    </div>
                  </div>
                </div>
              )}

              {successMessage && (
                <div className="bg-emerald-400/25 border border-emerald-100/60 rounded-2xl p-4 backdrop-blur-sm text-sm">
                  <div className="flex items-start gap-3">
                    <FiCheckCircle className="h-5 w-5 text-emerald-50 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-emerald-50">Talep alındı</p>
                      <p className="text-emerald-50/90 mt-1 leading-relaxed">{successMessage}</p>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={forgotPasswordMutation.isLoading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-white/25 px-6 py-3 text-lg font-semibold text-white shadow-lg shadow-blue-900/20 transition hover:bg-white/35 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-600 focus:ring-white/70 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {forgotPasswordMutation.isLoading ? (
                  <>
                    <ButtonSpinner />
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    <FiSend className="w-5 h-5" />
                    Şifre Sıfırlama Bağlantısı Gönder
                  </>
                )}
              </button>
            </form>

          </div>

          {/* Bilgilendirme alanı */}
          <div className="rounded-3xl border border-blue-100 bg-blue-50 p-8 md:p-10 shadow-inner space-y-8 text-blue-800">
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-blue-900">Nasıl çalışır?</h2>
              <p className="text-sm leading-relaxed text-blue-700">
                Adımları takip ederek birkaç dakika içinde yeni şifrenizi oluşturabilirsiniz.
              </p>
            </div>

            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="mt-2 h-2.5 w-2.5 rounded-full bg-blue-500" />
                <div>
                  <p className="font-medium text-blue-800">1. Talep oluşturun</p>
                  <p className="text-sm text-blue-700">Kayıtlı e-posta adresinizi girip “Şifre Sıfırlama Bağlantısı Gönder” butonuna tıklayın.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 h-2.5 w-2.5 rounded-full bg-blue-500" />
                <div>
                  <p className="font-medium text-blue-800">2. E-postayı açın</p>
                  <p className="text-sm text-blue-700">Gelen kutunuzda veya spam klasörünüzdeki e-postadaki bağlantıya tıklayın.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 h-2.5 w-2.5 rounded-full bg-blue-500" />
                <div>
                  <p className="font-medium text-blue-800">3. Yeni şifrenizi belirleyin</p>
                  <p className="text-sm text-blue-700">Açılan sayfada güçlü bir şifre oluşturun ve işlemi tamamlayın.</p>
                </div>
              </li>
            </ul>

            <div className="flex flex-col gap-4 text-sm">
              <Link
                to={ROUTE_CONFIG.PUBLIC.LOGIN}
                className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-semibold transition-colors"
              >
                <FiArrowLeft className="h-4 w-4" />
                Giriş sayfasına dön
              </Link>
              <p className="text-xs text-blue-700 leading-relaxed">
                Daha fazla yardıma ihtiyaç duyarsanız{' '}
                <Link
                  to={ROUTE_CONFIG.PUBLIC.CONTACT}
                  className="font-semibold text-blue-800 underline-offset-4 hover:underline"
                >
                  iletişim formu
                </Link>
                nu kullanarak bize ulaşabilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

