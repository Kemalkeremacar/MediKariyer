/**
 * @file SideMenu.tsx
 * @description CV Önizleme - Hastanenin doktoru nasıl göreceğini gösteren ekran
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  Image,
  ScrollView,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/theme';
import { useProfileCore } from '@/features/profile/hooks/useProfileCore';
import { useEducations } from '@/features/profile/hooks/useEducations';
import { useExperiences } from '@/features/profile/hooks/useExperiences';
import { useCertificates } from '@/features/profile/hooks/useCertificates';
import { useLanguages } from '@/features/profile/hooks/useLanguages';
import { getFullImageUrl } from '@/utils/imageUrl';
import { formatFullName } from '@/utils/formatTitle';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MENU_WIDTH = SCREEN_WIDTH * 0.88;

// Renk temaları - profil detay ekranlarıyla uyumlu
const THEMES = {
  personal: { bg: '#EFF6FF', icon: '#1D4ED8', light: '#DBEAFE', text: '#1E40AF' },
  education: { bg: '#ECFDF5', icon: '#059669', light: '#D1FAE5', text: '#047857' },
  experience: { bg: '#EFF6FF', icon: '#2563EB', light: '#DBEAFE', text: '#1D4ED8' },
  certificate: { bg: '#FFFBEB', icon: '#D97706', light: '#FEF3C7', text: '#B45309' },
  language: { bg: '#FAF5FF', icon: '#9333EA', light: '#F3E8FF', text: '#7C3AED' },
};

interface SideMenuProps {
  visible: boolean;
  onClose: () => void;
  onNavigate?: (screen: string) => void;
}

export const SideMenu: React.FC<SideMenuProps> = ({
  visible,
  onClose,
  onNavigate,
}) => {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(-MENU_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { data: profile, isLoading: profileLoading } = useProfileCore();
  const { data: educationsData, isLoading: educationsLoading } = useEducations();
  const { data: experiencesData, isLoading: experiencesLoading } = useExperiences();
  const { data: certificatesData, isLoading: certificatesLoading } = useCertificates();
  const { data: languagesData, isLoading: languagesLoading } = useLanguages();

  const educations = educationsData || [];
  const experiences = experiencesData || [];
  const certificates = certificatesData || [];
  const languages = languagesData || [];

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: 350, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: -MENU_WIDTH, duration: 300, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim]);

  const handleNavigate = (screen: string) => {
    onClose();
    if (onNavigate) setTimeout(() => onNavigate(screen), 300);
  };

  const getInitials = (firstName?: string | null, lastName?: string | null) => {
    return ((firstName?.[0] || '') + (lastName?.[0] || '')).toUpperCase() || 'DR';
  };

  const photoUrl = getFullImageUrl(profile?.profile_photo);
  const fullName = formatFullName(profile?.title, profile?.first_name, profile?.last_name);
  const isLoading = profileLoading || educationsLoading || experiencesLoading || certificatesLoading || languagesLoading;
  const menuHeight = SCREEN_HEIGHT - insets.top - insets.bottom;

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      {/* Blur Background */}
      <Animated.View style={[styles.backgroundContainer, { opacity: fadeAnim }]}>
        <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
        <TouchableOpacity style={styles.backdropTouch} onPress={onClose} activeOpacity={1} />
      </Animated.View>

      {/* CV Preview Panel */}
      <Animated.View style={[
        styles.menu, 
        { 
          width: MENU_WIDTH, 
          marginTop: insets.top,
          height: menuHeight,
          transform: [{ translateX: slideAnim }] 
        }
      ]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.previewBadge}>
              <Ionicons name="eye" size={14} color="#fff" />
            </View>
            <Typography variant="bodySemibold" style={styles.headerTitle}>CV Önizleme</Typography>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={[styles.contentContainer, { paddingBottom: insets.bottom + spacing.xl }]} showsVerticalScrollIndicator={false}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary[600]} />
              <Typography variant="caption" style={styles.loadingText}>Profil yükleniyor...</Typography>
            </View>
          ) : (
            <>
              {/* Profil Kartı */}
              <View style={[styles.cvSection, { backgroundColor: THEMES.personal.bg }]}>
                <View style={styles.profileHeader}>
                  {photoUrl ? (
                    <Image source={{ uri: photoUrl }} style={styles.avatar} />
                  ) : (
                    <View style={[styles.avatarPlaceholder, { backgroundColor: THEMES.personal.light }]}>
                      <Typography variant="h2" style={{ fontSize: 22, fontWeight: '700', color: THEMES.personal.icon }}>{getInitials(profile?.first_name, profile?.last_name)}</Typography>
                    </View>
                  )}
                  <View style={styles.profileInfo}>
                    <Typography variant="h3" style={styles.fullName} numberOfLines={2}>{fullName}</Typography>
                  </View>
                </View>

                {/* Uzmanlık ve İletişim Bilgileri */}
                {(profile?.specialty_name || profile?.subspecialty_name || profile?.phone || profile?.dob || profile?.birth_place_name || profile?.residence_city_name) ? (
                  <View style={styles.contactGrid}>
                    {profile?.specialty_name && (
                      <View style={styles.contactItem}>
                        <View style={[styles.contactIcon, { backgroundColor: THEMES.personal.light }]}>
                          <Ionicons name="medical" size={14} color={THEMES.personal.icon} />
                        </View>
                        <View style={styles.contactInfo}>
                          <Typography variant="caption" style={styles.contactLabel}>Uzmanlık</Typography>
                          <Typography variant="caption" style={styles.contactValue}>{profile.specialty_name}</Typography>
                        </View>
                      </View>
                    )}
                    {profile?.subspecialty_name && (
                      <View style={styles.contactItem}>
                        <View style={[styles.contactIcon, { backgroundColor: THEMES.language.light }]}>
                          <Ionicons name="git-branch" size={14} color={THEMES.language.icon} />
                        </View>
                        <View style={styles.contactInfo}>
                          <Typography variant="caption" style={styles.contactLabel}>Yan Dal</Typography>
                          <Typography variant="caption" style={styles.contactValue}>{profile.subspecialty_name}</Typography>
                        </View>
                      </View>
                    )}
                    {profile?.phone && (
                      <View style={styles.contactItem}>
                        <View style={[styles.contactIcon, { backgroundColor: THEMES.personal.light }]}>
                          <Ionicons name="call" size={14} color={THEMES.personal.icon} />
                        </View>
                        <View style={styles.contactInfo}>
                          <Typography variant="caption" style={styles.contactLabel}>Telefon</Typography>
                          <Typography variant="caption" style={styles.contactValue}>{profile.phone}</Typography>
                        </View>
                      </View>
                    )}
                    {profile?.dob && (
                      <View style={styles.contactItem}>
                        <View style={[styles.contactIcon, { backgroundColor: THEMES.personal.light }]}>
                          <Ionicons name="calendar" size={14} color={THEMES.personal.icon} />
                        </View>
                        <View style={styles.contactInfo}>
                          <Typography variant="caption" style={styles.contactLabel}>Doğum Tarihi</Typography>
                          <Typography variant="caption" style={styles.contactValue}>{new Date(profile.dob).toLocaleDateString('tr-TR')}</Typography>
                        </View>
                      </View>
                    )}
                    {profile?.birth_place_name && (
                      <View style={styles.contactItem}>
                        <View style={[styles.contactIcon, { backgroundColor: THEMES.personal.light }]}>
                          <Ionicons name="flag" size={14} color={THEMES.personal.icon} />
                        </View>
                        <View style={styles.contactInfo}>
                          <Typography variant="caption" style={styles.contactLabel}>Doğum Yeri</Typography>
                          <Typography variant="caption" style={styles.contactValue}>{profile.birth_place_name}</Typography>
                        </View>
                      </View>
                    )}
                    {profile?.residence_city_name && (
                      <View style={styles.contactItem}>
                        <View style={[styles.contactIcon, { backgroundColor: THEMES.personal.light }]}>
                          <Ionicons name="location" size={14} color={THEMES.personal.icon} />
                        </View>
                        <View style={styles.contactInfo}>
                          <Typography variant="caption" style={styles.contactLabel}>İkamet</Typography>
                          <Typography variant="caption" style={styles.contactValue}>{profile.residence_city_name}</Typography>
                        </View>
                      </View>
                    )}
                  </View>
                ) : (
                  <TouchableOpacity style={styles.emptyItem} onPress={() => handleNavigate('ProfileEdit')} activeOpacity={0.7}>
                    <Ionicons name="add-circle-outline" size={20} color={THEMES.personal.icon} />
                    <Typography variant="caption" style={{ fontSize: 12, fontWeight: '500', color: THEMES.personal.text }}>Kişisel bilgileri tamamla</Typography>
                  </TouchableOpacity>
                )}
              </View>

              {/* Eğitim Bölümü - Yeşil */}
              <View style={[styles.cvSection, { backgroundColor: THEMES.education.bg }]}>
                <TouchableOpacity style={styles.sectionHeader} onPress={() => handleNavigate('Education')} activeOpacity={0.7}>
                  <View style={[styles.sectionIconBox, { backgroundColor: THEMES.education.light }]}>
                    <Ionicons name="school" size={18} color={THEMES.education.icon} />
                  </View>
                  <Typography variant="bodySemibold" style={{ flex: 1, fontSize: 14, fontWeight: '600', color: THEMES.education.text }}>Eğitim</Typography>
                  <View style={[styles.countBadge, { backgroundColor: THEMES.education.light }]}>
                    <Typography variant="caption" style={{ fontSize: 11, fontWeight: '700', color: THEMES.education.icon }}>{educations.length}</Typography>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={THEMES.education.icon} />
                </TouchableOpacity>
                {educations.length > 0 ? (
                  educations.slice(0, 3).map((edu, idx) => (
                    <View key={idx} style={[styles.cvItem, { borderLeftColor: THEMES.education.icon }]}>
                      <View style={styles.cvItemHeader}>
                        <Typography variant="body" style={styles.cvItemTitle} numberOfLines={1}>{edu.education_institution}</Typography>
                        {edu.graduation_year && (
                          <View style={[styles.yearBadge, { backgroundColor: THEMES.education.light }]}>
                            <Typography variant="caption" style={{ fontSize: 10, fontWeight: '600', color: THEMES.education.icon }}>{edu.graduation_year}</Typography>
                          </View>
                        )}
                      </View>
                      {edu.field && <Typography variant="caption" style={styles.cvItemSubtitle}>{edu.field}</Typography>}
                      {edu.education_type_name && <Typography variant="caption" style={styles.cvItemMeta}>{edu.education_type_name}</Typography>}
                    </View>
                  ))
                ) : (
                  <TouchableOpacity style={styles.emptyItem} onPress={() => handleNavigate('Education')} activeOpacity={0.7}>
                    <Ionicons name="add-circle-outline" size={20} color={THEMES.education.icon} />
                    <Typography variant="caption" style={{ fontSize: 12, fontWeight: '500', color: THEMES.education.text }}>Eğitim bilgisi ekle</Typography>
                  </TouchableOpacity>
                )}
              </View>

              {/* Deneyim Bölümü - Mavi */}
              <View style={[styles.cvSection, { backgroundColor: THEMES.experience.bg }]}>
                <TouchableOpacity style={styles.sectionHeader} onPress={() => handleNavigate('Experience')} activeOpacity={0.7}>
                  <View style={[styles.sectionIconBox, { backgroundColor: THEMES.experience.light }]}>
                    <Ionicons name="briefcase" size={18} color={THEMES.experience.icon} />
                  </View>
                  <Typography variant="bodySemibold" style={{ flex: 1, fontSize: 14, fontWeight: '600', color: THEMES.experience.text }}>Deneyim</Typography>
                  <View style={[styles.countBadge, { backgroundColor: THEMES.experience.light }]}>
                    <Typography variant="caption" style={{ fontSize: 11, fontWeight: '700', color: THEMES.experience.icon }}>{experiences.length}</Typography>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={THEMES.experience.icon} />
                </TouchableOpacity>
                {experiences.length > 0 ? (
                  experiences.slice(0, 3).map((exp, idx) => (
                    <View key={idx} style={[styles.cvItem, { borderLeftColor: THEMES.experience.icon }]}>
                      <View style={styles.cvItemHeader}>
                        <Typography variant="body" style={styles.cvItemTitle} numberOfLines={1}>{exp.organization}</Typography>
                        <View style={[styles.yearBadge, { backgroundColor: THEMES.experience.light }]}>
                          <Typography variant="caption" style={{ fontSize: 10, fontWeight: '600', color: THEMES.experience.icon }}>
                            {exp.start_date ? new Date(exp.start_date).getFullYear() : ''}{exp.is_current ? ' - Devam' : exp.end_date ? ` - ${new Date(exp.end_date).getFullYear()}` : ''}
                          </Typography>
                        </View>
                      </View>
                      {exp.specialty_name && <Typography variant="caption" style={styles.cvItemSubtitle}>{exp.specialty_name}</Typography>}
                      {exp.description && <Typography variant="caption" style={styles.cvItemMeta} numberOfLines={2}>{exp.description}</Typography>}
                    </View>
                  ))
                ) : (
                  <TouchableOpacity style={styles.emptyItem} onPress={() => handleNavigate('Experience')} activeOpacity={0.7}>
                    <Ionicons name="add-circle-outline" size={20} color={THEMES.experience.icon} />
                    <Typography variant="caption" style={{ fontSize: 12, fontWeight: '500', color: THEMES.experience.text }}>Deneyim bilgisi ekle</Typography>
                  </TouchableOpacity>
                )}
              </View>

              {/* Sertifikalar Bölümü - Turuncu */}
              <View style={[styles.cvSection, { backgroundColor: THEMES.certificate.bg }]}>
                <TouchableOpacity style={styles.sectionHeader} onPress={() => handleNavigate('Certificates')} activeOpacity={0.7}>
                  <View style={[styles.sectionIconBox, { backgroundColor: THEMES.certificate.light }]}>
                    <Ionicons name="ribbon" size={18} color={THEMES.certificate.icon} />
                  </View>
                  <Typography variant="bodySemibold" style={{ flex: 1, fontSize: 14, fontWeight: '600', color: THEMES.certificate.text }}>Sertifikalar</Typography>
                  <View style={[styles.countBadge, { backgroundColor: THEMES.certificate.light }]}>
                    <Typography variant="caption" style={{ fontSize: 11, fontWeight: '700', color: THEMES.certificate.icon }}>{certificates.length}</Typography>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={THEMES.certificate.icon} />
                </TouchableOpacity>
                {certificates.length > 0 ? (
                  certificates.slice(0, 3).map((cert, idx) => (
                    <View key={idx} style={[styles.cvItem, { borderLeftColor: THEMES.certificate.icon }]}>
                      <View style={styles.cvItemHeader}>
                        <Typography variant="body" style={styles.cvItemTitle} numberOfLines={1}>{cert.certificate_name}</Typography>
                        {cert.certificate_year && (
                          <View style={[styles.yearBadge, { backgroundColor: THEMES.certificate.light }]}>
                            <Typography variant="caption" style={{ fontSize: 10, fontWeight: '600', color: THEMES.certificate.icon }}>{cert.certificate_year}</Typography>
                          </View>
                        )}
                      </View>
                      {cert.institution && <Typography variant="caption" style={styles.cvItemSubtitle}>{cert.institution}</Typography>}
                    </View>
                  ))
                ) : (
                  <TouchableOpacity style={styles.emptyItem} onPress={() => handleNavigate('Certificates')} activeOpacity={0.7}>
                    <Ionicons name="add-circle-outline" size={20} color={THEMES.certificate.icon} />
                    <Typography variant="caption" style={{ fontSize: 12, fontWeight: '500', color: THEMES.certificate.text }}>Sertifika ekle</Typography>
                  </TouchableOpacity>
                )}
              </View>

              {/* Diller Bölümü - Mor */}
              <View style={[styles.cvSection, { backgroundColor: THEMES.language.bg }]}>
                <TouchableOpacity style={styles.sectionHeader} onPress={() => handleNavigate('Languages')} activeOpacity={0.7}>
                  <View style={[styles.sectionIconBox, { backgroundColor: THEMES.language.light }]}>
                    <Ionicons name="language" size={18} color={THEMES.language.icon} />
                  </View>
                  <Typography variant="bodySemibold" style={{ flex: 1, fontSize: 14, fontWeight: '600', color: THEMES.language.text }}>Yabancı Diller</Typography>
                  <View style={[styles.countBadge, { backgroundColor: THEMES.language.light }]}>
                    <Typography variant="caption" style={{ fontSize: 11, fontWeight: '700', color: THEMES.language.icon }}>{languages.length}</Typography>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={THEMES.language.icon} />
                </TouchableOpacity>
                {languages.length > 0 ? (
                  languages.map((lang, idx) => (
                    <View key={idx} style={[styles.cvItem, { borderLeftColor: THEMES.language.icon }]}>
                      <View style={styles.cvItemHeader}>
                        <Typography variant="body" style={styles.cvItemTitle} numberOfLines={1}>{lang.language}</Typography>
                        <View style={[styles.yearBadge, { backgroundColor: THEMES.language.light }]}>
                          <Typography variant="caption" style={{ fontSize: 10, fontWeight: '600', color: THEMES.language.icon }}>{lang.level}</Typography>
                        </View>
                      </View>
                    </View>
                  ))
                ) : (
                  <TouchableOpacity style={styles.emptyItem} onPress={() => handleNavigate('Languages')} activeOpacity={0.7}>
                    <Ionicons name="add-circle-outline" size={20} color={THEMES.language.icon} />
                    <Typography variant="caption" style={{ fontSize: 12, fontWeight: '500', color: THEMES.language.text }}>Dil bilgisi ekle</Typography>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
};


const styles = StyleSheet.create({
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropTouch: {
    flex: 1,
  },
  menu: {
    position: 'absolute',
    left: 0,
    top: 0,
    backgroundColor: '#F8FAFC',
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  previewBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: colors.text.primary,
    fontSize: 16,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.md,
    gap: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    gap: spacing.md,
  },
  loadingText: {
    color: colors.text.secondary,
  },

  // CV Section Styles
  cvSection: {
    borderRadius: 16,
    padding: spacing.md,
    overflow: 'hidden',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  profileInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  fullName: {
    color: colors.text.primary,
    fontSize: 16,
    marginBottom: 4,
  },

  // Contact Grid
  contactGrid: {
    gap: spacing.xs,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  contactIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 8,
  },
  contactLabel: {
    color: colors.text.tertiary,
    fontSize: 11,
  },
  contactValue: {
    color: colors.text.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  sectionIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },

  // CV Item Styles
  cvItem: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 10,
    padding: spacing.sm,
    marginBottom: spacing.xs,
    borderLeftWidth: 3,
  },
  cvItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  cvItemTitle: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  yearBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cvItemSubtitle: {
    color: colors.text.secondary,
    fontSize: 11,
    marginTop: 2,
  },
  cvItemMeta: {
    color: colors.text.tertiary,
    fontSize: 10,
    marginTop: 2,
  },
  emptyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 10,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    borderStyle: 'dashed',
  },
});
