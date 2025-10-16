/**
 * Hospital Contacts Sayfası
 * 
 * Hastane iletişim bilgileri yönetimi sayfası
 * Backend hospitalService.js ile tam entegrasyon
 * 
 * Özellikler:
 * - İletişim bilgileri listesi ve yönetimi
 * - Yeni iletişim bilgisi ekleme
 * - İletişim bilgisi düzenleme ve silme
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
  Phone, Plus, Edit3, Trash2, Mail, AlertCircle, 
  Save, X, RefreshCw, Globe, Printer, User
} from 'lucide-react';
import { useHospitalContacts, useCreateHospitalContact, useUpdateHospitalContact, useDeleteHospitalContact } from '../api/useHospital';
import TransitionWrapper, { StaggeredAnimation } from '../../../components/ui/TransitionWrapper';
import { SkeletonLoader } from '@/components/ui/LoadingSpinner';
import { showToast } from '@/utils/toastUtils';
import { hospitalContactSchema } from '@config/validation.js';

const HospitalContacts = () => {
  // State management
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState({
    contact_type: '',
    contact_value: '',
    description: ''
  });

  // API hook'ları
  const { 
    data: contactsData, 
    isLoading: contactsLoading, 
    error: contactsError,
    refetch: refetchContacts
  } = useHospitalContacts();

  const createContactMutation = useCreateHospitalContact();
  const updateContactMutation = useUpdateHospitalContact();
  const deleteContactMutation = useDeleteHospitalContact();

  // Veri parsing
  const contacts = contactsData?.data?.contacts || [];

  // Contact type options
  const contactTypes = [
    { value: 'phone', label: 'Telefon', icon: Phone },
    { value: 'email', label: 'E-posta', icon: Mail },
    { value: 'fax', label: 'Faks', icon: Printer },
    { value: 'emergency', label: 'Acil', icon: AlertCircle },
    { value: 'website', label: 'Web Sitesi', icon: Globe },
    { value: 'other', label: 'Diğer', icon: User }
  ];

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateContact = async (e) => {
    e.preventDefault();
    try {
      // Zod validation kullan
      const validatedData = hospitalContactSchema.parse(formData);
      await createContactMutation.mutateAsync(validatedData);
      setFormData({ contact_type: '', contact_value: '', description: '' });
      setShowCreateForm(false);
    } catch (error) {
      if (error.errors) {
        // Zod validation hatası
        const firstError = error.errors[0];
        showToast.error(firstError.message);
      } else {
        console.error('İletişim bilgisi oluşturma hatası:', error);
      }
    }
  };

  const handleEditContact = (contact) => {
    setEditingContact(contact);
    setFormData({
      contact_type: contact.contact_type || '',
      contact_value: contact.contact_value || '',
      description: contact.description || ''
    });
  };

  const handleUpdateContact = async (e) => {
    e.preventDefault();
    try {
      // Zod validation kullan
      const validatedData = hospitalContactSchema.parse(formData);
      await updateContactMutation.mutateAsync({
        contactId: editingContact.id,
        contactData: validatedData
      });
      setEditingContact(null);
      setFormData({ contact_type: '', contact_value: '', description: '' });
    } catch (error) {
      if (error.errors) {
        // Zod validation hatası
        const firstError = error.errors[0];
        showToast.error(firstError.message);
      } else {
        console.error('İletişim bilgisi güncelleme hatası:', error);
      }
    }
  };

  const handleDeleteContact = async (contactId, contactValue) => {
    if (window.confirm(`"${contactValue}" iletişim bilgisini silmek istediğinizden emin misiniz?`)) {
      try {
        await deleteContactMutation.mutateAsync(contactId);
      } catch (error) {
        console.error('İletişim bilgisi silme hatası:', error);
      }
    }
  };

  const cancelForm = () => {
    setShowCreateForm(false);
    setEditingContact(null);
    setFormData({ contact_type: '', contact_value: '', description: '' });
  };

  // Get contact icon
  const getContactIcon = (contactType) => {
    const type = contactTypes.find(t => t.value === contactType);
    return type ? type.icon : User;
  };

  // Get contact label
  const getContactLabel = (contactType) => {
    const type = contactTypes.find(t => t.value === contactType);
    return type ? type.label : 'Diğer';
  };

  // Loading state
  if (contactsLoading) {
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
  if (contactsError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <TransitionWrapper>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-4">İletişim Bilgileri Yüklenemedi</h2>
              <p className="text-gray-300 mb-6">{contactsError.message || 'Bir hata oluştu'}</p>
              <button 
                onClick={() => refetchContacts()} 
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
              <h1 className="text-3xl font-bold text-white">İletişim Bilgileri</h1>
              <p className="text-gray-300 mt-2">Hastane iletişim bilgilerini yönetin</p>
            </div>
            <div className="flex items-center gap-4">
              {!showCreateForm && !editingContact && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 inline-flex items-center gap-2 group"
                >
                  <Plus className="w-5 h-5" />
                  Yeni İletişim
                </button>
              )}
            </div>
          </div>

          {/* Create/Edit Form */}
          {(showCreateForm || editingContact) && (
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {editingContact ? 'İletişim Düzenle' : 'Yeni İletişim Bilgisi'}
                </h2>
                <button
                  onClick={cancelForm}
                  className="bg-gray-500/20 text-gray-300 border border-gray-500/30 px-4 py-2 rounded-xl hover:bg-gray-500/30 transition-all duration-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={editingContact ? handleUpdateContact : handleCreateContact} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      İletişim Türü *
                    </label>
                    <select
                      name="contact_type"
                      value={formData.contact_type}
                      onChange={handleInputChange}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                      required
                    >
                      <option value="">İletişim türü seçin</option>
                      {contactTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      İletişim Değeri *
                    </label>
                    <input
                      type="text"
                      name="contact_value"
                      value={formData.contact_value}
                      onChange={handleInputChange}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                      placeholder="İletişim bilgisini girin"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Açıklama
                    </label>
                    <input
                      type="text"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                      placeholder="Açıklama (opsiyonel)"
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
                    disabled={createContactMutation.isPending || updateContactMutation.isPending}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    {createContactMutation.isPending || updateContactMutation.isPending 
                      ? 'Kaydediliyor...' 
                      : editingContact ? 'Güncelle' : 'Oluştur'
                    }
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Contacts Grid */}
          {contacts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contacts.map((contact, index) => {
                const ContactIcon = getContactIcon(contact.contact_type);
                return (
                  <StaggeredAnimation key={contact.id} delay={index * 100}>
                    <div className="bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 hover:bg-white/15 transition-all duration-300 p-6 group">
                      {/* Contact Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                            <ContactIcon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                              {getContactLabel(contact.contact_type)}
                            </h3>
                            <p className="text-sm text-gray-300 mt-1">
                              {contact.contact_value}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Contact Description */}
                      {contact.description && (
                        <div className="mb-4">
                          <p className="text-gray-300 text-sm leading-relaxed">
                            {contact.description}
                          </p>
                        </div>
                      )}

                      {/* Contact Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditContact(contact)}
                            className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-2 rounded-lg hover:bg-blue-500/30 transition-all duration-300"
                            title="Düzenle"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteContact(contact.id, contact.contact_value)}
                            className="bg-red-500/20 text-red-300 border border-red-500/30 px-3 py-2 rounded-lg hover:bg-red-500/30 transition-all duration-300"
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="text-xs text-gray-400">
                          ID: {contact.id}
                        </div>
                      </div>
                    </div>
                  </StaggeredAnimation>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Phone className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Henüz İletişim Bilgisi Yok</h3>
              <p className="text-gray-300 mb-8">
                Hastanenizin iletişim bilgilerini ekleyerek doktorlarla iletişimi kolaylaştırın.
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-300 inline-flex items-center gap-2 group"
              >
                <Plus className="w-5 h-5" />
                İlk İletişim Bilgisini Ekle
              </button>
            </div>
          )}
        </div>
      </TransitionWrapper>
    </div>
  );
};

export default HospitalContacts;
