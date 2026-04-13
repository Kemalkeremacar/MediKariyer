/**
 * @file NotificationCard.tsx
 * @description Bildirim kartı bileşeni
 * 
 * Bu bileşen kullanıcı bildirimlerini görsel olarak sunar.
 * Bildirim tipi, başlık, mesaj, zaman damgası ve okunma durumu içerir.
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 */

import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { colors, spacing } from '@/theme';
import { formatSmartDate } from '@/utils/date';

/**
 * NotificationCard bileşeni için prop tipleri
 * 
 * @interface NotificationCardProps
 * @property {number} id - Bildirim benzersiz ID'si
 * @property {'application' | 'job' | 'system' | 'message'} type - Bildirim tipi
 * @property {string} title - Bildirim başlığı
 * @property {string} message - Bildirim mesajı
 * @property {string} timestamp - Bildirim zamanı (ISO format)
 * @property {boolean} read - Okunma durumu
 * @property {Function} [onPress] - Bildirim tıklama callback'i
 */
export interface NotificationCardProps {
  id: number;
  type: 'application' | 'job' | 'system' | 'message';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  onPress?: () => void;
}

/**
 * Bildirim tiplerine göre ikon eşleştirmesi
 * Her bildirim tipi için uygun Ionicons ikonu
 * Başlık bazlı özel ikonlar da dahil
 */
const getNotificationIcon = (type: string, title?: string): keyof typeof Ionicons.glyphMap => {
  // Başlığa göre özel ikonlar - Başvuru durumları
  if (title?.includes('kabul edildi') || title?.includes('Kabul Edildi')) {
    return 'checkmark-circle';
  }
  if (title?.includes('uygun bulunmadı') || title?.includes('Reddedildi')) {
    return 'close-circle';
  }
  if (title?.includes('incelemeye alındı') || title?.includes('İnceleniyor')) {
    return 'eye';
  }
  
  // İş ilanı bildirimleri
  if (title?.includes('İlan Kapatıldı') || title?.includes('İlan Arşivlendi')) {
    return 'warning';
  }
  if (title?.includes('İlan Aktifleştirildi')) {
    return 'checkmark-circle';
  }
  
  // Hastane bildirimleri
  if (title?.includes('Yeni Başvuru')) {
    return 'document-text';
  }
  if (title?.includes('Başvuru Geri Çekildi')) {
    return 'return-up-back';
  }
  
  // Sistem bildirimleri
  if (title?.includes('Doktor Kaydı')) {
    return 'person-add';
  }
  if (title?.includes('Hastane Kaydı')) {
    return 'business';
  }
  if (title?.includes('İş İlanı')) {
    return 'briefcase';
  }
  if (title?.includes('Fotoğraf')) {
    return 'camera';
  }
  
  // Tür'e göre genel ikonlar
  const iconMap = {
    application: 'document-text' as const,
    job: 'briefcase' as const,
    system: 'alert-circle' as const,
    message: 'notifications' as const,
  };
  
  return iconMap[type as keyof typeof iconMap] || 'notifications';
};

/**
 * Bildirim tiplerine göre renk eşleştirmesi
 * İkon ve arka plan renkleri için kullanılır
 * Başlık bazlı özel renkler de dahil
 */
const getNotificationColor = (type: string, title?: string): keyof typeof colors => {
  // Başlığa göre özel renkler - Başvuru durumları
  if (title?.includes('kabul edildi') || title?.includes('Kabul Edildi')) {
    return 'success';
  }
  if (title?.includes('uygun bulunmadı') || title?.includes('Reddedildi')) {
    return 'error';
  }
  if (title?.includes('incelemeye alındı') || title?.includes('İnceleniyor')) {
    return 'primary';
  }
  
  // İş ilanı bildirimleri
  if (title?.includes('İlan Kapatıldı') || title?.includes('İlan Arşivlendi')) {
    return 'warning';
  }
  if (title?.includes('İlan Aktifleştirildi')) {
    return 'success';
  }
  
  // Tür'e göre genel renkler
  const colorMap = {
    application: 'primary',
    job: 'secondary',
    system: 'warning',
    message: 'primary', // 'info' yerine 'primary' kullan
  } as const;
  
  return colorMap[type as keyof typeof colorMap] || 'primary';
};

/**
 * Bildirim kartı bileşeni
 * 
 * **Özellikler:**
 * - Bildirim tipi bazlı ikon ve renk
 * - Okunmamış bildirimlerde vurgu
 * - Akıllı tarih formatlama ("2 saat önce", "Dün", vb.)
 * - React.memo ile performans optimizasyonu
 * - Tıklanabilir kart
 * 
 * **Kullanım:**
 * ```tsx
 * <NotificationCard
 *   id={notification.id}
 *   type="application"
 *   title="Başvurunuz Onaylandı"
 *   message="Acıbadem Hastanesi başvurunuz onaylandı"
 *   timestamp="2025-01-12T10:30:00Z"
 *   read={false}
 *   onPress={() => handleNotificationPress(notification.id)}
 * />
 * ```
 * 
 * @param props - NotificationCard prop'ları
 * @returns Bildirim kartı bileşeni
 */
export const NotificationCard: React.FC<NotificationCardProps> = React.memo(({
  type,
  title,
  message,
  timestamp,
  read,
  onPress,
}) => {
  /**
   * Güvenli tip kontrolü ve ikon/renk belirleme
   * Başlık bazlı özel ikonlar ve renkler
   */
  const iconName = getNotificationIcon(type, title);
  const color = getNotificationColor(type, title);
  
  /**
   * Akıllı tarih formatlama
   * Örnek çıktılar: "2 saat önce", "Dün, 14:30", "17 Aralık 2025"
   */
  const timeAgo = formatSmartDate(timestamp, { fallback: 'Bilinmiyor' });

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card 
        variant={read ? 'outlined' : 'elevated'} 
        padding="md" 
        style={!read ? { ...styles.card, ...styles.unreadCard } : styles.card}
      >
        <View style={styles.content}>
          {/* Bildirim tipi ikonu */}
          <View style={[styles.iconContainer, { backgroundColor: (colors as any)[color][50] }]}>
            <Ionicons name={iconName} size={20} color={(colors as any)[color][600]} />
          </View>
          
          {/* Bildirim içeriği */}
          <View style={styles.textContainer}>
            {/* Başlık ve okunmamış noktası */}
            <View style={styles.header}>
              <Typography variant="h3" style={styles.title}>
                {title || 'Bildirim'}
              </Typography>
              {/* Okunmamış bildirimlerde mavi nokta */}
              {!read && <View style={styles.unreadDot} />}
            </View>
            
            {/* Bildirim mesajı */}
            <Typography variant="body" style={styles.message}>
              {message || ''}
            </Typography>
            
            {/* Zaman damgası */}
            <Typography variant="caption" style={styles.timestamp}>
              {timeAgo}
            </Typography>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  /**
   * Özel karşılaştırma fonksiyonu
   * Sadece değişen prop'lar için yeniden render et
   * Performans optimizasyonu için React.memo ile kullanılır
   */
  return (
    prevProps.id === nextProps.id &&
    prevProps.type === nextProps.type &&
    prevProps.title === nextProps.title &&
    prevProps.message === nextProps.message &&
    prevProps.timestamp === nextProps.timestamp &&
    prevProps.read === nextProps.read &&
    prevProps.onPress === nextProps.onPress
  );
});

/**
 * Stil tanımlamaları
 * Okunmuş/okunmamış durumlar için farklı stiller
 */
const styles = StyleSheet.create({
  // Kart container
  card: {
    marginBottom: spacing.md,
  },
  // Okunmamış bildirimler için vurgu stili
  unreadCard: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[200],
  },
  content: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary[600],
  },
  message: {
    color: colors.text.secondary,
    fontSize: 14,
    lineHeight: 20,
  },
  timestamp: {
    color: colors.text.tertiary,
    fontSize: 11,
  },
});
