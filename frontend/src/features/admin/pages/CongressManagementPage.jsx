/**
 * Admin Kongre Yönetimi Sayfası
 * Admin'in kongreleri yönetebileceği sayfa
 */

import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit, Trash2, Search, X, MapPin, Globe, Link2, Users, Tag, CalendarDays, FileText, ToggleLeft, AlertTriangle, ImagePlus } from 'lucide-react';
import { useAdminCongresses, useCreateCongress, useUpdateCongress, useDeleteCongress } from '../../congress/api/useCongress';
import { apiRequest } from '@/services/http/client';
import { ENDPOINTS, buildEndpoint } from '@config/api.js';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';
import { useSpecialties, useSubspecialties } from '@/hooks/useLookup';

const inputBase = 'w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm text-gray-900 placeholder-gray-400 bg-white transition-all focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 outline-none';

const SectionLabel = ({ icon: Icon, children }) => (
  <div className="flex items-center gap-2 pb-2 mb-4 border-b border-gray-100">
    {Icon && <Icon className="w-4 h-4 text-blue-500" />}
    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">{children}</span>
  </div>
);

const FieldLabel = ({ children, required }) => (
  <label className="block text-sm font-medium text-gray-700 mb-1.5">
    {children}
    {required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

function ConfirmDeleteModal({ congress, onClose, onConfirm, isPending }) {
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  if (!congress) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-16 lg:pt-24 lg:pl-64">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 flex flex-col max-h-[calc(100vh-5rem)] lg:max-h-[calc(100vh-6rem)]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-50">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Kongreyi Sil</h2>
              <p className="text-xs text-gray-500">Bu işlem kongreyi pasif yapar (soft delete).</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5">
          <div className="rounded-xl border border-red-100 bg-red-50/40 p-4">
            <div className="text-sm font-semibold text-gray-900 line-clamp-2">{congress.title}</div>
            <div className="mt-1 text-xs text-gray-600">
              {congress.city ? `${congress.city}, ` : ''}{congress.country}
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-700">
            Emin misiniz? Silinen kongreler doktor takviminde görünmez.
          </p>
        </div>

        <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/80 rounded-b-2xl flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={() => onConfirm(congress.id)}
            disabled={isPending}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isPending && (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            Sil
          </button>
        </div>
      </div>
    </div>
  );
}

function CongressFormModal({ editingCongress, formData, setFormData, onSubmit, onClose, isPending }) {
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const set = (field) => (e) => setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  const { rawData: specialtiesRaw = [], isLoading: specialtiesLoading } = useSpecialties();
  const selectedSpecialtyId = formData.specialty_id ? Number(formData.specialty_id) : null;
  const { rawData: subspecialtiesRaw = [], isLoading: subspecialtiesLoading } = useSubspecialties(selectedSpecialtyId);
  const [imageError, setImageError] = React.useState('');

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError('');

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setImageError('Sadece JPEG, PNG veya WebP formatları desteklenir.');
      e.target.value = '';
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setImageError('Dosya boyutu en fazla 2 MB olabilir.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setFormData((prev) => ({ ...prev, image_url: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image_url: '' }));
    setImageError('');
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-16 lg:pt-24 lg:pl-64">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 flex flex-col max-h-[calc(100vh-5rem)] lg:max-h-[calc(100vh-6rem)]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {editingCongress ? 'Kongre Düzenle' : 'Yeni Kongre Ekle'}
              </h2>
              <p className="text-xs text-gray-500">
                {editingCongress ? 'Kongre bilgilerini güncelleyin' : 'Yeni bir kongre/etkinlik oluşturun'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={onSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {/* Temel Bilgiler */}
            <div>
              <SectionLabel icon={FileText}>Temel Bilgiler</SectionLabel>
              <div className="space-y-4">
                <div>
                  <FieldLabel required>Kongre Başlığı</FieldLabel>
                  <input
                    type="text"
                    required
                    maxLength={200}
                    placeholder="Ör: Türk Kardiyoloji Derneği 39. Ulusal Kongresi"
                    value={formData.title}
                    onChange={set('title')}
                    className={inputBase}
                  />
                </div>
                <div>
                  <FieldLabel>Açıklama</FieldLabel>
                  <textarea
                    rows={3}
                    maxLength={2000}
                    placeholder="Kongre hakkında kısa bir açıklama yazın..."
                    value={formData.description}
                    onChange={set('description')}
                    className={`${inputBase} resize-none`}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel>Organizatör</FieldLabel>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        maxLength={200}
                        placeholder="Düzenleyen kurum"
                        value={formData.organizer}
                        onChange={set('organizer')}
                        className={`${inputBase} pl-9`}
                      />
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Uzmanlık Alanı</FieldLabel>
                    <div className="relative">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <select
                        value={formData.specialty_id ?? ''}
                        onChange={(e) => {
                          const value = e.target.value ? Number(e.target.value) : '';
                          setFormData((prev) => ({ ...prev, specialty_id: value, subspecialty_id: '' }));
                        }}
                        className={`${inputBase} pl-9`}
                        disabled={specialtiesLoading}
                      >
                        <option value="">{specialtiesLoading ? 'Uzmanlık yükleniyor…' : 'Uzmanlık seçin'}</option>
                        {specialtiesRaw.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel>Yan Dal</FieldLabel>
                    <select
                      value={formData.subspecialty_id ?? ''}
                      onChange={(e) => setFormData((prev) => ({ ...prev, subspecialty_id: e.target.value ? Number(e.target.value) : '' }))}
                      className={inputBase}
                      disabled={!selectedSpecialtyId || subspecialtiesLoading}
                    >
                      <option value="">
                        {!selectedSpecialtyId ? 'Önce uzmanlık seçin' : subspecialtiesLoading ? 'Yan dal yükleniyor…' : 'Yan dal seçin'}
                      </option>
                      {subspecialtiesRaw.map((ss) => (
                        <option key={ss.id} value={ss.id}>{ss.name}</option>
                      ))}
                    </select>
                  </div>
                  <div />
                </div>
              </div>
            </div>

            {/* Tarih */}
            <div>
              <SectionLabel icon={CalendarDays}>Tarih Bilgileri</SectionLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel required>Başlangıç Tarihi</FieldLabel>
                  <input
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={set('start_date')}
                    className={inputBase}
                  />
                </div>
                <div>
                  <FieldLabel required>Bitiş Tarihi</FieldLabel>
                  <input
                    type="date"
                    required
                    value={formData.end_date}
                    onChange={set('end_date')}
                    min={formData.start_date || undefined}
                    className={inputBase}
                  />
                </div>
              </div>
            </div>

            {/* Konum */}
            <div>
              <SectionLabel icon={MapPin}>Konum Bilgileri</SectionLabel>
              <div className="space-y-4">
                <div>
                  <FieldLabel required>Konum / Mekan</FieldLabel>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      maxLength={200}
                      placeholder="Ör: Hilton İstanbul Bomonti"
                      value={formData.location}
                      onChange={set('location')}
                      className={`${inputBase} pl-9`}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel>Şehir</FieldLabel>
                    <input
                      type="text"
                      maxLength={100}
                      placeholder="Ör: İstanbul"
                      value={formData.city}
                      onChange={set('city')}
                      className={inputBase}
                    />
                  </div>
                  <div>
                    <FieldLabel required>Ülke</FieldLabel>
                    <input
                      type="text"
                      required
                      maxLength={100}
                      placeholder="Ör: Türkiye"
                      value={formData.country}
                      onChange={set('country')}
                      className={inputBase}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Bağlantılar */}
            <div>
              <SectionLabel icon={Globe}>Bağlantılar</SectionLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel>Web Sitesi</FieldLabel>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="url"
                      maxLength={500}
                      placeholder="https://..."
                      value={formData.website_url}
                      onChange={set('website_url')}
                      className={`${inputBase} pl-9`}
                    />
                  </div>
                </div>
                <div>
                  <FieldLabel>Kayıt Linki</FieldLabel>
                  <div className="relative">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="url"
                      maxLength={500}
                      placeholder="https://..."
                      value={formData.registration_url}
                      onChange={set('registration_url')}
                      className={`${inputBase} pl-9`}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Kongre Görseli */}
            <div>
              <SectionLabel icon={ImagePlus}>Kongre Görseli</SectionLabel>
              <div className="space-y-3">
                {formData.image_url ? (
                  <div className="relative">
                    <img
                      src={formData.image_url}
                      alt="Kongre görseli önizleme"
                      className="w-full max-h-48 object-cover rounded-xl border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1.5 bg-red-500/90 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-blue-400 transition-all">
                    <ImagePlus className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500 font-medium">Görsel yüklemek için tıklayın</span>
                    <span className="text-xs text-gray-400 mt-1">JPEG, PNG veya WebP · Maks. 2 MB</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
                {imageError && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {imageError}
                  </p>
                )}
                {formData.image_url && (
                  <label className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 cursor-pointer font-medium transition-colors">
                    <ImagePlus className="w-4 h-4" />
                    Görseli değiştir
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Durum */}
            <div>
              <SectionLabel icon={ToggleLeft}>Durum</SectionLabel>
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData((prev) => ({ ...prev, is_active: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-blue-500/40 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
                <span className="ml-3 text-sm font-medium text-gray-700">
                  {formData.is_active ? 'Aktif' : 'Pasif'}
                </span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/80 rounded-b-2xl flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isPending && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {editingCongress ? 'Güncelle' : 'Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const CongressManagementPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingCongress, setEditingCongress] = useState(null);
  const [congressToDelete, setCongressToDelete] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    specialty_id: '',
    subspecialty_id: '',
    country: '',
    city: '',
    page: 1,
    limit: 10,
    is_active: true
  });
  const [searchInput, setSearchInput] = useState('');
  const [countryInput, setCountryInput] = useState('');
  const [cityInput, setCityInput] = useState('');
  const { rawData: specialtiesRaw = [], isLoading: specialtiesLoading } = useSpecialties();
  const selectedSpecialtyId = filters.specialty_id ? Number(filters.specialty_id) : null;
  const { rawData: subspecialtiesRaw = [], isLoading: subspecialtiesLoading } = useSubspecialties(selectedSpecialtyId);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    city: '',
    country: '',
    start_date: '',
    end_date: '',
    website_url: '',
    registration_url: '',
    organizer: '',
    specialty_id: '',
    subspecialty_id: '',
    image_url: '',
    is_active: true
  });

  const { data: congressData, isLoading } = useAdminCongresses(filters);
  const createMutation = useCreateCongress();
  const updateMutation = useUpdateCongress();
  const deleteMutation = useDeleteCongress();

  const payload = congressData?.data?.data;
  const congresses = payload?.data || [];
  const rawPag = payload?.pagination || {};
  const pagination = {
    current_page: Number(rawPag.page || rawPag.current_page || filters.page || 1),
    per_page: Number(rawPag.limit || rawPag.per_page || filters.limit || 10),
    total: Number(rawPag.total ?? 0),
    total_pages: Number(rawPag.totalPages || rawPag.total_pages || 1),
  };

  const handlePageChange = (page) => {
    const next = Math.max(1, Math.min(pagination.total_pages || 1, Number(page) || 1));
    setFilters((prev) => ({ ...prev, page: next }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      city: '',
      country: '',
      start_date: '',
      end_date: '',
      website_url: '',
      registration_url: '',
      organizer: '',
      specialty_id: '',
      subspecialty_id: '',
      image_url: '',
      is_active: true
    });
    setEditingCongress(null);
  };

  // Search: debounce + trim
  useEffect(() => {
    const handle = setTimeout(() => {
      const trimmed = (searchInput || '').trim();
      setFilters((prev) => ({ ...prev, search: trimmed, page: 1 }));
    }, 350);
    return () => clearTimeout(handle);
  }, [searchInput]);

  // Country: debounce + trim
  useEffect(() => {
    const handle = setTimeout(() => {
      const trimmed = (countryInput || '').trim();
      setFilters((prev) => ({ ...prev, country: trimmed, page: 1 }));
    }, 400);
    return () => clearTimeout(handle);
  }, [countryInput]);

  // City: debounce + trim
  useEffect(() => {
    const handle = setTimeout(() => {
      const trimmed = (cityInput || '').trim();
      setFilters((prev) => ({ ...prev, city: trimmed, page: 1 }));
    }, 400);
    return () => clearTimeout(handle);
  }, [cityInput]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters((prev) => ({
      ...prev,
      search: '',
      specialty_id: '',
      subspecialty_id: '',
      country: '',
      city: '',
      page: 1,
    }));
    setSearchInput('');
    setCountryInput('');
    setCityInput('');
  };

  const handleEdit = async (congress) => {
    setEditingCongress(congress);
    setShowModal(true);

    let fullData = congress;
    try {
      const res = await apiRequest.get(buildEndpoint(ENDPOINTS.CONGRESS.DETAIL, { id: congress.id }));
      fullData = res?.data?.data || res?.data || congress;
    } catch {
      // Fall back to list data if detail fetch fails
    }

    setFormData({
      title: fullData.title,
      description: fullData.description || '',
      location: fullData.location,
      city: fullData.city || '',
      country: fullData.country,
      start_date: fullData.start_date?.split('T')[0] || '',
      end_date: fullData.end_date?.split('T')[0] || '',
      website_url: fullData.website_url || '',
      registration_url: fullData.registration_url || '',
      organizer: fullData.organizer || '',
      specialty_id: fullData.specialty_id || '',
      subspecialty_id: fullData.subspecialty_id || '',
      image_url: fullData.image_url || '',
      is_active: fullData.is_active
    });
  };

  const handleDelete = (congress) => {
    setCongressToDelete(congress);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const cleaned = { ...formData };
    cleaned.specialty_id = cleaned.specialty_id ? Number(cleaned.specialty_id) : null;
    cleaned.subspecialty_id = cleaned.subspecialty_id ? Number(cleaned.subspecialty_id) : null;
    cleaned.website_url = cleaned.website_url || null;
    cleaned.registration_url = cleaned.registration_url || null;
    cleaned.description = cleaned.description || null;
    cleaned.organizer = cleaned.organizer || null;
    cleaned.city = cleaned.city || null;
    cleaned.image_url = cleaned.image_url || null;

    if (editingCongress) {
      updateMutation.mutate({ id: editingCongress.id, data: cleaned }, {
        onSuccess: () => {
          setShowModal(false);
          resetForm();
        }
      });
    } else {
      createMutation.mutate(cleaned, {
        onSuccess: () => {
          setShowModal(false);
          resetForm();
        }
      });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const isFirstLoad = isLoading && congresses.length === 0;

  return (
    <div className="min-h-screen p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
              <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
              Kongre Yönetimi
            </h1>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">Kongre ve etkinlikleri yönetin</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
          >
            <Plus className="w-5 h-5" />
            Yeni Kongre
          </button>
        </div>

        {/* Filters + Search */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold text-gray-800">Filtreler</div>
            {(filters.search || filters.specialty_id || filters.subspecialty_id || filters.country || filters.city) && (
              <button onClick={clearFilters} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Temizle
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Kongre ara..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={filters.specialty_id ?? ''}
              onChange={(e) => {
                const value = e.target.value ? Number(e.target.value) : '';
                setFilters((prev) => ({ ...prev, specialty_id: value, subspecialty_id: '', page: 1 }));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={specialtiesLoading}
              title={specialtiesLoading ? 'Uzmanlıklar yükleniyor…' : undefined}
            >
              <option value="">{specialtiesLoading ? 'Uzmanlık yükleniyor…' : 'Uzmanlık (tümü)'}</option>
              {specialtiesRaw.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            <select
              value={filters.subspecialty_id ?? ''}
              onChange={(e) => handleFilterChange('subspecialty_id', e.target.value ? Number(e.target.value) : '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!selectedSpecialtyId || subspecialtiesLoading}
              title={!selectedSpecialtyId ? 'Önce uzmanlık seçin' : undefined}
            >
              <option value="">
                {!selectedSpecialtyId ? 'Yan dal (önce uzmanlık)' : subspecialtiesLoading ? 'Yan dal yükleniyor…' : 'Yan dal (tümü)'}
              </option>
              {subspecialtiesRaw.map((ss) => (
                <option key={ss.id} value={ss.id}>{ss.name}</option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Ülke"
              value={countryInput}
              onChange={(e) => setCountryInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <input
              type="text"
              placeholder="Şehir"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Congress List */}
        {isFirstLoad ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <SkeletonLoader key={i} className="h-20 bg-gray-200 rounded-xl" />
            ))}
          </div>
        ) : congresses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-700 text-lg font-semibold">Sonuç bulunamadı</p>
            <p className="text-gray-500 mt-2">Filtreleri değiştirerek tekrar deneyin.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kongre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tarih
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Konum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Uzmanlık
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {congresses.map((congress) => (
                  <tr key={congress.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{congress.title}</div>
                      <div className="text-sm text-gray-500">{congress.organizer}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(congress.start_date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {[congress.city, congress.country].filter(Boolean).join(', ') || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {congress.specialty_name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(congress)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(congress)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination (diğer admin sayfaları gibi) */}
        {/* Mobile Pagination */}
        <div className="lg:hidden mt-4">
          {pagination.total_pages > 1 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={pagination.current_page <= 1}
                  className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Önceki
                </button>
                <span className="text-sm text-gray-700">
                  Sayfa {pagination.current_page} / {pagination.total_pages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={pagination.current_page >= pagination.total_pages}
                  className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sonraki
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Desktop Pagination */}
        <div className="hidden lg:block mt-6">
          {pagination.total_pages > 1 && (
            <div className="bg-slate-800/90 px-4 py-3 flex items-center justify-between border border-slate-600/30 rounded-lg">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={pagination.current_page <= 1}
                  className="relative inline-flex items-center px-4 py-2 border border-slate-500 text-sm font-medium rounded-md text-slate-200 bg-slate-700 hover:bg-slate-600 disabled:opacity-50"
                >
                  Önceki
                </button>
                <button
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={pagination.current_page >= pagination.total_pages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-500 text-sm font-medium rounded-md text-slate-200 bg-slate-700 hover:bg-slate-600 disabled:opacity-50"
                >
                  Sonraki
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-slate-200/90">
                    Toplam <span className="font-medium text-white">{pagination.total}</span> kongreden{' '}
                    <span className="font-medium text-white">{((pagination.current_page - 1) * pagination.per_page) + 1}</span> -{' '}
                    <span className="font-medium text-white">
                      {Math.min(pagination.current_page * pagination.per_page, pagination.total)}
                    </span>{' '}
                    arası gösteriliyor
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          page === pagination.current_page
                            ? 'z-10 bg-indigo-500 border-indigo-400 text-white'
                            : 'bg-slate-700 border-slate-500 text-slate-200 hover:bg-slate-600'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <CongressFormModal
            editingCongress={editingCongress}
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            onClose={() => { setShowModal(false); resetForm(); }}
            isPending={createMutation.isPending || updateMutation.isPending}
          />
        )}

        {/* Delete confirm modal */}
        {congressToDelete && (
          <ConfirmDeleteModal
            congress={congressToDelete}
            onClose={() => setCongressToDelete(null)}
            onConfirm={(id) => {
              deleteMutation.mutate(id, {
                onSuccess: () => setCongressToDelete(null),
                onError: () => setCongressToDelete(null),
              });
            }}
            isPending={deleteMutation.isPending}
          />
        )}
      </div>
    </div>
  );
};

export default CongressManagementPage;
