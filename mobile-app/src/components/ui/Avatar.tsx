import React, { useState } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme';
import { Typography } from './Typography';

export interface AvatarProps {
  source?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  initials?: string;
  verified?: boolean;
  style?: ViewStyle;
}

const sizeMap = {
  xs: 32,
  sm: 40,
  md: 56,
  lg: 72,
  xl: 96,
  '2xl': 120,
};

const iconSizeMap = {
  xs: 16,
  sm: 20,
  md: 28,
  lg: 36,
  xl: 48,
  '2xl': 60,
};

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

  // Determine if source is base64 or URL
  const isBase64 = source?.startsWith('data:image/');
  // Expo Image accepts both string (base64) and object ({ uri: string })
  const imageSource = isBase64 
    ? source  // Base64 string - pass directly
    : (source ? { uri: source } : null);  // URL - wrap in object

  return (
    <View style={[styles.container, { width: avatarSize, height: avatarSize }, style]}>
      <View style={[styles.avatar, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }]}>
        {source && !imageError ? (
          <Image 
            source={imageSource as any}  // Expo Image accepts both string and { uri: string }
            style={[styles.image, { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }]}
            contentFit="cover"
            cachePolicy={isBase64 ? "none" : "disk"}  // Base64 doesn't need caching
            transition={200}
            onError={() => {
              // Image failed to load, show fallback
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
