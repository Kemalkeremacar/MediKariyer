/**
 * @file StatCard.tsx
 * @description İstatistik kartı bileşeni
 * 
 * Bu bileşen dashboard ve özet ekranlarında istatistikleri gösterir.
 * İkon, etiket, değer ve trend bilgisi içerir.
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/theme';

/**
 * StatCard bileşeni için prop tipleri
 * 
 * @interface StatCardProps
 * @property {React.ReactNode} icon - Gösterilecek ikon (genellikle Ionicons)
 * @property {string} label - İstatistik etiketi (örn: "Toplam Başvuru")
 * @property {string | number} value - İstatistik değeri (örn: "24" veya "24")
 * @property {Object} [trend] - Trend bilgisi (opsiyonel)
 * @property {string} trend.value - Trend değeri (örn: "+12%")
 * @property {boolean} trend.isPositive - Pozitif mi negatif mi?
 * @property {'primary' | 'secondary' | 'success' | 'warning' | 'error'} [color] - Renk teması
 * @property {Function} [onPress] - Kart tıklama callback'i
 * @property {ViewStyle} [style] - Ek stil özellikleri
 */
export interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  onPress?: () => void;
  style?: ViewStyle;
}

/**
 * İstatistik kartı bileşeni
 * 
 * **Özellikler:**
 * - Renkli ikon container
 * - İstatistik etiketi ve değeri
 * - Trend göstergesi (artış/azalış)
 * - Tıklanabilir kart (onPress varsa)
 * - Özelleştirilebilir renk teması
 * 
 * **Kullanım:**
 * ```tsx
 * <StatCard
 *   icon={<Ionicons name="briefcase" size={20} color={colors.primary[600]} />}
 *   label="Aktif İlanlar"
 *   value={24}
 *   trend={{ value: "+12%", isPositive: true }}
 *   color="primary"
 *   onPress={() => navigation.navigate('Jobs')}
 * />
 * ```
 * 
 * @param props - StatCard prop'ları
 * @returns İstatistik kartı bileşeni
 */
export const StatCard: React.FC<StatCardProps> = ({
  icon,
  label,
  value,
  trend,
  color = 'primary',
  onPress,
  style,
}) => {
  // onPress varsa TouchableOpacity, yoksa View kullan
  const Container = onPress ? TouchableOpacity : View;
  
  // Renk temasına göre ikon arka plan rengi
  const iconBgColor = colors[color][100];

  return (
    <Container
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {/* İkon container - Renkli arka plan */}
      <View style={[styles.iconContainer, { backgroundColor: iconBgColor }]}>
        {icon}
      </View>
      
      {/* İstatistik etiketi */}
      <Typography variant="caption" style={styles.label}>
        {label}
      </Typography>
      
      {/* İstatistik değeri */}
      <Typography variant="h2" style={styles.value}>
        {value}
      </Typography>

      {/* Trend göstergesi (varsa) */}
      {trend && (
        <View style={styles.trendContainer}>
          <Typography
            variant="caption"
            style={{
              ...styles.trend,
              color: trend.isPositive ? colors.success[600] : colors.error[600]
            }}
          >
            {/* Artış/azalış oku */}
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </Typography>
        </View>
      )}
    </Container>
  );
};

/**
 * Stil tanımlamaları
 * Kompakt ve merkezi hizalanmış kart tasarımı
 */
const styles = StyleSheet.create({
  // Kart container - Dikey düzen, merkezi hizalama
  card: {
    flex: 1,
    backgroundColor: colors.background.card,
    borderRadius: 20,
    padding: spacing.md,
    alignItems: 'center',
    // Modern: Border kaldırıldı, soft shadow eklendi
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
    gap: spacing.xs,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    color: colors.text.secondary,
    fontSize: 11,
    textAlign: 'center',
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
  },
  trendContainer: {
    marginTop: 2,
  },
  trend: {
    fontSize: 11,
    fontWeight: '600',
  },
});
