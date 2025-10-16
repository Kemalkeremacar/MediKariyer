/**
 * Hospital Departments Sayfası
 * 
 * Hastane departman yönetimi sayfası
 * Backend hospitalService.js ile tam entegrasyon
 * 
 * Özellikler:
 * - Departman listesi ve yönetimi
 * - Yeni departman oluşturma
 * - Departman düzenleme ve silme
 * - Modern glassmorphism dark theme
 * - Responsive tasarım
 * - Türkçe yorum satırları
 * 
 * @author MediKariyer Development Team
 * @version 2.2.0
 * @since 2024
 */

import React, { useState } from 'react';
import { 
  Building, Plus, Edit3, Trash2, Users, User, 
  Save, X, AlertCircle, RefreshCw, ArrowLeft
} from 'lucide-react';
import { useHospitalDepartments, useCreateHospitalDepartment, useUpdateHospitalDepartment, useDeleteHospitalDepartment } from '../api/useHospital';
import TransitionWrapper, { StaggeredAnimation } from '../../../components/ui/TransitionWrapper';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';
import { showToast } from '@/utils/toastUtils';
import { hospitalDepartmentSchema } from '@config/validation.js';

const HospitalDepartments = () => {
  // State management
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [formData, setFormData] = useState({
    department_name: '',
    description: '',
    head_doctor: ''
  });

  // API hook'ları
  const { 
    data: departmentsData, 
    isLoading: departmentsLoading, 
    error: departmentsError,
    refetch: refetchDepartments
  } = useHospitalDepartments();

  const createDepartmentMutation = useCreateHospitalDepartment();
  const updateDepartmentMutation = useUpdateHospitalDepartment();
  const deleteDepartmentMutation = useDeleteHospitalDepartment();

  // Veri parsing
  const departments = departmentsData?.data?.departments || [];

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateDepartment = async (e) => {
    e.preventDefault();
    try {
      // Zod validation kullan
      const validatedData = hospitalDepartmentSchema.parse(formData);
      await createDepartmentMutation.mutateAsync(validatedData);
      setFormData({ department_name: '', description: '', head_doctor: '' });
      setShowCreateForm(false);
    } catch (error) {
      if (error.errors) {
        // Zod validation hatası
        const firstError = error.errors[0];
        showToast.error(firstError.message);
      } else {
        console.error('Departman oluşturma hatası:', error);
      }
    }
  };

  const handleEditDepartment = (department) => {
    setEditingDepartment(department);
    setFormData({
      department_name: department.department_name || '',
      description: department.description || '',
      head_doctor: department.head_doctor || ''
    });
  };

  const handleUpdateDepartment = async (e) => {
    e.preventDefault();
    try {
      // Zod validation kullan
      const validatedData = hospitalDepartmentSchema.parse(formData);
      await updateDepartmentMutation.mutateAsync({
        departmentId: editingDepartment.id,
        departmentData: validatedData
      });
      setEditingDepartment(null);
      setFormData({ department_name: '', description: '', head_doctor: '' });
    } catch (error) {
      if (error.errors) {
        // Zod validation hatası
        const firstError = error.errors[0];
        showToast.error(firstError.message);
      } else {
        console.error('Departman güncelleme hatası:', error);
      }
    }
  };

  const handleDeleteDepartment = async (departmentId, departmentName) => {
    if (window.confirm(`"${departmentName}" departmanını silmek istediğinizden emin misiniz?`)) {
      try {
        await deleteDepartmentMutation.mutateAsync(departmentId);
      } catch (error) {
        console.error('Departman silme hatası:', error);
      }
    }
  };

  const cancelForm = () => {
    setShowCreateForm(false);
    setEditingDepartment(null);
    setFormData({ department_name: '', description: '', head_doctor: '' });
  };

  // Loading state
  if (departmentsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <TransitionWrapper>
          <div className="space-y-8 p-6">
            <SkeletonLoader className="h-12 w-80 bg-white/10 rounded-2xl" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <SkeletonLoader key={i} className="h-64 bg-white/10 rounded-2xl" />
              ))}
            </div>
          </div>
        </TransitionWrapper>
      </div>
    );
  }

  // Error state
  if (departmentsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <TransitionWrapper>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">Departmanlar Yüklenemedi</h2>
              <p className="text-gray-300 mb-6">{departmentsError.message || 'Bir hata oluştu'}</p>
              <button 
                onClick={() => refetchDepartments()} 
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      <TransitionWrapper>
        <div className="space-y-8 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Departmanlar</h1>
              <p className="text-gray-300 mt-2">Hastane departmanlarını yönetin</p>
            </div>
            <div className="flex items-center gap-4">
              {!showCreateForm && !editingDepartment && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 inline-flex items-center gap-2 group"
                >
                  <Plus className="w-5 h-5" />
                  Yeni Departman
                </button>
              )}
            </div>
          </div>

          {/* Create/Edit Form */}
          {(showCreateForm || editingDepartment) && (
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {editingDepartment ? 'Departman Düzenle' : 'Yeni Departman'}
                </h2>
                <button
                  onClick={cancelForm}
                  className="bg-gray-500/20 text-gray-300 border border-gray-500/30 px-4 py-2 rounded-xl hover:bg-gray-500/30 transition-all duration-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={editingDepartment ? handleUpdateDepartment : handleCreateDepartment} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Departman Adı *
                    </label>
                    <input
                      type="text"
                      name="department_name"
                      value={formData.department_name}
                      onChange={handleInputChange}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                      placeholder="Departman adını girin"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Başhekim
                    </label>
                    <input
                      type="text"
                      name="head_doctor"
                      value={formData.head_doctor}
                      onChange={handleInputChange}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                      placeholder="Başhekim adını girin"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Açıklama
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                      placeholder="Departman açıklamasını girin"
                    />
                  </div>
                </div>

                <div className="flex gap-4 justify-end">
                  <button
                    type="button"
                    onClick={cancelForm}
                    className="bg-gray-500/20 text-gray-300 border border-gray-500/30 px-6 py-3 rounded-xl hover:bg-gray-500/30 transition-all duration-300"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    disabled={createDepartmentMutation.isPending || updateDepartmentMutation.isPending}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    {createDepartmentMutation.isPending || updateDepartmentMutation.isPending 
                      ? 'Kaydediliyor...' 
                      : editingDepartment ? 'Güncelle' : 'Oluştur'
                    }
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Departments Grid */}
          {departments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {departments.map((department, index) => (
                <StaggeredAnimation key={department.id} delay={index * 100}>
                  <div className="bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 hover:bg-white/15 transition-all duration-300 p-6 group">
                    {/* Department Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                          <Building className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
                            {department.department_name}
                          </h3>
                          {department.head_doctor && (
                            <p className="text-sm text-gray-300 flex items-center gap-1 mt-1">
                              <User className="w-4 h-4" />
                              {department.head_doctor}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Department Description */}
                    {department.description && (
                      <div className="mb-6">
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {department.description}
                        </p>
                      </div>
                    )}

                    {/* Department Stats */}
                    <div className="flex items-center gap-4 mb-6">
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Users className="w-4 h-4" />
                        <span>Departman</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditDepartment(department)}
                          className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-2 rounded-lg hover:bg-blue-500/30 transition-all duration-300"
                          title="Düzenle"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteDepartment(department.id, department.department_name)}
                          className="bg-red-500/20 text-red-300 border border-red-500/30 px-3 py-2 rounded-lg hover:bg-red-500/30 transition-all duration-300"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="text-xs text-gray-400">
                        ID: {department.id}
                      </div>
                    </div>
                  </div>
                </StaggeredAnimation>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Henüz Departman Yok</h3>
              <p className="text-gray-300 mb-8">
                Hastanenizin departmanlarını ekleyerek organizasyonunuzu düzenleyin.
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 inline-flex items-center gap-2 group"
              >
                <Plus className="w-5 h-5" />
                İlk Departmanı Oluştur
              </button>
            </div>
          )}
        </div>
      </TransitionWrapper>
    </div>
  );
};

export default HospitalDepartments;
