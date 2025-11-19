/**
 * Hospital Doctors Page - AI destekli modern deneyim
 */

import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  MapPin,
  Calendar,
  Eye,
  Phone,
  Mail,
  RefreshCw,
  AlertCircle,
  Target,
  Users,
  CheckCircle,
  Bot,
  Send,
  Sparkles,
  Compass,
  BrainCircuit,
} from 'lucide-react';
import { useHospitalDoctorProfiles } from '../api/useHospital';
import TransitionWrapper, { StaggeredAnimation } from '../../../components/ui/TransitionWrapper';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';
import { hospitalTheme } from '../theme';

const {
  pageWrapper,
  sectionWrapper,
  paginationButton,
  heroCard,
  panelCard,
  listCard,
  ghostButton,
} = hospitalTheme;
const hospitalPageWrapper = `hospital-light ${pageWrapper}`;

const defaultFilters = {
  page: 1,
  limit: 20,
  search: '',
  specialty: '',
  city: '',
  appliedOnly: false,
};

const aiFilterTemplate = {
  specialty_id: null,
  subspecialty_id: null,
  city_id: null,
  region: null,
  min_age: null,
  max_age: null,
  min_experience_years: null,
  work_type: null,
};

const cityKeywords = ['istanbul', 'izmir', 'ankara', 'adana', 'antalya', 'bursa'];
const specialtyKeywords = [
  { key: 'ftr', label: 'Fizik Tedavi ve Rehabilitasyon' },
  { key: 'fizik tedavi', label: 'Fizik Tedavi ve Rehabilitasyon' },
  { key: 'kardiyoloji', label: 'Kardiyoloji' },
  { key: 'ortopedi', label: 'Ortopedi' },
  { key: 'dahiliye', label: 'Dahiliye' },
  { key: 'göz', label: 'Göz Hastalıkları' },
  { key: 'nöroloji', label: 'Nöroloji' },
];

const normalizeText = (value) => value?.toString().trim() || '';

const parsePromptToFilters = (prompt) => {
  const normalized = normalizeText(prompt).toLowerCase();
  const filters = { ...aiFilterTemplate };
  const derivedQuery = { search: '', city: '', specialty: '' };

  if (!normalized) {
    return { filters, derivedQuery };
  }

  if (normalized.includes('anadolu')) {
    filters.region = 'anadolu';
  } else if (normalized.includes('avrupa')) {
    filters.region = 'europa';
  }

  if (/tam\s*zamanl[ıi]|full\s*time/.test(normalized)) {
    filters.work_type = 'fulltime';
  } else if (/yar[ıi]\s*zamanl[ıi]|part\s*time/.test(normalized)) {
    filters.work_type = 'parttime';
  } else if (/sözleşmeli|geçici|contract/.test(normalized)) {
    filters.work_type = 'contract';
  }

  if (normalized.includes('genç')) {
    filters.max_age = 30;
  }
  if (normalized.includes('tecrübeli')) {
    filters.min_experience_years = 3;
  }
  if (normalized.includes('kıdemli')) {
    filters.min_experience_years = Math.max(filters.min_experience_years || 0, 7);
  }

  const ageRangeMatch = normalized.match(/(\d{2})\s*-\s*(\d{2})\s*yaş/);
  if (ageRangeMatch) {
    filters.min_age = Number(ageRangeMatch[1]);
    filters.max_age = Number(ageRangeMatch[2]);
  } else {
    const minAgeMatch = normalized.match(/(\d{2})\s*\+?\s*yaş/);
    if (minAgeMatch) {
      filters.min_age = Number(minAgeMatch[1]);
    }
  }

  const expMatch = normalized.match(/en az\s*(\d+)\s*y[ıi]l/i);
  if (expMatch) {
    filters.min_experience_years = Number(expMatch[1]);
  }

  const matchedCity = cityKeywords.find((city) => normalized.includes(city));
  if (matchedCity) {
    derivedQuery.city = matchedCity;
  }

  const matchedSpecialty = specialtyKeywords.find((spec) => normalized.includes(spec.key));
  if (matchedSpecialty) {
    derivedQuery.specialty = matchedSpecialty.label;
    derivedQuery.search = matchedSpecialty.label;
  }

  if (!derivedQuery.search && normalized.length <= 60) {
    derivedQuery.search = prompt;
  }

  return { filters, derivedQuery };
};

const getInitials = (firstName = '', lastName = '') =>
  `${firstName.charAt(0)}${lastName.charAt(0)}`.trim().toUpperCase() || 'DR';

const formatSpecialties = (specialties) => {
  if (!specialties) return 'Belirtilmemiş';
  if (typeof specialties === 'string') return specialties;
  if (Array.isArray(specialties)) return specialties.join(', ');
  return 'Belirtilmemiş';
};

const calculateAge = (dob) => {
  if (!dob) return null;
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const HospitalDoctors = () => {
  const [queryParams, setQueryParams] = useState(defaultFilters);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiFilters, setAiFilters] = useState(null);
  const [aiStatus, setAiStatus] = useState('idle');
  const [aiError, setAiError] = useState('');

  const {
    data: doctorsData,
    isLoading: doctorsLoading,
    error: doctorsError,
    refetch: refetchDoctors,
  } = useHospitalDoctorProfiles(queryParams);

  const doctors = doctorsData?.data?.doctors || [];
  const pagination = doctorsData?.data?.pagination || {};

  const stats = useMemo(
    () => [
      {
        label: 'Kayıtlı Doktor',
        value: pagination.total ?? doctors.length,
        description: 'Sistemde görünür profil',
      },
      {
        label: 'Yeni Profil',
        value: doctors.slice(0, 5).length,
        description: 'Son eklenen başvurular',
      },
      {
        label: 'AI Araması',
        value: aiFilters ? 'Aktif' : 'Hazır',
        description: aiFilters ? 'Filtre uygulandı' : 'Komut bekleniyor',
      },
    ],
    [pagination.total, doctors, aiFilters],
  );

  const handlePageChange = (page) => {
    setQueryParams((prev) => ({
      ...prev,
      page,
    }));
  };

  const clearAiFilters = () => {
    setAiFilters(null);
    setQueryParams(defaultFilters);
    setAiPrompt('');
  };

  const handleAiSubmit = (event) => {
    event.preventDefault();
    setAiError('');
    if (!aiPrompt.trim()) {
      setAiError('Lütfen bir arama isteği yazın.');
      return;
    }

    setAiStatus('loading');

    setTimeout(() => {
      const { filters, derivedQuery } = parsePromptToFilters(aiPrompt);
      setAiFilters(filters);
      setQueryParams((prev) => ({
        ...prev,
        page: 1,
        search: derivedQuery.search,
        specialty: derivedQuery.specialty,
        city: derivedQuery.city,
      }));
      setAiStatus('success');
    }, 350);
  };

  if (doctorsLoading) {
    return (
      <div className={hospitalPageWrapper}>
        <TransitionWrapper>
          <div className={sectionWrapper}>
            <SkeletonLoader className="h-12 w-72 bg-blue-100 rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <SkeletonLoader key={`skeleton-${i}`} className="h-64 bg-blue-100 rounded-2xl" />
              ))}
            </div>
          </div>
        </TransitionWrapper>
      </div>
    );
  }

  if (doctorsError) {
    return (
      <div className={hospitalPageWrapper}>
        <TransitionWrapper>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center bg-white rounded-3xl p-8 border border-red-100 shadow-xl max-w-lg">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Doktorlar Yüklenemedi</h2>
              <p className="text-gray-600 mb-6">{doctorsError.message || 'Bir hata oluştu'}</p>
              <button
                onClick={() => refetchDoctors()}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 inline-flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Yeniden Dene
              </button>
            </div>
          </div>
        </TransitionWrapper>
      </div>
    );
  }

  return (
    <div className={hospitalPageWrapper}>
      <TransitionWrapper>
        <div className={sectionWrapper}>
          <div className={`${heroCard} space-y-6`}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-cyan-700 bg-white/70 px-3 py-1 rounded-full">
                  <Sparkles className="w-3 h-3" />
                  AI destekli deneyim
                </p>
                <h1 className="mt-3 text-3xl font-bold text-slate-900">Doktor Profilleri</h1>
                <p className="mt-2 text-slate-600">
                  Hastane tarafında kayıtlı tüm onaylı doktor profillerine erişin, başvuru durumlarını görün ve AI’dan destek alın.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full lg:w-auto">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-[0_8px_30px_rgba(15,118,110,0.08)]"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-cyan-600">{stat.label}</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">{stat.value ?? '—'}</p>
                    <p className="text-xs text-slate-600">{stat.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(320px,380px)_1fr]">
            <div className={`${panelCard} p-6`}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-violet-600">Beta</p>
                  <h2 className="text-2xl font-bold text-gray-900">AI Doktor Bulucu</h2>
                  <p className="text-sm text-gray-500">Doğal dilde isteğini yaz, filtreleri AI uygulasın.</p>
                </div>
              </div>

              <form onSubmit={handleAiSubmit} className="mt-6 space-y-3">
                <label htmlFor="aiPrompt" className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Örnek: “Anadolu yakasında genç FTR uzmanı”
                </label>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 focus-within:ring-2 focus-within:ring-violet-200">
                  <textarea
                    id="aiPrompt"
                    rows={3}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder='Sor: "Anadolu yakasında FTR uzmanı bul"'
                    className="w-full bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none resize-none"
                  />
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Sparkles className="w-4 h-4 text-violet-500" />
                      Yapay zeka destekli arama
                    </div>
                    <button
                      type="submit"
                      disabled={aiStatus === 'loading'}
                      className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-violet-200 hover:shadow-violet-300 transition disabled:opacity-60"
                    >
                      {aiStatus === 'loading' ? 'Analiz ediliyor...' : 'Gönder'}
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {aiError && <p className="text-xs text-red-500">{aiError}</p>}
              </form>

              {aiFilters && (
                <div className="mt-5 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="inline-flex items-center gap-2 font-semibold text-slate-600">
                      <Compass className="w-4 h-4 text-violet-500" />
                      AI → otomatik filtreleme
                    </span>
                    <span className="text-slate-400">{doctors.length} doktor listelendi</span>
                  </div>
                  <pre className="bg-slate-900 text-slate-100 text-xs rounded-2xl p-4 overflow-auto">
                    {JSON.stringify(aiFilters, null, 2)}
                  </pre>
                  <button
                    onClick={clearAiFilters}
                    className="text-xs font-semibold text-violet-600 hover:text-violet-700"
                  >
                    AI filtresini temizle
                  </button>
                </div>
              )}
            </div>

            <div className={`${panelCard} p-6`}>
              <div className="flex flex-wrap items-center gap-3 justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Liste</p>
                  <h2 className="text-2xl font-bold text-gray-900">Güncel Doktorlar</h2>
                  <p className="text-sm text-slate-500">
                    {queryParams.city || queryParams.specialty
                      ? `AI filtresi: ${[queryParams.city, queryParams.specialty].filter(Boolean).join(' · ')}`
                      : queryParams.appliedOnly
                        ? 'Sadece size başvurmuş doktorlar listeleniyor'
                        : 'Sistemde kayıtlı tüm onaylı doktorlar listeleniyor'}
                  </p>
                </div>
                {aiFilters && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 bg-violet-50 px-3 py-1 rounded-full">
                    <BrainCircuit className="w-3 h-3" />
                    AI etkin
                  </span>
                )}
                <button
                  type="button"
                  onClick={() =>
                    setQueryParams((prev) => ({
                      ...prev,
                      page: 1,
                      appliedOnly: !prev.appliedOnly,
                    }))
                  }
                  className={`${ghostButton} border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600`}
                >
                  {queryParams.appliedOnly ? 'Sadece başvuranlar' : 'Tüm doktorlar'}
                </button>
              </div>

              {doctors.length > 0 ? (
                <div className="mt-6 space-y-4">
                  {doctors.map((doctor, index) => (
                    <StaggeredAnimation key={doctor.id} delay={index * 80}>
                      <article className={`${listCard} flex-col space-y-4`}>
                        <div className="flex flex-col gap-4 md:flex-row md:items-center">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white">
                              {doctor.first_name || doctor.last_name ? (
                                <span className="text-lg font-semibold">{getInitials(doctor.first_name, doctor.last_name)}</span>
                              ) : (
                                <User className="w-6 h-6" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="text-lg font-semibold text-slate-900">
                                  {doctor.first_name && doctor.last_name
                                    ? `${doctor.first_name} ${doctor.last_name}`
                                    : 'Bilinmeyen Doktor'}
                                </h3>
                                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                                  <CheckCircle className="w-3 h-3" />
                                  Onaylı
                                </span>
                                {typeof doctor.has_applied !== 'undefined' && (
                                  <span
                                    className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                                      doctor.has_applied
                                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                                        : 'bg-slate-50 text-slate-500 border border-slate-100'
                                    }`}
                                  >
                                    {doctor.has_applied ? 'Başvurusu var' : 'Henüz başvurmadı'}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-slate-500">{formatSpecialties(doctor.specialties)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Calendar className="w-3 h-3" />
                            {doctor.created_at ? new Date(doctor.created_at).toLocaleDateString('tr-TR') : '—'}
                          </div>
                        </div>

                        <div className="grid gap-3 text-sm text-slate-600 md:grid-cols-3">
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-violet-500" />
                            <span>{doctor.title || 'Uzman Doktor'}</span>
                          </div>
                          {doctor.residence_city_name && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-rose-500" />
                              <span>{doctor.residence_city_name}</span>
                            </div>
                          )}
                          {doctor.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-emerald-500" />
                              <span>{doctor.phone}</span>
                            </div>
                          )}
                          {doctor.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-blue-500" />
                              <span className="truncate">{doctor.email}</span>
                            </div>
                          )}
                          {doctor.dob && (
                            <div className="flex items-center gap-2">
                              <Compass className="w-4 h-4 text-amber-500" />
                              <span>{calculateAge(doctor.dob)} yaş</span>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between pt-4 border-t border-slate-100">
                          <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                            <span className="px-3 py-1 rounded-full bg-white border border-slate-100">
                              Başvuru #{doctor.id}
                            </span>
                            {doctor.region && (
                              <span className="px-3 py-1 rounded-full bg-white border border-slate-100">
                                Bölge: {doctor.region}
                              </span>
                            )}
                          </div>
                          <Link
                            to={`/hospital/doctors/${doctor.id}`}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-semibold px-5 py-2 rounded-xl hover:shadow-lg hover:shadow-blue-200 transition"
                          >
                            Profili Gör
                            <Eye className="w-4 h-4" />
                          </Link>
                        </div>
                      </article>
                    </StaggeredAnimation>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg text-white">
                    <Users className="w-12 h-12" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Kriterlere uygun doktor bulunamadı</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    AI filtresini sıfırlayabilir veya farklı bir arama komutu deneyebilirsiniz.
                  </p>
                  <button
                    onClick={clearAiFilters}
                    className={`${ghostButton} border-slate-200 text-slate-600 hover:border-violet-400 hover:text-violet-600`}
                  >
                    Filtreyi Temizle
                  </button>
                </div>
              )}

              {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-10">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className={`${paginationButton} text-gray-600 bg-white border border-gray-200 hover:border-blue-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    Önceki
                  </button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                      const page = i + 1;
                      const isCurrent = page === pagination.page;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`${paginationButton} ${
                            isCurrent
                              ? 'bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-md'
                              : 'text-gray-600 bg-white border border-gray-200 hover:border-blue-400 hover:text-blue-600'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.pages}
                    className={`${paginationButton} text-gray-600 bg-white border border-gray-200 hover:border-blue-400 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    Sonraki
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </TransitionWrapper>
    </div>
  );
};

export default HospitalDoctors;


