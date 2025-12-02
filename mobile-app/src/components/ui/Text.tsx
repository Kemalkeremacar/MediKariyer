import React from 'react';
import { Text as RNText, StyleSheet, TextProps as RNTextProps } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { lightTheme } from '@/theme';

type Theme = typeof lightTheme;

export interface TextProps extends RNTextProps {
  variant?: keyof Theme['textVariants'];
  color?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  children: React.ReactNode;
}

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  color,
  align = 'left',
  style,
  children,
  ...props
}) => {
  const { theme } = useTheme();
  const textColor = color || theme.colors.text.primary;

  return (
    <RNText
      style={[
        styles.base,
        theme.textVariants[variant],
        { color: textColor, textAlign: align },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  base: {},
});
