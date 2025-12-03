import React from 'react';
import { Text as RNText, TextStyle, StyleSheet } from 'react-native';

interface TypographyProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'heading' | 'title' | 'subtitle' | 'body' | 'bodySecondary' | 'caption';
  style?: TextStyle;
  color?: string;
}

export const Typography: React.FC<TypographyProps> = ({
  children,
  variant = 'body',
  style,
  color,
}) => {
  return (
    <RNText style={[styles[variant], color && { color }, style]}>
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  h1: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
  },
  h2: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  h4: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    color: '#000000',
  },
  bodySecondary: {
    fontSize: 16,
    fontWeight: '400',
    color: '#8E8E93',
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    color: '#8E8E93',
  },
});
