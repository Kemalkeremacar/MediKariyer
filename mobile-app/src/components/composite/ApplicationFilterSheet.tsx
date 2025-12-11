/**
 * @file ApplicationFilterSheet.tsx
 * @description Modern başvuru filtreleme bottom sheet bileşeni
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
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { lookupService } from '@/api/services/lookup.service';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { colors, spacing, borderRadius } from '@/theme';
import { Ionicons } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface ApplicationFilters {
  status?: string;
}

interface ApplicationFilterSheetProps {
  visible: boolean;
  onClose: () => void;
  filters: ApplicationFilters;
  onApply: (filters: ApplicationFilters) => void;
  onReset: () => void;
}

// Status options with icons and colors
const STATUS_OPTIONS = [
  {
    value: 'pending',
    label: 'Başvuruldu',
    icon: 'time' as const,
    color: colors.warning[600],
    bgColor: colors.warning[50],
  },
  {
    value: 'reviewing',
    label: 'İnceleniyor',
    icon: 'eye' as const,
    color: colors.primary[600],
    bgColor: colors.primary[50],
  },
  {
    value: 'approved',
    label: 'Kabul Edildi',
    icon: 'checkmark-circle' as const,
    color: colors.success[600],
    bgColor: colors.success[50],
  },
  {
    value: 'rejected',
    label: 'Red Edildi',
    icon: 'close-circle' as const,
    color: colors.error[600],
    bgColor: colors.error[50],
  },
  {
    value: 'withdrawn',
    label: 'Geri Çekildi',
    icon: 'refresh' as const,
    color: colors.neutral[600],
    bgColor: colors.neutral[100],
  },
];

export const ApplicationFilterSheet: React.FC<ApplicationFilterSheetProps> = ({
  visible,
  onClose,
  filters,
  onApply,
  onReset,
}) => {
  const [draftFilters, setDraftFilters] = useState<ApplicationFilters>(filters);

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

  const handleSelectStatus = useCallback((value: string) => {
    setDraftFilters((prev) => ({
      ...prev,
      status: prev.status === value ? undefined : value,
    }));
  }, []);

  const hasActiveFilter = Boolean(draftFilters.status);

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
                Duruma Göre Filtrele
              </Typography>
              {hasActiveFilter && (
                <View style={styles.badge}>
                  <Typography variant="caption" style={styles.badgeText}>
                    1
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
            {/* All Applications Option */}
            <TouchableOpacity
              style={[
                styles.statusCard,
                !draftFilters.status && styles.statusCardSelected,
              ]}
              onPress={() => setDraftFilters({})}
            >
              <View
                style={[
                  styles.statusIcon,
                  { backgroundColor: colors.neutral[100] },
                ]}
              >
                <Ionicons name="document-text" size={24} color={colors.neutral[600]} />
              </View>
              <View style={styles.statusInfo}>
                <Typography
                  variant="body"
                  style={{
                    ...styles.statusLabel,
                    ...(!draftFilters.status && styles.statusLabelSelected),
                  }}
                >
                  Tüm Başvurular
                </Typography>
                <Typography variant="caption" style={styles.statusDescription}>
                  Tüm durumları göster
                </Typography>
              </View>
              {!draftFilters.status && (
                <View style={styles.checkIcon}>
                  <Ionicons name="checkmark-circle" size={24} color={colors.primary[600]} />
                </View>
              )}
            </TouchableOpacity>

            {/* Status Options */}
            {STATUS_OPTIONS.map((option) => {
              const iconName = option.icon;
              const isSelected = draftFilters.status === option.value;

              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.statusCard,
                    isSelected && styles.statusCardSelected,
                  ]}
                  onPress={() => handleSelectStatus(option.value)}
                >
                  <View
                    style={[
                      styles.statusIcon,
                      { backgroundColor: option.bgColor },
                    ]}
                  >
                    <Ionicons name={iconName} size={24} color={option.color} />
                  </View>
                  <View style={styles.statusInfo}>
                    <Typography
                      variant="body"
                      style={{
                        ...styles.statusLabel,
                        ...(isSelected && styles.statusLabelSelected),
                      }}
                    >
                      {option.label}
                    </Typography>
                  </View>
                  {isSelected && (
                    <View style={styles.checkIcon}>
                      <Ionicons name="checkmark-circle" size={24} color={colors.primary[600]} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
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
    maxHeight: SCREEN_HEIGHT * 0.7,
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
    paddingVertical: spacing.md,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  statusCardSelected: {
    borderColor: colors.primary[600],
    backgroundColor: colors.primary[50],
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  statusLabel: {
    fontWeight: '600',
    color: colors.text.primary,
  },
  statusLabelSelected: {
    color: colors.primary[700],
  },
  statusDescription: {
    color: colors.text.secondary,
    marginTop: 2,
  },
  checkIcon: {
    marginLeft: spacing.sm,
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
});
