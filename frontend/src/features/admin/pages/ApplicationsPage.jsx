/**
 * ApplicationsPage - Admin başvuru yönetimi sayfası
 * Tüm başvuruları görüntüleme ve yönetme
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApplications } from '../api/useAdmin';
import { showToast } from '@/utils/toastUtils';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  FileText,
  Calendar
} from 'lucide-react';
import { useLookup } from '../../../hooks/useLookup';

const ApplicationsPage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    status: '',
    doctor_search: '',
    hospital_search: '',
    page: 1,
    limit: 10
  });

  const [searchInputs, setSearchInputs] = useState({
    doctor_search: '',
    hospital_search: ''
  });

  // Refs to maintain focus
  const doctorSearchRef = useRef(null);
  const hospitalSearchRef = useRef(null);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters(prev => ({
        ...prev,
        doctor_search: searchInputs.doctor_search,
        hospital_search: searchInputs.hospital_search,
        page: 1
      }));
    }, 300); // Reduced to 300ms for faster response

    return () => clearTimeout(timeoutId);
  }, [searchInputs.doctor_search, searchInputs.hospital_search]);

  // Lookup Data Hook
  const { 
    isLoading: lookupLoading 
  } = useLookup();

  // Application statuses - hardcoded for now (can be moved to lookup later)
  const applicationStatuses = [
    { id: 1, name: 'Başvuruldu' },
    { id: 2, name: 'İnceleniyor' },
    { id: 3, name: 'Kabul Edildi' },
    { id: 4, name: 'Reddedildi' },
    { id: 5, name: 'Geri Çekildi' }
  ];

  const { data: applicationsData, isLoading, error, refetch } = useApplications(filters);

  const applications = Array.isArray(applicationsData?.data?.data) ? applicationsData.data.data : 
                     Array.isArray(applicationsData?.data) ? applicationsData.data : 
                     Array.isArray(applicationsData) ? applicationsData : [];
  const pagination = applicationsData?.data?.pagination || applicationsData?.pagination || {};

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: 1 // Reset to first page when filter changes
    }));
  };

  const handleSearchInputChange = (field, value) => {
    setSearchInputs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };


  const handleViewApplication = (applicationId) => {
    navigate(`/admin/applications/${applicationId}`);
  };


  const getStatusBadge = (statusId, statusName) => {
    // Status ID'ye göre config (database tablosuna göre)
    const statusConfig = {
      1: { // Beklemede
        color: 'bg-yellow-100 text-yellow-800 border-yellow-300', 
        icon: Clock,
        text: 'Beklemede'
      },
      2: { // İnceleniyor
        color: 'bg-blue-100 text-blue-800 border-blue-300', 
        icon: Eye,
        text: 'İnceleniyor'
      },
      3: { // Kabul Edildi
        color: 'bg-green-100 text-green-800 border-green-300', 
        icon: CheckCircle,
        text: 'Kabul Edildi'
      },
      4: { // Red Edildi
        color: 'bg-red-100 text-red-800 border-red-300', 
        icon: XCircle,
        text: 'Reddedildi'
      },
      5: { // Geri Çekildi
        color: 'bg-gray-100 text-gray-800 border-gray-300', 
        icon: ArrowLeft,
        text: 'Geri Çekildi'
      }
    };

    const config = statusConfig[statusId] || statusConfig[1]; // Default to 'Beklemede'
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {statusName || config.text}
      </span>
    );
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="p-6 text-red-500">Hata oluştu: {error.message}</div>;

  return (
    <div className="min-h-screen">
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <FileText className="h-8 w-8 mr-3 text-indigo-600" />
                Başvuru Yönetimi
              </h1>
              <p className="text-gray-600 mt-2">
                Tüm başvuruları görüntüleyin ve takip edin
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/90 backdrop-blur-md shadow-lg rounded-xl p-4 mb-6 border border-slate-600/30 hover:shadow-xl transition-all duration-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Filter */}
            <div className="md:col-span-1">
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="admin-form-select"
              >
                <option value="">Tüm Durumlar</option>
                {applicationStatuses.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Inputs */}
            <div className="md:col-span-2 flex space-x-2">
              <div className="relative flex-1">
                <input
                  ref={doctorSearchRef}
                  type="text"
                  placeholder="Doktor ara..."
                  value={searchInputs.doctor_search}
                  onChange={(e) => handleSearchInputChange('doctor_search', e.target.value)}
                  className="admin-form-input"
                  autoComplete="off"
                />
              </div>
              <div className="relative flex-1">
                <input
                  ref={hospitalSearchRef}
                  type="text"
                  placeholder="Hastane ara..."
                  value={searchInputs.hospital_search}
                  onChange={(e) => handleSearchInputChange('hospital_search', e.target.value)}
                  className="admin-form-input"
                  autoComplete="off"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <div className="admin-table">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th>Başvuru</th>
                  <th>Doktor</th>
                  <th>İş İlanı</th>
                  <th>Hastane</th>
                  <th>Durum</th>
                  <th>Tarih</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => (
                  <tr 
                    key={application.id} 
                    onClick={() => handleViewApplication(application.id)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td>
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            #{application.id}
                          </div>
                          <div className="text-sm text-gray-500">
                            {application.notes ? 'Notlar var' : 'Not yok'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {application.first_name} {application.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {application.residence_city_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-sm text-gray-900">{application.job_title}</div>
                    </td>
                    <td>
                      <div className="flex items-center">
                        <div className="text-sm text-gray-900">{application.institution_name}</div>
                      </div>
                    </td>
                    <td>
                      {getStatusBadge(application.status_id, application.status)}
                    </td>
                    <td>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <div className="text-sm text-gray-900">
                          {new Date(application.applied_at).toLocaleDateString('tr-TR')}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewApplication(application.id);
                          }}
                          className="admin-btn admin-btn-sm admin-btn-primary"
                          title="Detayları görüntüle"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Detay
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className="bg-slate-800/90 px-4 py-3 flex items-center justify-between border-t border-slate-600/30 sm:px-6">
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
                  <p className="text-sm text-slate-300">
                    Toplam <span className="font-medium">{pagination.total}</span> başvurudan{' '}
                    <span className="font-medium">{((pagination.current_page - 1) * pagination.per_page) + 1}</span> -{' '}
                    <span className="font-medium">
                      {Math.min(pagination.current_page * pagination.per_page, pagination.total)}
                    </span>{' '}
                    arası gösteriliyor
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
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
      </div>
    </div>
  );
};

export default ApplicationsPage;
