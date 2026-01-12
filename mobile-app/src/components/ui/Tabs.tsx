/**
 * @file Tabs.tsx
 * @description Tab (sekme) bileşeni
 * 
 * Özellikler:
 * - İki varyant (default, pills)
 * - Rozet desteği
 * - Aktif sekme göstergesi
 * - Yatay kaydırma (pills için)
 * - Modern tasarım
 * 
 * Kullanım:
 * ```tsx
 * <Tabs
 *   tabs={[
 *     { key: 'all', label: 'Tümü', badge: 5 },
 *     { key: 'pending', label: 'Bekleyen' }
 *   ]}
 *   activeTab={activeTab}
 *   onTabChange={setActiveTab}
 *   variant="pills"
 * />
 * ```
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing } from '@/theme';
import { Typography } from './Typography';

/**
 * Tab (sekme) interface'i
 */
export interface Tab {
  /** Sekme anahtarı (unique) */
  key: string;
  /** Sekme etiketi */
  label: string;
  /** Rozet sayısı (opsiyonel) */
  badge?: number;
}

/**
 * Tabs bileşeni props interface'i
 */
export interface TabsProps {
  /** Sekme listesi */
  tabs: Tab[];
  /** Aktif sekme anahtarı */
  activeTab: string;
  /** Sekme değiştiğinde çağrılır */
  onTabChange: (key: string) => void;
  /** Tab varyantı */
  variant?: 'default' | 'pills';
}

/**
 * Tabs Bileşeni
 * Sekme navigasyonu
 */
export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  variant = 'default',
}) => {
  // Pills varyantı (yuvarlak, kaydırılabilir)
  if (variant === 'pills') {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillsContainer}
      >
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.pill, isActive && styles.pillActive]}
              onPress={() => onTabChange(tab.key)}
              activeOpacity={0.7}
            >
              <Typography
                variant="body"
                style={isActive ? styles.pillTextActive : styles.pillText}
              >
                {tab.label}
              </Typography>
              {tab.badge !== undefined && tab.badge > 0 && (
                <View style={styles.badge}>
                  <Typography variant="caption" style={styles.badgeText}>
                    {tab.badge}
                  </Typography>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  }

  // Default varyantı (alt çizgili)
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => onTabChange(tab.key)}
            activeOpacity={0.7}
          >
            <Typography
              variant="body"
              style={isActive ? styles.tabTextActive : styles.tabText}
            >
              {tab.label}
            </Typography>
            {tab.badge !== undefined && tab.badge > 0 && (
              <View style={styles.badge}>
                <Typography variant="caption" style={styles.badgeText}>
                  {tab.badge}
                </Typography>
              </View>
            )}
            {isActive && <View style={styles.indicator} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    // Modern: Border kaldırıldı
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    position: 'relative',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  tabTextActive: {
    color: colors.primary[600],
    fontWeight: '700',
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.primary[600],
  },
  pillsContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: 24, // Modern: Daha yuvarlak
    backgroundColor: colors.neutral[100],
  },
  pillActive: {
    backgroundColor: colors.primary[600],
  },
  pillText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  pillTextActive: {
    color: colors.background.primary,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.error[600],
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: colors.background.primary,
    fontSize: 11,
    fontWeight: '700',
  },
});
