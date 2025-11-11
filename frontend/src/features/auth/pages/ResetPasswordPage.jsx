/**
 * @file ResetPasswordPage.jsx
 * @description Şifre sıfırlama sayfası - Kullanıcı yeni şifresini belirler.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiLock, FiEye, FiEyeOff, FiArrowLeft, FiInfo } from 'react-icons/fi';
import { useResetPassword } from '../api/useAuth';
import { ROUTE_CONFIG } from '@config/routes.js';
import { ButtonSpinner } from '@/components/ui/LoadingSpinner';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();

  const tokenFromQuery = useMemo(() => searchParams.get('token') || '', [searchParams]);

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [formError, setFormError] = useState('');
  const [token, setToken] = useState(tokenFromQuery);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const resetPasswordMutation = useResetPassword();

  useEffect(() => {
    setToken(tokenFromQuery);
  }, [tokenFromQuery]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (formError) setFormError('');
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!token) {
      setFormError('Geçersiz veya eksik şifre sıfırlama bağlantısı.');
      return;
    }

    resetPasswordMutation.mutate(
      {
        token,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      },
      {
        onError: (error) => {
          const message =
            error?.response?.data?.message ||
            error?.message ||
            'Şifre sıfırlama işlemi sırasında bir hata oluştu.';
          setFormError(message);
        }
      }
    );
  };

  const isSubmitDisabled = resetPasswordMutation.isLoading || !token;

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
        <div className="text-center space-y-4">
          <p className="text-2xl md:text-3xl font-semibold tracking-[0.4em] text-blue-800 uppercase">
            MediKariyer
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-blue-900">
            Yeni Şifrenizi Belirleyin
          </h1>
          <p className="text-base md:text-lg text-blue-600">
            Güvenliğiniz için güçlü bir şifre seçin ve hesabınıza tekrar erişin.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div className="rounded-3xl bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 shadow-2xl border border-blue-400/40 p-8 md:p-10 text-white space-y-8">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.2em] text-blue-100/70 font-semibold">
                Şifre Sıfırlama
              </p>
              <h2 className="text-2xl font-bold">
                Yeni şifrenizi oluşturun
              </h2>
              <p className="text-blue-100/80 text-sm leading-relaxed">
                Şifreniz en az 6 karakter olmalı ve büyük harf, küçük harf, rakam ve özel karakter içermelidir.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {!token && (
                <div className="bg-yellow-400/20 border border-yellow-200/60 rounded-2xl p-4 text-sm text-yellow-50 backdrop-blur-sm">
                  Şifre sıfırlama bağlantısı geçersiz görünüyor. Lütfen e-posta kutunuzdaki en güncel bağlantıyı
                  kullanın veya yeniden talep oluşturun.
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold uppercase tracking-wide text-blue-100/85 mb-3">
                    Yeni Şifre
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="h-5 w-5 text-blue-50/80" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Yeni şifrenizi girin"
                      className="w-full rounded-2xl border border-white/30 bg-white/15 py-3 pl-11 pr-12 text-white placeholder-blue-50/70 focus:border-white focus:bg-white/25 focus:outline-none focus:ring-2 focus:ring-white/60 transition"
                      disabled={isSubmitDisabled}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-blue-50/80 hover:text-white transition"
                    >
                      {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold uppercase tracking-wide text-blue-100/85 mb-3">
                    Şifre Tekrarı
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="h-5 w-5 text-blue-50/80" />
                    </div>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Yeni şifrenizi tekrar girin"
                      className="w-full rounded-2xl border border-white/30 bg-white/15 py-3 pl-11 pr-12 text-white placeholder-blue-50/70 focus:border-white focus:bg-white/25 focus:outline-none focus:ring-2 focus:ring-white/60 transition"
                      disabled={isSubmitDisabled}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-blue-50/80 hover:text-white transition"
                    >
                      {showConfirmPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {formError && (
                <div className="bg-red-500/25 border border-red-200/50 rounded-2xl p-4 backdrop-blur-sm text-sm">
                  <div className="flex items-start gap-3">
                    <FiInfo className="h-5 w-5 text-red-50 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-red-50">Hata</p>
                      <p className="text-red-50/90 mt-1 leading-relaxed">{formError}</p>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitDisabled}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-white/25 px-6 py-3 text-lg font-semibold text-white shadow-lg shadow-blue-900/20 transition hover:bg-white/35 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-600 focus:ring-white/70 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {resetPasswordMutation.isLoading ? (
                  <>
                    <ButtonSpinner />
                    Şifre güncelleniyor...
                  </>
                ) : (
                  'Yeni Şifreyi Kaydet'
                )}
              </button>
            </form>
          </div>

          <div className="rounded-3xl border border-blue-100 bg-blue-50 p-8 md:p-10 shadow-inner space-y-8 text-blue-800">
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-blue-900">İpucu</h2>
              <p className="text-sm leading-relaxed text-blue-700">
                Şifrenizde tahmin edilmesi zor, benzersiz bir kombinasyon kullanın. Aynı şifreyi farklı platformlarda kullanmamaya özen gösterin.
              </p>
            </div>

            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <span className="mt-2 h-2.5 w-2.5 rounded-full bg-blue-500" />
                <div>
                  <p className="font-medium text-blue-800">Güçlü şifre oluşturun</p>
                  <p className="text-blue-700">Büyük/küçük harf, rakam ve özel karakter kombinasyonu kullanın.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 h-2.5 w-2.5 rounded-full bg-blue-500" />
                <div>
                  <p className="font-medium text-blue-800">Şifrelerinizi gizli tutun</p>
                  <p className="text-blue-700">Şifrenizi kimseyle paylaşmayın ve tarayıcıya kaydetmeyin.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-2 h-2.5 w-2.5 rounded-full bg-blue-500" />
                <div>
                  <p className="font-medium text-blue-800">Bağlantıyı güvenli kullanın</p>
                  <p className="text-blue-700">Bu bağlantı tek kullanımlıktır ve kısa süre sonra geçerliliğini yitirir.</p>
                </div>
              </li>
            </ul>

            <div className="flex flex-col gap-4 text-sm">
              <Link
                to={ROUTE_CONFIG.PUBLIC.FORGOT_PASSWORD}
                className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 font-semibold transition-colors"
              >
                <FiArrowLeft className="h-4 w-4" />
                Şifre sıfırlama talebi gönder
              </Link>
              <p className="text-xs text-blue-700 leading-relaxed">
                Şifre sıfırlama bağlantısı çalışmıyorsa yeni bir talep oluşturun veya{' '}
                <Link
                  to={ROUTE_CONFIG.PUBLIC.CONTACT}
                  className="font-semibold text-blue-800 underline-offset-4 hover:underline"
                >
                  iletişim formu
                </Link>
                nu doldurarak destek ekiplerimizle iletişime geçin.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

