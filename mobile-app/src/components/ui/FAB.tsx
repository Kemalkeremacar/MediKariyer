import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/theme';

export interface FABProps {
  icon: React.ReactNode;
  onPress: () => void;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'error';
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  style?: ViewStyle;
}

const sizeMap = {
  sm: 48,
  md: 56,
  lg: 64,
};

// FAB position: Bottom navigation bar'ın hemen üstünde olacak şekilde ayarlandı
// Bottom nav bar genellikle ~70px + safe area padding (~20px) = ~90px
// FAB'ı nav bar'ın hemen üstünde tutmak için bottom: 20-30px yeterli
const positionMap = {
  'bottom-right': { bottom: 30, right: 24 },
  'bottom-left': { bottom: 30, left: 24 },
  'bottom-center': { bottom: 30, alignSelf: 'center' as const },
};

export const FAB: React.FC<FABProps> = ({
  icon,
  onPress,
  size = 'md',
  color = 'primary',
  position = 'bottom-right',
  style,
}) => {
  const fabSize = sizeMap[size];

  const getGradientColors = (): [string, string] => {
    if (color === 'primary') {
      return ['#6096B4', '#93BFCF'];
    }
    if (color === 'secondary') {
      return ['#f093fb', '#f5576c'];
    }
    if (color === 'success') {
      return ['#11998e', '#38ef7d'];
    }
    if (color === 'error') {
      return ['#eb3349', '#f45c43'];
    }
    return [colors[color][600], colors[color][700]];
  };

  return (
    <TouchableOpacity
      style={[
        styles.fab,
        {
          width: fabSize,
          height: fabSize,
          borderRadius: fabSize / 2,
        },
        positionMap[position],
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: fabSize,
          height: fabSize,
          borderRadius: fabSize / 2,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
});
