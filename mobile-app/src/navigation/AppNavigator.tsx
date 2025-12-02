import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuthStore } from '@/store/authStore';

/**
 * AppNavigator - Authenticated flow
 * Temporary simple screen until we build the full app
 */
export const AppNavigator = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hoş Geldin!</Text>
      <Text style={styles.subtitle}>
        {user?.first_name} {user?.last_name}
      </Text>
      <Text style={styles.email}>{user?.email}</Text>
      
      <TouchableOpacity style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
