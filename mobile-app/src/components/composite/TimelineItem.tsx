/**
 * @file TimelineItem.tsx
 * @description Zaman çizelgesi öğesi bileşeni
 * 
 * Bu bileşen kronolojik olayları görsel bir zaman çizelgesinde gösterir.
 * Eğitim geçmişi, iş deneyimi gibi zaman bazlı verilerde kullanılır.
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/theme';

/**
 * TimelineItem bileşeni için prop tipleri
 * 
 * @interface TimelineItemProps
 * @property {string} title - Olay başlığı (örn: "Tıp Fakültesi")
 * @property {string} [subtitle] - Alt başlık (örn: "İstanbul Üniversitesi")
 * @property {string} date - Tarih bilgisi (örn: "2015 - 2021")
 * @property {string} [description] - Detaylı açıklama (opsiyonel)
 * @property {React.ReactNode} [icon] - Nokta içinde gösterilecek ikon (opsiyonel)
 * @property {boolean} [isLast] - Son öğe mi? (çizgi gösterilmez)
 * @property {'completed' | 'current' | 'upcoming'} [status] - Durum (renk belirler)
 */
export interface TimelineItemProps {
  title: string;
  subtitle?: string;
  date: string;
  description?: string;
  icon?: React.ReactNode;
  isLast?: boolean;
  status?: 'completed' | 'current' | 'upcoming';
}

/**
 * Zaman çizelgesi öğesi bileşeni
 * 
 * **Özellikler:**
 * - Dikey zaman çizelgesi çizgisi
 * - Durum bazlı renkli nokta
 * - İkon desteği (nokta içinde)
 * - Başlık, alt başlık ve tarih
 * - Detaylı açıklama (opsiyonel)
 * 
 * **Kullanım:**
 * ```tsx
 * <TimelineItem
 *   title="Tıp Fakültesi"
 *   subtitle="İstanbul Üniversitesi"
 *   date="2015 - 2021"
 *   description="Tıp eğitimi aldım"
 *   status="completed"
 *   isLast={false}
 * />
 * ```
 * 
 * @param props - TimelineItem prop'ları
 * @returns Zaman çizelgesi öğesi bileşeni
 */
export const TimelineItem: React.FC<TimelineItemProps> = ({
  title,
  subtitle,
  date,
  description,
  icon,
  isLast = false,
  status = 'completed',
}) => {
  /**
   * Duruma göre nokta rengi
   * completed → yeşil, current → mavi, upcoming → gri
   */
  const dotColor = {
    completed: colors.success[600],
    current: colors.primary[600],
    upcoming: colors.neutral[300],
  }[status];

  /**
   * Duruma göre çizgi rengi
   * completed → açık yeşil, current → açık mavi, upcoming → açık gri
   */
  const lineColor = {
    completed: colors.success[300],
    current: colors.primary[300],
    upcoming: colors.neutral[200],
  }[status];

  return (
    <View style={styles.container}>
      {/* Zaman Çizelgesi Çizgisi */}
      <View style={styles.timeline}>
        {/* Durum noktası */}
        <View style={[styles.dot, { backgroundColor: dotColor }]}>
          {/* İkon (varsa) */}
          {icon && <View style={styles.icon}>{icon}</View>}
        </View>
        {/* Dikey çizgi (son öğe değilse) */}
        {!isLast && <View style={[styles.line, { backgroundColor: lineColor }]} />}
      </View>

      {/* İçerik Bölümü */}
      <View style={styles.content}>
        {/* Başlık ve tarih */}
        <View style={styles.header}>
          <Typography variant="h3" style={styles.title}>
            {title}
          </Typography>
          <Typography variant="caption" style={styles.date}>
            {date}
          </Typography>
        </View>
        
        {/* Alt başlık (varsa) */}
        {subtitle && (
          <Typography variant="body" style={styles.subtitle}>
            {subtitle}
          </Typography>
        )}
        
        {/* Açıklama (varsa) */}
        {description && (
          <Typography variant="body" style={styles.description}>
            {description}
          </Typography>
        )}
      </View>
    </View>
  );
};

/**
 * Stil tanımlamaları
 * Zaman çizelgesi düzeni ve görsel elementler
 */
const styles = StyleSheet.create({
  // Ana container - Yatay düzen
  container: {
    flexDirection: 'row',
    paddingBottom: spacing.lg,
  },
  timeline: {
    alignItems: 'center',
    marginRight: spacing.md,
  },
  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background.primary,
  },
  icon: {
    position: 'absolute',
  },
  line: {
    width: 2,
    flex: 1,
    marginTop: spacing.xs,
  },
  content: {
    flex: 1,
    paddingTop: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  date: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginLeft: spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});
