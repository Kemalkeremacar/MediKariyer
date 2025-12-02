import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { spacing } from '../../theme/spacing';

export interface ContainerProps {
  children: React.ReactNode;
  padding?: keyof typeof spacing;
  centered?: boolean;
  style?: ViewStyle;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  padding = 'lg',
  centered = false,
  style,
}) => {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { padding: theme.spacing[padding] },
        centered && styles.centered,
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
