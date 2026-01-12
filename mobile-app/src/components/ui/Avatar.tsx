/**
 * @file Avatar.tsx
 * @description Kullanıcı profil resmi bileşeni
 * 
 * Özellikler:
 * - Profil fotoğrafı gösterimi (URL veya Base64)
 * - Farklı boyut seçenekleri (xs, sm, md, lg, xl, 2xl)
 * - Fotoğraf yoksa baş harfler gösterimi
 * - Doğrulanmış kullanıcı rozeti
 * - Otomatik fallback (fotoğraf yüklenemezse)
 * 
 * Kullanım:
 * ```tsx
 * <Avatar source={user.photo} size="md" initials="AB" verified />
 * ```
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import React, { useState } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme';
import { Typography } from './Typography';

/**
 * Avatar bileşeni props interface'i
 */
export interface AvatarProps {
  /** Profil fotoğrafı URL'i veya Base64 string */
  source?: string;
  /** Avatar boyutu */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** Fotoğraf yoksa gösterilecek baş harfler */
  initials?: string;
  /** Doğrulanmış kullanıcı rozeti göster */
  verified?: boolean;
  /** Ek stil */
  style?: ViewStyle;
}

/**
 * Avatar boyut haritası (piksel cinsinden)
 */
const sizeMap = {
  xs: 32,
  sm: 40,
  md: 56,
  lg: 72,
  xl: 96,
  '2xl': 120,
};

/**
 * İkon boyut haritası (piksel cinsinden)
 */
const iconSizeMap = {
  xs: 16,
  sm: 20,
  md: 28,
  lg: 36,
  xl: 48,
  '2xl': 60,
};

/**
 * Avatar Bileşeni
 * Kullanıcı profil fotoğrafını veya baş harflerini gösterir
 */
export const Avatar: React.FC<AvatarProps> = ({
  source,
  size = 'md',
  initials,
  verified = false,
  style,
}) => {
  const avatarSize = sizeMap[size];
  const iconSize = iconSizeMap[size];
  const badgeSize = size === 'xs' ? 12 : size === 'sm' ? 16 : 20;
  const [imageError, setImageError] = useState(false);

  // Kaynak Base64 mi yoksa URL mi kontrol et
  const isBase64 = source?.startsWith('data:image/');
  // Expo Image hem string (base64) hem de object ({ uri: string }) kabul eder
  const imageSource = isBase64 
    ? source  // Base64 string - direkt geç
    : (source ? { uri: source } : null);  // URL - obje içine sar

  return (
    <View style={[styles.container, { width: avatarSize, height: avatarSize }, style]}>
      <View style={[styles.avatar, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }]}>
        {source && !imageError ? (
          <Image 
            source={imageSource as any}  // Expo Image hem string hem de { uri: string } kabul eder
            style={[styles.image, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }]}
            contentFit="cover"
            cachePolicy={isBase64 ? "none" : "disk"}  // Base64 cache'e ihtiyaç duymaz
            transition={200}
            onError={() => {
              // Resim yüklenemedi, fallback göster
              setImageError(true);
            }}
          />
        ) : initials ? (
          <Typography 
            variant="body" 
            style={{ ...styles.initials, fontSize: avatarSize / 2.5 }}
          >
            {initials}
          </Typography>
        ) : (
          <Ionicons name="person" size={iconSize} color={colors.primary[600]} />
        )}
      </View>
      {verified && (
        <View style={[styles.badge, { width: badgeSize, height: badgeSize, borderRadius: badgeSize / 2 }]}>
          <View style={styles.badgeInner} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  avatar: {
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary[200],
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initials: {
    color: colors.primary[700],
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  badge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.success[600],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background.primary,
  },
  badgeInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.background.primary,
  },
});
