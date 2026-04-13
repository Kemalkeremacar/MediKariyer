/**
 * @file CongressFilterSheet.tsx
 * @description Kongre filtreleme bottom sheet
 * @author MediKariyer Development Team
 * @version 1.0.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useQuery } from '@tanstack/react-query';
import { lookupService } from '@/api/services/lookup.service';
import { queryKeys } from '@/api/queryKeys';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { colors, spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';

export interface CongressFilters {
  specialtyIds?: number[];
  city?: string;
  country?: string;
}

interface CongressFilterSheetProps {
  visible: boolean;
  onClose: () => void;
  filters: CongressFilters;
  onApply: (filters: CongressFilters) => void;
  onReset: () => void;
}

export const CongressFilterSheet: React.FC<CongressFilterSheetProps> = ({
  visible,
  onClose,
  filters,
  onApply,
  onReset,
}) => {
  const [draftFilters, setDraftFilters] = useState<CongressFilters>(filters);

  const { data: specialties = [] } = useQuery({
    queryKey: queryKeys.lookup.specialties(),
    queryFn: lookupService.getSpecialties,
    staleTime: 1000 * 60 * 30,
  });

  useEffect(() => {
    if (visible) {
      setDraftFilters(filters);
    }
  }, [visible, filters]);

  const handleApply = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onApply(draftFilters);
    onClose();
  }, [draftFilters, onApply, onClose]);

  const handleReset = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDraftFilters({});
    onReset();
    onClose();
  }, [onReset, onClose]);

  const toggleSpecialty = (id: number) => {
    setDraftFilters((prev) => {
      const current = prev.specialtyIds || [];
      const exists = current.includes(id);
      return {
        ...prev,
        specialtyIds: exists
          ? current.filter((sid) => sid !== id)
          : [...current, id],
      };
    });
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1} 
          onPress={onClose}
        />
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <Typography variant="h2" style={styles.title}>
              Filtreler
            </Typography>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Uzmanlık */}
            <View style={styles.section}>
              <Typography variant="h3" style={styles.sectionTitle}>
                Uzmanlık Alanı
              </Typography>
              <View style={styles.optionsList}>
                {specialties.map((specialty) => (
                  <TouchableOpacity
                    key={specialty.id}
                    style={styles.option}
                    onPress={() => toggleSpecialty(specialty.id)}
                  >
                    <View style={styles.checkbox}>
                      {draftFilters.specialtyIds?.includes(specialty.id) && (
                        <Ionicons name="checkmark" size={16} color={colors.primary[600]} />
                      )}
                    </View>
                    <Typography variant="body" style={styles.optionText}>
                      {specialty.name}
                    </Typography>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Şehir */}
            <View style={styles.section}>
              <Typography variant="h3" style={styles.sectionTitle}>
                Şehir
              </Typography>
              <Input
                placeholder="Şehir adı girin"
                value={draftFilters.city || ''}
                onChangeText={(text) => setDraftFilters((prev) => ({ ...prev, city: text }))}
              />
            </View>

            {/* Ülke */}
            <View style={styles.section}>
              <Typography variant="h3" style={styles.sectionTitle}>
                Ülke
              </Typography>
              <Input
                placeholder="Ülke adı girin"
                value={draftFilters.country || ''}
                onChangeText={(text) => setDraftFilters((prev) => ({ ...prev, country: text }))}
              />
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Button
              label="Sıfırla"
              variant="outline"
              onPress={handleReset}
              style={styles.resetButton}
            />
            <Button
              label="Uygula"
              variant="primary"
              onPress={handleApply}
              style={styles.applyButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  title: {
    flex: 1,
  },
  closeButton: {
    padding: spacing.xs,
  },
  content: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    marginBottom: spacing.md,
  },
  optionsList: {
    gap: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  resetButton: {
    flex: 1,
  },
  applyButton: {
    flex: 1,
  },
});
