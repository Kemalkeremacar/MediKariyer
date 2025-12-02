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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { profileService } from '@/api/services/profile.service';
import { lookupService } from '@/api/services/lookup.service';
import { ProfileFormModal } from '../components/ProfileFormModal';
import { PhotoManagementScreen } from './PhotoManagementScreen';
import { SettingsScreen } from '@/features/settings';
import {
  Card,
  Typography,
  Button,
  EmptyState,
  ErrorState,
  LoadingState,
  Avatar,
  Badge,
} from '@/ui';
import { colors, spacing, borderRadius, typography } from '@/theme';
import { Settings } from 'lucide-react-native';
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
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['profile', 'complete'],
    queryFn: () => profileService.getCompleteProfile(),
    retry: 2,
    retryDelay: 1000,
  });

  const {
    data: completion,
    isLoading: completionLoading,
    isError: completionError,
  } = useQuery({
    queryKey: ['profile', 'completion'],
    queryFn: () => profileService.getProfileCompletion(),
    retry: 2,
    retryDelay: 1000,
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
    return <LoadingState message="Profil yükleniyor..." />;
  }

  if (isError || (!profile && !isLoading)) {
    return (
      <ErrorState
        title="Profil yüklenemedi"
        message="Profil bilgileriniz yüklenirken bir sorun oluştu. Lütfen tekrar deneyin."
        onRetry={() => refetch()}
        retryLabel="Tekrar dene"
      />
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

  const insets = useSafeAreaInsets();
  const [showSettings, setShowSettings] = useState(false);

  if (showSettings) {
    return <SettingsScreen />;
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <View style={styles.headerContent}>
          <Typography variant="h3">Hesabım</Typography>
          <TouchableOpacity onPress={() => setShowSettings(true)}>
            <Settings size={24} color={colors.primary[600]} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
        }
      >
        {/* Profil Özeti */}
        {profile && (
          <Card padding="xl"  style={styles.profileSummaryCard}>
            <View style={styles.profileHeader}>
              <Avatar
                name={`${profile.first_name} ${profile.last_name}`}
                size="xl"
                color="primary"
              />
              <View style={styles.profileInfo}>
                <Typography variant="h4" style={styles.profileName}>
                  {profile.title ? `${profile.title} ` : ''}{profile.first_name} {profile.last_name}
                </Typography>
                {profile.specialty_name && (
                  <Typography variant="body" color="secondary" style={styles.profileSpecialty}>
                    {profile.specialty_name}
                  </Typography>
                )}
              </View>
            </View>
            
            {completion && (
              <View style={styles.completionSection}>
                <View style={styles.completionHeader}>
                  <Typography variant="body">Profil Tamamlanma</Typography>
                  <Typography variant="h4" style={styles.completionPercent}>
                    {completion.completion_percent}%
                  </Typography>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { 
                        width: `${completion.completion_percent}%`,
                        backgroundColor: completion.completion_percent >= 80 
                          ? colors.success[500] 
                          : completion.completion_percent >= 50 
                          ? colors.warning[500] 
                          : colors.error[500]
                      },
                    ]}
                  />
                </View>
                {completion.completion_percent < 100 && (
                  <Typography variant="caption" style={styles.completionHint}>
                    Profilini tamamlayarak daha fazla fırsat yakala
                  </Typography>
                )}
              </View>
            )}
          </Card>
        )}

        <Card style={styles.tabWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
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
                <Typography
                  variant="body" color="secondary"
                  style={[
                    styles.tabText,
                    activeTab === tab.key && styles.tabTextActive,
                  ]}
                >
                  {tab.label}
                </Typography>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Card>

        {activeTab === 'personal' && profile && (
          <PersonalInfoTab
            profile={profile}
            onPhotoManagement={() => setPhotoModalVisible(true)}
          />
        )}
        {activeTab === 'education' && profile && (
          <EducationTab
            educations={profile.educations || []}
            onAdd={() => handleAddItem('education')}
            onEdit={(item) => handleEditItem(item, 'education')}
            onDelete={(id) => handleDeleteItem(id, 'education')}
          />
        )}
        {activeTab === 'experience' && profile && (
          <ExperienceTab
            experiences={profile.experiences || []}
            onAdd={() => handleAddItem('experience')}
            onEdit={(item) => handleEditItem(item, 'experience')}
            onDelete={(id) => handleDeleteItem(id, 'experience')}
          />
        )}
        {activeTab === 'certificate' && profile && (
          <CertificateTab
            certificates={profile.certificates || []}
            onAdd={() => handleAddItem('certificate')}
            onEdit={(item) => handleEditItem(item, 'certificate')}
            onDelete={(id) => handleDeleteItem(id, 'certificate')}
          />
        )}
        {activeTab === 'language' && profile && (
          <LanguageTab
            languages={profile.languages || []}
            onAdd={() => handleAddItem('language')}
            onEdit={(item) => handleEditItem(item, 'language')}
            onDelete={(id) => handleDeleteItem(id, 'language')}
          />
        )}
      </ScrollView>

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

      {photoModalVisible && (
        <View style={styles.modalOverlay}>
          <Card padding="xl" style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Typography variant="h4">Fotoğraf Yönetimi</Typography>
              <Button
                label="Kapat"
                variant="ghost"
                onPress={() => setPhotoModalVisible(false)}
                size="md"
              />
            </View>
            <PhotoManagementScreen />
          </Card>
        </View>
      )}

      {deleteModalVisible && deletingItem && (
        <View style={styles.deleteModalOverlay}>
          <Card padding="xl" style={styles.deleteModal}>
            <Typography variant="h4" style={styles.deleteModalTitle}>
              Emin misiniz?
            </Typography>
            <Typography variant="body" color="secondary" style={styles.deleteModalText}>
              Bu işlem geri alınamaz.
            </Typography>
            <View style={styles.deleteModalButtons}>
              <Button
                label="İptal"
                variant="ghost"
                style={styles.deleteModalButton}
                onPress={() => {
                  setDeleteModalVisible(false);
                  setDeletingItem(null);
                }}
              />
              <Button
                label="Sil"
                variant="secondary"
                style={styles.deleteModalButton}
                onPress={handleConfirmDelete}
              />
            </View>
          </Card>
        </View>
      )}
    </View>
  );
};

// Tab Components
const PersonalInfoTab = ({
  profile,
  onPhotoManagement,
}: {
  profile: CompleteProfile;
  onPhotoManagement: () => void;
}) => {
  const infoSections = [
    {
      title: 'Temel Bilgiler',
      items: [
        { label: 'Ad', value: profile.first_name || '-', icon: '👤' },
        { label: 'Soyad', value: profile.last_name || '-', icon: '👤' },
        { label: 'Ünvan', value: profile.title || '-', icon: '🎓' },
        { label: 'Doğum Tarihi', value: profile.dob || '-', icon: '📅' },
      ],
    },
    {
      title: 'İletişim',
      items: [
        { label: 'Telefon', value: profile.phone || '-', icon: '📱' },
      ],
    },
    {
      title: 'Uzmanlık',
      items: [
        { label: 'Branş', value: profile.specialty_name || '-', icon: '⚕️' },
        { label: 'Yan Dal', value: profile.subspecialty_name || '-', icon: '🔬' },
      ],
    },
    {
      title: 'Konum',
      items: [
        { label: 'İkamet Şehri', value: profile.residence_city_name || '-', icon: '📍' },
      ],
    },
  ];

  return (
    <View style={styles.personalInfoContainer}>
      {infoSections.map((section, sectionIndex) => (
        <Card key={`section-${sectionIndex}`} style={styles.sectionCard}>
          <Typography variant="h4" style={styles.sectionTitle}>
            {section.title}
          </Typography>
          <View style={styles.infoList}>
            {section.items.map((item, itemIndex) => (
              <View key={`${section.title}-${itemIndex}`} style={styles.infoRow}>
                <View style={styles.infoLabelContainer}>
                  <Text style={styles.infoIcon}>{item.icon}</Text>
                  <Typography variant="body" color="secondary" style={styles.infoLabel}>
                    {item.label}
                  </Typography>
                </View>
                <Typography variant="body" style={styles.infoValue}>
                  {item.value}
                </Typography>
              </View>
            ))}
          </View>
        </Card>
      ))}
      
      <Card style={styles.actionCard}>
        <Typography variant="h4" style={styles.actionTitle}>
          Profil Fotoğrafı
        </Typography>
        <Typography variant="body" color="secondary" style={styles.actionDescription}>
          Profil fotoğrafını yükle veya güncelle
        </Typography>
        <Button
          label="Fotoğraf Yönetimi"
          variant="primary"
          onPress={onPhotoManagement}
          fullWidth
          style={styles.actionButton}
        />
      </Card>
    </View>
  );
};

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
  <Card style={styles.sectionCard}>
    <View style={styles.sectionHeader}>
      <Typography variant="h4">Eğitim Bilgileri</Typography>
      <Button label="+ Ekle" variant="ghost" onPress={onAdd} size="md" />
    </View>
    {educations.length === 0 ? (
      <EmptyState
        title="Eğitim bilgisi yok"
        description="Eğitim geçmişini ekleyerek profili güçlendirebilirsin."
      />
    ) : (
      <View style={styles.itemList}>
        {educations.map((edu, index) => (
          <Card
            key={`edu-${edu.id}-${index}`}
            padding="md"
            
            style={styles.itemCard}
          >
            <Typography variant="h4">
              {edu.education_institution}
            </Typography>
            <Typography variant="body" color="secondary" style={styles.itemSubtitle}>
              {edu.field}
            </Typography>
            <Typography variant="caption" style={styles.itemMeta}>
              {edu.graduation_year}
            </Typography>
            <View style={styles.itemActions}>
              <Button
                label="Düzenle"
                variant="ghost"
                size="md"
                style={styles.inlineButton}
                onPress={() => onEdit(edu)}
              />
              <Button
                label="Sil"
                variant="secondary"
                size="md"
                style={styles.inlineButton}
                onPress={() => onDelete(edu.id)}
              />
            </View>
          </Card>
        ))}
      </View>
    )}
  </Card>
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
  <Card style={styles.sectionCard}>
    <View style={styles.sectionHeader}>
      <Typography variant="h4">Deneyim Bilgileri</Typography>
      <Button label="+ Ekle" variant="ghost" onPress={onAdd} size="md" />
    </View>
    {experiences.length === 0 ? (
      <EmptyState
        title="Deneyim bilgisi yok"
        description="Kurum ve görev bilgilerini girerek görünürlüğünü artır."
      />
    ) : (
      <View style={styles.itemList}>
        {experiences.map((exp, index) => (
          <Card
            key={`exp-${exp.id}-${index}`}
            padding="md"
            
            style={styles.itemCard}
          >
            <Typography variant="h4">{exp.organization}</Typography>
            <Typography variant="body" color="secondary" style={styles.itemSubtitle}>
              {exp.role_title}
            </Typography>
            <Typography variant="caption" style={styles.itemMeta}>
              {exp.start_date} -{' '}
              {exp.is_current ? 'Devam ediyor' : exp.end_date || '-'}
            </Typography>
            <View style={styles.itemActions}>
              <Button
                label="Düzenle"
                variant="ghost"
                size="md"
                style={styles.inlineButton}
                onPress={() => onEdit(exp)}
              />
              <Button
                label="Sil"
                variant="secondary"
                size="md"
                style={styles.inlineButton}
                onPress={() => onDelete(exp.id)}
              />
            </View>
          </Card>
        ))}
      </View>
    )}
  </Card>
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
  <Card style={styles.sectionCard}>
    <View style={styles.sectionHeader}>
      <Typography variant="h4">Sertifika Bilgileri</Typography>
      <Button label="+ Ekle" variant="ghost" onPress={onAdd} size="md" />
    </View>
    {certificates.length === 0 ? (
      <EmptyState
        title="Sertifika eklenmemiş"
        description="Katıldığın eğitimleri ekleyerek güvenilirliği artır."
      />
    ) : (
      <View style={styles.itemList}>
        {certificates.map((cert, index) => (
          <Card
            key={`cert-${cert.id}-${index}`}
            padding="md"
            
            style={styles.itemCard}
          >
            <Typography variant="h4">
              {cert.certificate_name}
            </Typography>
            <Typography variant="body" color="secondary" style={styles.itemSubtitle}>
              {cert.institution}
            </Typography>
            <Typography variant="caption" style={styles.itemMeta}>
              {cert.certificate_year}
            </Typography>
            <View style={styles.itemActions}>
              <Button
                label="Düzenle"
                variant="ghost"
                size="md"
                style={styles.inlineButton}
                onPress={() => onEdit(cert)}
              />
              <Button
                label="Sil"
                variant="secondary"
                size="md"
                style={styles.inlineButton}
                onPress={() => onDelete(cert.id)}
              />
            </View>
          </Card>
        ))}
      </View>
    )}
  </Card>
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
  <Card style={styles.sectionCard}>
    <View style={styles.sectionHeader}>
      <Typography variant="h4">Dil Bilgileri</Typography>
      <Button label="+ Ekle" variant="ghost" onPress={onAdd} size="md" />
    </View>
    {languages.length === 0 ? (
      <EmptyState
        title="Dil bilgisi eklenmemiş"
        description="Bildiğin dilleri ekleyerek recruiter'lara kendini tanıt."
      />
    ) : (
      <View style={styles.itemList}>
        {languages.map((lang, index) => (
          <Card
            key={`lang-${lang.id}-${index}`}
            padding="md"
            
            style={styles.itemCard}
          >
            <Typography variant="h4">
              {lang.language_name || 'Dil'}
            </Typography>
            <Typography variant="body" color="secondary" style={styles.itemSubtitle}>
              {lang.level_name || 'Seviye'}
            </Typography>
            <View style={styles.itemActions}>
              <Button
                label="Düzenle"
                variant="ghost"
                size="md"
                style={styles.inlineButton}
                onPress={() => onEdit(lang)}
              />
              <Button
                label="Sil"
                variant="secondary"
                size="md"
                style={styles.inlineButton}
                onPress={() => onDelete(lang.id)}
              />
            </View>
          </Card>
        ))}
      </View>
    )}
  </Card>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
    gap: spacing.lg,
  },
  profileSummaryCard: {
    gap: spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  profileInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  profileName: {
    fontSize: 20,
    fontWeight: typography.fontWeight.bold,
  },
  profileSpecialty: {
    fontSize: 14,
  },
  completionSection: {
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  completionPercent: {
    fontSize: 18,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[600],
  },
  progressBar: {
    height: 8,
    borderRadius: borderRadius.full,
    backgroundColor: colors.border.light,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[600],
  },
  completionHint: {
    color: colors.text.secondary,
    textAlign: 'center',
  },
  tabWrapper: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  tabContent: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  tab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  tabActive: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  tabText: {
    color: colors.text.secondary,
    fontSize: 14,
    fontWeight: typography.fontWeight.medium,
  },
  tabTextActive: {
    color: '#ffffff',
    fontWeight: typography.fontWeight.semibold,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: spacing.lg,
    gap: spacing.lg,
  },
  personalInfoContainer: {
    gap: spacing.md,
  },
  sectionCard: {
    gap: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
    fontSize: 16,
    fontWeight: typography.fontWeight.semibold,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  infoList: {
    gap: spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    minHeight: 48,
  },
  infoLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  infoIcon: {
    fontSize: 18,
  },
  infoLabel: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  infoValue: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
    fontSize: 14,
    textAlign: 'right',
    flex: 1,
  },
  actionCard: {
    gap: spacing.sm,
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: typography.fontWeight.semibold,
  },
  actionDescription: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  actionButton: {
    marginTop: spacing.xs,
  },
  photoButton: {
    marginTop: spacing.sm,
  },
  placeholderText: {
    textAlign: 'center',
    color: colors.text.secondary,
  },
  itemList: {
    gap: spacing.md,
  },
  itemCard: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.background.primary,
    gap: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  itemSubtitle: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  itemMeta: {
    color: colors.text.secondary,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  itemActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  inlineButton: {
    flex: 1,
    paddingVertical: spacing.sm,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modalContainer: {
    width: '100%',
    maxHeight: '85%',
    borderRadius: borderRadius.xl,
    gap: spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deleteModalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  deleteModal: {
    gap: spacing.md,
  },
  deleteModalTitle: {
    textAlign: 'center',
  },
  deleteModalText: {
    textAlign: 'center',
    color: colors.text.secondary,
  },
  deleteModalButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  deleteModalButton: {
    flex: 1,
  },
});
