import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { profileService } from '@/api/services/profile.service';
import { lookupService } from '@/api/services/lookup.service';
import { ProfileFormModal } from '@/components/profile/ProfileFormModal';
import { PhotoManagementScreen } from './PhotoManagementScreen';
import { colors, shadows, spacing, borderRadius, typography } from '@/constants/theme';
import type {
  CompleteProfile,
  ProfileCompletion,
  DoctorEducation,
  DoctorExperience,
  DoctorCertificate,
  DoctorLanguage,
} from '@/types/profile';

type TabType = 'personal' | 'education' | 'experience' | 'certificate' | 'language';

export const ProfileScreen = () => {
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [formModalVisible, setFormModalVisible] = useState(false);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deletingItem, setDeletingItem] = useState<{ id: number; type: TabType } | null>(null);
  const queryClient = useQueryClient();

  const {
    data: profile,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['profile', 'complete'],
    queryFn: () => profileService.getCompleteProfile(),
  });

  const {
    data: completion,
    isLoading: completionLoading,
  } = useQuery({
    queryKey: ['profile', 'completion'],
    queryFn: () => profileService.getProfileCompletion(),
  });

  // Lookup data
  const { data: educationTypes } = useQuery({
    queryKey: ['lookup', 'education-types'],
    queryFn: () => lookupService.getEducationTypes(),
  });

  const { data: specialties } = useQuery({
    queryKey: ['lookup', 'specialties'],
    queryFn: () => lookupService.getSpecialties(),
  });

  const { data: subspecialties } = useQuery({
    queryKey: ['lookup', 'subspecialties'],
    queryFn: () => lookupService.getSubspecialties(),
  });

  const { data: languages } = useQuery({
    queryKey: ['lookup', 'languages'],
    queryFn: () => lookupService.getLanguages(),
  });

  const { data: languageLevels } = useQuery({
    queryKey: ['lookup', 'language-levels'],
    queryFn: () => lookupService.getLanguageLevels(),
  });

  // Mutations
  const createEducationMutation = useMutation({
    mutationFn: (data: any) => profileService.createEducation(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      Alert.alert('Başarılı', 'Eğitim bilgisi eklendi');
    },
    onError: (error: any) => {
      Alert.alert('Hata', error.message || 'Eğitim bilgisi eklenirken bir hata oluştu');
    },
  });

  const updateEducationMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      profileService.updateEducation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      Alert.alert('Başarılı', 'Eğitim bilgisi güncellendi');
    },
    onError: (error: any) => {
      Alert.alert('Hata', error.message || 'Eğitim bilgisi güncellenirken bir hata oluştu');
    },
  });

  const deleteEducationMutation = useMutation({
    mutationFn: (id: number) => profileService.deleteEducation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      Alert.alert('Başarılı', 'Eğitim bilgisi silindi');
    },
    onError: (error: any) => {
      Alert.alert('Hata', error.message || 'Eğitim bilgisi silinirken bir hata oluştu');
    },
  });

  const createExperienceMutation = useMutation({
    mutationFn: (data: any) => profileService.createExperience(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      Alert.alert('Başarılı', 'Deneyim bilgisi eklendi');
    },
    onError: (error: any) => {
      Alert.alert('Hata', error.message || 'Deneyim bilgisi eklenirken bir hata oluştu');
    },
  });

  const updateExperienceMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      profileService.updateExperience(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      Alert.alert('Başarılı', 'Deneyim bilgisi güncellendi');
    },
    onError: (error: any) => {
      Alert.alert('Hata', error.message || 'Deneyim bilgisi güncellenirken bir hata oluştu');
    },
  });

  const deleteExperienceMutation = useMutation({
    mutationFn: (id: number) => profileService.deleteExperience(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      Alert.alert('Başarılı', 'Deneyim bilgisi silindi');
    },
    onError: (error: any) => {
      Alert.alert('Hata', error.message || 'Deneyim bilgisi silinirken bir hata oluştu');
    },
  });

  const createCertificateMutation = useMutation({
    mutationFn: (data: any) => profileService.createCertificate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      Alert.alert('Başarılı', 'Sertifika bilgisi eklendi');
    },
    onError: (error: any) => {
      Alert.alert('Hata', error.message || 'Sertifika bilgisi eklenirken bir hata oluştu');
    },
  });

  const updateCertificateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      profileService.updateCertificate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      Alert.alert('Başarılı', 'Sertifika bilgisi güncellendi');
    },
    onError: (error: any) => {
      Alert.alert('Hata', error.message || 'Sertifika bilgisi güncellenirken bir hata oluştu');
    },
  });

  const deleteCertificateMutation = useMutation({
    mutationFn: (id: number) => profileService.deleteCertificate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      Alert.alert('Başarılı', 'Sertifika bilgisi silindi');
    },
    onError: (error: any) => {
      Alert.alert('Hata', error.message || 'Sertifika bilgisi silinirken bir hata oluştu');
    },
  });

  const createLanguageMutation = useMutation({
    mutationFn: (data: any) => profileService.createLanguage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      Alert.alert('Başarılı', 'Dil bilgisi eklendi');
    },
    onError: (error: any) => {
      Alert.alert('Hata', error.message || 'Dil bilgisi eklenirken bir hata oluştu');
    },
  });

  const updateLanguageMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      profileService.updateLanguage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      Alert.alert('Başarılı', 'Dil bilgisi güncellendi');
    },
    onError: (error: any) => {
      Alert.alert('Hata', error.message || 'Dil bilgisi güncellenirken bir hata oluştu');
    },
  });

  const deleteLanguageMutation = useMutation({
    mutationFn: (id: number) => profileService.deleteLanguage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      Alert.alert('Başarılı', 'Dil bilgisi silindi');
    },
    onError: (error: any) => {
      Alert.alert('Hata', error.message || 'Dil bilgisi silinirken bir hata oluştu');
    },
  });

  const handleAddItem = (type: TabType) => {
    setEditingItem(null);
    setFormModalVisible(true);
  };

  const handleEditItem = (item: any, type: TabType) => {
    setEditingItem(item);
    setFormModalVisible(true);
  };

  const handleDeleteItem = (id: number, type: TabType) => {
    setDeletingItem({ id, type });
    setDeleteModalVisible(true);
  };

  const handleConfirmDelete = () => {
    if (!deletingItem) return;

    const { id, type } = deletingItem;
    switch (type) {
      case 'education':
        deleteEducationMutation.mutate(id);
        break;
      case 'experience':
        deleteExperienceMutation.mutate(id);
        break;
      case 'certificate':
        deleteCertificateMutation.mutate(id);
        break;
      case 'language':
        deleteLanguageMutation.mutate(id);
        break;
    }
    setDeleteModalVisible(false);
    setDeletingItem(null);
  };

  const handleFormSubmit = async (data: any) => {
    if (editingItem) {
      // Update
      switch (activeTab) {
        case 'education':
          await updateEducationMutation.mutateAsync({
            id: editingItem.id,
            data,
          });
          break;
        case 'experience':
          await updateExperienceMutation.mutateAsync({
            id: editingItem.id,
            data,
          });
          break;
        case 'certificate':
          await updateCertificateMutation.mutateAsync({
            id: editingItem.id,
            data,
          });
          break;
        case 'language':
          await updateLanguageMutation.mutateAsync({
            id: editingItem.id,
            data,
          });
          break;
      }
    } else {
      // Create
      switch (activeTab) {
        case 'education':
          await createEducationMutation.mutateAsync(data);
          break;
        case 'experience':
          await createExperienceMutation.mutateAsync(data);
          break;
        case 'certificate':
          await createCertificateMutation.mutateAsync(data);
          break;
        case 'language':
          await createLanguageMutation.mutateAsync(data);
          break;
      }
    }
    setFormModalVisible(false);
    setEditingItem(null);
  };

  const tabs: { key: TabType; label: string }[] = [
    { key: 'personal', label: 'Kişisel' },
    { key: 'education', label: 'Eğitim' },
    { key: 'experience', label: 'Deneyim' },
    { key: 'certificate', label: 'Sertifika' },
    { key: 'language', label: 'Dil' },
  ];

  if (isLoading || completionLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
        <Text style={styles.loadingText}>Profil yükleniyor...</Text>
      </View>
    );
  }

  if (isError || !profile) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Profil yüklenemedi</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryText}>Tekrar dene</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isLoadingMutation =
    createEducationMutation.isPending ||
    updateEducationMutation.isPending ||
    createExperienceMutation.isPending ||
    updateExperienceMutation.isPending ||
    createCertificateMutation.isPending ||
    updateCertificateMutation.isPending ||
    createLanguageMutation.isPending ||
    updateLanguageMutation.isPending;

  return (
    <View style={styles.container}>
      {/* Completion Bar */}
      {completion && (
        <View style={styles.completionContainer}>
          <View style={styles.completionHeader}>
            <Text style={styles.completionLabel}>Profil Tamamlanma</Text>
            <Text style={styles.completionPercent}>
              {completion.completion_percent}%
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${completion.completion_percent}%` },
              ]}
            />
          </View>
        </View>
      )}

      {/* Tab Navigation */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabContainer}
        contentContainerStyle={styles.tabContent}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.tabActive,
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Tab Content */}
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        {activeTab === 'personal' && (
          <PersonalInfoTab 
            profile={profile} 
            onPhotoManagement={() => setPhotoModalVisible(true)}
          />
        )}
        {activeTab === 'education' && (
          <EducationTab
            educations={profile.educations}
            onAdd={() => handleAddItem('education')}
            onEdit={(item) => handleEditItem(item, 'education')}
            onDelete={(id) => handleDeleteItem(id, 'education')}
          />
        )}
        {activeTab === 'experience' && (
          <ExperienceTab
            experiences={profile.experiences}
            onAdd={() => handleAddItem('experience')}
            onEdit={(item) => handleEditItem(item, 'experience')}
            onDelete={(id) => handleDeleteItem(id, 'experience')}
          />
        )}
        {activeTab === 'certificate' && (
          <CertificateTab
            certificates={profile.certificates}
            onAdd={() => handleAddItem('certificate')}
            onEdit={(item) => handleEditItem(item, 'certificate')}
            onDelete={(id) => handleDeleteItem(id, 'certificate')}
          />
        )}
        {activeTab === 'language' && (
          <LanguageTab
            languages={profile.languages}
            onAdd={() => handleAddItem('language')}
            onEdit={(item) => handleEditItem(item, 'language')}
            onDelete={(id) => handleDeleteItem(id, 'language')}
          />
        )}
      </ScrollView>

      {/* Form Modal */}
      {formModalVisible && activeTab !== 'personal' && (
        <ProfileFormModal
          visible={formModalVisible}
          type={activeTab}
          data={editingItem}
          onClose={() => {
            setFormModalVisible(false);
            setEditingItem(null);
          }}
          onSubmit={handleFormSubmit}
          isLoading={isLoadingMutation}
          educationTypes={educationTypes || []}
          specialties={specialties || []}
          subspecialties={subspecialties || []}
          languages={languages || []}
          languageLevels={languageLevels || []}
        />
      )}

      {/* Photo Management Modal */}
      {photoModalVisible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Fotoğraf Yönetimi</Text>
              <TouchableOpacity
                onPress={() => setPhotoModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <PhotoManagementScreen />
          </View>
        </View>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalVisible && deletingItem && (
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModal}>
            <Text style={styles.deleteModalTitle}>Emin misiniz?</Text>
            <Text style={styles.deleteModalText}>
              Bu işlem geri alınamaz.
            </Text>
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={[styles.deleteModalButton, styles.deleteModalButtonCancel]}
                onPress={() => {
                  setDeleteModalVisible(false);
                  setDeletingItem(null);
                }}
              >
                <Text style={styles.deleteModalButtonCancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.deleteModalButton, styles.deleteModalButtonConfirm]}
                onPress={handleConfirmDelete}
              >
                <Text style={styles.deleteModalButtonConfirmText}>Sil</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

// Placeholder components - will be implemented next
const PersonalInfoTab = ({ profile, onPhotoManagement }: { profile: CompleteProfile; onPhotoManagement: () => void }) => (
  <View style={styles.tabContentContainer}>
    <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>Ad Soyad:</Text>
      <Text style={styles.infoValue}>
        {profile.first_name} {profile.last_name}
      </Text>
    </View>
    {profile.title && (
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Ünvan:</Text>
        <Text style={styles.infoValue}>{profile.title}</Text>
      </View>
    )}
    {profile.phone && (
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Telefon:</Text>
        <Text style={styles.infoValue}>{profile.phone}</Text>
      </View>
    )}
    {profile.specialty_name && (
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Branş:</Text>
        <Text style={styles.infoValue}>{profile.specialty_name}</Text>
      </View>
    )}
    <TouchableOpacity style={styles.photoManagementButton} onPress={onPhotoManagement}>
      <Text style={styles.photoManagementButtonText}>📷 Fotoğraf Yönetimi</Text>
    </TouchableOpacity>
    <Text style={styles.placeholderText}>
      Düzenleme formu yakında eklenecek
    </Text>
  </View>
);

const EducationTab = ({
  educations,
  onAdd,
  onEdit,
  onDelete,
}: {
  educations: DoctorEducation[];
  onAdd: () => void;
  onEdit: (item: DoctorEducation) => void;
  onDelete: (id: number) => void;
}) => (
  <View style={styles.tabContentContainer}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Eğitim Bilgileri</Text>
      <TouchableOpacity style={styles.addButton} onPress={onAdd}>
        <Text style={styles.addButtonText}>+ Ekle</Text>
      </TouchableOpacity>
    </View>
    {educations.length === 0 ? (
      <Text style={styles.emptyText}>Henüz eğitim bilgisi eklenmemiş</Text>
    ) : (
      educations.map((edu) => (
        <View key={edu.id} style={styles.itemCard}>
          <View style={styles.itemCardHeader}>
            <View style={styles.itemCardContent}>
              <Text style={styles.itemTitle}>{edu.education_institution}</Text>
              <Text style={styles.itemSubtitle}>{edu.field}</Text>
              <Text style={styles.itemMeta}>{edu.graduation_year}</Text>
            </View>
            <View style={styles.itemCardActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onEdit(edu)}
              >
                <Text style={styles.actionButtonText}>Düzenle</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => onDelete(edu.id)}
              >
                <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                  Sil
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))
    )}
  </View>
);

const ExperienceTab = ({
  experiences,
  onAdd,
  onEdit,
  onDelete,
}: {
  experiences: DoctorExperience[];
  onAdd: () => void;
  onEdit: (item: DoctorExperience) => void;
  onDelete: (id: number) => void;
}) => (
  <View style={styles.tabContentContainer}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Deneyim Bilgileri</Text>
      <TouchableOpacity style={styles.addButton} onPress={onAdd}>
        <Text style={styles.addButtonText}>+ Ekle</Text>
      </TouchableOpacity>
    </View>
    {experiences.length === 0 ? (
      <Text style={styles.emptyText}>Henüz deneyim bilgisi eklenmemiş</Text>
    ) : (
      experiences.map((exp) => (
        <View key={exp.id} style={styles.itemCard}>
          <View style={styles.itemCardHeader}>
            <View style={styles.itemCardContent}>
              <Text style={styles.itemTitle}>{exp.organization}</Text>
              <Text style={styles.itemSubtitle}>{exp.role_title}</Text>
              <Text style={styles.itemMeta}>
                {exp.start_date} - {exp.is_current ? 'Devam ediyor' : exp.end_date || '-'}
              </Text>
            </View>
            <View style={styles.itemCardActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onEdit(exp)}
              >
                <Text style={styles.actionButtonText}>Düzenle</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => onDelete(exp.id)}
              >
                <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                  Sil
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))
    )}
  </View>
);

const CertificateTab = ({
  certificates,
  onAdd,
  onEdit,
  onDelete,
}: {
  certificates: DoctorCertificate[];
  onAdd: () => void;
  onEdit: (item: DoctorCertificate) => void;
  onDelete: (id: number) => void;
}) => (
  <View style={styles.tabContentContainer}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Sertifika Bilgileri</Text>
      <TouchableOpacity style={styles.addButton} onPress={onAdd}>
        <Text style={styles.addButtonText}>+ Ekle</Text>
      </TouchableOpacity>
    </View>
    {certificates.length === 0 ? (
      <Text style={styles.emptyText}>Henüz sertifika eklenmemiş</Text>
    ) : (
      certificates.map((cert) => (
        <View key={cert.id} style={styles.itemCard}>
          <View style={styles.itemCardHeader}>
            <View style={styles.itemCardContent}>
              <Text style={styles.itemTitle}>{cert.certificate_name}</Text>
              <Text style={styles.itemSubtitle}>{cert.institution}</Text>
              <Text style={styles.itemMeta}>{cert.certificate_year}</Text>
            </View>
            <View style={styles.itemCardActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onEdit(cert)}
              >
                <Text style={styles.actionButtonText}>Düzenle</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => onDelete(cert.id)}
              >
                <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                  Sil
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))
    )}
  </View>
);

const LanguageTab = ({
  languages,
  onAdd,
  onEdit,
  onDelete,
}: {
  languages: DoctorLanguage[];
  onAdd: () => void;
  onEdit: (item: DoctorLanguage) => void;
  onDelete: (id: number) => void;
}) => (
  <View style={styles.tabContentContainer}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Dil Bilgileri</Text>
      <TouchableOpacity style={styles.addButton} onPress={onAdd}>
        <Text style={styles.addButtonText}>+ Ekle</Text>
      </TouchableOpacity>
    </View>
    {languages.length === 0 ? (
      <Text style={styles.emptyText}>Henüz dil bilgisi eklenmemiş</Text>
    ) : (
      languages.map((lang) => (
        <View key={lang.id} style={styles.itemCard}>
          <View style={styles.itemCardHeader}>
            <View style={styles.itemCardContent}>
              <Text style={styles.itemTitle}>{lang.language_name || 'Dil'}</Text>
              <Text style={styles.itemSubtitle}>
                {lang.level_name || 'Seviye'}
              </Text>
            </View>
            <View style={styles.itemCardActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onEdit(lang)}
              >
                <Text style={styles.actionButtonText}>Düzenle</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => onDelete(lang.id)}
              >
                <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                  Sil
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['2xl'],
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  errorText: {
    fontSize: typography.fontSize.lg,
    color: colors.error[500],
    marginBottom: spacing.lg,
  },
  retryButton: {
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.md,
    backgroundColor: colors.primary[600],
    borderRadius: borderRadius.md,
  },
  retryText: {
    color: colors.text.inverse,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  completionContainer: {
    padding: spacing.lg,
    backgroundColor: colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  completionLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  completionPercent: {
    fontSize: typography.fontSize.base,
    color: colors.primary[600],
    fontWeight: typography.fontWeight.semibold,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border.light,
    borderRadius: borderRadius.xs,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[600],
    borderRadius: borderRadius.xs,
  },
  tabContainer: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    backgroundColor: colors.background.primary,
  },
  tabContent: {
    paddingHorizontal: spacing.sm,
  },
  tab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginHorizontal: spacing.xs,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.primary[600],
  },
  tabText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  tabTextActive: {
    color: colors.primary[600],
    fontWeight: typography.fontWeight.semibold,
  },
  content: {
    flex: 1,
  },
  tabContentContainer: {
    padding: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  addButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary[600],
    borderRadius: borderRadius.md,
  },
  addButtonText: {
    color: colors.text.inverse,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  infoLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  infoValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.normal,
  },
  itemCard: {
    padding: spacing.lg,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  itemCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemCardContent: {
    flex: 1,
  },
  itemCardActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  itemTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  itemSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  itemMeta: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  actionButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primary[600],
    borderRadius: borderRadius.xs,
  },
  actionButtonText: {
    color: colors.text.inverse,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
  },
  deleteButton: {
    backgroundColor: colors.error[500],
  },
  deleteButtonText: {
    color: colors.text.inverse,
  },
  emptyText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textAlign: 'center',
    paddingVertical: spacing['2xl'],
  },
  placeholderText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    fontStyle: 'italic',
    marginTop: spacing.lg,
    textAlign: 'center',
  },
  deleteModalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  deleteModal: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    padding: spacing['2xl'],
    width: '80%',
    maxWidth: 400,
  },
  deleteModalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  deleteModalText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing['2xl'],
  },
  deleteModalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
  },
  deleteModalButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  deleteModalButtonCancel: {
    backgroundColor: colors.neutral[100],
  },
  deleteModalButtonCancelText: {
    color: colors.neutral[700],
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  deleteModalButtonConfirm: {
    backgroundColor: colors.error[500],
  },
  deleteModalButtonConfirmText: {
    color: colors.text.inverse,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    width: '90%',
    maxHeight: '90%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: typography.fontSize['2xl'],
    color: colors.text.secondary,
  },
  photoManagementButton: {
    backgroundColor: colors.primary[600],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  photoManagementButtonText: {
    color: colors.text.inverse,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
});
