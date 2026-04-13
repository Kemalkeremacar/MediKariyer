/**
 * Admin Kongre Yönetimi Sayfası
 * Admin'in kongreleri yönetebileceği sayfa
 */

import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit, Search, X, MapPin, Globe, Users, Tag, CalendarDays, FileText, ToggleLeft, AlertTriangle, ImagePlus, Trash2 } from 'lucide-react';
import { useAdminCongresses, useCreateCongress, useDeleteCongress, useUpdateCongress } from '../../congress/api/useCongress';
import { apiRequest } from '@/services/http/client';
import { ENDPOINTS, buildEndpoint } from '@config/api.js';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';
import { useSpecialties, useSubspecialties } from '@/hooks/useLookup';
import useUiStore from '@/store/uiStore';
import ImageCropModal from '@/components/ui/ImageCropModal';
import { normalizePagination } from '@/utils/paginationUtils';

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

function SpecialtyMultiSelectDropdown({
  options,
  selectedIds,
  onChangeSelectedIds,
  disabled,
  placeholder = 'Ek uzmanlık seçin',
}) {
  const [open, setOpen] = React.useState(false);
  const [q, setQ] = React.useState('');
  const rootRef = React.useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDocMouseDown = (e) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const selected = Array.isArray(selectedIds) ? selectedIds : [];
  const selectedSet = React.useMemo(() => new Set(selected), [selected]);
  const selectedById = React.useMemo(() => {
    const map = new Map();
    (options || []).forEach((o) => map.set(Number(o.id), o));
    return map;
  }, [options]);

  const filtered = React.useMemo(() => {
    const query = (q || '').trim().toLowerCase();
    const list = Array.isArray(options) ? options : [];
    if (!query) return list;
    return list.filter((o) => String(o?.name || '').toLowerCase().includes(query));
  }, [options, q]);

  const toggle = (id) => {
    const n = Number(id);
    if (!Number.isFinite(n) || n <= 0) return;
    const next = selectedSet.has(n)
      ? selected.filter((x) => Number(x) !== n)
      : [...selected, n];
    onChangeSelectedIds(next);
  };

  const clear = () => onChangeSelectedIds([]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={`${inputBase} flex items-center justify-between gap-2 ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {selected.length === 0 ? (
            <span className="text-gray-400 text-sm truncate">{placeholder}</span>
          ) : (
            <div className="flex flex-wrap gap-1.5 min-w-0">
              {selected.slice(0, 2).map((id) => {
                const o = selectedById.get(Number(id));
                const name = o?.name || String(id);
                return (
                  <span
                    key={id}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100 max-w-[180px]"
                    title={name}
                  >
                    <span className="truncate">{name}</span>
                  </span>
                );
              })}
              {selected.length > 2 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-50 text-gray-600 border border-gray-200">
                  +{selected.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {selected.length > 0 && !disabled && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); clear(); }}
              className="text-xs font-semibold text-gray-500 hover:text-gray-700"
              title="Temizle"
            >
              Temizle
            </button>
          )}
          <span className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}>▾</span>
        </div>
      </button>

      {open && !disabled && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ara…"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
          </div>

          <div className="max-h-64 overflow-auto p-2">
            {filtered.length === 0 ? (
              <div className="px-3 py-6 text-sm text-gray-500 text-center">Sonuç yok</div>
            ) : (
              filtered.map((o) => {
                const id = Number(o.id);
                const checked = selectedSet.has(id);
                return (
                  <label
                    key={id}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(id)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-800">{o.name}</span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
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
  const [posterError, setPosterError] = React.useState('');
  const [cropState, setCropState] = React.useState({
    open: false,
    imageSrc: '',
    target: null, // 'banner' | 'poster'
    aspect: 16 / 9,
    originalFileInput: null,
  });

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError('');

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setImageError('Sadece JPEG, PNG veya WebP formatları desteklenir.');
      e.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError('Dosya boyutu en fazla 5 MB olabilir.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setCropState({
        open: true,
        imageSrc: ev.target.result,
        target: 'banner',
        aspect: 16 / 9,
        originalFileInput: e.target,
      });
    };
    reader.readAsDataURL(file);
  };

  const handlePosterChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPosterError('');

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setPosterError('Sadece JPEG, PNG veya WebP formatları desteklenir.');
      e.target.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPosterError('Dosya boyutu en fazla 5 MB olabilir.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setCropState({
        open: true,
        imageSrc: ev.target.result,
        target: 'poster',
        aspect: 2 / 3,
        originalFileInput: e.target,
      });
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image_url: '' }));
    setImageError('');
  };

  const removePoster = () => {
    setFormData((prev) => ({ ...prev, poster_image_url: '' }));
    setPosterError('');
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
                          setFormData((prev) => ({
                            ...prev,
                            specialty_id: value,
                            subspecialty_id: '',
                            specialty_ids: Array.isArray(prev.specialty_ids)
                              ? prev.specialty_ids.filter((id) => Number(id) !== Number(value))
                              : [],
                          }));
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
                  <div>
                    <FieldLabel>Ek Uzmanlıklar</FieldLabel>
                    <SpecialtyMultiSelectDropdown
                      options={specialtiesRaw.filter((s) => Number(s.id) !== (selectedSpecialtyId ?? -1))}
                      selectedIds={Array.isArray(formData.specialty_ids) ? formData.specialty_ids : []}
                      onChangeSelectedIds={(ids) => setFormData((prev) => ({ ...prev, specialty_ids: ids }))}
                      disabled={specialtiesLoading}
                      placeholder="Ek uzmanlık seçin"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Birden fazla uzmanlık alanını etkileyen kongreler için ek seçim yapabilirsiniz.
                    </p>
                  </div>
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
            </div>

            {/* Kongre Görselleri */}
            <div>
              <SectionLabel icon={ImagePlus}>Kongre Görselleri</SectionLabel>
              
              {/* Banner Görseli (Yatay) */}
              <div className="space-y-3 mb-5">
                <div className="text-xs font-medium text-gray-600 mb-2">Banner Görseli (Yatay)</div>
                {formData.image_url ? (
                  <div className="relative">
                    <div className="w-full rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm ring-1 ring-black/5">
                      <div className="relative w-full aspect-[16/9] bg-gradient-to-br from-gray-50 to-white">
                        <img
                          src={formData.image_url}
                          alt="Banner görseli önizleme"
                          className="absolute inset-0 w-full h-full object-contain"
                        />
                      </div>
                    </div>
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
                    <span className="text-sm text-gray-500 font-medium">Banner yüklemek için tıklayın</span>
                    <span className="text-xs text-gray-400 mt-1">JPEG, PNG veya WebP · Maks. 5 MB</span>
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
                    Banner'ı değiştir
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Poster Görseli (Dikey) */}
              <div className="space-y-3">
                <div className="text-xs font-medium text-gray-600 mb-2">Poster Görseli (Dikey - Opsiyonel)</div>
                {formData.poster_image_url ? (
                  <div className="relative">
                    <div className="w-full rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-md ring-1 ring-black/5">
                      <div className="relative w-full aspect-[2/3] bg-gradient-to-br from-gray-50 to-white">
                        <img
                          src={formData.poster_image_url}
                          alt="Poster görseli önizleme"
                          className="absolute inset-0 w-full h-full object-contain"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removePoster}
                      className="absolute top-2 right-2 p-1.5 bg-red-500/90 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-blue-400 transition-all">
                    <ImagePlus className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500 font-medium">Poster yüklemek için tıklayın</span>
                    <span className="text-xs text-gray-400 mt-1">JPEG, PNG veya WebP · Maks. 5 MB</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePosterChange}
                      className="hidden"
                    />
                  </label>
                )}
                {posterError && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    {posterError}
                  </p>
                )}
                {formData.poster_image_url && (
                  <label className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 cursor-pointer font-medium transition-colors">
                    <ImagePlus className="w-4 h-4" />
                    Poster'ı değiştir
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handlePosterChange}
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
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-[var(--primary-color)]/40 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--primary-color)]" />
                <span className="ml-3 text-sm font-medium text-gray-700">
                  {formData.is_active ? 'Aktif' : 'Pasif'}
                </span>
              </label>
              <p className="text-xs text-gray-500 mt-2">
                Pasif kongreler doktor takviminde görünmez.
              </p>
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
              className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-[var(--primary-color)] rounded-xl hover:bg-[var(--primary-dark)] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
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

      <ImageCropModal
        isOpen={cropState.open}
        title={cropState.target === 'poster' ? 'Poster Görselini Kırp' : 'Banner Görselini Kırp'}
        imageSrc={cropState.imageSrc}
        aspect={cropState.aspect}
        objectFit="contain"
        output={cropState.target === 'poster'
          ? { targetWidth: 800, targetHeight: 1200, maxHeight: 1200, quality: 0.82, background: '#ffffff' }
          : { targetWidth: 1600, targetHeight: 900, maxWidth: 1600, quality: 0.82, background: '#ffffff' }
        }
        onCancel={() => {
          if (cropState.originalFileInput) cropState.originalFileInput.value = '';
          setCropState((prev) => ({ ...prev, open: false, imageSrc: '', target: null, originalFileInput: null }));
        }}
        onConfirm={(dataUrl) => {
          if (cropState.target === 'poster') {
            setFormData((prev) => ({ ...prev, poster_image_url: dataUrl }));
          } else {
            setFormData((prev) => ({ ...prev, image_url: dataUrl }));
          }
          if (cropState.originalFileInput) cropState.originalFileInput.value = '';
          setCropState((prev) => ({ ...prev, open: false, imageSrc: '', target: null, originalFileInput: null }));
        }}
      />
    </div>
  );
}

const CongressManagementPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingCongress, setEditingCongress] = useState(null);
  const [editingCongressOriginal, setEditingCongressOriginal] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    specialty_id: '',
    subspecialty_id: '',
    country: '',
    city: '',
    page: 1,
    limit: 10,
    is_active: null, // null = tümünü göster
    sort_by: 'start_date',
    sort_order: 'asc',
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
    organizer: '',
    specialty_id: '',
    specialty_ids: [],
    subspecialty_id: '',
    image_url: '',
    poster_image_url: '',
    is_active: true
  });

  const { data: congressData, isLoading } = useAdminCongresses(filters);
  const createMutation = useCreateCongress();
  const updateMutation = useUpdateCongress();
  const deleteMutation = useDeleteCongress();
  const openModal = useUiStore((s) => s.openModal);

  const payload = congressData?.data?.data;
  const congresses = payload?.data || [];
  const rawPag = payload?.pagination || {};
  
  // Use normalizePagination utility instead of manual normalization
  const pagination = normalizePagination(rawPag);

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
      organizer: '',
      specialty_id: '',
      specialty_ids: [],
      subspecialty_id: '',
      image_url: '',
      poster_image_url: '',
      is_active: true
    });
    setEditingCongress(null);
    setEditingCongressOriginal(null);
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

  const toggleDateSort = () => {
    setFilters((prev) => {
      const isDate = (prev.sort_by || 'start_date') === 'start_date';
      if (!isDate) {
        return { ...prev, sort_by: 'start_date', sort_order: 'asc', page: 1 };
      }
      const nextOrder = prev.sort_order === 'asc' ? 'desc' : 'asc';
      return { ...prev, sort_order: nextOrder, page: 1 };
    });
  };

  const normalizeIsActive = (v) => v === true || v === 1 || v === '1';

  const handleDelete = (congress) => {
    if (!congress?.id) return;

    openModal('confirmation', {
      title: 'Kongre Silme Onayı',
      message: `"${congress.title}" kongresini silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`,
      type: 'danger',
      destructive: true,
      confirmText: 'Sil',
      cancelText: 'Vazgeç',
      onConfirm: () => deleteMutation.mutate(congress.id),
    });
  };

  const clearFilters = () => {
    setFilters((prev) => ({
      ...prev,
      search: '',
      specialty_id: '',
      subspecialty_id: '',
      country: '',
      city: '',
      is_active: null,
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

    const nextForm = {
      title: fullData.title,
      description: fullData.description || '',
      location: fullData.location,
      city: fullData.city || '',
      country: fullData.country,
      start_date: fullData.start_date?.split('T')[0] || '',
      end_date: fullData.end_date?.split('T')[0] || '',
      website_url: fullData.website_url || '',
      organizer: fullData.organizer || '',
      specialty_id: fullData.specialty_id || '',
      specialty_ids: Array.isArray(fullData.specialties)
        ? fullData.specialties
          .map((s) => Number(s?.id))
          .filter((id) => Number.isFinite(id) && id > 0 && id !== Number(fullData.specialty_id))
        : [],
      subspecialty_id: fullData.subspecialty_id || '',
      image_url: fullData.image_url || '',
      poster_image_url: fullData.poster_image_url || '',
      is_active: fullData.is_active
    };

    setFormData(nextForm);
    setEditingCongressOriginal(nextForm);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const cleaned = { ...formData };
    cleaned.specialty_id = cleaned.specialty_id ? Number(cleaned.specialty_id) : null;
    cleaned.specialty_ids = Array.isArray(cleaned.specialty_ids)
      ? cleaned.specialty_ids
        .map((v) => Number(v))
        .filter((n) => Number.isFinite(n) && n > 0 && n !== cleaned.specialty_id)
      : [];
    cleaned.subspecialty_id = cleaned.subspecialty_id ? Number(cleaned.subspecialty_id) : null;
    cleaned.website_url = cleaned.website_url || null;
    cleaned.description = cleaned.description || null;
    cleaned.organizer = cleaned.organizer || null;
    cleaned.city = cleaned.city || null;
    cleaned.image_url = cleaned.image_url || null;
    cleaned.poster_image_url = cleaned.poster_image_url || null;

    if (editingCongress) {
      // Performans: sadece değişen alanları gönder (özellikle base64 görseller)
      const original = editingCongressOriginal || {};
      const originalCleaned = {
        ...original,
        specialty_id: original.specialty_id ? Number(original.specialty_id) : null,
        specialty_ids: Array.isArray(original.specialty_ids)
          ? original.specialty_ids
            .map((v) => Number(v))
            .filter((n) => Number.isFinite(n) && n > 0 && n !== (original.specialty_id ? Number(original.specialty_id) : null))
          : [],
        subspecialty_id: original.subspecialty_id ? Number(original.subspecialty_id) : null,
        website_url: original.website_url || null,
        description: original.description || null,
        organizer: original.organizer || null,
        city: original.city || null,
        image_url: original.image_url || null,
        poster_image_url: original.poster_image_url || null,
      };

      const patch = {};
      Object.keys(cleaned).forEach((k) => {
        const a = cleaned[k];
        const b = originalCleaned[k];
        const isArrayCompare = Array.isArray(a) || Array.isArray(b);
        if (isArrayCompare) {
          if (JSON.stringify(a || []) !== JSON.stringify(b || [])) patch[k] = a || [];
          return;
        }
        if (a !== b) patch[k] = a;
      });

      if (Object.keys(patch).length === 0) {
        setShowModal(false);
        resetForm();
        return;
      }

      updateMutation.mutate({ id: editingCongress.id, data: patch }, {
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

  const getCongressStatus = (congress) => {
    const end = new Date(congress.end_date);
    const now = new Date();
    
    // Gün bazında karşılaştırma için saatleri sıfırla
    now.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    const daysToEnd = Math.round((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysToEnd < 0) {
      return { label: 'Bitmiş', className: 'bg-gray-50 border-gray-200 text-gray-600' };
    }
    return null; // Aktif kongreler için status gösterme
  };

  const isFirstLoad = isLoading && congresses.length === 0;

  const renderSpecialties = (congress) => {
    const items = Array.isArray(congress?.specialties) ? congress.specialties : [];
    const names = items.map((s) => s?.name).filter(Boolean);
    if (!names.length) return <span>-</span>;

    const shown = names.slice(0, 3);
    const remaining = names.length - shown.length;

    return (
      <div className="flex flex-wrap gap-1.5 justify-end lg:justify-start">
        {shown.map((name) => (
          <span
            key={name}
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100 max-w-[220px]"
            title={name}
          >
            <span className="truncate">{name}</span>
          </span>
        ))}
        {remaining > 0 && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-50 text-gray-600 border border-gray-200">
            +{remaining}
          </span>
        )}
      </div>
    );
  };

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
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:text-white transition-colors w-full sm:w-auto"
          >
            <Plus className="w-5 h-5" />
            Yeni Kongre
          </button>
        </div>

        {/* Filters + Search */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold text-gray-800">Filtreler</div>
            {(filters.search || filters.specialty_id || filters.subspecialty_id || filters.country || filters.city || filters.is_active !== null) && (
              <button onClick={clearFilters} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Temizle
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Kongre ara..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={filters.specialty_id ?? ''}
              onChange={(e) => {
                const value = e.target.value ? Number(e.target.value) : '';
                setFilters((prev) => ({ ...prev, specialty_id: value, subspecialty_id: '', page: 1 }));
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

            <select
              value={filters.is_active === null ? 'all' : (filters.is_active ? 'active' : 'passive')}
              onChange={(e) => {
                const v = e.target.value;
                handleFilterChange('is_active', v === 'all' ? null : v === 'active');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              title="Durum filtresi"
            >
              <option value="all">Durum (tümü)</option>
              <option value="active">Aktif</option>
              <option value="passive">Pasif</option>
            </select>

            <input
              type="text"
              placeholder="Ülke"
              value={countryInput}
              onChange={(e) => setCountryInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />

            <input
              type="text"
              placeholder="Şehir"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <>
          <div className="lg:hidden space-y-4">
            {congresses.map((congress) => (
              <div key={congress.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className={`flex-shrink-0 w-2 h-2 rounded-full ${normalizeIsActive(congress.is_active) ? 'bg-green-500' : 'bg-gray-400'}`}
                        title={normalizeIsActive(congress.is_active) ? 'Aktif' : 'Pasif'}
                      />
                      <h3 className="text-base font-semibold text-gray-900 line-clamp-2">{congress.title}</h3>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-1">{congress.organizer || '-'}</p>
                  </div>
                </div>

                <div className="mt-3 space-y-2 text-sm">
                  <div className="text-gray-700">
                    <span className="font-medium text-gray-900">Tarih:</span> {formatDate(congress.start_date)}
                  </div>
                  <div className="text-gray-700">
                    <span className="font-medium text-gray-900">Konum:</span> {[congress.city, congress.country].filter(Boolean).join(', ') || '-'}
                  </div>
                  <div className="text-gray-700">
                    <span className="font-medium text-gray-900">Uzmanlık:</span> {renderSpecialties(congress)}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(congress)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleDelete(congress)}
                    disabled={deleteMutation.isPending}
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden lg:block bg-white rounded-lg shadow-sm overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kongre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={toggleDateSort}
                      className="inline-flex items-center gap-1 text-left hover:text-gray-700"
                      title="Tarihe göre sırala"
                    >
                      Tarih
                      {(filters.sort_by || 'start_date') === 'start_date' && (
                        <span className="text-[10px] text-gray-400">
                          {filters.sort_order === 'asc' ? '▲' : '▼'}
                        </span>
                      )}
                    </button>
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
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${normalizeIsActive(congress.is_active) ? 'bg-green-500' : 'bg-gray-400'}`}
                          title={normalizeIsActive(congress.is_active) ? 'Aktif' : 'Pasif'}
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{congress.title}</div>
                          <div className="text-sm text-gray-500">{congress.organizer}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <span>{formatDate(congress.start_date)}</span>
                        {(() => {
                          const status = getCongressStatus(congress);
                          if (!status) return null;
                          return (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-medium ${status.className}`}>
                              {status.label}
                            </span>
                          );
                        })()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {[congress.city, congress.country].filter(Boolean).join(', ') || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {renderSpecialties(congress)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => handleEdit(congress)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Düzenle"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(congress)}
                          disabled={deleteMutation.isPending}
                          className="text-red-600 hover:text-red-900 disabled:opacity-60 disabled:cursor-not-allowed"
                          title="Sil"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
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
      </div>
    </div>
  );
};

export default CongressManagementPage;
