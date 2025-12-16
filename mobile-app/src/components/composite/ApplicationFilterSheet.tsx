/**
 * @file ApplicationFilterSheet.tsx
 * @description Modern başvuru filtreleme bottom sheet bileşeni
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
  Pressable,
} from 'react-native';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { colors, spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface ApplicationFilters {
  status?: string;
  // Gelecekte eklenebilecek filtreler:
  // dateFrom?: string;
  // dateTo?: string;
  // hospitalId?: number;
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
    bgColor: colors.warning[100],
  },
  {
    value: 'reviewing',
    label: 'İnceleniyor',
    icon: 'eye' as const,
    color: colors.primary[600],
    bgColor: colors.primary[100],
  },
  {
    value: 'approved',
    label: 'Kabul Edildi',
    icon: 'checkmark-circle' as const,
    color: colors.success[600],
    bgColor: colors.success[100],
  },
  {
    value: 'rejected',
    label: 'Red Edildi',
    icon: 'close-circle' as const,
    color: colors.error[600],
    bgColor: colors.error[100],
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
                  { backgroundColor: colors.warning[100] },
                ]}
              >
                <Ionicons name="document-text" size={20} color={colors.warning[600]} />
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
                    <Ionicons name={iconName} size={20} color={option.color} />
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
              size="lg"
              style={styles.clearButton}
            />
            
            <Button
              label="Uygula"
              variant="primary"
              onPress={handleApply}
              size="lg"
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
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.7,
    paddingBottom: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
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
    paddingHorizontal: 24,
    paddingVertical: spacing.md,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 72,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statusCardSelected: {
    borderWidth: 2,
    borderColor: '#60A5FA',
    backgroundColor: '#EFF6FF',
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  statusLabelSelected: {
    color: '#3B82F6',
  },
  statusDescription: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
  },
  checkIcon: {
    marginLeft: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: spacing.lg,
  },
  clearButton: {
    flex: 1,
  },
  applyButton: {
    flex: 1,
  },
});
