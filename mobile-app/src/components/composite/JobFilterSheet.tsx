/**
 * @file JobFilterSheet.tsx
 * @description Modern iş ilanı filtreleme bottom sheet bileşeni
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { lookupService } from '@/api/services/lookup.service';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { colors, spacing, borderRadius } from '@/theme';
import { Ionicons } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface JobFilters {
  specialtyId?: number;
  cityId?: number;
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
  { value: 'Tam Zamanlı', label: 'Tam Zamanlı' },
  { value: 'Yarı Zamanlı', label: 'Yarı Zamanlı' },
  { value: 'Sözleşmeli', label: 'Sözleşmeli' },
  { value: 'Nöbet', label: 'Nöbet' },
];

export const JobFilterSheet: React.FC<JobFilterSheetProps> = ({
  visible,
  onClose,
  filters,
  onApply,
  onReset,
}) => {
  // Local state for draft filters
  const [draftFilters, setDraftFilters] = useState<JobFilters>(filters);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Lookup data
  const { data: specialties = [], isLoading: isLoadingSpecialties } = useQuery({
    queryKey: ['lookup', 'specialties'],
    queryFn: lookupService.getSpecialties,
    staleTime: 1000 * 60 * 30, // 30 dakika cache
    gcTime: 1000 * 60 * 60, // 1 saat garbage collection
  });

  const { data: cities = [], isLoading: isLoadingCities } = useQuery({
    queryKey: ['lookup', 'cities'],
    queryFn: lookupService.getCities,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60, // 1 saat garbage collection
  });

  // Sync draft with props when sheet opens
  useEffect(() => {
    if (visible) {
      setDraftFilters(filters);
    }
  }, [visible, filters]);

  const handleApply = useCallback(() => {
    onApply(draftFilters);
    onClose();
  }, [draftFilters, onApply, onClose]);

  const handleReset = useCallback(() => {
    setDraftFilters({});
    onReset();
    onClose();
  }, [onReset, onClose]);

  const toggleSection = useCallback((section: string) => {
    setExpandedSection((prev) => (prev === section ? null : section));
  }, []);

  // Get display names for selected values
  const selectedSpecialtyName = useMemo(() => {
    if (!draftFilters.specialtyId) return null;
    return specialties.find((s) => s.id === draftFilters.specialtyId)?.name;
  }, [draftFilters.specialtyId, specialties]);

  const selectedCityName = useMemo(() => {
    if (!draftFilters.cityId) return null;
    return cities.find((c) => c.id === draftFilters.cityId)?.name;
  }, [draftFilters.cityId, cities]);

  const activeFilterCount = useMemo(() => {
    return [draftFilters.specialtyId, draftFilters.cityId, draftFilters.employmentType].filter(
      Boolean
    ).length;
  }, [draftFilters]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Typography variant="h3" style={styles.title}>
                Filtrele
              </Typography>
              {activeFilterCount > 0 && (
                <View style={styles.badge}>
                  <Typography variant="caption" style={styles.badgeText}>
                    {activeFilterCount}
                  </Typography>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Branş Filtresi */}
            <FilterSection
              title="Branş"
              icon={<Ionicons name="briefcase" size={20} color={colors.primary[600]} />}
              selectedValue={selectedSpecialtyName}
              expanded={expandedSection === 'specialty'}
              onToggle={() => toggleSection('specialty')}
              onClear={() =>
                setDraftFilters((prev) => ({ ...prev, specialtyId: undefined }))
              }
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
                  style={styles.optionListScroll}
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={true}
                >
                  {specialties.map((specialty) => (
                    <TouchableOpacity
                      key={specialty.id}
                      style={[
                        styles.optionItem,
                        draftFilters.specialtyId === specialty.id &&
                          styles.optionItemSelected,
                      ]}
                      onPress={() =>
                        setDraftFilters((prev) => ({
                          ...prev,
                          specialtyId:
                            prev.specialtyId === specialty.id
                              ? undefined
                              : specialty.id,
                        }))
                      }
                    >
                      <Typography
                        variant="body"
                        style={{
                          ...styles.optionText,
                          ...(draftFilters.specialtyId === specialty.id &&
                            styles.optionTextSelected),
                        }}
                      >
                        {specialty.name}
                      </Typography>
                      {draftFilters.specialtyId === specialty.id && (
                        <Ionicons name="checkmark" size={18} color={colors.primary[600]} />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </FilterSection>

            <Divider spacing="sm" />

            {/* Şehir Filtresi */}
            <FilterSection
              title="Şehir"
              icon={<Ionicons name="location" size={20} color={colors.primary[600]} />}
              selectedValue={selectedCityName}
              expanded={expandedSection === 'city'}
              onToggle={() => toggleSection('city')}
              onClear={() =>
                setDraftFilters((prev) => ({ ...prev, cityId: undefined }))
              }
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
                  style={styles.optionListScroll}
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={true}
                >
                  {cities.map((city) => (
                    <TouchableOpacity
                      key={city.id}
                      style={[
                        styles.optionItem,
                        draftFilters.cityId === city.id &&
                          styles.optionItemSelected,
                      ]}
                      onPress={() =>
                        setDraftFilters((prev) => ({
                          ...prev,
                          cityId:
                            prev.cityId === city.id ? undefined : city.id,
                        }))
                      }
                    >
                      <Typography
                        variant="body"
                        style={{
                          ...styles.optionText,
                          ...(draftFilters.cityId === city.id &&
                            styles.optionTextSelected),
                        }}
                      >
                        {city.name}
                      </Typography>
                      {draftFilters.cityId === city.id && (
                        <Ionicons name="checkmark" size={18} color={colors.primary[600]} />
                      )}
                    </TouchableOpacity>
                  ))}
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
              onClear={() =>
                setDraftFilters((prev) => ({ ...prev, employmentType: undefined }))
              }
            >
              <View style={styles.chipContainer}>
                {WORK_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.chip,
                      draftFilters.employmentType === type.value &&
                        styles.chipSelected,
                    ]}
                    onPress={() =>
                      setDraftFilters((prev) => ({
                        ...prev,
                        employmentType:
                          prev.employmentType === type.value ? undefined : type.value,
                      }))
                    }
                  >
                    <Typography
                      variant="body"
                      style={{
                        ...styles.chipText,
                        ...(draftFilters.employmentType === type.value &&
                          styles.chipTextSelected),
                      }}
                    >
                      {type.label}
                    </Typography>
                  </TouchableOpacity>
                ))}
              </View>
            </FilterSection>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <Button
              label="Temizle"
              variant="outline"
              onPress={handleReset}
              style={styles.footerButton}
            />
            <Button
              label="Uygula"
              variant="primary"
              onPress={handleApply}
              style={styles.footerButton}
            />
          </View>
        </View>
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
    <TouchableOpacity style={styles.sectionHeader} onPress={onToggle}>
      <View style={styles.sectionLeft}>
        <View style={styles.sectionIcon}>{icon}</View>
        <View>
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
          >
            <Ionicons name="close" size={16} color={colors.error[600]} />
          </TouchableOpacity>
        )}
        <Ionicons
          name="chevron-down"
          size={20}
          color={colors.text.secondary}
          style={[
            styles.chevron,
            expanded && styles.chevronExpanded,
          ]}
        />
      </View>
    </TouchableOpacity>
    {expanded && <View style={styles.sectionContent}>{children}</View>}
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.85,
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
    gap: spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  badge: {
    backgroundColor: colors.primary[600],
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    color: colors.background.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  closeButton: {
    padding: spacing.xs,
  },
  content: {
    paddingHorizontal: spacing.lg,
  },
  section: {
    paddingVertical: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  sectionTitle: {
    fontWeight: '600',
    color: colors.text.primary,
  },
  sectionValue: {
    color: colors.primary[600],
    marginTop: 2,
  },
  sectionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  clearButton: {
    padding: spacing.xs,
  },
  chevron: {
    transform: [{ rotate: '0deg' }],
  },
  chevronExpanded: {
    transform: [{ rotate: '180deg' }],
  },
  sectionContent: {
    marginTop: spacing.md,
    marginLeft: 52,
  },
  optionList: {
    maxHeight: 200,
  },
  optionListScroll: {
    maxHeight: 200,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  optionItemSelected: {
    backgroundColor: colors.primary[50],
  },
  optionText: {
    color: colors.text.primary,
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
  },
  footerButton: {
    flex: 1,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  loadingText: {
    color: colors.text.secondary,
  },
  emptyText: {
    color: colors.text.secondary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
});
