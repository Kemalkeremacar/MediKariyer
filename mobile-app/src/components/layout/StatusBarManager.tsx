import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '@/contexts/ThemeContext';

export const StatusBarManager: React.FC = () => {
  const { isDark } = useTheme();

  return <StatusBar style={isDark ? 'light' : 'dark'} />;
};
