import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '@/theme';

export interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  thickness?: number;
  color?: string;
  style?: ViewStyle;
}

export const Divider: React.FC<DividerProps> = ({
  orientation = 'horizontal',
  thickness = 1,
  color = theme.colors.border.light,
  style,
}) => {
  return (
    <View
      style={[
        styles.base,
        orientation === 'horizontal' ? styles.horizontal : styles.vertical,
        {
          [orientation === 'horizontal' ? 'height' : 'width']: thickness,
          backgroundColor: color,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  base: {},
  horizontal: {
    width: '100%',
  },
  vertical: {
    height: '100%',
  },
});
