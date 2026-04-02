/**
 * Doktor Kongre Detay Sayfası
 */

import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Globe,
  Users,
  ArrowLeft,
  Tag,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { useCongressById } from '@/features/congress/api/useCongress';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';

const fmt = (dateString) =>
  new Date(dateString).toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

const dayName = (dateString) =>
  new Date(dateString).toLocaleDateString('tr-TR', { weekday: 'long' });

const InfoCard = ({ icon: Icon, label, children, className = '' }) => (
  <div className={`group rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:shadow-md hover:border-blue-100 ${className}`}>
    <div className="flex items-start gap-4">
      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex-shrink-0 group-hover:bg-blue-100 transition-colors">
        <Icon className="w-5 h-5 text-blue-600" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{label}</div>
        {children}
      </div>
    </div>
  </div>
);

const CongressDetailPage = () => {
  const { congressId } = useParams();
  const { data, isLoading, isError } = useCongressById(congressId);

  const congress = data?.data?.data;

  const daysInfo = useMemo(() => {
    if (!congress) return null;
    const start = new Date(congress.start_date);
    const end = new Date(congress.end_date);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const duration = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const diffFromNow = Math.round((start - now) / (1000 * 60 * 60 * 24));

    let status, statusColor, statusBg, statusBorder;
    if (diffFromNow > 0) {
      status = `${diffFromNow} gün sonra`;
      statusColor = 'text-emerald-700';
      statusBg = 'bg-emerald-50';
      statusBorder = 'border-emerald-200';
    } else if (now <= end) {
      status = 'Devam ediyor';
      statusColor = 'text-blue-700';
      statusBg = 'bg-blue-50';
      statusBorder = 'border-blue-200';
    } else {
      status = 'Sona erdi';
      statusColor = 'text-gray-500';
      statusBg = 'bg-gray-50';
      statusBorder = 'border-gray-200';
    }

    return { duration, status, statusColor, statusBg, statusBorder };
  }, [congress]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-4 md:p-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <SkeletonLoader className="h-5 w-36 bg-gray-200 rounded-lg" />
          <SkeletonLoader className="h-52 bg-gray-200 rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SkeletonLoader className="h-28 bg-gray-200 rounded-2xl" />
            <SkeletonLoader className="h-28 bg-gray-200 rounded-2xl" />
          </div>
          <SkeletonLoader className="h-24 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !congress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 mx-auto mb-5 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-red-400" />
            </div>
            <div className="text-xl font-bold text-gray-900 mb-2">Kongre bulunamadı</div>
            <p className="text-gray-500 mb-6">Kongre silinmiş olabilir veya erişim izniniz yoktur.</p>
            <Link
              to="/doctor/congresses"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:text-white transition-colors text-sm font-semibold"
            >
              <ArrowLeft className="w-4 h-4" /> Kongre Takvimine Dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const locationText = [congress.city, congress.country].filter(Boolean).join(', ');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm mb-6">
          <Link to="/doctor/congresses" className="font-medium text-gray-500 hover:text-blue-600 transition-colors">
            Kongre Takvimi
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
          <span className="font-medium text-gray-900 truncate max-w-[180px] md:max-w-xs">{congress.title}</span>
        </nav>

        {/* Hero */}
        <div className="relative bg-white rounded-2xl border border-gray-200/80 shadow-lg overflow-hidden mb-6">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600" />

          <div className="p-6 md:p-8 pt-8">
            {(congress.image_url || congress.poster_image_url) && (
              <div className="mb-5">
                <img
                  src={congress.image_url || congress.poster_image_url}
                  alt={congress.title}
                  className={`w-full rounded-xl ${congress.image_url ? 'max-h-72 md:max-h-80 object-cover' : 'max-h-96 object-contain bg-gray-50'}`}
                />
              </div>
            )}
            {/* Status + Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {daysInfo && (
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 ${daysInfo.statusBg} border ${daysInfo.statusBorder} ${daysInfo.statusColor} text-xs font-bold rounded-full`}>
                  <Clock className="w-3.5 h-3.5" />
                  {daysInfo.status}
                </span>
              )}
              {congress.specialty_name && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold rounded-full max-w-full">
                  <Tag className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{congress.specialty_name}</span>
                </span>
              )}
              {congress.subspecialty_name && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-fuchsia-50 border border-fuchsia-100 text-fuchsia-700 text-xs font-semibold rounded-full max-w-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 flex-shrink-0" />
                  <span className="truncate">{congress.subspecialty_name}</span>
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-2">
              {congress.title}
            </h1>

            {/* Quick info line */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mt-3">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {fmt(congress.start_date)} – {fmt(congress.end_date)}
                {daysInfo && <span className="text-gray-400">({daysInfo.duration} gün)</span>}
              </span>
              {locationText && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {locationText}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Tarih */}
          <InfoCard icon={Calendar} label="Tarih Bilgileri">
            <div className="space-y-2">
              <div>
                <div className="text-sm font-semibold text-gray-900">{fmt(congress.start_date)}</div>
                <div className="text-xs text-gray-500 capitalize">{dayName(congress.start_date)}, Başlangıç</div>
              </div>
              <div className="h-px bg-gray-100" />
              <div>
                <div className="text-sm font-semibold text-gray-900">{fmt(congress.end_date)}</div>
                <div className="text-xs text-gray-500 capitalize">{dayName(congress.end_date)}, Bitiş</div>
              </div>
              {daysInfo && (
                <>
                  <div className="h-px bg-gray-100" />
                  <div className="text-xs font-medium text-gray-500">
                    Toplam <span className="text-gray-800 font-bold">{daysInfo.duration}</span> gün
                  </div>
                </>
              )}
            </div>
          </InfoCard>

          {/* Organizatör */}
          {congress.organizer && (
            <InfoCard icon={Users} label="Organizatör">
              <div className="text-sm font-semibold text-gray-900 break-words">{congress.organizer}</div>
            </InfoCard>
          )}
        </div>

        {/* Konum - Full Width */}
        <div className="mb-4">
          <InfoCard icon={MapPin} label="Konum">
            <div className="text-sm font-semibold text-gray-900 break-words">{congress.location}</div>
            {locationText && (
              <div className="text-sm text-gray-500 mt-0.5 break-words">{locationText}</div>
            )}
          </InfoCard>
        </div>

        {/* Açıklama */}
        {congress.description && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 mb-4 transition-all hover:shadow-md hover:border-blue-100">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Hakkında</div>
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line break-words">
              {congress.description}
            </p>
          </div>
        )}

        {/* Web Sitesi */}
        {congress.website_url && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 md:p-6 mb-4 transition-all hover:shadow-md hover:border-blue-100">
            <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">Web Sitesi</div>
            <a
              href={congress.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:text-white active:scale-[0.98] transition-all text-sm font-semibold shadow-sm shadow-blue-600/20 w-full sm:w-auto"
            >
              <Globe className="w-4 h-4" /> Kongre Web Sitesine Git
            </a>
          </div>
        )}

        {/* Back link */}
        <div className="pt-2 pb-4">
          <Link
            to="/doctor/congresses"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Tüm Kongrelere Dön
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CongressDetailPage;
