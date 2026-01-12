/**
 * @file ExperienceCard.tsx
 * @description İş deneyimi bilgilerini gösteren kart bileşeni
 * 
 * Bu bileşen kullanıcının iş deneyimlerini görsel olarak sunar.
 * Pozisyon, şirket, lokasyon, tarih aralığı ve açıklama bilgilerini içerir.
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { Chip } from '@/components/ui/Chip';
import { Divider } from '@/components/ui/Divider';
import { colors, spacing } from '@/theme';
import { formatExperiencePeriod } from '@/utils/date';

/**
 * ExperienceCard bileşeni için prop tipleri
 * 
 * @interface ExperienceCardProps
 * @property {string} title - Pozisyon/ünvan adı (örn: "Uzman Doktor")
 * @property {string} company - Şirket/kurum adı
 * @property {string} [location] - Çalışma lokasyonu (opsiyonel)
 * @property {string} startDate - Başlangıç tarihi (ISO format)
 * @property {string} [endDate] - Bitiş tarihi (opsiyonel, hala çalışıyorsa boş)
 * @property {boolean} [current] - Hala bu pozisyonda çalışıyor mu?
 * @property {string} [description] - İş tanımı/açıklama (opsiyonel)
 * @property {Function} [onPress] - Kart tıklama callback'i
 * @property {Function} [onEdit] - Düzenleme butonu callback'i
 * @property {Function} [onDelete] - Silme butonu callback'i
 */
export interface ExperienceCardProps {
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description?: string;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

/**
 * İş deneyimi kartı bileşeni
 * 
 * **Özellikler:**
 * - Pozisyon ve şirket bilgisi gösterimi
 * - Çalışma süresi ve lokasyon chip'leri
 * - İş tanımı açıklaması (varsa)
 * - Düzenleme ve silme butonları
 * - Tıklanabilir kart (onPress varsa)
 * 
 * **Kullanım:**
 * ```tsx
 * <ExperienceCard
 *   title="Uzman Doktor"
 *   company="Acıbadem Hastanesi"
 *   location="İstanbul"
 *   startDate="2020-01-01"
 *   endDate="2023-12-31"
 *   description="Kardiyoloji bölümünde uzman doktor olarak görev yaptım"
 *   onEdit={() => handleEdit(id)}
 *   onDelete={() => handleDelete(id)}
 * />
 * ```
 * 
 * @param props - ExperienceCard prop'ları
 * @returns İş deneyimi kartı bileşeni
 */
export const ExperienceCard: React.FC<ExperienceCardProps> = ({
  title,
  company,
  location,
  startDate,
  endDate,
  current = false,
  description,
  onPress,
  onEdit,
  onDelete,
}) => {
  // onPress varsa TouchableOpacity, yoksa View kullan
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container onPress={onPress} activeOpacity={0.7}>
      <Card variant="outlined" padding="lg" style={styles.card}>
        {/* Başlık Bölümü - İkon, Pozisyon, Şirket ve Aksiyon Butonları */}
        <View style={styles.header}>
          {/* İş ikonu */}
          <View style={styles.iconContainer}>
            <Ionicons name="briefcase" size={20} color={colors.secondary[600]} />
          </View>
          
          {/* Pozisyon ve şirket bilgileri */}
          <View style={styles.content}>
            <Typography variant="h3" style={styles.title}>
              {title}
            </Typography>
            <Typography variant="body" style={styles.company}>
              {company}
            </Typography>
          </View>
          
          {/* Düzenleme ve silme butonları */}
          <View style={styles.actions}>
            {onEdit && (
              <TouchableOpacity onPress={onEdit} style={styles.editButton}>
                <Ionicons name="pencil-outline" size={18} color={colors.primary[600]} />
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
                <Ionicons name="trash-outline" size={18} color={colors.error[600]} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* İş Tanımı - Varsa göster */}
        {description && (
          <>
            <Divider spacing="sm" />
            <Typography variant="body" style={styles.description}>
              {description}
            </Typography>
          </>
        )}

        {/* Alt Bilgiler - Tarih aralığı ve lokasyon chip'leri */}
        <View style={styles.footer}>
          {/* Çalışma süresi chip'i */}
          <Chip
            label={formatExperiencePeriod(startDate, endDate, current)}
            icon={<Ionicons name="calendar" size={12} color={colors.neutral[600]} />}
            variant="soft"
            color="neutral"
            size="sm"
          />
          {/* Lokasyon chip'i (varsa) */}
          {location && (
            <Chip
              label={location}
              icon={<Ionicons name="location" size={12} color={colors.neutral[600]} />}
              variant="soft"
              color="neutral"
              size="sm"
            />
          )}
        </View>
      </Card>
    </Container>
  );
};

/**
 * Stil tanımlamaları
 * Modern ve temiz görünüm için optimize edilmiş stiller
 */
const styles = StyleSheet.create({
  // Kart container
  card: {
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  company: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  description: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignSelf: 'flex-start',
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    // Modern: Border kaldırıldı
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.error[50],
    alignItems: 'center',
    justifyContent: 'center',
    // Modern: Border kaldırıldı
  },
});
