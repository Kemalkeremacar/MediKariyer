/**
 * Shared Styles
 * TD-014: Duplicate StyleSheet tanımlarını merkezi bir yere toplar
 * 
 * Bu dosya birden fazla ekranda tekrar eden stil tanımlarını içerir.
 * Özellikle list ekranlarında (Jobs, Applications, Notifications) kullanılır.
 */

import { StyleSheet } from 'react-native';
import { colors } from './colors';
import { spacing } from './spacing';

/**
 * List ekranları için ortak stiller
 * Kullanım: import { listStyles } from '@/theme/sharedStyles';
 */
export const listStyles = StyleSheet.create({
  // Empty State
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

  // List Footer (Load More)
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

  // List Content
  listContent: {
    paddingBottom: spacing['4xl'],
  },

  // Search Container
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

  // Filter Button
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

  // Skeleton Loading
  skeletonContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
});

/**
 * Modal ekranları için ortak stiller
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

/**
 * Form ekranları için ortak stiller
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

/**
 * Card bileşenleri için ortak stiller
 */
export const cardStyles = StyleSheet.create({
  elevated: {
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  outlined: {
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
});
