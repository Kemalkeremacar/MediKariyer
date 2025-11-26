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
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
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
      <ScreenContainer
        scrollable={false}
        contentContainerStyle={styles.centerContainer}
      >
        <ActivityIndicator size="large" color={colors.primary[600]} />
        <Typography variant="bodySecondary" style={styles.loadingText}>
          Profil yükleniyor...
        </Typography>
      </ScreenContainer>
    );
  }

  if (isError || !profile) {
    return (
      <ScreenContainer
        scrollable={false}
        contentContainerStyle={styles.centerContainer}
      >
        <Typography variant="title" style={styles.errorText}>
          Profil yüklenemedi
        </Typography>
        <Button label="Tekrar dene" onPress={() => refetch()} />
      </ScreenContainer>
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
    <ScreenContainer
      scrollable={false}
      contentContainerStyle={styles.screenContent}
    >
      {completion && (
        <Card padding="xl" shadow="md" style={styles.completionCard}>
          <View style={styles.completionHeader}>
            <Typography variant="subtitle">Profil Tamamlanma</Typography>
            <Typography variant="heading">
              {completion.completion_percent}%
            </Typography>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${completion.completion_percent}%` },
              ]}
            />
          </View>
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
                variant="bodySecondary"
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

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
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
              <Typography variant="title">Fotoğraf Yönetimi</Typography>
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
            <Typography variant="title" style={styles.deleteModalTitle}>
              Emin misiniz?
            </Typography>
            <Typography variant="bodySecondary" style={styles.deleteModalText}>
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
    </ScreenContainer>
  );
};

// Placeholder components - will be implemented next
const PersonalInfoTab = ({
  profile,
  onPhotoManagement,
}: {
  profile: CompleteProfile;
  onPhotoManagement: () => void;
}) => {
  const infoItems = [
    {
      label: 'Ad Soyad',
      value: `${profile.first_name} ${profile.last_name}`,
    },
    profile.title
      ? {
          label: 'Ünvan',
          value: profile.title,
        }
      : null,
    profile.phone
      ? {
          label: 'Telefon',
          value: profile.phone,
        }
      : null,
    profile.specialty_name
      ? {
          label: 'Branş',
          value: profile.specialty_name,
        }
      : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <Card style={styles.sectionCard}>
      <Typography variant="title" style={styles.sectionTitle}>
        Kişisel Bilgiler
      </Typography>
      <View style={styles.infoList}>
        {infoItems.map((item) => (
          <View key={item.label} style={styles.infoRow}>
            <Typography variant="bodySecondary" style={styles.infoLabel}>
              {item.label}
            </Typography>
            <Typography variant="body" style={styles.infoValue}>
              {item.value}
            </Typography>
          </View>
        ))}
      </View>
      <Button
        label="Fotoğraf Yönetimi"
        variant="secondary"
        onPress={onPhotoManagement}
        fullWidth
        style={styles.photoButton}
      />
      <Typography variant="caption" style={styles.placeholderText}>
        Düzenleme formu yakında eklenecek
      </Typography>
    </Card>
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
      <Typography variant="title">Eğitim Bilgileri</Typography>
      <Button label="+ Ekle" variant="ghost" onPress={onAdd} size="md" />
    </View>
    {educations.length === 0 ? (
      <EmptyState
        title="Eğitim bilgisi yok"
        description="Eğitim geçmişini ekleyerek profili güçlendirebilirsin."
      />
    ) : (
      <View style={styles.itemList}>
        {educations.map((edu) => (
          <Card
            key={edu.id}
            padding="md"
            shadow="none"
            style={styles.itemCard}
          >
            <Typography variant="subtitle">
              {edu.education_institution}
            </Typography>
            <Typography variant="bodySecondary" style={styles.itemSubtitle}>
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
      <Typography variant="title">Deneyim Bilgileri</Typography>
      <Button label="+ Ekle" variant="ghost" onPress={onAdd} size="md" />
    </View>
    {experiences.length === 0 ? (
      <EmptyState
        title="Deneyim bilgisi yok"
        description="Kurum ve görev bilgilerini girerek görünürlüğünü artır."
      />
    ) : (
      <View style={styles.itemList}>
        {experiences.map((exp) => (
          <Card
            key={exp.id}
            padding="md"
            shadow="none"
            style={styles.itemCard}
          >
            <Typography variant="subtitle">{exp.organization}</Typography>
            <Typography variant="bodySecondary" style={styles.itemSubtitle}>
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
      <Typography variant="title">Sertifika Bilgileri</Typography>
      <Button label="+ Ekle" variant="ghost" onPress={onAdd} size="md" />
    </View>
    {certificates.length === 0 ? (
      <EmptyState
        title="Sertifika eklenmemiş"
        description="Katıldığın eğitimleri ekleyerek güvenilirliği artır."
      />
    ) : (
      <View style={styles.itemList}>
        {certificates.map((cert) => (
          <Card
            key={cert.id}
            padding="md"
            shadow="none"
            style={styles.itemCard}
          >
            <Typography variant="subtitle">
              {cert.certificate_name}
            </Typography>
            <Typography variant="bodySecondary" style={styles.itemSubtitle}>
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
      <Typography variant="title">Dil Bilgileri</Typography>
      <Button label="+ Ekle" variant="ghost" onPress={onAdd} size="md" />
    </View>
    {languages.length === 0 ? (
      <EmptyState
        title="Dil bilgisi eklenmemiş"
        description="Bildiğin dilleri ekleyerek recruiter'lara kendini tanıt."
      />
    ) : (
      <View style={styles.itemList}>
        {languages.map((lang) => (
          <Card
            key={lang.id}
            padding="md"
            shadow="none"
            style={styles.itemCard}
          >
            <Typography variant="subtitle">
              {lang.language_name || 'Dil'}
            </Typography>
            <Typography variant="bodySecondary" style={styles.itemSubtitle}>
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
  centerContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['2xl'],
    gap: spacing.md,
  },
  loadingText: {
    color: colors.text.secondary,
  },
  errorText: {
    color: colors.error[500],
  },
  screenContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['3xl'],
    gap: spacing.lg,
  },
  completionCard: {
    gap: spacing.sm,
  },
  completionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  tabWrapper: {
    paddingVertical: spacing.sm,
  },
  tabContent: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background.secondary,
  },
  tabActive: {
    backgroundColor: colors.primary[50],
  },
  tabText: {
    color: colors.text.secondary,
  },
  tabTextActive: {
    color: colors.primary[700],
    fontWeight: typography.fontWeight.semibold,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: spacing.lg,
    gap: spacing.lg,
  },
  sectionCard: {
    gap: spacing.md,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.md,
  },
  infoList: {
    gap: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  infoLabel: {
    color: colors.text.secondary,
  },
  infoValue: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semibold,
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
    borderRadius: borderRadius.lg,
    backgroundColor: colors.background.primary,
    gap: spacing.xs,
  },
  itemSubtitle: {
    color: colors.text.secondary,
  },
  itemMeta: {
    color: colors.text.secondary,
  },
  itemActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
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
