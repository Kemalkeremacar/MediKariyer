import React, { useState } from 'react';
import { Lock, ShieldOff, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { useChangePassword } from '@/features/auth/api/useAuth';
import { useDeactivateDoctorAccount } from '../api/useDoctor';
import { showToast } from '@/utils/toastUtils';
import { toastMessages } from '@/config/toast';
import useAuthStore from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { ROUTE_CONFIG } from '@config/routes.js';
import { ModalContainer } from '@/components/ui/ModalContainer';

const SettingsPage = () => {
  const changePasswordMutation = useChangePassword();
  const deactivateAccountMutation = useDeactivateDoctorAccount();
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [visibleFields, setVisibleFields] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (formError) setFormError('');
    if (successMessage) setSuccessMessage('');
  };

  const toggleVisibility = (field) => {
    setVisibleFields((prev) => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleChangePassword = (event) => {
    event.preventDefault();
    setFormError('');
    setSuccessMessage('');

    changePasswordMutation.mutate(formData, {
      onSuccess: (res) => {
        const message = res?.message || 'Şifreniz başarıyla güncellendi.';
        setSuccessMessage(message);
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      },
      onError: (error) => {
        const message = error?.response?.data?.message || error.message || 'Şifre değiştirilemedi.';
        setFormError(message);
      }
    });
  };

  const handleDeactivateAccount = () => {
    if (deactivateAccountMutation.isLoading) return;
    setConfirmModalOpen(true);
  };

  const confirmDeactivateAccount = () => {
    setConfirmModalOpen(false);
    deactivateAccountMutation.mutate(undefined, {
      onSuccess: (res) => {
        const message = res?.message || toastMessages.account.deactivateSuccess;
        showToast.success(message);
        logout();
        navigate(ROUTE_CONFIG.PUBLIC.LOGIN, {
          replace: true,
          state: {
            message: 'Hesabınız silindi. Yeniden açmak için destek ekibimizle iletişime geçebilirsiniz.'
          }
        });
      },
      onError: (error) => {
        showToast.error(error, { defaultMessage: toastMessages.account.deactivateError });
      }
    });
  };

  const renderPasswordInput = (name, label, placeholder) => {
    const isVisible = visibleFields[name];
    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700" htmlFor={name}>
          {label}
        </label>
        <div className="relative">
          <input
            id={name}
            name={name}
            type={isVisible ? 'text' : 'password'}
            value={formData[name]}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="w-full rounded-2xl border border-slate-200 bg-white/70 py-3 pl-4 pr-12 text-slate-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40"
            disabled={changePasswordMutation.isLoading}
            required
          />
          <button
            type="button"
            onClick={() => toggleVisibility(name)}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500 hover:text-blue-600"
            tabIndex={-1}
          >
            {isVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="relative mb-8 overflow-hidden rounded-3xl border border-cyan-200/30 bg-gradient-to-br from-cyan-100 via-blue-50 to-sky-100 p-8 shadow-[0_20px_60px_-30px_rgba(14,165,233,0.35)]">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-200/30 to-blue-200/30" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                <Lock className="w-8 h-8 text-cyan-600" />
              </div>
              <div>
                <p className="text-cyan-700/80 text-sm font-semibold tracking-wider uppercase">Doktor Ayarları</p>
                <h1 className="text-3xl font-bold text-gray-900">Hesap ve Güvenlik</h1>
              </div>
            </div>
            <p className="text-gray-700/80 text-base">
              Şifrenizi güncelleyin, güvenlik tercihlerinizi yönetin ve hesabınızı kontrol altında tutun.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 p-8 space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-blue-100 text-blue-700">
                <Lock className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-slate-900">Şifremi Değiştir</h2>
                <p className="text-sm text-slate-600">
                  Güncel şifrenizi girerek hesabınızı yeni ve güçlü bir şifreyle koruyun.
                </p>
              </div>
            </div>

            <form className="space-y-6" onSubmit={handleChangePassword}>
              {renderPasswordInput('currentPassword', 'Mevcut Şifre', 'Mevcut şifrenizi girin')}
              {renderPasswordInput('newPassword', 'Yeni Şifre', 'Yeni şifrenizi belirleyin')}
              {renderPasswordInput('confirmPassword', 'Yeni Şifre (Tekrar)', 'Yeni şifrenizi tekrar girin')}

              {formError && (
                <div className="rounded-2xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-700">
                  {formError}
                </div>
              )}

              {successMessage && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-700">
                  {successMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={changePasswordMutation.isLoading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-white font-semibold shadow-lg shadow-blue-600/30 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {changePasswordMutation.isLoading ? 'Şifre güncelleniyor...' : 'Şifreyi Güncelle'}
              </button>
            </form>
          </section>

          <section className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-red-200/60 p-8 space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-red-100 text-red-600">
                <ShieldOff className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-slate-900">Hesabımı Sil</h2>
                <p className="text-sm text-slate-600">
                  Hesabınızı sildiğinizde giriş yapamazsınız. Tekrar açmak için destek ekibimizle iletişime geçmeniz gerekir.
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-red-200 bg-red-50/80 px-4 py-3 flex items-start gap-3 text-sm text-red-700">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>
                Bu işlem geri alınamaz. Hesabınızı yeniden açmak için destek ekibinin müdahalesi gerekir.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDeactivateAccount}
              disabled={deactivateAccountMutation.isLoading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-6 py-3 text-white font-semibold shadow-lg shadow-red-600/30 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {deactivateAccountMutation.isLoading ? 'İşlem yapılıyor...' : 'Hesabımı Sil'}
            </button>
          </section>
        </div>
      </div>

      {confirmModalOpen && (
        <ModalContainer
          isOpen={confirmModalOpen}
          onClose={() => setConfirmModalOpen(false)}
          title="Hesabı Sil"
          align="center"
          size="small"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Hesabınızı silmek üzeresiniz. Bu işlemden sonra giriş yapamazsınız. Devam etmek istiyor musunuz?
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmModalOpen(false)}
                className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={confirmDeactivateAccount}
                className="rounded-xl px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition"
              >
                Evet, eminim
              </button>
            </div>
          </div>
        </ModalContainer>
      )}
    </div>
  );
};

export default SettingsPage;
