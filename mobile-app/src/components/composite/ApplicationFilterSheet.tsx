/**
 * @file ApplicationFilterSheet.tsx
 * @description Modern başvuru filtreleme bottom sheet bileşeni
 * 
 * Özellikler:
 * - Dinamik durum listesi (backend'den çekilir)
 * - ID bazlı filtreleme
 * - Durum ikonları ve renkleri
 * - Aktif filtre rozeti
 * - Temizle ve uygula butonları
 * - Modern tasarım (animasyonlu modal)
 * 
 * Kullanım:
 * ```tsx
 * <ApplicationFilterSheet
 *   visible={isOpen}
 *   onClose={handleClose}
 *   filters={filters}
 *   onApply={handleApply}
 *   onReset={handleReset}
 * />
 * ```
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
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
  ActivityIndicator,
} from 'react-native';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { colors, spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useApplicationStatuses } from '@/hooks/useLookup';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Başvuru filtreleri interface'i
 */
export interface ApplicationFilters {
  /** Durum ID'si */
  status_id?: number;
}

/**
 * ApplicationFilterSheet bileşeni props interface'i
 */
interface ApplicationFilterSheetProps {
  /** Sheet görünür mü? */
  visible: boolean;
  /** Kapatma fonksiyonu */
  onClose: () => void;
  /** Mevcut filtreler */
  filters: ApplicationFilters;
  /** Filtreleri uygula */
  onApply: (filters: ApplicationFilters) => void;
  /** Filtreleri temizle */
  onReset: () => void;
}

/**
 * Status ID'ye göre renk ve ikon haritası
 */
const STATUS_STYLES: Record<number, { icon: keyof typeof Ionicons.glyphMap; color: string; bgColor: string }> = {
  1: { icon: 'time', color: colors.warning[600], bgColor: colors.warning[100] },           // Başvuruldu
  2: { icon: 'eye', color: colors.primary[600], bgColor: colors.primary[100] },            // İnceleniyor
  3: { icon: 'checkmark-circle', color: colors.success[600], bgColor: colors.success[100] }, // Kabul Edildi
  4: { icon: 'close-circle', color: colors.error[600], bgColor: colors.error[100] },       // Reddedildi
  5: { icon: 'arrow-undo', color: colors.neutral[500], bgColor: colors.neutral[100] },     // Geri Çekildi
};

/**
 * Bilinmeyen durumlar için varsayılan stil
 */
const DEFAULT_STYLE = { icon: 'help-circle' as const, color: colors.neutral[500], bgColor: colors.neutral[100] };

/**
 * Başvuru Filtreleme Sheet Bileşeni
 * Bottom sheet modal ile filtreleme
 */
export const ApplicationFilterSheet: React.FC<ApplicationFilterSheetProps> = ({
  visible,
  onClose,
  filters,
  onApply,
  onReset,
}) => {
  const [draftFilters, setDraftFilters] = useState<ApplicationFilters>(filters);
  const { data: statuses = [], isLoading } = useApplicationStatuses();

  // Sheet açıldığında draft'ı props ile senkronize et
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

  const handleSelectStatus = useCallback((statusId: number) => {
    setDraftFilters((prev) => ({
      ...prev,
      status_id: prev.status_id === statusId ? undefined : statusId,
    }));
  }, []);

  const hasActiveFilter = Boolean(draftFilters.status_id);

  /**
   * Status ID için stil döndürür
   */
  const getStatusStyle = (statusId: number) => {
    return STATUS_STYLES[statusId] || DEFAULT_STYLE;
  };

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
          {/* Başlık */}
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
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary[600]} />
                <Typography variant="body" style={styles.loadingText}>
                  Durumlar yükleniyor...
                </Typography>
              </View>
            ) : (
              <>
                {/* Tüm Başvurular Seçeneği */}
                <TouchableOpacity
                  style={[
                    styles.statusCard,
                    !draftFilters.status_id && styles.statusCardSelected,
                  ]}
                  onPress={() => setDraftFilters({})}
                >
                  <View
                    style={[
                      styles.statusIcon,
                      { backgroundColor: colors.primary[100] },
                    ]}
                  >
                    <Ionicons name="documents" size={20} color={colors.primary[600]} />
                  </View>
                  <View style={styles.statusInfo}>
                    <Typography
                      variant="body"
                      style={!draftFilters.status_id 
                        ? { ...styles.statusLabel, ...styles.statusLabelSelected }
                        : styles.statusLabel
                      }
                    >
                      Tüm Başvurular
                    </Typography>
                    <Typography variant="caption" style={styles.statusDescription}>
                      Tüm durumları göster
                    </Typography>
                  </View>
                  {!draftFilters.status_id && (
                    <View style={styles.checkIcon}>
                      <Ionicons name="checkmark-circle" size={24} color={colors.primary[600]} />
                    </View>
                  )}
                </TouchableOpacity>

                {/* Backend'den Gelen Dinamik Durum Seçenekleri */}
                {statuses.map((status) => {
                  const style = getStatusStyle(status.id);
                  const isSelected = draftFilters.status_id === status.id;

                  return (
                    <TouchableOpacity
                      key={status.id}
                      style={[
                        styles.statusCard,
                        isSelected && styles.statusCardSelected,
                      ]}
                      onPress={() => handleSelectStatus(status.id)}
                    >
                      <View
                        style={[
                          styles.statusIcon,
                          { backgroundColor: style.bgColor },
                        ]}
                      >
                        <Ionicons name={style.icon} size={20} color={style.color} />
                      </View>
                      <View style={styles.statusInfo}>
                        <Typography
                          variant="body"
                          style={isSelected 
                            ? { ...styles.statusLabel, ...styles.statusLabelSelected }
                            : styles.statusLabel
                          }
                        >
                          {status.name}
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
              </>
            )}
          </ScrollView>

          {/* Alt Butonlar */}
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
  loadingContainer: {
    padding: spacing['3xl'],
    alignItems: 'center',
    gap: spacing.md,
  },
  loadingText: {
    color: colors.text.secondary,
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
