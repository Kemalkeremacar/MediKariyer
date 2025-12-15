import React from 'react';
import { Text as RNText, TextStyle, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

interface TypographyProps {
  children: React.ReactNode;
  variant?: 'title' | 'subtitle' | 'h1' | 'h2' | 'h3' | 'body' | 'bodyMedium' | 'bodySemibold' | 'bodyLarge' | 'bodySmall' | 'caption';
  style?: TextStyle;
  color?: string;
}

export const Typography: React.FC<TypographyProps> = ({
  children,
  variant = 'body',
  style,
  color,
}) => {
  const { theme } = useTheme();
  
  return (
    <RNText style={[
      styles[variant], 
      { fontFamily: theme.typography.fontFamily.default },
      color && { color }, 
      style
    ]}>
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 28,        // Başlık (Title)
    fontWeight: '700',   // Bold
    color: '#1F2937',    // Text Primary
  },
  subtitle: {
    fontSize: 16,        // Alt Başlık (15-16px)
    fontWeight: '400',   // Regular
    color: '#1F2937',    // Text Primary
  },
  h1: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  h2: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  h3: {
    fontSize: 18,        // Büyük Metin (18-20px)
    fontWeight: '700',   // Bold
    color: '#1F2937',
  },
  body: {
    fontSize: 15,        // Normal Metin (15-16px)
    fontWeight: '400',   // Regular
    color: '#1F2937',    // Text Primary
  },
  bodyMedium: {
    fontSize: 15,        // Normal Metin
    fontWeight: '500',   // Medium
    color: '#1F2937',
  },
  bodySemibold: {
    fontSize: 15,        // Normal Metin
    fontWeight: '600',   // Semibold
    color: '#1F2937',
  },
  bodyLarge: {
    fontSize: 18,        // Büyük Metin (18-20px)
    fontWeight: '700',   // Bold
    color: '#1F2937',
  },
  bodySmall: {
    fontSize: 14,        // Küçük Metin (12-14px)
    fontWeight: '400',   // Regular
    color: '#6B7280',    // Text Secondary
  },
  caption: {
    fontSize: 12,        // Küçük Metin (12-14px)
    fontWeight: '400',   // Regular
    color: '#6B7280',    // Text Secondary
  },
});
