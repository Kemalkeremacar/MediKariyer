/**
 * @file BackButton.tsx
 * @description Modern geri dönüş butonu bileşeni
 * 
 * Özellikler:
 * - Navigasyon için yeniden kullanılabilir geri butonu
 * - Özel onPress fonksiyonu veya otomatik navigation.goBack()
 * - Özelleştirilebilir renk ve boyut
 * - Modern tasarım (yuvarlak, gölgeli)
 * 
 * Kullanım:
 * ```tsx
 * <BackButton />
 * <BackButton onPress={() => console.log('Custom back')} />
 * ```
 * 
 * @author MediKariyer Development Team
 * @version 1.0.0
 * @since 2024
 */

import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';

/**
 * BackButton bileşeni props interface'i
 */
interface BackButtonProps {
  /** Özel geri dönüş fonksiyonu (yoksa navigation.goBack() kullanılır) */
  onPress?: () => void;
  /** Ek stil */
  style?: ViewStyle;
  /** İkon rengi */
  color?: string;
  /** İkon boyutu */
  size?: number;
}

/**
 * Modern Geri Dönüş Butonu Bileşeni
 * Navigasyon için yeniden kullanılabilir geri butonu
 */
export const BackButton: React.FC<BackButtonProps> = ({
  onPress,
  style,
  color = colors.text.primary,
  size = 24,
}) => {
  const navigation = useNavigation();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      navigation.goBack();
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Ionicons name="chevron-back" size={size} color={color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
});
