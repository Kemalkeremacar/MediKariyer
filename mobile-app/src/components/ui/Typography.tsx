import React from 'react';
import { Text as RNText, TextStyle, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface TypographyProps {
  children: React.ReactNode;
  variant?: 'title' | 'subtitle' | 'h1' | 'h2' | 'h3' | 'body' | 'bodyMedium' | 'bodySemibold' | 'bodyLarge' | 'bodySmall' | 'caption';
  style?: TextStyle;
  color?: string;
  numberOfLines?: number;
}

export const Typography: React.FC<TypographyProps> = ({
  children,
  variant = 'body',
  style,
  color,
  numberOfLines,
}) => {
  const { theme } = useTheme();
  
  return (
    <RNText 
      allowFontScaling={false}
      maxFontSizeMultiplier={1}
      textBreakStrategy="simple"
      numberOfLines={numberOfLines}
      ellipsizeMode="tail"
      style={[
        styles[variant], 
        { fontFamily: theme.typography.fontFamily.default },
        color && { color }, 
        style
      ]}
    >
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#1F2937',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  h1: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  h2: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  h3: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  body: {
    fontSize: 15,
    fontWeight: '400',
    color: '#1F2937',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  bodyMedium: {
    fontSize: 15,
    fontWeight: '500',
    color: '#1F2937',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  bodySemibold: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  bodyLarge: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    color: '#6B7280',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    textAlignVertical: 'center',
    color: '#6B7280',
    includeFontPadding: false,
  },
});
