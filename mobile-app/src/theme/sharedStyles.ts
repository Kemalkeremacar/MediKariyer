/**
 * @file sharedStyles.ts
 * @description Paylaşılan stiller - Tekrar eden StyleSheet tanımlarını merkezi bir yerde toplar
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 * 
 * **Özellikler:**
 * - TD-014: Duplicate StyleSheet tanımlarını merkezi bir yere toplar
 * - List ekranları için ortak stiller (Jobs, Applications, Notifications)
 * - Modal ekranları için ortak stiller
 * - Form ekranları için ortak stiller
 * - Card bileşenleri için ortak stiller
 */

import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { spacing } from './spacing';

// ============================================================================
// LIST STYLES - Liste ekranları için ortak stiller
// ============================================================================

/**
 * List ekranları için ortak stiller
 * 
 * **Kullanım:**
 * ```tsx
 * import { listStyles } from '@/theme/sharedStyles';
 * 
 * <View style={listStyles.emptyState}>
 *   <Text style={listStyles.emptyTitle}>Henüz başvuru yok</Text>
 * </View>
 * ```
 */
export const listStyles = StyleSheet.create({
  // Empty State - Boş liste durumu
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing['4xl'],
  },
  emptyIcon: {
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    marginBottom: spacing.sm,
    textAlign: 'center',
    color: colors.text.primary,
  },
  emptyText: {
    color: colors.text.secondary,
    textAlign: 'center',
    fontSize: 14,
    marginBottom: spacing.lg,
  },
  emptyButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.primary[600],
    borderRadius: 24,
  },
  emptyButtonText: {
    color: colors.background.primary,
    fontWeight: '600',
  },

  // List Footer - Daha fazla yükle
  listFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  footerText: {
    color: colors.text.secondary,
  },

  // List Content - Liste içerik padding
  listContent: {
    paddingBottom: spacing['4xl'],
  },

  // Search Container - Arama çubuğu container
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.background.primary,
  },
  searchBar: {
    flex: 1,
  },

  // Filter Button - Filtre butonu
  filterButtonWrapper: {
    position: 'relative',
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  filterButtonActive: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  filterBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.error[600],
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: colors.background.primary,
  },
  filterBadgeText: {
    color: colors.background.primary,
    fontSize: 11,
    fontWeight: '700',
  },

  // Skeleton Loading - Yükleme iskelet animasyonu
  skeletonContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
});

// ============================================================================
// MODAL STYLES - Modal ekranları için ortak stiller
// ============================================================================

/**
 * Modal ekranları için ortak stiller
 * 
 * **Kullanım:**
 * ```tsx
 * import { modalStyles } from '@/theme/sharedStyles';
 * 
 * <View style={modalStyles.container}>
 *   <View style={modalStyles.header}>
 *     <Text style={modalStyles.headerTitle}>Başlık</Text>
 *   </View>
 * </View>
 * ```
 */
export const modalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  header: {
    marginBottom: spacing.lg,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.neutral[100],
    marginVertical: spacing.md,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  loaderText: {
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
});

// ============================================================================
// FORM STYLES - Form ekranları için ortak stiller
// ============================================================================

/**
 * Form ekranları için ortak stiller
 * 
 * **Kullanım:**
 * ```tsx
 * import { formStyles } from '@/theme/sharedStyles';
 * 
 * <View style={formStyles.container}>
 *   <View style={formStyles.section}>
 *     <Text style={formStyles.sectionTitle}>Bölüm Başlığı</Text>
 *   </View>
 * </View>
 * ```
 */
export const formStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontWeight: '600',
    color: colors.text.primary,
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ============================================================================
// CARD STYLES - Card bileşenleri için ortak stiller
// ============================================================================

/**
 * Card bileşenleri için ortak stiller
 * 
 * **Kullanım:**
 * ```tsx
 * import { cardStyles } from '@/theme/sharedStyles';
 * 
 * <View style={cardStyles.elevated}>
 *   <Text>Card içeriği</Text>
 * </View>
 * ```
 */
export const cardStyles = StyleSheet.create({
  /** Gölgeli card - Yükseltilmiş görünüm */
  elevated: {
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  /** Çerçeveli card - Border ile ayrılmış */
  outlined: {
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
});
