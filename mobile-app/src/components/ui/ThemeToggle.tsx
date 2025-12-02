import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { themeMode, setThemeMode, isDark } = useTheme();

  const modes: Array<{ value: 'light' | 'dark' | 'system'; label: string }> = [
    { value: 'light', label: 'Açık' },
    { value: 'dark', label: 'Koyu' },
    { value: 'system', label: 'Sistem' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Tema</Text>
      <View style={styles.buttonGroup}>
        {modes.map((mode) => (
          <TouchableOpacity
            key={mode.value}
            style={[
              styles.button,
              themeMode === mode.value && styles.buttonActive,
            ]}
            onPress={() => setThemeMode(mode.value)}
          >
            <Text
              style={[
                styles.buttonText,
                themeMode === mode.value && styles.buttonTextActive,
              ]}
            >
              {mode.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.status}>
        Aktif Tema: {isDark ? 'Koyu' : 'Açık'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  buttonTextActive: {
    color: '#ffffff',
  },
  status: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
});
