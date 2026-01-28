/**
 * @file JobFilterSheet.tsx
 * @description Profesyonel iş ilanı filtreleme bottom sheet
 * @author MediKariyer Development Team
 * @version 2.0.0
 * 
 * **ÖZELLİKLER:**
 * - Smooth animasyonlar ve geçişler
 * - Scroll edilebilir seçenek listeleri
 * - Haptic feedback
 * - Optimized performance
 * - Modern UI/UX
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
  Pressable,
  ActivityIndicator,
  TextStyle,
  Animated,
  Keyboard,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useQuery } from '@tanstack/react-query';
import { lookupService } from '@/api/services/lookup.service';
import { queryKeys } from '@/api/queryKeys';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { colors, spacing, borderRadius } from '@/theme';
import { Ionicons } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface JobFilters {
  specialtyIds?: number[];  // Çoklu seçim için array
  cityIds?: number[];  // Çoklu seçim için array
  employmentType?: string;
}

interface JobFilterSheetProps {
  visible: boolean;
  onClose: () => void;
  filters: JobFilters;
  onApply: (filters: JobFilters) => void;
  onReset: () => void;
}

const WORK_TYPES = [
  { value: 'Tam Zamanlı', label: 'Tam Zamanlı', icon: 'time' as const },
  { value: 'Yarı Zamanlı', label: 'Yarı Zamanlı', icon: 'time-outline' as const },
  { value: 'Sözleşmeli', label: 'Sözleşmeli', icon: 'document-text' as const },
  { value: 'Nöbet', label: 'Nöbet', icon: 'moon' as const },
];

export const JobFilterSheet: React.FC<JobFilterSheetProps> = ({
  visible,
  onClose,
  filters,
  onApply,
  onReset,
}) => {
  const [draftFilters, setDraftFilters] = useState<JobFilters>(filters);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  
  // Animasyon değerleri
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  const { data: specialties = [], isLoading: isLoadingSpecialties } = useQuery({
    queryKey: queryKeys.lookup.specialties(),
    queryFn: lookupService.getSpecialties,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
  });

  const { data: cities = [], isLoading: isLoadingCities } = useQuery({
    queryKey: queryKeys.lookup.cities(),
    queryFn: lookupService.getCities,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
  });

  // Açılış animasyonu
  useEffect(() => {
    if (visible) {
      Keyboard.dismiss();
      setDraftFilters(filters);
      // Değerleri sıfırla ve animasyonu başlat
      overlayOpacity.setValue(0);
      sheetTranslateY.setValue(SCREEN_HEIGHT);
      
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(sheetTranslateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, filters, overlayOpacity, sheetTranslateY]);

  const handleApply = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onApply(draftFilters);
    // Animasyonlu kapanış
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  }, [draftFilters, onApply, onClose, overlayOpacity, sheetTranslateY]);

  const handleReset = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDraftFilters({});
    onReset();
    // Animasyonlu kapanış
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  }, [onReset, onClose, overlayOpacity, sheetTranslateY]);

  const toggleSection = useCallback((section: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedSection((prev) => (prev === section ? null : section));
  }, []);

  const selectedSpecialtyNames = useMemo(() => {
    if (!draftFilters.specialtyIds || draftFilters.specialtyIds.length === 0) return null;
    const names = specialties
      .filter((s) => draftFilters.specialtyIds?.includes(s.id))
      .map((s) => s.name);
    return names.length > 0 ? names.join(', ') : null;
  }, [draftFilters.specialtyIds, specialties]);

  const selectedCityNames = useMemo(() => {
    if (!draftFilters.cityIds || draftFilters.cityIds.length === 0) return null;
    const names = cities
      .filter((c) => draftFilters.cityIds?.includes(c.id))
      .map((c) => c.name);
    return names.length > 0 ? names.join(', ') : null;
  }, [draftFilters.cityIds, cities]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (draftFilters.specialtyIds && draftFilters.specialtyIds.length > 0) {
      count += draftFilters.specialtyIds.length;
    }
    if (draftFilters.cityIds && draftFilters.cityIds.length > 0) {
      count += draftFilters.cityIds.length;
    }
    if (draftFilters.employmentType) {
      count += 1;
    }
    return count;
  }, [draftFilters]);

  const handleClose = useCallback(() => {
    // Kapanış animasyonu
    Animated.parallel([
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  }, [overlayOpacity, sheetTranslateY, onClose]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="none"
      transparent
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.container}>
        <Animated.View 
          style={[styles.overlay, { opacity: overlayOpacity }]}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
        </Animated.View>
        <Animated.View 
          style={[
            styles.sheet, 
            { transform: [{ translateY: sheetTranslateY }] }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerIconContainer}>
                <Ionicons name="filter" size={24} color={colors.primary[600]} />
              </View>
              <View>
                <Typography variant="h3" style={styles.title}>
                  Filtrele
                </Typography>
                {activeFilterCount > 0 && (
                  <Typography variant="caption" style={styles.subtitle}>
                    {activeFilterCount} filtre aktif
                  </Typography>
                )}
              </View>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {/* Branş Filtresi */}
            <FilterSection
              title="Branş"
              icon={<Ionicons name="briefcase" size={20} color={colors.primary[600]} />}
              selectedValue={selectedSpecialtyNames}
              expanded={expandedSection === 'specialty'}
              onToggle={() => toggleSection('specialty')}
              onClear={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setDraftFilters((prev) => ({ ...prev, specialtyIds: undefined }));
              }}
            >
              {isLoadingSpecialties ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.primary[600]} />
                  <Typography variant="caption" style={styles.loadingText}>
                    Branşlar yükleniyor...
                  </Typography>
                </View>
              ) : specialties.length === 0 ? (
                <Typography variant="body" style={styles.emptyText}>
                  Branş bulunamadı
                </Typography>
              ) : (
                <ScrollView 
                  style={styles.optionListContainer}
                  nestedScrollEnabled
                  showsVerticalScrollIndicator={true}
                >
                  {specialties.map((specialty) => {
                    const isSelected = draftFilters.specialtyIds?.includes(specialty.id) ?? false;
                    return (
                      <TouchableOpacity
                        key={specialty.id}
                        style={[
                          styles.optionItem,
                          isSelected ? styles.optionItemSelected : undefined,
                        ]}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setDraftFilters((prev) => {
                            const currentIds = prev.specialtyIds || [];
                            const newIds = isSelected
                              ? currentIds.filter((id) => id !== specialty.id)
                              : [...currentIds, specialty.id];
                            return {
                              ...prev,
                              specialtyIds: newIds.length > 0 ? newIds : undefined,
                            };
                          });
                        }}
                      >
                        <Typography
                          variant="body"
                          style={StyleSheet.flatten(isSelected ? [styles.optionText, styles.optionTextSelected] : [styles.optionText]) as TextStyle}
                        >
                          {specialty.name}
                        </Typography>
                        {isSelected && (
                          <Ionicons name="checkmark-circle" size={20} color={colors.primary[600]} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </FilterSection>

            <Divider spacing="sm" />

            {/* Şehir Filtresi */}
            <FilterSection
              title="Şehir"
              icon={<Ionicons name="location" size={20} color={colors.primary[600]} />}
              selectedValue={selectedCityNames}
              expanded={expandedSection === 'city'}
              onToggle={() => toggleSection('city')}
              onClear={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setDraftFilters((prev) => ({ ...prev, cityIds: undefined }));
              }}
            >
              {isLoadingCities ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color={colors.primary[600]} />
                  <Typography variant="caption" style={styles.loadingText}>
                    Şehirler yükleniyor...
                  </Typography>
                </View>
              ) : cities.length === 0 ? (
                <Typography variant="body" style={styles.emptyText}>
                  Şehir bulunamadı
                </Typography>
              ) : (
                <ScrollView 
                  style={styles.optionListContainer}
                  nestedScrollEnabled
                  showsVerticalScrollIndicator={true}
                >
                  {cities.map((city) => {
                    const isSelected = draftFilters.cityIds?.includes(city.id) ?? false;
                    return (
                      <TouchableOpacity
                        key={city.id}
                        style={[
                          styles.optionItem,
                          isSelected ? styles.optionItemSelected : undefined,
                        ]}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setDraftFilters((prev) => {
                            const currentIds = prev.cityIds || [];
                            const newIds = isSelected
                              ? currentIds.filter((id) => id !== city.id)
                              : [...currentIds, city.id];
                            return {
                              ...prev,
                              cityIds: newIds.length > 0 ? newIds : undefined,
                            };
                          });
                        }}
                      >
                        <Typography
                          variant="body"
                          style={StyleSheet.flatten(isSelected ? [styles.optionText, styles.optionTextSelected] : [styles.optionText]) as TextStyle}
                        >
                          {city.name}
                        </Typography>
                        {isSelected && (
                          <Ionicons name="checkmark-circle" size={20} color={colors.primary[600]} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </FilterSection>

            <Divider spacing="sm" />

            {/* Çalışma Tipi Filtresi */}
            <FilterSection
              title="Çalışma Tipi"
              icon={<Ionicons name="business" size={20} color={colors.primary[600]} />}
              selectedValue={draftFilters.employmentType}
              expanded={expandedSection === 'employmentType'}
              onToggle={() => toggleSection('employmentType')}
              onClear={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setDraftFilters((prev) => ({ ...prev, employmentType: undefined }));
              }}
            >
              <View style={styles.chipContainer}>
                {WORK_TYPES.map((type) => {
                  const isSelected = draftFilters.employmentType === type.value;
                  return (
                    <TouchableOpacity
                      key={type.value}
                      style={[
                        styles.chip,
                        isSelected ? styles.chipSelected : undefined,
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setDraftFilters((prev) => ({
                          ...prev,
                          employmentType: prev.employmentType === type.value ? undefined : type.value,
                        }));
                      }}
                    >
                      <Ionicons
                        name={type.icon}
                        size={16}
                        color={isSelected ? colors.primary[600] : colors.text.secondary}
                        style={styles.chipIcon}
                      />
                      <Typography
                        variant="body"
                        style={StyleSheet.flatten(isSelected ? [styles.chipText, styles.chipTextSelected] : [styles.chipText]) as TextStyle}
                      >
                        {type.label}
                      </Typography>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </FilterSection>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Button
              label="Temizle"
              variant="outline"
              onPress={handleReset}
              style={styles.footerButton}
              disabled={activeFilterCount === 0}
            />
            <Button
              label="Uygula"
              variant="primary"
              onPress={handleApply}
              style={styles.footerButton}
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

// Filter Section Component
interface FilterSectionProps {
  title: string;
  icon: React.ReactNode;
  selectedValue?: string | null;
  expanded: boolean;
  onToggle: () => void;
  onClear: () => void;
  children: React.ReactNode;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  title,
  icon,
  selectedValue,
  expanded,
  onToggle,
  onClear,
  children,
}) => (
  <View style={styles.section}>
    <TouchableOpacity style={styles.sectionHeader} onPress={onToggle} activeOpacity={0.7}>
      <View style={styles.sectionLeft}>
        <View style={styles.sectionIcon}>{icon}</View>
        <View style={styles.sectionTextContainer}>
          <Typography variant="body" style={styles.sectionTitle}>
            {title}
          </Typography>
          {selectedValue && (
            <Typography variant="caption" style={styles.sectionValue}>
              {selectedValue}
            </Typography>
          )}
        </View>
      </View>
      <View style={styles.sectionRight}>
        {selectedValue && (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onClear();
            }}
            style={styles.clearButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close-circle" size={18} color={colors.error[500]} />
          </TouchableOpacity>
        )}
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.text.secondary}
        />
      </View>
    </TouchableOpacity>
    {expanded && <View style={styles.sectionContent}>{children}</View>}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: SCREEN_HEIGHT * 0.75,
    maxHeight: SCREEN_HEIGHT * 0.92,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text.primary,
  },
  subtitle: {
    color: colors.text.secondary,
    marginTop: 2,
  },
  closeButton: {
    padding: spacing.xs,
    borderRadius: borderRadius.md,
  },
  content: {
    flex: 1,
    minHeight: SCREEN_HEIGHT * 0.5,
  },
  contentContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  section: {
    paddingVertical: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  sectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTextContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontWeight: '600',
    color: colors.text.primary,
    fontSize: 16,
  },
  sectionValue: {
    color: colors.primary[600],
    marginTop: 2,
    fontSize: 13,
  },
  sectionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  clearButton: {
    padding: spacing.xs,
  },
  sectionContent: {
    marginTop: spacing.md,
    marginLeft: 52,
  },
  optionListContainer: {
    maxHeight: 240,
    flexGrow: 0,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xs,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  optionItemSelected: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[600],
  },
  optionText: {
    color: colors.text.primary,
    fontSize: 15,
    flex: 1,
  },
  optionTextSelected: {
    color: colors.primary[700],
    fontWeight: '600',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  chipSelected: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[600],
  },
  chipIcon: {
    marginRight: spacing.xs,
  },
  chipText: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  chipTextSelected: {
    color: colors.primary[700],
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
    backgroundColor: colors.background.primary,
  },
  footerButton: {
    flex: 1,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xl,
  },
  loadingText: {
    color: colors.text.secondary,
  },
  emptyText: {
    color: colors.text.secondary,
    textAlign: 'center',
    paddingVertical: spacing.xl,
  },
});
